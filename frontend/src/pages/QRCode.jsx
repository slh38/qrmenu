import { useEffect, useMemo, useState } from "react";
import { request, resolveAssetUrl } from "../lib/api";

const variantPresets = [
  {
    id: "classic",
    name: "Klasik",
    cardBackground: "#ffffff",
    accentFrom: "#1e3a8a",
    accentTo: "#2563eb",
    frameText: "Menü için okutun",
    centerMode: "none",
  },
  {
    id: "brand",
    name: "Marka",
    cardBackground: "#eff6ff",
    accentFrom: "#1d4ed8",
    accentTo: "#60a5fa",
    frameText: "Joker QR Menu",
    centerMode: "logo",
  },
  {
    id: "gradient",
    name: "Gradient",
    cardBackground: "#f8fbff",
    accentFrom: "#0f172a",
    accentTo: "#2563eb",
    frameText: "Hızlı Menü",
    centerMode: "text",
  },
  {
    id: "minimal",
    name: "Minimal",
    cardBackground: "#ffffff",
    accentFrom: "#334155",
    accentTo: "#334155",
    frameText: "Scan me",
    centerMode: "none",
  },
];

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = src;
  });
}

function drawRoundedRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

async function buildStyledQr({ qrCode, logoUrl, businessName, options }) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  const width = 980;
  const height = 1280;
  const qrPanelSize = 620;
  const qrPanelX = (width - qrPanelSize) / 2;
  const qrPanelY = 220;

  canvas.width = width;
  canvas.height = height;

  ctx.fillStyle = options.cardBackground;
  ctx.fillRect(0, 0, width, height);

  const gradient = ctx.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, options.accentFrom);
  gradient.addColorStop(1, options.accentTo);

  ctx.save();
  drawRoundedRect(ctx, 40, 40, width - 80, height - 80, 54);
  ctx.clip();
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(40, 40, width - 80, height - 80);
  ctx.restore();

  ctx.save();
  ctx.globalAlpha = 0.16;
  ctx.fillStyle = gradient;
  drawRoundedRect(ctx, 40, 40, width - 80, 280, 54);
  ctx.fill();
  ctx.restore();

  ctx.strokeStyle = "rgba(255,255,255,0.75)";
  ctx.lineWidth = 4;
  drawRoundedRect(ctx, 40, 40, width - 80, height - 80, 54);
  ctx.stroke();

  ctx.fillStyle = "#0f172a";
  ctx.font = "700 34px 'Open Sans', sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(businessName || "Joker QR Menu", width / 2, 132);

  ctx.fillStyle = "#475569";
  ctx.font = "500 24px 'Open Sans', sans-serif";
  ctx.fillText("Dijital menüye hızlı erişim", width / 2, 176);

  ctx.save();
  ctx.shadowColor = "rgba(15, 23, 42, 0.16)";
  ctx.shadowBlur = 40;
  ctx.shadowOffsetY = 18;
  ctx.fillStyle = "#ffffff";
  drawRoundedRect(ctx, qrPanelX, qrPanelY, qrPanelSize, qrPanelSize, 42);
  ctx.fill();
  ctx.restore();

  const qrImage = await loadImage(qrCode);
  ctx.drawImage(qrImage, qrPanelX + 40, qrPanelY + 40, qrPanelSize - 80, qrPanelSize - 80);

  if (options.centerMode !== "none") {
    const overlaySize = 150;
    const overlayX = width / 2 - overlaySize / 2;
    const overlayY = qrPanelY + qrPanelSize / 2 - overlaySize / 2;

    ctx.save();
    ctx.shadowColor = "rgba(15, 23, 42, 0.2)";
    ctx.shadowBlur = 24;
    ctx.shadowOffsetY = 8;
    ctx.fillStyle = "#ffffff";
    drawRoundedRect(ctx, overlayX, overlayY, overlaySize, overlaySize, 36);
    ctx.fill();
    ctx.restore();

    if (options.centerMode === "logo" && logoUrl) {
      try {
        const logoImage = await loadImage(logoUrl);
        ctx.save();
        drawRoundedRect(ctx, overlayX + 18, overlayY + 18, overlaySize - 36, overlaySize - 36, 28);
        ctx.clip();
        ctx.drawImage(logoImage, overlayX + 18, overlayY + 18, overlaySize - 36, overlaySize - 36);
        ctx.restore();
      } catch {
        ctx.fillStyle = "#0f172a";
        ctx.font = "700 28px 'Open Sans', sans-serif";
        ctx.textAlign = "center";
        ctx.fillText((businessName || "JQ").slice(0, 2).toUpperCase(), width / 2, overlayY + 88);
      }
    }

    if (options.centerMode === "text") {
      ctx.fillStyle = options.accentFrom;
      ctx.font = "700 28px 'Open Sans', sans-serif";
      ctx.textAlign = "center";
      ctx.fillText((options.centerText || "MENU").slice(0, 8).toUpperCase(), width / 2, overlayY + 88);
    }
  }

  ctx.fillStyle = gradient;
  drawRoundedRect(ctx, 180, 920, width - 360, 92, 30);
  ctx.fill();

  ctx.fillStyle = "#ffffff";
  ctx.font = "700 34px 'Open Sans', sans-serif";
  ctx.textAlign = "center";
  ctx.fillText(options.frameText || "Menü için okutun", width / 2, 978);

  ctx.fillStyle = "#475569";
  ctx.font = "500 22px 'Open Sans', sans-serif";
  ctx.fillText("Kameranızı QR koda tutun", width / 2, 1070);

  return canvas.toDataURL("image/png");
}

function TemplateCard({ variant, preview, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`overflow-hidden rounded-[1.6rem] border text-left transition ${
        active ? "border-blue-500 bg-blue-50 shadow-soft" : "border-slate-200 bg-white hover:border-blue-200"
      }`}
    >
      <div className="p-3">
        <div className="overflow-hidden rounded-[1.1rem] border border-slate-100 bg-slate-50">
          {preview ? <img src={preview} alt={variant.name} className="aspect-[4/5] w-full object-cover" /> : <div className="aspect-[4/5] w-full animate-pulse bg-slate-100" />}
        </div>
        <p className="mt-3 text-sm font-semibold text-slate-900">{variant.name}</p>
      </div>
    </button>
  );
}

export default function QRCodePage() {
  const [data, setData] = useState({ qrCode: "", url: "", primaryColor: "#2563eb", logoUrl: "", businessName: "" });
  const [selectedVariant, setSelectedVariant] = useState("brand");
  const [centerMode, setCenterMode] = useState("logo");
  const [centerText, setCenterText] = useState("MENU");
  const [frameText, setFrameText] = useState("Menü için okutun");
  const [accentFrom, setAccentFrom] = useState("#173b8f");
  const [accentTo, setAccentTo] = useState("#2563eb");
  const [error, setError] = useState("");
  const [copyState, setCopyState] = useState("");
  const [variantImages, setVariantImages] = useState({});

  useEffect(() => {
    request("/qr/generate")
      .then((result) => {
        const next = {
          ...result.data,
          logoUrl: resolveAssetUrl(result.data.logoUrl || ""),
        };
        setData(next);
        setAccentFrom(result.data.primaryColor || "#173b8f");
        setAccentTo("#2563eb");
      })
      .catch((loadError) => setError(loadError.message));
  }, []);

  useEffect(() => {
    if (!data.qrCode) {
      return;
    }

    let cancelled = false;

    (async () => {
      const nextImages = {};

      for (const variant of variantPresets) {
        nextImages[variant.id] = await buildStyledQr({
          qrCode: data.qrCode,
          logoUrl: data.logoUrl,
          businessName: data.businessName,
          options: {
            ...variant,
            centerText,
          },
        });
      }

      const customVariant = await buildStyledQr({
        qrCode: data.qrCode,
        logoUrl: data.logoUrl,
        businessName: data.businessName,
        options: {
          cardBackground: "#ffffff",
          accentFrom,
          accentTo,
          frameText,
          centerMode,
          centerText,
        },
      });

      if (!cancelled) {
        setVariantImages({ ...nextImages, custom: customVariant });
      }
    })().catch((buildError) => {
      if (!cancelled) {
        setError(buildError.message);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [data, accentFrom, accentTo, centerMode, centerText, frameText]);

  const activeImage = useMemo(() => {
    return selectedVariant === "custom" ? variantImages.custom : variantImages[selectedVariant];
  }, [selectedVariant, variantImages]);

  const downloadQr = () => {
    const link = document.createElement("a");
    link.href = activeImage || data.qrCode;
    link.download = `qr-menu-${selectedVariant}.png`;
    link.click();
  };

  const copyLink = async () => {
    await navigator.clipboard.writeText(data.url);
    setCopyState("Link kopyalandi.");
    setTimeout(() => setCopyState(""), 1500);
  };

  return (
    <div className="space-y-6">
      <section className="glass-panel p-6 shadow-soft">
        <h1 className="font-display text-3xl text-ink">QR Kod Stüdyosu</h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-600">
          Hazır QR varyasyonları arasından seçim yapabilir, renkleri değiştirebilir ve ortadaki alanı logo veya kısa metinle kişiselleştirebilirsin.
        </p>

        {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}

        {data.qrCode ? (
          <div className="mt-8 grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
            <div className="space-y-6">
              <div className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-soft">
                <div className="overflow-hidden rounded-[1.5rem] bg-slate-50">
                  {activeImage ? <img src={activeImage} alt="QR önizleme" className="w-full object-cover" /> : <div className="aspect-[4/5] animate-pulse bg-slate-100" />}
                </div>
                <p className="mt-4 break-all text-center text-sm text-slate-600">{data.url}</p>
                <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                  <button onClick={downloadQr} className="rounded-2xl bg-[#173b8f] px-5 py-3 font-semibold text-white">
                    QR İndir
                  </button>
                  <button onClick={copyLink} className="rounded-2xl border border-blue-200 px-5 py-3 font-semibold text-slate-700">
                    Linki Kopyala
                  </button>
                </div>
                {copyState ? <p className="mt-3 text-sm text-green-700">{copyState}</p> : null}
              </div>

              <div>
                <h2 className="font-display text-2xl text-ink">Hazır Varyasyonlar</h2>
                <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-2">
                  {variantPresets.map((variant) => (
                    <TemplateCard
                      key={variant.id}
                      variant={variant}
                      preview={variantImages[variant.id]}
                      active={selectedVariant === variant.id}
                      onClick={() => setSelectedVariant(variant.id)}
                    />
                  ))}
                  <TemplateCard
                    variant={{ id: "custom", name: "Kişisel" }}
                    preview={variantImages.custom}
                    active={selectedVariant === "custom"}
                    onClick={() => setSelectedVariant("custom")}
                  />
                </div>
              </div>
            </div>

            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft">
              <h2 className="font-display text-2xl text-ink">Kişiselleştirme</h2>
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <label className="space-y-2">
                  <span className="text-sm font-semibold text-slate-700">Başlangıç rengi</span>
                  <input type="color" value={accentFrom} onChange={(event) => setAccentFrom(event.target.value)} className="h-12 w-full rounded-xl border border-slate-200 bg-white" />
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-semibold text-slate-700">Bitiş rengi</span>
                  <input type="color" value={accentTo} onChange={(event) => setAccentTo(event.target.value)} className="h-12 w-full rounded-xl border border-slate-200 bg-white" />
                </label>
                <label className="space-y-2 md:col-span-2">
                  <span className="text-sm font-semibold text-slate-700">Alt çerçeve metni</span>
                  <input
                    type="text"
                    value={frameText}
                    onChange={(event) => setFrameText(event.target.value)}
                    maxLength={28}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-400"
                    placeholder="Menü için okutun"
                  />
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-semibold text-slate-700">Orta alan</span>
                  <select
                    value={centerMode}
                    onChange={(event) => setCenterMode(event.target.value)}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-400"
                  >
                    <option value="logo">Logo</option>
                    <option value="text">Kısa metin</option>
                    <option value="none">Kapalı</option>
                  </select>
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-semibold text-slate-700">Orta metin</span>
                  <input
                    type="text"
                    value={centerText}
                    onChange={(event) => setCenterText(event.target.value)}
                    maxLength={8}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-400"
                    placeholder="MENU"
                  />
                </label>
              </div>

              <div className="mt-6 rounded-[1.5rem] bg-blue-50 p-4 text-sm leading-6 text-slate-600">
                Ortadaki alanı küçük tutuyoruz. Bu sayede okutma güvenliği korunuyor. İleride istersen logo yükleme, çerçeve şablonları ve renk paketlerini de genişletebiliriz.
              </div>
            </div>
          </div>
        ) : null}
      </section>
    </div>
  );
}
