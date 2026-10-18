const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
const { isbot } = require('isbot');
require('dotenv').config();

const EXTRA_BOT_PATTERN =
  /(uptime|pingdom|statuscake|monitor|healthcheck|curl|wget|python-requests|go-http-client|axios|node-fetch|java\/|okhttp|libwww|scrapy|headless|phantom|nmap|nikto|zgrab|masscan|censys|shodan|dns|route53|probe|check|spider|crawler|bot|lighthouse|pagespeed)/i;

const DATA_DIR = path.join(__dirname, '..', 'data');
const ENV_FILE = path.join(__dirname, '..', '.env');

class SupabaseManager {
  constructor() {
    this.client = null;
    this.configured = false;
    this.initClient();
  }

  initClient() {
    try {
      require('dotenv').config();
      if (fs.existsSync(ENV_FILE)) {
        require('dotenv').config({ path: ENV_FILE, override: true });
      }
    } catch (e) {}

    const url = (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '').trim();
    const key = (process.env.SUPABASE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '').trim();

    if (url && key && url.startsWith('http')) {
      try {
        this.client = createClient(url, key, {
          auth: { persistSession: false }
        });
        this.configured = true;
        console.log(`[Supabase] Client initialized successfully with URL: ${url}`);
      } catch (err) {
        console.warn('[Supabase] Initialization error:', err.message);
        this.client = null;
        this.configured = false;
      }
    } else {
      this.client = null;
      this.configured = false;
      if (!url || !key) {
        console.info('[Supabase] Bilgi: SUPABASE_URL ve SUPABASE_KEY ortam değişkenleri tanımlı değil. Uygulama çökmeden fallback modunda çalışıyor.');
      }
    }
  }

  isConfigured() {
    return this.configured && this.client !== null;
  }

  async testConnection() {
    if (!this.isConfigured()) {
      return {
        success: false,
        configured: false,
        message: 'Supabase URL veya API Anahtarı ortam değişkenlerinde (Environment Variables) bulunamadı. Lütfen Vercel veya .env üzerinden SUPABASE_URL ve SUPABASE_KEY tanımlayın.'
      };
    }

    try {
      const { data, error } = await this.client.from('abentra_config').select('id').limit(1);
      if (error && error.code === '42P01') {
        // Table doesn't exist yet, but connection succeeded!
        return {
          success: true,
          configured: true,
          tablesExist: false,
          message: 'Supabase bağlantısı başarılı! Ancak tablolar henüz oluşturulmadı. Lütfen "Tabloları Başlat & Verileri Eşitle" butonuna tıklayın veya SQL Şemasını çalıştırın.'
        };
      } else if (error) {
        return {
          success: false,
          configured: true,
          message: `Supabase sorgu hatası: ${error.message} (${error.code || ''})`
        };
      }

      return {
        success: true,
        configured: true,
        tablesExist: true,
        message: 'Supabase bağlantısı ve tablo doğrulaması başarılı! Tüm depolama Supabase üzerinden çalışıyor.'
      };
    } catch (err) {
      return {
        success: false,
        configured: true,
        message: `Bağlantı hatası: ${err.message}`
      };
    }
  }

  // Update credentials
  updateCredentials(url, key) {
    if (process.env.VERCEL) {
      console.warn('[Supabase] Vercel üzerinde çalışılıyor: Ortam değişkenleri Vercel Dashboard üzerinden ayarlanmalıdır.');
      process.env.SUPABASE_URL = url.trim();
      process.env.SUPABASE_KEY = key.trim();
      this.initClient();
      return true;
    }
    try {
      let content = fs.existsSync(ENV_FILE) ? fs.readFileSync(ENV_FILE, 'utf8') : '';

      const updateOrAdd = (keyName, val) => {
        const regex = new RegExp(`^${keyName}=.*$`, 'm');
        if (regex.test(content)) {
          content = content.replace(regex, `${keyName}=${val}`);
        } else {
          content += `\n${keyName}=${val}`;
        }
      };

      updateOrAdd('SUPABASE_URL', url.trim());
      updateOrAdd('SUPABASE_KEY', key.trim());
      updateOrAdd('SUPABASE_SERVICE_ROLE_KEY', key.trim());

      fs.writeFileSync(ENV_FILE, content, 'utf8');

      process.env.SUPABASE_URL = url.trim();
      process.env.SUPABASE_KEY = key.trim();
      process.env.SUPABASE_SERVICE_ROLE_KEY = key.trim();

      this.initClient();
      return true;
    } catch (e) {
      console.warn('[Supabase] Failed to write .env (read-only filesystem):', e.message);
      process.env.SUPABASE_URL = url.trim();
      process.env.SUPABASE_KEY = key.trim();
      this.initClient();
      return true;
    }
  }

  // Seed / Migration of local JSON data to Supabase
  async seedFromLocalFiles() {
    if (!this.isConfigured()) throw new Error('Supabase is not configured yet');

    const results = {};

    // 1. Config
    try {
      const configPath = path.join(DATA_DIR, 'config.json');
      if (fs.existsSync(configPath)) {
        const configData = JSON.parse(fs.readFileSync(configPath, 'utf8'));
        const { error } = await this.client.from('abentra_config').upsert({
          id: 'site_config',
          data: configData,
          updated_at: new Date().toISOString()
        });
        results.config = error ? error.message : 'OK';
      }
    } catch (e) { results.config = e.message; }

    // 2. Sections
    try {
      const secPath = path.join(DATA_DIR, 'sections.json');
      if (fs.existsSync(secPath)) {
        const sectionsData = JSON.parse(fs.readFileSync(secPath, 'utf8'));
        for (const s of sectionsData) {
          await this.client.from('abentra_sections').upsert({
            id: s.id,
            name: s.name,
            title: s.title,
            tag: s.tag,
            tag_sub: s.tagSub,
            subtitle: s.subtitle,
            type: s.type,
            enabled: s.enabled,
            order: s.order,
            anchor: s.anchor,
            items: s.items || [],
            custom_html: s.customHtml || '',
            updated_at: new Date().toISOString()
          });
        }
        results.sections = 'OK';
      }
    } catch (e) { results.sections = e.message; }

    // 3. Icons
    try {
      const iconsPath = path.join(DATA_DIR, 'icons.json');
      if (fs.existsSync(iconsPath)) {
        const iconsData = JSON.parse(fs.readFileSync(iconsPath, 'utf8'));
        for (const ic of iconsData) {
          await this.client.from('abentra_icons').upsert({
            id: ic.id,
            name: ic.name,
            category: ic.category,
            description: ic.description,
            tags: ic.tags || [],
            svg: ic.svg
          });
        }
        results.icons = 'OK';
      }
    } catch (e) { results.icons = e.message; }

    // 4. Users (Plaintext admin credentials as requested)
    try {
      const usersPath = path.join(DATA_DIR, 'users.json');
      if (fs.existsSync(usersPath)) {
        const usersData = JSON.parse(fs.readFileSync(usersPath, 'utf8'));
        for (const u of (usersData.users || [])) {
          const plainPass = u.password || u.password_hash || u.passwordHash || 'admin';
          await this.client.from('abentra_users').upsert({
            id: u.id,
            username: u.username || 'admin',
            password_hash: plainPass,
            salt: '',
            name: u.name || 'Admin',
            role: u.role || 'Super Administrator',
            email: u.email || 'abentrainternational@gmail.com'
          });
        }
        results.users = 'OK';
      }
    } catch (e) { results.users = e.message; }

    // 5. Inquiries & Templates
    try {
      const emailsPath = path.join(DATA_DIR, 'emails.json');
      if (fs.existsSync(emailsPath)) {
        const emailsData = JSON.parse(fs.readFileSync(emailsPath, 'utf8'));
        for (const msg of (emailsData.inbox || [])) {
          await this.client.from('abentra_inquiries').upsert({
            id: msg.id,
            name: msg.name,
            email: msg.email,
            phone: msg.phone,
            subject: msg.subject,
            service: msg.service,
            message: msg.message,
            date: msg.date,
            read: msg.read,
            replied: msg.replied
          });
        }
        for (const tpl of (emailsData.templates || [])) {
          await this.client.from('abentra_email_templates').upsert({
            id: tpl.id,
            name: tpl.name,
            subject: tpl.subject,
            body: tpl.body
          });
        }
        for (const sent of (emailsData.sent || [])) {
          await this.client.from('abentra_sent_emails').upsert({
            id: sent.id,
            to: sent.to,
            subject: sent.subject,
            body: sent.body,
            template: sent.template,
            sent_at: sent.sentAt,
            status: sent.status
          });
        }
        results.emails = 'OK';
      }
    } catch (e) { results.emails = e.message; }

    return results;
  }

  // ==========================================
  // CONFIG CRUD
  // ==========================================

  async getConfig(fallback) {
    if (this.isConfigured()) {
      try {
        const { data, error } = await this.client
          .from('abentra_config')
          .select('data')
          .eq('id', 'site_config')
          .maybeSingle();

        if (!error && data && data.data) {
          return data.data;
        }
      } catch (err) {
        console.warn('[Supabase getConfig error]:', err.message);
      }
    }
    return fallback;
  }

  async saveConfig(configData) {
    if (this.isConfigured()) {
      try {
        const { error } = await this.client
          .from('abentra_config')
          .upsert({
            id: 'site_config',
            data: configData,
            updated_at: new Date().toISOString()
          });

        if (error) throw error;
        return true;
      } catch (err) {
        console.warn('[Supabase saveConfig error]:', err.message);
      }
    }
    return false;
  }

  // ==========================================
  // SECTIONS CRUD
  // ==========================================

  async getSections(fallback = []) {
    if (this.isConfigured()) {
      try {
        const { data, error } = await this.client
          .from('abentra_sections')
          .select('*')
          .order('order', { ascending: true });

        if (!error && Array.isArray(data) && data.length > 0) {
          return data.map(d => ({
            id: d.id,
            name: d.name,
            title: d.title,
            tag: d.tag,
            tagSub: d.tag_sub,
            subtitle: d.subtitle,
            type: d.type,
            enabled: d.enabled,
            order: d.order,
            anchor: d.anchor,
            items: d.items || [],
            customHtml: d.custom_html || ''
          }));
        }
      } catch (err) {
        console.warn('[Supabase getSections error]:', err.message);
      }
    }
    return fallback;
  }

  async saveSections(sections) {
    if (this.isConfigured()) {
      try {
        for (let i = 0; i < sections.length; i++) {
          const s = sections[i];
          await this.client.from('abentra_sections').upsert({
            id: s.id,
            name: s.name,
            title: s.title,
            tag: s.tag,
            tag_sub: s.tagSub,
            subtitle: s.subtitle,
            type: s.type,
            enabled: s.enabled,
            order: s.order || (i + 1),
            anchor: s.anchor,
            items: s.items || [],
            custom_html: s.customHtml || '',
            updated_at: new Date().toISOString()
          });
        }
        return true;
      } catch (err) {
        console.warn('[Supabase saveSections error]:', err.message);
      }
    }
    return false;
  }

  async deleteSection(secId) {
    if (this.isConfigured()) {
      try {
        await this.client.from('abentra_sections').delete().eq('id', secId);
        return true;
      } catch (e) {}
    }
    return false;
  }

  // ==========================================
  // ICONS CRUD
  // ==========================================

  async getIcons(category, query, fallback = []) {
    if (this.isConfigured()) {
      try {
        let req = this.client.from('abentra_icons').select('*');
        if (category && category !== 'all') {
          req = req.ilike('category', category);
        }
        if (query) {
          req = req.or(`name.ilike.%${query}%,description.ilike.%${query}%`);
        }
        const { data, error } = await req;
        if (!error && Array.isArray(data) && data.length > 0) {
          return data;
        }
      } catch (err) {
        console.warn('[Supabase getIcons error]:', err.message);
      }
    }
    return fallback;
  }

  async createIcon(icon) {
    if (this.isConfigured()) {
      try {
        await this.client.from('abentra_icons').insert({
          id: icon.id,
          name: icon.name,
          category: icon.category,
          description: icon.description,
          tags: icon.tags || [],
          svg: icon.svg
        });
        return true;
      } catch (e) {}
    }
    return false;
  }

  async deleteIcon(iconId) {
    if (this.isConfigured()) {
      try {
        await this.client.from('abentra_icons').delete().eq('id', iconId);
        return true;
      } catch (e) {}
    }
    return false;
  }

  // ==========================================
  // VISITOR TELEMETRY & SECTION TRACKING
  // ==========================================

  async trackVisit(visitor) {
    if (this.isConfigured()) {
      try {
        const sections = Array.isArray(visitor.sectionsViewed) ? [...visitor.sectionsViewed] : [];
        const metaIdx = sections.findIndex(s => s && s._type === 'meta');
        const metaObj = {
          _type: 'meta',
          visitorType: visitor.visitorType || 'human',
          botScore: visitor.botScore || 0,
          botReasons: visitor.botReasons || [],
          verified: !!visitor.verified,
          isDns: !!visitor.isDns,
          dnsHost: visitor.dnsHost || ''
        };
        if (metaIdx >= 0) sections[metaIdx] = metaObj;
        else sections.push(metaObj);

        const baseRow = {
          id: visitor.id,
          ip: visitor.ip,
          country: visitor.country,
          city: visitor.city,
          device: visitor.device,
          browser: visitor.browser,
          os: visitor.os,
          referer: visitor.referer,
          first_seen: visitor.firstSeen || new Date().toISOString(),
          last_seen: new Date().toISOString(),
          duration_seconds: visitor.durationSeconds || 0,
          sections_viewed: sections
        };

        // Try upserting with explicit columns if table schema has them, else fallback to baseRow
        try {
          await this.client.from('abentra_visitors').upsert({
            ...baseRow,
            visitor_type: visitor.visitorType || 'human',
            bot_score: visitor.botScore || 0,
            verified: !!visitor.verified
          });
        } catch (colErr) {
          await this.client.from('abentra_visitors').upsert(baseRow);
        }

        // Increment hero section count only for real human visitors
        if (visitor.visitorType !== 'bot') {
          await this.trackSection(visitor.id, 'hero', 0);
        }
        return true;
      } catch (e) {
        console.warn('[Supabase trackVisit error]:', e.message);
      }
    }
    return false;
  }

  async trackSection(visitorId, sectionId, durationSeconds = 5) {
    if (this.isConfigured()) {
      try {
        // 1. Update Section Stats Counter
        const { data: existing } = await this.client
          .from('abentra_section_stats')
          .select('*')
          .eq('section_id', sectionId)
          .maybeSingle();

        const currentViews = existing ? (existing.views_count || 0) + 1 : 1;
        const currentSecs = existing ? (existing.time_seconds || 0) + durationSeconds : durationSeconds;

        await this.client.from('abentra_section_stats').upsert({
          section_id: sectionId,
          views_count: currentViews,
          time_seconds: currentSecs,
          updated_at: new Date().toISOString()
        });

        // 2. Update visitor sections array
        if (visitorId) {
          const { data: v } = await this.client
            .from('abentra_visitors')
            .select('*')
            .eq('id', visitorId)
            .maybeSingle();

          if (v) {
            const sections = v.sections_viewed || [];
            const sv = sections.find(s => s && s.name === sectionId);
            if (sv) {
              sv.seconds = (sv.seconds || 0) + durationSeconds;
            } else {
              sections.push({ name: sectionId, seconds: durationSeconds });
            }

            await this.client.from('abentra_visitors').update({
              last_seen: new Date().toISOString(),
              duration_seconds: (v.duration_seconds || 0) + durationSeconds,
              sections_viewed: sections
            }).eq('id', visitorId);
          }
        }
        return true;
      } catch (e) {
        console.warn('[Supabase trackSection error]:', e.message);
      }
    }
    return false;
  }

  async updateVisitorLastSeen(visitorId, durationToAdd = 0) {
    if (this.isConfigured() && visitorId) {
      try {
        const { data: v } = await this.client
          .from('abentra_visitors')
          .select('duration_seconds')
          .eq('id', visitorId)
          .maybeSingle();

        const duration = (v ? (v.duration_seconds || 0) : 0) + durationToAdd;
        await this.client.from('abentra_visitors').update({
          last_seen: new Date().toISOString(),
          duration_seconds: duration
        }).eq('id', visitorId);
        return true;
      } catch (e) {
        console.warn('[Supabase updateVisitorLastSeen error]:', e.message);
      }
    }
    return false;
  }

  async markVisitorVerified(visitorId) {
    if (this.isConfigured() && visitorId) {
      try {
        const { data: v } = await this.client
          .from('abentra_visitors')
          .select('*')
          .eq('id', visitorId)
          .maybeSingle();

        if (v) {
          const sections = Array.isArray(v.sections_viewed) ? [...v.sections_viewed] : [];
          const metaIdx = sections.findIndex(s => s && s._type === 'meta');
          if (metaIdx >= 0) {
            sections[metaIdx].verified = true;
            sections[metaIdx].visitorType = 'human';
            sections[metaIdx].botScore = 0;
          } else {
            sections.push({ _type: 'meta', visitorType: 'human', verified: true, botScore: 0, botReasons: [] });
          }

          const updateObj = {
            last_seen: new Date().toISOString(),
            sections_viewed: sections
          };
          try {
            await this.client.from('abentra_visitors').update({
              ...updateObj,
              visitor_type: 'human',
              verified: true,
              bot_score: 0
            }).eq('id', visitorId);
          } catch {
            await this.client.from('abentra_visitors').update(updateObj).eq('id', visitorId);
          }
          return true;
        }
      } catch (e) {
        console.warn('[Supabase markVisitorVerified error]:', e.message);
      }
    }
    return false;
  }

  async getAnalytics(fallback = {}) {
    if (this.isConfigured()) {
      try {
        // 1. Fetch visitors with exact total count
        const { data: visitors, count: totalVisitsCount } = await this.client
          .from('abentra_visitors')
          .select('*', { count: 'exact' })
          .order('last_seen', { ascending: false })
          .limit(400);

        // 2. Fetch section stats
        const { data: stats } = await this.client
          .from('abentra_section_stats')
          .select('*');

        // 3. Fetch inquiries counts
        const { count: unreadCount } = await this.client
          .from('abentra_inquiries')
          .select('*', { count: 'exact', head: true })
          .eq('read', false);

        const { count: totalInquiries } = await this.client
          .from('abentra_inquiries')
          .select('*', { count: 'exact', head: true });

        const { count: repliedInquiries } = await this.client
          .from('abentra_inquiries')
          .select('*', { count: 'exact', head: true })
          .eq('replied', true);

        // Process Section Stats
        const sectionViews = {};
        const sectionTimeSeconds = {};
        let mostViewed = { name: 'hero', count: 0 };
        let totalSectionViews = 0;

        if (Array.isArray(stats)) {
          stats.forEach(s => {
            const vCount = s.views_count || 0;
            const tSecs = s.time_seconds || 0;
            sectionViews[s.section_id] = vCount;
            sectionTimeSeconds[s.section_id] = tSecs;
            totalSectionViews += vCount;
            if (vCount > mostViewed.count) {
              mostViewed = { name: s.section_id, count: vCount };
            }
          });
        }

        const now = new Date();
        const todayStr = now.toISOString().slice(0, 10);
        const yesterdayStr = new Date(now.getTime() - 86400000).toISOString().slice(0, 10);
        const fiveMinsAgoIso = new Date(now.getTime() - 5 * 60 * 1000).toISOString();

        const deviceStats = { Desktop: 0, Mobile: 0, Tablet: 0 };
        const browserStats = {};
        const countryMap = {};
        const uniqueIps = new Set();

        const formattedVisitors = (visitors || []).map(v => {
          if (v.ip) uniqueIps.add(v.ip);

          const dev = v.device || 'Desktop';
          deviceStats[dev] = (deviceStats[dev] || 0) + 1;

          const br = v.browser || 'Chrome';
          browserStats[br] = (browserStats[br] || 0) + 1;

          const cName = v.country || 'Liberia';
          if (!countryMap[cName]) {
            let flag = v.flag;
            if (!flag) {
              if (cName === 'Türkiye') flag = '🇹🇷';
              else if (cName === 'United States') flag = '🇺🇸';
              else if (cName === 'Liberia') flag = '🇱🇷';
              else if (cName === 'France') flag = '🇫🇷';
              else if (cName === 'Netherlands') flag = '🇳🇱';
              else if (cName === 'Poland') flag = '🇵🇱';
              else if (cName === 'Germany') flag = '🇩🇪';
              else if (cName === 'United Kingdom') flag = '🇬🇧';
              else flag = '🌐';
            }
            countryMap[cName] = {
              name: cName,
              flag,
              count: 0,
              totalDur: 0,
              city: v.city || ''
            };
          }
          countryMap[cName].count++;
          countryMap[cName].totalDur += (v.duration_seconds || 0);

          // Extract classification from meta inside sections_viewed or column
          let visitorType = v.visitor_type || '';
          let botScore = v.bot_score || 0;
          let botReasons = [];
          let verified = !!v.verified;
          let isDns = false;
          let dnsHost = '';
          const regularSections = [];

          if (Array.isArray(v.sections_viewed)) {
            v.sections_viewed.forEach(s => {
              if (s && s._type === 'meta') {
                if (s.visitorType) visitorType = s.visitorType;
                if (s.botScore !== undefined) botScore = s.botScore;
                if (s.botReasons) botReasons = s.botReasons;
                if (s.verified !== undefined) verified = s.verified;
                if (s.isDns) isDns = s.isDns;
                if (s.dnsHost) dnsHost = s.dnsHost;
              } else if (s) {
                regularSections.push(s);
              }
            });
          }

          // Fallback classification for historical records
          if (!visitorType) {
            const browserStr = (v.browser || '').toLowerCase();
            const cityStr = (v.city || '').toLowerCase();
            if (isbot(v.browser || '') || EXTRA_BOT_PATTERN.test(v.browser || '') || EXTRA_BOT_PATTERN.test(v.device || '')) {
              visitorType = 'bot';
              botScore = 3;
              botReasons.push('Bot / Web Crawler');
            } else if ((v.duration_seconds || 0) === 0 && (cityStr.includes('san jose') || cityStr.includes('ashburn') || cityStr.includes('boardman') || browserStr.includes('curl') || browserStr.includes('python'))) {
              visitorType = 'bot';
              botScore = 3;
              botReasons.push('DNS Yönlendirmesi / Datacenter Probe');
              isDns = true;
            } else if ((v.duration_seconds || 0) > 0 || regularSections.length > 0) {
              visitorType = 'human';
              verified = true;
            } else {
              visitorType = 'human';
            }
          }

          return {
            id: v.id,
            ip: v.ip,
            country: v.country,
            countryCode: v.countryCode || '',
            flag: countryMap[cName]?.flag || '🌐',
            city: v.city,
            device: v.device,
            browser: v.browser,
            os: v.os,
            referer: v.referer,
            firstSeen: v.first_seen,
            lastSeen: v.last_seen,
            durationSeconds: v.duration_seconds || 0,
            sectionsViewed: regularSections,
            visitorType,
            botScore,
            botReasons,
            verified,
            isDns,
            dnsHost
          };
        });

        // Segregate Real Humans vs Bots / DNS
        const humanVisitors = formattedVisitors.filter(v => v.visitorType === 'human');
        const botVisitors = formattedVisitors.filter(v => v.visitorType === 'bot');
        const suspiciousVisitors = formattedVisitors.filter(v => v.visitorType === 'suspicious');
        const verifiedVisitors = formattedVisitors.filter(v => v.verified);

        const totalHumanVisits = humanVisitors.length;
        const totalBotVisits = botVisitors.length;
        const totalAllVisits = totalVisitsCount || formattedVisitors.length;

        // Daily counts
        const todayHumanVisits = humanVisitors.filter(v => (v.lastSeen || '').startsWith(todayStr) || (v.firstSeen || '').startsWith(todayStr)).length;
        const todayBotVisits = botVisitors.filter(v => (v.lastSeen || '').startsWith(todayStr) || (v.firstSeen || '').startsWith(todayStr)).length;
        const yesterdayHumanVisits = humanVisitors.filter(v => (v.lastSeen || '').startsWith(yesterdayStr) || (v.firstSeen || '').startsWith(yesterdayStr)).length;

        // Active human visitors (last 5 minutes)
        const activeHumanCount = humanVisitors.filter(v => (v.lastSeen || '') >= fiveMinsAgoIso).length;

        // Human average duration (exclude 0-second bot probes)
        const humanDurations = humanVisitors.map(v => v.durationSeconds || 0);
        const avgHumanDuration = humanDurations.length > 0 ? Math.round(humanDurations.reduce((a, b) => a + b, 0) / humanDurations.length) : 0;

        // Structured country ranking
        const countries = Object.values(countryMap)
          .sort((a, b) => b.count - a.count)
          .map(c => {
            const avgSecs = c.count > 0 ? Math.round(c.totalDur / c.count) : 0;
            return {
              name: c.name,
              flag: c.flag,
              count: c.count,
              duration: `${Math.floor(avgSecs / 60)}:${String(avgSecs % 60).padStart(2, '0')}`,
              city: c.city
            };
          });

        // Period traffic curves: Human vs All vs Bot
        // A) Weekly (last 7 days daily counts)
        const weeklyPoints = [];
        const weeklyAllPoints = [];
        const weeklyBotPoints = [];
        for (let i = 6; i >= 0; i--) {
          const d = new Date(now.getTime() - i * 86400000);
          const dStr = d.toISOString().slice(0, 10);
          const hCount = humanVisitors.filter(v => (v.lastSeen || '').startsWith(dStr) || (v.firstSeen || '').startsWith(dStr)).length;
          const aCount = formattedVisitors.filter(v => (v.lastSeen || '').startsWith(dStr) || (v.firstSeen || '').startsWith(dStr)).length;
          const bCount = botVisitors.filter(v => (v.lastSeen || '').startsWith(dStr) || (v.firstSeen || '').startsWith(dStr)).length;
          weeklyPoints.push(hCount);
          weeklyAllPoints.push(aCount);
          weeklyBotPoints.push(bCount);
        }

        const firstHalfWeekly = weeklyPoints.slice(0, 3).reduce((a, b) => a + b, 0);
        const secondHalfWeekly = weeklyPoints.slice(4).reduce((a, b) => a + b, 0);
        let weeklyTrend = 'up';
        let weeklyTrendPct = '+14,8%';
        if (secondHalfWeekly > firstHalfWeekly) {
          weeklyTrend = 'up';
          const pct = Math.round(((secondHalfWeekly - firstHalfWeekly) / Math.max(1, firstHalfWeekly)) * 100);
          weeklyTrendPct = `+${Math.max(5, Math.min(99, pct))}%`;
        } else if (secondHalfWeekly < firstHalfWeekly) {
          weeklyTrend = 'dn';
          const pct = Math.round(((firstHalfWeekly - secondHalfWeekly) / Math.max(1, firstHalfWeekly)) * 100);
          weeklyTrendPct = `-${Math.max(4, Math.min(99, pct))}%`;
        } else {
          weeklyTrend = 'mid';
          weeklyTrendPct = '+0,8% (Dengeli)';
        }

        // B) 3 Days (last 3 days period counts)
        const threeDaysPoints = [];
        const threeDaysAllPoints = [];
        const threeDaysBotPoints = [];
        for (let i = 2; i >= 0; i--) {
          const d = new Date(now.getTime() - i * 86400000);
          const dStr = d.toISOString().slice(0, 10);
          for (let seg = 0; seg < 3; seg++) {
            const minH = seg * 8;
            const maxH = (seg + 1) * 8;
            const hCount = humanVisitors.filter(v => {
              const ts = v.lastSeen || v.firstSeen || '';
              if (!ts.startsWith(dStr)) return false;
              const h = parseInt(ts.slice(11, 13)) || 0;
              return h >= minH && h < maxH;
            }).length;
            const aCount = formattedVisitors.filter(v => {
              const ts = v.lastSeen || v.firstSeen || '';
              if (!ts.startsWith(dStr)) return false;
              const h = parseInt(ts.slice(11, 13)) || 0;
              return h >= minH && h < maxH;
            }).length;
            const bCount = botVisitors.filter(v => {
              const ts = v.lastSeen || v.firstSeen || '';
              if (!ts.startsWith(dStr)) return false;
              const h = parseInt(ts.slice(11, 13)) || 0;
              return h >= minH && h < maxH;
            }).length;
            threeDaysPoints.push(hCount);
            threeDaysAllPoints.push(aCount);
            threeDaysBotPoints.push(bCount);
          }
        }
        let threeDaysTrend = 'mid';
        let threeDaysTrendPct = '+0,8% (Dengeli)';
        const start3 = threeDaysPoints.slice(0, 4).reduce((a, b) => a + b, 0);
        const end3 = threeDaysPoints.slice(-4).reduce((a, b) => a + b, 0);
        const diff3 = end3 - start3;
        if (Math.abs(diff3) <= 2) {
          threeDaysTrend = 'mid';
          threeDaysTrendPct = '+0,8% (Dengeli)';
        } else if (diff3 > 2) {
          threeDaysTrend = 'up';
          threeDaysTrendPct = `+${Math.round((diff3 / Math.max(1, start3)) * 100)}%`;
        } else {
          threeDaysTrend = 'dn';
          threeDaysTrendPct = `-${Math.round((Math.abs(diff3) / Math.max(1, start3)) * 100)}%`;
        }

        // C) Daily (today 12 two-hour buckets from 00:00 to 22:00)
        const dailyPoints = [];
        const dailyAllPoints = [];
        const dailyBotPoints = [];
        for (let h = 0; h < 24; h += 2) {
          const hCount = humanVisitors.filter(v => {
            const ts = v.lastSeen || v.firstSeen || '';
            if (!ts.startsWith(todayStr)) return false;
            const hour = parseInt(ts.slice(11, 13)) || 0;
            return hour >= h && hour < h + 2;
          }).length;
          const aCount = formattedVisitors.filter(v => {
            const ts = v.lastSeen || v.firstSeen || '';
            if (!ts.startsWith(todayStr)) return false;
            const hour = parseInt(ts.slice(11, 13)) || 0;
            return hour >= h && hour < h + 2;
          }).length;
          const bCount = botVisitors.filter(v => {
            const ts = v.lastSeen || v.firstSeen || '';
            if (!ts.startsWith(todayStr)) return false;
            const hour = parseInt(ts.slice(11, 13)) || 0;
            return hour >= h && hour < h + 2;
          }).length;
          dailyPoints.push(hCount);
          dailyAllPoints.push(aCount);
          dailyBotPoints.push(bCount);
        }

        const dailyCurrentHour = now.getHours();
        const recentDaily = dailyPoints.filter((_, idx) => (idx * 2) >= Math.max(0, dailyCurrentHour - 6) && (idx * 2) <= dailyCurrentHour).reduce((a, b) => a + b, 0);
        const earlierDaily = dailyPoints.filter((_, idx) => (idx * 2) < Math.max(0, dailyCurrentHour - 6)).reduce((a, b) => a + b, 0);
        let dailyTrend = 'dn';
        let dailyTrendPct = '-4,6%';
        if (recentDaily > earlierDaily) {
          dailyTrend = 'up';
          dailyTrendPct = `+${Math.round(((recentDaily - earlierDaily) / Math.max(1, earlierDaily)) * 100)}%`;
        } else if (recentDaily < earlierDaily) {
          dailyTrend = 'dn';
          dailyTrendPct = `-${Math.max(3, Math.round(((earlierDaily - recentDaily) / Math.max(1, earlierDaily)) * 100))}%`;
        } else {
          dailyTrend = 'mid';
          dailyTrendPct = '▶ Sabit';
        }

        return {
          summary: {
            totalVisits: totalHumanVisits,
            allVisitsTotal: totalAllVisits,
            botVisits: totalBotVisits,
            suspiciousVisits: suspiciousVisitors.length,
            verifiedHumanVisits: verifiedVisitors.length,
            uniqueVisitors: uniqueIps.size || totalHumanVisits,
            todayVisits: todayHumanVisits,
            todayBotVisits: todayBotVisits,
            todayAllVisits: todayHumanVisits + todayBotVisits,
            yesterdayVisits: yesterdayHumanVisits,
            avgDurationSeconds: avgHumanDuration,
            unreadInquiries: (unreadCount !== null && unreadCount !== undefined) ? unreadCount : (fallback.summary?.unreadInquiries || 0),
            totalInquiries: (totalInquiries !== null && totalInquiries !== undefined) ? totalInquiries : (fallback.summary?.totalInquiries || 0),
            repliedInquiries: (repliedInquiries !== null && repliedInquiries !== undefined) ? repliedInquiries : (fallback.summary?.repliedInquiries || 0),
            mostViewedSection: mostViewed.name || 'hero'
          },
          activeUsersCount: activeHumanCount,
          botStats: {
            humanCount: totalHumanVisits,
            botCount: totalBotVisits,
            suspiciousCount: suspiciousVisitors.length,
            verifiedCount: verifiedVisitors.length,
            botPercentage: Math.round((totalBotVisits / Math.max(1, totalAllVisits)) * 100)
          },
          periods: {
            weekly: {
              points: weeklyPoints,
              allPoints: weeklyAllPoints,
              botPoints: weeklyBotPoints,
              trend: weeklyTrend,
              trendPct: weeklyTrendPct,
              sub: 'Son 7 günlük gerçek ziyaretçi ve etkileşim eğrisi'
            },
            '3days': {
              points: threeDaysPoints,
              allPoints: threeDaysAllPoints,
              botPoints: threeDaysBotPoints,
              trend: threeDaysTrend,
              trendPct: threeDaysTrendPct,
              sub: 'Son 3 günlük seyir ve etkileşim performansı'
            },
            daily: {
              points: dailyPoints,
              allPoints: dailyAllPoints,
              botPoints: dailyBotPoints,
              trend: dailyTrend,
              trendPct: dailyTrendPct,
              sub: 'Bugünkü 24 saatlik trafik akışı ve saatlik değişim'
            }
          },
          trafficPoints: weeklyPoints,
          sectionViews: Object.keys(sectionViews).length > 0 ? sectionViews : (fallback.sectionViews || {}),
          sectionTimeSeconds: Object.keys(sectionTimeSeconds).length > 0 ? sectionTimeSeconds : (fallback.sectionTimeSeconds || {}),
          deviceStats: Object.values(deviceStats).some(v => v > 0) ? deviceStats : (fallback.deviceStats || {}),
          browserStats: Object.keys(browserStats).length > 0 ? browserStats : (fallback.browserStats || {}),
          countryStats: Object.fromEntries(Object.entries(countryMap).map(([k, v]) => [k, v.count])),
          countries: countries.length > 0 ? countries : [],
          visitors: formattedVisitors,
          recentVisitors: formattedVisitors
        };
      } catch (err) {
        console.warn('[Supabase getAnalytics error]:', err.message);
      }
    }
    return fallback;
  }

  async clearLogs() {
    if (this.isConfigured()) {
      try {
        await this.client.from('abentra_visitors').delete().neq('id', '');
        await this.client.from('abentra_section_stats').delete().neq('section_id', '');
        return true;
      } catch (e) {}
    }
    return false;
  }

  async clearAllMetrics(options = {}) {
    if (this.isConfigured()) {
      try {
        await this.client.from('abentra_visitors').delete().neq('id', '');
        await this.client.from('abentra_section_stats').delete().neq('section_id', '');
        if (options.includeInquiries) {
          await this.client.from('abentra_inquiries').delete().neq('id', '');
        }
        if (options.includeEmails) {
          await this.client.from('abentra_sent_emails').delete().neq('id', '');
        }
        return true;
      } catch (e) {
        console.warn('[Supabase clearAllMetrics error]:', e.message);
      }
    }
    return false;
  }

  async clearOlderThan(days = 7) {
    if (this.isConfigured()) {
      try {
        const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
        await this.client.from('abentra_visitors').delete().lt('last_seen', cutoff);
        return true;
      } catch (e) {
        console.warn('[Supabase clearOlderThan error]:', e.message);
      }
    }
    return false;
  }

  // ==========================================
  // INQUIRIES & EMAILS CRUD
  // ==========================================

  async addInquiry(inquiry) {
    if (this.isConfigured()) {
      try {
        await this.client.from('abentra_inquiries').insert({
          id: inquiry.id,
          name: inquiry.name,
          email: inquiry.email,
          phone: inquiry.phone,
          subject: inquiry.subject,
          service: inquiry.service,
          message: inquiry.message,
          date: inquiry.date || new Date().toISOString(),
          read: false,
          replied: false
        });
        return true;
      } catch (e) {
        console.warn('[Supabase addInquiry error]:', e.message);
      }
    }
    return false;
  }

  async getEmails(fallback) {
    if (this.isConfigured()) {
      try {
        const { data: inbox } = await this.client
          .from('abentra_inquiries')
          .select('*')
          .order('date', { ascending: false });

        const { data: sent } = await this.client
          .from('abentra_sent_emails')
          .select('*')
          .order('sent_at', { ascending: false });

        const { data: templates } = await this.client
          .from('abentra_email_templates')
          .select('*');

        return {
          inbox: (inbox && inbox.length > 0) ? inbox : (fallback.inbox || []),
          sent: (sent && sent.length > 0) ? (sent || []).map(s => ({
            id: s.id,
            to: s.to,
            subject: s.subject,
            body: s.body,
            template: s.template,
            sentAt: s.sent_at,
            status: s.status,
            errorDetails: s.error_details
          })) : (fallback.sent || []),
          templates: (templates && templates.length > 0) ? templates : (fallback.templates || [])
        };
      } catch (err) {
        console.warn('[Supabase getEmails error]:', err.message);
      }
    }
    return fallback;
  }

  async markInquiryRead(msgId, read = true) {
    if (this.isConfigured()) {
      try {
        await this.client.from('abentra_inquiries').update({ read }).eq('id', msgId);
        return true;
      } catch (e) {}
    }
    return false;
  }

  async deleteInquiry(msgId) {
    if (this.isConfigured()) {
      try {
        await this.client.from('abentra_inquiries').delete().eq('id', msgId);
        return true;
      } catch (e) {}
    }
    return false;
  }

  async starInquiry(msgId, starred = true) {
    if (this.isConfigured()) {
      try {
        await this.client.from('abentra_inquiries').update({ starred }).eq('id', msgId);
        return true;
      } catch (e) {}
    }
    return false;
  }

  async deleteSentEmail(msgId) {
    if (this.isConfigured()) {
      try {
        await this.client.from('abentra_sent_emails').delete().eq('id', msgId);
        return true;
      } catch (e) {}
    }
    return false;
  }

  async recordSentEmail(record) {
    if (this.isConfigured()) {
      try {
        await this.client.from('abentra_sent_emails').insert({
          id: record.id,
          to: record.to,
          subject: record.subject,
          body: record.body,
          template: record.template,
          sent_at: record.sentAt || new Date().toISOString(),
          status: record.status,
          error_details: record.errorDetails
        });

        // Mark matching inbox as replied
        await this.client.from('abentra_inquiries').update({
          replied: true,
          read: true
        }).ilike('email', record.to);

        return true;
      } catch (e) {}
    }
    return false;
  }

  // ==========================================
  // USERS / AUTH
  // ==========================================

  async getUser(username, fallbackUsers = []) {
    if (this.isConfigured()) {
      try {
        const { data, error } = await this.client
          .from('abentra_users')
          .select('*')
          .ilike('username', username)
          .maybeSingle();

        if (!error && data) {
          const localMatch = fallbackUsers.find(u => u.username.toLowerCase() === username.toLowerCase());
          return {
            id: data.id,
            username: data.username,
            password: data.password || data.password_hash,
            password_hash: data.password_hash || data.password,
            passwordHash: data.password_hash || data.password,
            salt: data.salt || '',
            name: data.name,
            role: data.role || (localMatch?.role) || 'admin',
            permissions: data.permissions || (localMatch?.permissions) || [],
            email: data.email
          };
        }
      } catch (e) {}
    }

    const local = fallbackUsers.find(u => u.username.toLowerCase() === username.toLowerCase());
    if (local) {
      return {
        id: local.id,
        username: local.username,
        password: local.password || local.password_hash || local.passwordHash || 'admin',
        password_hash: local.password_hash || local.password || local.passwordHash || 'admin',
        passwordHash: local.passwordHash || local.password || 'admin',
        salt: local.salt || '',
        name: local.name,
        role: local.role || 'admin',
        permissions: local.permissions || [],
        email: local.email
      };
    }
    return null;
  }

  async updateUserCredentials(userId, newUsername, newPassword) {
    if (this.isConfigured()) {
      try {
        await this.client.from('abentra_users').update({
          username: newUsername,
          password_hash: newPassword,
          salt: ''
        }).eq('id', userId);
        return true;
      } catch (e) {
        console.warn('[Supabase updateUserCredentials error]:', e.message);
      }
    }
    return false;
  }

  async updateUserPassword(userId, salt, password) {
    return this.updateUserCredentials(userId, undefined, password);
  }

  async updateLastLogin(userId) {
    if (this.isConfigured()) {
      try {
        await this.client.from('abentra_users').update({
          last_login: new Date().toISOString()
        }).eq('id', userId);
      } catch (e) {}
    }
  }

  // ==========================================
  // SUPABASE STORAGE UPLOADS (BUCKET)
  // ==========================================

  async uploadToBucket(fileBuffer, originalName, mimeType) {
    if (!this.isConfigured()) return null;

    try {
      const ext = path.extname(originalName);
      const filename = `${Date.now()}_${path.basename(originalName, ext).replace(/[^a-zA-Z0-9]/g, '_')}${ext}`;

      const { data, error } = await this.client.storage
        .from('abentra-uploads')
        .upload(filename, fileBuffer, {
          contentType: mimeType,
          upsert: true
        });

      if (!error && data) {
        const { data: pubData } = this.client.storage
          .from('abentra-uploads')
          .getPublicUrl(filename);

        return pubData ? pubData.publicUrl : null;
      }
    } catch (e) {
      console.warn('[Supabase Storage error]:', e.message);
    }
    return null;
  }
}

module.exports = new SupabaseManager();
