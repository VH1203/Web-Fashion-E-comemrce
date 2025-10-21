import React, { useEffect } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

import Register from "../pages/auth/Register";
import Login from "../pages/auth/Login";
import ForgotPassword from "../pages/auth/ForgotPassword";
import HomePage from "../pages/customer/HomePage";
import Dashboard from "../pages/shop/Dashboard";
import SystemConfig from "../pages/admin/SystemConfig";
import SalesOrders from "../pages/sales/SalesOrders";
import Tickets from "../pages/support/Tickets";
import Profile from "../pages/customer/Profile";
import AllProductsPage from "../pages/customer/AllProductsPages";
import CategoryProductsPage from "../pages/customer/CategoryProductsPage";
import ProtectedRoute from "./ProtectedRoute";

export default function AppRouter() {
  const { user, loading } = useAuth();
  const navigate = useNavigate(); // ✅ luôn khai báo hook trước return

  // ✅ Hook luôn tồn tại, chỉ thực thi khi user sẵn sàng
  useEffect(() => {
    if (!user || loading) return;

    const id = user.role_id || "";
    if (id.includes("role-e72d444c")) navigate("/shop/dashboard", { replace: true }); // shop_owner
    else if (id.includes("role-9958c801")) navigate("/admin/system-config", { replace: true }); // system_admin
    else if (id.includes("role-0b00ec21")) navigate("/sales/orders", { replace: true }); // sales
    else if (id.includes("role-9c49ce93")) navigate("/support/tickets", { replace: true }); // support
    // customer => ở lại HomePage
  }, [user, loading, navigate]);

  // ✅ return JSX sau, không return sớm
  if (loading) {
    return (
      <div style={{ textAlign: "center", marginTop: "80px" }}>
        ⏳ Đang tải dữ liệu...
      </div>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />

      <Route
        path="/shop/*"
        element={
          <ProtectedRoute allowedRoles={["shop_owner"]}>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/*"
        element={
          <ProtectedRoute allowedRoles={["system_admin"]}>
            <SystemConfig />
          </ProtectedRoute>
        }
      />

      <Route
        path="/sales/*"
        element={
          <ProtectedRoute allowedRoles={["sales"]}>
            <SalesOrders />
          </ProtectedRoute>
        }
      />

      <Route
        path="/support/*"
        element={
          <ProtectedRoute allowedRoles={["support"]}>
            <Tickets />
          </ProtectedRoute>
        }
      />

      <Route
        path="/users/profile"
        element={
          <ProtectedRoute
            allowedRoles={[
              "customer",
              "shop_owner",
              "system_admin",
              "sales",
              "support",
            ]}
          >
            <Profile />
          </ProtectedRoute>
        }
      />

      <Route path="/categories/:slug" element={<CategoryProductsPage />} />
      <Route path="/products/:type" element={<AllProductsPage />} />

      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      <Route
        path="*"
        element={
          <h2 className="text-center mt-5">404 - Trang không tồn tại</h2>
        }
      />
    </Routes>
  );
}
