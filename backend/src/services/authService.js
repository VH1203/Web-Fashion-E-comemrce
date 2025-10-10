const { v4: uuidv4 } = require("uuid");
const User = require("../models/User");
const { hashPassword, comparePassword } = require("../utils/hash");
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require("../utils/jwt");
const { normalizeIdentifier, isValidPassword } = require("../utils/validators");
const { redis } = require("../config/redis");
const { sendOtpEmail } = require("./notificationService");
const { OAuth2Client } = require("google-auth-library");

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const client = new OAuth2Client(GOOGLE_CLIENT_ID);
const CUSTOMER_ROLE = { _id: "role-customer", name: "customer" };

const genOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

const throwError = (msg, status = 400) => {
  const err = new Error(msg);
  err.status = status;
  throw err;
};

// ========== OTP helpers ==========
async function saveOtp(key, otp, ttlSec = 900) {
  // ✅ TTL mặc định 15 phút
  await redis.setEx(key, ttlSec, otp);
}
async function getOtp(key) {
  return redis.get(key);
}
async function deleteOtp(key) {
  return redis.del(key);
}

// ========== Register ==========
async function checkDuplicate({ username, email, phone }) {
  const existed = await User.findOne({
    $or: [{ username: username?.toLowerCase() }, { email: email?.toLowerCase() }, { phone }],
  });
  if (!existed) return;

  const dupFields = [];
  if (existed.username === username?.toLowerCase()) dupFields.push("username");
  if (existed.email === email?.toLowerCase()) dupFields.push("email");
  if (existed.phone === phone) dupFields.push("phone");
  throwError(`Đã tồn tại ${dupFields.join(", ")}`, 409);
}

async function requestRegisterOTP({ username, email, phone, password, confirmPassword, agreePolicy}) {
  if (!agreePolicy) throwError("Bạn cần đồng ý với chính sách.");
  if (password !== confirmPassword) throwError("Mật khẩu xác nhận không khớp");
  if (!isValidPassword(password)) throwError("Mật khẩu phải ≥8 ký tự, có chữ hoa, thường, số, ký tự đặc biệt");

  await checkDuplicate({ username, email, phone });

  const otp = genOTP();
  const key = `otp:register:${email.toLowerCase()}`;
  await saveOtp(key, otp); 
  await sendOtpEmail(email, otp, "đăng ký");

  return { sent: true, message: "OTP đã gửi tới email" };
}

async function verifyRegisterOTP({ name, username, email, phone, password, otp }) {
  const key = `otp:register:${email.toLowerCase()}`;
  const cached = await getOtp(key);
  if (!cached || cached !== otp) throwError("OTP không hợp lệ hoặc đã hết hạn");

  await checkDuplicate({ username, email, phone });

  const user = await User.create({
    _id: `user-${uuidv4()}`,
    name,
    username: username.toLowerCase(),
    email: email.toLowerCase(),
    phone,
    password_hash: await hashPassword(password),
   role: CUSTOMER_ROLE,
  });

  await deleteOtp(key);
  return { registered: true, user: { id: user._id, username: user.username, email: user.email} };
}

// ========== Login ==========
async function login({ identifier, password }) {
  const { type, value } = normalizeIdentifier(identifier);
  const user = await User.findOne({ [type]: value }).lean();

  if (!user) throwError("Tài khoản không tồn tại", 404);
  if (!user.password_hash) throwError("Tài khoản này chỉ hỗ trợ đăng nhập Google", 400);

  const ok = await comparePassword(password, user.password_hash);
  if (!ok) throwError("Sai mật khẩu", 401);

  const payload = { sub: user._id, role: user.role, username: user.username };
  return {
    access_token: signAccessToken(payload),
    refresh_token: signRefreshToken(payload),
    expires_in: 3600,
    user: { id: user._id, username: user.username, email: user.email, role: user.role },
  };
}

async function loginWithGoogle({ token }) {
  if (!token) throwError("Thiếu Google token");

  try {
    const ticket = await client.verifyIdToken({ idToken: token, audience: GOOGLE_CLIENT_ID });
    const payload = ticket.getPayload();
    const email = payload.email.toLowerCase();

    let user = await User.findOne({ email });
    if (!user) {
      const base = email.split("@")[0].toLowerCase();
      let username = base;
      let i = 1;
      while (await User.findOne({ username })) username = `${base}${i++}`;

      user = await User.create({
        _id: `user-${uuidv4()}`,
        name: payload.name,
        email,
        username,
        avatar_url: payload.picture || null,
        password_hash: null,
        role: CUSTOMER_ROLE,
      });
    } else if (!user.avatar_url && payload.picture) {
      user.avatar_url = payload.picture;
      await user.save();
    }

    const jwtPayload = { sub: user._id, role: user.role, username: user.username };
    return {
      access_token: signAccessToken(jwtPayload),
      refresh_token: signRefreshToken(jwtPayload),
      user: {
        id: user._id,
        name: user.name,
        email,
        avatar: user.avatar_url,
        role: user.role,
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
    await redis.setEx(`blacklist:refresh:${token}`, ttl, "1");
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
  });
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

  if (await comparePassword(newPassword, user.password_hash)) {
    throwError("Mật khẩu mới không được trùng mật khẩu cũ");
  }

  user.password_hash = await hashPassword(newPassword);
  user.updated_at = new Date();
  await user.save();
  await deleteOtp(key);

  return { reset: true, message: "Đổi mật khẩu thành công" };
}

// ========== Set password (Google user / đổi mật khẩu) ==========
async function requestSetPasswordOTP({ identifier }) {
  const { type, value } = normalizeIdentifier(identifier);
  const user = await User.findOne({
    $or: [{ email: new RegExp(`^${value}$`, "i") }, { phone: value }, { username: value }],
  });
  if (!user) throwError("Tài khoản không tồn tại", 404);

  const otp = genOTP();
  const key = `otp:setpassword:${user.email.toLowerCase()}`;
  await saveOtp(key, otp); // ✅ TTL 15 phút
  const action = user.password_hash ? "đổi mật khẩu" : "đặt mật khẩu";
  await sendOtpEmail(user.email, otp, action);
  return { sent: true, action };
}

async function setPasswordForGoogleUser({ identifier, otp, newPassword }) {
  const { type, value } = normalizeIdentifier(identifier);
  const user = await User.findOne({
    $or: [
      { email: new RegExp(`^${value}$`, "i") },
      { phone: value },
      { username: value },
    ],
  });

  if (!user)
    throw Object.assign(new Error("Tài khoản không tồn tại"), { status: 404 });

  const key = `otp:setpassword:${user.email.toLowerCase()}`;
  const cached = await redis.get(key);

  console.log("DEBUG OTP CHECK >>>", {
    key,
    cached,
    otpInput: otp,
    identifier,
    newPassword,
  });

  if (!cached) {
    const keys = await redis.keys("otp:setpassword:*");
    console.log("🔍 Redis existing keys:", keys);
    throw Object.assign(new Error("OTP đã hết hạn (Redis key null)"), { status: 400 });
  }

  if (cached.trim() !== otp.trim())
    throw Object.assign(new Error("OTP không hợp lệ"), { status: 400 });

  // ✅ Giai đoạn 1: xác thực OTP
  if (!newPassword) {
    const ttl = await redis.ttl(key);
    console.log("✅ OTP verified, TTL remaining (seconds):", ttl);
    return { verified: true, message: "OTP xác thực thành công!" };
  }

  // ✅ Giai đoạn 2: đặt mật khẩu mới
  if (!isValidPassword(newPassword))
    throw Object.assign(new Error("Mật khẩu mới không đủ mạnh"), { status: 400 });

  user.password_hash = await hashPassword(newPassword);
  user.updated_at = new Date();
  await user.save();

  await redis.del(key);
  console.log("🔥 OTP key deleted:", key);

  return { success: true, message: "Đặt mật khẩu thành công!" };
}

// ========== EXPORT ==========
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
