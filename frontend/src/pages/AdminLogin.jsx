import { useState } from "react";
import { adminRequest, setAdminToken } from "../lib/admin";

export default function AdminLogin({ onSuccess }) {
  const [form, setForm] = useState({ username: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await adminRequest("/admin/login", {
        method: "POST",
        body: JSON.stringify(form),
      });

      setAdminToken(result.data.token);
      onSuccess?.();
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="w-full max-w-md rounded-[2rem] border border-blue-100/80 bg-white/90 p-8 shadow-soft backdrop-blur">
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#2563eb]">JokerQRMenu Admin</p>
          <h1 className="mt-3 font-display text-4xl text-ink">Yönetim Girişi</h1>
          <p className="mt-3 text-sm text-slate-600">Tüm QR menüleri tek panelden görmek için admin bilgilerinle giriş yap.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Kullanıcı adı"
            value={form.username}
            onChange={(event) => setForm({ ...form, username: event.target.value })}
            className="w-full rounded-2xl border border-blue-100 bg-white px-4 py-3 outline-none transition focus:border-blue-400"
            required
          />
          <input
            type="password"
            placeholder="Şifre"
            value={form.password}
            onChange={(event) => setForm({ ...form, password: event.target.value })}
            className="w-full rounded-2xl border border-blue-100 bg-white px-4 py-3 outline-none transition focus:border-blue-400"
            required
          />

          {error ? <p className="text-sm text-red-600">{error}</p> : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-[#2563eb] px-4 py-3 font-semibold text-white transition hover:bg-[#1d4ed8] disabled:opacity-60"
          >
            {loading ? "Giriş yapılıyor..." : "Admin paneline gir"}
          </button>
        </form>
      </div>
    </div>
  );
}
