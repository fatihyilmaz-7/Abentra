const fs = require('fs');
const path = require('path');

const mainJsPath = path.join(__dirname, '../public/js/main.js');
const mainJs = fs.readFileSync(mainJsPath, 'utf8');

// Extract siteI18n
const vm = require('vm');
const sandbox = {};
// extract up to const siteI18n = { ... };
const m = mainJs.match(/const siteI18n = (\{[\s\S]+?\n\});\n\ndocument\.addEventListener/);
if (!m) {
  console.error('Could not locate siteI18n');
  process.exit(1);
}

vm.runInNewContext('siteI18n = ' + m[1], sandbox);
const orig = sandbox.siteI18n;

const targetLangs = [
  { code: 'ar', name: 'Arabic' },
  { code: 'de', name: 'German' },
  { code: 'fr', name: 'French' },
  { code: 'it', name: 'Italian' },
  { code: 'zh', name: 'Chinese' },
  { code: 'ko', name: 'Korean' },
  { code: 'ja', name: 'Japanese' }
];

async function translateText(text, targetLang) {
  if (typeof text !== 'string' || !text.trim()) return text;
  try {
    const url = 'https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=' + targetLang + '&dt=t&q=' + encodeURIComponent(text);
    const res = await fetch(url);
    if (!res.ok) return text;
    const data = await res.json();
    return data[0].map(s => s[0]).join('');
  } catch (e) {
    return text;
  }
}

async function deepTranslate(obj, targetLang) {
  if (typeof obj === 'string') {
    return await translateText(obj, targetLang);
  }
  if (Array.isArray(obj)) {
    const res = [];
    for (const it of obj) {
      res.push(await deepTranslate(it, targetLang));
    }
    return res;
  }
  if (typeof obj === 'object' && obj !== null) {
    const res = {};
    for (const [k, v] of Object.entries(obj)) {
      res[k] = await deepTranslate(v, targetLang);
    }
    return res;
  }
  return obj;
}

async function run() {
  const result = {
    en: orig.en,
    tr: orig.tr
  };

  for (const lang of targetLangs) {
    console.log(`Translating siteI18n to ${lang.name} (${lang.code})...`);
    result[lang.code] = await deepTranslate(orig.en, lang.code);
  }

  const newSiteI18nStr = 'const siteI18n = ' + JSON.stringify(result, null, 2) + ';';
  const updatedMainJs = mainJs.replace(/const siteI18n = \{[\s\S]+?\n\};/, newSiteI18nStr);

  fs.writeFileSync(mainJsPath, updatedMainJs, 'utf8');
  console.log('Successfully updated public/js/main.js with 9 languages!');
}

run();
