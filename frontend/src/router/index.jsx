import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Auth pages
import Register from "../pages/auth/Register";
import Login from "../pages/auth/Login";
import ForgotPassword from "../pages/auth/ForgotPassword";

// Role pages
import HomePage from "../pages/customer/HomePage";
import Dashboard from "../pages/shop/Dashboard";
import SystemConfig from "../pages/admin/SystemConfig";
import SalesOrders from "../pages/sales/SalesOrders";
import Tickets from "../pages/support/Tickets";

import ProtectedRoute from "./ProtectedRoute";

export default function AppRouter() {
  return (
    <BrowserRouter>
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
        <Route
          path="/support/*"
          element={
            <ProtectedRoute allowedRoles={["support"]}>
              <Tickets />
            </ProtectedRoute>
          }
        />

        {/* Auth */}
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* 404 */}
        <Route path="*" element={<h1>404 - Not Found</h1>} />
      </Routes>
    </BrowserRouter>
  );
}
