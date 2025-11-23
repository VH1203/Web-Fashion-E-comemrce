import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

/* ===== Auth Pages ===== */
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import ForgotPassword from "../pages/auth/ForgotPassword";
import ChangePassword from "../pages/auth/ChangePassword";
import TermsAndPolicy from "../pages/support/TermsAndPolicy";

/* ===== Customer Pages ===== */
import HomePage from "../pages/customer/HomePage";
import ProductDetail from "../pages/customer/ProductDetail";
import ProfilePage from "../pages/customer/Profile";
import Cart from "../pages/customer/Cart";
import Checkout from "../pages/customer/Checkout";
import PaymentReturn from "../pages/customer/PaymentReturn";
import OrderDetail from "../pages/customer/OrderDetail";
import Orders from "../pages/customer/Orders";

/* ===== Shop (Seller) Pages ===== */
import ShopLayout from "../pages/shop/ShopLayout";          // <- layout chung có sidebar/header + <Outlet/>
import Dashboard from "../pages/shop/Dashboard";            // bảng điều khiển
import ManageProducts from "../pages/shop/ManageProducts";  // ĐỔI tên file từ ManageProducts1 -> ManageProducts
import AddProduct from "../pages/shop/AddProduct";          // tạo/sửa sản phẩm
// Các trang mới khuyến nghị có sẵn (placeholder nếu chưa tạo)
import LowStockPage from "../pages/shop/LowStockPage";     // hàng sắp hết
// import CategoriesPage from "../pages/shop/catalog/CategoriesPage";   // CRUD danh mục
// import AttributesPage from "../pages/shop/catalog/AttributesPage";   // CRUD thuộc tính
// import BrandsPage from "../pages/shop/catalog/BrandsPage";           // CRUD brand
// import VariantsPage from "../pages/shop/VariantsPage";               // quản lý biến thể theo sản phẩm

/* ===== Other Roles ===== */
import SystemConfig from "../pages/admin/SystemConfig";
import SalesOrders from "../pages/sales/SalesOrders";
import Tickets from "../pages/support/Tickets";
import NotFound from "../pages/errors/NotFound";

/* ===== Guards ===== */
function ProtectedRoute({ children }) {
  const { isAuthenticated, authReady } = useAuth();
  if (!authReady) return null;
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function RoleRoute({ children, roles = [], permAny = [], permAll = [] }) {
  const { user, authReady } = useAuth();
  if (!authReady) return null;
  if (!user) return <Navigate to="/login" replace />;

  // role_name/permissions chuẩn
  const roleName = user.role_name || user.role || user.role_id; // fallback nếu backend set khác
  const perms = Array.isArray(user.permissions) ? user.permissions : [];

  const roleOK = roles.length === 0 ? true : roles.includes(roleName);
  const permAnyOK = permAny.length === 0 ? true : permAny.some((p) => perms.includes(p));
  const permAllOK = permAll.length === 0 ? true : permAll.every((p) => perms.includes(p));

  return roleOK && permAnyOK && permAllOK ? children : <Navigate to="/" replace />;
}

/* Gộp guard cho toàn bộ khu /shop */
function ShopGuard({ children }) {
  return (
    <ProtectedRoute>
      <RoleRoute roles={["shop_owner", "sales"]} permAny={["shop:access"]}>
        {children}
      </RoleRoute>
    </ProtectedRoute>
  );
}

export default function AppRouter() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/legal/privacy" element={<TermsAndPolicy />} />

      {/* Đổi mật khẩu: cần đăng nhập */}
      <Route
        path="/change-password"
        element={
          <ProtectedRoute>
            <ChangePassword />
          </ProtectedRoute>
        }
      />

      {/* Customer */}
      <Route path="/" element={<HomePage />} />
      <Route path="/product/:idOrSlug" element={<ProductDetail />} />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/cart"
        element={
          <ProtectedRoute>
            <Cart />
          </ProtectedRoute>
        }
      />
      <Route
        path="/checkout"
        element={
          <ProtectedRoute>
            <Checkout />
          </ProtectedRoute>
        }
      />
      <Route
        path="/payment/return"
        element={
          <ProtectedRoute>
            <PaymentReturn />
          </ProtectedRoute>
        }
      />
      <Route
        path="/orders"
        element={
          <ProtectedRoute>
            <Orders />
          </ProtectedRoute>
        }
      />
      <Route
        path="/orders/:id"
        element={
          <ProtectedRoute>
            <OrderDetail />
          </ProtectedRoute>
        }
      />

      {/* ======= SHOP AREA (một layout, một guard) ======= */}
      <Route
        path="/shop"
        element={
          <ShopGuard>
            <ShopLayout />
          </ShopGuard>
        }
      >
        {/* index -> dashboard */}
        <Route index element={<Navigate to="dashboard" replace />} />

        {/* Dashboard */}
        <Route path="dashboard" element={<Dashboard />} />

        {/* Products */}
        <Route path="admin/products" element={<ManageProducts />} />
        <Route path="admin/products/new" element={<AddProduct />} />
        <Route path="admin/products/:id" element={<AddProduct mode="edit" />} />
        <Route path="admin/products/:id/variants" element={<VariantsPage />} />

        {/* Inventory */}
        <Route path="inventory/low-stock" element={<LowStockPage />} />

        {/* Catalog */}
        <Route path="catalog/categories" element={<CategoriesPage />} />
        <Route path="catalog/attributes" element={<AttributesPage />} />
        <Route path="catalog/brands" element={<BrandsPage />} />
      </Route>

      {/* Aliases/Redirects cũ (giữ tương thích) */}
      <Route path="/shop/products" element={<Navigate to="/shop/admin/products" replace />} />
      <Route path="/shop/products/new" element={<Navigate to="/shop/admin/products/new" replace />} />
      <Route path="/shop/dashboard" element={<Navigate to="/shop" replace />} />

      {/* Sales */}
      <Route
        path="/sales/orders"
        element={
          <RoleRoute roles={["sales"]}>
            <SalesOrders />
          </RoleRoute>
        }
      />

      {/* Support */}
      <Route
        path="/support/tickets"
        element={
          <RoleRoute roles={["support"]}>
            <Tickets />
          </RoleRoute>
        }
      />

      {/* Admin */}
      <Route
        path="/admin/system-config"
        element={
          <RoleRoute roles={["system_admin"]}>
            <SystemConfig />
          </RoleRoute>
        }
      />

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
