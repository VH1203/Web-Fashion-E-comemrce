// middlewares/rbacMiddleware.js
const Role = require("../models/Role");

/* ============ Helpers ============ */

function normalizeRoleId(roleId) {
  if (!roleId) return roleId;
  return typeof roleId === "string" ? roleId.replace(/^"+|"+$/g, "") : roleId;
}

function isSuperAdmin(acl) {
  return acl.role_name === "system_admin" || acl.permissions.includes("all:*");
}

function toArray(x) {
  if (!x) return [];
  return Array.isArray(x) ? x : [x];
}


async function buildACL(userDoc) {
  const roleId = normalizeRoleId(userDoc?.role_id);
  let roleName = null;
  let perms = [];

  if (roleId) {
    const role = await Role.findById(roleId).lean();
    roleName = role?.name || null;
    perms = Array.isArray(role?.permissions) ? role.permissions : [];
  }

  return {
    user_id: String(userDoc?._id || ""),
    role_id: roleId || null,
    role_name: roleName,
    permissions: perms,
    status: userDoc?.status || null,
  };
}

async function withACL(req, res, next) {
  try {
    if (!req.user) {
      return res.status(401).json({ message: "Chưa đăng nhập" });
    }
    if (req.acl) return next(); // đã có rồi

    req.acl = await buildACL(req.user);
    // middlewares/rbac.js, trong withACL
console.log("ACL DEBUG:", req.acl);

    // Có thể chặn user bị khóa
    if (req.acl.status && req.acl.status !== "active") {
      return res.status(403).json({ message: "Tài khoản bị hạn chế" });
    }
    return next();
  } catch (err) {
    console.error("withACL error:", err);
    return res.status(500).json({ message: "Lỗi xác thực vai trò/quyền" });
  }
}

/* ============ RBAC Checks ============ */
/**
 * requireRole: yêu cầu user thuộc TẤT CẢ các vai trò (ít dùng)
 * Thực tế thường dùng requireAnyRole.
 */
function requireRole(...roles) {
  const must = roles.flat().map(String);
  return [withACL, (req, res, next) => {
    const { acl } = req;
    if (isSuperAdmin(acl)) return next();
    const ok = must.every(r => acl.role_name === r);
    if (!ok) {
      return res.status(403).json({ message: "Bạn không có vai trò phù hợp", require_roles: must, role: acl.role_name });
    }
    next();
  }];
}

function requireAnyRole(...roles) {
  const whitelist = roles.flat().map(String);
  return [withACL, (req, res, next) => {
    const { acl } = req;
    if (isSuperAdmin(acl)) return next();
    const ok = whitelist.includes(acl.role_name);
    if (!ok) {
      return res.status(403).json({ message: "Bạn không có quyền truy cập chức năng này.", allow_roles: whitelist, role: acl.role_name });
    }
    next();
  }];
}

function requirePerm(...perms) {
  const must = perms.flat().map(String);
  return [withACL, (req, res, next) => {
    const { acl } = req;
    if (isSuperAdmin(acl)) return next();
    const hasAll = must.every(p => acl.permissions.includes(p));
    if (!hasAll) {
      return res.status(403).json({ message: "Thiếu quyền", require_permissions: must, permissions: acl.permissions });
    }
    next();
  }];
}

function requireAnyPerm(...perms) {
  const any = perms.flat().map(String);
  return [withACL, (req, res, next) => {
    const { acl } = req;
    if (isSuperAdmin(acl)) return next();
    const ok = acl.permissions.some(p => any.includes(p));
    if (!ok) {
      return res.status(403).json({ message: "Thiếu quyền truy cập", any_of: any, permissions: acl.permissions });
    }
    next();
  }];
}


function requireShopAccess() {
  return [
    ...requireAnyRole("shop_owner", "sales"),
    ...requirePerm("shop:access"),
  ];
}

/* ============ Exports ============ */
module.exports = {
  withACL,
  requireRole,
  requireAnyRole,
  requirePerm,
  requireAnyPerm,
  requireShopAccess,
};
