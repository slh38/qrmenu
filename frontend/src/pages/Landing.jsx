import { useEffect } from "react";
import { Link } from "react-router-dom";

const featureCards = [
  {
    title: "QR Kod ile Kolay Erisim",
    text: "Masadaki tek bir kod ile menunuzu aninda acin, baski maliyetini azaltin ve servis akisini hizlandirin.",
  },
  {
    title: "Anlik Guncelleme",
    text: "Fiyat, kategori ve urun degisikliklerini panelden dakikalar icinde yayinlayin. Yeni baski beklemeyin.",
  },
  {
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

function SectionTitle({ eyebrow, title, text }) {
  return (
    <div className="max-w-2xl">
      <p className="text-sm font-semibold uppercase tracking-[0.32em] text-[#2563eb]">{eyebrow}</p>
      <h2 className="mt-4 font-display text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">{title}</h2>
      <p className="mt-4 text-base leading-7 text-slate-600">{text}</p>
    </div>
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
    ensureMeta(
      "keywords",
      "qr menu, dijital menu, restoran qr menu, cafe qr menu, jokerqrmenu"
    );
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
                <div className="absolute left-0 top-10 hidden h-72 w-56 rounded-[2rem] bg-white/70 shadow-soft backdrop-blur lg:block" />
                <div className="absolute right-0 top-14 hidden w-56 rounded-[2rem] bg-gradient-to-br from-[#173b8f] to-[#2563eb] p-5 text-white shadow-[0_26px_60px_rgba(23,59,143,0.34)] lg:block">
                  <h3 className="text-3xl font-extrabold tracking-tight">JokerQRMenu</h3>
                  <div className="mt-6 rounded-[1.6rem] bg-white p-4">
                    <div className="aspect-square w-full rounded-[1.1rem] bg-[linear-gradient(90deg,#111_10%,transparent_10%),linear-gradient(#111_10%,transparent_10%)] bg-[length:18px_18px] bg-white p-4" />
                  </div>
                  <p className="mt-6 text-center text-2xl font-extrabold leading-tight">MENU ICIN OKUTUN</p>
                </div>

                <div className="mx-auto w-full max-w-[360px] rounded-[3rem] border-[10px] border-slate-950 bg-white px-5 pb-7 pt-6 shadow-[0_34px_80px_rgba(15,23,42,0.22)]">
                  <div className="mx-auto h-6 w-36 rounded-full bg-slate-950" />
                  <div className="mt-6 text-center">
                    <p className="font-display text-3xl font-extrabold text-slate-950">
                      Joker<span className="text-[#2563eb]">QRMenu</span>
                    </p>
                    <p className="mt-2 text-sm text-slate-500">Lezzetli anlar, hizli erisim</p>
                  </div>
                  <div className="mt-5 flex justify-center gap-3 text-[#2563eb]">
                    {[1, 2, 3, 4].map((item) => (
                      <span key={item} className="inline-flex h-10 w-10 rounded-2xl bg-blue-50" />
                    ))}
                  </div>
                  <div className="mt-6 space-y-4">
                    {[
                      { category: "BASLANGICLAR", items: [["Bruschetta", "85"], ["Carpaccio", "120"], ["Corba", "65"]] },
                      { category: "ANA YEMEKLER", items: [["Dana Antrikot", "245"], ["Tavuk Izgara", "165"]] },
                    ].map((section) => (
                      <div key={section.category}>
                        <div className="rounded-2xl bg-[#2563eb] px-4 py-3 text-sm font-bold text-white">{section.category}</div>
                        <div className="mt-3 space-y-3">
                          {section.items.map(([name, price]) => (
                            <div key={name} className="flex items-center justify-between rounded-2xl bg-slate-50 px-3 py-3">
                              <div className="flex items-center gap-3">
                                <div className="h-11 w-11 rounded-2xl bg-orange-100" />
                                <div>
                                  <p className="text-sm font-bold text-slate-900">{name}</p>
                                  <p className="text-xs text-slate-500">Gunluk taze icerik</p>
                                </div>
                              </div>
                              <p className="text-sm font-extrabold text-slate-900">₺{price}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
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
                <div className="inline-flex h-14 w-14 rounded-[1.25rem] bg-blue-50" />
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
            text="Showcase, Minimal ve Editorial gibi farkli gorunumlerle restoraninizin ruhuna uygun bir menu vitrini kurun."
          />

          <div className="mt-10 grid gap-5 lg:grid-cols-3">
            {[
              ["Showcase", "Gorsel agirlikli kategori vitrini ve guclu kapak sunumu."],
              ["Minimal", "Sade, hizli ve fiyat odakli okunabilir deneyim."],
              ["Editorial", "Premium hissi veren buyuk tipografi ve zengin bloklar."],
            ].map(([title, text], index) => (
              <div key={title} className="overflow-hidden rounded-[2rem] border border-white/70 bg-white shadow-soft">
                <div
                  className={`h-44 ${
                    index === 0
                      ? "bg-gradient-to-br from-[#173b8f] via-[#2563eb] to-[#78a9ff]"
                      : index === 1
                        ? "bg-gradient-to-br from-slate-100 to-white"
                        : "bg-gradient-to-br from-[#111827] to-[#374151]"
                  }`}
                />
                <div className="p-6">
                  <h3 className="text-xl font-extrabold tracking-tight text-slate-900">{title}</h3>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{text}</p>
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
                  <span className="font-display text-5xl font-extrabold tracking-tight">₺0</span>
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
