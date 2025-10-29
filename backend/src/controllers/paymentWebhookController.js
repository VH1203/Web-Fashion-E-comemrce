// backend/src/controllers/paymentWebhookController.js
const { verifyVNPay, verifyMoMoIpn } = require("../services/paymentGateway");
const Order = require("../models/Order");
const Payment = require("../models/Payment");
const PaymentWebhook = require("../models/PaymentWebhook");

async function settleByOrderCode(orderCode, isPaid, gatewayTxn) {
  const order = await Order.findOne({ order_code: orderCode });
  if (!order) return;
  await Payment.updateMany(
    { order_id: order._id },
    { $set: { status: isPaid ? "paid" : "failed", gateway_txn_id: gatewayTxn || null, webhook_verified: true } }
  );
  await Order.updateOne(
    { _id: order._id },
    { $set: { payment_status: isPaid ? "paid" : "failed", status: isPaid ? "confirmed" : "pending" } }
  );
}

/** VNPay IPN (GET) */
exports.vnpayIpn = async (req, res) => {
  try {
    const v = verifyVNPay(req.query);
    await PaymentWebhook.create({
      payment_id: v.orderCode,
      provider: "VNPAY",
      signature_valid: v.valid,
      raw_query: req.query,
      headers: req.headers
    });

    if (!v.valid) return res.status(200).json({ RspCode: "97", Message: "Invalid signature" });

    const success = v.code === "00";
    await settleByOrderCode(v.orderCode, success, v.transId);
    return res.status(200).json({ RspCode: "00", Message: "OK" });
  } catch (e) {
    return res.status(200).json({ RspCode: "99", Message: "Unknown error" });
  }
};

/** MoMo IPN (POST JSON) */
exports.momoIpn = async (req, res) => {
  try {
    const ver = verifyMoMoIpn(req.body);
    await PaymentWebhook.create({
      payment_id: ver.orderCode,
      provider: "MOMO",
      signature_valid: ver.valid,
      raw_body: req.body,
      headers: req.headers
    });

    if (!ver.valid) return res.status(200).json({ resultCode: 97, message: "invalid signature" });

    const success = Number(ver.resultCode) === 0;
    await settleByOrderCode(ver.orderCode, success, ver.transId);
    return res.status(200).json({ resultCode: 0, message: "ok" });
  } catch (e) {
    return res.status(200).json({ resultCode: 99, message: "error" });
  }
};
