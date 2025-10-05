function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: "Chưa đăng nhập" });
  // parse token ...
  next();
}

module.exports = { authMiddleware };
