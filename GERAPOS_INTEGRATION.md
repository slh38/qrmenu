# JokerQRMenu GeraPOS Entegrasyonu

Bu doküman GeraPOS/MS SQL ürünlerinin JokerQRMenu ile nasıl senkronize edildiğini, hangi verinin hangi sistem
tarafından yönetildiğini ve entegrasyonun operasyon kurallarını açıklar.

## Amaç

JokerQRMenu iki kullanım biçimini aynı anda destekler:

1. **Manuel ürün:** Ürün adı, fiyatı, kategorisi ve görseli QR Menü panelinden yönetilir.
2. **GeraPOS ürünü:** Kaynak ürün ve fiyat GeraPOS'tan gelir; QR sunumu panelden yönetilir.

GeraPOS'taki bütün ürünler sunucudaki adisyon ürün havuzuna gönderilir. Bu, bütün ürünlerin dijital menüde
gösterileceği anlamına gelmez. İşletme panelden istediği ürünleri seçer ve yalnızca seçilen ürünler QR menüye
aktarılır. Seçim için adet sınırı yoktur.

## Veri akışı

```text
VeriBaglantisi.txt
        |
        v
GeraPOS SQL Server (STOKKART + STOKKATEGORI + FIYAT)
        |
        v
JokerQRMenuSync.exe
        |
        | HTTPS + tenant entegrasyon anahtarı
        v
POST /api/integrations/gerapos/sync
        |
        v
MongoDB IntegrationProduct havuzu
        |
        | Kullanıcı seçimi
        v
MenuItem -> Dijital menü
```

## İlk sürüm SQL sorgusu

```sql
SELECT
    s.StokKart_ID,
    s.Aktif,
    s.STOKADI,
    f.BirimFiyati,
    sk.KategoriAdi
FROM STOKKART s
INNER JOIN STOKKATEGORI sk
    ON s.StokKategori_FID = sk.StokKategori_ID
INNER JOIN FIYAT f
    ON s.StokKart_ID = f.StokKart_FID;
```

Sorgu ajan içinde sabittir. Fiyat tablosunda aynı stok için birden fazla satır bulunabiliyorsa doğru fiyat
listesini belirleyen filtre ileride sorguya eklenmelidir.

## Alan eşleştirmesi

| SQL alanı | Entegrasyon alanı | Kullanım |
|---|---|---|
| `StokKart_ID` | `externalStockId` | Değişmeyen kaynak kimliği |
| `Aktif` | `sourceActive` | Kaynak aktif/pasif durumu |
| `STOKADI` | `sourceName` | GeraPOS'taki ürün adı |
| `BirimFiyati` | `sourcePrice` | GeraPOS tarafından yönetilen fiyat |
| `KategoriAdi` | `sourceCategory` | Bilgi ve filtre amaçlı kaynak kategori |

`StokKart_ID`, tenant ve sağlayıcı birlikte benzersizdir. Aynı ürün QR menüye ikinci kez aktarılamaz.

## Veri sahipliği

### GeraPOS tarafından yönetilen alanlar

- Kaynak stok ID
- Kaynak ürün adı
- Kaynak kategori
- Fiyat
- Kaynak aktif/pasif durumu

### QR Menü tarafından yönetilen alanlar

- Dijital menüde görünen ürün adı
- QR kategorisi
- Açıklama
- Görsel
- Sıralama
- Kullanıcının göster/gizle tercihi

Kaynak kategori ve QR kategorisi birbirinden bağımsızdır. Ürün GeraPOS'ta `Pizzalar`, QR menüde `Sıcaklar`
kategorisinde gösterilebilir. Senkronizasyon kullanıcının seçtiği QR kategorisini değiştirmez.

## Aktarım süreci

1. Ajan SQL sorgusunu çalıştırır ve bütün tekil ürünleri havuza gönderir.
2. İşletme panelde **Adisyon Ürünleri** sayfasını açar.
3. Ürün adı, stok ID, kaynak kategori veya durumla filtreleme yapılabilir.
4. Kullanıcı aktarılacak ürünleri işaretler.
5. Hedef QR kategorisi seçilir.
6. **Seçilenleri QR'a Aktar** düğmesine basılır.
7. Aktarılan ürün mevcut **Ürünler** sayfasından düzenlenir ve görsel eklenir.

Bir toplu aktarımda seçilen ürünler aynı QR kategorisine eklenir. Ürün kategorileri daha sonra tek tek
değiştirilebilir.

## Senkronizasyon kuralları

- Ajan her çalışmada tam ürün listesini gönderir (`isFullSnapshot=true`).
- Yeni ürünler havuza eklenir; otomatik olarak dijital menüye aktarılmaz.
- Fiyat değişikliği bağlantılı QR ürününe uygulanır.
- Kaynak ad değişikliği havuzda güncellenir; kullanıcının QR görünen adı korunur.
- Kaynak kategori değişikliği QR kategorisini değiştirmez.
- Görsel, açıklama ve sıra korunur.
- Kaynak ürün pasifse bağlantılı QR ürünü dijital menüde gizlenir.
- Ürün yeniden aktif olduğunda önceki QR bilgileriyle yeniden görünür.
- Tam listede bulunmayan eski kaynak kayıtlar pasif kabul edilir.
- SQL sorgusu sıfır ürün döndürürse ajan mevcut menüyü korumak için isteği göndermez.

`Aktif=NULL` değeri backend tarafından belirsiz kabul edilir ve açıkça pasif olmadığı için aktarılabilir/görünür
durumda tutulur. GeraPOS'taki gerçek aktiflik anlamı kesinleştiğinde bu eşleştirme güncellenmelidir.

## Mükerrer fiyat kayıtları

Ajan aynı `StokKart_ID` için birden fazla SQL satırını tek üründe birleştirir.

- Fiyatlar aynıysa mükerrer satır sayısı bilgi olarak gösterilir.
- Fiyatlar farklıysa ajan rastgele fiyat göndermek yerine senkronizasyonu durdurur ve sorunlu stok ID'lerini
  gösterir.

Kalıcı çözüm, `FIYAT` tablosundaki kullanılacak fiyat türünü/listeyi belirleyip SQL sorgusuna uygun filtreyi
eklemektir.

## API ve güvenlik

### Panel JWT ile kullanılan uçlar

| Metot | Uç | Açıklama |
|---|---|---|
| `GET` | `/api/integrations/gerapos/settings` | Durum ve sayaçlar |
| `POST` | `/api/integrations/gerapos/key` | Yeni entegrasyon anahtarı üretir |
| `DELETE` | `/api/integrations/gerapos/key` | Mevcut anahtarı iptal eder |
| `GET` | `/api/integrations/gerapos/products` | Tenant ürün havuzunu listeler |
| `POST` | `/api/integrations/gerapos/import` | Seçilen ürünleri QR menüye aktarır |

### Ajan tarafından kullanılan uç

```text
POST /api/integrations/gerapos/sync
Header: x-integration-key: jqr_...
```

- Anahtar yalnızca oluşturulduğu anda açık olarak gösterilir.
- Backend anahtarın SHA-256 özetini saklar, açık anahtarı saklamaz.
- Windows ajanı anahtarı Windows DPAPI ile mevcut kullanıcıya bağlı şifreler.
- Anahtar açığa çıkarsa panelden yenilenir; eski anahtar anında geçersiz olur.
- Normal panel kullanıcı parolası Windows ajanına verilmez.

## Zamanlama

Ajan şu seçenekleri destekler:

- 5 dakikada bir
- 15 dakikada bir
- 30 dakikada bir
- Saatte bir
- Günde bir, seçilen saatte
- Manuel **Şimdi Senkronize Et**

Ajan bir Windows servisinden farklı olarak kullanıcı oturumu içinde sistem tepsisinde çalışır. Bilgisayar açık
olsa bile ilgili Windows kullanıcısı oturum açmadıysa ajan çalışmaz.

## Test sırası

1. SQL bağlantı testi başarılı olmalıdır.
2. Okunan tekil ve mükerrer ürün sayıları kontrol edilmelidir.
3. API bağlantı testi başarılı olmalıdır.
4. Ayarlar kaydedilmelidir.
5. Manuel senkronizasyon çalıştırılmalıdır.
6. Panelde havuz sayısı ve son güncelleme zamanı kontrol edilmelidir.
7. Bir gerçek ürün QR menüye aktarılmalıdır.
8. QR ürün adı/kategorisi/görseli değiştirilmelidir.
9. GeraPOS fiyatı değiştirilip yeniden senkronize edilmelidir.
10. Yalnızca fiyatın değiştiği, QR sunum bilgilerinin korunduğu doğrulanmalıdır.
11. Pasif ve yeniden aktif ürün davranışı doğrulanmalıdır.

## İlgili belgeler

- Genel proje: [README.md](README.md)
- Windows ajanı: [sync-agent/README.md](sync-agent/README.md)
- VPS yayını: [DEPLOYMENT.md](DEPLOYMENT.md)
