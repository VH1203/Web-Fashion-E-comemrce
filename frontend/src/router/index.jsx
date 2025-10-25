import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// ===== Auth Pages =====
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import ForgotPassword from "../pages/auth/ForgotPassword";
import ChangePassword from "../pages/auth/ChangePassword";

// ===== Role Pages =====
import HomePage from "../pages/customer/HomePage";
import Dashboard from "../pages/shop/Dashboard";
import SystemConfig from "../pages/admin/SystemConfig";
import SalesOrders from "../pages/sales/SalesOrders";
import Tickets from "../pages/support/Tickets";

// ===== Error Page =====
import NotFound from "../pages/errors/NotFound";
import ProductDetail from "../pages/customer/ProductDetail";

// ==========================================
// 🧩 Route Guards
// ==========================================
function ProtectedRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
}

function RoleRoute({ children, roles }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (!roles.includes(user.role_id) && !roles.includes(user.role))
    return <Navigate to="/" replace />;
  return children;
}

export default function AppRouter() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/change-password" element={<ProtectedRoute><ChangePassword /></ProtectedRoute>} />

      {/* Customer */}
      <Route path="/" element={<HomePage />} />
      <Route path="/product/:idOrSlug" element={<ProductDetail />} />

      {/* Shop */}
      <Route path="/shop/dashboard" element={<RoleRoute roles={["shop_owner", "role-shop-owner"]}><Dashboard /></RoleRoute>} />

      {/* Sales */}
      <Route path="/sales/orders" element={<RoleRoute roles={["sales", "role-sales"]}><SalesOrders /></RoleRoute>} />

      {/* Support */}
      <Route path="/support/tickets" element={<RoleRoute roles={["support", "role-support"]}><Tickets /></RoleRoute>} />

      {/* Admin */}
      <Route path="/admin/system-config" element={<RoleRoute roles={["system_admin", "role-system-admin"]}><SystemConfig /></RoleRoute>} />

      {/* Not Found */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
