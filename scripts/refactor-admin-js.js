const fs = require('fs');

let src = fs.readFileSync('moon/manager/js/admin.js', 'utf8');

// 1. Replace Top Dictionary definition with enhanced bilingual dictionary & universal t()
const topDictTarget = `// Localization Dictionary
const D = {
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
};`;

const topDictReplacement = `// ==============================================================================
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

const D = {
  tr: Object.assign({}, LEGACY_D.tr, (typeof window !== 'undefined' && window.i18n?.tr) || {}),
  en: Object.assign({}, LEGACY_D.en, (typeof window !== 'undefined' && window.i18n?.en) || {})
};

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
  if (D.en && D.en[key] !== undefined) {
    return D.en[key];
  }
  return fallback || key;
}`;

src = src.replace(topDictTarget, topDictReplacement);

// 2. Application State default language reading from localStorage
src = src.replace(
  `let S = {\n  me: 0,\n  neon: 1,\n  theme: 'midnight',\n  layout: 'dock',\n  shape: 'sharp',\n  density: 'normal',\n  lang: 'tr',\n  o: {}\n};`,
  `let savedAdminLang = 'tr';
try {
  savedAdminLang = (typeof localStorage !== 'undefined' && localStorage.getItem('abentra_admin_lang')) || 'tr';
} catch (e) {}

let S = {
  me: 0,
  neon: 1,
  theme: 'midnight',
  layout: 'dock',
  shape: 'sharp',
  density: 'normal',
  lang: (savedAdminLang === 'en' || savedAdminLang === 'tr') ? savedAdminLang : 'tr',
  o: {}
};
if (typeof window !== 'undefined') window.currentLang = S.lang;`
);

// 3. Update tx() function and add setLanguage(lang)
const txTarget = `// Text translation & title updates
function tx() {
  const d = D[S.lang] || D.tr;
  $$('[data-i]').forEach(e => {
    if (d[e.dataset.i]) e.textContent = d[e.dataset.i];
  });
  const ttl = $('#ttl');
  if (ttl) {
    ttl.textContent = (SI2.includes(cur) && vis().length > 1 ? d.set + ' › ' : '') + (d[cur] || cur);
  }
}`;

const txReplacement = `// Language Switcher Function
function setLanguage(lang) {
  if (lang !== 'tr' && lang !== 'en') lang = 'tr';
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
  const d = D[lang] || D.tr;

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

  // Synchronize all language switcher buttons in header, login, and appearance
  $$('.lang-opt-btn').forEach(b => {
    b.classList.toggle('on', b.dataset.lang === lang);
  });
  $$('[data-k="lang"] button').forEach(b => {
    b.classList.toggle('on', b.dataset.v === lang);
  });

  document.title = lang === 'en' ? 'ABENTRA · Executive Admin Portal' : 'ABENTRA · Yönetim Merkezi';
}`;

src = src.replace(txTarget, txReplacement);

// 4. Update appearance tab click handler for language
src = src.replace(
  `$('#v-gor').onclick = e => {\n  const b = e.target.closest('.tabs button');\n  if (b && b.parentNode.dataset.k) {\n    S[b.parentNode.dataset.k] = b.dataset.v;\n    apply();\n  }\n};`,
  `$('#v-gor').onclick = e => {
  const b = e.target.closest('.tabs button');
  if (b && b.parentNode.dataset.k) {
    if (b.parentNode.dataset.k === 'lang') {
      setLanguage(b.dataset.v);
    } else {
      S[b.parentNode.dataset.k] = b.dataset.v;
      apply();
    }
  }
};`
);

// 5. Global listener for top and login language switches
if (!src.includes("const btn = e.target.closest('.lang-opt-btn');")) {
  src = src.replace(
    `// Shortcut Ctrl/Cmd + K\ndocument.addEventListener('keydown', e => {`,
    `// Global Language Switcher Click Delegate
document.addEventListener('click', e => {
  const btn = e.target.closest('.lang-opt-btn');
  if (btn && btn.dataset.lang) {
    e.preventDefault();
    setLanguage(btn.dataset.lang);
  }
});

// Shortcut Ctrl/Cmd + K
document.addEventListener('keydown', e => {`
  );
}

// 6. Login screen toasts and buttons
src = src.replace(`btn.textContent = 'Giriş yapılıyor...';`, `btn.textContent = t('toastSigningIn', 'Giriş yapılıyor...');`);
src = src.replaceAll(`btn.textContent = 'Giriş Yap / Sign In';`, `btn.innerHTML = \`<span data-i="btnSignIn">\${t('btnSignIn', 'Giriş Yap')}</span>\`;`);
src = src.replace("toast(`Hoş geldiniz, ${currentUser.name || currentUser.username}!`);", "toast(t('toastWelcomeUser', 'Hoş geldiniz, {0}!').replace('{0}', currentUser.name || currentUser.username));");
src = src.replace(`errBox.textContent = data.error || 'Geçersiz kullanıcı adı veya şifre.';`, `errBox.textContent = data.error || t('toastInvalidCredentials', 'Geçersiz kullanıcı adı veya şifre.');`);
src = src.replace(`errBox.textContent = 'Sunucuya bağlanılamadı. Lütfen tekrar deneyin.';`, `errBox.textContent = t('toastServerUnreachable', 'Sunucuya bağlanılamadı. Lütfen tekrar deneyin.');`);
src = src.replace(`toast('Oturum kapatıldı.');`, `toast(t('toastSessionLoggedOut', 'Oturum kapatıldı.'));`);

// 7. Appearance CP_LIST & RG_LIST and Theme descriptions
src = src.replace(`toast('Tema renklerine dönüldü');`, `toast(t('toastThemeReset', 'Tema renklerine dönüldü'));`);

// 8. Navigation bar & Quick switch dropdown
src = src.replace(`<div><b>ABENTRA</b><small>Yönetim merkezi</small></div>`, `<div><b>ABENTRA</b><small data-i="portalSubtitle">\${t('portalSubtitle', 'Yönetim merkezi')}</small></div>`);
src = src.replace(`<small><i></i>Canlı ziyaretçi</small>`, `<small><i></i><span data-i="liveVisitor">\${t('liveVisitor', 'Canlı ziyaretçi')}</span></small>`);
src = src.replace(`<button class="pill gold" id="btn-quick-preview">Önizle</button>`, `<button class="pill gold" id="btn-quick-preview" data-i="quickPreview">\${t('quickPreview', 'Önizle')}</button>`);
src = src.replace(`toast('Kullanıcıya geçiliyor...');`, `toast(t('toastSwitchingAccount', 'Kullanıcıya geçiliyor...'));`);
src = src.replace("toast(`Yöneticiye geçildi: ${currentUser.name || currentUser.username}`);", "toast(t('toastSwitchedAccount', 'Yöneticiye geçildi: {0}').replace('{0}', currentUser.name || currentUser.username));");
src = src.replace(`toast(data.error || 'Geçiş başarısız');`, `toast(data.error || t('toastSwitchFailed', 'Geçiş başarısız'));`);
src = src.replace(`toast('Geçiş sırasında hata oluştu');`, `toast(t('toastSwitchError', 'Geçiş sırasında hata oluştu'));`);
src = src.replace(`<div class="dh">Yönetici olarak görüntüle (Hızlı Geçiş)</div>`, `<div class="dh">\${t('viewAsAdminLabel', 'Yönetici olarak görüntüle (Hızlı Geçiş)')}</div>`);
src = src.replace(`const permCount = u.permissions?.includes('all') ? 'Tam Yetki' : \`\${(u.permissions || []).length} yetki\`;`, `const permCount = u.permissions?.includes('all') ? t('fullPermissionsTag', 'Tam Yetki') : t('permissionsCountTag', '{0} yetki').replace('{0}', (u.permissions || []).length);`);
src = src.replaceAll(`<b>Oturumu Kapat</b>`, `<b>\${t('signOutLabel', 'Oturumu Kapat')}</b>`);
src = src.replace(`<div class="dh">Yönetici Oturumu</div>`, `<div class="dh">\${t('adminSessionHeading', 'Yönetici Oturumu')}</div>`);

// 9. Temel Settings (renderTemelView, scheduleLabels, toasts, confirm prompts)
src = src.replace(
  `const scheduleLabels = {\n      off: 'Kapalı',\n      daily: 'Günlük (24s)',\n      weekly: 'Haftalık (7g)',\n      monthly: 'Aylık (30g)',\n      older_7d: '> 7 gün',\n      older_14d: '> 14 gün',\n      older_30d: '> 30 gün'\n    };`,
  `const scheduleLabels = {
      off: t('scheduleOff', 'Kapalı'),
      daily: t('scheduleDaily', 'Günlük (24s)'),
      weekly: t('scheduleWeekly', 'Haftalık (7g)'),
      monthly: t('scheduleMonthly', 'Aylık (30g)'),
      older_7d: S.lang === 'en' ? '> 7 days' : '> 7 gün',
      older_14d: S.lang === 'en' ? '> 14 days' : '> 14 gün',
      older_30d: S.lang === 'en' ? '> 30 days' : '> 30 gün'
    };`
);
src = src.replace(`lastPurgeLabel.textContent = 'Son: Henüz çalışmadı';`, `lastPurgeLabel.textContent = t('purgeLastNever', 'Son: Henüz çalışmadı');`);
src = src.replace(
  `const confirmMsg = 'DİKKAT: Sistemde tutulan tüm ziyaretçi oturumları, ısı haritası, telemetri ve sayaçlar otomatik olarak sıfırlanacaktır.\\n\\nBu işlem geri alınamaz. Devam etmek istiyor musunuz?';`,
  `const confirmMsg = t('confirmPurgeAllData');`
);
src = src.replace(`toast('Tüm veri ve metrikler siliniyor...');`, `toast(t('toastPurgingAllData'));`);
src = src.replace(`toast('Tüm tutulan veriler ve metrikler otomatik olarak silindi!');`, `toast(t('toastAllDataPurged'));`);
src = src.replace(`toast('Silme işlemi başarısız: ' + (data.error || 'Bilinmeyen hata'));`, `toast(t('toastPurgeFailed') + (data.error || 'Error'));`);
src = src.replace(`toast('Sayaçlar güncellendi');`, `toast(t('toastCountersRefreshed'));`);
src = src.replace("toast(`Komut çalıştırıldı: ${cmd}`);", "toast(t('toastCmdExecuted', 'Komut çalıştırıldı: {0}').replace('{0}', cmd));");
src = src.replace("toast(`Komut uyarısı: ${cmd}`);", "toast(t('toastCmdWarning', 'Komut uyarısı: {0}').replace('{0}', cmd));");
src = src.replace(`toast('Komut hatası: ' + err.message);`, `toast(t('toastCmdError') + err.message);`);
src = src.replace(`if (!confirm('DİKKAT: "purge --all" komutu çalıştırılacaktır. Tüm veri ve metrikler sıfırlanacaktır. Onaylıyor musunuz?')) return;`, `if (!confirm(t('confirmCmdPurgeAll'))) return;`);
src = src.replace(`toast('Otomatik temizleme takvimi güncellendi');`, `toast(t('toastScheduleUpdated'));`);
src = src.replace("if (!confirm(`Zamanlanmış otomatik temizleme döngüsü simüle edilecektir (${schedule}). Devam edilsin mi?`)) return;", "if (!confirm(t('confirmSimulatePurgeCycle', 'Zamanlanmış otomatik temizleme döngüsü simüle edilecektir ({0}). Devam edilsin mi?').replace('{0}', schedule))) return;");
src = src.replace(`toast('Temel parametreler başarıyla kaydedildi');`, `toast(t('toastBasicParamsSaved'));`);

// 10. Home view KPI cards, labels, and emojis
src = src.replace(
  `  const now = new Date();\n  const trM = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];\n  let dateRangeLabel = '';\n  if (homePeriod === 'weekly') {\n    const d7 = new Date(now.getTime() - 6 * 86400000);\n    dateRangeLabel = \`\${d7.getDate()} \${trM[d7.getMonth()]} – \${now.getDate()} \${trM[now.getMonth()]} \${now.getFullYear()}\`;\n  } else if (homePeriod === '3days') {\n    const d3 = new Date(now.getTime() - 2 * 86400000);\n    dateRangeLabel = \`\${d3.getDate()} \${trM[d3.getMonth()]} – \${now.getDate()} \${trM[now.getMonth()]} \${now.getFullYear()}\`;\n  } else {\n    dateRangeLabel = \`\${now.getDate()} \${trM[now.getMonth()]} \${now.getFullYear()} (Bugün)\`;\n  }`,
  `  const now = new Date();
  const trM = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];
  const enM = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const curM = S.lang === 'en' ? enM : trM;
  let dateRangeLabel = '';
  if (homePeriod === 'weekly') {
    const d7 = new Date(now.getTime() - 6 * 86400000);
    dateRangeLabel = \`\${d7.getDate()} \${curM[d7.getMonth()]} – \${now.getDate()} \${curM[now.getMonth()]} \${now.getFullYear()}\`;
  } else if (homePeriod === '3days') {
    const d3 = new Date(now.getTime() - 2 * 86400000);
    dateRangeLabel = \`\${d3.getDate()} \${curM[d3.getMonth()]} – \${now.getDate()} \${curM[now.getMonth()]} \${now.getFullYear()}\`;
  } else {
    dateRangeLabel = \`\${now.getDate()} \${curM[now.getMonth()]} \${now.getFullYear()} \${t('todayLabel', '(Bugün)')}\`;
  }`
);

src = src.replace(
  `    trendPct: homePeriod === 'weekly' ? '+14,8%' : homePeriod === '3days' ? '+0,8% (Dengeli)' : '-4,6%',\n    sub: homePeriod === 'weekly' ? 'Son 7 günlük gerçek ziyaretçi ve etkileşim eğrisi' : homePeriod === '3days' ? 'Son 3 günlük seyir ve etkileşim performansı' : 'Bugünkü 24 saatlik trafik akışı ve saatlik değişim'`,
  `    trendPct: homePeriod === 'weekly' ? '+14.8%' : homePeriod === '3days' ? (S.lang === 'en' ? '+0.8% (Balanced)' : '+0,8% (Dengeli)') : '-4.6%',
    sub: homePeriod === 'weekly' ? t('subWeekly', 'Son 7 günlük gerçek ziyaretçi ve etkileşim eğrisi') : homePeriod === '3days' ? t('sub3Days', 'Son 3 günlük seyir ve etkileşim performansı') : t('subDaily', 'Bugünkü 24 saatlik trafik akışı ve saatlik değişim')`
);

src = src.replace(
  `    subLabel.textContent = homeSegment === 'bot'\n      ? 'Filtrelenen bot, DNS yönlendirmesi ve scanner trafiği'\n      : homeSegment === 'all'\n      ? 'Bot ve DNS dahil tüm gelen ham trafik'\n      : (pData.sub || '');`,
  `    subLabel.textContent = homeSegment === 'bot'
      ? t('subBotTraffic', 'Filtrelenen bot, DNS yönlendirmesi ve scanner trafiği')
      : homeSegment === 'all'
      ? t('subAllTraffic', 'Bot ve DNS dahil tüm gelen ham trafik')
      : (pData.sub || '');`
);

src = src.replace(
  `diff: activeCount > 0 ? \`▲ \${activeCount} aktif insan\` : '▶ 0 aktif',`,
  `diff: activeCount > 0 ? \`▲ \${activeCount} \${t('activeHumansLabel', 'aktif insan')}\` : \`▶ \${t('zeroActiveLabel', '0 aktif')}\`,`
);

src = src.replace(
  `      diff: homeSegment === 'bot'\n        ? \`🤖 Bugün \${todayBotVis} bot/DNS\`\n        : todayBotVis > 0\n        ? \`👤 \${todayVis} Gerçek (\${todayBotVis} Bot/DNS)\`\n        : \`\${trendIcon} \${pData.trendPct}\`,`,
  `      diff: homeSegment === 'bot'
        ? \`<i class="fa-solid fa-robot"></i> \${t('todayBotCount', 'Bugün {0} bot/DNS').replace('{0}', todayBotVis)}\`
        : todayBotVis > 0
        ? \`<i class="fa-solid fa-user"></i> \${todayVis} \${t('realUserTag', 'Gerçek')} (\${todayBotVis} Bot/DNS)\`
        : \`\${trendIcon} \${pData.trendPct}\`,`
);

src = src.replace(
  `      diff: homeSegment === 'all'\n        ? \`Tümü (\${totalVis} İnsan + \${botVisits} Bot)\`\n        : homeSegment === 'bot'\n        ? \`🤖 \${botVisits} Bot & DNS\`\n        : (botVisits > 0 ? \`🛡️ \${botVisits} Bot/DNS ayrıldı\` : 'Gerçek Ziyaretçi'),`,
  `      diff: homeSegment === 'all'
        ? t('allCount', 'Tümü ({0} İnsan + {1} Bot)').replace('{0}', totalVis).replace('{1}', botVisits)
        : homeSegment === 'bot'
        ? \`<i class="fa-solid fa-robot"></i> \${botVisits} Bot & DNS\`
        : (botVisits > 0 ? \`<i class="fa-solid fa-shield-halved"></i> \${botVisits} \${t('filteredBotDns', 'Bot/DNS ayrıldı')}\` : t('humanVisitors', 'Gerçek Ziyaretçi')),`
);

src = src.replace(`diff: 'Ortalama kalış',`, `diff: t('dwellLabel', 'Ortalama kalış'),`);
src = src.replace(`diff: \`\${unread} yeni\`,`, `diff: \`\${unread} \${t('newBadge', 'yeni')}\`,`);
src = src.replace(`if (gzSub) gzSub.textContent = \`\${replied} / \${totalInq} mesaj yanıtlandı\`;`, `if (gzSub) gzSub.textContent = t('messagesRepliedLabel', '{0} / {1} mesaj yanıtlandı').replace('{0}', replied).replace('{1}', totalInq);`);

// Section defs in renderSectionMarketRows
src = src.replace(
  `  const sectionDefs = [\n    { key: 'hero', name: 'Hero', icon: ICONS.He || '', c: '--n1' },\n    { key: 'who', name: 'Who We Are', icon: ICONS.Wh || '', c: '--n3' },\n    { key: 'purpose', name: 'Our Purpose', icon: ICONS.Pu || '', c: '--n4' },\n    { key: 'services', name: 'Hizmetler', icon: ICONS.Sv || '', c: '--ac' },\n    { key: 'contact', name: 'Contact', icon: ICONS.Ct || '', c: '--up' }\n  ];`,
  `  const sectionDefs = [
    { key: 'hero', name: t('secNameHero', 'Hero'), icon: ICONS.He || '', c: '--n1' },
    { key: 'who', name: t('secNameWho', 'Who We Are'), icon: ICONS.Wh || '', c: '--n3' },
    { key: 'purpose', name: t('secNamePurpose', 'Our Purpose'), icon: ICONS.Pu || '', c: '--n4' },
    { key: 'services', name: t('secNameServices', 'Hizmetler'), icon: ICONS.Sv || '', c: '--ac' },
    { key: 'contact', name: t('secNameContact', 'Contact'), icon: ICONS.Ct || '', c: '--up' }
  ];`
);

src = src.replace(
  `const dur = avgSec >= 60 ? \`\${Math.floor(avgSec / 60)} dk \${avgSec % 60} sn\` : \`\${avgSec} sn\`;`,
  `const mLabel = t('minutesShort', 'dk');
    const sLabel = t('secondsShort', 'sn');
    const dur = avgSec >= 60 ? \`\${Math.floor(avgSec / 60)} \${mLabel} \${avgSec % 60} \${sLabel}\` : \`\${avgSec} \${sLabel}\`;`
);

src = src.replace(`<b>\${h.name}<small>\${h.pct}% ilgi</small></b>`, `<b>\${h.name}<small>\${h.pct}% \${t('interestLabel', 'ilgi')}</small></b>`);
src = src.replace(`$('#rec').innerHTML = '<p class="sub" style="padding:14px 0">Gelen kutusu boş.</p>';`, `$('#rec').innerHTML = \`<p class="sub" style="padding:14px 0">\${t('inboxEmptyNotice', 'Gelen kutusu boş.')}</p>\`;`);
src = src.replace(`<small>\${esc(m.subject || m.service || 'Müşteri talebi')}</small>`, `<small>\${esc(m.subject || m.service || t('customerInquiryDefault', 'Müşteri talebi'))}</small>`);

// 11. Logs view emojis and Turkish text
src = src.replace(
  `    statsBar.innerHTML = \`
      <span class="pill" style="background:rgba(16,185,129,0.12);color:var(--up);border:1px solid rgba(16,185,129,0.3);padding:4px 10px;font-size:12px;">👤 \${humanCount} Gerçek Kullanıcı (\${verifiedCount} Doğrulanmış)</span>
      <span class="pill" style="background:rgba(239,68,68,0.12);color:var(--dn);border:1px solid rgba(239,68,68,0.3);padding:4px 10px;font-size:12px;">🤖 \${botCount} Bot & DNS / Tarayıcı</span>
      \${suspiciousCount > 0 ? \`<span class="pill" style="background:rgba(245,158,11,0.12);color:var(--ac);border:1px solid rgba(245,158,11,0.3);padding:4px 10px;font-size:12px;">⚠️ \${suspiciousCount} Şüpheli</span>\` : ''}
      <span class="sub" style="margin-left:auto;font-size:11px">Toplam \${totalCount} telemetri kaydı</span>
    \`;`,
  `    statsBar.innerHTML = \`
      <span class="pill" style="background:rgba(16,185,129,0.12);color:var(--up);border:1px solid rgba(16,185,129,0.3);padding:4px 10px;font-size:12px;"><i class="fa-solid fa-user"></i> \${humanCount} \${t('realUserFullTag', 'Gerçek Kullanıcı')} (\${verifiedCount} \${t('verifiedTag', 'Doğrulanmış')})</span>
      <span class="pill" style="background:rgba(239,68,68,0.12);color:var(--dn);border:1px solid rgba(239,68,68,0.3);padding:4px 10px;font-size:12px;"><i class="fa-solid fa-robot"></i> \${botCount} \${t('botDnsFullTag', 'Bot & DNS / Tarayıcı')}</span>
      \${suspiciousCount > 0 ? \`<span class="pill" style="background:rgba(245,158,11,0.12);color:var(--ac);border:1px solid rgba(245,158,11,0.3);padding:4px 10px;font-size:12px;"><i class="fa-solid fa-triangle-exclamation"></i> \${suspiciousCount} \${t('suspiciousTag', 'Şüpheli')}</span>\` : ''}
      <span class="sub" style="margin-left:auto;font-size:11px">\${t('totalTelemetryCount', 'Toplam {0} telemetri kaydı').replace('{0}', totalCount)}</span>
    \`;`
);

src = src.replace(
  `tbody.innerHTML = '<tr><td colspan="7" style="text-align:center;padding:24px;color:var(--mut);">Seçilen filtrelere uygun ziyaretçi günlüğü bulunmuyor.</td></tr>';`,
  `tbody.innerHTML = \`<tr><td colspan="7" style="text-align:center;padding:24px;color:var(--mut);">\${t('noLogsMatchingFilters', 'Seçilen filtrelere uygun ziyaretçi günlüğü bulunmuyor.')}</td></tr>\`;`
);

src = src.replace(
  `const loc = \`\${v.flag || '🌐'} \${v.city ? esc(v.city) + ', ' : ''}\${esc(v.country || 'Bilinmiyor')}\`;`,
  `const loc = \`\${v.flag || '<i class="fa-solid fa-globe"></i>'} \${v.city ? esc(v.city) + ', ' : ''}\${esc(v.country || t('unknownCityCountry', 'Bilinmiyor'))}\`;`
);

src = src.replace(
  `    if (v.visitorType === 'bot') {\n      const rText = Array.isArray(v.botReasons) && v.botReasons.length ? v.botReasons.join(', ') : 'Bot/DNS';\n      badgeHtml = \`<span class="tag" style="background:rgba(239,68,68,0.14);border:1px solid rgba(239,68,68,0.35);color:var(--dn);font-weight:600" title="\${esc(rText)}">🤖 Bot/DNS</span>\`;\n    } else if (v.visitorType === 'suspicious') {\n      badgeHtml = \`<span class="tag" style="background:rgba(245,158,11,0.14);border:1px solid rgba(245,158,11,0.35);color:var(--ac);font-weight:600" title="Şüpheli tarayıcı başlıkları">⚠️ Şüpheli</span>\`;\n    } else {\n      badgeHtml = \`<span class="tag" style="background:rgba(16,185,129,0.14);border:1px solid rgba(16,185,129,0.35);color:var(--up);font-weight:600">👤 Gerçek</span>\`;\n    }`,
  `    if (v.visitorType === 'bot') {
      const rText = Array.isArray(v.botReasons) && v.botReasons.length ? v.botReasons.join(', ') : 'Bot/DNS';
      badgeHtml = \`<span class="tag" style="background:rgba(239,68,68,0.14);border:1px solid rgba(239,68,68,0.35);color:var(--dn);font-weight:600" title="\${esc(rText)}"><i class="fa-solid fa-robot"></i> Bot/DNS</span>\`;
    } else if (v.visitorType === 'suspicious') {
      badgeHtml = \`<span class="tag" style="background:rgba(245,158,11,0.14);border:1px solid rgba(245,158,11,0.35);color:var(--ac);font-weight:600" title="\${t('suspiciousHeadersTitle', 'Şüpheli tarayıcı başlıkları')}"><i class="fa-solid fa-triangle-exclamation"></i> \${t('suspiciousTag', 'Şüpheli')}</span>\`;
    } else {
      badgeHtml = \`<span class="tag" style="background:rgba(16,185,129,0.14);border:1px solid rgba(16,185,129,0.35);color:var(--up);font-weight:600"><i class="fa-solid fa-user"></i> \${t('realUserTag', 'Gerçek')}</span>\`;
    }`
);

src = src.replace(
  `const verifiedTag = v.verified ? \`<small style="display:block;font-size:10px;color:var(--up);font-weight:600">✓ Doğrulandı</small>\` : '';`,
  `const verifiedTag = v.verified ? \`<small style="display:block;font-size:10px;color:var(--up);font-weight:600"><i class="fa-solid fa-check"></i> \${t('verifiedTag', 'Doğrulandı')}</small>\` : '';`
);

src = src.replace(`toast('CSV raporu indiriliyor...');`, `toast(t('toastDownloadingCsv', 'CSV raporu indiriliyor...'));`);
src = src.replace(`if (!confirm('Tüm ziyaretçi günlüklerini ve telemetry loglarını sıfırlamak istediğinize emin misiniz?')) return;`, `if (!confirm(t('confirmClearAllLogs', 'Tüm ziyaretçi günlüklerini ve telemetry loglarını sıfırlamak istediğinize emin misiniz?'))) return;`);
src = src.replace(`toast('Loglar temizlendi');`, `toast(t('toastLogsCleared', 'Loglar temizlendi'));`);
src = src.replace(`toast('Hata oluştu');`, `toast(t('toastErrorOccurred', 'Hata oluştu'));`);

// 12. Theme view toasts
src = src.replace(`toast('Site teması ve kurumsal kimlik kaydedildi!');`, `toast(t('toastThemeSaved', 'Site teması ve kurumsal kimlik kaydedildi!'));`);
src = src.replace(`toast('Bağlantı hatası');`, `toast(t('toastConnError', 'Bağlantı hatası'));`);
src = src.replace(`toast('Logo yükleniyor...');`, `toast(t('toastLogoUploading', 'Logo yükleniyor...'));`);
src = src.replace(`toast('Logo başarıyla yüklendi!');`, `toast(t('toastLogoUploaded', 'Logo başarıyla yüklendi!'));`);
src = src.replace(`toast('Logo yüklenemedi');`, `toast(t('toastLogoFailed', 'Logo yüklenemedi'));`);
src = src.replace(`toast('Yükleme hatası');`, `toast(t('toastUploadError', 'Yükleme hatası'));`);

// 13. CMS view form & sections
src = src.replace(
  `const CMS_SECTIONS = ['Hero', 'Hakkımızda', 'Misyon', 'Hizmetler', 'İletişim'];`,
  `const getCmsSections = () => [t('cmsTabHero', 'Hero'), t('cmsTabWho', 'Hakkımızda'), t('cmsTabPurpose', 'Misyon'), t('cmsTabServices', 'Hizmetler'), t('cmsTabContact', 'İletişim')];
let CMS_SECTIONS = getCmsSections();`
);

src = src.replace(
  `function renderCMSView() {\n  $('#ctabs').innerHTML = CMS_SECTIONS.map((t, i) => \`<button class="\${i === currentCmsTab ? 'on' : ''}">\${t}</button>\`).join('');`,
  `function renderCMSView() {
  CMS_SECTIONS = getCmsSections();
  $('#ctabs').innerHTML = CMS_SECTIONS.map((t, i) => \`<button class="\${i === currentCmsTab ? 'on' : ''}">\${t}</button>\`).join('');`
);

src = src.replace(
  `    <div class="f"><label>Üst etiket</label><input class="i" id="c-tag" value="\${esc(tag)}"></div>\n    <div class="f"><label>Ana başlık</label><input class="i" id="c1" value="\${esc(t1)}"></div>\n    <div class="f"><label>Açıklama</label><textarea id="c2">\${esc(t2)}</textarea></div>\n    <div class="f"><label>Buton metni</label><input class="i" id="c3" value="\${esc(t3)}"></div>\n    <button class="pill gold" id="btn-save-cms" style="margin-top:6px">Değişiklikleri kaydet</button>`,
  `    <div class="f"><label>\${t('lblTopTag', 'Üst etiket')}</label><input class="i" id="c-tag" value="\${esc(tag)}"></div>
    <div class="f"><label>\${t('lblMainTitle', 'Ana başlık')}</label><input class="i" id="c1" value="\${esc(t1)}"></div>
    <div class="f"><label>\${t('lblDescription', 'Açıklama')}</label><textarea id="c2">\${esc(t2)}</textarea></div>
    <div class="f"><label>\${t('lblBtnText', 'Buton metni')}</label><input class="i" id="c3" value="\${esc(t3)}"></div>
    <button class="pill gold" id="btn-save-cms" style="margin-top:6px">\${t('btnSaveChanges', 'Değişiklikleri kaydet')}</button>`
);

src = src.replace(`toast('İçerik kaydedildi!');`, `toast(t('toastContentSaved', 'İçerik kaydedildi!'));`);
src = src.replace(`toast('Kaydetme hatası');`, `toast(t('toastSaveError', 'Kaydetme hatası'));`);
src = src.replace(`if (!confirm('İçerik ayarlarını fabrika varsayılanlarına sıfırlamak istiyor musunuz?')) return;`, `if (!confirm(t('confirmResetFactory', 'İçerik ayarlarını fabrika varsayılanlarına sıfırlamak istiyor musunuz?'))) return;`);
src = src.replace(`toast('Fabrika ayarlarına dönüldü');`, `toast(t('toastResetFactory', 'Fabrika ayarlarına dönüldü'));`);

// 14. Sections view
src = src.replace(
  `  const secs = allSections.length ? allSections : [\n    { id: 'sec_stats', name: 'Etki ve rakamlar', enabled: true },\n    { id: 'sec_why_liberia', name: 'Neden Liberya?', enabled: true },\n    { id: 'sec_process', name: '4 aşamalı süreç', enabled: false },\n    { id: 'sec_faq', name: 'Sık sorulan sorular', enabled: true }\n  ];`,
  `  const secs = allSections.length ? allSections : [
    { id: 'sec_stats', name: S.lang === 'en' ? 'Impact & figures' : 'Etki ve rakamlar', enabled: true },
    { id: 'sec_why_liberia', name: S.lang === 'en' ? 'Why Liberia?' : 'Neden Liberya?', enabled: true },
    { id: 'sec_process', name: S.lang === 'en' ? '4-step process' : '4 aşamalı süreç', enabled: false },
    { id: 'sec_faq', name: S.lang === 'en' ? 'Frequently asked questions' : 'Sık sorulan sorular', enabled: true }
  ];`
);

src = src.replace(
  `toast(\`"\${secs[idx].name || 'Bölüm'}" güncellendi\`);`,
  `toast(t('toastSecUpdated', '"{0}" güncellendi').replace('{0}', secs[idx].name || (S.lang === 'en' ? 'Section' : 'Bölüm')));`
);
src = src.replace(`toast('Lütfen bölüm başlığı girin');`, `toast(t('toastEnterSecTitle', 'Lütfen bölüm başlığı girin'));`);
src = src.replace(`toast('Yeni bölüm eklendi!');`, `toast(t('toastSecAdded', 'Yeni bölüm eklendi!'));`);
src = src.replace(`toast('Bölüm eklenemedi');`, `toast(t('toastSecAddFailed', 'Bölüm eklenemedi'));`);

// 15. Mail view emojis and texts
src = src.replace(
  `toast(newStarred ? 'E-posta yıldızlandı ★' : 'Yıldız kaldırıldı ☆');`,
  `toast(newStarred ? t('toastEmailStarred', 'E-posta yıldızlandı') : t('toastStarRemoved', 'Yıldız kaldırıldı'));`
);

src = src.replace(
  `if (!confirm('Bu e-postayı silmek istediğinize emin misiniz? Bu işlem geri alınamaz.')) return;`,
  `if (!confirm(t('confirmDeleteMail', 'Bu e-postayı silmek istediğinize emin misiniz? Bu işlem geri alınamaz.'))) return;`
);

src = src.replace(`toast('Siliniyor...');`, `toast(t('toastDeleting', 'Siliniyor...'));`);
src = src.replace(`toast('E-posta başarıyla silindi 🗑️');`, `toast(t('toastEmailDeleted', 'E-posta başarıyla silindi'));`);
src = src.replace(`toast('Silme işlemi başarısız oldu');`, `toast(t('toastDeleteFailed', 'Silme işlemi başarısız oldu'));`);
src = src.replace(`toast('Silme hatası');`, `toast(t('toastDeleteError', 'Silme hatası'));`);

src = src.replace(
  `btnSidebar.innerHTML = isMailFullscreen\n      ? \`<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 3v3a2 2 0 0 1-2 2H3M21 8h-3a2 2 0 0 1-2-2V3M3 16h3a2 2 0 0 1 2 2v3M16 21v-3a2 2 0 0 1 2-2h3"/></svg><span>Pencere Modu</span>\`\n      : \`<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 3H5a2 2 0 0 0-2 2v3M21 8V5a2 2 0 0 0-2-2h-3M3 16v3a2 2 0 0 0 2 2h3M16 21h3a2 2 0 0 0 2-2v-3"/></svg><span>Tam Ekran Modu</span>\`;`,
  `btnSidebar.innerHTML = isMailFullscreen
      ? \`<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 3v3a2 2 0 0 1-2 2H3M21 8h-3a2 2 0 0 1-2-2V3M3 16h3a2 2 0 0 1 2 2v3M16 21v-3a2 2 0 0 1 2-2h3"/></svg><span>\${t('actionWindowMode', 'Pencere Modu')}</span>\`
      : \`<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 3H5a2 2 0 0 0-2 2v3M21 8V5a2 2 0 0 0-2-2h-3M3 16v3a2 2 0 0 0 2 2h3M16 21h3a2 2 0 0 0 2-2v-3"/></svg><span>\${t('actionFullscreenMode', 'Tam Ekran Modu')}</span>\`;`
);

src = src.replace(
  `btnDetail.innerHTML = isMailFullscreen\n      ? \`<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 3v3a2 2 0 0 1-2 2H3M21 8h-3a2 2 0 0 1-2-2V3M3 16h3a2 2 0 0 1 2 2v3M16 21v-3a2 2 0 0 1 2-2h3"/></svg><span>Pencere</span>\`\n      : \`<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 3H5a2 2 0 0 0-2 2v3M21 8V5a2 2 0 0 0-2-2h-3M3 16v3a2 2 0 0 0 2 2h3M16 21h3a2 2 0 0 0 2-2v-3"/></svg><span>Tam Ekran</span>\`;`,
  `btnDetail.innerHTML = isMailFullscreen
      ? \`<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 3v3a2 2 0 0 1-2 2H3M21 8h-3a2 2 0 0 1-2-2V3M3 16h3a2 2 0 0 1 2 2v3M16 21v-3a2 2 0 0 1 2-2h3"/></svg><span>\${t('actionWindow', 'Pencere')}</span>\`
      : \`<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M8 3H5a2 2 0 0 0-2 2v3M21 8V5a2 2 0 0 0-2-2h-3M3 16v3a2 2 0 0 0 2 2h3M16 21h3a2 2 0 0 0 2-2v-3"/></svg><span>\${t('actionFullscreen', 'Tam Ekran')}</span>\`;`
);

src = src.replace(
  `    const emptyMsg = mailSearchQuery\n      ? \`"\${esc(mailSearchQuery)}" ile eşleşen e-posta bulunamadı.\`\n      : mailActiveFolder === 'starred'\n        ? 'Henüz yıldızlanmış e-posta bulunmuyor.'\n        : mailActiveFolder === 'sent'\n          ? 'Gönderilen e-posta yok.'\n          : mailActiveFolder === 'draft'\n            ? 'Taslak e-posta bulunmuyor.'\n            : 'Gelen kutusu boş.';`,
  `    const emptyMsg = mailSearchQuery
      ? (S.lang === 'en' ? \`No emails matching "\${esc(mailSearchQuery)}".\` : \`"\${esc(mailSearchQuery)}" ile eşleşen e-posta bulunamadı.\`)
      : mailActiveFolder === 'starred'
        ? (S.lang === 'en' ? 'No starred emails yet.' : 'Henüz yıldızlanmış e-posta bulunmuyor.')
        : mailActiveFolder === 'sent'
          ? (S.lang === 'en' ? 'No sent emails.' : 'Gönderilen e-posta yok.')
          : mailActiveFolder === 'draft'
            ? (S.lang === 'en' ? 'No draft emails.' : 'Taslak e-posta bulunmuyor.')
            : t('inboxEmptyNotice', 'Gelen kutusu boş.');`
);

src = src.replace(
  `<div style="font-size:28px;margin-bottom:8px;opacity:.6;">✉️</div>`,
  `<div style="font-size:28px;margin-bottom:8px;opacity:.6;"><i class="fa-regular fa-envelope-open"></i></div>`
);

src = src.replace(
  `<div style="font-size:15px;font-weight:500;color:var(--ink);margin-bottom:4px;">Görüntülenecek e-posta seçilmedi</div>\n        <div style="font-size:12.5px;max-width:320px;">Sol listeden bir e-postayı seçerek detaylarını ve yanıt şablonunu görüntüleyebilirsiniz.</div>`,
  `<div style="font-size:15px;font-weight:500;color:var(--ink);margin-bottom:4px;">\${t('noMailSelectedNotice', 'Görüntülenecek e-posta seçilmedi')}</div>
        <div style="font-size:12.5px;max-width:320px;">\${t('selectMailDetailsNotice', 'Sol listeden bir e-postayı seçerek detaylarını ve yanıt şablonunu görüntüleyebilirsiniz.')}</div>`
);

src = src.replace(
  `<div style="font-size:15px;color:var(--ink);margin-bottom:4px;">Görüntülenecek e-posta yok</div>`,
  `<div style="font-size:15px;color:var(--ink);margin-bottom:4px;">\${t('noMailToDisplayNotice', 'Görüntülenecek e-posta yok')}</div>`
);

src = src.replace(
  `const displayName = m.name || m.to || 'Bilinmeyen Gönderici';`,
  `const displayName = m.name || m.to || t('unknownSenderDefault', 'Bilinmeyen Gönderici');`
);

src = src.replace(
  `<div class="mi-subject">\${esc(m.subject || m.service || 'Müşteri Talebi')}</div>`,
  `<div class="mi-subject">\${esc(m.subject || m.service || t('customerInquiryDefault', 'Müşteri Talebi'))}</div>`
);

src = src.replaceAll(
  `title="\${isStarred ? 'Yıldızı Kaldır' : 'Yıldızla'}"`,
  `title="\${isStarred ? t('actionUnstar', 'Yıldızı Kaldır') : t('actionStar', 'Yıldızla')}"`
);

src = src.replace(
  `title="E-postayı Sil"`,
  `title="\${t('actionDelete', 'E-postayı Sil')}"`
);

// Detail header buttons & tabs
src = src.replace(
  `<h3 class="mail-subject-title">\${esc(e.subject || 'Müşteri Talebi')}</h3>`,
  `<h3 class="mail-subject-title">\${esc(e.subject || t('customerInquiryDefault', 'Müşteri Talebi'))}</h3>`
);

src = src.replace(
  `<span>\${isStarred ? 'Yıldızlı' : 'Yıldızla'}</span>`,
  `<span>\${isStarred ? t('actionStarred', 'Yıldızlı') : t('actionStar', 'Yıldızla')}</span>`
);

src = src.replace(
  `<button class="mail-action-btn del" id="btn-detail-del" title="Bu e-postayı sil">\n          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>\n          <span>Sil</span>\n        </button>`,
  `<button class="mail-action-btn del" id="btn-detail-del" title="\${t('actionDelete', 'Sil')}">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
          <span>\${t('actionDelete', 'Sil')}</span>
        </button>`
);

src = src.replace(
  `\${TI} <span>Çevir (\${S.lang === 'tr' ? 'Türkçe' : 'English'})</span>`,
  `\${TI} <span>\${t('actionTranslate', 'Çevir')} (\${S.lang === 'tr' ? 'Türkçe' : 'English'})</span>`
);

src = src.replace(
  `⚡ <span>Şablonlar</span>`,
  `<i class="fa-solid fa-bolt"></i> <span>\${t('actionTemplates', 'Şablonlar')}</span>`
);

src = src.replace(
  `<span>\${isMailFullscreen ? 'Pencere' : 'Tam Ekran'}</span>`,
  `<span>\${isMailFullscreen ? t('actionWindow', 'Pencere') : t('actionFullscreen', 'Tam Ekran')}</span>`
);

src = src.replace(
  `<button class="\${mailViewMode === 'compose' ? 'on' : ''}" data-mvm="compose">✏️ Yanıt Yaz</button>\n          <button class="\${mailViewMode === 'preview' ? 'on' : ''}" data-mvm="preview">👁️ Canlı Önizleme</button>\n          <button class="\${mailViewMode === 'split' ? 'on' : ''}" data-mvm="split">◫ Bölünmüş</button>`,
  `<button class="\${mailViewMode === 'compose' ? 'on' : ''}" data-mvm="compose"><i class="fa-solid fa-pen"></i> \${t('actionWriteReply', 'Yanıt Yaz')}</button>
          <button class="\${mailViewMode === 'preview' ? 'on' : ''}" data-mvm="preview"><i class="fa-solid fa-eye"></i> \${t('actionLivePreview', 'Canlı Önizleme')}</button>
          <button class="\${mailViewMode === 'split' ? 'on' : ''}" data-mvm="split"><i class="fa-solid fa-table-columns"></i> \${t('actionSplitView', 'Bölünmüş')}</button>`
);

src = src.replace(
  `<span class="sub">Müşteriye iletilecek resmi Abentra e-posta şablonu önizlemesi:</span>`,
  `<span class="sub">\${t('officialPreviewSub', 'Müşteriye iletilecek resmi Abentra e-posta şablonu önizlemesi:')}</span>`
);

// Replace Yanıtı Gönder inside buttons cleanly
src = src.replaceAll(
  `              Yanıtı Gönder\n            </button>`,
  `              \${t('actionSendReply', 'Yanıtı Gönder')}\n            </button>`
);

src = src.replaceAll(`<label>Yanıt Şablonu</label>`, `<label>\${t('lblReplyTemplate', 'Yanıt Şablonu')}</label>`);
src = src.replace(`<label>Konu</label>`, `<label>\${t('lblMailSubject', 'Konu')}</label>`);
src = src.replace(`<label>Konu Başlığı</label>`, `<label>\${t('lblMailSubjectHeading', 'Konu Başlığı')}</label>`);
src = src.replace(`<label>Mesaj Metni (%Message%)</label>`, `<label>\${t('lblMailBody', 'Mesaj Metni (%Message%)')}</label>`);
src = src.replace(`<label>Özel Yanıt Mesajı (%Message%)</label>`, `<label>\${t('lblCustomReplyBody', 'Özel Yanıt Mesajı (%Message%)')}</label>`);
src = src.replace(
  `👁️ Canlı Önizlemeyi \${showSubPreview ? 'Gizle' : 'Göster'}`,
  `<i class="fa-solid fa-eye"></i> \${showSubPreview ? t('actionHidePreview', 'Canlı Önizlemeyi Gizle') : t('actionShowPreview', 'Canlı Önizlemeyi Göster')}`
);
src = src.replace(
  `<label class="sub" style="margin-bottom:6px;display:block;">E-Posta Şablon Önizlemesi</label>`,
  `<label class="sub" style="margin-bottom:6px;display:block;">\${t('lblMailPreviewHeading', 'E-Posta Şablon Önizlemesi')}</label>`
);

// Mail action toasts
src = src.replace(`toast('Çevriliyor...');`, `toast(t('toastTranslating', 'Çevriliyor...'));`);
src = src.replace(`toast('Çeviri tamamlandı');`, `toast(t('toastTranslationDone', 'Çeviri tamamlandı'));`);
src = src.replace(`toast('Yanıt mesajı boş olamaz');`, `toast(t('toastBodyEmpty', 'Yanıt mesajı boş olamaz'));`);
src = src.replace(`toast('E-posta gönderiliyor...');`, `toast(t('toastSendingEmail', 'E-posta gönderiliyor...'));`);
src = src.replace(
  `const templateName = rtElem ? rtElem.options[rtElem.selectedIndex].text : 'Özel Şablon';`,
  `const templateName = rtElem ? rtElem.options[rtElem.selectedIndex].text : t('phCustomTemplate', 'Özel Şablon');`
);
src = src.replace(`toast('E-posta başarıyla gönderildi!');`, `toast(t('toastEmailSent', 'E-posta başarıyla gönderildi!'));`);
src = src.replace(`toast('Gönderilemedi');`, `toast(t('toastSendFailed', 'Gönderilemedi'));`);
src = src.replace(`toast('Gönderim hatası');`, `toast(t('toastSendError', 'Gönderim hatası'));`);
src = src.replace(
  `if ($('#rsub')) $('#rsub').value = 'Yeni E-Posta / İletişim';`,
  `if ($('#rsub')) $('#rsub').value = t('phNewEmailInquiry', 'Yeni E-Posta / İletişim');`
);
src = src.replace(`toast('Yeni e-posta oluşturuluyor');`, `toast(t('toastComposingNewMail', 'Yeni e-posta oluşturuluyor'));`);

// 16. Audience view emojis and text
src = src.replace(
  `const mostSec = an.summary?.mostViewedSection ? (an.summary.mostViewedSection.toUpperCase() + ' Bölümü') : 'Hero Bölümü';`,
  `const mostSec = an.summary?.mostViewedSection ? (an.summary.mostViewedSection.toUpperCase() + (S.lang === 'en' ? ' Section' : ' Bölümü')) : (S.lang === 'en' ? 'Hero Section' : 'Hero Bölümü');`
);

src = src.replace(
  `  const AK = [\n    { icon: ICONS.ak_user, title: 'Aktif kullanıcı', val: \`<span class="auv">\${activeCount}</span>\`, diff: activeCount > 0 ? 'canlı' : '0 aktif', c: activeCount > 0 ? '--up' : '--ac' },\n    { icon: ICONS.ak_hour, title: 'En yoğun saat', val: topPeak.label, diff: \`%\${topPeak.pct} pay\`, c: '--n1' },\n    { icon: ICONS.ak_country, title: 'En çok giriş', val: \`\${topCountry.flag || ''} \${topCountry.name}\`, diff: \`\${topCountry.count} ziyaret\`, c: '--ac' },\n    { icon: ICONS.ak_dwell, title: 'En çok ilgi', val: mostSec, diff: 'Lider', c: '--n3' }\n  ];`,
  `  const AK = [
    { icon: ICONS.ak_user, title: t('k0', 'Aktif kullanıcı'), val: \`<span class="auv">\${activeCount}</span>\`, diff: activeCount > 0 ? (S.lang === 'en' ? 'live' : 'canlı') : t('zeroActiveLabel', '0 aktif'), c: activeCount > 0 ? '--up' : '--ac' },
    { icon: ICONS.ak_hour, title: t('audPeakHour', 'En yoğun saat'), val: topPeak.label, diff: \`%\${topPeak.pct} \${S.lang === 'en' ? 'share' : 'pay'}\`, c: '--n1' },
    { icon: ICONS.ak_country, title: t('audTopCountry', 'En çok giriş'), val: \`\${topCountry.flag || ''} \${topCountry.name}\`, diff: t('audVisitsCount', '{0} ziyaret').replace('{0}', topCountry.count), c: '--ac' },
    { icon: ICONS.ak_dwell, title: t('audTopInterest', 'En çok ilgi'), val: mostSec, diff: t('audLeader', 'Lider'), c: '--n3' }
  ];`
);

src = src.replace(
  `<div class="sy flag">\${c.flag || '🌐'}</div>\n      <b>\${c.name}<small>ort. \${c.duration || '0:06'}</small></b>`,
  `<div class="sy flag">\${c.flag || '<i class="fa-solid fa-globe"></i>'}</div>
      <b>\${c.name}<small>\${t('audAvgPrefix', 'ort. {0}').replace('{0}', c.duration || '0:06')}</small></b>`
);

src = src.replace(
  `<b>\${topPeak.label}<small>Günün ana zirvesi</small></b>`,
  `<b>\${topPeak.label}<small>\${t('audDailyMainPeak', 'Günün ana zirvesi')}</small></b>`
);

src = src.replace(
  `<b>\${secondPeak.label}<small>İkincil yoğunluk</small></b>`,
  `<b>\${secondPeak.label}<small>\${t('audSecondaryPeak', 'İkincil yoğunluk')}</small></b>`
);

src = src.replace(
  `<p class="sub" style="margin-bottom:12px">Kullanıcılar en uzun <b>\${esc(maxDwell.name)}</b> bölümünde kalıyor (\${esc(maxDwell.dur)}), en az <b>\${esc(minDwell.name)}</b> bölümünde (\${esc(minDwell.dur)}).</p>`,
  `<p class="sub" style="margin-bottom:12px">\${t('audDwellComparison', 'Kullanıcılar en uzun <b>{0}</b> bölümünde kalıyor ({1}), en az <b>{2}</b> bölümünde ({3}).').replace('{0}', esc(maxDwell.name)).replace('{1}', esc(maxDwell.dur)).replace('{2}', esc(minDwell.name)).replace('{3}', esc(minDwell.dur))}</p>`
);

src = src.replace(
  `    const secName = topSec ? (topSec.charAt(0).toUpperCase() + topSec.slice(1) + ' Bölümü') : 'Hero Bölümü';`,
  `    const secName = topSec ? (topSec.charAt(0).toUpperCase() + topSec.slice(1) + (S.lang === 'en' ? ' Section' : ' Bölümü')) : (S.lang === 'en' ? 'Hero Section' : 'Hero Bölümü');`
);

src = src.replace(
  `flag: v.flag || '🌐',`,
  `flag: v.flag || '<i class="fa-solid fa-globe"></i>',`
);

src = src.replace(
  `<b style="flex:1;width:auto">\${esc(s.sec)}<small>ziyaretçi oturumu</small></b>`,
  `<b style="flex:1;width:auto">\${esc(s.sec)}<small>\${t('audVisitorSession', 'ziyaretçi oturumu')}</small></b>`
);

src = src.replace(
  `$('#ss').innerHTML = '<p class="sub" style="padding:12px 0">Henüz aktif oturum bulunmuyor.</p>';`,
  `$('#ss').innerHTML = \`<p class="sub" style="padding:12px 0">\${t('audNoActiveSessions', 'Henüz aktif oturum bulunmuyor.')}</p>\`;`
);

// Right rail in audience
src = src.replace(
  `<p class="sub"><span class="pd"></span>Şu an sitede</p>\n    <div class="nv auv" style="--c:var(--up);margin:6px 0 2px">\${activeCount}</div>\n    <p class="sub">aktif kullanıcı</p>\n    <hr class="hr">\n    <p class="sub">En yoğun saat aralığı</p>\n    <div class="nv" style="--c:var(--n1);font-size:26px;margin:6px 0 2px">\${peakText}</div>\n    <p class="sub">GMT · günlük trafiğin %\${peakPct}'si</p>\n    <hr class="hr">\n    <p class="sub" style="margin-bottom:6px">En çok giriş yapılan ülkeler</p>\n    \${C.slice(0, 3).map((c, i) => \`\n      <div class="mk" style="--c:var(\${['--n1', '--ac', '--n3'][i]});border:0;padding:6px 0">\n        <div class="sy flag" style="width:30px;height:30px;font-size:16px;">\${c.flag || '🌐'}</div>\n        <b style="flex:1;width:auto">\${esc(c.name)}</b>\n        <span class="px" style="width:auto">\${c.count}</span>\n      </div>\n    \`).join('')}\n    <hr class="hr">\n    <p class="sub" style="margin-bottom:4px">Öne çıkan alan</p>`,
  `<p class="sub"><span class="pd"></span>\${t('audCurrentlyOnSite', 'Şu an sitede')}</p>
    <div class="nv auv" style="--c:var(--up);margin:6px 0 2px">\${activeCount}</div>
    <p class="sub">\${t('k0', 'aktif kullanıcı')}</p>
    <hr class="hr">
    <p class="sub">\${t('audPeakInterval', 'En yoğun saat aralığı')}</p>
    <div class="nv" style="--c:var(--n1);font-size:26px;margin:6px 0 2px">\${peakText}</div>
    <p class="sub">\${t('audGmtShare', "GMT · günlük trafiğin %{0}'si").replace('{0}', peakPct)}</p>
    <hr class="hr">
    <p class="sub" style="margin-bottom:6px">\${t('audTopVisitingCountries', 'En çok giriş yapılan ülkeler')}</p>
    \${C.slice(0, 3).map((c, i) => \`
      <div class="mk" style="--c:var(\${['--n1', '--ac', '--n3'][i]});border:0;padding:6px 0">
        <div class="sy flag" style="width:30px;height:30px;font-size:16px;">\${c.flag || '<i class="fa-solid fa-globe"></i>'}</div>
        <b style="flex:1;width:auto">\${esc(c.name)}</b>
        <span class="px" style="width:auto">\${c.count}</span>
      </div>
    \`).join('')}
    <hr class="hr">
    <p class="sub" style="margin-bottom:4px">\${t('audFeaturedSection', 'Öne çıkan alan')}</p>`
);

// 17. FAQ view
src = src.replace(`toast('E-postalar tarandı ve 4 ana soru tespit edildi');`, `toast(t('toastFaqScanned', 'E-postalar tarandı ve 4 ana soru tespit edildi'));`);
src = src.replace(`<small>\${g.c} farklı müşteride soruldu</small>`, `<small>\${t('askedInClients', '{0} farklı müşteride soruldu').replace('{0}', g.c)}</small>`);
src = src.replace(`<button class="pill gold" data-addfaq="\${i}">SSS'ye Ekle</button>`, `<button class="pill gold" data-addfaq="\${i}">\${t('actionAddToFaq', "SSS'ye Ekle")}</button>`);
src = src.replace(`toast('SSS listesine eklendi');`, `toast(t('toastAddedToFaq', 'SSS listesine eklendi'));`);
src = src.replace(`<button class="pill" data-fdel="\${i}" style="color:var(--dn);font-size:12px;">Sil</button>`, `<button class="pill" data-fdel="\${i}" style="color:var(--dn);font-size:12px;">\${t('actionDelete', 'Sil')}</button>`);
src = src.replace(`placeholder="Cevabı yazın..."`, `placeholder="\${t('phTypeAnswer', 'Cevabı yazın...')}"`);
src = src.replace(`toast('SSS durumu güncellendi');`, `toast(t('toastFaqUpdated', 'SSS durumu güncellendi'));`);
src = src.replace(`toast('Soru silindi');`, `toast(t('toastQuestionDeleted', 'Soru silindi'));`);

// 18. Security & Backup view
src = src.replace(`toast('Yeni şifreler birbiriyle eşleşmiyor');`, `toast(t('toastPasswordMismatch', 'Yeni şifreler birbiriyle eşleşmiyor'));`);
src = src.replace(`toast('Şifreniz başarıyla güncellendi ve hash ile korundu!');`, `toast(t('toastPasswordUpdated', 'Şifreniz başarıyla güncellendi ve hash ile korundu!'));`);
src = src.replace(`toast(data.error || 'Şifre güncellenemedi');`, `toast(data.error || t('toastPasswordFailed', 'Şifre güncellenemedi'));`);
src = src.replace(`toast('Bağlantı hatası');`, `toast(t('toastConnError', 'Bağlantı hatası'));`);
src = src.replace(`toast('Sistem yedeği indiriliyor...');`, `toast(t('toastDownloadingBackup', 'Sistem yedeği indiriliyor...'));`);
src = src.replace(`toast('Yedek başarıyla geri yüklendi!');`, `toast(t('toastBackupRestored', 'Yedek başarıyla geri yüklendi!'));`);
src = src.replace(`toast('Geri yükleme başarısız');`, `toast(t('toastRestoreFailed', 'Geri yükleme başarısız'));`);
src = src.replace(`toast('Geçersiz yedek dosyası');`, `toast(t('toastInvalidBackup', 'Geçersiz yedek dosyası'));`);

// 19. Templates view
src = src.replace(
  `const PH = [\n  ['Subject', 'E-posta konusu'],\n  ['Message', 'Ana mesaj (zorunlu)'],\n  ['Name', 'Alıcı adı'],\n  ['Company', 'Alıcı şirketi'],\n  ['Service', 'Talep edilen hizmet'],\n  ['Sender', 'Gönderen yönetici'],\n  ['SenderTitle', 'Gönderen unvanı'],\n  ['Phone', 'Telefon'],\n  ['Date', 'Tarih'],\n  ['Year', 'Yıl']\n];`,
  `const getPH = () => [
  ['Subject', S.lang === 'en' ? 'Email subject' : 'E-posta konusu'],
  ['Message', S.lang === 'en' ? 'Main message (required)' : 'Ana mesaj (zorunlu)'],
  ['Name', S.lang === 'en' ? 'Recipient name' : 'Alıcı adı'],
  ['Company', S.lang === 'en' ? 'Recipient company' : 'Alıcı şirketi'],
  ['Service', S.lang === 'en' ? 'Requested service' : 'Talep edilen hizmet'],
  ['Sender', S.lang === 'en' ? 'Sender executive' : 'Gönderen yönetici'],
  ['SenderTitle', S.lang === 'en' ? 'Sender title' : 'Gönderen unvanı'],
  ['Phone', S.lang === 'en' ? 'Phone' : 'Telefon'],
  ['Date', S.lang === 'en' ? 'Date' : 'Tarih'],
  ['Year', S.lang === 'en' ? 'Year' : 'Yıl']
];
let PH = getPH();`
);

src = src.replace(
  `$('#phs').innerHTML = PH.map(p => \`\n    <div class="pr" data-ph="\${p[0]}"><code>%\${p[0]}%</code><span>\${p[1]}</span></div>\n  \`).join('');`,
  `PH = getPH();
  $('#phs').innerHTML = PH.map(p => \`
    <div class="pr" data-ph="\${p[0]}"><code>%\${p[0]}%</code><span>\${p[1]}</span></div>
  \`).join('');`
);

src = src.replace(`toast(\`\${ph} kopyalandı\`);`, `toast(t('toastPlaceholderCopied', '{0} kopyalandı').replace('{0}', ph));`);
src = src.replace(`toast('Şablon kaydedildi!');`, `toast(t('toastTemplateSaved', 'Şablon kaydedildi!'));`);
src = src.replace(`toast('Kaydetme hatası');`, `toast(t('toastSaveError', 'Kaydetme hatası'));`);

// 20. Users and permissions view & modal
src = src.replace(
  `const permCount = isSuperUser ? 'Tam Yetki' : \`\${(u.permissions || []).length} yetki\`;`,
  `const permCount = isSuperUser ? t('fullPermissionsTag', 'Tam Yetki') : t('permissionsCountTag', '{0} yetki').replace('{0}', (u.permissions || []).length);`
);

src = src.replace(
  `\${hasSwitch ? ' · <span style="color:var(--up);font-weight:600;">⚡ Hızlı Geçiş</span>' : ''}`,
  `\${hasSwitch ? ' · <span style="color:var(--up);font-weight:600;"><i class="fa-solid fa-bolt"></i> ' + t('actionQuickSwitch', 'Hızlı Geçiş') + '</span>' : ''}`
);

src = src.replace(
  `\${(isSuper && u.id !== currentUser?.id) ? \`<button class="pill" data-switch-u="\${u.id}" title="Şifresiz hızlı geçiş yap">⚡ Geçiş Yap</button>\` : ''}\n          <button class="pill gold" data-ea="\${i}">Yetkileri Düzenle</button>`,
  `\${(isSuper && u.id !== currentUser?.id) ? \`<button class="pill" data-switch-u="\${u.id}" title="\${t('quickSwitchTooltip', 'Şifresiz hızlı geçiş yap')}"><i class="fa-solid fa-bolt"></i> \${t('actionSwitchAccount', 'Geçiş Yap')}</button>\` : ''}
          <button class="pill gold" data-ea="\${i}">\${t('actionEditPermissions', 'Yetkileri Düzenle')}</button>`
);

src = src.replace(
  `<span class="tag">\${x.perms.length} yetki</span>`,
  `<span class="tag">\${t('permissionsCountTag', '{0} yetki').replace('{0}', x.perms.length)}</span>`
);

src = src.replace(
  `<h3>\${esc(u.name || u.username)} · Yetkileri Düzenle</h3>`,
  `<h3>\${t('modalEditUserTitle', '{0} · Yetkileri Düzenle').replace('{0}', esc(u.name || u.username))}</h3>`
);

src = src.replace(
  `<button class="pill" data-x="close" aria-label="Kapat">✕</button>`,
  `<button class="pill" data-x="close" aria-label="\${t('actionClose', 'Kapat')}"><i class="fa-solid fa-xmark"></i></button>`
);

src = src.replace(
  `<div class="f">\n        <label>Ad Soyad</label>\n        <input class="i" id="m-name" value="\${esc(u.name || '')}">\n      </div>\n      <div class="f">\n        <label>Rol / Unvan</label>\n        <input class="i" id="m-role" value="\${esc(u.role || '')}">\n      </div>`,
  `<div class="f">
        <label>\${t('modalFullName', 'Ad Soyad')}</label>
        <input class="i" id="m-name" value="\${esc(u.name || '')}">
      </div>
      <div class="f">
        <label>\${t('modalRole', 'Rol / Unvan')}</label>
        <input class="i" id="m-role" value="\${esc(u.role || '')}">
      </div>`
);

src = src.replace(
  `<h4>Özel Sistem Yetkileri</h4>\n    <p class="sub" style="margin-bottom:8px">Bu yetki açık olan kullanıcılar, SuperAdmin gibi şifre girmeden yöneticiler arasında geçiş yapabilir.</p>`,
  `<h4>\${t('modalSpecialPermsTitle', 'Özel Sistem Yetkileri')}</h4>
    <p class="sub" style="margin-bottom:8px">\${t('modalSpecialPermsSub', 'Bu yetki açık olan kullanıcılar...')}</p>`
);

src = src.replace(
  `        'switch_user',\n        'Kullanıcılar Arasında Geçiş Yapabilme (Şifresiz Hızlı Geçiş)',\n        isSuper || perms.includes('switch_user'),\n        isSuper,\n        isSuper ? 'Süper Yönetici / Zorunlu' : ''`,
  `        'switch_user',
        t('permSwitchUserLabel', 'Kullanıcılar Arasında Geçiş Yapabilme (Şifresiz Hızlı Geçiş)'),
        isSuper || perms.includes('switch_user'),
        isSuper,
        isSuper ? t('permSuperAdminRequired', 'Süper Yönetici / Zorunlu') : ''`
);

src = src.replace(`<h4>Erişilebilir Sayfalar</h4>`, `<h4>\${t('modalAccessiblePagesTitle', 'Erişilebilir Sayfalar')}</h4>`);
src = src.replace(`<h4>Yönetim & Ayarlar</h4>`, `<h4>\${t('modalMgmtSettingsTitle', 'Yönetim & Ayarlar')}</h4>`);

src = src.replace(
  `<button class="pill gold" id="btn-modal-save-perms">Kaydet</button>\n      <button class="pill" data-x="close">Vazgeç</button>\n      <span style="flex:1"></span>\n      \${!isSuper ? \`\n        <button class="pill" id="btn-modal-select-all">Tümünü Seç</button>\n        <button class="pill" id="btn-modal-clear-all">Temizle</button>\n      \` : ''}`,
  `<button class="pill gold" id="btn-modal-save-perms">\${t('actionSave', 'Kaydet')}</button>
      <button class="pill" data-x="close">\${t('actionCancel', 'Vazgeç')}</button>
      <span style="flex:1"></span>
      \${!isSuper ? \`
        <button class="pill" id="btn-modal-select-all">\${t('actionSelectAll', 'Tümünü Seç')}</button>
        <button class="pill" id="btn-modal-clear-all">\${t('actionClearAll', 'Temizle')}</button>
      \` : ''}`
);

src = src.replace(`toast('Yetkiler kaydediliyor...');`, `toast(t('toastSavingPermissions', 'Yetkiler kaydediliyor...'));`);
src = src.replace(`toast('Yetkiler başarıyla güncellendi!');`, `toast(t('toastPermissionsUpdated', 'Yetkiler başarıyla güncellendi!'));`);
src = src.replace(`toast(data.error || 'Kaydetme başarısız');`, `toast(data.error || t('toastSavePermsFailed', 'Kaydetme başarısız'));`);
src = src.replace(`toast('Kaydetme hatası');`, `toast(t('toastSaveError', 'Kaydetme hatası'));`);

// Save updated admin.js
fs.writeFileSync('moon/manager/js/admin.js', src, 'utf8');
console.log('Successfully refactored moon/manager/js/admin.js with full i18n support and FontAwesome icons!');
