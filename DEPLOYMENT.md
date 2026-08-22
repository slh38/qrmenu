# JokerQRMenu VPS Yayın Rehberi

Bu rehber JokerQRMenu'nün Ubuntu tabanlı tek bir VPS üzerinde yayınlanmasını anlatır.

Hedef mimari:

```text
jokerqrmenu.com               -> React landing ve işletme paneli
www.jokerqrmenu.com           -> React frontend
admin.jokerqrmenu.com         -> React admin paneli
*.jokerqrmenu.com             -> Tenant dijital menüleri
api.jokerqrmenu.com           -> Node.js API
```

Bu doküman QR menü projesine aittir. `JokerErp/` klasörü bu kurulumun parçası değildir.

## 1. Gereksinimler

- Ubuntu 22.04 veya 24.04 VPS
- En az 2 GB RAM önerilir
- Public IPv4
- Root veya sudo erişimi
- Domain DNS yönetimi
- MongoDB Atlas cluster'ı
- SMTP hesabı
- GitHub repository erişimi

Repository:

```text
https://github.com/slh38/qrmenu.git
```

Bu projede Docker zorunlu değildir. Mevcut canlı yapı Git, PM2 ve Nginx kullanır.

## 2. DNS kayıtları

Aşağıdaki kayıtları VPS IP adresine yönlendirin:

| Tür | Ad | Değer |
|---|---|---|
| A | `@` | `VPS_IP` |
| A | `www` | `VPS_IP` |
| A | `api` | `VPS_IP` |
| A | `admin` | `VPS_IP` |
| A | `*` | `VPS_IP` |

`*` kaydı tenant adresleri içindir. Örneğin `restoran.jokerqrmenu.com` otomatik olarak aynı VPS'e gelir.

Cloudflare kullanılıyorsa kayıtlar Cloudflare DNS ekranında oluşturulabilir. İlk kurulum ve sertifika testi sırasında gerekirse kayıtları geçici olarak `DNS only` yapın.

DNS kontrolü:

```bash
ping -c 2 jokerqrmenu.com
ping -c 2 api.jokerqrmenu.com
ping -c 2 test.jokerqrmenu.com
```

Üç adres de VPS IP'sine çözülmelidir.

## 3. Sunucunun hazırlanması

Sunucuya bağlanın:

```bash
ssh root@VPS_IP
```

Paketleri güncelleyin:

```bash
apt update
apt upgrade -y
apt install -y curl git nginx ufw certbot python3-certbot-nginx
```

Node.js 22 kurun:

```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | bash -
apt install -y nodejs
node -v
npm -v
```

PM2 kurun:

```bash
npm install -g pm2
pm2 -v
```

## 4. Projenin alınması

```bash
mkdir -p /var/www
cd /var/www
git clone https://github.com/slh38/qrmenu.git
cd /var/www/qrmenu
```

Private repository kullanılıyorsa GitHub deploy key veya personal access token yapılandırılmalıdır. Normal GitHub hesap parolası Git işlemlerinde kullanılmaz.

## 5. Backend kurulumu

```bash
cd /var/www/qrmenu/backend
npm ci
cp .env.example .env
nano .env
```

Production `backend/.env` örneği:

```env
MONGO_URI=mongodb+srv://DB_USER:URL_ENCODED_DB_PASSWORD@CLUSTER/qrmenu?retryWrites=true&w=majority
JWT_SECRET=COK_UZUN_RASTGELE_BIR_SECRET
PORT=5000
FRONTEND_URL=https://jokerqrmenu.com
ROOT_DOMAIN=jokerqrmenu.com

ADMIN_USERNAME=ADMIN_KULLANICI_ADI
ADMIN_PASSWORD=GUCLU_ADMIN_SIFRESI

SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=GONDERICI_EPOSTA
SMTP_PASS=UYGULAMA_SIFRESI
MAIL_FROM=GONDERICI_EPOSTA
```

Önemli:

- Gerçek değerleri dokümana veya Git'e yazmayın.
- MongoDB şifresinde özel karakter varsa URL encode edin.
- Gmail kullanılıyorsa normal hesap şifresi yerine uygulama şifresi kullanın.
- Google Workspace hesabı da aynı SMTP ayarlarıyla kullanılabilir.

MongoDB Atlas `Network Access` bölümüne VPS IPv4 adresini `/32` olarak ekleyin:

```text
VPS_IP/32
```

Geçici test için `0.0.0.0/0` kullanılabilir ancak production'da yalnızca gerekli IP'ye izin verilmesi daha güvenlidir.

## 6. Frontend kurulumu

```bash
cd /var/www/qrmenu/frontend
npm ci
cp .env.example .env
nano .env
```

Production `frontend/.env`:

```env
VITE_API_URL=https://api.jokerqrmenu.com/api
VITE_ROOT_DOMAIN=jokerqrmenu.com
```

Build alın:

```bash
npm run build
```

Çıktı klasörü:

```text
/var/www/qrmenu/frontend/dist
```

## 7. Backend'in PM2 ile çalıştırılması

```bash
cd /var/www/qrmenu/backend
pm2 start server.js --name qrmenu-api
pm2 save
```

Sunucu yeniden başladığında PM2'nin otomatik başlaması için:

```bash
pm2 startup
```

Komutun ürettiği `sudo env ... pm2 startup ...` satırını çalıştırın ve ardından:

```bash
pm2 save
```

Kontrol:

```bash
pm2 list
curl http://127.0.0.1:5000/api/health
```

Beklenen cevap:

```json
{"success":true,"message":"QR Menu API çalışıyor.","data":{}}
```

## 8. Nginx yapılandırması

Dosyayı oluşturun:

```bash
nano /etc/nginx/sites-available/qrmenu
```

HTTP aşaması için başlangıç yapılandırması:

```nginx
server {
    listen 80;
    server_name api.jokerqrmenu.com;

    client_max_body_size 10M;

    location / {
        proxy_pass http://127.0.0.1:5000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}

server {
    listen 80;
    server_name jokerqrmenu.com www.jokerqrmenu.com *.jokerqrmenu.com;

    root /var/www/qrmenu/frontend/dist;
    index index.html;

    location / {
        try_files $uri /index.html;
    }
}
```

Siteyi etkinleştirin:

```bash
ln -s /etc/nginx/sites-available/qrmenu /etc/nginx/sites-enabled/qrmenu
nginx -t
systemctl reload nginx
```

Notlar:

- `*.jokerqrmenu.com` admin ve tenant hostlarını frontend build'ine gönderir.
- Frontend, hostname'e göre admin panelini veya tenant menüsünü açar.
- `api.jokerqrmenu.com` yalnızca backend'e yönlenir.
- `client_max_body_size 10M;` API bloğunda bulunmalıdır. Aksi halde görsel yüklemelerinde `413 Content Too Large` görülür.

## 9. HTTPS ve wildcard sertifika

Ana domain ve API için standart Certbot komutu:

```bash
certbot --nginx -d jokerqrmenu.com -d www.jokerqrmenu.com -d api.jokerqrmenu.com
```

Bu komut `*.jokerqrmenu.com` wildcard sertifikası üretmez.

Tenant subdomainlerinde HTTPS için iki yöntem vardır:

### Yöntem A: Cloudflare proxy

- `@`, `www`, `api`, `admin` ve `*` kayıtlarını Cloudflare üzerinden yönetin.
- Edge tarafında wildcard HTTPS Cloudflare tarafından sağlanır.
- Cloudflare SSL/TLS modunu origin sertifikanıza göre `Full` veya tercihen `Full (strict)` ayarlayın.
- `Full (strict)` için origin tarafında wildcard kapsayan geçerli sertifika gerekir.

### Yöntem B: Let's Encrypt wildcard sertifika

Wildcard sertifika DNS-01 doğrulaması gerektirir:

```bash
certbot certonly --manual --preferred-challenges dns \
  -d jokerqrmenu.com \
  -d '*.jokerqrmenu.com'
```

Certbot'un istediği TXT kaydını DNS paneline ekleyin. Manuel sertifikalar otomatik yenilenmez; production için DNS sağlayıcınıza uygun Certbot DNS eklentisi kullanılması önerilir.

Sertifika kontrolü:

```bash
certbot certificates
certbot renew --dry-run
```

## 10. Güvenlik duvarı

SSH bağlantısını kesmeden önce SSH'ye izin verin:

```bash
ufw allow OpenSSH
ufw allow 'Nginx Full'
ufw enable
ufw status
```

Node.js portu `5000` dış dünyaya açılmamalıdır. Nginx backend'e `127.0.0.1:5000` üzerinden erişir.

## 11. Canlı sistem kontrolleri

Backend:

```bash
curl https://api.jokerqrmenu.com/api/health
```

Frontend:

```text
https://jokerqrmenu.com
https://jokerqrmenu.com/login
https://admin.jokerqrmenu.com/login
https://ORNEK_SLUG.jokerqrmenu.com
```

Kontrol listesi:

- Landing açılıyor mu?
- Tenant kayıt ve giriş işlemi çalışıyor mu?
- Kategori ve görsel eklenebiliyor mu?
- Ürün ve görsel eklenebiliyor mu?
- QR kod doğru subdomaini üretiyor mu?
- Tenant subdomaininde menü açılıyor mu?
- Admin paneli açılıyor mu?
- Şifre sıfırlama e-postası geliyor mu?
- Logo ve kapak görselleri HTTPS ile yükleniyor mu?
- Adisyon Ürünleri sayfası açılıyor mu?
- Entegrasyon anahtarı üretilebiliyor mu?
- GeraPOS ajanı SQL ve API bağlantı testlerini geçiyor mu?
- Fiyat, pasiflik ve yeniden aktif olma davranışı doğru mu?

### GeraPOS entegrasyonu canlı kontrolü

Entegrasyon backend ile birlikte yayınlanır; VPS üzerinde ayrı bir servis kurulmaz. Windows ajanı GeraPOS'un
çalıştığı müşteri bilgisayarında çalışır.

1. İşletme panelinden entegrasyon anahtarı üretin.
2. Ajanın SQL bağlantı testini çalıştırın.
3. Ajanın API bağlantı testini çalıştırın.
4. Manuel tam senkronizasyon yapın.
5. Panelde havuzdaki ürün sayısını kontrol edin.
6. Gerçek bir ürünü QR menüye aktarın.
7. GeraPOS fiyatını değiştirip yeniden senkronize edin.
8. QR adı, kategorisi ve görselinin korunduğunu doğrulayın.

Ajan kurulumu ve davranış kuralları:

- [GERAPOS_INTEGRATION.md](GERAPOS_INTEGRATION.md)
- [sync-agent/README.md](sync-agent/README.md)

## 12. Güncelleme ve yeniden yayınlama

GitHub'a gönderilen yeni kodu VPS'e almak için:

```bash
ssh root@VPS_IP
cd /var/www/qrmenu
git pull origin main
```

### Yalnızca frontend değiştiyse

```bash
cd /var/www/qrmenu/frontend
npm ci
npm run build
systemctl reload nginx
```

Paket değişmediyse `npm ci` atlanabilir.

### Backend değiştiyse

```bash
cd /var/www/qrmenu/backend
npm ci
pm2 restart qrmenu-api
pm2 save
```

### Frontend ve backend birlikte değiştiyse

```bash
cd /var/www/qrmenu/backend
npm ci
pm2 restart qrmenu-api

cd /var/www/qrmenu/frontend
npm ci
npm run build

systemctl reload nginx
pm2 save
```

Ortam değişkenleri değiştiğinde PM2'yi şöyle yeniden başlatın:

```bash
pm2 restart qrmenu-api --update-env
```

## 13. Log ve hata giderme

### PM2 durumu

```bash
pm2 list
pm2 describe qrmenu-api
pm2 logs qrmenu-api --lines 100
```

### Nginx kontrolü

```bash
nginx -t
systemctl status nginx --no-pager
tail -n 100 /var/log/nginx/error.log
```

### Backend doğrudan kontrol

```bash
curl http://127.0.0.1:5000/api/health
```

### Yaygın sorunlar

#### `413 Content Too Large`

API Nginx bloğuna şunu ekleyin:

```nginx
client_max_body_size 10M;
```

Sonra:

```bash
nginx -t
systemctl reload nginx
```

#### Tarayıcı CORS hatası gösteriyor

Önce Network ekranındaki gerçek HTTP durumuna bakın. Nginx'in ürettiği `413`, `502` veya `500` cevapları tarayıcıda CORS hatası gibi görünebilir.

Kontrol edin:

```bash
curl http://127.0.0.1:5000/api/health
pm2 logs qrmenu-api --lines 100
tail -n 100 /var/log/nginx/error.log
```

#### MongoDB bağlantı hatası

- Atlas cluster açık mı?
- `MONGO_URI` doğru mu?
- Atlas `Network Access` listesinde VPS IP'si var mı?
- Veritabanı kullanıcısının parolası doğru ve URL encoded mı?

#### `Cannot POST /api/admin/login`

VPS eski backend koduyla çalışıyor olabilir:

```bash
cd /var/www/qrmenu
git pull origin main
cd backend
pm2 restart qrmenu-api
```

#### Yeni frontend görünmüyor

```bash
cd /var/www/qrmenu/frontend
npm run build
systemctl reload nginx
```

Ardından tarayıcıda sert yenileme yapın veya gizli sekmede kontrol edin.

#### Tenant subdomaininde `Cannot GET /`

Frontend Nginx bloğunda wildcard host eksik olabilir:

```nginx
server_name jokerqrmenu.com www.jokerqrmenu.com *.jokerqrmenu.com;
```

#### `502 Bad Gateway`

Backend'in çalıştığını kontrol edin:

```bash
pm2 list
curl http://127.0.0.1:5000/api/health
```

#### Entegrasyon API'si `401` dönüyor

- Ajan anahtarının başında/sonunda boşluk olmadığını kontrol edin.
- Panelden yeni anahtar üretildiyse eski anahtar artık çalışmaz.
- Ajan ekranında yeni anahtarı girip **Ayarları Kaydet** düğmesine basın.
- Tenant admin tarafından pasife alınmışsa entegrasyon anahtarı kabul edilmez.

#### Ajan SQL'den sıfır ürün okuyor

- Veritabanı adı ve bağlantı dosyası yolunu kontrol edin.
- SQL sorgusunu SSMS üzerinde aynı kullanıcıyla çalıştırın.
- Ajan güvenlik amacıyla sıfır ürünlü tam listeyi API'ye göndermez; mevcut menü pasife alınmaz.

#### Aynı stok için farklı fiyat hatası

`FIYAT` tablosunda aynı `StokKart_ID` için farklı fiyatlar vardır. Kullanılacak fiyat listesini belirleyin ve ajan
sorgusuna fiyat türü/liste filtresi ekleyin. Hata çözülmeden rastgele bir fiyat gönderilmez.

#### Havuz sayısı SQL tekil ürün sayısından yüksek

Tam listede artık bulunmayan eski veya test ürünleri geçmişi korumak için silinmez, pasife alınır. Bu nedenle
havuz toplamı son SQL tekil ürün sayısından yüksek olabilir. Dijital menü yalnızca QR'a aktarılmış ve kaynakta
aktif ürünleri gösterir.

## 14. Yedekleme

Yedeklenmesi gereken iki ayrı veri grubu vardır:

1. MongoDB Atlas verileri
2. `/var/www/qrmenu/backend/uploads/` görselleri

Görsel yedeği örneği:

```bash
tar -czf /root/qrmenu-uploads-$(date +%Y-%m-%d).tar.gz /var/www/qrmenu/backend/uploads
```

MongoDB için Atlas backup özelliğini veya `mongodump` kullanın. Yedekleri yalnızca aynı VPS'te tutmak yerine farklı bir depolama alanına kopyalayın.

## 15. Operasyonel notlar

- `backend/uploads/` deploy sırasında silinmemelidir.
- `git pull` bu klasördeki kullanıcı görsellerini etkilemez çünkü içerik `.gitignore` kapsamındadır.
- Yeni frontend ortam değişkenleri yalnızca yeniden build sonrasında etkili olur.
- Yeni backend ortam değişkenleri PM2 restart sonrasında etkili olur.
- Tenant slug değişirse eski QR adresi değişir ve QR yeniden oluşturulmalıdır.
- Admin tarafından pasife alınan tenant giriş yapamaz ve dijital menüsü açılmaz.
