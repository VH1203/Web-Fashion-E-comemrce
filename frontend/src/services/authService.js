import apiClient from "./apiClient";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// ====================== Helper ======================
async function post(path, body) {
  const res = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || "Request failed");
  return data;
}

export const authApi = {
  registerRequestOTP: (payload) => post("/auth/register/request-otp", payload),
  registerVerify: (payload) => post("/auth/register/verify", payload),

  login: (payload) => post("/auth/login", payload),
  googleLogin: (payload) => apiClient.post("/auth/login/google", payload),

  forgotRequest: (payload) => post("/auth/forgot-password/request", payload),
  forgotVerify: (payload) => post("/auth/forgot-password/verify", payload),

  setPasswordRequest: (identifier) =>
    post("/auth/set-password/request", { identifier }),
  setPasswordVerify: (payload) => post("/auth/set-password/verify", payload),

  refresh: (payload) => post("/auth/refresh", payload),

  verifyToken: async () => {
    const token = localStorage.getItem("dfs_access_token");
    if (!token) throw new Error("Missing token");

    try {
      const res = await fetch(`${API_URL}/users/profile`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });
      if (!res.ok) throw new Error("Token invalid");
      return await res.json();
    } catch (err) {
      console.warn("❌ verifyToken error:", err.message);
      throw new Error("Token invalid");
    }
  },

  logout: async () => {
    const token = localStorage.getItem("dfs_refresh_token");
    try {
      if (token) await post("/auth/logout", { token });
    } catch (err) {
      console.warn("⚠️ Logout warning:", err.message);
    } finally { 
      localStorage.removeItem("dfs_user");
      localStorage.removeItem("dfs_access_token");
      localStorage.removeItem("dfs_refresh_token");
    }
  },
};
