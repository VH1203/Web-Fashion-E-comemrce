import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { authApi } from "../../services/authService";

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();

  // Các path thuộc nhóm auth
  const authPaths = ["/login", "/register", "/forgot-password"];
  const isAuthPage = authPaths.includes(location.pathname);

  // Lấy thông tin user từ localStorage
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const handleLogout = async () => {
    try {
    await authApi.logout();
    navigate("/login");
  } catch (e) {
    console.error("Logout error", e);
  }
  };

  return (
    <header style={{ borderBottom: "1px solid #eee", padding: "10px 40px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        {/* Logo */}
        <div style={{ fontSize: "22px", fontWeight: "bold" }}>
          <Link to="/">Euphoria</Link>
        </div>

        {/* Nếu là trang Auth */}
        {isAuthPage ? (
          <>
            <div>
              <input
                type="text"
                placeholder="Search"
                style={{
                  padding: "8px 12px",
                  borderRadius: "8px",
                  border: "1px solid #ccc",
                }}
              />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
              <select style={{ padding: "6px" }}>
                <option>English (United States)</option>
                <option>Tiếng Việt</option>
              </select>
              <Link
                to="/login"
                style={{
                  background: "#8a2be2",
                  color: "#fff",
                  padding: "8px 16px",
                  borderRadius: "6px",
                }}
              >
                Login
              </Link>
              <Link
                to="/register"
                style={{
                  border: "1px solid #8a2be2",
                  padding: "8px 16px",
                  borderRadius: "6px",
                  color: "#8a2be2",
                }}
              >
                Sign Up
              </Link>
            </div>
          </>
        ) : (
          // Nếu là trang chính
          <>
            <nav style={{ display: "flex", gap: "20px", fontWeight: "500" }}>
              <Link to="/">Shop</Link>
              <Link to="/men">Men</Link>
              <Link to="/women">Women</Link>
              <Link to="/combos">Combos</Link>
              <Link to="/joggers">Joggers</Link>
            </nav>

            <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
              <button
                title="Wishlist"
                style={{ background: "none", border: "none" }}
              >
                🤍
              </button>
              {/* Nếu đã login → hiển thị tên user + nút Logout */}
              {user ? (
                <>
                  <span style={{ fontWeight: "500" }}>
                    {user.username || "User"}
                  </span>
                  <button
                    onClick={handleLogout}
                    style={{
                      background: "red",
                      color: "#fff",
                      border: "none",
                      padding: "6px 12px",
                      borderRadius: "6px",
                      cursor: "pointer",
                    }}
                  >
                    Logout
                  </button>
                </>
              ) : (
                <Link to="/login" style={{ color: "#8a2be2" }}>
                  👤 Login
                </Link>
              )}
              <button
                title="Cart"
                style={{ background: "none", border: "none" }}
              >
                🛒
              </button>
            </div>
          </>
        )}
      </div>
    </header>
  );
}
