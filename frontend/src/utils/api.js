import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE,
  headers: { "Content-Type": "application/json" },
});

// set dev headers theo role lưu trong localStorage
export function applyDevHeaders() {
  const role = localStorage.getItem("devRole") || "system_admin";
  if (role === "system_admin") {
    api.defaults.headers.common["x-user-id"] = "sys1";
    api.defaults.headers.common["x-user-role"] = "system_admin";
    api.defaults.headers.common["x-shop-id"] = "central";
  } else if (role === "support") {
    api.defaults.headers.common["x-user-id"] = "u1";
    api.defaults.headers.common["x-user-role"] = "support";
    api.defaults.headers.common["x-shop-id"] = "shop1";
  } else if (role === "shop_owner") {
    api.defaults.headers.common["x-user-id"] = "owner1";
    api.defaults.headers.common["x-user-role"] = "shop_owner";
    api.defaults.headers.common["x-shop-id"] = "shop1";
  }
}
applyDevHeaders();

export default api;
