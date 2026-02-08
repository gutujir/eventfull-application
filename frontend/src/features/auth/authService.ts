import api from "../../services/api";

const register = async (userData: any) => {
  const response = await api.post("/auth/signup", userData);
  if (response.data) {
    localStorage.setItem("user", JSON.stringify(response.data));
  }
  return response.data;
};

const login = async (userData: any) => {
  const response = await api.post("/auth/login", userData);
  if (response.data) {
    localStorage.setItem("user", JSON.stringify(response.data));
  }
  return response.data;
};

const logout = () => {
  localStorage.removeItem("user");
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
  logout,
  updateProfile,
  uploadAvatar,
};

export default authService;
