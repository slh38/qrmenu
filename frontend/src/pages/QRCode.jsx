import { useEffect, useMemo, useState } from "react";
import { request, resolveAssetUrl } from "../lib/api";

const presetOptions = [
  {
    id: "classic",
    name: "Klasik",
    startColor: "#111827",
    endColor: "#111827",
    backgroundColor: "#ffffff",
    labelColor: "#111827",
    frameText: "Joker QR Menu",
    centerMode: "none",
    centerText: "QR",
  },
  {
    id: "brand",
    name: "Marka",
    startColor: "#173b8f",
    endColor: "#2563eb",
    backgroundColor: "#ffffff",
    labelColor: "#173b8f",
    frameText: "Joker QR Menu",
    centerMode: "logo",
    centerText: "QR",
  },
  {
    id: "gradient",
    name: "Gradient",
    startColor: "#7c3aed",
    endColor: "#2563eb",
    backgroundColor: "#ffffff",
    labelColor: "#312e81",
    frameText: "Joker QR Menu",
    centerMode: "text",
    centerText: "QR",
  },
  {
    id: "minimal",
    name: "Minimal",
    startColor: "#334155",
    endColor: "#475569",
    backgroundColor: "#f8fafc",
    labelColor: "#334155",
    frameText: "Joker QR Menu",
    centerMode: "none",
    centerText: "QR",
  },
];

function hexToRgb(hex) {
  const safeHex = hex.replace("#", "");
  const value = safeHex.length === 3
    ? safeHex.split("").map((char) => `${char}${char}`).join("")
    : safeHex;

  return {
    r: Number.parseInt(value.slice(0, 2), 16),
    g: Number.parseInt(value.slice(2, 4), 16),
    b: Number.parseInt(value.slice(4, 6), 16),
  };
}

function mixColor(startHex, endHex, ratio) {
  const start = hexToRgb(startHex);
  const end = hexToRgb(endHex);
  const clamp = Math.max(0, Math.min(1, ratio));

  return {
    r: Math.round(start.r + (end.r - start.r) * clamp),
    g: Math.round(start.g + (end.g - start.g) * clamp),
    b: Math.round(start.b + (end.b - start.b) * clamp),
  };
}

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

function drawFittedText(ctx, text, x, y, maxWidth, startingSize, color) {
  let fontSize = startingSize;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  while (fontSize > 14) {
    ctx.font = `700 ${fontSize}px "Open Sans", sans-serif`;
    if (ctx.measureText(text).width <= maxWidth) {
      break;
    }
    fontSize -= 2;
  }

  ctx.fillStyle = color;
  ctx.fillText(text, x, y);
}

async function buildQrArtwork({ qrCode, logoUrl, businessName, options }) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  const size = 920;
  const qrSize = 760;
  const qrX = (size - qrSize) / 2;
  const qrY = 36;

  canvas.width = size;
  canvas.height = size + 150;

  ctx.fillStyle = options.backgroundColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const qrImage = await loadImage(qrCode);
  const sourceCanvas = document.createElement("canvas");
  sourceCanvas.width = qrImage.width;
  sourceCanvas.height = qrImage.height;
  const sourceCtx = sourceCanvas.getContext("2d");
  sourceCtx.drawImage(qrImage, 0, 0);

  const qrData = sourceCtx.getImageData(0, 0, sourceCanvas.width, sourceCanvas.height);
  const pixels = qrData.data;

  for (let y = 0; y < sourceCanvas.height; y += 1) {
    for (let x = 0; x < sourceCanvas.width; x += 1) {
      const index = (y * sourceCanvas.width + x) * 4;
      const isDarkModule = pixels[index] < 60 && pixels[index + 1] < 60 && pixels[index + 2] < 60 && pixels[index + 3] > 0;

      if (!isDarkModule) {
        pixels[index] = 255;
        pixels[index + 1] = 255;
        pixels[index + 2] = 255;
        pixels[index + 3] = 255;
        continue;
      }

      const ratio = (x + y) / (sourceCanvas.width + sourceCanvas.height);
      const color = mixColor(options.startColor, options.endColor, ratio);
      pixels[index] = color.r;
      pixels[index + 1] = color.g;
      pixels[index + 2] = color.b;
      pixels[index + 3] = 255;
    }
  }

  sourceCtx.putImageData(qrData, 0, 0);

  ctx.save();
  ctx.shadowColor = "rgba(15, 23, 42, 0.08)";
  ctx.shadowBlur = 24;
  ctx.shadowOffsetY = 10;
  ctx.fillStyle = "#ffffff";
  drawRoundedRect(ctx, qrX - 14, qrY - 14, qrSize + 28, qrSize + 28, 36);
  ctx.fill();
  ctx.restore();

  ctx.drawImage(sourceCanvas, qrX, qrY, qrSize, qrSize);

  if (options.centerMode !== "none") {
    const overlaySize = 148;
    const overlayX = size / 2 - overlaySize / 2;
    const overlayY = qrY + qrSize / 2 - overlaySize / 2;

    ctx.save();
    ctx.shadowColor = "rgba(15, 23, 42, 0.14)";
    ctx.shadowBlur = 18;
    ctx.shadowOffsetY = 6;
    ctx.fillStyle = "#ffffff";
    drawRoundedRect(ctx, overlayX, overlayY, overlaySize, overlaySize, 34);
    ctx.fill();
    ctx.restore();

    if (options.centerMode === "logo" && logoUrl) {
      try {
        const logoImage = await loadImage(logoUrl);
        ctx.save();
        drawRoundedRect(ctx, overlayX + 16, overlayY + 16, overlaySize - 32, overlaySize - 32, 24);
        ctx.clip();
        ctx.drawImage(logoImage, overlayX + 16, overlayY + 16, overlaySize - 32, overlaySize - 32);
        ctx.restore();
      } catch {
        drawFittedText(ctx, (businessName || "QR").slice(0, 6).toUpperCase(), size / 2, overlayY + overlaySize / 2, overlaySize - 30, 30, options.labelColor);
      }
    }

    if (options.centerMode === "text") {
      drawFittedText(ctx, (options.centerText || "QR").toUpperCase(), size / 2, overlayY + overlaySize / 2, overlaySize - 24, 32, options.labelColor);
    }
  }

  ctx.fillStyle = options.labelColor;
  ctx.font = `700 44px "Open Sans", sans-serif`;
  ctx.textAlign = "center";
  ctx.fillText(options.frameText || "Joker QR Menu", size / 2, size + 78);

  return canvas.toDataURL("image/png");
}

function VariantButton({ item, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-2xl border px-4 py-3 text-sm font-semibold transition ${
        active ? "border-blue-500 bg-blue-50 text-blue-700" : "border-slate-200 bg-white text-slate-700 hover:border-blue-200"
      }`}
    >
      {item.name}
    </button>
  );
}

export default function QRCodePage() {
  const [data, setData] = useState({
    qrCode: "",
    url: "",
    primaryColor: "#2563eb",
    logoUrl: "",
    businessName: "",
  });
  const [selectedPreset, setSelectedPreset] = useState("brand");
  const [startColor, setStartColor] = useState("#173b8f");
  const [endColor, setEndColor] = useState("#2563eb");
  const [backgroundColor, setBackgroundColor] = useState("#ffffff");
  const [labelColor, setLabelColor] = useState("#173b8f");
  const [frameText, setFrameText] = useState("Joker QR Menu");
  const [centerMode, setCenterMode] = useState("logo");
  const [centerText, setCenterText] = useState("QR");
  const [renderedQr, setRenderedQr] = useState("");
  const [error, setError] = useState("");
  const [copyState, setCopyState] = useState("");

  useEffect(() => {
    request("/qr/generate")
      .then((result) => {
        const next = {
          ...result.data,
          logoUrl: resolveAssetUrl(result.data.logoUrl || ""),
        };
        setData(next);
        setStartColor(result.data.primaryColor || "#173b8f");
        setEndColor("#2563eb");
        setLabelColor(result.data.primaryColor || "#173b8f");
      })
      .catch((loadError) => setError(loadError.message));
  }, []);

  useEffect(() => {
    const preset = presetOptions.find((item) => item.id === selectedPreset);
    if (!preset) {
      return;
    }

    setStartColor(selectedPreset === "brand" ? data.primaryColor || preset.startColor : preset.startColor);
    setEndColor(preset.endColor);
    setBackgroundColor(preset.backgroundColor);
    setLabelColor(selectedPreset === "brand" ? data.primaryColor || preset.labelColor : preset.labelColor);
    setFrameText(preset.frameText);
    setCenterMode(preset.centerMode);
    setCenterText(preset.centerText);
  }, [selectedPreset, data.primaryColor]);

  useEffect(() => {
    if (!data.qrCode) {
      return;
    }

    let cancelled = false;

    buildQrArtwork({
      qrCode: data.qrCode,
      logoUrl: data.logoUrl,
      businessName: data.businessName,
      options: {
        startColor,
        endColor,
        backgroundColor,
        labelColor,
        frameText,
        centerMode,
        centerText,
      },
    })
      .then((image) => {
        if (!cancelled) {
          setRenderedQr(image);
        }
      })
      .catch((renderError) => {
        if (!cancelled) {
          setError(renderError.message);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [data, startColor, endColor, backgroundColor, labelColor, frameText, centerMode, centerText]);

  const downloadQr = () => {
    const link = document.createElement("a");
    link.href = renderedQr || data.qrCode;
    link.download = `qr-menu-${selectedPreset}.png`;
    link.click();
  };

  const copyLink = async () => {
    await navigator.clipboard.writeText(data.url);
    setCopyState("Link kopyalandı.");
    setTimeout(() => setCopyState(""), 1400);
  };

  const previewSource = useMemo(() => renderedQr || data.qrCode, [renderedQr, data.qrCode]);

  return (
    <div className="space-y-6">
      <section className="glass-panel p-6 shadow-soft">
        <h1 className="font-display text-3xl text-ink">QR Kişiselleştirme</h1>
        <p className="mt-2 max-w-2xl text-sm text-slate-600">
          Sadece QR alanına odaklan. QR içi gradient renkleri, ortadaki içerik ve alt yazı anında yenilenir.
        </p>

        {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}

        {data.qrCode ? (
          <div className="mt-8 grid gap-6 xl:grid-cols-[0.88fr_1.12fr]">
            <div className="rounded-[2rem] border border-slate-200 bg-white p-4 shadow-soft">
              <div className="overflow-hidden rounded-[1.4rem] bg-slate-50">
                {previewSource ? <img src={previewSource} alt="QR önizleme" className="w-full object-cover" /> : <div className="aspect-square animate-pulse bg-slate-100" />}
              </div>
              <p className="mt-4 break-all text-center text-sm text-slate-600">{data.url}</p>
              <p className="mt-2 text-center text-xs text-slate-500">Renk ve yazı değişiklikleri anında önizlemeye yansır.</p>
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

            <div className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-soft">
              <h2 className="font-display text-2xl text-ink">Kişiselleştirme</h2>

              <div className="mt-5 flex flex-wrap gap-3">
                {presetOptions.map((preset) => (
                  <VariantButton key={preset.id} item={preset} active={selectedPreset === preset.id} onClick={() => setSelectedPreset(preset.id)} />
                ))}
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-2">
                <label className="space-y-2">
                  <span className="text-sm font-semibold text-slate-700">Başlangıç rengi</span>
                  <input type="color" value={startColor} onChange={(event) => setStartColor(event.target.value)} className="h-12 w-full rounded-xl border border-slate-200 bg-white" />
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-semibold text-slate-700">Bitiş rengi</span>
                  <input type="color" value={endColor} onChange={(event) => setEndColor(event.target.value)} className="h-12 w-full rounded-xl border border-slate-200 bg-white" />
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-semibold text-slate-700">QR arka planı</span>
                  <input type="color" value={backgroundColor} onChange={(event) => setBackgroundColor(event.target.value)} className="h-12 w-full rounded-xl border border-slate-200 bg-white" />
                </label>
                <label className="space-y-2">
                  <span className="text-sm font-semibold text-slate-700">Yazı rengi</span>
                  <input type="color" value={labelColor} onChange={(event) => setLabelColor(event.target.value)} className="h-12 w-full rounded-xl border border-slate-200 bg-white" />
                </label>
                <label className="space-y-2 md:col-span-2">
                  <span className="text-sm font-semibold text-slate-700">Alt yazı</span>
                  <input
                    type="text"
                    value={frameText}
                    onChange={(event) => setFrameText(event.target.value)}
                    maxLength={28}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-400"
                    placeholder="Joker QR Menu"
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
                    maxLength={6}
                    disabled={centerMode !== "text"}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400 focus:border-blue-400"
                    placeholder="QR"
                  />
                </label>
              </div>

              <div className="mt-6 rounded-[1.5rem] bg-blue-50 p-4 text-sm leading-6 text-slate-600">
                Ortadaki kısa metni otomatik küçültüyoruz. Böylece yazı kutuya taşmadan daha dengeli görünür.
              </div>
            </div>
          </div>
        ) : null}
      </section>
    </div>
  );
}
