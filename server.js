const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const multer = require('multer');
const nodemailer = require('nodemailer');
require('dotenv').config();

const supabase = require('./db/supabase');

const app = express();
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
const UPLOADS_DIR = path.join(__dirname, 'public', 'uploads');

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Multer storage for uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    cb(null, `${base}_${Date.now()}${ext}`);
  }
});
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB
});

// Helper functions for reading/writing local JSON (used as fallback/cache)
function readJSON(filePath, fallback = {}) {
  try {
    if (fs.existsSync(filePath)) {
      return JSON.parse(fs.readFileSync(filePath, 'utf8'));
    }
  } catch (err) {
    console.error(`Error reading ${filePath}:`, err);
  }
  return fallback;
}

function writeJSON(filePath, data) {
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error(`Error writing ${filePath}:`, err);
    return false;
  }
}

// Session store in-memory for admin tokens
const activeSessions = new Map();

function generateToken() {
  return crypto.randomBytes(32).toString('hex');
}

function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader ? authHeader.replace(/^Bearer\s+/, '') : req.query.token;

  if (!token || !activeSessions.has(token)) {
    return res.status(401).json({ error: 'Unauthorized. Please login to continue.' });
  }

  const session = activeSessions.get(token);
  // Check session expiration (12 hours)
  if (Date.now() - session.createdAt > 12 * 60 * 60 * 1000) {
    activeSessions.delete(token);
    return res.status(401).json({ error: 'Session expired. Please login again.' });
  }

  req.adminUser = session.user;
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
// PUBLIC ROUTES & APIS (Supabase-first)
// ==========================================

// Serve static assets
app.use(express.static(path.join(__dirname, 'public')));

// Fallback to original html if requested
app.get('/original', (req, res) => {
  res.sendFile(path.join(__dirname, 'ABENTRA International _ Bridging opportunities. Building tomorrow.html'));
});

// GET /api/site-data - Returns full public configuration and active sections
app.get('/api/site-data', async (req, res) => {
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
    sectionsViewed: []
  };

  // 1. Save to Supabase
  await supabase.trackVisit(visitor);

  // 2. Also keep local JSON backup
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

  logs.summary.totalVisits = (logs.summary.totalVisits || 0) + 1;
  logs.summary.pageViews = (logs.summary.pageViews || 0) + 1;
  logs.deviceStats[parsedUA.device] = (logs.deviceStats[parsedUA.device] || 0) + 1;
  logs.browserStats[parsedUA.browser] = (logs.browserStats[parsedUA.browser] || 0) + 1;

  // Track country statistics with Flag emoji
  const countryKey = `${geo.flag} ${geo.country}`;
  logs.countryStats[countryKey] = (logs.countryStats[countryKey] || 0) + 1;

  let existing = logs.visitors.find(v => v.id === visitorId);
  if (!existing) {
    logs.summary.uniqueVisitors = (logs.summary.uniqueVisitors || 0) + 1;
    logs.visitors.unshift(visitor);
    if (logs.visitors.length > 200) logs.visitors.pop();
  } else {
    existing.lastSeen = new Date().toISOString();
    existing.flag = geo.flag;
    existing.country = geo.country;
    existing.countryCode = geo.countryCode;
    existing.city = geo.city;
    existing.ip = geo.ip;
  }

  writeJSON(LOGS_FILE, logs);
  res.json({ success: true, visitorId, flag: geo.flag, country: geo.country, ip: geo.ip });
});

// POST /api/track/section - Track section views and duration with per-country breakdown
app.post('/api/track/section', async (req, res) => {
  const { visitorId, sectionId, durationSeconds } = req.body;
  if (!sectionId) return res.status(400).json({ error: 'Section ID required' });

  const addedSeconds = parseInt(durationSeconds) || 5;

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

// POST /api/contact - Public contact form submission saved to Supabase
app.post('/api/contact', async (req, res) => {
  const { name, email, phone, subject, service, message } = req.body;

  if (!name || !email || !message) {
    return res.status(400).json({ error: 'Name, email, and message are required.' });
  }

  const localConfig = readJSON(CONFIG_FILE);
  const config = await supabase.getConfig(localConfig);

  const newInquiry = {
    id: 'msg_' + Date.now().toString(36),
    name: name.trim(),
    email: email.trim(),
    phone: (phone || '').trim(),
    subject: (subject || 'New Inquiry from Abentra Portal').trim(),
    service: service || 'General Advisory',
    message: message.trim(),
    date: new Date().toISOString(),
    read: false,
    replied: false
  };

  // 1. Save to Supabase
  await supabase.addInquiry(newInquiry);

  // 2. Local JSON backup
  const emailsData = readJSON(EMAILS_FILE, { inbox: [], sent: [], templates: [] });
  emailsData.inbox.unshift(newInquiry);
  writeJSON(EMAILS_FILE, emailsData);

  // If SMTP is enabled, dispatch notification
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
        from: `"${config.smtp.fromName || 'ABENTRA'}" <${config.smtp.fromEmail || config.smtp.user}>`,
        to: config.contact?.email || 'abentrainternational@gmail.com',
        subject: `[ABENTRA Portal Inquiry] ${newInquiry.subject}`,
        text: `Name: ${name}\nEmail: ${email}\nPhone: ${phone}\nService: ${service}\n\nMessage:\n${message}`
      });
    } catch (mailErr) {
      console.warn('SMTP Dispatch notification failed:', mailErr.message);
    }
  }

  res.json({
    success: true,
    message: 'Your inquiry has been securely transmitted to ABENTRA International. Our leadership team will review and connect with you shortly.'
  });
});

// ==========================================
// ADMIN AUTHENTICATION APIS (Supabase-first)
// ==========================================

// POST /api/admin/login
app.post('/api/admin/login', async (req, res) => {
  const { username, password } = req.body;
  const localUsers = readJSON(USERS_FILE, { users: [] }).users;
  const user = await supabase.getUser(username || '', localUsers);

  const rawIp = getClientIp(req);
  const ua = req.headers['user-agent'] || '';
  const parsedUA = parseUserAgent(ua);
  const geo = await resolveIpGeo(rawIp);

  if (!user) {
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
    permissions = permissions || ['dashboard', 'logs', 'heatmap', 'export'];
  } else if (user.role === 'developer') {
    permissions = permissions || ['theme', 'content', 'sections', 'icons', 'logs', 'export'];
  } else if (user.role === 'admin') {
    permissions = permissions || ['dashboard', 'logs', 'sections', 'emails', 'content', 'export'];
  } else {
    permissions = permissions || ['dashboard', 'logs'];
  }

  // Update last login in Supabase if active
  await supabase.updateLastLogin(user.id);

  const token = generateToken();
  const sessionUser = {
    id: user.id,
    username: user.username,
    name: user.name,
    role: user.role,
    permissions,
    email: user.email,
    flag: geo.flag,
    ip: geo.ip || rawIp
  };

  activeSessions.set(token, {
    user: sessionUser,
    createdAt: Date.now()
  });

  res.json({
    success: true,
    token,
    user: sessionUser
  });
});

// POST /api/admin/logout
app.post('/api/admin/logout', (req, res) => {
  const token = (req.headers.authorization || '').replace(/^Bearer\s+/, '');
  if (token) activeSessions.delete(token);
  res.json({ success: true });
});

// GET /api/admin/me
app.get('/api/admin/me', requireAuth, (req, res) => {
  res.json({ user: req.adminUser });
});

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
  const localLogs = readJSON(LOGS_FILE);
  const localEmails = readJSON(EMAILS_FILE, { inbox: [] });

  const analytics = await supabase.getAnalytics({
    ...localLogs,
    summary: {
      ...localLogs.summary,
      unreadInquiries: (localEmails.inbox || []).filter(m => !m.read).length,
      totalInquiries: (localEmails.inbox || []).length
    }
  });

  res.json(analytics);
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

// POST /api/admin/metrics/purge - Granular metric-by-metric deletion and purge
app.post('/api/admin/metrics/purge', requireAuth, async (req, res) => {
  const { target } = req.body; // 'visitors', 'heatmap', 'geo', 'emails', 'audit', 'all'
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

  if (target === 'visitors' || target === 'all') {
    logs.visitors = [];
    logs.summary = {
      totalVisits: 0,
      uniqueVisitors: 0,
      pageViews: 0,
      avgDurationSeconds: 0,
      lastUpdated: new Date().toISOString()
    };
    if (supabase.isConfigured()) {
      try { await supabase.clearLogs(); } catch (e) {}
    }
  }

  if (target === 'heatmap' || target === 'all') {
    logs.sectionViews = {};
    logs.sectionTimeSeconds = {};
    logs.sectionCountryViews = {};
  }

  if (target === 'geo' || target === 'all') {
    logs.deviceStats = { Desktop: 0, Mobile: 0, Tablet: 0 };
    logs.browserStats = {};
    logs.countryStats = {};
  }

  if (target === 'emails' || target === 'all') {
    const existing = readJSON(EMAILS_FILE, {});
    writeJSON(EMAILS_FILE, {
      inbox: [],
      sent: [],
      templates: existing.templates || []
    });
  }

  if (target === 'audit' || target === 'all') {
    writeJSON(AUDIT_FILE, []);
  }

  writeJSON(LOGS_FILE, logs);

  res.json({
    success: true,
    target,
    message: `Seçilen metrikler (${target}) başarıyla temizlendi.`
  });
});

// GET /api/admin/metrics/export-csv - Detailed CSV telemetry export
app.get('/api/admin/metrics/export-csv', requireAuth, (req, res) => {
  const logs = readJSON(LOGS_FILE, {});
  const visitors = logs.visitors || [];
  const views = logs.sectionViews || {};
  const times = logs.sectionTimeSeconds || {};

  let csv = '\uFEFF'; // UTF-8 BOM for Excel
  csv += '=== ABENTRA INTERNATIONAL - YÖNETİCİ METRİK VE TELEMETRİ RAPORU ===\r\n';
  csv += `Rapor Tarihi: ${new Date().toLocaleString('tr-TR')}\r\n`;
  csv += `Oluşturan: ${req.adminUser ? req.adminUser.name : 'Yönetici'} (${req.adminUser ? req.adminUser.role : 'Admin'})\r\n\r\n`;

  csv += '--- GENEL ÖZET METRİKLER ---\r\n';
  csv += `Toplam Ziyaret,${logs.summary?.totalVisits || 0}\r\n`;
  csv += `Tekil Ziyaretçi,${logs.summary?.uniqueVisitors || 0}\r\n`;
  csv += `Sayfa Görüntüleme,${logs.summary?.pageViews || 0}\r\n`;
  csv += `Ortalama Kalış Süresi (sn),${logs.summary?.avgDurationSeconds || 0}\r\n\r\n`;

  csv += '--- BÖLÜM (SECTION) TELEMETRİSİ & ISI HARİTASI ---\r\n';
  csv += 'Bölüm Adı,Görüntüleme Sayısı,Kalış Süresi (sn)\r\n';
  for (const [sec, count] of Object.entries(views)) {
    csv += `"${sec}",${count},${times[sec] || 0}\r\n`;
  }
  csv += '\r\n';

  csv += '--- ÜLKE DAĞILIMI ---\r\n';
  csv += 'Ülke,Ziyaret Sayısı\r\n';
  for (const [cnt, count] of Object.entries(logs.countryStats || {})) {
    csv += `"${cnt}",${count}\r\n`;
  }
  csv += '\r\n';

  csv += '--- CİHAZ DAĞILIMI ---\r\n';
  csv += 'Cihaz Tipi,Ziyaret Sayısı\r\n';
  for (const [dev, count] of Object.entries(logs.deviceStats || {})) {
    csv += `"${dev}",${count}\r\n`;
  }
  csv += '\r\n';

  csv += '--- DETAYLI ZİYARETÇİ LOGLARI ---\r\n';
  csv += 'Ziyaretçi ID,IP Adresi,Bayrak,Ülke,Şehir,Cihaz,Tarayıcı,İşletim Sistemi,İlk Görülme,Son Görülme,Kalış Süresi (sn),Görüntülenen Bölümler\r\n';
  visitors.forEach(v => {
    const secList = (v.sectionsViewed || []).map(s => `${s.name} (${s.seconds}s)`).join('; ');
    csv += `"${v.id}","${v.ip}","${v.flag || ''}","${v.country || ''}","${v.city || ''}","${v.device || ''}","${v.browser || ''}","${v.os || ''}","${v.firstSeen || ''}","${v.lastSeen || ''}",${v.durationSeconds || 0},"${secList}"\r\n`;
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

  let logoUrl = `/uploads/${req.file.filename}`;

  // If Supabase is configured, upload to Supabase Storage Bucket
  if (supabase.isConfigured()) {
    try {
      const fileBuffer = fs.readFileSync(req.file.path);
      const cloudUrl = await supabase.uploadToBucket(fileBuffer, req.file.originalname, req.file.mimetype);
      if (cloudUrl) logoUrl = cloudUrl;
    } catch (e) {
      console.warn('Supabase storage upload skipped, using local upload:', e.message);
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
  emailsData.inbox = emailsData.inbox.filter(m => m.id !== req.params.id);
  writeJSON(EMAILS_FILE, emailsData);

  res.json({ success: true, message: 'Message removed from inbox.' });
});

// POST /api/admin/emails/send - Dispatch an email and save to Supabase
app.post('/api/admin/emails/send', requireAuth, async (req, res) => {
  const { to, subject, body, templateName } = req.body;
  if (!to || !subject || !body) {
    return res.status(400).json({ error: 'Recipient email, subject, and message body are required.' });
  }

  const localConfig = readJSON(CONFIG_FILE);
  const config = await supabase.getConfig(localConfig);

  let status = 'Delivered (Simulated)';
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
      status = 'Failed (Logged in Sent Archive)';
      errorDetails = err.message;
      console.warn('Real SMTP dispatch issue:', err.message);
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

// Catch-all for SPA admin routes
app.get(/^\/admin(\/.*)?$/, (req, res, next) => {
  if (path.extname(req.path)) {
    return next();
  }
  res.sendFile(path.join(__dirname, 'public', 'admin', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`ABENTRA International Server running on http://localhost:${PORT}`);
  console.log(`Public Site: http://localhost:${PORT}/`);
  console.log(`Admin Portal: http://localhost:${PORT}/admin`);
  console.log(`Original Site: http://localhost:${PORT}/original`);
  console.log(`Supabase Status: ${supabase.isConfigured() ? 'CONFIGURED' : 'NOT CONFIGURED (Using JSON fallback)'}`);
  console.log(`====================================================`);
});
