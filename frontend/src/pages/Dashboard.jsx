import { useEffect, useState } from "react";
import { request } from "../lib/api";

const initialForm = {
  businessName: "",
  phone: "",
  address: "",
  primaryColor: "#2563eb",
};

export default function Dashboard() {
  const [tenant, setTenant] = useState(null);
  const [stats, setStats] = useState({ categoryCount: 0, menuItemCount: 0 });
  const [form, setForm] = useState(initialForm);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadProfile = async () => {
    try {
      const result = await request("/tenant/me");
      setTenant(result.data.tenant);
      setStats(result.data.stats);
        setForm({
          businessName: result.data.tenant.businessName || "",
          phone: result.data.tenant.phone || "",
          address: result.data.tenant.address || "",
          primaryColor: result.data.tenant.primaryColor || "#2563eb",
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
      setTenant(result.data.tenant);
      localStorage.setItem("qrmenu_tenant", JSON.stringify(result.data.tenant));
      setMessage("Bilgiler guncellendi.");
    } catch (saveError) {
      setError(saveError.message);
    }
  };

  const uploadLogo = async (event) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const payload = new FormData();
    payload.append("logo", file);

    try {
      const result = await request("/tenant/me/logo", {
        method: "POST",
        body: payload,
      });
      setTenant(result.data.tenant);
      localStorage.setItem("qrmenu_tenant", JSON.stringify(result.data.tenant));
      setMessage("Logo guncellendi.");
    } catch (uploadError) {
      setError(uploadError.message);
    }
  };

  return (
    <div className="space-y-6">
      <section className="rounded-[2rem] bg-gradient-to-br from-[#173b8f] via-[#2563eb] to-[#5b8cff] p-6 text-white shadow-soft sm:p-8">
        <p className="text-sm uppercase tracking-[0.35em] text-blue-100">Kontrol Merkezi</p>
        <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-4xl">{tenant?.businessName || "Isletmeniz"}</h1>
            <p className="mt-2 text-sm text-white/75">Slug: /menu/{tenant?.slug || "hazirlaniyor"}</p>
          </div>
          {tenant?.logoUrl ? (
            <img src={tenant.logoUrl} alt={tenant.businessName} className="h-20 w-20 rounded-3xl object-cover" />
          ) : (
            <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-white/10 text-2xl font-bold">
              {tenant?.businessName?.slice(0, 1) || "Q"}
            </div>
          )}
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <div className="glass-panel p-6 shadow-soft">
          <p className="text-sm text-slate-500">Kategori sayisi</p>
          <p className="mt-3 font-display text-5xl text-ink">{stats.categoryCount}</p>
        </div>
        <div className="glass-panel p-6 shadow-soft">
          <p className="text-sm text-slate-500">Urun sayisi</p>
          <p className="mt-3 font-display text-5xl text-ink">{stats.menuItemCount}</p>
        </div>
      </section>

      <section className="glass-panel p-6 shadow-soft">
        <h2 className="font-display text-3xl text-ink">Isletme Bilgileri</h2>
        <form onSubmit={saveProfile} className="mt-6 grid gap-4 md:grid-cols-2">
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
            value={form.address}
            onChange={(event) => setForm({ ...form, address: event.target.value })}
            placeholder="Adres"
            className="min-h-28 rounded-2xl border border-blue-100 bg-white px-4 py-3 outline-none focus:border-blue-400 md:col-span-2"
          />
          <label className="flex items-center gap-3 rounded-2xl border border-blue-100 bg-white px-4 py-3">
            <span className="text-sm text-slate-600">Tema rengi</span>
            <input
              type="color"
              value={form.primaryColor}
              onChange={(event) => setForm({ ...form, primaryColor: event.target.value })}
              className="h-10 w-14 cursor-pointer rounded border-0 bg-transparent"
            />
          </label>
          <label className="flex cursor-pointer items-center justify-center rounded-2xl border border-dashed border-blue-200 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-blue-50">
            Logo Yukle
            <input type="file" accept="image/*" onChange={uploadLogo} className="hidden" />
          </label>

          {(message || error) && (
            <p className={`text-sm md:col-span-2 ${error ? "text-red-600" : "text-green-700"}`}>{error || message}</p>
          )}

          <button
            type="submit"
            className="rounded-2xl bg-[#2563eb] px-4 py-3 font-semibold text-white transition hover:bg-[#1d4ed8] md:col-span-2"
          >
            Degisiklikleri Kaydet
          </button>
        </form>
      </section>
    </div>
  );
}
