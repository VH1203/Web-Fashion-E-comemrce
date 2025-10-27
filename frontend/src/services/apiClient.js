// src/services/apiClient.js
import axios from "axios";

const TOKEN_KEY = "dfs_token";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
  headers: { "Content-Type": "application/json" },
  timeout: 20000,
});

apiClient.interceptors.request.use((config) => {
  const token =
    localStorage.getItem(TOKEN_KEY) ||
    localStorage.getItem("access_token") || 
    localStorage.getItem("accessToken"); 

  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

apiClient.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err?.response?.status;
    // gom message gọn gàng
    const serverMsg =
      err?.response?.data?.message ||
      err?.response?.data?.error ||
      err?.message ||
      "Lỗi kết nối máy chủ.";

    // nếu hết hạn / không đủ quyền → xoá token & đẩy về login
    if (status === 401 || status === 403) {
      try {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem("dfs_user");
        // giữ lại các key cũ để dọn dẹp nốt
        localStorage.removeItem("access_token");
        localStorage.removeItem("accessToken");
      } catch {}
      // tuỳ router setup: dùng hard redirect để chắc chắn reset state
      window.location.replace("/login");
    }

    // ném lại Error để UI hiển thị
    return Promise.reject(new Error(serverMsg));
  }
);

export default apiClient;
