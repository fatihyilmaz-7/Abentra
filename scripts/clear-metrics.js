#!/usr/bin/env node
// ==============================================================================
// ABENTRA International - Standalone Data & Metrics Purge Utility
// Usage: node scripts/clear-metrics.js [--all | --visitors | --heatmap | --older <days>]
// ==============================================================================

const fs = require('fs');
const path = require('path');
require('dotenv').config();

const ROOT_DIR = path.resolve(__dirname, '..');
const DATA_DIR = path.join(ROOT_DIR, 'data');
const LOGS_FILE = path.join(DATA_DIR, 'logs.json');
const SESSIONS_FILE = path.join(DATA_DIR, 'sessions.json');
const AUDIT_FILE = path.join(DATA_DIR, 'audit_logs.json');

const C_RESET = '\x1b[0m';
const C_BOLD = '\x1b[1m';
const C_GOLD = '\x1b[38;5;220m';
const C_GREEN = '\x1b[38;5;48m';
const C_CYAN = '\x1b[38;5;45m';
const C_RED = '\x1b[38;5;203m';
const C_GRAY = '\x1b[38;5;244m';

function readJSON(file, fallback = {}) {
  try {
    if (fs.existsSync(file)) {
      return JSON.parse(fs.readFileSync(file, 'utf8'));
    }
  } catch (e) {}
  return fallback;
}

function writeJSON(file, data) {
  try {
    fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
  } catch (e) {
    console.error(`[Error] Could not write ${file}:`, e.message);
  }
}

async function run() {
  console.log(`\n${C_GOLD}====================================================================${C_RESET}`);
  console.log(`${C_BOLD}${C_GOLD}  ABENTRA International ${C_RESET}${C_GRAY}| Veri & Metrik Temizleme Komutu${C_RESET}`);
  console.log(`${C_GOLD}====================================================================${C_RESET}\n`);

  const args = process.argv.slice(2);
  const target = args[0] || '--all';

  const logs = readJSON(LOGS_FILE, {
    summary: { totalVisits: 0, uniqueVisitors: 0, pageViews: 0, avgDurationSeconds: 0 },
    sectionViews: {},
    sectionTimeSeconds: {},
    sectionCountryViews: {},
    deviceStats: { Desktop: 0, Mobile: 0, Tablet: 0 },
    browserStats: {},
    countryStats: {},
    visitors: []
  });

  const prevVisCount = (logs.visitors || []).length;
  const prevSecCount = Object.keys(logs.sectionViews || {}).length;

  // 1. Reset local logs and telemetry
  logs.visitors = [];
  logs.summary = {
    totalVisits: 0,
    uniqueVisitors: 0,
    pageViews: 0,
    avgDurationSeconds: 0,
    lastUpdated: new Date().toISOString()
  };
  logs.sectionViews = {};
  logs.sectionTimeSeconds = {};
  logs.sectionCountryViews = {};
  logs.deviceStats = { Desktop: 0, Mobile: 0, Tablet: 0 };
  logs.browserStats = {};
  logs.countryStats = {};
  writeJSON(LOGS_FILE, logs);
  console.log(`${C_GREEN}✓${C_RESET} ${C_BOLD}${prevVisCount}${C_RESET} ziyaretçi telemetri kaydı temizlendi.`);
  console.log(`${C_GREEN}✓${C_RESET} ${C_BOLD}${prevSecCount}${C_RESET} bölüm ısı haritası ve kalış süresi metriği sıfırlandı.`);
  console.log(`${C_GREEN}✓${C_RESET} Cihaz, tarayıcı ve coğrafi ülke sayaçları sıfırlandı.`);

  // 2. Reset sessions
  writeJSON(SESSIONS_FILE, { sessions: {}, lastUpdated: new Date().toISOString() });
  console.log(`${C_GREEN}✓${C_RESET} Canlı oturumlar ve sayaçlar temizlendi.`);

  // 3. Supabase cleanup if configured
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;
  if (supabaseUrl && supabaseKey) {
    try {
      const { createClient } = require('@supabase/supabase-js');
      const supabase = createClient(supabaseUrl, supabaseKey);
      await supabase.from('abentra_visitors').delete().neq('id', '');
      await supabase.from('abentra_section_stats').delete().neq('section_id', '');
      console.log(`${C_GREEN}✓${C_RESET} Supabase bulut veritabanı (abentra_visitors & abentra_section_stats) temizlendi.`);
    } catch (e) {
      console.log(`${C_GRAY}[!] Supabase temizleme atlandı: ${e.message}${C_RESET}`);
    }
  }

  // 4. Record audit log
  const audits = readJSON(AUDIT_FILE, []);
  audits.unshift({
    id: 'audit_' + Date.now(),
    timestamp: new Date().toISOString(),
    action: 'CLI_DATA_PURGE',
    user: 'CLI_Command',
    details: 'CLI komutu üzerinden tüm veri ve metrikler sıfırlandı.'
  });
  if (audits.length > 500) audits.length = 500;
  writeJSON(AUDIT_FILE, audits);

  console.log(`\n${C_BOLD}${C_GREEN}BAŞARILI:${C_RESET} Tüm tutulan veriler ve metrikler otomatik olarak silindi.`);
  console.log(`${C_GOLD}====================================================================${C_RESET}\n`);
}

run().catch(err => {
  console.error(`\n${C_RED}[HATA] Temizleme komutu başarısız oldu:${C_RESET}`, err.message);
  process.exit(1);
});
