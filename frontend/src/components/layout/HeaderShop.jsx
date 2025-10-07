import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { authApi } from "../../services/authService";
import logo from "../../assets/icons/DFS-NonBG1.png";
import "../../assets/styles/Header.css";

const flagVN = "https://flagcdn.com/w20/vn.png";
const flagUS = "https://flagcdn.com/w20/us.png";

export default function HeaderShop() {
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
      <header className={`header ${isAuthPage ? "header-auth-page" : ""}`}>
        <div className="header-inner">
          {/* Logo */}
          <div className="header-logo" style={{ paddingLeft: "0", marginLeft: "0", display: "flex", alignItems: "center", gap: "10px" }}>
            <Link to="/">
              <div className="logo-wrapper">
                <img src={logo} alt="Daily Fit" className="logo-img" />
              </div>
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
                  Homepage
                </Link>
                
              </nav>

              <div className="header-icons">
                {/* Hàng trên: Hồ sơ + Đăng xuất hoặc Đăng nhập */}
                <div className="user-top">
                  {user ? (
                    <>
                      <Link className="user-name" to="/users/profile">
                        <i className="fa-solid fa-user"></i> Hồ sơ
                      </Link>
                      <button className="logout-btn" onClick={handleLogout}>
                        Đăng xuất
                      </button>
                    </>
                  ) : (
                    <>
                      <Link to="/login" className="login-btn">
                        Đăng nhập
                      </Link>
                      <Link to="/register" className="login-btn">
                        Đăng ký
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </header>
    </>
  );
}
