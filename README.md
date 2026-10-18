# ABENTRA International — Executive Web Platform & Admin Portal

Bu proje, **ABENTRA International**'ın orijinal lüks kurumsal tasarımını (derin lacivert, fırçalanmış altın, özel tipografi, akıcı animasyonlar) %100 koruyarak, modern ve ölçeklenebilir bir **Node.js (Express)** mimarisine dönüştürülmüş ve kapsamlı bir **Yönetim Merkezi (Admin Portal)** ile donatılmış halidir.

---

## 🚀 Hızlı Başlangıç

### 1. Bağımlılıkları Yükleme ve Başlatma
Proje dizininde terminali açıp şu komutu çalıştırmanız yeterlidir:

```bash
npm start
```
*(Geliştirici modu için: `npm run dev`)*

### 2. Erişim Adresleri
- **Canlı Web Sitesi:** [http://localhost:3000/](http://localhost:3000/)
- **Yönetici Paneli (Admin Portal):** [http://localhost:3000/moon/manager](http://localhost:3000/moon/manager)
- **Orijinal Statik Versiyon:** [http://localhost:3000/original](http://localhost:3000/original)

---

## 🔑 Yönetici Giriş Bilgileri

| Kullanıcı Adı | Varsayılan Şifre | Rol |
| :--- | :--- | :--- |
| **`admin`** | **`abentra2026`** | Süper Yönetici (Abenetta Kollie) |

*(Şifrenizi dilediğiniz zaman Admin Paneli > Sistem & Güvenlik sekmesinden değiştirebilirsiniz.)*

---

## ⚡ Supabase Bulut Veritabanı & Depolama Kurulumu

Tüm veriler (site teması, içerikler, ara sectionlar, sektörel SVG kütüphanesi, ziyaretçi logları, hangi alanın kaç saniye izlendiği telemetrisi ve iletişim e-postaları) **Supabase PostgreSQL** ve **Supabase Storage** üzerinde saklanacak şekilde yapılandırılmıştır.

### 1. Supabase Projenizde SQL Şemasını Çalıştırın
1. [supabase.com](https://supabase.com) adresinden projenizi açın.
2. Sol menüden **SQL Editor** bölümüne girin.
3. Proje dizinindeki [`supabase_schema.sql`](file:///Users/fatihyilmaz/Desktop/Abentra/supabase_schema.sql) dosyasının içeriğini yapıştırın (veya Admin panelindeki **"SQL Şemasını Kopyala"** butonunu kullanın) ve **Run** butonuna basın.

### 2. Bilgilerinizi Bağlayın (2 Farklı Kolay Yol)

#### Yöntem A: Yönetici Panelinden (En Kolay)
1. [http://localhost:3000/moon/manager](http://localhost:3000/moon/manager) paneline giriş yapın.
2. **Sistem & Güvenlik** sekmesine gidin.
3. **Supabase Bulut Depolama & Veritabanı** kartındaki:
   - **Proje URL:** `https://your-project-id.supabase.co`
   - **API Anahtarı:** `service_role` veya `anon` anahtarınızı yapıştırın.
4. **"Bağlantıyı Kaydet & Test Et"** butonuna basın.
5. **"Tabloları Başlat & Verileri Eşitle (Sync Data)"** butonuna tıklayarak tek tıkla tüm site ayarlarını, ara sectionları ve sektörel SVG ikonlarını Supabase'e aktarın!

#### Yöntem B: `.env` Dosyası ile
Proje kök dizinindeki `.env` dosyasını açıp bilgilerinizi girin:
```env
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
SUPABASE_KEY=your-supabase-service-role-or-anon-key
```

---

## ✨ Geliştirilen Özellikler ve Admin Paneli Modülleri

### 1. 📊 Ziyaretçi Logları & Hangi Alanın Görüntülendiği Bilgisi (Precision Dwell Telemetry)
- **Kullanıcı & Oturum Takibi:** Siteye giren her kullanıcının IP adresi, konumu (ülke/şehir), cihaz türü (Desktop/Mobile/Tablet), tarayıcısı, işletim sistemi, kaynak referansı ve sitede geçirdiği toplam süre loglanır.
- **Bölüm Bazlı Kalış Süresi (Section Dwell Time):**
  - Sayfadaki her bölüm (`Hero`, `Who We Are`, `Our Purpose`, `Services`, `Ara Sectionlar`, `Contact`) için kullanıcının o bölümde kaç saniye vakit geçirdiği ve görüntüleme sayısı ayrı ayrı ölçülür.
  - **Görsel Isı Grafiği (Heatmap Progress Bars):** Hangi alanın en popüler olduğu ve ne kadar görüntülendiği yüzdelik ve saniyelik olarak canlı dashboard üzerinde gösterilir.
  - Logları filtreleme, **CSV İndir (Export)** ve tek tıkla **Logları Temizle** özellikleri mevcuttur.

### 2. 🎨 Site Teması, Renk Paleti ve Logo Yönetimi
- **CSS Renk Değişkenleri Editörü:**
  - Ana Lacivert (`--navy`), Kart Laciverti (`--navy2`), Derin Lacivert (`--navy3`)
  - İmza Altın (`--gold`), Parlak Altın (`--gold2`), Yazı Rengi (`--ink`)
- **Hazır Lüks Şablonlar:**
  - *Orijinal Abentra Lüksü*
  - *Koyu Obsidyen & Altın*
  - *Kraliyet Mavisi & Şampanya*
- **Logo Yönetimi:** Orijinal dinamik vektör arma (SVG) veya bilgisayardan görsel yükleme (JPG/PNG).
- **Marka Kimliği:** Şirket adı, slogan ve konum etiketi güncellenebilir.

### 3. ✍️ Dinamik İçerik Yönetimi (CMS)
- Orijinal tasarımı ve yazı tiplerini bozmadan şu alanları anında düzenleyebilirsiniz:
  - **Hero Bölümü:** Üst etiket, ana başlık, altın vurgulu 2. satır, açıklama ve butonlar.
  - **Kayan Yazı Bandı (Marquee Ticker):** Banttaki slogan ve hizmet başlıkları.
  - **Hakkımızda (Who We Are):** Öncü metin, taahhüt (promise) ve koordinasyon maddeleri.
  - **Amaç & Misyon (Purpose):** Misyon, Vizyon ve Karakter rozetleri (Professional, Diplomatic, vb.).
  - **Hizmetler (Services):** 4 ana hizmet alanının başlıkları, açıklamaları ve alt maddeleri.
  - **Liderlik & İletişim:** Yönetici adı, unvanı, telefonlar, e-posta ve Monrovia ofis adresi.
  - **Fabrika Ayarlarına Sıfırla:** Tek tıkla tüm içerikleri orijinal metinlerine döndürebilme güvencesi.

### 4. 🧩 Ara Sectionlar & Dinamik Bölüm Yöneticisi (Intermediate Section Builder)
Sayfadaki ana blokların arasına yeni ara bölümler ekleyebilir, sıralarını değiştirebilir veya tek tıkla gizleyip açabilirsiniz:
- **Etki & Rakamlar (Impact Stats):** 15+ Yıllık Danışmanlık, 100+ Kurumsal İzin, 48 Saat Hızlı İrtibat, %100 Mevzuat Uyumu.
- **Neden Liberya? (Strategic Gateway):** Doğal kaynaklar, Monrovia Serbest Limanı, yatırım teşvikleri ve ECOWAS pazarı.
- **4 Aşamalı Süreç (Engagement Methodology):** Keşif ve Uyum Denetimi -> Yol Haritası -> Bakanlık İrtibatı -> Faaliyet İzni.
- **Sık Sorulan Sorular (Interactive FAQ):** Liberya'da şirket kurma ile ilgili akordiyon soru-cevap yapısı.
- **Yeni Özel Bölüm Ekleme:** Kart ızgarası, süreç veya metrik formatında sınırsız yeni ara section oluşturabilme.

### 5. 📧 E-Posta Yönetim Merkezi (Gelen & Gönderilen)
- **Canlı İletişim Formu Entegrasyonu:** Sitenin iletişim bölümüne eklenen lüks formdan gelen tüm talepler doğrudan panele düşer.
- **Gelen Kutusu (Inbox):** Gönderen, şirket, telefon, e-posta, konu, talep edilen hizmet ve detaylı mesaj.
- **Tek Tıkla Yanıtlama (Quick Reply):** Gelen mesaja tıklandığında alıcı bilgileri otomatik doldurularak yeni e-posta editörü açılır.
- **Hazır Kurumsal Şablonlar:**
  - *Genel Bilgilendirme ve Karşılama*
  - *Şirket Kuruluşu & Ruhsatlandırma Teklifi*
  - *Üst Düzey Yönetici İstişare Daveti*
- **Gönderilen E-Postalar Arşivi:** Tüm gönderilen e-postaların zaman damgalı kaydı.
- **SMTP Sunucu Ayarları:** Kendi kurumsal e-posta sunucunuzu (Google Workspace, Office 365, cPanel, vb.) bağlayarak gerçek e-posta gönderimi yapabilir veya simüle edilmiş teslimat modunu kullanabilirsiniz.

### 6. 🏛️ Sektörel SVG Icon Kütüphanesi (Liberya & Kurumsal Alanına Özel)
ABENTRA'nın faaliyet gösterdiği madencilik, liman lojistiği, bakanlık ilişkileri, vergi ve şirket kuruluşu alanlarına özel 20+ adet vektör ikon içerir:
- **Kategoriler:** *Kurumsal & Kurulum*, *Hükümet & Mevzuat*, *Liberya & Sanayi*, *Vergi & Finans*.
- **İkon Özellikleri:**
  - Anında anahtar kelime veya etiketle arama.
  - Canlı SVG önizleme.
  - **Tek tıkla SVG Kodu Kopyalama** (istediğiniz yerde kullanmak için).
  - **İkon ID Kopyalama** (ara sectionlarda kullanmak için).
  - **SVG Dosyası İndirme**.
  - Panele yeni özel SVG ikon yükleyebilme.

### 7. 🌐 Çok Dilli ve Çok Temalı Admin Arayüzü
- **Dil Seçeneği:** Sağ üst köşedeki dil seçici ile arayüzü anında **Türkçe (TR)** veya **English (EN)** olarak değiştirebilirsiniz.
- **Admin Temaları:**
  - **Executive Midnight** (Derin Gece Laciverti & Parlak Altın)
  - **Dark Obsidian** (Koyu Obsidyen Siyahı & Altın)
  - **Royal Light** (Açık ve Ferah Kraliyet Beyazı)
  - **Cyber Emerald** (Zümrüt Yeşil & Altın Işıltısı)

---

## 📁 Proje Dosya Yapısı

```
Abentra/
├── manage.sh                          # Bağımsız servis yöneticisi (start/stop/restart/status/logs)
├── server.js                          # Express sunucusu, API rotaları, telemetri, SMTP ve kimlik doğrulama
├── package.json                       # Node.js bağımlılıkları ve başlatma scriptleri
├── logs/                              # Süreç logları ve PID dosyası (app.log, app.pid)
├── data/
│   ├── config.json                    # Site teması, marka, metinler, hizmetler ve iletişim ayarları
│   ├── logs.json                      # Ziyaretçi günlükleri ve alan bazlı süre sayaçları
│   ├── sections.json                  # Ara sectionlar veritabanı (etkin/gizli, sıralı)
│   ├── icons.json                     # Sektöre özel SVG ikon kütüphanesi
│   ├── emails.json                    # Gelen ve gönderilen mesajlar ile şablonlar
│   └── users.json                     # Yönetici kimlik bilgisi (şifrelenmemiş)
├── public/
│   ├── index.html                     # Dinamik public site (orijinal tasarım + telemetri + form)
│   ├── css/
│   │   └── style.css                  # Orijinal CSS + dinamik ara section stilleri
│   ├── js/
│   │   ├── main.js                    # Ön yüz etkileşimleri, tablar, animasyonlar ve form gönderimi
│   │   └── tracker.js                 # Ziyaretçi ve bölüm dwell süresi telemetri takipçisi
│   ├── admin/
│   │   ├── index.html                 # Executive Yönetim Paneli arayüzü
│   │   ├── css/
│   │   │   └── admin.css              # 4 temalı modern yönetici paneli tasarımı
│   │   └── js/
│   │       ├── admin.js               # Admin paneli SPA motoru ve API entegrasyonu
│   │       └── i18n.js                # Türkçe & İngilizce çeviri sözlüğü
│   ├── assets/                        # Logo ve PDF profili
│   └── uploads/                       # Yüklenen logolar ve medya dosyaları
└── ABENTRA International...html       # Orijinal statik HTML dosyası (yedek olarak korundu)
```

---

## 🛠️ Bağımsız Servis Yöneticisi (`manage.sh`)

Mevcut uygulama kodlarına hiçbir bağımlılığı olmayan, terminalden projeyi tek komutla yönetmenizi sağlayan script:

```bash
# Projeyi arka planda başlat
./manage.sh start

# Çalışma durumunu ve kaynak kullanımını gör
./manage.sh status

# Projeyi durdur
./manage.sh stop

# Projeyi yeniden başlat
./manage.sh restart

# Son 50 satır logu görüntüle
./manage.sh logs

# Logları canlı olarak takip et
./manage.sh logs -f
```

