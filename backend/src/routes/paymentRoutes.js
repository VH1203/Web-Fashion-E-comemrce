// backend/src/routes/paymentRoutes.js
const express = require("express");
const router = express.Router();
const paymentCtrl = require("../controllers/paymentController");
const paymentWebhook = require("../controllers/paymentWebhookController");

// VNPay
router.get("/vnpay/return", paymentCtrl.vnpayReturn);
router.get("/vnpay/ipn", paymentCtrl.vnpayIpn);       

// MoMo
router.get("/momo/return", paymentCtrl.momoReturn);

router.get("/vnpay/ipn", paymentWebhook.vnpayIpn); 
router.post("/momo/ipn", paymentWebhook.momoIpn);   
module.exports = router;
