module.exports = function requireRole(...allowed) {
  return (req, res, next) => {
    try {
      const role = req.user?.role; // set bởi auth middleware sẵn có
      if (!role || !allowed.includes(role)) {
        return res.status(403).json({ message: "Forbidden" });
      }
      next();
    } catch (e) {
      next(e);
    }
  };
};
