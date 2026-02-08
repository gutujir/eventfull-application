import axios from "axios";
import { toast } from "react-toastify";

// Create an Axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1",
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // If using cookies
});

// Request interceptor to add Authorization header if you switch to storage based tokens
api.interceptors.request.use(
  (config) => {
    const stored = localStorage.getItem("user");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        const token = parsed?.token;
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch {
        // ignore malformed storage
      }
    }
    return config;
  },
  (error) => Promise.reject(error),
);

let isRefreshing = false;
let refreshQueue: Array<(tokenRefreshed: boolean) => void> = [];

const runRefreshQueue = (tokenRefreshed: boolean) => {
  refreshQueue.forEach((cb) => cb(tokenRefreshed));
  refreshQueue = [];
};

// Response interceptor for global error handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      error.response?.status === 401 &&
      !originalRequest?._retry &&
      !originalRequest?.url?.includes("/auth/refresh")
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          refreshQueue.push((tokenRefreshed) => {
            if (tokenRefreshed) {
              resolve(api(originalRequest));
            } else {
              reject(error);
            }
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;
      try {
        await api.post("/auth/refresh");
        runRefreshQueue(true);
        return api(originalRequest);
      } catch (refreshError) {
        runRefreshQueue(false);
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    const apiMessage =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      "Request failed";
    toast.error(apiMessage);
    return Promise.reject(error);
  },
);

export default api;
