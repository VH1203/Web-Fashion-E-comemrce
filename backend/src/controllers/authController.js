const authService = require('../services/authService');

// 1.1 Đăng ký
async function registerRequestOTP(req, res, next) {
  try {
    const result = await authService.requestRegisterOTP(req.body);
    res.json(result);
  } catch (e) {
    next(e);
  }
}

async function registerVerifyOTP(req, res, next) {
  try {
    const result = await authService.verifyRegisterOTP(req.body);
    res.json(result);
  } catch (e) {
    next(e);
  }
}

// 1.2 Đăng nhập
async function login(req, res, next) {
  try {
    const result = await authService.login(req.body);
    res.json(result);
  } catch (e) {
    next(e);
  }
}

// 1.3 Quên mật khẩu
async function forgotRequestOTP(req, res, next) {
  try {
    const result = await authService.requestForgotPasswordOTP(req.body);
    res.json(result);
  } catch (e) {
    next(e);
  }
}

async function forgotVerify(req, res, next) {
  try {
    const result = await authService.verifyForgotPassword(req.body);
    res.json(result);
  } catch (e) {
    next(e);
  }
}

async function refresh(req, res, next) {
  try {
    const result = await authService.refreshToken(req.body);
    res.json(result);
  } catch (e) {
    next(e);
  }
}

async function logout(req, res, next) { 
  try {
    const { token } = req.body;
    const result = await authService.logout({ token });
    res.json(result);
  } catch (e) {
    next(e);
  }
}

module.exports = {
  registerRequestOTP,
  registerVerifyOTP,
  login,
  forgotRequestOTP,
  forgotVerify,
  refresh,
  logout
};
