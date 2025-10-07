const { v4: uuidv4 } = require('uuid');
const User = require('../models/User');
const { hashPassword, comparePassword } = require('../utils/hash');
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require('../utils/jwt');
const { normalizeIdentifier, isValidPassword } = require('../utils/validators');
const { redis } = require('../config/redis');
const { sendOtpEmail } = require('./notificationService');

const CUSTOMER_ROLE_ID = '35665c46-a503-4109-b981-eb7d3cbf4ab2';

function genOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

async function checkDuplicate({ username, email, phone }) {
  const existed = await User.findOne({
    $or: [
      { username: username.toLowerCase() },
      { email: email.toLowerCase() },
      { phone }
    ]
  });
  if (existed) {
    const fields = [];
    if (existed.username === username.toLowerCase()) fields.push('username');
    if (existed.email === email.toLowerCase()) fields.push('email');
    if (existed.phone === phone) fields.push('phone');
    const err = new Error(`Đã tồn tại ${fields.join(', ')}`);
    err.status = 409;
    throw err;
  }
}

// 1.1 Đăng ký - gửi OTP
async function requestRegisterOTP({ username, email, phone, password, confirmPassword, agreePolicy }) {
  if (!agreePolicy) throw Object.assign(new Error('Bạn cần đồng ý với chính sách.'), { status: 400 });
  if (password !== confirmPassword) throw Object.assign(new Error('Mật khẩu xác nhận không khớp'), { status: 400 });
  if (!isValidPassword(password)) throw Object.assign(new Error('Mật khẩu phải ≥8 ký tự, có chữ hoa, thường, số, ký tự đặc biệt'), { status: 400 });

  await checkDuplicate({ username, email, phone });

  const otp = genOTP();
  const key = `otp:register:${email.toLowerCase()}`;
  await redis.setEx(key, 600, otp);
  await sendOtpEmail(email, otp, 'đăng ký');
  return { sent: true };
}

// 1.1 Đăng ký - xác thực OTP & tạo user
async function verifyRegisterOTP({ name, username, email, phone, password, otp }) {
  const key = `otp:register:${email.toLowerCase()}`;
  const cached = await redis.get(key);
  if (!cached || cached !== otp)
    throw Object.assign(new Error('OTP không hợp lệ hoặc đã hết hạn'), { status: 400 });

  await checkDuplicate({ username, email, phone });

  const password_hash = await hashPassword(password);
  const user = await User.create({
  name,
  username: username.toLowerCase(),
  email: email.toLowerCase(),
  phone,
  password_hash,
  role: { _id: CUSTOMER_ROLE_ID, name: "customer" },
});

  await redis.del(key);
  return {
    registered: true,
    user: { id: user._id, username: user.username, email: user.email }
  };
}


// 1.2 Đăng nhập
async function login({ identifier, password }) {
  const { type, value } = normalizeIdentifier(identifier);
  const query = type === 'email'
    ? { email: value }
    : type === 'phone'
      ? { phone: value }
      : { username: value };

  const user = await User.findOne(query);
  if (!user) throw Object.assign(new Error('Tài khoản không tồn tại'), { status: 404 });

  // const ok = await comparePassword(password, user.password_hash);
  // if (!ok) throw Object.assign(new Error('Sai mật khẩu'), { status: 401 });

  const payload = { sub: user._id, role: user.role, username: user.username };
  const access_token = signAccessToken(payload);
  const refresh_token = signRefreshToken(payload);

  return {
    access_token,
    refresh_token,
    expires_in: 3600,
    user: { id: user._id, role: user.role, username: user.username }
  };
}

// Refresh token
async function refreshToken({ token }) {
  try {
    const decoded = verifyRefreshToken(token);

    // Kiểm tra blacklist
    const blacklisted = await redis.get(`blacklist:refresh:${token}`);
    if (blacklisted) {
      const err = new Error("Refresh token đã bị vô hiệu");
      err.status = 401;
      throw err;
    }

    const payload = { sub: decoded.sub, role: decoded.role, username: decoded.username };
    const access_token = signAccessToken(payload);
    return { access_token, expires_in: 3600 };
  } catch (e) {
    const err = new Error("Refresh token không hợp lệ hoặc đã hết hạn");
    err.status = 401;
    throw err;
  }
}

// 1.3 Quên mật khẩu - gửi OTP
async function requestForgotPasswordOTP({ identifier }) {
  const { type, value } = normalizeIdentifier(identifier);
  const query = type === 'email'
    ? { email: value }
    : type === 'phone'
      ? { phone: value }
      : { username: value };

  const user = await User.findOne(query);
  if (!user) throw Object.assign(new Error('Email/SĐT chưa đăng ký'), { status: 404 });

  const otp = genOTP();
  const key = `otp:forgot:${user.email.toLowerCase()}`;
  await redis.setEx(key, 600, otp);
  await sendOtpEmail(user.email, otp, 'khôi phục mật khẩu');
  return { sent: true };
}

// 1.3 Quên mật khẩu - xác thực & đổi mật khẩu
async function verifyForgotPassword({ identifier, otp, newPassword }) {
  // Validate password đầu vào
  if (!newPassword) throw Object.assign(new Error('Thiếu mật khẩu mới'), { status: 400 });
  if (!isValidPassword(newPassword))
    throw Object.assign(new Error('Mật khẩu mới không đủ mạnh'), { status: 400 });

  // Chuẩn hoá identifier
  const { type, value } = normalizeIdentifier(identifier);
  const query =
    type === 'email' ? { email: value } :
    type === 'phone' ? { phone: value } :
    { username: value };

  const user = await User.findOne(query);
  if (!user) throw Object.assign(new Error('Tài khoản không tồn tại'), { status: 404 });

  // Lấy OTP trong Redis
  const key = `otp:forgot:${user.email.toLowerCase()}`;
  const cached = await redis.get(key);
  if (!cached) throw Object.assign(new Error('OTP đã hết hạn'), { status: 400 });
  if (cached !== otp) throw Object.assign(new Error('OTP không hợp lệ'), { status: 400 });

  if (user.password_hash) {
    const same = await comparePassword(newPassword, user.password_hash).catch(() => false);
    if (same) throw Object.assign(new Error('Mật khẩu mới không được trùng mật khẩu cũ'), { status: 400 });
  }

  // ✅ Hash mật khẩu mới và lưu lại
  user.password_hash = await hashPassword(newPassword);
  user.updated_at = new Date();
  await user.save();

  // Xoá OTP trong Redis
  await redis.del(key);

  return { reset: true, message: "Đổi mật khẩu thành công" };
}

// 1.4 Logout
async function logout({ token }) {
  if (!token) return { message: "Không có token để logout" };
  try {
    const decoded = verifyRefreshToken(token);
    const key = `blacklist:refresh:${token}`;
    const ttl = decoded.exp - Math.floor(Date.now() / 1000);
    await redis.setEx(key, ttl, "1"); // set "1" thay vì true
    return { message: "Logout thành công" };
  } catch (e) {
    const err = new Error("Refresh token không hợp lệ hoặc đã hết hạn");
    err.status = 401;
    throw err;
  }
}

module.exports = {
  requestRegisterOTP,
  verifyRegisterOTP,
  login,
  requestForgotPasswordOTP,
  verifyForgotPassword,
  refreshToken,
  logout
};
