const fs = require('fs');

const extraKeys = {
  // SMTP
  smtpCardTitle: { tr: "SMTP E-Posta Sunucu Yapılandırması ve Doğrulama", en: "SMTP Mail Server Configuration & Verification" },
  smtpCardSub: { tr: "E-posta merkezi üzerinden mesaj gönderebilmek ve yanıtlayabilmek için SMTP sunucunuzu yapılandırın ve doğrulayın.", en: "Configure and verify your SMTP server to enable message dispatch and replies from Mail Center." },
  lblSmtpHost: { tr: "SMTP Sunucu Adresi (Host)", en: "SMTP Server Host" },
  lblSmtpPort: { tr: "Port Numarası", en: "Port Number" },
  lblSmtpSecurity: { tr: "Güvenlik Protokolü", en: "Security Protocol" },
  lblSmtpUser: { tr: "SMTP Kullanıcı Adı / E-Posta", en: "SMTP Username / Email" },
  lblSmtpPass: { tr: "SMTP Şifresi / Uygulama Şifresi", en: "SMTP Password / App Password" },
  lblSmtpFromName: { tr: "Gönderen Adı (From Name)", en: "Sender Display Name" },
  lblSmtpFromEmail: { tr: "Gönderen E-Posta (From Email)", en: "Sender Email Address" },
  lblSmtpTestEmail: { tr: "Doğrulama İçin Test E-Postası (Opsiyonel)", en: "Test Recipient for Verification (Optional)" },
  btnSaveSmtp: { tr: "SMTP Ayarlarını Kaydet", en: "Save SMTP Settings" },
  btnVerifySmtp: { tr: "Bağlantıyı Test Et ve Doğrula", en: "Test & Verify Connection" },
  smtpVerifiedBadge: { tr: "Doğrulandı", en: "Verified" },
  smtpUnverifiedBadge: { tr: "Doğrulanmadı", en: "Unverified" },
  smtpNotConfigured: { tr: "Yapılandırılmadı", en: "Not Configured" },
  smtpLockedNoticeTitle: { tr: "SMTP Doğrulaması Gerekli", en: "SMTP Verification Required" },
  smtpLockedNoticeDesc: { tr: "E-posta gönderebilmek ve gelen mesajlara yanıt verebilmek için öncelikle Temel Ayarlar bölümünden SMTP e-posta sunucu bilgilerinizi girip doğrulamanız gerekmektedir. Şu anda doğrulanmış bir SMTP sunucusu bulunmamaktadır.", en: "To dispatch emails and reply to incoming messages, you must first configure and verify your SMTP mail server in General Settings. No verified SMTP server is currently active." },
  btnGoToSmtpSettings: { tr: "Temel Ayarlara Git ve Doğrula", en: "Go to General Settings & Verify" },
  smtpLockedBannerText: { tr: "SMTP sunucunuz doğrulanmadığı için e-posta gönderimi kilitlidir.", en: "Email dispatch is locked because your SMTP server is unverified." },
  smtpLockedBannerAction: { tr: "Doğrula", en: "Verify Now" },
  toastSmtpSaved: { tr: "SMTP ayarları kaydedildi.", en: "SMTP settings saved." },
  toastSmtpVerified: { tr: "SMTP bağlantısı başarıyla doğrulandı!", en: "SMTP connection verified successfully!" },
  toastSmtpVerifyFailed: { tr: "SMTP doğrulama başarısız:", en: "SMTP verification failed:" },

  // Web Builder & Sections
  builderMainTitle: { tr: "Web Builder & Ara Bölümler", en: "Web Builder & Sections Studio" },
  builderMainSub: { tr: "Sürükle-bırak veya detaylı yapılandırılmış liste editörüyle sitenizin bölümlerini ve zengin widget'larını yönetin.", en: "Manage site sections and rich interactive widgets via drag-and-drop or detailed structured list editor." },
  btnBuilderCanvasMode: { tr: "Görsel Builder (Sürükle-Bırak)", en: "Visual Drag & Drop Builder" },
  btnBuilderListMode: { tr: "Yapılandırılmış Detaylı Liste", en: "Detailed Structured List Editor" },
  btnAddWidgetTrigger: { tr: "Yeni Widget / Bölüm Ekle", en: "Add Section / Widget" },
  btnSaveAllBuilder: { tr: "Tüm Bölümleri Kaydet", en: "Save All Sections" },
  widgetLibraryTitle: { tr: "Widget & Bölüm Kütüphanesi", en: "Widget & Section Library" },
  widgetLibrarySub: { tr: "Sitenize eklemek istediğiniz widget'ı tuvale sürükleyin veya Ekle'ye tıklayın (20 zengin widget seçeneği)", en: "Drag the widget you wish to add into the canvas or click Add (20 rich widget options)" },
  phSearchWidgets: { tr: "Widget ara...", en: "Search widgets..." },
  tabWidgetsAll: { tr: "Tümü (20)", en: "All (20)" },
  tabWidgetsCore: { tr: "Temel & Kahraman", en: "Core & Heroes" },
  tabWidgetsContent: { tr: "İçerik & Hikaye", en: "Content & Narrative" },
  tabWidgetsTrust: { tr: "Sosyal Kanıt & Güven", en: "Social Proof & Trust" },
  tabWidgetsConversion: { tr: "Dönüşüm & Eylem", en: "Conversion & Action" },
  btnQuickAddWidget: { tr: "Tuvale Ekle", en: "Add to Canvas" },
  canvasEmptyPlaceholder: { tr: "Tuval Boş. Sol taraftan bir widget sürükleyin veya yukarıdaki düğmeyle yeni bölüm ekleyin.", en: "Canvas is empty. Drag a widget from the left drawer or click Add Section above." },
  deviceDesktopTitle: { tr: "Masaüstü Görünümü", en: "Desktop Simulation" },
  deviceTabletTitle: { tr: "Tablet Görünümü", en: "Tablet Simulation" },
  deviceMobileTitle: { tr: "Mobil Görünümü", en: "Mobile Simulation" },
  sectionLiveBadge: { tr: "Yayında", en: "Live on Site" },
  sectionDraftBadge: { tr: "Taslak (Gizli)", en: "Draft (Hidden)" },
  btnEditSectionContent: { tr: "Detayları Düzenle", en: "Edit Details" },
  btnDuplicateSection: { tr: "Çoğalt", en: "Duplicate" },
  btnDeleteSection: { tr: "Bölümü Sil", en: "Delete Section" },
  confirmDeleteSection: { tr: "Bu bölümü silmek istediğinize emin misiniz?", en: "Are you sure you want to delete this section?" },
  toastSectionAdded: { tr: "Widget başarıyla tuvale eklendi!", en: "Widget added to canvas successfully!" },
  toastSectionUpdated: { tr: "Bölüm ayarları kaydedildi!", en: "Section settings saved!" },
  toastSectionsReordered: { tr: "Bölüm sıralaması güncellendi!", en: "Section order updated!" },
  lblSectionType: { tr: "Widget / Bölüm Türü", en: "Widget / Section Type" },
  lblSectionAnchor: { tr: "Bağlantı Çapası (#anchor)", en: "Anchor Link (#anchor)" },
  lblSectionTag: { tr: "Üst Rozet / Kategori", en: "Section Tag / Badge" },
  lblSectionBgStyle: { tr: "Arka Plan Stili", en: "Background Style" },
  lblSectionColumns: { tr: "Izgara Sütun Sayısı", en: "Grid Column Layout" },
  lblSectionAlignment: { tr: "Metin Hizalaması", en: "Text Alignment" },
  optBgObsidian: { tr: "Koyu Obsidyen Zemin", en: "Dark Obsidian Background" },
  optBgGlass: { tr: "Cam Şeffaflığı & Kart", en: "Glass Transparency & Cards" },
  optBgNavy: { tr: "Derin Lüks Lacivert", en: "Deep Luxury Navy" },
  optBgGold: { tr: "Altın Parıltısı Radyal", en: "Gold Glow Radial Gradient" },
  optAlignLeft: { tr: "Sola Hizalı", en: "Left Aligned" },
  optAlignCenter: { tr: "Ortalanmış", en: "Centered" },
  sectionItemsHeading: { tr: "Bölüm İçi Kartlar & Maddeler", en: "Section Child Items & Cards" },
  btnAddItemRow: { tr: "+ Yeni Kart / Madde Ekle", en: "+ Add Item / Card" },
  itemTitle: { tr: "Madde Başlığı", en: "Item Title" },
  itemDesc: { tr: "Madde Açıklaması", en: "Item Description" },
  itemValue: { tr: "Değer / Sayı (İsteğe Bağlı)", en: "Value / Number (Optional)" },
  itemIcon: { tr: "İkon / Sembol", en: "Icon / Symbol" },
  btnSaveModalSection: { tr: "Değişiklikleri Uygula", en: "Apply Changes" },

  // Mail
  composeNewMailTitle: { tr: "Yeni E-Posta Gönder", en: "Compose New Email" },
  lblRecipientEmail: { tr: "Alıcı E-Posta Adresi", en: "Recipient Email Address" },
  lblMailSubject: { tr: "E-Posta Konusu", en: "Email Subject" },
  lblSelectTplFast: { tr: "Hazır Şablon Seç (İsteğe Bağlı)", en: "Select Boilerplate Template" },
  lblMailBodyText: { tr: "Mesaj Metni", en: "Message Body" },
  btnSendNow: { tr: "E-Postayı Gönder", en: "Send Email Now" }
};

let i18nContent = fs.readFileSync('moon/manager/js/i18n.js', 'utf8');

let trAdd = '';
let enAdd = '';

for (const [k, v] of Object.entries(extraKeys)) {
  trAdd += `    ${JSON.stringify(k)}: ${JSON.stringify(v.tr)},\n`;
  enAdd += `    ${JSON.stringify(k)}: ${JSON.stringify(v.en)},\n`;
}

i18nContent = i18nContent.replace(/const i18n = \{\s*tr: \{/, m => m + '\n' + trAdd);
i18nContent = i18nContent.replace(/en: \{/, m => m + '\n' + enAdd);

fs.writeFileSync('moon/manager/js/i18n.js', i18nContent, 'utf8');
console.log('Successfully enriched moon/manager/js/i18n.js with Builder & SMTP keys!');
