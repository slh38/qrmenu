import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { API_URL, resolveAssetUrl } from "../lib/api";

const socialConfig = {
  instagram: {
    label: "Instagram",
    icon: <path d="M7.75 2h8.5A5.75 5.75 0 0 1 22 7.75v8.5A5.75 5.75 0 0 1 16.25 22h-8.5A5.75 5.75 0 0 1 2 16.25v-8.5A5.75 5.75 0 0 1 7.75 2Zm0 1.8A3.95 3.95 0 0 0 3.8 7.75v8.5a3.95 3.95 0 0 0 3.95 3.95h8.5a3.95 3.95 0 0 0 3.95-3.95v-8.5a3.95 3.95 0 0 0-3.95-3.95h-8.5Zm8.96 1.56a1.21 1.21 0 1 1 0 2.42 1.21 1.21 0 0 1 0-2.42ZM12 7.08A4.92 4.92 0 1 1 7.08 12 4.93 4.93 0 0 1 12 7.08Zm0 1.8A3.12 3.12 0 1 0 15.12 12 3.13 3.13 0 0 0 12 8.88Z" />,
  },
  facebook: {
    label: "Facebook",
    icon: <path d="M13.67 22v-8.07h2.72l.41-3.15h-3.13V8.77c0-.91.25-1.53 1.56-1.53h1.67V4.42c-.81-.09-1.63-.13-2.45-.12-2.42 0-4.08 1.48-4.08 4.2v2.28H8v3.15h2.37V22h3.3Z" />,
  },
  tiktok: {
    label: "TikTok",
    icon: <path d="M14.84 3c.5 1.87 1.62 3.13 3.4 3.96v2.78a7.18 7.18 0 0 1-3.4-.87v5.65a5.52 5.52 0 1 1-5.52-5.52c.38 0 .76.04 1.12.12v2.84a2.73 2.73 0 1 0 1.6 2.48V3h2.8Z" />,
  },
  website: {
    label: "Website",
    icon: <path d="M12 3a9 9 0 1 1 0 18 9 9 0 0 1 0-18Zm5.8 8h-2.4a14.9 14.9 0 0 0-1.3-5A6.8 6.8 0 0 1 17.8 11ZM12 5.2c-.8 1-1.6 3-1.9 5h3.8c-.3-2-1.1-4-1.9-5Zm-2 7c.3 2.1 1.1 4 2 5 .8-1 1.6-2.9 1.9-5H10Zm-4.8 0a6.8 6.8 0 0 0 3.7 5 14.9 14.9 0 0 1-1.3-5H5.2Zm0-2.2h2.4c.2-1.9.7-3.6 1.3-5a6.8 6.8 0 0 0-3.7 5Zm9.2 7.2a14.9 14.9 0 0 0 1.3-5h2.4a6.8 6.8 0 0 1-3.7 5Z" />,
  },
  whatsapp: {
    label: "WhatsApp",
    icon: <path d="M20.52 3.48A11.86 11.86 0 0 0 12.07 0C5.53 0 .2 5.33.2 11.87c0 2.09.55 4.13 1.59 5.92L0 24l6.39-1.67a11.85 11.85 0 0 0 5.68 1.44h.01c6.54 0 11.87-5.33 11.87-11.88 0-3.17-1.24-6.14-3.43-8.41Zm-8.45 18.29h-.01a9.87 9.87 0 0 1-5.03-1.37l-.36-.21-3.79.99 1.01-3.7-.23-.38a9.84 9.84 0 0 1-1.51-5.23c0-5.44 4.43-9.87 9.89-9.87 2.64 0 5.12 1.03 6.99 2.9a9.8 9.8 0 0 1 2.9 6.98c0 5.45-4.44 9.89-9.86 9.89Zm5.41-7.38c-.3-.15-1.77-.87-2.05-.96-.27-.1-.47-.15-.67.15-.19.29-.77.96-.94 1.15-.17.2-.34.22-.64.08-.3-.15-1.26-.46-2.4-1.46-.89-.79-1.49-1.76-1.67-2.06-.17-.29-.02-.45.13-.59.13-.13.3-.34.45-.51.15-.17.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.62-.92-2.21-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.08-.8.37-.27.3-1.04 1.02-1.04 2.48s1.06 2.88 1.21 3.08c.15.2 2.08 3.18 5.05 4.46.7.3 1.25.48 1.67.62.7.22 1.34.19 1.84.12.56-.08 1.77-.72 2.02-1.41.25-.69.25-1.28.17-1.4-.07-.12-.27-.2-.57-.35Z" />,
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
  return (
    resolveAssetUrl(category.imageUrl) ||
    resolveAssetUrl(category.items.find((item) => item.imageUrl)?.imageUrl || "") ||
    resolveAssetUrl(tenant.coverImageUrl || "") ||
    resolveAssetUrl(tenant.logoUrl || "") ||
    ""
  );
}

function formatPrice(item) {
  return `${item.price} ${item.currency}`;
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
  const logoUrl = resolveAssetUrl(tenant.logoUrl || "");

  if (!logoUrl) {
    return null;
  }

  const isEffectEnabled = tenant.logoEffectEnabled !== false;
  const sizeClass =
    tenant.logoSize === "sm"
      ? "h-20 w-20 sm:h-24 sm:w-24"
      : tenant.logoSize === "lg"
        ? "h-32 w-32 sm:h-40 sm:w-40"
        : "h-24 w-24 sm:h-32 sm:w-32";
  const effectClass = isEffectEnabled
    ? dark
      ? "drop-shadow-[0_18px_34px_rgba(0,0,0,0.65)]"
      : "drop-shadow-[0_16px_28px_rgba(37,99,235,0.28)]"
    : "";
  const tiltClass = isEffectEnabled ? "rotate-[-4deg] hover:rotate-0" : "";

  return (
    <div className="mb-6 flex w-full justify-center">
      <div className={`relative transition-transform duration-500 ${tiltClass}`}>
        {isEffectEnabled ? (
          <>
            <div className="pointer-events-none absolute inset-x-3 -bottom-2 h-6 rounded-full bg-black/35 blur-xl" />
            <div className="pointer-events-none absolute inset-x-[22%] top-1 z-10 h-3 rounded-full bg-white/60 blur-md" />
          </>
        ) : null}
        <img
          src={logoUrl}
          alt={tenant.businessName}
          className={`relative z-20 ${sizeClass} ${effectClass} rounded-[1.8rem] object-cover transition-transform duration-500 ${isEffectEnabled ? "hover:scale-[1.03]" : ""}`}
        />
      </div>
    </div>
  );
}

function PageHeader({ tenant, socials, theme, onContactClick }) {
  const isDark = theme !== "minimal";
  const combinedSocials = [...socials, { key: "contact", href: "#contact", label: "Iletisim", icon: null }];

  if (theme === "dark") {
    return (
      <header className="relative overflow-hidden bg-[#0d111c] text-white">
        <div
          className="absolute inset-0 bg-cover bg-center opacity-35"
          style={{ backgroundImage: `url(${resolveAssetUrl(tenant.coverImageUrl || tenant.logoUrl || "")})` }}
        />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(7,11,20,0.45),rgba(7,11,20,0.88))]" />
        <div className="relative mx-auto max-w-5xl px-4 pb-8 pt-8 sm:px-6">
          <LogoBadge tenant={tenant} dark />
          <div className="mt-2 flex flex-wrap justify-center gap-3">
            {combinedSocials.map((social) =>
              social.key === "contact" ? (
                <button key={social.key} type="button" onClick={onContactClick}>
                  <ContactIcon dark />
                </button>
              ) : (
                <a
                  key={social.key}
                  href={social.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={social.label}
                  className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-white transition hover:bg-white/15"
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
        style={{ backgroundImage: `url(${resolveAssetUrl(tenant.coverImageUrl || tenant.logoUrl || "")})` }}
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

function CategoryGrid({ categories, tenant, categoryBasePath, theme }) {
  const gridClass =
    theme === "minimal"
      ? "grid gap-4 sm:grid-cols-2"
      : theme === "dark"
        ? "grid grid-cols-2 gap-3 sm:gap-4"
        : "grid gap-4 md:grid-cols-2 xl:grid-cols-3";

  return (
    <div className={gridClass}>
      {categories.map((category) => (
        <Link
          key={category._id}
          to={`${categoryBasePath}/${category._id}`}
          className={`group relative overflow-hidden rounded-[2rem] text-left shadow-soft ${
            theme === "minimal" ? "border border-slate-200 bg-white" : theme === "dark" ? "border border-white/10 bg-[#111827]" : "bg-slate-900"
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
          <div
            className={`absolute inset-0 ${
              theme === "minimal"
                ? "bg-[linear-gradient(180deg,transparent,rgba(15,23,42,0.75))]"
                : theme === "dark"
                  ? "bg-[linear-gradient(180deg,rgba(7,11,20,0.08),rgba(7,11,20,0.82))]"
                  : "bg-[linear-gradient(180deg,transparent,rgba(15,23,42,0.88))]"
            }`}
          />
          <div className={`absolute inset-x-0 bottom-0 ${theme === "dark" ? "p-4" : "p-5"} text-white`}>
            <p className="text-[10px] uppercase tracking-[0.3em] text-white/65">{category.items.length} urun</p>
            <h2 className={`mt-2 font-display font-extrabold ${theme === "dark" ? "text-xl leading-tight sm:text-2xl" : "text-3xl"}`}>{category.name}</h2>
            {category.description ? <p className="mt-2 text-sm text-white/75">{category.description}</p> : null}
          </div>
        </Link>
      ))}
    </div>
  );
}

function BackBar({ homePath, categoryBasePath, categories, activeCategoryId, theme }) {
  return (
    <div
      className={`sticky top-0 z-30 backdrop-blur ${
        theme === "dark" ? "border-b border-white/10 bg-[#0d111c]/90" : "border-b border-slate-200/80 bg-white/90"
      }`}
    >
      <div className="mx-auto flex max-w-6xl items-center gap-3 overflow-x-auto px-4 py-4 sm:px-6">
        <Link
          to={homePath}
          className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold ${
            theme === "dark" ? "border border-white/10 bg-white/5 text-white" : "border border-slate-200 bg-white text-slate-700"
          }`}
        >
          Kategoriler
        </Link>
        {categories.map((category) => (
          <Link
            key={category._id}
            to={`${categoryBasePath}/${category._id}`}
            className={`shrink-0 rounded-full border px-4 py-2 text-sm font-semibold transition ${
              activeCategoryId === category._id
                ? "border-transparent text-white"
                : theme === "dark"
                  ? "border-white/10 bg-white/5 text-white/80"
                  : "border-slate-200 bg-white text-slate-700"
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

function DetailHeader({ homePath, category, theme }) {
  return (
    <div className="mb-6 flex items-center justify-between gap-4">
      <div>
        <p className={`text-xs uppercase tracking-[0.3em] ${theme === "dark" ? "text-white/45" : "text-slate-400"}`}>Kategori</p>
        <h2 className={`mt-2 font-display text-3xl font-extrabold tracking-tight sm:text-4xl ${theme === "dark" ? "text-white" : "text-slate-900"}`}>{category.name}</h2>
        {category.description ? (
          <p className={`mt-3 max-w-2xl text-sm leading-6 ${theme === "dark" ? "text-white/65" : "text-slate-500"}`}>{category.description}</p>
        ) : null}
      </div>
      <button
        type="button"
        onClick={() => window.location.assign(homePath)}
        className={`hidden rounded-2xl px-4 py-3 text-sm font-semibold sm:block ${
          theme === "dark" ? "border border-white/10 bg-white/5 text-white" : "border border-slate-200 bg-white text-slate-700"
        }`}
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
                <img src={resolveAssetUrl(item.imageUrl)} alt={item.name} loading="lazy" className="h-24 w-24 rounded-[1.2rem] object-cover sm:h-28 sm:w-28" />
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
                <img src={resolveAssetUrl(item.imageUrl)} alt={item.name} loading="lazy" className="h-20 w-20 rounded-[1.1rem] object-cover sm:h-24 sm:w-24" />
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

  if (theme === "dark") {
    return (
      <div className="grid gap-4 sm:grid-cols-2">
        {items.map((item) => (
          <article key={item._id} className="overflow-hidden rounded-[1.8rem] border border-white/10 bg-[#121a28] shadow-soft">
            {item.imageUrl ? (
              <img src={resolveAssetUrl(item.imageUrl)} alt={item.name} loading="lazy" className="h-44 w-full object-cover" />
            ) : (
              <div className="h-44 bg-gradient-to-br from-slate-800 to-slate-700" />
            )}
            <div className="p-4">
              <div className="flex items-start justify-between gap-3">
                <h3 className="font-display text-xl font-extrabold text-white">{item.name}</h3>
                <div className="shrink-0 rounded-full bg-white/10 px-3 py-1 text-sm font-bold text-white">{formatPrice(item)}</div>
              </div>
              {item.description ? <p className="mt-3 text-sm leading-6 text-white/65">{item.description}</p> : null}
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
            <img src={resolveAssetUrl(item.imageUrl)} alt={item.name} loading="lazy" className="h-52 w-full object-cover" />
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

export default function PublicMenu({ forcedSlug = "" }) {
  const { slug, categoryId } = useParams();
  const navigate = useNavigate();
  const [menu, setMenu] = useState(null);
  const [error, setError] = useState("");
  const contactSectionId = "contact";
  const resolvedSlug = forcedSlug || slug;
  const homePath = forcedSlug ? "/" : `/menu/${resolvedSlug}`;
  const categoryBasePath = forcedSlug ? "/category" : `/menu/${resolvedSlug}/category`;

  useEffect(() => {
    fetch(`${API_URL}/public/menu/${resolvedSlug}`)
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok || !result.success) {
          throw new Error(result.message || "Menu yuklenemedi.");
        }
        return result.data;
      })
      .then((data) => setMenu(data))
      .catch((loadError) => setError(loadError.message));
  }, [resolvedSlug]);

  const categories = useMemo(() => (menu?.categories || []).filter((category) => category.items.length), [menu]);
  const selectedCategory = useMemo(() => categories.find((category) => category._id === categoryId) || null, [categories, categoryId]);

  useEffect(() => {
    if (categoryId && categories.length && !selectedCategory) {
      navigate(homePath, { replace: true });
    }
  }, [categoryId, categories, homePath, navigate, selectedCategory]);

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
    theme === "minimal" ? "bg-[#f8fafc]" : theme === "editorial" ? "bg-[#f4efe8]" : theme === "dark" ? "bg-[#0a0f18]" : "bg-[#f8f3ec]";

  const scrollToContact = () => {
    document.getElementById(contactSectionId)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div
      className={`min-h-screen ${pageBackground} ${theme === "dark" ? "text-white" : "text-slate-900"}`}
      style={{ "--accent-color": menu.tenant.primaryColor || "#2563eb" }}
    >
      <PageHeader tenant={menu.tenant} socials={socials} theme={theme} onContactClick={scrollToContact} />

      {selectedCategory ? (
        <BackBar homePath={homePath} categoryBasePath={categoryBasePath} categories={categories} activeCategoryId={selectedCategory._id} theme={theme} />
      ) : null}

      <main className={`mx-auto px-4 py-8 sm:px-6 ${theme === "minimal" ? "max-w-5xl" : theme === "dark" ? "max-w-5xl" : "max-w-6xl"}`}>
        {selectedCategory ? (
          <section>
            <DetailHeader homePath={homePath} category={selectedCategory} theme={theme} />
            <ItemList items={selectedCategory.items} theme={theme} />
          </section>
        ) : (
          <section>
            <div className="mb-6">
              {theme === "dark" ? null : <h2 className="font-display text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">Kategoriler</h2>}
              {theme === "dark" ? null : <p className="mt-3 text-sm text-slate-500">Urunleri gormek icin bir kategori sec.</p>}
            </div>
            <CategoryGrid categories={categories} tenant={menu.tenant} categoryBasePath={categoryBasePath} theme={theme} />
          </section>
        )}
      </main>

      <section id={contactSectionId} className="mx-auto max-w-6xl px-4 pb-8 sm:px-6">
        <div className={`rounded-[2rem] p-6 shadow-soft backdrop-blur ${theme === "dark" ? "border border-white/10 bg-[#121a28]" : "border border-slate-200 bg-white/80"}`}>
          <h3 className={`font-display text-2xl font-extrabold tracking-tight ${theme === "dark" ? "text-white" : "text-slate-900"}`}>Iletisim</h3>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div className={`rounded-[1.4rem] p-4 ${theme === "dark" ? "bg-white/5" : "bg-slate-50"}`}>
              <p className={`text-xs uppercase tracking-[0.28em] ${theme === "dark" ? "text-white/40" : "text-slate-400"}`}>Telefon</p>
              <p className={`mt-2 text-base font-semibold ${theme === "dark" ? "text-white" : "text-slate-900"}`}>{menu.tenant.phone || "Belirtilmedi"}</p>
            </div>
            <div className={`rounded-[1.4rem] p-4 ${theme === "dark" ? "bg-white/5" : "bg-slate-50"}`}>
              <p className={`text-xs uppercase tracking-[0.28em] ${theme === "dark" ? "text-white/40" : "text-slate-400"}`}>Adres</p>
              <p className={`mt-2 text-base font-semibold ${theme === "dark" ? "text-white" : "text-slate-900"}`}>{menu.tenant.address || "Belirtilmedi"}</p>
            </div>
          </div>
        </div>
      </section>

      <footer className={`px-4 pb-8 pt-3 text-center text-xs uppercase tracking-[0.28em] ${theme === "dark" ? "text-white/35" : "text-slate-400"}`}>Joker QR Menu</footer>
    </div>
  );
}
