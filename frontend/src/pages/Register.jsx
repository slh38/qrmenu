import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { request } from "../lib/api";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    businessName: "",
    ownerName: "",
    email: "",
    password: "",
    phone: "",
    address: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const result = await request("/auth/register", {
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
      <div className="glass-panel w-full max-w-3xl p-6 shadow-soft sm:p-8">
        <div className="mb-8">
          <p className="text-sm uppercase tracking-[0.35em] text-[#2563eb]">Yeni Isletme</p>
          <h1 className="mt-3 font-display text-4xl text-ink">Kayit Ol</h1>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
          <input
            type="text"
            placeholder="Isletme adi"
            value={form.businessName}
            onChange={(event) => setForm({ ...form, businessName: event.target.value })}
            className="rounded-2xl border border-blue-100 bg-white px-4 py-3 outline-none focus:border-blue-400 sm:col-span-2"
            required
          />
          <input
            type="text"
            placeholder="Yetkili adi"
            value={form.ownerName}
            onChange={(event) => setForm({ ...form, ownerName: event.target.value })}
            className="rounded-2xl border border-blue-100 bg-white px-4 py-3 outline-none focus:border-blue-400"
          />
          <input
            type="text"
            placeholder="Telefon"
            value={form.phone}
            onChange={(event) => setForm({ ...form, phone: event.target.value })}
            className="rounded-2xl border border-blue-100 bg-white px-4 py-3 outline-none focus:border-blue-400"
          />
          <input
            type="email"
            placeholder="E-posta"
            value={form.email}
            onChange={(event) => setForm({ ...form, email: event.target.value })}
            className="rounded-2xl border border-blue-100 bg-white px-4 py-3 outline-none focus:border-blue-400"
            required
          />
          <input
            type="password"
            placeholder="Sifre"
            value={form.password}
            onChange={(event) => setForm({ ...form, password: event.target.value })}
            className="rounded-2xl border border-blue-100 bg-white px-4 py-3 outline-none focus:border-blue-400"
            required
          />
          <textarea
            placeholder="Adres"
            value={form.address}
            onChange={(event) => setForm({ ...form, address: event.target.value })}
            className="min-h-28 rounded-2xl border border-blue-100 bg-white px-4 py-3 outline-none focus:border-blue-400 sm:col-span-2"
          />

          {error ? <p className="text-sm text-red-600 sm:col-span-2">{error}</p> : null}

          <button
            type="submit"
            disabled={loading}
            className="rounded-2xl bg-[#173b8f] px-4 py-3 font-semibold text-white transition hover:bg-[#102c6e] disabled:opacity-60 sm:col-span-2"
          >
            {loading ? "Kayit olusturuluyor..." : "Kayit Ol"}
          </button>
        </form>

        <p className="mt-5 text-sm text-slate-600">
          Zaten hesabiniz var mi?{" "}
          <Link to="/login" className="font-semibold text-[#2563eb]">
            Giris yap
          </Link>
        </p>
      </div>
    </div>
  );
}
