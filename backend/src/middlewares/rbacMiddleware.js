exports.rbacMiddleware = (allowedRoles = []) => {
  return (req, res, next) => {
    try {
      const role =
        req.user?.role?.name ||
        req.user?.role ||
        req.user?.role_name;

      console.log("RBAC DEBUG:", { role, allowedRoles });

      if (!allowedRoles.includes(role)) {
        return res.status(403).json({ message: "Bạn không có quyền truy cập chức năng này." });
      }

      next();
    } catch (err) {
      console.error("RBAC Error:", err);
      res.status(500).json({ message: "Lỗi xác thực quyền truy cập" });
    }
  };
};
