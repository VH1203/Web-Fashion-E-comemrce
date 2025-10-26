import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Routes, Route, Navigate } from "react-router-dom";

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
