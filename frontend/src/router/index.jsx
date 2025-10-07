import React, { Suspense } from "react";
import { Routes, Route, Navigate } from "react-router-dom";

import HomePage from "../pages/customer/HomePage.jsx";
import SystemIntake from "../pages/admin/SystemIntake.jsx";
import TicketList from "../pages/support/TicketList.jsx";
import TicketDetail from "../pages/support/TicketDetail.jsx";
import OwnerDesk from "../pages/shop/OwnerDesk.jsx";

import Login from "../pages/auth/Login.jsx";
import Register from "../pages/auth/Register.jsx";
import ForgotPassword from "../pages/auth/ForgotPassword.jsx";

import ProtectedRoute from "./ProtectedRoute.jsx";
import Topbar from "../components/layout/Topbar.jsx";

export default function AppRouter() {
  return (
    <>
      <Topbar />
      <Suspense fallback={<div className="p-4">Loading...</div>}>
        <div className="container-fluid py-3">
          <Routes>
            {/* Public */}
            <Route path="/" element={<HomePage />} />

            {/* System Admin (trung gian) */}
            <Route
              path="/admin/intake"
              element={
                <ProtectedRoute allowedRoles={["system_admin"]}>
                  <SystemIntake />
                </ProtectedRoute>
              }
            />

            {/* Support (CSKH của shop) */}
            <Route
              path="/support/tickets"
              element={
                <ProtectedRoute allowedRoles={["support"]}>
                  <TicketList />
                </ProtectedRoute>
              }
            />
            <Route
              path="/support/tickets/:id"
              element={
                <ProtectedRoute allowedRoles={["support","shop_owner","system_admin"]}>
                  <TicketDetail />
                </ProtectedRoute>
              }
            />

            {/* Shop Owner (duyệt) */}
            <Route
              path="/shop/desk"
              element={
                <ProtectedRoute allowedRoles={["shop_owner"]}>
                  <OwnerDesk />
                </ProtectedRoute>
              }
            />

            {/* Auth */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            {/* tiện */}
            <Route path="/home" element={<Navigate to="/" replace />} />
            <Route path="*" element={<h1 className="p-4">404 - Not Found</h1>} />
          </Routes>
        </div>
      </Suspense>
    </>
  );
}
