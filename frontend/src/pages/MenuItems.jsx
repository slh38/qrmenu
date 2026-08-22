import { useDeferredValue, useEffect, useRef, useState } from "react";
import { request } from "../lib/api";

const initialForm = {
  categoryId: "",
  name: "",
  description: "",
  price: "",
  currency: "TRY",
  isAvailable: true,
  order: 0,
};

const normalizeSearchText = (value = "") =>
  value
    .toLocaleLowerCase("tr-TR")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/ı/g, "i");

export default function MenuItems() {
  const [categories, setCategories] = useState([]);
  const [items, setItems] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [form, setForm] = useState(initialForm);
  const [image, setImage] = useState(null);
  const [editingId, setEditingId] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState("");
  const formSectionRef = useRef(null);
  const deferredSearchTerm = useDeferredValue(searchTerm);

  const normalizedSearchTerm = normalizeSearchText(deferredSearchTerm.trim());
  const filteredItems = normalizedSearchTerm
    ? items.filter((item) =>
        [item.name, item.description, item.categoryId?.name]
          .map(normalizeSearchText)
          .some((value) => value.includes(normalizedSearchTerm))
      )
    : items;

  const loadCategories = async () => {
    const result = await request("/categories");
    setCategories(result.data.categories);
    if (!form.categoryId && result.data.categories[0]) {
      setForm((current) => ({ ...current, categoryId: result.data.categories[0]._id }));
    }
  };

  const loadItems = async (categoryId = selectedCategory) => {
    const query = categoryId ? `?categoryId=${categoryId}` : "";
    const result = await request(`/menu-items${query}`);
    setItems(result.data.items);
  };

  useEffect(() => {
    (async () => {
      try {
        await loadCategories();
        await loadItems();
      } catch (loadError) {
        setError(loadError.message);
      }
    })();
  }, []);

  useEffect(() => {
    loadItems().catch((loadError) => setError(loadError.message));
  }, [selectedCategory]);

  const resetForm = () => {
    setForm({
      ...initialForm,
      categoryId: categories[0]?._id || "",
    });
    setImage(null);
    setEditingId("");
  };

  const submitForm = async (event) => {
    event.preventDefault();
    setError("");

    const payload = new FormData();
    Object.entries(form).forEach(([key, value]) => payload.append(key, value));
    if (image) {
      payload.append("image", image);
    }

    try {
      if (editingId) {
        await request(`/menu-items/${editingId}`, {
          method: "PUT",
          body: payload,
        });
      } else {
        await request("/menu-items", {
          method: "POST",
          body: payload,
        });
      }

      resetForm();
      loadItems();
    } catch (submitError) {
      setError(submitError.message);
    }
  };

  const startEdit = (item) => {
    setEditingId(item._id);
    setForm({
      categoryId: item.categoryId?._id || item.categoryId,
      name: item.name,
      description: item.description || "",
      price: item.price,
      currency: item.currency || "TRY",
      isAvailable: item.isAvailable,
      order: item.order || 0,
    });
    setImage(null);
    window.requestAnimationFrame(() => {
      formSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  };

  const deleteItem = async (id) => {
    if (!window.confirm("Bu urun silinsin mi?")) {
      return;
    }

    try {
      await request(`/menu-items/${id}`, { method: "DELETE" });
      loadItems();
    } catch (deleteError) {
      setError(deleteError.message);
    }
  };

  const toggleAvailability = async (item) => {
    try {
      await request(`/menu-items/${item._id}`, {
        method: "PUT",
        body: (() => {
          const payload = new FormData();
          payload.append("isAvailable", String(!item.isAvailable));
          return payload;
        })(),
      });
      loadItems();
    } catch (toggleError) {
      setError(toggleError.message);
    }
  };

  return (
    <div className="space-y-6">
      <section ref={formSectionRef} className="glass-panel scroll-mt-24 p-6 shadow-soft">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-display text-3xl text-ink">Menu Urunleri</h1>
            <p className="mt-2 text-sm text-slate-600">Kategoriye gore filtrele, fiyat ve gorunurluk ayarla.</p>
          </div>
          <select
            value={selectedCategory}
            onChange={(event) => setSelectedCategory(event.target.value)}
            className="rounded-2xl border border-blue-100 bg-white px-4 py-3 outline-none"
          >
            <option value="">Tum kategoriler</option>
            {categories.map((category) => (
              <option key={category._id} value={category._id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <form onSubmit={submitForm} className="mt-6 grid gap-4 md:grid-cols-2">
          <select
            value={form.categoryId}
            onChange={(event) => setForm({ ...form, categoryId: event.target.value })}
            className="rounded-2xl border border-blue-100 bg-white px-4 py-3 outline-none"
            required
          >
            <option value="">Kategori sec</option>
            {categories.map((category) => (
              <option key={category._id} value={category._id}>
                {category.name}
              </option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Urun adi"
            value={form.name}
            onChange={(event) => setForm({ ...form, name: event.target.value })}
            className="rounded-2xl border border-blue-100 bg-white px-4 py-3 outline-none"
            required
          />
          <textarea
            placeholder="Aciklama"
            value={form.description}
            onChange={(event) => setForm({ ...form, description: event.target.value })}
            className="min-h-24 rounded-2xl border border-blue-100 bg-white px-4 py-3 outline-none md:col-span-2"
          />
          <input
            type="number"
            step="0.01"
            placeholder="Fiyat"
            value={form.price}
            onChange={(event) => setForm({ ...form, price: event.target.value })}
            className="rounded-2xl border border-blue-100 bg-white px-4 py-3 outline-none"
            required
          />
          <input
            type="number"
            placeholder="Sira"
            value={form.order}
            onChange={(event) => setForm({ ...form, order: event.target.value })}
            className="rounded-2xl border border-blue-100 bg-white px-4 py-3 outline-none"
          />
          <label className="flex items-center gap-3 rounded-2xl border border-blue-100 bg-white px-4 py-3 text-sm">
            <input
              type="checkbox"
              checked={form.isAvailable}
              onChange={(event) => setForm({ ...form, isAvailable: event.target.checked })}
            />
            Urun stokta
          </label>
          <label className="flex cursor-pointer items-center justify-center rounded-2xl border border-dashed border-blue-200 px-4 py-3 text-sm font-medium text-slate-700">
            Gorsel Yukle
            <input type="file" accept="image/*" onChange={(event) => setImage(event.target.files?.[0] || null)} className="hidden" />
          </label>

          {error ? <p className="text-sm text-red-600 md:col-span-2">{error}</p> : null}

          <button type="submit" className="rounded-2xl bg-[#2563eb] px-4 py-3 font-semibold text-white md:col-span-2">
            {editingId ? "Urunu Guncelle" : "Urun Ekle"}
          </button>
          {editingId ? (
            <button
              type="button"
              onClick={resetForm}
              className="rounded-2xl border border-blue-200 px-4 py-3 font-semibold text-slate-700 md:col-span-2"
            >
              Vazgec
            </button>
          ) : null}
        </form>
      </section>

      <section className="glass-panel space-y-4 px-5 py-5 shadow-soft">
        <div className="flex items-center gap-3 rounded-2xl border border-blue-100 bg-white px-4 py-3 shadow-sm focus-within:border-blue-300 focus-within:ring-4 focus-within:ring-blue-50">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="h-5 w-5 shrink-0 text-blue-600"
            aria-hidden="true"
          >
            <circle cx="11" cy="11" r="7" />
            <path d="m20 20-4-4" />
          </svg>
          <input
            type="search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Ürün adı, açıklama veya kategori ara..."
            className="min-w-0 flex-1 bg-transparent text-base text-slate-800 outline-none placeholder:text-slate-400"
            aria-label="Ürün ara"
          />
          {searchTerm ? (
            <button
              type="button"
              onClick={() => setSearchTerm("")}
              className="rounded-xl px-3 py-1.5 text-sm font-semibold text-blue-700 transition hover:bg-blue-50"
            >
              Temizle
            </button>
          ) : null}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-semibold text-slate-800">
              {normalizedSearchTerm
                ? `“${deferredSearchTerm.trim()}” için ${filteredItems.length} ürün bulundu`
                : `${items.length} ürün listeleniyor`}
            </p>
            <p className="mt-1 text-sm text-slate-500">Sonuçlardan ürünü bulup Düzenle düğmesine basabilirsiniz.</p>
          </div>
          {normalizedSearchTerm ? (
            <button
              type="button"
              onClick={() => setSearchTerm("")}
              className="self-start rounded-2xl border border-blue-200 bg-white px-4 py-2 text-sm font-semibold text-blue-700 transition hover:bg-blue-50 sm:self-auto"
            >
              Tüm ürünleri göster
            </button>
          ) : null}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filteredItems.map((item) => (
          <article key={item._id} className="glass-panel overflow-hidden shadow-soft">
            {item.imageUrl ? (
              <img src={item.imageUrl} alt={item.name} className="h-44 w-full object-cover" />
            ) : (
              <div className="flex h-44 items-center justify-center bg-blue-50 text-slate-500">Gorsel yok</div>
            )}
            <div className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-display text-2xl text-ink">{item.name}</h2>
                  <p className="mt-1 text-xs uppercase tracking-[0.25em] text-slate-400">
                    {item.categoryId?.name || "Kategori"}
                  </p>
                </div>
                <p className="rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-slate-700">
                  {item.price} {item.currency}
                </p>
              </div>
              <p className="mt-3 text-sm text-slate-600">{item.description || "Aciklama yok"}</p>

              <div className="mt-5 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => toggleAvailability(item)}
                  className={`rounded-2xl px-4 py-2 text-sm font-semibold ${
                    item.isAvailable ? "bg-blue-100 text-blue-800" : "bg-slate-200 text-slate-700"
                  }`}
                >
                  {item.isAvailable ? "Satista" : "Gizli"}
                </button>
                <button
                  type="button"
                  onClick={() => startEdit(item)}
                  className="rounded-2xl border border-blue-200 px-4 py-2 text-sm font-semibold text-slate-700"
                >
                  Duzenle
                </button>
                <button
                  type="button"
                  onClick={() => deleteItem(item._id)}
                  className="rounded-2xl bg-red-50 px-4 py-2 text-sm font-semibold text-red-700"
                >
                  Sil
                </button>
              </div>
            </div>
          </article>
        ))}
        {filteredItems.length === 0 ? (
          <div className="glass-panel px-6 py-12 text-center shadow-soft md:col-span-2 xl:col-span-3">
            <p className="text-lg font-semibold text-slate-800">Aramanızla eşleşen ürün bulunamadı.</p>
            <p className="mt-2 text-sm text-slate-500">Farklı bir ürün adı veya kategori yazarak tekrar deneyin.</p>
          </div>
        ) : null}
      </section>
    </div>
  );
}
