import { useEffect, useMemo, useState } from "react";
import { adminRequest, clearAdminToken } from "../lib/admin";

function formatDate(value) {
  if (!value) {
    return "-";
  }

  return new Date(value).toLocaleDateString("tr-TR");
}

export default function AdminPanel({ onLogout }) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [savingId, setSavingId] = useState("");

  const loadOverview = async () => {
    setLoading(true);
    setError("");

    try {
      const result = await adminRequest("/admin/overview");
      setData(result.data);
    } catch (loadError) {
      if (/admin oturumu|admin giri/i.test(loadError.message)) {
        clearAdminToken();
        onLogout?.();
        return;
      }

      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOverview();
  }, []);

  const cards = useMemo(() => {
    const stats = data?.stats || {};

    return [
      { label: "Toplam QR Menü", value: stats.tenantCount || 0 },
      { label: "Aktif İşletme", value: stats.activeTenantCount || 0 },
      { label: "Toplam Kategori", value: stats.totalCategoryCount || 0 },
      { label: "Toplam Ürün", value: stats.totalMenuItemCount || 0 },
      { label: "Toplam Menü Görüntülenmesi", value: stats.totalMenuViewCount || 0 },
    ];
  }, [data]);

  const toggleTenant = async (tenantId, isActive) => {
    setSavingId(tenantId);
    setError("");

    try {
      await adminRequest(`/admin/tenants/${tenantId}/status`, {
        method: "PUT",
        body: JSON.stringify({ isActive: !isActive }),
      });
      await loadOverview();
    } catch (toggleError) {
      setError(toggleError.message);
    } finally {
      setSavingId("");
    }
  };

  return (
    <div className="min-h-screen px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex flex-col gap-4 rounded-[2rem] bg-gradient-to-br from-[#173b8f] via-[#2563eb] to-[#5b8cff] p-6 text-white shadow-soft sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-white/75">Admin Kontrol Merkezi</p>
            <h1 className="mt-3 font-display text-4xl">JokerQRMenu Yönetimi</h1>
            <p className="mt-3 max-w-2xl text-sm text-white/80">
              Tüm işletmeleri, subdomainlerini, kategori ve ürün sayılarını tek ekranda izleyebilirsin.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              clearAdminToken();
              onLogout?.();
            }}
            className="rounded-2xl border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/20"
          >
            Çıkış yap
          </button>
        </div>

        {error ? <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</div> : null}

        <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
          {cards.map((card) => (
            <div key={card.label} className="glass-panel border-blue-100/80 p-5 shadow-soft">
              <p className="text-sm text-slate-500">{card.label}</p>
              <p className="mt-3 text-4xl font-display text-ink">{card.value}</p>
            </div>
          ))}
        </div>

        <div className="glass-panel overflow-hidden border-blue-100/80 shadow-soft">
          <div className="border-b border-blue-100 px-5 py-4">
            <h2 className="font-display text-2xl text-ink">İşletme Listesi</h2>
          </div>

          {loading ? (
            <div className="px-5 py-8 text-sm text-slate-500">Panel verileri yükleniyor...</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500">
                  <tr>
                    <th className="px-5 py-4 font-medium">İşletme</th>
                    <th className="px-5 py-4 font-medium">Subdomain</th>
                    <th className="px-5 py-4 font-medium">Kategori</th>
                    <th className="px-5 py-4 font-medium">Ürün</th>
                    <th className="px-5 py-4 font-medium">Görüntülenme</th>
                    <th className="px-5 py-4 font-medium">Durum</th>
                    <th className="px-5 py-4 font-medium">Kayıt</th>
                    <th className="px-5 py-4 font-medium">İşlem</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-blue-50">
                  {(data?.tenants || []).map((tenant) => (
                    <tr key={tenant._id} className="align-top">
                      <td className="px-5 py-4">
                        <div className="font-semibold text-ink">{tenant.businessName}</div>
                        <div className="mt-1 text-xs text-slate-500">{tenant.email}</div>
                      </td>
                      <td className="px-5 py-4">
                        <a
                          href={tenant.publicUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="font-medium text-[#2563eb] hover:text-[#1d4ed8]"
                        >
                          {tenant.slug}.jokerqrmenu.com
                        </a>
                      </td>
                      <td className="px-5 py-4 font-semibold text-ink">{tenant.categoryCount}</td>
                      <td className="px-5 py-4 font-semibold text-ink">{tenant.menuItemCount}</td>
                      <td className="px-5 py-4 font-semibold text-ink">{tenant.menuViewCount}</td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                            tenant.isActive ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
                          }`}
                        >
                          {tenant.isActive ? "Aktif" : "Pasif"}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-slate-600">{formatDate(tenant.createdAt)}</td>
                      <td className="px-5 py-4">
                        <button
                          type="button"
                          disabled={savingId === tenant._id}
                          onClick={() => toggleTenant(tenant._id, tenant.isActive)}
                          className={`rounded-xl px-4 py-2 text-xs font-semibold transition ${
                            tenant.isActive
                              ? "bg-red-50 text-red-700 hover:bg-red-100"
                              : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                          } disabled:opacity-60`}
                        >
                          {savingId === tenant._id ? "Kaydediliyor..." : tenant.isActive ? "Pasife al" : "Aktife al"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
