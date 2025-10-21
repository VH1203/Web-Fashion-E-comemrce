// frontend/src/context/AuthContext.jsx
import React, { createContext, useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { authApi } from "../services/authService";

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("dfs_user");
    return stored ? JSON.parse(stored) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem("dfs_access_token"));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("🟢 AuthContext mounted");
    const initAuth = async () => {
      const accessToken = localStorage.getItem("dfs_access_token");
      const refreshToken = localStorage.getItem("dfs_refresh_token");

      if (!accessToken || !refreshToken) {
        console.log("⚠️ No tokens found");
        setLoading(false);
        return;
      }

      try {
        const profile = await authApi.verifyToken();
        console.log("✅ Verified user:", profile);
        setUser(profile);
        localStorage.setItem("dfs_user", JSON.stringify(profile));
      } catch (err) {
        console.warn("❌ Token invalid, redirecting to login");
        localStorage.removeItem("dfs_access_token");
        localStorage.removeItem("dfs_refresh_token");
        setUser(null);
        setToken(null);
        navigate("/login");
      } finally {
        setLoading(false);
      }
    };
    initAuth();
  }, [navigate]);

  const value = { user, token, loading, setUser, setToken };
  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
