import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";

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
import { useAuth } from "../context/AuthContext";

export default function AppRouter() {
  const { user } = useAuth();

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
      {/* HOME PAGE */}
      <Route
        path="/"
        element={
          user && user.role !== "customer" ? redirectByRole() : <HomePage />
        }
      />

      {/* CUSTOMER */}
      <Route path="/home" element={<HomePage />} />
      <Route path="/dashboard" element={<Dashboard />} />

      {/* SHOP OWNER */}
      {/* <Route
        path="/shop/*"
        element={
          <ProtectedRoute allowedRoles={["shop_owner"]}>
            <Dashboard />
          </ProtectedRoute>
        }
      /> */}

      {/* SYSTEM ADMIN */}
      <Route
        path="/admin/*"
        element={
          <ProtectedRoute allowedRoles={["system_admin"]}>
            <SystemConfig />
          </ProtectedRoute>
        }
      />

      {/* SALES */}
      <Route
        path="/sales/*"
        element={
          <ProtectedRoute allowedRoles={["sales"]}>
            <SalesOrders />
          </ProtectedRoute>
        }
      />

      {/* SUPPORT */}
      <Route
        path="/support/*"
        element={
          <ProtectedRoute allowedRoles={["support"]}>
            <Tickets />
          </ProtectedRoute>
        }
      />

      {/* PROFILE */}
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

      {/* PRODUCTS & CATEGORIES */}
      <Route path="/categories/:slug" element={<CategoryProductsPage />} />
      <Route path="/products/:type" element={<AllProductsPage />} />

      {/* AUTH */}
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      {/* 404 */}
      <Route path="*" element={<h1>404 - Not Found</h1>} />
    </Routes>
  );
}
