// backend/src/controllers/paymentController.js
const { verifyVNPay } = require("../services/paymentGateway");
const Order = require("../models/Order");
const Payment = require("../models/Payment");

// cập nhật nhanh (browser), IPN vẫn là nguồn tin cậy cuối
async function settle(orderCode, isPaid, gatewayTxn) {
  const order = await Order.findOne({ order_code: orderCode });
  if (!order) return;
  await Payment.updateMany(
    { order_id: order._id },
    { $set: { status: isPaid ? "paid" : "failed", gateway_txn_id: gatewayTxn || null } }
  );
  await Order.updateOne(
    { _id: order._id },
    { $set: { payment_status: isPaid ? "paid" : "failed", status: isPaid ? "confirmed" : "pending" } }
  );
}

// VNPay browser return
exports.vnpayReturn = async (req, res) => {
  try {
    const v = verifyVNPay(req.query);
    if (!v.valid) {
      return res.redirect(`${process.env.FRONTEND_URL}/payment/return?status=fail&reason=checksum`);
    }
    if (v.code === "00") {
      await settle(v.orderCode, true, v.transId);
      return res.redirect(`${process.env.FRONTEND_URL}/payment/return?status=success&provider=vnpay&order_code=${v.orderCode}`);
    }
    await settle(v.orderCode, false, v.transId);
    return res.redirect(`${process.env.FRONTEND_URL}/payment/return?status=fail&provider=vnpay&order_code=${v.orderCode}&code=${v.code}`);
  } catch {
    return res.redirect(`${process.env.FRONTEND_URL}/payment/return?status=fail&reason=exception`);
  }
};

// MoMo browser return (MoMo đã ký ở IPN; return chủ yếu để UX)
exports.momoReturn = async (req, res) => {
  try {
    const resultCode = String(req.query.resultCode || "");
    const orderCode = req.query.orderId;
    const transId = req.query.transId;
    if (resultCode === "0") {
      await settle(orderCode, true, transId);
      return res.redirect(`${process.env.FRONTEND_URL}/payment/return?status=success&provider=momo&order_code=${orderCode}`);
    }
    await settle(orderCode, false, transId);
    return res.redirect(`${process.env.FRONTEND_URL}/payment/return?status=fail&provider=momo&order_code=${orderCode}&code=${resultCode}`);
  } catch {
    return res.redirect(`${process.env.FRONTEND_URL}/payment/return?status=fail&reason=exception`);
  }
};
