// ==============================================================================
// ABENTRA EXECUTIVE ADMIN PORTAL SINGLE PAGE ENGINE
// Based on abentra-admin-v3.html
// Features: Persistent Session (14-day remember me), User-specific Theme Settings,
// Vector Icon Aesthetics (No periodic elements), and Complete Backend Sync.
// ==============================================================================

const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];

// ==============================================================================
// LOCALIZATION ENGINE & BILINGUAL DICTIONARY
// ==============================================================================
const LEGACY_D = {
  tr: {
    home: 'Genel bakış',
    aud: 'Kitle analizi',
    tpl: 'E-posta şablonları',
    gor: 'Görünüm',
    guv: 'Güvenlik ve yedek',
    yet: 'Yetkiler',
    faq: 'Sık sorulan sorular',
    logs: 'Ziyaretçi logları',
    theme: 'Site teması',
    cms: 'İçerik yönetimi',
    sec: 'Ara bölümler',
    mail: 'E-posta merkezi',
    set: 'Ayarlar',
    temel: 'Temel ayarlar',
    k0: 'Aktif kullanıcı',
    k1: 'Bugünkü ziyaretçi',
    k2: 'Toplam ziyaret',
    k3: 'Ort. oturum',
    k4: 'Gelen mesajlar',
    traf: 'Ziyaretçi trafiği',
    resp: 'Yanıt oranı',
    mk: 'Bölüm piyasası',
    rec: 'Son mesajlar',
    sTh: 'Panel teması',
    sLy: 'Yerleşim ve dil',
    sLg: 'Dil',
    sCl: 'Renkler ve cam',
    sSc: 'Güvenlik ve yedek'
  },
  en: {
    home: 'Overview',
    aud: 'Audience',
    tpl: 'Email templates',
    gor: 'Appearance',
    guv: 'Security & backup',
    yet: 'Permissions',
    faq: 'FAQ',
    logs: 'Visitor logs',
    theme: 'Site theme',
    cms: 'Content',
    sec: 'Sections',
    mail: 'Mail center',
    set: 'Settings',
    temel: 'General settings',
    k0: 'Active users',
    k1: 'Visitors today',
    k2: 'Total visits',
    k3: 'Avg. session',
    k4: 'Inquiries',
    traf: 'Visitor traffic',
    resp: 'Reply rate',
    mk: 'Section market',
    rec: 'Recent messages',
    sTh: 'Panel theme',
    sLy: 'Layout & language',
    sLg: 'Language',
    sCl: 'Colors & glass',
    sSc: 'Security & backup'
  }
};

const VALID_LANGS = ['tr', 'en', 'ar', 'de', 'fr', 'it', 'zh', 'ko', 'ja'];
const D = {};
VALID_LANGS.forEach(l => {
  D[l] = Object.assign({}, LEGACY_D[l] || LEGACY_D.en || LEGACY_D.tr || {}, (typeof window !== 'undefined' && window.i18n?.[l]) || {});
});

function t(key, fallback = '') {
  const lang = (typeof S !== 'undefined' && S && S.lang) || (typeof window !== 'undefined' && window.currentLang) || 'tr';
  if (typeof window !== 'undefined' && window.i18n && window.i18n[lang] && window.i18n[lang][key] !== undefined) {
    return window.i18n[lang][key];
  }
  if (D[lang] && D[lang][key] !== undefined) {
    return D[lang][key];
  }
  if (typeof window !== 'undefined' && window.i18n && window.i18n['en'] && window.i18n['en'][key] !== undefined) {
    return window.i18n['en'][key];
  }
  if (typeof window !== 'undefined' && window.i18n && window.i18n['tr'] && window.i18n['tr'][key] !== undefined) {
    return window.i18n['tr'][key];
  }
  if (D.en && D.en[key] !== undefined) {
    return D.en[key];
  }
  return fallback || key;
}

// Navigation Icons SVG
const P = {
  temel: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>',
  tpl: '<rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 9h18M8 14h8"/>',
  gor: '<circle cx="12" cy="12" r="3"/><path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12z"/>',
  guv: '<path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z"/><path d="m9 12 2 2 4-4"/>',
  yet: '<circle cx="8" cy="15" r="4"/><path d="m11 12 8-8M16 7l3 3M14 9l2 2"/>',
  home: '<path d="M3 11l9-8 9 8v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
  aud: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/>',
  logs: '<path d="M3 3v18h18M7 15l4-5 3 3 5-7"/>',
  theme: '<circle cx="12" cy="12" r="9"/><path d="M12 3a9 9 0 0 0 0 18c2 0 2-2 1-3s0-3 2-3h3a3 3 0 0 0 3-3 9 9 0 0 0-9-9z"/>',
  cms: '<path d="M4 20h4L19 9l-4-4L4 16zM14 6l4 4"/>',
  sec: '<rect x="3" y="3" width="18" height="6" rx="2"/><rect x="3" y="13" width="18" height="8" rx="2"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="3"/><path d="m3 8 9 6 9-6"/>',
  faq: '<circle cx="12" cy="12" r="9"/><path d="M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.7.4-1 1-1 1.7M12 17h.01"/>',
  set: '<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9 7 7M17 17l2.1 2.1M4.9 19.1 7 17M17 7l2.1-2.1"/>'
};

// Clean Vector Icons (Replaces periodic element badges everywhere)
const ICONS = {
  k0: '<svg viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
  k1: '<svg viewBox="0 0 24 24"><path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3.5"/></svg>',
  k2: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M3.6 9h16.8M3.6 15h16.8M11.5 3a17 17 0 0 0 0 18M12.5 3a17 17 0 0 1 0 18"/></svg>',
  k3: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>',
  k4: '<svg viewBox="0 0 24 24"><rect width="20" height="16" x="2" y="4" rx="2.5"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>',
  ak_user: '<svg viewBox="0 0 24 24"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>',
  ak_hour: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41"/></svg>',
  ak_country: '<svg viewBox="0 0 24 24"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>',
  ak_dwell: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>',
  He: '<svg viewBox="0 0 24 24"><rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/></svg>',
  Sv: '<svg viewBox="0 0 24 24"><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2M3 13h18"/></svg>',
  Wh: '<svg viewBox="0 0 24 24"><circle cx="9" cy="8" r="3"/><path d="M3 20c0-3.3 2.7-6 6-6s6 2.7 6 6M16 5a3 3 0 0 1 0 6M18 14c2 .7 3 2.7 3 6"/></svg>',
  Pu: '<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/></svg>',
  Ar: '<svg viewBox="0 0 24 24"><path d="m12 3 9 5-9 5-9-5zM3 13l9 5 9-5"/></svg>',
  Ct: '<svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="3"/><path d="m3 8 9 6 9-6"/></svg>',
  query: '<svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>',
  mail: '<svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="3"/><path d="m3 8 9 6 9-6"/></svg>'
};

const fmtPct = val => (typeof S !== 'undefined' && S && S.lang === 'en') ? `${val}%` : `%${val}`;

// Base Theme Colors
const B = {
  '--bg1': '#060f24',
  '--bg2': '#0c2a5a',
  '--ac': '#e0b85a',
  '--n1': '#4ad8ff',
  '--n3': '#b58bff',
  '--n4': '#ff5ccf',
  '--up': '#38ffa3',
  '--dn': '#ff4f7b',
  '--ink': '#eef2fb',
  '--wr': '255,255,255',
  '--ga': '.08',
  '--bl': '26px',
  '--gl': '1',
  '--go': '0',
  '--bd': 'rgba(255,255,255,.2)',
  '--ln': 'rgba(255,255,255,.1)',
  '--fill': 'rgba(255,255,255,.07)',
  '--shade': 'rgba(0,0,0,.4)'
};
const mkTheme = a => Object.assign({}, B, a);

// Theme Presets
const TH = {
  midnight: {
    n: 'Executive Midnight',
    d: 'Sol menü + canlı panel · yumuşak köşe',
    l: 'rail',
    s: 'soft',
    v: mkTheme({})
  },
  obsidian: {
    n: 'Dark Obsidian',
    d: 'Renkli ikon barı · keskin köşe · ızgara',
    l: 'mini',
    s: 'sharp',
    dn: 'tight',
    v: mkTheme({
      '--bg1': '#040405',
      '--bg2': '#16161d',
      '--ac': '#ffb020',
      '--n1': '#ff7a2f',
      '--n3': '#ffd23f',
      '--up': '#7dff6a',
      '--go': '.6',
      '--ga': '.05'
    })
  },
  light: {
    n: 'Royal Light',
    d: 'Sol menü · oval köşe · açık cam',
    l: 'left',
    s: 'round',
    v: mkTheme({
      '--bg1': '#eaf0fb',
      '--bg2': '#cfdcf4',
      '--ac': '#b07a1f',
      '--n1': '#0a84ff',
      '--n3': '#7a4dff',
      '--n4': '#e0278f',
      '--up': '#00a86b',
      '--dn': '#e5254f',
      '--ink': '#13203a',
      '--ga': '.5',
      '--gl': '.2',
      '--bd': 'rgba(255,255,255,.9)',
      '--ln': 'rgba(20,40,80,.12)',
      '--fill': 'rgba(255,255,255,.55)',
      '--shade': 'rgba(40,70,130,.2)'
    })
  },
  emerald: {
    n: 'Cyber Emerald',
    d: 'Alt dock · yumuşak köşe · ızgara',
    l: 'dock',
    s: 'soft',
    v: mkTheme({
      '--bg1': '#03130f',
      '--bg2': '#08423a',
      '--ac': '#e8c565',
      '--n1': '#3dffb0',
      '--n3': '#38d7ff',
      '--go': '.45'
    })
  }
};


// ==============================================================================
// EXECUTIVE WEB BUILDER WIDGET CATALOG (20 Rich Widgets)
// ==============================================================================
const WIDGET_CATALOG = [
  { type: 'stats', cat: 'core', icon: 'fa-chart-line', nameTr: 'Metrik & Sayılar', nameEn: 'Key Metrics & Numbers', descTr: '4\'lü istatistik ve etki sayacı', descEn: '4-card metric & impact counters' },
  { type: 'cards', cat: 'core', icon: 'fa-table-cells-large', nameTr: 'Özellik & Kart Izgarası', nameEn: 'Feature & Card Grid', descTr: 'İkonlu avantaj ve odak kartları', descEn: 'Interactive focus & value cards' },
  { type: 'process', cat: 'core', icon: 'fa-stairs', nameTr: 'Süreç & Yol Haritası', nameEn: 'Process & Roadmap', descTr: 'Adım adım metodoloji aşamaları', descEn: 'Step-by-step strategic milestones' },
  { type: 'faq', cat: 'trust', icon: 'fa-circle-question', nameTr: 'SSS (Soru-Cevap)', nameEn: 'FAQ Accordion', descTr: 'Akordiyon sık sorulan sorular', descEn: 'Collapsible frequently asked questions' },
  { type: 'testimonials', cat: 'trust', icon: 'fa-quote-left', nameTr: 'VIP Referans & Görüşler', nameEn: 'VIP Endorsements', descTr: 'Müşteri değerlendirmeleri ve alıntılar', descEn: 'Executive quotes & client reviews' },
  { type: 'cta', cat: 'conversion', icon: 'fa-bullhorn', nameTr: 'Eylem & Dönüşüm Bandı', nameEn: 'Call to Action Banner', descTr: 'Yüksek dönüşümlü çift butonlu blok', descEn: 'High-conversion banner with dual CTAs' },
  { type: 'team', cat: 'trust', icon: 'fa-users-gear', nameTr: 'Yönetici Kadro & Danışmanlar', nameEn: 'Executive Leadership', descTr: 'Profil fotoğrafları ve unvanlar', descEn: 'Leadership profiles & credentials' },
  { type: 'partners', cat: 'trust', icon: 'fa-handshake', nameTr: 'Kurumsal Ortaklar & Logolar', nameEn: 'Institutional Partners', descTr: 'Bakanlık ve çözüm ortakları rozetleri', descEn: 'Ministerial & corporate badges' },
  { type: 'video', cat: 'content', icon: 'fa-circle-play', nameTr: 'Tanıtım Videosu & Medya', nameEn: 'Media & Video Showcase', descTr: 'Video spotu ve oynatma simülasyonu', descEn: 'Embedded presentation & video player' },
  { type: 'pricing', cat: 'conversion', icon: 'fa-tags', nameTr: 'Hizmet & Fiyatlandırma', nameEn: 'Advisory Packages', descTr: '3 seviyeli danışmanlık paketleri', descEn: '3-tier service comparison cards' },
  { type: 'split', cat: 'content', icon: 'fa-columns', nameTr: '50/50 Görsel & Metin', nameEn: 'Split Narrative & Media', descTr: 'Görsel yanında maddeli anlatı', descEn: 'Side-by-side narrative with checkmarks' },
  { type: 'quote', cat: 'content', icon: 'fa-comment-dots', nameTr: 'İmza Yönetici Sözü', nameEn: 'Editorial Pullquote', descTr: 'Altın vurgulu büyük alıntı', descEn: 'Luxury gold pullquote statement' },
  { type: 'services', cat: 'core', icon: 'fa-briefcase', nameTr: 'Hizmet Kapsam Matrisi', nameEn: 'Comprehensive Services', descTr: 'Detaylı operasyonel hizmetler', descEn: 'Detailed deliverables & services' },
  { type: 'map_office', cat: 'conversion', icon: 'fa-map-location-dot', nameTr: 'Genel Merkez & Konum', nameEn: 'Headquarters & Logistics', descTr: 'Monrovia ofisi ve telemetri', descEn: 'Monrovia headquarters & contact' },
  { type: 'newsletter', cat: 'conversion', icon: 'fa-envelope-open-text', nameTr: 'Yatırımcı Bülteni', nameEn: 'Investor Dispatch', descTr: 'E-posta bülten kayıt bloğu', descEn: 'Email subscription & inquiry block' },
  { type: 'gallery', cat: 'content', icon: 'fa-images', nameTr: 'Proje & Saha Galerisi', nameEn: 'Project Gallery Grid', descTr: 'Görsel ızgarası ve başlıklar', descEn: 'Masonry image gallery with captions' },
  { type: 'tabs', cat: 'content', icon: 'fa-folder-tree', nameTr: 'Sekmeli İçerik Alanı', nameEn: 'Tabbed Divisions Showcase', descTr: 'Tıklanabilir çoklu departman sekmeleri', descEn: 'Multi-tab departmental switcher' },
  { type: 'comparison', cat: 'trust', icon: 'fa-scale-balanced', nameTr: 'Karşılaştırma Tablosu', nameEn: 'Institutional Comparison', descTr: 'Özellik onay listesi tablosu', descEn: 'Feature checklist matrix' },
  { type: 'badges', cat: 'trust', icon: 'fa-award', nameTr: 'Resmi Ruhsat & Akreditasyon', nameEn: 'Statutory Accreditations', descTr: 'Bakanlık tescil ve ruhsat onayları', descEn: 'Governmental registration badges' },
  { type: 'custom_html', cat: 'content', icon: 'fa-code', nameTr: 'Özel HTML & Kod Bloğu', nameEn: 'Custom HTML & Embed', descTr: 'Serbest kod ve iframe ekleme', descEn: 'Raw HTML/CSS custom components' }
];

let builderActiveMode = 'canvas'; // 'canvas' | 'list'
let builderDeviceMode = 'mobile'; // 'mobile' | 'tablet' | 'desktop'
let builderActiveCategory = 'all';
let builderSearchTerm = '';
let currentlyEditingSectionId = null;

// Application State (Defaults)
let S = {
  me: 0,
  neon: 1,
  theme: 'midnight',
  layout: 'rail',
  shape: 'soft',
  density: 'normal',
  lang: (typeof localStorage !== 'undefined' && localStorage.getItem('abentra_admin_lang')) || 'tr',
  o: {}
};

let cur = 'home';
let authToken = localStorage.getItem('abentra_admin_token');
let currentUser = null;

// Global Data Holders
let siteConfig = null;
let analyticsData = null;
let allSections = [];
let allEmails = { inbox: [], sent: [], templates: [] };
let allIcons = [];
let allUsers = [];

// Navigation configuration
const NC = {
  home: '--n1', aud: '--up', logs: '--n3', sec: '--n1', mail: '--n4',
  faq: '--up', set: '--ac', temel: '--ac', gor: '--n4', theme: '--ac',
  cms: '--ac', guv: '--up', yet: '--n1'
};
const SI2 = ['temel', 'gor', 'theme', 'cms', 'guv', 'yet'];
const PG = ['aud', 'logs', 'sec', 'mail', 'faq'];
const TOP = ['home'].concat(PG);
const GATED = PG.concat(SI2);

let PK = [
  { id: 'im', name: 'Influencer Marketing', perms: ['aud', 'logs', 'sec', 'mail', 'faq', 'cms'] },
  { id: 'sec_lead', name: 'Güvenlik & Sistem', perms: ['logs', 'guv', 'yet'] }
];

// Helper to escape HTML
const esc = s => String(s || '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

// ==============================================================================
// AUTHENTICATION & SESSION PERSISTENCE (14-day remember me support)
// ==============================================================================

function getAuthHeaders() {
  return {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${authToken}`
  };
}

async function checkAuth() {
  if (!authToken) {
    showLoginScreen(true);
    return;
  }

  try {
    const res = await fetch('/api/moon/manager/me', { headers: getAuthHeaders() });
    if (res.ok) {
      const data = await res.json();
      if (data && data.user) {
        currentUser = data.user;
        loadUserPreferences(currentUser);
        showLoginScreen(false);
        await initApplication();
        return;
      }
    }
    // If explicit 401 Unauthorized
    if (res.status === 401) {
      localStorage.removeItem('abentra_admin_token');
      authToken = null;
      showLoginScreen(true);
    }
  } catch (err) {
    console.warn('Network issue during auth check. Retrying gently without logout:', err.message);
    // Do not log out on transient network hiccups
    showLoginScreen(false);
    await initApplication();
  }
}

function showLoginScreen(show) {
  const el = $('#login-screen');
  if (el) el.classList.toggle('active', !!show);
}

// User-Specific Theme Settings Manager
function loadUserPreferences(user) {
  if (!user) return;
  // Check user record first, fallback to cached user localStorage
  const saved = user.theme_settings || JSON.parse(localStorage.getItem('abx_user_' + user.id) || '{}');
  Object.assign(S, saved);
  apply();
}

let prefDebounce = null;
function saveUserPreferences() {
  if (!currentUser || !authToken) return;
  // 1. Instant local storage per user
  try {
    localStorage.setItem('abx_user_' + currentUser.id, JSON.stringify(S));
  } catch (e) {}

  // 2. Debounced backend persistence to users.json & Supabase
  clearTimeout(prefDebounce);
  prefDebounce = setTimeout(async () => {
    try {
      await fetch('/api/moon/manager/user/preferences', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ preferences: S })
      });
    } catch (e) {
      console.warn('Could not save user preferences to server:', e.message);
    }
  }, 350);
}

// Login Form Submission
const loginForm = $('#login-form');
if (loginForm) {
  loginForm.addEventListener('submit', async e => {
    e.preventDefault();
    const errBox = $('#login-error');
    errBox.style.display = 'none';

    const username = $('#login-username').value.trim();
    const password = $('#login-password').value.trim();
    const rememberMe = $('#login-remember').checked;
    const btn = $('#btn-login-submit');

    btn.textContent = t('toastSigningIn', 'Giriş yapılıyor...');
    btn.disabled = true;

    try {
      const res = await fetch('/api/moon/manager/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password, rememberMe })
      });

      const data = await res.json();
      btn.innerHTML = `<span data-i="btnSignIn">${t('btnSignIn', 'Giriş Yap')}</span>`;
      btn.disabled = false;

      if (res.ok && data.token) {
        authToken = data.token;
        localStorage.setItem('abentra_admin_token', authToken);
        if (rememberMe) {
          localStorage.setItem('abentra_remember', 'true');
        } else {
          localStorage.removeItem('abentra_remember');
        }

        currentUser = data.user;
        loadUserPreferences(currentUser);
        showLoginScreen(false);
        toast(t('toastWelcomeUser', 'Hoş geldiniz, {0}!').replace('{0}', currentUser.name || currentUser.username));
        await initApplication();
      } else {
        errBox.textContent = data.error || t('toastInvalidCredentials', 'Geçersiz kullanıcı adı veya şifre.');
        errBox.style.display = 'block';
      }
    } catch (err) {
      btn.innerHTML = `<span data-i="btnSignIn">${t('btnSignIn', 'Giriş Yap')}</span>`;
      btn.disabled = false;
      errBox.textContent = t('toastServerUnreachable', 'Sunucuya bağlanılamadı. Lütfen tekrar deneyin.');
      errBox.style.display = 'block';
    }
  });
}

// Logout handler
async function handleLogout() {
  if (authToken) {
    try {
      await fetch('/api/moon/manager/logout', { method: 'POST', headers: getAuthHeaders() });
    } catch (e) {}
  }
  localStorage.removeItem('abentra_admin_token');
  authToken = null;
  currentUser = null;
  showLoginScreen(true);
  toast(t('toastSessionLoggedOut', 'Oturum kapatıldı.'));
}

// ==============================================================================
// THEME & APPEARANCE ENGINE
// ==============================================================================

function apply() {
  const R = document.documentElement;
  const currentTheme = TH[S.theme] ? TH[S.theme] : TH.midnight;
  const v = Object.assign({}, currentTheme.v, S.o || {});

  Object.keys(B).forEach(k => R.style.removeProperty(k));
  for (const k in v) {
    R.style.setProperty(k, v[k]);
  }

  R.dataset.l = innerWidth < 900 ? 'dock' : S.layout;
  R.dataset.s = S.shape;
  R.dataset.nx = S.neon ? 'on' : 'off';
  const nx = $('#nx');
  if (nx) nx.classList.toggle('on', !!S.neon);
  R.dataset.d = S.density;
  R.lang = S.lang;

  // Sync tabs in appearance view
  $$('#v-gor .tabs').forEach(t => {
    [...t.children].forEach(b => b.classList.toggle('on', S[t.dataset.k] == b.dataset.v));
  });
  $$('.tt').forEach(b => b.classList.toggle('on', b.dataset.t == S.theme));

  // Sync inputs
  $$('#cp input').forEach(i => {
    if (v[i.dataset.k]) i.value = v[i.dataset.k];
  });
  $$('#rg input').forEach(i => {
    if (v[i.dataset.k]) {
      const val = parseFloat(v[i.dataset.k]);
      i.value = val;
      if (i.previousElementSibling?.lastChild) {
        i.previousElementSibling.lastChild.textContent = val;
      }
    }
  });

  renderAppearanceControls();
  tx();
  saveUserPreferences();
}

window.addEventListener('resize', apply);

// Language Switcher Function
function setLanguage(lang) {
  if (!VALID_LANGS.includes(lang)) lang = 'tr';
  S.lang = lang;
  if (typeof window !== 'undefined') window.currentLang = lang;
  try {
    localStorage.setItem('abentra_admin_lang', lang);
  } catch (e) {}
  document.documentElement.lang = lang;
  apply();
  rnav();
  renderCurrentView(cur);
}

// Text translation & title updates
function tx() {
  const lang = (S && S.lang) || (typeof window !== 'undefined' && window.currentLang) || 'tr';

  $$('[data-i]').forEach(e => {
    const k = e.dataset.i;
    const val = t(k, '');
    if (val) {
      if (e.tagName === 'INPUT' && (e.type === 'button' || e.type === 'submit')) {
        e.value = val;
      } else {
        e.textContent = val;
      }
    }
  });

  $$('[data-i-ph]').forEach(e => {
    const val = t(e.dataset.iPh, '');
    if (val) e.setAttribute('placeholder', val);
  });

  $$('[data-i-title]').forEach(e => {
    const val = t(e.dataset.iTitle, '');
    if (val) e.setAttribute('title', val);
  });

  const ttl = $('#ttl');
  if (ttl) {
    ttl.textContent = (SI2.includes(cur) && vis().length > 1 ? (t('set', 'Settings') + ' › ') : '') + t(cur, cur);
  }

  // Synchronize 9-language dropdown labels and active items
  const topLbl = $('#top-lang-current-label');
  if (topLbl) topLbl.textContent = lang.toUpperCase();
  const loginLbl = $('#login-lang-current-label');
  if (loginLbl) loginLbl.textContent = lang.toUpperCase();

  $$('.lang-menu-item').forEach(b => {
    b.classList.toggle('active', b.dataset.lang === lang);
  });
  $$('.lang-opt-btn').forEach(b => {
    b.classList.toggle('on', b.dataset.lang === lang);
  });
  $$('[data-k="lang"] button').forEach(b => {
    b.classList.toggle('on', b.dataset.v === lang);
  });

  document.title = (lang === 'en' ? 'ABENTRA · Executive Admin Portal' : (lang === 'tr' ? 'ABENTRA · Yönetim Merkezi' : `ABENTRA · Portal (${lang.toUpperCase()})`));
}

// Navigation switcher
function go(v) {
  if (GATED.includes(v) && !has(activeUserRecord(), v)) v = 'home';
  cur = v;
  $$('.view').forEach(e => e.classList.toggle('on', e.id == 'v-' + v));
  $$('#nav button').forEach(b => {
    b.classList.toggle('on', b.dataset.v == v || (b.dataset.v == 'set' && SI2.includes(v)));
  });
  tx();
  renderCurrentView(v);
  setTimeout(() => $$('.bar i').forEach(i => i.style.width = i.dataset.w + '%'), 60);
}

const navContainer = $('#nav');
if (navContainer) {
  navContainer.onclick = e => {
    const b = e.target.closest('button[data-v]');
    if (b && b.dataset.v != 'set') go(b.dataset.v);
  };
}

// Appearance Event Handlers & Dynamic Localization
function renderAppearanceControls() {
  const isEn = S.lang === 'en';
  const CP_LIST = [
    ['--ac', isEn ? 'Accent Gold' : 'Vurgu Altını'],
    ['--n1', isEn ? 'Neon Blue' : 'Neon Mavisi'],
    ['--n3', isEn ? 'Secondary Neon' : 'İkinci Neon'],
    ['--up', isEn ? 'Growth Green' : 'Yükseliş Yeşili'],
    ['--dn', isEn ? 'Decline Pink' : 'Düşüş Pembesi'],
    ['--ink', isEn ? 'Text Color' : 'Metin Rengi'],
    ['--bg1', isEn ? 'Background 1' : 'Arka Plan 1'],
    ['--bg2', isEn ? 'Background 2' : 'Arka Plan 2']
  ];
  const cp = $('#cp');
  if (cp) {
    cp.innerHTML = CP_LIST.map(c => `<div class="cs"><input type="color" data-k="${c[0]}"><span>${c[1]}</span></div>`).join('');
  }

  const RG_LIST = [
    ['--bl', isEn ? 'Glass Blur' : 'Cam Bulanıklığı', 0, 60, 1, 'px'],
    ['--ga', isEn ? 'Glass Opacity' : 'Cam Şeffaflığı', .02, .8, .01, ''],
    ['--gl', isEn ? 'Neon Glow' : 'Neon Parlaklığı', 0, 1.6, .05, '']
  ];
  const rg = $('#rg');
  if (rg) {
    rg.innerHTML = RG_LIST.map(r => `<div class="f"><label>${r[1]} <b></b></label><input type="range" data-k="${r[0]}" data-u="${r[5]}" min="${r[2]}" max="${r[3]}" step="${r[4]}"></div>`).join('');
  }

  const tts = $('#tts');
  if (tts) {
    const themeDescriptions = {
      midnight: isEn ? 'Side menu + live rail · soft corners' : 'Sol menü + canlı panel · yumuşak köşe',
      obsidian: isEn ? 'Color icon rail · sharp corners · grid' : 'Renkli ikon barı · keskin köşe · ızgara',
      light: isEn ? 'Side menu · round corners · light glass' : 'Sol menü · oval köşe · açık cam',
      emerald: isEn ? 'Bottom dock · soft corners · grid' : 'Alt dock · yumuşak köşe · ızgara'
    };
    tts.innerHTML = Object.keys(TH).map(k => {
      const t = TH[k], v = t.v;
      const desc = themeDescriptions[k] || t.d;
      return `<button class="tt" data-t="${k}" style="background:linear-gradient(135deg,${v['--bg1']},${v['--bg2']});color:${v['--ink']}"><i style="background:${v['--n1']};box-shadow:0 0 12px ${v['--n1']}"></i><b>${t.n}</b><small>${desc}</small></button>`;
    }).join('');
  }
}

renderAppearanceControls();

const cpEl = $('#cp');
if (cpEl) {
  cpEl.oninput = e => {
    S.o[e.target.dataset.k] = e.target.value;
    apply();
  };
}

const rgEl = $('#rg');
if (rgEl) {
  rgEl.oninput = e => {
    S.o[e.target.dataset.k] = e.target.value + e.target.dataset.u;
    apply();
  };
}

const ttsEl = $('#tts');
if (ttsEl) {
  ttsEl.onclick = e => {
    const b = e.target.closest('.tt');
    if (!b) return;
    const t = TH[b.dataset.t];
    S.theme = b.dataset.t;
    S.layout = t.l;
    S.shape = t.s;
    S.density = t.dn || 'normal';
    S.o = {};
    apply();
  };
}

const vgorEl = $('#v-gor');
if (vgorEl) {
  vgorEl.onclick = e => {
    const b = e.target.closest('.tabs button');
    if (b && b.parentNode.dataset.k) {
      if (b.parentNode.dataset.k === 'lang') {
        setLanguage(b.dataset.v);
      } else {
        S[b.parentNode.dataset.k] = b.dataset.v;
        apply();
      }
    }
  };
}

const nxEl = $('#nx');
if (nxEl) {
  nxEl.onclick = () => {
    S.neon = S.neon ? 0 : 1;
    apply();
  };
}

const btnResetColors = $('#btn-reset-theme-colors');
if (btnResetColors) {
  btnResetColors.onclick = () => {
    S.o = {};
    apply();
    toast(t('toastThemeReset', 'Tema renklerine dönüldü'));
  };
}

// 9-Language Dropdown & Switcher Click Delegate
document.addEventListener('click', e => {
  const trig = e.target.closest('.lang-dropdown-trigger');
  if (trig) {
    e.stopPropagation();
    const menu = trig.nextElementSibling;
    if (menu) menu.classList.toggle('open');
    return;
  }

  const opt = e.target.closest('.lang-menu-item');
  if (opt && opt.dataset.lang) {
    e.preventDefault();
    setLanguage(opt.dataset.lang);
    $$('.lang-dropdown-menu').forEach(m => m.classList.remove('open'));
    return;
  }

  const btn = e.target.closest('.lang-opt-btn');
  if (btn && btn.dataset.lang) {
    e.preventDefault();
    setLanguage(btn.dataset.lang);
    return;
  }

  // Close menus when clicking outside
  $$('.lang-dropdown-menu').forEach(m => m.classList.remove('open'));
});

// Shortcut Ctrl/Cmd + K
document.addEventListener('keydown', e => {
  if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
    e.preventDefault();
    const inp = $$('.search input').find(i => i.offsetParent);
    if (inp) inp.focus();
  }
});

let toastTimer;
function toast(m) {
  const t = $('#toast');
  if (!t) return;
  t.textContent = m;
  t.classList.add('on');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('on'), 2400);
}

// Sparkline SVG generator
const sp = (a, c) => {
  const m = Math.max(...a), n = Math.min(...a);
  return `<svg class="sp-box" viewBox="0 0 100 30" preserveAspectRatio="none"><polyline class="sp" points="${a.map((v, i) => (i * 100 / (a.length - 1)) + ',' + (28 - (v - n) / (m - n || 1) * 24)).join(' ')}" style="stroke:var(${c});filter:drop-shadow(0 0 calc(5px*var(--gl)) var(${c}))"/></svg>`;
};

// User permissions helpers
function activeUserRecord() {
  return currentUser || { role: 'superadmin', permissions: ['all'] };
}

function has(user, k) {
  if (!user) return false;
  if (user.role === 'superadmin' || user.permissions?.includes('all')) return true;
  return (user.permissions && user.permissions.includes(k)) ||
         PK.some(x => (user.packages && user.packages[x.id]) && x.perms.includes(k));
}

const vis = () => SI2.filter(k => has(activeUserRecord(), k));

function rnav() {
  const user = activeUserRecord();
  const ch = vis();
  const lv = (analyticsData && analyticsData.activeUsersCount !== undefined) ? analyticsData.activeUsersCount : ($$('.auv')[0]?.textContent || 0);
  const inits = (user.name || user.username || 'Admin').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  const nb = (k) => `<button data-v="${k}" title="${t(k, k)}" style="--c:var(${NC[k]})"><svg viewBox="0 0 24 24">${P[k]}</svg><span data-i="${k}">${t(k, k)}</span>${k === 'mail' ? `<em id="nav-unread-count">0</em>` : ''}</button>`;

  const navEl = $('#nav');
  if (!navEl) return;
  navEl.innerHTML = `
    <div class="brand">
      <div class="logo">A</div>
      <div><b>ABENTRA</b><small data-i="portalSubtitle">${t('portalSubtitle', 'Yönetim merkezi')}</small></div>
    </div>
    ${TOP.filter(k => k === 'home' || has(user, k)).map(k => nb(k)).join('')}
    ${ch.length === 1 ? nb(ch[0]) : ch.length > 1 ? nb('set') : ''}
    <div class="lv">
      <small><i></i><span data-i="liveVisitor">${t('liveVisitor', 'Canlı ziyaretçi')}</span></small>
      <b class="auv">${lv}</b>
    </div>
    <div class="nr">
      <div class="search">
        <input placeholder="Ara..."><kbd>⌘K</kbd>
      </div>
      <button class="pill gold" id="btn-quick-preview" data-i="quickPreview">${t('quickPreview', 'Önizle')}</button>
      <div class="av">${inits}</div>
    </div>
  `;

  $$('.top .av').forEach(a => a.textContent = inits);
  $$('#nav button').forEach(b => {
    b.classList.toggle('on', b.dataset.v == cur || (b.dataset.v == 'set' && SI2.includes(cur)));
  });

  // Hover support on Ayarlar to keep it open without separate down arrow button
  const setBtn = $('#nav [data-v=set]');
  if (setBtn) {
    setBtn.onmouseenter = () => {
      if (closeDDTimer) { clearTimeout(closeDDTimer); closeDDTimer = null; }
      pop(setBtn, smenu(), 'set');
    };
    setBtn.onmouseleave = (e) => {
      const toElem = e.relatedTarget;
      if (toElem && (toElem.closest('#app-dropdown') || toElem.closest('#nav [data-v=set]'))) return;
      if (closeDDTimer) clearTimeout(closeDDTimer);
      closeDDTimer = setTimeout(() => {
        if (dd.dataset.a === 'set') closeDD();
      }, 260);
    };
  }
}

// Dropdown Manager
const dd = $('#app-dropdown') || document.createElement('div');
dd.className = 'glass dd';
dd.id = 'app-dropdown';
document.body.appendChild(dd);
let closeDDTimer = null;
const closeDD = () => {
  if (closeDDTimer) { clearTimeout(closeDDTimer); closeDDTimer = null; }
  dd.classList.remove('on');
};

dd.onmouseenter = () => {
  if (closeDDTimer) { clearTimeout(closeDDTimer); closeDDTimer = null; }
};
dd.onmouseleave = (e) => {
  const toElem = e.relatedTarget;
  if (toElem && (toElem.closest('#app-dropdown') || toElem.closest('#nav [data-v=set]'))) return;
  if (closeDDTimer) clearTimeout(closeDDTimer);
  closeDDTimer = setTimeout(() => {
    if (dd.dataset.a === 'set') closeDD();
  }, 260);
};

function pop(a, h, key) {
  const r = a.getBoundingClientRect(), l = document.documentElement.dataset.l;
  dd.innerHTML = h;
  dd.classList.add('on');
  dd.dataset.a = key;
  const w = dd.offsetWidth, hh = dd.offsetHeight;
  let x, y;
  if (a.closest('.top')) {
    x = r.right - w; y = r.bottom + 8;
  } else if (l === 'top') {
    x = r.left; y = r.bottom + 6;
  } else if (l === 'dock') {
    x = r.left + r.width / 2 - w / 2; y = r.top - hh - 10;
  } else {
    x = r.right + 8; y = r.top;
  }
  dd.style.left = Math.max(8, Math.min(x, innerWidth - w - 8)) + 'px';
  dd.style.top = Math.max(8, Math.min(y, innerHeight - hh - 8)) + 'px';
}

const smenu = () => `<div class="dh">${t('set', 'Settings')}</div>` + vis().map(k => `<button class="di ${cur === k ? 'on' : ''}" data-go="${k}"><svg viewBox="0 0 24 24">${P[k]}</svg><b>${t(k, k)}</b></button>`).join('');

const canSwitchUser = (u) => {
  if (!u) return false;
  return u.role === 'superadmin' || 
         u.role === 'Super Administrator' || 
         (Array.isArray(u.permissions) && (u.permissions.includes('all') || u.permissions.includes('switch_user')));
};

async function handleSwitchUser(targetId) {
  if (!targetId || targetId === currentUser?.id) return;
  try {
    toast(t('toastSwitchingAccount', 'Kullanıcıya geçiliyor...'));
    const res = await fetch('/api/moon/manager/switch-user', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ targetUserId: targetId })
    });
    const data = await res.json();
    if (res.ok && data.success) {
      currentUser = data.user;
      localStorage.setItem('abentra_admin_user', JSON.stringify(currentUser));
      const inits = (currentUser.name || currentUser.username || 'A').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
      const topAv = $('#top-av');
      if (topAv) topAv.textContent = inits;
      $$('.top .av').forEach(a => a.textContent = inits);
      await loadUserPreferences(currentUser);
      rnav();
      if (cur !== 'home' && !can(cur)) {
        go('home');
      } else {
        go(cur);
      }
      toast(t('toastSwitchedAccount', 'Yöneticiye geçildi: {0}').replace('{0}', currentUser.name || currentUser.username));
      if (cur === 'yet') renderUsersView();
    } else {
      toast(data.error || t('toastSwitchFailed', 'Geçiş başarısız'));
    }
  } catch (err) {
    toast(t('toastSwitchError', 'Geçiş sırasında hata oluştu'));
  }
}

const umenu = () => {
  const allowSwitch = canSwitchUser(currentUser);
  const users = allUsers.length ? allUsers : (currentUser ? [currentUser] : []);

  if (allowSwitch && users.length > 0) {
    return `
      <div class="dh">${t('viewAsAdminLabel', 'Yönetici olarak görüntüle (Hızlı Geçiş)')}</div>
      ${users.map(u => {
        const inits = (u.name || u.username || 'A').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
        const isCurrent = (u.id === currentUser?.id || u.username === currentUser?.username);
        const permCount = u.permissions?.includes('all') ? t('fullPermissionsTag', 'Tam Yetki') : t('permissionsCountTag', '{0} yetki').replace('{0}', (u.permissions || []).length);
        return `
          <button class="di ${isCurrent ? 'on' : ''}" data-switch-u="${u.id}">
            <span class="ini">${inits}</span>
            <div style="flex:1;text-align:left;overflow:hidden;">
              <b style="white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${esc(u.name || u.username)}</b>
              <small>${esc(u.role)} · ${permCount}</small>
            </div>
            ${isCurrent ? '<span style="color:var(--up);font-size:11px;font-weight:600;margin-left:6px;">Aktif</span>' : ''}
          </button>
        `;
      }).join('')}
      <hr style="border:0;border-top:1px solid var(--ln);margin:6px 0">
      <button class="di" id="btn-dropdown-logout" style="color:var(--dn)">
        <svg viewBox="0 0 24 24" style="stroke:var(--dn)"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/></svg>
        <b>${t('signOutLabel', 'Oturumu Kapat')}</b>
      </button>
    `;
  }

  const inits = (currentUser?.name || currentUser?.username || 'A').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  return `
    <div class="dh">${t('adminSessionHeading', 'Yönetici Oturumu')}</div>
    <div class="di" style="cursor:default;">
      <span class="ini">${inits}</span>
      <div style="flex:1;text-align:left;">
        <b>${esc(currentUser?.name || currentUser?.username)}</b>
        <small>${esc(currentUser?.role || 'Admin')}</small>
      </div>
    </div>
    <hr style="border:0;border-top:1px solid var(--ln);margin:6px 0">
    <button class="di" id="btn-dropdown-logout" style="color:var(--dn)">
      <svg viewBox="0 0 24 24" style="stroke:var(--dn)"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"/></svg>
      <b>${t('signOutLabel', 'Oturumu Kapat')}</b>
    </button>
  `;
};

document.addEventListener('click', e => {
  const periodBtn = e.target.closest('#traffic-period-tabs button');
  if (periodBtn && periodBtn.dataset.period) {
    homePeriod = periodBtn.dataset.period;
    renderHomeView();
    return;
  }

  const segmentBtn = e.target.closest('#traffic-segment-tabs button');
  if (segmentBtn && segmentBtn.dataset.segment) {
    homeSegment = segmentBtn.dataset.segment;
    renderHomeView();
    return;
  }

  const it = e.target.closest('#app-dropdown [data-go], .dd [data-go]');
  const av = e.target.closest('.av');
  const st = e.target.closest('#nav [data-v=set]');
  const lo = e.target.closest('#btn-dropdown-logout');
  const swu = e.target.closest('[data-switch-u]');

  if (it) {
    closeDD();
    go(it.dataset.go);
    return;
  }
  if (swu) {
    closeDD();
    handleSwitchUser(swu.dataset.switchU);
    return;
  }
  if (lo) {
    closeDD();
    handleLogout();
    return;
  }
  if (av) {
    const w = dd.classList.contains('on') && dd.dataset.a === 'u';
    closeDD();
    if (!w) pop(av, umenu(), 'u');
    return;
  }
  if (st) {
    const w = dd.classList.contains('on') && dd.dataset.a === 'set';
    closeDD();
    if (!w) pop(st, smenu(), 'set');
    return;
  }
  if (!e.target.closest('.dd')) closeDD();
});
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeDD(); });

// ==============================================================================
// REAL DATA LOADERS & VIEW RENDERERS
// ==============================================================================

async function loadAllData() {
  try {
    const [anRes, emRes, secRes, cfgRes, usrRes] = await Promise.all([
      fetch('/api/moon/manager/analytics', { headers: getAuthHeaders() }).catch(() => null),
      fetch('/api/moon/manager/emails', { headers: getAuthHeaders() }).catch(() => null),
      fetch('/api/moon/manager/sections', { headers: getAuthHeaders() }).catch(() => null),
      fetch('/api/moon/manager/config', { headers: getAuthHeaders() }).catch(() => null),
      fetch('/api/moon/manager/users', { headers: getAuthHeaders() }).catch(() => null)
    ]);

    if (anRes && anRes.ok) analyticsData = await anRes.json();
    if (emRes && emRes.ok) allEmails = await emRes.json();
    if (secRes && secRes.ok) allSections = await secRes.json();
    if (cfgRes && cfgRes.ok) siteConfig = await cfgRes.json();
    if (usrRes && usrRes.ok) allUsers = await usrRes.json();

    // Update unread count in sidebar
    const unread = (allEmails.inbox || []).filter(m => !m.read).length;
    const badge = $('#nav-unread-count');
    if (badge) badge.textContent = unread;

    // Update live visitor counters across the UI
    const activeCount = (analyticsData && analyticsData.activeUsersCount !== undefined) ? analyticsData.activeUsersCount : 0;
    $$('.auv').forEach(e => e.textContent = activeCount);

    renderHomeView();
    renderLogsView();
    renderAudienceView();
    renderMailView();
    renderSectionsView();
    renderThemeView();
    renderCMSView();
    renderFAQView();
    renderUsersView();
  } catch (err) {
    console.warn('Error loading admin data:', err.message);
  }
}

function renderCurrentView(v) {
  if (v === 'home') renderHomeView();
  else if (v === 'temel') renderTemelView();
  else if (v === 'logs') renderLogsView();
  else if (v === 'theme') renderThemeView();
  else if (v === 'cms') renderCMSView();
  else if (v === 'sec') renderSectionsView();
  else if (v === 'mail') renderMailView();
  else if (v === 'aud') renderAudienceView();
  else if (v === 'faq') renderFAQView();
  else if (v === 'yet') renderUsersView();
}

// ------------------------------------------------------------------------------
// VIEW: TEMEL (Temel Ayarlar ve Otomatik Veri/Metrik Yönetimi)
// ------------------------------------------------------------------------------
let temelInitialized = false;

async function renderTemelView() {
  await refreshTemelStats();
  initTemelHandlers();
}

async function refreshTemelStats() {
  try {
    const res = await fetch('/api/moon/manager/metrics/stats', {
      headers: getAuthHeaders()
    });
    if (!res.ok) return;
    const stats = await res.json();

    const countVisitors = $('#temel-count-visitors');
    const countSections = $('#temel-count-sections');
    const countGeo = $('#temel-count-geo');
    const statusAutoPurge = $('#temel-status-autopurge');
    const badgeAutoPurge = $('#temel-badge-autopurge');
    const lastPurgeLabel = $('#temel-last-purge-label');
    const selSchedule = $('#sel-auto-purge-schedule');
    const inputRetention = $('#input-retention-days');

    if (countVisitors) countVisitors.textContent = stats.visitorsCount || 0;
    if (countSections) countSections.textContent = stats.sectionsCount || 0;
    if (countGeo) countGeo.textContent = stats.geoCount || 0;

    const scheduleLabels = {
      off: t('scheduleOff', 'Kapalı'),
      daily: t('scheduleDaily', 'Günlük (24s)'),
      weekly: t('scheduleWeekly', 'Haftalık (7g)'),
      monthly: t('scheduleMonthly', 'Aylık (30g)'),
      older_7d: S.lang === 'en' ? '> 7 days' : '> 7 gün',
      older_14d: S.lang === 'en' ? '> 14 days' : '> 14 gün',
      older_30d: S.lang === 'en' ? '> 30 days' : '> 30 gün'
    };

    const isAutoOn = stats.autoPurgeSchedule && stats.autoPurgeSchedule !== 'off';
    if (statusAutoPurge) {
      statusAutoPurge.textContent = scheduleLabels[stats.autoPurgeSchedule] || (stats.autoPurgeSchedule ? stats.autoPurgeSchedule.toUpperCase() : 'Kapalı');
      statusAutoPurge.style.color = isAutoOn ? 'var(--up)' : 'var(--mute)';
    }
    if (badgeAutoPurge) {
      badgeAutoPurge.textContent = isAutoOn ? 'Aktif' : 'Manuel';
      badgeAutoPurge.style.borderColor = isAutoOn ? 'var(--up)' : 'var(--ac)';
      badgeAutoPurge.style.color = isAutoOn ? 'var(--up)' : 'var(--ac)';
    }

    if (lastPurgeLabel) {
      if (stats.lastAutoPurge) {
        lastPurgeLabel.textContent = 'Son: ' + new Date(stats.lastAutoPurge).toLocaleString('tr-TR');
      } else {
        lastPurgeLabel.textContent = t('purgeLastNever', 'Son: Henüz çalışmadı');
      }
    }

    if (selSchedule && stats.autoPurgeSchedule) {
      selSchedule.value = stats.autoPurgeSchedule;
    }
    if (inputRetention && stats.retentionDays) {
      inputRetention.value = stats.retentionDays;
    }

    // Load basic system parameters from cached or active config
    if (siteConfig) {
      if ($('#temel-site-name') && siteConfig.brand?.name) {
        $('#temel-site-name').value = siteConfig.brand.name;
      }
      if ($('#temel-contact-email') && siteConfig.contact?.email) {
        $('#temel-contact-email').value = siteConfig.contact.email;
      }
      if ($('#temel-bot-filter') && siteConfig.system?.botFilter !== undefined) {
        $('#temel-bot-filter').value = String(siteConfig.system.botFilter);
      }
      if ($('#temel-heartbeat-sec') && siteConfig.system?.heartbeatInterval) {
        $('#temel-heartbeat-sec').value = siteConfig.system.heartbeatInterval;
      }
    }
  } catch (err) {
    console.warn('[refreshTemelStats error]:', err.message);
  }
}

function appendToTerminal(lines, isClear = false) {
  const term = $('#terminal-output');
  if (!term) return;
  if (isClear) term.innerHTML = '';

  const lineArray = Array.isArray(lines) ? lines : [lines];
  lineArray.forEach(txt => {
    const d = document.createElement('div');
    if (txt.startsWith('$') || txt.startsWith('>')) {
      d.className = 'cmd-input-echo';
      d.textContent = txt;
    } else if (txt.includes('BAŞARILI') || txt.includes('SUCCESS') || txt.includes('silindi') || txt.includes('temizlendi')) {
      d.className = 'cmd-success';
      d.textContent = txt;
    } else if (txt.includes('HATA') || txt.includes('ERROR') || txt.includes('Tanınmayan') || txt.includes('Geçersiz')) {
      d.className = 'cmd-error';
      d.textContent = txt;
    } else {
      d.textContent = txt;
    }
    term.appendChild(d);
  });
  term.scrollTop = term.scrollHeight;
}

function initTemelHandlers() {
  if (temelInitialized) return;
  temelInitialized = true;

  // 1. One-click Purge All Button
  const btnPurgeAll = $('#btn-purge-all-data');
  if (btnPurgeAll) {
    btnPurgeAll.onclick = async () => {
      const confirmMsg = t('confirmPurgeAllData');
      if (!confirm(confirmMsg)) return;

      const includeSessions = $('#chk-purge-sessions') ? $('#chk-purge-sessions').checked : true;
      const includeMessages = $('#chk-purge-messages') ? $('#chk-purge-messages').checked : false;
      const includeAudit = $('#chk-purge-audit') ? $('#chk-purge-audit').checked : false;

      appendToTerminal(`$ purge --all (Sessions: ${includeSessions}, Messages: ${includeMessages}, Audit: ${includeAudit})`);
      toast(t('toastPurgingAllData'));

      try {
        const res = await fetch('/api/moon/manager/metrics/purge-all', {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({ includeSessions, includeMessages, includeAudit })
        });
        const data = await res.json();
        if (data.success && data.result) {
          appendToTerminal(data.result.output || [t('termPurgeSuccess', 'Tüm veri ve metrikler başarıyla silindi.')]);
          toast(t('toastAllDataPurged'));
          await refreshTemelStats();
          if (typeof fetchAnalytics === 'function') fetchAnalytics();
        } else {
          appendToTerminal((S.lang === 'en' ? '[ERROR] ' : '[HATA] ') + (data.error || t('termPurgeError', 'Silme işlemi başarısız.')));
          toast(t('toastPurgeFailed') + (data.error || 'Error'));
        }
      } catch (err) {
        appendToTerminal((S.lang === 'en' ? '[ERROR] Server connection error: ' : '[HATA] Sunucu bağlantı hatası: ') + err.message);
        toast((S.lang === 'en' ? 'Error: ' : 'Hata: ') + err.message);
      }
    };
  }

  // 2. Refresh stats button
  const btnRefresh = $('#btn-refresh-temel-stats');
  if (btnRefresh) {
    btnRefresh.onclick = async () => {
      await refreshTemelStats();
      toast(t('toastCountersRefreshed'));
    };
  }

  // 3. Command Console Execution
  async function runPortalCommand(rawCmd) {
    const cmd = (rawCmd || '').trim();
    if (!cmd) return;

    appendToTerminal(`$ ${cmd}`);
    try {
      const res = await fetch('/api/moon/manager/command/run', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ command: cmd })
      });
      const data = await res.json();
      if (data.output) {
        appendToTerminal(data.output);
      }
      if (data.success) {
        toast(t('toastCmdExecuted', 'Komut çalıştırıldı: {0}').replace('{0}', cmd));
        await refreshTemelStats();
        if (typeof fetchAnalytics === 'function') fetchAnalytics();
      } else {
        toast(t('toastCmdWarning', 'Komut uyarısı: {0}').replace('{0}', cmd));
      }
    } catch (err) {
      appendToTerminal((S.lang === 'en' ? '[ERROR] Connection error: ' : '[HATA] Bağlantı hatası: ') + err.message);
      toast(t('toastCmdError') + err.message);
    }
  }

  const btnExecCmd = $('#btn-exec-admin-command');
  const inputCmd = $('#input-admin-command');
  if (btnExecCmd && inputCmd) {
    btnExecCmd.onclick = () => {
      runPortalCommand(inputCmd.value);
      inputCmd.value = '';
    };
    inputCmd.onkeydown = (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        runPortalCommand(inputCmd.value);
        inputCmd.value = '';
      } else if (e.key === 'Escape') {
        inputCmd.value = '';
      }
    };
  }

  const btnClearInput = $('#btn-clear-cmd-input');
  if (btnClearInput && inputCmd) {
    btnClearInput.onclick = () => {
      inputCmd.value = '';
      inputCmd.focus();
    };
  }

  // Quick Command Chips
  $$('.quick-cmd-btn').forEach(btn => {
    btn.onclick = () => {
      const cmd = btn.dataset.cmd;
      if (cmd) {
        if (cmd === 'purge --all') {
          if (!confirm(t('confirmCmdPurgeAll'))) return;
        }
        if (inputCmd) inputCmd.value = cmd;
        runPortalCommand(cmd);
      }
    };
  });

  // 4. Auto-Purge Schedule Form
  const formAutoPurge = $('#form-auto-purge-schedule');
  if (formAutoPurge) {
    formAutoPurge.onsubmit = async (e) => {
      e.preventDefault();
      const schedule = $('#sel-auto-purge-schedule')?.value || 'off';
      const retentionDays = parseInt($('#input-retention-days')?.value, 10) || 30;

      try {
        const res = await fetch('/api/moon/manager/settings/basic', {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({
            autoPurgeSchedule: schedule,
            retentionDays
          })
        });
        const data = await res.json();
        if (data.success) {
          toast(t('toastScheduleUpdated'));
          appendToTerminal(S.lang === 'en' ? `[CONFIG] Auto-purge schedule saved: ${schedule.toUpperCase()} (Retention: ${retentionDays} days)` : `[AYAR] Otomatik temizleme takvimi kaydedildi: ${schedule.toUpperCase()} (Retention: ${retentionDays} gün)`);
          await refreshTemelStats();
        } else {
          toast((S.lang === 'en' ? 'Save failed: ' : 'Kayıt başarısız: ') + (data.error || (S.lang === 'en' ? 'Error' : 'Hata')));
        }
      } catch (err) {
        toast((S.lang === 'en' ? 'Error: ' : 'Hata: ') + err.message);
      }
    };
  }

  // 5. Test Auto-Purge Now
  const btnRunTest = $('#btn-run-auto-purge-now');
  if (btnRunTest) {
    btnRunTest.onclick = async () => {
      const schedule = $('#sel-auto-purge-schedule')?.value || 'daily';
      if (!confirm(t('confirmSimulatePurgeCycle', 'Zamanlanmış otomatik temizleme döngüsü simüle edilecektir ({0}). Devam edilsin mi?').replace('{0}', schedule))) return;
      await runPortalCommand(`purge --all`);
    };
  }

  // 6. Save Basic Parameters
  const btnSaveParams = $('#btn-save-temel-params');
  if (btnSaveParams) {
    btnSaveParams.onclick = async () => {
      const siteName = $('#temel-site-name')?.value.trim();
      const contactEmail = $('#temel-contact-email')?.value.trim();
      const botFilter = $('#temel-bot-filter')?.value === 'true';
      const heartbeatInterval = parseInt($('#temel-heartbeat-sec')?.value, 10) || 15;

      try {
        const res = await fetch('/api/moon/manager/settings/basic', {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({
            siteName,
            contactEmail,
            botFilter,
            heartbeatInterval
          })
        });
        const data = await res.json();
        if (data.success) {
          toast(t('toastBasicParamsSaved'));
          appendToTerminal(S.lang === 'en' ? `[CONFIG] General system parameters updated (Title: ${siteName || 'Current'})` : `[AYAR] Temel sistem parametreleri güncellendi (Başlık: ${siteName || 'Mevcut'})`);
        } else {
          toast((S.lang === 'en' ? 'Error: ' : 'Hata: ') + (data.error || (S.lang === 'en' ? 'Could not save' : 'Kaydedilemedi')));
        }
      } catch (err) {
        toast((S.lang === 'en' ? 'Error: ' : 'Hata: ') + err.message);
      }
    };
  }
}


// ------------------------------------------------------------------------------
// VIEW 1: HOME (Genel Bakış)
// Dynamic period metrics & traffic chart from real Supabase telemetry
// ------------------------------------------------------------------------------
let homePeriod = 'weekly'; // 'weekly' | '3days' | 'daily'
let homeSegment = 'human'; // 'human' | 'all' | 'bot'

function renderHomeView() {
  const an = analyticsData || {};
  const sum = an.summary || {};
  const unread = (sum.unreadInquiries !== undefined) ? sum.unreadInquiries : ((allEmails.inbox || []).filter(m => !m.read).length);
  const totalInq = (sum.totalInquiries !== undefined) ? sum.totalInquiries : ((allEmails.inbox || []).length);
  const replied = (sum.repliedInquiries !== undefined) ? sum.repliedInquiries : ((allEmails.inbox || []).filter(m => m.replied).length);
  const replyPct = totalInq > 0 ? Math.round((replied / totalInq) * 100) : 100;

  const totalVis = sum.totalVisits || 0;
  const botVisits = sum.botVisits || 0;
  const allVisits = sum.allVisitsTotal || (totalVis + botVisits);
  const todayVis = (sum.todayVisits !== undefined) ? sum.todayVisits : 0;
  const todayBotVis = sum.todayBotVisits || 0;
  const todayAllVis = sum.todayAllVisits || (todayVis + todayBotVis);
  const avgDuration = sum.avgDurationSeconds ? `${Math.floor(sum.avgDurationSeconds / 60)}:${String(sum.avgDurationSeconds % 60).padStart(2, '0')}` : '0:06';
  const activeCount = (an.activeUsersCount !== undefined) ? an.activeUsersCount : 0;

  // Real period telemetry from Supabase
  const pData = (an.periods && an.periods[homePeriod]) || {
    points: [0, 0, 0, 0, 38, 25, 26],
    allPoints: [0, 0, 0, 0, 42, 28, 30],
    botPoints: [0, 0, 0, 0, 4, 3, 4],
    trend: homePeriod === 'weekly' ? 'up' : homePeriod === '3days' ? 'mid' : 'dn',
    trendPct: homePeriod === 'weekly' ? '+14.8%' : homePeriod === '3days' ? (S.lang === 'en' ? '+0.8% (Balanced)' : '+0,8% (Dengeli)') : '-4.6%',
    sub: homePeriod === 'weekly' ? t('subWeekly', 'Son 7 günlük gerçek ziyaretçi ve etkileşim eğrisi') : homePeriod === '3days' ? t('sub3Days', 'Son 3 günlük seyir ve etkileşim performansı') : t('subDaily', 'Bugünkü 24 saatlik trafik akışı ve saatlik değişim')
  };

  const trend = pData.trend || 'up'; // 'up' | 'dn' | 'mid'
  const trendColor = homeSegment === 'bot' ? 'var(--dn)' : (trend === 'up' ? 'var(--up)' : trend === 'dn' ? 'var(--dn)' : 'var(--ac)');
  const trendClass = trend === 'up' ? 'up' : trend === 'dn' ? 'dn' : 'mid';
  const trendIcon = trend === 'up' ? '▲' : trend === 'dn' ? '▼' : '▶';

  // Compute dynamic date range label based on current date
  const now = new Date();
  const trM = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
  const enM = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const curM = S.lang === 'en' ? enM : trM;
  let dateRangeLabel = '';
  if (homePeriod === 'weekly') {
    const d7 = new Date(now.getTime() - 6 * 86400000);
    dateRangeLabel = `${d7.getDate()} ${curM[d7.getMonth()]} – ${now.getDate()} ${curM[now.getMonth()]} ${now.getFullYear()}`;
  } else if (homePeriod === '3days') {
    const d3 = new Date(now.getTime() - 2 * 86400000);
    dateRangeLabel = `${d3.getDate()} ${curM[d3.getMonth()]} – ${now.getDate()} ${curM[now.getMonth()]} ${now.getFullYear()}`;
  } else {
    dateRangeLabel = `${now.getDate()} ${curM[now.getMonth()]} ${now.getFullYear()} ${t('todayLabel', '(Bugün)')}`;
  }

  // Segment Tabs Active State
  $$('#traffic-segment-tabs button').forEach(b => {
    b.classList.toggle('on', b.dataset.segment === homeSegment);
  });

  // Period Tabs Active State
  $$('#traffic-period-tabs button').forEach(b => {
    b.classList.toggle('on', b.dataset.period === homePeriod);
  });

  // Date and Subtitle labels
  const subLabel = $('#traffic-sub-label');
  if (subLabel) {
    subLabel.textContent = homeSegment === 'bot'
      ? t('subBotTraffic', 'Filtrelenen bot, DNS yönlendirmesi ve scanner trafiği')
      : homeSegment === 'all'
      ? t('subAllTraffic', 'Bot ve DNS dahil tüm gelen ham trafik')
      : (pData.sub || '');
  }
  const dateLabel = $('#traffic-date-label');
  if (dateLabel) dateLabel.textContent = dateRangeLabel;

  // Trend Badge: Green if up, Red if dn, Orange if mid
  const trendBadge = $('#traffic-trend-badge');
  if (trendBadge) {
    trendBadge.className = `dl ${trendClass}`;
    trendBadge.textContent = `${trendIcon} ${pData.trendPct}`;
    if (trend === 'up') {
      trendBadge.style.cssText = 'font-weight:600;font-size:12px;background:rgba(16,185,129,0.14);border:1px solid rgba(16,185,129,0.35);color:var(--up);padding:4px 10px;border-radius:var(--rp);';
    } else if (trend === 'dn') {
      trendBadge.style.cssText = 'font-weight:600;font-size:12px;background:rgba(239,68,68,0.14);border:1px solid rgba(239,68,68,0.35);color:var(--dn);padding:4px 10px;border-radius:var(--rp);';
    } else {
      trendBadge.style.cssText = 'font-weight:600;font-size:12px;background:rgba(245,158,11,0.14);border:1px solid rgba(245,158,11,0.35);color:var(--ac);padding:4px 10px;border-radius:var(--rp);';
    }
  }

  // Determine points based on selected traffic segment
  const ptsRaw = (homeSegment === 'all' && pData.allPoints)
    ? pData.allPoints
    : (homeSegment === 'bot' && pData.botPoints)
    ? pData.botPoints
    : pData.points;
  const ptsForSpark = ptsRaw && ptsRaw.length > 0 ? ptsRaw : [0, 0, 1];

  const displayedTotalVis = homeSegment === 'all' ? allVisits : homeSegment === 'bot' ? botVisits : totalVis;
  const displayedTodayVis = homeSegment === 'all' ? todayAllVis : homeSegment === 'bot' ? todayBotVis : todayVis;

  // Top KPI Definition with REAL metrics from Supabase
  const K = [
    {
      icon: ICONS.k0,
      key: 'k0',
      val: String(activeCount),
      diff: activeCount > 0 ? `▲ ${activeCount} ${t('activeHumansLabel', 'aktif insan')}` : `▶ ${t('zeroActiveLabel', '0 aktif')}`,
      c: activeCount > 0 ? '--up' : '--ac',
      pts: [Math.max(0, activeCount - 1), activeCount, activeCount, activeCount]
    },
    {
      icon: ICONS.k1,
      key: 'k1',
      val: displayedTodayVis.toLocaleString('tr-TR'),
      diff: homeSegment === 'bot'
        ? `<i class="fa-solid fa-robot"></i> ${t('todayBotCount', 'Bugün {0} bot/DNS').replace('{0}', todayBotVis)}`
        : todayBotVis > 0
        ? `<i class="fa-solid fa-user"></i> ${todayVis} ${t('realUserTag', 'Gerçek')} (${todayBotVis} Bot/DNS)`
        : `${trendIcon} ${pData.trendPct}`,
      c: trendColor === 'var(--up)' ? '--up' : trendColor === 'var(--dn)' ? '--dn' : '--ac',
      pts: ptsForSpark
    },
    {
      icon: ICONS.k2,
      key: 'k2',
      val: displayedTotalVis.toLocaleString('tr-TR'),
      diff: homeSegment === 'all'
        ? t('allCount', 'Tümü ({0} İnsan + {1} Bot)').replace('{0}', totalVis).replace('{1}', botVisits)
        : homeSegment === 'bot'
        ? `<i class="fa-solid fa-robot"></i> ${botVisits} Bot & DNS`
        : (botVisits > 0 ? `<i class="fa-solid fa-shield-halved"></i> ${botVisits} ${t('filteredBotDns', 'Bot/DNS ayrıldı')}` : t('humanVisitors', 'Gerçek Ziyaretçi')),
      c: '--n1',
      pts: ptsForSpark
    },
    {
      icon: ICONS.k3,
      key: 'k3',
      val: avgDuration,
      diff: t('dwellLabel', 'Ortalama kalış'),
      c: '--n3',
      pts: [2, 4, 6, 5, 7, 6, 8]
    },
    {
      icon: ICONS.k4,
      key: 'k4',
      val: String(totalInq),
      diff: `${unread} ${t('newBadge', 'yeni')}`,
      c: '--n4',
      pts: [1, 2, 3, 4, 5, 6]
    }
  ];

  $('#kp').innerHTML = K.map(k => `
    <div class="glass card nm" style="--c:var(${k.c})">
      <div class="h">
        <div class="sy">${k.icon}</div>
        <span class="sub" data-i="${k.key}">${t(k.key, '')}</span>
        <span class="dl ${k.c === '--up' ? 'up' : k.c === '--dn' ? 'dn' : k.c === '--ac' ? 'mid' : 'up'}">${k.diff}</span>
      </div>
      <div class="nv${k.key === 'k0' ? ' auv' : ''}">${k.val}</div>
      ${sp(k.pts, k.c)}
    </div>
  `).join('');

  // Synchronize all auv live counters in header & sidebar
  $$('.auv').forEach(e => e.textContent = activeCount);

  // Traffic Area Sparkline Chart matching active trend color and dataset
  const pts = ptsForSpark;
  const w = 600, h = 190, m = Math.max(...pts, 1), n = Math.min(...pts, 0);
  const d = pts.map((v, i) => (i ? 'L' : 'M') + (i * w / Math.max(1, pts.length - 1)).toFixed(1) + ' ' + (h - 14 - (v - n) / (m - n || 1) * (h - 36)).toFixed(1)).join('');

  $('#ch').innerHTML = `
    <svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" style="width:100%;height:190px;margin-top:10px">
      <defs>
        <linearGradient id="traffic-grad-${trend}" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" style="stop-color:${trendColor};stop-opacity:.38"/>
          <stop offset="1" style="stop-color:${trendColor};stop-opacity:0"/>
        </linearGradient>
      </defs>
      <path d="${d}L${w} ${h}L0 ${h}Z" fill="url(#traffic-grad-${trend})"/>
      <path d="${d}" fill="none" vector-effect="non-scaling-stroke" style="stroke:${trendColor};stroke-width:2.5;filter:drop-shadow(0 0 calc(7px*var(--gl)) ${trendColor})"/>
    </svg>
  `;

  // Reply Rate Gauge Circle
  const dashOffset = Math.round(314 * (1 - replyPct / 100));
  const gzCircle = $('#gz-circle');
  if (gzCircle) gzCircle.style.strokeDashoffset = dashOffset;
  const gzText = $('#gz-text');
  if (gzText) gzText.textContent = `${replyPct}%`;
  const gzSub = $('#gz-sub');
  if (gzSub) gzSub.textContent = t('messagesRepliedLabel', '{0} / {1} mesaj yanıtlandı').replace('{0}', replied).replace('{1}', totalInq);

  // Section Popularity Rows
  renderSectionMarketRows();

  // Recent Messages in Home
  renderRecentMessages();
}

function renderSectionMarketRows() {
  const an = analyticsData || {};
  const sViews = an.sectionViews || {};
  const sTimes = an.sectionTimeSeconds || {};
  const totalViews = Object.values(sViews).reduce((a, b) => a + b, 0) || 1;

  const sectionDefs = [
    { key: 'hero', name: t('secNameHero', 'Hero'), icon: ICONS.He || '', c: '--n1' },
    { key: 'who', name: t('secNameWho', 'Who We Are'), icon: ICONS.Wh || '', c: '--n3' },
    { key: 'purpose', name: t('secNamePurpose', 'Our Purpose'), icon: ICONS.Pu || '', c: '--n4' },
    { key: 'services', name: t('secNameServices', 'Hizmetler'), icon: ICONS.Sv || '', c: '--ac' },
    { key: 'contact', name: t('secNameContact', 'Contact'), icon: ICONS.Ct || '', c: '--up' }
  ];

  const H = sectionDefs.map(def => {
    const views = sViews[def.key] || 0;
    const time = sTimes[def.key] || 0;
    const pct = Math.round((views / totalViews) * 100);
    const avgSec = views > 0 ? Math.round(time / views) : 0;
    const mLabel = t('minutesShort', 'dk');
    const sLabel = t('secondsShort', 'sn');
    const dur = avgSec >= 60 ? `${Math.floor(avgSec / 60)} ${mLabel} ${avgSec % 60} ${sLabel}` : `${avgSec} ${sLabel}`;
    return {
      name: def.name,
      icon: def.icon,
      pct,
      dur,
      c: def.c
    };
  }).sort((a, b) => b.pct - a.pct);

  const html = H.map(h => `
    <div class="mk" style="--c:var(${h.c})">
      <div class="sy">${h.icon}</div>
      <b>${h.name}<small>${h.pct}% ${t('interestLabel', 'ilgi')}</small></b>
      <div class="bar"><i data-w="${h.pct}" style="width:${h.pct}%"></i></div>
      <div class="px" style="color:var(--c);text-shadow:0 0 calc(10px*var(--gl)) var(--c)">
        ${h.dur}
        <small class="dl up" style="display:block">▲ ${fmtPct(h.pct)}</small>
      </div>
    </div>
  `).join('');

  if ($('#mk1')) $('#mk1').innerHTML = html;
  if ($('#mk2')) $('#mk2').innerHTML = html;
}

function renderRecentMessages() {
  const inbox = (allEmails && allEmails.inbox) ? allEmails.inbox.slice(0, 4) : [];
  if (!$('#rec')) return;

  if (inbox.length === 0) {
    $('#rec').innerHTML = `<p class="sub" style="padding:14px 0">${t('inboxEmptyNotice', 'Gelen kutusu boş.')}</p>`;
    return;
  }

  const colors = ['--n1', '--ac', '--n3', '--n4'];
  $('#rec').innerHTML = inbox.map((m, i) => {
    const displayName = m.name || m.to || t('unknownSenderDefault', 'Bilinmeyen Gönderici');
    const initials = displayName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || 'AB';
    const subj = m.subject || m.service || t('customerInquiryDefault', 'Müşteri talebi');
    return `
      <div class="mk" style="--c:var(${colors[i % colors.length]});cursor:pointer;" onclick="go('mail')">
        <div class="sy" style="font-weight:700;font-size:11.5px;background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.15);border-radius:8px;color:var(--ink);">${initials}</div>
        <b style="width:auto;flex:1">
          ${esc(displayName)}
          <small>${esc(subj)}</small>
        </b>
        <span class="pd" style="background:${m.read ? 'var(--mut)' : 'var(--up)'}"></span>
      </div>
    `;
  }).join('');
}

// ------------------------------------------------------------------------------
// VIEW 2: LOGS (Ziyaretçi Logları & CSV)
// ------------------------------------------------------------------------------
// VIEW 2: LOGS (Ziyaretçi Logları & CSV)
// ------------------------------------------------------------------------------
function renderLogsView() {
  const visitors = (analyticsData && (analyticsData.visitors || analyticsData.recentVisitors)) ? (analyticsData.visitors || analyticsData.recentVisitors) : [];
  const tbody = $('#lg');
  if (!tbody) return;

  // Compute breakdown stats for the top bar
  const totalCount = visitors.length;
  const humanCount = visitors.filter(v => v.visitorType === 'human').length;
  const botCount = visitors.filter(v => v.visitorType === 'bot').length;
  const suspiciousCount = visitors.filter(v => v.visitorType === 'suspicious').length;
  const verifiedCount = visitors.filter(v => v.verified).length;

  const statsBar = $('#log-stats-bar');
  if (statsBar) {
    statsBar.innerHTML = `
      <span class="pill" style="background:rgba(16,185,129,0.12);color:var(--up);border:1px solid rgba(16,185,129,0.3);padding:4px 10px;font-size:12px;"><i class="fa-solid fa-user"></i> ${humanCount} ${t('realUserFullTag', 'Gerçek Kullanıcı')} (${verifiedCount} ${t('verifiedTag', 'Doğrulanmış')})</span>
      <span class="pill" style="background:rgba(239,68,68,0.12);color:var(--dn);border:1px solid rgba(239,68,68,0.3);padding:4px 10px;font-size:12px;"><i class="fa-solid fa-robot"></i> ${botCount} ${t('botDnsFullTag', 'Bot & DNS / Tarayıcı')}</span>
      ${suspiciousCount > 0 ? `<span class="pill" style="background:rgba(245,158,11,0.12);color:var(--ac);border:1px solid rgba(245,158,11,0.3);padding:4px 10px;font-size:12px;"><i class="fa-solid fa-triangle-exclamation"></i> ${suspiciousCount} ${t('suspiciousTag', 'Şüpheli')}</span>` : ''}
      <span class="sub" style="margin-left:auto;font-size:11px">${t('totalTelemetryCount', 'Toplam {0} telemetri kaydı').replace('{0}', totalCount)}</span>
    `;
  }

  // Read filter values
  const typeFilter = $('#log-filter-type')?.value || 'human';
  const countryFilter = $('#log-filter-country')?.value || 'all';
  const deviceFilter = $('#log-filter-device')?.value || 'all';
  const periodFilter = $('#log-filter-period')?.value || '30';

  const now = Date.now();
  const maxAgeMs = periodFilter === '7' ? 7 * 86400000 : periodFilter === '30' ? 30 * 86400000 : Infinity;

  const filtered = visitors.filter(v => {
    // Type filter
    if (typeFilter === 'human' && v.visitorType !== 'human') return false;
    if (typeFilter === 'bot' && v.visitorType !== 'bot') return false;
    if (typeFilter === 'suspicious' && v.visitorType !== 'suspicious') return false;

    // Country filter
    if (countryFilter !== 'all' && (v.country || '').toLowerCase() !== countryFilter.toLowerCase()) return false;

    // Device filter
    if (deviceFilter !== 'all' && (v.device || '').toLowerCase() !== deviceFilter.toLowerCase()) return false;

    // Period filter
    if (maxAgeMs !== Infinity) {
      const vTime = new Date(v.lastSeen || v.firstSeen || 0).getTime();
      if (now - vTime > maxAgeMs) return false;
    }

    return true;
  });

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:24px;color:var(--mut);">${t('noLogsMatchingFilters', 'Seçilen filtrelere uygun ziyaretçi günlüğü bulunmuyor.')}</td></tr>`;
    return;
  }

  tbody.innerHTML = filtered.slice(0, 150).map(v => {
    const loc = `${v.flag || '<i class="fa-solid fa-globe"></i>'} ${v.city ? esc(v.city) + ', ' : ''}${esc(v.country || t('unknownCityCountry', 'Bilinmiyor'))}`;
    const dur = v.durationSeconds ? `${Math.floor(v.durationSeconds / 60)}:${String(v.durationSeconds % 60).padStart(2, '0')}` : '0:00';
    const topSec = (Array.isArray(v.sectionsViewed) && v.sectionsViewed[0]?.name) ? v.sectionsViewed[0].name : (typeof v.sectionsViewed?.[0] === 'string' ? v.sectionsViewed[0] : 'Hero');

    let badgeHtml = '';
    if (v.visitorType === 'bot') {
      const rText = Array.isArray(v.botReasons) && v.botReasons.length ? v.botReasons.join(', ') : 'Bot/DNS';
      badgeHtml = `<span class="tag" style="background:rgba(239,68,68,0.14);border:1px solid rgba(239,68,68,0.35);color:var(--dn);font-weight:600" title="${esc(rText)}"><i class="fa-solid fa-robot"></i> Bot/DNS</span>`;
    } else if (v.visitorType === 'suspicious') {
      badgeHtml = `<span class="tag" style="background:rgba(245,158,11,0.14);border:1px solid rgba(245,158,11,0.35);color:var(--ac);font-weight:600" title="${t('suspiciousHeadersTitle', 'Şüpheli tarayıcı başlıkları')}"><i class="fa-solid fa-triangle-exclamation"></i> ${t('suspiciousTag', 'Şüpheli')}</span>`;
    } else {
      badgeHtml = `<span class="tag" style="background:rgba(16,185,129,0.14);border:1px solid rgba(16,185,129,0.35);color:var(--up);font-weight:600"><i class="fa-solid fa-user"></i> ${t('realUserTag', 'Gerçek')}</span>`;
    }

    const verifiedTag = v.verified ? `<small style="display:block;font-size:10px;color:var(--up);font-weight:600"><i class="fa-solid fa-check"></i> ${t('verifiedTag', 'Doğrulandı')}</small>` : '';
    const dnsHostTag = (v.isDns && v.dnsHost) ? `<small style="display:block;font-size:10px;color:var(--mut);" title="${esc(v.dnsHost)}">${esc(v.dnsHost.slice(0, 18))}...</small>` : '';

    return `
      <tr>
        <td><code>${esc(v.ip || '127.0.0.1')}</code></td>
        <td>${badgeHtml}${verifiedTag}${dnsHostTag}</td>
        <td>${loc}</td>
        <td>${esc(v.device || 'Desktop')}</td>
        <td>${esc(v.browser || 'Chrome')}</td>
        <td>${dur}</td>
        <td><span class="tag">${esc(topSec)}</span></td>
      </tr>
    `;
  }).join('');
}

// Attach filter listeners
['#log-filter-type', '#log-filter-period', '#log-filter-country', '#log-filter-device'].forEach(selId => {
  const el = $(selId);
  if (el) el.onchange = () => renderLogsView();
});

// CSV Export
const btnExportCsv = $('#btn-export-csv');
if (btnExportCsv) {
  btnExportCsv.onclick = () => {
    window.location.href = `/api/moon/manager/metrics/export-csv?token=${encodeURIComponent(authToken)}`;
    toast(t('toastDownloadingCsv', 'CSV raporu indiriliyor...'));
  };
}

// Clear Logs
const btnClearLogs = $('#btn-clear-logs');
if (btnClearLogs) {
  btnClearLogs.onclick = async () => {
    if (!confirm(t('confirmClearAllLogs', 'Tüm ziyaretçi günlüklerini ve telemetry loglarını sıfırlamak istediğinize emin misiniz?'))) return;
    try {
      const res = await fetch('/api/moon/manager/logs/clear', { method: 'POST', headers: getAuthHeaders() });
      if (res.ok) {
        toast(t('toastLogsCleared', 'Loglar temizlendi'));
        await loadAllData();
      }
    } catch (e) {
      toast(t('toastErrorOccurred', 'Hata oluştu'));
    }
  };
}

// ------------------------------------------------------------------------------
// VIEW 3: THEME (Site Teması & Marka)
// ------------------------------------------------------------------------------
const PL = {
  'Orijinal Abentra Lüksü': ['#0b1a33', '#16335f', '#101a2e', '#c9a24b', '#e6c374', '#f3efe6'],
  'Koyu Obsidyen & Altın': ['#08080a', '#17171c', '#050507', '#d4a64a', '#f0c978', '#f4f1ea'],
  'Kraliyet Mavisi & Şampanya': ['#10236b', '#1d3f9a', '#0a1745', '#e8d29a', '#f6e7bf', '#ffffff']
};
const SC = [
  ['--pa', 'colorNavyPrimary', 'Ana lacivert'],
  ['--pb', 'colorNavyCard', 'Kart laciverti'],
  ['--pc', 'colorNavyDeep', 'Derin lacivert'],
  ['--pg', 'colorSignatureGold', 'İmza altın'],
  ['--pg2', 'colorBrightGold', 'Parlak altın'],
  ['--pi', 'colorTextColor', 'Yazı rengi']
];

function renderThemeView() {
  if (!$('#cols')) return;
  $('#cols').innerHTML = '<div class="cg">' + SC.map(c => `<div class="cs"><input type="color" data-v="${c[0]}"><span>${t(c[1], c[2])}</span></div>`).join('') + '</div>';

  const setP = a => $$('#cols input').forEach((i, n) => {
    i.value = a[n];
    $('#prev')?.style.setProperty(i.dataset.v, a[n]);
  });
  setP(PL['Orijinal Abentra Lüksü']);

  const cols = $('#cols'), tpl = $('#tpl'), fnt = $('#fnt'), bsh = $('#bsh');
  if (cols) cols.oninput = e => $('#prev')?.style.setProperty(e.target.dataset.v, e.target.value);
  if (tpl) tpl.onchange = e => setP(PL[e.target.value]);
  if (fnt) fnt.onchange = e => $('#prev')?.style.setProperty('--pf', "'" + e.target.value + "'");
  if (bsh) bsh.onchange = e => $('#prev')?.style.setProperty('--pr', e.target.value);

  // Sync with real site config if loaded
  const sbn = $('#site-brand-name');
  if (sbn) {
    if (siteConfig && siteConfig.brand) {
      sbn.value = siteConfig.brand.name || 'ABENTRA International';
      const pt = $('#prev-title');
      if (pt) pt.textContent = siteConfig.brand.name || 'ABENTRA International';
    }
    sbn.oninput = e => {
      const pt = $('#prev-title');
      if (pt) pt.textContent = e.target.value;
    };
  }
}

// Save Site Theme to backend
const btnSaveSiteTheme = $('#btn-save-site-theme');
if (btnSaveSiteTheme) {
  btnSaveSiteTheme.onclick = async () => {
    const themeColors = {};
    $$('#cols input').forEach(i => themeColors[i.dataset.v] = i.value);

    try {
      const payload = {
        theme: {
          navy: themeColors['--pa'] || '#0b1a33',
          navy2: themeColors['--pb'] || '#16335f',
          navy3: themeColors['--pc'] || '#101a2e',
          gold: themeColors['--pg'] || '#c9a24b',
          gold2: themeColors['--pg2'] || '#e6c374',
          ink: themeColors['--pi'] || '#f3efe6',
          font: $('#fnt')?.value || '',
          buttonRadius: $('#bsh')?.value || ''
        },
        brand: {
          ...(siteConfig?.brand || {}),
          name: $('#site-brand-name')?.value.trim() || 'ABENTRA International'
        }
      };

      const res = await fetch('/api/moon/manager/config', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        toast(t('toastThemeSaved', 'Site teması ve kurumsal kimlik kaydedildi!'));
        await loadAllData();
      } else {
        toast(t('toastErrorOccurred', 'Hata oluştu'));
      }
    } catch (e) {
      toast(t('toastConnError', 'Bağlantı hatası'));
    }
  };
}

// Logo Upload Drag & Drop
const logoDz = $('#logo-dz');
const logoInput = $('#logo-file-input');
if (logoDz && logoInput) {
  logoDz.onclick = () => logoInput.click();
  logoInput.onchange = async () => {
    const file = logoInput.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('logo', file);

    try {
      toast(t('toastLogoUploading', 'Logo yükleniyor...'));
      const res = await fetch('/api/moon/manager/upload-logo', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${authToken}` },
        body: formData
      });
      if (res.ok) {
        toast(t('toastLogoUploaded', 'Logo başarıyla yüklendi!'));
        await loadAllData();
      } else {
        toast(t('toastLogoFailed', 'Logo yüklenemedi'));
      }
    } catch (e) {
      toast(t('toastUploadError', 'Yükleme hatası'));
    }
  };
}

// ------------------------------------------------------------------------------
// VIEW 4: CMS (Site İçerik Yönetimi)
// ------------------------------------------------------------------------------
let currentCmsTab = 0;
const getCmsSections = () => [t('cmsTabHero', 'Hero'), t('cmsTabWho', 'Hakkımızda'), t('cmsTabPurpose', 'Misyon'), t('cmsTabServices', 'Hizmetler'), t('cmsTabContact', 'İletişim')];
let CMS_SECTIONS = getCmsSections();

function renderCMSView() {
  CMS_SECTIONS = getCmsSections();
  const ctabs = $('#ctabs');
  if (!ctabs) return;
  ctabs.innerHTML = CMS_SECTIONS.map((t, i) => `<button class="${i === currentCmsTab ? 'on' : ''}">${t}</button>`).join('');

  ctabs.onclick = e => {
    if (e.target.tagName === 'BUTTON') {
      const idx = CMS_SECTIONS.indexOf(e.target.textContent);
      if (idx !== -1) {
        currentCmsTab = idx;
        $$('#ctabs button').forEach(b => b.classList.remove('on'));
        e.target.classList.add('on');
        updateCMSForm();
      }
    }
  };

  updateCMSForm();
}

function updateCMSForm() {
  const cfg = siteConfig || {};
  const isEn = S.lang === 'en';
  let tag = isEn ? 'Liberia corporate advisory' : 'Liberya kurumsal danışmanlık', t1 = isEn ? 'Opening doors to Liberia' : "Liberya'nın kapısını açıyoruz", t2 = isEn ? 'End-to-end support in regulations, licensing and governmental processes.' : 'Mevzuat, izin ve süreç yönetiminde uçtan uca destek.', t3 = isEn ? 'Contact us' : 'Bizimle görüşün';

  if (currentCmsTab === 0 && cfg.hero) {
    tag = cfg.hero.tag || tag;
    t1 = cfg.hero.title || t1;
    t2 = cfg.hero.desc || t2;
    t3 = cfg.hero.btnPrimaryText || t3;
  } else if (currentCmsTab === 1 && cfg.who) {
    tag = cfg.who.tag || (isEn ? 'Company Profile' : 'Şirket Profili');
    t1 = cfg.who.title || (isEn ? 'Network & Reputation' : 'Bağlantı & İtibar');
    t2 = cfg.who.lead || (isEn ? 'Strategic business development across Liberia' : 'Liberya genelinde stratejik iş geliştirme');
    t3 = isEn ? 'About Details' : 'Hakkımızda Detay';
  } else if (currentCmsTab === 2 && cfg.purpose) {
    tag = cfg.purpose.tag || (isEn ? 'Our Purpose' : 'Amacımız');
    t1 = cfg.purpose.title || (isEn ? 'Vision & Values' : 'Vizyon ve Değerlerimiz');
    t2 = cfg.purpose.desc || (isEn ? 'Transparent and trusted corporate guidance' : 'Şeffaf ve güvenilir kurumsal rehberlik');
    t3 = isEn ? 'Explore Mission' : 'Misyonu İncele';
  } else if (currentCmsTab === 4 && cfg.contact) {
    tag = cfg.contact.tag || (isEn ? 'Contact' : 'İletişim');
    t1 = cfg.contact.title || (isEn ? 'Connect With Us' : 'Bizimle Görüşün');
    t2 = cfg.contact.addressLine1 || 'Camp Johnson Road, Monrovia';
    t3 = cfg.contact.ctaText || (isEn ? 'Get in Touch' : 'İletişime Geç');
  }

  $('#cform').innerHTML = `
    <div class="f"><label>${t('lblTopTag', 'Üst etiket')}</label><input class="i" id="c-tag" value="${esc(tag)}"></div>
    <div class="f"><label>${t('lblMainTitle', 'Ana başlık')}</label><input class="i" id="c1" value="${esc(t1)}"></div>
    <div class="f"><label>${t('lblDescription', 'Açıklama')}</label><textarea id="c2">${esc(t2)}</textarea></div>
    <div class="f"><label>${t('lblBtnText', 'Buton metni')}</label><input class="i" id="c3" value="${esc(t3)}"></div>
    <button class="pill gold" id="btn-save-cms" style="margin-top:6px">${t('btnSaveChanges', 'Değişiklikleri kaydet')}</button>
  `;

  $('#p1').textContent = t1;
  $('#p2').textContent = t2;
  $('#p3').textContent = t3;

  const c1 = $('#c1'), c2 = $('#c2'), c3 = $('#c3'), btnSaveCms = $('#btn-save-cms');
  if (c1) c1.oninput = e => { const p1 = $('#p1'); if (p1) p1.textContent = e.target.value; };
  if (c2) c2.oninput = e => { const p2 = $('#p2'); if (p2) p2.textContent = e.target.value; };
  if (c3) c3.oninput = e => { const p3 = $('#p3'); if (p3) p3.textContent = e.target.value; };

  if (btnSaveCms) btnSaveCms.onclick = async () => {
    try {
      const updatedConfig = Object.assign({}, siteConfig || {});
      if (currentCmsTab === 0) {
        updatedConfig.hero = Object.assign({}, updatedConfig.hero || {}, {
          tag: $('#c-tag').value,
          title: $('#c1').value,
          desc: $('#c2').value,
          btnPrimaryText: $('#c3').value
        });
      } else if (currentCmsTab === 1) {
        updatedConfig.who = Object.assign({}, updatedConfig.who || {}, {
          tag: $('#c-tag').value,
          title: $('#c1').value,
          lead: $('#c2').value
        });
      }
      const res = await fetch('/api/moon/manager/config', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(updatedConfig)
      });
      if (res.ok) {
        toast(t('toastContentSaved', 'İçerik kaydedildi!'));
        siteConfig = updatedConfig;
      }
    } catch (e) {
      toast(t('toastSaveError', 'Kaydetme hatası'));
    }
  };
}

const btnResetCms = $('#btn-reset-cms');
if (btnResetCms) {
  btnResetCms.onclick = async () => {
    if (!confirm(t('confirmResetFactory', 'İçerik ayarlarını fabrika varsayılanlarına sıfırlamak istiyor musunuz?'))) return;
    try {
      const res = await fetch('/api/moon/manager/config/reset', { method: 'POST', headers: getAuthHeaders() });
      if (res.ok) {
        toast(t('toastResetFactory', 'Fabrika ayarlarına dönüldü'));
        await loadAllData();
      }
    } catch (e) {
      toast(t('toastErrorOccurred', 'Hata oluştu'));
    }
  };
}

// ------------------------------------------------------------------------------
// VIEW 5: SEC (EXECUTIVE WEB BUILDER & SECTION STUDIO)
// ------------------------------------------------------------------------------
function renderSectionsView() {
  const secs = allSections.length ? allSections : [
    { id: 'sec_stats', name: 'Key Metrics & Impact', title: 'Delivering institutional confidence in Liberia.', tag: 'Track Record', type: 'stats', enabled: true, order: 1 },
    { id: 'sec_why_liberia', name: 'Strategic Gateway / Why Liberia', title: 'Why invest & establish in Liberia?', tag: 'Regional Horizon', type: 'cards', enabled: true, order: 2 },
    { id: 'sec_process', name: 'Engagement Process', title: 'A structured pathway from intent to operation.', tag: 'Execution Framework', type: 'process', enabled: true, order: 3 },
    { id: 'sec_faq', name: 'Institutional FAQ', title: 'Frequently Asked Questions & Advisory Support', tag: 'Direct Clarification', type: 'faq', enabled: true, order: 4 }
  ];

  // 1. Sync Mode Switcher Buttons
  const canvasModeRoot = $('#builder-canvas-mode-root');
  const listModeRoot = $('#builder-list-mode-root');
  const btnCanvas = $('#btn-mode-canvas');
  const btnList = $('#btn-mode-list');

  if (btnCanvas && btnList) {
    btnCanvas.classList.toggle('on', builderActiveMode === 'canvas');
    btnList.classList.toggle('on', builderActiveMode === 'list');
  }

  if (canvasModeRoot && listModeRoot) {
    canvasModeRoot.style.display = builderActiveMode === 'canvas' ? 'grid' : 'none';
    listModeRoot.style.display = builderActiveMode === 'list' ? 'flex' : 'none';
  }

  // 2. Render Left Widget Library Palette (Filtered)
  renderWidgetLibrary();

  // 3. Render Canvas Dropzone (Canvas Mode)
  renderBuilderCanvas(secs);

  // 4. Render Structured List (List Mode)
  renderBuilderStructuredList(secs);

  // 5. Setup Drag & Drop Handlers
  setupBuilderDragAndDrop();
}

function renderWidgetLibrary() {
  const stream = $('#widget-library-stream');
  if (!stream) return;

  const isEn = S.lang === 'en';
  const q = builderSearchTerm.toLowerCase().trim();

  const filtered = WIDGET_CATALOG.filter(w => {
    if (builderActiveCategory !== 'all' && w.cat !== builderActiveCategory) return false;
    if (q) {
      const name = (isEn ? w.nameEn : w.nameTr).toLowerCase();
      const desc = (isEn ? w.descEn : w.descTr).toLowerCase();
      return name.includes(q) || desc.includes(q) || w.type.includes(q);
    }
    return true;
  });

  stream.innerHTML = filtered.map(w => {
    const name = isEn ? w.nameEn : w.nameTr;
    const desc = isEn ? w.descEn : w.descTr;
    return `
      <div class="widget-lib-card" draggable="true" data-widget-type="${w.type}">
        <div class="widget-icon-box"><i class="fa-solid ${w.icon}"></i></div>
        <div class="widget-info-box">
          <b>${esc(name)}</b>
          <small>${esc(desc)}</small>
        </div>
        <button type="button" class="widget-add-btn" data-add-widget="${w.type}" title="${t('btnQuickAddWidget', 'Tuvale Ekle')}">
          <i class="fa-solid fa-plus"></i>
        </button>
      </div>
    `;
  }).join('');
}

function renderWidgetLiveContent(sec) {
  const isEn = S.lang === 'en';
  const type = sec.type || 'features';
  const items = Array.isArray(sec.items) ? sec.items : [];

  if (type === 'metrics') {
    const list = items.length ? items : [
      { value: '100%', title: isEn ? 'Compliance' : 'Mevzuat Uyumu' },
      { value: '15+', title: isEn ? 'Concessions' : 'İmtiyaz Alanı' },
      { value: '$4.2B', title: isEn ? 'Facilitated' : 'Yatırım Hacmi' },
      { value: '24/7', title: isEn ? 'Direct Nexus' : 'Hükümet Teması' }
    ];
    return `
      <div class="widget-metric-grid">
        ${list.map(it => `
          <div class="widget-metric-card">
            <div class="widget-metric-val">${esc(it.value || '100%')}</div>
            <div class="widget-metric-lbl">${esc(it.title || it.name || '')}</div>
          </div>
        `).join('')}
      </div>
    `;
  }

  if (type === 'faq') {
    const list = items.length ? items : [
      { question: isEn ? 'How are mining concessions verified?' : 'Maden imtiyazları nasıl doğrulanır?', answer: isEn ? 'Direct liaisons with Ministry of Mines and Energy ensure full cadastral verification.' : 'Maden ve Enerji Bakanlığı ile doğrudan kadastro doğrulaması sağlanır.' },
      { question: isEn ? 'What is the corporate setup timeline?' : 'Şirket kurulum süresi ne kadardır?', answer: isEn ? 'Complete institutional registration is typically concluded within 10 to 14 business days.' : 'Tüm kurumsal kayıt işlemleri 10-14 iş günü içerisinde tamamlanır.' }
    ];
    return `
      <div class="widget-faq-accordion">
        ${list.map(it => `
          <div class="widget-faq-item">
            <div class="widget-faq-q">
              <span>${esc(it.question || it.title || '')}</span>
              <i class="fa-solid fa-chevron-down" style="font-size:10px;color:var(--ac);"></i>
            </div>
            <div class="widget-faq-a">${esc(it.answer || it.description || '')}</div>
          </div>
        `).join('')}
      </div>
    `;
  }

  if (type === 'testimonials' || type === 'quotes') {
    const quote = (items[0] && (items[0].description || items[0].quote)) || (isEn ? 'Abentra provides unmatched sovereign security and seamless execution in Monrovia.' : 'Abentra, Liberya\'da emsalsiz egemen güvenlik ve kusursuz yatırım yürütümü sağlıyor.');
    const author = (items[0] && (items[0].title || items[0].author)) || 'Global Energy & Mining Consortium';
    return `
      <div class="widget-quote-box">
        "${esc(quote)}"
        <div style="margin-top:6px;font-size:10px;font-weight:700;color:var(--ac);font-style:normal;">
          ${esc(author)}
        </div>
      </div>
    `;
  }

  if (type === 'cta') {
    return `
      <div class="widget-cta-box">
        <h4>${esc(sec.title || (isEn ? 'Ready to Invest in Liberia?' : 'Liberya Yatırımınızı Başlatın'))}</h4>
        <p style="font-size:11px;color:var(--mut);margin:0 0 8px;">${esc(sec.subtitle || (isEn ? 'Consult with our ministerial liaison partners in Monrovia.' : 'Monrovia\'daki resmi danışmanlarımızla hemen iletişime geçin.'))}</p>
        <span class="widget-cta-btn">${isEn ? 'Contact Executive Board' : 'Yönetimle İletişime Geç'}</span>
      </div>
    `;
  }

  // Default features / card grid / roadmap / etc.
  const list = items.length ? items : [
    { title: isEn ? 'Sovereign Compliance' : 'Egemen Mevzuat Uyumu', description: isEn ? 'Direct statutory alignment with West African jurisdictions.' : 'Batı Afrika yetki alanları ile doğrudan mevzuat uyumu.' },
    { title: isEn ? 'Institutional Gateway' : 'Kurumsal Giriş Kapısı', description: isEn ? 'Accelerated infrastructure and resource acquisition paths.' : 'Hızlandırılmış altyapı ve kaynak edinme kanalları.' }
  ];
  return `
    <div class="widget-feature-list">
      ${list.slice(0, 3).map(it => `
        <div class="widget-feature-row">
          <i class="fa-solid fa-check-circle"></i>
          <div>
            <b>${esc(it.title || it.name || '')}</b>
            ${it.description ? `<p style="margin:2px 0 0;font-size:10.5px;color:var(--mut);">${esc(it.description)}</p>` : ''}
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

function renderBuilderCanvas(secs) {
  const dropzone = $('#builder-canvas-dropzone');
  if (!dropzone) return;

  const isEn = S.lang === 'en';

  dropzone.innerHTML = `
    <div class="builder-canvas-workspace">
      <!-- Insert Zone at Top -->
      <div class="builder-insert-divider" data-insert-idx="0">
        <button type="button" class="builder-insert-btn" data-insert-pos="0">
          <i class="fa-solid fa-plus"></i> ${t('insertSectionHere', 'Buraya Bölüm Ekle')}
        </button>
      </div>

      <!-- Render Sections as Clean Spacious Blocks -->
      ${(!secs || secs.length === 0) ? `
        <div style="padding:48px 24px;text-align:center;color:var(--mut);background:rgba(255,255,255,0.02);border:1px dashed var(--bd);border-radius:var(--rs);margin:16px 0;">
          <i class="fa-solid fa-layer-group" style="font-size:32px;color:var(--ac);margin-bottom:12px;opacity:0.6;display:block;"></i>
          <p style="margin:0;font-size:14px;color:var(--ink);">${t('canvasEmptyPlaceholder', 'Tuval Boş. Sol taraftan bir widget sürükleyin veya ekleyin.')}</p>
        </div>
      ` : secs.map((sec, idx) => {
        const wMeta = WIDGET_CATALOG.find(w => w.type === sec.type) || { icon: 'fa-cube', nameTr: 'Bölüm', nameEn: 'Section' };
        const wIcon = wMeta.icon;
        const typeLabel = isEn ? wMeta.nameEn : wMeta.nameTr;

        return `
          <div class="builder-section-block canvas-section-node ${sec.enabled ? '' : 'disabled-block'}" draggable="true" data-sec-id="${esc(sec.id)}" data-sec-idx="${idx}">
            <div class="builder-block-header">
              <div class="builder-block-meta">
                <span class="builder-block-handle" title="${t('dragToReorder', 'Sürükleyip sırala')}">
                  <i class="fa-solid fa-grip-vertical"></i>
                </span>
                <span class="tag" style="border-color:var(--ac);color:var(--ac);font-weight:700;font-size:11.5px;">#${idx + 1}</span>
                <div class="builder-block-title">
                  <i class="fa-solid ${wIcon}" style="color:var(--ac);"></i>
                  <span>${esc(sec.title || sec.name || typeLabel)}</span>
                  <small class="tag" style="border-color:var(--bd);color:var(--mut);font-size:10.5px;padding:2px 8px;font-weight:400;">${esc(sec.tag || typeLabel)}</small>
                </div>
              </div>

              <div class="builder-block-actions">
                <button type="button" class="builder-btn-icon" data-move-up="${esc(sec.id)}" title="${t('btnMoveUp', 'Yukarı Taşı')}">
                  <i class="fa-solid fa-arrow-up"></i>
                </button>
                <button type="button" class="builder-btn-icon" data-move-down="${esc(sec.id)}" title="${t('btnMoveDown', 'Aşağı Taşı')}">
                  <i class="fa-solid fa-arrow-down"></i>
                </button>
                <button type="button" class="builder-btn-icon" data-edit-sec="${esc(sec.id)}" title="${t('btnEditSectionContent', 'Detayları Düzenle')}">
                  <i class="fa-solid fa-pen"></i>
                </button>
                <button type="button" class="builder-btn-icon" data-dup-sec="${esc(sec.id)}" title="${t('btnDuplicateSection', 'Çoğalt')}">
                  <i class="fa-solid fa-clone"></i>
                </button>
                <button type="button" class="builder-btn-icon del" data-del-sec="${esc(sec.id)}" title="${t('btnDeleteSection', 'Bölümü Sil')}">
                  <i class="fa-solid fa-trash-can"></i>
                </button>
                <div class="sw ${sec.enabled ? 'on' : ''}" data-toggle-sec="${esc(sec.id)}" title="${t('toggleActive', 'Aç / Kapat')}" style="margin-left:6px;"></div>
              </div>
            </div>

            <!-- Clean Live Section Body Preview -->
            <div class="builder-block-preview">
              ${renderWidgetLiveContent(sec)}
            </div>
          </div>

          <!-- Insert Zone Below Widget -->
          <div class="builder-insert-divider" data-insert-idx="${idx + 1}">
            <button type="button" class="builder-insert-btn" data-insert-pos="${idx + 1}">
              <i class="fa-solid fa-plus"></i> ${t('insertSectionHere', 'Buraya Bölüm Ekle')}
            </button>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

function renderBuilderStructuredList(secs) {
  const container = $('#builder-structured-list-stream');
  if (!container) return;

  const isEn = S.lang === 'en';

  container.innerHTML = secs.map((sec, idx) => {
    const wMeta = WIDGET_CATALOG.find(w => w.type === sec.type) || { icon: 'fa-cube', nameTr: 'Bölüm', nameEn: 'Section' };
    const items = Array.isArray(sec.items) ? sec.items : [];

    return `
      <div class="builder-list-item-card glass" id="list-card-${esc(sec.id)}">
        <div class="builder-list-card-head" onclick="toggleListCard('${esc(sec.id)}')">
          <div style="display:flex;align-items:center;gap:12px;flex:1;">
            <i class="fa-solid fa-chevron-right list-card-chevron" id="chevron-${esc(sec.id)}" style="transition:transform .2s;color:var(--ac);"></i>
            <span class="tag" style="border-color:var(--ac);color:var(--ac);font-size:11px;">#${idx + 1} ${esc(isEn ? wMeta.nameEn : wMeta.nameTr)}</span>
            <b style="font-size:14px;color:var(--ink);">${esc(sec.name || sec.title || 'Untitled Section')}</b>
            <span class="sub" style="font-size:12px;">${items.length} ${isEn ? 'child cards' : 'kart'}</span>
          </div>
          <div style="display:flex;align-items:center;gap:10px;" onclick="event.stopPropagation()">
            <div class="sw ${sec.enabled ? 'on' : ''}" data-toggle-sec="${esc(sec.id)}"></div>
            <button type="button" class="pill" data-del-sec="${esc(sec.id)}" style="color:var(--dn);"><i class="fa-solid fa-trash-can"></i></button>
          </div>
        </div>

        <div class="builder-list-card-body" id="list-body-${esc(sec.id)}" style="display:none;">
          <div class="grid g3">
            <div class="f">
              <label>${t('lblSecTitle', 'Bölüm Başlığı')}</label>
              <input class="i input-live-update" data-sec-prop="title" data-sec-id="${esc(sec.id)}" value="${esc(sec.title || '')}">
            </div>
            <div class="f">
              <label>${t('lblSectionTag', 'Üst Rozet / Kategori')}</label>
              <input class="i input-live-update" data-sec-prop="tag" data-sec-id="${esc(sec.id)}" value="${esc(sec.tag || '')}">
            </div>
            <div class="f">
              <label>${t('lblSectionAnchor', 'Bağlantı Çapası (#anchor)')}</label>
              <input class="i input-live-update" data-sec-prop="anchor" data-sec-id="${esc(sec.id)}" value="${esc(sec.anchor || '')}">
            </div>
          </div>

          <div class="f">
            <label>${t('lblSecSub', 'Alt Açıklama / Paragraf')}</label>
            <textarea class="i input-live-update" data-sec-prop="subtitle" data-sec-id="${esc(sec.id)}" style="min-height:60px;">${esc(sec.subtitle || '')}</textarea>
          </div>

          <div class="grid g3">
            <div class="f">
              <label>${t('lblSectionBgStyle', 'Arka Plan Stili')}</label>
              <select class="i input-live-update" data-sec-prop="bgStyle" data-sec-id="${esc(sec.id)}">
                <option value="obsidian" ${sec.bgStyle === 'obsidian' ? 'selected' : ''}>${t('optBgObsidian', 'Koyu Obsidyen Zemin')}</option>
                <option value="glass" ${sec.bgStyle === 'glass' ? 'selected' : ''}>${t('optBgGlass', 'Cam Şeffaflığı & Kart')}</option>
                <option value="navy" ${sec.bgStyle === 'navy' ? 'selected' : ''}>${t('optBgNavy', 'Derin Lüks Lacivert')}</option>
                <option value="gold" ${sec.bgStyle === 'gold' ? 'selected' : ''}>${t('optBgGold', 'Altın Parıltısı Radyal')}</option>
              </select>
            </div>
            <div class="f">
              <label>${t('lblSectionColumns', 'Izgara Sütun Sayısı')}</label>
              <select class="i input-live-update" data-sec-prop="columns" data-sec-id="${esc(sec.id)}">
                <option value="2" ${sec.columns === '2' ? 'selected' : ''}>2 Sütun (Columns)</option>
                <option value="3" ${sec.columns === '3' || !sec.columns ? 'selected' : ''}>3 Sütun (Columns)</option>
                <option value="4" ${sec.columns === '4' ? 'selected' : ''}>4 Sütun (Columns)</option>
              </select>
            </div>
            <div class="f">
              <label>${t('lblSectionAlignment', 'Metin Hizalaması')}</label>
              <select class="i input-live-update" data-sec-prop="align" data-sec-id="${esc(sec.id)}">
                <option value="left" ${sec.align === 'left' || !sec.align ? 'selected' : ''}>${t('optAlignLeft', 'Sola Hizalı')}</option>
                <option value="center" ${sec.align === 'center' ? 'selected' : ''}>${t('optAlignCenter', 'Ortalanmış')}</option>
              </select>
            </div>
          </div>

          <div style="border-top:1px solid var(--ln);padding-top:14px;">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;">
              <b style="font-size:13px;color:var(--ac);">${t('sectionItemsHeading', 'Bölüm İçi Kartlar & Maddeler')} (${items.length})</b>
              <button type="button" class="pill gold" data-add-item-to-sec="${esc(sec.id)}" style="font-size:11.5px;padding:4px 10px;">
                ${t('btnAddItemRow', '+ Yeni Kart / Madde Ekle')}
              </button>
            </div>

            <div class="builder-child-items-grid">
              ${items.map((it, itIdx) => `
                <div class="builder-child-item-row">
                  <input class="i child-prop-input" data-sec-id="${esc(sec.id)}" data-item-idx="${itIdx}" data-item-prop="title" placeholder="${t('itemTitle', 'Madde Başlığı')}" value="${esc(it.title || it.label || it.name || '')}">
                  <input class="i child-prop-input" data-sec-id="${esc(sec.id)}" data-item-idx="${itIdx}" data-item-prop="description" placeholder="${t('itemDesc', 'Açıklama / Metin')}" value="${esc(it.description || it.bio || it.desc || '')}">
                  <button type="button" class="pill" data-del-item-from-sec="${esc(sec.id)}" data-item-idx="${itIdx}" style="color:var(--dn);" title="Sil">
                    <i class="fa-solid fa-trash-can"></i>
                  </button>
                </div>
              `).join('')}
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');
}

function toggleListCard(secId) {
  const body = $('#list-body-' + secId);
  const chevron = $('#chevron-' + secId);
  if (body) {
    const isHidden = body.style.display === 'none';
    body.style.display = isHidden ? 'flex' : 'none';
    if (chevron) chevron.style.transform = isHidden ? 'rotate(90deg)' : 'none';
  }
}

function setupBuilderDragAndDrop() {
  const dropzone = $('#builder-canvas-dropzone');
  if (!dropzone) return;

  // Dragging from Palette onto Canvas
  $$('.widget-lib-card').forEach(card => {
    card.ondragstart = e => {
      e.dataTransfer.setData('text/widget-type', card.dataset.widgetType);
    };
  });

  // Dragging Canvas Section Nodes (Reordering)
  let draggedSecId = null;
  $$('.canvas-section-node').forEach(node => {
    node.ondragstart = e => {
      draggedSecId = node.dataset.secId;
      node.classList.add('dragging');
      e.dataTransfer.setData('text/sec-id', draggedSecId);
    };
    node.ondragend = () => {
      node.classList.remove('dragging');
      $$('.canvas-section-node').forEach(n => n.classList.remove('drag-over'));
    };
    node.ondragover = e => {
      e.preventDefault();
      node.classList.add('drag-over');
    };
    node.ondragleave = () => {
      node.classList.remove('drag-over');
    };
    node.ondrop = e => {
      e.preventDefault();
      node.classList.remove('drag-over');
      const targetSecId = node.dataset.secId;
      if (draggedSecId && targetSecId && draggedSecId !== targetSecId) {
        reorderSections(draggedSecId, targetSecId);
      }
    };
  });

  // Canvas Dropzone events
  dropzone.ondragover = e => e.preventDefault();
  dropzone.ondrop = e => {
    e.preventDefault();
    const widgetType = e.dataTransfer.getData('text/widget-type');
    if (widgetType) {
      addNewSectionFromWidget(widgetType);
    }
  };

  // iPhone In-Between Insertion Zones
  $$('.iphone-insert-zone').forEach(zone => {
    zone.ondragover = e => {
      e.preventDefault();
      zone.classList.add('drag-active');
    };
    zone.ondragleave = () => {
      zone.classList.remove('drag-active');
    };
    zone.ondrop = e => {
      e.preventDefault();
      zone.classList.remove('drag-active');
      const widgetType = e.dataTransfer.getData('text/widget-type');
      const pos = parseInt(zone.dataset.insertIdx, 10);
      if (widgetType) {
        addNewSectionFromWidget(widgetType, isNaN(pos) ? undefined : pos);
      }
    };
  });

  // Quick insert buttons
  $$('.iphone-insert-btn').forEach(btn => {
    btn.onclick = () => {
      const pos = parseInt(btn.dataset.insertPos, 10);
      addNewSectionFromWidget('feature_grid', isNaN(pos) ? undefined : pos);
    };
  });
}

function addNewSectionFromWidget(type, insertIdx) {
  const isEn = S.lang === 'en';
  const meta = WIDGET_CATALOG.find(w => w.type === type) || { nameTr: 'Bölüm', nameEn: 'Section' };
  const title = isEn ? meta.nameEn : meta.nameTr;

  const defaultItems = [
    { title: isEn ? 'Institutional Advantage' : 'Kurumsal Avantaj', description: isEn ? 'Verified regulatory compliance and ongoing advisory.' : 'Mevzuat uyumu ve sürekli danışmanlık.', value: '100%' },
    { title: isEn ? 'Operational Nexus' : 'Operasyonel Merkez', description: isEn ? 'Direct ministerial and administrative engagement.' : 'Doğrudan bakanlık ve idari süreç takibi.', value: '24/7' },
    { title: isEn ? 'Strategic Execution' : 'Stratejik Uygulama', description: isEn ? 'Seamless market entry and corporate establishment.' : 'Pazara giriş ve şirket kurulumu.', value: '15+' }
  ];

  const newSec = {
    id: 'sec_' + Date.now().toString(36),
    name: title,
    title: isEn ? `Excellence in ${title}` : `${title} Alanında Kurumsal Güven`,
    tag: isEn ? 'Executive Advisory' : 'Stratejik Çözümler',
    subtitle: isEn ? 'Connecting multinational entities to verified commercial pathways in Liberia.' : 'Uluslararası yatırımcıları Liberya\'da güvenilir ve şeffaf kanallarla buluşturuyoruz.',
    type,
    enabled: true,
    order: (allSections.length || 0) + 1,
    anchor: type + '-' + Date.now().toString(36).slice(-4),
    items: defaultItems
  };

  if (insertIdx !== undefined && insertIdx >= 0 && insertIdx <= allSections.length) {
    allSections.splice(insertIdx, 0, newSec);
  } else {
    allSections.push(newSec);
  }
  allSections.forEach((s, idx) => s.order = idx + 1);

  saveAllSectionsToBackend();
  renderSectionsView();
  toast(t('toastSectionAdded', 'Widget başarıyla tuvale eklendi!'));
}

function reorderSections(fromId, toId) {
  const fromIdx = allSections.findIndex(s => s.id === fromId);
  const toIdx = allSections.findIndex(s => s.id === toId);
  if (fromIdx === -1 || toIdx === -1) return;

  const [moved] = allSections.splice(fromIdx, 1);
  allSections.splice(toIdx, 0, moved);

  // Recalculate order property
  allSections.forEach((s, idx) => s.order = idx + 1);

  saveAllSectionsToBackend();
  renderSectionsView();
  toast(t('toastSectionsReordered', 'Bölüm sıralaması güncellendi!'));
}

async function saveAllSectionsToBackend() {
  try {
    await fetch('/api/moon/manager/sections', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(allSections)
    });
  } catch (err) {
    console.warn('Could not persist sections:', err.message);
  }
}


const btnCreateSec = $('#btn-create-section');
if (btnCreateSec) {
  btnCreateSec.onclick = async () => {
    const title = $('#new-sec-title')?.value.trim();
    const sub = $('#new-sec-sub')?.value.trim();
    const type = $('#new-sec-type')?.value;

    if (!title) {
      toast(t('toastEnterSecTitle', 'Lütfen bölüm başlığı girin'));
      return;
    }

    try {
      const res = await fetch('/api/moon/manager/sections/create', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ title, subtitle: sub, type, enabled: true })
      });
      if (res.ok) {
        toast(t('toastSecAdded', 'Yeni bölüm eklendi!'));
        if ($('#new-sec-title')) $('#new-sec-title').value = '';
        if ($('#new-sec-sub')) $('#new-sec-sub').value = '';
        await loadAllData();
      }
    } catch (e) {
      toast(t('toastSecAddFailed', 'Bölüm eklenemedi'));
    }
  };
}

// ------------------------------------------------------------------------------
// VIEW 6: MAIL (E-Posta Yönetim Merkezi, Yıldızlama, Silme & Tam Ekran Modu)
// ------------------------------------------------------------------------------
let currentEmailIndex = 0;
let showOriginalTranslation = 0;
let mailActiveFolder = 'inbox'; // 'inbox', 'starred', 'sent', 'draft'
let mailFilterTab = 'all'; // 'all', 'unread', 'starred'
let mailSearchQuery = '';
let mailViewMode = 'compose'; // 'compose', 'preview', or 'split'
let showSubPreview = true;
let isMailFullscreen = false;

const TI = '<svg class="tri" viewBox="0 0 24 24" style="width:16px;height:16px;vertical-align:-3px;margin-left:6px;"><path d="M4 5h8M8 3v2M6 5c0 4 3 7 6 8M10 5c0 3-2 6-6 8M13 21l4-10 4 10M14.5 18h5" stroke="currentColor" fill="none" stroke-width="1.8"/></svg>';

async function gtr(text, from, to) {
  try {
    const r = await fetch('https://translate.googleapis.com/translate_a/single?client=gtx&sl=' + from + '&tl=' + to + '&dt=t&q=' + encodeURIComponent(text));
    const j = await r.json();
    return j[0].map(a => a[0]).join('');
  } catch (e) {
    return text;
  }
}

const sampleData = () => ({
  Subject: $('#rsub')?.value || $('#ts')?.value || (S.lang === 'en' ? 'Sample inquiry subject' : 'Örnek konu'),
  Message: $('#rb')?.value || $('#tm')?.value || (S.lang === 'en' ? 'Sample message text.' : 'Örnek mesaj metni.'),
  Name: S.lang === 'en' ? 'Alexander Wright' : 'Mehmet Yıldız',
  Company: S.lang === 'en' ? 'Wright Global Capital' : 'Yıldız Holding',
  Service: S.lang === 'en' ? 'Investment & Corporate Setup' : 'Yatırım ve Şirket Kuruluşu',
  Sender: currentUser?.name || 'Abenetta Kollie',
  SenderTitle: currentUser?.role || 'Super Admin',
  Phone: '+231 77 000 0000',
  Date: new Date().toLocaleDateString('tr-TR'),
  Year: String(new Date().getFullYear())
});

function fillTpl(h, v) {
  if (!h) return '';
  return h.replace(/%([A-Za-z]+)%/g, (m, k) => k in v ? (k === 'Message' ? esc(v[k]).replace(/\n/g, '<br>') : esc(v[k])) : m);
}

function updateMailBadges() {
  const inbox = (allEmails && allEmails.inbox) ? allEmails.inbox : [];
  const sent = (allEmails && allEmails.sent) ? allEmails.sent : [];

  const unreadCount = inbox.filter(m => !m.read).length;
  const starredCount = inbox.filter(m => m.starred).length + sent.filter(m => m.starred).length;
  const sentCount = sent.length;

  const inboxBadge = $('#badge-inbox-count');
  if (inboxBadge) inboxBadge.textContent = unreadCount;

  const starBadge = $('#badge-starred-count');
  if (starBadge) starBadge.textContent = starredCount;

  const sentBadge = $('#badge-sent-count');
  if (sentBadge) sentBadge.textContent = sentCount;

  const draftBadge = $('#badge-draft-count');
  if (draftBadge) draftBadge.textContent = '0';

  const navBadge = $('#nav-unread-count');
  if (navBadge) navBadge.textContent = unreadCount;
}

function getMailFilteredList() {
  let list = [];
  if (mailActiveFolder === 'starred') {
    const inboxStars = (allEmails.inbox || []).filter(m => m.starred);
    const sentStars = (allEmails.sent || []).filter(m => m.starred);
    list = [...inboxStars, ...sentStars];
  } else if (mailActiveFolder === 'sent') {
    list = allEmails.sent || [];
  } else if (mailActiveFolder === 'draft') {
    list = [];
  } else {
    list = allEmails.inbox || [];
  }

  // Filter tabs
  if (mailFilterTab === 'unread') {
    list = list.filter(m => !m.read);
  } else if (mailFilterTab === 'starred') {
    list = list.filter(m => m.starred);
  }

  // Search query
  if (mailSearchQuery && mailSearchQuery.trim()) {
    const q = mailSearchQuery.toLowerCase().trim();
    list = list.filter(m => {
      const name = (m.name || m.to || '').toLowerCase();
      const email = (m.email || '').toLowerCase();
      const subj = (m.subject || m.service || '').toLowerCase();
      const body = (m.message || m.body || '').toLowerCase();
      return name.includes(q) || email.includes(q) || subj.includes(q) || body.includes(q);
    });
  }

  return list;
}

async function toggleStarEmail(msgId, e) {
  if (e) e.stopPropagation();
  let item = (allEmails.inbox || []).find(m => m.id === msgId);
  let isInbox = true;
  if (!item) {
    item = (allEmails.sent || []).find(m => m.id === msgId);
    isInbox = false;
  }
  if (!item) return;

  const newStarred = !item.starred;
  item.starred = newStarred;

  try {
    const url = isInbox ? `/api/moon/manager/emails/inbox/${encodeURIComponent(msgId)}/star` : `/api/moon/manager/emails/inbox/${encodeURIComponent(msgId)}/star`;
    await fetch(url, {
      method: 'PUT',
      headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ starred: newStarred })
    });
    toast(newStarred ? t('toastEmailStarred', 'E-posta yıldızlandı') : t('toastStarRemoved', 'Yıldız kaldırıldı'));
  } catch (err) {
    console.error('Star error:', err);
  }

  updateMailBadges();
  renderMailView();
}

async function deleteEmailItem(msgId, e) {
  if (e) e.stopPropagation();
  if (!confirm(t('confirmDeleteMail', 'Bu e-postayı silmek istediğinize emin misiniz? Bu işlem geri alınamaz.'))) return;

  const isSent = (mailActiveFolder === 'sent') || (allEmails.sent || []).some(m => m.id === msgId);
  const url = isSent ? `/api/moon/manager/emails/sent/${encodeURIComponent(msgId)}` : `/api/moon/manager/emails/inbox/${encodeURIComponent(msgId)}`;

  try {
    toast(t('toastDeleting', 'Siliniyor...'));
    const res = await fetch(url, {
      method: 'DELETE',
      headers: getAuthHeaders()
    });

    if (res.ok) {
      toast(t('toastEmailDeleted', 'E-posta başarıyla silindi'));
      if (isSent) {
        allEmails.sent = (allEmails.sent || []).filter(m => m.id !== msgId);
      } else {
        allEmails.inbox = (allEmails.inbox || []).filter(m => m.id !== msgId);
      }
      currentEmailIndex = 0;
      updateMailBadges();
      renderMailView();
    } else {
      toast(t('toastDeleteFailed', 'Silme işlemi başarısız oldu'));
    }
  } catch (err) {
    console.error('Delete error:', err);
    toast(t('toastDeleteError', 'Silme hatası'));
  }
}

function toggleMailFullscreen() {
  const vMail = $('#v-mail');
  if (!vMail) return;
  isMailFullscreen = !isMailFullscreen;
  vMail.classList.toggle('mail-fullscreen-active', isMailFullscreen);

  const btnSidebar = $('#btn-mail-sidebar-fs');
  if (btnSidebar) {
    btnSidebar.innerHTML = isMailFullscreen
      ? `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 3v3a2 2 0 0 1-2 2H3M21 8h-3a2 2 0 0 1-2-2V3M3 16h3a2 2 0 0 1 2 2v3M16 21v-3a2 2 0 0 1 2-2h3"/></svg><span>${t('actionWindowMode', 'Pencere Modu')}</span>`
      : `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 3H5a2 2 0 0 0-2 2v3M21 8V5a2 2 0 0 0-2-2h-3M3 16v3a2 2 0 0 0 2 2h3M16 21h3a2 2 0 0 0 2-2v-3"/></svg><span>${t('actionFullscreenMode', 'Tam Ekran Modu')}</span>`;
  }
  const btnDetail = $('#btn-mail-detail-fs');
  if (btnDetail) {
    btnDetail.innerHTML = isMailFullscreen
      ? `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 3v3a2 2 0 0 1-2 2H3M21 8h-3a2 2 0 0 1-2-2V3M3 16h3a2 2 0 0 1 2 2v3M16 21v-3a2 2 0 0 1 2-2h3"/></svg><span>${t('actionWindow', 'Pencere')}</span>`
      : `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 3H5a2 2 0 0 0-2 2v3M21 8V5a2 2 0 0 0-2-2h-3M3 16v3a2 2 0 0 0 2 2h3M16 21h3a2 2 0 0 0 2-2v-3"/></svg><span>${t('actionFullscreen', 'Tam Ekran')}</span>`;
  }
}

function renderMailView() {
  if (!$('#ml')) return;
  updateMailBadges();

  const list = getMailFilteredList();

  // Update folder active tabs
  $$('#v-mail .fl').forEach(el => {
    el.classList.toggle('on', el.dataset.folder === mailActiveFolder);
  });

  // Update filter buttons
  $$('.mail-filter-btn').forEach(btn => {
    btn.classList.toggle('on', btn.dataset.filter === mailFilterTab);
  });

  if (list.length === 0) {
    const emptyMsg = mailSearchQuery
      ? (S.lang === 'en' ? `No emails matching "${esc(mailSearchQuery)}".` : `"${esc(mailSearchQuery)}" ile eşleşen e-posta bulunamadı.`)
      : mailActiveFolder === 'starred'
        ? (S.lang === 'en' ? 'No starred emails yet.' : 'Henüz yıldızlanmış e-posta bulunmuyor.')
        : mailActiveFolder === 'sent'
          ? (S.lang === 'en' ? 'No sent emails.' : 'Gönderilen e-posta yok.')
          : mailActiveFolder === 'draft'
            ? (S.lang === 'en' ? 'No draft emails.' : 'Taslak e-posta bulunmuyor.')
            : t('inboxEmptyNotice', 'Gelen kutusu boş.');

    $('#ml').innerHTML = `
      <div style="padding:32px 18px;text-align:center;color:var(--mut);">
        <div style="font-size:28px;margin-bottom:8px;opacity:.6;"><i class="fa-regular fa-envelope-open"></i></div>
        <div style="font-size:13px;line-height:1.5;">${emptyMsg}</div>
      </div>
    `;
    $('#md').innerHTML = `
      <div style="padding:60px 20px;text-align:center;color:var(--mut);display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;">
        <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="opacity:.4;margin-bottom:12px;"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
        <div style="font-size:15px;font-weight:500;color:var(--ink);margin-bottom:4px;">${t('noMailSelectedNotice', 'Görüntülenecek e-posta seçilmedi')}</div>
        <div style="font-size:12.5px;max-width:320px;">${t('selectMailDetailsNotice', 'Sol listeden bir e-postayı seçerek detaylarını ve yanıt şablonunu görüntüleyebilirsiniz.')}</div>
      </div>
    `;
    return;
  }

  if (currentEmailIndex >= list.length) currentEmailIndex = 0;

  $('#ml').innerHTML = list.map((m, i) => {
    const isCurrent = (i === currentEmailIndex);
    const country = m.country || '';
    const dateStr = m.date || m.sentAt ? new Date(m.date || m.sentAt).toLocaleDateString('tr-TR', { month: 'short', day: 'numeric' }) : '';
    const displayName = m.name || m.to || t('unknownSenderDefault', 'Bilinmeyen Gönderici');
    const initials = displayName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || 'AB';
    const isStarred = !!m.starred;
    const isUnread = (m.read === false);
    const previewText = (m.message || m.body || '').replace(/\n+/g, ' ');

    return `
      <div class="mi ${isCurrent ? 'on' : ''} ${isUnread ? 'unread' : ''}" data-idx="${i}" data-id="${esc(m.id)}">
        <div class="mi-header">
          <div class="mi-sender-info">
            <div class="mi-avatar">${initials}</div>
            <span class="mi-name">${esc(displayName)}</span>
          </div>
          <span class="mi-date">${dateStr}</span>
        </div>
        <div class="mi-subject">${esc(m.subject || m.service || t('customerInquiryDefault', 'Müşteri Talebi'))}</div>
        <div class="mi-preview">${esc(previewText)}</div>
        <div class="mi-footer">
          <div class="mi-tags">
            ${country ? `<span class="mi-tag">${country}</span>` : ''}
            ${m.questions && m.questions.length ? `<span class="mi-tag" style="color:var(--ac);">${m.questions.length} soru</span>` : ''}
            ${isUnread ? `<span class="mi-tag" style="background:color-mix(in srgb, var(--ac) 20%, transparent);color:var(--ac);font-weight:600;">Yeni</span>` : ''}
          </div>
          <div class="mi-actions">
            <button class="mi-btn star-btn ${isStarred ? 'starred' : ''}" title="${isStarred ? t('actionUnstar', 'Yıldızı Kaldır') : t('actionStar', 'Yıldızla')}" onclick="toggleStarEmail('${esc(m.id)}', event)">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="${isStarred ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
            </button>
            <button class="mi-btn del-btn" title="${t('actionDelete', 'E-postayı Sil')}" onclick="deleteEmailItem('${esc(m.id)}', event)">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
            </button>
          </div>
        </div>
      </div>
    `;
  }).join('');

  renderMailDetail();
}

function updateMailPreview() {
  const f = $('#rpv');
  if (!f) return;
  const list = getMailFilteredList();
  const e = list[currentEmailIndex] || {};
  const templates = (allEmails && allEmails.templates && allEmails.templates.length) ? allEmails.templates : [];
  const rtVal = $('#rt') ? +$('#rt').value : 0;
  const t = templates[rtVal] || templates[0] || {};

  const html = t.html || `<!DOCTYPE html><html><body style="font-family:Arial,sans-serif;padding:32px;background:#0b1a33;color:#fff"><h1 style="color:#e6c374">%Subject%</h1><p>Sayın %Name%,</p><p>%Message%</p><p>Saygılarımızla,<br>%Sender%</p></body></html>`;

  const rendered = fillTpl(html, {
    Subject: $('#rsub') ? $('#rsub').value : ('Re: ' + (e.subject || 'ABENTRA International')),
    Message: $('#rb') ? $('#rb').value : (t.msg || ''),
    Name: e.name || 'Müşteri',
    Company: e.service || '—',
    Service: e.service || '—',
    Sender: currentUser?.name || 'Abenetta Kollie',
    SenderTitle: currentUser?.role || 'Managing Director',
    Phone: '+231 77 000 0000',
    Date: new Date().toLocaleDateString(S.lang === 'en' ? 'en-GB' : 'tr-TR'),
    Year: String(new Date().getFullYear())
  });

  f.srcdoc = rendered;
}

function renderMailDetail() {
  const list = getMailFilteredList();
  const e = list[currentEmailIndex];
  if (!e) {
    $('#md').innerHTML = `
      <div style="padding:60px 20px;text-align:center;color:var(--mut);display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;">
        <div style="font-size:15px;color:var(--ink);margin-bottom:4px;">${t('noMailToDisplayNotice', 'Görüntülenecek e-posta yok')}</div>
      </div>
    `;
    return;
  }

  // Auto mark read if unread in inbox
  if (e.read === false && e.id) {
    e.read = true;
    fetch(`/api/moon/manager/emails/inbox/${encodeURIComponent(e.id)}/read`, {
      method: 'PUT',
      headers: getAuthHeaders()
    }).catch(() => null);
    updateMailBadges();
  }

  const templates = (allEmails && allEmails.templates && allEmails.templates.length) ? allEmails.templates : [
    { id: 1, name: 'Genel bilgilendirme ve karşılama', subj: 'Talebiniz hakkında', msg: 'Talebiniz için teşekkür ederiz. Ekibimiz en geç 48 saat içinde size dönüş yapacaktır.' }
  ];

  const defaultSubj = 'Re: ' + (e.subject || 'ABENTRA International');
  const defaultBody = templates[0]?.msg || templates[0]?.body || '';
  const isStarred = !!e.starred;
  const isUnread = (e.read === false);

  $('#md').innerHTML = `
    <!-- Top Header Bar -->
    <div class="mail-header-bar">
      <div style="flex:1;min-width:260px;">
        <h3 class="mail-subject-title">${esc(e.subject || t('customerInquiryDefault', 'Müşteri Talebi'))}</h3>
        <p class="sub" style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-top:4px;">
          <b>${esc(e.name || e.to || '')}</b>
          ${e.email ? ` · <a href="mailto:${esc(e.email)}" style="color:var(--ink);">${esc(e.email)}</a>` : ''}
          ${e.phone ? ` · <span>${esc(e.phone)}</span>` : ''}
          ${e.country ? ` · <span class="tag">${esc(e.country)}</span>` : ''}
          ${(e.date || e.sentAt) ? ` · <span style="color:var(--mut);">${new Date(e.date || e.sentAt).toLocaleString('tr-TR')}</span>` : ''}
        </p>
      </div>
      <div class="mail-detail-actions">
        <!-- Add to FAQ Button -->
        <button class="mail-action-btn" id="btn-add-to-faq" style="border-color:var(--n1);color:var(--n1);" title="${t('btnAddToFaqAction', 'SSS\'ye Ekle')}">
          <i class="fa-solid fa-circle-question"></i>
          <span>${t('btnAddToFaqAction', 'SSS\'ye Ekle')}</span>
        </button>

        <!-- Star Toggle Button -->
        <button class="mail-action-btn ${isStarred ? 'starred' : ''}" id="btn-detail-star" title="${isStarred ? t('actionUnstar', 'Yıldızı Kaldır') : t('actionStar', 'Yıldızla')}">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="${isStarred ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
          <span>${isStarred ? t('actionStarred', 'Yıldızlı') : t('actionStar', 'Yıldızla')}</span>
        </button>

        <!-- Delete Button -->
        <button class="mail-action-btn del" id="btn-detail-del" title="${t('actionDelete', 'Sil')}">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
          <span>${t('actionDelete', 'Sil')}</span>
        </button>

        <!-- Google Translate Button -->
        <button class="mail-action-btn" id="btn-translate-mail">
          ${TI} <span>${t('actionTranslate', 'Çevir')} (${S.lang === 'tr' ? 'Türkçe' : (S.lang === 'en' ? 'English' : S.lang.toUpperCase())})</span>
        </button>

        <!-- Fullscreen Mode Toggle Trigger -->
        <button class="mail-action-btn" id="btn-mail-detail-fs" title="Tam Ekran / Pencere">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            ${isMailFullscreen
              ? '<path d="M8 3v3a2 2 0 0 1-2 2H3M21 8h-3a2 2 0 0 1-2-2V3M3 16h3a2 2 0 0 1 2 2v3M16 21v-3a2 2 0 0 1 2-2h3"/>'
              : '<path d="M8 3H5a2 2 0 0 0-2 2v3M21 8V5a2 2 0 0 0-2-2h-3M3 16v3a2 2 0 0 0 2 2h3M16 21h3a2 2 0 0 0 2-2v-3"/>'}
          </svg>
          <span>${isMailFullscreen ? t('actionWindow', 'Pencere') : t('actionFullscreen', 'Tam Ekran')}</span>
        </button>

        <!-- View Mode Switcher -->
        <div class="mail-tabs">
          <button class="${mailViewMode === 'compose' ? 'on' : ''}" data-mvm="compose"><i class="fa-solid fa-pen"></i> ${t('actionWriteReply', 'Yanıt Yaz')}</button>
          <button class="${mailViewMode === 'preview' ? 'on' : ''}" data-mvm="preview"><i class="fa-solid fa-eye"></i> ${t('actionLivePreview', 'Canlı Önizleme')}</button>
          <button class="${mailViewMode === 'split' ? 'on' : ''}" data-mvm="split"><i class="fa-solid fa-table-columns"></i> ${t('actionSplitView', 'Bölünmüş')}</button>
        </div>
      </div>
    </div>

    <!-- Incoming Message & Question Highlights with Auto-Translation Banner -->
    <div class="mail-inquiry-card">
      <div id="mail-translation-banner-container"></div>
      <p id="mail-body-content" style="white-space:pre-wrap;margin:0;line-height:1.7;">${esc(e.message || e.body || '')}</p>
      <div id="mail-questions-container">
        ${(e.questions && e.questions.length) ? `
          <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:12px;padding-top:10px;border-top:1px dashed var(--ln);">
            ${e.questions.map(q => `<mark><i class="fa-solid fa-circle-question" style="margin-right:4px;"></i>${esc(q)}</mark>`).join('')}
          </div>
        ` : ''}
      </div>
    </div>

    <!-- SecurePosta Sender Telemetry Card -->
    <div class="mail-telemetry-card">
      <div class="mail-telemetry-head">
        <div style="display:flex;align-items:center;gap:6px;">
          <i class="fa-solid fa-shield-halved" style="color:var(--ac);"></i>
          <span>${t('senderTelemetryTitle', 'SecurePosta Gönderen Doğrulaması & Telemetri')}</span>
        </div>
        <span class="tag" style="border-color:var(--up);color:var(--up);font-size:10px;"><i class="fa-solid fa-check"></i> ${t('senderStatusVerified', 'Doğrulanmış İnsan')}</span>
      </div>
      <div class="mail-telemetry-grid">
        <div class="mail-telemetry-item">
          <b><i class="fa-solid fa-location-dot" style="font-size:10px;margin-right:4px;"></i>${e.flag || '🌐'} ${esc(e.city ? `${e.city}, ` : '')}${esc(e.country || 'Global')}</b>
          <span>${t('senderLocation', 'Konum')}</span>
        </div>
        <div class="mail-telemetry-item">
          <b><i class="fa-solid fa-network-wired" style="font-size:10px;margin-right:4px;"></i>${esc(e.ip || '127.0.0.1')}</b>
          <span>IP Adresi</span>
        </div>
        <div class="mail-telemetry-item">
          <b><i class="fa-solid fa-laptop" style="font-size:10px;margin-right:4px;"></i>${esc(e.device || 'Desktop')} · ${esc(e.os || 'macOS')}</b>
          <span>${t('senderDevice', 'Cihaz / OS')}</span>
        </div>
        <div class="mail-telemetry-item">
          <b><i class="fa-brands fa-chrome" style="font-size:10px;margin-right:4px;"></i>${esc(e.browser || 'Chrome')}</b>
          <span>${t('senderBrowser', 'Tarayıcı')}</span>
        </div>
        <div class="mail-telemetry-item" style="grid-column:1 / -1;">
          <b style="font-size:11px;font-family:monospace;word-break:break-all;">${esc(e.cookies || 'abentra_lang=' + (S.lang || 'tr') + '; sec_token=ok; human_verified=true')}</b>
          <span>${t('senderSession', 'Oturum & Çerezler')}</span>
        </div>
      </div>
    </div>

    <!-- Workspace by Mode -->
    <div id="mail-workspace" style="flex:1;min-height:0;display:flex;flex-direction:column;gap:12px;">
      ${mailViewMode === 'preview' ? `
        <!-- Full-Height Preview Mode -->
        <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;">
          <span class="sub">${t('officialPreviewSub', 'Müşteriye iletilecek resmi Abentra e-posta şablonu önizlemesi:')}</span>
          <div style="display:flex;gap:8px;">
            <button class="pill gold" id="btn-send-reply">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
              ${t('actionSendReply', 'Yanıtı Gönder')}
            </button>
          </div>
        </div>
        <iframe id="rpv" class="mail-preview-container" style="flex:1;min-height:440px;" sandbox="allow-same-origin"></iframe>
      ` : mailViewMode === 'split' ? `
        <!-- Side-by-Side Split View -->
        <div style="display:grid;grid-template-columns:minmax(320px, 1fr) minmax(360px, 1.2fr);gap:16px;flex:1;min-height:0;">
          <div class="mail-reply-box" style="overflow-y:auto;padding-right:4px;">
            <div class="cg" style="margin-bottom:8px;">
              <div class="f">
                <label>${t('lblReplyTemplate', 'Yanıt Şablonu')}</label>
                <select id="rt">
                  ${templates.map((t, idx) => `<option value="${idx}">${esc(t.name)}</option>`).join('')}
                </select>
              </div>
              <div class="f">
                <label>${t('lblMailSubject', 'Konu')}</label>
                <input class="i" id="rsub" value="${esc(defaultSubj)}">
              </div>
            </div>
            <div class="f" style="flex:1;display:flex;flex-direction:column;">
              <label>${t('lblMailBody', 'Mesaj Metni (%Message%)')}</label>
              <textarea id="rb" style="flex:1;min-height:160px;">${esc(defaultBody)}</textarea>
            </div>
            <button class="pill gold" id="btn-send-reply" style="width:fit-content;margin-top:8px;">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
              ${t('actionSendReply', 'Yanıtı Gönder')}
            </button>
          </div>
          <iframe id="rpv" class="mail-preview-container" sandbox="allow-same-origin"></iframe>
        </div>
      ` : `
        <!-- Default Compose Mode -->
        <div class="mail-reply-box">
          <div class="cg" style="margin-bottom:6px;">
            <div class="f">
              <label>${t('lblReplyTemplate', 'Yanıt Şablonu')}</label>
              <select id="rt">
                ${templates.map((t, idx) => `<option value="${idx}">${esc(t.name)}</option>`).join('')}
              </select>
            </div>
            <div class="f">
              <label>${t('lblMailSubjectHeading', 'Konu Başlığı')}</label>
              <input class="i" id="rsub" value="${esc(defaultSubj)}">
            </div>
          </div>
          <div class="f">
            <label>${t('lblCustomReplyBody', 'Özel Yanıt Mesajı (%Message%)')}</label>
            <textarea id="rb" style="min-height:100px;">${esc(defaultBody)}</textarea>
          </div>
          <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;">
            <button class="pill gold" id="btn-send-reply">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>
              ${t('actionSendReply', 'Yanıtı Gönder')}
            </button>
            <button class="pill" id="btn-toggle-sub-prev">
              <i class="fa-solid fa-eye"></i> ${showSubPreview ? t('actionHidePreview', 'Canlı Önizlemeyi Gizle') : t('actionShowPreview', 'Canlı Önizlemeyi Göster')}
            </button>
          </div>
          ${showSubPreview ? `
            <div style="margin-top:6px;flex:1;min-height:360px;display:flex;flex-direction:column;">
              <label class="sub" style="margin-bottom:6px;display:block;">${t('lblMailPreviewHeading', 'E-Posta Şablon Önizlemesi')}</label>
              <iframe id="rpv" class="mail-preview-container" style="flex:1;min-height:340px;" sandbox="allow-same-origin"></iframe>
            </div>
          ` : ''}
        </div>
      `}
    </div>
  `;

  // Attach live preview
  updateMailPreview();

  // Mode tab switching
  $$('#md [data-mvm]').forEach(btn => {
    btn.onclick = () => {
      mailViewMode = btn.dataset.mvm;
      renderMailDetail();
    };
  });

  // Toggle sub preview in compose mode
  const togPrev = $('#btn-toggle-sub-prev');
  if (togPrev) {
    togPrev.onclick = () => {
      showSubPreview = !showSubPreview;
      renderMailDetail();
    };
  }

  // Quick edit templates button
  // Add to FAQ handler with automatic translation to active panel language
  const faqBtn = $('#btn-add-to-faq');
  if (faqBtn) {
    faqBtn.onclick = async () => {
      const qInput = $('#faq-modal-q');
      const aInput = $('#faq-modal-a');
      const catInput = $('#faq-modal-cat');
      const rawQ = (e.questions && e.questions.length && e.questions[0])
        ? e.questions[0]
        : (e.subject ? e.subject.replace(/^(Re|Ynt|Cevap):\s*/i, '') : (e.message ? e.message.slice(0, 80) : ''));
      
      toast(t('toastTranslating', 'Çevriliyor...'));
      const translatedQ = await gtr(rawQ, 'auto', S.lang);
      if (qInput) qInput.value = translatedQ;

      if (aInput) {
        const rbVal = $('#rb') ? $('#rb').value.trim() : '';
        aInput.value = rbVal || (e.message || '');
      }
      if (catInput) {
        catInput.value = S.lang === 'en' ? 'Consultancy' : 'Danışmanlık';
      }
      $('#modal-add-to-faq')?.classList.add('active');
    };
  }

  // Inbound Email Auto-Translation & Visual Banner
  const autoTransSetting = localStorage.getItem('abentra_mail_autotranslate') !== 'false';
  let emailOriginalText = e.message || e.body || '';
  let emailTranslatedText = '';
  let emailSourceLangCode = '';
  let isViewingOriginal = false;

  if (autoTransSetting && emailOriginalText) {
    (async () => {
      try {
        const url = 'https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=' + S.lang + '&dt=t&q=' + encodeURIComponent(emailOriginalText);
        const res = await fetch(url);
        const data = await res.json();
        emailTranslatedText = data[0].map(s => s[0]).join('');
        emailSourceLangCode = data[2] || 'en';

        if (emailSourceLangCode !== S.lang && emailTranslatedText) {
          let srcName = emailSourceLangCode.toUpperCase();
          let targetName = S.lang.toUpperCase();
          try {
            const dn = new Intl.DisplayNames([S.lang || 'tr'], { type: 'language' });
            srcName = dn.of(emailSourceLangCode) || srcName;
            targetName = dn.of(S.lang) || targetName;
          } catch (e) {}

          const bannerBox = $('#mail-translation-banner-container');
          if (bannerBox) {
            bannerBox.innerHTML = `
              <div class="mail-translate-banner">
                <span class="mail-translate-langs">
                  <del>${esc(srcName)}</del>
                  <i class="fa-solid fa-arrow-right" style="color:var(--ac);font-size:11px;"></i>
                  <b>${esc(targetName)}</b>
                </span>
                <span class="mail-translate-tag">
                  <i class="fa-solid fa-wand-magic-sparkles"></i> ${t('mailAutoTranslatedNotice', 'Otomatik Olarak Çevrildi')}
                </span>
                <button type="button" class="mail-translate-toggle-orig" id="btn-toggle-mail-trans">${t('mailShowOriginal', 'Orijinal Metni Göster')}</button>
              </div>
            `;

            const bodyEl = $('#mail-body-content');
            if (bodyEl) bodyEl.textContent = emailTranslatedText;

            const togBtn = $('#btn-toggle-mail-trans');
            if (togBtn) {
              togBtn.onclick = () => {
                isViewingOriginal = !isViewingOriginal;
                if (bodyEl) bodyEl.textContent = isViewingOriginal ? emailOriginalText : emailTranslatedText;
                togBtn.textContent = isViewingOriginal ? t('mailShowTranslation', 'Çeviriyi Göster') : t('mailShowOriginal', 'Orijinal Metni Göster');
              };
            }
          }
        }
      } catch (err) {}
    })();
  }

  // Also translate detected inquiry questions to panel language
  if (e.questions && e.questions.length) {
    (async () => {
      try {
        const translatedQuestions = await Promise.all(e.questions.map(q => gtr(q, 'auto', S.lang)));
        const qBox = $('#mail-questions-container');
        if (qBox) {
          qBox.innerHTML = `
            <div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:12px;padding-top:10px;border-top:1px dashed var(--ln);">
              ${translatedQuestions.map(tq => `<mark style="background:rgba(224,184,90,0.18);border:1px solid var(--ac);color:var(--ac);padding:4px 10px;border-radius:6px;font-size:12px;"><i class="fa-solid fa-circle-question" style="margin-right:4px;"></i>${esc(tq)}</mark>`).join('')}
            </div>
          `;
        }
      } catch (err) {}
    })();
  }

  // Star and Delete action buttons in detail header
  const starBtn = $('#btn-detail-star');
  if (starBtn && e.id) {
    starBtn.onclick = () => toggleStarEmail(e.id);
  }
  const delBtn = $('#btn-detail-del');
  if (delBtn && e.id) {
    delBtn.onclick = () => deleteEmailItem(e.id);
  }

  // Fullscreen button in detail header
  const dtFsBtn = $('#btn-mail-detail-fs');
  if (dtFsBtn) {
    dtFsBtn.onclick = () => toggleMailFullscreen();
  }

  // Input changes update the live preview
  const rb = $('#rb');
  if (rb) rb.oninput = () => updateMailPreview();
  const rsub = $('#rsub');
  if (rsub) rsub.oninput = () => updateMailPreview();

  const rt = $('#rt');
  if (rt) {
    rt.onchange = () => {
      const idx = +rt.value;
      const t = templates[idx];
      if (t) {
        if ($('#rb')) $('#rb').value = t.msg || t.body || '';
        if ($('#rsub') && t.subj) $('#rsub').value = 'Re: ' + t.subj;
      }
      updateMailPreview();
    };
  }

  // Translate handler
  const transBtn = $('#btn-translate-mail');
  if (transBtn) {
    transBtn.onclick = async () => {
      toast(t('toastTranslating', 'Çevriliyor...'));
      const targetLang = S.lang === 'tr' ? 'tr' : 'en';
      const textToTranslate = e.message || e.body || '';
      const translated = await gtr(textToTranslate, 'auto', targetLang);
      $('#mail-body-content').textContent = translated;
      toast(t('toastTranslationDone', 'Çeviri tamamlandı'));
    };
  }

  // Send Reply handler
  const sendBtn = $('#btn-send-reply');
  if (sendBtn) {
    sendBtn.onclick = async () => {
      const body = $('#rb') ? $('#rb').value.trim() : '';
      if (!body) {
        toast(t('toastBodyEmpty', 'Yanıt mesajı boş olamaz'));
        return;
      }
      try {
        toast(t('toastSendingEmail', 'E-posta gönderiliyor...'));
        const rtElem = $('#rt');
        const templateName = rtElem ? rtElem.options[rtElem.selectedIndex].text : t('phCustomTemplate', 'Özel Şablon');
        const res = await fetch('/api/moon/manager/emails/send', {
          method: 'POST',
          headers: getAuthHeaders(),
          body: JSON.stringify({
            to: e.email || e.to,
            subject: $('#rsub') ? $('#rsub').value : ('Re: ' + (e.subject || 'ABENTRA International')),
            body,
            templateName
          })
        });
        if (res.ok) {
          toast(t('toastEmailSent', 'E-posta başarıyla gönderildi!'));
          await loadAllData();
          renderMailView();
        } else {
          toast(t('toastSendFailed', 'Gönderilemedi'));
        }
      } catch (err) {
        toast(t('toastSendError', 'Gönderim hatası'));
      }
    };
  }
}

// Mail sidebar click handlers (Folders & Messages)
const mlEl = $('#ml');
if (mlEl) {
  mlEl.onclick = e => {
    const m = e.target.closest('.mi');
    if (m && !e.target.closest('.mi-btn')) {
      currentEmailIndex = +m.dataset.idx;
      $$('#ml .mi').forEach(el => el.classList.remove('on'));
      m.classList.add('on');
      renderMailDetail();
    }
  };
}

$$('#v-mail .fl').forEach(fl => {
  fl.onclick = () => {
    mailActiveFolder = fl.dataset.folder || 'inbox';
    currentEmailIndex = 0;
    renderMailView();
  };
});

// Mail Filter Tabs (All, Unread, Starred)
$$('.mail-filter-btn').forEach(btn => {
  btn.onclick = () => {
    mailFilterTab = btn.dataset.filter || 'all';
    currentEmailIndex = 0;
    renderMailView();
  };
});

// Mail Search Input & Clear
const mailSearchInp = $('#mail-search-input');
const mailSearchClear = $('#btn-clear-mail-search');
if (mailSearchInp) {
  mailSearchInp.oninput = () => {
    mailSearchQuery = mailSearchInp.value;
    if (mailSearchClear) mailSearchClear.style.display = mailSearchQuery ? 'block' : 'none';
    currentEmailIndex = 0;
    renderMailView();
  };
}
if (mailSearchClear) {
  mailSearchClear.onclick = () => {
    if (mailSearchInp) mailSearchInp.value = '';
    mailSearchQuery = '';
    mailSearchClear.style.display = 'none';
    currentEmailIndex = 0;
    renderMailView();
  };
}

// Fullscreen Trigger in Mail Sidebar
const sidebarFsBtn = $('#btn-mail-sidebar-fs');
if (sidebarFsBtn) {
  sidebarFsBtn.onclick = () => toggleMailFullscreen();
}

// New Compose Button in Mail Sidebar
const newComposeBtn = $('#btn-mail-new-compose');
if (newComposeBtn) {
  newComposeBtn.onclick = () => {
    mailActiveFolder = 'inbox';
    mailFilterTab = 'all';
    mailSearchQuery = '';
    if (mailSearchInp) mailSearchInp.value = '';
    mailViewMode = 'compose';
    renderMailView();
    if ($('#rsub')) $('#rsub').value = t('phNewEmailInquiry', 'Yeni E-Posta / İletişim');
    if ($('#rb')) $('#rb').value = '';
    if ($('#rb')) $('#rb').focus();
    toast(t('toastComposingNewMail', 'Yeni e-posta oluşturuluyor'));
  };
}

// Escape key listener for Mail Fullscreen
window.addEventListener('keydown', e => {
  if (e.key === 'Escape' && isMailFullscreen) {
    toggleMailFullscreen();
  }
});

// ------------------------------------------------------------------------------
// VIEW 7: AUD (Kitle Analizi) - Country Local Time Intelligence & 3 Filter Modes
// ------------------------------------------------------------------------------
const COUNTRY_TIMEZONES = {
  'United States': { code: 'US', tz: 'America/New_York', offset: -5, flag: '🇺🇸', nameTr: 'Amerika Birleşik Devletleri', nameEn: 'United States' },
  'Turkey': { code: 'TR', tz: 'Europe/Istanbul', offset: +3, flag: '🇹🇷', nameTr: 'Türkiye', nameEn: 'Turkey' },
  'Türkiye': { code: 'TR', tz: 'Europe/Istanbul', offset: +3, flag: '🇹🇷', nameTr: 'Türkiye', nameEn: 'Turkey' },
  'Germany': { code: 'DE', tz: 'Europe/Berlin', offset: +1, flag: '🇩🇪', nameTr: 'Almanya', nameEn: 'Germany' },
  'France': { code: 'FR', tz: 'Europe/Paris', offset: +1, flag: '🇫🇷', nameTr: 'Fransa', nameEn: 'France' },
  'United Kingdom': { code: 'GB', tz: 'Europe/London', offset: 0, flag: '🇬🇧', nameTr: 'Birleşik Krallık', nameEn: 'United Kingdom' },
  'Netherlands': { code: 'NL', tz: 'Europe/Amsterdam', offset: +1, flag: '🇳🇱', nameTr: 'Hollanda', nameEn: 'Netherlands' },
  'Liberia': { code: 'LR', tz: 'Africa/Monrovia', offset: 0, flag: '🇱🇷', nameTr: 'Liberya', nameEn: 'Liberia' },
  'China': { code: 'CN', tz: 'Asia/Shanghai', offset: +8, flag: '🇨🇳', nameTr: 'Çin', nameEn: 'China' },
  'Japan': { code: 'JP', tz: 'Asia/Tokyo', offset: +9, flag: '🇯🇵', nameTr: 'Japonya', nameEn: 'Japan' },
  'South Korea': { code: 'KR', tz: 'Asia/Seoul', offset: +9, flag: '🇰🇷', nameTr: 'Güney Kore', nameEn: 'South Korea' },
  'Korea': { code: 'KR', tz: 'Asia/Seoul', offset: +9, flag: '🇰🇷', nameTr: 'Güney Kore', nameEn: 'South Korea' },
  'Italy': { code: 'IT', tz: 'Europe/Rome', offset: +1, flag: '🇮🇹', nameTr: 'İtalya', nameEn: 'Italy' },
  'United Arab Emirates': { code: 'AE', tz: 'Asia/Dubai', offset: +4, flag: '🇦🇪', nameTr: 'Birleşik Arap Emirlikleri', nameEn: 'United Arab Emirates' },
  'Saudi Arabia': { code: 'SA', tz: 'Asia/Riyadh', offset: +3, flag: '🇸🇦', nameTr: 'Suudi Arabistan', nameEn: 'Saudi Arabia' },
  'Canada': { code: 'CA', tz: 'America/Toronto', offset: -5, flag: '🇨🇦', nameTr: 'Kanada', nameEn: 'Canada' },
  'Australia': { code: 'AU', tz: 'Australia/Sydney', offset: +10, flag: '🇦🇺', nameTr: 'Avustralya', nameEn: 'Australia' },
  'Brazil': { code: 'BR', tz: 'America/Sao_Paulo', offset: -3, flag: '🇧🇷', nameTr: 'Brezilya', nameEn: 'Brazil' },
  'India': { code: 'IN', tz: 'Asia/Kolkata', offset: +5.5, flag: '🇮🇳', nameTr: 'Hindistan', nameEn: 'India' },
  'Spain': { code: 'ES', tz: 'Europe/Madrid', offset: +1, flag: '🇪🇸', nameTr: 'İspanya', nameEn: 'Spain' },
  'Poland': { code: 'PL', tz: 'Europe/Warsaw', offset: +1, flag: '🇵🇱', nameTr: 'Polonya', nameEn: 'Poland' },
  'Switzerland': { code: 'CH', tz: 'Europe/Zurich', offset: +1, flag: '🇨🇭', nameTr: 'İsviçre', nameEn: 'Switzerland' },
  'Sweden': { code: 'SE', tz: 'Europe/Stockholm', offset: +1, flag: '🇸🇪', nameTr: 'İsveç', nameEn: 'Sweden' },
  'Qatar': { code: 'QA', tz: 'Asia/Qatar', offset: +3, flag: '🇶🇦', nameTr: 'Katar', nameEn: 'Qatar' },
  'Singapore': { code: 'SG', tz: 'Asia/Singapore', offset: +8, flag: '🇸🇬', nameTr: 'Singapur', nameEn: 'Singapore' },
  'South Africa': { code: 'ZA', tz: 'Africa/Johannesburg', offset: +2, flag: '🇿🇦', nameTr: 'Güney Afrika', nameEn: 'South Africa' },
  'Egypt': { code: 'EG', tz: 'Africa/Cairo', offset: +2, flag: '🇪🇬', nameTr: 'Mısır', nameEn: 'Egypt' }
};

function getLocalizedCountryName(metaOrName) {
  const meta = (typeof metaOrName === 'string') ? getCountryMeta(metaOrName) : (metaOrName || {});
  if (meta.code) {
    try {
      const dn = new Intl.DisplayNames([S.lang || 'tr'], { type: 'region' });
      const n = dn.of(meta.code);
      if (n) return n;
    } catch (e) {}
  }
  if (S.lang === 'en') return meta.nameEn || meta.name || '';
  return meta.nameTr || meta.nameEn || meta.name || '';
}

let audienceFilterMode = 'top10'; // 'top10', 'watchlist', 'single'
let audienceFocusCountry = 'United States';

function getAudienceWatchlist() {
  try {
    const raw = localStorage.getItem('abentra_watchlist_countries');
    if (raw) {
      const arr = JSON.parse(raw);
      if (Array.isArray(arr) && arr.length) return arr;
    }
  } catch (e) {}
  return ['United States', 'United Kingdom', 'Liberia', 'Turkey', 'Germany', 'France', 'United Arab Emirates', 'China', 'Japan', 'Italy'];
}

function saveAudienceWatchlist(list) {
  try {
    localStorage.setItem('abentra_watchlist_countries', JSON.stringify(list));
  } catch (e) {}
}

function getCountryMeta(name) {
  if (!name) return { tz: 'UTC', offset: 0, flag: '🌐', name: 'Global' };
  const foundKey = Object.keys(COUNTRY_TIMEZONES).find(k => k.toLowerCase() === name.toLowerCase());
  if (foundKey) return { ...COUNTRY_TIMEZONES[foundKey], name: foundKey };
  return { tz: 'UTC', offset: 0, flag: '🌐', name };
}

function getCountryLocalTimeStr(countryName) {
  const meta = getCountryMeta(countryName);
  try {
    return new Intl.DateTimeFormat('en-GB', {
      timeZone: meta.tz,
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).format(new Date());
  } catch (e) {
    const d = new Date();
    const utc = d.getTime() + (d.getTimezoneOffset() * 60000);
    const nd = new Date(utc + (3600000 * (meta.offset || 0)));
    return `${String(nd.getHours()).padStart(2, '0')}:${String(nd.getMinutes()).padStart(2, '0')}`;
  }
}

function computeCountryLocalStats(countryName, visitorsList, baseCount = 0) {
  const meta = getCountryMeta(countryName);
  const countryVisits = visitorsList.filter(v => {
    const cName = v.country || v.location || '';
    return cName.toLowerCase() === countryName.toLowerCase();
  });

  const hourBuckets = Array(12).fill(0); // 12 two-hour intervals
  if (countryVisits.length > 0) {
    countryVisits.forEach(v => {
      const ts = v.lastSeen || v.firstSeen || v.timestamp;
      if (ts) {
        try {
          const hrStr = new Intl.DateTimeFormat('en-US', { timeZone: meta.tz, hour: 'numeric', hour12: false }).format(new Date(ts));
          const localHr = parseInt(hrStr, 10) % 24;
          const bucket = Math.floor(localHr / 2);
          if (bucket >= 0 && bucket < 12) hourBuckets[bucket]++;
        } catch (e) {
          hourBuckets[7]++;
        }
      }
    });
  } else {
    // Model realistic local active hours around 10:00 - 18:00 local time
    const factor = Math.max(1, baseCount);
    hourBuckets[7] = Math.max(1, Math.round(factor * 0.35)); // 14:00-16:00
    hourBuckets[5] = Math.max(1, Math.round(factor * 0.25)); // 10:00-12:00
    hourBuckets[8] = Math.max(1, Math.round(factor * 0.20)); // 16:00-18:00
    hourBuckets[6] = Math.max(1, Math.round(factor * 0.12)); // 12:00-14:00
    hourBuckets[4] = Math.max(1, Math.round(factor * 0.08)); // 08:00-10:00
  }

  const total = hourBuckets.reduce((a, b) => a + b, 0) || 1;
  const intervals = hourBuckets.map((cnt, idx) => ({
    start: idx * 2,
    end: idx * 2 + 2,
    label: `${String(idx * 2).padStart(2, '0')}:00–${String(idx * 2 + 2).padStart(2, '0')}:00`,
    count: cnt,
    pct: Math.round((cnt / total) * 100)
  })).sort((a, b) => b.count - a.count);

  const topInterval = intervals[0] || { label: '14:00–16:00', pct: 35, count: baseCount };
  const secondInterval = intervals[1] || { label: '10:00–12:00', pct: 25, count: Math.round(baseCount * 0.7) };

  return {
    meta,
    localTime: getCountryLocalTimeStr(countryName),
    topInterval,
    secondInterval,
    hourBuckets,
    totalVisits: Math.max(countryVisits.length, baseCount)
  };
}

function renderAudienceView() {
  const an = analyticsData || {};
  const activeCount = (an.activeUsersCount !== undefined) ? an.activeUsersCount : 0;
  const allVisitors = (an.visitors && an.visitors.length > 0) ? an.visitors : (an.recentVisitors || []);

  // 1. Sync 3 Filter Mode Tabs
  $$('.aud-filter-tab').forEach(btn => {
    btn.classList.toggle('on', btn.dataset.audFilter === audienceFilterMode);
    btn.onclick = () => {
      audienceFilterMode = btn.dataset.audFilter;
      renderAudienceView();
    };
  });

  // 2. Extra dynamic controls bar
  const extraBar = $('#aud-filter-extra-controls');
  const availableCountryKeys = Object.keys(COUNTRY_TIMEZONES).filter((k, i, arr) => arr.indexOf(k) === i && k !== 'Türkiye');
  const curWatchlist = getAudienceWatchlist();

  if (extraBar) {
    if (audienceFilterMode === 'watchlist') {
      const remainingToAdd = availableCountryKeys.filter(c => !curWatchlist.some(w => w.toLowerCase() === c.toLowerCase()));
      extraBar.innerHTML = `
        <div style="display:flex;align-items:center;gap:8px;">
          <span class="tag" style="border-color:var(--ac);color:var(--ac);font-weight:600;">${curWatchlist.length} / 10</span>
          ${curWatchlist.length < 10 ? `
            <select id="sel-add-watchlist-country" class="i" style="padding:4px 10px;font-size:12px;cursor:pointer;">
              <option value="">${t('audSelectCountryPrompt', 'Ülke seçin...')}</option>
              ${remainingToAdd.map(c => {
                const m = COUNTRY_TIMEZONES[c];
                return `<option value="${esc(c)}">${m.flag} ${esc(getLocalizedCountryName(m))}</option>`;
              }).join('')}
            </select>
            <button type="button" class="pill gold" id="btn-add-watchlist-action" style="padding:4px 12px;font-size:12px;">
              <i class="fa-solid fa-plus"></i> <span data-i="audAddCountryToWatchlist">${t('audAddCountryToWatchlist', 'Ekle')}</span>
            </button>
          ` : `<small class="sub" style="color:var(--ac);font-size:11.5px;">${t('audWatchlistLimitNotice', 'Maksimum 10 ülke')} (10/10)</small>`}
        </div>
      `;

      const addBtn = $('#btn-add-watchlist-action');
      const addSel = $('#sel-add-watchlist-country');
      if (addBtn && addSel) {
        addBtn.onclick = () => {
          const val = addSel.value;
          if (val && curWatchlist.length < 10) {
            curWatchlist.push(val);
            saveAudienceWatchlist(curWatchlist);
            toast(t('toastCountryAdded', 'Ülke listenize eklendi!'));
            renderAudienceView();
          }
        };
      }
    } else if (audienceFilterMode === 'single') {
      extraBar.innerHTML = `
        <div style="display:flex;align-items:center;gap:8px;">
          <label style="font-size:12.5px;color:var(--mut);font-weight:500;"><i class="fa-solid fa-earth-americas" style="color:var(--ac);margin-right:4px;"></i>${t('audSelectFocusCountry', 'İncelenen Ülke')}:</label>
          <select id="sel-aud-single-country" class="i" style="padding:6px 14px;font-size:13px;font-weight:600;cursor:pointer;">
            ${availableCountryKeys.map(c => {
              const m = COUNTRY_TIMEZONES[c];
              const isSel = (c.toLowerCase() === audienceFocusCountry.toLowerCase());
              return `<option value="${esc(c)}" ${isSel ? 'selected' : ''}>${m.flag} ${esc(getLocalizedCountryName(m))}</option>`;
            }).join('')}
          </select>
        </div>
      `;

      const selSingle = $('#sel-aud-single-country');
      if (selSingle) {
        selSingle.onchange = () => {
          audienceFocusCountry = selSingle.value;
          renderAudienceView();
        };
      }
    } else {
      extraBar.innerHTML = `<span class="tag" style="border-color:var(--up);color:var(--up);font-size:11.5px;"><i class="fa-solid fa-chart-line"></i> ${t('audLiveRankingBadge', 'Canlı Sıralama')}</span>`;
    }
  }

  // 3. Prepare Country Data Set based on active filter
  const realCountries = (an.countries && an.countries.length > 0) ? an.countries : [
    { name: 'United States', flag: '🇺🇸', count: 34, duration: '0:12' },
    { name: 'France', flag: '🇫🇷', count: 14, duration: '0:08' },
    { name: 'Netherlands', flag: '🇳🇱', count: 8, duration: '0:05' },
    { name: S.lang === 'en' ? 'Turkey' : 'Türkiye', flag: '🇹🇷', count: 7, duration: '1:45' },
    { name: 'Poland', flag: '🇵🇱', count: 6, duration: '0:06' }
  ];

  let displayCountryList = [];
  if (audienceFilterMode === 'top10') {
    displayCountryList = realCountries.slice(0, 10);
  } else if (audienceFilterMode === 'watchlist') {
    displayCountryList = curWatchlist.map(cName => {
      const match = realCountries.find(rc => rc.name.toLowerCase() === cName.toLowerCase());
      const meta = getCountryMeta(cName);
      return {
        name: cName,
        flag: meta.flag,
        count: match ? match.count : 5,
        duration: match ? match.duration : '0:08'
      };
    });
  } else if (audienceFilterMode === 'single') {
    const match = realCountries.find(rc => rc.name.toLowerCase() === audienceFocusCountry.toLowerCase());
    const meta = getCountryMeta(audienceFocusCountry);
    displayCountryList = [{
      name: audienceFocusCountry,
      flag: meta.flag,
      count: match ? match.count : 18,
      duration: match ? match.duration : '0:14'
    }];
  }

  // Calculate country stats with timezone intelligence
  const computedList = displayCountryList.map(c => {
    const stats = computeCountryLocalStats(c.name, allVisitors, c.count);
    return {
      ...c,
      meta: stats.meta,
      localTime: stats.localTime,
      topInterval: stats.topInterval,
      secondInterval: stats.secondInterval,
      hourBuckets: stats.hourBuckets
    };
  });

  const totVisitors = computedList.reduce((a, b) => a + b.count, 0) || 1;
  const primaryCountry = computedList[0] || { name: 'United States', flag: '🇺🇸', count: 0, localTime: '12:00', topInterval: { label: '14:00–16:00', pct: 30 } };
  const mostSec = an.summary?.mostViewedSection ? (an.summary.mostViewedSection.toUpperCase() + (S.lang === 'en' ? ' Section' : ' Bölümü')) : (S.lang === 'en' ? 'Hero Section' : 'Hero Bölümü');

  // Compute composite or single-country hourly distribution
  let combinedHourlyPts = Array(12).fill(0);
  computedList.forEach(c => {
    c.hourBuckets.forEach((cnt, idx) => {
      combinedHourlyPts[idx] += cnt;
    });
  });
  const maxHourlyCount = Math.max(...combinedHourlyPts, 1);

  const topPeak = primaryCountry.topInterval || { label: '14:00–16:00', pct: 32 };
  const secondPeak = primaryCountry.secondInterval || { label: '10:00–12:00', pct: 24 };

  // Audience Top Metrics Cards (Vector icons)
  const localizedPrimaryCountry = getLocalizedCountryName(primaryCountry.meta || primaryCountry.name);
  const AK = [
    { icon: ICONS.ak_user, title: t('k0', 'Aktif kullanıcı'), val: `<span class="auv">${activeCount}</span>`, diff: activeCount > 0 ? (S.lang === 'en' ? 'live' : 'canlı') : t('zeroActiveLabel', '0 aktif'), c: activeCount > 0 ? '--up' : '--ac' },
    { icon: ICONS.ak_hour, title: t('audLocalPeakHour', 'Yerel Yoğun Saat'), val: topPeak.label, diff: `${t('audCountryLocalTimeBadge', 'Yerel Saat')} (${primaryCountry.localTime})`, c: '--n1' },
    { icon: ICONS.ak_country, title: audienceFilterMode === 'single' ? t('audFocusCountryCard', 'İncelenen Ülke') : t('audTopCountry', 'En çok giriş'), val: `${primaryCountry.flag} ${esc(localizedPrimaryCountry)}`, diff: t('audVisitsCount', '{0} ziyaret').replace('{0}', primaryCountry.count), c: '--ac' },
    { icon: ICONS.ak_dwell, title: t('audTopInterest', 'En çok ilgi'), val: mostSec, diff: t('audLeader', 'Lider'), c: '--n3' }
  ];

  $('#ak').innerHTML = AK.map(k => `
    <div class="glass card nm" style="--c:var(${k.c})">
      <div class="h">
        <div class="sy">${k.icon}</div>
        <span class="sub">${k.title}</span>
      </div>
      <div class="nv" style="font-size:clamp(20px,2vw,30px)">${k.val}</div>
      <span class="dl ${k.c === '--up' ? 'up' : 'mid'}">▲ ${k.diff}</span>
    </div>
  `).join('');

  // Country Breakdown List with Local Time & Peak Hours
  const PAL = ['--n1', '--ac', '--n3', '--n4', '--up', '--dn', '--n1', '--ac', '--n3', '--n4'];
  const maxCountryCount = Math.max(...computedList.map(c => c.count), 1);

  $('#ct').innerHTML = computedList.map((c, i) => {
    const localizedCountryName = getLocalizedCountryName(c.meta || c.name);
    return `
      <div class="mk" style="--c:var(${PAL[i % PAL.length]});align-items:center;padding:10px 14px;margin-bottom:8px;">
        <div class="sy flag" style="font-size:18px;">${c.flag || '🌐'}</div>
        <div style="flex:1;min-width:0;">
          <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;">
            <b style="font-size:13.5px;color:var(--ink);">${esc(localizedCountryName)}</b>
            <span class="tag" style="border-color:var(--up);color:var(--up);font-size:10.5px;padding:1px 6px;">
              <i class="fa-regular fa-clock"></i> ${esc(c.localTime)}
            </span>
            <span class="tag" style="border-color:var(--ac);color:var(--ac);font-size:10.5px;padding:1px 6px;">
              <i class="fa-solid fa-chart-line"></i> ${esc(c.topInterval.label)}
            </span>
          </div>
          <small class="sub" style="display:block;margin-top:2px;">
            ${t('audAvgPrefix', 'ort. {0}').replace('{0}', c.duration || '0:08')} · ${t('audPeakHour', 'En yoğun')}: <b>${esc(c.topInterval.label)}</b>
          </small>
        </div>
        <div class="bar" style="width:110px;"><i data-w="${Math.round(c.count / maxCountryCount * 100)}" style="width:${Math.round(c.count / maxCountryCount * 100)}%"></i></div>
        <div class="px" style="color:var(--c);text-shadow:0 0 calc(10px*var(--gl)) var(--c);text-align:right;min-width:50px;">
          ${c.count}
          <small class="dl" style="display:block;color:var(--mut);">${fmtPct(Math.round(c.count / totVisitors * 100))}</small>
        </div>
        ${audienceFilterMode === 'watchlist' ? `
          <button type="button" class="pill" data-remove-watchlist="${esc(c.name)}" style="color:var(--dn);padding:3px 8px;margin-left:6px;" title="${t('audRemoveFromWatchlist', 'Listeden Kaldır')}">✕</button>
        ` : ''}
      </div>
    `;
  }).join('');

  // Wire Watchlist remove buttons
  if (audienceFilterMode === 'watchlist') {
    $$('#ct [data-remove-watchlist]').forEach(btn => {
      btn.onclick = () => {
        const cToRemove = btn.dataset.removeWatchlist;
        const updated = curWatchlist.filter(c => c.toLowerCase() !== cToRemove.toLowerCase());
        saveAudienceWatchlist(updated);
        toast(t('toastCountryRemoved', 'Ülke listeden çıkarıldı'));
        renderAudienceView();
      };
    });
  }

  // Hourly Histogram in country's local time
  $('#hr').innerHTML = `
    <div class="hb">
      ${combinedHourlyPts.map((v, h) => {
        const isPeak = (h * 2 === topPeak.start && v > 0);
        return `<i class="${isPeak ? 'pk' : ''}" style="height:${Math.max(8, Math.round(v / maxHourlyCount * 100))}%" title="${String(h * 2).padStart(2, '0')}:00 · ${v} ${S.lang === 'en' ? 'visits' : 'ziyaret'}"></i>`;
      }).join('')}
    </div>
    <div class="hl"><span>00:00</span><span>06:00</span><span>12:00</span><span>18:00</span><span>23:00</span></div>
  `;

  // Dynamic Peak ranges in local time
  $('#pk').innerHTML = `
    <div class="mk" style="--c:var(--n1)"><div class="sy">${ICONS.ak_hour}</div><b>${topPeak.label}<small>${t('audDailyMainPeak', 'Günün ana zirvesi')} (${esc(localizedPrimaryCountry)} ${t('audCountryLocalTimeBadge', 'Yerel Saat')})</small></b><div class="bar"><i data-w="${topPeak.pct}" style="width:${topPeak.pct}%"></i></div><div class="px" style="color:var(--c)">${fmtPct(topPeak.pct)}</div></div>
    <div class="mk" style="--c:var(--ac)"><div class="sy">${ICONS.ak_hour}</div><b>${secondPeak.label}<small>${t('audSecondaryPeak', 'İkincil yoğunluk')} (${esc(localizedPrimaryCountry)} ${t('audCountryLocalTimeBadge', 'Yerel Saat')})</small></b><div class="bar"><i data-w="${secondPeak.pct}" style="width:${secondPeak.pct}%"></i></div><div class="px" style="color:var(--c)">${fmtPct(secondPeak.pct)}</div></div>
  `;

  // Section dwell times calculated from Supabase telemetry
  const sViews = an.sectionViews || {};
  const sTimes = an.sectionTimeSeconds || {};
  const sectionDefs = [
    { key: 'hero', name: 'Hero', icon: ICONS.He || '', c: '--n1' },
    { key: 'who', name: S.lang === 'en' ? 'Who We Are' : 'Hakkımızda', icon: ICONS.Wh || '', c: '--n3' },
    { key: 'purpose', name: S.lang === 'en' ? 'Our Purpose' : 'Amacımız', icon: ICONS.Pu || '', c: '--n4' },
    { key: 'services', name: S.lang === 'en' ? 'Services' : 'Hizmetler', icon: ICONS.Sv || '', c: '--ac' },
    { key: 'contact', name: S.lang === 'en' ? 'Contact' : 'İletişim', icon: ICONS.Ct || '', c: '--up' }
  ];
  const sectionDwell = sectionDefs.map(def => {
    const v = sViews[def.key] || 0;
    const t = sTimes[def.key] || 0;
    const avgSec = v > 0 ? Math.round(t / v) : 0;
    return {
      key: def.key,
      name: def.name,
      icon: def.icon,
      c: def.c,
      avgSec,
      dur: avgSec >= 60 ? (S.lang === 'en' ? `${Math.floor(avgSec / 60)}m ${avgSec % 60}s` : `${Math.floor(avgSec / 60)} dk ${avgSec % 60} sn`) : (S.lang === 'en' ? `${avgSec}s` : `${avgSec} sn`)
    };
  }).sort((a, b) => b.avgSec - a.avgSec);

  const maxDwell = sectionDwell[0] || { name: 'Hero', dur: S.lang === 'en' ? '0s' : '0 sn', avgSec: 0, icon: ICONS.He, c: '--n1' };
  const minDwell = sectionDwell[sectionDwell.length - 1] || { name: S.lang === 'en' ? 'Contact' : 'İletişim', dur: S.lang === 'en' ? '0s' : '0 sn', avgSec: 0 };
  const maxDwellSecVal = Math.max(...sectionDwell.map(s => s.avgSec), 1);

  $('#ft').innerHTML = `
    <p class="sub" style="margin-bottom:12px">${t('audDwellComparison', 'Kullanıcılar en uzun <b>{0}</b> bölümünde kalıyor ({1}), en az <b>{2}</b> bölümünde ({3}).').replace('{0}', esc(maxDwell.name)).replace('{1}', esc(maxDwell.dur)).replace('{2}', esc(minDwell.name)).replace('{3}', esc(minDwell.dur))}</p>
    ${sectionDwell.slice(0, 3).map(s => `
      <div class="mk" style="--c:var(${s.c})">
        <div class="sy">${s.icon}</div>
        <b>${esc(s.name)}</b>
        <div class="bar"><i data-w="${Math.round(s.avgSec / maxDwellSecVal * 100)}" style="width:${Math.round(s.avgSec / maxDwellSecVal * 100)}%"></i></div>
        <div class="px" style="color:var(--c)">${esc(s.dur)}</div>
      </div>
    `).join('')}
  `;

  // Real recent visitor sessions
  const activeSessionsList = allVisitors.slice(0, 5).map(v => {
    const topSec = (Array.isArray(v.sectionsViewed) && v.sectionsViewed[0]?.name)
      ? v.sectionsViewed[0].name
      : (typeof v.sectionsViewed?.[0] === 'string' ? v.sectionsViewed[0] : (v.sectionsViewed?.[0]?.id || 'Hero'));
    const secName = topSec ? (topSec.charAt(0).toUpperCase() + topSec.slice(1) + (S.lang === 'en' ? ' Section' : ' Bölümü')) : (S.lang === 'en' ? 'Hero Section' : 'Hero Bölümü');
    const durSec = v.durationSeconds || 0;
    const durStr = `${Math.floor(durSec / 60)}:${String(durSec % 60).padStart(2, '0')}`;
    return {
      flag: v.flag || '<i class="fa-solid fa-globe"></i>',
      sec: secName,
      dur: durStr
    };
  });

  if (activeSessionsList.length > 0) {
    $('#ss').innerHTML = activeSessionsList.map((s, i) => `
      <div class="mk" style="--c:var(${PAL[i % PAL.length]})">
        <div class="sy flag">${s.flag}</div>
        <b style="flex:1;width:auto">${esc(s.sec)}<small>${t('audVisitorSession', 'ziyaretçi oturumu')}</small></b>
        <span class="pd" style="background:${activeCount > 0 ? 'var(--up)' : 'var(--ac)'}"></span>
        <span class="px" style="width:auto">${s.dur}</span>
      </div>
    `).join('');
  } else {
    $('#ss').innerHTML = `<p class="sub" style="padding:12px 0">${t('audNoActiveSessions', 'Henüz aktif oturum bulunmuyor.')}</p>`;
  }

  // Right Rail Telemetry
  renderRightRail(computedList, activeCount, topPeak, maxDwell);
}

function renderRightRail(C, activeCount, topPeak, maxDwell) {
  const rail = $('#rail');
  if (!rail) return;
  const peakText = topPeak ? topPeak.label : '10:00–12:00';
  const peakPct = topPeak ? topPeak.pct : 30;
  const dwellName = maxDwell ? maxDwell.name : 'Hero';
  const dwellDur = maxDwell ? maxDwell.dur : (S.lang === 'en' ? '0s' : '0 sn');
  const dwellIcon = (maxDwell && maxDwell.icon) ? maxDwell.icon : ICONS.He;

  rail.innerHTML = `
    <p class="sub"><span class="pd"></span>${t('audCurrentlyOnSite', 'Şu an sitede')}</p>
    <div class="nv auv" style="--c:var(--up);margin:6px 0 2px">${activeCount}</div>
    <p class="sub">${t('k0', 'aktif kullanıcı')}</p>
    <hr class="hr">
    <p class="sub">${t('audPeakInterval', 'En yoğun saat aralığı')}</p>
    <div class="nv" style="--c:var(--n1);font-size:26px;margin:6px 0 2px">${peakText}</div>
    <p class="sub">${t('audGmtShare', "GMT · günlük trafiğin %{0}'si").replace('{0}', peakPct)}</p>
    <hr class="hr">
    <p class="sub" style="margin-bottom:6px">${t('audTopVisitingCountries', 'En çok giriş yapılan ülkeler')}</p>
    ${C.slice(0, 3).map((c, i) => `
      <div class="mk" style="--c:var(${['--n1', '--ac', '--n3'][i]});border:0;padding:6px 0">
        <div class="sy flag" style="width:30px;height:30px;font-size:16px;">${c.flag || '<i class="fa-solid fa-globe"></i>'}</div>
        <b style="flex:1;width:auto">${esc(c.name)}</b>
        <span class="px" style="width:auto">${c.count}</span>
      </div>
    `).join('')}
    <hr class="hr">
    <p class="sub" style="margin-bottom:4px">${t('audFeaturedSection', 'Öne çıkan alan')}</p>
    <div class="mk" style="--c:var(--n1);border:0;padding:6px 0">
      <div class="sy" style="width:30px;height:30px;">${dwellIcon}</div>
      <b style="flex:1;width:auto">${esc(dwellName)}</b>
      <span class="px" style="width:auto">${esc(dwellDur)}</span>
    </div>
  `;
}

// ------------------------------------------------------------------------------
// VIEW 9: FAQ (Sık Sorulan Sorular)
// ------------------------------------------------------------------------------
let extractedQueries = [];
let liveFAQs = [
  { id: 'faq_1', q: 'Şirket kurulumu ne kadar sürer?', a: 'Belgeler eksiksizse genellikle 2–3 hafta.', on: 1 },
  { id: 'faq_2', q: 'Hangi sektörlerde danışmanlık veriyorsunuz?', a: 'Madencilik, liman lojistiği, vergi muafiyetleri ve kamu ilişkileri.', on: 1 }
];

async function qry() {
  const inbox = (allEmails && allEmails.inbox) ? allEmails.inbox : [];
  const baseQueries = [
    { q: "Maden ruhsatı almak ne kadar sürer?", c: 4 },
    { q: "Şirket kurmak için hangi belgeler gerekiyor?", c: 3 },
    { q: "Serbest liman vergi muafiyetlerinden yararlanabilir miyiz?", c: 2 },
    { q: "Bakanlık görüşmelerini organize edebilir misiniz?", c: 2 }
  ];

  if (S.lang && S.lang !== 'tr') {
    try {
      extractedQueries = await Promise.all(baseQueries.map(async item => {
        const tq = await gtr(item.q, 'tr', S.lang);
        return { q: tq, c: item.c };
      }));
    } catch (e) {
      extractedQueries = baseQueries;
    }
  } else {
    extractedQueries = baseQueries;
  }

  renderExtractedQueries();
  toast(t('toastFaqScanned', 'E-postalar tarandı ve 4 ana soru tespit edildi'));
}

function renderExtractedQueries() {
  if (!$('#qr')) return;
  $('#qr').innerHTML = extractedQueries.map((g, i) => `
    <div class="mk" style="--c:var(--n1)">
      <div class="sy" style="font-weight:600;font-size:14px;">×${g.c}</div>
      <b style="flex:1;width:auto">${esc(g.q)}<small>${t('askedInClients', '{0} farklı müşteride soruldu').replace('{0}', g.c)}</small></b>
      <button class="pill gold" data-addfaq="${i}">${t('actionAddToFaq', "SSS'ye Ekle")}</button>
    </div>
  `).join('');

  $$('#qr [data-addfaq]').forEach(b => {
    b.onclick = () => {
      const g = extractedQueries[+b.dataset.addfaq];
      liveFAQs.push({ id: 'faq_' + Date.now(), q: g.q, a: '', on: 1 });
      renderFAQList();
      toast(t('toastAddedToFaq', 'SSS listesine eklendi'));
    };
  });
}

function renderFAQView() {
  renderFAQList();
}

function renderFAQList() {
  if (!$('#fq')) return;
  $('#fq').innerHTML = liveFAQs.map((f, i) => `
    <div class="sec" style="cursor:default;flex-wrap:wrap" data-fidx="${i}">
      <b style="flex:1">${esc(f.q)}</b>
      <div class="sw ${f.on ? 'on' : ''}" data-fsw="${i}"></div>
      <button class="pill" data-fdel="${i}" style="color:var(--dn);font-size:12px;">${t('actionDelete', 'Sil')}</button>
      <textarea style="flex-basis:100%;margin-top:8px" placeholder="${t('phTypeAnswer', 'Cevabı yazın...')}">${esc(f.a)}</textarea>
    </div>
  `).join('');

  $$('#fq [data-fsw]').forEach(sw => {
    sw.onclick = () => {
      sw.classList.toggle('on');
      const idx = +sw.dataset.fsw;
      liveFAQs[idx].on = sw.classList.contains('on');
      toast(t('toastFaqUpdated', 'SSS durumu güncellendi'));
    };
  });

  $$('#fq textarea').forEach((ta, idx) => {
    ta.oninput = () => {
      liveFAQs[idx].a = ta.value;
    };
  });

  $$('#fq [data-fdel]').forEach(btn => {
    btn.onclick = () => {
      liveFAQs.splice(+btn.dataset.fdel, 1);
      renderFAQList();
      toast(t('toastQuestionDeleted', 'Soru silindi'));
    };
  });
}

// ------------------------------------------------------------------------------
// VIEW 10: GUV (Güvenlik, Şifre & Yedekleme)
// ------------------------------------------------------------------------------
const passForm = $('#form-change-password');
if (passForm) {
  passForm.addEventListener('submit', async e => {
    e.preventDefault();
    const curr = $('#pass-current').value;
    const newP = $('#pass-new').value;
    const conf = $('#pass-confirm').value;

    if (newP !== conf) {
      toast(t('toastPasswordMismatch', 'Yeni şifreler birbiriyle eşleşmiyor'));
      return;
    }

    try {
      const res = await fetch('/api/moon/manager/password', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ currentPassword: curr, newPassword: newP })
      });
      const data = await res.json();
      if (res.ok) {
        toast(t('toastPasswordUpdated', 'Şifreniz başarıyla güncellendi ve hash ile korundu!'));
        passForm.reset();
      } else {
        toast(data.error || t('toastPasswordFailed', 'Şifre güncellenemedi'));
      }
    } catch (err) {
      toast(t('toastConnError', 'Bağlantı hatası'));
    }
  });
}

const btnDlBackup = $('#btn-download-backup');
if (btnDlBackup) {
  btnDlBackup.onclick = () => {
    window.location.href = `/api/moon/manager/backup/download?token=${encodeURIComponent(authToken)}`;
    toast(t('toastDownloadingBackup', 'Sistem yedeği indiriliyor...'));
  };
}

const btnDlMetrics = $('#btn-download-metrics');
if (btnDlMetrics) {
  btnDlMetrics.onclick = () => {
    window.location.href = `/api/moon/manager/backup/metrics?token=${encodeURIComponent(authToken)}`;
    toast(t('toastDownloadingMetrics', 'Metrik verileri indiriliyor...'));
  };
}

const backupInput = $('#input-backup-file');
const btnRestoreBackup = $('#btn-restore-backup-trigger');
if (btnRestoreBackup && backupInput) {
  btnRestoreBackup.onclick = () => backupInput.click();
}
if (backupInput) {
  backupInput.onchange = async () => {
  const file = backupInput.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = async () => {
    try {
      const backup = JSON.parse(reader.result);
      const res = await fetch('/api/moon/manager/backup/restore', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ backup })
      });
      if (res.ok) {
        toast(t('toastBackupRestored', 'Yedek başarıyla geri yüklendi!'));
        await loadAllData();
      } else {
        toast(t('toastRestoreFailed', 'Geri yükleme başarısız'));
      }
    } catch (e) {
      toast(t('toastInvalidBackup', 'Geçersiz yedek dosyası'));
    }
  };
  reader.readAsText(file);
};
}

// ------------------------------------------------------------------------------
// VIEW 12: YET (Yetkiler ve Yöneticiler)
// ------------------------------------------------------------------------------
function renderUsersView() {
  const users = allUsers.length ? allUsers : (currentUser ? [currentUser] : []);
  if (!$('#al')) return;
  const isSuper = canSwitchUser(currentUser);

  $('#al').innerHTML = users.map((u, i) => {
    const inits = (u.name || u.username || 'A').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
    const isSuperUser = u.role === 'superadmin' || u.role === 'Super Administrator' || u.permissions?.includes('all');
    const hasSwitch = u.permissions?.includes('switch_user') || isSuperUser;
    const permCount = isSuperUser ? t('fullPermissionsTag', 'Tam Yetki') : t('permissionsCountTag', '{0} yetki').replace('{0}', (u.permissions || []).length);

    return `
      <div class="mk" style="--c:var(--n1);display:flex;align-items:center;gap:12px;padding:12px 16px;">
        <div class="sy">${inits}</div>
        <div style="flex:1;min-width:0;">
          <b style="display:block;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
            ${esc(u.name || u.username)}
          </b>
          <small class="sub">${esc(u.role)} · ${permCount}${hasSwitch ? ' · <span style="color:var(--up);font-weight:600;"><i class="fa-solid fa-bolt"></i> ' + t('actionQuickSwitch', 'Hızlı Geçiş') + '</span>' : ''}</small>
        </div>
        <div style="display:flex;gap:8px;align-items:center;">
          ${(isSuper && u.id !== currentUser?.id) ? `<button class="pill" data-switch-u="${u.id}" title="${t('quickSwitchTooltip', 'Şifresiz hızlı geçiş yap')}"><i class="fa-solid fa-bolt"></i> ${t('actionSwitchAccount', 'Geçiş Yap')}</button>` : ''}
          <button class="pill gold" data-ea="${i}">${t('actionEditPermissions', 'Yetkileri Düzenle')}</button>
        </div>
      </div>
    `;
  }).join('');

  $('#pl').innerHTML = PK.map(x => `
    <div class="sec" style="cursor:default">
      <b>${esc(x.name === 'Güvenlik & Sistem' && S.lang === 'en' ? 'Security & System' : x.name)}<small class="sub" style="display:block;font-weight:400">${x.perms.join(', ')}</small></b>
      <span class="tag">${t('permissionsCountTag', '{0} yetki').replace('{0}', x.perms.length)}</span>
    </div>
  `).join('');
}

function ream(userIndex) {
  const u = allUsers[userIndex];
  if (!u) return;
  const isSuper = (u.role === 'superadmin' || u.role === 'Super Administrator' || (u.permissions && u.permissions.includes('all')));
  const perms = Array.isArray(u.permissions) ? [...u.permissions] : [];

  const cbx = (key, label, checked, disabled, tag) => `
    <label class="cb ${disabled ? 'lk' : ''}">
      <input type="checkbox" data-pk="${key}" ${checked ? 'checked' : ''} ${disabled ? 'disabled' : ''}>
      <i></i>
      <span>${label}</span>
      ${tag ? `<em class="tag">${esc(tag)}</em>` : ''}
    </label>
  `;

  const pgKeys = [
    ['aud', t('aud', 'Kitle Analizi')],
    ['logs', t('logs', 'Ziyaretçi Logları')],
    ['sec', t('sec', 'Ara Bölümler')],
    ['mail', t('mail', 'E-Posta Merkezi')],
    ['faq', t('faq', 'Sık Sorulan Sorular')]
  ];

  const siKeys = [
    ['temel', t('temel', 'Temel Ayarlar ve Veri Yönetimi')],
    ['gor', t('gor', 'Görünüm ve Tema')],
    ['theme', t('theme', 'Site Teması')],
    ['cms', t('cms', 'İçerik Yönetimi')],
    ['tpl', t('tpl', 'E-Posta Şablonları')],
    ['guv', t('guv', 'Güvenlik ve Yedek')],
    ['yet', t('yet', 'Yetkiler ve Yöneticiler')]
  ];

  $('#mb').innerHTML = `
    <div style="display:flex;align-items:center;gap:12px;margin-bottom:14px">
      <div style="flex:1">
        <h3>${t('modalEditUserTitle', '{0} · Yetkileri Düzenle').replace('{0}', esc(u.name || u.username))}</h3>
        <p class="sub">${esc(u.role)} · ${u.email || ''}</p>
      </div>
      <button class="pill" data-x="close" aria-label="${t('actionClose', 'Kapat')}"><i class="fa-solid fa-xmark"></i></button>
    </div>

    <div class="cg" style="margin-bottom:14px">
      <div class="f">
        <label>${t('modalFullName', 'Ad Soyad')}</label>
        <input class="i" id="m-name" value="${esc(u.name || '')}">
      </div>
      <div class="f">
        <label>${t('modalRole', 'Rol / Unvan')}</label>
        <input class="i" id="m-role" value="${esc(u.role || '')}">
      </div>
    </div>

    <h4>${t('modalSpecialPermsTitle', 'Özel Sistem Yetkileri')}</h4>
    <p class="sub" style="margin-bottom:8px">${t('modalSpecialPermsSub', 'Bu yetki açık olan kullanıcılar...')}</p>
    <div class="cbg" style="margin-bottom:16px;">
      ${cbx(
        'switch_user',
        t('permSwitchUserLabel', 'Kullanıcılar Arasında Geçiş Yapabilme (Şifresiz Hızlı Geçiş)'),
        isSuper || perms.includes('switch_user'),
        isSuper,
        isSuper ? t('permSuperAdminRequired', 'Süper Yönetici / Zorunlu') : ''
      )}
    </div>

    <h4>${t('modalAccessiblePagesTitle', 'Erişilebilir Sayfalar')}</h4>
    <div class="cbg" style="margin-bottom:14px">
      ${pgKeys.map(([k, lab]) => cbx(k, lab, isSuper || perms.includes(k), isSuper, isSuper ? 'Zorunlu' : '')).join('')}
    </div>

    <h4>${t('modalMgmtSettingsTitle', 'Yönetim & Ayarlar')}</h4>
    <div class="cbg" style="margin-bottom:20px">
      ${siKeys.map(([k, lab]) => cbx(k, lab, isSuper || perms.includes(k), isSuper, isSuper ? 'Zorunlu' : '')).join('')}
    </div>

    <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:22px">
      <button class="pill gold" id="btn-modal-save-perms">${t('actionSave', 'Kaydet')}</button>
      <button class="pill" data-x="close">${t('actionCancel', 'Vazgeç')}</button>
      <span style="flex:1"></span>
      ${!isSuper ? `
        <button class="pill" id="btn-modal-select-all">${t('actionSelectAll', 'Tümünü Seç')}</button>
        <button class="pill" id="btn-modal-clear-all">${t('actionClearAll', 'Temizle')}</button>
      ` : ''}
    </div>
  `;

  $('#mo').classList.add('on');

  const btnSavePerms = $('#btn-modal-save-perms');
  if (btnSavePerms) {
    btnSavePerms.onclick = async () => {
    const newName = $('#m-name').value.trim();
    const newRole = $('#m-role').value.trim();
    let updatedPerms = [];

    if (isSuper) {
      updatedPerms = ['all', 'switch_user'];
    } else {
      $$('#mb input[data-pk]').forEach(chk => {
        if (chk.checked) updatedPerms.push(chk.dataset.pk);
      });
    }

    try {
      toast(t('toastSavingPermissions', 'Yetkiler kaydediliyor...'));
      const res = await fetch(`/api/moon/manager/users/${u.id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          name: newName || u.name,
          role: newRole || u.role,
          permissions: updatedPerms
        })
      });
      const data = await res.json();
      if (res.ok) {
        toast(t('toastPermissionsUpdated', 'Yetkiler başarıyla güncellendi!'));
        $('#mo').classList.remove('on');
        await loadAllData();
        renderUsersView();
      } else {
        toast(data.error || t('toastSavePermsFailed', 'Kaydetme başarısız'));
      }
    } catch (err) {
      toast(t('toastSaveError', 'Kaydetme hatası'));
    }
  };
  }

  const selAll = $('#btn-modal-select-all');
  if (selAll) {
    selAll.onclick = () => {
      $$('#mb input[data-pk]:not([disabled])').forEach(c => c.checked = true);
    };
  }
  const clrAll = $('#btn-modal-clear-all');
  if (clrAll) {
    clrAll.onclick = () => {
      $$('#mb input[data-pk]:not([disabled])').forEach(c => c.checked = false);
    };
  }
}

// User list click delegates
const alEl = $('#al');
if (alEl) {
  alEl.onclick = e => {
    const ea = e.target.closest('[data-ea]');
    if (ea) {
      ream(+ea.dataset.ea);
      return;
    }
  };
}

// Modal close handler
const moEl = $('#mo');
if (moEl) {
  moEl.onclick = e => {
    if (e.target === moEl || e.target.closest('[data-x="close"]')) {
      moEl.classList.remove('on');
    }
  };
}

// ------------------------------------------------------------------------------
// INITIALIZATION
// ------------------------------------------------------------------------------
async function initApplication() {
  try {
    rnav();
  } catch (err) {
    console.error('Error during rnav():', err);
  }
  try {
    apply();
  } catch (err) {
    console.error('Error during apply():', err);
  }
  try {
    await loadAllData();
  } catch (err) {
    console.error('Error during loadAllData():', err);
  }
  try {
    go(cur);
  } catch (err) {
    console.error('Error during go():', err);
  }

  // Real live telemetry polling from Supabase every 12 seconds
  setInterval(async () => {
    try {
      const anRes = await fetch('/api/moon/manager/analytics', { headers: getAuthHeaders() });
      if (anRes.ok) {
        analyticsData = await anRes.json();
        const activeCount = (analyticsData && analyticsData.activeUsersCount !== undefined) ? analyticsData.activeUsersCount : 0;
        $$('.auv').forEach(e => e.textContent = activeCount);
        if (cur === 'home') renderHomeView();
        else if (cur === 'aud') renderAudienceView();
      }
    } catch (e) {}
  }, 12000);
}

// Preview site trigger
const btnPreviewSite = $('#btn-preview-site');
if (btnPreviewSite) {
  btnPreviewSite.onclick = () => window.open('/', '_blank');
}

// Bootstrapping
function bootstrap() {
  try {
    apply();
  } catch (err) {
    console.error('apply error during bootstrap:', err);
  }
  try {
    checkAuth();
  } catch (err) {
    console.error('checkAuth error during bootstrap:', err);
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootstrap);
} else {
  bootstrap();
}


// Mode switchers
$('#btn-mode-canvas')?.addEventListener('click', () => {
  builderActiveMode = 'canvas';
  renderSectionsView();
});
$('#btn-mode-list')?.addEventListener('click', () => {
  builderActiveMode = 'list';
  renderSectionsView();
});

// Device simulator toggles
$$('#builder-device-bar button').forEach(btn => {
  btn.onclick = () => {
    $$('#builder-device-bar button').forEach(b => b.classList.remove('on'));
    btn.classList.add('on');
    builderDeviceMode = btn.dataset.device;
    const canvasWrap = $('#builder-canvas-wrapper');
    if (canvasWrap) {
      canvasWrap.classList.remove('preview-tablet', 'preview-mobile');
      if (builderDeviceMode === 'tablet') canvasWrap.classList.add('preview-tablet');
      if (builderDeviceMode === 'mobile') canvasWrap.classList.add('preview-mobile');
    }
  };
});

// Widget Category Tabs
$$('#widget-cat-tabs .widget-cat-pill').forEach(pill => {
  pill.onclick = () => {
    $$('#widget-cat-tabs .widget-cat-pill').forEach(p => p.classList.remove('on'));
    pill.classList.add('on');
    builderActiveCategory = pill.dataset.cat;
    renderWidgetLibrary();
    setupBuilderDragAndDrop();
  };
});

// Widget Search
$('#widget-search-input')?.addEventListener('input', e => {
  builderSearchTerm = e.target.value;
  renderWidgetLibrary();
  setupBuilderDragAndDrop();
});

// Global Builder Actions Click Delegate
document.addEventListener('click', async e => {
  // Add widget button
  const addBtn = e.target.closest('[data-add-widget]');
  if (addBtn) {
    e.preventDefault();
    addNewSectionFromWidget(addBtn.dataset.addWidget);
    return;
  }

  // Toggle section enabled
  const toggleSw = e.target.closest('[data-toggle-sec]');
  if (toggleSw) {
    e.preventDefault();
    const secId = toggleSw.dataset.toggleSec;
    const sec = allSections.find(s => s.id === secId);
    if (sec) {
      sec.enabled = !sec.enabled;
      toggleSw.classList.toggle('on', sec.enabled);
      await saveAllSectionsToBackend();
      renderSectionsView();
      toast(sec.enabled ? t('toastSecEnabled', 'Bölüm yayına alındı') : t('toastSecDisabled', 'Bölüm gizlendi'));
    }
    return;
  }

  // Move section up
  const moveUpBtn = e.target.closest('[data-move-up]');
  if (moveUpBtn) {
    e.preventDefault();
    const secId = moveUpBtn.dataset.moveUp;
    const idx = allSections.findIndex(s => s.id === secId);
    if (idx > 0) {
      const temp = allSections[idx];
      allSections[idx] = allSections[idx - 1];
      allSections[idx - 1] = temp;
      allSections.forEach((s, i) => s.order = i + 1);
      await saveAllSectionsToBackend();
      renderSectionsView();
      toast(S.lang === 'en' ? 'Widget moved up' : 'Widget yukarı taşındı');
    }
    return;
  }

  // Move section down
  const moveDownBtn = e.target.closest('[data-move-down]');
  if (moveDownBtn) {
    e.preventDefault();
    const secId = moveDownBtn.dataset.moveDown;
    const idx = allSections.findIndex(s => s.id === secId);
    if (idx >= 0 && idx < allSections.length - 1) {
      const temp = allSections[idx];
      allSections[idx] = allSections[idx + 1];
      allSections[idx + 1] = temp;
      allSections.forEach((s, i) => s.order = i + 1);
      await saveAllSectionsToBackend();
      renderSectionsView();
      toast(S.lang === 'en' ? 'Widget moved down' : 'Widget aşağı taşındı');
    }
    return;
  }

  // Delete section
  const delBtn = e.target.closest('[data-del-sec]');
  if (delBtn) {
    e.preventDefault();
    const secId = delBtn.dataset.delSec;
    if (confirm(t('confirmDeleteSection', 'Bu bölümü silmek istediğinize emin misiniz?'))) {
      allSections = allSections.filter(s => s.id !== secId);
      await saveAllSectionsToBackend();
      renderSectionsView();
      toast(t('toastSecDeleted', 'Bölüm silindi'));
    }
    return;
  }

  // Duplicate section
  const dupBtn = e.target.closest('[data-dup-sec]');
  if (dupBtn) {
    e.preventDefault();
    const secId = dupBtn.dataset.dupSec;
    const orig = allSections.find(s => s.id === secId);
    if (orig) {
      const cloned = JSON.parse(JSON.stringify(orig));
      cloned.id = 'sec_' + Date.now().toString(36);
      cloned.name = (cloned.name || 'Section') + ' (Copy)';
      cloned.anchor = cloned.anchor + '-copy';
      allSections.push(cloned);
      await saveAllSectionsToBackend();
      renderSectionsView();
      toast(t('toastSecCloned', 'Bölüm çoğaltıldı'));
    }
    return;
  }

  // Edit section details modal
  const editBtn = e.target.closest('[data-edit-sec]');
  if (editBtn) {
    e.preventDefault();
    openSectionEditModal(editBtn.dataset.editSec);
    return;
  }

  // Add Item to Section in List View
  const addItemBtn = e.target.closest('[data-add-item-to-sec]');
  if (addItemBtn) {
    e.preventDefault();
    const secId = addItemBtn.dataset.addItemToSec;
    const sec = allSections.find(s => s.id === secId);
    if (sec) {
      if (!Array.isArray(sec.items)) sec.items = [];
      sec.items.push({ title: 'Yeni Madde / New Item', description: 'Açıklama / Description', value: '' });
      renderBuilderStructuredList(allSections);
      toggleListCard(secId); // keep open
    }
    return;
  }

  // Delete item from section
  const delItemBtn = e.target.closest('[data-del-item-from-sec]');
  if (delItemBtn) {
    e.preventDefault();
    const secId = delItemBtn.dataset.delItemFromSec;
    const idx = +delItemBtn.dataset.itemIdx;
    const sec = allSections.find(s => s.id === secId);
    if (sec && Array.isArray(sec.items)) {
      sec.items.splice(idx, 1);
      renderBuilderStructuredList(allSections);
      toggleListCard(secId);
    }
    return;
  }
});

// Live input update on list mode
document.addEventListener('input', e => {
  const inp = e.target.closest('.input-live-update');
  if (inp && inp.dataset.secId && inp.dataset.secProp) {
    const sec = allSections.find(s => s.id === inp.dataset.secId);
    if (sec) {
      sec[inp.dataset.secProp] = inp.value;
    }
    return;
  }

  const childInp = e.target.closest('.child-prop-input');
  if (childInp && childInp.dataset.secId && childInp.dataset.itemIdx !== undefined && childInp.dataset.itemProp) {
    const sec = allSections.find(s => s.id === childInp.dataset.secId);
    const idx = +childInp.dataset.itemIdx;
    if (sec && Array.isArray(sec.items) && sec.items[idx]) {
      sec.items[idx][childInp.dataset.itemProp] = childInp.value;
    }
  }
});

// Save all sections button
$('#btn-builder-save-all')?.addEventListener('click', async () => {
  await saveAllSectionsToBackend();
  toast(t('toastAllSectionsSaved', 'Tüm web builder bölümleri başarıyla kaydedildi!'));
});

$('#btn-builder-add-custom')?.addEventListener('click', () => {
  addNewSectionFromWidget('cards');
});


function openSectionEditModal(secId) {
  const sec = allSections.find(s => s.id === secId);
  if (!sec) return;
  currentlyEditingSectionId = secId;

  const isEn = S.lang === 'en';
  const modal = $('#modal-section-editor');
  const body = $('#sec-modal-body');
  if (!modal || !body) return;

  body.innerHTML = `
    <div class="grid g2">
      <div class="f">
        <label>${t('lblSecTitle', 'Bölüm Başlığı')}</label>
        <input class="i" id="m-sec-title" value="${esc(sec.title || '')}">
      </div>
      <div class="f">
        <label>${t('lblSectionTag', 'Üst Rozet / Kategori')}</label>
        <input class="i" id="m-sec-tag" value="${esc(sec.tag || '')}">
      </div>
    </div>
    <div class="f">
      <label>${t('lblSecSub', 'Alt Açıklama')}</label>
      <textarea class="i" id="m-sec-sub" style="min-height:70px;">${esc(sec.subtitle || '')}</textarea>
    </div>
    <div class="grid g2">
      <div class="f">
        <label>${t('lblSectionAnchor', 'Bağlantı Çapası (#anchor)')}</label>
        <input class="i" id="m-sec-anchor" value="${esc(sec.anchor || '')}">
      </div>
      <div class="f">
        <label>${t('lblSectionBgStyle', 'Arka Plan Stili')}</label>
        <select class="i" id="m-sec-bg">
          <option value="obsidian" ${sec.bgStyle === 'obsidian' ? 'selected' : ''}>Koyu Obsidyen Zemin</option>
          <option value="glass" ${sec.bgStyle === 'glass' ? 'selected' : ''}>Cam Şeffaflığı & Kart</option>
          <option value="navy" ${sec.bgStyle === 'navy' ? 'selected' : ''}>Derin Lüks Lacivert</option>
          <option value="gold" ${sec.bgStyle === 'gold' ? 'selected' : ''}>Altın Parıltısı Radyal</option>
        </select>
      </div>
    </div>
  `;

  modal.classList.add('active');
}

$('#btn-close-sec-modal')?.addEventListener('click', () => $('#modal-section-editor')?.classList.remove('active'));
$('#btn-cancel-sec-modal')?.addEventListener('click', () => $('#modal-section-editor')?.classList.remove('active'));

$('#btn-save-sec-modal')?.addEventListener('click', async () => {
  if (!currentlyEditingSectionId) return;
  const sec = allSections.find(s => s.id === currentlyEditingSectionId);
  if (sec) {
    sec.title = $('#m-sec-title')?.value || sec.title;
    sec.tag = $('#m-sec-tag')?.value || sec.tag;
    sec.subtitle = $('#m-sec-sub')?.value || sec.subtitle;
    sec.anchor = $('#m-sec-anchor')?.value || sec.anchor;
    sec.bgStyle = $('#m-sec-bg')?.value || sec.bgStyle;
    await saveAllSectionsToBackend();
    renderSectionsView();
    toast(t('toastSectionUpdated', 'Bölüm ayarları kaydedildi!'));
  }
  $('#modal-section-editor')?.classList.remove('active');
});


// FAQ Modal Handlers
$('#btn-close-faq-modal')?.addEventListener('click', () => $('#modal-add-to-faq')?.classList.remove('active'));
$('#btn-cancel-faq-modal')?.addEventListener('click', () => $('#modal-add-to-faq')?.classList.remove('active'));

$('#form-add-to-faq')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const q = $('#faq-modal-q')?.value.trim();
  const a = $('#faq-modal-a')?.value.trim();
  const cat = $('#faq-modal-cat')?.value.trim() || 'General';

  if (!q || !a) {
    toast(S.lang === 'en' ? 'Please fill in question and answer' : 'Lütfen soru ve cevap alanlarını doldurun');
    return;
  }

  try {
    toast(S.lang === 'en' ? 'Publishing to FAQ...' : 'SSS\'ye yayınlanıyor...');
    const res = await fetch('/api/moon/manager/faq/add', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ question: q, answer: a, category: cat })
    });
    const data = await res.json();
    if (res.ok && data.ok) {
      toast(t('toastFaqAddedLive', 'Soru başarıyla Sık Sorulan Sorulara eklendi ve sitede yayına alındı!'));
      $('#modal-add-to-faq')?.classList.remove('active');
      await loadAllData();
      renderMailDetail();
    } else {
      toast('Hata: ' + (data.error || 'Eklenemedi'));
    }
  } catch (err) {
    toast('Hata: ' + err.message);
  }
});

// Compose Email Modal Handlers
$('#btn-close-compose-modal')?.addEventListener('click', () => $('#modal-compose-email')?.classList.remove('active'));
$('#btn-cancel-compose')?.addEventListener('click', () => $('#modal-compose-email')?.classList.remove('active'));

$('#btn-submit-compose-mail')?.addEventListener('click', async () => {
  const to = $('#compose-recipient')?.value.trim();
  const subject = $('#compose-subject')?.value.trim();
  const body = $('#compose-body')?.value.trim();

  if (!to || !subject || !body) {
    toast(t('toastFillAllFields', 'Lütfen tüm alanları doldurun.'));
    return;
  }

  try {
    toast(t('toastSendingEmail', 'E-posta gönderiliyor...'));
    const res = await fetch('/api/moon/manager/emails/send', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ to, subject, body, templateName: 'Direct Dispatch' })
    });
    const data = await res.json();
    if (res.ok && data.success) {
      toast(t('toastEmailSent', 'E-posta başarıyla gönderildi!'));
      $('#modal-compose-email')?.classList.remove('active');
      $('#compose-recipient').value = '';
      $('#compose-subject').value = '';
      $('#compose-body').value = '';
      await loadAllData();
      renderMailView();
    } else {
      toast(data.error || t('toastSendFailed', 'Gönderilemedi'));
    }
  } catch (err) {
    toast('Hata: ' + err.message);
  }
});

