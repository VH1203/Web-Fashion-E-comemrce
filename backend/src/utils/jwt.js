// utils/jwt.js
const jwt = require("jsonwebtoken");
const Role = require("../models/Role");

const BASE_FIELDS = ["_id", "name", "username", "email", "avatar_url", "status"];

function normalizeRoleId(roleId) {
  if (!roleId) return roleId;
  if (typeof roleId === "string") return roleId.replace(/^"+|"+$/g, "");
  return roleId;
}

async function buildJwtPayload(userDoc) {
  const roleId = normalizeRoleId(userDoc.role_id);
  let roleDoc = null;

  if (roleId) {
    roleDoc = await Role.findById(roleId).lean();
  }

  const base = BASE_FIELDS.reduce((o, k) => {
    if (userDoc[k] != null) o[k] = userDoc[k];
    return o;
  }, {});

  return {
    ...base,
    role_id: roleId || null,
    role_name: roleDoc?.name || null,                  // VD: "shop_owner"
    permissions: Array.isArray(roleDoc?.permissions)
      ? roleDoc.permissions
      : [],                                            // VD: ["shop:access", ...]
  };
}

exports.generateAccessToken = async (userDoc) => {
  const payload = await buildJwtPayload(userDoc);
  return jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "1h",
  });
};

exports.generateRefreshToken = async (userDoc) => {
  // Refresh token chỉ nên chứa tối thiểu thông tin
  return jwt.sign(
    { _id: userDoc._id, token_type: "refresh" },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d" }
  );
};
