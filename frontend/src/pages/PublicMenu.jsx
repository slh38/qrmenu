import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { API_URL } from "../lib/api";

export default function PublicMenu() {
  const { slug } = useParams();
  const [menu, setMenu] = useState(null);
  const [error, setError] = useState("");
  const [activeCategory, setActiveCategory] = useState("");

  useEffect(() => {
    fetch(`${API_URL}/public/menu/${slug}`)
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok || !result.success) {
          throw new Error(result.message || "Menu yuklenemedi.");
        }
        return result.data;
      })
      .then((data) => {
        setMenu(data);
        setActiveCategory(data.categories[0]?._id || "");
      })
      .catch((loadError) => setError(loadError.message));
  }, [slug]);

  useEffect(() => {
    if (!menu?.categories?.length) {
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((entry) => entry.isIntersecting);
        if (visible) {
          setActiveCategory(visible.target.id.replace("category-", ""));
        }
      },
      {
        rootMargin: "-30% 0px -60% 0px",
      }
    );

    menu.categories.forEach((category) => {
      const element = document.getElementById(`category-${category._id}`);
      if (element) {
        observer.observe(element);
      }
    });

    return () => observer.disconnect();
  }, [menu]);

  const accentStyle = useMemo(
    () => ({
      "--accent-color": menu?.tenant?.primaryColor || "#2563eb",
    }),
    [menu]
  );

  const scrollToCategory = (categoryId) => {
    document.getElementById(`category-${categoryId}`)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="glass-panel max-w-md p-8 text-center shadow-soft">
          <h1 className="font-display text-3xl text-ink">Menu bulunamadi</h1>
          <p className="mt-3 text-sm text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!menu) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-sm text-stone-500">Menu yukleniyor...</p>
      </div>
    );
  }

  return (
    <div style={accentStyle} className="min-h-screen bg-[#f6f9ff] text-ink">
      <header className="relative overflow-hidden bg-[#102c6e] px-4 pb-8 pt-10 text-white">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.18),transparent_25%),radial-gradient(circle_at_top_left,rgba(91,140,255,0.35),transparent_30%)]" />
        <div className="relative mx-auto max-w-3xl">
          {menu.tenant.logoUrl ? (
            <img
              src={menu.tenant.logoUrl}
              alt={menu.tenant.businessName}
              className="h-24 w-24 rounded-[2rem] object-cover shadow-soft"
            />
          ) : (
            <div className="inline-flex rounded-[2rem] border border-white/10 bg-white/10 px-5 py-4 font-display text-2xl">
              {menu.tenant.businessName}
            </div>
          )}
          {menu.tenant.logoUrl ? <h1 className="mt-5 font-display text-4xl">{menu.tenant.businessName}</h1> : null}
          <div className="mt-4 space-y-1 text-sm text-white/75">
            {menu.tenant.address ? <p>{menu.tenant.address}</p> : null}
            {menu.tenant.phone ? <p>{menu.tenant.phone}</p> : null}
          </div>
        </div>
      </header>

      <div className="sticky top-0 z-20 border-b border-blue-100/70 bg-[#fcfdff]/90 backdrop-blur">
        <div className="mx-auto flex max-w-3xl gap-3 overflow-x-auto px-4 py-4">
          {menu.categories.map((category) => (
            <button
              key={category._id}
              type="button"
              onClick={() => scrollToCategory(category._id)}
              className="shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition"
              style={{
                backgroundColor: activeCategory === category._id ? "var(--accent-color)" : "white",
                borderColor: activeCategory === category._id ? "var(--accent-color)" : "#d7e7ff",
                color: activeCategory === category._id ? "white" : "#10233f",
              }}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>

      <main className="mx-auto max-w-3xl px-4 py-8">
        <div className="space-y-8">
          {menu.categories.map((category) => (
            <section key={category._id} id={`category-${category._id}`} className="scroll-mt-28">
              <div className="mb-4">
                <h2 className="font-display text-3xl text-ink">{category.name}</h2>
                {category.description ? <p className="mt-2 text-sm text-stone-600">{category.description}</p> : null}
              </div>

              <div className="space-y-4">
                {category.items.map((item) => (
                  <article key={item._id} className="glass-panel overflow-hidden shadow-soft">
                    <div className="flex flex-col sm:flex-row">
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.name} className="h-44 w-full object-cover sm:w-40" />
                      ) : null}
                      <div className="flex-1 p-5">
                        <div className="flex items-start justify-between gap-4">
                          <h3 className="font-display text-2xl text-ink">{item.name}</h3>
                          <div
                            className="rounded-full px-4 py-2 text-sm font-bold text-white"
                            style={{ backgroundColor: "var(--accent-color)" }}
                          >
                            {item.price} {item.currency}
                          </div>
                        </div>
                        {item.description ? <p className="mt-3 text-sm leading-6 text-stone-600">{item.description}</p> : null}
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>
      </main>

      <footer className="px-4 pb-8 pt-2 text-center text-xs uppercase tracking-[0.25em] text-stone-500">
        Powered by QRMenu
      </footer>
    </div>
  );
}
