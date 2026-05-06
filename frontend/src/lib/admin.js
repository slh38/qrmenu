import { API_URL } from "./api";

const ADMIN_TOKEN_KEY = "qrmenu_admin_token";

const getAdminToken = () => localStorage.getItem(ADMIN_TOKEN_KEY);

const setAdminToken = (token) => localStorage.setItem(ADMIN_TOKEN_KEY, token);

const clearAdminToken = () => localStorage.removeItem(ADMIN_TOKEN_KEY);

async function adminRequest(path, options = {}) {
  const headers = new Headers(options.headers || {});

  if (!(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const token = getAdminToken();
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  const result = await response.json();

  if (!response.ok || !result.success) {
    throw new Error(result.message || "Bir hata oluştu.");
  }

  return result;
}

export { ADMIN_TOKEN_KEY, adminRequest, clearAdminToken, getAdminToken, setAdminToken };
