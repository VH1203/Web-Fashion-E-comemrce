import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { authApi } from "../../services/authService";
import logo from "../../assets/icons/DFS-NonBG1.png";
import "../../assets/styles/Header.css";

const flagVN = "https://flagcdn.com/w20/vn.png";
const flagUS = "https://flagcdn.com/w20/us.png";

export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();

  const authPaths = ["/login", "/register", "/forgot-password"];
  const isAuthPage = authPaths.includes(location.pathname);

  const user = JSON.parse(localStorage.getItem("user") || "null");
  const [lang, setLang] = useState(localStorage.getItem("lang") || "en");

  useEffect(() => {
    localStorage.setItem("lang", lang);
  }, [lang]);

  const handleLogout = async () => {
    try {
      await authApi.logout();
      navigate("/login");
    } catch (e) {
      console.error("Logout error", e);
    }
  };

  return (
    <>
      <header className="header">
        <div className="header-inner">
          {/* Logo */}
          <div className="header-logo">
            <Link to="/">
              <img src={logo} alt="Daily Fit" className="logo-img" />
            </Link>
            <span className="logo-text">Daily Fit</span>
          </div>

          {isAuthPage ? (
            <div className="header-auth">
              {/* Switch ngôn ngữ */}
              <div
                className="lang-switch"
                onClick={() => setLang(lang === "en" ? "vi" : "en")}
                title="Đổi ngôn ngữ"
              >
                <div
                  className="lang-thumb"
                  style={{
                    left: lang === "en" ? "4px" : "40px",
                  }}
                >
                  <img
                    src={lang === "en" ? flagUS : flagVN}
                    alt={lang}
                    className="lang-flag"
                  />
                </div>
              </div>

              {/* Auth buttons */}
              <div className="auth-buttons">
                <Link
                  to="/login"
                  className={`auth-btn ${
                    location.pathname === "/login" ? "active" : ""
                  }`}
                >
                  Đăng nhập
                </Link>
                <Link
                  to="/register"
                  className={`auth-btn ${
                    location.pathname === "/register" ? "active" : ""
                  }`}
                >
                  Đăng ký
                </Link>
              </div>
            </div>
          ) : (
            <>
              {/* Navbar */}
              <nav className="main-nav">
                <Link
                  to="/"
                  className={`nav-link ${
                    location.pathname === "/" ? "active" : ""
                  }`}
                >
                  Shop
                </Link>
                <Link
                  to="/men"
                  className={`nav-link ${
                    location.pathname === "/men" ? "active" : ""
                  }`}
                >
                  Men
                </Link>
                <Link
                  to="/women"
                  className={`nav-link ${
                    location.pathname === "/women" ? "active" : ""
                  }`}
                >
                  Women
                </Link>
                <Link
                  to="/combos"
                  className={`nav-link ${
                    location.pathname === "/combos" ? "active" : ""
                  }`}
                >
                  Combos
                </Link>
                <Link
                  to="/joggers"
                  className={`nav-link ${
                    location.pathname === "/joggers" ? "active" : ""
                  }`}
                >
                  Joggers
                </Link>
              </nav>

              {/* Icons */}
              <div className="header-icons">
                <Link to="/wishlist" className="icon-link">
                  <i className="fas fa-heart"></i>
                </Link>
                <Link to="/cart" className="icon-link">
                  <i className="fas fa-shopping-cart"></i>
                </Link>

                {user ? (
                  <div className="user-info">
                    <span className="user-name">
                      <i className="fa-solid fa-user"></i> Hồ sơ
                    </span>
                    <button className="logout-btn" onClick={handleLogout}>
                      Đăng xuất
                    </button>
                  </div>
                ) : (
                  <Link to="/login" className="icon-link login-link">
                    <i className="fas fa-user"></i> Đăng nhập
                  </Link>
                )}
              </div>
            </>
          )}
        </div>
      </header>
    </>
  );
}
