import apiClient from "./apiClient";
const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const post = async (path, body) => {
  const res = await fetch(`${API_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) throw new Error(data.message || "Request failed");
  return data;
};

export const authApi = {
  registerRequestOTP: (payload) => post("/auth/register/request-otp", payload),
  registerVerify: (payload) => post("/auth/register/verify", payload),

  login: (payload) => post("/auth/login", payload),
  googleLogin: (payload) => apiClient.post("/auth/login/google", payload).then((res) => res.data),

  forgotRequest: (payload) => post("/auth/forgot-password/request", payload),
  forgotVerify: (payload) => post("/auth/forgot-password/verify", payload),

  setPasswordRequest: (identifier) => post("/auth/set-password/request", { identifier }),
  setPasswordVerify: (payload) => post("/auth/set-password/verify", payload),

  refresh: (payload) => post("/auth/refresh", payload),

  logout: async () => {
    const token = localStorage.getItem("refresh_token");
    if (token) await post("/auth/logout", { token }).catch(console.warn);
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
  },
};
