import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Landing from "./pages/Landing";
import Categories from "./pages/Categories";
import AdminLogin from "./pages/AdminLogin";
import AdminPanel from "./pages/AdminPanel";
import ForgotPassword from "./pages/ForgotPassword";
import Login from "./pages/Login";
import MenuItems from "./pages/MenuItems";
import PublicMenu from "./pages/PublicMenu";
import QRCodePage from "./pages/QRCode";
import Register from "./pages/Register";
import ResetPassword from "./pages/ResetPassword";
import { getToken } from "./lib/api";
import { clearAdminToken, getAdminToken } from "./lib/admin";

const ROOT_DOMAIN = (import.meta.env.VITE_ROOT_DOMAIN || "").toLowerCase();
const RESERVED_HOSTS = new Set(["www", "api", "admin"]);

function isAdminHost(hostname) {
  return ROOT_DOMAIN ? hostname.toLowerCase() === `admin.${ROOT_DOMAIN}` : false;
}

function getTenantSubdomain(hostname) {
  if (!ROOT_DOMAIN) {
    return "";
  }

  const normalizedHost = hostname.toLowerCase();
  if (normalizedHost === ROOT_DOMAIN || normalizedHost === `www.${ROOT_DOMAIN}`) {
    return "";
  }

  if (!normalizedHost.endsWith(`.${ROOT_DOMAIN}`)) {
    return "";
  }

  const subdomain = normalizedHost.slice(0, -(ROOT_DOMAIN.length + 1));
  return RESERVED_HOSTS.has(subdomain) ? "" : subdomain;
}

function ProtectedRoute({ children }) {
  return getToken() ? children : <Navigate to="/login" replace />;
}

function AdminProtectedRoute({ children }) {
  return getAdminToken() ? children : <Navigate to="/login" replace />;
}

function HomeRoute() {
  const tenantSubdomain = getTenantSubdomain(window.location.hostname);
  return tenantSubdomain ? <PublicMenu forcedSlug={tenantSubdomain} /> : <Landing />;
}

function CategoryRoute() {
  const tenantSubdomain = getTenantSubdomain(window.location.hostname);
  return tenantSubdomain ? <PublicMenu forcedSlug={tenantSubdomain} /> : <Navigate to="/" replace />;
}

export default function App() {
  if (isAdminHost(window.location.hostname)) {
    const handleAdminLogout = () => {
      clearAdminToken();
      window.location.href = "/login";
    };

    return (
      <Routes>
        <Route
          path="/"
          element={
            <AdminProtectedRoute>
              <AdminPanel onLogout={handleAdminLogout} />
            </AdminProtectedRoute>
          }
        />
        <Route path="/login" element={<AdminLogin onSuccess={() => (window.location.href = "/")} />} />
        <Route path="*" element={<Navigate to={getAdminToken() ? "/" : "/login"} replace />} />
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<HomeRoute />} />
      <Route path="/category/:categoryId" element={<CategoryRoute />} />
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />
      <Route path="/register" element={<Register />} />
      <Route path="/menu/:slug" element={<PublicMenu />} />
      <Route path="/menu/:slug/category/:categoryId" element={<PublicMenu />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="categories" element={<Categories />} />
        <Route path="menu-items" element={<MenuItems />} />
        <Route path="qr" element={<QRCodePage />} />
      </Route>
    </Routes>
  );
}
