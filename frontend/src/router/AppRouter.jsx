import React from "react";
import { Routes, Route } from "react-router-dom";

import MainLayout from "../components/layout/MainLayout";

// Auth pages
import Register from "../pages/auth/Register";
import Login from "../pages/auth/Login";
import ForgotPassword from "../pages/auth/ForgotPassword";

// Customer pages
import HomePage from "../pages/customer/HomePage";
import Profile from "../pages/customer/Profile";

// Admin / Shop / Sales / Support
import Dashboard from "../pages/shop/Dashboard";
import SystemConfig from "../pages/admin/SystemConfig";
import SalesOrders from "../pages/sales/SalesOrders";
import Tickets from "../pages/support/Tickets";
import ManageVoucher from "../pages/shop/ManageVoucher";
import ShopOwnerLayout from "../components/layout/ShopOwnerLayout";
import ProtectedRoute from "./ProtectedRoute";

export default function AppRouter() {
  return (
    <Routes>
      {/* Customer area with layout */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/users/profile" element={<Profile />} />
      </Route>

      <Route
        path="/shop"
        element={
          <ProtectedRoute allowedRoles={["shop_owner"]}>
            <ShopOwnerLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />

        <Route path="voucher" element={<ManageVoucher />} />
      </Route>

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
      <Route
        path="/support/*"
        element={
          <ProtectedRoute allowedRoles={["support"]}>
            <Tickets />
          </ProtectedRoute>
        }
      />

      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      {/* 404 */}
      <Route path="*" element={<h1>404 - Not Found</h1>} />
    </Routes>
  );
}
