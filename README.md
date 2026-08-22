# JokerQRMenu

JokerQRMenu; restoran, kafe ve benzeri işletmelerin dijital menülerini oluşturabildiği, QR kod ile yayınlayabildiği ve her işletmeye özel subdomain üzerinden sunabildiği çok kiracılı (multi-tenant) bir web uygulamasıdır.

Bu doküman yalnızca QR menü projesini anlatır. Çalışma alanındaki `JokerErp/` klasörü ayrı bir projedir ve JokerQRMenu'nün parçası değildir.

## Canlı adresler

| Bileşen | Adres |
|---|---|
| Tanıtım sitesi | `https://jokerqrmenu.com` |
| İşletme paneli | `https://jokerqrmenu.com/login` |
| Kayıt sayfası | `https://jokerqrmenu.com/register` |
| API | `https://api.jokerqrmenu.com/api` |
| API sağlık kontrolü | `https://api.jokerqrmenu.com/api/health` |
| Admin paneli | `https://admin.jokerqrmenu.com` |
| İşletme menüsü | `https://<slug>.jokerqrmenu.com` |

Örnek işletme adresi:

```text
https://ornek-restoran.jokerqrmenu.com
```

## Temel özellikler

- İşletme kaydı ve JWT tabanlı giriş
- İşletmeye özel subdomain ve güvenli slug yönetimi
- Kategori ve ürün yönetimi
- JPG, PNG ve WEBP görsel yükleme
- Logo, kapak görseli, marka rengi ve sosyal medya bağlantıları
- Showcase, Minimal, Editorial ve Dark menü temaları
- QR kod üretme ve kişiselleştirme
- Mobil uyumlu dijital menü
- Menü görüntülenme sayacı
- Şifre sıfırlama e-postası
- Admin panelinden işletme, kategori ve ürün sayılarını izleme
- Admin panelinden işletmeleri aktif veya pasif yapma
- GeraPOS/MS SQL ürün havuzu ve seçili ürünleri QR menüye aktarma
- Fiyat ve aktiflik durumunu Windows ajanıyla otomatik senkronize etme

## Mimari

```text
Tarayıcı
├── jokerqrmenu.com                  -> React tanıtım sitesi ve işletme paneli
├── admin.jokerqrmenu.com            -> React admin paneli
├── <slug>.jokerqrmenu.com           -> React dijital menü
└── api.jokerqrmenu.com              -> Nginx -> Node.js/Express API
                                             ├── MongoDB Atlas
                                             ├── backend/uploads
                                             └── SMTP sunucusu
```

Frontend tek bir Vite/React build'idir. Açılan hostname'e göre tanıtım sitesi, admin paneli veya işletmenin dijital menüsü gösterilir.

## Teknolojiler

### Frontend

- React 18
- React Router 6
- Vite 5
- Tailwind CSS 3

### Backend

- Node.js
- Express
- MongoDB ve Mongoose
- JWT
- Multer
- Nodemailer
- QRCode

### Canlı altyapı

- Ubuntu VPS
- Nginx
- PM2
- MongoDB Atlas
- Cloudflare DNS
- Let's Encrypt / TLS

## Proje yapısı

```text
.
├── backend/
│   ├── middleware/       # Tenant/admin doğrulama ve görsel yükleme
│   ├── models/           # Tenant, Category ve MenuItem modelleri
│   ├── routes/           # REST API route'ları
│   ├── uploads/          # Yüklenen görseller (canlıda kalıcı veri)
│   ├── mailer.js         # Şifre sıfırlama e-postası
│   ├── server.js         # Express başlangıç dosyası
│   └── seed.js           # Örnek veri komutu
├── frontend/
│   ├── public/           # Landing görselleri
│   ├── src/components/   # Ortak panel bileşenleri
│   ├── src/lib/          # API, admin token ve tema yardımcıları
│   ├── src/pages/        # Uygulama sayfaları
│   └── src/App.jsx       # Hostname ve route yönetimi
├── sync-agent/            # Self-contained .NET 8 GeraPOS Windows ajanı
├── DEPLOYMENT.md         # VPS yayın ve bakım rehberi
├── render.yaml           # Eski/alternatif Render yapılandırması
└── README.md
```

## Yerel kurulum

### Gereksinimler

- Node.js 22 önerilir
- npm
- MongoDB veya MongoDB Atlas bağlantısı

### 1. Repoyu alın

```powershell
git clone https://github.com/slh38/qrmenu.git
cd qrmenu
```

### 2. Backend'i hazırlayın

```powershell
cd backend
npm install
Copy-Item .env.example .env
```

Geliştirme için `backend/.env` örneği:

```env
MONGO_URI=mongodb://localhost:27017/qrmenu
JWT_SECRET=yerelde-kullanilacak-guclu-bir-secret
PORT=5000
FRONTEND_URL=http://localhost:5173
ROOT_DOMAIN=

ADMIN_USERNAME=admin
ADMIN_PASSWORD=yerel-admin-sifresi

SMTP_HOST=
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=
SMTP_PASS=
MAIL_FROM=
```

Backend'i başlatın:

```powershell
npm run dev
```

Backend varsayılan olarak `http://localhost:5000` adresinde çalışır.

### 3. Frontend'i hazırlayın

Yeni bir terminalde:

```powershell
cd frontend
npm install
Copy-Item .env.example .env
```

`frontend/.env`:

```env
VITE_API_URL=http://localhost:5000/api
VITE_ROOT_DOMAIN=
```

Frontend'i başlatın:

```powershell
npm run dev
```

Uygulama varsayılan olarak `http://localhost:5173` adresinde açılır.

Yerel geliştirmede `VITE_ROOT_DOMAIN` boş bırakıldığında tenant menüleri `/menu/<slug>` route'u üzerinden çalışır.

## Ortam değişkenleri

### Backend

| Değişken | Zorunlu | Açıklama |
|---|---:|---|
| `MONGO_URI` | Evet | MongoDB bağlantı adresi |
| `JWT_SECRET` | Evet | Tenant ve admin token imzalama anahtarı |
| `PORT` | Hayır | API portu, varsayılan `5000` |
| `FRONTEND_URL` | Evet | Ana frontend adresi ve şifre sıfırlama linkleri |
| `ROOT_DOMAIN` | Canlıda evet | Tenant URL'leri için kök domain |
| `ADMIN_USERNAME` | Admin için evet | Admin paneli kullanıcı adı |
| `ADMIN_PASSWORD` | Admin için evet | Admin paneli şifresi |
| `SMTP_HOST` | E-posta için evet | SMTP sunucusu |
| `SMTP_PORT` | E-posta için evet | Genellikle `587` |
| `SMTP_SECURE` | E-posta için evet | Port 587 için çoğunlukla `false` |
| `SMTP_USER` | E-posta için evet | SMTP kullanıcı adı |
| `SMTP_PASS` | E-posta için evet | SMTP parolası veya uygulama şifresi |
| `MAIL_FROM` | E-posta için evet | Gönderici adresi |

### Frontend

| Değişken | Zorunlu | Açıklama |
|---|---:|---|
| `VITE_API_URL` | Evet | Sonunda `/api` bulunan backend adresi |
| `VITE_ROOT_DOMAIN` | Canlıda evet | Ana domain; örnek `jokerqrmenu.com` |

Vite ortam değişkenleri build sırasında gömülür. `frontend/.env` değişirse yeniden `npm run build` çalıştırılmalıdır.

## Kullanılabilir komutlar

### Backend

```powershell
npm run dev      # Nodemon ile geliştirme
npm start        # Node ile çalıştırma
npm run seed     # Örnek veri oluşturma
```

### Frontend

```powershell
npm run dev      # Vite geliştirme sunucusu
npm run build    # Production build
npm run preview  # Build'i yerelde önizleme
```

## Ana API grupları

| Prefix | Kullanım |
|---|---|
| `/api/health` | Sağlık kontrolü |
| `/api/auth` | Kayıt, giriş ve şifre sıfırlama |
| `/api/admin` | Admin giriş ve yönetim işlemleri |
| `/api/public` | Herkese açık dijital menü verisi |
| `/api/tenant` | İşletme ayarları, logo ve kapak |
| `/api/categories` | Kategori yönetimi |
| `/api/menu-items` | Ürün yönetimi |
| `/api/qr` | QR kod üretimi |
| `/api/integrations/gerapos` | GeraPOS ürün senkronizasyonu ve aktarım havuzu |
| `/uploads` | Yüklenen görseller |

## GeraPOS entegrasyonu

GeraPOS entegrasyonu mevcut manuel ürün yapısını değiştirmez. Windows ajanı SQL'deki bütün ürünleri ayrı bir
adisyon ürün havuzuna gönderir. İşletme, paneldeki **Adisyon Ürünleri** sayfasından istediği ürünleri seçerek tek
bir QR kategorisine aktarır.

- Fiyat ve kaynak aktifliği GeraPOS tarafından yönetilir.
- QR ürün adı, kategorisi, açıklaması, görseli ve sırası panelden yönetilir.
- Kaynak kategori yalnızca bilgi amaçlıdır; QR kategorisini kullanıcı seçer.
- Pasif kaynak ürün dijital menüde gizlenir, görseli ve QR ayarları korunur.
- Ajan 5/15/30/60 dakika veya günlük seçilen saatte çalışabilir.
- Ajan `net8.0-windows`, `win-x64`, self-contained tek EXE olarak yayınlanır.

Ajan build ve kullanım ayrıntıları için `sync-agent/README.md` dosyasına bakın.

## Tenant ve subdomain davranışı

- İşletme slug'ı subdomain olarak kullanılır.
- Boşluk, nokta ve alt çizgi güvenli biçimde tireye çevrilir.
- Türkçe karakterler URL uyumlu Latin karakterlere dönüştürülür.
- `www`, `api`, `admin`, `app`, `mail`, `ftp` ve `blog` rezerve isimlerdir.
- Aynı slug kullanılıyorsa sistem benzersiz bir değer üretir.
- Slug değiştiğinde kategoriler, ürünler, görseller ve tema korunur.
- Slug değiştikten sonra eski QR kodların yeni adres için tekrar oluşturulması gerekir.

## Görsel yüklemeleri

- İzin verilen türler: JPG, PNG ve WEBP
- Uygulama limiti: 5 MB
- Canlı Nginx limiti en az 10 MB olmalıdır.
- Dosyalar `backend/uploads/` altında tutulur.
- Bu klasör veritabanından bağımsızdır ve ayrıca yedeklenmelidir.

## Güvenlik notları

- `.env` dosyalarını Git'e eklemeyin.
- `JWT_SECRET`, admin şifresi, MongoDB parolası ve SMTP uygulama şifresini düzenli değiştirin.
- MongoDB Atlas erişimini mümkünse yalnızca VPS IP'si ile sınırlandırın.
- Admin hesabında güçlü ve benzersiz parola kullanın.
- Yüklenen dosyalar ve MongoDB için düzenli yedek alın.
- Production'da HTTPS zorunlu tutulmalıdır.

## Yayın ve bakım

VPS kurulumu, Nginx, PM2, wildcard DNS, SSL, güncelleme ve hata giderme adımları için [DEPLOYMENT.md](DEPLOYMENT.md) dosyasına bakın.

## Repository

```text
https://github.com/slh38/qrmenu
```
