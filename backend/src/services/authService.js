// src/services/authService.js
const { v4: uuidv4 } = require("uuid");
const User = require("../models/User");
const Role = require("../models/Role");
const { hashPassword, comparePassword } = require("../utils/hash");
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require("../utils/jwt");
const { normalizeIdentifier, isValidPassword } = require("../utils/validators");
const redis = require("../config/redis"); // <- KHÔNG destructuring
const { sendOtpEmail } = require("./notificationService");
const { OAuth2Client } = require("google-auth-library");

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const client = new OAuth2Client(GOOGLE_CLIENT_ID);

// ===== common helpers =====
const genOTP = () => Math.floor(100000 + Math.random() * 900000).toString();
const throwError = (msg, status = 400) => {
  const err = new Error(msg); err.status = status; throw err;
};

// cache nhỏ cho role_id theo tên
const roleCache = new Map();
async function getRoleIdByName(name) {
  if (roleCache.has(name)) return roleCache.get(name);
  const role = await Role.findOne({ name }, { _id: 1 }).lean();
  if (!role) throwError(`Role '${name}' không tồn tại`, 500);
  roleCache.set(name, role._id);
  return role._id;
}

// ===== OTP helpers (ioredis) =====
async function saveOtp(key, otp, ttlSec = 900) { // 15 phút
  await redis.set(key, otp, "EX", ttlSec);
}
async function getOtp(key) { return redis.get(key); }
async function deleteOtp(key) { return redis.del(key); }

// ===== duplicate check =====
async function checkDuplicate({ username, email, phone }) {
  const existed = await User.findOne({
    $or: [
      username ? { username: username.toLowerCase() } : null,
      email ? { email: email.toLowerCase() } : null,
      phone ? { phone } : null,
    ].filter(Boolean),
  }).lean();
  if (!existed) return;
  const dup = [];
  if (username && existed.username === username.toLowerCase()) dup.push("username");
  if (email && existed.email === email.toLowerCase()) dup.push("email");
  if (phone && existed.phone === phone) dup.push("phone");
  throwError(`Đã tồn tại ${dup.join(", ")}`, 409);
}

// ========== Register ==========
async function requestRegisterOTP({ username, email, phone, password, confirmPassword, agreePolicy }) {
  if (!agreePolicy) throwError("Bạn cần đồng ý với chính sách.");
  if (password !== confirmPassword) throwError("Mật khẩu xác nhận không khớp");
  if (!isValidPassword(password)) throwError("Mật khẩu phải ≥8 ký tự, có chữ hoa, thường, số, ký tự đặc biệt");
  if (!email) throwError("Thiếu email");

  await checkDuplicate({ username, email, phone });

  const otp = genOTP();
  const key = `otp:register:${email.toLowerCase()}`;
  await saveOtp(key, otp);
  await sendOtpEmail(email, otp, "đăng ký");

  return { sent: true, message: "OTP đã gửi tới email" };
}

async function verifyRegisterOTP({ name, username, email, phone, password, otp }) {
  if (!email) throwError("Thiếu email");
  const key = `otp:register:${email.toLowerCase()}`;
  const cached = await getOtp(key);
  if (!cached || cached !== otp) throwError("OTP không hợp lệ hoặc đã hết hạn");

  await checkDuplicate({ username, email, phone });

  const roleCustomerId = await getRoleIdByName("customer");

  const user = await User.create({
    _id: `user-${uuidv4()}`,
    name,
    username: username.toLowerCase(),
    email: email.toLowerCase(),
    phone,
    password_hash: await hashPassword(password),
    role_id: roleCustomerId,
  });

  await deleteOtp(key);

  return {
    registered: true,
    user: { id: user._id, username: user.username, email: user.email, role: "customer", role_id: roleCustomerId },
  };
}

// ========== Login ==========
async function login({ identifier, password }) {
  const { type, value } = normalizeIdentifier(identifier);
  const user = await User.findOne({ [type]: value })
    .populate("role_id", "name")
    .lean();

  if (!user) throwError("Tài khoản không tồn tại", 404);
  if (!user.password_hash) throwError("Tài khoản này chỉ hỗ trợ đăng nhập Google", 400);

  const ok = await comparePassword(password, user.password_hash);
  if (!ok) throwError("Sai mật khẩu", 401);

  const roleName = user.role_id?.name || "customer";

  const payload = { sub: user._id, role: roleName, username: user.username };
  return {
    access_token: signAccessToken(payload),
    refresh_token: signRefreshToken(payload),
    expires_in: 3600,
    user: {
      id: user._id,
      username: user.username,
      email: user.email,
      role: roleName,          // 👈 Chuỗi để FE redirect
      role_id: user.role_id?._id || null,
    },
  };
}

// ========== Google Login ==========
async function loginWithGoogle({ token }) {
  if (!token) throwError("Thiếu Google token");
  try {
    const ticket = await client.verifyIdToken({ idToken: token, audience: GOOGLE_CLIENT_ID });
    const payload = ticket.getPayload();
    const email = payload.email.toLowerCase();

    let user = await User.findOne({ email }).populate("role_id", "name");

    if (!user) {
      const base = email.split("@")[0].toLowerCase();
      let username = base, i = 1;
      while (await User.findOne({ username })) username = `${base}${i++}`;

      const roleCustomerId = await getRoleIdByName("customer");

      user = await User.create({
        _id: `user-${uuidv4()}`,
        name: payload.name,
        email,
        username,
        avatar_url: payload.picture || null,
        password_hash: null,
        role_id: roleCustomerId,
      });

      // populate lại để có name
      user = await User.findById(user._id).populate("role_id", "name");
    } else if (!user.avatar_url && payload.picture) {
      await User.updateOne({ _id: user._id }, { $set: { avatar_url: payload.picture } });
    }

    const roleName = user.role_id?.name || "customer";
    const jwtPayload = { sub: user._id, role: roleName, username: user.username };

    return {
      access_token: signAccessToken(jwtPayload),
      refresh_token: signRefreshToken(jwtPayload),
      user: {
        id: user._id,
        name: user.name,
        email,
        avatar: user.avatar_url || null,
        role: roleName,
        role_id: user.role_id?._id || null,
      },
    };
  } catch (err) {
    console.error("❌ Google Login Error:", err);
    throwError("Lỗi khi xác thực Google", 500);
  }
}

// ========== Token refresh / logout ==========
async function refreshToken({ token }) {
  try {
    const decoded = verifyRefreshToken(token);
    const isBlacklisted = await redis.get(`blacklist:refresh:${token}`);
    if (isBlacklisted) throwError("Refresh token đã bị vô hiệu", 401);

    const payload = { sub: decoded.sub, role: decoded.role, username: decoded.username };
    return { access_token: signAccessToken(payload), expires_in: 3600 };
  } catch {
    throwError("Refresh token không hợp lệ hoặc đã hết hạn", 401);
  }
}

async function logout({ token }) {
  if (!token) return { message: "Không có token để logout" };
  try {
    const decoded = verifyRefreshToken(token);
    const ttl = decoded.exp - Math.floor(Date.now() / 1000);
    await redis.set(`blacklist:refresh:${token}`, "1", "EX", Math.max(ttl, 1));
    return { message: "Logout thành công" };
  } catch {
    throwError("Refresh token không hợp lệ hoặc đã hết hạn", 401);
  }
}

// ========== Forgot password ==========
async function requestForgotPasswordOTP({ identifier }) {
  const { type, value } = normalizeIdentifier(identifier);
  const user = await User.findOne({
    $or: [{ email: new RegExp(`^${value}$`, "i") }, { phone: value }, { username: value }],
  }).lean();
  if (!user) throwError("Email/SĐT chưa đăng ký", 404);

  const otp = genOTP();
  const key = `otp:forgot:${user.email.toLowerCase()}`;
  await saveOtp(key, otp);
  await sendOtpEmail(user.email, otp, "khôi phục mật khẩu");
  return { sent: true };
}

async function verifyForgotPassword({ identifier, otp, newPassword }) {
  if (!newPassword) throwError("Thiếu mật khẩu mới");
  if (!isValidPassword(newPassword)) throwError("Mật khẩu mới không đủ mạnh");

  const { type, value } = normalizeIdentifier(identifier);
  const user = await User.findOne({ [type]: value });
  if (!user) throwError("Tài khoản không tồn tại", 404);

  const key = `otp:forgot:${user.email.toLowerCase()}`;
  const cached = await getOtp(key);
  if (!cached) throwError("OTP đã hết hạn");
  if (cached !== otp) throwError("OTP không hợp lệ");

  if (user.password_hash && await comparePassword(newPassword, user.password_hash)) {
    throwError("Mật khẩu mới không được trùng mật khẩu cũ");
  }

  user.password_hash = await hashPassword(newPassword);
  user.updated_at = new Date();
  await user.save();
  await deleteOtp(key);

  return { reset: true, message: "Đổi mật khẩu thành công" };
}

// ========== Set password (Google user / change) ==========
async function requestSetPasswordOTP({ identifier }) {
  const { type, value } = normalizeIdentifier(identifier);
  const user = await User.findOne({
    $or: [{ email: new RegExp(`^${value}$`, "i") }, { phone: value }, { username: value }],
  }).lean();
  if (!user) throwError("Tài khoản không tồn tại", 404);

  const otp = genOTP();
  const key = `otp:setpassword:${user.email.toLowerCase()}`;
  await saveOtp(key, otp);
  const action = user.password_hash ? "đổi mật khẩu" : "đặt mật khẩu";
  await sendOtpEmail(user.email, otp, action);
  return { sent: true, action };
}

async function setPasswordForGoogleUser({ identifier, otp, newPassword }) {
  const { type, value } = normalizeIdentifier(identifier);
  const user = await User.findOne({
    $or: [{ email: new RegExp(`^${value}$`, "i") }, { phone: value }, { username: value }],
  });
  if (!user) throwError("Tài khoản không tồn tại", 404);

  const key = `otp:setpassword:${user.email.toLowerCase()}`;
  const cached = await getOtp(key);
  if (!cached) throwError("OTP đã hết hạn");
  if (cached.trim() !== String(otp).trim()) throwError("OTP không hợp lệ");

  // phase 1: chỉ verify OTP
  if (!newPassword) {
    const ttl = await redis.ttl(key);
    return { verified: true, ttl_remaining: ttl };
  }

  // phase 2: set password
  if (!isValidPassword(newPassword)) throwError("Mật khẩu mới không đủ mạnh");
  user.password_hash = await hashPassword(newPassword);
  user.updated_at = new Date();
  await user.save();
  await deleteOtp(key);

  return { success: true, message: "Đặt mật khẩu thành công!" };
}

// ===== exports =====
module.exports = {
  requestRegisterOTP,
  verifyRegisterOTP,
  login,
  loginWithGoogle,
  requestForgotPasswordOTP,
  verifyForgotPassword,
  refreshToken,
  requestSetPasswordOTP,
  setPasswordForGoogleUser,
  logout,
};
