// routes/paymentRoutes.js
const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/paymentController");

// VNPay
router.get("/vnpay/return", ctrl.vnpayReturn);
router.get("/vnpay/ipn", ctrl.vnpayIpn);

// MoMo
router.get("/momo/return", ctrl.momoReturn);
router.post("/momo/webhook", express.json({ type: "*/*" }), ctrl.momoWebhook);

module.exports = router;
