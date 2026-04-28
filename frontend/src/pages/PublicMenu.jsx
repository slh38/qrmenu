import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { API_URL } from "../lib/api";

const socialConfig = {
  instagram: {
    label: "Instagram",
    icon: (
      <path d="M8 3h8a5 5 0 0 1 5 5v8a5 5 0 0 1-5 5H8a5 5 0 0 1-5-5V8a5 5 0 0 1 5-5Zm0 2.5A2.5 2.5 0 0 0 5.5 8v8A2.5 2.5 0 0 0 8 18.5h8a2.5 2.5 0 0 0 2.5-2.5V8A2.5 2.5 0 0 0 16 5.5H8Zm8.75 1.1a.9.9 0 1 1 0 1.8.9.9 0 0 1 0-1.8ZM12 8a4 4 0 1 1 0 8 4 4 0 0 1 0-8Zm0 2.2a1.8 1.8 0 1 0 0 3.6 1.8 1.8 0 0 0 0-3.6Z" />
    ),
  },
  facebook: {
    label: "Facebook",
    icon: <path d="M13.5 21v-7h2.3l.5-3h-2.8V9.4c0-.9.3-1.6 1.6-1.6h1.4V5.1c-.2 0-1.1-.1-2.2-.1-2.2 0-3.8 1.3-3.8 3.9V11H8v3h2.5v7h3Z" />,
  },
  tiktok: {
    label: "TikTok",
    icon: <path d="M14.2 4c.5 1.4 1.6 2.5 3 3V9a6 6 0 0 1-3-.9v4.9a4.8 4.8 0 1 1-4.8-4.8c.3 0 .6 0 .9.1v2.4a2.6 2.6 0 1 0 1.7 2.4V4h2.2Z" />,
  },
  website: {
    label: "Website",
    icon: <path d="M12 3a9 9 0 1 1 0 18 9 9 0 0 1 0-18Zm5.8 8h-2.4a14.9 14.9 0 0 0-1.3-5A6.8 6.8 0 0 1 17.8 11ZM12 5.2c-.8 1-1.6 3-1.9 5h3.8c-.3-2-1.1-4-1.9-5Zm-2 7c.3 2.1 1.1 4 2 5 .8-1 1.6-2.9 1.9-5H10Zm-4.8 0a6.8 6.8 0 0 0 3.7 5 14.9 14.9 0 0 1-1.3-5H5.2Zm0-2.2h2.4c.2-1.9.7-3.6 1.3-5a6.8 6.8 0 0 0-3.7 5Zm9.2 7.2a14.9 14.9 0 0 0 1.3-5h2.4a6.8 6.8 0 0 1-3.7 5Z" />,
  },
  whatsapp: {
    label: "WhatsApp",
    icon: <path d="M12 3a8.9 8.9 0 0 1 7.6 13.5L21 21l-4.6-1.3A9 9 0 1 1 12 3Zm0 2.2A6.8 6.8 0 0 0 6.3 16L6 17.1l1.1-.3a6.8 6.8 0 1 0 4.9-11.6Zm-3.3 3.3c.2-.4.4-.4.7-.4h.6c.2 0 .4 0 .5.4l.7 1.7c.1.2 0 .4-.1.6l-.3.4c-.1.1-.2.3-.1.4.3.6.9 1.4 2 2 .3.2.5.1.6 0l.5-.6c.1-.2.4-.2.6-.1l1.6.8c.2.1.4.2.4.5 0 .3-.1 1.4-.9 1.8-.7.4-1.5.4-2 .3-.5-.1-1.2-.3-2.2-1-.6-.4-1.2-1-1.7-1.7-.8-1-1.4-2.2-1.5-2.4-.1-.3-.7-1.7-.1-2.7Z" />,
  },
};

function SocialIcon({ path }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
      {path}
    </svg>
  );
}

function getVisibleSocials(socialLinks = {}) {
  return Object.entries(socialLinks)
    .filter(([, value]) => value)
    .map(([key, value]) => ({
      key,
      href: value,
      ...socialConfig[key],
    }));
}

function getCategoryImage(category, tenant) {
  return category.items.find((item) => item.imageUrl)?.imageUrl || tenant.coverImageUrl || tenant.logoUrl || "";
}

function formatPrice(item) {
  return `${item.price} ${item.currency}`;
}

function ScrollTabs({ categories, activeCategory, onSelect, light = false }) {
  return (
    <div className={`sticky top-0 z-30 border-b backdrop-blur ${light ? "border-slate-200/80 bg-white/85" : "border-white/10 bg-[#081a3dcc]"}`}>
      <div className="mx-auto flex max-w-6xl gap-3 overflow-x-auto px-4 py-4 sm:px-6">
        {categories.map((category) => (
          <button
            key={category._id}
            type="button"
            onClick={() => onSelect(category._id)}
            className={`shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition ${
              activeCategory === category._id
                ? light
                  ? "border-transparent text-white"
                  : "border-transparent text-white"
                : light
                  ? "border-slate-200 bg-white text-slate-700"
                  : "border-white/10 bg-white/10 text-white/80"
            }`}
            style={activeCategory === category._id ? { backgroundColor: "var(--accent-color)" } : undefined}
          >
            {category.name}
          </button>
        ))}
      </div>
    </div>
  );
}

function SocialBar({ socials, dark = false }) {
  if (!socials.length) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      {socials.map((social) => (
        <a
          key={social.key}
          href={social.href}
          target="_blank"
          rel="noreferrer"
          aria-label={social.label}
          className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl border transition ${
            dark ? "border-white/10 bg-white/10 text-white hover:bg-white/15" : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
          }`}
        >
          <SocialIcon path={social.icon} />
        </a>
      ))}
    </div>
  );
}

function ShowcaseTheme({ menu, categories, activeCategory, onSelect }) {
  const socials = getVisibleSocials(menu.tenant.socialLinks);

  return (
    <div className="min-h-screen bg-[#f8f3ec] text-[#1e1b18]" style={{ "--accent-color": menu.tenant.primaryColor || "#2563eb" }}>
      <header className="relative overflow-hidden bg-[#101828] text-white">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-35"
          style={{ backgroundImage: `url(${menu.tenant.coverImageUrl || menu.tenant.logoUrl || ""})` }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(16,24,40,0.3),rgba(16,24,40,0.92))]" />
        <div className="relative mx-auto max-w-6xl px-4 pb-10 pt-10 sm:px-6">
          <div className="flex items-start justify-between gap-4">
            <div className="max-w-2xl">
              <div className="mb-6 inline-flex rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs uppercase tracking-[0.35em] text-white/70">
                QRMenu Signature
              </div>
              <h1 className="font-display text-4xl font-extrabold tracking-tight sm:text-6xl">{menu.tenant.businessName}</h1>
              {menu.tenant.tagline ? <p className="mt-4 max-w-xl text-base text-white/75 sm:text-lg">{menu.tenant.tagline}</p> : null}
              <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/65">
                {menu.tenant.address ? <span>{menu.tenant.address}</span> : null}
                {menu.tenant.phone ? <span>{menu.tenant.phone}</span> : null}
              </div>
            </div>
            {menu.tenant.logoUrl ? (
              <img src={menu.tenant.logoUrl} alt={menu.tenant.businessName} className="hidden h-28 w-28 rounded-[2rem] object-cover shadow-soft sm:block" />
            ) : null}
          </div>

          <div className="mt-8">
            <SocialBar socials={socials} dark />
          </div>
        </div>
      </header>

      <ScrollTabs categories={categories} activeCategory={activeCategory} onSelect={onSelect} light />

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {categories.map((category) => (
            <button
              key={category._id}
              type="button"
              onClick={() => onSelect(category._id)}
              className="group relative overflow-hidden rounded-[2rem] bg-slate-900 text-left shadow-soft"
            >
              {getCategoryImage(category, menu.tenant) ? (
                <img
                  src={getCategoryImage(category, menu.tenant)}
                  alt={category.name}
                  loading="lazy"
                  className="h-56 w-full object-cover transition duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="h-56 w-full bg-gradient-to-br from-slate-800 to-slate-600" />
              )}
              <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent,rgba(15,23,42,0.88))]" />
              <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                <p className="text-xs uppercase tracking-[0.3em] text-white/65">{category.items.length} urun</p>
                <h2 className="mt-2 font-display text-3xl font-extrabold">{category.name}</h2>
                {category.description ? <p className="mt-2 text-sm text-white/75">{category.description}</p> : null}
              </div>
            </button>
          ))}
        </section>

        <div className="mt-10 space-y-10">
          {categories.map((category) => (
            <section key={category._id} id={`category-${category._id}`} className="scroll-mt-28">
              <div className="mb-5 flex items-end justify-between gap-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Kategori</p>
                  <h3 className="mt-2 font-display text-3xl font-extrabold text-slate-900">{category.name}</h3>
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {category.items.map((item) => (
                  <article key={item._id} className="overflow-hidden rounded-[2rem] border border-white/70 bg-white shadow-soft">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.name} loading="lazy" className="h-52 w-full object-cover" />
                    ) : (
                      <div className="h-52 bg-gradient-to-br from-slate-100 to-slate-200" />
                    )}
                    <div className="p-5">
                      <div className="flex items-start justify-between gap-4">
                        <h4 className="font-display text-2xl font-extrabold text-slate-900">{item.name}</h4>
                        <div className="rounded-full px-4 py-2 text-sm font-bold text-white" style={{ backgroundColor: "var(--accent-color)" }}>
                          {formatPrice(item)}
                        </div>
                      </div>
                      {item.description ? <p className="mt-3 text-sm leading-6 text-slate-600">{item.description}</p> : null}
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>
      </main>
    </div>
  );
}

function MinimalTheme({ menu, categories, activeCategory, onSelect }) {
  const socials = getVisibleSocials(menu.tenant.socialLinks);

  return (
    <div className="min-h-screen bg-[#f8fafc] text-slate-900" style={{ "--accent-color": menu.tenant.primaryColor || "#2563eb" }}>
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
          <div className="flex items-start justify-between gap-4">
            <div className="max-w-2xl">
              <h1 className="font-display text-4xl font-extrabold tracking-tight">{menu.tenant.businessName}</h1>
              {menu.tenant.tagline ? <p className="mt-3 text-sm leading-6 text-slate-600">{menu.tenant.tagline}</p> : null}
              <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-500">
                {menu.tenant.address ? <span>{menu.tenant.address}</span> : null}
                {menu.tenant.phone ? <span>{menu.tenant.phone}</span> : null}
              </div>
            </div>
            {menu.tenant.logoUrl ? (
              <img src={menu.tenant.logoUrl} alt={menu.tenant.businessName} className="h-20 w-20 rounded-[1.5rem] object-cover" />
            ) : null}
          </div>
          <div className="mt-5">
            <SocialBar socials={socials} />
          </div>
        </div>
      </header>

      <ScrollTabs categories={categories} activeCategory={activeCategory} onSelect={onSelect} light />

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
        <div className="space-y-10">
          {categories.map((category) => (
            <section key={category._id} id={`category-${category._id}`} className="scroll-mt-28">
              <div className="mb-5">
                <h2 className="font-display text-3xl font-extrabold tracking-tight">{category.name}</h2>
                {category.description ? <p className="mt-2 text-sm text-slate-500">{category.description}</p> : null}
              </div>
              <div className="space-y-3">
                {category.items.map((item) => (
                  <article key={item._id} className="rounded-[1.6rem] border border-slate-200 bg-white p-3 shadow-sm">
                    <div className="flex gap-3 sm:gap-5">
                      {item.imageUrl ? (
                        <img src={item.imageUrl} alt={item.name} loading="lazy" className="h-24 w-24 rounded-[1.2rem] object-cover sm:h-28 sm:w-28" />
                      ) : (
                        <div className="h-24 w-24 rounded-[1.2rem] bg-slate-100 sm:h-28 sm:w-28" />
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <h3 className="text-lg font-extrabold tracking-tight text-slate-900 sm:text-xl">{item.name}</h3>
                            {item.description ? <p className="mt-2 text-sm leading-6 text-slate-500">{item.description}</p> : null}
                          </div>
                          <div className="shrink-0 text-right">
                            <div className="text-lg font-extrabold sm:text-xl" style={{ color: "var(--accent-color)" }}>
                              {formatPrice(item)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          ))}
        </div>
      </main>
    </div>
  );
}

function EditorialTheme({ menu, categories, activeCategory, onSelect }) {
  const socials = getVisibleSocials(menu.tenant.socialLinks);
  const firstCategory = categories[0];
  const firstCategoryImage = firstCategory ? getCategoryImage(firstCategory, menu.tenant) : menu.tenant.coverImageUrl;

  return (
    <div className="min-h-screen bg-[#f4efe8] text-[#1f2937]" style={{ "--accent-color": menu.tenant.primaryColor || "#2563eb" }}>
      <header className="mx-auto max-w-6xl px-4 pb-6 pt-6 sm:px-6 sm:pt-8">
        <div className="overflow-hidden rounded-[2.4rem] bg-[#111827] text-white shadow-soft">
          <div className="grid gap-0 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="p-6 sm:p-8 lg:p-10">
              <div className="inline-flex rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs uppercase tracking-[0.35em] text-white/70">
                Editorial Theme
              </div>
              <h1 className="mt-6 font-display text-4xl font-extrabold tracking-tight sm:text-6xl">{menu.tenant.businessName}</h1>
              {menu.tenant.tagline ? <p className="mt-5 max-w-xl text-base leading-7 text-white/75">{menu.tenant.tagline}</p> : null}
              <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/60">
                {menu.tenant.address ? <span>{menu.tenant.address}</span> : null}
                {menu.tenant.phone ? <span>{menu.tenant.phone}</span> : null}
              </div>
              <div className="mt-8">
                <SocialBar socials={socials} dark />
              </div>
            </div>
            <div className="relative min-h-[280px]">
              {firstCategoryImage ? (
                <img src={firstCategoryImage} alt={menu.tenant.businessName} loading="lazy" className="h-full w-full object-cover" />
              ) : (
                <div className="h-full w-full bg-gradient-to-br from-slate-700 to-slate-900" />
              )}
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(17,24,39,0.04),rgba(17,24,39,0.6))]" />
            </div>
          </div>
        </div>
      </header>

      <ScrollTabs categories={categories} activeCategory={activeCategory} onSelect={onSelect} light />

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="space-y-12">
          {categories.map((category, index) => (
            <section key={category._id} id={`category-${category._id}`} className="scroll-mt-28">
              <div className="grid gap-5 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
                <div className={`${index % 2 === 1 ? "lg:order-2" : ""}`}>
                  <div className="overflow-hidden rounded-[2rem] bg-slate-900 text-white shadow-soft">
                    {getCategoryImage(category, menu.tenant) ? (
                      <img src={getCategoryImage(category, menu.tenant)} alt={category.name} loading="lazy" className="h-64 w-full object-cover" />
                    ) : (
                      <div className="h-64 bg-gradient-to-br from-slate-800 to-slate-600" />
                    )}
                    <div className="border-t border-white/10 p-5">
                      <p className="text-xs uppercase tracking-[0.3em] text-white/55">Section {String(index + 1).padStart(2, "0")}</p>
                      <h2 className="mt-3 font-display text-3xl font-extrabold">{category.name}</h2>
                      {category.description ? <p className="mt-3 text-sm leading-6 text-white/70">{category.description}</p> : null}
                    </div>
                  </div>
                </div>
                <div className={`${index % 2 === 1 ? "lg:order-1" : ""}`}>
                  <div className="space-y-3">
                    {category.items.map((item) => (
                      <article key={item._id} className="rounded-[1.8rem] border border-[#e4d8ca] bg-[#fffdf9] p-4 shadow-sm">
                        <div className="flex gap-4">
                          {item.imageUrl ? (
                            <img src={item.imageUrl} alt={item.name} loading="lazy" className="h-20 w-20 rounded-[1.1rem] object-cover sm:h-24 sm:w-24" />
                          ) : (
                            <div className="h-20 w-20 rounded-[1.1rem] bg-[#efe6da] sm:h-24 sm:w-24" />
                          )}
                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <h3 className="font-display text-xl font-extrabold tracking-tight text-slate-900">{item.name}</h3>
                                {item.description ? <p className="mt-2 text-sm leading-6 text-slate-500">{item.description}</p> : null}
                              </div>
                              <div className="shrink-0 text-right font-extrabold" style={{ color: "var(--accent-color)" }}>
                                {formatPrice(item)}
                              </div>
                            </div>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          ))}
        </div>
      </main>
    </div>
  );
}

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
      { rootMargin: "-30% 0px -55% 0px" }
    );

    menu.categories.forEach((category) => {
      const element = document.getElementById(`category-${category._id}`);
      if (element) {
        observer.observe(element);
      }
    });

    return () => observer.disconnect();
  }, [menu]);

  const categories = useMemo(() => (menu?.categories || []).filter((category) => category.items.length), [menu]);

  useEffect(() => {
    if (categories.length && !categories.find((category) => category._id === activeCategory)) {
      setActiveCategory(categories[0]._id);
    }
  }, [categories, activeCategory]);

  const scrollToCategory = (categoryId) => {
    document.getElementById(`category-${categoryId}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
    setActiveCategory(categoryId);
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
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <p className="text-sm text-slate-500">Menu yukleniyor...</p>
      </div>
    );
  }

  if (!categories.length) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="glass-panel max-w-md p-8 text-center shadow-soft">
          <h1 className="font-display text-3xl text-ink">{menu.tenant.businessName}</h1>
          <p className="mt-3 text-sm text-slate-500">Bu menu icin gosterilecek aktif urun bulunmuyor.</p>
        </div>
      </div>
    );
  }

  const theme = menu.tenant.theme || "showcase";

  return (
    <>
      {theme === "minimal" ? <MinimalTheme menu={menu} categories={categories} activeCategory={activeCategory} onSelect={scrollToCategory} /> : null}
      {theme === "editorial" ? <EditorialTheme menu={menu} categories={categories} activeCategory={activeCategory} onSelect={scrollToCategory} /> : null}
      {theme === "showcase" ? <ShowcaseTheme menu={menu} categories={categories} activeCategory={activeCategory} onSelect={scrollToCategory} /> : null}
      <footer className="px-4 pb-8 pt-3 text-center text-xs uppercase tracking-[0.28em] text-slate-400">Powered by QRMenu</footer>
    </>
  );
}
