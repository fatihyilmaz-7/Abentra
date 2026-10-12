// ==============================================================================
// ABENTRA International - Client-side Application & Bilingual Localization Engine
// ==============================================================================

const siteI18n = {
  en: {
    // Navigation
    navWho: 'Who we are',
    navPurpose: 'Our purpose',
    navServices: 'Our services',
    navContact: 'Contact',
    navAdmin: 'Admin Portal',
    railHome: 'Home',
    railWho: 'Who we are',
    railPurpose: 'Our purpose',
    railServices: 'Our services',
    railContact: 'Leadership & contact',

    // Hero
    heroTag: 'Company profile',
    heroTitle: 'Bridging opportunities.',
    heroTitleAccent: 'Building tomorrow.',
    heroDesc: 'Business establishment, licensing, compliance and liaison in Liberia.',
    heroBtnPrimary: 'Our services',
    heroBtnSecondary: 'Let’s connect',
    heroLoc: 'Monrovia, Liberia',
    heroArtTagline: 'BRIDGING OPPORTUNITIES. BUILDING TOMORROW.',

    // Ticker
    ticker: [
      'Business establishment',
      'Licensing & compliance',
      'Government & corporate liaison',
      'Market entry & ongoing support'
    ],

    // Who We Are
    whoTag: 'Who we are',
    whoTagSub: 'Company profile 02',
    whoTitle: 'Your connection to business in Liberia.',
    whoLead: 'ABENTRA is the trusted connection between businesses, government institutions, regulators and commercial opportunities in Liberia.',
    whoSecondary: 'Helping local and international businesses establish, connect and remain compliant in Liberia.',
    whoPromiseLabel: 'Our promise',
    whoPromiseText: 'We simplify the path between business ambition and compliant operation in Liberia.',
    whoSidebarTitle: 'One coordinated point of contact',
    whoPoints: [
      { num: '01', title: 'Business establishment' },
      { num: '02', title: 'Licensing & compliance' },
      { num: '03', title: 'Government & corporate liaison' },
      { num: '04', title: 'Market entry & ongoing support' }
    ],

    // Purpose
    purposeTag: 'Our purpose',
    purposeTagSub: 'Company profile 03',
    purposeTitle: 'Purpose, direction and character.',
    purposeMissionTitle: 'Mission',
    purposeMissionText: 'Help businesses enter, establish and operate confidently through dependable liaison, licensing, compliance and market-entry support.',
    purposeVisionTitle: 'Vision',
    purposeVisionText: 'Become Liberia’s most trusted gateway for responsible local and international business establishment and regulatory compliance.',
    purposeCharsTitle: 'Our character',
    purposeCharacters: [
      'Professional',
      'Diplomatic',
      'Knowledgeable',
      'Efficient',
      'Discreet',
      'Responsive',
      'Trustworthy'
    ],

    // Services
    servicesTag: 'Our services',
    servicesTagSub: 'Company profile 04 – 07',
    servicesTitle: 'Our services',
    services: [
      {
        title: 'Business establishment',
        tag: 'Service area 01',
        tagSub: 'Company profile 04',
        note: 'One coordinated point of contact for business support in Liberia.',
        items: [
          'Business registration and renewal',
          'Tax registration and clearance facilitation',
          'Corporate administrative support'
        ]
      },
      {
        title: 'Licensing & compliance',
        tag: 'Service area 02',
        tagSub: 'Company profile 05',
        note: 'One coordinated point of contact for business support in Liberia.',
        items: [
          'Operational permits and industry licenses',
          'Certification, accreditation and renewals',
          'Compliance monitoring and retainers'
        ]
      },
      {
        title: 'Government & corporate liaison',
        tag: 'Service area 03',
        tagSub: 'Company profile 06',
        note: 'ABENTRA coordinates processes but does not provide legal advice, guarantee government approval or control official processing times.',
        items: [
          'Ministry and agency coordination',
          'Application follow-up and reporting',
          'Legal referrals to qualified lawyers'
        ]
      },
      {
        title: 'Market entry & ongoing support',
        tag: 'Service area 04',
        tagSub: 'Company profile 07',
        note: 'One coordinated point of contact for business support in Liberia.',
        items: [
          'Market-entry guidance',
          'Local introductions and partner connections',
          'Investor and delegation support'
        ]
      }
    ],

    // Dynamic intermediate sections translations
    sections: {
      sec_stats: {
        title: 'Delivering institutional confidence in Liberia.',
        tag: 'Track Record',
        tagSub: 'Strategic Advisory',
        subtitle: 'Connecting multinational corporations, private investors, and emerging enterprises to verified commercial channels.',
        items: [
          { label: 'Years Advisory Expertise', description: 'Deep-rooted understanding of Liberian commercial and administrative frameworks.' },
          { label: 'Corporate Entities Handled', description: 'Seamless registrations, renewals, and regulatory accreditations.' },
          { label: 'Rapid Liaison Activation', description: 'Direct communication pathways with relevant ministries and agencies.' },
          { label: 'Regulatory Integrity', description: 'Strict compliance with Liberian statutory laws and international business ethics.' }
        ]
      },
      sec_why_liberia: {
        title: 'Why invest & establish in Liberia?',
        tag: 'Regional Horizon',
        tagSub: 'Investment Climate',
        subtitle: 'A resource-rich economy undergoing dynamic institutional reforms, positioned as a vital Atlantic trade gateway in West Africa.',
        items: [
          { title: 'Abundant Natural Wealth', description: 'Extensive reserves of iron ore, gold, diamonds, rubber, sustainable timber, and offshore energy exploration opportunities.' },
          { title: 'Maritime & Freeport Hub', description: 'The Freeport of Monrovia serves as a key logistical nexus, alongside one of the world\'s premier maritime registries.' },
          { title: 'Pro-Business Regulatory Framework', description: 'Competitive tax incentives, bilateral trade agreements, and supportive foreign direct investment policies.' },
          { title: 'ECOWAS Market Integration', description: 'Direct access to over 400 million regional consumers through the Economic Community of West African States.' }
        ]
      },
      sec_process: {
        title: 'A structured pathway from intent to operation.',
        tag: 'Execution Framework',
        tagSub: 'How We Work',
        subtitle: 'Navigating complex bureaucratic landscapes with precision, transparency, and unyielding efficiency.',
        items: [
          { title: 'Preliminary Scoping & Compliance Audit', description: 'We evaluate your corporate objectives against current Liberian statutory prerequisites and licensing needs.' },
          { title: 'Institutional & Regulatory Roadmapping', description: 'Preparation of requisite administrative dossiers, ministerial filings, and coordination with accredited legal counsel.' },
          { title: 'Active Agency Liaison & Tracking', description: 'Daily monitoring of application pathways across pertinent authorities, ensuring prompt resolution of bottlenecks.' },
          { title: 'Operational Commissioning & Ongoing Retainers', description: 'Continuous compliance tracking, tax renewal facilitation, and commercial representation.' }
        ]
      },
      sec_faq: {
        title: 'Frequently asked questions.',
        tag: 'Clarity & Counsel',
        tagSub: 'Information Desk',
        subtitle: 'Key statutory guidelines and institutional insights for operating in Liberia.',
        items: [
          { q: 'How long does formal corporate registration take in Liberia?', a: 'Standard commercial registrations typically take 5 to 10 business days once statutory dossiers and clearance requirements are verified.' },
          { q: 'Does ABENTRA provide direct legal representation?', a: 'ABENTRA acts as a specialized corporate and regulatory liaison. Where formal legal litigation or legal opinions are mandated, we coordinate directly with accredited Liberian legal counsel.' },
          { q: 'What sectors are currently prioritized for foreign direct investment?', a: 'Mining concessions, agriculture & rubber plantations, maritime logistics, energy infrastructure, and commercial import-export trade.' },
          { q: 'Can ABENTRA assist with ongoing compliance after incorporation?', a: 'Yes. We offer retainer advisory packages that cover annual business registry renewals, municipal operating permits, and tax compliance clearance.' }
        ]
      }
    },

    // Contact
    contactTag: 'Leadership & contact',
    contactTagSub: 'Company profile 08',
    contactTitle: 'Let’s connect.',
    contactLeaderTitle: 'Founder & Managing Director',
    contactLeaderName: 'ABENETTA KOLLIE',
    lblRowPhone: 'Telephone',
    lblRowEmail: 'Email',
    lblRowOffice: 'Office',
    btnCopy: 'Copy',
    btnCopied: 'Copied!',
    contactFormTitle: 'Direct Executive Transmission',
    contactFormSub: 'Initiate formal advisory or licensing inquiries directly with our Monrovia executive desk.',
    lblContactName: 'Full Name / Organization *',
    phContactName: 'e.g. John Doe / Apex Corp',
    lblContactEmail: 'Corporate Email *',
    phContactEmail: 'e.g. j.doe@apexcorp.com',
    lblContactPhone: 'Telephone / WhatsApp',
    phContactPhone: '+231 ... or +1 ...',
    lblContactService: 'Service Area',
    optSvc0: 'Business Establishment',
    optSvc1: 'Licensing & Compliance',
    optSvc2: 'Government & Corporate Liaison',
    optSvc3: 'Market Entry & Ongoing Support',
    optSvc4: 'Other Strategic Inquiry',
    lblContactSubject: 'Subject',
    phContactSubject: 'e.g. Mineral Exploration Permit Liaison',
    lblContactMessage: 'Inquiry Details *',
    phContactMessage: 'Detail your operational or statutory requirements in Liberia...',
    btnSubmitContact: 'Transmit Inquiry to ABENTRA',
    transmitting: 'Transmitting...',

    // Footer
    footerCol1: 'ABENTRA International · Monrovia, Liberia',
    footerCol2: 'Bridging opportunities. Building tomorrow.',
    footerAdmin: 'Admin Portal'
  },

  tr: {
    // Navigation
    navWho: 'Hakkımızda',
    navPurpose: 'Amacımız',
    navServices: 'Hizmetlerimiz',
    navContact: 'İletişim',
    navAdmin: 'Yönetim Portalı',
    railHome: 'Giriş',
    railWho: 'Hakkımızda',
    railPurpose: 'Amacımız',
    railServices: 'Hizmetlerimiz',
    railContact: 'Liderlik & İletişim',

    // Hero
    heroTag: 'Şirket Profili',
    heroTitle: 'Fırsatları birleştiriyoruz.',
    heroTitleAccent: 'Geleceği inşa ediyoruz.',
    heroDesc: 'Liberya’da şirket kuruluşu, ruhsatlandırma, mevzuat uyumu ve kurumsal temsil.',
    heroBtnPrimary: 'Hizmetlerimiz',
    heroBtnSecondary: 'Bize Ulaşın',
    heroLoc: 'Monrovia, Liberya',
    heroArtTagline: 'FIRSATLARI BİRLEŞTİRİYORUZ. GELECEĞİ İNŞA EDİYORUZ.',

    // Ticker
    ticker: [
      'Şirket kuruluşu & tescil',
      'Ruhsatlandırma & mevzuat uyumu',
      'Bakanlık & kurumsal temsil',
      'Pazara giriş & sürekli destek'
    ],

    // Who We Are
    whoTag: 'Hakkımızda',
    whoTagSub: 'Şirket profili 02',
    whoTitle: 'Liberya’daki iş dünyasıyla güvenilir bağınız.',
    whoLead: 'ABENTRA, Liberya’daki işletmeler, resmi kurumlar, düzenleyici merciler ve ticari fırsatlar arasındaki güvenilir köprüdür.',
    whoSecondary: 'Yerli ve uluslararası işletmelerin Liberya’da kurulmasına, doğru bağlantılar kurmasına ve mevzuata tam uyumlu kalmasına rehberlik ediyoruz.',
    whoPromiseLabel: 'Sözümüz',
    whoPromiseText: 'Liberya’daki ticari vizyon ile mevzuata tam uyumlu faaliyet arasındaki yolu yalınlaştırıyoruz.',
    whoSidebarTitle: 'Tek koordinasyon ve irtibat noktası',
    whoPoints: [
      { num: '01', title: 'Şirket kuruluşu' },
      { num: '02', title: 'Ruhsatlandırma & mevzuat uyumu' },
      { num: '03', title: 'Bakanlık & kurumsal temsil' },
      { num: '04', title: 'Pazara giriş & sürekli destek' }
    ],

    // Purpose
    purposeTag: 'Amacımız',
    purposeTagSub: 'Şirket profili 03',
    purposeTitle: 'Amaç, yön ve kurumsal karakter.',
    purposeMissionTitle: 'Misyonumuz',
    purposeMissionText: 'Güvenilir temsil, ruhsatlandırma, mevzuat uyumu ve pazara giriş desteği ile işletmelerin Liberya pazarına güvenle adım atmasını ve faaliyet göstermesini sağlamak.',
    purposeVisionTitle: 'Vizyonumuz',
    purposeVisionText: 'Liberya’da sorumlu yerli ve uluslararası şirket kuruluşu ve mevzuata uyum alanında en çok güvenilen resmi kapı olmak.',
    purposeCharsTitle: 'Karakterimiz',
    purposeCharacters: [
      'Profesyonel',
      'Diplomatik',
      'Yetkin & Bilgili',
      'Verimli',
      'Gizliliğe Sadık',
      'Hızlı & Çözüm Odaklı',
      'Güvenilir'
    ],

    // Services
    servicesTag: 'Hizmetlerimiz',
    servicesTagSub: 'Şirket profili 04 – 07',
    servicesTitle: 'Hizmetlerimiz',
    services: [
      {
        title: 'Şirket Kuruluşu',
        tag: 'Hizmet alanı 01',
        tagSub: 'Şirket profili 04',
        note: 'Liberya’da ticari destek için tek koordinasyon noktası.',
        items: [
          'Şirket tescili ve yıllık yenileme işlemleri',
          'Vergi kaydı ve vergi borcu yoktur belgesi kolaylaştırma',
          'Kurumsal idari ve sekretarya desteği'
        ]
      },
      {
        title: 'Ruhsatlandırma & Mevzuat Uyumu',
        tag: 'Hizmet alanı 02',
        tagSub: 'Şirket profili 05',
        note: 'Liberya’da ticari destek için tek koordinasyon noktası.',
        items: [
          'Faaliyet izinleri ve sektörel ruhsatların alımı',
          'Sertifikasyon, akreditasyon ve periyodik onaylar',
          'Mevzuata uyum takibi ve danışmanlık retainer paketleri'
        ]
      },
      {
        title: 'Bakanlık & Kurumsal Temsil',
        tag: 'Hizmet alanı 03',
        tagSub: 'Şirket profili 06',
        note: 'ABENTRA süreçleri koordine eder; doğrudan hukuki vekâlet vermez veya resmi kurum işlem sürelerini garanti etmez.',
        items: [
          'Bakanlıklar ve kamu kurumlarıyla resmi koordinasyon',
          'Başvuru dosya takibi ve düzenli durum raporlaması',
          'Yetkili Liberyalı hukuk danışmanlarına yönlendirme'
        ]
      },
      {
        title: 'Pazara Giriş & Sürekli Destek',
        tag: 'Hizmet alanı 04',
        tagSub: 'Şirket profili 07',
        note: 'Liberya’da ticari destek için tek koordinasyon noktası.',
        items: [
          'Pazara giriş stratejisi ve sektörel rehberlik',
          'Yerel paydaşlar ve güvenilir iş ortaklıkları geliştirme',
          'Yatırımcı ve delegasyon karşılama & lojistik desteği'
        ]
      }
    ],

    // Dynamic intermediate sections translations
    sections: {
      sec_stats: {
        title: 'Liberya’da kurumsal güven inşa ediyoruz.',
        tag: 'Başarı Karnesi',
        tagSub: 'Stratejik Danışmanlık',
        subtitle: 'Çok uluslu şirketleri, özel yatırımcıları ve girişimleri doğrulanmış ticari kanallara bağlıyoruz.',
        items: [
          { label: 'Yıllık Danışmanlık Tecrübesi', description: 'Liberya ticari ve idari mevzuatına dair derin ve köklü hakimiyet.' },
          { label: 'Yönetilen Kurumsal Şirket', description: 'Sorunsuz şirket tescilleri, yenilemeler ve sektörel akreditasyonlar.' },
          { label: 'Hızlı Temsil Aktivasyonu', description: 'İlgili bakanlıklar ve düzenleyici kurumlarla doğrudan iletişim kanalları.' },
          { label: 'Mevzuata Tam Uyum', description: 'Liberya yasal mevzuatına ve uluslararası iş etiğine tavizsiz bağlılık.' }
        ]
      },
      sec_why_liberia: {
        title: 'Neden Liberya’ya yatırım ve kurulum?',
        tag: 'Bölgesel Vizyon',
        tagSub: 'Yatırım İklimi',
        subtitle: 'Dinamik kurumsal reformlardan geçen, doğal kaynak zengini ve Batı Afrika’da stratejik Atlantik ticaret kapısı.',
        items: [
          { title: 'Zengin Doğal Kaynaklar', description: 'Demir cevheri, altın, elmas, kauçuk, sürdürülebilir kereste ve açık deniz enerji arama fırsatları.' },
          { title: 'Denizcilik ve Serbest Liman Merkezi', description: 'Monrovia Serbest Limanı ve dünyanın en büyük denizcilik sicillerinden biriyle lojistik kavşak.' },
          { title: 'Yatırım Dostu Mevzuat Çerçevesi', description: 'Rekabetçi vergi teşvikleri, ikili ticaret anlaşmaları ve doğrudan yabancı yatırımı destekleyen politikalar.' },
          { title: 'ECOWAS Bölgesel Pazar Entegrasyonu', description: 'Batı Afrika Devletleri Ekonomik Topluluğu aracılığıyla 400 milyonu aşkın tüketiciye doğrudan erişim.' }
        ]
      },
      sec_process: {
        title: 'Niyetten operasyona yapılandırılmış yol haritası.',
        tag: 'Uygulama Modeli',
        tagSub: 'Nasıl Çalışıyoruz',
        subtitle: 'Karmaşık bürokratik süreçleri hassasiyet, şeffaflık ve yüksek verimlilikle yönetiyoruz.',
        items: [
          { title: 'Ön İnceleme ve Mevzuat Uyumu Denetimi', description: 'Ticari hedeflerinizi Liberya yasal gereksinimleri ve lisanslama şartları açısından değerlendiriyoruz.' },
          { title: 'Kurumsal ve İdari Yol Haritası', description: 'Gerekli resmi dosyaların hazırlanması, bakanlık başvuruları ve akredite avukatlarla koordinasyon.' },
          { title: 'Aktif Kurum İrtibatı ve Süreç Takibi', description: 'Başvuruların ilgili kurumlardaki seyrinin günlük takibi ve engellerin hızla çözülmesi.' },
          { title: 'Operasyonel Başlangıç ve Düzenli Destek', description: 'Sürekli mevzuat takibi, yıllık yenilemeler ve temsil hizmetleriyle kesintisiz destek.' }
        ]
      },
      sec_faq: {
        title: 'Sıkça Sorulan Sorular',
        tag: 'Açıklık ve Rehberlik',
        tagSub: 'Danışma Masası',
        subtitle: 'Liberya’da faaliyet göstermek için temel mevzuat ve operasyonel bilgiler.',
        items: [
          { q: 'Liberya’da resmi şirket kuruluşu ne kadar sürer?', a: 'Resmi evraklar tamamlanıp onaylandıktan sonra standart ticari şirket tescili genellikle 5 ila 10 iş günü sürer.' },
          { q: 'ABENTRA doğrudan hukuki vekillik verir mi?', a: 'ABENTRA özel bir kurumsal temsil ve koordinasyon danışmanıdır. Resmi dava veya mahkeme vekilliği gerektiğinde akredite Liberyalı avukatlarla çalışırız.' },
          { q: 'Doğrudan yabancı yatırımlar için hangi sektörler önceliklidir?', a: 'Madencilik, tarım & kauçuk, deniz taşımacılığı, enerji altyapısı ve ticari ithalat-ihracat sektörleri önceliklidir.' },
          { q: 'Şirket kurulduktan sonra sürekli mevzuat desteği veriyor musunuz?', a: 'Evet. Yıllık tescil yenilemeleri, belediye izinleri ve vergi borcu yoktur belgelerini kapsayan düzenli danışmanlık paketleri sunuyoruz.' }
        ]
      }
    },

    // Contact
    contactTag: 'Liderlik & İletişim',
    contactTagSub: 'Şirket profili 08',
    contactTitle: 'Bize Ulaşın.',
    contactLeaderTitle: 'Kurucu & Yönetici Direktör',
    contactLeaderName: 'ABENETTA KOLLIE',
    lblRowPhone: 'Telefon',
    lblRowEmail: 'E-Posta',
    lblRowOffice: 'Ofis',
    btnCopy: 'Kopyala',
    btnCopied: 'Kopyalandı!',
    contactFormTitle: 'Doğrudan Yönetici İletişim Hattı',
    contactFormSub: 'Monrovia yönetim masamız ile resmi danışmanlık veya ruhsatlandırma taleplerinizi başlatın.',
    lblContactName: 'Adınız Soyadınız / Kurum *',
    phContactName: 'Örn: Ahmet Yılmaz / ABC Şirketi',
    lblContactEmail: 'Kurumsal E-Posta *',
    phContactEmail: 'Örn: a.yilmaz@sirketiniz.com',
    lblContactPhone: 'Telefon / WhatsApp',
    phContactPhone: '+90 ... veya +231 ...',
    lblContactService: 'İlgili Hizmet Alanı',
    optSvc0: 'Şirket Kuruluşu & Tescil',
    optSvc1: 'Ruhsatlandırma & Mevzuat Uyumu',
    optSvc2: 'Bakanlık & Kurumsal Temsil',
    optSvc3: 'Pazara Giriş & Sürekli Destek',
    optSvc4: 'Diğer Stratejik Danışmanlık',
    lblContactSubject: 'Konu',
    phContactSubject: 'Örn: Maden Arama İzni Başvurusu',
    lblContactMessage: 'Talep Detayları *',
    phContactMessage: 'Liberya’daki operasyonel veya yasal gereksinimlerinizi detaylandırın...',
    btnSubmitContact: 'Talebi ABENTRA’ya İlet',
    transmitting: 'İletiliyor...',

    // Footer
    footerCol1: 'ABENTRA International · Monrovia, Liberya',
    footerCol2: 'Fırsatları birleştiriyoruz. Geleceği inşa ediyoruz.',
    footerAdmin: 'Yönetim Portalı'
  }
};

document.addEventListener('DOMContentLoaded', async () => {
  const $ = (s, r = document) => [...r.querySelectorAll(s)];
  let cachedSiteData = null;
  let activeLang = 'en';
  try { localStorage.removeItem('abentra_site_lang'); } catch (e) {}

  // 1. Fetch site data and apply dynamic configurations
  try {
    const res = await fetch('/api/site-data');
    if (res.ok) {
      cachedSiteData = await res.json();
      applySiteData(cachedSiteData);
    }
  } catch (e) {
    console.warn('Could not fetch dynamic site data, running with static defaults:', e);
  }

  // 2. Setup Core Animations & Interactions
  initScrollEffects();
  initParallaxAndTilt();
  initTabsAndNavigation();
  initContactForm();

  // 3. Setup Language Switchers
  initLanguageSwitcher();
  setSiteLanguage(activeLang);

  function initLanguageSwitcher() {
    const setupBtns = (selector, lang) => {
      document.querySelectorAll(selector).forEach(btn => {
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          setSiteLanguage(lang);
        });
      });
    };

    setupBtns('#site-lang-en, #drawer-lang-en', 'en');
    setupBtns('#site-lang-tr, #drawer-lang-tr', 'tr');
  }

  function setSiteLanguage(lang) {
    activeLang = lang;
    localStorage.setItem('abentra_site_lang', lang);
    document.documentElement.lang = lang;

    // Toggle active state on buttons
    document.querySelectorAll('#site-lang-en, #drawer-lang-en').forEach(b => b.classList.toggle('active', lang === 'en'));
    document.querySelectorAll('#site-lang-tr, #drawer-lang-tr').forEach(b => b.classList.toggle('active', lang === 'tr'));

    const dict = siteI18n[lang] || siteI18n['en'];

    // Nav Links
    const nWho = document.getElementById('nav-who'); if (nWho) nWho.textContent = dict.navWho;
    const nPur = document.getElementById('nav-purpose'); if (nPur) nPur.textContent = dict.navPurpose;
    const nSvc = document.getElementById('nav-services'); if (nSvc) nSvc.textContent = dict.navServices;
    const nCon = document.getElementById('nav-contact'); if (nCon) nCon.textContent = dict.navContact;
    const nAdm = document.getElementById('nav-admin'); if (nAdm) nAdm.textContent = dict.navAdmin;

    // Rail links
    const rHome = document.getElementById('rail-home'); if (rHome) rHome.innerHTML = `<b>${dict.railHome}</b>`;
    const rWho = document.getElementById('rail-who'); if (rWho) rWho.innerHTML = `<b>${dict.railWho}</b>`;
    const rPur = document.getElementById('rail-purpose'); if (rPur) rPur.innerHTML = `<b>${dict.railPurpose}</b>`;
    const rSvc = document.getElementById('rail-services'); if (rSvc) rSvc.innerHTML = `<b>${dict.railServices}</b>`;
    const rCon = document.getElementById('rail-contact'); if (rCon) rCon.innerHTML = `<b>${dict.railContact}</b>`;

    // Hero Section
    const heroTag = document.getElementById('hero-tag'); if (heroTag) heroTag.textContent = dict.heroTag;
    const heroTitle = document.getElementById('hero-title'); if (heroTitle) heroTitle.textContent = dict.heroTitle;
    const heroAccent = document.getElementById('hero-title-accent'); if (heroAccent) heroAccent.textContent = dict.heroTitleAccent;
    const heroDesc = document.getElementById('hero-desc'); if (heroDesc) heroDesc.textContent = dict.heroDesc;
    const heroLoc = document.getElementById('hero-loc'); if (heroLoc) heroLoc.textContent = dict.heroLoc;
    const heroBtn1 = document.getElementById('hero-btn-primary'); if (heroBtn1) heroBtn1.textContent = dict.heroBtnPrimary;
    const heroBtn2 = document.getElementById('hero-btn-secondary'); if (heroBtn2) heroBtn2.textContent = dict.heroBtnSecondary;
    const heroTagline = document.getElementById('hero-art-tagline'); if (heroTagline) heroTagline.textContent = dict.heroArtTagline;

    // Ticker Band
    const track = document.getElementById('ticker-track');
    if (track) {
      const phrases = dict.ticker || [];
      const repeated = [...phrases, ...phrases, ...phrases];
      track.innerHTML = repeated.map(t => `<span>${t}</span>`).join('');
    }

    // Who We Are Section
    const whoTag = document.getElementById('who-tag'); if (whoTag) whoTag.innerHTML = `${dict.whoTag}<i>${dict.whoTagSub}</i>`;
    const whoTitle = document.getElementById('who-title'); if (whoTitle) whoTitle.textContent = dict.whoTitle;
    const whoLead = document.getElementById('who-lead'); if (whoLead) whoLead.textContent = dict.whoLead;
    const whoSec = document.getElementById('who-secondary'); if (whoSec) whoSec.textContent = dict.whoSecondary;
    const whoPromLbl = document.getElementById('who-promise-label'); if (whoPromLbl) whoPromLbl.textContent = dict.whoPromiseLabel;
    const whoPromTxt = document.getElementById('who-promise-text'); if (whoPromTxt) whoPromTxt.textContent = dict.whoPromiseText;
    const whoSideTitle = document.getElementById('who-sidebar-title'); if (whoSideTitle) whoSideTitle.textContent = dict.whoSidebarTitle;

    const whoPoints = document.getElementById('who-points-list');
    if (whoPoints && dict.whoPoints) {
      whoPoints.innerHTML = dict.whoPoints.map((pt, i) => `
        <a class="point" href="#s${i}" data-go="${i}">
          <span>${pt.num}</span>${pt.title}
        </a>
      `).join('');
      // Reattach data-go handlers
      attachQuickGoLinks();
    }

    // Purpose Section
    const purTag = document.getElementById('purpose-tag'); if (purTag) purTag.innerHTML = `${dict.purposeTag}<i>${dict.purposeTagSub}</i>`;
    const purTitle = document.getElementById('purpose-title'); if (purTitle) purTitle.textContent = dict.purposeTitle;
    const misTitle = document.getElementById('purpose-mission-title'); if (misTitle) misTitle.textContent = dict.purposeMissionTitle;
    const misText = document.getElementById('purpose-mission-text'); if (misText) misText.textContent = dict.purposeMissionText;
    const visTitle = document.getElementById('purpose-vision-title'); if (visTitle) visTitle.textContent = dict.purposeVisionTitle;
    const visText = document.getElementById('purpose-vision-text'); if (visText) visText.textContent = dict.purposeVisionText;
    const charTitle = document.getElementById('purpose-chars-title'); if (charTitle) charTitle.textContent = dict.purposeCharsTitle;

    const charList = document.getElementById('purpose-chars-list');
    if (charList && dict.purposeCharacters) {
      charList.innerHTML = dict.purposeCharacters.map(c => `<span>${c}</span>`).join('');
    }

    // Services Section
    const svcTag = document.getElementById('services-tag'); if (svcTag) svcTag.innerHTML = `${dict.servicesTag}<i>${dict.servicesTagSub}</i>`;
    const svcTitle = document.getElementById('services-title'); if (svcTitle) svcTitle.textContent = dict.servicesTitle;

    if (dict.services) {
      dict.services.forEach((s, idx) => {
        const tabBtn = document.getElementById(`t${idx}`); if (tabBtn) tabBtn.textContent = s.title;
        const pTag = document.getElementById(`s${idx}-tag`); if (pTag) pTag.innerHTML = `${s.tag}<i>${s.tagSub}</i>`;
        const pTitle = document.getElementById(`s${idx}-title`); if (pTitle) pTitle.textContent = s.title;
        const pNote = document.getElementById(`s${idx}-note`); if (pNote) pNote.textContent = s.note;
        const pItems = document.getElementById(`s${idx}-items`);
        if (pItems && s.items) {
          pItems.innerHTML = s.items.map(it => `<li>${it}</li>`).join('');
        }
      });
    }

    // Leadership & Contact Section
    const conTag = document.getElementById('contact-tag'); if (conTag) conTag.innerHTML = `${dict.contactTag}<i>${dict.contactTagSub}</i>`;
    const conTitle = document.getElementById('contact-title'); if (conTitle) conTitle.textContent = dict.contactTitle;
    const conLeadTitle = document.getElementById('contact-leader-title'); if (conLeadTitle) conLeadTitle.textContent = dict.contactLeaderTitle;
    const conLeadName = document.getElementById('contact-leader-name'); if (conLeadName) conLeadName.textContent = dict.contactLeaderName;

    // Contact labels
    const rPhone = document.querySelector('.row:nth-child(1) small'); if (rPhone) rPhone.textContent = dict.lblRowPhone;
    const rEmail = document.querySelector('.row:nth-child(2) small'); if (rEmail) rEmail.textContent = dict.lblRowEmail;
    const rOffice = document.querySelector('.row:nth-child(3) small'); if (rOffice) rOffice.textContent = dict.lblRowOffice;
    const copyBtn = document.getElementById('contact-email-copy'); if (copyBtn) copyBtn.textContent = dict.btnCopy;

    // Contact Form
    const fTitle = document.getElementById('contact-form-title'); if (fTitle) fTitle.textContent = dict.contactFormTitle;
    const fSub = document.getElementById('contact-form-sub'); if (fSub) fSub.textContent = dict.contactFormSub;
    const lName = document.getElementById('lbl-contact-name'); if (lName) lName.textContent = dict.lblContactName;
    const iName = document.getElementById('contact-name'); if (iName) iName.placeholder = dict.phContactName;
    const lEmail = document.getElementById('lbl-contact-email'); if (lEmail) lEmail.textContent = dict.lblContactEmail;
    const iEmail = document.getElementById('contact-email'); if (iEmail) iEmail.placeholder = dict.phContactEmail;
    const lPhone = document.getElementById('lbl-contact-phone'); if (lPhone) lPhone.textContent = dict.lblContactPhone;
    const iPhone = document.getElementById('contact-phone'); if (iPhone) iPhone.placeholder = dict.phContactPhone;
    const lSvc = document.getElementById('lbl-contact-service'); if (lSvc) lSvc.textContent = dict.lblContactService;
    const o0 = document.getElementById('opt-svc-0'); if (o0) o0.textContent = dict.optSvc0;
    const o1 = document.getElementById('opt-svc-1'); if (o1) o1.textContent = dict.optSvc1;
    const o2 = document.getElementById('opt-svc-2'); if (o2) o2.textContent = dict.optSvc2;
    const o3 = document.getElementById('opt-svc-3'); if (o3) o3.textContent = dict.optSvc3;
    const o4 = document.getElementById('opt-svc-4'); if (o4) o4.textContent = dict.optSvc4;
    const lSubj = document.getElementById('lbl-contact-subject'); if (lSubj) lSubj.textContent = dict.lblContactSubject;
    const iSubj = document.getElementById('contact-subject'); if (iSubj) iSubj.placeholder = dict.phContactSubject;
    const lMsg = document.getElementById('lbl-contact-message'); if (lMsg) lMsg.textContent = dict.lblContactMessage;
    const iMsg = document.getElementById('contact-message'); if (iMsg) iMsg.placeholder = dict.phContactMessage;
    const btnSub = document.getElementById('btn-submit-contact'); if (btnSub) btnSub.textContent = dict.btnSubmitContact;

    // Footer
    const foot1 = document.getElementById('footer-col1'); if (foot1) foot1.textContent = dict.footerCol1;
    const foot2 = document.getElementById('footer-col2'); if (foot2) foot2.textContent = dict.footerCol2;
    const footAdm = document.querySelector('.admin-link');
    if (footAdm) {
      footAdm.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg> ${dict.footerAdmin}`;
    }

    // Intermediate Sections Re-render
    if (cachedSiteData && Array.isArray(cachedSiteData.sections)) {
      renderDynamicSections(cachedSiteData.sections, cachedSiteData.icons || [], lang);
    }
  }

  function attachQuickGoLinks() {
    $('[data-go]').forEach(a => {
      a.addEventListener('click', e => {
        e.preventDefault();
        const tabIdx = +a.dataset.go;
        const tabs = $('[role=tab]');
        const panels = $('.panel');
        tabs.forEach((t, k) => t.setAttribute('aria-selected', k === tabIdx));
        panels.forEach((p, k) => p.classList.toggle('on', k === tabIdx));
        const svcSec = document.getElementById('services');
        if (svcSec) svcSec.scrollIntoView({ behavior: 'smooth' });
      });
    });
  }

  function applySiteData(data) {
    const { config, sections, icons } = data;
    if (!config) return;

    // 1. Page Title & Brand
    if (config.brand) {
      const b = config.brand;
      const pageTitle = `${b.name || 'ABENTRA'} ${b.subTagline || 'International'} — ${b.tagline || 'Bridging opportunities. Building tomorrow.'}`;
      document.title = pageTitle;

      const brandLogoEl = document.getElementById('brand-logo-container');
      if (brandLogoEl) {
        if (b.logoType === 'image' && b.logoImage) {
          brandLogoEl.innerHTML = `<img src="${b.logoImage}" alt="${b.name || 'ABENTRA'}" class="brand-img" style="height:28px;max-width:130px;object-fit:contain;margin-right:8px;border-radius:3px;" /><span id="nav-brand-name">${b.name || 'ABENTRA'}</span>`;
        } else {
          brandLogoEl.innerHTML = `<svg width="34" height="26"><use href="#mark"/></svg><span id="nav-brand-name">${b.name || 'ABENTRA'}</span>`;
        }
      }

      const navBrandName = document.getElementById('nav-brand-name');
      if (navBrandName && b.name) navBrandName.textContent = b.name;

      const heroArtName = document.getElementById('hero-art-name');
      if (heroArtName && b.name) heroArtName.textContent = b.name;

      const heroArtSub = document.getElementById('hero-art-sub');
      if (heroArtSub && b.subTagline) heroArtSub.textContent = b.subTagline;
    }

    // 2. Theme Colors & Gradients
    if (config.theme) {
      const root = document.documentElement;
      const t = config.theme;
      if (t.navy) root.style.setProperty('--navy', t.navy);
      if (t.navy2) root.style.setProperty('--navy2', t.navy2);
      if (t.navy3) root.style.setProperty('--navy3', t.navy3);
      if (t.gold) root.style.setProperty('--gold', t.gold);
      if (t.gold2) root.style.setProperty('--gold2', t.gold2);
      if (t.ink) root.style.setProperty('--ink', t.ink);
      if (t.mute) root.style.setProperty('--mute', t.mute);

      const grad = document.getElementById('g');
      if (grad) {
        grad.innerHTML = `<stop stop-color="${t.gold2 || '#f3d89f'}"/><stop offset="1" stop-color="${t.gold || '#b88a3b'}"/>`;
      }
    }

    // Apply language
    setSiteLanguage(activeLang);
  }

  function renderDynamicSections(sections, icons = [], lang = 'en') {
    const container = document.getElementById('dynamic-sections');
    if (!container) return;

    const iconMap = {};
    if (Array.isArray(icons)) {
      icons.forEach(ic => { iconMap[ic.id] = ic.svg; });
    }

    const dict = siteI18n[lang] || siteI18n['en'];
    const secDict = dict.sections || {};

    container.innerHTML = sections.map(sec => {
      const trans = secDict[sec.id] || {};
      const secTitle = trans.title || sec.title || '';
      const secTag = trans.tag || sec.tag || '';
      const secTagSub = trans.tagSub || sec.tagSub || '';
      const secSubtitle = trans.subtitle || sec.subtitle || '';

      let contentHtml = '';

      if (sec.type === 'stats') {
        const transItems = trans.items || [];
        contentHtml = `
          <div class="stats-grid">
            ${(sec.items || []).map((item, idx) => {
              const ti = transItems[idx] || {};
              return `
              <div class="stat-item rv">
                <div class="stat-num">${item.value || ''}</div>
                <div class="stat-title">${ti.label || item.label || ''}</div>
                <div class="stat-desc">${ti.description || item.description || ''}</div>
              </div>
              `;
            }).join('')}
          </div>
        `;
      } else if (sec.type === 'cards') {
        const transItems = trans.items || [];
        contentHtml = `
          <div class="gateway-grid">
            ${(sec.items || []).map((item, idx) => {
              const ti = transItems[idx] || {};
              const svgIcon = iconMap[item.icon] || `
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
                  <circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>
                </svg>`;
              return `
                <div class="gateway-card rv">
                  <div class="gateway-icon">${svgIcon}</div>
                  <h4>${ti.title || item.title || ''}</h4>
                  <p>${ti.description || item.description || ''}</p>
                </div>
              `;
            }).join('')}
          </div>
        `;
      } else if (sec.type === 'process') {
        const transItems = trans.items || [];
        contentHtml = `
          <div class="process-grid">
            ${(sec.items || []).map((item, idx) => {
              const ti = transItems[idx] || {};
              return `
              <div class="process-step rv">
                <span class="step-num">${item.step || ''}</span>
                <h4>${ti.title || item.title || ''}</h4>
                <p>${ti.description || item.description || ''}</p>
              </div>
              `;
            }).join('')}
          </div>
        `;
      } else if (sec.type === 'faq') {
        const transItems = trans.items || [];
        contentHtml = `
          <div class="faq-list rv">
            ${(sec.items || []).map((item, idx) => {
              const ti = transItems[idx] || {};
              return `
              <div class="faq-item ${idx === 0 ? 'active' : ''}">
                <button class="faq-question" type="button">
                  <span>${ti.q || item.q}</span>
                  <span class="faq-icon">+</span>
                </button>
                <div class="faq-answer">
                  <p>${ti.a || item.a}</p>
                </div>
              </div>
              `;
            }).join('')}
          </div>
        `;
      } else if (sec.customHtml) {
        contentHtml = `<div class="custom-sec-content rv">${sec.customHtml}</div>`;
      }

      return `
        <section id="${sec.anchor || sec.id}" class="dynamic-sec alt" data-track-id="${sec.id}">
          <div class="wrap">
            <div class="tag rv">${secTag}<i>${secTagSub}</i></div>
            <h2 class="rv">${secTitle}</h2>
            ${secSubtitle ? `<p class="lead rv" style="color:var(--mute);max-width:700px">${secSubtitle}</p>` : ''}
            ${contentHtml}
          </div>
        </section>
      `;
    }).join('');

    // Re-observe reveal elements for newly injected sections
    setupIntersectionReveals();
    setupFaqToggles();
  }

  function setupIntersectionReveals() {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(x => {
        if (x.isIntersecting) {
          x.target.classList.add('in');
          io.unobserve(x.target);
        }
      });
    }, { threshold: 0.12 });

    $('.rv:not(.in)').forEach(el => io.observe(el));
  }

  function setupFaqToggles() {
    $('.faq-question').forEach(btn => {
      btn.onclick = () => {
        const item = btn.closest('.faq-item');
        if (item) {
          item.classList.toggle('active');
        }
      };
    });
  }

  function initScrollEffects() {
    setupIntersectionReveals();

    // Scroll spy for navigation
    const links = $('#links a');
    const sections = links.map(a => document.querySelector(a.getAttribute('href'))).filter(Boolean);

    const spy = new IntersectionObserver((entries) => {
      entries.forEach(x => {
        if (x.isIntersecting) {
          links.forEach(l => l.classList.toggle('on', l.getAttribute('href') === '#' + x.target.id));
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });

    sections.forEach(s => spy.observe(s));

    // Progress bar + floating rail
    const pg = document.getElementById('prog');
    window.addEventListener('scroll', () => {
      if (pg) {
        pg.style.width = (scrollY / (document.documentElement.scrollHeight - innerHeight) * 100) + '%';
      }
    }, { passive: true });

    const rl = $('.rail a');
    if (rl.length > 0) {
      sections.forEach(s => {
        new IntersectionObserver((entries) => {
          entries.forEach(x => {
            if (x.isIntersecting) {
              rl.forEach(l => l.classList.toggle('on', l.getAttribute('href') === '#' + x.target.id));
            }
          });
        }, { rootMargin: '-45% 0px -50% 0px' }).observe(s);
      });
    }

    // Mobile menu toggle
    const m = document.getElementById('menu');
    const ul = document.getElementById('links');
    if (m && ul) {
      m.onclick = () => {
        const isOpen = ul.classList.toggle('open');
        m.setAttribute('aria-expanded', isOpen);
      };
      links.forEach(l => l.addEventListener('click', () => {
        ul.classList.remove('open');
        m.setAttribute('aria-expanded', 'false');
      }));
    }

    // Copy to clipboard buttons
    $('.cp').forEach(b => {
      b.onclick = () => {
        try { navigator.clipboard.writeText(b.dataset.c); } catch (e) {}
        const orig = b.textContent;
        const copiedTxt = (siteI18n[activeLang] || siteI18n['en']).btnCopied || 'Copied!';
        b.textContent = copiedTxt;
        setTimeout(() => b.textContent = orig, 1600);
      };
    });
  }

  function initParallaxAndTilt() {
    // Hero glow and parallax
    const hero = document.querySelector('.hero');
    const art = document.querySelector('.logo-art');
    if (hero) {
      hero.addEventListener('pointermove', e => {
        const r = hero.getBoundingClientRect();
        const x = e.clientX - r.left;
        const y = e.clientY - r.top;
        hero.style.setProperty('--mx', x + 'px');
        hero.style.setProperty('--my', y + 'px');
        if (art) {
          art.style.transform = `translate(${((x / r.width - 0.5) * -16)}px, ${((y / r.height - 0.5) * -16)}px)`;
        }
      });
    }

    // Card 3D tilt
    $('.card').forEach(c => {
      c.addEventListener('pointermove', e => {
        const r = c.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width - 0.5;
        const y = (e.clientY - r.top) / r.height - 0.5;
        c.style.transform = `perspective(700px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg) translateY(-4px)`;
      });
      c.addEventListener('pointerleave', () => {
        c.style.transform = '';
      });
    });
  }

  function initTabsAndNavigation() {
    const tabs = $('[role=tab]');
    const panels = $('.panel');

    function show(i) {
      tabs.forEach((t, k) => t.setAttribute('aria-selected', k === i));
      panels.forEach((p, k) => p.classList.toggle('on', k === i));
    }

    tabs.forEach((t, i) => {
      t.onclick = () => show(i);
      t.onkeydown = e => {
        if (e.key === 'ArrowRight') {
          show((i + 1) % tabs.length);
          tabs[(i + 1) % tabs.length].focus();
        }
        if (e.key === 'ArrowLeft') {
          show((i + tabs.length - 1) % tabs.length);
          tabs[(i + tabs.length - 1) % tabs.length].focus();
        }
      };
    });

    attachQuickGoLinks();
  }

  function initContactForm() {
    const form = document.getElementById('portal-contact-form');
    const statusBox = document.getElementById('form-status-msg');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = form.querySelector('button[type="submit"]');
      const origBtnText = submitBtn.innerHTML;
      const dict = siteI18n[activeLang] || siteI18n['en'];

      submitBtn.disabled = true;
      submitBtn.innerHTML = dict.transmitting || 'Transmitting...';
      if (statusBox) statusBox.style.display = 'none';

      const formData = {
        name: form.elements['name']?.value,
        email: form.elements['email']?.value,
        phone: form.elements['phone']?.value,
        service: form.elements['service']?.value,
        subject: form.elements['subject']?.value,
        message: form.elements['message']?.value
      };

      try {
        const res = await fetch('/api/contact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData)
        });

        const result = await res.json();
        if (res.ok) {
          if (statusBox) {
            statusBox.className = 'form-status success';
            statusBox.innerHTML = activeLang === 'tr' ? 'İletişim talebiniz başarıyla iletildi! En kısa sürede yanıtlanacaktır.' : (result.message || 'Your inquiry has been successfully sent!');
            statusBox.style.display = 'block';
          }
          form.reset();
        } else {
          throw new Error(result.error || (activeLang === 'tr' ? 'Mesaj iletilemedi.' : 'Failed to transmit message.'));
        }
      } catch (err) {
        if (statusBox) {
          statusBox.className = 'form-status error';
          statusBox.innerHTML = err.message || (activeLang === 'tr' ? 'İletim hatası. Lütfen tekrar deneyin veya doğrudan e-posta gönderin.' : 'Transmission error. Please try again or email directly.');
          statusBox.style.display = 'block';
        }
      } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = origBtnText;
      }
    });
  }
});
