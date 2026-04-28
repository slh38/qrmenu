import { useEffect, useState } from "react";
import { request } from "../lib/api";

export default function QRCodePage() {
  const [data, setData] = useState({ qrCode: "", url: "" });
  const [error, setError] = useState("");

  useEffect(() => {
    request("/qr/generate")
      .then((result) => setData(result.data))
      .catch((loadError) => setError(loadError.message));
  }, []);

  const downloadQr = () => {
    const link = document.createElement("a");
    link.href = data.qrCode;
    link.download = "qr-menu.png";
    link.click();
  };

  const copyLink = async () => {
    await navigator.clipboard.writeText(data.url);
  };

  return (
    <div className="glass-panel p-6 shadow-soft">
      <h1 className="font-display text-3xl text-ink">QR Kod</h1>
      <p className="mt-2 text-sm text-slate-600">Bu QR kodu masaniza veya menunuze yapistirin.</p>

      {error ? <p className="mt-4 text-sm text-red-600">{error}</p> : null}

      {data.qrCode ? (
        <div className="mt-8 flex flex-col items-center gap-5">
          <div className="rounded-[2rem] bg-white p-4 shadow-soft">
            <img src={data.qrCode} alt="QR Code" className="h-72 w-72 max-w-full" />
          </div>
          <p className="max-w-xl break-all text-center text-sm text-slate-600">{data.url}</p>
          <div className="flex flex-col gap-3 sm:flex-row">
            <button onClick={downloadQr} className="rounded-2xl bg-[#173b8f] px-5 py-3 font-semibold text-white">
              Download QR Code
            </button>
            <button onClick={copyLink} className="rounded-2xl border border-blue-200 px-5 py-3 font-semibold text-slate-700">
              Copy Link
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
