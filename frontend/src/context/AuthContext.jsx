// src/context/AuthContext.jsx
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

export const AuthContext = createContext();

// ✅ Dùng 1 key duy nhất, thống nhất với apiClient
export const TOKEN_KEY = "DFS_TOKEN";
export const USER_KEY  = "dfs_user";

function decodeJwt(token) {
  try {
    const [, payload] = token.split(".");
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(json || "{}");
  } catch {
    return {};
  }
}

function getUidFromPayload(p) {
  return p._id || p.id || p.user_id || p.sub || null;
}

function isExpired(token) {
  const p = decodeJwt(token);
  // exp là seconds
  if (!p?.exp) return false;
  const now = Math.floor(Date.now() / 1000);
  return p.exp <= now;
}

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();

  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) || null);
  const [user, setUser]   = useState(() => {
    try { return JSON.parse(localStorage.getItem(USER_KEY) || "null"); } catch { return null; }
  });
  const [authReady, setAuthReady] = useState(false);

  // Khởi tạo từ localStorage
  useEffect(() => {
    if (!token) {
      setUser(null);
      setAuthReady(true);
      return;
    }
    // Nếu token đã hết hạn => dọn dẹp
    if (isExpired(token)) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      setToken(null);
      setUser(null);
      setAuthReady(true);
      return;
    }
    // Cập nhật user tối thiểu từ payload (không merge rác cũ)
    const p = decodeJwt(token);
    const uid = getUidFromPayload(p);
    const nextUser = user ? { ...user } : {};
    if (uid && !nextUser._id) nextUser._id = uid;
    // (tùy dự án có role_name / permissions trong payload hay không)
    if (p.role_name && !nextUser.role_name) nextUser.role_name = p.role_name;
    if (Array.isArray(p.permissions) && !nextUser.permissions) nextUser.permissions = p.permissions;

    if (Object.keys(nextUser).length) {
      setUser(nextUser);
      localStorage.setItem(USER_KEY, JSON.stringify(nextUser));
    }
    setAuthReady(true);
  }, [token]);

  // Tự động đăng xuất khi hết hạn (poll nhẹ mỗi 30s)
  useEffect(() => {
    if (!token) return;
    const id = setInterval(() => {
      if (isExpired(token)) {
        logout();
      }
    }, 30_000);
    return () => clearInterval(id);
  }, [token]);

  // Đồng bộ đa tab
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === TOKEN_KEY) {
        setToken(e.newValue);
      }
      if (e.key === USER_KEY) {
        try { setUser(JSON.parse(e.newValue || "null")); } catch { setUser(null); }
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const login = (userData, accessToken) => {
    // Dọn các key legacy trước
    localStorage.removeItem("dfs_token");
    localStorage.removeItem("access_token");
    localStorage.removeItem("accessToken");

    // Validate sơ bộ
    const p = decodeJwt(accessToken);
    const uid = getUidFromPayload(p) || userData?._id || null;

    const normalizedUser = {
      ...(userData || {}),
      _id: uid || undefined,
      role_name: userData?.role_name ?? p?.role_name ?? null,
      permissions: userData?.permissions ?? p?.permissions ?? [],
    };

    setToken(accessToken);
    setUser(normalizedUser);
    localStorage.setItem(TOKEN_KEY, accessToken);
    localStorage.setItem(USER_KEY, JSON.stringify(normalizedUser));

    // Điều hướng theo vai trò
    const role = normalizedUser.role_name;
    const perms = normalizedUser.permissions || [];
    if (role === "system_admin") return navigate("/admin/system-config", { replace: true });
    if (role === "sales")        return navigate("/sales/orders", { replace: true });
    if (role === "support")      return navigate("/support/tickets", { replace: true });
    if (role === "shop_owner" || perms.includes("shop:access"))
      return navigate("/shop", { replace: true });
    return navigate("/", { replace: true });
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    // cleanup legacy
    localStorage.removeItem("dfs_token");
    localStorage.removeItem("access_token");
    localStorage.removeItem("accessToken");
    setUser(null);
    setToken(null);
    navigate("/login", { replace: true });
  };

  const isAuthenticated = useMemo(() => Boolean(token) && !isExpired(token), [token]);

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated, authReady, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

