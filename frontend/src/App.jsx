import { Navigate, Route, Routes } from "react-router-dom";
import Layout from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Categories from "./pages/Categories";
import Login from "./pages/Login";
import MenuItems from "./pages/MenuItems";
import PublicMenu from "./pages/PublicMenu";
import QRCodePage from "./pages/QRCode";
import Register from "./pages/Register";
import { getToken } from "./lib/api";

function ProtectedRoute({ children }) {
  return getToken() ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
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
