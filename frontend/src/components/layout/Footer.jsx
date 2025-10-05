import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../../assets/styles/Footer.css";
import logo from "../../assets/icons/DFS-NonBG1.png";

export default function Footer() {
  const [email, setEmail] = useState("");
  const onSubscribe = (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    // TODO: call newsletter API here
    alert("Đã đăng ký nhận tin!");
    setEmail("");
  };

  return (
    <footer className="dfs-footer">
      {/* Top CTA */}
      <section className="dfs-footer__cta">
        <div className="dfs-container">
          <div className="dfs-footer__cta-inner">
            <div className="dfs-footer__brand">
              <img src={logo} alt="DFS" className="dfs-footer__logo" />
              <div>
                <h3>Daily Fit System</h3>
                <p>Thời trang thông minh · Gợi ý size bằng AI · Giao nhanh</p>
              </div>
            </div>
            <form className="dfs-footer__newsletter" onSubmit={onSubscribe}>
              <label htmlFor="newsletter" className="sr-only">
                Email nhận khuyến mãi
              </label>
              <input
                id="newsletter"
                type="email"
                placeholder="Nhập email để nhận ưu đãi"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <button type="submit">Đăng ký</button>
            </form>
          </div>
        </div>
      </section>

      {/* Main links */}
      <section className="dfs-footer__links">
        <div className="dfs-container dfs-grid">
          <div className="dfs-col">
            <h4>Về DFS</h4>
            <ul>
              <li><Link to="/about">Giới thiệu</Link></li>
              <li><Link to="/blog">Blog</Link></li>
              <li><Link to="/careers">Tuyển dụng</Link></li>
              <li><Link to="/contact">Liên hệ</Link></li>
            </ul>
          </div>

          <div className="dfs-col">
            <h4>Danh mục</h4>
            <ul>
              <li><Link to="/category/men">Thời trang nam</Link></li>
              <li><Link to="/category/women">Thời trang nữ</Link></li>
              <li><Link to="/category/new">Hàng mới về</Link></li>
              <li><Link to="/category/flash-sale">Flash Sale</Link></li>
            </ul>
          </div>

          <div className="dfs-col">
            <h4>Hỗ trợ</h4>
            <ul>
              <li><Link to="/help/faq">Câu hỏi thường gặp</Link></li>
              <li><Link to="/help/shipping">Vận chuyển & giao hàng</Link></li>
              <li><Link to="/help/return">Đổi trả & hoàn tiền</Link></li>
              <li><Link to="/policy/warranty">Bảo hành</Link></li>
            </ul>
          </div>

          <div className="dfs-col">
            <h4>Chính sách</h4>
            <ul>
              <li><Link to="/policy/terms">Điều khoản sử dụng</Link></li>
              <li><Link to="/policy/privacy">Chính sách bảo mật</Link></li>
              <li><Link to="/policy/payment">Thanh toán</Link></li>
              <li><Link to="/policy/cookie">Cookie</Link></li>
            </ul>
          </div>

          <div className="dfs-col dfs-col--wide">
            <h4>Kết nối với chúng tôi</h4>
            <div className="dfs-footer__social">
              <a href="#" aria-label="Facebook" title="Facebook">
                <i className="fa-brands fa-facebook-f"></i>
              </a>
              <a href="#" aria-label="Instagram" title="Instagram">
                <i className="fa-brands fa-instagram"></i>
              </a>
              <a href="#" aria-label="Tiktok" title="Tiktok">
                <i className="fa-brands fa-tiktok"></i>
              </a>
              <a href="#" aria-label="YouTube" title="YouTube">
                <i className="fa-brands fa-youtube"></i>
              </a>
              <a href="#" aria-label="X" title="X">
                <i className="fa-brands fa-x-twitter"></i>
              </a>
            </div>

            <div className="dfs-footer__badges">
              <a className="store-badge" href="#" aria-label="Tải trên App Store">
                <i className="fa-brands fa-apple"></i>
                <span>
                  <small>Tải trên</small>
                  App Store
                </span>
              </a>
              <a className="store-badge" href="#" aria-label="Tải trên Google Play">
                <i className="fa-brands fa-google-play"></i>
                <span>
                  <small>Tải trên</small>
                  Google Play
                </span>
              </a>
            </div>

            <div className="dfs-footer__payments" aria-label="Phương thức thanh toán">
              <span title="Visa">VISA</span>
              <span title="Mastercard">Mastercard</span>
              <span title="VNPay">VNPay</span>
              <span title="MoMo">MoMo</span>
              <span title="COD">COD</span>
            </div>

            <div className="dfs-footer__selectors">
              <div className="selector">
                <i className="fa-solid fa-globe"></i>
                <select defaultValue="vi">
                  <option value="vi">Tiếng Việt</option>
                  <option value="en">English</option>
                </select>
              </div>
              <div className="selector">
                <i className="fa-solid fa-coins"></i>
                <select defaultValue="VND">
                  <option value="VND">VND (₫)</option>
                  <option value="USD">USD ($)</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom bar */}
      <section className="dfs-footer__bottom">
        <div className="dfs-container dfs-footer__bottom-inner">
          <p>
            © {new Date().getFullYear()} Daily Fit System. All rights reserved.
          </p>
          <ul className="dfs-footer__bottom-links">
            <li><Link to="/sitemap">Sitemap</Link></li>
            <li><Link to="/policy/privacy">Privacy</Link></li>
            <li><Link to="/policy/terms">Terms</Link></li>
          </ul>
        </div>
      </section>
    </footer>
  );
}
