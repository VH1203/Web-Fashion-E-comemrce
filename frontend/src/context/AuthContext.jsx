import React, { createContext, useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const navigate = useNavigate();
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")) || null);
  const [token, setToken] = useState(localStorage.getItem("access_token") || null);

  const login = (userData, accessToken) => {
    setUser(userData);
    setToken(accessToken);
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("access_token", accessToken);

    console.log("🔐 Login called, user role:", userData.role_id);
console.log("🔐 Navigate should redirect now...");


    switch (userData.role_id || userData.role) {
      case "system_admin":
      case "role-system-admin":
        navigate("/admin/system-config");
        break;
      case "shop_owner":
      case "role-shop-owner":
        navigate("/shop/dashboard");
        break;
      case "sales":
      case "role-sales":
        navigate("/sales/orders");
        break;
      case "support":
      case "role-support":
        navigate("/support/tickets");
        break;
      default:
        navigate("/");
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("user");
    localStorage.removeItem("access_token");
    navigate("/login",{ replace: true });
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
