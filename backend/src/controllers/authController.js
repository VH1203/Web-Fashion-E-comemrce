const authService = require("../services/authService");
const { successResponse, errorResponse } = require("../utils/constants");

exports.requestRegisterOTP = async (req, res) => {
  try {
    const { email, phone } = req.body;
    const result = await authService.requestOTP({ email, phone, type: "register" });
    res.json(successResponse(result, "Đã gửi OTP xác thực đăng ký"));
  } catch (err) {
    res.status(400).json(errorResponse(err.message));
  }
};

exports.verifyRegisterOTP = async (req, res) => {
  try {
    const { email, otp, name, username, password } = req.body;
    const result = await authService.verifyRegister({ email, otp, name, username, password });
    res.json(successResponse(result, "Đăng ký thành công"));
  } catch (err) {
    res.status(400).json(errorResponse(err.message));
  }
};

exports.login = async (req, res) => {
  try {
    const { identifier, password } = req.body;
    const result = await authService.login(identifier, password);
    res.json(successResponse(result, "Đăng nhập thành công"));
  } catch (err) {
    res.status(401).json(errorResponse(err.message));
  }
};

exports.googleLogin = async (req, res) => {
  try {
    const { token } = req.body; // Google ID token
    const result = await authService.googleLogin(token);
    res.json(successResponse(result, "Đăng nhập Google thành công"));
  } catch (err) {
    res.status(400).json(errorResponse(err.message));
  }
};

exports.requestResetOTP = async (req, res) => {
  try {
    const { email } = req.body;
    const result = await authService.requestOTP({ email, type: "forgot" });
    res.json(successResponse(result, "Đã gửi OTP đặt lại mật khẩu"));
  } catch (err) {
    res.status(400).json(errorResponse(err.message));
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    const result = await authService.resetPassword(email, otp, newPassword);
    res.json(successResponse(result, "Đặt lại mật khẩu thành công"));
  } catch (err) {
    res.status(400).json(errorResponse(err.message));
  }
};

exports.changePassword = async (req, res) => {
  try {
    const userId = req.user._id;
    const { oldPassword, newPassword } = req.body;
    const result = await authService.changePassword(userId, oldPassword, newPassword);
    res.json(successResponse(result, "Đổi mật khẩu thành công"));
  } catch (err) {
    res.status(400).json(errorResponse(err.message));
  }
};
