// src/middlewares/rbacMiddleware.js
function rbacMiddleware(roles = []) {
  return (req, res, next) => {
    const user = req.user;
    if (!user) return res.status(401).json({ message: 'Unauthorized' });

    const role =
      user.role?.name ||
      user.role ||
      user.data?.role ||
      user.data?.role?.name;

    if (!role) return res.status(403).json({ message: 'Forbidden: no role' });
    if (Array.isArray(roles) && roles.length && !roles.includes(role)) {
      return res.status(403).json({ message: 'Forbidden: insufficient role' });
    }
    next();
  };
}

module.exports = rbacMiddleware;       // cho cách gọi: rbacMiddleware([...])
module.exports.allow = rbacMiddleware; // cho cách gọi: const { allow } = ...
