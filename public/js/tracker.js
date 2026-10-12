// Precision Visitor & Section View Analytics Tracker with Enhanced Geo & IP Telemetry
(function () {
  let visitorId = localStorage.getItem('abentra_visitor_id');
  if (!visitorId) {
    visitorId = 'vis_' + Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
    localStorage.setItem('abentra_visitor_id', visitorId);
  }

  // 1. Collect Device & Client Environment
  const clientEnv = {
    visitorId,
    referer: document.referrer || 'Direct Entry',
    screenWidth: window.screen ? window.screen.width : window.innerWidth,
    screenHeight: window.screen ? window.screen.height : window.innerHeight,
    devicePixelRatio: window.devicePixelRatio || 1,
    language: navigator.language || navigator.userLanguage || 'en',
    timezone: ''
  };

  try {
    clientEnv.timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || '';
  } catch (e) {}

  // 2. High-Accuracy IP & Geo Probe (Non-blocking with short timeout)
  async function fetchGeoInfo() {
    // Check cached geo to prevent redundant external API calls
    try {
      const cached = sessionStorage.getItem('abentra_geo_cache');
      if (cached) return JSON.parse(cached);
    } catch (e) {}

    // 1.5 second timeout abort controller
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1500);

    try {
      // Free, high-speed IP info endpoint
      const res = await fetch('https://ipwho.is/', { signal: controller.signal });
      clearTimeout(timeoutId);
      if (res.ok) {
        const data = await res.json();
        if (data && data.success !== false) {
          const geo = {
            ip: data.ip || '',
            country: data.country || '',
            countryCode: data.country_code || '',
            city: data.city || '',
            region: data.region || '',
            isp: (data.connection && data.connection.isp) ? data.connection.isp : (data.connection?.org || ''),
            flag: data.flag?.emoji || ''
          };
          try { sessionStorage.setItem('abentra_geo_cache', JSON.stringify(geo)); } catch (e) {}
          return geo;
        }
      }
    } catch (err) {
      clearTimeout(timeoutId);
    }

    return null;
  }

  // 3. Perform Initial Handshake with Server
  (async function sendHandshake() {
    let geo = null;
    try {
      geo = await fetchGeoInfo();
    } catch (e) {}

    const payload = {
      ...clientEnv,
      ...(geo || {})
    };

    fetch('/api/track/visit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).catch(() => {});
  })();

  // 4. Section Visibility & Dwell Time Tracking
  const activeSections = new Map(); // sectionId -> startTime

  function reportSection(sectionId, seconds) {
    if (seconds < 2) return; // Ignore fleeting scrolls
    const payload = JSON.stringify({
      visitorId,
      sectionId,
      durationSeconds: Math.round(seconds)
    });

    if (navigator.sendBeacon) {
      const blob = new Blob([payload], { type: 'application/json' });
      navigator.sendBeacon('/api/track/section', blob);
    } else {
      fetch('/api/track/section', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload,
        keepalive: true
      }).catch(() => {});
    }
  }

  function initSectionObserver() {
    const sectionsToTrack = document.querySelectorAll('section[id], main#top, div#dynamic-sections > section');

    const observer = new IntersectionObserver((entries) => {
      const now = Date.now();
      entries.forEach(entry => {
        const id = entry.target.id || entry.target.dataset.trackId;
        if (!id) return;

        if (entry.isIntersecting && entry.intersectionRatio >= 0.35) {
          if (!activeSections.has(id)) {
            activeSections.set(id, now);
          }
        } else {
          if (activeSections.has(id)) {
            const start = activeSections.get(id);
            const duration = (now - start) / 1000;
            activeSections.delete(id);
            reportSection(id, duration);
          }
        }
      });
    }, {
      threshold: [0.35]
    });

    sectionsToTrack.forEach(sec => observer.observe(sec));
  }

  // Flush on page unload or visibility change
  function flushActiveSections() {
    const now = Date.now();
    activeSections.forEach((start, id) => {
      const duration = (now - start) / 1000;
      reportSection(id, duration);
    });
    activeSections.clear();
  }

  window.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      flushActiveSections();
    }
  });

  window.addEventListener('pagehide', flushActiveSections);
  window.addEventListener('beforeunload', flushActiveSections);

  // Initialize once DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSectionObserver);
  } else {
    initSectionObserver();
  }
})();
