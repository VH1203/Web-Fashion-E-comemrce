const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const { limitOtpSends } = require("../middlewares/rateLimiter");
const { verifyToken } = require("../middlewares/authMiddleware");


router.post("/register/request-otp", limitOtpSends, authController.requestRegisterOTP);
router.post("/register/verify", authController.verifyRegisterOTP);
router.post("/login", authController.login);
router.post("/google-login", authController.googleLogin);
router.post("/forgot-password/request-otp", limitOtpSends, authController.requestResetOTP);
router.post("/forgot-password/verify", authController.resetPassword);
router.post("/change-password", verifyToken, authController.changePassword);

module.exports = router;
