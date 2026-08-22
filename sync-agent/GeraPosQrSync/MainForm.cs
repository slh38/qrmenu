using Microsoft.Win32;

namespace JokerQRMenuSync;

internal sealed class MainForm : Form
{
    private const string StartupRegistryPath = @"Software\Microsoft\Windows\CurrentVersion\Run";
    private const string StartupValueName = "JokerQRMenuSync";

    private readonly TextBox _connectionFileTextBox = new();
    private readonly TextBox _databaseTextBox = new();
    private readonly TextBox _apiUrlTextBox = new();
    private readonly TextBox _apiKeyTextBox = new();
    private readonly ComboBox _intervalComboBox = new();
    private readonly DateTimePicker _dailyTimePicker = new();
    private readonly CheckBox _startWithWindowsCheckBox = new();
    private readonly Label _statusLabel = new();
    private readonly Label _nextSyncLabel = new();
    private readonly RichTextBox _logTextBox = new();
    private readonly NotifyIcon _notifyIcon = new();
    private readonly System.Windows.Forms.Timer _schedulerTimer = new() { Interval = 30_000 };
    private readonly SyncService _syncService = new();

    private AppConfig _config = new();
    private DateTime _nextSyncAt;
    private bool _allowExit;
    private bool _balloonShown;
    private readonly bool _startHidden;

    public MainForm(bool startHidden = false)
    {
        _startHidden = startHidden;
        Text = "Joker QR Menü - GeraPOS Senkronizasyon";
        StartPosition = FormStartPosition.CenterScreen;
        MinimumSize = new Size(760, 650);
        Size = new Size(900, 760);
        Font = new Font("Segoe UI", 10F);

        BuildInterface();
        ConfigureTrayIcon();
        LoadConfiguration();

        _schedulerTimer.Tick += async (_, _) => await RunScheduledSyncAsync();
        _schedulerTimer.Start();
        FormClosing += HandleFormClosing;
        Shown += (_, _) =>
        {
            if (_startHidden)
            {
                HideToTray();
            }
        };
        Resize += (_, _) =>
        {
            if (WindowState == FormWindowState.Minimized)
            {
                HideToTray();
            }
        };
    }

    private void BuildInterface()
    {
        var root = new TableLayoutPanel
        {
            Dock = DockStyle.Fill,
            ColumnCount = 1,
            RowCount = 4,
            Padding = new Padding(24),
            AutoScroll = true,
        };
        root.RowStyles.Add(new RowStyle(SizeType.AutoSize));
        root.RowStyles.Add(new RowStyle(SizeType.AutoSize));
        root.RowStyles.Add(new RowStyle(SizeType.AutoSize));
        root.RowStyles.Add(new RowStyle(SizeType.Percent, 100));
        Controls.Add(root);

        var title = new Label
        {
            AutoSize = true,
            Text = "Joker QR Menü Senkronizasyon",
            Font = new Font("Segoe UI", 20F, FontStyle.Bold),
            ForeColor = Color.FromArgb(15, 35, 70),
            Margin = new Padding(0, 0, 0, 18),
        };
        root.Controls.Add(title);

        var settingsPanel = new TableLayoutPanel
        {
            Dock = DockStyle.Top,
            AutoSize = true,
            ColumnCount = 3,
            Padding = new Padding(18),
            BackColor = Color.White,
            Margin = new Padding(0, 0, 0, 16),
        };
        settingsPanel.ColumnStyles.Add(new ColumnStyle(SizeType.Absolute, 190));
        settingsPanel.ColumnStyles.Add(new ColumnStyle(SizeType.Percent, 100));
        settingsPanel.ColumnStyles.Add(new ColumnStyle(SizeType.AutoSize));
        root.Controls.Add(settingsPanel);

        AddField(settingsPanel, 0, "Bağlantı dosyası", _connectionFileTextBox, CreateBrowseButton());
        AddField(settingsPanel, 1, "Veritabanı", _databaseTextBox);
        AddField(settingsPanel, 2, "Senkronizasyon API", _apiUrlTextBox);
        _apiKeyTextBox.UseSystemPasswordChar = true;
        AddField(settingsPanel, 3, "Entegrasyon anahtarı", _apiKeyTextBox);

        _intervalComboBox.DropDownStyle = ComboBoxStyle.DropDownList;
        _intervalComboBox.Items.AddRange(
        [
            new ScheduleOption("5 dakikada bir", 5),
            new ScheduleOption("15 dakikada bir", 15),
            new ScheduleOption("30 dakikada bir", 30),
            new ScheduleOption("Saatte bir", 60),
            new ScheduleOption("Günde bir", 1440),
        ]);
        _intervalComboBox.SelectedIndexChanged += (_, _) => UpdateDailyTimeState();
        AddField(settingsPanel, 4, "Çalışma aralığı", _intervalComboBox);

        _dailyTimePicker.Format = DateTimePickerFormat.Custom;
        _dailyTimePicker.CustomFormat = "HH:mm";
        _dailyTimePicker.ShowUpDown = true;
        AddField(settingsPanel, 5, "Günlük çalışma saati", _dailyTimePicker);

        _startWithWindowsCheckBox.Text = "Windows açıldığında otomatik başlat";
        _startWithWindowsCheckBox.AutoSize = true;
        settingsPanel.Controls.Add(_startWithWindowsCheckBox, 1, 6);

        var actionPanel = new FlowLayoutPanel
        {
            Dock = DockStyle.Top,
            AutoSize = true,
            WrapContents = true,
            Margin = new Padding(0, 0, 0, 16),
        };
        actionPanel.Controls.Add(CreateActionButton("Ayarları Kaydet", async () => await SaveSettingsAsync(), true));
        actionPanel.Controls.Add(CreateActionButton("SQL Bağlantısını Test Et", TestSqlAsync));
        actionPanel.Controls.Add(CreateActionButton("API Bağlantısını Test Et", TestApiAsync));
        actionPanel.Controls.Add(CreateActionButton("Şimdi Senkronize Et", SyncNowAsync, true));
        root.Controls.Add(actionPanel);

        var statusPanel = new TableLayoutPanel
        {
            Dock = DockStyle.Top,
            AutoSize = true,
            ColumnCount = 1,
            Padding = new Padding(16),
            BackColor = Color.FromArgb(235, 243, 255),
            Margin = new Padding(0, 0, 0, 16),
        };
        _statusLabel.AutoSize = true;
        _statusLabel.Font = new Font("Segoe UI", 11F, FontStyle.Bold);
        _statusLabel.Text = "Hazır";
        _nextSyncLabel.AutoSize = true;
        _nextSyncLabel.ForeColor = Color.FromArgb(75, 95, 125);
        _nextSyncLabel.Margin = new Padding(0, 8, 0, 0);
        statusPanel.Controls.Add(_statusLabel);
        statusPanel.Controls.Add(_nextSyncLabel);
        root.Controls.Add(statusPanel);

        _logTextBox.Dock = DockStyle.Fill;
        _logTextBox.ReadOnly = true;
        _logTextBox.BackColor = Color.FromArgb(249, 251, 255);
        _logTextBox.BorderStyle = BorderStyle.FixedSingle;
        _logTextBox.Font = new Font("Consolas", 9F);
        root.Controls.Add(_logTextBox);
    }

    private static void AddField(TableLayoutPanel panel, int row, string label, Control control, Control? trailingControl = null)
    {
        panel.RowStyles.Add(new RowStyle(SizeType.AutoSize));
        var labelControl = new Label
        {
            Text = label,
            AutoSize = true,
            Anchor = AnchorStyles.Left,
            Margin = new Padding(0, 10, 12, 10),
        };
        control.Dock = DockStyle.Fill;
        control.Margin = new Padding(0, 6, 8, 6);
        control.MinimumSize = new Size(0, 32);
        panel.Controls.Add(labelControl, 0, row);
        panel.Controls.Add(control, 1, row);
        if (trailingControl is not null)
        {
            panel.Controls.Add(trailingControl, 2, row);
        }
    }

    private Button CreateBrowseButton()
    {
        var button = new Button { Text = "Seç", AutoSize = true, Margin = new Padding(0, 6, 0, 6) };
        button.Click += (_, _) =>
        {
            using var dialog = new OpenFileDialog
            {
                Filter = "Metin dosyası (*.txt)|*.txt|Tüm dosyalar (*.*)|*.*",
                FileName = Path.GetFileName(_connectionFileTextBox.Text),
                InitialDirectory = Path.GetDirectoryName(_connectionFileTextBox.Text),
            };
            if (dialog.ShowDialog(this) == DialogResult.OK)
            {
                _connectionFileTextBox.Text = dialog.FileName;
            }
        };
        return button;
    }

    private static Button CreateActionButton(string text, Func<Task> action, bool primary = false)
    {
        var button = new Button
        {
            Text = text,
            AutoSize = true,
            MinimumSize = new Size(160, 42),
            Margin = new Padding(0, 0, 10, 8),
            FlatStyle = FlatStyle.Flat,
            BackColor = primary ? Color.FromArgb(37, 99, 235) : Color.White,
            ForeColor = primary ? Color.White : Color.FromArgb(30, 50, 80),
        };
        button.FlatAppearance.BorderColor = Color.FromArgb(185, 205, 235);
        button.Click += async (_, _) =>
        {
            button.Enabled = false;
            try
            {
                await action();
            }
            finally
            {
                button.Enabled = true;
            }
        };
        return button;
    }

    private void ConfigureTrayIcon()
    {
        var menu = new ContextMenuStrip();
        menu.Items.Add("Aç", null, (_, _) => RestoreFromTray());
        menu.Items.Add("Şimdi Senkronize Et", null, async (_, _) => await SyncNowAsync());
        menu.Items.Add(new ToolStripSeparator());
        menu.Items.Add("Çıkış", null, (_, _) =>
        {
            _allowExit = true;
            _notifyIcon.Visible = false;
            Close();
        });

        _notifyIcon.Icon = SystemIcons.Information;
        _notifyIcon.Text = "Joker QR Menü Senkronizasyon";
        _notifyIcon.ContextMenuStrip = menu;
        _notifyIcon.Visible = true;
        _notifyIcon.DoubleClick += (_, _) => RestoreFromTray();
    }

    private void LoadConfiguration()
    {
        _config = ConfigStore.Load();
        _connectionFileTextBox.Text = _config.ConnectionFilePath;
        _databaseTextBox.Text = _config.DatabaseName;
        _apiUrlTextBox.Text = _config.ApiUrl;
        _apiKeyTextBox.Text = ConfigStore.UnprotectApiKey(_config.EncryptedApiKey);
        _startWithWindowsCheckBox.Checked = _config.StartWithWindows;
        _dailyTimePicker.Value = DateTime.Today.Add(TimeSpan.TryParse(_config.DailyTime, out var dailyTime) ? dailyTime : TimeSpan.FromHours(3));

        var matchingIndex = _intervalComboBox.Items
            .Cast<ScheduleOption>()
            .Select((option, index) => new { option, index })
            .FirstOrDefault(item => item.option.Minutes == _config.IntervalMinutes)?.index ?? 3;
        _intervalComboBox.SelectedIndex = matchingIndex;
        UpdateDailyTimeState();
        SetNextSync();
        AddLog("Uygulama başlatıldı.");
    }

    private async Task SaveSettingsAsync()
    {
        try
        {
            _config = ReadConfigurationFromForm();
            ConfigStore.Save(_config);
            ConfigureStartup(_config.StartWithWindows);
            SetNextSync();
            SetStatus("Ayarlar kaydedildi.", false);
            AddLog("Ayarlar kaydedildi.");
            await Task.CompletedTask;
        }
        catch (Exception exception)
        {
            SetStatus(exception.Message, true);
        }
    }

    private AppConfig ReadConfigurationFromForm()
    {
        var selectedSchedule = _intervalComboBox.SelectedItem as ScheduleOption
            ?? throw new InvalidOperationException("Çalışma aralığı seçin.");
        return new AppConfig
        {
            ConnectionFilePath = _connectionFileTextBox.Text.Trim(),
            DatabaseName = _databaseTextBox.Text.Trim(),
            ApiUrl = _apiUrlTextBox.Text.Trim(),
            EncryptedApiKey = ConfigStore.ProtectApiKey(_apiKeyTextBox.Text),
            IntervalMinutes = selectedSchedule.Minutes,
            DailyTime = _dailyTimePicker.Value.ToString("HH:mm"),
            StartWithWindows = _startWithWindowsCheckBox.Checked,
        };
    }

    private async Task TestSqlAsync()
    {
        await RunOperationAsync("SQL bağlantısı test ediliyor...", async () =>
        {
            var config = ReadConfigurationFromForm();
            var result = await _syncService.TestSqlAsync(config);
            var message = $"SQL bağlantısı başarılı. {result.Count} tekil ürün okundu" +
                          (result.DuplicateCount > 0 ? $", {result.DuplicateCount} mükerrer satır bulundu." : ".");
            if (result.ConflictingStockIds.Count > 0)
            {
                message += $" Farklı fiyatlı stok ID: {string.Join(", ", result.ConflictingStockIds.Take(10))}.";
            }
            return message;
        });
    }

    private async Task TestApiAsync()
    {
        await RunOperationAsync("API bağlantısı test ediliyor...", async () =>
        {
            var config = ReadConfigurationFromForm();
            await _syncService.TestApiAsync(config, _apiKeyTextBox.Text);
            return "API bağlantısı ve entegrasyon anahtarı geçerli.";
        });
    }

    private async Task SyncNowAsync()
    {
        await RunOperationAsync("Ürünler senkronize ediliyor...", async () =>
        {
            var config = ReadConfigurationFromForm();
            var result = await _syncService.SyncAsync(config, _apiKeyTextBox.Text);
            _config = config;
            ConfigStore.Save(_config);
            SetNextSync();
            return $"{result.SentCount} ürün senkronize edildi" +
                   (result.InvalidCount > 0 ? $", {result.InvalidCount} geçersiz kayıt atlandı." : ".");
        });
    }

    private async Task RunScheduledSyncAsync()
    {
        if (DateTime.Now < _nextSyncAt)
        {
            return;
        }

        await SyncNowAsync();
        SetNextSync();
    }

    private async Task RunOperationAsync(string startingMessage, Func<Task<string>> operation)
    {
        SetStatus(startingMessage, false);
        AddLog(startingMessage);
        try
        {
            var result = await operation();
            SetStatus(result, false);
            AddLog(result);
            _notifyIcon.ShowBalloonTip(3000, "Joker QR Menü", result, ToolTipIcon.Info);
        }
        catch (Exception exception)
        {
            SetStatus(exception.Message, true);
            AddLog($"HATA: {exception.Message}");
            _notifyIcon.ShowBalloonTip(5000, "Senkronizasyon hatası", exception.Message, ToolTipIcon.Error);
        }
    }

    private void SetNextSync()
    {
        var schedule = _intervalComboBox.SelectedItem as ScheduleOption;
        if (schedule?.Minutes == 1440)
        {
            var candidate = DateTime.Today.Add(_dailyTimePicker.Value.TimeOfDay);
            _nextSyncAt = candidate > DateTime.Now ? candidate : candidate.AddDays(1);
        }
        else
        {
            _nextSyncAt = DateTime.Now.AddMinutes(schedule?.Minutes ?? 60);
        }
        _nextSyncLabel.Text = $"Sonraki otomatik kontrol: {_nextSyncAt:dd.MM.yyyy HH:mm}";
    }

    private void UpdateDailyTimeState()
    {
        _dailyTimePicker.Enabled = (_intervalComboBox.SelectedItem as ScheduleOption)?.Minutes == 1440;
    }

    private void SetStatus(string message, bool isError)
    {
        _statusLabel.Text = message;
        _statusLabel.ForeColor = isError ? Color.Firebrick : Color.FromArgb(20, 90, 60);
    }

    private void AddLog(string message)
    {
        _logTextBox.AppendText($"{DateTime.Now:HH:mm:ss}  {message}{Environment.NewLine}");
        _logTextBox.ScrollToCaret();
        ConfigStore.AppendLog(message);
    }

    private static void ConfigureStartup(bool enabled)
    {
        using var key = Registry.CurrentUser.OpenSubKey(StartupRegistryPath, writable: true)
            ?? Registry.CurrentUser.CreateSubKey(StartupRegistryPath, writable: true);
        if (enabled)
        {
            key.SetValue(StartupValueName, $"\"{Application.ExecutablePath}\" --tray");
        }
        else
        {
            key.DeleteValue(StartupValueName, throwOnMissingValue: false);
        }
    }

    private void HandleFormClosing(object? sender, FormClosingEventArgs eventArgs)
    {
        if (_allowExit || eventArgs.CloseReason == CloseReason.WindowsShutDown)
        {
            _notifyIcon.Visible = false;
            return;
        }

        eventArgs.Cancel = true;
        HideToTray();
    }

    private void HideToTray()
    {
        Hide();
        WindowState = FormWindowState.Normal;
        if (!_balloonShown)
        {
            _notifyIcon.ShowBalloonTip(2500, "Joker QR Menü", "Senkronizasyon arka planda çalışmaya devam ediyor.", ToolTipIcon.Info);
            _balloonShown = true;
        }
    }

    private void RestoreFromTray()
    {
        Show();
        WindowState = FormWindowState.Normal;
        Activate();
    }

    protected override void Dispose(bool disposing)
    {
        if (disposing)
        {
            _schedulerTimer.Dispose();
            _notifyIcon.Dispose();
        }
        base.Dispose(disposing);
    }

    private sealed record ScheduleOption(string Label, int Minutes)
    {
        public override string ToString() => Label;
    }
}
