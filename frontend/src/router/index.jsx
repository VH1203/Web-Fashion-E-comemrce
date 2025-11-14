import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// ===== Auth Pages =====
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import ForgotPassword from "../pages/auth/ForgotPassword";
import ChangePassword from "../pages/auth/ChangePassword";
import TermsAndPolicy from "../pages/support/TermsAndPolicy";

// ===== Role Pages =====
import HomePage from "../pages/customer/HomePage";
import SalesOrders from "../pages/sales/SalesOrders";
import ProductDetail from "../pages/customer/ProductDetail";
import ProfilePage from "../pages/customer/Profile";
import NotFound from "../pages/errors/NotFound";
import Cart from "../pages/customer/Cart";
import Checkout from "../pages/customer/Checkout";
import PaymentReturn from "../pages/customer/PaymentReturn";
import OrderDetail from "../pages/customer/OrderDetail";
import Orders from "../pages/customer/Orders";
import ManageProducts from "../pages/shop/ManageProducts";
import ShopOwnerLayout from "../components/layout/ShopOwner";
import ReviewPages from "../pages/customer/ReviewsPage/ReviewsPage";
import AnalyticsPage from "../pages/shop/AnalyticsPage";
import ManageVoucher from "../pages/shop/ManageVoucher";
import ManageBanner from "../pages/shop/ManageBanner";
import ManageFlashsale from "../pages/shop/ManageFlashsale";
import CustomerLayout from "../components/layout/CustomerLayout";
import ProductsByCategoryPage from "../pages/customer/ProductsByCategoryPage";
import ProductsByBrandPage from "../pages/customer/ProductsByBrandPage";

/** Đợi authReady để tránh redirect sớm */
function ProtectedRoute({ children }) {
  const { isAuthenticated, authReady } = useAuth();
  if (!authReady) return null; // hoặc spinner
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

/** Kiểm tra theo role_name và/hoặc permissions */
function RoleRoute({ children, roles = [], permAny = [], permAll = [] }) {
  const { user, authReady } = useAuth();
  if (!authReady) return null; // hoặc spinner
  if (!user) return <Navigate to="/login" replace />;

  const roleName = user.role_name;
  const perms = Array.isArray(user.permissions) ? user.permissions : [];

  const roleOK = roles.length === 0 ? true : roles.includes(roleName);
  const permAnyOK =
    permAny.length === 0 ? true : permAny.some((p) => perms.includes(p));
  const permAllOK =
    permAll.length === 0 ? true : permAll.every((p) => perms.includes(p));

  const allowed = roleOK && permAnyOK && permAllOK;
  return allowed ? children : <Navigate to="/" replace />;
}

export default function AppRouter() {
  return (
    <Routes>
      <Route element={<CustomerLayout />}>
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
        <Route path="/category/:slug" element={<ProductsByCategoryPage />} />
        <Route path="/brand/:slug" element={<ProductsByBrandPage />} />
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
        <Route
          path="/reviews"
          element={
            <ProtectedRoute>
              <ReviewPages />
            </ProtectedRoute>
          }
        />
        {/* Shop: cho shop_owner/sales hoặc ai có shop:access */}
        {/* Sales */}
        <Route
          path="/sales/orders"
          element={
            <RoleRoute roles={["sales"]}>
              <SalesOrders />
            </RoleRoute>
          }
        />
      </Route>

      <Route
        path="/shop"
        element={
          <RoleRoute roles={["shop_owner", "sales"]} permAny={["shop:access"]}>
            <ShopOwnerLayout />
          </RoleRoute>
        }
      >
        <Route index element={<AnalyticsPage />} />
        <Route path="products" element={<ManageProducts />} />
        <Route path="vouchers" element={<ManageVoucher />} />
        <Route path="banners" element={<ManageBanner />} />
        <Route path="flashsales" element={<ManageFlashsale />} />
      </Route>

      {/* 404 */}
      <Route element={<CustomerLayout />}>
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}
