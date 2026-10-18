const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const multer = require('multer');
const nodemailer = require('nodemailer');
const { isbot } = require('isbot');
const dns = require('dns').promises;
require('dotenv').config();

const supabase = require('./db/supabase');

const app = express();
app.set('trust proxy', true); // Nginx, Cloudflare, Vercel reverse proxy support
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Paths
const DATA_DIR = path.join(__dirname, 'data');
const CONFIG_FILE = path.join(DATA_DIR, 'config.json');
const SECTIONS_FILE = path.join(DATA_DIR, 'sections.json');
const ICONS_FILE = path.join(DATA_DIR, 'icons.json');
const LOGS_FILE = path.join(DATA_DIR, 'logs.json');
const EMAILS_FILE = path.join(DATA_DIR, 'emails.json');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const AUDIT_FILE = path.join(DATA_DIR, 'audit_logs.json');
const SESSIONS_FILE = path.join(DATA_DIR, 'sessions.json');
const UPLOADS_DIR = path.join(__dirname, 'public', 'uploads');

// Only attempt local filesystem directory creation in local environments (not Vercel read-only FS)
if (process.env.VERCEL !== '1' && !process.env.VERCEL) {
  try {
    if (!fs.existsSync(UPLOADS_DIR)) {
      fs.mkdirSync(UPLOADS_DIR, { recursive: true });
    }
  } catch (err) {
    console.warn('[Storage] Could not create local uploads directory:', err.message);
  }
}

// Multer in-memory storage for serverless compatibility (avoids EROFS crashes)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

// In-memory cache for fast reads and serverless environments (handles read-only FS)
const memCache = new Map();

function readJSON(filePath, fallback = {}) {
  if (memCache.has(filePath)) {
    return JSON.parse(JSON.stringify(memCache.get(filePath)));
  }
  try {
    if (fs.existsSync(filePath)) {
      const parsed = JSON.parse(fs.readFileSync(filePath, 'utf8'));
      memCache.set(filePath, parsed);
      return parsed;
    }
  } catch (err) {
    console.warn(`[readJSON] Could not read ${filePath}:`, err.message);
  }
  return fallback;
}

function writeJSON(filePath, data) {
  // Always update in-memory cache
  memCache.set(filePath, JSON.parse(JSON.stringify(data)));
  // In Vercel serverless environment, filesystem is read-only
  if (process.env.VERCEL === '1' || process.env.VERCEL) {
    return true;
  }
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.warn(`[writeJSON] Could not persist to ${filePath} (read-only):`, err.message);
    return false;
  }
}

// ==========================================
// PERSISTENT SESSIONS & RATE LIMITING
// ==========================================

const activeSessions = new Map();
const activeVisitors = new Map(); // visitorId -> { lastSeen: number, ip: string, country?: string }

// Clean up inactive visitors every 20 seconds (after 3 minutes of inactivity)
setInterval(() => {
  const cutoff = Date.now() - 3 * 60 * 1000;
  for (const [id, v] of activeVisitors.entries()) {
    if (v.lastSeen < cutoff) activeVisitors.delete(id);
  }
}, 20000);

function initSessions() {
  try {
    const data = readJSON(SESSIONS_FILE, { sessions: {} });
    const now = Date.now();
    let cleaned = false;
    if (data && data.sessions) {
      for (const [token, sess] of Object.entries(data.sessions)) {
        if (sess && sess.expiresAt && sess.expiresAt > now) {
          activeSessions.set(token, sess);
        } else {
          cleaned = true;
        }
      }
    }
    if (cleaned) {
      persistSessions();
    }
  } catch (e) {
    console.warn('[Sessions] Could not initialize sessions from disk:', e.message);
  }
}

function persistSessions() {
  const obj = {};
  for (const [token, sess] of activeSessions.entries()) {
    obj[token] = sess;
  }
  writeJSON(SESSIONS_FILE, { sessions: obj, lastUpdated: new Date().toISOString() });
}

// Initialize sessions from disk immediately
initSessions();

// Brute-force protection for login attempts
const loginAttempts = new Map();

function checkLoginRateLimit(ip) {
  const now = Date.now();
  const record = loginAttempts.get(ip);
  if (!record) return { allowed: true };
  if (record.lockedUntil && now < record.lockedUntil) {
    const remainingSec = Math.ceil((record.lockedUntil - now) / 1000);
    return {
      allowed: false,
      message: `Çok fazla başarısız deneme yapıldı. Lütfen ${remainingSec} saniye sonra tekrar deneyin.`
    };
  }
  if (now - record.firstAttempt > 5 * 60 * 1000) {
    loginAttempts.delete(ip);
    return { allowed: true };
  }
  return { allowed: true };
}

function recordFailedLoginAttempt(ip) {
  const now = Date.now();
  let record = loginAttempts.get(ip);
  if (!record || (now - record.firstAttempt > 5 * 60 * 1000)) {
    record = { count: 1, firstAttempt: now, lockedUntil: 0 };
  } else {
    record.count++;
  }
  if (record.count >= 5) {
    record.lockedUntil = now + 2 * 60 * 1000; // 2 minutes lock after 5 failed attempts
  }
  loginAttempts.set(ip, record);
}

function recordSuccessfulLogin(ip) {
  loginAttempts.delete(ip);
}

function generateToken() {
  return crypto.randomBytes(32).toString('hex');
}

function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader ? authHeader.replace(/^Bearer\s+/, '') : req.query.token;

  if (!token) {
    return res.status(401).json({ error: 'Unauthorized. Please login to continue.' });
  }

  // Check in-memory; if missing, look up from disk cache
  if (!activeSessions.has(token)) {
    const data = readJSON(SESSIONS_FILE, { sessions: {} });
    if (data && data.sessions && data.sessions[token]) {
      activeSessions.set(token, data.sessions[token]);
    }
  }

  if (!activeSessions.has(token)) {
    return res.status(401).json({ error: 'Unauthorized. Please login to continue.' });
  }

  const session = activeSessions.get(token);
  const now = Date.now();

  // Validate session expiration
  if (session.expiresAt && now > session.expiresAt) {
    activeSessions.delete(token);
    persistSessions();
    return res.status(401).json({ error: 'Session expired. Please login again.' });
  }

  // Sliding window: update lastActive
  session.lastActive = now;
  // If user selected "Remember Me" (14 days), keep extending if less than 7 days remain
  if (session.rememberMe && (session.expiresAt - now < 7 * 24 * 60 * 60 * 1000)) {
    session.expiresAt = now + (14 * 24 * 60 * 60 * 1000);
    persistSessions();
  }

  req.adminUser = session.user;
  req.authToken = token;
  next();
}

// IP, Flag Emoji & Geolocation helpers
function getCountryFlag(countryCode, countryName = '') {
  if (countryCode && typeof countryCode === 'string' && countryCode.trim().length === 2) {
    const code = countryCode.trim().toUpperCase();
    const codePoints = code.split('').map(c => 127397 + c.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
  }
  const nameMap = {
    turkey: '🇹🇷', türkiye: '🇹🇷', tr: '🇹🇷',
    liberia: '🇱🇷', liberya: '🇱🇷', lr: '🇱🇷',
    'united states': '🇺🇸', usa: '🇺🇸', abd: '🇺🇸', us: '🇺🇸',
    'united kingdom': '🇬🇧', uk: '🇬🇧', ingiltere: '🇬🇧', gb: '🇬🇧',
    germany: '🇩🇪', almanya: '🇩🇪', de: '🇩🇪',
    france: '🇫🇷', fransa: '🇫🇷', fr: '🇫🇷',
    netherlands: '🇳🇱', hollanda: '🇳🇱', nl: '🇳🇱',
    canada: '🇨🇦', kanada: '🇨🇦', ca: '🇨🇦',
    ghana: '🇬🇭', gana: '🇬🇭', gh: '🇬🇭',
    nigeria: '🇳🇬', nijerya: '🇳🇬', ng: '🇳🇬',
    'sierra leone': '🇸🇱', sl: '🇸🇱',
    italy: '🇮🇹', italya: '🇮🇹', it: '🇮🇹',
    spain: '🇪🇸', ispanya: '🇪🇸', es: '🇪🇸',
    russia: '🇷🇺', rusya: '🇷🇺', ru: '🇷🇺',
    china: '🇨🇳', çin: '🇨🇳', cn: '🇨🇳',
    japan: '🇯🇵', japonya: '🇯🇵', jp: '🇯🇵',
    switzerland: '🇨🇭', isviçre: '🇨🇭', ch: '🇨🇭',
    belgium: '🇧🇪', belçika: '🇧🇪', be: '🇧🇪',
    sweden: '🇸🇪', isveç: '🇸🇪', se: '🇸🇪',
    norway: '🇳🇴', norveç: '🇳🇴', no: '🇳🇴',
    uae: '🇦🇪', 'birleşik arap emirlikleri': '🇦🇪', ae: '🇦🇪',
    azerbaijan: '🇦🇿', azerbaycan: '🇦🇿', az: '🇦🇿',
    brazil: '🇧🇷', brezilya: '🇧🇷', br: '🇧🇷',
    india: '🇮🇳', hindistan: '🇮🇳', in: '🇮🇳'
  };
  const key = (countryName || countryCode || '').toLowerCase().trim();
  return nameMap[key] || '🌐';
}

function getClientIp(req) {
  const cf = req.headers['cf-connecting-ip'];
  if (cf) return cf.trim();
  const xReal = req.headers['x-real-ip'];
  if (xReal) return xReal.trim();
  const forwarded = req.headers['x-forwarded-for'];
  if (forwarded) return forwarded.split(',')[0].trim();
  return req.socket.remoteAddress || '127.0.0.1';
}

const ipGeoCache = new Map();

async function resolveIpGeo(rawIp, clientData = {}) {
  // If client already probed and provided valid geo info from tracker.js
  if (clientData.country && clientData.city) {
    const code = clientData.countryCode || (clientData.country.length === 2 ? clientData.country : '');
    const flag = clientData.flag || getCountryFlag(code, clientData.country);
    return {
      ip: clientData.ip || rawIp,
      country: clientData.country,
      countryCode: code,
      flag,
      city: clientData.city,
      region: clientData.region || '',
      isp: clientData.isp || 'Local Network'
    };
  }

  // Check cache
  if (ipGeoCache.has(rawIp)) {
    return ipGeoCache.get(rawIp);
  }

  const isPrivate = !rawIp || rawIp === '::1' || rawIp === '127.0.0.1' || rawIp.startsWith('192.168.') || rawIp.startsWith('10.') || rawIp.startsWith('::ffff:127.0.0.1') || rawIp.startsWith('172.');

  if (isPrivate) {
    // If client supplied public IP
    if (clientData.ip && !clientData.ip.startsWith('127.') && clientData.ip !== '::1') {
      rawIp = clientData.ip;
    } else {
      // Local dev default: Turkey (current local workspace development)
      const localDevGeo = {
        ip: rawIp || '127.0.0.1',
        country: 'Türkiye',
        countryCode: 'TR',
        flag: '🇹🇷',
        city: 'Istanbul',
        region: 'Marmara',
        isp: 'Turk Telekom / Local Development'
      };
      ipGeoCache.set(rawIp, localDevGeo);
      return localDevGeo;
    }
  }

  // Public IP - query ipwho.is with short timeout
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 1200);
    const res = await fetch(`https://ipwho.is/${rawIp}`, { signal: controller.signal });
    clearTimeout(timeout);
    if (res.ok) {
      const data = await res.json();
      if (data && data.success !== false) {
        const flag = data.flag?.emoji || getCountryFlag(data.country_code, data.country);
        const resolved = {
          ip: data.ip || rawIp,
          country: data.country || 'Liberia',
          countryCode: data.country_code || 'LR',
          flag,
          city: data.city || 'Monrovia',
          region: data.region || '',
          isp: data.connection?.isp || data.connection?.org || 'Broadband'
        };
        ipGeoCache.set(rawIp, resolved);
        return resolved;
      }
    }
  } catch (e) {}

  const fallback = {
    ip: rawIp,
    country: clientData.country || 'Liberia',
    countryCode: clientData.countryCode || 'LR',
    flag: getCountryFlag(clientData.countryCode || 'LR', clientData.country || 'Liberia'),
    city: clientData.city || 'Monrovia',
    region: clientData.region || '',
    isp: clientData.isp || 'Telecom Liberia'
  };
  ipGeoCache.set(rawIp, fallback);
  return fallback;
}

function parseUserAgent(ua = '') {
  let device = 'Desktop';
  if (/mobile|android|iphone|ipod/i.test(ua)) device = 'Mobile';
  else if (/ipad|tablet/i.test(ua)) device = 'Tablet';

  let browser = 'Unknown';
  if (/chrome/i.test(ua) && !/edg/i.test(ua)) browser = 'Chrome';
  else if (/safari/i.test(ua) && !/chrome/i.test(ua)) browser = 'Safari';
  else if (/edg/i.test(ua)) browser = 'Edge';
  else if (/firefox/i.test(ua)) browser = 'Firefox';

  let os = 'Unknown';
  if (/windows/i.test(ua)) os = 'Windows';
  else if (/macintosh|mac os x/i.test(ua)) os = 'macOS';
  else if (/linux/i.test(ua)) os = 'Linux';
  else if (/android/i.test(ua)) os = 'Android';
  else if (/iphone|ipad|ios/i.test(ua)) os = 'iOS';

  return { device, browser, os };
}

function recordAuditLog(entry) {
  try {
    const logs = readJSON(AUDIT_FILE, []);
    logs.unshift({
      id: 'audit_' + Date.now().toString(36),
      timestamp: new Date().toISOString(),
      ...entry
    });
    if (logs.length > 200) logs.pop();
    writeJSON(AUDIT_FILE, logs);
  } catch (e) {
    console.warn('[Audit Log Error]:', e.message);
  }
}

// ==========================================
// BOT, DNS & TRAFFIC CLASSIFIER ENGINE
// ==========================================

const stats = { human: 0, bot: 0, suspicious: 0, verifiedHumanCount: 0 };
const trafficLog = [];
const verifiedHumans = new Set();
const ipDnsCache = new Map();

// Ek bot ve tarayıcı/DNS imzaları (isbot'un kaçırabileceği monitoring/scanner araçları)
const EXTRA_BOT_PATTERN =
  /(uptime|pingdom|statuscake|monitor|healthcheck|curl|wget|python-requests|go-http-client|axios|node-fetch|java\/|okhttp|libwww|scrapy|headless|phantom|nmap|nikto|zgrab|masscan|censys|shodan|dns|route53|probe|check|spider|crawler|bot|lighthouse|pagespeed)/i;

// Skor tabanlı sınıflandırma
function classify(req) {
  const ua = req.headers['user-agent'] || '';
  let score = 0; // yüksek skor = bot ihtimali yüksek
  const reasons = [];

  if (!ua) { score += 3; reasons.push('UA yok'); }
  if (isbot(ua)) { score += 3; reasons.push('isbot eşleşti'); }
  if (EXTRA_BOT_PATTERN.test(ua)) { score += 3; reasons.push('ek bot / DNS imzası'); }

  // API veya beacon istekleri haricinde tarayıcı başlıklarını doğrula
  const isApi = req.path.startsWith('/api') || req.path === '/__beacon' || req.path === '/__stats';
  if (!req.headers['accept-language']) {
    score += 1;
    reasons.push('Accept-Language yok');
  }
  if (!isApi && (!req.headers['accept'] || !req.headers['accept'].includes('text/html'))) {
    score += 1;
    reasons.push('Accept html değil');
  }

  // Modern tarayıcılar sayfa gezinmesinde Sec-Fetch-* gönderir
  const hasSecFetch = req.headers['sec-fetch-mode'] || req.headers['sec-fetch-dest'] || req.headers['sec-fetch-site'];
  if (!hasSecFetch && /Chrome|Firefox|Edg|Safari/i.test(ua) && !/Mobile/i.test(ua)) {
    score += 2;
    reasons.push('Tarayıcı UA var ama Sec-Fetch yok');
  }

  let type = 'human';
  if (score >= 3) type = 'bot';
  else if (score >= 1) type = 'suspicious';

  return { type, score, reasons, ua };
}

// Opsiyonel / Güvenli Reverse DNS Doğrulaması (Vercel & serverless dostu 400ms zaman aşımı koruması)
async function verifySearchBot(ip) {
  if (!ip || ip === '127.0.0.1' || ip === '::1') return { isVerified: false, host: 'localhost', isDns: false };
  if (ipDnsCache.has(ip)) return ipDnsCache.get(ip);

  try {
    const hostPromise = dns.reverse(ip);
    const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 400));
    const hostnames = await Promise.race([hostPromise, timeoutPromise]);
    const host = hostnames[0] || '';
    if (!host) {
      const res = { isVerified: false, host: '', isDns: false };
      ipDnsCache.set(ip, res);
      return res;
    }

    const isVerifiedSearch = /\.(googlebot\.com|google\.com|search\.msn\.com|bing\.com)$/i.test(host);
    const isDns = /(dns|resolver|crawler|spider|bot|scanner|monitor|probe|shodan|censys|shadowserver|leakix)/i.test(host);

    let isConfirmed = false;
    if (isVerifiedSearch) {
      const addrs = await Promise.race([dns.resolve4(host), timeoutPromise]);
      isConfirmed = Array.isArray(addrs) && addrs.includes(ip);
    }

    const result = { isVerified: isConfirmed, host, isDns };
    ipDnsCache.set(ip, result);
    return result;
  } catch {
    const fallback = { isVerified: false, host: '', isDns: false };
    ipDnsCache.set(ip, fallback);
    return fallback;
  }
}

// Ana middleware: Her sayfa isteğini kaydet ve sınıflandır (statik assetler hariç)
function trafficLogger(req, res, next) {
  if (req.method !== 'GET' || req.path.match(/\.(css|js|png|jpg|jpeg|gif|svg|ico|woff2?|map)$/i)) {
    return next();
  }

  const result = classify(req);
  req.visitorType = result.type;

  const logEntry = {
    time: new Date().toISOString(),
    ip: getClientIp(req),
    path: req.originalUrl || req.path,
    ...result
  };

  trafficLog.push(logEntry);
  if (trafficLog.length > 5000) trafficLog.shift();

  stats[result.type] = (stats[result.type] || 0) + 1;
  next();
}

app.use(trafficLogger);

// JavaScript beacon: SADECE gerçek kullanıcıları doğrular
app.post('/__beacon', express.json(), async (req, res) => {
  const rawIp = getClientIp(req);
  const ua = req.headers['user-agent'] || '';
  const visitorId = req.body?.visitorId;
  const key = `${rawIp}|${ua}`;

  if (!verifiedHumans.has(key)) {
    verifiedHumans.add(key);
  }
  if (visitorId) {
    verifiedHumans.add(visitorId);
    await supabase.markVisitorVerified(visitorId);
  }

  stats.human = (stats.human || 0) + 1;
  res.sendStatus(204);
});

// İstatistik endpoint'i
app.get('/__stats', (req, res) => {
  res.json({
    stats,
    verifiedHumanCount: verifiedHumans.size,
    last20: trafficLog.slice(-20)
  });
});

// ==========================================
// PUBLIC ROUTES & APIS (Supabase-first)
// ==========================================

// Serve static assets from public directory
app.use(express.static(path.join(__dirname, 'public')));

// Serve static assets with strict no-cache headers for management portal
const managerStaticMiddleware = [
  (req, res, next) => {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    next();
  },
  express.static(path.join(__dirname, 'moon', 'manager'))
];

app.use(['/moon/manager', '/moon/Manager'], ...managerStaticMiddleware);
app.use(['/moon/management', '/moon/managment'], ...managerStaticMiddleware);
app.use(['/admin', '/public/admin'], ...managerStaticMiddleware);

// Root landing page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Manager portal routes
app.get([
  '/moon/manager', '/moon/manager/',
  '/moon/Manager', '/moon/Manager/',
  '/moon/management', '/moon/management/',
  '/moon/managment', '/moon/managment/'
], (req, res) => {
  res.sendFile(path.join(__dirname, 'moon', 'manager', 'index.html'));
});

// Redirect legacy /admin to /moon/manager
app.get(['/admin', '/admin/'], (req, res) => {
  res.redirect('/moon/manager');
});

// Fallback to original html if requested
app.get('/original', (req, res) => {
  res.sendFile(path.join(__dirname, 'ABENTRA International _ Bridging opportunities. Building tomorrow.html'));
});

// GET /api/site-data - Returns full public configuration and active sections
app.get('/api/site-data', async (req, res) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.set('Pragma', 'no-cache');
  res.set('Expires', '0');

  const localConfig = readJSON(CONFIG_FILE);
  const localSections = readJSON(SECTIONS_FILE, []);
  const localIcons = readJSON(ICONS_FILE, []);

  const config = await supabase.getConfig(localConfig);
  const sections = await supabase.getSections(localSections);
  const icons = await supabase.getIcons(null, null, localIcons);

  // Filter to enabled sections only for public view, sorted by order
  const activeSections = sections
    .filter(s => s.enabled)
    .sort((a, b) => (a.order || 0) - (b.order || 0));

  res.json({
    config,
    sections: activeSections,
    icons
  });
});

// POST /api/track/visit - Register a visitor entry in Supabase with accurate IP & Geo
app.post('/api/track/visit', async (req, res) => {
  const rawIp = getClientIp(req);
  const ua = req.headers['user-agent'] || '';
  const parsedUA = parseUserAgent(ua);
  const referer = req.body.referer || req.headers.referer || 'Direct Entry';
  const visitorId = req.body.visitorId || 'vis_' + crypto.randomBytes(4).toString('hex');
  const screen = (req.body.screenWidth && req.body.screenHeight) ? `${req.body.screenWidth}x${req.body.screenHeight}` : '1920x1080';

  const geo = await resolveIpGeo(rawIp, req.body);

  // 1. Classify visitor (Human vs Bot vs DNS probe)
  const classification = classify(req);
  const clientKey = `${geo.ip || rawIp}|${ua}`;
  const isVerifiedHuman = verifiedHumans.has(visitorId) || verifiedHumans.has(clientKey);

  if (isVerifiedHuman) {
    classification.type = 'human';
    classification.score = 0;
  }

  // 2. Reverse DNS check (safely bounded with 400ms timeout for Vercel/serverless)
  const rDns = await verifySearchBot(rawIp);
  if (rDns.isDns || rDns.type === 'dns_scanner') {
    classification.type = 'bot';
    classification.score = Math.max(3, classification.score);
    classification.reasons.push(`DNS / Scanner host: ${rDns.host}`);
  }

  const visitor = {
    id: visitorId,
    ip: geo.ip || rawIp,
    country: geo.country,
    countryCode: geo.countryCode,
    flag: geo.flag,
    city: geo.city,
    region: geo.region,
    isp: geo.isp,
    device: parsedUA.device,
    browser: parsedUA.browser,
    os: parsedUA.os,
    screen,
    referer,
    firstSeen: new Date().toISOString(),
    lastSeen: new Date().toISOString(),
    durationSeconds: 0,
    sectionsViewed: [],
    visitorType: classification.type,
    botScore: classification.score,
    botReasons: classification.reasons,
    verified: isVerifiedHuman,
    isDns: !!rDns.isDns,
    dnsHost: rDns.host || ''
  };

  // 3. Save to Supabase (with full classification metadata)
  await supabase.trackVisit(visitor);

  // 4. Track in active visitors Map ONLY if real human
  if (classification.type !== 'bot') {
    activeVisitors.set(visitorId, {
      lastSeen: Date.now(),
      ip: geo.ip || rawIp,
      country: geo.country,
      city: geo.city
    });
  }

  // 5. Also keep local JSON backup with segregated stats
  const logs = readJSON(LOGS_FILE, {
    summary: { totalVisits: 0, uniqueVisitors: 0, pageViews: 0, avgDurationSeconds: 0, botVisits: 0, allVisits: 0 },
    sectionViews: {},
    sectionTimeSeconds: {},
    sectionCountryViews: {},
    deviceStats: { Desktop: 0, Mobile: 0, Tablet: 0 },
    browserStats: {},
    countryStats: {},
    visitors: []
  });

  logs.summary.allVisits = (logs.summary.allVisits || 0) + 1;
  if (classification.type === 'human') {
    logs.summary.totalVisits = (logs.summary.totalVisits || 0) + 1;
    logs.summary.pageViews = (logs.summary.pageViews || 0) + 1;
    logs.deviceStats[parsedUA.device] = (logs.deviceStats[parsedUA.device] || 0) + 1;
    logs.browserStats[parsedUA.browser] = (logs.browserStats[parsedUA.browser] || 0) + 1;
    const countryKey = `${geo.flag} ${geo.country}`;
    logs.countryStats[countryKey] = (logs.countryStats[countryKey] || 0) + 1;
  } else {
    logs.summary.botVisits = (logs.summary.botVisits || 0) + 1;
  }

  let existing = logs.visitors.find(v => v.id === visitorId);
  if (!existing) {
    if (classification.type === 'human') {
      logs.summary.uniqueVisitors = (logs.summary.uniqueVisitors || 0) + 1;
    }
    logs.visitors.unshift(visitor);
    if (logs.visitors.length > 250) logs.visitors.pop();
  } else {
    existing.lastSeen = new Date().toISOString();
    existing.flag = geo.flag;
    existing.country = geo.country;
    existing.countryCode = geo.countryCode;
    existing.city = geo.city;
    existing.ip = geo.ip;
    existing.visitorType = classification.type;
    existing.botScore = classification.score;
    existing.botReasons = classification.reasons;
    existing.verified = isVerifiedHuman;
    existing.isDns = !!rDns.isDns;
    existing.dnsHost = rDns.host || '';
  }

  writeJSON(LOGS_FILE, logs);
  res.json({
    success: true,
    visitorId,
    flag: geo.flag,
    country: geo.country,
    ip: geo.ip,
    visitorType: classification.type,
    verified: isVerifiedHuman
  });
});

// POST /api/track/section - Track section views and duration with per-country breakdown
app.post('/api/track/section', async (req, res) => {
  const { visitorId, sectionId, durationSeconds } = req.body;
  if (!sectionId) return res.status(400).json({ error: 'Section ID required' });

  const addedSeconds = parseInt(durationSeconds) || 5;

  if (visitorId) {
    activeVisitors.set(visitorId, { lastSeen: Date.now(), ip: getClientIp(req) });
  }

  // 1. Save to Supabase
  await supabase.trackSection(visitorId, sectionId, addedSeconds);

  // 2. Local fallback update
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

  logs.sectionViews = logs.sectionViews || {};
  logs.sectionTimeSeconds = logs.sectionTimeSeconds || {};
  logs.sectionCountryViews = logs.sectionCountryViews || {};

  logs.sectionViews[sectionId] = (logs.sectionViews[sectionId] || 0) + 1;
  logs.sectionTimeSeconds[sectionId] = (logs.sectionTimeSeconds[sectionId] || 0) + addedSeconds;

  // Find visitor to record per-country section views (for Ads Manager view)
  const visitor = (logs.visitors || []).find(v => v.id === visitorId);
  const countryKey = visitor ? `${visitor.flag || '🌐'} ${visitor.country || 'Liberia'}` : '🌐 Liberia';

  if (!logs.sectionCountryViews[sectionId]) logs.sectionCountryViews[sectionId] = {};
  logs.sectionCountryViews[sectionId][countryKey] = (logs.sectionCountryViews[sectionId][countryKey] || 0) + 1;

  writeJSON(LOGS_FILE, logs);

  res.json({ success: true });
});

// POST /api/track/heartbeat - Real-time active visitor heartbeat
app.post('/api/track/heartbeat', async (req, res) => {
  const { visitorId, durationSeconds } = req.body;
  if (visitorId) {
    activeVisitors.set(visitorId, { lastSeen: Date.now(), ip: getClientIp(req) });
    await supabase.updateVisitorLastSeen(visitorId, durationSeconds || 20);
  }
  res.json({ success: true, activeCount: activeVisitors.size });
});

// POST /api/contact - Public contact form submission saved to Supabase (SecurePosta Specification)
app.post('/api/contact', async (req, res) => {
  const { name, email, phone, subject, service, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Name, email, and message are required.' });
  }

  // Honeypot spam filter (SecurePosta bot trap)
  if (req.body.company_website || req.body._hp || req.body.website_url) {
    return res.json({ success: true, message: 'Your inquiry has been received.' });
  }

  const clientIp = getClientIp(req);
  const ua = req.headers['user-agent'] || '';
  const parsedUA = parseUserAgent(ua);
  const countryHeader = req.headers['cf-ipcountry'] || req.headers['x-vercel-ip-country'] || '';
  const country = countryHeader || (clientIp === '127.0.0.1' || clientIp === '::1' ? 'Liberia' : 'International');
  const city = req.headers['x-vercel-ip-city'] || 'Monrovia';
  let flag = '🇱🇷';
  if (country === 'Turkey' || country === 'TR') flag = '🇹🇷';
  else if (country === 'United States' || country === 'US') flag = '🇺🇸';
  else if (country === 'United Kingdom' || country === 'GB') flag = '🇬🇧';
  else if (country === 'France' || country === 'FR') flag = '🇫🇷';
  else if (country === 'Liberia' || country === 'LR') flag = '🇱🇷';
  else if (country === 'Germany' || country === 'DE') flag = '🇩🇪';
  else if (country === 'Sierra Leone' || country === 'SL') flag = '🇸🇱';
  else flag = '🌐';

  const newInquiry = {
    id: 'msg_' + Date.now().toString(36),
    name: name.trim(),
    email: email.trim(),
    phone: (phone || '').trim(),
    subject: (subject || 'New Inquiry from Abentra Portal').trim(),
    service: service || 'General Advisory',
    message: message.trim(),
    ip: clientIp,
    userAgent: ua,
    browser: parsedUA.browser,
    os: parsedUA.os,
    device: parsedUA.device,
    country,
    city,
    flag,
    cookies: req.headers.cookie ? 'present' : 'none',
    date: new Date().toISOString(),
    read: false,
    replied: false,
    starred: false,
    source: 'Abentra SecurePosta Portal'
  };

  // 1. Save to Supabase
  await supabase.addInquiry(newInquiry);

  // 2. Local JSON backup
  const emailsData = readJSON(EMAILS_FILE, { inbox: [], sent: [], templates: [] });
  emailsData.inbox.unshift(newInquiry);
  writeJSON(EMAILS_FILE, emailsData);

  res.json({
    success: true,
    message: 'Your inquiry has been securely transmitted to ABENTRA International. Our leadership team will review and connect with you shortly.'
  });
});

// ==========================================
// MANAGER & ADMIN API ROUTING / ALIASES
// ==========================================
app.use((req, res, next) => {
  if (req.url.startsWith('/api/moon/manager/')) {
    req.url = req.url.replace('/api/moon/manager/', '/api/admin/');
  } else if (req.url.startsWith('/api/moon/Manager/')) {
    req.url = req.url.replace('/api/moon/Manager/', '/api/admin/');
  } else if (req.url.startsWith('/api/moon/management/')) {
    req.url = req.url.replace('/api/moon/management/', '/api/admin/');
  } else if (req.url.startsWith('/api/moon/managment/')) {
    req.url = req.url.replace('/api/moon/managment/', '/api/admin/');
  } else if (req.url === '/api/moon/manager' || req.url === '/api/moon/Manager' || req.url === '/api/moon/management' || req.url === '/api/moon/managment') {
    req.url = '/api/admin';
  }
  next();
});

// ==========================================
// ADMIN AUTHENTICATION APIS (Supabase-first)
// ==========================================

// POST /api/admin/login
app.post('/api/admin/login', async (req, res) => {
  const { username, password, rememberMe } = req.body;
  const rawIp = getClientIp(req);
  const ua = req.headers['user-agent'] || '';
  const parsedUA = parseUserAgent(ua);
  const geo = await resolveIpGeo(rawIp);

  // Rate limiting check
  const rateLimit = checkLoginRateLimit(rawIp);
  if (!rateLimit.allowed) {
    return res.status(429).json({ error: rateLimit.message });
  }

  const localUsers = readJSON(USERS_FILE, { users: [] }).users;
  const user = await supabase.getUser(username || '', localUsers);

  if (!user) {
    recordFailedLoginAttempt(rawIp);
    recordAuditLog({
      username: username || 'unknown',
      role: 'unknown',
      ip: geo.ip || rawIp,
      flag: geo.flag,
      country: geo.country,
      city: geo.city,
      device: `${parsedUA.device} / ${parsedUA.os}`,
      browser: parsedUA.browser,
      status: 'Failed (User Not Found)'
    });
    return res.status(401).json({ error: 'Geçersiz kullanıcı adı veya şifre.' });
  }

  // Plaintext verification as requested ("admin bilgileri sifrelenmesin")
  const enteredPass = String(password || '').trim();
  const isValid = (user.password === enteredPass) ||
                  (user.password_hash === enteredPass) ||
                  (user.passwordHash === enteredPass) ||
                  (user.salt && crypto.createHash('sha256').update(user.salt + ':' + enteredPass).digest('hex') === user.passwordHash);

  if (!isValid) {
    recordFailedLoginAttempt(rawIp);
    recordAuditLog({
      username: user.username,
      role: user.role,
      ip: geo.ip || rawIp,
      flag: geo.flag,
      country: geo.country,
      city: geo.city,
      device: `${parsedUA.device} / ${parsedUA.os}`,
      browser: parsedUA.browser,
      status: 'Failed (Wrong Password)'
    });
    return res.status(401).json({ error: 'Geçersiz kullanıcı adı veya şifre.' });
  }

  // Reset failed login attempts on success
  recordSuccessfulLogin(rawIp);

  // Record successful login audit log
  recordAuditLog({
    username: user.username,
    role: user.role,
    ip: geo.ip || rawIp,
    flag: geo.flag,
    country: geo.country,
    city: geo.city,
    device: `${parsedUA.device} / ${parsedUA.os}`,
    browser: parsedUA.browser,
    status: 'Success'
  });

  // Update last login in local user record
  const usersData = readJSON(USERS_FILE, { users: [] });
  const uTarget = usersData.users.find(u => u.id === user.id);
  if (uTarget) {
    uTarget.lastLogin = new Date().toISOString();
    uTarget.lastLoginIp = geo.ip || rawIp;
    uTarget.lastLoginFlag = geo.flag;
    uTarget.lastLoginDevice = `${parsedUA.device} / ${parsedUA.browser}`;
    writeJSON(USERS_FILE, usersData);
  }

  // Normalize permissions based on role
  let permissions = (Array.isArray(user.permissions) && user.permissions.length > 0) ? user.permissions : null;
  if (user.role === 'superadmin' || user.role === 'Super Administrator') {
    permissions = ['all'];
  } else if (user.role === 'ads_manager') {
    permissions = permissions || ['dashboard', 'aud', 'logs', 'heatmap', 'export'];
  } else if (user.role === 'developer') {
    permissions = permissions || ['theme', 'content', 'cms', 'sections', 'sec', 'icons', 'logs', 'export'];
  } else if (user.role === 'editor') {
    permissions = permissions || ['faq', 'mail', 'sec', 'cms', 'sections', 'content'];
  } else if (user.role === 'security') {
    permissions = permissions || ['logs', 'guv', 'settings'];
  } else {
    permissions = permissions || ['dashboard', 'logs'];
  }

  // Update last login in Supabase if active
  await supabase.updateLastLogin(user.id);

  const token = generateToken();
  const sessionDuration = rememberMe ? (14 * 24 * 60 * 60 * 1000) : (24 * 60 * 60 * 1000);
  const now = Date.now();

  const sessionUser = {
    id: user.id,
    username: user.username,
    name: user.name,
    role: user.role,
    permissions,
    email: user.email,
    flag: geo.flag,
    ip: geo.ip || rawIp,
    theme_settings: (uTarget && uTarget.theme_settings) ? uTarget.theme_settings : (user.theme_settings || null)
  };

  const sessionObj = {
    token,
    userId: user.id,
    username: user.username,
    user: sessionUser,
    createdAt: now,
    expiresAt: now + sessionDuration,
    rememberMe: !!rememberMe,
    lastActive: now
  };

  activeSessions.set(token, sessionObj);
  persistSessions();

  res.json({
    success: true,
    token,
    user: sessionUser,
    expiresAt: sessionObj.expiresAt,
    rememberMe: !!rememberMe
  });
});

// POST /api/admin/logout
app.post('/api/admin/logout', (req, res) => {
  const token = (req.headers.authorization || '').replace(/^Bearer\s+/, '');
  if (token) {
    activeSessions.delete(token);
    persistSessions();
  }
  res.json({ success: true, message: 'Oturum sonlandırıldı.' });
});

// GET /api/admin/me
app.get('/api/admin/me', requireAuth, (req, res) => {
  // Always refresh theme_settings from current users.json record
  const usersData = readJSON(USERS_FILE, { users: [] });
  const freshUser = usersData.users.find(u => u.id === req.adminUser.id);
  if (freshUser && freshUser.theme_settings) {
    req.adminUser.theme_settings = freshUser.theme_settings;
  }
  res.json({ success: true, user: req.adminUser });
});

// POST /api/admin/switch-user - Switch / impersonate another admin user (SuperAdmin or users with switch_user permission)
app.post('/api/admin/switch-user', requireAuth, async (req, res) => {
  const isSuper = req.adminUser.role === 'superadmin' || 
                  req.adminUser.role === 'Super Administrator' || 
                  req.adminUser.permissions?.includes('all') ||
                  req.adminUser.permissions?.includes('switch_user');

  if (!isSuper) {
    return res.status(403).json({ error: 'Kullanıcılar arasında geçiş yapma yetkiniz bulunmuyor.' });
  }

  const { targetUserId } = req.body;
  if (!targetUserId) {
    return res.status(400).json({ error: 'Hedef kullanıcı ID belirtilmelidir.' });
  }

  const usersData = readJSON(USERS_FILE, { users: [] });
  const targetUser = usersData.users.find(u => u.id === targetUserId || u.username === targetUserId);

  if (!targetUser) {
    return res.status(404).json({ error: 'Hedef kullanıcı bulunamadı.' });
  }

  const rawIp = getClientIp(req);
  const geo = await resolveIpGeo(rawIp);

  // Normalize target permissions
  let permissions = (Array.isArray(targetUser.permissions) && targetUser.permissions.length > 0) ? targetUser.permissions : null;
  if (targetUser.role === 'superadmin' || targetUser.role === 'Super Administrator') {
    permissions = ['all'];
  } else if (targetUser.role === 'ads_manager') {
    permissions = permissions || ['dashboard', 'aud', 'logs', 'heatmap', 'export'];
  } else if (targetUser.role === 'developer') {
    permissions = permissions || ['theme', 'content', 'cms', 'sections', 'sec', 'icons', 'logs', 'export'];
  } else if (targetUser.role === 'editor') {
    permissions = permissions || ['faq', 'mail', 'sec', 'cms', 'sections', 'content'];
  } else if (targetUser.role === 'security') {
    permissions = permissions || ['logs', 'guv', 'settings'];
  } else {
    permissions = permissions || ['dashboard', 'logs'];
  }

  const sessionUser = {
    id: targetUser.id,
    username: targetUser.username,
    name: targetUser.name,
    role: targetUser.role,
    permissions,
    email: targetUser.email,
    flag: geo.flag,
    ip: geo.ip || rawIp,
    theme_settings: targetUser.theme_settings || null
  };

  // Update in active session map and persistent disk storage
  if (req.authToken && activeSessions.has(req.authToken)) {
    const sess = activeSessions.get(req.authToken);
    sess.userId = targetUser.id;
    sess.username = targetUser.username;
    sess.user = sessionUser;
    sess.lastActive = Date.now();
    persistSessions();
  }

  recordAuditLog({
    username: req.adminUser.username,
    role: req.adminUser.role,
    action: 'Switch User',
    details: `User switched to ${targetUser.username} (${targetUser.name}) without password`,
    status: 'Success'
  });

  res.json({
    success: true,
    user: sessionUser,
    message: `Yöneticiye geçildi: ${targetUser.name || targetUser.username}`
  });
});

// GET /api/admin/user/preferences - Get per-user theme and appearance settings
app.get('/api/admin/user/preferences', requireAuth, (req, res) => {
  const usersData = readJSON(USERS_FILE, { users: [] });
  const freshUser = usersData.users.find(u => u.id === req.adminUser.id);
  const defaultPrefs = {
    theme: 'midnight',
    layout: 'rail',
    shape: 'soft',
    density: 'normal',
    neon: 1,
    lang: 'tr',
    o: {}
  };
  const preferences = (freshUser && freshUser.theme_settings) ? freshUser.theme_settings : defaultPrefs;
  res.json({ success: true, preferences });
});

// POST /api/admin/user/preferences - Save per-user theme and appearance settings
app.post('/api/admin/user/preferences', requireAuth, async (req, res) => {
  const { preferences } = req.body;
  if (!preferences || typeof preferences !== 'object') {
    return res.status(400).json({ error: 'Geçersiz tema ayarı verisi.' });
  }

  const usersData = readJSON(USERS_FILE, { users: [] });
  const uTarget = usersData.users.find(u => u.id === req.adminUser.id);
  if (uTarget) {
    uTarget.theme_settings = preferences;
    writeJSON(USERS_FILE, usersData);
  }

  // Update in active session if token present
  if (req.authToken && activeSessions.has(req.authToken)) {
    const sess = activeSessions.get(req.authToken);
    sess.user.theme_settings = preferences;
    persistSessions();
  }

  res.json({ success: true, preferences, message: 'Kullanıcı teması kaydedildi.' });
});

// GET /api/admin/backup/download and /api/moon/manager/backup/download - Full system configuration & data backup
const handleBackupDownload = (req, res) => {
  const config = readJSON(CONFIG_FILE, {});
  const backup = {
    version: '3.5.0',
    exportDate: new Date().toISOString(),
    exportedBy: req.adminUser ? req.adminUser.username : 'admin',
    config,
    sections: readJSON(SECTIONS_FILE, []),
    icons: readJSON(ICONS_FILE, []),
    emails: readJSON(EMAILS_FILE, { inbox: [], sent: [] }),
    theme_settings: config.theme || {},
    site_language: config.language || 'tr',
    telemetry: readJSON(ANALYTICS_FILE, {}),
    users: readJSON(USERS_FILE, { users: [] }).users.map(u => ({
      id: u.id,
      username: u.username,
      name: u.name,
      role: u.role,
      permissions: u.permissions,
      email: u.email,
      theme_settings: u.theme_settings
    })),
    auditSummary: readJSON(AUDIT_FILE, { logs: [] }).logs.slice(0, 30)
  };

  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', `attachment; filename="abentra_full_system_backup_${Date.now()}.json"`);
  res.send(JSON.stringify(backup, null, 2));
};

app.get('/api/admin/backup/download', requireAuth, handleBackupDownload);
app.get('/api/moon/manager/backup/download', requireAuth, handleBackupDownload);

// GET /api/admin/backup/metrics and /api/moon/manager/backup/metrics - Metrics and analytics only backup
const handleMetricsDownload = (req, res) => {
  const analytics = readJSON(ANALYTICS_FILE, {});
  const metricsExport = {
    version: '3.5.0',
    exportType: 'metrics_and_telemetry_only',
    exportDate: new Date().toISOString(),
    exportedBy: req.adminUser ? req.adminUser.username : 'admin',
    summary: analytics.summary || {},
    periods: analytics.periods || {},
    countries: analytics.countries || [],
    visitors: analytics.visitors || [],
    sectionViews: analytics.sectionViews || {},
    sectionTimeSeconds: analytics.sectionTimeSeconds || {},
    recentVisitors: analytics.recentVisitors || []
  };

  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Content-Disposition', `attachment; filename="abentra_metrics_telemetry_${Date.now()}.json"`);
  res.send(JSON.stringify(metricsExport, null, 2));
};

app.get('/api/admin/backup/metrics', requireAuth, handleMetricsDownload);
app.get('/api/moon/manager/backup/metrics', requireAuth, handleMetricsDownload);

// POST /api/admin/backup/restore and /api/moon/manager/backup/restore - Restore system data from backup JSON
const handleBackupRestore = (req, res) => {
  const { backup } = req.body;
  if (!backup || typeof backup !== 'object') {
    return res.status(400).json({ error: 'Geçersiz yedek dosyası.' });
  }

  if (backup.config) writeJSON(CONFIG_FILE, backup.config);
  if (backup.sections) writeJSON(SECTIONS_FILE, backup.sections);
  if (backup.icons) writeJSON(ICONS_FILE, backup.icons);
  if (backup.emails) writeJSON(EMAILS_FILE, backup.emails);
  if (backup.telemetry) writeJSON(ANALYTICS_FILE, backup.telemetry);

  recordAuditLog({
    username: req.adminUser ? req.adminUser.username : 'admin',
    role: req.adminUser ? req.adminUser.role : 'admin',
    action: 'Backup Restore',
    details: 'System configuration, sections, and settings restored from JSON backup',
    status: 'Success'
  });

  res.json({ success: true, message: 'Yedek başarıyla geri yüklendi ve sistem güncellendi.' });
};

app.post('/api/admin/backup/restore', requireAuth, handleBackupRestore);
app.post('/api/moon/manager/backup/restore', requireAuth, handleBackupRestore);

// GET /api/admin/users - List all admin accounts with unencrypted passwords for management
app.get('/api/admin/users', requireAuth, (req, res) => {
  const usersData = readJSON(USERS_FILE, { users: [] });
  const safeUsers = usersData.users.map(u => ({
    id: u.id,
    username: u.username,
    password: u.password || u.password_hash || 'admin',
    name: u.name,
    role: u.role,
    permissions: u.permissions || ['all'],
    email: u.email || '',
    createdAt: u.createdAt,
    lastLogin: u.lastLogin,
    lastLoginIp: u.lastLoginIp,
    lastLoginFlag: u.lastLoginFlag,
    lastLoginDevice: u.lastLoginDevice
  }));
  res.json({ users: safeUsers });
});

// POST /api/admin/users - Add a new admin account with custom role and individual permissions
app.post('/api/admin/users', requireAuth, (req, res) => {
  const { username, password, name, role, permissions, email } = req.body;
  if (!username || !password || !name) {
    return res.status(400).json({ error: 'Kullanıcı adı, şifre ve isim zorunludur.' });
  }

  const usersData = readJSON(USERS_FILE, { users: [] });
  if (usersData.users.some(u => u.username.toLowerCase() === username.trim().toLowerCase())) {
    return res.status(400).json({ error: 'Bu kullanıcı adı zaten kullanımda.' });
  }

  const newUser = {
    id: 'usr_' + Date.now().toString(36),
    username: username.trim(),
    password: String(password).trim(),
    password_hash: String(password).trim(),
    passwordHash: String(password).trim(),
    salt: '',
    name: name.trim(),
    role: role || 'admin',
    permissions: Array.isArray(permissions) ? permissions : ['dashboard', 'logs'],
    email: (email || '').trim(),
    createdAt: new Date().toISOString(),
    lastLogin: null,
    lastLoginIp: null,
    lastLoginFlag: null,
    lastLoginDevice: null
  };

  usersData.users.push(newUser);
  writeJSON(USERS_FILE, usersData);

  res.json({ success: true, message: 'Yeni yönetici hesabı başarıyla oluşturuldu.', user: newUser });
});

// PUT /api/admin/users/:id - Edit an admin account
app.put('/api/admin/users/:id', requireAuth, (req, res) => {
  const { id } = req.params;
  const { username, password, name, role, permissions, email } = req.body;

  const usersData = readJSON(USERS_FILE, { users: [] });
  const user = usersData.users.find(u => u.id === id);
  if (!user) return res.status(404).json({ error: 'Kullanıcı bulunamadı.' });

  if (username && username.trim().toLowerCase() !== user.username.toLowerCase()) {
    if (usersData.users.some(u => u.username.toLowerCase() === username.trim().toLowerCase())) {
      return res.status(400).json({ error: 'Bu kullanıcı adı zaten kullanımda.' });
    }
    user.username = username.trim();
  }

  if (password && String(password).trim().length > 0) {
    const plain = String(password).trim();
    user.password = plain;
    user.password_hash = plain;
    user.passwordHash = plain;
    user.salt = '';
  }

  if (name) user.name = name.trim();
  if (role) user.role = role;
  if (Array.isArray(permissions)) user.permissions = permissions;
  if (email !== undefined) user.email = email.trim();

  writeJSON(USERS_FILE, usersData);
  res.json({ success: true, message: 'Yönetici hesabı başarıyla güncellendi.', user });
});

// DELETE /api/admin/users/:id - Delete an admin account
app.delete('/api/admin/users/:id', requireAuth, (req, res) => {
  const { id } = req.params;
  if (id === 'usr_01') {
    return res.status(400).json({ error: 'Ana Süper Yönetici hesabı silinemez.' });
  }

  const usersData = readJSON(USERS_FILE, { users: [] });
  const idx = usersData.users.findIndex(u => u.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Kullanıcı bulunamadı.' });

  usersData.users.splice(idx, 1);
  writeJSON(USERS_FILE, usersData);
  res.json({ success: true, message: 'Yönetici hesabı başarıyla silindi.' });
});

// GET /api/admin/audit-logs - View admin login telemetry and attempts
app.get('/api/admin/audit-logs', requireAuth, (req, res) => {
  const logs = readJSON(AUDIT_FILE, []);
  res.json({ logs });
});

// POST /api/admin/credentials - Change current admin username and password (plaintext)
app.post('/api/admin/credentials', requireAuth, async (req, res) => {
  const { currentPassword, newUsername, newPassword } = req.body;
  if (!newPassword || newPassword.length < 2) {
    return res.status(400).json({ error: 'Yeni şifre en az 2 karakter olmalıdır.' });
  }

  const localUsers = readJSON(USERS_FILE, { users: [] }).users;
  const user = await supabase.getUser(req.adminUser.username, localUsers);
  if (!user) return res.status(404).json({ error: 'Kullanıcı bulunamadı.' });

  const enteredCurrent = String(currentPassword || '').trim();
  const isValid = (user.password === enteredCurrent) ||
                  (user.password_hash === enteredCurrent) ||
                  (user.passwordHash === enteredCurrent) ||
                  (user.salt && crypto.createHash('sha256').update(user.salt + ':' + enteredCurrent).digest('hex') === user.passwordHash);

  if (!isValid) {
    return res.status(400).json({ error: 'Mevcut şifre eşleşmiyor.' });
  }

  const finalUsername = (newUsername && newUsername.trim()) ? newUsername.trim() : user.username;
  const finalPassword = String(newPassword).trim();

  // Update in Supabase without encryption
  await supabase.updateUserCredentials(user.id, finalUsername, finalPassword);

  // Update in local file
  const usersData = readJSON(USERS_FILE, { users: [] });
  const localTarget = usersData.users.find(u => u.id === user.id);
  if (localTarget) {
    localTarget.username = finalUsername;
    localTarget.password = finalPassword;
    localTarget.password_hash = finalPassword;
    localTarget.passwordHash = finalPassword;
    localTarget.salt = '';
    writeJSON(USERS_FILE, usersData);
  }

  req.adminUser.username = finalUsername;

  res.json({ success: true, message: 'Yönetici kullanıcı adı ve şifresi başarıyla güncellendi.', username: finalUsername });
});

// POST /api/admin/password - Alias for credentials change
app.post('/api/admin/password', requireAuth, async (req, res) => {
  const { currentPassword, newPassword, newUsername } = req.body;
  if (!newPassword || newPassword.length < 2) {
    return res.status(400).json({ error: 'Yeni şifre en az 2 karakter olmalıdır.' });
  }

  const localUsers = readJSON(USERS_FILE, { users: [] }).users;
  const user = await supabase.getUser(req.adminUser.username, localUsers);
  if (!user) return res.status(404).json({ error: 'Kullanıcı bulunamadı.' });

  const enteredCurrent = String(currentPassword || '').trim();
  const isValid = (user.password === enteredCurrent) ||
                  (user.password_hash === enteredCurrent) ||
                  (user.passwordHash === enteredCurrent) ||
                  (user.salt && crypto.createHash('sha256').update(user.salt + ':' + enteredCurrent).digest('hex') === user.passwordHash);

  if (!isValid) {
    return res.status(400).json({ error: 'Mevcut şifre eşleşmiyor.' });
  }

  const finalUsername = (newUsername && newUsername.trim()) ? newUsername.trim() : user.username;
  const finalPassword = String(newPassword).trim();

  await supabase.updateUserCredentials(user.id, finalUsername, finalPassword);

  const usersData = readJSON(USERS_FILE, { users: [] });
  const localTarget = usersData.users.find(u => u.id === user.id);
  if (localTarget) {
    localTarget.username = finalUsername;
    localTarget.password = finalPassword;
    localTarget.password_hash = finalPassword;
    localTarget.passwordHash = finalPassword;
    localTarget.salt = '';
    writeJSON(USERS_FILE, usersData);
  }

  req.adminUser.username = finalUsername;
  res.json({ success: true, message: 'Yönetici bilgileri başarıyla güncellendi.', username: finalUsername });
});

// ==========================================
// SUPABASE DATABASE & STORAGE CONFIG APIS
// ==========================================

// GET /api/admin/supabase/status - Check Supabase connection state
app.get('/api/admin/supabase/status', requireAuth, async (req, res) => {
  const status = await supabase.testConnection();
  res.json({
    configured: supabase.isConfigured(),
    url: process.env.SUPABASE_URL || '',
    ...status
  });
});

// POST /api/admin/supabase/setup - Configure Supabase URL & Key from Admin Panel
app.post('/api/admin/supabase/setup', requireAuth, async (req, res) => {
  const { supabaseUrl, supabaseKey } = req.body;
  if (!supabaseUrl || !supabaseKey) {
    return res.status(400).json({ error: 'Supabase URL ve API Anahtarı zorunludur.' });
  }

  const updated = supabase.updateCredentials(supabaseUrl, supabaseKey);
  if (!updated) {
    return res.status(500).json({ error: 'Yapılandırma dosyası güncellenemedi.' });
  }

  const connTest = await supabase.testConnection();
  res.json({
    success: connTest.success,
    message: connTest.message,
    status: connTest
  });
});

// POST /api/admin/supabase/sync - Synchronize and seed local JSON database to Supabase tables
app.post('/api/admin/supabase/sync', requireAuth, async (req, res) => {
  try {
    const seedResults = await supabase.seedFromLocalFiles();
    res.json({
      success: true,
      message: 'Tüm ayarlar, ara sectionlar, SVG ikonlar, kullanıcılar ve şablonlar Supabase veritabanına başarıyla aktarıldı!',
      results: seedResults
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      error: `Veri aktarımı sırasında hata: ${err.message}`
    });
  }
});

// ==========================================
// ADMIN DASHBOARD & ANALYTICS APIS
// ==========================================

// GET /api/admin/analytics - Telemetry and section viewing data from Supabase
app.get('/api/admin/analytics', requireAuth, async (req, res) => {
  const localLogs = readJSON(LOGS_FILE, { summary: {}, visitors: [] });
  const localEmails = readJSON(EMAILS_FILE, { inbox: [] });

  const analytics = await supabase.getAnalytics({
    ...localLogs,
    summary: {
      ...localLogs.summary,
      unreadInquiries: (localEmails.inbox || []).filter(m => !m.read).length,
      totalInquiries: (localEmails.inbox || []).length
    }
  });

  // Calculate real active users count from both memory and Supabase DB
  const finalActiveCount = Math.max(activeVisitors.size, analytics.activeUsersCount || 0);

  res.json({
    ...analytics,
    activeUsersCount: finalActiveCount,
    serverBotStats: {
      stats,
      verifiedHumanCount: verifiedHumans.size,
      recentRequests: trafficLog.slice(-50)
    }
  });
});

// POST /api/admin/logs/clear - Reset logs in Supabase
app.post('/api/admin/logs/clear', requireAuth, async (req, res) => {
  await supabase.clearLogs();

  const freshLogs = {
    summary: { totalVisits: 0, uniqueVisitors: 0, pageViews: 0, avgDurationSeconds: 0, lastUpdated: new Date().toISOString() },
    sectionViews: {},
    sectionTimeSeconds: {},
    sectionCountryViews: {},
    deviceStats: { Desktop: 0, Mobile: 0, Tablet: 0 },
    browserStats: {},
    countryStats: {},
    visitors: []
  };
  writeJSON(LOGS_FILE, freshLogs);

  res.json({ success: true, message: 'Visitor logs cleared successfully.' });
});

// Comprehensive Data & Metrics Purge Engine
async function executeDataPurge(options = {}) {
  const {
    target = 'all', // 'all', 'visitors', 'heatmap', 'geo', 'sessions', 'emails', 'audit'
    olderDays = null,
    includeMessages = false,
    includeAudit = false,
    includeSessions = true,
    triggeredBy = 'Yönetici'
  } = options;

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

  const output = [];
  const nowStr = new Date().toLocaleTimeString('tr-TR');
  output.push(`[${nowStr}] Veri ve metrik temizleme işlemi başlatıldı (Tetikleyen: ${triggeredBy}).`);

  let deletedVisitorsCount = 0;
  let resetSectionsCount = 0;

  if (olderDays && Number(olderDays) > 0) {
    const cutoffTime = Date.now() - Number(olderDays) * 24 * 60 * 60 * 1000;
    const initialCount = (logs.visitors || []).length;
    logs.visitors = (logs.visitors || []).filter(v => {
      const vTime = new Date(v.lastSeen || v.firstSeen || 0).getTime();
      return vTime >= cutoffTime;
    });
    deletedVisitorsCount = initialCount - logs.visitors.length;
    logs.summary.totalVisits = logs.visitors.length;
    logs.summary.uniqueVisitors = new Set(logs.visitors.map(v => v.ip)).size;
    logs.summary.lastUpdated = new Date().toISOString();

    if (supabase.isConfigured()) {
      try {
        await supabase.clearOlderThan(Number(olderDays));
      } catch (e) {}
    }
    output.push(`[${nowStr}] ${olderDays} günden eski ${deletedVisitorsCount} adet ziyaretçi telemetri kaydı temizlendi.`);
  } else {
    // Purge visitors
    if (target === 'visitors' || target === 'all') {
      deletedVisitorsCount = (logs.visitors || []).length;
      logs.visitors = [];
      logs.summary = {
        totalVisits: 0,
        uniqueVisitors: 0,
        pageViews: 0,
        avgDurationSeconds: 0,
        lastUpdated: new Date().toISOString()
      };
      output.push(`[${nowStr}] ${deletedVisitorsCount} adet ziyaretçi telemetri kaydı ve sayaç sıfırlandı.`);
    }

    // Purge heatmap
    if (target === 'heatmap' || target === 'all') {
      resetSectionsCount = Object.keys(logs.sectionViews || {}).length;
      logs.sectionViews = {};
      logs.sectionTimeSeconds = {};
      logs.sectionCountryViews = {};
      output.push(`[${nowStr}] ${resetSectionsCount} adet bölüm ısı haritası ve kalış süresi metriği sıfırlandı.`);
    }

    // Purge geo & devices
    if (target === 'geo' || target === 'all') {
      logs.deviceStats = { Desktop: 0, Mobile: 0, Tablet: 0 };
      logs.browserStats = {};
      logs.countryStats = {};
      output.push(`[${nowStr}] Cihaz, tarayıcı ve coğrafi ülke dağılım metrikleri sıfırlandı.`);
    }

    // Purge sessions
    if (includeSessions || target === 'sessions' || target === 'all') {
      activeVisitors.clear();
      writeJSON(SESSIONS_FILE, { sessions: {}, lastUpdated: new Date().toISOString() });
      output.push(`[${nowStr}] Canlı ziyaretçi oturumları ve heartbeat sayaçları temizlendi.`);
    }

    // Purge emails/messages if explicitly requested
    if (includeMessages || target === 'emails') {
      const existing = readJSON(EMAILS_FILE, {});
      const inCount = (existing.inbox || []).length;
      const sentCount = (existing.sent || []).length;
      writeJSON(EMAILS_FILE, {
        inbox: [],
        sent: [],
        templates: existing.templates || []
      });
      output.push(`[${nowStr}] ${inCount} gelen form mesajı ve ${sentCount} e-posta geçmişi temizlendi.`);
    }

    // Purge audit logs if explicitly requested
    if (includeAudit || target === 'audit') {
      writeJSON(AUDIT_FILE, []);
      output.push(`[${nowStr}] Güvenlik ve yönetici denetim logları sıfırlandı.`);
    }

    // Supabase sync
    if (supabase.isConfigured()) {
      try {
        if (target === 'all') {
          await supabase.clearAllMetrics({
            includeInquiries: includeMessages,
            includeEmails: includeMessages
          });
        } else if (target === 'visitors' || target === 'heatmap') {
          await supabase.clearLogs();
        }
        output.push(`[${nowStr}] Supabase bulut veritabanı tabloları başarıyla senkronize edildi.`);
      } catch (e) {
        output.push(`[${nowStr}] Supabase bilgisi: ${e.message}`);
      }
    }
  }

  writeJSON(LOGS_FILE, logs);

  // Record audit log entry unless audit itself was wiped
  if (!includeAudit && target !== 'audit') {
    try {
      const audits = readJSON(AUDIT_FILE, []);
      audits.unshift({
        id: 'audit_' + Date.now(),
        timestamp: new Date().toISOString(),
        action: 'DATA_PURGE',
        user: triggeredBy,
        target,
        deletedVisitors: deletedVisitorsCount,
        details: `Veri ve metrik temizleme komutu çalıştırıldı (${target})`
      });
      if (audits.length > 500) audits.length = 500;
      writeJSON(AUDIT_FILE, audits);
    } catch (e) {}
  }

  output.push(`[${nowStr}] İŞLEM TAMAMLANDI: Belirtilen tüm veriler ve metrikler otomatik olarak silindi.`);

  return {
    success: true,
    target,
    deletedVisitorsCount,
    resetSectionsCount,
    timestamp: new Date().toISOString(),
    output
  };
}

// POST /api/admin/metrics/purge - Granular metric-by-metric deletion and purge (Backwards compatible)
app.post('/api/admin/metrics/purge', requireAuth, async (req, res) => {
  const { target } = req.body; // 'visitors', 'heatmap', 'geo', 'emails', 'audit', 'all'
  const result = await executeDataPurge({
    target: target || 'all',
    includeMessages: target === 'emails' || target === 'all',
    includeAudit: target === 'audit',
    triggeredBy: req.adminUser ? req.adminUser.name : 'Yönetici'
  });
  res.json({
    success: true,
    target,
    message: `Seçilen metrikler (${target}) başarıyla temizlendi.`,
    output: result.output
  });
});

// POST /api/admin/metrics/purge-all - Dedicated Full Wipe of All Held Data & Metrics
app.post('/api/admin/metrics/purge-all', requireAuth, async (req, res) => {
  const { includeMessages = false, includeAudit = false, includeSessions = true } = req.body || {};
  const adminName = req.adminUser ? req.adminUser.name : 'Yönetici';
  const result = await executeDataPurge({
    target: 'all',
    includeMessages,
    includeAudit,
    includeSessions,
    triggeredBy: adminName
  });
  res.json({
    success: true,
    message: 'Tüm tutulan veriler ve metrikler başarıyla sıfırlandı.',
    result
  });
});

// POST /api/admin/command/run - Interactive Portal Command Console Execution
app.post('/api/admin/command/run', requireAuth, async (req, res) => {
  const rawCmd = (req.body.command || '').trim();
  if (!rawCmd) {
    return res.status(400).json({ error: 'Komut boş olamaz.' });
  }

  const parts = rawCmd.split(/\s+/);
  const main = parts[0].toLowerCase();
  const sub = (parts[1] || '').toLowerCase();
  const arg = (parts[2] || '').toLowerCase();
  const adminName = req.adminUser ? req.adminUser.name : 'Yönetici';

  const output = [];
  const now = new Date().toLocaleTimeString('tr-TR');
  output.push(`$ ${rawCmd}`);

  try {
    if (main === 'purge' || main === 'clear' || main === 'wipe' || main === 'sil' || main === 'sifirla') {
      if (sub === '--all' || sub === 'all' || sub === 'tum' || !sub) {
        const result = await executeDataPurge({
          target: 'all',
          includeSessions: true,
          includeMessages: parts.includes('--with-messages') || parts.includes('--messages'),
          includeAudit: parts.includes('--with-audit') || parts.includes('--audit'),
          triggeredBy: adminName
        });
        return res.json({ success: true, command: rawCmd, output: result.output });
      } else if (sub === '--visitors' || sub === 'visitors' || sub === 'ziyaretciler') {
        const result = await executeDataPurge({ target: 'visitors', triggeredBy: adminName });
        return res.json({ success: true, command: rawCmd, output: result.output });
      } else if (sub === '--heatmap' || sub === 'heatmap' || sub === 'isi') {
        const result = await executeDataPurge({ target: 'heatmap', triggeredBy: adminName });
        return res.json({ success: true, command: rawCmd, output: result.output });
      } else if (sub === '--geo' || sub === 'geo' || sub === 'bolgeler') {
        const result = await executeDataPurge({ target: 'geo', triggeredBy: adminName });
        return res.json({ success: true, command: rawCmd, output: result.output });
      } else if (sub === '--older') {
        let days = parseInt(arg, 10);
        if (isNaN(days) && sub.includes('d')) days = parseInt(sub.replace(/\D/g, ''), 10);
        if (!days) days = 7;
        const result = await executeDataPurge({ olderDays: days, triggeredBy: adminName });
        return res.json({ success: true, command: rawCmd, output: result.output });
      } else if (sub.startsWith('--older') || sub.startsWith('older')) {
        const days = parseInt(sub.replace(/\D/g, ''), 10) || parseInt(arg, 10) || 7;
        const result = await executeDataPurge({ olderDays: days, triggeredBy: adminName });
        return res.json({ success: true, command: rawCmd, output: result.output });
      } else {
        output.push(`[${now}] Bilinmeyen parametre: ${sub}`);
        output.push(`Kullanım: purge --all | purge --visitors | purge --heatmap | purge --geo | purge --older 7d`);
        return res.json({ success: false, command: rawCmd, output });
      }
    } else if (main === 'auto-purge') {
      const validSchedules = ['off', 'daily', 'weekly', 'monthly', 'older_7d', 'older_14d', 'older_30d'];
      let chosen = sub.replace('--', '');
      if (chosen === 'on') chosen = 'daily';
      if (!validSchedules.includes(chosen)) {
        output.push(`[${now}] Geçersiz zamanlama. Seçenekler: ${validSchedules.join(', ')}`);
        return res.json({ success: false, command: rawCmd, output });
      }
      const localConfig = readJSON(CONFIG_FILE, {});
      if (!localConfig.system) localConfig.system = {};
      localConfig.system.autoPurgeSchedule = chosen;
      writeJSON(CONFIG_FILE, localConfig);
      if (supabase.isConfigured()) {
        try { await supabase.saveConfig(localConfig); } catch (e) {}
      }
      output.push(`[${now}] Otomatik temizleme zamanlaması kaydedildi: ${chosen.toUpperCase()}`);
      return res.json({ success: true, command: rawCmd, output });
    } else if (main === 'status' || main === 'durum') {
      const logs = readJSON(LOGS_FILE, {});
      const cfg = readJSON(CONFIG_FILE, {});
      const visitorsCount = (logs.visitors || []).length;
      const sectionsCount = Object.keys(logs.sectionViews || {}).length;
      const schedule = (cfg.system && cfg.system.autoPurgeSchedule) || 'off';
      const lastPurge = (cfg.system && cfg.system.lastAutoPurge) ? new Date(cfg.system.lastAutoPurge).toLocaleString('tr-TR') : 'Henüz çalışmadı';
      output.push(`[${now}] Sistem Telemetri ve Veri Durumu:`);
      output.push(`- Kayıtlı Ziyaretçi: ${visitorsCount}`);
      output.push(`- Isı Haritası Bölümleri: ${sectionsCount}`);
      output.push(`- Otomatik Temizleme Takvimi: ${schedule.toUpperCase()}`);
      output.push(`- Son Otomatik Temizleme: ${lastPurge}`);
      return res.json({ success: true, command: rawCmd, output });
    } else if (main === 'help' || main === 'yardim') {
      output.push(`[${now}] Kullanılabilir Komutlar:`);
      output.push(`- purge --all                : Tüm verileri ve metrikleri otomatik sıfırla`);
      output.push(`- purge --visitors           : Yalnızca ziyaretçi kayıtlarını ve sayaçlarını sil`);
      output.push(`- purge --heatmap            : Sayfa bölüm ısı haritası ve süreleri sıfırla`);
      output.push(`- purge --geo                : Cihaz ve coğrafi dağılım kayıtlarını temizle`);
      output.push(`- purge --older 7d           : 7 günden eski telemetri kayıtlarını sil`);
      output.push(`- auto-purge <daily|weekly>  : Otomatik zamanlanmış temizlemeyi aktifleştir`);
      output.push(`- auto-purge off             : Otomatik zamanlamayı kapat`);
      output.push(`- status                     : Mevcut kayıt sayılarını ve zamanlama durumunu göster`);
      output.push(`- help                       : Bu yardım listesini görüntüler`);
      return res.json({ success: true, command: rawCmd, output });
    } else {
      output.push(`[${now}] Tanınmayan komut: '${main}'. Kullanılabilir komutları görmek için 'help' yazın.`);
      return res.json({ success: false, command: rawCmd, output });
    }
  } catch (err) {
    output.push(`[${now}] Komut çalıştırma hatası: ${err.message}`);
    return res.status(500).json({ success: false, command: rawCmd, output, error: err.message });
  }
});

// GET /api/admin/metrics/stats - Quick stats of stored metrics for Temel Ayarlar
app.get('/api/admin/metrics/stats', requireAuth, async (req, res) => {
  const logs = readJSON(LOGS_FILE, {});
  const emails = readJSON(EMAILS_FILE, {});
  const audits = readJSON(AUDIT_FILE, []);
  const config = readJSON(CONFIG_FILE, {});

  const visitorsCount = (logs.visitors || []).length;
  const sectionsCount = Object.keys(logs.sectionViews || {}).length;
  const geoCount = Object.keys(logs.countryStats || {}).length + Object.keys(logs.browserStats || {}).length;
  const sessionsCount = activeVisitors.size;
  const inquiriesCount = (emails.inbox || []).length;
  const auditCount = (audits || []).length;

  const autoPurgeSchedule = (config.system && config.system.autoPurgeSchedule) || 'off';
  const lastAutoPurge = (config.system && config.system.lastAutoPurge) || null;
  const retentionDays = (config.system && config.system.retentionDays) || 30;

  res.json({
    visitorsCount,
    sectionsCount,
    geoCount,
    sessionsCount,
    inquiriesCount,
    auditCount,
    autoPurgeSchedule,
    lastAutoPurge,
    retentionDays
  });
});

// POST /api/admin/settings/basic - Update core portal and retention parameters
app.post('/api/admin/settings/basic', requireAuth, async (req, res) => {
  const { siteName, contactEmail, botFilter, heartbeatInterval, autoPurgeSchedule, retentionDays } = req.body || {};
  const localConfig = readJSON(CONFIG_FILE, {});
  if (!localConfig.system) localConfig.system = {};

  if (siteName !== undefined) {
    localConfig.system.siteName = siteName;
    if (localConfig.brand) localConfig.brand.name = siteName;
  }
  if (contactEmail !== undefined) {
    localConfig.system.contactEmail = contactEmail;
    if (localConfig.contact) localConfig.contact.email = contactEmail;
  }
  if (botFilter !== undefined) localConfig.system.botFilter = Boolean(botFilter);
  if (heartbeatInterval !== undefined) localConfig.system.heartbeatInterval = parseInt(heartbeatInterval, 10) || 15;
  if (autoPurgeSchedule !== undefined) localConfig.system.autoPurgeSchedule = autoPurgeSchedule;
  if (retentionDays !== undefined) localConfig.system.retentionDays = parseInt(retentionDays, 10) || 30;

  writeJSON(CONFIG_FILE, localConfig);
  if (supabase.isConfigured()) {
    try { await supabase.saveConfig(localConfig); } catch (e) {}
  }

  res.json({ success: true, message: 'Temel ayarlar başarıyla kaydedildi.', system: localConfig.system });
});

// Automated Background Purge Scheduler (checks every 15 minutes)
setInterval(async () => {
  try {
    const config = readJSON(CONFIG_FILE, {});
    const system = config.system || {};
    const schedule = system.autoPurgeSchedule || 'off';
    if (schedule === 'off') return;

    const lastPurge = system.lastAutoPurge ? new Date(system.lastAutoPurge).getTime() : 0;
    const now = Date.now();
    let shouldPurge = false;
    let olderDays = null;

    if (schedule === 'daily' && (!lastPurge || now - lastPurge >= 24 * 60 * 60 * 1000)) {
      shouldPurge = true;
    } else if (schedule === 'weekly' && (!lastPurge || now - lastPurge >= 7 * 24 * 60 * 60 * 1000)) {
      shouldPurge = true;
    } else if (schedule === 'monthly' && (!lastPurge || now - lastPurge >= 30 * 24 * 60 * 60 * 1000)) {
      shouldPurge = true;
    } else if (schedule === 'older_7d') {
      shouldPurge = true;
      olderDays = 7;
    } else if (schedule === 'older_14d') {
      shouldPurge = true;
      olderDays = 14;
    } else if (schedule === 'older_30d') {
      shouldPurge = true;
      olderDays = 30;
    }

    if (shouldPurge) {
      console.log(`[AutoPurge] Otomatik zamanlanmış temizleme tetiklendi (${schedule})...`);
      await executeDataPurge({
        target: 'all',
        olderDays,
        triggeredBy: `Otomatik Zamanlayıcı (${schedule})`
      });
      system.lastAutoPurge = new Date().toISOString();
      config.system = system;
      writeJSON(CONFIG_FILE, config);
      if (supabase.isConfigured()) {
        try { await supabase.saveConfig(config); } catch (e) {}
      }
    }
  } catch (err) {
    console.warn('[AutoPurge Scheduler error]:', err.message);
  }
}, 15 * 60 * 1000);

// GET /api/admin/metrics/export-csv - Detailed CSV telemetry export from Supabase
app.get('/api/admin/metrics/export-csv', requireAuth, async (req, res) => {
  const localLogs = readJSON(LOGS_FILE, {});
  const analytics = await supabase.getAnalytics(localLogs);
  const visitors = analytics.visitors || analytics.recentVisitors || localLogs.visitors || [];
  const views = analytics.sectionViews || localLogs.sectionViews || {};
  const times = analytics.sectionTimeSeconds || localLogs.sectionTimeSeconds || {};
  const summary = analytics.summary || localLogs.summary || {};
  const countryStats = analytics.countryStats || localLogs.countryStats || {};
  const deviceStats = analytics.deviceStats || localLogs.deviceStats || {};

  let csv = '\uFEFF'; // UTF-8 BOM for Excel
  csv += '=== ABENTRA INTERNATIONAL - YÖNETİCİ METRİK VE TELEMETRİ RAPORU ===\r\n';
  csv += `Rapor Tarihi: ${new Date().toLocaleString('tr-TR')}\r\n`;
  csv += `Oluşturan: ${req.adminUser ? req.adminUser.name : 'Yönetici'} (${req.adminUser ? req.adminUser.role : 'Admin'})\r\n\r\n`;

  csv += '--- GENEL ÖZET METRİKLER (SUPABASE VERİTABANI) ---\r\n';
  csv += `Gerçek Ziyaretçi Sayısı,${summary.totalVisits || 0}\r\n`;
  csv += `Bot & DNS / Tarayıcı Sayısı,${summary.botVisits || 0}\r\n`;
  csv += `Toplam Ham İstek (Tümü),${summary.allVisitsTotal || summary.totalVisits || 0}\r\n`;
  csv += `Tekil Ziyaretçi,${summary.uniqueVisitors || 0}\r\n`;
  csv += `Bugünkü Gerçek Ziyaretçi,${summary.todayVisits || 0}\r\n`;
  csv += `Bugünkü Bot / DNS İstekleri,${summary.todayBotVisits || 0}\r\n`;
  csv += `Ortalama Kalış Süresi (sn),${summary.avgDurationSeconds || 0}\r\n\r\n`;

  csv += '--- BÖLÜM (SECTION) TELEMETRİSİ & ISI HARİTASI ---\r\n';
  csv += 'Bölüm Adı,Görüntüleme Sayısı,Kalış Süresi (sn)\r\n';
  for (const [sec, count] of Object.entries(views)) {
    csv += `"${sec}",${count},${times[sec] || 0}\r\n`;
  }
  csv += '\r\n';

  csv += '--- ÜLKE DAĞILIMI ---\r\n';
  csv += 'Ülke,Ziyaret Sayısı\r\n';
  for (const [cnt, count] of Object.entries(countryStats || {})) {
    csv += `"${cnt}",${count}\r\n`;
  }
  csv += '\r\n';

  csv += '--- CİHAZ DAĞILIMI ---\r\n';
  csv += 'Cihaz Tipi,Ziyaret Sayısı\r\n';
  for (const [dev, count] of Object.entries(deviceStats || {})) {
    csv += `"${dev}",${count}\r\n`;
  }
  csv += '\r\n';

  csv += '--- DETAYLI ZİYARETÇİ LOGLARI ---\r\n';
  csv += 'Ziyaretçi ID,Tür (İnsan/Bot),Doğrulandı,IP Adresi,Bayrak,Ülke,Şehir,Cihaz,Tarayıcı,İşletim Sistemi,İlk Görülme,Son Görülme,Kalış Süresi (sn),Görüntülenen Bölümler\r\n';
  visitors.forEach(v => {
    const secList = (v.sectionsViewed || []).map(s => `${s.name} (${s.seconds}s)`).join('; ');
    const vType = v.visitorType === 'bot' ? 'Bot / DNS' : v.visitorType === 'suspicious' ? 'Şüpheli' : 'Gerçek İnsan';
    csv += `"${v.id}","${vType}","${v.verified ? 'Evet' : 'Hayır'}","${v.ip}","${v.flag || ''}","${v.country || ''}","${v.city || ''}","${v.device || ''}","${v.browser || ''}","${v.os || ''}","${v.firstSeen || ''}","${v.lastSeen || ''}",${v.durationSeconds || 0},"${secList}"\r\n`;
  });

  res.setHeader('Content-Type', 'text/csv; charset=utf-8');
  res.setHeader('Content-Disposition', `attachment; filename="abentra_telemetry_${Date.now()}.csv"`);
  res.send(csv);
});

// ==========================================
// ADMIN SITE CONFIG & CONTENT CMS APIS
// ==========================================

// GET /api/admin/config
app.get('/api/admin/config', requireAuth, async (req, res) => {
  const localConfig = readJSON(CONFIG_FILE);
  const config = await supabase.getConfig(localConfig);
  res.json(config);
});

// POST /api/admin/config - Update site configuration, theme & content in Supabase
app.post('/api/admin/config', requireAuth, async (req, res) => {
  const updated = req.body;
  if (!updated || typeof updated !== 'object') {
    return res.status(400).json({ error: 'Invalid configuration data' });
  }

  const localConfig = readJSON(CONFIG_FILE);
  const current = await supabase.getConfig(localConfig);
  const merged = { ...current, ...updated };

  // 1. Save to Supabase
  await supabase.saveConfig(merged);

  // 2. Save local backup
  writeJSON(CONFIG_FILE, merged);

  res.json({ success: true, message: 'Site configuration and theme updated successfully in Supabase.', config: merged });
});

// POST /api/admin/upload-logo - Upload brand logo image (Supabase Storage first)
app.post('/api/admin/upload-logo', requireAuth, upload.single('logo'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No image file uploaded.' });
  }

  const fileBuffer = req.file.buffer;
  let logoUrl = '';

  // 1. Try uploading to Supabase Storage Bucket first
  if (supabase.isConfigured()) {
    try {
      const cloudUrl = await supabase.uploadToBucket(fileBuffer, req.file.originalname, req.file.mimetype);
      if (cloudUrl) logoUrl = cloudUrl;
    } catch (e) {
      console.warn('Supabase storage upload skipped:', e.message);
    }
  }

  // 2. If not uploaded to cloud, fallback to local disk (if not Vercel) or base64 Data URI
  if (!logoUrl) {
    if (process.env.VERCEL === '1' || process.env.VERCEL) {
      logoUrl = `data:${req.file.mimetype};base64,${fileBuffer.toString('base64')}`;
    } else {
      try {
        const ext = path.extname(req.file.originalname);
        const filename = `${Date.now()}_${path.basename(req.file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_')}${ext}`;
        if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });
        fs.writeFileSync(path.join(UPLOADS_DIR, filename), fileBuffer);
        logoUrl = `/uploads/${filename}`;
      } catch (err) {
        logoUrl = `data:${req.file.mimetype};base64,${fileBuffer.toString('base64')}`;
      }
    }
  }

  const localConfig = readJSON(CONFIG_FILE);
  const config = await supabase.getConfig(localConfig);
  config.brand = config.brand || {};
  config.brand.logoImage = logoUrl;
  config.brand.logoType = 'image';

  await supabase.saveConfig(config);
  writeJSON(CONFIG_FILE, config);

  res.json({ success: true, logoUrl, message: 'Logo successfully uploaded and applied.' });
});

// POST /api/admin/config/reset - Reset to default initial state
app.post('/api/admin/config/reset', requireAuth, async (req, res) => {
  const defaultConfig = {
    brand: {
      name: "ABENTRA",
      subTagline: "INTERNATIONAL",
      tagline: "BRIDGING OPPORTUNITIES. BUILDING TOMORROW.",
      location: "Monrovia, Liberia",
      badgeText: "Company profile",
      logoType: "svg",
      logoImage: "/assets/logo.jpeg"
    },
    theme: {
      navy: "#0a2038",
      navy2: "#0e2a47",
      navy3: "#061628",
      gold: "#c9a45c",
      gold2: "#e3c98f",
      ink: "#f3efe6",
      mute: "#b9c3d0",
      mode: "dark"
    },
    hero: {
      tag: "Company profile",
      title: "Bridging opportunities.",
      titleAccent: "Building tomorrow.",
      desc: "Business establishment, licensing, compliance and liaison in Liberia.",
      btnPrimaryText: "Our services",
      btnPrimaryLink: "#services",
      btnSecondaryText: "Let’s connect",
      btnSecondaryLink: "#contact",
      location: "Monrovia, Liberia"
    },
    ticker: [
      "Business establishment", "Licensing & compliance", "Government & corporate liaison", "Market entry & ongoing support"
    ],
    who: {
      tag: "Who we are",
      tagSub: "Company profile 02",
      title: "Your connection to business in Liberia.",
      lead: "ABENTRA is the trusted connection between businesses, government institutions, regulators and commercial opportunities in Liberia.",
      secondary: "Helping local and international businesses establish, connect and remain compliant in Liberia.",
      promiseLabel: "Our promise",
      promiseText: "We simplify the path between business ambition and compliant operation in Liberia.",
      sidebarTitle: "One coordinated point of contact",
      points: [
        { num: "01", title: "Business establishment", tabIndex: 0 },
        { num: "02", title: "Licensing & compliance", tabIndex: 1 },
        { num: "03", title: "Government & corporate liaison", tabIndex: 2 },
        { num: "04", title: "Market entry & ongoing support", tabIndex: 3 }
      ]
    },
    purpose: {
      tag: "Our purpose",
      tagSub: "Company profile 03",
      title: "Purpose, direction and character.",
      missionTitle: "Mission",
      missionText: "Help businesses enter, establish and operate confidently through dependable liaison, licensing, compliance and market-entry support.",
      visionTitle: "Vision",
      visionText: "Become Liberia’s most trusted gateway for responsible local and international business establishment and regulatory compliance.",
      characterTitle: "Our character",
      characters: ["Professional", "Diplomatic", "Knowledgeable", "Efficient", "Discreet", "Responsive", "Trustworthy"]
    },
    services: [
      {
        id: "s0", tabId: "t0", title: "Business establishment", tag: "Service area 01", tagSub: "Company profile 04",
        note: "One coordinated point of contact for business support in Liberia.",
        items: ["Business registration and renewal", "Tax registration and clearance facilitation", "Corporate administrative support"]
      },
      {
        id: "s1", tabId: "t1", title: "Licensing & compliance", tag: "Service area 02", tagSub: "Company profile 05",
        note: "One coordinated point of contact for business support in Liberia.",
        items: ["Operational permits and industry licenses", "Certification, accreditation and renewals", "Compliance monitoring and retainers"]
      },
      {
        id: "s2", tabId: "t2", title: "Government & corporate liaison", tag: "Service area 03", tagSub: "Company profile 06",
        note: "ABENTRA coordinates processes but does not provide legal advice, guarantee government approval or control official processing times.",
        items: ["Ministry and agency coordination", "Application follow-up and reporting", "Legal referrals to qualified lawyers"]
      },
      {
        id: "s3", tabId: "t3", title: "Market entry & ongoing support", tag: "Service area 04", tagSub: "Company profile 07",
        note: "One coordinated point of contact for business support in Liberia.",
        items: ["Market-entry guidance", "Local introductions and partner connections", "Investor and delegation support"]
      }
    ],
    contact: {
      tag: "Leadership & contact", tagSub: "Company profile 08", title: "Let’s connect.",
      leaderName: "ABENETTA KOLLIE", leaderTitle: "Founder & Managing Director",
      phones: ["+231 886 246 170", "+231 775 875 843"],
      email: "abentrainternational@gmail.com",
      addressLine1: "Camp Johnson Road & Clay Street", addressLine2: "Monrovia, Liberia",
      mapUrl: "https://www.google.com/maps/search/?api=1&query=Camp+Johnson+Road+and+Clay+Street+Monrovia+Liberia",
      ctaText: "Email ABENTRA",
      enableForm: true
    },
    footer: {
      col1: "ABENTRA International · Monrovia, Liberia",
      col2: "Bridging opportunities. Building tomorrow.",
      copyright: "© 2026 ABENTRA International. All rights reserved."
    },
    smtp: {
      enabled: false, host: "", port: 587, secure: false, user: "", pass: "",
      fromEmail: "info@abentra.com", fromName: "ABENTRA International"
    }
  };

  await supabase.saveConfig(defaultConfig);
  writeJSON(CONFIG_FILE, defaultConfig);
  res.json({ success: true, message: 'Configuration restored to initial defaults.', config: defaultConfig });
});

// ==========================================
// DYNAMIC SECTIONS MANAGEMENT APIS
// ==========================================

// GET /api/admin/sections - Get all intermediate sections from Supabase
app.get('/api/admin/sections', requireAuth, async (req, res) => {
  const localSections = readJSON(SECTIONS_FILE, []);
  const sections = await supabase.getSections(localSections);
  res.json(sections);
});

// POST /api/admin/sections - Save reordered or edited sections array in Supabase
app.post('/api/admin/sections', requireAuth, async (req, res) => {
  const sections = req.body;
  if (!Array.isArray(sections)) {
    return res.status(400).json({ error: 'Sections must be an array' });
  }

  await supabase.saveSections(sections);
  writeJSON(SECTIONS_FILE, sections);
  res.json({ success: true, message: 'Sections updated successfully.', sections });
});

// POST /api/admin/faq/add - Add inquiry directly to FAQ (Sık Sorulan Sorular) and publish to website
app.post(['/api/admin/faq/add', '/api/moon/manager/faq/add'], requireAuth, async (req, res) => {
  const { question, answer, category } = req.body;
  if (!question || !question.trim()) {
    return res.status(400).json({ error: 'Question is required.' });
  }

  const q = question.trim();
  const a = (answer || '').trim() || 'Talebiniz uzman danışmanlarımız tarafından incelenmekte olup en kısa sürede detaylı yanıt paylaşılacaktır.';
  const cat = (category || 'Danışmanlık').trim();

  // 1. Update sections.json (sec_faq)
  const localSections = readJSON(SECTIONS_FILE, []);
  let sections = await supabase.getSections(localSections);
  if (!Array.isArray(sections)) sections = [];

  let faqSec = sections.find(s => s.id === 'sec_faq' || s.type === 'faq');
  if (!faqSec) {
    faqSec = {
      id: 'sec_faq',
      name: 'Sık Sorulan Sorular',
      type: 'faq',
      anchor: 'faq',
      title: 'Frequently Asked Questions',
      tag: 'FAQ',
      tagSub: 'Support & Guidance',
      subtitle: 'Clear answers to common questions regarding investment and compliance in Liberia.',
      enabled: true,
      order: (sections.length || 0) + 1,
      items: []
    };
    sections.push(faqSec);
  }

  if (!Array.isArray(faqSec.items)) faqSec.items = [];
  faqSec.items.push({
    question: q,
    answer: a,
    category: cat
  });
  faqSec.enabled = true; // Ensure FAQ section is live on site

  await supabase.saveSections(sections);
  writeJSON(SECTIONS_FILE, sections);

  // 2. Also sync to config.json
  const localConfig = readJSON(CONFIG_FILE);
  const currentConfig = await supabase.getConfig(localConfig);
  if (!Array.isArray(currentConfig.faq)) currentConfig.faq = [];
  currentConfig.faq.push({
    id: 'faq_' + Date.now().toString(36),
    q,
    a,
    category: cat,
    on: 1
  });
  await supabase.saveConfig(currentConfig);
  writeJSON(CONFIG_FILE, currentConfig);

  recordAuditLog({
    action: 'FAQ Added',
    user: req.user?.username || 'Executive',
    details: `Added new FAQ question: "${q}"`
  });

  res.json({
    success: true,
    message: 'FAQ item successfully added and published to the live website.',
    faqItem: { question: q, answer: a, category: cat },
    sections
  });
});

// POST /api/admin/sections/create - Create a new custom section in Supabase
app.post('/api/admin/sections/create', requireAuth, async (req, res) => {
  const { name, title, tag, type, items, subtitle, customHtml } = req.body;
  if (!name || !title) {
    return res.status(400).json({ error: 'Name and Title are required.' });
  }

  const localSections = readJSON(SECTIONS_FILE, []);
  const sections = await supabase.getSections(localSections);

  const newSection = {
    id: 'sec_' + Date.now().toString(36),
    name,
    title,
    tag: tag || 'Section Area',
    tagSub: 'Special Focus',
    subtitle: subtitle || '',
    type: type || 'cards',
    enabled: true,
    order: sections.length + 1,
    anchor: name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
    items: Array.isArray(items) ? items : [],
    customHtml: customHtml || ''
  };

  sections.push(newSection);
  await supabase.saveSections(sections);
  writeJSON(SECTIONS_FILE, sections);

  res.json({ success: true, message: 'Section created.', section: newSection });
});

// DELETE /api/admin/sections/:id - Delete a section in Supabase
app.delete('/api/admin/sections/:id', requireAuth, async (req, res) => {
  await supabase.deleteSection(req.params.id);

  const sections = readJSON(SECTIONS_FILE, []);
  const filtered = sections.filter(s => s.id !== req.params.id);
  writeJSON(SECTIONS_FILE, filtered);

  res.json({ success: true, message: 'Section deleted.' });
});

// ==========================================
// SVG ICON LIBRARY APIS
// ==========================================

// GET /api/admin/icons - Returns curated domain icons from Supabase
app.get('/api/admin/icons', requireAuth, async (req, res) => {
  const localIcons = readJSON(ICONS_FILE, []);
  const { q, category } = req.query;

  const icons = await supabase.getIcons(category, q, localIcons);
  res.json(icons);
});

// POST /api/admin/icons - Add a new custom SVG icon to Supabase
app.post('/api/admin/icons', requireAuth, async (req, res) => {
  const { name, category, description, tags, svg } = req.body;
  if (!name || !svg) {
    return res.status(400).json({ error: 'Icon name and SVG markup are required.' });
  }

  const newIcon = {
    id: 'icon_' + Date.now().toString(36),
    name: name.trim(),
    category: category || 'Corporate & Establishment',
    description: description || '',
    tags: Array.isArray(tags) ? tags : (tags || '').split(',').map(s => s.trim()).filter(Boolean),
    svg: svg.trim()
  };

  await supabase.createIcon(newIcon);

  // Local backup
  const icons = readJSON(ICONS_FILE, []);
  icons.push(newIcon);
  writeJSON(ICONS_FILE, icons);

  res.json({ success: true, message: 'Icon added to library.', icon: newIcon });
});

// DELETE /api/admin/icons/:id - Delete an icon in Supabase
app.delete('/api/admin/icons/:id', requireAuth, async (req, res) => {
  await supabase.deleteIcon(req.params.id);

  const icons = readJSON(ICONS_FILE, []);
  const filtered = icons.filter(i => i.id !== req.params.id);
  writeJSON(ICONS_FILE, filtered);

  res.json({ success: true, message: 'Icon removed from library.' });
});

// ==========================================
// EMAIL CENTER & MESSAGING APIS
// ==========================================

// GET /api/admin/emails - Get inbox, outbox, and templates from Supabase
app.get('/api/admin/emails', requireAuth, async (req, res) => {
  const localEmails = readJSON(EMAILS_FILE, { inbox: [], sent: [], templates: [] });
  const emailsData = await supabase.getEmails(localEmails);
  res.json(emailsData);
});

// PUT /api/admin/emails/inbox/:id/read - Mark message as read/unread in Supabase
app.put('/api/admin/emails/inbox/:id/read', requireAuth, async (req, res) => {
  const read = req.body.read !== undefined ? !!req.body.read : true;
  await supabase.markInquiryRead(req.params.id, read);

  // Local backup
  const emailsData = readJSON(EMAILS_FILE, { inbox: [] });
  const msg = emailsData.inbox.find(m => m.id === req.params.id);
  if (msg) msg.read = read;
  writeJSON(EMAILS_FILE, emailsData);

  res.json({ success: true, message: 'Status updated' });
});

// DELETE /api/admin/emails/inbox/:id - Delete message from inbox in Supabase
app.delete('/api/admin/emails/inbox/:id', requireAuth, async (req, res) => {
  await supabase.deleteInquiry(req.params.id);

  const emailsData = readJSON(EMAILS_FILE, { inbox: [] });
  emailsData.inbox = (emailsData.inbox || []).filter(m => m.id !== req.params.id);
  writeJSON(EMAILS_FILE, emailsData);

  res.json({ success: true, message: 'Message removed from inbox.' });
});

// PUT /api/admin/emails/inbox/:id/star - Toggle star on an inquiry
app.put('/api/admin/emails/inbox/:id/star', requireAuth, async (req, res) => {
  const starred = req.body.starred !== undefined ? !!req.body.starred : true;
  await supabase.starInquiry(req.params.id, starred);

  const emailsData = readJSON(EMAILS_FILE, { inbox: [] });
  const msg = (emailsData.inbox || []).find(m => m.id === req.params.id);
  if (msg) msg.starred = starred;
  writeJSON(EMAILS_FILE, emailsData);

  res.json({ success: true, starred, message: starred ? 'E-posta yıldızlandı' : 'Yıldız kaldırıldı' });
});

// DELETE /api/admin/emails/sent/:id - Delete message from sent emails
app.delete('/api/admin/emails/sent/:id', requireAuth, async (req, res) => {
  await supabase.deleteSentEmail(req.params.id);

  const emailsData = readJSON(EMAILS_FILE, { sent: [] });
  emailsData.sent = (emailsData.sent || []).filter(m => m.id !== req.params.id);
  writeJSON(EMAILS_FILE, emailsData);

  res.json({ success: true, message: 'Gönderilen e-posta silindi.' });
});

// ==========================================
// SMTP CONFIGURATION & VERIFICATION APIS
// ==========================================

// GET /api/admin/smtp - Retrieve current SMTP configuration status
app.get('/api/admin/smtp', requireAuth, async (req, res) => {
  const localConfig = readJSON(CONFIG_FILE);
  const config = await supabase.getConfig(localConfig);
  const smtp = config.smtp || {};

  res.json({
    configured: !!(smtp.host && smtp.user),
    verified: !!smtp.verified,
    host: smtp.host || '',
    port: smtp.port || 587,
    secure: !!smtp.secure,
    user: smtp.user || '',
    passMasked: smtp.pass ? '••••••••' : '',
    hasPassword: !!smtp.pass,
    fromName: smtp.fromName || 'ABENTRA International',
    fromEmail: smtp.fromEmail || 'info@abentra.com',
    lastVerifiedAt: smtp.lastVerifiedAt || null
  });
});

// POST /api/admin/smtp/save - Save SMTP configuration
app.post('/api/admin/smtp/save', requireAuth, async (req, res) => {
  const { host, port, secure, user, pass, fromName, fromEmail } = req.body;
  const localConfig = readJSON(CONFIG_FILE);
  const config = await supabase.getConfig(localConfig);

  const prevSmtp = config.smtp || {};
  const isCredentialChanged = (prevSmtp.host !== host || prevSmtp.user !== user || (pass && prevSmtp.pass !== pass) || prevSmtp.port !== (parseInt(port, 10) || 587));

  config.smtp = {
    host: host ? host.trim() : '',
    port: parseInt(port, 10) || 587,
    secure: !!secure,
    user: user ? user.trim() : '',
    pass: pass && pass !== '••••••••' ? pass : (prevSmtp.pass || ''),
    fromName: fromName ? fromName.trim() : 'ABENTRA International',
    fromEmail: fromEmail ? fromEmail.trim() : (user || 'info@abentra.com'),
    enabled: true,
    verified: isCredentialChanged ? false : (prevSmtp.verified || false),
    lastVerifiedAt: isCredentialChanged ? null : (prevSmtp.lastVerifiedAt || null)
  };

  await supabase.saveConfig(config);
  writeJSON(CONFIG_FILE, config);

  recordAuditLog('SMTP_CONFIG_SAVED', `Admin ${req.user.username} updated SMTP config (${config.smtp.host})`);

  res.json({
    success: true,
    message: isCredentialChanged ? 'SMTP ayarları kaydedildi. Lütfen bağlantıyı doğrulayın.' : 'SMTP ayarları güncellendi.',
    verified: config.smtp.verified
  });
});

// POST /api/admin/smtp/verify - Test and verify SMTP server connection
app.post('/api/admin/smtp/verify', requireAuth, async (req, res) => {
  const { host, port, secure, user, pass, fromName, fromEmail, testRecipient } = req.body;
  const localConfig = readJSON(CONFIG_FILE);
  const config = await supabase.getConfig(localConfig);
  const currentSmtp = config.smtp || {};

  const effectiveHost = host ? host.trim() : currentSmtp.host;
  const effectivePort = port ? (parseInt(port, 10) || 587) : (currentSmtp.port || 587);
  const effectiveSecure = secure !== undefined ? !!secure : (currentSmtp.secure || false);
  const effectiveUser = user ? user.trim() : currentSmtp.user;
  const effectivePass = (pass && pass !== '••••••••') ? pass : currentSmtp.pass;
  const effectiveFromName = fromName ? fromName.trim() : (currentSmtp.fromName || 'ABENTRA International');
  const effectiveFromEmail = fromEmail ? fromEmail.trim() : (currentSmtp.fromEmail || effectiveUser || 'info@abentra.com');

  if (!effectiveHost || !effectiveUser) {
    return res.status(400).json({ error: 'SMTP Sunucusu (Host) ve Kullanıcı Adı / E-Posta zorunludur.' });
  }

  try {
    const transporter = nodemailer.createTransport({
      host: effectiveHost,
      port: effectivePort,
      secure: effectiveSecure,
      auth: {
        user: effectiveUser,
        pass: effectivePass
      },
      connectionTimeout: 8000
    });

    // Test verify authentication & handshake
    await transporter.verify();

    // If test recipient provided, send a clean verification ping email
    if (testRecipient && testRecipient.includes('@')) {
      await transporter.sendMail({
        from: `"${effectiveFromName}" <${effectiveFromEmail}>`,
        to: testRecipient.trim(),
        subject: 'ABENTRA International — SMTP Bağlantı Doğrulama Testi',
        text: 'Tebrikler! ABENTRA Executive Portal SMTP bağlantınız başarıyla doğrulandı ve aktif hale getirildi.',
        html: `<div style="font-family:Arial,sans-serif;padding:24px;background:#0b1a33;color:#fff;border-radius:8px;">
          <h2 style="color:#e6c374;margin-top:0;">ABENTRA International</h2>
          <p>Tebrikler! SMTP sunucu yapılandırmanız başarıyla doğrulandı.</p>
          <p style="color:#a0aec0;font-size:12px;">Bu e-posta sistem yöneticisi tarafından gönderilen bir doğrulama mesajıdır.</p>
        </div>`
      });
    }

    // Persist verified state
    config.smtp = {
      host: effectiveHost,
      port: effectivePort,
      secure: effectiveSecure,
      user: effectiveUser,
      pass: effectivePass,
      fromName: effectiveFromName,
      fromEmail: effectiveFromEmail,
      enabled: true,
      verified: true,
      lastVerifiedAt: new Date().toISOString()
    };

    await supabase.saveConfig(config);
    writeJSON(CONFIG_FILE, config);

    recordAuditLog('SMTP_VERIFIED_SUCCESS', `Admin ${req.user.username} successfully verified SMTP (${effectiveHost})`);

    res.json({
      success: true,
      verified: true,
      message: 'SMTP bağlantısı başarıyla doğrulandı ve e-posta gönderimi aktif hale getirildi!'
    });
  } catch (err) {
    recordAuditLog('SMTP_VERIFY_FAILED', `SMTP verification failed for ${effectiveHost}: ${err.message}`);
    res.status(400).json({
      success: false,
      verified: false,
      error: 'SMTP Doğrulama Başarısız: ' + err.message
    });
  }
});

// POST /api/admin/emails/send - Dispatch an email and save to Supabase
app.post('/api/admin/emails/send', requireAuth, async (req, res) => {
  const { to, subject, body, templateName } = req.body;
  if (!to || !subject || !body) {
    return res.status(400).json({ error: 'Recipient email, subject, and message body are required.' });
  }

  const localConfig = readJSON(CONFIG_FILE);
  const config = await supabase.getConfig(localConfig);

  let status = 'Delivered via Portal';
  let errorDetails = null;

  if (config.smtp && config.smtp.enabled && config.smtp.host && config.smtp.user) {
    try {
      const transporter = nodemailer.createTransport({
        host: config.smtp.host,
        port: config.smtp.port || 587,
        secure: config.smtp.secure || false,
        auth: {
          user: config.smtp.user,
          pass: config.smtp.pass
        }
      });

      await transporter.sendMail({
        from: `"${config.smtp.fromName || 'ABENTRA International'}" <${config.smtp.fromEmail || config.smtp.user}>`,
        to,
        subject,
        text: body,
        html: `<div style="font-family: Arial, sans-serif; color: #1a202c; line-height: 1.6; max-width: 600px; padding: 24px; border: 1px solid #e2e8f0; border-radius: 8px;">
          <h2 style="color: #0a2038; border-bottom: 2px solid #c9a45c; padding-bottom: 10px;">ABENTRA International</h2>
          <div style="margin: 20px 0; white-space: pre-line;">${body}</div>
          <hr style="border: none; border-top: 1px solid #cbd5e0; margin-top: 30px;">
          <p style="font-size: 12px; color: #718096; margin-bottom: 0;">ABENTRA International · Camp Johnson Road & Clay Street, Monrovia, Liberia</p>
        </div>`
      });

      status = 'Delivered via SMTP';
    } catch (err) {
      status = 'Delivered via Portal';
      errorDetails = err.message;
      console.warn('SMTP dispatch note:', err.message);
    }
  }

  const sentRecord = {
    id: 'sent_' + Date.now().toString(36),
    to: to.trim(),
    subject: subject.trim(),
    body: body.trim(),
    template: templateName || 'Custom Email',
    sentAt: new Date().toISOString(),
    status,
    errorDetails
  };

  // 1. Save to Supabase
  await supabase.recordSentEmail(sentRecord);

  // 2. Local backup
  const emailsData = readJSON(EMAILS_FILE, { inbox: [], sent: [], templates: [] });
  emailsData.sent.unshift(sentRecord);
  const matching = emailsData.inbox.find(m => m.email.toLowerCase() === to.toLowerCase().trim());
  if (matching) {
    matching.replied = true;
    matching.read = true;
  }
  writeJSON(EMAILS_FILE, emailsData);

  res.json({
    success: true,
    message: status === 'Delivered via SMTP' ? 'Email sent successfully via SMTP!' : 'Email successfully logged and stored in Supabase archive.',
    record: sentRecord
  });
});

// POST /api/admin/emails/templates - Save or update email templates
app.post('/api/admin/emails/templates', requireAuth, (req, res) => {
  const { templates } = req.body;
  if (!Array.isArray(templates)) {
    return res.status(400).json({ error: 'Geçersiz şablon verisi.' });
  }
  const emailsData = readJSON(EMAILS_FILE, { inbox: [], sent: [], templates: [] });
  emailsData.templates = templates;
  writeJSON(EMAILS_FILE, emailsData);
  res.json({ success: true, message: 'Şablonlar başarıyla kaydedildi.', templates });
});

// Catch-all for SPA manager & management routes
app.get(/^\/moon\/(manager|Manager|management|managment)(\/.*)?$/, (req, res, next) => {
  if (path.extname(req.path)) {
    return next();
  }
  res.sendFile(path.join(__dirname, 'moon', 'manager', 'index.html'));
});

// Redirect legacy /admin catch-all to /moon/manager
app.get(/^\/admin(\/.*)?$/, (req, res) => {
  res.redirect('/moon/manager');
});

// Start server only when not running in Vercel serverless environment
if (process.env.VERCEL !== '1' && !process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`ABENTRA International Server running on http://localhost:${PORT}`);
    console.log(`Public Site: http://localhost:${PORT}/`);
    console.log(`Manager Portal: http://localhost:${PORT}/moon/manager`);
    console.log(`Original Site: http://localhost:${PORT}/original`);
    console.log(`Supabase Status: ${supabase.isConfigured() ? 'CONFIGURED' : 'NOT CONFIGURED (Using JSON fallback)'}`);
    console.log(`====================================================`);
  });
}

// Export Express app for Vercel Serverless Function
module.exports = app;
