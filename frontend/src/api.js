import axios from "axios";

const API_BASE = "http://127.0.0.1:8000";

/* ================= AXIOS INSTANCE ================= */
const api = axios.create({
  baseURL: API_BASE,
});

/* ================= REQUEST INTERCEPTOR ================= */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("finbank_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/* ================= SAFE API FETCH ================= */
export async function apiFetch(method, url, data = null, isForm = false) {
  try {
    const response = await api({
      method: method.toUpperCase(),
      url,
      data,
      headers: isForm
        ? {} // ⚠️ IMPORTANT: let browser set multipart headers
        : { "Content-Type": "application/json" },
    });
    return response.data;
  } catch (err) {
    let message = "API Error";

    const detail = err.response?.data?.detail;

    if (Array.isArray(detail)) {
      message = detail.map((d) => d.msg).join(", ");
    } else if (typeof detail === "string") {
      message = detail;
    } else if (err.response?.statusText) {
      message = err.response.statusText;
    } else if (err.message) {
      message = err.message;
    }

    if (err.response?.status === 401 || err.response?.status === 403) {
      localStorage.removeItem("finbank_token");
      localStorage.removeItem("finbank_user");
      window.location.reload();
    }

    throw new Error(message);
  }
}

export default api;
