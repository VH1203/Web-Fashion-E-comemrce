const express = require('express');
const router = express.Router();
const { limitOtpSends } = require('../middlewares/rateLimiter');
const ctrl = require('../controllers/authController');

// Register
router.post('/register/request-otp', limitOtpSends, ctrl.registerRequestOTP);
router.post('/register/verify', ctrl.registerVerifyOTP);
router.post('/refresh', ctrl.refresh);

// Login
router.post('/login', ctrl.login);
router.post('/logout', ctrl.logout);

// Forgot password
router.post('/forgot-password/request', limitOtpSends, ctrl.forgotRequestOTP);
router.post('/forgot-password/verify', ctrl.forgotVerify);

module.exports = router;
