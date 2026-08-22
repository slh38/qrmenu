namespace JokerQRMenuSync;

internal static class Program
{
    [STAThread]
    private static void Main(string[] args)
    {
        ApplicationConfiguration.Initialize();
        Application.Run(new MainForm(args.Contains("--tray", StringComparer.OrdinalIgnoreCase)));
    }
}
