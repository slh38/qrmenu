const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const API_ORIGIN = API_URL.replace(/\/api\/?$/, "");

const getToken = () => localStorage.getItem("qrmenu_token");

function resolveAssetUrl(url = "") {
  if (!url) {
    return "";
  }

  if (url.startsWith("/uploads/")) {
    return `${API_ORIGIN}${url}`;
  }

  if (/^https?:\/\//i.test(url) && url.includes("/uploads/")) {
    const filename = url.split("/uploads/")[1];
    return filename ? `${API_ORIGIN}/uploads/${filename}` : url;
  }

  return url;
}

async function request(path, options = {}) {
  const headers = new Headers(options.headers || {});
  const isFormData = options.body instanceof FormData;

  if (!isFormData) {
    headers.set("Content-Type", "application/json");
  }

  const token = getToken();
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

export { API_ORIGIN, API_URL, getToken, request, resolveAssetUrl };
