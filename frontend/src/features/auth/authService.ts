import api from "../../services/api";
import {
  startProactiveAuthRefresh,
  stopProactiveAuthRefresh,
} from "../../services/api";

const register = async (userData: any) => {
  const response = await api.post("/auth/signup", userData);
  if (response.data) {
    localStorage.setItem("user", JSON.stringify(response.data));
    startProactiveAuthRefresh();
  }
  return response.data;
};

const login = async (userData: any) => {
  const response = await api.post("/auth/login", userData);
  if (response.data) {
    localStorage.setItem("user", JSON.stringify(response.data));
    startProactiveAuthRefresh();
  }
  return response.data;
};

const checkAuth = async () => {
  const response = await api.get("/auth/check-auth");
  const existingUser = JSON.parse(localStorage.getItem("user") || "null");

  if (response.data?.user) {
    const persistedAuth = {
      user: response.data.user,
      token: existingUser?.token ?? null,
      refreshToken: existingUser?.refreshToken ?? null,
    };
    localStorage.setItem("user", JSON.stringify(persistedAuth));
    startProactiveAuthRefresh();
  }

  return response.data;
};

const logout = async () => {
  try {
    await api.post("/auth/logout");
  } catch {
    // Clear client auth state even if server logout request fails
  }
  localStorage.removeItem("user");
  stopProactiveAuthRefresh();
};

const updateProfile = async (userData: any) => {
  const response = await api.put("/auth/profile", userData);
  if (response.data) {
    // Update local storage with new user info
    const existingUser = JSON.parse(localStorage.getItem("user") || "null");
    if (existingUser) {
      existingUser.user = response.data.user;
      localStorage.setItem("user", JSON.stringify(existingUser));
    }
  }
  return response.data;
};

const uploadAvatar = async (formData: FormData) => {
  const response = await api.post("/auth/avatar", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  if (response.data) {
    const existingUser = JSON.parse(localStorage.getItem("user") || "null");
    if (existingUser) {
      existingUser.user = response.data.user;
      localStorage.setItem("user", JSON.stringify(existingUser));
    }
  }
  return response.data;
};

const authService = {
  register,
  login,
  checkAuth,
  logout,
  updateProfile,
  uploadAvatar,
};

export default authService;
