import axios from "axios";
import { toast } from "react-toastify";

const REFRESH_LEEWAY_MS = 2 * 60 * 1000;
let refreshTimer: ReturnType<typeof setTimeout> | null = null;

const getStoredAuth = () => {
  const stored = localStorage.getItem("user");
  if (!stored) return null;

  try {
    return JSON.parse(stored);
  } catch {
    return null;
  }
};

const persistTokens = (token?: string, refreshToken?: string) => {
  if (!token && !refreshToken) return;

  const storedAuth = getStoredAuth();
  if (!storedAuth) return;

  const updatedAuth = {
    ...storedAuth,
    token: token ?? storedAuth.token,
    refreshToken: refreshToken ?? storedAuth.refreshToken,
  };

  localStorage.setItem("user", JSON.stringify(updatedAuth));
};

const clearRefreshTimer = () => {
  if (refreshTimer) {
    clearTimeout(refreshTimer);
    refreshTimer = null;
  }
};

const decodeJwtExp = (token?: string | null): number | null => {
  if (!token) return null;

  try {
    const payload = token.split(".")[1];
    if (!payload) return null;

    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const decoded = JSON.parse(atob(normalized));
    if (typeof decoded?.exp !== "number") return null;
    return decoded.exp * 1000;
  } catch {
    return null;
  }
};

const scheduleFromToken = (token?: string | null) => {
  clearRefreshTimer();

  const expMs = decodeJwtExp(token);
  if (!expMs) return;

  const now = Date.now();
  const triggerIn = Math.max(expMs - now - REFRESH_LEEWAY_MS, 5000);

  refreshTimer = setTimeout(async () => {
    try {
      const refreshResponse = await api.post("/auth/refresh");
      const newToken = refreshResponse.data?.token as string | undefined;
      const newRefreshToken = refreshResponse.data?.refreshToken as
        | string
        | undefined;

      if (newToken) {
        persistTokens(newToken, newRefreshToken);
        scheduleFromToken(newToken);
      }
    } catch {
      clearRefreshTimer();
    }
  }, triggerIn);
};

export const startProactiveAuthRefresh = () => {
  const token = getStoredAuth()?.token ?? null;
  scheduleFromToken(token);
};

export const stopProactiveAuthRefresh = () => {
  clearRefreshTimer();
};

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
    const parsed = getStoredAuth();
    const token = parsed?.token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else if (config.headers?.Authorization) {
      delete config.headers.Authorization;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

let isRefreshing = false;
let refreshQueue: Array<(token: string | null) => void> = [];
let sessionExpiredEmitted = false;

const runRefreshQueue = (token: string | null) => {
  refreshQueue.forEach((cb) => cb(token));
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
          refreshQueue.push((token) => {
            if (token) {
              if (originalRequest.headers) {
                originalRequest.headers.Authorization = `Bearer ${token}`;
              }
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
        const refreshResponse = await api.post("/auth/refresh");
        const newAccessToken = refreshResponse.data?.token as
          | string
          | undefined;
        const newRefreshToken = refreshResponse.data?.refreshToken as
          | string
          | undefined;

        if (!newAccessToken) {
          throw new Error("Token refresh failed");
        }

        persistTokens(newAccessToken, newRefreshToken);
        scheduleFromToken(newAccessToken);
        runRefreshQueue(newAccessToken);

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        }

        return api(originalRequest);
      } catch (refreshError) {
        const hadAuthenticatedSession = Boolean(getStoredAuth()?.token);
        runRefreshQueue(null);
        localStorage.removeItem("user");
        clearRefreshTimer();
        if (hadAuthenticatedSession && !sessionExpiredEmitted) {
          sessionExpiredEmitted = true;
          window.dispatchEvent(
            new CustomEvent("auth:session-expired", {
              detail: { shouldNotify: true },
            }),
          );
          setTimeout(() => {
            sessionExpiredEmitted = false;
          }, 1500);
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    const hasAuthToken = Boolean(getStoredAuth()?.token);
    if (error.response?.status === 401 && !hasAuthToken) {
      return Promise.reject(error);
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
