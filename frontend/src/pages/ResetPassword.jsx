import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { request } from "../lib/api";

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (password.length < 6) {
      setError("Yeni şifre en az 6 karakter olmalı.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Şifreler eşleşmiyor.");
      return;
    }

    setLoading(true);

    try {
      const result = await request(`/auth/reset-password/${token}`, {
        method: "POST",
        body: JSON.stringify({ password }),
      });

      setSuccess(result.message);
      setTimeout(() => navigate("/login"), 1500);
    } catch (submitError) {
      setError(submitError.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-10">
      <div className="glass-panel w-full max-w-xl p-6 shadow-soft sm:p-8">
        <div className="mb-6">
          <Link to="/login" className="text-sm font-semibold text-[#2563eb] hover:text-[#1d4ed8]">
            Giriş sayfasına dön
          </Link>
          <h1 className="mt-3 font-display text-4xl text-ink">Yeni Şifre Belirle</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">
            Yeni şifrenizi girin. İşlem tamamlandığında tekrar giriş yapabilirsiniz.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            placeholder="Yeni şifre"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className="w-full rounded-2xl border border-blue-100 bg-white px-4 py-3 outline-none ring-0 transition focus:border-blue-400"
            required
          />
          <input
            type="password"
            placeholder="Yeni şifre tekrar"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            className="w-full rounded-2xl border border-blue-100 bg-white px-4 py-3 outline-none ring-0 transition focus:border-blue-400"
            required
          />

          {error ? <p className="text-sm text-red-600">{error}</p> : null}
          {success ? <p className="text-sm text-emerald-700">{success}</p> : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-2xl bg-[#2563eb] px-4 py-3 font-semibold text-white transition hover:bg-[#1d4ed8] disabled:opacity-60"
          >
            {loading ? "Şifre güncelleniyor..." : "Şifreyi Güncelle"}
          </button>
        </form>
      </div>
    </div>
  );
}
