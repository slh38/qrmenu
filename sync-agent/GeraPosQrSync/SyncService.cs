using System.Net.Http.Json;
using System.Text.Json;
using Microsoft.Data.SqlClient;

namespace JokerQRMenuSync;

internal sealed record SourceProduct(
    string ExternalStockId,
    object? SourceActive,
    string SourceName,
    decimal SourcePrice,
    string SourceCategory
);

internal sealed record SyncResult(int ReadCount, int SentCount, int InvalidCount, string Message);
internal sealed record SqlTestResult(int Count, int DuplicateCount, IReadOnlyList<string> ConflictingStockIds);

internal sealed class SyncService
{
    private const string ProductQuery = """
        SELECT
            s.StokKart_ID,
            s.Aktif,
            s.STOKADI,
            f.BirimFiyati,
            sk.KategoriAdi
        FROM STOKKART s
        INNER JOIN STOKKATEGORI sk ON s.StokKategori_FID = sk.StokKategori_ID
        INNER JOIN FIYAT f ON s.StokKart_ID = f.StokKart_FID
        """;

    private static readonly HttpClient HttpClient = new() { Timeout = TimeSpan.FromMinutes(3) };
    private readonly SemaphoreSlim _syncLock = new(1, 1);

    public async Task<SqlTestResult> TestSqlAsync(AppConfig config, CancellationToken cancellationToken = default)
    {
        var products = await ReadProductsAsync(config, cancellationToken);
        return new SqlTestResult(products.Count, products.DuplicateCount, products.ConflictingStockIds);
    }

    public async Task TestApiAsync(AppConfig config, string apiKey, CancellationToken cancellationToken = default)
    {
        ValidateApiSettings(config, apiKey);
        using var request = new HttpRequestMessage(HttpMethod.Post, config.ApiUrl);
        request.Headers.Add("x-integration-key", apiKey.Trim());
        request.Content = JsonContent.Create(new { isFullSnapshot = false, products = Array.Empty<object>() });

        using var response = await HttpClient.SendAsync(request, cancellationToken);
        await EnsureSuccessAsync(response, cancellationToken);
    }

    public async Task<SyncResult> SyncAsync(AppConfig config, string apiKey, CancellationToken cancellationToken = default)
    {
        if (!await _syncLock.WaitAsync(0, cancellationToken))
        {
            throw new InvalidOperationException("Senkronizasyon zaten çalışıyor.");
        }

        try
        {
            ValidateApiSettings(config, apiKey);
            var products = await ReadProductsAsync(config, cancellationToken);

            if (products.Count == 0)
            {
                throw new InvalidOperationException(
                    "SQL sorgusu sıfır ürün döndürdü. Mevcut menüyü korumak için tam senkronizasyon gönderilmedi."
                );
            }

            if (products.ConflictingStockIds.Count > 0)
            {
                throw new InvalidOperationException(
                    $"Aynı stok için farklı fiyat kayıtları bulundu: {string.Join(", ", products.ConflictingStockIds.Take(10))}. " +
                    "Doğru fiyat satırı belirlenmeden senkronizasyon gönderilmedi."
                );
            }

            using var request = new HttpRequestMessage(HttpMethod.Post, config.ApiUrl);
            request.Headers.Add("x-integration-key", apiKey.Trim());
            request.Content = JsonContent.Create(new
            {
                isFullSnapshot = true,
                products = products.Items.Select(product => new
                {
                    externalStockId = product.ExternalStockId,
                    sourceActive = product.SourceActive,
                    sourceName = product.SourceName,
                    sourcePrice = product.SourcePrice,
                    sourceCategory = product.SourceCategory,
                }),
            });

            using var response = await HttpClient.SendAsync(request, cancellationToken);
            var responseJson = await EnsureSuccessAsync(response, cancellationToken);
            var data = responseJson.RootElement.GetProperty("data");

            return new SyncResult(
                products.Count,
                data.TryGetProperty("syncedCount", out var sentCount) ? sentCount.GetInt32() : products.Count,
                data.TryGetProperty("invalidCount", out var invalidCount) ? invalidCount.GetInt32() : 0,
                responseJson.RootElement.GetProperty("message").GetString() ?? "Senkronizasyon tamamlandı."
            );
        }
        finally
        {
            _syncLock.Release();
        }
    }

    private static void ValidateApiSettings(AppConfig config, string apiKey)
    {
        if (!Uri.TryCreate(config.ApiUrl, UriKind.Absolute, out _))
        {
            throw new InvalidOperationException("Geçerli bir API adresi girin.");
        }

        if (string.IsNullOrWhiteSpace(apiKey))
        {
            throw new InvalidOperationException("Entegrasyon anahtarı gerekli.");
        }
    }

    private static async Task<(
        List<SourceProduct> Items,
        int Count,
        int DuplicateCount,
        List<string> ConflictingStockIds
    )> ReadProductsAsync(
        AppConfig config,
        CancellationToken cancellationToken
    )
    {
        if (!File.Exists(config.ConnectionFilePath))
        {
            throw new FileNotFoundException("VeriBaglantisi.txt bulunamadı.", config.ConnectionFilePath);
        }

        if (string.IsNullOrWhiteSpace(config.DatabaseName))
        {
            throw new InvalidOperationException("Veritabanı adı gerekli.");
        }

        var rawConnectionString = (await File.ReadAllTextAsync(config.ConnectionFilePath, cancellationToken)).Trim();
        var connectionBuilder = new SqlConnectionStringBuilder(rawConnectionString)
        {
            InitialCatalog = config.DatabaseName.Trim(),
            Encrypt = false,
            TrustServerCertificate = true,
        };

        var productsById = new Dictionary<string, SourceProduct>(StringComparer.OrdinalIgnoreCase);
        var duplicateCount = 0;
        var conflictingStockIds = new HashSet<string>(StringComparer.OrdinalIgnoreCase);

        await using var connection = new SqlConnection(connectionBuilder.ConnectionString);
        await connection.OpenAsync(cancellationToken);
        await using var command = new SqlCommand(ProductQuery, connection) { CommandTimeout = 600 };
        await using var reader = await command.ExecuteReaderAsync(cancellationToken);

        while (await reader.ReadAsync(cancellationToken))
        {
            var stockId = Convert.ToString(reader["StokKart_ID"])?.Trim();
            var name = Convert.ToString(reader["STOKADI"])?.Trim();
            if (string.IsNullOrWhiteSpace(stockId) || string.IsNullOrWhiteSpace(name) || reader["BirimFiyati"] is DBNull)
            {
                continue;
            }

            var active = reader["Aktif"] is DBNull ? null : reader["Aktif"];
            var category = reader["KategoriAdi"] is DBNull ? "" : Convert.ToString(reader["KategoriAdi"])?.Trim() ?? "";
            var product = new SourceProduct(
                stockId,
                active,
                name,
                Convert.ToDecimal(reader["BirimFiyati"]),
                category
            );

            if (!productsById.TryAdd(stockId, product))
            {
                duplicateCount += 1;
                if (productsById[stockId].SourcePrice != product.SourcePrice)
                {
                    conflictingStockIds.Add(stockId);
                }
                productsById[stockId] = product;
            }
        }

        return (
            productsById.Values.ToList(),
            productsById.Count,
            duplicateCount,
            conflictingStockIds.OrderBy(stockId => stockId).ToList()
        );
    }

    private static async Task<JsonDocument> EnsureSuccessAsync(HttpResponseMessage response, CancellationToken cancellationToken)
    {
        var responseText = await response.Content.ReadAsStringAsync(cancellationToken);
        JsonDocument json;
        try
        {
            json = JsonDocument.Parse(responseText);
        }
        catch
        {
            throw new InvalidOperationException($"API geçersiz cevap verdi: HTTP {(int)response.StatusCode}");
        }

        var success = json.RootElement.TryGetProperty("success", out var successElement) && successElement.GetBoolean();
        if (!response.IsSuccessStatusCode || !success)
        {
            var message = json.RootElement.TryGetProperty("message", out var messageElement)
                ? messageElement.GetString()
                : $"HTTP {(int)response.StatusCode}";
            json.Dispose();
            throw new InvalidOperationException(message ?? "API isteği başarısız.");
        }

        return json;
    }
}
