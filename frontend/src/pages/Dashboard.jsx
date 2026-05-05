import { useEffect, useMemo, useState } from "react";
import { request, resolveAssetUrl } from "../lib/api";
import { themeOptions } from "../lib/themeOptions";

const ROOT_DOMAIN = (import.meta.env.VITE_ROOT_DOMAIN || "").toLowerCase();

const initialForm = {
  businessName: "",
  phone: "",
  address: "",
  primaryColor: "#2563eb",
  tagline: "",
  theme: "showcase",
  logoEffectEnabled: true,
  logoSize: "md",
  socialLinks: {
    instagram: "",
    facebook: "",
    tiktok: "",
    website: "",
    whatsapp: "",
  },
};

const socialFields = [
  { key: "instagram", label: "Instagram", placeholder: "https://instagram.com/..." },
  { key: "facebook", label: "Facebook", placeholder: "https://facebook.com/..." },
  { key: "tiktok", label: "TikTok", placeholder: "https://tiktok.com/@..." },
  { key: "website", label: "Website", placeholder: "https://..." },
  { key: "whatsapp", label: "WhatsApp", placeholder: "https://wa.me/90555..." },
];

function normalizeSlugInput(value) {
  return value
    .toLowerCase()
    .replace(/ı/g, "i")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/[._]/g, "-")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

function sanitizeSlugDraft(value) {
  return value
    .toLowerCase()
    .replace(/ı/g, "i")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ş/g, "s")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/[^a-z0-9\s._-]/g, "");
}

function TrendBars({ trend }) {
  const highest = Math.max(...trend.map((item) => item.count), 1);

  return (
    <div className="mt-4">
      <p className="mb-3 text-xs font-medium text-slate-500">Gunluk goruntulenme dagilimi</p>
      <div className="flex h-24 items-end gap-2">
        {trend.map((item) => (
          <div key={item.day} className="flex flex-1 flex-col items-center gap-2" title={`${item.day}: ${item.count}`}>
            <div className="flex h-16 w-full items-end">
              <div
                className="w-full rounded-t-2xl bg-gradient-to-t from-[#173b8f] to-[#60a5fa]"
                style={{ height: `${Math.max((item.count / highest) * 100, item.count > 0 ? 18 : 6)}%` }}
              />
            </div>
            <div className="text-[11px] text-slate-400">{item.day}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [tenant, setTenant] = useState(null);
  const [stats, setStats] = useState({
    categoryCount: 0,
    menuItemCount: 0,
    menuViewCount: 0,
    menuViewTrend: [],
  });
  const [form, setForm] = useState(initialForm);
  const [slugDraft, setSlugDraft] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState({ logo: false, cover: false });
  const [changingSlug, setChangingSlug] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState({
    logo: { name: "", preview: "" },
    cover: { name: "", preview: "" },
  });

  const syncTenant = (nextTenant) => {
    setTenant(nextTenant);
    localStorage.setItem("qrmenu_tenant", JSON.stringify(nextTenant));
  };

  const logoUrl = resolveAssetUrl(selectedFiles.logo.preview || tenant?.logoUrl || "");
  const coverUrl = resolveAssetUrl(selectedFiles.cover.preview || tenant?.coverImageUrl || "");
  const publicMenuUrl = useMemo(() => {
    if (!tenant?.slug) {
      return "";
    }

    return ROOT_DOMAIN ? `https://${tenant.slug}.${ROOT_DOMAIN}` : `/menu/${tenant.slug}`;
  }, [tenant?.slug]);

  const slugPreview = useMemo(() => {
    const nextSlug = normalizeSlugInput(slugDraft) || "subdomain";
    return `${nextSlug}.${ROOT_DOMAIN || "jokerqrmenu.com"}`;
  }, [slugDraft]);

  const loadProfile = async () => {
    try {
      const result = await request("/tenant/me");
      const nextTenant = result.data.tenant;
      setTenant(nextTenant);
      setStats({
        categoryCount: result.data.stats.categoryCount || 0,
        menuItemCount: result.data.stats.menuItemCount || 0,
        menuViewCount: result.data.stats.menuViewCount || 0,
        menuViewTrend: result.data.stats.menuViewTrend || [],
      });
      setSlugDraft(nextTenant.slug || "");
      setForm({
        businessName: nextTenant.businessName || "",
        phone: nextTenant.phone || "",
        address: nextTenant.address || "",
        primaryColor: nextTenant.primaryColor || "#2563eb",
        tagline: nextTenant.tagline || "",
        theme: nextTenant.theme || "showcase",
        logoEffectEnabled: nextTenant.logoEffectEnabled !== false,
        logoSize: nextTenant.logoSize || "md",
        socialLinks: {
          ...initialForm.socialLinks,
          ...(nextTenant.socialLinks || {}),
        },
      });
    } catch (loadError) {
      setError(loadError.message);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  const saveProfile = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");

    try {
      const result = await request("/tenant/me", {
        method: "PUT",
        body: JSON.stringify(form),
      });
      syncTenant(result.data.tenant);
      setMessage("İşletme ayarları güncellendi.");
    } catch (saveError) {
      setError(saveError.message);
    }
  };

  const saveSlug = async (event) => {
    event.preventDefault();
    setMessage("");
    setError("");
    setChangingSlug(true);

    try {
      const result = await request("/tenant/me/slug", {
        method: "PUT",
        body: JSON.stringify({ slug: normalizeSlugInput(slugDraft) }),
      });
      syncTenant(result.data.tenant);
      setSlugDraft(result.data.tenant.slug || "");
      setMessage(result.message);
    } catch (saveError) {
      setError(saveError.message);
    } finally {
      setChangingSlug(false);
    }
  };

  const uploadAsset = async (event, fieldName, endpoint, successMessage) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const assetKey = fieldName === "logo" ? "logo" : "cover";
    const preview = URL.createObjectURL(file);
    setSelectedFiles((current) => ({
      ...current,
      [assetKey]: { name: file.name, preview },
    }));
    setUploading((current) => ({ ...current, [assetKey]: true }));
    setMessage("");
    setError("");

    const payload = new FormData();
    payload.append(fieldName, file);

    try {
      const result = await request(endpoint, {
        method: "POST",
        body: payload,
      });
      syncTenant(result.data.tenant);
      setMessage(successMessage);
    } catch (uploadError) {
      setError(uploadError.message);
    } finally {
      setUploading((current) => ({ ...current, [assetKey]: false }));
    }
  };

  const selectedTheme = themeOptions.find((theme) => theme.id === form.theme);

  return (
    <div className="space-y-6">
      <section className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#0f2f73] via-[#2563eb] to-[#78a9ff] p-6 text-white shadow-soft sm:p-8">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.16),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(8,30,73,0.24),transparent_30%)]" />
          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <p className="text-sm uppercase tracking-[0.35em] text-blue-100">Kontrol Merkezi</p>
              <h1 className="mt-4 font-display text-4xl font-extrabold tracking-tight sm:text-5xl">
                {tenant?.businessName || "İşletmeniz"}
              </h1>
              <p className="mt-3 max-w-xl text-sm text-white/80 sm:text-base">
                {tenant?.tagline || "Restoranınızın dijital menüsü için tema, sosyal medya ve vitrin alanlarını yönetin."}
              </p>
              {publicMenuUrl ? (
                <a
                  href={publicMenuUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-white/90 underline decoration-white/30 underline-offset-4 hover:text-white"
                >
                  Menü kısayolu: {publicMenuUrl.replace(/^https?:\/\//, "")}
                </a>
              ) : null}
            </div>

            <div className="flex items-center gap-4">
              {logoUrl ? (
                <img src={logoUrl} alt={tenant?.businessName || "Logo"} className="h-20 w-20 rounded-[1.75rem] object-cover shadow-soft" />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-[1.75rem] bg-white/15 text-2xl font-bold">
                  {tenant?.businessName?.slice(0, 1) || "Q"}
                </div>
              )}
              <div className="min-w-[152px] rounded-[1.5rem] border border-white/15 bg-white/10 px-4 py-3 backdrop-blur">
                <p className="text-xs uppercase tracking-[0.3em] text-white/70">Aktif Tema</p>
                <p className="mt-2 break-words text-base font-semibold leading-tight sm:text-lg">{selectedTheme?.name || "Showcase"}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="glass-panel p-6 shadow-soft">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm text-slate-500">Toplam Menü Görüntülenmesi</p>
              <p className="mt-3 font-display text-5xl font-extrabold text-ink">{stats.menuViewCount}</p>
              <p className="mt-2 text-sm text-slate-500">Public menü her açıldığında bu sayaç bir artar.</p>
            </div>
            <div className="rounded-2xl bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700">Son 7 gün</div>
          </div>
          <TrendBars trend={stats.menuViewTrend.length ? stats.menuViewTrend : [{ day: "00.00", count: 0 }]} />
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="glass-panel p-6 shadow-soft">
          <p className="text-sm text-slate-500">Kategori sayısı</p>
          <p className="mt-3 font-display text-5xl font-extrabold text-ink">{stats.categoryCount}</p>
        </div>
        <div className="glass-panel p-6 shadow-soft">
          <p className="text-sm text-slate-500">Ürün sayısı</p>
          <p className="mt-3 font-display text-5xl font-extrabold text-ink">{stats.menuItemCount}</p>
        </div>
        <div className="glass-panel overflow-hidden p-0 shadow-soft">
          <div className="p-6">
            <p className="text-sm text-slate-500">Görsel durum</p>
            <p className="mt-3 text-lg font-semibold text-ink">{coverUrl ? "Kapak hazır" : "Kapak yüklenmedi"}</p>
            <p className="mt-2 text-sm text-slate-500">Public menu deneyimini kapak görseliyle güçlendirebilirsin.</p>
          </div>
          {coverUrl ? <img src={coverUrl} alt="Kapak görseli" className="h-36 w-full object-cover" /> : null}
        </div>
      </section>

      <section className="glass-panel p-6 shadow-soft">
        <div className="flex flex-col gap-2">
          <h2 className="font-display text-3xl font-extrabold text-ink">Subdomain Ayarı</h2>
          <p className="text-sm text-slate-600">
            Marka adını değiştirsen bile sadece subdomaini yenileyebilirsin. Kategoriler, ürünler ve görseller aynı kalır.
          </p>
        </div>

        <form onSubmit={saveSlug} className="mt-6 grid gap-4 lg:grid-cols-[1fr_auto]">
          <div className="space-y-3">
            <label className="block">
              <span className="mb-2 block text-sm font-semibold text-slate-700">Yeni subdomain</span>
              <div className="flex overflow-hidden rounded-2xl border border-blue-100 bg-white">
                <input
                  type="text"
                  value={slugDraft}
                  onChange={(event) => setSlugDraft(sanitizeSlugDraft(event.target.value))}
                  placeholder="ornekisletme"
                  className="min-w-0 flex-1 px-4 py-3 outline-none"
                />
                <div className="flex items-center border-l border-blue-100 bg-slate-50 px-4 text-sm text-slate-500">
                  .{ROOT_DOMAIN || "jokerqrmenu.com"}
                </div>
              </div>
            </label>
            <p className="text-sm text-slate-500">
              Yeni adres önizlemesi: <span className="font-semibold text-slate-700">{slugPreview}</span>
            </p>
            <p className="text-xs text-slate-500">
              Yazarken <code>.</code>, <code>_</code> ve <code>-</code> kullanabilirsin. Kayıt anında <code>.</code> ve <code>_</code> otomatik olarak <code>-</code> formatına çevrilir.
            </p>
            <div className="rounded-2xl bg-amber-50 px-4 py-3 text-sm leading-6 text-amber-900">
              Subdomain değiştiğinde eski QR kodlar ve eski menü linkleri çalışmaz. Yeni QR kodunu tekrar üretmen gerekir.
            </div>
          </div>

          <button
            type="submit"
            disabled={changingSlug || !slugDraft || slugDraft === tenant?.slug}
            className="rounded-[1.5rem] bg-[#173b8f] px-5 py-4 text-sm font-semibold text-white transition hover:bg-[#102c6e] disabled:cursor-not-allowed disabled:bg-slate-300 lg:self-start"
          >
            {changingSlug ? "Güncelleniyor..." : "Subdomaini Değiştir"}
          </button>
        </form>
      </section>

      <form onSubmit={saveProfile} className="space-y-6">
        <section className="glass-panel p-6 shadow-soft">
          <div className="flex flex-col gap-2">
            <h2 className="font-display text-3xl font-extrabold text-ink">Temel Bilgiler</h2>
            <p className="text-sm text-slate-600">Başlık, açıklama, renk ve iletişim bilgileri menünün üst alanında kullanılır.</p>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <input
              type="text"
              value={form.businessName}
              onChange={(event) => setForm({ ...form, businessName: event.target.value })}
              placeholder="İşletme adı"
              className="rounded-2xl border border-blue-100 bg-white px-4 py-3 outline-none focus:border-blue-400"
            />
            <input
              type="text"
              value={form.phone}
              onChange={(event) => setForm({ ...form, phone: event.target.value })}
              placeholder="Telefon"
              className="rounded-2xl border border-blue-100 bg-white px-4 py-3 outline-none focus:border-blue-400"
            />
            <textarea
              value={form.tagline}
              onChange={(event) => setForm({ ...form, tagline: event.target.value })}
              placeholder="Kısa slogan veya açıklama"
              className="min-h-24 rounded-2xl border border-blue-100 bg-white px-4 py-3 outline-none focus:border-blue-400 md:col-span-2"
            />
            <textarea
              value={form.address}
              onChange={(event) => setForm({ ...form, address: event.target.value })}
              placeholder="Adres"
              className="min-h-28 rounded-2xl border border-blue-100 bg-white px-4 py-3 outline-none focus:border-blue-400 md:col-span-2"
            />
            <label className="flex items-center gap-3 rounded-2xl border border-blue-100 bg-white px-4 py-3">
              <span className="text-sm text-slate-600">Ana renk</span>
              <input
                type="color"
                value={form.primaryColor}
                onChange={(event) => setForm({ ...form, primaryColor: event.target.value })}
                className="h-10 w-14 cursor-pointer rounded border-0 bg-transparent"
              />
            </label>
            <label className="flex items-center gap-3 rounded-2xl border border-blue-100 bg-white px-4 py-3 text-sm md:col-span-1">
              <input
                type="checkbox"
                checked={form.logoEffectEnabled}
                onChange={(event) => setForm({ ...form, logoEffectEnabled: event.target.checked })}
              />
              Logo 3 boyutlu efekt kullan
            </label>
            <select
              value={form.logoSize}
              onChange={(event) => setForm({ ...form, logoSize: event.target.value })}
              className="rounded-2xl border border-blue-100 bg-white px-4 py-3 text-sm outline-none focus:border-blue-400"
            >
              <option value="sm">Logo boyutu: Küçük</option>
              <option value="md">Logo boyutu: Orta</option>
              <option value="lg">Logo boyutu: Büyük</option>
            </select>

            <div className="grid gap-4 md:col-span-2 sm:grid-cols-2">
              <div className="rounded-[1.5rem] border border-blue-100 bg-white p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900">Logo</p>
                    <p className="mt-1 truncate text-xs text-slate-500">
                      {selectedFiles.logo.name || (logoUrl ? "Mevcut logo yüklü" : "Henüz logo seçilmedi")}
                    </p>
                  </div>
                  <label className="cursor-pointer rounded-2xl bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-100">
                    {uploading.logo ? "Yükleniyor..." : "Logo Seç"}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(event) => uploadAsset(event, "logo", "/tenant/me/logo", "Logo güncellendi.")}
                      className="hidden"
                    />
                  </label>
                </div>
                <div className="mt-4 overflow-hidden rounded-[1.25rem] border border-slate-100 bg-slate-50">
                  {logoUrl ? (
                    <img src={logoUrl} alt="Logo önizleme" className="h-40 w-full object-cover" />
                  ) : (
                    <div className="flex h-40 items-center justify-center text-sm text-slate-400">Logo önizlemesi burada görünür</div>
                  )}
                </div>
              </div>

              <div className="rounded-[1.5rem] border border-blue-100 bg-white p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900">Kapak Görseli</p>
                    <p className="mt-1 truncate text-xs text-slate-500">
                      {selectedFiles.cover.name || (coverUrl ? "Mevcut kapak yüklü" : "Henüz kapak seçilmedi")}
                    </p>
                  </div>
                  <label className="cursor-pointer rounded-2xl bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-100">
                    {uploading.cover ? "Yükleniyor..." : "Kapak Seç"}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(event) => uploadAsset(event, "cover", "/tenant/me/cover", "Kapak görseli güncellendi.")}
                      className="hidden"
                    />
                  </label>
                </div>
                <div className="mt-4 overflow-hidden rounded-[1.25rem] border border-slate-100 bg-slate-50">
                  {coverUrl ? (
                    <img src={coverUrl} alt="Kapak önizleme" className="h-40 w-full object-cover" />
                  ) : (
                    <div className="flex h-40 items-center justify-center text-sm text-slate-400">Kapak önizlemesi burada görünür</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="glass-panel p-6 shadow-soft">
          <div className="flex flex-col gap-2">
            <h2 className="font-display text-3xl font-extrabold text-ink">Tema Seçimi</h2>
            <p className="text-sm text-slate-600">Restoranın menüyü hangi sunum diliyle göstereceğini seç.</p>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            {themeOptions.map((theme) => {
              const isActive = form.theme === theme.id;
              return (
                <button
                  key={theme.id}
                  type="button"
                  onClick={() => setForm({ ...form, theme: theme.id })}
                  className={`rounded-[1.75rem] border p-5 text-left transition ${
                    isActive
                      ? "border-blue-500 bg-blue-50 shadow-soft"
                      : "border-slate-200 bg-white hover:border-blue-200 hover:bg-blue-50/50"
                  }`}
                >
                  <div
                    className={`rounded-[1.35rem] p-4 ${
                      theme.id === "showcase"
                        ? "bg-gradient-to-br from-[#0f2f73] via-[#2563eb] to-[#78a9ff] text-white"
                        : theme.id === "minimal"
                          ? "bg-slate-100 text-slate-800"
                          : "bg-[#111827] text-white"
                    }`}
                  >
                    <div className="text-xs uppercase tracking-[0.3em] opacity-75">Tema</div>
                    <div className="mt-3 font-display text-2xl font-extrabold">{theme.name}</div>
                    <div className="mt-4 grid gap-2">
                      <div className="h-16 rounded-2xl bg-white/20" />
                      <div className="grid grid-cols-3 gap-2">
                        <div className="h-10 rounded-xl bg-white/20" />
                        <div className="h-10 rounded-xl bg-white/20" />
                        <div className="h-10 rounded-xl bg-white/20" />
                      </div>
                    </div>
                  </div>
                  <p className="mt-4 text-sm leading-6 text-slate-600">{theme.description}</p>
                </button>
              );
            })}
          </div>
        </section>

        <section className="glass-panel p-6 shadow-soft">
          <div className="flex flex-col gap-2">
            <h2 className="font-display text-3xl font-extrabold text-ink">Sosyal Medya ve Linkler</h2>
            <p className="text-sm text-slate-600">Üst alanda ikon olarak gösterilir. Boş bırakılan alanlar gösterilmez.</p>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            {socialFields.map((field) => (
              <input
                key={field.key}
                type="url"
                value={form.socialLinks[field.key]}
                onChange={(event) =>
                  setForm({
                    ...form,
                    socialLinks: {
                      ...form.socialLinks,
                      [field.key]: event.target.value,
                    },
                  })
                }
                placeholder={field.placeholder}
                className="rounded-2xl border border-blue-100 bg-white px-4 py-3 outline-none focus:border-blue-400"
              />
            ))}
          </div>
        </section>

        {(message || error) && (
          <section className="glass-panel p-4 shadow-soft">
            <p className={`text-sm ${error ? "text-red-600" : "text-green-700"}`}>{error || message}</p>
          </section>
        )}

        <button
          type="submit"
          className="w-full rounded-[1.5rem] bg-[#173b8f] px-4 py-4 text-sm font-semibold text-white transition hover:bg-[#102c6e]"
        >
          Tüm Ayarları Kaydet
        </button>
      </form>
    </div>
  );
}
