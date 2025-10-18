import React, { createContext, useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { authApi } from "../services/authService";

const AuthContext = createContext();

// Hook tiện dụng
export const useAuth = () => useContext(AuthContext);

// Provider chính
export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();

  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("dfs_user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  const [token, setToken] = useState(() => localStorage.getItem("dfs_token"));
  const [loading, setLoading] = useState(true);

  // Gọi API xác thực khi có token (auto-login)
  useEffect(() => {
    const fetchUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const data = await authApi.getProfile(); // GET /auth/me
        setUser(data);
        localStorage.setItem("dfs_user", JSON.stringify(data));
      } catch (err) {
        console.error("❌ AuthContext: Token invalid -> clearing...");
        logout(); // Token lỗi → logout
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [token]);

  // Đăng nhập
  const login = async (credentials) => {
    try {
      const { user: userData, accessToken } = await authApi.login(credentials);
      setUser(userData);
      setToken(accessToken);

      localStorage.setItem("dfs_user", JSON.stringify(userData));
      localStorage.setItem("dfs_token", accessToken);

      // Điều hướng theo role
      switch (userData.role) {
        case "shop_owner":
          navigate("/shop/dashboard");
          break;
        case "system_admin":
          navigate("/admin/system-config");
          break;
        case "sales":
          navigate("/sales/orders");
          break;
        case "support":
          navigate("/support/tickets");
          break;
        default:
          navigate("/");
      }
    } catch (err) {
      console.error("❌ Login failed:", err);
      throw err;
    }
  };

  // Đăng xuất
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("dfs_user");
    localStorage.removeItem("dfs_token");
    navigate("/login");
  };

  const value = {
    user,
    token,
    loading,
    login,
    logout,
    setUser,
    setToken,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
