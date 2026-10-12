// Executive Admin Portal Single Page Application Engine
document.addEventListener('DOMContentLoaded', () => {
  let authToken = localStorage.getItem('abentra_admin_token');
  let currentSiteConfig = null;
  let currentAnalytics = null;
  let currentSections = [];
  let currentEmails = { inbox: [], sent: [], templates: [] };
  let currentIcons = [];

  // ==========================================
  // AUTHENTICATION & SESSION HANDLING
  // ==========================================

  function getAuthHeaders() {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`
    };
  }

  async function checkAuth() {
    if (!authToken) {
      showLoginScreen(true);
      return;
    }

    try {
      const res = await fetch('/api/admin/me', { headers: getAuthHeaders() });
      if (res.ok) {
        const data = await res.json();
        showLoginScreen(false);
        updateCurrentUserUI(data.user);
        initAdminApp();
      } else {
        localStorage.removeItem('abentra_admin_token');
        authToken = null;
        showLoginScreen(true);
      }
    } catch (e) {
      showLoginScreen(true);
    }
  }

  function showLoginScreen(show) {
    const el = document.getElementById('login-screen');
    if (el) el.style.display = show ? 'flex' : 'none';
  }

  let currentUser = null;

  function updateCurrentUserUI(user) {
    if (!user) return;
    currentUser = user;
    const nameEl = document.getElementById('current-user-name');
    const initEl = document.getElementById('current-user-initial');
    const roleEl = document.getElementById('current-user-role');

    if (nameEl) nameEl.textContent = user.name || user.username;
    if (initEl) initEl.textContent = (user.name || user.username || 'A')[0].toUpperCase();
    if (roleEl) {
      const flag = user.flag || '🇹🇷';
      const roleName = user.role === 'superadmin' ? 'Süper Yönetici' :
                       user.role === 'ads_manager' ? 'Reklam & Analiz Yöneticisi' :
                       user.role === 'developer' ? 'Sistem Geliştiricisi' : 'Yönetici';
      roleEl.textContent = `${flag} ${roleName}`;
    }

    applyRoleRestrictions(user);
  }

  function applyRoleRestrictions(user) {
    if (!user) return;
    const isSuper = user.role === 'superadmin' || user.role === 'Super Administrator' || (user.permissions && user.permissions.includes('all'));
    const perms = Array.isArray(user.permissions) ? user.permissions : [];

    const tabPermMap = {
      dashboard: 'dashboard',
      logs: 'logs',
      theme: 'theme',
      content: 'content',
      sections: 'sections',
      emails: 'emails',
      icons: 'icons',
      users: 'users',
      settings: 'settings'
    };

    let firstAllowedTab = null;

    document.querySelectorAll('.nav-item').forEach(item => {
      const tab = item.dataset.tab;
      const reqPerm = tabPermMap[tab];
      const isAllowed = isSuper || perms.includes(reqPerm) || perms.includes('all');

      if (!isAllowed) {
        item.style.display = 'none';
      } else {
        item.style.display = 'flex';
        if (!firstAllowedTab) firstAllowedTab = tab;
      }
    });

    // If current tab is hidden, switch to the first allowed tab
    const activeItem = document.querySelector('.nav-item.active');
    if (activeItem && activeItem.style.display === 'none' && firstAllowedTab) {
      switchTab(firstAllowedTab);
    }
  }

  // Login Form Submit
  const loginForm = document.getElementById('admin-login-form');
  const loginError = document.getElementById('login-error');
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      loginError.style.display = 'none';

      const username = document.getElementById('login-username').value;
      const password = document.getElementById('login-password').value;

      try {
        const res = await fetch('/api/admin/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password })
        });

        const data = await res.json();
        if (res.ok && data.token) {
          authToken = data.token;
          localStorage.setItem('abentra_admin_token', authToken);
          showLoginScreen(false);
          updateCurrentUserUI(data.user);
          showToast('Hoş geldiniz! / Welcome!', 'success');
          initAdminApp();
        } else {
          loginError.textContent = data.error || 'Geçersiz kullanıcı adı veya şifre.';
          loginError.style.display = 'block';
        }
      } catch (err) {
        loginError.textContent = 'Sunucuya bağlanılamadı.';
        loginError.style.display = 'block';
      }
    });
  }

  // Logout handlers
  function handleLogout() {
    if (authToken) {
      fetch('/api/admin/logout', { method: 'POST', headers: getAuthHeaders() }).catch(() => {});
    }
    localStorage.removeItem('abentra_admin_token');
    authToken = null;
    showLoginScreen(true);
    showToast('Oturum kapatıldı.', 'info');
  }

  const logoutBtn = document.getElementById('btn-sidebar-logout');
  if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);

  // ==========================================
  // NAVIGATION & TAB SWITCHING
  // ==========================================

  const navItems = document.querySelectorAll('.nav-item');
  const tabPanels = document.querySelectorAll('.tab-panel');
  const pageTitleDisplay = document.getElementById('page-title-display');

  function switchTab(tabKey) {
    navItems.forEach(item => {
      item.classList.toggle('active', item.dataset.tab === tabKey);
    });

    tabPanels.forEach(panel => {
      panel.classList.toggle('active', panel.id === `tab-${tabKey}`);
    });

    const activeNav = document.querySelector(`.nav-item[data-tab="${tabKey}"] span`);
    if (activeNav && pageTitleDisplay) {
      pageTitleDisplay.textContent = activeNav.textContent;
    }

    // Tab-specific refreshes
    if (tabKey === 'dashboard') loadDashboardData();
    if (tabKey === 'logs') loadLogsTable();
    if (tabKey === 'theme') loadThemeData();
    if (tabKey === 'content') loadContentData();
    if (tabKey === 'sections') loadSectionsData();
    if (tabKey === 'emails') loadEmailsData();
    if (tabKey === 'icons') loadIconsData();
    if (tabKey === 'users') loadUsersData();
    if (tabKey === 'settings') loadSupabaseStatus();

    // Close mobile sidebar if open
    document.getElementById('admin-sidebar')?.classList.remove('open');
  }

  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const tab = item.dataset.tab;
      if (tab) switchTab(tab);
    });
  });

  // Mobile sidebar toggle and backdrop handling
  const toggleSidebarBtn = document.getElementById('toggle-sidebar');
  const sidebarBackdrop = document.getElementById('sidebar-backdrop');
  const adminSidebar = document.getElementById('admin-sidebar');

  if (toggleSidebarBtn) {
    toggleSidebarBtn.addEventListener('click', () => {
      const isOpen = adminSidebar?.classList.toggle('open');
      sidebarBackdrop?.classList.toggle('open', Boolean(isOpen));
    });
  }

  if (sidebarBackdrop) {
    sidebarBackdrop.addEventListener('click', () => {
      adminSidebar?.classList.remove('open');
      sidebarBackdrop.classList.remove('open');
    });
  }

  // Auto-close sidebar on mobile after clicking any nav item
  document.querySelectorAll('.sidebar-nav a').forEach(link => {
    link.addEventListener('click', () => {
      if (window.innerWidth <= 960) {
        adminSidebar?.classList.remove('open');
        sidebarBackdrop?.classList.remove('open');
      }
    });
  });

  // ==========================================
  // THEME & LANGUAGE SWITCHER
  // ==========================================

  const adminThemeSelect = document.getElementById('admin-theme-select');
  const settingsThemeSelect = document.getElementById('settings-theme-select');
  const adminLangSelect = document.getElementById('admin-lang-select');
  const settingsLangSelect = document.getElementById('settings-lang-select');

  function applyAdminTheme(themeName) {
    document.body.setAttribute('data-theme', themeName);
    localStorage.setItem('abentra_admin_theme', themeName);
    if (adminThemeSelect) adminThemeSelect.value = themeName;
    if (settingsThemeSelect) settingsThemeSelect.value = themeName;
  }

  const savedTheme = localStorage.getItem('abentra_admin_theme') || 'theme-midnight';
  applyAdminTheme(savedTheme);

  if (adminThemeSelect) adminThemeSelect.addEventListener('change', (e) => applyAdminTheme(e.target.value));
  if (settingsThemeSelect) settingsThemeSelect.addEventListener('change', (e) => applyAdminTheme(e.target.value));

  function applyAdminLanguage(lang) {
    window.currentLang = lang;
    localStorage.setItem('abentra_admin_lang', lang);
    if (adminLangSelect) adminLangSelect.value = lang;
    if (settingsLangSelect) settingsLangSelect.value = lang;

    // Translate all elements with data-i18n
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      if (key && window.i18n[lang] && window.i18n[lang][key]) {
        el.textContent = window.i18n[lang][key];
      }
    });

    // Translate placeholders
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      if (key && window.i18n[lang] && window.i18n[lang][key]) {
        el.setAttribute('placeholder', window.i18n[lang][key]);
      }
    });

    // Re-render active tab titles
    const activeNav = document.querySelector('.nav-item.active span');
    if (activeNav && pageTitleDisplay) {
      pageTitleDisplay.textContent = activeNav.textContent;
    }

    // Refresh dynamic views with translated strings
    if (currentAnalytics) {
      const pageViewsCount = currentAnalytics.summary ? currentAnalytics.summary.pageViews || 0 : 0;
      const pvEl = document.getElementById('kpi-pageviews');
      if (pvEl) pvEl.textContent = `${pageViewsCount} ${window.t('pageViewsText', 'Sayfa Görüntüleme')}`;

      const topSecEl = document.getElementById('kpi-top-section');
      if (topSecEl) topSecEl.textContent = getHumanSectionName(currentAnalytics.summary ? currentAnalytics.summary.mostViewedSection : '');

      const avgDurEl = document.getElementById('kpi-avg-duration');
      if (avgDurEl) avgDurEl.textContent = formatSeconds(currentAnalytics.summary ? currentAnalytics.summary.avgDurationSeconds || 0 : 0);

      renderHeatmap(currentAnalytics);
      renderDeviceAndCountryStats(currentAnalytics);
      renderRecentVisitors(currentAnalytics.recentVisitors || []);
      renderFullLogsTable(currentAnalytics.recentVisitors || []);
    }

    if (currentSections && currentSections.length > 0) {
      renderDynamicSectionsTable(currentSections);
    }

    if (currentEmails) {
      renderInboxTable(currentEmails.inbox || []);
      renderSentTable(currentEmails.sent || []);
    }

    if (currentIcons && currentIcons.length > 0) {
      const activeChip = document.querySelector('.cat-chip.active');
      const cat = activeChip ? activeChip.dataset.cat : 'all';
      const term = (document.getElementById('icon-search-input')?.value || '').toLowerCase();
      filterIcons(cat, term);
    }
  }

  const savedLang = localStorage.getItem('abentra_admin_lang') || 'tr';
  applyAdminLanguage(savedLang);

  if (adminLangSelect) adminLangSelect.addEventListener('change', (e) => applyAdminLanguage(e.target.value));
  if (settingsLangSelect) settingsLangSelect.addEventListener('change', (e) => applyAdminLanguage(e.target.value));

  // ==========================================
  // INITIALIZE APP DATA
  // ==========================================

  function initAdminApp() {
    loadDashboardData();
    loadSiteConfig();
    loadSupabaseStatus();
  }

  async function loadSiteConfig() {
    try {
      const res = await fetch('/api/admin/config', { headers: getAuthHeaders() });
      if (res.ok) {
        currentSiteConfig = await res.json();
        const siteLangSelect = document.getElementById('settings-site-lang-select');
        if (siteLangSelect && currentSiteConfig.siteDefaultLang) {
          siteLangSelect.value = currentSiteConfig.siteDefaultLang;
        }
      }
    } catch (e) {}
  }

  document.getElementById('settings-site-lang-select')?.addEventListener('change', async (e) => {
    if (!currentSiteConfig) await loadSiteConfig();
    if (!currentSiteConfig) currentSiteConfig = {};
    currentSiteConfig.siteDefaultLang = e.target.value;
    try {
      await fetch('/api/admin/config', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(currentSiteConfig)
      });
      showToast(window.t('saveSuccess', 'Ayarlar başarıyla kaydedildi!'), 'success');
    } catch (err) {}
  });

  // ==========================================
  // TAB 1: DASHBOARD
  // ==========================================

  async function loadDashboardData() {
    try {
      const res = await fetch('/api/admin/analytics', { headers: getAuthHeaders() });
      if (!res.ok) return;
      const data = await res.json();
      currentAnalytics = data;

      // Update KPIs
      document.getElementById('kpi-total-visits').textContent = data.summary.totalVisits || 0;
      document.getElementById('kpi-pageviews').textContent = `${data.summary.pageViews || 0} ${window.t('pageViewsText', 'Sayfa Görüntüleme')}`;
      document.getElementById('kpi-unique-visitors').textContent = data.summary.uniqueVisitors || 0;
      document.getElementById('kpi-avg-duration').textContent = formatSeconds(data.summary.avgDurationSeconds || 0);
      document.getElementById('kpi-total-inquiries').textContent = data.summary.totalInquiries || 0;
      document.getElementById('kpi-unread-inquiries').textContent = data.summary.unreadInquiries || 0;
      document.getElementById('kpi-top-section').textContent = getHumanSectionName(data.summary.mostViewedSection);

      // Unread badge on sidebar
      const badge = document.getElementById('sidebar-unread-badge');
      if (badge) {
        if (data.summary.unreadInquiries > 0) {
          badge.textContent = data.summary.unreadInquiries;
          badge.style.display = 'inline-block';
        } else {
          badge.style.display = 'none';
        }
      }

      // Render Section Heatmap
      renderHeatmap(data);

      // Render Devices & Countries
      renderDeviceAndCountryStats(data);

      // Render Recent Visitors
      renderRecentVisitors(data.recentVisitors || []);
    } catch (err) {
      console.error('Failed to load dashboard:', err);
    }
  }

  document.getElementById('btn-refresh-dashboard')?.addEventListener('click', loadDashboardData);

  function getHumanSectionName(secKey = '') {
    if (!secKey) return '';
    const key = secKey.toLowerCase();
    const map = {
      hero: window.t('secHero', 'Karşılama (Hero)'),
      who: window.t('secWho', 'Hakkımızda (Who We Are)'),
      purpose: window.t('secPurpose', 'Amaç & Karakter (Purpose)'),
      services: window.t('secServices', 'Hizmetlerimiz (Services)'),
      sec_stats: window.t('secStats', 'Etki & Rakamlar (Impact Stats)'),
      sec_why_liberia: window.t('secWhyLiberia', 'Neden Liberya (Strategic Gateway)'),
      sec_process: window.t('secProcess', 'Süreç & Metodoloji (Process)'),
      sec_faq: window.t('secFaq', 'Sık Sorulan Sorular (FAQ)'),
      contact: window.t('secContact', 'İletişim & Liderlik (Contact)')
    };
    return map[key] || key.replace('sec_', '').replace(/_/g, ' ');
  }

  function formatSeconds(secs) {
    const sUnit = window.t('timeSec', 's');
    const mUnit = window.t('timeMin', 'm');
    if (!secs || secs < 0) return `0${sUnit}`;
    if (secs < 60) return `${secs}${sUnit}`;
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}${mUnit} ${s}${sUnit}`;
  }

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
      uae: '🇦🇪', 'birleşik arap emirlikleri': '🇦🇪', ae: '🇦🇪'
    };
    const key = (countryName || countryCode || '').toLowerCase().trim();
    return nameMap[key] || '🌐';
  }

  function renderHeatmap(data) {
    const container = document.getElementById('section-heatmap-list');
    if (!container) return;

    const views = data.sectionViews || {};
    const times = data.sectionTimeSeconds || {};
    const countryViews = data.sectionCountryViews || {};

    let maxViews = 1;
    for (const count of Object.values(views)) {
      if (count > maxViews) maxViews = count;
    }

    const sections = Object.keys(views).sort((a, b) => (views[b] || 0) - (views[a] || 0));

    if (sections.length === 0) {
      container.innerHTML = `<p style="color:var(--adm-mute);padding:14px;">${window.t('noHeatData', 'Henüz bölüm görüntüleme verisi toplanmadı.')}</p>`;
      return;
    }

    container.innerHTML = sections.map(sec => {
      const count = views[sec] || 0;
      const totalSec = times[sec] || 0;
      const pct = Math.round((count / maxViews) * 100);
      const name = getHumanSectionName(sec);

      // Per-country breakdown for this section (for Ads Manager & Admin)
      const perCountry = countryViews[sec] || {};
      const countryBadges = Object.entries(perCountry).map(([cnt, cntCount]) => {
        let flag = cnt.split(' ')[0];
        let cName = cnt;
        if (!/\p{Extended_Pictographic}/u.test(flag)) {
          flag = getCountryFlag('', cnt);
        }
        return `<span class="badge badge-gray" style="font-size:11px;margin-right:4px;">${flag} ${cName.replace(flag, '').trim()}: <strong>${cntCount}</strong></span>`;
      }).join('') || `<span class="badge badge-gray" style="font-size:11px;">🌐 Genel: <strong>${count}</strong></span>`;

      return `
        <div class="heat-item" style="padding:14px 0;border-bottom:1px solid rgba(201,164,92,0.1);">
          <div class="heat-header" style="margin-bottom:6px;">
            <span class="heat-name" style="font-size:15px;font-weight:600;">${name}</span>
            <span class="heat-stat"><strong>${count} ${window.t('viewsCountText', 'görüntüleme')}</strong> · ${formatSeconds(totalSec)} ${window.t('totalStayText', 'toplam kalış')}</span>
          </div>
          <div class="heat-bar-track" style="margin-bottom:8px;">
            <div class="heat-bar-fill" style="width: ${pct}%"></div>
          </div>
          <div style="display:flex;align-items:center;flex-wrap:wrap;gap:4px;">
            <small style="color:var(--adm-mute);font-size:11px;margin-right:4px;">Görüntüleyen Ülkeler:</small>
            ${countryBadges}
          </div>
        </div>
      `;
    }).join('');
  }

  function renderDeviceAndCountryStats(data) {
    const devBox = document.getElementById('device-stats-container');
    const cntBox = document.getElementById('country-stats-container');

    if (devBox) {
      const devs = data.deviceStats || {};
      const totalDevs = Object.values(devs).reduce((a, b) => a + b, 0) || 1;
      devBox.innerHTML = Object.entries(devs).map(([name, count]) => {
        const pct = Math.round((count / totalDevs) * 100);
        const localizedDev = name.toLowerCase() === 'desktop' ? window.t('desktop', 'Masaüstü')
          : name.toLowerCase() === 'mobile' ? window.t('mobile', 'Mobil')
          : name.toLowerCase() === 'tablet' ? window.t('tablet', 'Tablet') : name;
        return `
          <div style="margin-bottom:10px;">
            <div style="display:flex;justify-content:space-between;font-size:12px;margin-bottom:4px;">
              <span>${localizedDev}</span>
              <span><strong>${count}</strong> (%${pct})</span>
            </div>
            <div class="heat-bar-track" style="height:6px;">
              <div class="heat-bar-fill" style="width:${pct}%;background:var(--adm-gold);"></div>
            </div>
          </div>
        `;
      }).join('');
    }

    if (cntBox) {
      const cnts = data.countryStats || {};
      const totalCnts = Object.values(cnts).reduce((a, b) => a + b, 0) || 1;
      const sorted = Object.entries(cnts).sort((a, b) => b[1] - a[1]);
      if (sorted.length === 0) {
        cntBox.innerHTML = `<div style="color:var(--adm-mute);padding:10px 0;font-size:13px;">${window.t('noVisitorsData', 'Veri yok')}</div>`;
      } else {
        cntBox.innerHTML = sorted.map(([name, count]) => {
          const pct = Math.round((count / totalCnts) * 100);
          let flag = '';
          let displayName = name;
          if (name.includes(' ')) {
            const first = name.split(' ')[0];
            if (/\p{Extended_Pictographic}/u.test(first) || first.length === 2) {
              flag = first;
              displayName = name.replace(first, '').trim();
            }
          }
          if (!flag) flag = getCountryFlag('', displayName);

          return `
            <div style="margin-bottom:10px;">
              <div style="display:flex;justify-content:space-between;font-size:13px;margin-bottom:3px;">
                <span><span style="font-size:16px;margin-right:6px;">${flag}</span><strong>${displayName}</strong></span>
                <span class="badge badge-gold">${count} ${window.t('visitsCountText', 'ziyaret')} (%${pct})</span>
              </div>
              <div class="heat-bar-track" style="height:4px;">
                <div class="heat-bar-fill" style="width:${pct}%;"></div>
              </div>
            </div>
          `;
        }).join('');
      }
    }
  }

  function renderRecentVisitors(visitors) {
    const tbody = document.getElementById('dashboard-recent-visitors-body');
    if (!tbody) return;

    if (visitors.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:20px;color:var(--adm-mute);">${window.t('noVisitorsData', 'Kayıtlı ziyaretçi bulunamadı.')}</td></tr>`;
      return;
    }

    tbody.innerHTML = visitors.slice(0, 10).map(v => {
      const topSecs = (v.sectionsViewed || []).map(s => `${getHumanSectionName(s.name)} (${s.seconds}${window.t('timeSec', 's')})`).join(', ') || window.t('secHero', 'Hero');
      const localizedDev = v.device === 'Desktop' ? window.t('desktop', 'Masaüstü')
        : v.device === 'Mobile' ? window.t('mobile', 'Mobil')
        : v.device === 'Tablet' ? window.t('tablet', 'Tablet') : v.device;
      const flag = v.flag || getCountryFlag(v.countryCode, v.country);
      return `
        <tr>
          <td><span class="badge badge-gold">${v.id}</span></td>
          <td><code>${v.ip}</code></td>
          <td><span style="font-size:15px;margin-right:4px;">${flag}</span> ${v.country || 'Liberia'} / ${v.city || 'Monrovia'}</td>
          <td><span class="badge badge-gray">${localizedDev} · ${v.browser}</span></td>
          <td><strong>${formatSeconds(v.durationSeconds || 0)}</strong></td>
          <td><small style="color:var(--adm-mute);">${topSecs}</small></td>
        </tr>
      `;
    }).join('');
  }

  // ==========================================
  // TAB 2: VISITOR LOGS
  // ==========================================

  async function loadLogsTable() {
    try {
      const res = await fetch('/api/admin/analytics', { headers: getAuthHeaders() });
      if (!res.ok) return;
      const data = await res.json();
      renderFullLogsTable(data.recentVisitors || []);
    } catch (e) {}
  }

  function renderFullLogsTable(visitors) {
    const tbody = document.getElementById('full-logs-table-body');
    if (!tbody) return;

    if (visitors.length === 0) {
      tbody.innerHTML = `<tr><td colspan="8" style="text-align:center;padding:24px;color:var(--adm-mute);">${window.t('noLogsData', 'Kayıtlı ziyaretçi günlüğü bulunmuyor.')}</td></tr>`;
      return;
    }

    tbody.innerHTML = visitors.map(v => {
      const timeStr = v.firstSeen ? new Date(v.firstSeen).toLocaleString(window.currentLang === 'en' ? 'en-US' : 'tr-TR') : '-';
      const sectionsCount = (v.sectionsViewed || []).length;
      const localizedDev = v.device === 'Desktop' ? window.t('desktop', 'Masaüstü')
        : v.device === 'Mobile' ? window.t('mobile', 'Mobil')
        : v.device === 'Tablet' ? window.t('tablet', 'Tablet') : v.device;
      const flag = v.flag || getCountryFlag(v.countryCode, v.country);
      return `
        <tr>
          <td><span class="badge badge-gold">${v.id}</span></td>
          <td><code>${v.ip}</code></td>
          <td><span style="font-size:15px;margin-right:4px;">${flag}</span> ${v.country || 'Liberia'}, ${v.city || 'Monrovia'}</td>
          <td><span class="badge badge-gray">${localizedDev}</span> · ${v.browser} (${v.os})</td>
          <td><small style="color:var(--adm-mute);">${v.referer || 'Direct'}</small></td>
          <td><strong>${formatSeconds(v.durationSeconds || 0)}</strong></td>
          <td>
            <button class="btn-ui" style="padding:4px 8px;font-size:11px;" onclick="viewVisitorSections('${v.id}')">
              ${sectionsCount} ${window.t('visitorAreasCount', 'Alan')} (${v.durationSeconds}${window.t('timeSec', 's')})
            </button>
          </td>
          <td><small style="color:var(--adm-mute);">${timeStr}</small></td>
        </tr>
      `;
    }).join('');
  }

  // Search in logs table
  document.getElementById('logs-search-input')?.addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    const rows = document.querySelectorAll('#full-logs-table-body tr');
    rows.forEach(r => {
      r.style.display = r.textContent.toLowerCase().includes(term) ? '' : 'none';
    });
  });

  // Clear Logs
  document.getElementById('btn-clear-logs')?.addEventListener('click', async () => {
    if (!confirm('Tüm ziyaretçi günlüklerini ve sayaçları sıfırlamak istediğinize emin misiniz?')) return;
    try {
      const res = await fetch('/api/admin/logs/clear', { method: 'POST', headers: getAuthHeaders() });
      if (res.ok) {
        showToast('Ziyaretçi logları başarıyla temizlendi.', 'success');
        loadLogsTable();
        loadDashboardData();
      }
    } catch (e) {}
  });

  // Export CSV
  document.getElementById('btn-export-csv')?.addEventListener('click', () => {
    if (!currentAnalytics || !currentAnalytics.recentVisitors) return;
    const rows = [
      ['Visitor ID', 'IP Address', 'Country', 'City', 'Device', 'Browser', 'OS', 'Referer', 'Duration (s)', 'First Seen']
    ];
    currentAnalytics.recentVisitors.forEach(v => {
      rows.push([
        v.id, v.ip, v.country, v.city, v.device, v.browser, v.os, `"${v.referer || ''}"`, v.durationSeconds, v.firstSeen
      ]);
    });
    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(e => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `abentra_visitor_logs_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  });

  // View Visitor Sections Modal
  window.viewVisitorSections = function (visitorId) {
    if (!currentAnalytics || !currentAnalytics.recentVisitors) return;
    const v = currentAnalytics.recentVisitors.find(x => x.id === visitorId);
    if (!v) return;

    const modal = document.getElementById('modal-visitor-detail');
    const content = document.getElementById('modal-visitor-content');
    const title = document.getElementById('modal-visitor-title');

    const flag = v.flag || getCountryFlag(v.countryCode, v.country);
    title.textContent = `Ziyaretçi Detayı: ${v.id} (${v.ip})`;
    const listHtml = (v.sectionsViewed || []).map(s => `
      <div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid rgba(201,164,92,0.15);">
        <span><strong>${getHumanSectionName(s.name)}</strong></span>
        <span class="badge badge-gold">${s.seconds} saniye görüntülendi</span>
      </div>
    `).join('') || '<p style="color:var(--adm-mute);">Görüntülenen alan kaydı bulunmuyor.</p>';

    content.innerHTML = `
      <div style="margin-bottom:16px;">
        <p><strong>Konum:</strong> <span style="font-size:16px;margin-right:4px;">${flag}</span> ${v.country}, ${v.city} ${v.region ? '· ' + v.region : ''} ${v.isp ? '(' + v.isp + ')' : ''}</p>
        <p><strong>Cihaz & Platform:</strong> ${v.device} · ${v.browser} (${v.os}) ${v.screen ? '· ' + v.screen : ''}</p>
        <p><strong>Referans (Giriş):</strong> ${v.referer || 'Direct Entry'}</p>
        <p><strong>Toplam Sitede Kalış:</strong> ${formatSeconds(v.durationSeconds || 0)}</p>
      </div>
      <h4 style="margin:16px 0 8px;color:var(--adm-gold-light);">Bölüm Bazlı Kalış Süreleri</h4>
      <div>${listHtml}</div>
    `;

    openModal('modal-visitor-detail');
  };

  // ==========================================
  // TAB 3: THEME & BRANDING
  // ==========================================

  async function loadThemeData() {
    if (!currentSiteConfig) await loadSiteConfig();
    if (!currentSiteConfig) return;

    const theme = currentSiteConfig.theme || {};
    const brand = currentSiteConfig.brand || {};

    // Colors
    setColorPair('navy', theme.navy || '#0a2038');
    setColorPair('navy2', theme.navy2 || '#0e2a47');
    setColorPair('navy3', theme.navy3 || '#061628');
    setColorPair('gold', theme.gold || '#c9a45c');
    setColorPair('gold2', theme.gold2 || '#e3c98f');
    setColorPair('ink', theme.ink || '#f3efe6');

    // Branding
    document.getElementById('brand-logotype-select').value = brand.logoType || 'svg';
    document.getElementById('brand-name-input').value = brand.name || 'ABENTRA';
    document.getElementById('brand-tagline-input').value = brand.tagline || '';
    document.getElementById('brand-location-input').value = brand.location || '';
  }

  function setColorPair(key, val) {
    const swatch = document.getElementById(`theme-color-${key}`);
    const text = document.getElementById(`theme-text-${key}`);
    if (swatch) swatch.value = val;
    if (text) text.value = val;
  }

  ['navy', 'navy2', 'navy3', 'gold', 'gold2', 'ink'].forEach(key => {
    const swatch = document.getElementById(`theme-color-${key}`);
    const text = document.getElementById(`theme-text-${key}`);
    if (swatch && text) {
      swatch.addEventListener('input', () => text.value = swatch.value);
      text.addEventListener('input', () => {
        if (/^#[0-9A-Fa-f]{6}$/.test(text.value)) swatch.value = text.value;
      });
    }
  });

  // Presets
  document.getElementById('preset-default')?.addEventListener('click', () => {
    setColorPair('navy', '#0a2038');
    setColorPair('navy2', '#0e2a47');
    setColorPair('navy3', '#061628');
    setColorPair('gold', '#c9a45c');
    setColorPair('gold2', '#e3c98f');
    setColorPair('ink', '#f3efe6');
    showToast('Orijinal tema değerleri yüklendi.', 'info');
  });

  document.getElementById('preset-obsidian')?.addEventListener('click', () => {
    setColorPair('navy', '#09090b');
    setColorPair('navy2', '#141416');
    setColorPair('navy3', '#050507');
    setColorPair('gold', '#d4af37');
    setColorPair('gold2', '#f3e5ab');
    setColorPair('ink', '#ffffff');
    showToast('Obsidyen tema değerleri yüklendi.', 'info');
  });

  document.getElementById('preset-royal')?.addEventListener('click', () => {
    setColorPair('navy', '#0c1e38');
    setColorPair('navy2', '#132a4d');
    setColorPair('navy3', '#081426');
    setColorPair('gold', '#bfa15f');
    setColorPair('gold2', '#e8d7a5');
    setColorPair('ink', '#f7f5f0');
    showToast('Kraliyet teması değerleri yüklendi.', 'info');
  });

  // Save Theme Button
  document.getElementById('btn-save-theme')?.addEventListener('click', async () => {
    if (!currentSiteConfig) await loadSiteConfig();

    currentSiteConfig.theme = {
      ...currentSiteConfig.theme,
      navy: document.getElementById('theme-text-navy').value,
      navy2: document.getElementById('theme-text-navy2').value,
      navy3: document.getElementById('theme-text-navy3').value,
      gold: document.getElementById('theme-text-gold').value,
      gold2: document.getElementById('theme-text-gold2').value,
      ink: document.getElementById('theme-text-ink').value
    };

    currentSiteConfig.brand = {
      ...currentSiteConfig.brand,
      logoType: document.getElementById('brand-logotype-select').value,
      name: document.getElementById('brand-name-input').value,
      tagline: document.getElementById('brand-tagline-input').value,
      location: document.getElementById('brand-location-input').value
    };

    try {
      const res = await fetch('/api/admin/config', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(currentSiteConfig)
      });
      if (res.ok) {
        showToast('Site teması ve marka kimliği başarıyla kaydedildi!', 'success');
      }
    } catch (e) {}
  });

  // Upload Logo Form
  document.getElementById('btn-upload-logo')?.addEventListener('click', async () => {
    const fileInput = document.getElementById('logo-file-input');
    if (!fileInput || !fileInput.files || fileInput.files.length === 0) {
      showToast('Lütfen önce bir logo görseli seçin.', 'error');
      return;
    }

    const formData = new FormData();
    formData.append('logo', fileInput.files[0]);

    try {
      const res = await fetch('/api/admin/upload-logo', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${authToken}` },
        body: formData
      });
      const data = await res.json();
      if (res.ok) {
        showToast('Logo başarıyla yüklendi ve siteye uygulandı!', 'success');
        document.getElementById('brand-logotype-select').value = 'image';
        loadSiteConfig();
      } else {
        showToast(data.error || 'Yükleme başarısız.', 'error');
      }
    } catch (e) {
      showToast('Logo yüklenirken bir hata oluştu.', 'error');
    }
  });

  // ==========================================
  // TAB 4: CONTENT CMS
  // ==========================================

  // CMS Subtab switching
  document.querySelectorAll('.subtabs .subtab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const container = btn.closest('section');
      container.querySelectorAll('.subtab-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const targetId = btn.dataset.subtab;
      container.querySelectorAll('.cms-subpanel, .email-subpanel').forEach(panel => {
        panel.style.display = panel.id === targetId ? 'block' : 'none';
      });
    });
  });

  async function loadContentData() {
    if (!currentSiteConfig) await loadSiteConfig();
    if (!currentSiteConfig) return;

    const c = currentSiteConfig;

    // Hero
    document.getElementById('cms-hero-tag').value = c.hero?.tag || '';
    document.getElementById('cms-hero-location').value = c.hero?.location || '';
    document.getElementById('cms-hero-title').value = c.hero?.title || '';
    document.getElementById('cms-hero-title-accent').value = c.hero?.titleAccent || '';
    document.getElementById('cms-hero-desc').value = c.hero?.desc || '';

    // Ticker
    document.getElementById('cms-ticker-items').value = (c.ticker || []).join('\n');

    // Who We Are
    document.getElementById('cms-who-title').value = c.who?.title || '';
    document.getElementById('cms-who-sidebar-title').value = c.who?.sidebarTitle || '';
    document.getElementById('cms-who-lead').value = c.who?.lead || '';
    document.getElementById('cms-who-secondary').value = c.who?.secondary || '';
    document.getElementById('cms-who-promise').value = c.who?.promiseText || '';

    // Purpose
    document.getElementById('cms-purpose-title').value = c.purpose?.title || '';
    document.getElementById('cms-purpose-mission').value = c.purpose?.missionText || '';
    document.getElementById('cms-purpose-vision').value = c.purpose?.visionText || '';
    document.getElementById('cms-purpose-chars').value = (c.purpose?.characters || []).join(', ');

    // Services
    renderCmsServices(c.services || []);

    // Contact
    document.getElementById('cms-contact-name').value = c.contact?.leaderName || '';
    document.getElementById('cms-contact-title').value = c.contact?.leaderTitle || '';
    document.getElementById('cms-contact-email').value = c.contact?.email || '';
    document.getElementById('cms-contact-phones').value = (c.contact?.phones || []).join(', ');
    document.getElementById('cms-contact-addr1').value = c.contact?.addressLine1 || '';
    document.getElementById('cms-contact-addr2').value = c.contact?.addressLine2 || '';
    document.getElementById('cms-contact-map').value = c.contact?.mapUrl || '';
  }

  function renderCmsServices(services) {
    const container = document.getElementById('cms-services-container');
    if (!container) return;

    const headingPrefix = window.currentLang === 'en' ? 'Service Tier' : 'Hizmet Alanı';
    container.innerHTML = services.map((s, idx) => `
      <div style="background:var(--adm-card-hover);border:1px solid var(--adm-border);border-radius:6px;padding:18px;margin-bottom:16px;">
        <h4 style="color:var(--adm-gold-light);margin-bottom:12px;">${headingPrefix} ${idx + 1}: ${s.title}</h4>
        <div class="form-row">
          <div class="form-field">
            <label data-i18n="svcTitleLabel">${window.t('svcTitleLabel', 'Hizmet Başlığı')}</label>
            <input type="text" class="input-box cms-svc-title" data-idx="${idx}" value="${s.title}">
          </div>
          <div class="form-field">
            <label data-i18n="svcNoteLabel">${window.t('svcNoteLabel', 'Açıklama / Not')}</label>
            <input type="text" class="input-box cms-svc-note" data-idx="${idx}" value="${s.note || ''}">
          </div>
        </div>
        <div class="form-field">
          <label data-i18n="svcItemsLabel">${window.t('svcItemsLabel', 'Maddeler (Her satıra bir madde)')}</label>
          <textarea class="textarea-box cms-svc-items" data-idx="${idx}" style="min-height:70px;">${(s.items || []).join('\n')}</textarea>
        </div>
      </div>
    `).join('');
  }

  // Save Content Changes
  document.getElementById('btn-save-content')?.addEventListener('click', async () => {
    if (!currentSiteConfig) await loadSiteConfig();

    currentSiteConfig.hero = {
      ...currentSiteConfig.hero,
      tag: document.getElementById('cms-hero-tag').value,
      location: document.getElementById('cms-hero-location').value,
      title: document.getElementById('cms-hero-title').value,
      titleAccent: document.getElementById('cms-hero-title-accent').value,
      desc: document.getElementById('cms-hero-desc').value
    };

    currentSiteConfig.ticker = document.getElementById('cms-ticker-items').value
      .split('\n').map(s => s.trim()).filter(Boolean);

    currentSiteConfig.who = {
      ...currentSiteConfig.who,
      title: document.getElementById('cms-who-title').value,
      sidebarTitle: document.getElementById('cms-who-sidebar-title').value,
      lead: document.getElementById('cms-who-lead').value,
      secondary: document.getElementById('cms-who-secondary').value,
      promiseText: document.getElementById('cms-who-promise').value
    };

    currentSiteConfig.purpose = {
      ...currentSiteConfig.purpose,
      title: document.getElementById('cms-purpose-title').value,
      missionText: document.getElementById('cms-purpose-mission').value,
      visionText: document.getElementById('cms-purpose-vision').value,
      characters: document.getElementById('cms-purpose-chars').value
        .split(',').map(s => s.trim()).filter(Boolean)
    };

    // Services
    const svcTitles = document.querySelectorAll('.cms-svc-title');
    const svcNotes = document.querySelectorAll('.cms-svc-note');
    const svcItems = document.querySelectorAll('.cms-svc-items');
    svcTitles.forEach((el, i) => {
      if (currentSiteConfig.services[i]) {
        currentSiteConfig.services[i].title = el.value;
        currentSiteConfig.services[i].note = svcNotes[i]?.value || '';
        currentSiteConfig.services[i].items = (svcItems[i]?.value || '')
          .split('\n').map(s => s.trim()).filter(Boolean);
      }
    });

    currentSiteConfig.contact = {
      ...currentSiteConfig.contact,
      leaderName: document.getElementById('cms-contact-name').value,
      leaderTitle: document.getElementById('cms-contact-title').value,
      email: document.getElementById('cms-contact-email').value,
      phones: document.getElementById('cms-contact-phones').value.split(',').map(s => s.trim()).filter(Boolean),
      addressLine1: document.getElementById('cms-contact-addr1').value,
      addressLine2: document.getElementById('cms-contact-addr2').value,
      mapUrl: document.getElementById('cms-contact-map').value
    };

    try {
      const res = await fetch('/api/admin/config', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(currentSiteConfig)
      });
      if (res.ok) {
        showToast('Site içerikleri başarıyla kaydedildi!', 'success');
      }
    } catch (e) {}
  });

  // Reset Content to Defaults
  document.getElementById('btn-reset-content-defaults')?.addEventListener('click', async () => {
    if (!confirm('Tüm içerikleri fabrika ayarlarına döndürmek istediğinize emin misiniz?')) return;
    try {
      const res = await fetch('/api/admin/config/reset', { method: 'POST', headers: getAuthHeaders() });
      if (res.ok) {
        const data = await res.json();
        currentSiteConfig = data.config;
        loadContentData();
        loadThemeData();
        showToast('İçerikler varsayılan fabrika ayarlarına sıfırlandı.', 'info');
      }
    } catch (e) {}
  });

  // ==========================================
  // TAB 5: DYNAMIC SECTIONS BUILDER
  // ==========================================

  async function loadSectionsData() {
    try {
      const res = await fetch('/api/admin/sections', { headers: getAuthHeaders() });
      if (!res.ok) return;
      currentSections = await res.json();
      renderSectionsTable();
    } catch (e) {}
  }

  function renderSectionsTable() {
    const tbody = document.getElementById('dynamic-sections-table-body');
    if (!tbody) return;

    if (!currentSections || currentSections.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:20px;color:var(--adm-mute);">${window.t('noLogsData', 'Tanımlı ara section bulunmuyor.')}</td></tr>`;
      return;
    }

    tbody.innerHTML = currentSections.map((sec, idx) => `
      <tr>
        <td><strong>#${sec.order || (idx + 1)}</strong></td>
        <td>
          <strong>${sec.name || sec.title}</strong><br>
          <small style="color:var(--adm-mute);">${sec.title}</small>
        </td>
        <td><span class="badge badge-gray">${sec.type}</span></td>
        <td><code>#${sec.anchor || sec.id}</code></td>
        <td>
          <button class="badge ${sec.enabled ? 'badge-green' : 'badge-gray'}" style="cursor:pointer;border:none;" onclick="toggleSectionStatus('${sec.id}')">
            ${sec.enabled ? window.t('statusEnabled', 'Aktif') : window.t('statusDisabled', 'Gizli')}
          </button>
        </td>
        <td>
          <div style="display:flex;gap:6px;">
            <button class="btn-ui" style="padding:4px 8px;font-size:11px;" onclick="moveSection(${idx}, -1)" ${idx === 0 ? 'disabled' : ''} title="${window.t('btnMoveUp', 'Yukarı')}">▲</button>
            <button class="btn-ui" style="padding:4px 8px;font-size:11px;" onclick="moveSection(${idx}, 1)" ${idx === currentSections.length - 1 ? 'disabled' : ''} title="${window.t('btnMoveDown', 'Aşağı')}">▼</button>
            <button class="btn-ui danger" style="padding:4px 8px;font-size:11px;" onclick="deleteSection('${sec.id}')">${window.t('btnDelete', 'Sil')}</button>
          </div>
        </td>
      </tr>
    `).join('');
  }

  const renderDynamicSectionsTable = renderSectionsTable;

  window.toggleSectionStatus = async function (secId) {
    const sec = currentSections.find(s => s.id === secId);
    if (!sec) return;
    sec.enabled = !sec.enabled;
    await saveSectionsArray();
  };

  window.moveSection = async function (idx, dir) {
    const targetIdx = idx + dir;
    if (targetIdx < 0 || targetIdx >= currentSections.length) return;

    const temp = currentSections[idx];
    currentSections[idx] = currentSections[targetIdx];
    currentSections[targetIdx] = temp;

    // Update orders
    currentSections.forEach((s, i) => { s.order = i + 1; });
    await saveSectionsArray();
  };

  window.deleteSection = async function (secId) {
    if (!confirm('Bu section alanını silmek istediğinize emin misiniz?')) return;
    try {
      const res = await fetch(`/api/admin/sections/${secId}`, { method: 'DELETE', headers: getAuthHeaders() });
      if (res.ok) {
        showToast('Section silindi.', 'success');
        loadSectionsData();
      }
    } catch (e) {}
  };

  async function saveSectionsArray() {
    try {
      const res = await fetch('/api/admin/sections', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(currentSections)
      });
      if (res.ok) {
        showToast('Section listesi güncellendi.', 'success');
        renderSectionsTable();
      }
    } catch (e) {}
  }

  // Open Add Section Modal
  document.getElementById('btn-open-add-section-modal')?.addEventListener('click', () => {
    openModal('modal-add-section');
  });

  document.getElementById('form-add-section')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const title = document.getElementById('sec-title-input').value;
    const name = document.getElementById('sec-name-input').value;
    const tag = document.getElementById('sec-tag-input').value;
    const type = document.getElementById('sec-type-select').value;
    const subtitle = document.getElementById('sec-sub-input').value;

    try {
      const res = await fetch('/api/admin/sections/create', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ title, name, tag, type, subtitle })
      });
      if (res.ok) {
        showToast('Yeni section oluşturuldu!', 'success');
        closeModal('modal-add-section');
        document.getElementById('form-add-section').reset();
        loadSectionsData();
      }
    } catch (e) {}
  });

  // ==========================================
  // TAB 6: EMAIL CENTER
  // ==========================================

  async function loadEmailsData() {
    try {
      const res = await fetch('/api/admin/emails', { headers: getAuthHeaders() });
      if (!res.ok) return;
      currentEmails = await res.json();

      renderInboxTable(currentEmails.inbox || []);
      renderSentTable(currentEmails.sent || []);
      populateTemplatesSelect(currentEmails.templates || []);
      loadSmtpForm();
    } catch (e) {}
  }

  function renderInboxTable(inbox) {
    const tbody = document.getElementById('inbox-table-body');
    if (!tbody) return;

    if (inbox.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;padding:24px;color:var(--adm-mute);">${window.t('noInboxData', 'Gelen kutusu boş.')}</td></tr>`;
      return;
    }

    tbody.innerHTML = inbox.map(msg => `
      <tr style="${!msg.read ? 'font-weight:600;background:rgba(201,164,92,0.05);' : ''}">
        <td>
          <strong>${msg.name}</strong><br>
          <small style="color:var(--adm-mute);">${msg.email}</small>
        </td>
        <td><span class="badge badge-gold">${msg.service || window.t('generalCategory', 'Genel')}</span></td>
        <td>${msg.subject}</td>
        <td><small style="color:var(--adm-mute);">${new Date(msg.date).toLocaleDateString(window.currentLang === 'en' ? 'en-US' : 'tr-TR')}</small></td>
        <td>
          ${!msg.read ? `<span class="badge badge-gold">${window.t('statusNew', 'Yeni')}</span>` : `<span class="badge badge-gray">${window.t('statusRead', 'Okundu')}</span>`}
          ${msg.replied ? `<span class="badge badge-green" style="margin-left:4px;">${window.t('statusReplied', 'Yanıtlandı')}</span>` : ''}
        </td>
        <td>
          <div style="display:flex;gap:6px;">
            <button class="btn-ui" style="padding:4px 8px;font-size:11px;" onclick="viewMessageDetail('${msg.id}')">${window.t('btnReply', 'Görüntüle')}</button>
            <button class="btn-ui danger" style="padding:4px 8px;font-size:11px;" onclick="deleteInboxMessage('${msg.id}')">${window.t('btnDelete', 'Sil')}</button>
          </div>
        </td>
      </tr>
    `).join('');
  }

  function renderSentTable(sent) {
    const tbody = document.getElementById('sent-table-body');
    if (!tbody) return;

    if (sent.length === 0) {
      tbody.innerHTML = `<tr><td colspan="5" style="text-align:center;padding:20px;color:var(--adm-mute);">${window.t('noSentData', 'Gönderilen e-posta kaydı bulunmuyor.')}</td></tr>`;
      return;
    }

    tbody.innerHTML = sent.map(s => {
      const statusLabel = s.status && s.status.includes('Delivered') ? window.t('statusDelivered', 'İletildi') : s.status;
      return `
      <tr>
        <td><code>${s.to}</code></td>
        <td>${s.subject}</td>
        <td><span class="badge badge-gray">${s.template || window.t('customEmailOption', 'Özel')}</span></td>
        <td><span class="badge ${s.status.includes('Delivered') ? 'badge-green' : 'badge-gold'}">${statusLabel}</span></td>
        <td><small style="color:var(--adm-mute);">${new Date(s.sentAt).toLocaleString(window.currentLang === 'en' ? 'en-US' : 'tr-TR')}</small></td>
      </tr>
      `;
    }).join('');
  }

  function populateTemplatesSelect(templates) {
    const sel = document.getElementById('compose-template-select');
    if (!sel) return;

    sel.innerHTML = `<option value="">${window.t('customEmailOption', 'Özel E-Posta Yaz')}</option>` +
      templates.map(t => `<option value="${t.id}">${t.name}</option>`).join('');

    sel.onchange = () => {
      const t = templates.find(x => x.id === sel.value);
      if (t) {
        document.getElementById('compose-subject').value = t.subject;
        document.getElementById('compose-body').value = t.body;
      }
    };
  }

  window.viewMessageDetail = async function (msgId) {
    const msg = (currentEmails.inbox || []).find(m => m.id === msgId);
    if (!msg) return;

    // Mark as read
    if (!msg.read) {
      fetch(`/api/admin/emails/inbox/${msgId}/read`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ read: true })
      }).then(() => {
        msg.read = true;
        renderInboxTable(currentEmails.inbox || []);
      });
    }

    const modal = document.getElementById('modal-message-detail');
    const content = document.getElementById('modal-msg-content');

    content.innerHTML = `
      <div style="margin-bottom:18px;">
        <p><strong>Gönderen:</strong> ${msg.name} (&lt;${msg.email}&gt;)</p>
        <p><strong>Telefon:</strong> ${msg.phone || 'Belirtilmedi'}</p>
        <p><strong>Hizmet Alanı:</strong> ${msg.service || 'Genel'}</p>
        <p><strong>Tarih:</strong> ${new Date(msg.date).toLocaleString()}</p>
        <p><strong>Konu:</strong> ${msg.subject}</p>
      </div>
      <div style="background:var(--adm-input-bg);padding:18px;border:1px solid var(--adm-border);border-radius:6px;white-space:pre-line;line-height:1.7;">
        ${msg.message}
      </div>
      <div style="margin-top:20px;display:flex;justify-content:flex-end;gap:10px;">
        <button class="btn-ui gold" onclick="replyToSender('${msg.email}', '${msg.subject.replace(/'/g, "\\'")}')">Bu Mesajı Yanıtla</button>
      </div>
    `;

    openModal('modal-message-detail');
  };

  window.replyToSender = function (email, subject) {
    closeModal('modal-message-detail');
    document.querySelector('.subtab-btn[data-subtab="email-compose"]')?.click();
    document.getElementById('compose-to').value = email;
    document.getElementById('compose-subject').value = subject.startsWith('RE:') ? subject : `RE: ${subject}`;
    document.getElementById('compose-body').focus();
  };

  window.deleteInboxMessage = async function (msgId) {
    if (!confirm('Bu mesajı silmek istediğinize emin misiniz?')) return;
    try {
      const res = await fetch(`/api/admin/emails/inbox/${msgId}`, { method: 'DELETE', headers: getAuthHeaders() });
      if (res.ok) {
        showToast('Mesaj silindi.', 'success');
        loadEmailsData();
      }
    } catch (e) {}
  };

  // Compose Email Form Submit
  document.getElementById('compose-email-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const to = document.getElementById('compose-to').value;
    const subject = document.getElementById('compose-subject').value;
    const body = document.getElementById('compose-body').value;
    const btn = document.getElementById('btn-send-email-submit');

    btn.disabled = true;
    btn.textContent = 'Gönderiliyor...';

    try {
      const res = await fetch('/api/admin/emails/send', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ to, subject, body })
      });
      const data = await res.json();
      if (res.ok) {
        showToast(data.message || 'E-posta başarıyla iletildi!', 'success');
        document.getElementById('compose-email-form').reset();
        loadEmailsData();
        document.querySelector('.subtab-btn[data-subtab="email-sent"]')?.click();
      } else {
        showToast(data.error || 'Gönderim başarısız.', 'error');
      }
    } catch (err) {
      showToast('E-posta gönderiminde hata oluştu.', 'error');
    } finally {
      btn.disabled = false;
      btn.textContent = 'E-Postayı Gönder';
    }
  });

  // SMTP Settings Form
  function loadSmtpForm() {
    if (!currentSiteConfig || !currentSiteConfig.smtp) return;
    const s = currentSiteConfig.smtp;
    document.getElementById('smtp-host').value = s.host || '';
    document.getElementById('smtp-port').value = s.port || 587;
    document.getElementById('smtp-user').value = s.user || '';
    document.getElementById('smtp-pass').value = s.pass || '';
    document.getElementById('smtp-from-email').value = s.fromEmail || '';
    document.getElementById('smtp-from-name').value = s.fromName || '';
    document.getElementById('smtp-enabled').checked = !!s.enabled;
  }

  document.getElementById('smtp-settings-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!currentSiteConfig) await loadSiteConfig();

    currentSiteConfig.smtp = {
      host: document.getElementById('smtp-host').value,
      port: parseInt(document.getElementById('smtp-port').value) || 587,
      user: document.getElementById('smtp-user').value,
      pass: document.getElementById('smtp-pass').value,
      fromEmail: document.getElementById('smtp-from-email').value,
      fromName: document.getElementById('smtp-from-name').value,
      enabled: document.getElementById('smtp-enabled').checked
    };

    try {
      const res = await fetch('/api/admin/config', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(currentSiteConfig)
      });
      if (res.ok) {
        showToast('SMTP ayarları kaydedildi!', 'success');
      }
    } catch (e) {}
  });

  // ==========================================
  // TAB 7: SVG ICON LIBRARY
  // ==========================================

  async function loadIconsData() {
    try {
      const res = await fetch('/api/admin/icons', { headers: getAuthHeaders() });
      if (!res.ok) return;
      currentIcons = await res.json();
      renderIconsGrid(currentIcons);
    } catch (e) {}
  }

  function renderIconsGrid(icons) {
    const container = document.getElementById('icon-grid-container');
    if (!container) return;

    if (icons.length === 0) {
      container.innerHTML = `<p style="grid-column:1/-1;text-align:center;padding:40px;color:var(--adm-mute);">${window.t('noIconsData', 'Eşleşen SVG ikonu bulunamadı.')}</p>`;
      return;
    }

    container.innerHTML = icons.map(ic => `
      <div class="icon-card">
        <div class="icon-preview-box">${ic.svg}</div>
        <div class="icon-name">${ic.name}</div>
        <div class="icon-category-tag">${ic.category}</div>
        <div style="font-size:12px;color:var(--adm-mute);margin-bottom:14px;line-height:1.4;">${ic.description || ''}</div>
        <div class="icon-actions">
          <button class="btn-ui gold" onclick="copyIconSvg('${ic.id}')" title="${window.t('btnCopySvg', 'SVG Kopyala')}">${window.t('btnCopySvg', 'SVG Kopyala')}</button>
          <button class="btn-ui" onclick="copyIconId('${ic.id}')" title="${window.t('btnCopyId', 'ID')}">${window.t('btnCopyId', 'ID')}</button>
          <button class="btn-ui" onclick="downloadIconSvg('${ic.id}')" title="${window.t('btnDownloadSvg', 'İndir')}">${window.t('btnDownloadSvg', 'İndir')}</button>
        </div>
      </div>
    `).join('');
  }

  // Filter category chips
  document.querySelectorAll('.cat-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('.cat-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');

      const cat = chip.dataset.cat;
      const term = (document.getElementById('icon-search-input')?.value || '').toLowerCase();
      filterIcons(cat, term);
    });
  });

  document.getElementById('icon-search-input')?.addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    const activeChip = document.querySelector('.cat-chip.active');
    const cat = activeChip ? activeChip.dataset.cat : 'all';
    filterIcons(cat, term);
  });

  function filterIcons(cat, term) {
    let filtered = currentIcons;
    if (cat && cat !== 'all') {
      filtered = filtered.filter(i => i.category.toLowerCase() === cat.toLowerCase());
    }
    if (term) {
      filtered = filtered.filter(i =>
        i.name.toLowerCase().includes(term) ||
        (i.tags && i.tags.some(t => t.toLowerCase().includes(term))) ||
        (i.description && i.description.toLowerCase().includes(term))
      );
    }
    renderIconsGrid(filtered);
  }

  window.copyIconSvg = function (iconId) {
    const ic = currentIcons.find(i => i.id === iconId);
    if (!ic) return;
    navigator.clipboard.writeText(ic.svg);
    showToast(`${ic.name} SVG kodu kopyalandı!`, 'success');
  };

  window.copyIconId = function (iconId) {
    navigator.clipboard.writeText(iconId);
    showToast(`İkon ID '${iconId}' kopyalandı!`, 'info');
  };

  window.downloadIconSvg = function (iconId) {
    const ic = currentIcons.find(i => i.id === iconId);
    if (!ic) return;
    const blob = new Blob([ic.svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${ic.id}.svg`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  // Add Custom SVG Icon Modal
  document.getElementById('btn-open-add-icon-modal')?.addEventListener('click', () => {
    openModal('modal-add-icon');
  });

  document.getElementById('form-add-icon')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('icon-add-name').value;
    const category = document.getElementById('icon-add-cat').value;
    const description = document.getElementById('icon-add-desc').value;
    const tags = document.getElementById('icon-add-tags').value;
    const svg = document.getElementById('icon-add-svg').value;

    try {
      const res = await fetch('/api/admin/icons', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ name, category, description, tags, svg })
      });
      if (res.ok) {
        showToast('Yeni SVG ikon kütüphaneye eklendi!', 'success');
        closeModal('modal-add-icon');
        document.getElementById('form-add-icon').reset();
        loadIconsData();
      }
    } catch (e) {}
  });

  // ==========================================
  // TAB 8: SYSTEM PREFERENCES & SUPABASE
  // ==========================================

  async function loadSupabaseStatus() {
    try {
      const res = await fetch('/api/admin/supabase/status', { headers: getAuthHeaders() });
      if (!res.ok) return;
      const data = await res.json();

      const badge = document.getElementById('supabase-status-badge');
      const urlInput = document.getElementById('supabase-url-input');

      if (urlInput && data.url) {
        urlInput.value = data.url;
      }

      if (badge) {
        if (data.configured && data.tablesExist) {
          badge.className = 'badge badge-green';
          badge.textContent = '🟢 Supabase Aktif & Bağlı';
        } else if (data.configured) {
          badge.className = 'badge badge-gold';
          badge.textContent = '🟡 Bağlı (Tablolar Bekleniyor)';
        } else {
          badge.className = 'badge badge-gray';
          badge.textContent = '⚪ Yerel Mod (Yapılandırma Bekleniyor)';
        }
      }
    } catch (e) {}
  }

  // Supabase Setup Form Submit
  document.getElementById('supabase-config-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const supabaseUrl = document.getElementById('supabase-url-input').value;
    const supabaseKey = document.getElementById('supabase-key-input').value;
    const alertBox = document.getElementById('supabase-alert-box');
    const submitBtn = document.getElementById('btn-save-supabase');

    submitBtn.disabled = true;
    submitBtn.textContent = 'Test Ediliyor...';
    if (alertBox) alertBox.style.display = 'none';

    try {
      const res = await fetch('/api/admin/supabase/setup', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ supabaseUrl, supabaseKey })
      });
      const data = await res.json();

      if (alertBox) {
        alertBox.style.display = 'block';
        if (data.success) {
          alertBox.style.background = 'rgba(16, 185, 129, 0.15)';
          alertBox.style.border = '1px solid var(--adm-success)';
          alertBox.style.color = '#a7f3d0';
          alertBox.innerHTML = `<strong>Bağlantı Başarılı:</strong> ${data.message}`;
          showToast('Supabase başarıyla bağlandı!', 'success');
        } else {
          alertBox.style.background = 'rgba(239, 68, 68, 0.15)';
          alertBox.style.border = '1px solid var(--adm-danger)';
          alertBox.style.color = '#fca5a5';
          alertBox.innerHTML = `<strong>Bağlantı Uyarısı:</strong> ${data.message}`;
        }
      }
      loadSupabaseStatus();
    } catch (err) {
      showToast('Supabase bağlantı testi sırasında hata oluştu.', 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Bağlantıyı Kaydet & Test Et';
    }
  });

  // Supabase 1-Click Sync & Seed Button
  document.getElementById('btn-sync-supabase')?.addEventListener('click', async () => {
    const alertBox = document.getElementById('supabase-alert-box');
    showToast('Veriler Supabase tablolarına aktarılıyor...', 'info');

    try {
      const res = await fetch('/api/admin/supabase/sync', {
        method: 'POST',
        headers: getAuthHeaders()
      });
      const data = await res.json();

      if (alertBox) {
        alertBox.style.display = 'block';
        if (data.success) {
          alertBox.style.background = 'rgba(16, 185, 129, 0.15)';
          alertBox.style.border = '1px solid var(--adm-success)';
          alertBox.style.color = '#a7f3d0';
          alertBox.innerHTML = `<strong>Veri Aktarımı Tamamlandı:</strong> ${data.message}`;
          showToast('Tüm veriler Supabase ile başarıyla eşitlendi!', 'success');
        } else {
          alertBox.style.background = 'rgba(239, 68, 68, 0.15)';
          alertBox.style.border = '1px solid var(--adm-danger)';
          alertBox.style.color = '#fca5a5';
          alertBox.innerHTML = `<strong>Hata:</strong> ${data.error || 'Aktarım başarısız'}`;
        }
      }
      loadSupabaseStatus();
    } catch (e) {
      showToast('Eşitleme sırasında hata oluştu.', 'error');
    }
  });

  // Copy SQL Schema Button
  document.getElementById('btn-copy-sql-schema')?.addEventListener('click', () => {
    const sqlSchema = `-- ========================================================
-- ABENTRA INTERNATIONAL - SUPABASE DATABASE SCHEMA
-- ========================================================
CREATE TABLE IF NOT EXISTS abentra_config (
  id TEXT PRIMARY KEY DEFAULT 'site_config',
  data JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS abentra_sections (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  title TEXT NOT NULL,
  tag TEXT,
  tag_sub TEXT,
  subtitle TEXT,
  type TEXT DEFAULT 'cards',
  enabled BOOLEAN DEFAULT true,
  "order" INT DEFAULT 1,
  anchor TEXT,
  items JSONB DEFAULT '[]'::jsonb,
  custom_html TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS abentra_icons (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  tags TEXT[] DEFAULT '{}',
  svg TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS abentra_visitors (
  id TEXT PRIMARY KEY,
  ip TEXT,
  country TEXT DEFAULT 'Liberia',
  city TEXT DEFAULT 'Monrovia',
  device TEXT DEFAULT 'Desktop',
  browser TEXT,
  os TEXT,
  referer TEXT,
  first_seen TIMESTAMPTZ DEFAULT NOW(),
  last_seen TIMESTAMPTZ DEFAULT NOW(),
  duration_seconds INT DEFAULT 0,
  sections_viewed JSONB DEFAULT '[]'::jsonb
);

CREATE TABLE IF NOT EXISTS abentra_section_stats (
  section_id TEXT PRIMARY KEY,
  views_count INT DEFAULT 0,
  time_seconds INT DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS abentra_inquiries (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  subject TEXT,
  service TEXT,
  message TEXT NOT NULL,
  date TIMESTAMPTZ DEFAULT NOW(),
  read BOOLEAN DEFAULT false,
  replied BOOLEAN DEFAULT false
);

CREATE TABLE IF NOT EXISTS abentra_sent_emails (
  id TEXT PRIMARY KEY,
  "to" TEXT NOT NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  template TEXT,
  sent_at TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'Delivered',
  error_details TEXT
);

CREATE TABLE IF NOT EXISTS abentra_email_templates (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS abentra_users (
  id TEXT PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  salt TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT DEFAULT 'Super Administrator',
  email TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_login TIMESTAMPTZ
);`;

    navigator.clipboard.writeText(sqlSchema);
    showToast('Supabase SQL Şeması panoya kopyalandı! Supabase Dashboard -> SQL Editor alanına yapıştırabilirsiniz.', 'success');
  });

  document.getElementById('change-password-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const currentPassword = document.getElementById('pass-current').value;
    const newUsername = document.getElementById('pass-new-username')?.value || '';
    const newPassword = document.getElementById('pass-new').value;
    const confirmPassword = document.getElementById('pass-confirm').value;

    if (newPassword !== confirmPassword) {
      showToast('Yeni şifreler birbiriyle eşleşmiyor!', 'error');
      return;
    }

    try {
      const res = await fetch('/api/admin/credentials', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ currentPassword, newUsername, newPassword })
      });
      const data = await res.json();
      if (res.ok) {
        showToast(data.message || 'Yönetici bilgileri başarıyla güncellendi!', 'success');
        if (data.username) {
          const nameEl = document.getElementById('current-user-name');
          if (nameEl) nameEl.textContent = data.username;
        }
        document.getElementById('change-password-form').reset();
      } else {
        showToast(data.error || 'Bilgiler güncellenemedi.', 'error');
      }
    } catch (e) {
      showToast('İşlem sırasında bir hata oluştu.', 'error');
    }
  });

  // ==========================================
  // MODALS & TOAST UTILITIES
  // ==========================================

  window.openModal = function (modalId) {
    const el = document.getElementById(modalId);
    if (el) el.classList.add('open');
  };

  window.closeModal = function (modalId) {
    const el = document.getElementById(modalId);
    if (el) el.classList.remove('open');
  };

  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) overlay.classList.remove('open');
    });
  });

  window.showToast = function (message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/></svg>
      <span>${message}</span>
    `;

    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transition = 'opacity .3s';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  };

  // ==========================================
  // TAB 9: USERS & RBAC MANAGEMENT
  // ==========================================

  let currentUsersList = [];

  async function loadUsersData() {
    try {
      const res = await fetch('/api/admin/users', { headers: getAuthHeaders() });
      if (res.ok) {
        const data = await res.json();
        currentUsersList = data.users || [];
        renderUsersTable(currentUsersList);
        document.getElementById('kpi-total-admins').textContent = currentUsersList.length;
      }
    } catch (e) {
      console.warn('loadUsersData error:', e);
    }
    loadAuditLogs();
  }

  function renderUsersTable(users) {
    const tbody = document.getElementById('users-table-body');
    if (!tbody) return;

    if (users.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:20px;color:var(--adm-mute);">Kayıtlı yönetici bulunamadı.</td></tr>`;
      return;
    }

    tbody.innerHTML = users.map(u => {
      const roleUpper = (u.role || 'admin').toUpperCase();
      const roleBadgeClass = u.role === 'superadmin' ? 'badge-gold'
        : u.role === 'ads_manager' ? 'badge-blue'
        : u.role === 'developer' ? 'badge-purple' : 'badge-green';

      const permsList = (u.permissions || []).includes('all')
        ? '<span class="badge badge-gold">TAM ERİŞİM (ALL)</span>'
        : (u.permissions || []).map(p => `<span class="badge badge-gray" style="font-size:10px;margin-right:2px;">${p}</span>`).join('') || '<span class="badge badge-gray">Kısıtlı</span>';

      const lastLoginStr = u.lastLogin
        ? `<div style="font-size:12px;"><span>${u.lastLoginFlag || '🌐'}</span> <code>${u.lastLoginIp || '-'}</code></div><small style="color:var(--adm-mute);font-size:11px;">${new Date(u.lastLogin).toLocaleString()}</small>`
        : '<small style="color:var(--adm-mute);">Henüz Giriş Yapmadı</small>';

      const isPrimarySuper = u.id === 'usr_01';

      return `
        <tr>
          <td><strong>${u.username}</strong></td>
          <td>${u.name}<br><small style="color:var(--adm-mute);">${u.email || '-'}</small></td>
          <td><span class="badge ${roleBadgeClass}">${roleUpper}</span></td>
          <td>${permsList}</td>
          <td>
            <div class="pass-toggle-wrap">
              <span class="pass-masked-val" id="pass-mask-${u.id}">••••••</span>
              <button type="button" class="pass-toggle-btn" onclick="togglePasswordVisibility('${u.id}', '${u.password}')">${window.t('showPass', 'Göster')}</button>
            </div>
          </td>
          <td>${lastLoginStr}</td>
          <td>
            <div style="display:flex;gap:6px;">
              <button class="btn-ui btn-sm" onclick="openEditUserModal('${u.id}')">${window.t('btnEdit', 'Düzenle')}</button>
              ${isPrimarySuper ? '' : `<button class="btn-danger btn-sm" onclick="deleteAdminUser('${u.id}')">${window.t('btnDelete', 'Sil')}</button>`}
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  window.togglePasswordVisibility = function (userId, plainPass) {
    const el = document.getElementById(`pass-mask-${userId}`);
    if (!el) return;
    if (el.textContent === '••••••') {
      el.textContent = plainPass;
    } else {
      el.textContent = '••••••';
    }
  };

  async function loadAuditLogs() {
    try {
      const res = await fetch('/api/admin/audit-logs', { headers: getAuthHeaders() });
      if (!res.ok) return;
      const data = await res.json();
      renderAuditLogsTable(data.logs || []);
    } catch (e) {}
  }

  function renderAuditLogsTable(logs) {
    const tbody = document.getElementById('audit-table-body');
    if (!tbody) return;

    if (logs.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" style="text-align:center;padding:20px;color:var(--adm-mute);">Henüz giriş denetim kaydı bulunmuyor.</td></tr>`;
      return;
    }

    const last = logs[0];
    if (last) {
      document.getElementById('kpi-last-audit').textContent = `${last.username} (${last.role || 'Admin'})`;
      document.getElementById('kpi-last-audit-sub').textContent = `${last.flag || ''} ${last.ip || ''} · ${last.status}`;
    }

    tbody.innerHTML = logs.map(l => {
      const timeStr = l.timestamp ? new Date(l.timestamp).toLocaleString() : '-';
      const isSuccess = l.status === 'Success';
      const statusBadge = isSuccess
        ? '<span class="badge badge-green">Başarılı</span>'
        : `<span class="badge badge-danger">${l.status}</span>`;

      return `
        <tr>
          <td><small style="color:var(--adm-mute);">${timeStr}</small></td>
          <td><strong>${l.username}</strong></td>
          <td><span class="badge badge-gray">${l.role}</span></td>
          <td><code>${l.ip}</code></td>
          <td><span style="font-size:15px;margin-right:4px;">${l.flag || '🌐'}</span> ${l.city || ''} ${l.country || ''}</td>
          <td><small>${l.device || '-'} · ${l.browser || '-'}</small></td>
          <td>${statusBadge}</td>
        </tr>
      `;
    }).join('');
  }

  document.getElementById('btn-refresh-audit')?.addEventListener('click', loadAuditLogs);

  // User Add/Edit Modal
  const userModal = document.getElementById('modal-user');
  const userForm = document.getElementById('form-manage-user');
  const userRoleSelect = document.getElementById('manage-user-role-select');

  document.getElementById('btn-open-add-user-modal')?.addEventListener('click', () => {
    document.getElementById('modal-user-title').textContent = window.t('modalAddUserTitle', 'Yeni Yönetici Hesabı Ekle');
    document.getElementById('manage-user-id').value = '';
    document.getElementById('manage-user-username').value = '';
    document.getElementById('manage-user-password').value = '';
    document.getElementById('manage-user-name').value = '';
    document.getElementById('manage-user-email').value = '';
    if (userRoleSelect) userRoleSelect.value = 'admin';
    applyRoleToPermCheckboxes('admin');
    openModal('modal-user');
  });

  window.openEditUserModal = function (userId) {
    const user = currentUsersList.find(u => u.id === userId);
    if (!user) return;

    document.getElementById('modal-user-title').textContent = window.t('modalEditUserTitle', 'Yönetici Hesabını Düzenle');
    document.getElementById('manage-user-id').value = user.id;
    document.getElementById('manage-user-username').value = user.username;
    document.getElementById('manage-user-password').value = user.password || '';
    document.getElementById('manage-user-name').value = user.name || '';
    document.getElementById('manage-user-email').value = user.email || '';
    if (userRoleSelect) userRoleSelect.value = user.role || 'admin';

    // Set permission checkboxes
    const perms = user.permissions || [];
    document.querySelectorAll('.perm-cb').forEach(cb => {
      cb.checked = perms.includes('all') || perms.includes(cb.value);
    });

    openModal('modal-user');
  };

  function applyRoleToPermCheckboxes(role) {
    const cbs = document.querySelectorAll('.perm-cb');
    if (role === 'superadmin') {
      cbs.forEach(cb => cb.checked = true);
    } else if (role === 'ads_manager') {
      cbs.forEach(cb => {
        cb.checked = ['dashboard', 'logs', 'heatmap', 'export'].includes(cb.value);
      });
    } else if (role === 'developer') {
      cbs.forEach(cb => {
        cb.checked = ['theme', 'content', 'sections', 'icons', 'logs', 'export'].includes(cb.value);
      });
    } else if (role === 'admin') {
      cbs.forEach(cb => {
        cb.checked = ['dashboard', 'logs', 'sections', 'emails', 'content', 'export'].includes(cb.value);
      });
    }
  }

  if (userRoleSelect) {
    userRoleSelect.addEventListener('change', (e) => {
      applyRoleToPermCheckboxes(e.target.value);
    });
  }

  if (userForm) {
    userForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const id = document.getElementById('manage-user-id').value;
      const username = document.getElementById('manage-user-username').value.trim();
      const password = document.getElementById('manage-user-password').value.trim();
      const name = document.getElementById('manage-user-name').value.trim();
      const email = document.getElementById('manage-user-email').value.trim();
      const role = userRoleSelect ? userRoleSelect.value : 'admin';

      const permissions = [];
      document.querySelectorAll('.perm-cb:checked').forEach(cb => permissions.push(cb.value));

      const payload = { username, password, name, email, role, permissions };

      try {
        const url = id ? `/api/admin/users/${id}` : '/api/admin/users';
        const method = id ? 'PUT' : 'POST';
        const res = await fetch(url, {
          method,
          headers: getAuthHeaders(),
          body: JSON.stringify(payload)
        });

        const data = await res.json();
        if (res.ok) {
          showToast(data.message || 'İşlem başarılı!', 'success');
          closeModal('modal-user');
          loadUsersData();
        } else {
          alert(data.error || 'Hata oluştu');
        }
      } catch (err) {
        alert('Sunucu iletişim hatası');
      }
    });
  }

  window.deleteAdminUser = async function (userId) {
    if (!confirm('Bu yönetici hesabını silmek istediğinize emin misiniz?')) return;
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      });
      const data = await res.json();
      if (res.ok) {
        showToast(data.message || 'Yönetici hesabı silindi.', 'success');
        loadUsersData();
      } else {
        alert(data.error || 'Silme başarısız');
      }
    } catch (e) {
      alert('Silme işlemi sırasında hata oluştu.');
    }
  };

  // ==========================================
  // GRANULAR METRIC PURGE HANDLERS
  // ==========================================

  let pendingPurgeTarget = null;
  const purgeModal = document.getElementById('modal-purge-confirm');
  const purgeMsg = document.getElementById('purge-confirm-message');

  document.querySelectorAll('.btn-purge-action').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.purge;
      pendingPurgeTarget = target;

      const targetNames = {
        visitors: 'Ziyaretçi Logları ve Sayaçları',
        heatmap: 'Bölüm Isı Haritası ve Süre Verileri',
        geo: 'Cihaz, Tarayıcı ve Ülke Dağılım Metrikleri',
        emails: 'Gelen Kutusu ve Gönderilen Mesaj Geçmişi',
        audit: 'Yönetici Giriş Denetim Kayıtları',
        all: 'TÜM İSTATİSTİKLER VE METRİKLER (GENEL SIFIRLAMA)'
      };

      const name = targetNames[target] || target;
      if (purgeMsg) {
        purgeMsg.innerHTML = `<strong>${name}</strong> kalıcı olarak temizlenecektir. Devam etmek istiyor musunuz?`;
      }
      openModal('modal-purge-confirm');
    });
  });

  document.getElementById('btn-confirm-purge-execute')?.addEventListener('click', async () => {
    if (!pendingPurgeTarget) return;

    try {
      const res = await fetch('/api/admin/metrics/purge', {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ target: pendingPurgeTarget })
      });

      const data = await res.json();
      if (res.ok) {
        showToast(data.message || 'Metrikler temizlendi.', 'success');
        closeModal('modal-purge-confirm');
        loadDashboardData();
        loadLogsTable();
        loadAuditLogs();
        loadEmailsData();
      } else {
        alert(data.error || 'Temizleme başarısız');
      }
    } catch (e) {
      alert('İşlem sırasında hata oluştu.');
    }
  });

  // ==========================================
  // EXPORT HANDLERS (CSV & LUXURY PDF DOSSIER)
  // ==========================================

  function triggerCsvExport() {
    window.location.href = `/api/admin/metrics/export-csv?token=${authToken}`;
  }

  document.getElementById('btn-settings-export-csv')?.addEventListener('click', triggerCsvExport);

  function triggerPdfExport() {
    if (!currentAnalytics) {
      showToast('Analitik verileri henüz yüklenmedi, lütfen bekleyin.', 'warning');
      return;
    }
    const summary = currentAnalytics.summary || {};
    const views = currentAnalytics.sectionViews || {};
    const times = currentAnalytics.sectionTimeSeconds || {};
    const countryStats = currentAnalytics.countryStats || {};
    const deviceStats = currentAnalytics.deviceStats || {};
    const visitors = currentAnalytics.recentVisitors || [];

    const now = new Date();
    const dateFormatted = now.toLocaleDateString('tr-TR', { day: '2-digit', month: 'long', year: 'numeric' });
    const timeFormatted = now.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const refCode = `ABT-INTEL-${now.getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    // Fill Letterhead & Metadata
    const refEl = document.getElementById('print-report-ref');
    if (refEl) refEl.textContent = `REF: ${refCode}`;
    const dateEl = document.getElementById('print-report-date');
    if (dateEl) dateEl.textContent = `Tarih: ${dateFormatted} · ${timeFormatted}`;
    const adminEl = document.getElementById('print-report-admin');
    if (adminEl) adminEl.textContent = `Yetkili: ${currentUser ? currentUser.name : 'Yönetici'} (${(currentUser?.role || 'Admin').toUpperCase()})`;
    const hashEl = document.getElementById('print-report-hash');
    if (hashEl) hashEl.textContent = `SİSTEM DOĞRULAMA KODU: SHA256-ABT-${refCode}-${Date.now().toString(16).toUpperCase()}`;

    // Fill KPI Metrics
    const visitsEl = document.getElementById('print-kpi-visits');
    if (visitsEl) visitsEl.textContent = (summary.totalVisits || 0).toLocaleString();
    const uniqueEl = document.getElementById('print-kpi-unique');
    if (uniqueEl) uniqueEl.textContent = (summary.uniqueVisitors || 0).toLocaleString();
    const pageviewsEl = document.getElementById('print-kpi-pageviews');
    if (pageviewsEl) pageviewsEl.textContent = (summary.pageViews || 0).toLocaleString();
    const durationEl = document.getElementById('print-kpi-duration');
    if (durationEl) durationEl.textContent = formatSeconds(summary.avgDurationSeconds || 0);

    // Country Breakdown with Percentages
    const cntTbody = document.getElementById('print-country-table-body');
    if (cntTbody) {
      const totalCnt = Object.values(countryStats).reduce((a, b) => a + b, 0) || 1;
      const cntRows = Object.entries(countryStats)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([cnt, count]) => {
          const pct = Math.round((count / totalCnt) * 100);
          return `<tr>
            <td><strong>${cnt}</strong></td>
            <td style="text-align:right;">${count}</td>
            <td style="text-align:right;color:#8d6a2e;font-weight:600;">%${pct}</td>
          </tr>`;
        }).join('');
      cntTbody.innerHTML = cntRows || '<tr><td colspan="3" style="text-align:center;color:#999;">Henüz coğrafi veri kaydı bulunmuyor.</td></tr>';
    }

    // Device Breakdown with Percentages
    const devTbody = document.getElementById('print-device-table-body');
    if (devTbody) {
      const totalDev = Object.values(deviceStats).reduce((a, b) => a + b, 0) || 1;
      const devRows = Object.entries(deviceStats)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8)
        .map(([dev, count]) => {
          const pct = Math.round((count / totalDev) * 100);
          return `<tr>
            <td><strong>${dev}</strong></td>
            <td style="text-align:right;">${count}</td>
            <td style="text-align:right;color:#8d6a2e;font-weight:600;">%${pct}</td>
          </tr>`;
        }).join('');
      devTbody.innerHTML = devRows || '<tr><td colspan="3" style="text-align:center;color:#999;">Henüz cihaz verisi kaydı bulunmuyor.</td></tr>';
    }

    // Section Heatmap Telemetry Table
    const heatTbody = document.getElementById('print-heatmap-table-body');
    if (heatTbody) {
      const heatRows = Object.entries(views)
        .sort((a, b) => b[1] - a[1])
        .map(([sec, count]) => {
          const totalSec = times[sec] || 0;
          const avgSec = count > 0 ? Math.round(totalSec / count) : 0;
          return `<tr>
            <td><strong>${getHumanSectionName(sec)}</strong> <code>#${sec}</code></td>
            <td><strong>${count}</strong> görüntüleme</td>
            <td>${formatSeconds(totalSec)}</td>
            <td style="color:#8d6a2e;font-weight:600;">${formatSeconds(avgSec)} / ziyaret</td>
          </tr>`;
        }).join('');
      heatTbody.innerHTML = heatRows || '<tr><td colspan="4" style="text-align:center;color:#999;">Isı haritası verisi bulunmuyor.</td></tr>';
    }

    // Recent Visitors Table
    const visTbody = document.getElementById('print-visitors-table-body');
    if (visTbody) {
      const visRows = visitors.slice(0, 15).map(v => `
        <tr>
          <td><code style="font-weight:600;">${v.id}</code><br><small style="color:#777;">${v.ip}</small></td>
          <td><strong>${v.flag || '🌐'} ${v.country || 'Belirsiz'}</strong><br><small style="color:#777;">${v.city || 'Konum Yok'}</small></td>
          <td>${v.device || 'Bilinmiyor'} · <small style="color:#666;">${v.browser || ''}</small></td>
          <td style="font-weight:600;color:#0a2038;">${formatSeconds(v.durationSeconds || 0)}</td>
          <td><small style="color:#555;">${new Date(v.firstSeen || Date.now()).toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}</small></td>
        </tr>
      `).join('');
      visTbody.innerHTML = visRows || '<tr><td colspan="5" style="text-align:center;color:#999;">Kayıtlı aktif oturum bulunamadı.</td></tr>';
    }

    // Trigger Print
    window.print();
  }

  document.getElementById('btn-settings-export-pdf')?.addEventListener('click', triggerPdfExport);

  // Start Auth Check
  checkAuth();
});
