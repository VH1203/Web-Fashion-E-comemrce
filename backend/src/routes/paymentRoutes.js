// backend/src/routes/paymentRoutes.js
const express = require("express");
const router = express.Router();
const paymentCtrl = require("../controllers/paymentController");

// VNPay
router.get("/vnpay/return", paymentCtrl.vnpayReturn);
router.get("/vnpay/ipn", paymentCtrl.vnpayIpn);       

// MoMo
router.get("/momo/return", paymentCtrl.momoReturn);
router.post("/momo/webhook", paymentCtrl.momoWebhook);

module.exports = router;
