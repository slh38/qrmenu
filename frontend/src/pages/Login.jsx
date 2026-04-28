import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { request } from "../lib/api";

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await request("/auth/login", {
        method: "POST",
        body: JSON.stringify(form),
      });

      localStorage.setItem("qrmenu_token", result.data.token);
      localStorage.setItem("qrmenu_tenant", JSON.stringify(result.data.tenant));
      navigate("/dashboard");
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="grid w-full max-w-5xl gap-6 lg:grid-cols-[1.15fr_0.85fr]">
        <section className="rounded-[2rem] bg-gradient-to-br from-[#173b8f] via-[#2563eb] to-[#5b8cff] p-8 text-white shadow-soft sm:p-10">
          <p className="text-sm uppercase tracking-[0.35em] text-blue-100">Restaurant SaaS</p>
          <h1 className="mt-4 font-display text-4xl leading-tight sm:text-5xl">
            QR menu yonetimini tek panelden kontrol et.
          </h1>
          <p className="mt-5 max-w-xl text-base text-white/75 sm:text-lg">
            Kategorileri yonet, urunleri guncelle ve masalara asabilecegin QR kodunu aninda uret.
          </p>
        </section>

        <section className="glass-panel p-6 shadow-soft sm:p-8">
          <h2 className="font-display text-3xl text-ink">Giris Yap</h2>
          <p className="mt-2 text-sm text-slate-600">Paneline ulasmak icin hesap bilgilerini gir.</p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <input
              type="email"
              placeholder="E-posta"
              value={form.email}
              onChange={(event) => setForm({ ...form, email: event.target.value })}
              className="w-full rounded-2xl border border-blue-100 bg-white px-4 py-3 outline-none ring-0 transition focus:border-blue-400"
              required
            />
            <input
              type="password"
              placeholder="Sifre"
              value={form.password}
              onChange={(event) => setForm({ ...form, password: event.target.value })}
              className="w-full rounded-2xl border border-blue-100 bg-white px-4 py-3 outline-none ring-0 transition focus:border-blue-400"
              required
            />

            {error ? <p className="text-sm text-red-600">{error}</p> : null}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-2xl bg-[#2563eb] px-4 py-3 font-semibold text-white transition hover:bg-[#1d4ed8] disabled:opacity-60"
            >
              {loading ? "Giris yapiliyor..." : "Giris Yap"}
            </button>
          </form>

          <p className="mt-5 text-sm text-slate-600">
            Hesabin yok mu?{" "}
            <Link to="/register" className="font-semibold text-[#2563eb]">
              Kayit ol
            </Link>
          </p>
        </section>
      </div>
    </div>
  );
}
