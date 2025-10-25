const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const redis = require("../config/redis");
const User = require("../models/User");
const { sendEmail } = require("./notificationService");
const { generateAccessToken, generateRefreshToken } = require("../utils/jwt");

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
console.log("Redis module path:", require.resolve("../config/redis"));
console.log("Redis type:", typeof redis);
console.log("Redis constructor name:", redis.constructor?.name);
console.log("Redis keys:", Object.keys(redis));


const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();

exports.requestOTP = async ({ email, phone, type }) => {
  const identifier = email || phone;
  if (!identifier) throw new Error("Thiếu email hoặc số điện thoại");

  const otp = generateOTP();

  try {
    console.log("🧩 redis type:", typeof redis.setEx);
console.log("🧩 redis status:", redis.status);

    await redis.set(`otp:${type}:${identifier}`, otp, "EX", 600);
    console.log(`✅ OTP lưu vào Redis cho ${identifier}:`, otp);
  } catch (err) {
    console.error("❌ Lỗi khi lưu OTP vào Redis:", err.message);
    throw new Error("Không thể lưu OTP, vui lòng thử lại");
  }

  try {
    await sendEmail(email, "Mã OTP Xác thực", `Mã OTP của bạn là ${otp}`);
  } catch (err) {
    console.error("❌ Lỗi khi gửi email OTP:", err.message);
    throw new Error("Không thể gửi email OTP");
  }

  return { identifier, expiresIn: "10 phút" };
};
exports.verifyRegister = async ({ email, otp, name, username, password }) => {
  const cachedOtp = await redis.get(`otp:register:${email}`);
  if (!cachedOtp || cachedOtp !== otp) throw new Error("OTP không hợp lệ hoặc đã hết hạn");

  const existing = await User.findOne({ $or: [{ email }, { username }] });
  if (existing) throw new Error("Email hoặc username đã tồn tại");

  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);

  const user = await User.create({
    name,
    username,
    email,
    password_hash: hash,
    role_id: "role-customer",
  });

  await redis.del(`otp:register:${email}`);
  return { user };
};

exports.login = async (identifier, password) => {
  const user = await User.findOne({
    $or: [{ email: identifier }, { username: identifier }, { phone: identifier }],
  });
  if (!user) throw new Error("Tài khoản không tồn tại");

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) throw new Error("Sai mật khẩu");

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);
  user.refresh_token = refreshToken;
  user.last_login = new Date();
  await user.save();

  return { accessToken, refreshToken, user };
};

exports.googleLogin = async (idToken) => {
  const ticket = await client.verifyIdToken({
    idToken,
    audience: process.env.GOOGLE_CLIENT_ID,
  });
  const payload = ticket.getPayload();

  let user = await User.findOne({ email: payload.email });
  if (!user) {
    user = await User.create({
      name: payload.name,
      email: payload.email,
      username: payload.email.split("@")[0],
      avatar_url: payload.picture,
      role_id: "role-customer",
    });
  }

  const accessToken = generateAccessToken(user);
  const refreshToken = generateRefreshToken(user);
  user.refresh_token = refreshToken;
  user.last_login = new Date();
  await user.save();

  return { accessToken, refreshToken, user };
};

exports.resetPassword = async (email, otp, newPassword) => {
  const cachedOtp = await redis.get(`otp:forgot:${email}`);
  if (!cachedOtp || cachedOtp !== otp) throw new Error("OTP không hợp lệ hoặc hết hạn");

  const user = await User.findOne({ email });
  if (!user) throw new Error("Tài khoản không tồn tại");

  const isSame = await bcrypt.compare(newPassword, user.password_hash);
  if (isSame) throw new Error("Mật khẩu mới không được trùng mật khẩu cũ");

  const salt = await bcrypt.genSalt(10);
  user.password_hash = await bcrypt.hash(newPassword, salt);
  await user.save();
  await redis.del(`otp:forgot:${email}`);

  return { message: "Mật khẩu đã được đặt lại" };
};

exports.changePassword = async (userId, oldPassword, newPassword) => {
  const user = await User.findById(userId);
  if (!user) throw new Error("Không tìm thấy người dùng");

  const valid = await bcrypt.compare(oldPassword, user.password_hash);
  if (!valid) throw new Error("Mật khẩu cũ không chính xác");

  const isSame = await bcrypt.compare(newPassword, user.password_hash);
  if (isSame) throw new Error("Mật khẩu mới không được trùng mật khẩu cũ");

  const salt = await bcrypt.genSalt(10);
  user.password_hash = await bcrypt.hash(newPassword, salt);
  await user.save();

  return { message: "Đổi mật khẩu thành công" };
};
