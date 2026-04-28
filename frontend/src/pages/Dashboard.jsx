import { useEffect, useState } from "react";
import { request } from "../lib/api";
import { themeOptions } from "../lib/themeOptions";

const initialForm = {
  businessName: "",
  phone: "",
  address: "",
  primaryColor: "#2563eb",
  tagline: "",
  theme: "showcase",
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

export default function Dashboard() {
  const [tenant, setTenant] = useState(null);
  const [stats, setStats] = useState({ categoryCount: 0, menuItemCount: 0 });
  const [form, setForm] = useState(initialForm);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState({ logo: false, cover: false });
  const [selectedFiles, setSelectedFiles] = useState({
    logo: { name: "", preview: "" },
    cover: { name: "", preview: "" },
  });

  const syncTenant = (nextTenant) => {
    setTenant(nextTenant);
    localStorage.setItem("qrmenu_tenant", JSON.stringify(nextTenant));
  };

  const loadProfile = async () => {
    try {
      const result = await request("/tenant/me");
      const nextTenant = result.data.tenant;
      setTenant(nextTenant);
      setStats(result.data.stats);
      setForm({
        businessName: nextTenant.businessName || "",
        phone: nextTenant.phone || "",
        address: nextTenant.address || "",
        primaryColor: nextTenant.primaryColor || "#2563eb",
        tagline: nextTenant.tagline || "",
        theme: nextTenant.theme || "showcase",
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
      setMessage("Isletme ayarlari guncellendi.");
    } catch (saveError) {
      setError(saveError.message);
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
      <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-[#0f2f73] via-[#2563eb] to-[#78a9ff] p-6 text-white shadow-soft sm:p-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.16),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(8,30,73,0.24),transparent_30%)]" />
        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-sm uppercase tracking-[0.35em] text-blue-100">Kontrol Merkezi</p>
            <h1 className="mt-4 font-display text-4xl font-extrabold tracking-tight sm:text-5xl">
              {tenant?.businessName || "Isletmeniz"}
            </h1>
            <p className="mt-3 max-w-xl text-sm text-white/80 sm:text-base">
              {tenant?.tagline || "Restoraninizin dijital menusu icin tema, sosyal medya ve vitrin alanlarini yonetin."}
            </p>
            <p className="mt-4 text-sm text-white/70">Slug: /menu/{tenant?.slug || "hazirlaniyor"}</p>
          </div>

          <div className="flex items-center gap-4">
            {tenant?.logoUrl ? (
              <img src={tenant.logoUrl} alt={tenant.businessName} className="h-20 w-20 rounded-[1.75rem] object-cover shadow-soft" />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-[1.75rem] bg-white/15 text-2xl font-bold">
                {tenant?.businessName?.slice(0, 1) || "Q"}
              </div>
            )}
            <div className="rounded-[1.5rem] border border-white/15 bg-white/10 px-4 py-3 backdrop-blur">
              <p className="text-xs uppercase tracking-[0.3em] text-white/70">Aktif Tema</p>
              <p className="mt-2 text-lg font-semibold">{selectedTheme?.name || "Showcase"}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <div className="glass-panel p-6 shadow-soft">
          <p className="text-sm text-slate-500">Kategori sayisi</p>
          <p className="mt-3 font-display text-5xl font-extrabold text-ink">{stats.categoryCount}</p>
        </div>
        <div className="glass-panel p-6 shadow-soft">
          <p className="text-sm text-slate-500">Urun sayisi</p>
          <p className="mt-3 font-display text-5xl font-extrabold text-ink">{stats.menuItemCount}</p>
        </div>
        <div className="glass-panel p-6 shadow-soft">
          <p className="text-sm text-slate-500">Gorsel durum</p>
          <p className="mt-3 text-lg font-semibold text-ink">
            {tenant?.coverImageUrl ? "Kapak hazir" : "Kapak yuklenmedi"}
          </p>
          <p className="mt-2 text-sm text-slate-500">Public menu deneyimini kapak gorseliyle guclendirebilirsin.</p>
        </div>
      </section>

      <form onSubmit={saveProfile} className="space-y-6">
        <section className="glass-panel p-6 shadow-soft">
          <div className="flex flex-col gap-2">
            <h2 className="font-display text-3xl font-extrabold text-ink">Temel Bilgiler</h2>
            <p className="text-sm text-slate-600">Baslik, aciklama, renk ve iletisim bilgileri menunun ust alaninda kullanilir.</p>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <input
              type="text"
              value={form.businessName}
              onChange={(event) => setForm({ ...form, businessName: event.target.value })}
              placeholder="Isletme adi"
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
              placeholder="Kisa slogan veya aciklama"
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
            <div className="grid gap-4 md:col-span-2 sm:grid-cols-2">
              <div className="rounded-[1.5rem] border border-blue-100 bg-white p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900">Logo</p>
                    <p className="mt-1 truncate text-xs text-slate-500">
                      {selectedFiles.logo.name || (tenant?.logoUrl ? "Mevcut logo yuklu" : "Henuz logo secilmedi")}
                    </p>
                  </div>
                  <label className="cursor-pointer rounded-2xl bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-100">
                    {uploading.logo ? "Yukleniyor..." : "Logo Sec"}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(event) => uploadAsset(event, "logo", "/tenant/me/logo", "Logo guncellendi.")}
                      className="hidden"
                    />
                  </label>
                </div>
                <div className="mt-4 overflow-hidden rounded-[1.25rem] border border-slate-100 bg-slate-50">
                  {selectedFiles.logo.preview || tenant?.logoUrl ? (
                    <img src={selectedFiles.logo.preview || tenant.logoUrl} alt="Logo preview" className="h-40 w-full object-cover" />
                  ) : (
                    <div className="flex h-40 items-center justify-center text-sm text-slate-400">Logo onizlemesi burada gorunur</div>
                  )}
                </div>
              </div>

              <div className="rounded-[1.5rem] border border-blue-100 bg-white p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-900">Kapak Gorseli</p>
                    <p className="mt-1 truncate text-xs text-slate-500">
                      {selectedFiles.cover.name || (tenant?.coverImageUrl ? "Mevcut kapak yuklu" : "Henuz kapak secilmedi")}
                    </p>
                  </div>
                  <label className="cursor-pointer rounded-2xl bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-100">
                    {uploading.cover ? "Yukleniyor..." : "Kapak Sec"}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(event) => uploadAsset(event, "cover", "/tenant/me/cover", "Kapak gorseli guncellendi.")}
                      className="hidden"
                    />
                  </label>
                </div>
                <div className="mt-4 overflow-hidden rounded-[1.25rem] border border-slate-100 bg-slate-50">
                  {selectedFiles.cover.preview || tenant?.coverImageUrl ? (
                    <img
                      src={selectedFiles.cover.preview || tenant.coverImageUrl}
                      alt="Cover preview"
                      className="h-40 w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-40 items-center justify-center text-sm text-slate-400">Kapak onizlemesi burada gorunur</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="glass-panel p-6 shadow-soft">
          <div className="flex flex-col gap-2">
            <h2 className="font-display text-3xl font-extrabold text-ink">Tema Secimi</h2>
            <p className="text-sm text-slate-600">Restoranin menuyu hangi sunum diliyle gosterecegini sec.</p>
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
                  <div className={`rounded-[1.35rem] p-4 ${theme.id === "showcase" ? "bg-gradient-to-br from-[#0f2f73] via-[#2563eb] to-[#78a9ff] text-white" : theme.id === "minimal" ? "bg-slate-100 text-slate-800" : "bg-[#111827] text-white"}`}>
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
            <p className="text-sm text-slate-600">Ust alanda ikon olarak gosterilir. Bos birakilan alanlar gosterilmez.</p>
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
          Tum Ayarlari Kaydet
        </button>
      </form>
    </div>
  );
}
