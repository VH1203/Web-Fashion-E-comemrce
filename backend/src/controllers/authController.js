const authService = require("../services/authService");

const wrap = (fn) => (req, res, next) => fn(req, res, next).catch(next);

exports.registerRequestOTP = wrap(async (req, res) => {
  res.json(await authService.requestRegisterOTP(req.body));
});

exports.registerVerifyOTP = wrap(async (req, res) => {
  res.json(await authService.verifyRegisterOTP(req.body));
});

exports.login = wrap(async (req, res) => {
  res.json(await authService.login(req.body));
});

exports.loginWithGoogle = wrap(async (req, res) => {
  res.json(await authService.loginWithGoogle(req.body));
});

exports.forgotRequestOTP = wrap(async (req, res) => {
  res.json(await authService.requestForgotPasswordOTP(req.body));
});

exports.forgotVerify = wrap(async (req, res) => {
  res.json(await authService.verifyForgotPassword(req.body));
});

exports.refresh = wrap(async (req, res) => {
  res.json(await authService.refreshToken(req.body));
});

exports.logout = wrap(async (req, res) => {
  res.json(await authService.logout(req.body));
});

exports.requestSetPasswordOTP = wrap(async (req, res) => {
  res.json(await authService.requestSetPasswordOTP(req.body));
});

exports.verifySetPassword = wrap(async (req, res) => {
  res.json(await authService.setPasswordForGoogleUser(req.body));
});
