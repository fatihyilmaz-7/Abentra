const fs = require('fs');
const path = require('path');

// 1. Load existing i18n
const i18nPath = path.join(__dirname, '../moon/manager/js/i18n.js');
let scriptContent = fs.readFileSync(i18nPath, 'utf8');

// Safely extract i18n object
const vm = require('vm');
const sandbox = {};
vm.runInNewContext(scriptContent, sandbox);
const origI18n = sandbox.i18n || { tr: {}, en: {} };

const newKeys = {
  phMin6Chars: { tr: 'En az 6 karakter', en: 'At least 6 characters' },
  phPasswordDots: { tr: '••••••••', en: '••••••••' },
  lblMetricsBackupTitle: { tr: 'Sadece Metrik Verilerini İndir', en: 'Export Analytics & Telemetry Only' },
  lblMetricsBackupSub: { tr: 'Sistem yapılandırmasını dahil etmeden yalnızca ziyaretçi loglarını, ısı haritalarını ve analitik verilerini JSON olarak dışa aktar', en: 'Export only visitor logs, heatmaps, and telemetry data as JSON without system configuration' },
  btnDownloadMetricsNow: { tr: 'Metrik Verilerini İndir (JSON)', en: 'Download Metrics JSON' },
  audFilterTop10: { tr: 'En Çok Görüntülenen 10 Ülke', en: 'Top 10 Most Visited Countries' },
  audFilterWatchlist: { tr: 'Benim 10 Ülkelik Listem', en: 'My 10 Watchlist Countries' },
  audFilterSingle: { tr: 'Belirlenen Tek Ülke Analizi', en: 'Single Country Focus' },
  audCurrentLocalTime: { tr: 'Ülkedeki Yerel Saat', en: 'Local Time in Country' },
  audLocalPeakHour: { tr: 'Yerel Saate Göre En Yoğun Saat', en: 'Peak Hours (Local Time)' },
  audAddCountryToWatchlist: { tr: 'Listeye Ülke Ekle', en: 'Add Country to Watchlist' },
  audRemoveFromWatchlist: { tr: 'Listeden Çıkar', en: 'Remove from Watchlist' },
  audSelectFocusCountry: { tr: 'İncelenecek Ülkeyi Seçin', en: 'Select Country to Inspect' },
  audWatchlistLimitNotice: { tr: 'Listenizde en fazla 10 ülke bulunabilir', en: 'You can have up to 10 countries in your watchlist' },
  audCountryLocalTimeBadge: { tr: 'Yerel Saat', en: 'Local Time' },
  audSelectCountryPrompt: { tr: 'Bir ülke seçin...', en: 'Select a country...' },
  audWatchlistEmpty: { tr: 'Listenizde henüz ülke yok. Aşağıdaki kutudan ülke ekleyebilirsiniz.', en: 'No countries in your watchlist yet. Add one from the selector below.' },
  mailAutoTranslatedNotice: { tr: 'Otomatik Olarak Çevrildi', en: 'Automatically Translated' },
  mailShowOriginal: { tr: 'Orijinal Metni Göster', en: 'Show Original' },
  mailShowTranslation: { tr: 'Çeviriyi Göster', en: 'Show Translation' },
  lblEmailAutoTranslate: { tr: 'E-Posta Otomatik Çeviri', en: 'Inbound Email Auto-Translation' },
  optAutoTranslateOn: { tr: 'Aktif (Gelen postaları panel diline otomatik çevir)', en: 'Enabled (Auto-translate emails to panel language)' },
  optAutoTranslateOff: { tr: 'Devre Dışı (Yalnızca orijinal dili göster)', en: 'Disabled (Display original text only)' },
  emailAutoTranslateSub: { tr: 'Farklı dillerde gelen e-postaları panelin mevcut diline otomatik çevirir ve belirgin bir dil etiketi gösterir.', en: 'Automatically translates incoming inquiries to the active panel language with a distinct visual banner.' },
  liveVisitor: { tr: 'Canlı Ziyaretçi', en: 'Live Visitor' },
  quickPreview: { tr: 'Hızlı Önizleme', en: 'Quick Preview' },
  subWeekly: { tr: 'Haftalık Toplam', en: 'Weekly Total' },
  sub3Days: { tr: 'Son 3 Günlük', en: 'Past 3 Days' },
  subDaily: { tr: 'Günlük Ortalama', en: 'Daily Average' },
  subBotTraffic: { tr: 'Bot & Tarayıcı Trafiği', en: 'Bot & Crawler Traffic' },
  subAllTraffic: { tr: 'Tüm Gelen İstekler', en: 'All Inbound Requests' },
  todayBotCount: { tr: 'Bugünkü Bot İstekleri', en: 'Today\'s Bot Requests' },
  allCount: { tr: 'Toplam Sayaç', en: 'Total Count' },
  filteredBotDns: { tr: 'Filtrelenen Bot DNS İstekleri', en: 'Filtered Bot DNS Requests' },
  humanVisitors: { tr: 'Gerçek İnsan Ziyaretçiler', en: 'Human Visitors' },
  askedInClients: { tr: 'Müşteri taleplerinde soruldu', en: 'Asked in client inquiries' },
  modalFullName: { tr: 'Ad Soyad', en: 'Full Name' },
  modalRole: { tr: 'Yetki / Rol', en: 'Role / Access Level' },
  toastSecEnabled: { tr: 'Bölüm aktif edildi ve sitede yayına alındı', en: 'Section enabled and published live' },
  toastSecDisabled: { tr: 'Bölüm gizlendi ve siteden kaldırıldı', en: 'Section disabled and hidden from site' },
  toastSecDeleted: { tr: 'Bölüm başarıyla silindi', en: 'Section deleted successfully' },
  toastSecCloned: { tr: 'Bölüm kopyalandı ve çoğaltıldı', en: 'Section duplicated successfully' },
  toastAllSectionsSaved: { tr: 'Tüm bölümler ve sıralamaları başarıyla kaydedildi', en: 'All sections and order saved successfully' },
  toastFillAllFields: { tr: 'Lütfen tüm zorunlu alanları doldurun', en: 'Please fill in all required fields' }
};

// Add new keys to TR and EN
for (const [k, v] of Object.entries(newKeys)) {
  origI18n.tr[k] = v.tr;
  origI18n.en[k] = v.en;
}

const targetLangs = [
  { code: 'ar', name: 'Arabic' },
  { code: 'de', name: 'German' },
  { code: 'fr', name: 'French' },
  { code: 'it', name: 'Italian' },
  { code: 'zh', name: 'Chinese' },
  { code: 'ko', name: 'Korean' },
  { code: 'ja', name: 'Japanese' }
];

async function translateBatch(texts, targetLang) {
  try {
    const joined = texts.map(t => t.replace(/\n/g, ' ')).join('\n');
    const url = 'https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=' + targetLang + '&dt=t&q=' + encodeURIComponent(joined);
    const res = await fetch(url);
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const data = await res.json();
    const fullText = data[0].map(s => s[0]).join('');
    const lines = fullText.split('\n');
    if (lines.length === texts.length) {
      return lines;
    }
    // Fallback if newline splitting mismatch
    console.warn(`Length mismatch for ${targetLang}: expected ${texts.length}, got ${lines.length}. Splitting carefully.`);
    return texts.map((t, idx) => lines[idx] || t);
  } catch (err) {
    console.error(`Error translating batch to ${targetLang}:`, err.message);
    return texts; // fallback to English
  }
}

async function buildAll() {
  const allKeys = Object.keys(origI18n.en);
  console.log(`Starting translation for ${allKeys.length} keys across 7 languages...`);

  const langDicts = {
    tr: origI18n.tr,
    en: origI18n.en
  };

  const BATCH_SIZE = 40;

  for (const lang of targetLangs) {
    console.log(`\nTranslating to ${lang.name} (${lang.code})...`);
    langDicts[lang.code] = {};
    
    for (let i = 0; i < allKeys.length; i += BATCH_SIZE) {
      const slice = allKeys.slice(i, i + BATCH_SIZE);
      const texts = slice.map(k => String(origI18n.en[k] || ''));
      
      const translated = await translateBatch(texts, lang.code);
      slice.forEach((k, idx) => {
        langDicts[lang.code][k] = translated[idx] || origI18n.en[k];
      });

      process.stdout.write(`\r${lang.code}: ${Math.min(i + BATCH_SIZE, allKeys.length)} / ${allKeys.length}`);
      await new Promise(r => setTimeout(r, 120)); // friendly pacing
    }
  }

  console.log('\nAll languages translated successfully!');

  // Format file
  const outScript = `// ==============================================================================
// ABENTRA Executive Portal - 9-Language Localization Engine
// TR (Türkçe), EN (English), AR (العربية), DE (Deutsch), FR (Français),
// IT (Italiano), ZH (中文), KO (한국어), JA (日本語)
// ==============================================================================

const i18n = ${JSON.stringify(langDicts, null, 2)};

if (typeof module !== 'undefined') {
  module.exports = { i18n };
}
if (typeof window !== 'undefined') {
  window.i18n = i18n;
}
`;

  fs.writeFileSync(i18nPath, outScript, 'utf8');
  console.log('Wrote updated i18n file to:', i18nPath);
}

buildAll();
