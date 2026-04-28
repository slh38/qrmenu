import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";

const navItems = [
  { to: "/dashboard", label: "Genel Bakis" },
  { to: "/dashboard/categories", label: "Kategoriler" },
  { to: "/dashboard/menu-items", label: "Urunler" },
  { to: "/dashboard/qr", label: "QR Kod" },
];

export default function Layout() {
  const navigate = useNavigate();

  const logout = () => {
    localStorage.removeItem("qrmenu_token");
    localStorage.removeItem("qrmenu_tenant");
    navigate("/login");
  };

  return (
    <div className="min-h-screen">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-4 py-6 sm:px-6 lg:flex-row lg:px-8">
        <aside className="glass-panel mb-6 overflow-hidden border-blue-100/80 lg:mb-0 lg:w-80 lg:shrink-0">
          <div className="border-b border-blue-200/70 bg-gradient-to-br from-[#173b8f] via-[#2563eb] to-[#5b8cff] p-6 text-white">
            <Link to="/dashboard" className="font-display text-3xl tracking-wide">
              QRMenu
            </Link>
            <p className="mt-2 text-sm text-white/80">Coklu isletme QR menu paneli</p>
          </div>

          <nav className="space-y-2 p-4">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === "/dashboard"}
                className={({ isActive }) =>
                  `block rounded-2xl px-4 py-3 text-sm transition ${
                    isActive
                      ? "bg-[#173b8f] text-white shadow-soft"
                      : "text-slate-700 hover:bg-blue-50"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="p-4 pt-0">
            <button
              type="button"
              onClick={logout}
              className="w-full rounded-2xl border border-blue-200 px-4 py-3 text-sm font-semibold text-slate-700 transition hover:bg-blue-50"
            >
              Cikis Yap
            </button>
          </div>
        </aside>

        <main className="flex-1 lg:pl-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
