const fs = require('fs');
const path = require('path');

const mainJsPath = path.join(__dirname, '../public/js/main.js');
const mainJs = fs.readFileSync(mainJsPath, 'utf8');

const vm = require('vm');
const sandbox = {};
const m = mainJs.match(/const siteI18n = (\{[\s\S]+?\n\});\n\ndocument\.addEventListener/);
if (!m) {
  console.error('Could not locate siteI18n');
  process.exit(1);
}

vm.runInNewContext('siteI18n = ' + m[1], sandbox);
const orig = sandbox.siteI18n;

// Flatten object to path-value pairs
function flattenStrings(obj, prefix = '') {
  let entries = [];
  for (const [k, v] of Object.entries(obj)) {
    const curPath = prefix ? `${prefix}.${k}` : k;
    if (typeof v === 'string') {
      entries.push({ path: curPath, val: v });
    } else if (Array.isArray(v)) {
      v.forEach((item, idx) => {
        if (typeof item === 'string') {
          entries.push({ path: `${curPath}.${idx}`, val: item });
        } else if (typeof item === 'object' && item !== null) {
          entries = entries.concat(flattenStrings(item, `${curPath}.${idx}`));
        }
      });
    } else if (typeof v === 'object' && v !== null) {
      entries = entries.concat(flattenStrings(v, curPath));
    }
  }
  return entries;
}

// Unflatten path-value pairs into clone
function unflattenStrings(template, entries) {
  const clone = JSON.parse(JSON.stringify(template));
  for (const { path: p, val } of entries) {
    const parts = p.split('.');
    let cur = clone;
    for (let i = 0; i < parts.length - 1; i++) {
      cur = cur[parts[i]];
    }
    cur[parts[parts.length - 1]] = val;
  }
  return clone;
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
    return texts.map((t, idx) => lines[idx] || t);
  } catch (err) {
    console.error(`Error translating batch to ${targetLang}:`, err.message);
    return texts;
  }
}

async function run() {
  const flatEntries = flattenStrings(orig.en);
  console.log(`Extracted ${flatEntries.length} strings from siteI18n.en`);

  const result = {
    en: orig.en,
    tr: orig.tr
  };

  const BATCH_SIZE = 40;

  for (const lang of targetLangs) {
    console.log(`Translating siteI18n to ${lang.name} (${lang.code})...`);
    const translatedEntries = [];

    for (let i = 0; i < flatEntries.length; i += BATCH_SIZE) {
      const slice = flatEntries.slice(i, i + BATCH_SIZE);
      const texts = slice.map(e => e.val);
      const translated = await translateBatch(texts, lang.code);
      slice.forEach((e, idx) => {
        translatedEntries.push({ path: e.path, val: translated[idx] || e.val });
      });
      await new Promise(r => setTimeout(r, 100));
    }

    result[lang.code] = unflattenStrings(orig.en, translatedEntries);
  }

  const newSiteI18nStr = 'const siteI18n = ' + JSON.stringify(result, null, 2) + ';';
  const updatedMainJs = mainJs.replace(/const siteI18n = \{[\s\S]+?\n\};/, newSiteI18nStr);

  fs.writeFileSync(mainJsPath, updatedMainJs, 'utf8');
  console.log('Successfully wrote 9-language siteI18n into public/js/main.js!');
}

run();
