/* =============================================================
   app.js — ROUTER + ÇEVİRİ + SAYFA ÜRETİMİ
   -------------------------------------------------------------
   Üç sorumluluk:
   1) DİL      — aktif dili tutar, L() ile metin seçer
   2) ROUTER   — #/team gibi adresi okuyup sayfayı seçer
   3) RENDER   — content.js verisini HTML'e çevirir

   Mevcut Next.js sitesi /en ve /tr yollarını kullanıyor.
   Bu taslak aynı mantığı tek dosyada hash ile kuruyor;
   Next.js'e taşırken route adları birebir aynı kalıyor.
   ============================================================= */


/* ---------- 1. DİL ---------- */

let LANG = "en";
try {                                   // Gizli sekmede localStorage patlayabilir
  const saved = localStorage.getItem("apex.lang");
  if (saved === "tr" || saved === "en") LANG = saved;
} catch (_) { /* sessizce varsayılanla devam */ }

// Çift dilli metinden aktif dili seçer. Düz metin gelirse olduğu gibi döner.
const L = (v) => (v && typeof v === "object" && ("en" in v)) ? (v[LANG] ?? v.en) : (v ?? "");

function setLang(next) {
  if (next === LANG) return;
  LANG = next;
  try { localStorage.setItem("apex.lang", next); } catch (_) {}
  document.documentElement.lang = next;
  build();
}


/* ---------- 2. YARDIMCILAR ---------- */

const esc = (s) => String(s ?? "").replace(/[&<>"']/g, c =>
  ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

// "TODO" ile başlayan metin = doldurulmamış alan
const isTodo = (v) => typeof v === "string" && v.trim().toUpperCase().startsWith("TODO");
const todoClass = (v) => isTodo(v) ? "is-todo" : "";

// İsimden baş harf: "Mert Kalkancı" -> "MK"
const initials = (name) => name.trim().split(/\s+/)
  .filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join("");

// Adresi olmayan link tıklanamaz bir etiket olarak çıkar
function out(url, label, cls = "") {
  if (!url || isTodo(url)) {
    return `<span class="missing ${cls}">${esc(label)}<small>${esc(L(DATA.ui.missing))}</small></span>`;
  }
  return `<a class="${cls}" href="${esc(url)}" target="_blank" rel="noopener">${esc(label)}</a>`;
}

const MONTHS = {
  en: ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"],
  tr: ["Oca","Şub","Mar","Nis","May","Haz","Tem","Ağu","Eyl","Eki","Kas","Ara"]
};

// "2026-07-15" + "2026-07-19" -> "15–19 Jul 2026"
function dateRange(start, end) {
  const a = new Date(start + "T00:00:00"), b = new Date(end + "T00:00:00");
  const m = MONTHS[LANG] || MONTHS.en;
  const same = a.getMonth() === b.getMonth();
  return same
    ? `${a.getDate()}–${b.getDate()} ${m[a.getMonth()]} ${a.getFullYear()}`
    : `${a.getDate()} ${m[a.getMonth()]} – ${b.getDate()} ${m[b.getMonth()]} ${b.getFullYear()}`;
}

const isPast = (iso) => new Date(iso + "T23:59:59") < new Date();

// Tek gun: "15 Tem 2026"
function dateOne(iso) {
  const d = new Date(iso + "T00:00:00");
  const m = MONTHS[LANG] || MONTHS.en;
  return `${d.getDate()} ${m[d.getMonth()]} ${d.getFullYear()}`;
}

// Her sayfanın tepesindeki başlık bloğu
function head(eyebrow, title, lead) {
  return `<header class="phead">
    <p class="eyebrow">${esc(eyebrow)}</p>
    <h1>${esc(title)}</h1>
    ${lead ? `<p class="lead">${esc(lead)}</p>` : ""}
  </header>`;
}

function sectionTitle(title, sub) {
  return `<div class="stitle">
    <h2>${esc(title)}</h2>
    ${sub ? `<p>${esc(sub)}</p>` : ""}
  </div>`;
}


/* ---------- 3. HERO ÇİZİMİ ----------
   Takımın adının birebir görseli: bir virajın üstten görünümü,
   ideal çizgi ve çizginin iç kenara değdiği tek nokta — apex.
   Geometri gerçek: iç kenar r=110, dış kenar r=210, apex iki
   teğet noktasının tam ortasında (45°).                      */

function instrumentPanel() {
  const d = DATA.home.diagram, s = DATA.home.sim;
  return `
  <section class="panel">

    <header class="panel-bar">
      <span class="panel-led" aria-hidden="true"></span>
      <h2 class="panel-title">${esc(L(s.title))}</h2>
      <span class="panel-model">${esc(L(s.model))}</span>
      <div class="rates" id="simRate" role="group" aria-label="${esc(L(s.rate))}">
        ${[1, 2, 4].map(r => `<button type="button" data-rate="${r}"
            class="${r === 1 ? "on" : ""}" aria-pressed="${r === 1}">${r}&times;</button>`).join("")}
      </div>
      <button type="button" class="panel-btn" id="simPlay" aria-pressed="true">${esc(L(s.play))}</button>
    </header>

    <div class="panel-body">

      <figure class="track">
        <svg id="trackSvg" viewBox="0 0 560 420" role="img"
               aria-label="${esc(L(TRACK.place))}">
          <!-- Yol yüzeyi: merkez çizgi kalın çizgi olarak boyanıyor. Kenar
               eğrilerini elle kesiştirmekten kolay ve kesişme noktasında
               da doğru görünüyor. Tüm d değerleri sim.js tarafından üretilir. -->
          <path id="trackBorder"  class="dg-border"  d=""/>
          <path id="trackSurface" class="dg-surface" d=""/>
          <path id="trackKerb"    class="dg-kerb"    d=""/>
          <path id="trackSF"      class="dg-sf"      d=""/>
          <path id="trackLine"    class="dg-line"    d=""/>
          <path id="trailPath"    class="dg-trail"   d=""/>

          <g id="apexM0" class="dg-apex">
            <circle r="12"/><circle class="dg-apex-dot" r="3"/>
            <path d="M0 -17 V17 M-17 0 H17"/>
          </g>
          <g id="apexM1" class="dg-apex">
            <circle r="12"/><circle class="dg-apex-dot" r="3"/>
            <path d="M0 -17 V17 M-17 0 H17"/>
          </g>
          <text id="apexT0" class="dg-label dg-label--hot" text-anchor="middle">${esc(L(d.apex))}</text>
          <text id="apexT1" class="dg-label dg-label--hot" text-anchor="middle">${esc(L(d.apex))}</text>

          <!-- Araç: üstten görünüş, burnu +x yönünde -->
          <g id="carG" class="car">
            <g id="carScale">
              <rect class="car-w" x="-7.5" y="-6.2" width="4.6" height="2.6"/>
              <rect class="car-w" x="-7.5" y="3.6"  width="4.6" height="2.6"/>
              <rect class="car-w" x="3.4"  y="-5.6" width="4"   height="2.4"/>
              <rect class="car-w" x="3.4"  y="3.2"  width="4"   height="2.4"/>
              <path class="car-b" d="M-8.5 -3 L5 -3 L10.5 0 L5 3 L-8.5 3 Z"/>
            </g>
          </g>
        </svg>
        <figcaption class="track-cap">
          <strong>${esc(L(TRACK.place))}</strong>
          <span>${esc(L(TRACK.where))} · ${TRACK.lat}&deg;&nbsp;${esc(L(s.ndir))},
                ${TRACK.lon}&deg;&nbsp;${esc(L(s.edir))}</span>
          <span class="track-src">
            ${esc(L(s.geomFrom))}
            <a href="${esc(TRACK.sourceUrl)}" target="_blank" rel="noopener">${esc(TRACK.source)}</a>
            &middot; &copy; OpenStreetMap ${esc(L(s.contrib))}
          </span>
        </figcaption>
      </figure>

      <div class="rail">

        <div class="gauges">
          <div class="gauge">
            <span class="gauge-l">${esc(L(s.speed))}</span>
            <span class="gauge-v" id="gSpeed">0</span><span class="gauge-u">km/h</span>
          </div>
          <div class="gauge">
            <span class="gauge-l">${esc(L(s.latg))}</span>
            <span class="gauge-v" id="gLat">0.00</span><span class="gauge-u">g</span>
          </div>
          <div class="gauge">
            <span class="gauge-l">${esc(L(s.time))}</span>
            <span class="gauge-v" id="gTime">0.00</span><span class="gauge-u">s</span>
          </div>
        </div>

        <div class="inputs">
          <span class="gauge-l">${esc(L(s.inputs))}</span>
          <div class="bar"><span class="bar-k">${esc(L(s.thr))}</span>
            <span class="bar-t"><i id="barThr"></i></span></div>
          <div class="bar"><span class="bar-k">${esc(L(s.brk))}</span>
            <span class="bar-t bar-t--brk"><i id="barBrk"></i></span></div>
        </div>

        <figure class="trace">
          <figcaption class="legend">
            <span class="lg lg--speed">${esc(L(s.traceSpeed))}</span>
            <span class="lg lg--grip">${esc(L(s.traceGrip))}</span>
          </figcaption>
          <svg id="traceSvg" viewBox="0 0 440 158" role="img"
               aria-label="${esc(L(s.traceSpeed))} / ${esc(L(s.traceGrip))}">
            <g id="traceGrid" class="tr-grid"></g>
            <path id="traceGrip"  class="tr-grip"  d=""/>
            <path id="traceSpeed" class="tr-speed" d=""/>
            <line id="traceCursor" class="tr-cursor" x1="40" x2="40" y1="20" y2="132"/>
            <circle id="traceDot" class="tr-dot" cx="40" cy="132" r="3.5"/>
            <text id="traceVal" class="tr-val" x="46" y="15"></text>
          </svg>
          <p class="trace-x"><span id="traceX"></span> · ${esc(L(s.traceX))}</p>
        </figure>

        <div class="knobs">
          <div class="knob">
            <label for="kLat">${esc(L(s.grip))}</label>
            <input type="range" id="kLat" min="1" max="2.2" step="0.05" value="1.6">
            <output id="kLatVal"></output>
          </div>
          <div class="knob">
            <label for="kBrk">${esc(L(s.brake))}</label>
            <input type="range" id="kBrk" min="1" max="2.2" step="0.05" value="1.5">
            <output id="kBrkVal"></output>
          </div>
          <div class="knob">
            <label for="kVmax">${esc(L(s.vmax))}</label>
            <input type="range" id="kVmax" min="80" max="140" step="1" value="110">
            <output id="kVmaxVal"></output>
          </div>
        </div>

      </div>
    </div>

    <footer class="panel-foot">
      <div class="sumrow">
        <span>${esc(L(s.lapLen))} <strong id="gLen">0</strong> m</span>
        <span>APEX <strong id="gApex">0</strong> km/h</span>
        <span>${esc(L(s.lapTime))} <strong id="gTotal">0.00</strong> s</span>
        <span class="delta" id="gDelta">0.00</span>
      </div>
      <p class="panel-note">${esc(L(s.note))}</p>
      <p class="panel-hint">${esc(L(s.scrub))}</p>
    </footer>

  </section>`;
}


/* ---------- 4. PAYLAŞILAN BLOKLAR ---------- */

// Kadrodaki toplam kişi sayısı — elle yazılmıyor, sayılıyor
function totalMembers() {
  const names = new Set();
  DATA.leadership.forEach(p => { if (p.name) names.add(p.name); });
  DATA.subteams.forEach(s => {
    if (s.leader) names.add(s.leader);
    s.members.forEach(m => names.add(m));
  });
  return names.size;
}

function statStrip() {
  const values = {
    members:  String(totalMembers()),
    subteams: String(DATA.subteams.length),
    events:   String(DATA.competitions.length),
    season:   DATA.team.season
  };
  return `<div class="stats">
    ${DATA.stats.map(s => `
      <div class="stat">
        <span class="stat-n">${esc(values[s.key])}</span>
        <span class="stat-l">${esc(L(s.label))}</span>
      </div>`).join("")}
  </div>`;
}

function statusChip(c) {
  const label = L(DATA.ui[c.status] || DATA.ui.planned);
  const chips = [`<span class="chip chip--${c.status}">${esc(label)}</span>`];
  if (isPast(c.end)) chips.push(`<span class="chip chip--stale">${esc(L(DATA.ui.past))}</span>`);
  return chips.join("");
}

function competitionCard(c, featured = false, idx = null, full = false) {
  const t = DATA.competitionsPage;
  const kv = (label, value, todo) =>
    `<p class="comp-kv"><span>${esc(label)}</span><b class="${todo ? "is-todo" : ""}">${esc(value)}</b></p>`;

  return `<article class="comp ${featured ? "comp--featured" : ""}"
                   ${idx !== null ? `data-ev="${idx}"` : ""}>
    <div class="comp-top">
      <div class="comp-chips">${statusChip(c)}</div>
      <span class="comp-org">${esc(c.org)}</span>
    </div>
    <h3>${esc(c.name)}</h3>
    <p class="comp-venue">${esc(L(c.venue))}</p>
    <p class="comp-date">${esc(dateRange(c.start, c.end))}</p>
    <p class="comp-note">${esc(L(c.note))}</p>
    ${full ? `
      <div class="comp-meta">
        ${kv(L(t.deadline), c.deadline ? dateOne(c.deadline) : "TODO", !c.deadline)}
        ${kv(L(t.goal), L(c.goal), isTodo(L(c.goal)))}
      </div>
      ${c.url ? `<a class="btn btn--line btn--sm" href="${esc(c.url)}"
                    target="_blank" rel="noopener">${esc(L(t.official))}</a>` : ""}` : ""}
  </article>`;
}


/* ---------- Yol haritası ----------
   Etkinlikler eşit aralıklı dizilmiyor; GERÇEK TARİHLERİNE göre
   bir zaman ekseni üzerine oturuyor. Eksen, bütün etkinlikleri ve
   bugünü kapsayacak şekilde veriden hesaplanıyor. Böylece iki
   etkinlik arasındaki boşluk gerçek boşluk kadar.                */
function roadmap(list) {
  const c = DATA.competitionsPage;
  if (!list.length) return `<p class="empty">${esc(L(c.noneMatch))}</p>`;

  const D = (s) => new Date(s + "T00:00:00");
  const now = new Date(); now.setHours(0, 0, 0, 0);

  const stamps = list.flatMap(x => [D(x.start), D(x.end)]).concat([now]).map(Number);
  const pad = 38 * 864e5;
  const lo = Math.min(...stamps) - pad;
  const hi = Math.max(...stamps) + pad;
  const span = hi - lo || 1;
  const pct = (d) => ((Number(d) - lo) / span) * 100;
  const clamp = (v) => Math.max(0, Math.min(100, v));

  /* Ay çentikleri: ayın ilk günleri */
  const ticks = [];
  const cur = new Date(new Date(lo).getFullYear(), new Date(lo).getMonth() + 1, 1);
  while (Number(cur) < hi) { ticks.push(new Date(cur)); cur.setMonth(cur.getMonth() + 1); }
  const every = ticks.length > 9 ? 2 : 1;

  const M = MONTHS[LANG] || MONTHS.en;
  const nowP = clamp(pct(now));
  const over = list.every(x => D(x.end) < now);
  const next = list.findIndex(x => D(x.end) >= now);

  return `
  <div class="road">
    <div class="road-ticks">
      ${ticks.map((x, i) => i % every ? "" : `
        <span class="road-tick" style="left:${pct(x).toFixed(2)}%">${esc(M[x.getMonth()])}${
          x.getMonth() === 0 ? " " + x.getFullYear() : ""}</span>`).join("")}
      <span class="road-nowlabel" style="left:${nowP.toFixed(2)}%">${esc(L(c.now))}</span>
    </div>

    <div class="road-strip">
      <span class="road-lane" aria-hidden="true"></span>
      <span class="road-done" style="width:${nowP.toFixed(2)}%"></span>
      <span class="road-now" style="left:${nowP.toFixed(2)}%"></span>
      ${list.map((x, i) => {
        const s = D(x.start);
        return `<span class="stop stop--${esc(x.status)} ${i === next ? "stop--next" : ""}"
                      data-ev="${i}" tabindex="0"
                      style="left:${clamp(pct(s)).toFixed(2)}%">
                  <i aria-hidden="true"></i>
                  <em>${s.getDate()} ${esc(M[s.getMonth()])}</em>
                  <span class="sr-only">${esc(x.name)}</span>
                </span>`;
      }).join("")}
    </div>

    ${over ? `<p class="road-warn">${esc(L(c.seasonOver))}</p>` : ""}
  </div>`;
}


/* Statü filtreleri — eski sitedeki akışın aynısı */
function compFilters(counts) {
  const u = DATA.ui;
  return `<div class="filters" id="compFilters">
    ${[["all", L(u.all)], ["confirmed", L(u.confirmed)],
       ["application", L(u.application)], ["planned", L(u.planned)]]
      .map(([k, label]) => `
        <button type="button" data-f="${k}" class="${k === COMPF ? "on" : ""}"
                aria-pressed="${k === COMPF}">
          ${esc(label)}<span class="f-n">${counts[k] || 0}</span>
        </button>`).join("")}
  </div>`;
}

let COMPF = "all";

function compBlock() {
  const all = DATA.competitions;
  const counts = { all: all.length };
  ["confirmed", "application", "planned"].forEach(k =>
    counts[k] = all.filter(x => x.status === k).length);
  const list = COMPF === "all" ? all : all.filter(x => x.status === COMPF);

  return compFilters(counts) + roadmap(list) + `
    <div class="grid-2">
      ${list.length
        ? list.map((x, i) => competitionCard(x, x.status === "confirmed", i, true)).join("")
        : `<p class="empty">${esc(L(DATA.competitionsPage.noneMatch))}</p>`}
    </div>`;
}


/* Rol etiketi. Dört rol, tek renk ailesi içinde dört basamak:
   captain = dolu bordo · vice = bordo tint · lead = nötr · member = sönük. */
function roleChip(label, kind) {
  return `<span class="rchip rchip--${kind}">${esc(label)}</span>`;
}

/* Takım sayfasında hangi disiplin seçili. "all" = hepsi. */
let TEAMTAB = "all";

const subCount = (s) => s.members.length + (s.leader ? 1 : 0);

function teamTabs() {
  const tabs = [{ id: "all", name: DATA.ui.all,
                  n: DATA.subteams.reduce((a, s) => a + subCount(s), 0) }]
    .concat(DATA.subteams.map(s => ({ id: s.id, name: s.name, n: subCount(s) })));

  return `<div class="tabs" id="teamTabs">
    ${tabs.map(x => `
      <button type="button" data-sub="${x.id}" class="${x.id === TEAMTAB ? "on" : ""}"
              aria-pressed="${x.id === TEAMTAB}">
        ${esc(L(x.name))}<span class="tab-n">${x.n}</span>
      </button>`).join("")}
  </div>`;
}

/* Seçili disiplinin (veya hepsinin) kadro bloklarını üretir. */
function rosterBlocks() {
  const t = DATA.teamPage;
  const list = TEAMTAB === "all"
    ? DATA.subteams
    : DATA.subteams.filter(s => s.id === TEAMTAB);

  return list.map(s => `
    <section class="roster">
      <div class="roster-head">
        <h2>${esc(L(s.name))}</h2>
        <span class="roster-count">${subCount(s)} ${esc(L(t.memberCount))}</span>
      </div>
      <p class="roster-desc">${esc(L(s.desc))}</p>
      <ul class="people">
        ${s.leader ? `
          <li class="person person--lead">
            <span class="av" aria-hidden="true">${esc(initials(s.leader))}</span>
            <span class="person-name">${esc(s.leader)}</span>
            ${roleChip(L(s.leaderRole || t.leaderTag), s.leaderKind || "lead")}
          </li>`
        : `<li class="person person--vacant">
             <span class="av av--empty" aria-hidden="true">+</span>
             <span class="person-name">${esc(L(t.vacantLead))}</span>
           </li>`}
        ${s.members.map(m => {
          const r = s.roles && s.roles[m];
          return `
          <li class="person ${r ? "person--lead" : ""}">
            <span class="av" aria-hidden="true">${esc(initials(m))}</span>
            <span class="person-name">${esc(m)}</span>
            ${r ? roleChip(L(r), "lead") : roleChip(L(t.memberTag), "member")}
          </li>`; }).join("")}
      </ul>
    </section>`).join("");
}

/* Fotoğraf bandı. Görsel koyu paletin içine otursun diye üstüne
   zeminden yukarı doğru açılan bir gradyan biniyor. */
function shot(src, caption, tall = false) {
  return `<figure class="shot ${tall ? "shot--tall" : ""}">
    <img src="${esc(src)}" alt="" loading="lazy">
    <figcaption>${esc(caption)}</figcaption>
  </figure>`;
}

/* Partner/sponsor logosu. Logolar koyu renkli olduğu için açık bir
   plakanın üstüne oturuyor — partner logosu yeniden renklendirilmez. */
function logoSlot(item, tierLabel, main = false) {
  const inner = `
    <span class="logo-tier">${esc(tierLabel)}</span>
    <span class="plate"><img src="${esc(item.logo)}" alt="${esc(item.name)}" loading="lazy"></span>
    ${main ? `<p class="logo-note">${esc(L(DATA.mainSponsor.note))}</p>` : ""}`;
  const cls = `logo-slot ${main ? "logo-slot--main" : ""}`;
  return item.url
    ? `<a class="${cls}" href="${esc(item.url)}" target="_blank" rel="noopener">${inner}</a>`
    : `<div class="${cls}">${inner}</div>`;
}

/* Ana sponsor yoksa: boş, kesik çerçeveli "yer açık" kartı */
function openSponsorSlot() {
  const s = DATA.sponsorsPage;
  return `<article class="main-sponsor main-sponsor--open">
    <span class="logo-tier">${esc(L(s.mainLabel))}</span>
    <h3 class="open-title">${esc(L(s.openTitle))}</h3>
    <p>${esc(L(s.openBody))}</p>
    <a class="btn btn--solid btn--sm"
       href="mailto:${esc(DATA.contact.email)}?subject=${encodeURIComponent("Sponsorship deck request")}">
       ${esc(L(s.ctaBtn))}</a>
  </article>`;
}

function subteamCard(s) {
  const count = s.members.length + (s.leader ? 1 : 0);
  return `<article class="sub">
    <div class="sub-head">
      <h3>${esc(L(s.name))}</h3>
      <span class="sub-count">${count}</span>
    </div>
    <p>${esc(L(s.desc))}</p>
  </article>`;
}


/* Hero altındaki kayan kırmızı şerit. İçerik iki kez basılıyor,
   -%50 kayınca dikişsiz döngü oluyor. */
function ticker() {
  const words = [DATA.team.name, DATA.team.school, "Formula Student",
                 L(DATA.team.full), L({ en: "Season ", tr: "Sezon " }) + DATA.team.season]
    .concat(DATA.competitions.map(c => c.name));
  const run = words.map(w => `<span>${esc(w)}<b aria-hidden="true">/</b></span>`).join("");
  return `<div class="ticker" aria-hidden="true"><div class="ticker-track">${run}${run}${run}${run}</div></div>`;
}

/* ---------- 5. SAYFALAR ---------- */

const PAGES = {

  "/": () => {
    const h = DATA.home;
    return `
      <section class="hero">
        <div class="hero-copy">
          <p class="eyebrow">${esc(L(h.eyebrow))}</p>
          <h1 class="hero-h1">${esc(L(h.h1))}</h1>
          <p class="lead">${esc(L(h.lead))}</p>
          <div class="row">
            <a class="btn btn--solid" href="#/join">${esc(L(h.ctaJoin))}</a>
            <a class="btn btn--line" href="#/sponsors">${esc(L(h.ctaSponsor))}</a>
          </div>
        </div>
      </section>

      ${ticker()}

      ${instrumentPanel()}

      ${statStrip()}

      <section class="sec">
        ${sectionTitle(L(h.principlesTitle), L(h.principlesSub))}
        <div class="grid-3">
          ${h.principles.map((p, i) => `
            <article class="card">
              <span class="card-rule" aria-hidden="true"></span>
              <h3>${esc(L(p.name))}</h3>
              <p>${esc(L(p.body))}</p>
            </article>`).join("")}
        </div>
      </section>

      <section class="sec">
        ${sectionTitle(L(h.subteamsTitle))}
        <div class="grid-sub">
          ${DATA.subteams.map(subteamCard).join("")}
        </div>
      </section>

      <section class="sec">
        ${sectionTitle(L(h.nextEventLabel))}
        <div class="grid-2">
          ${DATA.competitions.map((c, i) => competitionCard(c, i === 0)).join("")}
        </div>
      </section>

      <section class="sec">
        ${sectionTitle(L(h.sponsorsTitle))}
        <div class="logo-strip">
          ${DATA.mainSponsor
            ? logoSlot(DATA.mainSponsor, L(DATA.sponsorsPage.mainLabel), true)
            : openSponsorSlot()}
        </div>
      </section>

      <section class="sec">
        ${sectionTitle(L(h.partnersTitle))}
        <div class="logo-strip">
          ${DATA.partners.map(p =>
            logoSlot(p, L(DATA.sponsorsPage.partnerLabel))).join("")}
        </div>
      </section>

      <section class="band">
        <div>
          <h2>${esc(L(h.closingTitle))}</h2>
          <p>${esc(L(h.closingBody))}</p>
        </div>
        <a class="btn btn--solid" href="#/join">${esc(L(h.ctaJoin))}</a>
      </section>
    `;
  },

  "/team": () => {
    const t = DATA.teamPage;
    return `
      ${head(L(DATA.nav[1].label), L(t.title), L(t.lead))}
      ${statStrip()}

      <section class="sec">
        ${sectionTitle(L(t.leadershipTitle))}
        <div class="grid-2">
          ${DATA.leadership.map(p => !p.name ? `
            <article class="lead-card lead-card--vacant">
              <span class="av av--lg av--empty" aria-hidden="true">+</span>
              <div>
                ${roleChip(L(p.role), p.kind)}
                <h3>${esc(L(t.vacantRole))}</h3>
              </div>
            </article>` : `
            <article class="lead-card lead-card--${p.kind}">
              <span class="av av--lg av--${p.kind}" aria-hidden="true">${esc(initials(p.name))}</span>
              <div>
                ${roleChip(L(p.role), p.kind)}
                <h3>${esc(p.name)}</h3>
                <p class="unit">${esc(L(p.unit))}</p>
              </div>
            </article>`).join("")}
        </div>
      </section>

      <section class="sec">
        ${sectionTitle(L(t.rosterTitle), L(t.rosterNote))}
        ${teamTabs()}
        <div id="rosterWrap">${rosterBlocks()}</div>
      </section>
    `;
  },

  "/competitions": () => {
    const c = DATA.competitionsPage;
    return `
      ${head(L(DATA.nav[2].label), L(c.title), L(c.lead))}

      <section class="sec">
        ${sectionTitle(L(c.roadTitle), L(c.roadLead))}
        <div id="compWrap">${compBlock()}</div>
      </section>

      <section class="sec">
        ${shot("assets/racing-wide.jpg", L(DATA.home.shotCaption), true)}
      </section>

      <section class="sec">
        ${sectionTitle(L(c.eventsTitle))}
        <div class="grid-2">
          <article class="card">
            <span class="card-rule" aria-hidden="true"></span>
            <h3>${esc(L(c.staticTitle))}</h3>
            <p class="card-note">${esc(L(c.staticNote))}</p>
            <ul class="ticks">
              ${DATA.scoringStatic.map(s => `<li>${esc(L(s))}</li>`).join("")}
            </ul>
          </article>
          <article class="card">
            <span class="card-rule" aria-hidden="true"></span>
            <h3>${esc(L(c.dynamicTitle))}</h3>
            <p class="card-note">${esc(L(c.dynamicNote))}</p>
            <ul class="ticks">
              ${DATA.scoringDynamic.map(s => `<li>${esc(L(s))}</li>`).join("")}
            </ul>
          </article>
        </div>
      </section>
    `;
  },

  "/sponsors": () => {
    const s = DATA.sponsorsPage;
    return `
      ${head(L(DATA.nav[3].label), L(s.title), L(s.lead))}

      <section class="sec">
        ${DATA.mainSponsor ? `
        <article class="main-sponsor">
          <span class="logo-tier">${esc(L(s.mainLabel))}</span>
          <span class="plate plate--xl">
            <img src="${esc(DATA.mainSponsor.logo)}" alt="${esc(DATA.mainSponsor.name)}">
          </span>
          <p>${esc(L(DATA.mainSponsor.note))}</p>
        </article>` : openSponsorSlot()}
      </section>

      <section class="sec">
        ${sectionTitle(L(s.partnerLabel))}
        <div class="logo-strip">
          ${DATA.partners.map(p =>
            logoSlot(p, L(DATA.sponsorsPage.partnerLabel))).join("")}
        </div>
      </section>

      <section class="sec">
        ${sectionTitle(L(s.whyTitle))}
        <div class="grid-3">
          ${s.why.map(w => `
            <article class="card">
              <span class="card-rule" aria-hidden="true"></span>
              <h3>${esc(L(w.name))}</h3>
              <p>${esc(L(w.body))}</p>
            </article>`).join("")}
        </div>
      </section>

      <section class="band">
        <div>
          <h2>${esc(L(s.ctaTitle))}</h2>
          <p>${esc(L(s.ctaBody))}</p>
        </div>
        <a class="btn btn--solid"
           href="mailto:${esc(DATA.contact.email)}?subject=${encodeURIComponent("Sponsorship deck request")}">
           ${esc(L(s.ctaBtn))}</a>
      </section>
    `;
  },

  "/join": () => {
    const j = DATA.joinPage;
    return `
      ${head(L(DATA.nav[4].label), L(j.title), L(j.lead))}

      <section class="sec">
        ${sectionTitle(L(j.openTitle))}
        <div class="grid-sub">
          ${DATA.subteams.map(subteamCard).join("")}
        </div>
      </section>

      <section class="sec">
        ${sectionTitle(L(j.processTitle), L(j.processNote))}
        <ol class="steps">
          ${DATA.process.map((p, i) => `
            <li class="step">
              <span class="step-n">${String(i + 1).padStart(2, "0")}</span>
              <div>
                <h3>${esc(L(p.name))}</h3>
                <p>${esc(L(p.body))}</p>
              </div>
            </li>`).join("")}
        </ol>
      </section>

      <section class="band">
        <div>
          <h2>${esc(L(j.formBtn))}</h2>
          <p>${esc(L(j.formNote))}</p>
        </div>
        ${out(DATA.links.form, L(j.formBtn), "btn btn--solid")}
      </section>

      <section class="sec">
        ${sectionTitle(L(j.faqTitle))}
        <div class="faq">
          ${DATA.faq.map(f => `
            <details>
              <summary>${esc(L(f.q))}</summary>
              <p class="${todoClass(L(f.a))}">${esc(L(f.a))}</p>
            </details>`).join("")}
        </div>
      </section>
    `;
  },

  "/contact": () => {
    const c = DATA.contactPage, k = DATA.contact;
    return `
      ${head(L(DATA.nav[5].label), L(c.title), L(c.lead))}

      <section class="sec contact">
        <div class="card contact-info">
          <span class="card-rule" aria-hidden="true"></span>
          <h2>${esc(L(c.directTitle))}</h2>
          <ul class="info">
            <li>
              <svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><use href="#ic-mail"></use></svg>
              <a href="mailto:${esc(k.email)}">${esc(k.email)}</a>
            </li>
            <li>
              <svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><use href="#ic-pin"></use></svg>
              <span>${esc(L(k.location))}<br>
                <small class="${todoClass(L(k.room))}">${esc(L(k.room))}</small></span>
            </li>
          </ul>
          <h2>${esc(L(c.followTitle))}</h2>
          <div class="row">
            ${out(DATA.links.instagram, "Instagram", "btn btn--line btn--sm")}
            ${out(DATA.links.linkedin, "LinkedIn", "btn btn--line btn--sm")}
          </div>
        </div>

        <form class="card contact-form" id="cform" novalidate>
          <span class="card-rule" aria-hidden="true"></span>
          <h2>${esc(L(c.formTitle))}</h2>
          <p class="card-note">${esc(L(c.formNote))}</p>

          <label for="fName">${esc(L(c.fName))}</label>
          <input id="fName" name="name" type="text" autocomplete="name" required>

          <label for="fTopic">${esc(L(c.fTopic))}</label>
          <select id="fTopic" name="topic">
            ${c.topics.map(t => `<option>${esc(L(t))}</option>`).join("")}
          </select>

          <label for="fMsg">${esc(L(c.fMsg))}</label>
          <textarea id="fMsg" name="message" rows="5" required></textarea>

          <button class="btn btn--solid" type="submit">${esc(L(c.fSend))}</button>
          <p class="fstatus" id="fStatus" role="status"></p>
        </form>
      </section>
    `;
  }
};


/* ---------- 6. ROUTER ---------- */

const route = () => {
  const r = location.hash.replace(/^#/, "") || "/";
  return PAGES[r] ? r : "/";
};

function render() {
  const r = route();
  const view = document.getElementById("view");
  SIM.destroy();
  view.innerHTML = PAGES[r]();

  // Hero'daki simülatör sadece ana sayfada çalışır; başka sayfaya
  // geçerken animasyon döngüsünü kapatıyoruz ki boşa dönmesin.
  if (r === "/") SIM.mount();

  const item = DATA.nav.find(n => n.route === r);
  document.title = r === "/"
    ? `${DATA.team.name} METU — ${L(DATA.team.tagline)}`
    : `${L(item.label)} · ${DATA.team.name}`;

  document.querySelectorAll("#nav a[data-r]").forEach(a => {
    const on = a.dataset.r === r;
    a.classList.toggle("on", on);
    if (on) a.setAttribute("aria-current", "page"); else a.removeAttribute("aria-current");
  });

  document.body.classList.remove("open");
  document.getElementById("burger").setAttribute("aria-expanded", "false");
  window.scrollTo({ top: 0, behavior: "instant" });
  onScroll();
  if (r === "/contact") wireForm();
}


/* ---------- 7. SABİT PARÇALAR ---------- */

function build() {
  document.getElementById("nav").innerHTML = DATA.nav.map(n =>
    `<a href="#${n.route}" data-r="${n.route}">${esc(L(n.label))}</a>`).join("");

  document.getElementById("lang").innerHTML = ["en", "tr"].map(code =>
    `<button type="button" data-lang="${code}" class="${code === LANG ? "on" : ""}"
       aria-pressed="${code === LANG}">${code.toUpperCase()}</button>`).join("");

  document.getElementById("footTag").textContent = L(DATA.team.tagline);
  document.getElementById("footNav").innerHTML = DATA.nav.map(n =>
    `<a href="#${n.route}">${esc(L(n.label))}</a>`).join("");

  document.getElementById("footSocial").innerHTML = `
    <a href="mailto:${esc(DATA.contact.email)}" aria-label="Email">
      <svg class="ic" viewBox="0 0 24 24"><use href="#ic-mail"></use></svg></a>
    ${DATA.links.instagram ? `<a href="${esc(DATA.links.instagram)}" target="_blank"
      rel="noopener" aria-label="Instagram">
      <svg class="ic" viewBox="0 0 24 24"><use href="#ic-ig"></use></svg></a>` : ""}
    <a href="${esc(DATA.links.linkedin)}" target="_blank" rel="noopener" aria-label="LinkedIn">
      <svg class="ic" viewBox="0 0 24 24"><use href="#ic-li"></use></svg></a>`;

  document.getElementById("footLegal").textContent =
    `© ${new Date().getFullYear()} ${L(DATA.team.full)} · ${DATA.team.school}`;

  render();
}


/* ---------- 8. İLETİŞİM FORMU ---------- */

function wireForm() {
  const f = document.getElementById("cform");
  if (!f) return;
  f.addEventListener("submit", (e) => {
    e.preventDefault();
    const st = document.getElementById("fStatus");
    const name = f.elements.name.value.trim(), msg = f.elements.message.value.trim();
    if (!name || !msg) {
      st.textContent = L(DATA.contactPage.errEmpty);
      st.className = "fstatus err";
      return;
    }
    location.href = `mailto:${DATA.contact.email}`
      + `?subject=${encodeURIComponent(`[${f.elements.topic.value}] ${name}`)}`
      + `&body=${encodeURIComponent(`${msg}\n\n— ${name}`)}`;
    st.textContent = L(DATA.contactPage.ok);
    st.className = "fstatus ok";
  });
}


/* ---------- 9. BAŞLAT ---------- */

/* Üst çizgideki okuma göstergesi. Sayfanın ne kadarını geçtiğini
   gösteren ince bordo dolgu — sitenin her yerinde hareket var. */
const scrollFill = document.getElementById("scrollFill");
function onScroll() {
  const h = document.documentElement.scrollHeight - window.innerHeight;
  scrollFill.style.width = (h > 4 ? Math.min(100, (window.scrollY / h) * 100) : 0) + "%";
}
window.addEventListener("scroll", onScroll, { passive: true });
window.addEventListener("resize", onScroll);

document.getElementById("burger").addEventListener("click", (e) => {
  const open = document.body.classList.toggle("open");
  e.currentTarget.setAttribute("aria-expanded", String(open));
});

document.getElementById("lang").addEventListener("click", (e) => {
  const b = e.target.closest("button[data-lang]");
  if (b) setLang(b.dataset.lang);
});

/* Alt takım sekmeleri. Tüm sayfayı yeniden çizmiyoruz; sadece kadro
   kutusunu değiştiriyoruz, böylece sayfa yukarı zıplamıyor. */
/* Yarışma statü filtresi: sadece liste kutusu yeniden çiziliyor */
document.getElementById("view").addEventListener("click", (e) => {
  const f = e.target.closest("#compFilters button[data-f]");
  if (!f) return;
  COMPF = f.dataset.f;
  document.getElementById("compWrap").innerHTML = compBlock();
});

/* Yol haritasındaki nokta ile aşağıdaki kart birbirini işaret eder */
const vw = document.getElementById("view");
const link = (on) => (e) => {
  const n = e.target.closest("[data-ev]");
  if (!n) return;
  const sel = `#compWrap [data-ev="${n.dataset.ev}"]`;
  if (on) document.querySelectorAll(sel).forEach(x => x.classList.add("hot"));
  else document.querySelectorAll("#compWrap .hot").forEach(x => x.classList.remove("hot"));
};
vw.addEventListener("pointerover", link(true));
vw.addEventListener("pointerout",  link(false));
vw.addEventListener("focusin",     link(true));
vw.addEventListener("focusout",    link(false));

document.getElementById("view").addEventListener("click", (e) => {
  const b = e.target.closest("#teamTabs button[data-sub]");
  if (!b) return;
  TEAMTAB = b.dataset.sub;
  document.querySelectorAll("#teamTabs button[data-sub]").forEach(x => {
    const on = x.dataset.sub === TEAMTAB;
    x.classList.toggle("on", on);
    x.setAttribute("aria-pressed", String(on));
  });
  document.getElementById("rosterWrap").innerHTML = rosterBlocks();
});

window.addEventListener("hashchange", render);
document.documentElement.lang = LANG;
build();
