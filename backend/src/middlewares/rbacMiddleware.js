function rbacMiddleware(allowedRoles = []) {
  return (req, res, next) => {
    try {
      const userRole = req.user?.role?.name;
      if (!allowedRoles.includes(userRole)) {
        return res.status(403).json({
          message: "Bạn không có quyền truy cập chức năng này.",
        });
      }
      next();
    } catch (err) {
      res.status(500).json({ message: "Lỗi xác thực quyền truy cập" });
    }
  };
}

module.exports = { rbacMiddleware };
