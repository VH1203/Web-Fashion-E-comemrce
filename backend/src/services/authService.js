const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const redis = require("../config/redis");
const User = require("../models/User");
const Role = require("../models/Role");
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
  const normEmail = String(email).trim().toLowerCase();
  const normUsername = String(username).trim().toLowerCase();

  const otpKey = `otp:register:${normEmail}`;
  const cachedOtp = await redis.get(otpKey);
  if (!cachedOtp || cachedOtp !== otp) {
    throw new Error("OTP không hợp lệ hoặc đã hết hạn");
  }

  const existing = await User.findOne({ 
    $or: [{ email: normEmail }, { username: normUsername }] 
  });
  if (existing) throw new Error("Email hoặc username đã tồn tại");

  if (!password || password.length < 8) {
    throw new Error("Mật khẩu phải tối thiểu 8 ký tự");
  }

  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);

  // 🔑 Lookup role theo name
  const role = await Role.findOne({ name: "customer" });
  if (!role) throw new Error("Role 'customer' chưa được seed");

  const user = await User.create({
    name,
    username: normUsername,
    email: normEmail,
    password_hash: hash,
    role_id: role._id, 
    status: "active",
  });

  await redis.del(otpKey);

  const safe = user.toObject();
  delete safe.password_hash;
  return { user: safe };
};

exports.login = async (identifier, password) => {
  const id = String(identifier).trim().toLowerCase();
  const user = await User.findOne({
    $or: [{ email: identifier }, { username: identifier }, { phone: identifier }],
  });
  if (!user) throw new Error("Tài khoản không tồn tại");

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) throw new Error("Sai mật khẩu");

  const accessToken = await generateAccessToken(user);
  const refreshToken = await generateRefreshToken(user);
  user.refresh_token = refreshToken;
  user.last_login = new Date();
  await user.save();

  const role = await Role.findById(user.role_id).lean();

const safe = user.toObject();
delete safe.password_hash;
delete safe.refresh_token;

safe.role_name = role?.name || null;
safe.permissions = Array.isArray(role?.permissions) ? role.permissions : [];

return { accessToken, refreshToken, user: safe };
};

exports.googleLogin = async (idToken) => {
  const ticket = await client.verifyIdToken({ idToken, audience: process.env.GOOGLE_CLIENT_ID });
  const payload = ticket.getPayload();
  const email = String(payload.email).trim().toLowerCase();

  let user = await User.findOne({ email });
  if (!user) {
    const role = await Role.findOne({ name: "customer" }); // ✅ lookup role thật
    if (!role) throw new Error("Role 'customer' chưa được seed");

    // tránh trùng username
    const base = email.split("@")[0];
    let username = base, i = 1;
    while (await User.findOne({ username })) username = `${base}${i++}`;

    user = await User.create({
      name: payload.name,
      email,
      username,
      avatar_url: payload.picture,
      role_id: role._id,           // ✅
      status: "active",
    });
  }

  const accessToken  = await generateAccessToken(user);
  const refreshToken = await generateRefreshToken(user);
  user.refresh_token = refreshToken;
  user.last_login = new Date();
  await user.save();

  // (khuyến nghị) trả kèm role info
  const role = await Role.findById(user.role_id).lean();
  const safe = user.toObject(); delete safe.password_hash; delete safe.refresh_token;
  safe.role_name = role?.name || null;
  safe.permissions = Array.isArray(role?.permissions) ? role.permissions : [];

  return { accessToken, refreshToken, user: safe };
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
