import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Landing from "./pages/Landing";
import Categories from "./pages/Categories";
import Login from "./pages/Login";
import MenuItems from "./pages/MenuItems";
import PublicMenu from "./pages/PublicMenu";
import QRCodePage from "./pages/QRCode";
import Register from "./pages/Register";
import { getToken } from "./lib/api";

const ROOT_DOMAIN = (import.meta.env.VITE_ROOT_DOMAIN || "").toLowerCase();
const RESERVED_HOSTS = new Set(["www", "api"]);

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

function HomeRoute() {
  const tenantSubdomain = getTenantSubdomain(window.location.hostname);
  return tenantSubdomain ? <PublicMenu forcedSlug={tenantSubdomain} /> : <Landing />;
}

function CategoryRoute() {
  const tenantSubdomain = getTenantSubdomain(window.location.hostname);
  return tenantSubdomain ? <PublicMenu forcedSlug={tenantSubdomain} /> : <Navigate to="/" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomeRoute />} />
      <Route path="/category/:categoryId" element={<CategoryRoute />} />
      <Route path="/login" element={<Login />} />
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
