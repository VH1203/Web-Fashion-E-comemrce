import React from "react";
import { BrowserRouter, Routes, Route, Navigate} from "react-router-dom";
;
// Auth pages
import Register from "../pages/auth/Register";
import Login from "../pages/auth/Login";
import ForgotPassword from "../pages/auth/ForgotPassword";
import "mdb-react-ui-kit/dist/css/mdb.min.css";
import HomePage from "../pages/customer/HomePage";
import Dashboard from "../pages/shop/Dashboard";
import SystemConfig from "../pages/admin/SystemConfig";
import SalesOrders from "../pages/sales/SalesOrders";
import Tickets from "../pages/support/Tickets";
import { useAuth } from "../context/AuthContext";  

import ProtectedRoute from "./ProtectedRoute";

export default function AppRouter() {
  const { user } = useAuth();

  // Nếu người dùng đã đăng nhập và KHÔNG phải customer -> điều hướng sang dashboard role tương ứng
  const redirectByRole = () => {
    if (!user) return null;
    switch (user.role) {
      case "shop_owner":
        return <Navigate to="/shop/dashboard" replace />;
      case "system_admin":
        return <Navigate to="/admin/system-config" replace />;
      case "sales":
        return <Navigate to="/sales/orders" replace />;
      case "support":
        return <Navigate to="/support/tickets" replace />;
      default:
        return null;
    }
  };

  return (
      <Routes>
        {/* Customer */}
        <Route path="/" element={<HomePage />} />

        {/* Shop Owner */}
        <Route
          path="/shop/*"
          element={
            <ProtectedRoute allowedRoles={["shop_owner"]}>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* System Admin */}
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute allowedRoles={["system_admin"]}>
              <SystemConfig />
            </ProtectedRoute>
          }
        />

        {/* Sales */}
        <Route
          path="/sales/*"
          element={
            <ProtectedRoute allowedRoles={["sales"]}>
              <SalesOrders />
            </ProtectedRoute>
          }
        />

        {/* Support */}
        <Route path="/support/*" element={<ProtectedRoute allowedRoles={["support"]}><Tickets/></ProtectedRoute>} />


        {/* Auth */}
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* 404 */}
        <Route path="*" element={<h1>404 - Not Found</h1>} />
      </Routes>

  );
}
