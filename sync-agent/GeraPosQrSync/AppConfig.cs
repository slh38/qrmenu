using System.Security.Cryptography;
using System.Text;
using System.Text.Json;

namespace JokerQRMenuSync;

internal sealed class AppConfig
{
    public string ConnectionFilePath { get; set; } = @"C:\JOKERERP\GeraPOS\VeriBaglantisi.txt";
    public string DatabaseName { get; set; } = "Verim_1";
    public string ApiUrl { get; set; } = "https://api.jokerqrmenu.com/api/integrations/gerapos/sync";
    public string EncryptedApiKey { get; set; } = "";
    public int IntervalMinutes { get; set; } = 60;
    public string DailyTime { get; set; } = "03:00";
    public bool StartWithWindows { get; set; } = true;
}

internal static class ConfigStore
{
    private static readonly string AppDirectory = Path.Combine(
        Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData),
        "JokerQRMenuSync"
    );

    public static string ConfigPath => Path.Combine(AppDirectory, "config.json");
    public static string LogPath => Path.Combine(AppDirectory, "sync.log");

    public static AppConfig Load()
    {
        Directory.CreateDirectory(AppDirectory);
        if (!File.Exists(ConfigPath))
        {
            return new AppConfig();
        }

        try
        {
            return JsonSerializer.Deserialize<AppConfig>(File.ReadAllText(ConfigPath)) ?? new AppConfig();
        }
        catch
        {
            return new AppConfig();
        }
    }

    public static void Save(AppConfig config)
    {
        Directory.CreateDirectory(AppDirectory);
        File.WriteAllText(
            ConfigPath,
            JsonSerializer.Serialize(config, new JsonSerializerOptions { WriteIndented = true })
        );
    }

    public static string ProtectApiKey(string apiKey)
    {
        if (string.IsNullOrWhiteSpace(apiKey))
        {
            return "";
        }

        var encrypted = ProtectedData.Protect(
            Encoding.UTF8.GetBytes(apiKey.Trim()),
            null,
            DataProtectionScope.CurrentUser
        );
        return Convert.ToBase64String(encrypted);
    }

    public static string UnprotectApiKey(string encryptedApiKey)
    {
        if (string.IsNullOrWhiteSpace(encryptedApiKey))
        {
            return "";
        }

        try
        {
            var decrypted = ProtectedData.Unprotect(
                Convert.FromBase64String(encryptedApiKey),
                null,
                DataProtectionScope.CurrentUser
            );
            return Encoding.UTF8.GetString(decrypted);
        }
        catch
        {
            return "";
        }
    }

    public static void AppendLog(string message)
    {
        Directory.CreateDirectory(AppDirectory);
        File.AppendAllText(LogPath, $"{DateTime.Now:yyyy-MM-dd HH:mm:ss} | {message}{Environment.NewLine}");
    }
}
