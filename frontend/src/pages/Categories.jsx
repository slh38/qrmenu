import { useEffect, useState } from "react";
import { request } from "../lib/api";

const initialForm = {
  name: "",
  description: "",
  order: 0,
  isActive: true,
};

export default function Categories() {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState("");
  const [error, setError] = useState("");
  const [uploadingId, setUploadingId] = useState("");
  const [selectedPreview, setSelectedPreview] = useState({ categoryId: "", name: "", preview: "" });

  const loadCategories = async () => {
    try {
      const result = await request("/categories");
      setCategories(result.data.categories);
    } catch (loadError) {
      setError(loadError.message);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const submitForm = async (event) => {
    event.preventDefault();
    setError("");

    try {
      if (editingId) {
        await request(`/categories/${editingId}`, {
          method: "PUT",
          body: JSON.stringify(form),
        });
      } else {
        await request("/categories", {
          method: "POST",
          body: JSON.stringify(form),
        });
      }

      setForm(initialForm);
      setEditingId("");
      loadCategories();
    } catch (submitError) {
      setError(submitError.message);
    }
  };

  const startEdit = (category) => {
    setEditingId(category._id);
    setForm({
      name: category.name,
      description: category.description || "",
      order: category.order || 0,
      isActive: category.isActive,
    });
  };

  const removeCategory = async (id) => {
    if (!window.confirm("Bu kategori ve altindaki urunler silinecek. Devam edilsin mi?")) {
      return;
    }

    try {
      await request(`/categories/${id}`, { method: "DELETE" });
      loadCategories();
    } catch (deleteError) {
      setError(deleteError.message);
    }
  };

  const toggleActive = async (category) => {
    try {
      await request(`/categories/${category._id}`, {
        method: "PUT",
        body: JSON.stringify({ isActive: !category.isActive }),
      });
      loadCategories();
    } catch (toggleError) {
      setError(toggleError.message);
    }
  };

  const uploadCategoryImage = async (categoryId, file) => {
    const payload = new FormData();
    payload.append("image", file);

    setUploadingId(categoryId);
    setError("");

    try {
      await request(`/categories/${categoryId}/image`, {
        method: "POST",
        body: payload,
      });
      await loadCategories();
    } catch (uploadError) {
      setError(uploadError.message);
    } finally {
      setUploadingId("");
    }
  };

  return (
    <div className="space-y-6">
      <section className="glass-panel p-6 shadow-soft">
        <h1 className="font-display text-3xl text-ink">Kategoriler</h1>
        <p className="mt-2 text-sm text-slate-600">Kategori ekle, sirala, pasiflestir veya kategoriye ozel bir vitrin gorseli yukle.</p>

        <form onSubmit={submitForm} className="mt-6 grid gap-4 md:grid-cols-2">
          <input
            type="text"
            placeholder="Kategori adi"
            value={form.name}
            onChange={(event) => setForm({ ...form, name: event.target.value })}
            className="rounded-2xl border border-blue-100 bg-white px-4 py-3 outline-none focus:border-blue-400"
            required
          />
          <input
            type="number"
            placeholder="Sira"
            value={form.order}
            onChange={(event) => setForm({ ...form, order: Number(event.target.value) })}
            className="rounded-2xl border border-blue-100 bg-white px-4 py-3 outline-none focus:border-blue-400"
          />
          <textarea
            placeholder="Aciklama"
            value={form.description}
            onChange={(event) => setForm({ ...form, description: event.target.value })}
            className="min-h-24 rounded-2xl border border-blue-100 bg-white px-4 py-3 outline-none focus:border-blue-400 md:col-span-2"
          />
          <label className="flex items-center gap-3 rounded-2xl border border-blue-100 bg-white px-4 py-3 text-sm">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(event) => setForm({ ...form, isActive: event.target.checked })}
            />
            Kategori aktif
          </label>
          <button type="submit" className="rounded-2xl bg-[#173b8f] px-4 py-3 font-semibold text-white">
            {editingId ? "Kategoriyi Guncelle" : "Kategori Ekle"}
          </button>
          {editingId ? (
            <button
              type="button"
              onClick={() => {
                setEditingId("");
                setForm(initialForm);
              }}
              className="rounded-2xl border border-blue-200 px-4 py-3 font-semibold text-slate-700 md:col-span-2"
            >
              Vazgec
            </button>
          ) : null}
        </form>

        {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}
      </section>

      <section className="grid gap-4">
        {categories.map((category) => {
          const isPreviewing = selectedPreview.categoryId === category._id && selectedPreview.preview;
          const previewImage = isPreviewing ? selectedPreview.preview : category.imageUrl;

          return (
            <article key={category._id} className="glass-panel overflow-hidden shadow-soft">
              <div className="grid gap-0 md:grid-cols-[280px_1fr]">
                <div className="relative min-h-[220px] bg-slate-100">
                  {previewImage ? (
                    <img src={previewImage} alt={category.name} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full min-h-[220px] items-center justify-center text-sm text-slate-400">
                      Kategori gorseli yok
                    </div>
                  )}
                  <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent,rgba(15,23,42,0.55))]" />
                  <div className="absolute inset-x-0 bottom-0 p-4 text-white">
                    <p className="text-xs uppercase tracking-[0.28em] text-white/70">{category.itemCount} urun</p>
                    <h2 className="mt-2 font-display text-3xl font-extrabold">{category.name}</h2>
                  </div>
                </div>

                <div className="flex flex-col gap-4 p-5">
                  <div>
                    <p className="text-sm text-slate-600">{category.description || "Aciklama yok"}</p>
                    <p className="mt-3 text-xs uppercase tracking-[0.25em] text-slate-400">Sira: {category.order}</p>
                  </div>

                  <div className="rounded-[1.35rem] border border-blue-100 bg-blue-50/50 p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">Kategori arka plan gorseli</p>
                        <p className="mt-1 text-xs text-slate-500">
                          {isPreviewing ? selectedPreview.name : category.imageUrl ? "Mevcut gorsel yuklu" : "Henuz gorsel secilmedi"}
                        </p>
                      </div>
                      <label className="cursor-pointer rounded-2xl bg-white px-4 py-2 text-sm font-semibold text-blue-700 shadow-sm transition hover:bg-blue-100">
                        {uploadingId === category._id ? "Yukleniyor..." : "Gorsel Sec"}
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(event) => {
                            const file = event.target.files?.[0];
                            if (!file) {
                              return;
                            }

                            const preview = URL.createObjectURL(file);
                            setSelectedPreview({
                              categoryId: category._id,
                              name: file.name,
                              preview,
                            });
                            uploadCategoryImage(category._id, file);
                          }}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => toggleActive(category)}
                      className={`rounded-2xl px-4 py-2 text-sm font-semibold ${
                        category.isActive ? "bg-blue-100 text-blue-800" : "bg-slate-200 text-slate-700"
                      }`}
                    >
                      {category.isActive ? "Aktif" : "Pasif"}
                    </button>
                    <button
                      type="button"
                      onClick={() => startEdit(category)}
                      className="rounded-2xl border border-blue-200 px-4 py-2 text-sm font-semibold text-slate-700"
                    >
                      Duzenle
                    </button>
                    <button
                      type="button"
                      onClick={() => removeCategory(category._id)}
                      className="rounded-2xl bg-red-50 px-4 py-2 text-sm font-semibold text-red-700"
                    >
                      Sil
                    </button>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </section>
    </div>
  );
}
