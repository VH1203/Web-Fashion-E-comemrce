const jwt = require("jsonwebtoken");
const User = require("../models/User");

exports.verifyToken = async (req, res, next) => {
  // ⬅️ BỎ QUA preflight để CORS hoạt động
  if (req.method === "OPTIONS") return next();

  try {
    const authHeader = req.get("authorization") || ""; // an toàn hơn
    const [scheme, token] = authHeader.split(" ");

    if (scheme !== "Bearer" || !token) {
      return res.status(401).json({ message: "Token không hợp lệ" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded._id);
    if (!user) {
      return res.status(401).json({ message: "Người dùng không tồn tại" });
    }

    req.user = user;
    const safe = user.toObject?.() || {};
    delete safe.password_hash;
    delete safe.refresh_token;
    req.userSafe = safe;

    return next();
  } catch (err) {
    return res.status(403).json({ message: "Token hết hạn hoặc sai" });
  }
};
