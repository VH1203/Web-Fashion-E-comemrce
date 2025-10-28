const Payment = require("../models/Payment");
const PaymentWebhook = require("../models/PaymentWebhook");
const Order = require("../models/Order");
const paymentGw = require("../services/paymentGateway");

// Helper cập nhật order/payment
async function settle(orderId, status, provider_txn_id) {
  const order = await Order.findById(orderId);
  if (!order) return null;
  order.payment_status = status === "paid" ? "paid" : status;
  if (status === "paid") order.status = "confirmed";
  await order.save();
  await Payment.updateOne({ order_id: orderId }, { $set: { status, provider_txn_id, webhook_verified: status === "paid" } });
  return order;
}

// ===== VNPay Return (browser) =====
exports.vnpayReturn = async (req, res) => {
  try {
    const v = paymentGw.verifyVNPay(req.query);
    if (!v.valid) return res.redirect(`${process.env.FRONTEND_URL}/payment/return?status=fail&reason=checksum`);
    if (v.code === "00") {
      await settle(v.orderId, "paid", req.query.vnp_TransactionNo);
      return res.redirect(`${process.env.FRONTEND_URL}/payment/return?status=success&order_id=${v.orderId}`);
    }
    await settle(v.orderId, "failed");
    return res.redirect(`${process.env.FRONTEND_URL}/payment/return?status=fail&order_id=${v.orderId}&code=${v.code}`);
  } catch (e) {
    return res.redirect(`${process.env.FRONTEND_URL}/payment/return?status=fail&reason=exception`);
  }
};

// ===== VNPay Webhook (optional)
exports.vnpayWebhook = async (req, res) => {
  // nhiều tích hợp không có webhook; trả 200 luôn để tránh retry
  res.status(200).json({ RspCode: "00", Message: "Ok" });
};

// ===== MoMo Return (browser)
exports.momoReturn = async (req, res) => {
  try {
    // MoMo return qua query; verify ở webhook chắc hơn
    const { resultCode, orderId, transId } = req.query;
    if (String(resultCode) === "0") {
      await settle(orderId, "paid", transId);
      return res.redirect(`${process.env.FRONTEND_URL}/payment/return?status=success&order_id=${orderId}`);
    }
    await settle(orderId, "failed");
    return res.redirect(`${process.env.FRONTEND_URL}/payment/return?status=fail&order_id=${orderId}&code=${resultCode}`);
  } catch {
    return res.redirect(`${process.env.FRONTEND_URL}/payment/return?status=fail&reason=exception`);
  }
};

// ===== MoMo Webhook (server-to-server)
exports.momoWebhook = async (req, res) => {
  try {
    const ver = paymentGw.verifyMoMo(req.body);
    await PaymentWebhook.create({
      payment_id: req.body?.orderId || "unknown",
      headers: req.headers, raw_body: req.body,
      signature_valid: ver.valid, error: ver.valid ? undefined : "signature"
    });

    if (!ver.valid) return res.status(200).json({ resultCode: 97, message: "invalid signature" });

    if (String(ver.resultCode) === "0") { await settle(ver.orderId, "paid", ver.transId); }
    else { await settle(ver.orderId, "failed"); }

    return res.status(200).json({ resultCode: 0, message: "ok" });
  } catch (e) {
    return res.status(500).json({ resultCode: 99, message: e.message });
  }
};
