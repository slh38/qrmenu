import { useEffect } from "react";
import { Link } from "react-router-dom";

const featureCards = [
  {
    icon: "qr",
    title: "QR Kod ile Kolay Erisim",
    text: "Masadaki tek bir kod ile menunuzu aninda acin, baski maliyetini azaltin ve servis akisini hizlandirin.",
  },
  {
    icon: "refresh",
    title: "Anlik Guncelleme",
    text: "Fiyat, kategori ve urun degisikliklerini panelden dakikalar icinde yayinlayin. Yeni baski beklemeyin.",
  },
  {
    icon: "palette",
    title: "Tema Secenekleri",
    text: "Restoraniniza uygun modern menu sunumunu secin, sosyal medya ve marka alanlariyla daha guclu gorunun.",
  },
];

const stats = [
  { label: "Mobil Uyumlu", value: "%100" },
  { label: "Tema Secenegi", value: "3+" },
  { label: "Kurulum Suresi", value: "10 dk" },
];

const steps = [
  "Isletmenizi kaydedin ve temel bilgileri ekleyin.",
  "Kategori, urun, gorsel ve sosyal medya alanlarini yonetin.",
  "QR kodunuzu olusturun ve masalarinizda kullanin.",
];

const pricing = [
  "Sinirsiz kategori ve urun yonetimi",
  "QR kod olusturma ve public menu yayini",
  "Tema secimi, logo, kapak ve sosyal medya destegi",
];

const themeCards = [
  {
    title: "Showcase",
    text: "Gorsel agirlikli kategori vitrini ve guclu kapak sunumu.",
    previewClass: "bg-gradient-to-br from-[#173b8f] via-[#2563eb] to-[#78a9ff]",
    preview: (
      <div className="space-y-3 p-4">
        <div className="h-16 rounded-2xl bg-white/20" />
        <div className="grid grid-cols-2 gap-2">
          <div className="h-14 rounded-2xl bg-white/80" />
          <div className="h-14 rounded-2xl bg-white/35" />
        </div>
      </div>
    ),
  },
  {
    title: "Dark",
    text: "Koyu arka plan, iki sutun kategori vitrini ve gece hissi veren sunum.",
    previewClass: "bg-gradient-to-br from-[#0f172a] via-[#111827] to-[#334155]",
    preview: (
      <div className="space-y-3 p-4">
        <div className="mx-auto h-8 w-8 rounded-full bg-white/90" />
        <div className="grid grid-cols-2 gap-2">
          <div className="h-14 rounded-2xl border border-white/10 bg-white/10" />
          <div className="h-14 rounded-2xl border border-white/10 bg-white/5" />
        </div>
      </div>
    ),
  },
  {
    title: "Editorial",
    text: "Premium hissi veren buyuk tipografi ve zengin bloklar.",
    previewClass: "bg-gradient-to-br from-[#111827] to-[#374151]",
    preview: (
      <div className="space-y-3 p-4">
        <div className="h-5 w-24 rounded-full bg-white/25" />
        <div className="h-16 rounded-2xl bg-white/10" />
        <div className="h-4 w-32 rounded-full bg-white/20" />
      </div>
    ),
  },
];

function SectionTitle({ eyebrow, title, text }) {
  return (
    <div className="max-w-2xl">
      <p className="text-sm font-semibold uppercase tracking-[0.32em] text-[#2563eb]">{eyebrow}</p>
      <h2 className="mt-4 font-display text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">{title}</h2>
      <p className="mt-4 text-base leading-7 text-slate-600">{text}</p>
    </div>
  );
}

function FeatureIcon({ type }) {
  const baseClass = "h-7 w-7 text-[#2563eb]";

  if (type === "qr") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" className={baseClass}>
        <rect x="3" y="3" width="6" height="6" rx="1.2" />
        <rect x="15" y="3" width="6" height="6" rx="1.2" />
        <rect x="3" y="15" width="6" height="6" rx="1.2" />
        <path d="M15 15h2v2h-2zM19 15h2v2h-2zM17 17h2v2h-2zM15 19h4M7 7h0M19 7h0M7 19h0" />
      </svg>
    );
  }

  if (type === "refresh") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" className={baseClass}>
        <path d="M20 6v5h-5" />
        <path d="M4 18v-5h5" />
        <path d="M6.8 9A7 7 0 0 1 18 7l2 4" />
        <path d="M17.2 15A7 7 0 0 1 6 17l-2-4" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" className={baseClass}>
      <path d="M12 3l1.6 3.5L17 8l-3.4 1.5L12 13l-1.6-3.5L7 8l3.4-1.5L12 3Z" />
      <path d="M5 14l.9 2 .1 2.1L8 19l-2 1 .1 1.9L4 21l-2 1 .1-1.9L0 19l2-1 .1-2.1L3 14l2 1Z" transform="translate(8 0)" />
      <path d="M4 20c2-3 6-5 8-5s6 2 8 5" />
    </svg>
  );
}

export default function Landing() {
  useEffect(() => {
    document.title = "JokerQRMenu | Restoranlar Icin Dijital QR Menu";

    const ensureMeta = (name, content) => {
      let tag = document.querySelector(`meta[name="${name}"]`);
      if (!tag) {
        tag = document.createElement("meta");
        tag.setAttribute("name", name);
        document.head.appendChild(tag);
      }
      tag.setAttribute("content", content);
    };

    ensureMeta(
      "description",
      "JokerQRMenu ile restoraniniz icin mobil uyumlu, modern ve hizli yonetilebilen dijital QR menu olusturun."
    );
    ensureMeta("keywords", "qr menu, dijital menu, restoran qr menu, cafe qr menu, jokerqrmenu");
  }, []);

  return (
    <div className="min-h-screen bg-[#f7faff] text-slate-900">
      <header className="sticky top-0 z-40 border-b border-white/60 bg-white/85 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link to="/" className="font-display text-3xl font-extrabold tracking-tight text-slate-950">
            JokerQRMenu
          </Link>

          <nav className="hidden items-center gap-8 lg:flex">
            <a href="#ozellikler" className="text-sm font-semibold text-slate-700 transition hover:text-[#2563eb]">
              Ozellikler
            </a>
            <a href="#nasil-calisir" className="text-sm font-semibold text-slate-700 transition hover:text-[#2563eb]">
              Nasil Calisir?
            </a>
            <a href="#temalar" className="text-sm font-semibold text-slate-700 transition hover:text-[#2563eb]">
              Temalar
            </a>
            <a href="#fiyatlar" className="text-sm font-semibold text-slate-700 transition hover:text-[#2563eb]">
              Fiyatlar
            </a>
            <a href="#iletisim" className="text-sm font-semibold text-slate-700 transition hover:text-[#2563eb]">
              Iletisim
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="hidden rounded-2xl border border-[#c9d8ff] px-5 py-3 text-sm font-semibold text-[#173b8f] transition hover:bg-blue-50 sm:inline-flex"
            >
              Giris Yap
            </Link>
            <Link
              to="/register"
              className="inline-flex rounded-2xl bg-[#2563eb] px-5 py-3 text-sm font-semibold text-white shadow-[0_16px_40px_rgba(37,99,235,0.28)] transition hover:bg-[#1d4ed8]"
            >
              Ucretsiz Basla
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(37,99,235,0.16),transparent_32%),radial-gradient(circle_at_right,rgba(120,169,255,0.24),transparent_28%),linear-gradient(180deg,#fafdff_0%,#eef4ff_100%)]" />
          <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1fr_1.02fr] lg:px-8 lg:py-20">
            <div className="max-w-2xl">
              <div className="inline-flex rounded-full border border-blue-100 bg-white/80 px-4 py-2 text-sm font-semibold text-[#2563eb]">
                Modern • Hizli • Kolay
              </div>
              <h1 className="mt-7 font-display text-5xl font-extrabold leading-[1.04] tracking-tight text-slate-950 sm:text-6xl">
                QR Menu ile
                <br />
                Menunuz Hep
                <br />
                <span className="text-[#2563eb]">Dijital, Hep Guncel</span>
              </h1>
              <p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">
                JokerQRMenu ile restoraniniz icin dijital menu olusturun, fiyat ve urun degisikliklerini panelden yonetin
                ve musterilerinize profesyonel bir QR deneyimi sunun.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center rounded-[1.4rem] bg-[#2563eb] px-7 py-4 text-base font-semibold text-white shadow-[0_18px_45px_rgba(37,99,235,0.28)] transition hover:bg-[#1d4ed8]"
                >
                  Ucretsiz Basla
                </Link>
                <a
                  href="#temalar"
                  className="inline-flex items-center justify-center rounded-[1.4rem] border border-[#c9d8ff] bg-white px-7 py-4 text-base font-semibold text-[#173b8f] transition hover:bg-blue-50"
                >
                  Temalari Incele
                </a>
              </div>

              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                {stats.map((stat) => (
                  <div key={stat.label} className="rounded-[1.6rem] border border-white/70 bg-white/80 p-4 shadow-soft">
                    <p className="text-2xl font-extrabold tracking-tight text-[#173b8f]">{stat.value}</p>
                    <p className="mt-1 text-sm text-slate-600">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative flex items-center justify-center">
              <div className="relative w-full max-w-[620px]">
                <div className="absolute right-0 top-16 hidden w-52 rounded-[2rem] bg-gradient-to-br from-[#173b8f] to-[#2563eb] p-5 text-white shadow-[0_26px_60px_rgba(23,59,143,0.34)] lg:block">
                  <h3 className="text-[1.72rem] font-extrabold tracking-tight leading-none">JokerQRMenu</h3>
                  <div className="mt-6 rounded-[1.6rem] bg-white p-4">
                    <div className="overflow-hidden rounded-[1.1rem] border border-slate-200 bg-[#f8fbff] p-3">
                      <img src="/joker-qr.png" alt="JokerQRMenu demo qr" className="aspect-square w-full rounded-[0.95rem] object-cover" />
                    </div>
                  </div>
                  <p className="mt-6 text-center text-lg font-extrabold leading-snug tracking-tight">Demo Menu Icin Okutun</p>
                </div>

                <div className="mx-auto w-full max-w-[360px] lg:mr-20">
                  <img
                    src="/menu-phone.png"
                    alt="JokerQRMenu telefon menu gorunumu"
                    className="h-auto max-h-[720px] w-full object-contain object-top drop-shadow-[0_30px_65px_rgba(15,23,42,0.22)]"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="ozellikler" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <SectionTitle
            eyebrow="Ozellikler"
            title="Restoraniniza uygun hizli ve profesyonel QR menu altyapisi"
            text="JokerQRMenu; kategori yonetimi, tema secenekleri, sosyal medya linkleri ve mobil odakli public menu deneyimiyle isletmenizi dijitale tasir."
          />

          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {featureCards.map((card) => (
              <article key={card.title} className="rounded-[2rem] border border-white/70 bg-white/85 p-6 shadow-soft">
                <div className="inline-flex h-14 w-14 items-center justify-center rounded-[1.25rem] bg-blue-50">
                  <FeatureIcon type={card.icon} />
                </div>
                <h3 className="mt-5 text-xl font-extrabold tracking-tight text-slate-900">{card.title}</h3>
                <p className="mt-3 text-sm leading-7 text-slate-600">{card.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="nasil-calisir" className="bg-white/70">
          <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
            <SectionTitle
              eyebrow="Nasil Calisir?"
              title="Dakikalar icinde menu olusturup QR ile servis edin"
              text="Sistemi teknik bilgi gerektirmeden kurabilir, menunuzu panelden yonetebilir ve musterilerinize tek bir QR ile profesyonel deneyim sunabilirsiniz."
            />

            <div className="mt-10 grid gap-5 lg:grid-cols-3">
              {steps.map((step, index) => (
                <div key={step} className="rounded-[2rem] border border-slate-100 bg-white p-6 shadow-soft">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[#2563eb] text-lg font-extrabold text-white">
                    {index + 1}
                  </div>
                  <p className="mt-5 text-base font-semibold leading-7 text-slate-800">{step}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="temalar" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <SectionTitle
            eyebrow="Temalar"
            title="Markaniza uygun farkli menu deneyimleri"
            text="Showcase, Dark ve Editorial gibi farkli gorunumlerle restoraninizin ruhuna uygun bir menu vitrini kurun."
          />

          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {themeCards.map((card) => (
              <div key={card.title} className="overflow-hidden rounded-[2rem] border border-white/70 bg-white shadow-soft">
                <div className={`h-44 ${card.previewClass}`}>{card.preview}</div>
                <div className="p-6">
                  <h3 className="text-xl font-extrabold tracking-tight text-slate-900">{card.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{card.text}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section id="fiyatlar" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="rounded-[2.4rem] bg-gradient-to-br from-[#173b8f] via-[#2563eb] to-[#5b8cff] p-8 text-white shadow-[0_28px_80px_rgba(37,99,235,0.25)] sm:p-12">
            <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.32em] text-blue-100">Fiyatlar</p>
                <h2 className="mt-4 font-display text-4xl font-extrabold tracking-tight sm:text-5xl">Hemen kullanmaya baslayin</h2>
                <p className="mt-5 max-w-xl text-base leading-8 text-white/80">
                  Baslangic icin tek plan yeterli. Sonraki sayfalarda paketleri detaylandiririz; simdilik amac hizli cikis
                  ve guclu bir ilk izlenim.
                </p>
              </div>

              <div className="rounded-[2rem] bg-white p-6 text-slate-900 shadow-soft">
                <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#2563eb]">Baslangic</p>
                <div className="mt-4 flex items-end gap-2">
                  <span className="font-display text-5xl font-extrabold tracking-tight">₺2500</span>
                  <span className="pb-2 text-sm text-slate-500">ile basla</span>
                </div>
                <ul className="mt-6 space-y-3 text-sm leading-7 text-slate-600">
                  {pricing.map((item) => (
                    <li key={item} className="flex gap-3">
                      <span className="mt-2 h-2.5 w-2.5 rounded-full bg-[#2563eb]" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  to="/register"
                  className="mt-8 inline-flex w-full items-center justify-center rounded-[1.35rem] bg-[#2563eb] px-6 py-4 text-base font-semibold text-white transition hover:bg-[#1d4ed8]"
                >
                  Ucretsiz Hesap Olustur
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section id="iletisim" className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
          <div className="rounded-[2.2rem] border border-white/70 bg-white/85 p-8 shadow-soft sm:p-10">
            <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-center">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.32em] text-[#2563eb]">Iletisim</p>
                <h2 className="mt-4 font-display text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                  Demo isteyin, birlikte kurulum planlayalim
                </h2>
                <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600">
                  JokerQRMenu ile restoraniniza uygun dijital menu deneyimini birlikte sekillendirebiliriz. Sonraki
                  asamada alt sayfalari ve fiyat yapisini da genisletiriz.
                </p>
              </div>
              <div className="flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center rounded-[1.35rem] border border-[#c9d8ff] px-6 py-4 text-base font-semibold text-[#173b8f] transition hover:bg-blue-50"
                >
                  Panele Gir
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center rounded-[1.35rem] bg-[#2563eb] px-6 py-4 text-base font-semibold text-white transition hover:bg-[#1d4ed8]"
                >
                  Ucretsiz Basla
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
