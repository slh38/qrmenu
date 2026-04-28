import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { API_URL } from "../lib/api";

const socialConfig = {
  instagram: {
    label: "Instagram",
    icon: <path d="M8 3h8a5 5 0 0 1 5 5v8a5 5 0 0 1-5 5H8a5 5 0 0 1-5-5V8a5 5 0 0 1 5-5Zm0 2.5A2.5 2.5 0 0 0 5.5 8v8A2.5 2.5 0 0 0 8 18.5h8a2.5 2.5 0 0 0 2.5-2.5V8A2.5 2.5 0 0 0 16 5.5H8Zm8.75 1.1a.9.9 0 1 1 0 1.8.9.9 0 0 1 0-1.8ZM12 8a4 4 0 1 1 0 8 4 4 0 0 1 0-8Zm0 2.2a1.8 1.8 0 1 0 0 3.6 1.8 1.8 0 0 0 0-3.6Z" />,
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

function SocialIcon({ icon }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
      {icon}
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
  return category.imageUrl || category.items.find((item) => item.imageUrl)?.imageUrl || tenant.coverImageUrl || tenant.logoUrl || "";
}

function formatPrice(item) {
  return `${item.price} ${item.currency}`;
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
          <SocialIcon icon={social.icon} />
        </a>
      ))}
    </div>
  );
}

function ContactIcon({ dark = false }) {
  return (
    <span
      className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl border transition ${
        dark ? "border-white/10 bg-white/10 text-white hover:bg-white/15" : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
      }`}
    >
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
        <path d="M4 5.5A2.5 2.5 0 0 1 6.5 3h11A2.5 2.5 0 0 1 20 5.5v13a2.5 2.5 0 0 1-2.5 2.5h-11A2.5 2.5 0 0 1 4 18.5v-13Zm2.2.3v.3l5.8 4.1 5.8-4.1v-.3H6.2Zm11.6 2.9-5.2 3.7a1 1 0 0 1-1.2 0L6.2 8.7v9.8c0 .2.1.3.3.3h11c.2 0 .3-.1.3-.3V8.7Z" />
      </svg>
    </span>
  );
}

function LogoBadge({ tenant, dark = false }) {
  if (!tenant.logoUrl) {
    return null;
  }

  const effectClass = tenant.logoEffectEnabled !== false
    ? dark
      ? "shadow-[0_22px_70px_rgba(0,0,0,0.45)] ring-1 ring-white/10"
      : "shadow-[0_22px_60px_rgba(37,99,235,0.22)] ring-1 ring-slate-200"
    : dark
      ? "shadow-soft ring-1 ring-white/10"
      : "shadow-sm ring-1 ring-slate-200";

  return (
    <div className={`mx-auto mb-6 flex h-28 w-28 items-center justify-center rounded-[2rem] bg-white/95 p-2 backdrop-blur sm:h-32 sm:w-32 ${effectClass}`}>
      <img src={tenant.logoUrl} alt={tenant.businessName} className="h-full w-full rounded-[1.5rem] object-cover" />
    </div>
  );
}

function PageHeader({ tenant, socials, theme, onContactClick }) {
  const isDark = theme !== "minimal";
  const combinedSocials = [
    ...socials,
    {
      key: "contact",
      href: "#contact",
      label: "Iletisim",
      icon: null,
    },
  ];

  if (theme === "minimal") {
    return (
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
          <LogoBadge tenant={tenant} />
          <div className="min-w-0 text-center">
            <h1 className="font-display text-4xl font-extrabold tracking-tight text-slate-900">{tenant.businessName}</h1>
            {tenant.tagline ? <p className="mt-3 text-sm leading-6 text-slate-600">{tenant.tagline}</p> : null}
          </div>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            {combinedSocials.map((social) =>
              social.key === "contact" ? (
                <button key={social.key} type="button" onClick={onContactClick}>
                  <ContactIcon />
                </button>
              ) : (
                <a
                  key={social.key}
                  href={social.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={social.label}
                  className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 transition hover:border-slate-300"
                >
                  <SocialIcon icon={social.icon} />
                </a>
              )
            )}
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className={`relative overflow-hidden ${theme === "editorial" ? "bg-[#111827]" : "bg-[#101828]"} text-white`}>
      <div
        className="absolute inset-0 bg-cover bg-center opacity-35"
        style={{ backgroundImage: `url(${tenant.coverImageUrl || tenant.logoUrl || ""})` }}
      />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(16,24,40,0.28),rgba(16,24,40,0.92))]" />
      <div className="relative mx-auto max-w-6xl px-4 pb-10 pt-10 sm:px-6">
        <LogoBadge tenant={tenant} dark />
        <div className="mx-auto min-w-0 max-w-3xl text-center">
          <h1 className="font-display text-4xl font-extrabold tracking-tight sm:text-6xl">{tenant.businessName}</h1>
          {tenant.tagline ? <p className="mt-4 text-base text-white/75 sm:text-lg">{tenant.tagline}</p> : null}
        </div>

        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {combinedSocials.map((social) =>
            social.key === "contact" ? (
              <button key={social.key} type="button" onClick={onContactClick}>
                <ContactIcon dark={isDark} />
              </button>
            ) : (
              <a
                key={social.key}
                href={social.href}
                target="_blank"
                rel="noreferrer"
                aria-label={social.label}
                className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-white transition hover:bg-white/15"
              >
                <SocialIcon icon={social.icon} />
              </a>
            )
          )}
        </div>
      </div>
    </header>
  );
}

function CategoryGrid({ categories, tenant, slug, theme }) {
  const gridClass =
    theme === "minimal"
      ? "grid gap-4 sm:grid-cols-2"
      : "grid gap-4 md:grid-cols-2 xl:grid-cols-3";

  return (
    <div className={gridClass}>
      {categories.map((category) => (
        <Link
          key={category._id}
          to={`/menu/${slug}/category/${category._id}`}
          className={`group relative overflow-hidden rounded-[2rem] text-left shadow-soft ${
            theme === "minimal" ? "border border-slate-200 bg-white" : "bg-slate-900"
          }`}
        >
          {getCategoryImage(category, tenant) ? (
            <img
              src={getCategoryImage(category, tenant)}
              alt={category.name}
              loading="lazy"
              className="h-56 w-full object-cover transition duration-500 group-hover:scale-105"
            />
          ) : (
            <div className={`h-56 w-full ${theme === "minimal" ? "bg-slate-100" : "bg-gradient-to-br from-slate-800 to-slate-600"}`} />
          )}
          <div className={`absolute inset-0 ${theme === "minimal" ? "bg-[linear-gradient(180deg,transparent,rgba(15,23,42,0.75))]" : "bg-[linear-gradient(180deg,transparent,rgba(15,23,42,0.88))]"}`} />
          <div className="absolute inset-x-0 bottom-0 p-5 text-white">
            <p className="text-xs uppercase tracking-[0.3em] text-white/65">{category.items.length} urun</p>
            <h2 className="mt-2 font-display text-3xl font-extrabold">{category.name}</h2>
            {category.description ? <p className="mt-2 text-sm text-white/75">{category.description}</p> : null}
          </div>
        </Link>
      ))}
    </div>
  );
}

function BackBar({ slug, categories, activeCategoryId }) {
  return (
    <div className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-3 overflow-x-auto px-4 py-4 sm:px-6">
        <Link to={`/menu/${slug}`} className="shrink-0 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700">
          Kategoriler
        </Link>
        {categories.map((category) => (
          <Link
            key={category._id}
            to={`/menu/${slug}/category/${category._id}`}
            className={`shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition ${
              activeCategoryId === category._id ? "border-transparent text-white" : "border-slate-200 bg-white text-slate-700"
            }`}
            style={activeCategoryId === category._id ? { backgroundColor: "var(--accent-color)" } : undefined}
          >
            {category.name}
          </Link>
        ))}
      </div>
    </div>
  );
}

function DetailHeader({ slug, category }) {
  return (
    <div className="mb-6 flex items-center justify-between gap-4">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Kategori</p>
        <h2 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">{category.name}</h2>
        {category.description ? <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">{category.description}</p> : null}
      </div>
      <button
        type="button"
        onClick={() => window.location.assign(`/menu/${slug}`)}
        className="hidden rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 sm:block"
      >
        Geri Don
      </button>
    </div>
  );
}

function ItemList({ items, theme }) {
  if (theme === "minimal") {
    return (
      <div className="space-y-3">
        {items.map((item) => (
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
                  <div className="shrink-0 text-right text-lg font-extrabold sm:text-xl" style={{ color: "var(--accent-color)" }}>
                    {formatPrice(item)}
                  </div>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    );
  }

  if (theme === "editorial") {
    return (
      <div className="space-y-3">
        {items.map((item) => (
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
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {items.map((item) => (
        <article key={item._id} className="overflow-hidden rounded-[2rem] border border-white/70 bg-white shadow-soft">
          {item.imageUrl ? (
            <img src={item.imageUrl} alt={item.name} loading="lazy" className="h-52 w-full object-cover" />
          ) : (
            <div className="h-52 bg-gradient-to-br from-slate-100 to-slate-200" />
          )}
          <div className="p-5">
            <div className="flex items-start justify-between gap-4">
              <h3 className="font-display text-2xl font-extrabold text-slate-900">{item.name}</h3>
              <div className="rounded-full px-4 py-2 text-sm font-bold text-white" style={{ backgroundColor: "var(--accent-color)" }}>
                {formatPrice(item)}
              </div>
            </div>
            {item.description ? <p className="mt-3 text-sm leading-6 text-slate-600">{item.description}</p> : null}
          </div>
        </article>
      ))}
    </div>
  );
}

export default function PublicMenu() {
  const { slug, categoryId } = useParams();
  const navigate = useNavigate();
  const [menu, setMenu] = useState(null);
  const [error, setError] = useState("");
  const contactSectionId = "contact";

  useEffect(() => {
    fetch(`${API_URL}/public/menu/${slug}`)
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok || !result.success) {
          throw new Error(result.message || "Menu yuklenemedi.");
        }
        return result.data;
      })
      .then((data) => setMenu(data))
      .catch((loadError) => setError(loadError.message));
  }, [slug]);

  const categories = useMemo(() => (menu?.categories || []).filter((category) => category.items.length), [menu]);
  const selectedCategory = useMemo(
    () => categories.find((category) => category._id === categoryId) || null,
    [categories, categoryId]
  );

  useEffect(() => {
    if (categoryId && categories.length && !selectedCategory) {
      navigate(`/menu/${slug}`, { replace: true });
    }
  }, [categoryId, categories, navigate, selectedCategory, slug]);

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
  const socials = getVisibleSocials(menu.tenant.socialLinks);
  const pageBackground =
    theme === "minimal" ? "bg-[#f8fafc]" : theme === "editorial" ? "bg-[#f4efe8]" : "bg-[#f8f3ec]";

  const scrollToContact = () => {
    document.getElementById(contactSectionId)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className={`min-h-screen ${pageBackground} text-slate-900`} style={{ "--accent-color": menu.tenant.primaryColor || "#2563eb" }}>
      <PageHeader tenant={menu.tenant} socials={socials} theme={theme} onContactClick={scrollToContact} />

      {selectedCategory ? <BackBar slug={slug} categories={categories} activeCategoryId={selectedCategory._id} /> : null}

      <main className={`mx-auto px-4 py-8 sm:px-6 ${theme === "minimal" ? "max-w-5xl" : "max-w-6xl"}`}>
        {selectedCategory ? (
          <section>
            <DetailHeader slug={slug} category={selectedCategory} />
            <ItemList items={selectedCategory.items} theme={theme} />
          </section>
        ) : (
          <section>
            <div className="mb-6">
              <h2 className="font-display text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">Kategoriler</h2>
              <p className="mt-3 text-sm text-slate-500">Urunleri gormek icin bir kategori sec.</p>
            </div>
            <CategoryGrid categories={categories} tenant={menu.tenant} slug={slug} theme={theme} />
          </section>
        )}
      </main>

      <section id={contactSectionId} className="mx-auto max-w-6xl px-4 pb-8 sm:px-6">
        <div className="rounded-[2rem] border border-slate-200 bg-white/80 p-6 shadow-soft backdrop-blur">
          <h3 className="font-display text-2xl font-extrabold tracking-tight text-slate-900">Iletisim</h3>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className="rounded-[1.4rem] bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Telefon</p>
              <p className="mt-2 text-base font-semibold text-slate-900">{menu.tenant.phone || "Belirtilmedi"}</p>
            </div>
            <div className="rounded-[1.4rem] bg-slate-50 p-4">
              <p className="text-xs uppercase tracking-[0.28em] text-slate-400">Adres</p>
              <p className="mt-2 text-base font-semibold text-slate-900">{menu.tenant.address || "Belirtilmedi"}</p>
            </div>
          </div>
        </div>
      </section>

      <footer className="px-4 pb-8 pt-3 text-center text-xs uppercase tracking-[0.28em] text-slate-400">Powered by QRMenu</footer>
    </div>
  );
}
