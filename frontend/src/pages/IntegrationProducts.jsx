import { useDeferredValue, useEffect, useState } from "react";
import { request } from "../lib/api";

const normalizeSearchText = (value = "") =>
  value
    .toLocaleLowerCase("tr-TR")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ı/g, "i");

const formatDate = (value) =>
  value
    ? new Intl.DateTimeFormat("tr-TR", { dateStyle: "short", timeStyle: "short" }).format(new Date(value))
    : "Henüz senkronizasyon yapılmadı";

export default function IntegrationProducts() {
  const [settings, setSettings] = useState(null);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [targetCategoryId, setTargetCategoryId] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [sourceCategory, setSourceCategory] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [generatedKey, setGeneratedKey] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const deferredSearchTerm = useDeferredValue(searchTerm);

  const loadPage = async () => {
    setLoading(true);
    setError("");
    try {
      const [settingsResult, productsResult, categoriesResult] = await Promise.all([
        request("/integrations/gerapos/settings"),
        request("/integrations/gerapos/products"),
        request("/categories"),
      ]);
      setSettings(settingsResult.data);
      setProducts(productsResult.data.products);
      setCategories(categoriesResult.data.categories);
      setTargetCategoryId((current) => current || categoriesResult.data.categories[0]?._id || "");
    } catch (loadError) {
      setError(loadError.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPage();
  }, []);

  const availableSourceCategories = [...new Set(products.map((product) => product.sourceCategory).filter(Boolean))].sort(
    (left, right) => left.localeCompare(right, "tr-TR")
  );
  const normalizedSearchTerm = normalizeSearchText(deferredSearchTerm.trim());
  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      !normalizedSearchTerm ||
      [product.sourceName, product.sourceCategory, product.externalStockId]
        .map(normalizeSearchText)
        .some((value) => value.includes(normalizedSearchTerm));
    const matchesCategory = !sourceCategory || product.sourceCategory === sourceCategory;
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "available" && !product.menuItemId && product.sourceActive !== false) ||
      (statusFilter === "imported" && Boolean(product.menuItemId)) ||
      (statusFilter === "passive" && product.sourceActive === false);

    return matchesSearch && matchesCategory && matchesStatus;
  });
  const selectableProducts = filteredProducts.filter((product) => !product.menuItemId && product.sourceActive !== false);
  const allVisibleSelected =
    selectableProducts.length > 0 && selectableProducts.every((product) => selectedIds.includes(product._id));

  const toggleProduct = (productId) => {
    setSelectedIds((current) =>
      current.includes(productId) ? current.filter((id) => id !== productId) : [...current, productId]
    );
  };

  const toggleVisibleProducts = () => {
    const visibleIds = selectableProducts.map((product) => product._id);
    setSelectedIds((current) =>
      allVisibleSelected ? current.filter((id) => !visibleIds.includes(id)) : [...new Set([...current, ...visibleIds])]
    );
  };

  const generateKey = async () => {
    if (settings?.integration?.apiKeyLastFour && !window.confirm("Yeni anahtar eski entegrasyon anahtarını geçersiz kılar. Devam edilsin mi?")) {
      return;
    }

    setError("");
    setMessage("");
    try {
      const result = await request("/integrations/gerapos/key", { method: "POST", body: JSON.stringify({}) });
      setGeneratedKey(result.data.apiKey);
      setMessage("Anahtar oluşturuldu. Bu değer yalnızca şimdi gösterilir.");
      await loadPage();
    } catch (keyError) {
      setError(keyError.message);
    }
  };

  const importProducts = async () => {
    if (!selectedIds.length || !targetCategoryId) {
      setError("Önce ürünleri ve aktarılacak QR kategorisini seçin.");
      return;
    }

    setSubmitting(true);
    setError("");
    setMessage("");
    try {
      const result = await request("/integrations/gerapos/import", {
        method: "POST",
        body: JSON.stringify({ productIds: selectedIds, categoryId: targetCategoryId }),
      });
      setMessage(result.message);
      setSelectedIds([]);
      await loadPage();
    } catch (importError) {
      setError(importError.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <section className="glass-panel p-6 shadow-soft">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.25em] text-blue-600">GeraPOS Entegrasyonu</p>
            <h1 className="mt-2 font-display text-3xl text-ink">Adisyon Ürünleri</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
              Adisyondan gelen tüm ürünler burada tutulur. Yalnızca seçip aktardığınız ürünler QR menünüzde görünür.
            </p>
          </div>
          <button
            type="button"
            onClick={generateKey}
            className="rounded-2xl bg-[#173b8f] px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-800"
          >
            {settings?.integration?.apiKeyLastFour ? "Anahtarı Yenile" : "Entegrasyonu Etkinleştir"}
          </button>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl bg-blue-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Havuzdaki ürün</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">{settings?.totalProductCount || 0}</p>
          </div>
          <div className="rounded-2xl bg-emerald-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">QR'a aktarılan</p>
            <p className="mt-2 text-3xl font-bold text-slate-900">{settings?.importedProductCount || 0}</p>
          </div>
          <div className="rounded-2xl bg-slate-100 p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Son güncelleme</p>
            <p className="mt-2 text-sm font-semibold text-slate-800">{formatDate(settings?.integration?.lastSyncedAt)}</p>
          </div>
        </div>

        {settings?.integration?.apiKeyLastFour ? (
          <p className="mt-4 text-sm text-slate-500">Aktif entegrasyon anahtarı: ••••{settings.integration.apiKeyLastFour}</p>
        ) : null}
        {generatedKey ? (
          <div className="mt-4 rounded-2xl border border-amber-200 bg-amber-50 p-4">
            <p className="text-sm font-semibold text-amber-900">Bu anahtarı Windows uygulamasına kaydedin. Daha sonra tekrar gösterilmez.</p>
            <div className="mt-3 flex flex-col gap-2 sm:flex-row">
              <input value={generatedKey} readOnly className="min-w-0 flex-1 rounded-xl border border-amber-200 bg-white px-3 py-2 font-mono text-xs" />
              <button
                type="button"
                onClick={() => navigator.clipboard.writeText(generatedKey)}
                className="rounded-xl bg-amber-900 px-4 py-2 text-sm font-semibold text-white"
              >
                Kopyala
              </button>
            </div>
          </div>
        ) : null}
        {message ? <p className="mt-4 text-sm font-semibold text-emerald-700">{message}</p> : null}
        {error ? <p className="mt-4 text-sm font-semibold text-red-600">{error}</p> : null}
      </section>

      <section className="glass-panel p-5 shadow-soft">
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_220px_180px]">
          <input
            type="search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Ürün adı, stok ID veya kaynak kategori ara..."
            className="rounded-2xl border border-blue-100 bg-white px-4 py-3 outline-none focus:border-blue-300"
          />
          <select
            value={sourceCategory}
            onChange={(event) => setSourceCategory(event.target.value)}
            className="rounded-2xl border border-blue-100 bg-white px-4 py-3 outline-none"
          >
            <option value="">Tüm kaynak kategoriler</option>
            {availableSourceCategories.map((category) => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value)}
            className="rounded-2xl border border-blue-100 bg-white px-4 py-3 outline-none"
          >
            <option value="all">Tüm durumlar</option>
            <option value="available">Aktarılabilir</option>
            <option value="imported">QR'a aktarılan</option>
            <option value="passive">Pasif</option>
          </select>
        </div>

        <div className="mt-5 flex flex-col gap-3 border-t border-blue-100 pt-5 lg:flex-row lg:items-center lg:justify-between">
          <label className="flex items-center gap-3 text-sm font-semibold text-slate-700">
            <input type="checkbox" checked={allVisibleSelected} onChange={toggleVisibleProducts} />
            Görünen aktarılabilir ürünleri seç
          </label>
          <div className="flex flex-col gap-3 sm:flex-row">
            <select
              value={targetCategoryId}
              onChange={(event) => setTargetCategoryId(event.target.value)}
              className="rounded-2xl border border-blue-200 bg-white px-4 py-3 text-sm outline-none"
            >
              <option value="">QR kategorisi seçin</option>
              {categories.map((category) => (
                <option key={category._id} value={category._id}>{category.name}</option>
              ))}
            </select>
            <button
              type="button"
              onClick={importProducts}
              disabled={!selectedIds.length || !targetCategoryId || submitting}
              className="rounded-2xl bg-[#2563eb] px-5 py-3 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
            >
              {submitting ? "Aktarılıyor..." : `Seçilenleri QR'a Aktar (${selectedIds.length})`}
            </button>
          </div>
        </div>
      </section>

      <section className="glass-panel overflow-hidden shadow-soft">
        <div className="border-b border-blue-100 px-5 py-4">
          <p className="font-semibold text-slate-800">{filteredProducts.length} ürün gösteriliyor</p>
        </div>
        {loading ? <p className="p-8 text-center text-slate-500">Ürünler yükleniyor...</p> : null}
        {!loading && !filteredProducts.length ? (
          <div className="p-10 text-center">
            <p className="font-semibold text-slate-800">Adisyon ürünü bulunamadı.</p>
            <p className="mt-2 text-sm text-slate-500">İlk senkronizasyondan sonra SQL ürünleri burada listelenecek.</p>
          </div>
        ) : null}
        <div className="divide-y divide-blue-50">
          {filteredProducts.map((product) => {
            const imported = Boolean(product.menuItemId);
            const passive = product.sourceActive === false;
            return (
              <article key={product._id} className="grid gap-3 px-5 py-4 md:grid-cols-[32px_minmax(0,1.5fr)_minmax(0,1fr)_120px_150px] md:items-center">
                <input
                  type="checkbox"
                  checked={selectedIds.includes(product._id)}
                  disabled={imported || passive}
                  onChange={() => toggleProduct(product._id)}
                  aria-label={`${product.sourceName} ürününü seç`}
                />
                <div>
                  <p className="font-semibold text-slate-900">{product.sourceName}</p>
                  <p className="mt-1 text-xs text-slate-400">Stok ID: {product.externalStockId}</p>
                </div>
                <p className="text-sm text-slate-600">{product.sourceCategory || "Kategori yok"}</p>
                <p className="font-semibold text-slate-900">{product.sourcePrice.toLocaleString("tr-TR", { minimumFractionDigits: 2 })} TL</p>
                <div>
                  {imported ? (
                    <span className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold text-emerald-800">
                      QR'da: {product.menuItemId.categoryId?.name || "Kategori"}
                    </span>
                  ) : passive ? (
                    <span className="inline-flex rounded-full bg-red-100 px-3 py-1 text-xs font-bold text-red-700">Adisyonda pasif</span>
                  ) : (
                    <span className="inline-flex rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-800">Aktarılabilir</span>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </div>
  );
}
