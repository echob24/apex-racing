/* =============================================================
   content.js — TÜM İÇERİK VE ÇEVİRİLER
   -------------------------------------------------------------
   İki dil var. Kullanıcıya görünen her metin şu kalıpta:
       { en: "English text", tr: "Türkçe metin" }
   app.js içindeki L() yardımcısı aktif dile göre birini seçer.

   Veriler apexracingmetu.vercel.app üzerindeki mevcut siteden
   alındı. "TODO" yazan yerler sitede bulunmayan, senin
   doldurması gereken bilgilerdir — uydurmadım.
   ============================================================= */

const DATA = {

  team: {
    name: "APEX RACING",
    full: { en: "Apex Racing METU Formula Team",
            tr: "Apex Racing METU Formula Takımı" },
    school: "METU NCC",
    season: "2026 / 27",
    tagline: { en: "Formula Student team at METU Northern Cyprus Campus.",
               tr: "ODTÜ Kuzey Kıbrıs Kampusu Formula Student takımı." }
  },

  /* --- Menü --------------------------------------------------
     route değerleri mevcut Next.js sitesindeki yollarla aynı
     tutuldu, böylece taslak oraya taşınırken URL'ler bozulmaz. */
  nav: [
    { route: "/",             label: { en: "Home",         tr: "Ana Sayfa" } },
    { route: "/team",         label: { en: "Team",         tr: "Takım" } },
    { route: "/competitions", label: { en: "Competitions", tr: "Yarışmalar" } },
    { route: "/sponsors",     label: { en: "Sponsors",     tr: "Sponsorlar" } },
    { route: "/join",         label: { en: "Join Us",      tr: "Bize Katıl" } },
    { route: "/contact",      label: { en: "Contact",      tr: "İletişim" } }
  ],

  /* --- Ana sayfa --------------------------------------------- */
  home: {
    eyebrow: { en: "METU NCC · Formula Student · Season 2026/27",
               tr: "ODTÜ KKK · Formula Student · 2026/27 Sezonu" },
    h1: { en: "Every corner has one right line.",
          tr: "Her virajın tek bir doğru çizgisi var." },
    lead: {
      en: "Apex Racing designs, manufactures and races a formula vehicle " +
          "built end to end by students. Five subteams, one integrated car, " +
          "one target: the grid at Silverstone.",
      tr: "Apex Racing, baştan sona öğrenciler tarafından üretilen bir formula " +
          "aracı tasarlar, imal eder ve yarıştırır. Beş alt takım, tek bir " +
          "entegre araç, tek bir hedef: Silverstone'da gridde olmak."
    },
    ctaJoin:    { en: "Join the team",     tr: "Takıma katıl" },
    ctaSponsor: { en: "Become a sponsor",  tr: "Sponsor ol" },

    /* Hero çizimindeki etiketler — viraj geometrisi */
    diagram: {
      entry: { en: "ENTRY",  tr: "GİRİŞ" },
      brake: { en: "BRAKE",  tr: "FREN" },
      apex:  { en: "APEX",   tr: "APEX" },
      exit:  { en: "EXIT",   tr: "ÇIKIŞ" },
      geomFrom: { en: "Road geometry traced from", tr: "Yol geometrisi şuradan çıkarıldı:" },
      contrib:  { en: "contributors", tr: "katkıcıları" },
      ndir: { en: "N", tr: "K" },
      edir: { en: "E", tr: "D" },
      rate: { en: "Rate", tr: "Hız" }
    },

    /* Viraj simülatörü etiketleri */
    sim: {
      title:  { en: "Circuit simulator", tr: "Pist simülatörü" },
      model:  { en: "point-mass · quasi-steady state", tr: "nokta kütle · yarı-durağan" },
      play:   { en: "Pause", tr: "Duraklat" },
      paused: { en: "Play",  tr: "Oynat" },
      speed:  { en: "Speed",      tr: "Hız" },
      latg:   { en: "Lateral",    tr: "Yanal" },
      time:    { en: "Elapsed",     tr: "Geçen süre" },
      lapTime: { en: "Lap time",    tr: "Tur süresi" },
      lapLen:  { en: "Lap length",  tr: "Tur uzunluğu" },
      inputs: { en: "Driver input", tr: "Sürücü girdisi" },
      thr:    { en: "Throttle", tr: "Gaz" },
      brk:    { en: "Brake",    tr: "Fren" },
      grip:   { en: "Lateral grip",  tr: "Yanal tutunma" },
      brake:  { en: "Braking",       tr: "Frenleme" },
      vmax:   { en: "Top speed",     tr: "Azami hız" },
      traceSpeed: { en: "Speed",        tr: "Hız" },
      traceGrip:  { en: "Grip limit",   tr: "Tutunma sınırı" },
      traceX:     { en: "Distance (m)", tr: "Mesafe (m)" },
      scrub:  { en: "Drag the trace or the track to inspect any point.",
                tr: "Herhangi bir noktayı incelemek için grafiği veya pisti sürükle." },
      note:   { en: "The circuit is our own campus ring road, traced from map data and " +
                    "kept to scale. Corner radii are real, so the speed at every point is " +
                    "real too: limited first by the local radius, then by what the brakes " +
                    "and the engine can do between points — solved around the lap until it " +
                    "closes on itself. Move a slider and it is solved again. A campus road " +
                    "is faster than a Formula Student course, which is laid out with tight " +
                    "radii on purpose to cap speeds.",
                tr: "Pist kendi kampüs çevre yolumuz; harita verisinden çıkarıldı ve " +
                    "ölçeğine sadık kaldı. Viraj yarıçapları gerçek olduğu için her " +
                    "noktadaki hız da gerçek: önce o noktanın yarıçapıyla, sonra noktalar " +
                    "arasında frenin ve motorun yapabildiğiyle sınırlanıyor — tur başa " +
                    "kapanana kadar çözülüyor. Bir kaydırıcıyı oynat, baştan çözülür. " +
                    "Kampüs yolu bir Formula Student parkurundan hızlıdır; parkurlar hızı " +
                    "sınırlamak için bilerek dar yarıçaplarla kurulur." }
    },

    /* Mevcut sitedeki "Operational Principles" bölümü */
    principlesTitle: { en: "How we work", tr: "Nasıl çalışıyoruz" },
    principlesSub: {
      en: "Three rules that decide what gets built next.",
      tr: "Sırada ne üretileceğine karar veren üç kural."
    },
    principles: [
      { name: { en: "Rapid validation", tr: "Hızlı doğrulama" },
        body: { en: "Every design assumption gets a test before it gets a part number. " +
                    "Cheap failures early beat expensive failures at scrutineering.",
                tr: "Her tasarım varsayımı parça numarası almadan önce test edilir. " +
                    "Erken ve ucuz hatalar, scrutineering'de pahalı hatalardan iyidir." } },
      { name: { en: "Team alignment", tr: "Takım hizası" },
        body: { en: "Subteams own their scope but share one integration calendar. " +
                    "A part that fits only its own drawing is not finished.",
                tr: "Alt takımlar kendi kapsamından sorumludur ama tek bir entegrasyon " +
                    "takvimini paylaşır. Sadece kendi çiziminde oturan parça bitmiş değildir." } },
      { name: { en: "Competition focus", tr: "Yarışma odağı" },
        body: { en: "Decisions are scored against the rulebook and the event sheet. " +
                    "If it does not earn points or pass inspection, it waits.",
                tr: "Kararlar kural kitabı ve etkinlik puan tablosuna göre değerlendirilir. " +
                    "Puan getirmiyor veya denetimi geçmiyorsa sıraya girer." } }
    ],

    subteamsTitle: { en: "Five subteams, one car", tr: "Beş alt takım, tek araç" },
    shotCaption: { en: "Placeholder image — swap in a photo of our own car and crew.",
                   tr: "Geçici görsel — kendi aracımızın ve ekibimizin fotoğrafıyla değiştirilecek." },
    nextEventLabel: { en: "Next on the calendar", tr: "Takvimdeki sıradaki" },
    sponsorsTitle: { en: "Sponsors", tr: "Sponsorlar" },
    partnersTitle: { en: "Partners", tr: "Paydaşlar" },
    closingTitle: { en: "The car is built by whoever shows up.",
                    tr: "Aracı, gelen kişiler üretiyor." },
    closingBody: {
      en: "No prior Formula Student experience is required. Applications are " +
          "open to all METU NCC students, every department, every year.",
      tr: "Formula Student deneyimi gerekmiyor. Başvurular tüm ODTÜ KKK " +
          "öğrencilerine, her bölüm ve her sınıfa açık."
    }
  },

  /* --- Sayılarla takım ---------------------------------------
     members değeri kadro listesinden otomatik hesaplanır,
     elle yazılmaz — böylece liste değişince sayı da değişir.  */
  stats: [
    { key: "members",   label: { en: "Active members",      tr: "Aktif üye" } },
    { key: "subteams",  label: { en: "Subteams",            tr: "Alt takım" } },
    { key: "events",    label: { en: "Target competitions", tr: "Hedef yarışma" } },
    { key: "season",    label: { en: "Season",              tr: "Sezon" } }
  ],

  /* --- Alt takımlar ------------------------------------------
     Açıklamalar mevcut sitenin Join Us sayfasından.           */
  subteams: [
    {
      id: "mechanic",
      name: { en: "Mechanic", tr: "Mekanik" },
      desc: { en: "Chassis, manufacturing, drivetrain integration and structural validation.",
              tr: "Şasi, imalat, güç aktarma organları entegrasyonu ve yapısal doğrulama." },
      leader: "Mehmet Emrah Arıkan",
      members: ["Dağlar Devecioğlu", "Kerem Kıryar", "Ali Savaş",
                "Chizitere Ohaegbu", "Sude Ergenay", "Gift Bahati",
                "Alfred Keino", "Muhammed Yaseen Hassan", "Reza Abedi Dorcheh"]
    },
    {
      id: "electrical",
      name: { en: "Electrical", tr: "Elektrik" },
      desc: { en: "Power systems, low-voltage architecture and reliability checks.",
              tr: "Güç sistemleri, alçak gerilim mimarisi ve güvenilirlik kontrolleri." },
      leader: "Mert Kalkancı",
      leaderRole: { en: "Manager", tr: "Yönetici" },
      /* Rolü olan üyeler listenin başında vurgulu çıkar */
      roles: { "Cansel Ezgi Özçağan": { en: "Team Lead", tr: "Takım Lideri" } },
      members: ["Cansel Ezgi Özçağan", "Arda Parlak", "Elif Beren Güler",
                "Oğuz Ayyıldız", "Zeynep Koçak", "Arda Ardıç",
                "Fatma Bilge Tunga", "Kaya Murat Yıldırım", "Arda Günbatan"]
    },
    {
      id: "aerodynamic",
      name: { en: "Aerodynamic", tr: "Aerodinamik" },
      desc: { en: "Aero concept design, CFD workflows and package validation.",
              tr: "Aerodinamik konsept tasarımı, CFD iş akışları ve paket doğrulama." },
      leader: "Morhaf Rwaidi",
      members: ["Abdoulrauf Rabeei", "Abdullah Mahmood", "Aliza Muzaffer",
                "Beril Irmak Al", "Berk Kılıç", "Ersin Ateş", "Gamze Gökçe",
                "İsmail Efe Eltutan", "Nahid Chawdhry", "Ufuk Karacan",
                "Ziad Al Dahab"]
    },
    {
      id: "software",
      name: { en: "Software", tr: "Yazılım" },
      desc: { en: "Telemetry, data pipelines, control logic and engineering tools.",
              tr: "Telemetri, veri hatları, kontrol mantığı ve mühendislik araçları." },
      leader: null,               /* TODO: yazılım alt takım lideri atanacak */
      members: ["Berkin Beceren", "İhsan Efe Yücel"]
    },
    {
      id: "business",
      name: { en: "Business and Processes", tr: "İş Geliştirme ve Süreçler" },
      desc: { en: "Sponsorship, budget, partnerships, logistics and team operations.",
              tr: "Sponsorluk, bütçe, iş ortaklıkları, lojistik ve takım operasyonları." },
      leader: "Ömer Gökçe",
      leaderRole: { en: "Team Captain", tr: "Takım Kaptanı" },
      leaderKind: "captain",
      members: ["Dursun Buğra Sayan", "Kübra Sıla Özer", "Lynn Noureddine",
                "Nazlıcan Aslantürk", "Sevde Köse"]
    }
  ],

  /* --- Yönetim ----------------------------------------------- */
  leadership: [
    { name: "Ömer Gökçe",      kind: "captain",
      role: { en: "Team Captain", tr: "Takım Kaptanı" },
      unit: { en: "Business and Processes", tr: "İş Geliştirme ve Süreçler" } },
    /* Kaptan yardımcısı yeri şimdilik boş: name null kaldıkça
       sitede "pozisyon açık" kartı görünür. */
    { name: null, kind: "vice",
      role: { en: "Vice Captain", tr: "Kaptan Yardımcısı" },
      unit: null }
  ],

  teamPage: {
    title: { en: "Team structure", tr: "Takım yapısı" },
    lead: { en: "The team is organised by subteam ownership and integrated " +
                "delivery milestones — each group owns a scope, all groups " +
                "share one build calendar.",
            tr: "Takım, alt takım sahipliği ve entegre teslim kilometre taşları " +
                "üzerine kurulu. Her grup bir kapsamın sahibi, bütün gruplar " +
                "tek bir üretim takvimini paylaşıyor." },
    leadershipTitle: { en: "Leadership", tr: "Yönetim" },
    rosterTitle: { en: "Subteams", tr: "Alt takımlar" },
    rosterNote: { en: "Pick a discipline to see its roster.",
                  tr: "Kadrosunu görmek için bir disiplin seç." },
    leaderTag: { en: "Subteam lead", tr: "Alt takım lideri" },
    memberTag: { en: "Member", tr: "Üye" },
    memberCount: { en: "members", tr: "üye" },
    vacantLead: { en: "Lead position open", tr: "Liderlik pozisyonu açık" },
    vacantRole: { en: "Position open", tr: "Pozisyon açık" }
  },

  /* --- Yarışmalar --------------------------------------------
     Tarihler mevcut siteden alındı. DİKKAT: ikisi de 2026
     yazıyor ve bugün Ekim 2026 — yani takvim güncellenmeli.   */
  competitionsPage: {
    title: { en: "Competitions", tr: "Yarışmalar" },
    lead: { en: "Formula Student events score a team twice: on paper and on track. " +
                "Static events judge the engineering case, dynamic events judge the car.",
            tr: "Formula Student etkinlikleri takımı iki kez puanlar: kağıt üzerinde " +
                "ve pistte. Statik etkinlikler mühendislik gerekçesini, dinamik " +
                "etkinlikler aracı değerlendirir." },
    eventsTitle: { en: "What gets scored", tr: "Neler puanlanıyor" },
    staticTitle: { en: "Static events", tr: "Statik etkinlikler" },
    dynamicTitle: { en: "Dynamic events", tr: "Dinamik etkinlikler" },
    staticNote: { en: "Judged in front of a panel, before the car turns a wheel.",
                  tr: "Araç tek tur atmadan önce jüri karşısında değerlendirilir." },
    dynamicNote: { en: "Run only after the car clears technical inspection.",
                   tr: "Araç teknik denetimi geçtikten sonra koşulur." },

    /* Yol haritası */
    roadTitle: { en: "Competition roadmap", tr: "Yarışma yol haritası" },
    roadLead: { en: "Planned, applied-for and confirmed events on one season axis, " +
                    "with deadlines, official links and our goal for each.",
                tr: "Planlanan, başvurulan ve katılımı onaylanan etkinlikler tek bir " +
                    "sezon ekseninde; son başvuru tarihleri, resmî bağlantılar ve " +
                    "her biri için hedefimiz." },
    now:        { en: "Today",  tr: "Bugün" },
    deadline:   { en: "Application deadline", tr: "Son başvuru" },
    goal:       { en: "Our goal", tr: "Hedefimiz" },
    official:   { en: "Official event page", tr: "Resmî etkinlik sayfası" },
    noneMatch:  { en: "No events match this filter.",
                  tr: "Bu filtreye uyan etkinlik yok." },
    seasonOver: { en: "Every event on this roadmap is already behind us. " +
                      "Add the next season's entries in js/content.js.",
                  tr: "Bu yol haritasındaki bütün etkinlikler geride kaldı. " +
                      "Sonraki sezonun kayıtlarını js/content.js içine ekle." }
  },

  /* status: "planned" -> "application" -> "confirmed"
     Eski sitedeki akışın aynısı. Yol haritasındaki nokta biçimi
     bu alana göre değişiyor: içi boş · kesik çerçeve · dolu.

     TODO: 2026 sezonu geride kaldı. 2027 kayıtlarını buraya ekle;
     yol haritası ve filtreler kendiliğinden güncellenir.           */
  competitions: [
    {
      name: "Formula Student UK",
      org: "IMechE",
      venue: { en: "Silverstone Circuit, United Kingdom",
               tr: "Silverstone Pisti, Birleşik Krallık" },
      start: "2026-07-15", end: "2026-07-19",
      status: "confirmed",
      url: "https://www.imeche.org/events/formula-student",
      deadline: null,          /* TODO: başvuru son tarihi */
      note: { en: "Participation confirmed. The season's primary target.",
              tr: "Katılım onaylandı. Sezonun birincil hedefi." },
      goal: { en: "TODO: write the target result — finish endurance, pass scrutineering first attempt, a points goal.",
              tr: "TODO: hedef sonucu yaz — dayanıklılığı bitirmek, denetimi ilk denemede geçmek, puan hedefi." }
    },
    {
      name: "Formula SAE Italy",
      org: "ANFIA",
      venue: { en: "Autodromo Riccardo Paletti, Varano de' Melegari, Italy",
               tr: "Autodromo Riccardo Paletti, Varano de' Melegari, İtalya" },
      start: "2026-09-02", end: "2026-09-06",
      status: "planned",
      url: "https://www.formula-ata.it/events/formula-sae-italy-2026/",
      deadline: null,          /* TODO: başvuru son tarihi */
      note: { en: "Planned as a second event if the build schedule holds.",
              tr: "Üretim takvimi tutarsa ikinci etkinlik olarak planlanıyor." },
      goal: { en: "TODO: write the target result for this event.",
              tr: "TODO: bu etkinlik için hedef sonucu yaz." }
    }
  ],

  /* Formula Student puanlama yapısı — genel kural bilgisi.
     Puan değerleri yıla ve yarışmaya göre değişir, o yüzden
     sayı yazmadım; sadece etkinlik adları.                    */
  scoringStatic: [
    { en: "Business Plan Presentation", tr: "İş Planı Sunumu" },
    { en: "Cost and Manufacturing",     tr: "Maliyet ve İmalat" },
    { en: "Engineering Design",         tr: "Mühendislik Tasarımı" }
  ],
  scoringDynamic: [
    { en: "Acceleration",  tr: "Hızlanma" },
    { en: "Skid Pad",      tr: "Skid Pad" },
    { en: "Autocross",     tr: "Autocross" },
    { en: "Endurance",     tr: "Dayanıklılık" },
    { en: "Efficiency",    tr: "Verimlilik" }
  ],

  /* --- Sponsorlar -------------------------------------------- */
  sponsorsPage: {
    title: { en: "Sponsors and partners", tr: "Sponsorlar ve paydaşlar" },
    lead: { en: "A Formula Student car is funded before it is built. " +
                "Our sponsors carry the gap between a drawing and a part.",
            tr: "Formula Student aracı üretilmeden önce finanse edilir. " +
                "Sponsorlarımız, bir çizim ile bir parça arasındaki mesafeyi kapatıyor." },
    mainLabel:    { en: "Main sponsor", tr: "Ana sponsor" },
    partnerLabel: { en: "Partners",     tr: "Paydaşlar" },
    whyTitle:     { en: "What a sponsor gets", tr: "Sponsor ne kazanır" },
    why: [
      { name: { en: "Visibility at three events", tr: "Üç etkinlikte görünürlük" },
        body: { en: "Livery placement on the car, team kit and transport, seen by " +
                    "every other team, the judges and the paddock audience.",
                tr: "Araç kaplaması, takım kıyafeti ve nakliye üzerinde yerleşim; " +
                    "diğer takımlar, jüri ve paddock izleyicisi tarafından görülür." } },
      { name: { en: "Access to the engineering talent pool", tr: "Mühendis havuzuna erişim" },
        body: { en: "Formula Student alumni arrive in industry having already " +
                    "designed, costed and defended a vehicle. Sponsors meet them first.",
                tr: "Formula Student mezunları sektöre bir aracı tasarlamış, " +
                    "maliyetlendirmiş ve savunmuş olarak gelir. Sponsorlar onlarla ilk tanışır." } },
      { name: { en: "A documented technical partnership", tr: "Belgelenmiş teknik ortaklık" },
        body: { en: "Material, machining or software support is credited in the " +
                    "design and cost reports submitted to the competition judges.",
                tr: "Malzeme, işleme veya yazılım desteği, yarışma jürisine sunulan " +
                    "tasarım ve maliyet raporlarında kaynak olarak belirtilir." } }
    ],
    ctaTitle: { en: "Sponsorship deck", tr: "Sponsorluk dosyası" },
    ctaBody: { en: "Tier breakdown, budget plan and livery placements are in the " +
                   "deck. Request it and we will send it the same week.",
               tr: "Kademe dökümü, bütçe planı ve kaplama yerleşimleri dosyada. " +
                   "Talep et, aynı hafta içinde gönderiyoruz." },
    ctaBtn: { en: "Request the deck", tr: "Dosyayı talep et" },
    openTitle: { en: "Main sponsor slot open", tr: "Ana sponsor yeri açık" },
    openBody:  { en: "We are looking for the partner whose name goes on the 2026/27 car. " +
                     "Request the sponsorship deck to see tiers and livery placements.",
                 tr: "2026/27 aracının üzerinde adı yer alacak iş ortağını arıyoruz. " +
                     "Kademeleri ve kaplama yerleşimlerini görmek için sponsorluk dosyasını talep et." }
  },

  /* Şu an aktif sponsor yok. Yeni sponsor gelince şu kalıpla doldur:
     { name: "...", logo: "assets/...", note: { en: "...", tr: "..." }, url: "..." }
     null kaldıkça sitede "ana sponsor yeri açık" kartı görünür.    */
  mainSponsor: null,
  partners: [
    { name: "IEEE METU NCC",   logo: "assets/ieee-logo.png",
      url: "https://ncc.metu.edu.tr/announcement/ieee-society" },
    { name: "ODTÜ KALTEV",     logo: "assets/kaltev-logo.png",
      url: "https://international.ncc.metu.edu.tr/en/kaltev" }
  ],

  /* --- Katıl ------------------------------------------------- */
  joinPage: {
    title: { en: "Join the team", tr: "Takıma katıl" },
    lead: { en: "We recruit for scope, not for CV lines. Pick the subteam whose " +
                "work you want to learn; the rest is taught on the build.",
            tr: "Özgeçmiş satırı için değil, iş kapsamı için üye alıyoruz. " +
                "Hangi alt takımın işini öğrenmek istiyorsan onu seç; " +
                "gerisi üretim sırasında öğretilir." },
    openTitle:    { en: "Open subteams",       tr: "Başvuruya açık alt takımlar" },
    processTitle: { en: "How the process runs", tr: "Süreç nasıl işliyor" },
    processNote:  { en: "Four steps, in order. Each one takes about a week.",
                    tr: "Dört adım, sırayla. Her biri yaklaşık bir hafta sürer." },
    formBtn:      { en: "Open the application form", tr: "Başvuru formunu aç" },
    formNote:     { en: "The form is hosted on Google Forms and takes about five minutes.",
                    tr: "Form Google Forms üzerinde, yaklaşık beş dakika sürüyor." },
    faqTitle:     { en: "Before you ask", tr: "Sormadan önce" }
  },

  process: [
    { name: { en: "Apply", tr: "Başvur" },
      body: { en: "Submit the application form with your background and motivation.",
              tr: "Geçmişini ve motivasyonunu yazdığın başvuru formunu gönder." } },
    { name: { en: "Intro session", tr: "Tanıtım oturumu" },
      body: { en: "Attend the orientation meeting and learn what the project expects.",
              tr: "Oryantasyon toplantısına katıl ve projenin beklentilerini öğren." } },
    { name: { en: "Technical evaluation", tr: "Teknik değerlendirme" },
      body: { en: "Complete a small task aligned with your target subteam.",
              tr: "Hedeflediğin alt takıma uygun küçük bir görevi tamamla." } },
    { name: { en: "Onboarding sprint", tr: "Uyum sprinti" },
      body: { en: "Join active workstreams and start with guided tasks.",
              tr: "Aktif iş akışlarına katıl ve rehberli görevlerle başla." } }
  ],

  faq: [
    { q: { en: "Do I need Formula Student experience?", tr: "Formula Student deneyimi gerekli mi?" },
      a: { en: "No. Most members join without it. What matters is showing up to " +
               "the build sessions and finishing the task you took.",
           tr: "Hayır. Üyelerin çoğu deneyimsiz katılıyor. Önemli olan üretim " +
               "oturumlarına gelmek ve aldığın görevi bitirmek." } },
    { q: { en: "Which departments can apply?", tr: "Hangi bölümler başvurabilir?" },
      a: { en: "All of them. The roster currently spans mechanical, electrical, " +
               "computer and business-side disciplines.",
           tr: "Hepsi. Mevcut kadro makine, elektrik, bilgisayar ve iş tarafı " +
               "disiplinlerinin tamamını kapsıyor." } },
    { q: { en: "How much time does it take?", tr: "Ne kadar zaman alıyor?" },
      a: { en: "TODO: Write the realistic weekly hour range here — applicants ask " +
               "this first and a vague answer costs you candidates.",
           tr: "TODO: Gerçekçi haftalık saat aralığını buraya yaz — adaylar ilk " +
               "bunu soruyor ve belirsiz cevap aday kaybettirir." } },
    { q: { en: "Is there an application deadline?", tr: "Başvuru son tarihi var mı?" },
      a: { en: "TODO: Add the deadline, or state that applications are open " +
               "continuously.",
           tr: "TODO: Son tarihi ekle veya başvuruların sürekli açık olduğunu belirt." } }
  ],

  /* --- İletişim ---------------------------------------------- */
  contactPage: {
    title: { en: "Contact", tr: "İletişim" },
    lead: { en: "Sponsorship, press and student applications all reach the same " +
                "inbox. Mark the subject line and it gets routed the same day.",
            tr: "Sponsorluk, basın ve öğrenci başvuruları aynı posta kutusuna " +
                "ulaşıyor. Konu satırını işaretle, aynı gün yönlendirilir." },
    directTitle: { en: "Direct", tr: "Doğrudan" },
    followTitle: { en: "Follow", tr: "Takip et" },
    formTitle:   { en: "Write to us", tr: "Bize yaz" },
    formNote:    { en: "This draft has no server, so the form opens a prepared " +
                       "message in your own mail app.",
                   tr: "Bu taslağın sunucusu yok; form, kendi e-posta uygulamanda " +
                       "hazır bir mesaj açar." },
    fName:  { en: "Name",    tr: "Ad soyad" },
    fTopic: { en: "Subject", tr: "Konu" },
    fMsg:   { en: "Message", tr: "Mesaj" },
    fSend:  { en: "Prepare email", tr: "E-postayı hazırla" },
    topics: [
      { en: "Sponsorship",        tr: "Sponsorluk" },
      { en: "Student application", tr: "Öğrenci başvurusu" },
      { en: "Press",              tr: "Basın" },
      { en: "Technical partnership", tr: "Teknik iş ortaklığı" },
      { en: "Other",              tr: "Diğer" }
    ],
    errEmpty: { en: "Fill in your name and message.", tr: "Ad soyad ve mesaj alanlarını doldur." },
    ok:       { en: "Opening your mail app.", tr: "E-posta uygulaman açılıyor." }
  },

  contact: {
    /* TODO: Takım adı değiştiğine göre bu adres de apexracing...
       olacak şekilde güncellenmeli. Şimdilik sitedeki adres. */
    email: "metucfor@gmail.com",
    location: { en: "METU Northern Cyprus Campus, Kalkanlı, Güzelyurt",
                tr: "ODTÜ Kuzey Kıbrıs Kampusu, Kalkanlı, Güzelyurt" },
    room: { en: "TODO: workshop / office location",
            tr: "TODO: atölye / ofis konumu" }
  },

  links: {
    form: "https://docs.google.com/forms/d/e/1FAIpQLSdXRFolsuKthOtazLaHuJ6ieruqGd0Ohm9vbD3ZLjx7y1cnmA/viewform",
    linkedin: "https://www.linkedin.com/groups/15692148/",
    instagram: null   /* TODO: Instagram adresi */
  },

  ui: {
    confirmed: { en: "Confirmed", tr: "Onaylandı" },
    planned:     { en: "Planned",     tr: "Planlanıyor" },
    application: { en: "Application", tr: "Başvuru" },
    past:      { en: "Date passed", tr: "Tarihi geçti" },
    missing:   { en: "link missing", tr: "link eksik" },
    all:       { en: "All", tr: "Tümü" },
    menu:      { en: "Menu", tr: "Menü" }
  }
};
