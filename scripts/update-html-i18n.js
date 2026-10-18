const fs = require('fs');

let html = fs.readFileSync('moon/manager/index.html', 'utf8');

// 1. Add FontAwesome 6 link in head if not present
if (!html.includes('font-awesome')) {
  html = html.replace(
    '<link rel="stylesheet" href="/moon/manager/css/admin.css">',
    '<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">\n  <link rel="stylesheet" href="/moon/manager/css/admin.css">'
  );
}

// 2. Add language switcher toggle in header if not present
if (!html.includes('id="top-lang-switch"')) {
  const switcherHtml = `<div class="lang-switch-toggle" id="top-lang-switch" title="Language / Dil">
          <button type="button" class="lang-opt-btn" data-lang="tr" id="btn-lang-tr"><i class="fa-solid fa-globe"></i> TR</button>
          <button type="button" class="lang-opt-btn" data-lang="en" id="btn-lang-en">EN</button>
        </div>\n        <button class="pill gold" id="btn-preview-site"`;
  html = html.replace('<button class="pill gold" id="btn-preview-site"', switcherHtml);
}

// 3. Ensure i18n.js script is included
if (!html.includes('/moon/manager/js/i18n.js')) {
  html = html.replace(
    '<script src="/moon/manager/js/admin.js"></script>',
    '<script src="/moon/manager/js/i18n.js"></script>\n  <script src="/moon/manager/js/admin.js"></script>'
  );
}

// 4. Replace non-flag emojis with FontAwesome icons
html = html.replace('👤 Gerçek', '<i class="fa-solid fa-user"></i> <span data-i="segHuman">Gerçek</span>');
html = html.replace('🌐 Tümü', '<i class="fa-solid fa-globe"></i> <span data-i="segAll">Tümü</span>');
html = html.replace('🤖 Bot/DNS', '<i class="fa-solid fa-robot"></i> <span data-i="segBot">Bot/DNS</span>');
html = html.replace('👤 Sadece Gerçek Kullanıcılar', 'Sadece Gerçek Kullanıcılar');
html = html.replace('🤖 Bot & DNS / Tarayıcı', 'Bot & DNS / Tarayıcı');
html = html.replace('⚠️ Şüpheli İstekler', 'Şüpheli İstekler');
html = html.replace('⚡ purge --all', '<i class="fa-solid fa-bolt"></i> purge --all');

// 5. Add data-i tags to specific tags that lack them
const replacements = [
  ['<p class="sub">Yönetim Merkezi · Executive Portal</p>', '<p class="sub" data-i="signInSubtitle">Yönetim Merkezi · Executive Portal</p>'],
  ['<label for="login-username">Kullanıcı Adı</label>', '<label for="login-username" data-i="lblUsername">Kullanıcı Adı</label>'],
  ['<label for="login-password">Şifre</label>', '<label for="login-password" data-i="lblPassword">Şifre</label>'],
  ['<span style="font-size: 13px; font-weight: 500;">Beni 2 hafta hatırla (14 gün)</span>', '<span style="font-size: 13px; font-weight: 500;" data-i="rememberMe14d">Beni 2 hafta hatırla (14 gün)</span>'],
  ['Giriş Yap / Sign In', '<span data-i="btnSignIn">Giriş Yap</span>'],
  ['<input placeholder="Ara..." id="q">', '<input placeholder="Ara..." id="q" data-i-ph="topSearchPlaceholder">'],
  ['<button class="pill gold" id="btn-preview-site">Siteyi önizle</button>', '<button class="pill gold" id="btn-preview-site" data-i="topPreviewSite">Siteyi önizle</button>'],
  ['<p class="sub" id="traffic-sub-label">Son 7 günlük ziyaretçi ve etkileşim eğrisi</p>', '<p class="sub" id="traffic-sub-label" data-i="trafSub">Son 7 günlük ziyaretçi ve etkileşim eğrisi</p>'],
  ['<button data-period="weekly" class="on">Haftalık</button>', '<button data-period="weekly" class="on" data-i="periodWeekly">Haftalık</button>'],
  ['<button data-period="3days">3 Günlük</button>', '<button data-period="3days" data-i="period3Days">3 Günlük</button>'],
  ['<button data-period="daily">Günlük</button>', '<button data-period="daily" data-i="periodDaily">Günlük</button>'],
  ['<p class="sub">Gelen taleplerin yanıtlanma performansı</p>', '<p class="sub" data-i="respSub">Gelen taleplerin yanıtlanma performansı</p>'],
  ['<p class="sub" style="margin-bottom:8px">Ortalama kalış süresi ve ilgi oranı</p>', '<p class="sub" style="margin-bottom:8px" data-i="mkSub">Ortalama kalış süresi ve ilgi oranı</p>'],
  ['<p class="sub" style="margin-bottom:8px">Gelen kutusuna düşen son talepler</p>', '<p class="sub" style="margin-bottom:8px" data-i="recSub">Gelen kutusuna düşen son talepler</p>'],
  ['<option value="all">Tüm İstekler (Hepsi)</option>', '<option value="all" data-i="filterAllRequests">Tüm İstekler (Hepsi)</option>'],
  ['<option value="human" selected>Sadece Gerçek Kullanıcılar</option>', '<option value="human" selected data-i="filterVerifiedHumans">Sadece Gerçek Kullanıcılar</option>'],
  ['<option value="bot">Bot & DNS / Tarayıcı</option>', '<option value="bot" data-i="filterBotsCrawlers">Bot & DNS / Tarayıcı</option>'],
  ['<option value="suspicious">Şüpheli İstekler</option>', '<option value="suspicious" data-i="filterSuspicious">Şüpheli İstekler</option>'],
  ['<option value="all">Tüm zamanlar</option>', '<option value="all" data-i="filterAllTime">Tüm zamanlar</option>'],
  ['<option value="7">Son 7 gün</option>', '<option value="7" data-i="filter7Days">Son 7 gün</option>'],
  ['<option value="30" selected>Son 30 gün</option>', '<option value="30" selected data-i="filter30Days">Son 30 gün</option>'],
  ['<option value="all">Tüm ülkeler</option>', '<option value="all" data-i="filterAllCountries">Tüm ülkeler</option>'],
  ['<option value="all">Tüm cihazlar</option>', '<option value="all" data-i="filterAllDevices">Tüm cihazlar</option>'],
  ['CSV İndir\n            </button>', '<span data-i="exportCsv">CSV İndir</span>\n            </button>'],
  ['Logları Temizle\n            </button>', '<span data-i="clearLogs">Logları Temizle</span>\n            </button>'],
  ['<th>IP Adresi</th>', '<th data-i="thIp">IP Adresi</th>'],
  ['<th>Ziyaretçi Türü</th>', '<th data-i="thVisitorType">Ziyaretçi Türü</th>'],
  ['<th>Konum</th>', '<th data-i="thLocation">Konum</th>'],
  ['<th>Cihaz</th>', '<th data-i="thDevice">Cihaz</th>'],
  ['<th>Tarayıcı</th>', '<th data-i="thBrowser">Tarayıcı</th>'],
  ['<th>Süre</th>', '<th data-i="thDwellTime">Süre</th>'],
  ['<th>En Çok Baktığı Alan</th>', '<th data-i="thTopSection">En Çok Baktığı Alan</th>'],
  ['<p class="sub" style="margin-bottom:8px">Hangi alan ne kadar görüntülendi ve incelendi</p>', '<p class="sub" style="margin-bottom:8px" data-i="logsInterestSub">Hangi alan ne kadar görüntülendi ve incelendi</p>'],
  ['<h3>Site teması ve marka</h3>', '<h3 data-i="themeMainTitle">Site teması ve marka</h3>'],
  ['<p class="sub" style="margin-bottom:14px">Yayındaki web sitesinin görünüm ve kurumsal renkleri</p>', '<p class="sub" style="margin-bottom:14px" data-i="themeMainSub">Yayındaki web sitesinin görünüm ve kurumsal renkleri</p>'],
  ['<label>Hazır şablon</label>', '<label data-i="lblPreset">Hazır şablon</label>'],
  ['<label>Başlık yazı tipi</label>', '<label data-i="lblFont">Başlık yazı tipi</label>'],
  ['<label>Buton şekli</label>', '<label data-i="lblBtnShape">Buton şekli</label>'],
  ['<label>Şirket adı</label>', '<label data-i="lblCompanyName">Şirket adı</label>'],
  ['<button class="pill gold" id="btn-save-site-theme" style="margin-top:10px;">Site Temasını Kaydet</button>', '<button class="pill gold" id="btn-save-site-theme" style="margin-top:10px;" data-i="btnSaveTheme">Site Temasını Kaydet</button>'],
  ['<h3>Canlı önizleme</h3>', '<h3 data-i="liveSimTitle">Canlı önizleme</h3>'],
  ['<p class="sub" style="margin-bottom:14px">Web sitesi Hero bölümü canlı simülasyonu</p>', '<p class="sub" style="margin-bottom:14px" data-i="liveSimSub">Web sitesi Hero bölümü canlı simülasyonu</p>'],
  ['<span id="prev-btn">Danışmanlık Al</span>', '<span id="prev-btn" data-i="prevHeroBtn">Danışmanlık Al</span>'],
  ['<div>Logo yüklemek için tıklayın veya dosyayı sürükleyin</div>', '<div data-i="logoDropText">Logo yüklemek için tıklayın veya dosyayı sürükleyin</div>'],
  ['<small style="opacity:.7">PNG, JPG, SVG veya JPEG · maks 5MB</small>', '<small style="opacity:.7" data-i="logoDropSub">PNG, JPG, SVG veya JPEG · maks 5MB</small>'],
  ['<p class="sub" style="margin-bottom:14px">Yazdıkça güncellenen canlı metin önizlemesi</p>', '<p class="sub" style="margin-bottom:14px" data-i="cmsLiveSub">Yazdıkça güncellenen canlı metin önizlemesi</p>'],
  ['<button class="pill" id="btn-reset-cms">Fabrika ayarlarına sıfırla</button>', '<button class="pill" id="btn-reset-cms" data-i="btnResetDefaults">Fabrika ayarlarına sıfırla</button>'],
  ['<h3>Ara bölümler</h3>', '<h3 data-i="secMainTitle">Ara bölümler</h3>'],
  ['<p class="sub" style="margin-bottom:16px">Yayındaki bölümleri anahtarla anında aç veya kapat</p>', '<p class="sub" style="margin-bottom:16px" data-i="secMainSub">Yayındaki bölümleri anahtarla anında aç veya kapat</p>'],
  ['<h3>Yeni özel bölüm</h3>', '<h3 data-i="newSecTitle">Yeni özel bölüm</h3>'],
  ['<p class="sub">Sitede gösterilecek yeni bir ara blok tanımlayın</p>', '<p class="sub" data-i="newSecSub">Sitede gösterilecek yeni bir ara blok tanımlayın</p>'],
  ['<label>Format</label>', '<label data-i="lblFormat">Format</label>'],
  ['<label>Bölüm Başlığı</label>', '<label data-i="lblSecTitle">Bölüm Başlığı</label>'],
  ['<label>Alt Açıklama</label>', '<label data-i="lblSecSub">Alt Açıklama</label>'],
  ['<button class="pill gold" id="btn-create-section">Bölüm ekle</button>', '<button class="pill gold" id="btn-create-section" data-i="btnAddSecSubmit">Bölüm ekle</button>'],
  ['<span>Yeni E-Posta</span>', '<span data-i="btnNewMail">Yeni E-Posta</span>'],
  ['Gelen Kutusu\n                </span>', '<span data-i="folderInbox">Gelen Kutusu</span>\n                </span>'],
  ['Yıldızlılar\n                </span>', '<span data-i="folderStarred">Yıldızlılar</span>\n                </span>'],
  ['Gönderilenler\n                </span>', '<span data-i="folderSent">Gönderilenler</span>\n                </span>'],
  ['Taslaklar\n                </span>', '<span data-i="folderDrafts">Taslaklar</span>\n                </span>'],
  ['Şablonlar\n                </span>', '<span data-i="folderTemplates">Şablonlar</span>\n                </span>'],
  ['<span>Tam Ekran Modu</span>', '<span data-i="btnFullscreen">Tam Ekran Modu</span>'],
  ['placeholder="E-postalarda ara..."', 'placeholder="E-postalarda ara..." data-i-ph="phSearchMails"'],
  ['<button class="mail-filter-btn on" data-filter="all">Tümü</button>', '<button class="mail-filter-btn on" data-filter="all" data-i="filterAllMails">Tümü</button>'],
  ['<button class="mail-filter-btn" data-filter="unread">Okunmamış</button>', '<button class="mail-filter-btn" data-filter="unread" data-i="filterUnreadMails">Okunmamış</button>'],
  ['<button class="mail-filter-btn" data-filter="starred">Yıldızlı</button>', '<button class="mail-filter-btn" data-filter="starred" data-i="filterStarredMails">Yıldızlı</button>'],
  ['<h3>Giriş yapılan ülkeler</h3>', '<h3 data-i="audCountriesTitle">Giriş yapılan ülkeler</h3>'],
  ['<p class="sub" style="margin-bottom:8px">Son 30 gün · ziyaretçi dağılımı ve ortalama süre</p>', '<p class="sub" style="margin-bottom:8px" data-i="audCountriesSub">Son 30 gün · ziyaretçi dağılımı ve ortalama süre</p>'],
  ['<h3>Aktif saatler</h3>', '<h3 data-i="audHoursTitle">Aktif saatler</h3>'],
  ['<p class="sub">Kullanıcıların sitede en çok bulunduğu saatler · GMT (Monrovia)</p>', '<p class="sub" data-i="audHoursSub">Kullanıcıların sitede en çok bulunduğu saatler · GMT (Monrovia)</p>'],
  ['<h3 style="font-size:16px;margin-top:14px;">Yoğun saat aralıkları</h3>', '<h3 style="font-size:16px;margin-top:14px;" data-i="audPeakTitle">Yoğun saat aralıkları</h3>'],
  ['<h3>Öne çıkan alanlar</h3>', '<h3 data-i="audTopTitle">Öne çıkan alanlar</h3>'],
  ['<p class="sub" style="margin-bottom:12px">Kalış süresine göre en çok ilgi gören bölümler</p>', '<p class="sub" style="margin-bottom:12px" data-i="audTopSub">Kalış süresine göre en çok ilgi gören bölümler</p>'],
  ['<h3>Şu an aktif oturumlar</h3>', '<h3 data-i="audLiveTitle">Şu an aktif oturumlar</h3>'],
  ['<h3>E-postalardan soru topla</h3>', '<h3 data-i="faqScanTitle">E-postalardan soru topla</h3>'],
  ['<p class="sub" style="margin-bottom:14px">Gelen kutusundaki müşteri taleplerini tarar, konuları gruplar ve sıklığa göre listeler</p>', '<p class="sub" style="margin-bottom:14px" data-i="faqScanSub">Gelen kutusundaki müşteri taleplerini tarar, konuları gruplar ve sıklığa göre listeler</p>'],
  ['Sorguyu Çek\n            </button>', '<span data-i="btnFaqScan">Sorguyu Çek</span>\n            </button>'],
  ['<h3>Yayındaki sık sorulan sorular</h3>', '<h3 data-i="faqLiveTitle">Yayındaki sık sorulan sorular</h3>'],
  ['<p class="sub" style="margin-bottom:12px">Sitedeki SSS bölümü · cevabı düzenle, anahtarla canlı sitede göster veya gizle</p>', '<p class="sub" style="margin-bottom:12px" data-i="faqLiveSub">Sitedeki SSS bölümü · cevabı düzenle, anahtarla canlı sitede göster veya gizle</p>'],
  ['<label>Mevcut şifre</label>', '<label data-i="lblCurrentPass">Mevcut şifre</label>'],
  ['<label>Yeni şifre</label>', '<label data-i="lblNewPass">Yeni şifre</label>'],
  ['<label>Yeni şifre tekrar</label>', '<label data-i="lblConfirmPass">Yeni şifre tekrar</label>'],
  ['<button type="submit" class="pill gold" style="margin-top:8px;">Şifreyi Değiştir</button>', '<button type="submit" class="pill gold" style="margin-top:8px;" data-i="btnChangePassSubmit">Şifreyi Değiştir</button>'],
  ['<b style="flex:1;width:auto">İki aşamalı doğrulama (2FA)<small>Girişlerde ek güvenlik katmanı sağlar</small></b>', '<b style="flex:1;width:auto"><span data-i="lbl2FaTitle">İki aşamalı doğrulama (2FA)</span><small data-i="lbl2FaSub">Girişlerde ek güvenlik katmanı sağlar</small></b>'],
  ['<b style="flex:1;width:auto">Tüm sistemi yedekle<small>Config, ara bölümler, e-postalar ve logları indir</small></b>', '<b style="flex:1;width:auto"><span data-i="lblBackupTitle">Tüm sistemi yedekle</span><small data-i="lblBackupSub">Config, ara bölümler, e-postalar ve logları indir</small></b>'],
  ['Yedeği İndir\n              </button>', '<span data-i="btnDownloadBackupNow">Yedeği İndir</span>\n              </button>'],
  ['<b style="flex:1;width:auto">Yedekten geri yükle<small>JSON yedek dosyasını içe aktar</small></b>', '<b style="flex:1;width:auto"><span data-i="lblRestoreTitle">Yedekten geri yükle</span><small data-i="lblRestoreSub">JSON yedek dosyasını içe aktar</small></b>'],
  ['Yedek Yükle\n              </button>', '<span data-i="btnRestoreBackupNow">Yedek Yükle</span>\n              </button>'],
  ['<h3>Aktif oturumlar & güvenlik durumu</h3>', '<h3 data-i="activeSessionsTitle">Aktif oturumlar & güvenlik durumu</h3>'],
  ['<p class="sub" style="margin-bottom:14px">Oturum açılan cihazlar ve güvenlik sertifikasyonu</p>', '<p class="sub" style="margin-bottom:14px" data-i="activeSessionsSub">Oturum açılan cihazlar ve güvenlik sertifikasyonu</p>'],
  ['<b>Bu Cihaz (Geçerli Oturum)<small class="sub">14 gün boyunca aktif kalır</small></b>', '<b><span data-i="thisDeviceTitle">Bu Cihaz (Geçerli Oturum)</span><small class="sub" data-i="thisDeviceSub">14 gün boyunca aktif kalır</small></b>'],
  ['<p class="sub" style="margin-bottom:12px">E-posta merkezinde yanıt verirken kullanılır</p>', '<p class="sub" style="margin-bottom:12px" data-i="tplMainSub">E-posta merkezinde yanıt verirken kullanılır</p>'],
  ['Yeni şablon (iskeletten)\n            </button>', '<span data-i="btnNewTplBoilerplate">Yeni şablon (iskeletten)</span>\n            </button>'],
  ['HTML şablonu yükle<br>', '<span data-i="tplDropText">HTML şablonu yükle</span><br>'],
  ['<small>Dosyayı sürükle veya seç · en çok 500 KB</small>', '<small data-i="tplDropSub">Dosyayı sürükle veya seç · en çok 500 KB</small>'],
  ['<h3 style="font-size:16px">Yer tutucular</h3>', '<h3 style="font-size:16px" data-i="phPlaceholdersTitle">Yer tutucular</h3>'],
  ['<p class="sub" style="margin-bottom:8px">Tıkla, imlecin olduğu yere eklensin</p>', '<p class="sub" style="margin-bottom:8px" data-i="phPlaceholdersSub">Tıkla, imlecin olduğu yere eklensin</p>'],
  ['<label>Şablon adı</label>', '<label data-i="lblTplNameInput">Şablon adı</label>'],
  ['<label>Varsayılan konu</label>', '<label data-i="lblTplSubjectInput">Varsayılan konu</label>'],
  ['<label>Varsayılan kısa mesaj (%Message% yerine yazılır)</label>', '<label data-i="lblTplMsgInput">Varsayılan kısa mesaj (%Message% yerine yazılır)</label>'],
  ['<button data-m="v" class="on">Görsel</button>', '<button data-m="v" class="on" data-i="tabVisual">Görsel</button>'],
  ['<button data-m="c">HTML kodu</button>', '<button data-m="c" data-i="tabHtmlCode">HTML kodu</button>'],
  ['<button data-m="p">Önizleme</button>', '<button data-m="p" data-i="tabPreview">Önizleme</button>'],
  ['<button class="pill gold" id="tsave">Kaydet</button>', '<button class="pill gold" id="tsave" data-i="btnSaveTplSubmit">Kaydet</button>'],
  ['<button class="pill" id="tdup">Çoğalt</button>', '<button class="pill" id="tdup" data-i="btnDuplicateTpl">Çoğalt</button>'],
  ['<button class="pill" id="tcopy">HTML\'i kopyala</button>', '<button class="pill" id="tcopy" data-i="btnCopyTplHtml">HTML\'i kopyala</button>'],
  ['<button class="pill" id="ttest">Test e-postası gönder</button>', '<button class="pill" id="ttest" data-i="btnTestTplEmail">Test e-postası gönder</button>'],
  ['<button class="pill" id="tdel" style="color:var(--dn);border-color:color-mix(in srgb, var(--dn) 40%, transparent)">Sil</button>', '<button class="pill" id="tdel" style="color:var(--dn);border-color:color-mix(in srgb, var(--dn) 40%, transparent)" data-i="btnDeleteTplNow">Sil</button>'],
  ['<h3>Yöneticiler</h3>', '<h3 data-i="adminsCardTitle">Yöneticiler</h3>'],
  ['<p class="sub" style="margin-bottom:12px">Yöneticiyi seçip yetkilerini açılan pencerede düzenle. Ayarlarda tek yetkisi olan yönetici o bölümü doğrudan menüde görür; birden fazla yetkisi olanda Ayarlar açılır menüsü oluşur.</p>', '<p class="sub" style="margin-bottom:12px" data-i="adminsCardSub">Yöneticiyi seçip yetkilerini açılan pencerede düzenle. Ayarlarda tek yetkisi olan yönetici o bölümü doğrudan menüde görür; birden fazla yetkisi olanda Ayarlar açılır menüsü oluşur.</p>'],
  ['<h3>Yetki paketleri</h3>', '<h3 data-i="bundlesCardTitle">Yetki paketleri</h3>'],
  ['<p class="sub" style="margin-bottom:12px">Sık kullanılan yetkileri paketle, yöneticiye tek tıkla ver. Paketleri kendin oluşturup düzenleyebilirsin.</p>', '<p class="sub" style="margin-bottom:12px" data-i="bundlesCardSub">Sık kullanılan yetkileri paketle, yöneticiye tek tıkla ver. Paketleri kendin oluşturup düzenleyebilirsin.</p>'],
  ['<button class="pill gold" id="pnew" style="margin-top:8px">Yeni paket</button>', '<button class="pill gold" id="pnew" style="margin-top:8px" data-i="btnNewBundleSubmit">Yeni paket</button>'],
  ['<span class="sub">Ziyaretçi Logları</span>', '<span class="sub" data-i="temelLogsStatTitle">Ziyaretçi Logları</span>'],
  ['<small class="sub">Kayıtlı oturum ve istek</small>', '<small class="sub" data-i="temelLogsStatSub">Kayıtlı oturum ve istek</small>'],
  ['<span class="sub">Isı Haritası & Süre</span>', '<span class="sub" data-i="temelHeatmapStatTitle">Isı Haritası & Süre</span>'],
  ['<small class="sub">İzlenen alan metrikleri</small>', '<small class="sub" data-i="temelHeatmapStatSub">İzlenen alan metrikleri</small>'],
  ['<span class="sub">Cihaz & Coğrafya</span>', '<span class="sub" data-i="temelGeoStatTitle">Cihaz & Coğrafya</span>'],
  ['<small class="sub">Ülke ve tarayıcı dağılımı</small>', '<small class="sub" data-i="temelGeoStatSub">Ülke ve tarayıcı dağılımı</small>'],
  ['<span class="sub">Otomatik Temizleme</span>', '<span class="sub" data-i="temelAutoPurgeStatTitle">Otomatik Temizleme</span>'],
  ['<small class="sub" id="temel-last-purge-label">Son: Henüz yok</small>', '<small class="sub" id="temel-last-purge-label" data-i="temelAutoPurgeStatLast">Son: Henüz yok</small>'],
  ['Tüm Verileri ve Metrikleri Sıfırla\n              </h3>', '<span data-i="temelWipeCardTitle">Tüm Verileri ve Metrikleri Sıfırla</span>\n              </h3>'],
  ['<span class="tag" style="border-color:var(--dn);color:var(--dn)">Geri Alınamaz</span>', '<span class="tag" style="border-color:var(--dn);color:var(--dn)" data-i="tagIrreversible">Geri Alınamaz</span>'],
  ['Sistemde toplanan tüm ziyaretçi loglarını, sayfa ve bölüm ısı haritalarını, cihaz ve coğrafi metrikleri otomatik olarak tek tıkla siler.', '<span data-i="temelWipeCardSub">Sistemde toplanan tüm ziyaretçi loglarını, sayfa ve bölüm ısı haritalarını, cihaz ve coğrafi metrikleri otomatik olarak tek tıkla siler.</span>'],
  ['Sıfırlanacak Kapsam\n              </div>', '<span data-i="temelScopeHeading">Sıfırlanacak Kapsam</span>\n              </div>'],
  ['<span>Ziyaretçi Logları & Ham İstek Telemetrisi (Supabase + Yerel)</span>', '<span data-i="chkScope1">Ziyaretçi Logları & Ham İstek Telemetrisi (Supabase + Yerel)</span>'],
  ['<span>Bölüm Isı Haritası & Sayfada Kalış Süreleri</span>', '<span data-i="chkScope2">Bölüm Isı Haritası & Sayfada Kalış Süreleri</span>'],
  ['<span>Cihaz, Tarayıcı ve Coğrafi Ülke İstatistikleri</span>', '<span data-i="chkScope3">Cihaz, Tarayıcı ve Coğrafi Ülke İstatistikleri</span>'],
  ['<span>Canlı Ziyaretçi Oturumları ve Heartbeat Sayaçları</span>', '<span data-i="chkScope4">Canlı Ziyaretçi Oturumları ve Heartbeat Sayaçları</span>'],
  ['<span>Gelen İletişim Formu Mesajları ve E-Posta Gönderim Geçmişi</span>', '<span data-i="chkScope5">Gelen İletişim Formu Mesajları ve E-Posta Gönderim Geçmişi</span>'],
  ['<span>Yönetici Güvenlik Denetim Logları (Audit Telemetry)</span>', '<span data-i="chkScope6">Yönetici Güvenlik Denetim Logları (Audit Telemetry)</span>'],
  ['Tüm Veri ve Metrikleri Şimdi Sil\n              </button>', '<span data-i="btnPurgeAllSubmit">Tüm Veri ve Metrikleri Şimdi Sil</span>\n              </button>'],
  ['Sayaçları Güncelle\n              </button>', '<span data-i="btnRefreshStatsSubmit">Sayaçları Güncelle</span>\n              </button>'],
  ['Otomatik Zamanlanmış Temizleme\n              </h3>', '<span data-i="autoPurgeCardTitle">Otomatik Zamanlanmış Temizleme</span>\n              </h3>'],
  ['<span class="tag" style="border-color:var(--up);color:var(--up)">Arka Plan Servisi</span>', '<span class="tag" style="border-color:var(--up);color:var(--up)" data-i="tagDaemon">Arka Plan Servisi</span>'],
  ['Metriklerin ve telemetri loglarının belirlediğiniz periyotta sunucu tarafından arka planda otomatik olarak silinmesini sağlar.', '<span data-i="autoPurgeCardSub">Metriklerin ve telemetri loglarının belirlediğiniz periyotta sunucu tarafından arka planda otomatik olarak silinmesini sağlar.</span>'],
  ['<label>Otomatik Temizleme Periyodu</label>', '<label data-i="lblAutoPurgePeriod">Otomatik Temizleme Periyodu</label>'],
  ['<option value="off">Kapalı (Yalnızca Manuel Komutla Sil)</option>', '<option value="off" data-i="optPurgeOff">Kapalı (Yalnızca Manuel Komutla Sil)</option>'],
  ['<option value="daily">Her Gün (24 saatte bir otomatik sıfırla)</option>', '<option value="daily" data-i="optPurgeDaily">Her Gün (24 saatte bir otomatik sıfırla)</option>'],
  ['<option value="weekly">Her Hafta (7 günde bir otomatik sıfırla)</option>', '<option value="weekly" data-i="optPurgeWeekly">Her Hafta (7 günde bir otomatik sıfırla)</option>'],
  ['<option value="monthly">Her Ay (30 günde bir otomatik sıfırla)</option>', '<option value="monthly" data-i="optPurgeMonthly">Her Ay (30 günde bir otomatik sıfırla)</option>'],
  ['<option value="older_7d">7 Günden Eski Kayıtları Otomatik Sil</option>', '<option value="older_7d" data-i="optPurge7d">7 Günden Eski Kayıtları Otomatik Sil</option>'],
  ['<option value="older_14d">14 Günden Eski Kayıtları Otomatik Sil</option>', '<option value="older_14d" data-i="optPurge14d">14 Günden Eski Kayıtları Otomatik Sil</option>'],
  ['<option value="older_30d">30 Günden Eski Kayıtları Otomatik Sil</option>', '<option value="older_30d" data-i="optPurge30d">30 Günden Eski Kayıtları Otomatik Sil</option>'],
  ['<label>Veri Saklama Politikası (Retention Gün)</label>', '<label data-i="lblRetentionDays">Veri Saklama Politikası (Retention Gün)</label>'],
  ['<small class="sub" style="display:block;margin-top:4px;">Gereksiz disk ve veritabanı şişmesini önlemek için maksimum saklanacak gün sayısı.</small>', '<small class="sub" style="display:block;margin-top:4px;" data-i="retentionDaysSub">Gereksiz disk ve veritabanı şişmesini önlemek için maksimum saklanacak gün sayısı.</small>'],
  ['<b style="flex:1;width:auto">Otomatik Temizleme Bildirimi<small>İşlem tamamlandığında denetim loglarına kaydet</small></b>', '<b style="flex:1;width:auto"><span data-i="lblAutoPurgeAudit">Otomatik Temizleme Bildirimi</span><small data-i="autoPurgeAuditSub">İşlem tamamlandığında denetim loglarına kaydet</small></b>'],
  ['<button type="submit" class="pill gold">Zamanlama Ayarlarını Kaydet</button>', '<button type="submit" class="pill gold" data-i="btnSaveScheduleSubmit">Zamanlama Ayarlarını Kaydet</button>'],
  ['<button type="button" class="pill" id="btn-run-auto-purge-now">Zamanlamayı Şimdi Test Et</button>', '<button type="button" class="pill" id="btn-run-auto-purge-now" data-i="btnTestPurgeSubmit">Zamanlamayı Şimdi Test Et</button>'],
  ['Veri & Metrik Temizleme Komut Konsolu\n              </h3>', '<span data-i="cmdConsoleHeading">Veri & Metrik Temizleme Komut Konsolu</span>\n              </h3>'],
  ['<span class="tag" style="border-color:var(--ac);color:var(--ac)">Canlı Komut Arayüzü</span>', '<span class="tag" style="border-color:var(--ac);color:var(--ac)" data-i="tagLiveCLI">Canlı Komut Arayüzü</span>'],
  ['Aşağıdaki komut satırına temizleme komutunu girerek veya hazır komut butonlarına tıklayarak tüm tutulan verileri ve metrikleri otomatik olarak silebilirsiniz.', '<span data-i="cmdConsoleDesc">Aşağıdaki komut satırına temizleme komutunu girerek veya hazır komut butonlarına tıklayarak tüm tutulan verileri ve metrikleri otomatik olarak silebilirsiniz.</span>'],
  ['placeholder="Komut girin, örn: purge --all veya purge --older 7d"', 'placeholder="Komut girin, örn: purge --all veya purge --older 7d" data-i-ph="phCmdInput"'],
  ['Komutu Çalıştır\n              </button>', '<span data-i="btnExecCmdSubmit">Komutu Çalıştır</span>\n              </button>'],
  ['<div style="color:var(--mute)">[SİSTEM] ABENTRA Veri & Metrik Komut Konsolu hazır. Bir komut girin veya hazır butonlara tıklayın.</div>', '<div style="color:var(--mute)" data-i="terminalInitLine">[SİSTEM] ABENTRA Veri & Metrik Komut Konsolu hazır. Bir komut girin veya hazır butonlara tıklayın.</div>'],
  ['<b style="color:var(--ac);display:block;margin-bottom:2px;">Terminal / Konsol Üzerinden Otomatik Çalıştırmak İçin:</b>', '<b style="color:var(--ac);display:block;margin-bottom:2px;" data-i="terminalShellHeading">Terminal / Konsol Üzerinden Otomatik Çalıştırmak İçin:</b>'],
  ['<span style="color:var(--mute)">Sunucu terminalinde doğrudan şu komutları kullanabilirsiniz:</span>', '<span style="color:var(--mute)" data-i="terminalShellSub">Sunucu terminalinde doğrudan şu komutları kullanabilirsiniz:</span>'],
  ['<h3>Temel Sistem ve İzleme Parametreleri</h3>', '<h3 data-i="coreParamsHeading">Temel Sistem ve İzleme Parametreleri</h3>'],
  ['<p class="sub" style="margin-bottom:14px">Genel portal başlığı, iletişim adresi ve ziyaretçi telemetri filtreleri</p>', '<p class="sub" style="margin-bottom:14px" data-i="coreParamsDesc">Genel portal başlığı, iletişim adresi ve ziyaretçi telemetri filtreleri</p>'],
  ['<label>Sistem & Portal Başlığı</label>', '<label data-i="lblPortalSysTitle">Sistem & Portal Başlığı</label>'],
  ['<label>Birincil İletişim / Bildirim E-Postası</label>', '<label data-i="lblContactEmailParam">Birincil İletişim / Bildirim E-Postası</label>'],
  ['<label>Bot & Tarayıcı Filtreleme</label>', '<label data-i="lblBotFilterParam">Bot & Tarayıcı Filtreleme</label>'],
  ['<option value="true">Yalnızca Gerçek İnsanları Say (Önerilen)</option>', '<option value="true" data-i="optBotOnlyHumans">Yalnızca Gerçek İnsanları Say (Önerilen)</option>'],
  ['<option value="false">Tüm İstekleri ve Botları Kaydet</option>', '<option value="false" data-i="optBotLogAll">Tüm İstekleri ve Botları Kaydet</option>'],
  ['<label>Canlı Heartbeat Aralığı (sn)</label>', '<label data-i="lblHeartbeatParam">Canlı Heartbeat Aralığı (sn)</label>'],
  ['<button class="pill gold" id="btn-save-temel-params" style="margin-top:12px;">Temel Parametreleri Kaydet</button>', '<button class="pill gold" id="btn-save-temel-params" style="margin-top:12px;" data-i="btnSaveParamsSubmit">Temel Parametreleri Kaydet</button>'],
  ['<p class="sub" style="margin-bottom:14px">Her tema renkleri, menü yerleşimini ve köşe stilini birlikte değiştirir. Bu ayar profilinize özel kaydedilir.</p>', '<p class="sub" style="margin-bottom:14px" data-i="gorThemeSub">Her tema renkleri, menü yerleşimini ve köşe stilini birlikte değiştirir. Bu ayar profilinize özel kaydedilir.</p>'],
  ['<p class="sub" style="margin-bottom:14px">Temanın varsayılanını istediğin gibi kişiselleştir</p>', '<p class="sub" style="margin-bottom:14px" data-i="gorLayoutSub">Temanın varsayılanını istediğin gibi kişiselleştir</p>'],
  ['<label>Menü konumu</label>', '<label data-i="lblNavPosition">Menü konumu</label>'],
  ['<button data-v="left">Sol</button>', '<button data-v="left" data-i="posLeft">Sol</button>'],
  ['<button data-v="rail">Sol + panel</button>', '<button data-v="rail" data-i="posRail">Sol + panel</button>'],
  ['<button data-v="mini">İkon bar</button>', '<button data-v="mini" data-i="posMini">İkon bar</button>'],
  ['<button data-v="top">Üst</button>', '<button data-v="top" data-i="posTop">Üst</button>'],
  ['<button data-v="dock">Alt dock</button>', '<button data-v="dock" data-i="posDock">Alt dock</button>'],
  ['<label>Köşe stili</label>', '<label data-i="lblCornerStyle">Köşe stili</label>'],
  ['<button data-v="sharp">Keskin</button>', '<button data-v="sharp" data-i="shapeSharp">Keskin</button>'],
  ['<button data-v="soft">Yumuşak</button>', '<button data-v="soft" data-i="shapeSoft">Yumuşak</button>'],
  ['<button data-v="round">Oval</button>', '<button data-v="round" data-i="shapePill">Oval</button>'],
  ['<label>Yoğunluk</label>', '<label data-i="lblDensitySetting">Yoğunluk</label>'],
  ['<button data-v="tight">Sıkı</button>', '<button data-v="tight" data-i="denseTight">Sıkı</button>'],
  ['<button data-v="normal">Normal</button>', '<button data-v="normal" data-i="denseNormal">Normal</button>'],
  ['<button data-v="airy">Ferah</button>', '<button data-v="airy" data-i="denseAiry">Ferah</button>'],
  ['<p class="sub" style="margin-bottom:12px">Arayüz dili</p>', '<p class="sub" style="margin-bottom:12px" data-i="lblPortalLangSub">Arayüz dili</p>'],
  ['<p class="sub" style="margin-bottom:14px">Neon renkler, arka plan ve cam efekti özelleştirme</p>', '<p class="sub" style="margin-bottom:14px" data-i="gorColorsSub">Neon renkler, arka plan ve cam efekti özelleştirme</p>'],
  ['<b style="flex:1;width:auto">Neon görünüm<small>Kapalıyken ışıma ve parlak renkler kullanılmaz</small></b>', '<b style="flex:1;width:auto"><span data-i="lblNeonHeading">Neon görünüm</span><small data-i="lblNeonDesc">Kapalıyken ışıma ve parlak renkler kullanılmaz</small></b>'],
  ['<button class="pill" id="btn-reset-theme-colors" style="margin-top:10px;">Tema renklerine dön</button>', '<button class="pill" id="btn-reset-theme-colors" style="margin-top:10px;" data-i="btnResetThemeColors">Tema renklerine dön</button>']
];

for (const [target, replacement] of replacements) {
  if (html.includes(target)) {
    html = html.replace(target, replacement);
  }
}

fs.writeFileSync('moon/manager/index.html', html, 'utf8');
console.log('Successfully updated moon/manager/index.html with data-i attributes and FontAwesome');
