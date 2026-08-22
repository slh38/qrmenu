# Joker QR Menu GeraPOS Sync

Windows üzerinde GeraPOS SQL verilerini Joker QR Menu API'sine gönderen tepsi uygulamasıdır.

## Özellikler

- `VeriBaglantisi.txt` dosyasından SQL bağlantısını okur.
- Veritabanı adı uygulama ekranından seçilir.
- SQL veya API parolasını kaynak kodda tutmaz.
- Entegrasyon anahtarını Windows DPAPI ile mevcut kullanıcıya bağlı şifreler.
- 5, 15, 30, 60 dakika veya günlük seçilen saatte çalışır.
- SQL testi, API testi ve manuel senkronizasyon sunar.
- Windows açılışında otomatik başlatılabilir.
- Tam ürün listesini gönderir; QR Menü'de yalnızca kullanıcının seçtiği ürünler gösterilir.

## Build

```powershell
dotnet build sync-agent/GeraPosQrSync/GeraPosQrSync.csproj -c Release
```

## Self-contained yayın

```powershell
dotnet publish sync-agent/GeraPosQrSync/GeraPosQrSync.csproj -c Release -r win-x64 --self-contained true -p:PublishSingleFile=true
```

Çıktı `sync-agent/GeraPosQrSync/bin/Release/net8.0-windows/win-x64/publish` klasörüne oluşur.
