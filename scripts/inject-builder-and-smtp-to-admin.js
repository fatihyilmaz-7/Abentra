const fs = require('fs');

let src = fs.readFileSync('moon/manager/js/admin.js', 'utf8');

// ==============================================================================
// 1. ADD WIDGET CATALOG DEFINITIONS AND BUILDER STATE
// ==============================================================================
const builderDefinitions = `
// ==============================================================================
// EXECUTIVE WEB BUILDER WIDGET CATALOG (20 Rich Widgets)
// ==============================================================================
const WIDGET_CATALOG = [
  { type: 'stats', cat: 'core', icon: 'fa-chart-line', nameTr: 'Metrik & Sayılar', nameEn: 'Key Metrics & Numbers', descTr: '4\\'lü istatistik ve etki sayacı', descEn: '4-card metric & impact counters' },
  { type: 'cards', cat: 'core', icon: 'fa-table-cells-large', nameTr: 'Özellik & Kart Izgarası', nameEn: 'Feature & Card Grid', descTr: 'İkonlu avantaj ve odak kartları', descEn: 'Interactive focus & value cards' },
  { type: 'process', cat: 'core', icon: 'fa-stairs', nameTr: 'Süreç & Yol Haritası', nameEn: 'Process & Roadmap', descTr: 'Adım adım metodoloji aşamaları', descEn: 'Step-by-step strategic milestones' },
  { type: 'faq', cat: 'trust', icon: 'fa-circle-question', nameTr: 'SSS (Soru-Cevap)', nameEn: 'FAQ Accordion', descTr: 'Akordiyon sık sorulan sorular', descEn: 'Collapsible frequently asked questions' },
  { type: 'testimonials', cat: 'trust', icon: 'fa-quote-left', nameTr: 'VIP Referans & Görüşler', nameEn: 'VIP Endorsements', descTr: 'Müşteri değerlendirmeleri ve alıntılar', descEn: 'Executive quotes & client reviews' },
  { type: 'cta', cat: 'conversion', icon: 'fa-bullhorn', nameTr: 'Eylem & Dönüşüm Bandı', nameEn: 'Call to Action Banner', descTr: 'Yüksek dönüşümlü çift butonlu blok', descEn: 'High-conversion banner with dual CTAs' },
  { type: 'team', cat: 'trust', icon: 'fa-users-gear', nameTr: 'Yönetici Kadro & Danışmanlar', nameEn: 'Executive Leadership', descTr: 'Profil fotoğrafları ve unvanlar', descEn: 'Leadership profiles & credentials' },
  { type: 'partners', cat: 'trust', icon: 'fa-handshake', nameTr: 'Kurumsal Ortaklar & Logolar', nameEn: 'Institutional Partners', descTr: 'Bakanlık ve çözüm ortakları rozetleri', descEn: 'Ministerial & corporate badges' },
  { type: 'video', cat: 'content', icon: 'fa-circle-play', nameTr: 'Tanıtım Videosu & Medya', nameEn: 'Media & Video Showcase', descTr: 'Video spotu ve oynatma simülasyonu', descEn: 'Embedded presentation & video player' },
  { type: 'pricing', cat: 'conversion', icon: 'fa-tags', nameTr: 'Hizmet & Fiyatlandırma', nameEn: 'Advisory Packages', descTr: '3 seviyeli danışmanlık paketleri', descEn: '3-tier service comparison cards' },
  { type: 'split', cat: 'content', icon: 'fa-columns', nameTr: '50/50 Görsel & Metin', nameEn: 'Split Narrative & Media', descTr: 'Görsel yanında maddeli anlatı', descEn: 'Side-by-side narrative with checkmarks' },
  { type: 'quote', cat: 'content', icon: 'fa-comment-dots', nameTr: 'İmza Yönetici Sözü', nameEn: 'Editorial Pullquote', descTr: 'Altın vurgulu büyük alıntı', descEn: 'Luxury gold pullquote statement' },
  { type: 'services', cat: 'core', icon: 'fa-briefcase', nameTr: 'Hizmet Kapsam Matrisi', nameEn: 'Comprehensive Services', descTr: 'Detaylı operasyonel hizmetler', descEn: 'Detailed deliverables & services' },
  { type: 'map_office', cat: 'conversion', icon: 'fa-map-location-dot', nameTr: 'Genel Merkez & Konum', nameEn: 'Headquarters & Logistics', descTr: 'Monrovia ofisi ve telemetri', descEn: 'Monrovia headquarters & contact' },
  { type: 'newsletter', cat: 'conversion', icon: 'fa-envelope-open-text', nameTr: 'Yatırımcı Bülteni', nameEn: 'Investor Dispatch', descTr: 'E-posta bülten kayıt bloğu', descEn: 'Email subscription & inquiry block' },
  { type: 'gallery', cat: 'content', icon: 'fa-images', nameTr: 'Proje & Saha Galerisi', nameEn: 'Project Gallery Grid', descTr: 'Görsel ızgarası ve başlıklar', descEn: 'Masonry image gallery with captions' },
  { type: 'tabs', cat: 'content', icon: 'fa-folder-tree', nameTr: 'Sekmeli İçerik Alanı', nameEn: 'Tabbed Divisions Showcase', descTr: 'Tıklanabilir çoklu departman sekmeleri', descEn: 'Multi-tab departmental switcher' },
  { type: 'comparison', cat: 'trust', icon: 'fa-scale-balanced', nameTr: 'Karşılaştırma Tablosu', nameEn: 'Institutional Comparison', descTr: 'Özellik onay listesi tablosu', descEn: 'Feature checklist matrix' },
  { type: 'badges', cat: 'trust', icon: 'fa-award', nameTr: 'Resmi Ruhsat & Akreditasyon', nameEn: 'Statutory Accreditations', descTr: 'Bakanlık tescil ve ruhsat onayları', descEn: 'Governmental registration badges' },
  { type: 'custom_html', cat: 'content', icon: 'fa-code', nameTr: 'Özel HTML & Kod Bloğu', nameEn: 'Custom HTML & Embed', descTr: 'Serbest kod ve iframe ekleme', descEn: 'Raw HTML/CSS custom components' }
];

let builderActiveMode = 'canvas'; // 'canvas' | 'list'
let builderDeviceMode = 'desktop'; // 'desktop' | 'tablet' | 'mobile'
let builderActiveCategory = 'all';
let builderSearchTerm = '';
let currentlyEditingSectionId = null;

function isSmtpVerified() {
  return !!(siteConfig && siteConfig.smtp && siteConfig.smtp.verified);
}

function showSmtpLockedModal() {
  const modal = $('#modal-smtp-locked');
  if (modal) modal.classList.add('active');
}

function closeSmtpLockedModal() {
  const modal = $('#modal-smtp-locked');
  if (modal) modal.classList.remove('active');
}
`;

src = src.replace('// Application State (Defaults)', builderDefinitions + '\n// Application State (Defaults)');

// ==============================================================================
// 2. ENHANCE RENDERSECTIONSVIEW (FULL WEB BUILDER + DRAG & DROP + LIST MODE)
// ==============================================================================
const oldRenderSections = `// ------------------------------------------------------------------------------
// VIEW 5: SEC (Ara Bölümler)
// ------------------------------------------------------------------------------
function renderSectionsView() {
  const secs = allSections.length ? allSections : [
    { id: 'sec_stats', name: S.lang === 'en' ? 'Impact & figures' : 'Etki ve rakamlar', enabled: true },
    { id: 'sec_why_liberia', name: S.lang === 'en' ? 'Why Liberia?' : 'Neden Liberya?', enabled: true },
    { id: 'sec_process', name: S.lang === 'en' ? '4-step process' : '4 aşamalı süreç', enabled: false },
    { id: 'sec_faq', name: S.lang === 'en' ? 'Frequently asked questions' : 'Sık sorulan sorular', enabled: true }
  ];

  $('#secs').innerHTML = secs.map((s, i) => \`
    <div class="sec" data-id="\${esc(s.id)}">
      <span class="sub" style="cursor:grab">⋮⋮</span>
      <b>\${esc(s.name || s.title)}</b>
      <div class="sw \${s.enabled ? 'on' : ''}" data-idx="\${i}"></div>
    </div>
  \`).join('');

  $$('#secs .sw').forEach(sw => {
    sw.onclick = async () => {
      sw.classList.toggle('on');
      const idx = +sw.dataset.idx;
      if (secs[idx]) {
        secs[idx].enabled = sw.classList.contains('on');
        try {
          await fetch('/api/moon/manager/sections', {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(secs)
          });
          toast(t('toastSecUpdated', '"{0}" güncellendi').replace('{0}', secs[idx].name || (S.lang === 'en' ? 'Section' : 'Bölüm')));
        } catch (e) {}
      }
    };
  });
}`;

const newRenderSections = `// ------------------------------------------------------------------------------
// VIEW 5: SEC (EXECUTIVE WEB BUILDER & SECTION STUDIO)
// ------------------------------------------------------------------------------
function renderSectionsView() {
  const secs = allSections.length ? allSections : [
    { id: 'sec_stats', name: 'Key Metrics & Impact', title: 'Delivering institutional confidence in Liberia.', tag: 'Track Record', type: 'stats', enabled: true, order: 1 },
    { id: 'sec_why_liberia', name: 'Strategic Gateway / Why Liberia', title: 'Why invest & establish in Liberia?', tag: 'Regional Horizon', type: 'cards', enabled: true, order: 2 },
    { id: 'sec_process', name: 'Engagement Process', title: 'A structured pathway from intent to operation.', tag: 'Execution Framework', type: 'process', enabled: true, order: 3 },
    { id: 'sec_faq', name: 'Institutional FAQ', title: 'Frequently Asked Questions & Advisory Support', tag: 'Direct Clarification', type: 'faq', enabled: true, order: 4 }
  ];

  // 1. Sync Mode Switcher Buttons
  const canvasModeRoot = $('#builder-canvas-mode-root');
  const listModeRoot = $('#builder-list-mode-root');
  const btnCanvas = $('#btn-mode-canvas');
  const btnList = $('#btn-mode-list');

  if (btnCanvas && btnList) {
    btnCanvas.classList.toggle('on', builderActiveMode === 'canvas');
    btnList.classList.toggle('on', builderActiveMode === 'list');
  }

  if (canvasModeRoot && listModeRoot) {
    canvasModeRoot.style.display = builderActiveMode === 'canvas' ? 'grid' : 'none';
    listModeRoot.style.display = builderActiveMode === 'list' ? 'flex' : 'none';
  }

  // 2. Render Left Widget Library Palette (Filtered)
  renderWidgetLibrary();

  // 3. Render Canvas Dropzone (Canvas Mode)
  renderBuilderCanvas(secs);

  // 4. Render Structured List (List Mode)
  renderBuilderStructuredList(secs);

  // 5. Setup Drag & Drop Handlers
  setupBuilderDragAndDrop();
}

function renderWidgetLibrary() {
  const stream = $('#widget-library-stream');
  if (!stream) return;

  const isEn = S.lang === 'en';
  const q = builderSearchTerm.toLowerCase().trim();

  const filtered = WIDGET_CATALOG.filter(w => {
    if (builderActiveCategory !== 'all' && w.cat !== builderActiveCategory) return false;
    if (q) {
      const name = (isEn ? w.nameEn : w.nameTr).toLowerCase();
      const desc = (isEn ? w.descEn : w.descTr).toLowerCase();
      return name.includes(q) || desc.includes(q) || w.type.includes(q);
    }
    return true;
  });

  stream.innerHTML = filtered.map(w => {
    const name = isEn ? w.nameEn : w.nameTr;
    const desc = isEn ? w.descEn : w.descTr;
    return \`
      <div class="widget-lib-card" draggable="true" data-widget-type="\${w.type}">
        <div class="widget-icon-box"><i class="fa-solid \${w.icon}"></i></div>
        <div class="widget-info-box">
          <b>\${esc(name)}</b>
          <small>\${esc(desc)}</small>
        </div>
        <button type="button" class="widget-add-btn" data-add-widget="\${w.type}" title="\${t('btnQuickAddWidget', 'Tuvale Ekle')}">
          <i class="fa-solid fa-plus"></i>
        </button>
      </div>
    \`;
  }).join('');
}

function renderBuilderCanvas(secs) {
  const dropzone = $('#builder-canvas-dropzone');
  if (!dropzone) return;

  const isEn = S.lang === 'en';

  if (!secs || secs.length === 0) {
    dropzone.innerHTML = \`<div style="padding:48px 24px;text-align:center;color:var(--mut);">\${t('canvasEmptyPlaceholder', 'Tuval Boş. Sol taraftan bir widget sürükleyin veya yukarıdaki düğmeyle yeni bölüm ekleyin.')}</div>\`;
    return;
  }

  dropzone.innerHTML = secs.map((sec, idx) => {
    const wMeta = WIDGET_CATALOG.find(w => w.type === sec.type) || { icon: 'fa-cube', nameTr: 'Bölüm', nameEn: 'Section' };
    const wIcon = wMeta.icon;
    const typeLabel = isEn ? wMeta.nameEn : wMeta.nameTr;
    const itemCount = Array.isArray(sec.items) ? sec.items.length : 0;

    return \`
      <div class="canvas-section-node glass" draggable="true" data-sec-id="\${esc(sec.id)}" data-sec-idx="\${idx}">
        <div class="section-node-header">
          <div class="section-node-meta">
            <span class="section-drag-handle" title="Sürükle"><i class="fa-solid fa-grip-vertical"></i></span>
            <span class="tag" style="border-color:var(--ac);color:var(--ac);font-size:11px;"><i class="fa-solid \${wIcon}"></i> \${esc(typeLabel)}</span>
            <b>\${esc(sec.name || sec.title || 'Untitled Section')}</b>
            \${sec.enabled ? \`<span class="tag" style="border-color:var(--up);color:var(--up);font-size:10px;">\${t('sectionLiveBadge', 'Yayında')}</span>\` : \`<span class="tag" style="border-color:var(--mut);color:var(--mut);font-size:10px;">\${t('sectionDraftBadge', 'Taslak')}</span>\`}
          </div>

          <div class="section-node-actions">
            <button type="button" class="pill" data-edit-sec="\${esc(sec.id)}" title="\${t('btnEditSectionContent', 'Detayları Düzenle')}">
              <i class="fa-solid fa-pen-to-square"></i>
            </button>
            <button type="button" class="pill" data-dup-sec="\${esc(sec.id)}" title="\${t('btnDuplicateSection', 'Çoğalt')}">
              <i class="fa-solid fa-clone"></i>
            </button>
            <button type="button" class="pill" data-del-sec="\${esc(sec.id)}" style="color:var(--dn);" title="\${t('btnDeleteSection', 'Bölümü Sil')}">
              <i class="fa-solid fa-trash-can"></i>
            </button>
            <div class="sw \${sec.enabled ? 'on' : ''}" data-toggle-sec="\${esc(sec.id)}" title="Aç/Kapat"></div>
          </div>
        </div>

        <div class="section-node-body-preview">
          <span style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;flex:1;">
            \${esc(sec.subtitle || sec.title || (isEn ? 'Section content ready' : 'Bölüm içeriği hazır'))}
          </span>
          <span class="sub" style="flex-shrink:0;">\${itemCount} \${isEn ? 'items' : 'öğe'} · #\${esc(sec.anchor || sec.id)}</span>
        </div>
      </div>
    \`;
  }).join('');
}

function renderBuilderStructuredList(secs) {
  const container = $('#builder-structured-list-stream');
  if (!container) return;

  const isEn = S.lang === 'en';

  container.innerHTML = secs.map((sec, idx) => {
    const wMeta = WIDGET_CATALOG.find(w => w.type === sec.type) || { icon: 'fa-cube', nameTr: 'Bölüm', nameEn: 'Section' };
    const items = Array.isArray(sec.items) ? sec.items : [];

    return \`
      <div class="builder-list-item-card glass" id="list-card-\${esc(sec.id)}">
        <div class="builder-list-card-head" onclick="toggleListCard('\${esc(sec.id)}')">
          <div style="display:flex;align-items:center;gap:12px;flex:1;">
            <i class="fa-solid fa-chevron-right list-card-chevron" id="chevron-\${esc(sec.id)}" style="transition:transform .2s;color:var(--ac);"></i>
            <span class="tag" style="border-color:var(--ac);color:var(--ac);font-size:11px;">#\${idx + 1} \${esc(isEn ? wMeta.nameEn : wMeta.nameTr)}</span>
            <b style="font-size:14px;color:var(--ink);">\${esc(sec.name || sec.title || 'Untitled Section')}</b>
            <span class="sub" style="font-size:12px;">\${items.length} \${isEn ? 'child cards' : 'kart'}</span>
          </div>
          <div style="display:flex;align-items:center;gap:10px;" onclick="event.stopPropagation()">
            <div class="sw \${sec.enabled ? 'on' : ''}" data-toggle-sec="\${esc(sec.id)}"></div>
            <button type="button" class="pill" data-del-sec="\${esc(sec.id)}" style="color:var(--dn);"><i class="fa-solid fa-trash-can"></i></button>
          </div>
        </div>

        <div class="builder-list-card-body" id="list-body-\${esc(sec.id)}" style="display:none;">
          <div class="grid g3">
            <div class="f">
              <label>\${t('lblSecTitle', 'Bölüm Başlığı')}</label>
              <input class="i input-live-update" data-sec-prop="title" data-sec-id="\${esc(sec.id)}" value="\${esc(sec.title || '')}">
            </div>
            <div class="f">
              <label>\${t('lblSectionTag', 'Üst Rozet / Kategori')}</label>
              <input class="i input-live-update" data-sec-prop="tag" data-sec-id="\${esc(sec.id)}" value="\${esc(sec.tag || '')}">
            </div>
            <div class="f">
              <label>\${t('lblSectionAnchor', 'Bağlantı Çapası (#anchor)')}</label>
              <input class="i input-live-update" data-sec-prop="anchor" data-sec-id="\${esc(sec.id)}" value="\${esc(sec.anchor || '')}">
            </div>
          </div>

          <div class="f">
            <label>\${t('lblSecSub', 'Alt Açıklama / Paragraf')}</label>
            <textarea class="i input-live-update" data-sec-prop="subtitle" data-sec-id="\${esc(sec.id)}" style="min-height:60px;">\${esc(sec.subtitle || '')}</textarea>
          </div>

          <div class="grid g3">
            <div class="f">
              <label>\${t('lblSectionBgStyle', 'Arka Plan Stili')}</label>
              <select class="i input-live-update" data-sec-prop="bgStyle" data-sec-id="\${esc(sec.id)}">
                <option value="obsidian" \${sec.bgStyle === 'obsidian' ? 'selected' : ''}>\${t('optBgObsidian', 'Koyu Obsidyen Zemin')}</option>
                <option value="glass" \${sec.bgStyle === 'glass' ? 'selected' : ''}>\${t('optBgGlass', 'Cam Şeffaflığı & Kart')}</option>
                <option value="navy" \${sec.bgStyle === 'navy' ? 'selected' : ''}>\${t('optBgNavy', 'Derin Lüks Lacivert')}</option>
                <option value="gold" \${sec.bgStyle === 'gold' ? 'selected' : ''}>\${t('optBgGold', 'Altın Parıltısı Radyal')}</option>
              </select>
            </div>
            <div class="f">
              <label>\${t('lblSectionColumns', 'Izgara Sütun Sayısı')}</label>
              <select class="i input-live-update" data-sec-prop="columns" data-sec-id="\${esc(sec.id)}">
                <option value="2" \${sec.columns === '2' ? 'selected' : ''}>2 Sütun (Columns)</option>
                <option value="3" \${sec.columns === '3' || !sec.columns ? 'selected' : ''}>3 Sütun (Columns)</option>
                <option value="4" \${sec.columns === '4' ? 'selected' : ''}>4 Sütun (Columns)</option>
              </select>
            </div>
            <div class="f">
              <label>\${t('lblSectionAlignment', 'Metin Hizalaması')}</label>
              <select class="i input-live-update" data-sec-prop="align" data-sec-id="\${esc(sec.id)}">
                <option value="left" \${sec.align === 'left' || !sec.align ? 'selected' : ''}>\${t('optAlignLeft', 'Sola Hizalı')}</option>
                <option value="center" \${sec.align === 'center' ? 'selected' : ''}>\${t('optAlignCenter', 'Ortalanmış')}</option>
              </select>
            </div>
          </div>

          <div style="border-top:1px solid var(--ln);padding-top:14px;">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;">
              <b style="font-size:13px;color:var(--ac);">\${t('sectionItemsHeading', 'Bölüm İçi Kartlar & Maddeler')} (\${items.length})</b>
              <button type="button" class="pill gold" data-add-item-to-sec="\${esc(sec.id)}" style="font-size:11.5px;padding:4px 10px;">
                \${t('btnAddItemRow', '+ Yeni Kart / Madde Ekle')}
              </button>
            </div>

            <div class="builder-child-items-grid">
              \${items.map((it, itIdx) => \`
                <div class="builder-child-item-row">
                  <input class="i child-prop-input" data-sec-id="\${esc(sec.id)}" data-item-idx="\${itIdx}" data-item-prop="title" placeholder="\${t('itemTitle', 'Madde Başlığı')}" value="\${esc(it.title || it.label || it.name || '')}">
                  <input class="i child-prop-input" data-sec-id="\${esc(sec.id)}" data-item-idx="\${itIdx}" data-item-prop="description" placeholder="\${t('itemDesc', 'Açıklama / Metin')}" value="\${esc(it.description || it.bio || it.desc || '')}">
                  <button type="button" class="pill" data-del-item-from-sec="\${esc(sec.id)}" data-item-idx="\${itIdx}" style="color:var(--dn);" title="Sil">
                    <i class="fa-solid fa-trash-can"></i>
                  </button>
                </div>
              \`).join('')}
            </div>
          </div>
        </div>
      </div>
    \`;
  }).join('');
}

function toggleListCard(secId) {
  const body = $('#list-body-' + secId);
  const chevron = $('#chevron-' + secId);
  if (body) {
    const isHidden = body.style.display === 'none';
    body.style.display = isHidden ? 'flex' : 'none';
    if (chevron) chevron.style.transform = isHidden ? 'rotate(90deg)' : 'none';
  }
}

function setupBuilderDragAndDrop() {
  const dropzone = $('#builder-canvas-dropzone');
  if (!dropzone) return;

  // Dragging from Palette onto Canvas
  $$('.widget-lib-card').forEach(card => {
    card.ondragstart = e => {
      e.dataTransfer.setData('text/widget-type', card.dataset.widgetType);
    };
  });

  // Dragging Canvas Section Nodes (Reordering)
  let draggedSecId = null;
  $$('.canvas-section-node').forEach(node => {
    node.ondragstart = e => {
      draggedSecId = node.dataset.secId;
      node.classList.add('dragging');
      e.dataTransfer.setData('text/sec-id', draggedSecId);
    };
    node.ondragend = () => {
      node.classList.remove('dragging');
      $$('.canvas-section-node').forEach(n => n.classList.remove('drag-over'));
    };
    node.ondragover = e => {
      e.preventDefault();
      node.classList.add('drag-over');
    };
    node.ondragleave = () => {
      node.classList.remove('drag-over');
    };
    node.ondrop = e => {
      e.preventDefault();
      node.classList.remove('drag-over');
      const targetSecId = node.dataset.secId;
      if (draggedSecId && targetSecId && draggedSecId !== targetSecId) {
        reorderSections(draggedSecId, targetSecId);
      }
    };
  });

  // Canvas Dropzone events
  dropzone.ondragover = e => e.preventDefault();
  dropzone.ondrop = e => {
    e.preventDefault();
    const widgetType = e.dataTransfer.getData('text/widget-type');
    if (widgetType) {
      addNewSectionFromWidget(widgetType);
    }
  };
}

function addNewSectionFromWidget(type) {
  const isEn = S.lang === 'en';
  const meta = WIDGET_CATALOG.find(w => w.type === type) || { nameTr: 'Bölüm', nameEn: 'Section' };
  const title = isEn ? meta.nameEn : meta.nameTr;

  const defaultItems = [
    { title: isEn ? 'Institutional Advantage' : 'Kurumsal Avantaj', description: isEn ? 'Verified regulatory compliance and ongoing advisory.' : 'Mevzuat uyumu ve sürekli danışmanlık.', value: '100%' },
    { title: isEn ? 'Operational Nexus' : 'Operasyonel Merkez', description: isEn ? 'Direct ministerial and administrative engagement.' : 'Doğrudan bakanlık ve idari süreç takibi.', value: '24/7' },
    { title: isEn ? 'Strategic Execution' : 'Stratejik Uygulama', description: isEn ? 'Seamless market entry and corporate establishment.' : 'Pazara giriş ve şirket kurulumu.', value: '15+' }
  ];

  const newSec = {
    id: 'sec_' + Date.now().toString(36),
    name: title,
    title: isEn ? \`Excellence in \${title}\` : \`\${title} Alanında Kurumsal Güven\`,
    tag: isEn ? 'Executive Advisory' : 'Stratejik Çözümler',
    subtitle: isEn ? 'Connecting multinational entities to verified commercial pathways in Liberia.' : 'Uluslararası yatırımcıları Liberya\\'da güvenilir ve şeffaf kanallarla buluşturuyoruz.',
    type,
    enabled: true,
    order: (allSections.length || 0) + 1,
    anchor: type + '-' + Date.now().toString(36).slice(-4),
    items: defaultItems
  };

  allSections.push(newSec);
  saveAllSectionsToBackend();
  renderSectionsView();
  toast(t('toastSectionAdded', 'Widget başarıyla tuvale eklendi!'));
}

function reorderSections(fromId, toId) {
  const fromIdx = allSections.findIndex(s => s.id === fromId);
  const toIdx = allSections.findIndex(s => s.id === toId);
  if (fromIdx === -1 || toIdx === -1) return;

  const [moved] = allSections.splice(fromIdx, 1);
  allSections.splice(toIdx, 0, moved);

  // Recalculate order property
  allSections.forEach((s, idx) => s.order = idx + 1);

  saveAllSectionsToBackend();
  renderSectionsView();
  toast(t('toastSectionsReordered', 'Bölüm sıralaması güncellendi!'));
}

async function saveAllSectionsToBackend() {
  try {
    await fetch('/api/moon/manager/sections', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(allSections)
    });
  } catch (err) {
    console.warn('Could not persist sections:', err.message);
  }
}
`;

src = src.replace(oldRenderSections, newRenderSections);

// ==============================================================================
// 3. ATTACH BUILDER CLICK DELEGATES & CONTROLS
// ==============================================================================
const builderDelegates = `
// Mode switchers
$('#btn-mode-canvas')?.addEventListener('click', () => {
  builderActiveMode = 'canvas';
  renderSectionsView();
});
$('#btn-mode-list')?.addEventListener('click', () => {
  builderActiveMode = 'list';
  renderSectionsView();
});

// Device simulator toggles
$$('#builder-device-bar button').forEach(btn => {
  btn.onclick = () => {
    $$('#builder-device-bar button').forEach(b => b.classList.remove('on'));
    btn.classList.add('on');
    builderDeviceMode = btn.dataset.device;
    const canvasWrap = $('#builder-canvas-wrapper');
    if (canvasWrap) {
      canvasWrap.classList.remove('preview-tablet', 'preview-mobile');
      if (builderDeviceMode === 'tablet') canvasWrap.classList.add('preview-tablet');
      if (builderDeviceMode === 'mobile') canvasWrap.classList.add('preview-mobile');
    }
  };
});

// Widget Category Tabs
$$('#widget-cat-tabs .widget-cat-pill').forEach(pill => {
  pill.onclick = () => {
    $$('#widget-cat-tabs .widget-cat-pill').forEach(p => p.classList.remove('on'));
    pill.classList.add('on');
    builderActiveCategory = pill.dataset.cat;
    renderWidgetLibrary();
    setupBuilderDragAndDrop();
  };
});

// Widget Search
$('#widget-search-input')?.addEventListener('input', e => {
  builderSearchTerm = e.target.value;
  renderWidgetLibrary();
  setupBuilderDragAndDrop();
});

// Global Builder Actions Click Delegate
document.addEventListener('click', async e => {
  // Add widget button
  const addBtn = e.target.closest('[data-add-widget]');
  if (addBtn) {
    e.preventDefault();
    addNewSectionFromWidget(addBtn.dataset.addWidget);
    return;
  }

  // Toggle section enabled
  const toggleSw = e.target.closest('[data-toggle-sec]');
  if (toggleSw) {
    e.preventDefault();
    const secId = toggleSw.dataset.toggleSec;
    const sec = allSections.find(s => s.id === secId);
    if (sec) {
      sec.enabled = !sec.enabled;
      toggleSw.classList.toggle('on', sec.enabled);
      await saveAllSectionsToBackend();
      renderSectionsView();
      toast(sec.enabled ? t('toastSecEnabled', 'Bölüm yayına alındı') : t('toastSecDisabled', 'Bölüm gizlendi'));
    }
    return;
  }

  // Delete section
  const delBtn = e.target.closest('[data-del-sec]');
  if (delBtn) {
    e.preventDefault();
    const secId = delBtn.dataset.delSec;
    if (confirm(t('confirmDeleteSection', 'Bu bölümü silmek istediğinize emin misiniz?'))) {
      allSections = allSections.filter(s => s.id !== secId);
      await saveAllSectionsToBackend();
      renderSectionsView();
      toast(t('toastSecDeleted', 'Bölüm silindi'));
    }
    return;
  }

  // Duplicate section
  const dupBtn = e.target.closest('[data-dup-sec]');
  if (dupBtn) {
    e.preventDefault();
    const secId = dupBtn.dataset.dupSec;
    const orig = allSections.find(s => s.id === secId);
    if (orig) {
      const cloned = JSON.parse(JSON.stringify(orig));
      cloned.id = 'sec_' + Date.now().toString(36);
      cloned.name = (cloned.name || 'Section') + ' (Copy)';
      cloned.anchor = cloned.anchor + '-copy';
      allSections.push(cloned);
      await saveAllSectionsToBackend();
      renderSectionsView();
      toast(t('toastSecCloned', 'Bölüm çoğaltıldı'));
    }
    return;
  }

  // Edit section details modal
  const editBtn = e.target.closest('[data-edit-sec]');
  if (editBtn) {
    e.preventDefault();
    openSectionEditModal(editBtn.dataset.editSec);
    return;
  }

  // Add Item to Section in List View
  const addItemBtn = e.target.closest('[data-add-item-to-sec]');
  if (addItemBtn) {
    e.preventDefault();
    const secId = addItemBtn.dataset.addItemToSec;
    const sec = allSections.find(s => s.id === secId);
    if (sec) {
      if (!Array.isArray(sec.items)) sec.items = [];
      sec.items.push({ title: 'Yeni Madde / New Item', description: 'Açıklama / Description', value: '' });
      renderBuilderStructuredList(allSections);
      toggleListCard(secId); // keep open
    }
    return;
  }

  // Delete item from section
  const delItemBtn = e.target.closest('[data-del-item-from-sec]');
  if (delItemBtn) {
    e.preventDefault();
    const secId = delItemBtn.dataset.delItemFromSec;
    const idx = +delItemBtn.dataset.itemIdx;
    const sec = allSections.find(s => s.id === secId);
    if (sec && Array.isArray(sec.items)) {
      sec.items.splice(idx, 1);
      renderBuilderStructuredList(allSections);
      toggleListCard(secId);
    }
    return;
  }
});

// Live input update on list mode
document.addEventListener('input', e => {
  const inp = e.target.closest('.input-live-update');
  if (inp && inp.dataset.secId && inp.dataset.secProp) {
    const sec = allSections.find(s => s.id === inp.dataset.secId);
    if (sec) {
      sec[inp.dataset.secProp] = inp.value;
    }
    return;
  }

  const childInp = e.target.closest('.child-prop-input');
  if (childInp && childInp.dataset.secId && childInp.dataset.itemIdx !== undefined && childInp.dataset.itemProp) {
    const sec = allSections.find(s => s.id === childInp.dataset.secId);
    const idx = +childInp.dataset.itemIdx;
    if (sec && Array.isArray(sec.items) && sec.items[idx]) {
      sec.items[idx][childInp.dataset.itemProp] = childInp.value;
    }
  }
});

// Save all sections button
$('#btn-builder-save-all')?.addEventListener('click', async () => {
  await saveAllSectionsToBackend();
  toast(t('toastAllSectionsSaved', 'Tüm web builder bölümleri başarıyla kaydedildi!'));
});

$('#btn-builder-add-custom')?.addEventListener('click', () => {
  addNewSectionFromWidget('cards');
});
`;

src += '\n' + builderDelegates;

// ==============================================================================
// 4. SECTION EDIT MODAL LOGIC
// ==============================================================================
const secEditModalLogic = `
function openSectionEditModal(secId) {
  const sec = allSections.find(s => s.id === secId);
  if (!sec) return;
  currentlyEditingSectionId = secId;

  const isEn = S.lang === 'en';
  const modal = $('#modal-section-editor');
  const body = $('#sec-modal-body');
  if (!modal || !body) return;

  body.innerHTML = \`
    <div class="grid g2">
      <div class="f">
        <label>\${t('lblSecTitle', 'Bölüm Başlığı')}</label>
        <input class="i" id="m-sec-title" value="\${esc(sec.title || '')}">
      </div>
      <div class="f">
        <label>\${t('lblSectionTag', 'Üst Rozet / Kategori')}</label>
        <input class="i" id="m-sec-tag" value="\${esc(sec.tag || '')}">
      </div>
    </div>
    <div class="f">
      <label>\${t('lblSecSub', 'Alt Açıklama')}</label>
      <textarea class="i" id="m-sec-sub" style="min-height:70px;">\${esc(sec.subtitle || '')}</textarea>
    </div>
    <div class="grid g2">
      <div class="f">
        <label>\${t('lblSectionAnchor', 'Bağlantı Çapası (#anchor)')}</label>
        <input class="i" id="m-sec-anchor" value="\${esc(sec.anchor || '')}">
      </div>
      <div class="f">
        <label>\${t('lblSectionBgStyle', 'Arka Plan Stili')}</label>
        <select class="i" id="m-sec-bg">
          <option value="obsidian" \${sec.bgStyle === 'obsidian' ? 'selected' : ''}>Koyu Obsidyen Zemin</option>
          <option value="glass" \${sec.bgStyle === 'glass' ? 'selected' : ''}>Cam Şeffaflığı & Kart</option>
          <option value="navy" \${sec.bgStyle === 'navy' ? 'selected' : ''}>Derin Lüks Lacivert</option>
          <option value="gold" \${sec.bgStyle === 'gold' ? 'selected' : ''}>Altın Parıltısı Radyal</option>
        </select>
      </div>
    </div>
  \`;

  modal.classList.add('active');
}

$('#btn-close-sec-modal')?.addEventListener('click', () => $('#modal-section-editor')?.classList.remove('active'));
$('#btn-cancel-sec-modal')?.addEventListener('click', () => $('#modal-section-editor')?.classList.remove('active'));

$('#btn-save-sec-modal')?.addEventListener('click', async () => {
  if (!currentlyEditingSectionId) return;
  const sec = allSections.find(s => s.id === currentlyEditingSectionId);
  if (sec) {
    sec.title = $('#m-sec-title')?.value || sec.title;
    sec.tag = $('#m-sec-tag')?.value || sec.tag;
    sec.subtitle = $('#m-sec-sub')?.value || sec.subtitle;
    sec.anchor = $('#m-sec-anchor')?.value || sec.anchor;
    sec.bgStyle = $('#m-sec-bg')?.value || sec.bgStyle;
    await saveAllSectionsToBackend();
    renderSectionsView();
    toast(t('toastSectionUpdated', 'Bölüm ayarları kaydedildi!'));
  }
  $('#modal-section-editor')?.classList.remove('active');
});
`;

src += '\n' + secEditModalLogic;

// ==============================================================================
// 5. SMTP CONTROLLER & VERIFICATION LOGIC
// ==============================================================================
const smtpControllerLogic = `
async function loadSmtpSettings() {
  try {
    const res = await fetch('/api/moon/manager/smtp', { headers: getAuthHeaders() });
    if (!res.ok) return;
    const smtp = await res.json();

    if (siteConfig) {
      if (!siteConfig.smtp) siteConfig.smtp = {};
      Object.assign(siteConfig.smtp, smtp);
    }

    const hostInp = $('#smtp-host');
    const portInp = $('#smtp-port');
    const secureSel = $('#smtp-secure');
    const userInp = $('#smtp-user');
    const passInp = $('#smtp-pass');
    const fromNameInp = $('#smtp-from-name');
    const fromEmailInp = $('#smtp-from-email');
    const badge = $('#smtp-status-badge');
    const lastVerLabel = $('#smtp-last-verified-label');

    if (hostInp) hostInp.value = smtp.host || '';
    if (portInp) portInp.value = smtp.port || 587;
    if (secureSel) secureSel.value = smtp.secure ? 'true' : 'false';
    if (userInp) userInp.value = smtp.user || '';
    if (passInp) passInp.value = smtp.passMasked || '';
    if (fromNameInp) fromNameInp.value = smtp.fromName || 'ABENTRA International';
    if (fromEmailInp) fromEmailInp.value = smtp.fromEmail || (smtp.user || 'info@abentra.com');

    if (badge) {
      const isEn = S.lang === 'en';
      if (smtp.verified) {
        badge.style.borderColor = 'var(--up)';
        badge.style.color = 'var(--up)';
        badge.innerHTML = \`<i class="fa-solid fa-check"></i> <span>\${t('smtpVerifiedBadge', 'Doğrulandı')}</span>\`;
      } else {
        badge.style.borderColor = 'var(--dn)';
        badge.style.color = 'var(--dn)';
        badge.innerHTML = \`<i class="fa-solid fa-triangle-exclamation"></i> <span>\${t('smtpUnverifiedBadge', 'Doğrulanmadı')}</span>\`;
      }
    }

    if (lastVerLabel && smtp.lastVerifiedAt) {
      lastVerLabel.textContent = (S.lang === 'en' ? 'Verified: ' : 'Doğrulandı: ') + new Date(smtp.lastVerifiedAt).toLocaleString(S.lang === 'en' ? 'en-US' : 'tr-TR');
    }

    // Update mail send buttons locked state
    updateMailLockState();
  } catch (err) {
    console.warn('Could not load SMTP config:', err.message);
  }
}

function updateMailLockState() {
  const verified = isSmtpVerified();
  const composeBtn = $('#btn-mail-new-compose');
  const replyBtn = $('#btn-send-reply');

  [composeBtn, replyBtn].forEach(btn => {
    if (!btn) return;
    if (!verified) {
      btn.classList.add('smtp-locked');
      btn.title = S.lang === 'en' ? 'SMTP unverified. Click to configure.' : 'SMTP doğrulanmadı. Yapılandırmak için tıklayın.';
    } else {
      btn.classList.remove('smtp-locked');
      btn.title = '';
    }
  });
}

// Password show/hide toggle
$('#btn-toggle-smtp-pass')?.addEventListener('click', () => {
  const pass = $('#smtp-pass');
  const btn = $('#btn-toggle-smtp-pass');
  if (pass) {
    const isPass = pass.type === 'password';
    pass.type = isPass ? 'text' : 'password';
    if (btn) btn.innerHTML = isPass ? '<i class="fa-solid fa-eye-slash"></i>' : '<i class="fa-solid fa-eye"></i>';
  }
});

// Save SMTP
$('#form-smtp-settings')?.addEventListener('submit', async e => {
  e.preventDefault();
  const host = $('#smtp-host')?.value.trim();
  const port = parseInt($('#smtp-port')?.value, 10) || 587;
  const secure = $('#smtp-secure')?.value === 'true';
  const user = $('#smtp-user')?.value.trim();
  const pass = $('#smtp-pass')?.value;
  const fromName = $('#smtp-from-name')?.value.trim();
  const fromEmail = $('#smtp-from-email')?.value.trim();

  try {
    const res = await fetch('/api/moon/manager/smtp/save', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ host, port, secure, user, pass, fromName, fromEmail })
    });
    const data = await res.json();
    if (res.ok) {
      toast(t('toastSmtpSaved', 'SMTP ayarları kaydedildi.'));
      await loadSmtpSettings();
    } else {
      toast(data.error || 'Kaydetme hatası');
    }
  } catch (err) {
    toast('Hata: ' + err.message);
  }
});

// Verify SMTP
$('#btn-verify-smtp')?.addEventListener('click', async () => {
  const host = $('#smtp-host')?.value.trim();
  const port = parseInt($('#smtp-port')?.value, 10) || 587;
  const secure = $('#smtp-secure')?.value === 'true';
  const user = $('#smtp-user')?.value.trim();
  const pass = $('#smtp-pass')?.value;
  const fromName = $('#smtp-from-name')?.value.trim();
  const fromEmail = $('#smtp-from-email')?.value.trim();
  const testRecipient = $('#smtp-test-recipient')?.value.trim();

  toast(t('toastTestingSmtp', 'SMTP bağlantısı test ediliyor...'));

  try {
    const res = await fetch('/api/moon/manager/smtp/verify', {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ host, port, secure, user, pass, fromName, fromEmail, testRecipient })
    });
    const data = await res.json();
    if (res.ok && data.success) {
      toast(t('toastSmtpVerified', 'SMTP bağlantısı başarıyla doğrulandı!'));
      await loadSmtpSettings();
    } else {
      toast(t('toastSmtpVerifyFailed', 'SMTP doğrulama başarısız:') + ' ' + (data.error || 'Hata'));
    }
  } catch (err) {
    toast('Hata: ' + err.message);
  }
});

// SMTP Modal Close & Go handlers
$('#btn-modal-close-smtp')?.addEventListener('click', closeSmtpLockedModal);
$('#btn-modal-go-smtp')?.addEventListener('click', () => {
  closeSmtpLockedModal();
  go('temel');
  setTimeout(() => {
    $('#card-smtp-settings')?.scrollIntoView({ behavior: 'smooth' });
  }, 100);
});
`;

src += '\n' + smtpControllerLogic;

// Call loadSmtpSettings in renderTemelView and loadAllData
src = src.replace('async function renderTemelView() {\n  await refreshTemelStats();\n  initTemelHandlers();\n}', 'async function renderTemelView() {\n  await refreshTemelStats();\n  initTemelHandlers();\n  await loadSmtpSettings();\n}');

// Enforce SMTP verification on compose button click and reply click
src = src.replace(
  `$('#btn-mail-new-compose')?.addEventListener('click', () => {`,
  `$('#btn-mail-new-compose')?.addEventListener('click', e => {
  if (!isSmtpVerified()) {
    e.preventDefault();
    e.stopPropagation();
    showSmtpLockedModal();
    return;
  }`
);

fs.writeFileSync('moon/manager/js/admin.js', src, 'utf8');
console.log('Successfully injected Web Builder & SMTP Controller into moon/manager/js/admin.js!');
