const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const DATA_DIR = path.join(__dirname, '..', 'data');
const ENV_FILE = path.join(__dirname, '..', '.env');

class SupabaseManager {
  constructor() {
    this.client = null;
    this.configured = false;
    this.initClient();
  }

  initClient() {
    require('dotenv').config({ path: ENV_FILE, override: true });
    const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || '';

    if (url && key && url.startsWith('http')) {
      try {
        this.client = createClient(url, key, {
          auth: { persistSession: false }
        });
        this.configured = true;
        console.log(`[Supabase] Client initialized with URL: ${url}`);
      } catch (err) {
        console.warn('[Supabase] Initialization error:', err.message);
        this.client = null;
        this.configured = false;
      }
    } else {
      this.client = null;
      this.configured = false;
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
        message: 'Supabase URL veya API Anahtarı henüz girilmedi.'
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

  // Update .env credentials from Admin UI
  updateCredentials(url, key) {
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
      console.error('[Supabase] Failed to write .env:', e);
      return false;
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
        await this.client.from('abentra_visitors').upsert({
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
          sections_viewed: visitor.sectionsViewed || []
        });

        // Increment hero section count
        await this.trackSection(visitor.id, 'hero', 0);
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
            const sv = sections.find(s => s.name === sectionId);
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

  async getAnalytics(fallback) {
    if (this.isConfigured()) {
      try {
        // Fetch visitors
        const { data: visitors } = await this.client
          .from('abentra_visitors')
          .select('*')
          .order('last_seen', { ascending: false })
          .limit(100);

        // Fetch section stats
        const { data: stats } = await this.client
          .from('abentra_section_stats')
          .select('*');

        // Fetch inquiries count
        const { count: unreadCount } = await this.client
          .from('abentra_inquiries')
          .select('*', { count: 'exact', head: true })
          .eq('read', false);

        const { count: totalInquiries } = await this.client
          .from('abentra_inquiries')
          .select('*', { count: 'exact', head: true });

        const sectionViews = {};
        const sectionTimeSeconds = {};
        let mostViewed = { name: 'hero', count: 0 };

        if (Array.isArray(stats)) {
          stats.forEach(s => {
            sectionViews[s.section_id] = s.views_count || 0;
            sectionTimeSeconds[s.section_id] = s.time_seconds || 0;
            if (s.views_count > mostViewed.count) {
              mostViewed = { name: s.section_id, count: s.views_count };
            }
          });
        }

        const deviceStats = { Desktop: 0, Mobile: 0, Tablet: 0 };
        const countryStats = {};
        let totalDuration = 0;

        const formattedVisitors = (visitors || []).map(v => {
          deviceStats[v.device] = (deviceStats[v.device] || 0) + 1;
          const c = v.country || 'Liberia';
          countryStats[c] = (countryStats[c] || 0) + 1;
          totalDuration += (v.duration_seconds || 0);

          return {
            id: v.id,
            ip: v.ip,
            country: v.country,
            city: v.city,
            device: v.device,
            browser: v.browser,
            os: v.os,
            referer: v.referer,
            firstSeen: v.first_seen,
            lastSeen: v.last_seen,
            durationSeconds: v.duration_seconds,
            sectionsViewed: v.sections_viewed || []
          };
        });

        const totalVisits = formattedVisitors.length;
        const avgDuration = totalVisits > 0 ? Math.round(totalDuration / totalVisits) : 0;

        return {
          summary: {
            totalVisits: totalVisits || (fallback.summary.totalVisits || 0),
            uniqueVisitors: totalVisits || (fallback.summary.uniqueVisitors || 0),
            pageViews: (fallback.summary.pageViews || 0) + totalVisits,
            avgDurationSeconds: avgDuration || (fallback.summary.avgDurationSeconds || 0),
            unreadInquiries: unreadCount || 0,
            totalInquiries: totalInquiries || 0,
            mostViewedSection: mostViewed.name || 'hero'
          },
          sectionViews: Object.keys(sectionViews).length > 0 ? sectionViews : fallback.sectionViews,
          sectionTimeSeconds: Object.keys(sectionTimeSeconds).length > 0 ? sectionTimeSeconds : fallback.sectionTimeSeconds,
          deviceStats: Object.values(deviceStats).some(v => v > 0) ? deviceStats : fallback.deviceStats,
          countryStats: Object.keys(countryStats).length > 0 ? countryStats : fallback.countryStats,
          recentVisitors: formattedVisitors.length > 0 ? formattedVisitors : fallback.recentVisitors
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
          inbox: inbox || [],
          sent: (sent || []).map(s => ({
            id: s.id,
            to: s.to,
            subject: s.subject,
            body: s.body,
            template: s.template,
            sentAt: s.sent_at,
            status: s.status,
            errorDetails: s.error_details
          })),
          templates: templates || []
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
