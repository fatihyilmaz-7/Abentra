const fs = require('fs');

let src = fs.readFileSync('moon/manager/js/admin.js', 'utf8');

// 1. Initialize S.lang from localStorage
src = src.replace(
  `let S = {\n  me: 0,\n  neon: 1,\n  theme: 'midnight',\n  layout: 'rail',\n  shape: 'soft',\n  density: 'normal',\n  lang: 'tr',`,
  `let S = {\n  me: 0,\n  neon: 1,\n  theme: 'midnight',\n  layout: 'rail',\n  shape: 'soft',\n  density: 'normal',\n  lang: (typeof localStorage !== 'undefined' && localStorage.getItem('abentra_admin_lang')) || 'tr',`
);

// 2. DOMContentLoaded call apply() before checkAuth()
src = src.replace(
  `document.addEventListener('DOMContentLoaded', () => {\n  checkAuth();\n});`,
  `document.addEventListener('DOMContentLoaded', () => {\n  apply();\n  checkAuth();\n});`
);

// 3. Toasts localization
src = src.replaceAll(`toast('Hata: ' + err.message);`, `toast((S.lang === 'en' ? 'Error: ' : 'Hata: ') + err.message);`);
src = src.replaceAll(`toast('Hata oluştu');`, `toast(t('toastErrorOccurred', 'Hata oluştu'));`);
src = src.replace(
  `toast('Kayıt başarısız: ' + (data.error || 'Hata'));`,
  `toast((S.lang === 'en' ? 'Save failed: ' : 'Kayıt başarısız: ') + (data.error || (S.lang === 'en' ? 'Error' : 'Hata')));`
);
src = src.replace(
  `toast('Hata: ' + (data.error || 'Kaydedilemedi'));`,
  `toast((S.lang === 'en' ? 'Error: ' : 'Hata: ') + (data.error || (S.lang === 'en' ? 'Could not save' : 'Kaydedilemedi')));`
);

// 4. Temel terminal outputs
src = src.replace(
  `appendToTerminal(data.result.output || ['Tüm veri ve metrikler başarıyla silindi.']);`,
  `appendToTerminal(data.result.output || [t('termPurgeSuccess', 'Tüm veri ve metrikler başarıyla silindi.')]);`
);
src = src.replace(
  `appendToTerminal('[HATA] ' + (data.error || 'Silme işlemi başarısız.'));`,
  `appendToTerminal((S.lang === 'en' ? '[ERROR] ' : '[HATA] ') + (data.error || t('termPurgeError', 'Silme işlemi başarısız.')));`
);
src = src.replace(
  `appendToTerminal('[HATA] Sunucu bağlantı hatası: ' + err.message);`,
  `appendToTerminal((S.lang === 'en' ? '[ERROR] Server connection error: ' : '[HATA] Sunucu bağlantı hatası: ') + err.message);`
);
src = src.replace(
  `appendToTerminal('[HATA] Bağlantı hatası: ' + err.message);`,
  `appendToTerminal((S.lang === 'en' ? '[ERROR] Connection error: ' : '[HATA] Bağlantı hatası: ') + err.message);`
);
src = src.replace(
  `appendToTerminal(\`[AYAR] Otomatik temizleme takvimi kaydedildi: \${schedule.toUpperCase()} (Retention: \${retentionDays} gün)\`);`,
  `appendToTerminal(S.lang === 'en' ? \`[CONFIG] Auto-purge schedule saved: \${schedule.toUpperCase()} (Retention: \${retentionDays} days)\` : \`[AYAR] Otomatik temizleme takvimi kaydedildi: \${schedule.toUpperCase()} (Retention: \${retentionDays} gün)\`);`
);
src = src.replace(
  `appendToTerminal(\`[AYAR] Temel sistem parametreleri güncellendi (Başlık: \${siteName || 'Mevcut'})\`);`,
  `appendToTerminal(S.lang === 'en' ? \`[CONFIG] General system parameters updated (Title: \${siteName || 'Current'})\` : \`[AYAR] Temel sistem parametreleri güncellendi (Başlık: \${siteName || 'Mevcut'})\`);`
);

// 5. Update CMS form default placeholders for English
src = src.replace(
  `let tag = 'Liberya kurumsal danışmanlık', t1 = "Liberya'nın kapısını açıyoruz", t2 = 'Mevzuat, izin ve süreç yönetiminde uçtan uca destek.', t3 = 'Bizimle görüşün';`,
  `const isEn = S.lang === 'en';\n  let tag = isEn ? 'Liberia corporate advisory' : 'Liberya kurumsal danışmanlık', t1 = isEn ? 'Opening doors to Liberia' : "Liberya'nın kapısını açıyoruz", t2 = isEn ? 'End-to-end support in regulations, licensing and governmental processes.' : 'Mevzuat, izin ve süreç yönetiminde uçtan uca destek.', t3 = isEn ? 'Contact us' : 'Bizimle görüşün';`
);
src = src.replace(
  `tag = cfg.who.tag || 'Şirket Profili';\n    t1 = cfg.who.title || 'Bağlantı & İtibar';\n    t2 = cfg.who.lead || 'Liberya genelinde stratejik iş geliştirme';\n    t3 = 'Hakkımızda Detay';`,
  `tag = cfg.who.tag || (isEn ? 'Company Profile' : 'Şirket Profili');\n    t1 = cfg.who.title || (isEn ? 'Network & Reputation' : 'Bağlantı & İtibar');\n    t2 = cfg.who.lead || (isEn ? 'Strategic business development across Liberia' : 'Liberya genelinde stratejik iş geliştirme');\n    t3 = isEn ? 'About Details' : 'Hakkımızda Detay';`
);
src = src.replace(
  `tag = cfg.purpose.tag || 'Amacımız';\n    t1 = cfg.purpose.title || 'Vizyon ve Değerlerimiz';\n    t2 = cfg.purpose.desc || 'Şeffaf ve güvenilir kurumsal rehberlik';\n    t3 = 'Misyonu İncele';`,
  `tag = cfg.purpose.tag || (isEn ? 'Our Purpose' : 'Amacımız');\n    t1 = cfg.purpose.title || (isEn ? 'Vision & Values' : 'Vizyon ve Değerlerimiz');\n    t2 = cfg.purpose.desc || (isEn ? 'Transparent and trusted corporate guidance' : 'Şeffaf ve güvenilir kurumsal rehberlik');\n    t3 = isEn ? 'Explore Mission' : 'Misyonu İncele';`
);
src = src.replace(
  `tag = cfg.contact.tag || 'İletişim';\n    t1 = cfg.contact.title || 'Bizimle Görüşün';\n    t2 = cfg.contact.addressLine1 || 'Camp Johnson Road, Monrovia';\n    t3 = cfg.contact.ctaText || 'İletişime Geç';`,
  `tag = cfg.contact.tag || (isEn ? 'Contact' : 'İletişim');\n    t1 = cfg.contact.title || (isEn ? 'Connect With Us' : 'Bizimle Görüşün');\n    t2 = cfg.contact.addressLine1 || 'Camp Johnson Road, Monrovia';\n    t3 = cfg.contact.ctaText || (isEn ? 'Get in Touch' : 'İletişime Geç');`
);

// 6. sampleData for Mail
src = src.replace(
  `Subject: $('#rsub')?.value || $('#ts')?.value || 'Örnek konu',\n  Message: $('#rb')?.value || $('#tm')?.value || 'Örnek mesaj metni.',\n  Name: 'Mehmet Yıldız',\n  Company: 'Yıldız Holding',\n  Service: 'Yatırım ve Şirket Kuruluşu',`,
  `Subject: $('#rsub')?.value || $('#ts')?.value || (S.lang === 'en' ? 'Sample inquiry subject' : 'Örnek konu'),\n  Message: $('#rb')?.value || $('#tm')?.value || (S.lang === 'en' ? 'Sample message text.' : 'Örnek mesaj metni.'),\n  Name: S.lang === 'en' ? 'Alexander Wright' : 'Mehmet Yıldız',\n  Company: S.lang === 'en' ? 'Wright Global Capital' : 'Yıldız Holding',\n  Service: S.lang === 'en' ? 'Investment & Corporate Setup' : 'Yatırım ve Şirket Kuruluşu',`
);

// 7. Dynamic Permission keys
src = src.replace(
  `const pgKeys = [\n    ['aud', 'Kitle Analizi'],\n    ['logs', 'Ziyaretçi Logları'],\n    ['sec', 'Ara Bölümler'],\n    ['mail', 'E-Posta Merkezi'],\n    ['faq', 'Sık Sorulan Sorular']\n  ];`,
  `const pgKeys = [\n    ['aud', t('aud', 'Kitle Analizi')],\n    ['logs', t('logs', 'Ziyaretçi Logları')],\n    ['sec', t('sec', 'Ara Bölümler')],\n    ['mail', t('mail', 'E-Posta Merkezi')],\n    ['faq', t('faq', 'Sık Sorulan Sorular')]\n  ];`
);
src = src.replace(
  `const siKeys = [\n    ['temel', 'Temel Ayarlar ve Veri Yönetimi'],\n    ['gor', 'Görünüm ve Tema'],\n    ['theme', 'Site Teması'],\n    ['cms', 'İçerik Yönetimi'],\n    ['tpl', 'E-Posta Şablonları'],\n    ['guv', 'Güvenlik ve Yedek'],\n    ['yet', 'Yetkiler ve Yöneticiler']\n  ];`,
  `const siKeys = [\n    ['temel', t('temel', 'Temel Ayarlar ve Veri Yönetimi')],\n    ['gor', t('gor', 'Görünüm ve Tema')],\n    ['theme', t('theme', 'Site Teması')],\n    ['cms', t('cms', 'İçerik Yönetimi')],\n    ['tpl', t('tpl', 'E-Posta Şablonları')],\n    ['guv', t('guv', 'Güvenlik ve Yedek')],\n    ['yet', t('yet', 'Yetkiler ve Yöneticiler')]\n  ];`
);

// 8. Bundle Security & System display name in #pl
src = src.replace(
  `<b>\${esc(x.name)}<small class="sub" style="display:block;font-weight:400">\${x.perms.join(', ')}</small></b>`,
  `<b>\${esc(x.name === 'Güvenlik & Sistem' && S.lang === 'en' ? 'Security & System' : x.name)}<small class="sub" style="display:block;font-weight:400">\${x.perms.join(', ')}</small></b>`
);

// 9. Audience Turkey country name
src = src.replace(
  `{ name: 'Türkiye', flag: '🇹🇷', count: 7, duration: '1:45' },`,
  `{ name: S.lang === 'en' ? 'Turkey' : 'Türkiye', flag: '🇹🇷', count: 7, duration: '1:45' },`
);

// 10. Appearance View Dynamic Localization Function
const oldAppearanceBlock = `// Appearance Event Handlers
const CP_LIST = [
  ['--ac', 'Vurgu Altını'],
  ['--n1', 'Neon Mavisi'],
  ['--n3', 'İkinci Neon'],
  ['--up', 'Yükseliş Yeşili'],
  ['--dn', 'Düşüş Pembesi'],
  ['--ink', 'Metin Rengi'],
  ['--bg1', 'Arka Plan 1'],
  ['--bg2', 'Arka Plan 2']
];
$('#cp').innerHTML = CP_LIST.map(c => \`<div class="cs"><input type="color" data-k="\${c[0]}"><span>\${c[1]}</span></div>\`).join('');
$('#cp').oninput = e => {
  S.o[e.target.dataset.k] = e.target.value;
  apply();
};

const RG_LIST = [
  ['--bl', 'Cam Bulanıklığı', 0, 60, 1, 'px'],
  ['--ga', 'Cam Şeffaflığı', .02, .8, .01, ''],
  ['--gl', 'Neon Parlaklığı', 0, 1.6, .05, '']
];
$('#rg').innerHTML = RG_LIST.map(r => \`<div class="f"><label>\${r[1]} <b></b></label><input type="range" data-k="\${r[0]}" data-u="\${r[5]}" min="\${r[2]}" max="\${r[3]}" step="\${r[4]}"></div>\`).join('');
$('#rg').oninput = e => {
  S.o[e.target.dataset.k] = e.target.value + e.target.dataset.u;
  apply();
};

$('#tts').innerHTML = Object.keys(TH).map(k => {
  const t = TH[k], v = t.v;
  return \`<button class="tt" data-t="\${k}" style="background:linear-gradient(135deg,\${v['--bg1']},\${v['--bg2']});color:\${v['--ink']}"><i style="background:\${v['--n1']};box-shadow:0 0 12px \${v['--n1']}"></i><b>\${t.n}</b><small>\${t.d}</small></button>\`;
}).join('');`;

const newAppearanceBlock = `// Appearance Event Handlers & Dynamic Localization
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
    cp.innerHTML = CP_LIST.map(c => \`<div class="cs"><input type="color" data-k="\${c[0]}"><span>\${c[1]}</span></div>\`).join('');
  }

  const RG_LIST = [
    ['--bl', isEn ? 'Glass Blur' : 'Cam Bulanıklığı', 0, 60, 1, 'px'],
    ['--ga', isEn ? 'Glass Opacity' : 'Cam Şeffaflığı', .02, .8, .01, ''],
    ['--gl', isEn ? 'Neon Glow' : 'Neon Parlaklığı', 0, 1.6, .05, '']
  ];
  const rg = $('#rg');
  if (rg) {
    rg.innerHTML = RG_LIST.map(r => \`<div class="f"><label>\${r[1]} <b></b></label><input type="range" data-k="\${r[0]}" data-u="\${r[5]}" min="\${r[2]}" max="\${r[3]}" step="\${r[4]}"></div>\`).join('');
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
      return \`<button class="tt" data-t="\${k}" style="background:linear-gradient(135deg,\${v['--bg1']},\${v['--bg2']});color:\${v['--ink']}"><i style="background:\${v['--n1']};box-shadow:0 0 12px \${v['--n1']}"></i><b>\${t.n}</b><small>\${desc}</small></button>\`;
    }).join('');
  }
}

renderAppearanceControls();

$('#cp').oninput = e => {
  S.o[e.target.dataset.k] = e.target.value;
  apply();
};

$('#rg').oninput = e => {
  S.o[e.target.dataset.k] = e.target.value + e.target.dataset.u;
  apply();
};`;

src = src.replace(oldAppearanceBlock, newAppearanceBlock);

// Call renderAppearanceControls inside apply() so language changes update it
src = src.replace(
  `  tx();\n  saveUserPreferences();\n}`,
  `  renderAppearanceControls();\n  tx();\n  saveUserPreferences();\n}`
);

// 11. Theme palette SC labels
src = src.replace(
  `const SC = [\n  ['--pa', 'Ana lacivert'],\n  ['--pb', 'Kart laciverti'],\n  ['--pc', 'Derin lacivert'],\n  ['--pg', 'İmza altın'],\n  ['--pg2', 'Parlak altın'],\n  ['--pi', 'Yazı rengi']\n];`,
  `const SC = [\n  ['--pa', 'colorNavyPrimary', 'Ana lacivert'],\n  ['--pb', 'colorNavyCard', 'Kart laciverti'],\n  ['--pc', 'colorNavyDeep', 'Derin lacivert'],\n  ['--pg', 'colorSignatureGold', 'İmza altın'],\n  ['--pg2', 'colorBrightGold', 'Parlak altın'],\n  ['--pi', 'colorTextColor', 'Yazı rengi']\n];`
);
src = src.replace(
  `$('#cols').innerHTML = '<div class="cg">' + SC.map(c => \`<div class="cs"><input type="color" data-v="\${c[0]}"><span>\${c[1]}</span></div>\`).join('') + '</div>';`,
  `$('#cols').innerHTML = '<div class="cg">' + SC.map(c => \`<div class="cs"><input type="color" data-v="\${c[0]}"><span>\${t(c[1], c[2])}</span></div>\`).join('') + '</div>';`
);

fs.writeFileSync('moon/manager/js/admin.js', src, 'utf8');
console.log('Precision patch applied successfully to moon/manager/js/admin.js!');
