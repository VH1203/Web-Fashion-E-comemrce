// src/context/AuthContext.jsx
import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

const TOKEN_KEY = "dfs_token";   // ✅ thêm
const USER_KEY  = "dfs_user";    // ✅ thêm

function decodeJwt(t) {
  try {
    const [, payload] = t.split(".");
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/"); // base64url -> base64
    const json = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(json);
  } catch {
    return {};
  }
}

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();

  const [user, setUser] = useState(() =>
    JSON.parse(localStorage.getItem(USER_KEY) || "null")
  );
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [authReady, setAuthReady] = useState(false); // ✅ tránh nháy UI

  // Khởi tạo từ localStorage + payload
  useEffect(() => {
    if (!token) {
      setAuthReady(true);
      return;
    }
    const p = decodeJwt(token);
    setUser((u) => {
      const merged = {
        ...(u || {}),
        _id: u?._id ?? p?._id,
        role_name: u?.role_name ?? p?.role_name,
        permissions: u?.permissions ?? p?.permissions ?? [],
      };
      localStorage.setItem(USER_KEY, JSON.stringify(merged));
      return merged;
    });
    setAuthReady(true);
  }, [token]);

  const login = (userData, accessToken) => {
    const p = decodeJwt(accessToken);
    const merged = {
      ...userData,
      _id: userData?._id ?? p?._id,
      role_name: userData?.role_name ?? p?.role_name ?? null,
      permissions: userData?.permissions ?? p?.permissions ?? [],
    };

    setToken(accessToken);
    setUser(merged);
    localStorage.setItem(TOKEN_KEY, accessToken);
    localStorage.setItem(USER_KEY, JSON.stringify(merged));

    // Điều hướng theo role_name / permissions
    const role = merged.role_name;
    const perms = merged.permissions || [];

    if (role === "system_admin")
      return navigate("/admin/system-config", { replace: true });
    if (role === "sales") return navigate("/sales/orders", { replace: true });
    if (role === "support")
      return navigate("/support/tickets", { replace: true });
    if (role === "shop_owner" || perms.includes("shop:access")) {
      return navigate("/shop/dashboard", { replace: true });
    }
    return navigate("/", { replace: true });
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem("access_token"); // legacy cleanup
    localStorage.removeItem("accessToken");  // legacy cleanup
    setUser(null);
    setToken(null);
    navigate("/login", { replace: true });
  };

  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated, authReady, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
