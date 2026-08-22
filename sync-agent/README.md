# Joker QR Menu GeraPOS Sync Agent

`JokerQRMenuSync.exe`, GeraPOS SQL verilerini JokerQRMenu API'sine gönderen .NET 8 WinForms sistem tepsisi
uygulamasıdır. GeraPOS uygulamasından bağımsız çalışır ve GeraPOS'un .NET Framework 4.8 kurulumu ile çakışmaz.

## Çalışma modeli

- SQL bağlantı metnini `VeriBaglantisi.txt` dosyasından okur.
- Veritabanı adı uygulama ekranından alınır.
- Sabit ürün sorgusunu çalıştırır.
- Sonuçları stok ID'ye göre tekilleştirir.
- Tam listeyi HTTPS ile JokerQRMenu API'sine gönderir.
- Ayarlanan zamanda sistem tepsisinde otomatik çalışır.

Detaylı veri kuralları için [GERAPOS_INTEGRATION.md](../GERAPOS_INTEGRATION.md) dosyasına bakın.

## Gereksinimler

### Çalıştırma

- 64-bit Windows 10 veya Windows 11
- SQL Server instance'ına ağ/yerel erişim
- `VeriBaglantisi.txt` dosyasına okuma erişimi
- `api.jokerqrmenu.com` için HTTPS internet erişimi

Self-contained paket gerekli .NET 8 runtime dosyalarını içerir. Hedef bilgisayarda .NET SDK, .NET 8 runtime veya
.NET Framework kurulması gerekmez.

### Kaynaktan build

- .NET 8 veya daha yeni SDK
- NuGet erişimi

## Uygulama alanları

| Alan | Açıklama |
|---|---|
| Bağlantı dosyası | GeraPOS `VeriBaglantisi.txt` tam yolu |
| Veritabanı | SQL `Initial Catalog` değeri |
| Senkronizasyon API | Varsayılan canlı sync endpoint'i |
| Entegrasyon anahtarı | İşletme panelinden oluşturulan tenant anahtarı |
| Çalışma aralığı | 5/15/30/60 dakika veya günlük |
| Günlük çalışma saati | `Günde bir` seçildiğinde kullanılacak saat |
| Windows başlangıcı | HKCU altında otomatik başlatma kaydı |

## İlk çalıştırma

1. İşletme panelinde **Adisyon Ürünleri** sayfasını açın.
2. **Entegrasyonu Etkinleştir** ile anahtar oluşturun.
3. Ajanı kalıcı bir klasöre çıkarıp `JokerQRMenuSync.exe` dosyasını çalıştırın.
4. Bağlantı dosyası ve veritabanını kontrol edin.
5. Entegrasyon anahtarını girin.
6. **SQL Bağlantısını Test Et** düğmesine basın.
7. **API Bağlantısını Test Et** düğmesine basın.
8. Zamanlamayı seçip **Ayarları Kaydet** düğmesine basın.
9. **Şimdi Senkronize Et** ile ilk tam listeyi gönderin.

Pencerenin kapatma düğmesi uygulamayı sonlandırmaz; uygulama sistem tepsisinde çalışmaya devam eder. Tam çıkış
için tepsi ikonuna sağ tıklayıp **Çıkış** seçin.

## Yerel dosyalar ve güvenlik

```text
%LOCALAPPDATA%\JokerQRMenuSync\config.json
%LOCALAPPDATA%\JokerQRMenuSync\sync.log
```

- SQL parolası ajan ayarlarına kopyalanmaz; bağlantı dosyasından çalışma anında okunur.
- Entegrasyon anahtarı `config.json` içinde DPAPI ile şifreli tutulur.
- DPAPI şifresi Windows kullanıcısına bağlıdır. Ayar dosyası başka kullanıcıya taşınırsa anahtar yeniden girilir.
- Log dosyasına SQL bağlantı metni, SQL parolası veya entegrasyon anahtarı yazılmaz.
- EXE veya ZIP paketine müşteri ayarları gömülmez.

## Otomatik başlangıç

**Windows açıldığında otomatik başlat** seçeneği şu kullanıcı kayıt alanını kullanır:

```text
HKCU\Software\Microsoft\Windows\CurrentVersion\Run
```

Bu nedenle otomatik çalışma, ayarı kaydeden Windows kullanıcısı oturum açtığında başlar. EXE başka klasöre
taşınırsa uygulamayı yeni konumdan açıp ayarları yeniden kaydedin.

## Build

Repository kökünde:

```powershell
dotnet build sync-agent/GeraPosQrSync/GeraPosQrSync.csproj -c Release
```

## Self-contained yayın

Proje dosyasında `win-x64`, self-contained ve single-file özellikleri sabittir:

```powershell
dotnet publish sync-agent/GeraPosQrSync/GeraPosQrSync.csproj -c Release
```

Çıktı:

```text
sync-agent/GeraPosQrSync/bin/Release/net8.0-windows/win-x64/publish/JokerQRMenuSync.exe
```

EXE yaklaşık 75 MB'dir. Boyutun nedeni .NET 8 runtime ve SQL istemci bileşenlerini içermesidir.

## Dağıtım paketi

Dağıtım ZIP'i kaynak repoya commit edilmez. Yerel paket:

```text
artifacts/JokerQRMenuSync-win-x64.zip
```

ZIP içinde self-contained EXE ve kısa `KURULUM.txt` bulunur.

## Koruma kuralları

- SQL sıfır ürün döndürürse ajan tam snapshot göndermez.
- Aynı stok ID ve aynı fiyat tekrar ediyorsa tek kayıt olarak gönderilir.
- Aynı stok ID için farklı fiyatlar varsa senkronizasyon durur ve stok ID'leri gösterilir.
- Aynı anda iki senkronizasyon çalıştırılamaz.
- API veya SQL hatasında mevcut dijital menü son başarılı verilerle çalışmaya devam eder.

## Sorun giderme

### `VeriBaglantisi.txt bulunamadı`

Dosyanın tam yolunu kontrol edin ve **Seç** düğmesiyle tekrar belirleyin.

### SQL bağlantısı başarısız

- SQL Server instance çalışıyor mu?
- Veritabanı adı doğru mu?
- Bağlantı dosyasındaki kullanıcı/parola geçerli mi?
- SQL Server TCP/IP ve güvenlik duvarı ayarları bağlantıya izin veriyor mu?

### API anahtarı geçersiz

Panelden yeni anahtar üretin, ajana girin ve ayarları kaydedin. Yeni anahtar üretildiğinde eski anahtar geçersiz
olur.

### Farklı fiyatlı mükerrer stok hatası

`FIYAT` tablosunda aynı stok için birden fazla fiyat satırı vardır. Kullanılacak fiyat listesi belirlendikten sonra
ajan sorgusuna filtre eklenmelidir. Rastgele fiyat gönderilmez.

### Otomatik senkronizasyon çalışmıyor

- Ajan tepsi ikonunun açık olduğunu kontrol edin.
- Windows kullanıcısının oturum açtığını kontrol edin.
- `sync.log` dosyasındaki son hatayı inceleyin.
- EXE taşındıysa otomatik başlangıç ayarını yeniden kaydedin.
