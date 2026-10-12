/* =============================================================
   sim.js — PİST SİMÜLATÖRÜ (kapalı devre, sonsuz döngü)
   -------------------------------------------------------------
   Pist GERÇEK: ODTÜ Kuzey Kıbrıs Kampusu çevre yolu. Geometrisi
   OpenStreetMap verisinden çıkarıldı (bkz. js/track.js) ve ölçeğine
   sadık kaldı. Kapalı bir devre olduğu için araç hiç durmuyor,
   başa sarmıyor; sürekli dönüyor.

   Ölçek: 1 SVG birimi = TRACK.scale metre.
     tur ≈ 872 m · en dar yarıçap ≈ 14 m · ~32 s

   MODEL — nokta kütle, yarı-durağan (point-mass quasi-steady):
   1) İdeal çizgi eşit yay uzunluğunda 400 noktada örnekleniyor.
   2) Her noktada eğrilik: üç noktadan geçen çemberin yarıçapı
      r = (|AB|·|BC|·|CA|) / (4·Alan)   (Menger eğriliği)
   3) Tutunma sınırı:  a = v²/r  →  v = √(a_yanal · g · r)
   4) Fren sınırı, GERİYE doğru tarama (devre kapalı olduğu için
      başa sarılarak, 3 tur yakınsayana kadar):
        v² = v_sonraki² + 2·a_fren·ds
   5) Çekiş sınırı, İLERİYE doğru tarama, yine sarmalı.
   6) Tur süresi: her aralıkta dt = ds / v_ort, toplanır.

   Kapalı devrede tarama sarmalı olmak zorunda: son virajdan
   çıkan hız ilk virajın giriş hızını belirler. Açık uçlu tarama
   yapsaydık başlangıç noktasında yapay bir süreksizlik olurdu.
   ============================================================= */

const SIM = (() => {

  const G = 9.81;
  const SCALE = TRACK.scale;      // metre / SVG birimi (track.js'ten)
  const N = 400;                  // ideal çizgi örnek sayısı

  /* Yol genişliği gerçek metreden birime çevriliyor: çizim ölçeğe
     sadık kalsın diye. off = ideal çizginin viraj içine azami kayması;
     yarı genişliğin altında kalmalı, yoksa çizgi yoldan çıkar. */
  const GEO = {
    half: (TRACK.roadMeters / 2) / SCALE,
    off:  (TRACK.roadMeters / 2) / SCALE * 0.60
  };

  /* Oynatma hızı. 1x = gerçek zaman. Göstergelerdeki süre her
     durumda gerçek süredir; sadece izleme hızı değişir. */
  let RATE = 1;

  const DEFAULTS = { aLat: 1.60, aBrk: 1.50, aAcc: 1.10, vMax: 110 };
  let P = { ...DEFAULTS };

  let pts = [], radius = [], vGrip = [], v = [], tArr = [];
  let dsU = 0, ds = 0, totalM = 0, totalT = 0, apexIdx = 0;
  let baseT = null;

  let raf = null, startTs = 0, playing = true, scrub = null;
  let el = {};


  /* ---- 1. Pisti üret ---- */

  const fmt = (arr, close) =>
    arr.map((p, i) => (i ? "L" : "M") + p.x.toFixed(2) + " " + p.y.toFixed(2)).join(" ")
    + (close ? " Z" : "");

  function buildTrack() {
    /* Merkez çizgi doğrudan track.js'ten: x,y çiftleri */
    const C = [];
    for (let i = 0; i < TRACK.pts.length; i += 2)
      C.push({ x: TRACK.pts[i], y: TRACK.pts[i + 1] });
    const M = C.length;

    /* Teğet, normal, işaretli eğrilik.
       Ekran koordinatında (y aşağı) N1 = (-dy, dx) gidiş yönünün
       SAĞINI gösterir; dönüşün içi de sağdaysa çizgi oraya kayar. */
    const nrm = [], curv = [];
    for (let i = 0; i < M; i++) {
      const a = C[(i - 3 + M) % M], b = C[i], c = C[(i + 3) % M];
      const dx = c.x - a.x, dy = c.y - a.y;
      const len = Math.hypot(dx, dy) || 1;
      nrm.push({ x: -dy / len, y: dx / len });

      const area2 = (b.x - a.x) * (c.y - a.y) - (c.x - a.x) * (b.y - a.y);
      const ab = Math.hypot(b.x - a.x, b.y - a.y);
      const bc = Math.hypot(c.x - b.x, c.y - b.y);
      const ca = Math.hypot(a.x - c.x, a.y - c.y);
      curv.push(Math.abs(area2) < 1e-9 ? 0
        : Math.sign(area2) * (2 * Math.abs(area2)) / (ab * bc * ca));
    }

    /* Ham kayma: eğrilik ne kadar yüksekse içeri o kadar.
       Sonra çember üzerinde yumuşatılıyor — böylece araç viraja
       girmeden önce dışarı açılıyor, çıkışta tekrar açılıyor.
       Gerçek ideal çizginin yaptığı da bu. */
    const kMax = Math.max(...curv.map(Math.abs)) || 1;
    const rawOff = curv.map(k => Math.sign(k) * Math.min(1, Math.abs(k) / kMax * 1.9) * GEO.off);

    const win = Math.round(M * 0.055);
    const off = rawOff.map((_, i) => {
      let s = 0;
      for (let j = -win; j <= win; j++) s += rawOff[(i + j + M * 2) % M];
      return s / (2 * win + 1);
    });

    const line  = C.map((p, i) => ({ x: p.x + nrm[i].x * off[i], y: p.y + nrm[i].y * off[i] }));
    const edgeA = C.map((p, i) => ({ x: p.x + nrm[i].x * GEO.half, y: p.y + nrm[i].y * GEO.half }));
    const edgeB = C.map((p, i) => ({ x: p.x - nrm[i].x * GEO.half, y: p.y - nrm[i].y * GEO.half }));

    /* Yol yüzeyi: merkez çizgiyi kalın çizgi olarak boyuyoruz.
       Kenar eğrilerini elle kesiştirmekten kolay ve kesişme
       noktasında da doğru görünüyor. */
    /* Yol bandı kalın bir çizgi olarak boyanıyor; kalınlık gerçek
       yol genişliğinden geliyor, CSS'te sabit değil. */
    el.surface.style.strokeWidth = (GEO.half * 2).toFixed(2) + "px";
    el.border.style.strokeWidth  = (GEO.half * 2 + 2.4).toFixed(2) + "px";
    el.kerb.style.strokeWidth    = (GEO.half * 0.48).toFixed(2) + "px";
    el.line.style.strokeWidth    = (GEO.half * 0.32).toFixed(2) + "px";
    el.trail.style.strokeWidth   = (GEO.half * 0.38).toFixed(2) + "px";

    const d = fmt(C, true);
    el.border.setAttribute("d", d);
    el.surface.setAttribute("d", d);
    el.line.setAttribute("d", fmt(line, true));
    el.trail.setAttribute("d", fmt(line, true));

    /* Kerb: eğriliğin en yüksek olduğu bölgelerde, virajın İÇ
       kenarında. Ayrık parçalar tek path içinde M ile başlıyor. */
    const thr = kMax * 0.42;
    let kerb = "", open = false;
    for (let i = 0; i <= M; i++) {
      const j = i % M;
      const hot = Math.abs(curv[j]) > thr;
      if (hot) {
        const e = curv[j] > 0 ? edgeA[j] : edgeB[j];
        kerb += (open ? "L" : "M") + e.x.toFixed(2) + " " + e.y.toFixed(2) + " ";
        open = true;
      } else open = false;
    }
    el.kerb.setAttribute("d", kerb);

    /* Başlangıç / bitiş çizgisi — index 0, hızlı bölümde */
    const s0 = edgeA[0], s1 = edgeB[0];
    el.sf.setAttribute("d",
      `M${s0.x.toFixed(2)} ${s0.y.toFixed(2)} L${s1.x.toFixed(2)} ${s1.y.toFixed(2)}`);
  }


  /* ---- 2. İdeal çizgiyi eşit aralıkla örnekle ---- */
  function sampleLine() {
    const path = el.line;
    const Ltot = path.getTotalLength();
    dsU = Ltot / N;
    ds = dsU * SCALE;
    totalM = Ltot * SCALE;

    pts = [];
    for (let i = 0; i < N; i++) {
      const p = path.getPointAtLength(Ltot * i / N);
      pts.push({ x: p.x, y: p.y });
    }

    const k = 5;
    radius = new Array(N);
    for (let i = 0; i < N; i++) {
      const a = pts[(i - k + N) % N], b = pts[i], c = pts[(i + k) % N];
      const area2 = Math.abs((b.x - a.x) * (c.y - a.y) - (c.x - a.x) * (b.y - a.y));
      const ab = Math.hypot(b.x - a.x, b.y - a.y);
      const bc = Math.hypot(c.x - b.x, c.y - b.y);
      const ca = Math.hypot(a.x - c.x, a.y - c.y);
      radius[i] = area2 < 1e-6 ? 1e5 : (ab * bc * ca) / (2 * area2) * SCALE;
    }
    apexIdx = radius.indexOf(Math.min(...radius));

    /* İki apex işareti: en dar iki nokta, birbirinden uzak olanlar */
    const order = radius.map((r, i) => [r, i]).sort((a, b) => a[0] - b[0]);
    const a1 = order[0][1];
    const a2 = (order.find(([, i]) =>
      Math.min(Math.abs(i - a1), N - Math.abs(i - a1)) > N * 0.25) || order[0])[1];
    [a1, a2].forEach((idx, n) => {
      const p = pts[idx];
      const k = (GEO.half / 9.5).toFixed(3);          // işaret yolla orantılı kalsın
      el["apex" + n].setAttribute("transform",
        `translate(${p.x.toFixed(1)} ${p.y.toFixed(1)}) scale(${k})`);
      el["apexL" + n].setAttribute("x", p.x.toFixed(1));
      el["apexL" + n].setAttribute("y", (p.y + (p.y < 210 ? -16 : 24)).toFixed(1));
    });
  }


  /* ---- 3. Hız profilini çöz (kapalı devre, sarmalı) ---- */
  function solve() {
    const vTop = P.vMax / 3.6;
    vGrip = radius.map(r => Math.min(Math.sqrt(P.aLat * G * r), vTop));
    v = vGrip.slice();

    for (let pass = 0; pass < 3; pass++) {
      for (let i = N - 1; i >= 0; i--)
        v[i] = Math.min(v[i], Math.sqrt(v[(i + 1) % N] ** 2 + 2 * P.aBrk * G * ds));
      for (let i = 0; i < N; i++)
        v[i] = Math.min(v[i], Math.sqrt(v[(i - 1 + N) % N] ** 2 + 2 * P.aAcc * G * ds));
    }

    tArr = new Array(N + 1); tArr[0] = 0;
    for (let i = 1; i <= N; i++)
      tArr[i] = tArr[i - 1] + ds / Math.max(0.5, (v[i - 1] + v[i % N]) / 2);

    totalT = tArr[N];
    if (baseT === null) baseT = totalT;
  }

  const latG = (i) => (v[i] ** 2) / (radius[i] * G);
  const longA = (i) => {
    const j = (i + 1) % N, h = (i - 1 + N) % N;
    return (v[j] ** 2 - v[h] ** 2) / (4 * ds) / G;
  };


  /* ---- 4. Hız grafiği ---- */
  const TR = { w: 440, h: 158, l: 40, r: 10, t: 20, b: 26 };
  const px = (i) => TR.l + (TR.w - TR.l - TR.r) * (i / N);
  let yTop = 120;
  const py = (val) => TR.h - TR.b - (TR.h - TR.b - TR.t) * (val * 3.6 / yTop);

  function drawTrace() {
    yTop = Math.max(40, Math.ceil(Math.max(...vGrip) * 3.6 / 20) * 20);
    const line = (arr) => arr.map((val, i) =>
      `${i ? "L" : "M"}${px(i).toFixed(1)} ${py(val).toFixed(1)}`).join(" ")
      + ` L${px(N).toFixed(1)} ${py(arr[0]).toFixed(1)}`;   // tur başa kapanıyor

    el.traceGrip.setAttribute("d", line(vGrip));
    el.traceSpeed.setAttribute("d", line(v));

    el.traceGrid.innerHTML = [0, yTop / 2, yTop].map(s => {
      const y = py(s / 3.6);
      return `<line x1="${TR.l}" y1="${y.toFixed(1)}" x2="${TR.w - TR.r}" y2="${y.toFixed(1)}"/>
              <text x="${TR.l - 7}" y="${(y + 3.5).toFixed(1)}" text-anchor="end">${s}</text>`;
    }).join("");

    el.traceX.textContent = `0 – ${Math.round(totalM)} m`;
  }


  /* ---- 5. Aracı ve göstergeleri yerleştir ---- */
  function place(i, f = 0) {
    const a = pts[i], b = pts[(i + 1) % N];
    const x = a.x + (b.x - a.x) * f, y = a.y + (b.y - a.y) * f;
    const ang = Math.atan2(b.y - a.y, b.x - a.x) * 180 / Math.PI;
    el.car.setAttribute("transform",
      `translate(${x.toFixed(2)} ${y.toFixed(2)}) rotate(${ang.toFixed(1)})`);

    const d = dsU * (i + f), Lt = dsU * N, tail = 70;
    el.trail.style.strokeDasharray = `${tail}px ${Lt + tail}px`;
    el.trail.style.strokeDashoffset = `${-(d - tail)}px`;

    const kmh = v[i] * 3.6, lat = latG(i), lon = longA(i);
    el.gSpeed.textContent = Math.round(kmh);
    el.gLat.textContent = lat.toFixed(2);
    el.gTime.textContent = tArr[i].toFixed(2);

    el.barThr.style.width = `${Math.min(100, Math.max(0, lon / P.aAcc) * 100)}%`;
    el.barBrk.style.width = `${Math.min(100, Math.max(0, -lon / P.aBrk) * 100)}%`;

    const cx = px(i), cy = py(v[i]);
    el.cursor.setAttribute("x1", cx); el.cursor.setAttribute("x2", cx);
    el.cursorDot.setAttribute("cx", cx); el.cursorDot.setAttribute("cy", cy);
    el.cursorVal.setAttribute("x", Math.min(cx + 6, TR.w - TR.r - 40));
    el.cursorVal.textContent = `${Math.round(kmh)} km/h`;
  }

  function figures() {
    el.gTotal.textContent = totalT.toFixed(2);
    el.gApex.textContent = Math.round(Math.min(...v) * 3.6);
    el.gLen.textContent = Math.round(totalM);
    const d = totalT - baseT;
    el.gDelta.textContent = (d > 0 ? "+" : "") + d.toFixed(2);
    el.gDelta.className = "delta " + (d < -0.005 ? "faster" : d > 0.005 ? "slower" : "");
  }


  /* ---- 6. Döngü — kapalı devre, hiç durmuyor ---- */
  function seek(e) {
    let lo = 0, hi = N;
    while (lo < hi) { const m = (lo + hi) >> 1; if (tArr[m] <= e) lo = m + 1; else hi = m; }
    const i = Math.max(0, Math.min(N - 1, lo - 1));
    const span = Math.max(1e-6, tArr[i + 1] - tArr[i]);
    return [i, Math.max(0, Math.min(1, (e - tArr[i]) / span))];
  }

  function frame(ts) {
    if (!startTs) startTs = ts;
    const [i, f] = seek((((ts - startTs) / 1000) * RATE) % totalT);
    place(i, f);
    raf = requestAnimationFrame(frame);
  }

  function play(on) {
    playing = on;
    el.play.textContent = on ? L(DATA.home.sim.play) : L(DATA.home.sim.paused);
    el.play.setAttribute("aria-pressed", String(on));
    if (on && !raf) raf = requestAnimationFrame(frame);
    else if (!on && raf) { cancelAnimationFrame(raf); raf = null; }
  }

  const reseek = (i) => { startTs = performance.now() - tArr[i] * 1000 / RATE; };

  function setRate(r) {
    const i = scrub !== null ? scrub : currentIdx();
    RATE = r;
    reseek(i);
    el.rate.querySelectorAll("button[data-rate]").forEach(b => {
      const on = Number(b.dataset.rate) === r;
      b.classList.toggle("on", on);
      b.setAttribute("aria-pressed", String(on));
    });
  }


  /* ---- 7. Fare ile inceleme ---- */
  function nearestOnTrack(ev) {
    const r = el.trackSvg.getBoundingClientRect();
    const x = (ev.clientX - r.left) * 560 / r.width;
    const y = (ev.clientY - r.top) * 420 / r.height;
    let best = 0, bd = Infinity;
    for (let i = 0; i < N; i++) {
      const d = (pts[i].x - x) ** 2 + (pts[i].y - y) ** 2;
      if (d < bd) { bd = d; best = i; }
    }
    return bd < 2500 ? best : null;
  }

  function hold(i) {
    if (i === null) return;
    scrub = i;
    if (raf) { cancelAnimationFrame(raf); raf = null; }
    place(i, 0);
  }

  function release() {
    if (scrub === null) return;
    reseek(scrub);
    scrub = null;
    if (playing && !raf) raf = requestAnimationFrame(frame);
  }


  /* ---- 8. Kaydırıcılar ---- */
  function knob(id, key, fmtv) {
    const input = document.getElementById(id);
    const out = document.getElementById(id + "Val");
    const show = () => { out.textContent = fmtv(Number(input.value)); };
    show();
    input.addEventListener("input", () => {
      P[key] = Number(input.value);
      show();
      const i = scrub !== null ? scrub : currentIdx();
      solve(); drawTrace(); figures(); place(i, 0); reseek(i);
    });
  }

  const currentIdx = () =>
    startTs ? seek((((performance.now() - startTs) / 1000) * RATE) % totalT)[0] : 0;


  /* ---- 9. Kurulum ---- */
  function mount() {
    if (!document.getElementById("trackSvg")) return;
    const g = (id) => document.getElementById(id);

    el = {
      trackSvg: g("trackSvg"), border: g("trackBorder"), surface: g("trackSurface"),
      line: g("trackLine"), trail: g("trailPath"), kerb: g("trackKerb"), sf: g("trackSF"),
      car: g("carG"), carScale: g("carScale"),
      apex0: g("apexM0"), apex1: g("apexM1"), apexL0: g("apexT0"), apexL1: g("apexT1"),
      traceSvg: g("traceSvg"), traceGrid: g("traceGrid"),
      traceGrip: g("traceGrip"), traceSpeed: g("traceSpeed"), traceX: g("traceX"),
      cursor: g("traceCursor"), cursorDot: g("traceDot"), cursorVal: g("traceVal"),
      gSpeed: g("gSpeed"), gLat: g("gLat"), gTime: g("gTime"),
      gTotal: g("gTotal"), gDelta: g("gDelta"), gApex: g("gApex"), gLen: g("gLen"),
      barThr: g("barThr"), barBrk: g("barBrk"),
      play: g("simPlay"), rate: g("simRate")
    };

    P = { ...DEFAULTS };

    /* Araç ölçeği: çizimdeki gövde 19 birim uzunluğunda. Gerçek bir
       formula aracı ~3 m; görünürlük için ~2.3 katına çizip
       ölçekten hesaplıyoruz, pist değişirse kendi ayarlanır. */
    const carUnits = 7 / SCALE;
    el.carScale.setAttribute("transform", `scale(${(carUnits / 19).toFixed(3)})`);

    buildTrack();
    sampleLine();
    solve();
    drawTrace();
    figures();

    knob("kLat",  "aLat", (x) => x.toFixed(2) + " g");
    knob("kBrk",  "aBrk", (x) => x.toFixed(2) + " g");
    knob("kVmax", "vMax", (x) => Math.round(x) + " km/h");

    el.play.addEventListener("click", () => play(!playing));
    el.rate.addEventListener("click", (ev) => {
      const b = ev.target.closest("button[data-rate]");
      if (b) setRate(Number(b.dataset.rate));
    });

    el.traceSvg.addEventListener("pointermove", (ev) => {
      const r = el.traceSvg.getBoundingClientRect();
      const x = (ev.clientX - r.left) * TR.w / r.width;
      const f = (x - TR.l) / (TR.w - TR.l - TR.r);
      if (f >= -0.02 && f <= 1.02)
        hold(Math.max(0, Math.min(N - 1, Math.round(f * N))));
    });
    el.traceSvg.addEventListener("pointerleave", release);
    el.trackSvg.addEventListener("pointermove", (ev) => hold(nearestOnTrack(ev)));
    el.trackSvg.addEventListener("pointerleave", release);

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      playing = false;
      el.play.textContent = L(DATA.home.sim.paused);
      el.play.setAttribute("aria-pressed", "false");
      place(apexIdx, 0);
    } else {
      place(0, 0);
      play(true);
    }
  }

  function destroy() {
    if (raf) cancelAnimationFrame(raf);
    raf = null; startTs = 0; scrub = null; baseT = null; RATE = 1;
  }

  return { mount, destroy };
})();
