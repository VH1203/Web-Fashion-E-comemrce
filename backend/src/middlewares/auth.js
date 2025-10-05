// src/middlewares/auth.js
const jwt = require("jsonwebtoken");

// Lấy secret từ ENV, fallback chuỗi mặc định cho môi trường dev
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";

// Middleware xác thực JWT, gán req.user = { id, role, shopId }
module.exports = function auth(req, res, next) {
  try {
    // Cho phép bypass DEV bằng header khi cần test nhanh (tùy chọn)
    // Ví dụ: x-user-id: u1, x-user-role: cskh, x-shop-id: shop1
    const devUserId = req.header("x-user-id");
    const devRole = req.header("x-user-role");
    const devShopId = req.header("x-shop-id");
    if (devUserId && devRole && devShopId) {
      req.user = { id: String(devUserId), role: String(devRole), shopId: String(devShopId) };
      return next();
    }

    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    const payload = jwt.verify(token, JWT_SECRET);
    // Kỳ vọng payload có các field này khi login phát token
    // { sub: "userId", role: "cskh|owner|admin|customer", shopId: "shop-id" }
    req.user = {
      id: payload.sub || payload.id,
      role: payload.role,
      shopId: payload.shopId
    };

    if (!req.user.id || !req.user.role || !req.user.shopId) {
      return res.status(401).json({ message: "Invalid token payload" });
    }
    next();
  } catch (err) {
    return res.status(401).json({ message: "Unauthorized" });
  }
};

