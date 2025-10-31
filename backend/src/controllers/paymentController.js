// backend/src/controllers/paymentController.js
const Payment = require("../models/Payment");
const PaymentWebhook = require("../models/PaymentWebhook");
const Order = require("../models/Order");

// cập nhật order/payment theo orderRef (có thể là _id hoặc order_code)
async function settle(orderRef, status, provider_txn_id) {
  const order = await Order.findOne({ $or: [{ _id: orderRef }, { order_code: orderRef }] });
  if (!order) return null;
  order.payment_status = status === "paid" ? "paid" : status;
  if (status === "paid" && order.status === "pending") order.status = "confirmed";
  await order.save();

  await Payment.updateOne(
    { order_id: order._id },
    { $set: { status, provider_txn_id, webhook_verified: status === "paid" } },
    { upsert: false }
  );
  return order;
}

/* ====== VNPay Return (browser) ====== */
exports.vnpayReturn = async (req, res) => {
  try {
    const v = paymentGw.verifyVNPay(req.query);
    if (!v.valid) {
      return res.redirect(`${process.env.FRONTEND_URL}/payment/return?status=fail&reason=checksum`);
    }
    if (v.code === "00") {
      await settle(v.orderRef, "paid", req.query.vnp_TransactionNo);
      return res.redirect(`${process.env.FRONTEND_URL}/payment/return?status=success&order_id=${encodeURIComponent(v.orderRef)}`);
    }
    await settle(v.orderRef, "failed");
    return res.redirect(`${process.env.FRONTEND_URL}/payment/return?status=fail&order_id=${encodeURIComponent(v.orderRef)}&code=${v.code}`);
  } catch (e) {
    return res.redirect(`${process.env.FRONTEND_URL}/payment/return?status=fail&reason=exception`);
  }
};

/* ====== VNPay IPN (server-to-server, MUST) ======
 * VNPay sẽ gọi nhiều lần → idempotent:
 * - checksum sai => {RspCode:97}
 * - không tìm thấy đơn => {RspCode:01}
 * - amount sai => {RspCode:04}
 * - đã cập nhật rồi => {RspCode:02}
 * - thành công => {RspCode:00}
 */
exports.vnpayIpn = async (req, res) => {
  try {
    const v = paymentGw.verifyVNPay(req.query);
    await PaymentWebhook.create({
      payment_id: v.orderRef || "unknown",
      headers: req.headers,
      raw_body: req.query,
      signature_valid: v.valid
    });

    if (!v.valid) return res.status(200).json({ RspCode: "97", Message: "Checksum failed" });

    const order = await Order.findOne({ $or: [{ _id: v.orderRef }, { order_code: v.orderRef }] });
    if (!order) return res.status(200).json({ RspCode: "01", Message: "Order not found" });

    const expected = Number(order.total_price || order.total || 0);
    if (expected !== v.amount) return res.status(200).json({ RspCode: "04", Message: "Amount invalid" });

    // nếu đã final rồi ⇒ idempotent
    if (order.payment_status === "paid") {
      return res.status(200).json({ RspCode: "02", Message: "Order already updated" });
    }

    if (v.code === "00") {
      await settle(v.orderRef, "paid", req.query.vnp_TransactionNo);
    } else {
      await settle(v.orderRef, "failed");
    }

    return res.status(200).json({ RspCode: "00", Message: "Success" });
  } catch (e) {
    return res.status(200).json({ RspCode: "99", Message: "Unknown error" });
  }
};

/* ====== MoMo Return (giữ logic của anh) ====== */
exports.momoReturn = async (req, res) => {
  try {
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

exports.momoWebhook = async (req, res) => {
  try {
    const ver = paymentGw.verifyMoMo(req.body);
    await PaymentWebhook.create({
      payment_id: req.body?.orderId || "unknown",
      headers: req.headers,
      raw_body: req.body,
      signature_valid: ver.valid
    });

    if (!ver.valid) return res.status(200).json({ resultCode: 97, message: "invalid signature" });

    if (String(ver.resultCode) === "0") { await settle(ver.orderId, "paid", ver.transId); }
    else { await settle(ver.orderId, "failed"); }

    return res.status(200).json({ resultCode: 0, message: "ok" });
  } catch (e) {
    return res.status(500).json({ resultCode: 99, message: e.message });
  }
};
