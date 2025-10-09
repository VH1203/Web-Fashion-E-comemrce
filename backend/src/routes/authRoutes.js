const express = require("express");
const router = express.Router();
const authCtrl = require("../controllers/authController");
const { limitOtpSends } = require("../middlewares/rateLimiter");

router.post("/register/request-otp", limitOtpSends, authCtrl.registerRequestOTP);
router.post("/register/verify", authCtrl.registerVerifyOTP);

router.post("/login", authCtrl.login);
router.post("/login/google", authCtrl.loginWithGoogle);

router.post("/forgot-password/request", limitOtpSends, authCtrl.forgotRequestOTP);
router.post("/forgot-password/verify", authCtrl.forgotVerify);

router.post("/set-password/request", limitOtpSends, authCtrl.requestSetPasswordOTP);
router.post("/set-password/verify", authCtrl.verifySetPassword);

router.post("/refresh", authCtrl.refresh);
router.post("/logout", authCtrl.logout);

module.exports = router;
