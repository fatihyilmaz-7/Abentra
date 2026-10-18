const fs = require('fs');

let html = fs.readFileSync('moon/manager/index.html', 'utf8');

// 1. Script cache busters
html = html.replace(
  '<script src="/moon/manager/js/i18n.js"></script>',
  '<script src="/moon/manager/js/i18n.js?v=4.5.0"></script>'
);
html = html.replace(
  '<script src="/moon/manager/js/admin.js"></script>',
  '<script src="/moon/manager/js/admin.js?v=4.5.0"></script>'
);

// 2. Replace #v-sec with Executive Web Builder & Section Studio
const oldVSec = `      <!-- VIEW 5: SEC (Ara Bölümler) -->
      <section class="view" id="v-sec">
        <div class="grid g3">
          <div class="glass card">
            <h3 data-i="secMainTitle">Ara bölümler</h3>
            <p class="sub" style="margin-bottom:16px" data-i="secMainSub">Yayındaki bölümleri anahtarla anında aç veya kapat</p>
            <div id="secs"></div>
          </div>
          <div class="glass card">
            <h3 data-i="newSecTitle">Yeni özel bölüm</h3>
            <p class="sub" data-i="newSecSub">Sitede gösterilecek yeni bir ara blok tanımlayın</p>
            <div class="f" style="margin-top:14px">
              <label data-i="lblFormat">Format</label>
              <select id="new-sec-type">
                <option value="cards" data-i="fmtCards">Kart ızgarası</option>
                <option value="process" data-i="fmtProcess">Süreç (Adım Adım)</option>
                <option value="stats" data-i="fmtStats">Metrik & Sayılar</option>
                <option value="faq" data-i="fmtFaq">SSS (Soru-Cevap)</option>
              </select>
            </div>
            <div class="f">
              <label data-i="lblSecTitle">Bölüm Başlığı</label>
              <input class="i" id="new-sec-title" placeholder="Örn. Referanslarımız ve Ortaklarımız" data-i-ph="phSecTitle">
            </div>
            <div class="f">
              <label data-i="lblSecSub">Alt Açıklama</label>
              <input class="i" id="new-sec-sub" placeholder="Örn. Başarıyla tamamlanan kurumsal projeler" data-i-ph="phSecSub">
            </div>
            <button class="pill gold" id="btn-create-section" data-i="btnAddSecSubmit">Bölüm ekle</button>
          </div>
        </div>
      </section>`;

const newVSec = `      <!-- VIEW 5: SEC (Web Builder & Ara Bölümler Stüdyosu) -->
      <section class="view" id="v-sec">
        <div class="builder-studio-root">
          <!-- Top Builder Toolbar -->
          <div class="builder-top-toolbar glass">
            <div>
              <h3 style="font-size:18px;margin-bottom:2px;display:flex;align-items:center;gap:8px;">
                <i class="fa-solid fa-shapes" style="color:var(--ac);"></i>
                <span data-i="builderMainTitle">Web Builder & Ara Bölümler</span>
              </h3>
              <p class="sub" style="font-size:12px;margin:0;" data-i="builderMainSub">Sürükle-bırak veya detaylı yapılandırılmış liste editörüyle sitenizin bölümlerini ve zengin widget'larını yönetin.</p>
            </div>

            <!-- Mode Switcher: Canvas Drag-Drop vs Detailed Structured List -->
            <div class="builder-mode-switcher">
              <button type="button" class="builder-mode-btn on" id="btn-mode-canvas" data-mode="canvas">
                <i class="fa-solid fa-layer-group"></i> <span data-i="btnBuilderCanvasMode">Görsel Builder (Sürükle-Bırak)</span>
              </button>
              <button type="button" class="builder-mode-btn" id="btn-mode-list" data-mode="list">
                <i class="fa-solid fa-list-check"></i> <span data-i="btnBuilderListMode">Yapılandırılmış Detaylı Liste</span>
              </button>
            </div>

            <!-- Responsive Device Simulation Bar -->
            <div class="device-preview-bar" id="builder-device-bar">
              <button type="button" class="device-btn on" data-device="desktop" title="Masaüstü (Desktop)"><i class="fa-solid fa-display"></i></button>
              <button type="button" class="device-btn" data-device="tablet" title="Tablet"><i class="fa-solid fa-tablet-screen-button"></i></button>
              <button type="button" class="device-btn" data-device="mobile" title="Mobil"><i class="fa-solid fa-mobile-screen"></i></button>
            </div>

            <div style="display:flex;gap:8px;align-items:center;">
              <button type="button" class="pill gold" id="btn-builder-add-custom" data-i="btnAddWidgetTrigger">
                <i class="fa-solid fa-plus"></i> <span>Yeni Widget / Bölüm Ekle</span>
              </button>
              <button type="button" class="pill" id="btn-builder-save-all" data-i="btnSaveAllBuilder">
                <i class="fa-solid fa-floppy-disk"></i> <span>Tüm Bölümleri Kaydet</span>
              </button>
            </div>
          </div>

          <!-- MODE 1: Visual Drag & Drop Canvas Layout -->
          <div id="builder-canvas-mode-root" class="builder-canvas-layout">
            <!-- Left Widget Library Palette (20 Rich Widgets) -->
            <div class="builder-palette glass card">
              <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;">
                <h4 style="font-size:14px;margin:0;display:flex;align-items:center;gap:6px;">
                  <i class="fa-solid fa-box-open" style="color:var(--ac);"></i>
                  <span data-i="widgetLibraryTitle">Widget & Bölüm Kütüphanesi</span>
                </h4>
                <span class="tag" style="font-size:10.5px;">20 Widget</span>
              </div>
              <p class="sub" style="font-size:11.5px;margin-bottom:8px;" data-i="widgetLibrarySub">Sitenize eklemek istediğiniz widget'ı tuvale sürükleyin veya Ekle'ye tıklayın</p>

              <!-- Search Widget Input -->
              <div class="widget-search-wrap">
                <i class="fa-solid fa-magnifying-glass" style="color:var(--mut);font-size:12px;"></i>
                <input type="text" id="widget-search-input" placeholder="Widget ara..." data-i-ph="phSearchWidgets">
              </div>

              <!-- Categories Filter Tabs -->
              <div class="widget-cat-tabs" id="widget-cat-tabs">
                <button type="button" class="widget-cat-pill on" data-cat="all" data-i="tabWidgetsAll">Tümü (20)</button>
                <button type="button" class="widget-cat-pill" data-cat="core" data-i="tabWidgetsCore">Temel & Kahraman</button>
                <button type="button" class="widget-cat-pill" data-cat="content" data-i="tabWidgetsContent">İçerik & Hikaye</button>
                <button type="button" class="widget-cat-pill" data-cat="trust" data-i="tabWidgetsTrust">Sosyal Kanıt & Güven</button>
                <button type="button" class="widget-cat-pill" data-cat="conversion" data-i="tabWidgetsConversion">Dönüşüm & Eylem</button>
              </div>

              <!-- 20 Draggable Widgets Stream -->
              <div class="widget-stream-grid" id="widget-library-stream"></div>
            </div>

            <!-- Right Visual Canvas Drop Area -->
            <div class="builder-canvas-wrapper" id="builder-canvas-wrapper">
              <div id="builder-canvas-dropzone" style="display:flex;flex-direction:column;gap:12px;min-height:480px;"></div>
            </div>
          </div>

          <!-- MODE 2: Detailed Structured List View -->
          <div id="builder-list-mode-root" class="builder-list-wrapper" style="display:none;">
            <div id="builder-structured-list-stream"></div>
          </div>
        </div>
      </section>`;

html = html.replace(oldVSec, newVSec);

// 3. Add SMTP configuration card into #v-temel
const temelTarget = `<!-- CARD 2: Otomatik Zamanlanmış Temizleme -->`;
const smtpCardHtml = `<!-- CARD 3: SMTP E-Posta Sunucu Yapılandırması ve Doğrulama -->
          <div class="glass card" id="card-smtp-settings" style="grid-column: span 2; margin-top: 18px; border-color: color-mix(in srgb, var(--ac) 30%, var(--bd));">
            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;flex-wrap:wrap;gap:10px;">
              <h3 style="display:flex;align-items:center;gap:8px;margin:0;">
                <i class="fa-solid fa-server" style="color:var(--ac);"></i>
                <span data-i="smtpCardTitle">SMTP E-Posta Sunucu Yapılandırması ve Doğrulama</span>
              </h3>
              <div style="display:flex;align-items:center;gap:10px;">
                <span class="tag" id="smtp-status-badge" style="border-color:var(--dn);color:var(--dn);">
                  <i class="fa-solid fa-triangle-exclamation"></i> <span data-i="smtpUnverifiedBadge">Doğrulanmadı</span>
                </span>
                <span class="sub" id="smtp-last-verified-label" style="font-size:11.5px;"></span>
              </div>
            </div>
            <p class="sub" style="margin-bottom:16px;" data-i="smtpCardSub">
              E-posta merkezi üzerinden mesaj gönderebilmek ve gelen taleplere yanıt verebilmek için SMTP sunucunuzu yapılandırın ve doğrulayın. Doğrulama yapılmadan e-posta çıkışına izin verilmez.
            </p>

            <form id="form-smtp-settings">
              <div class="grid g4" style="margin-bottom:12px;">
                <div class="f">
                  <label data-i="lblSmtpHost">SMTP Sunucu Adresi (Host)</label>
                  <input class="i" type="text" id="smtp-host" placeholder="smtp.gmail.com veya mail.abentra.com" required>
                </div>
                <div class="f">
                  <label data-i="lblSmtpPort">Port Numarası</label>
                  <input class="i" type="number" id="smtp-port" placeholder="587" value="587" required>
                </div>
                <div class="f">
                  <label data-i="lblSmtpSecurity">Güvenlik Protokolü</label>
                  <select id="smtp-secure" class="i">
                    <option value="false">STARTTLS (Port 587 / 25)</option>
                    <option value="true">SSL / TLS (Port 465)</option>
                  </select>
                </div>
                <div class="f">
                  <label data-i="lblSmtpUser">SMTP Kullanıcı Adı / E-Posta</label>
                  <input class="i" type="text" id="smtp-user" placeholder="info@abentra.com" required autocomplete="username">
                </div>
              </div>

              <div class="grid g3" style="margin-bottom:14px;">
                <div class="f">
                  <label data-i="lblSmtpPass">SMTP Şifresi / Uygulama Şifresi</label>
                  <div style="position:relative;display:flex;align-items:center;">
                    <input class="i" type="password" id="smtp-pass" placeholder="••••••••" style="width:100%;padding-right:36px;" autocomplete="current-password">
                    <button type="button" id="btn-toggle-smtp-pass" style="all:unset;position:absolute;right:10px;cursor:pointer;color:var(--mut);" aria-label="Toggle password">
                      <i class="fa-solid fa-eye"></i>
                    </button>
                  </div>
                </div>
                <div class="f">
                  <label data-i="lblSmtpFromName">Gönderen Adı (From Name)</label>
                  <input class="i" type="text" id="smtp-from-name" value="ABENTRA International">
                </div>
                <div class="f">
                  <label data-i="lblSmtpFromEmail">Gönderen E-Posta (From Email)</label>
                  <input class="i" type="email" id="smtp-from-email" placeholder="info@abentra.com">
                </div>
              </div>

              <div class="f" style="margin-bottom:16px;">
                <label data-i="lblSmtpTestEmail">Doğrulama İçin Test E-Postası (Opsiyonel)</label>
                <input class="i" type="email" id="smtp-test-recipient" placeholder="dogrulama@abentra.com (Test mesajı göndermek isterseniz yazın)">
              </div>

              <div style="display:flex;gap:12px;flex-wrap:wrap;align-items:center;">
                <button type="submit" class="pill gold" id="btn-save-smtp" data-i="btnSaveSmtp">
                  <i class="fa-solid fa-floppy-disk"></i> <span>SMTP Ayarlarını Kaydet</span>
                </button>
                <button type="button" class="pill" id="btn-verify-smtp" data-i="btnVerifySmtp" style="border-color:var(--up);color:var(--up);">
                  <i class="fa-solid fa-circle-check"></i> <span>Bağlantıyı Test Et ve Doğrula</span>
                </button>
              </div>
            </form>
          </div>

          ` + temelTarget;

html = html.replace(temelTarget, smtpCardHtml);

// 4. Add SMTP Locked Alert Modal and Section Editor Modal before </body>
const modalsHtml = `
  <!-- ==============================================================================
       SMTP LOCKED WARNING MODAL (Appears in current language when sending is locked)
       ============================================================================== -->
  <div id="modal-smtp-locked" class="builder-modal-overlay">
    <div class="builder-modal-card" style="max-width:520px;text-align:center;">
      <div style="padding:32px 24px 20px;">
        <div style="width:64px;height:64px;border-radius:50%;margin:0 auto 16px;background:rgba(239,68,68,0.12);border:2px solid var(--dn);display:flex;align-items:center;justify-content:center;font-size:26px;color:var(--dn);">
          <i class="fa-solid fa-lock"></i>
        </div>
        <h3 style="font-size:20px;margin-bottom:10px;color:#fff;" data-i="smtpLockedNoticeTitle">SMTP Doğrulaması Gerekli</h3>
        <p class="sub" style="font-size:13.5px;line-height:1.6;margin-bottom:24px;" data-i="smtpLockedNoticeDesc">
          E-posta gönderebilmek ve gelen mesajlara yanıt verebilmek için öncelikle Temel Ayarlar bölümünden SMTP e-posta sunucu bilgilerinizi girip doğrulamanız gerekmektedir. Şu anda doğrulanmış bir SMTP sunucusu bulunmamaktadır.
        </p>
        <div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;">
          <button type="button" class="pill gold" id="btn-modal-go-smtp" data-i="btnGoToSmtpSettings">
            <i class="fa-solid fa-gear"></i> <span>Temel Ayarlara Git ve Doğrula</span>
          </button>
          <button type="button" class="pill" id="btn-modal-close-smtp">
            <i class="fa-solid fa-xmark"></i> <span data-i="actionClose">Kapat</span>
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- ==============================================================================
       SECTION / WIDGET DEEP EDITOR MODAL
       ============================================================================== -->
  <div id="modal-section-editor" class="builder-modal-overlay">
    <div class="builder-modal-card">
      <div class="builder-modal-head">
        <h3 id="sec-modal-title" style="margin:0;font-size:16px;display:flex;align-items:center;gap:8px;">
          <i class="fa-solid fa-pen-to-square" style="color:var(--ac);"></i>
          <span>Bölüm Detaylarını Düzenle</span>
        </h3>
        <button type="button" class="pill" id="btn-close-sec-modal" aria-label="Close"><i class="fa-solid fa-xmark"></i></button>
      </div>
      <div class="builder-modal-body" id="sec-modal-body"></div>
      <div class="builder-modal-foot">
        <button type="button" class="pill" id="btn-cancel-sec-modal" data-i="actionCancel">İptal</button>
        <button type="button" class="pill gold" id="btn-save-sec-modal" data-i="btnSaveModalSection">Değişiklikleri Uygula</button>
      </div>
    </div>
  </div>

  <!-- ==============================================================================
       COMPOSE EMAIL MODAL
       ============================================================================== -->
  <div id="modal-compose-email" class="builder-modal-overlay">
    <div class="builder-modal-card" style="max-width:680px;">
      <div class="builder-modal-head">
        <h3 style="margin:0;font-size:16px;display:flex;align-items:center;gap:8px;">
          <i class="fa-solid fa-paper-plane" style="color:var(--ac);"></i>
          <span data-i="composeNewMailTitle">Yeni E-Posta Gönder</span>
        </h3>
        <button type="button" class="pill" id="btn-close-compose-modal" aria-label="Close"><i class="fa-solid fa-xmark"></i></button>
      </div>
      <div class="builder-modal-body">
        <div class="f">
          <label data-i="lblRecipientEmail">Alıcı E-Posta Adresi</label>
          <input class="i" type="email" id="compose-recipient" placeholder="client@company.com" required>
        </div>
        <div class="f">
          <label data-i="lblMailSubject">E-Posta Konusu</label>
          <input class="i" type="text" id="compose-subject" placeholder="Örn: ABENTRA Danışmanlık ve Yatırım Bilgilendirmesi" required>
        </div>
        <div class="f">
          <label data-i="lblSelectTplFast">Hazır Şablon Seç (İsteğe Bağlı)</label>
          <select id="compose-template-select" class="i"></select>
        </div>
        <div class="f">
          <label data-i="lblMailBodyText">Mesaj Metni</label>
          <textarea id="compose-body" style="min-height:160px;" placeholder="Sayın Yetkili, ..."></textarea>
        </div>
      </div>
      <div class="builder-modal-foot">
        <button type="button" class="pill" id="btn-cancel-compose" data-i="actionCancel">İptal</button>
        <button type="button" class="pill gold" id="btn-submit-compose-mail">
          <i class="fa-solid fa-paper-plane"></i> <span data-i="btnSendNow">E-Postayı Gönder</span>
        </button>
      </div>
    </div>
  </div>
`;

html = html.replace('</body>', modalsHtml + '\n</body>');

fs.writeFileSync('moon/manager/index.html', html, 'utf8');
console.log('Successfully updated moon/manager/index.html with Web Builder, SMTP Card, and Modals!');
