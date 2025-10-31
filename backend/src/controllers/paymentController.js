// controllers/paymentController.js
const Payment = require("../models/Payment");
const PaymentWebhook = require("../models/PaymentWebhook"); 
const Order = require("../models/Order");
const paymentGw = require("../services/paymentGateway");

async function settle(orderRef, status, provider_txn_id, extraMeta = {}) {
  const order = await Order.findOne({ $or: [{ _id: orderRef }, { order_code: orderRef }] });
  if (!order) return null;

  order.payment_status = status === "paid" ? "paid" : status; 
  if (status === "paid" && order.status === "pending") order.status = "confirmed";
  await order.save();

  await Payment.updateOne(
    { order_id: order._id },
    {
      $set: {
        status,
        provider_txn_id: provider_txn_id || undefined,
        webhook_verified: status === "paid",
        meta: extraMeta ? extraMeta : undefined,
        paid_at: status === "paid" ? new Date() : undefined,
      },
    },
    { upsert: false }
  );

  return order;
}

exports.vnpayReturn = async (req, res) => {
  try {
    const v = paymentGw.verifyVNPay(req.query || {});
    const nextUrl = req.query.next || `${process.env.FRONTEND_URL}/payment/return?vnpay=1`;

    if (!v.valid) {
      return res.redirect(`${nextUrl}&status=fail&reason=checksum`);
    }

    const ord = await Order.findOne({ $or: [{ _id: v.orderRef }, { order_code: v.orderRef }] });
    if (!ord) {
      return res.redirect(`${nextUrl}&status=notfound`);
    }

    const expected = Math.round(Number(ord.total_price || ord.total || 0));
    const paid = Math.round(Number(v.amount || 0)); 

    console.log("VNPAY_RETURN_COMPARE:", { order_code: ord.order_code, expected, paid, code: v.code });

    if (v.code === "00" && expected === paid) {
      await settle(v.orderRef, "paid", v.transNo || v.bankTranNo, { vnp_return: req.query });
      return res.redirect(`${nextUrl}&status=success&order=${ord.order_code}`);
    }

    await settle(v.orderRef, expected === paid ? "failed" : "review", v.transNo || v.bankTranNo, { vnp_return: req.query });
    return res.redirect(`${nextUrl}&status=fail&order=${ord.order_code}`);
  } catch (e) {
    const nextUrl = req.query.next || `${process.env.FRONTEND_URL}/payment/return?vnpay=1`;
    return res.redirect(`${nextUrl}&status=fail&reason=exception`);
  }
};

exports.vnpayIpn = async (req, res) => {
  try {
    const v = paymentGw.verifyVNPay(req.query || {});

    try {
      await PaymentWebhook.create({
        payment_id: v.orderRef || "unknown",
        headers: req.headers,
        raw_body: req.query,
        signature_valid: !!v.valid,
      });
    } catch {}

    if (!v.valid) return res.status(200).json({ RspCode: "97", Message: "Invalid signature" });

    const ord = await Order.findOne({ $or: [{ _id: v.orderRef }, { order_code: v.orderRef }] });
    if (!ord) return res.status(200).json({ RspCode: "01", Message: "Order not found" });

    const expected = Math.round(Number(ord.total_price || ord.total || 0));
    const amountOk = expected === Math.round(Number(v.amount || 0));

    // nếu đã paid rồi thì trả 02
    if (ord.payment_status === "paid") {
      return res.status(200).json({ RspCode: "02", Message: "Order already updated" });
    }

    if (v.code === "00" && amountOk) {
      await settle(v.orderRef, "paid", v.transNo || v.bankTranNo, { vnp_ipn: req.query });
      return res.status(200).json({ RspCode: "00", Message: "Success" });
    }

    // code khác 00 hoặc lệch số tiền
    await settle(v.orderRef, amountOk ? "failed" : "review", v.transNo || v.bankTranNo, { vnp_ipn: req.query });
    return res.status(200).json({ RspCode: "00", Message: "Processed" });
  } catch {
    return res.status(200).json({ RspCode: "99", Message: "Unknown error" });
  }
};

/** ===== MoMo Return ===== */
exports.momoReturn = async (req, res) => {
  try {
    const { resultCode, orderId, transId } = req.query;
    // 0 = success
    if (String(resultCode) === "0") {
      await settle(orderId, "paid", transId, { momo_return: req.query });
      return res.redirect(`${process.env.FRONTEND_URL}/payment/return?status=success&order=${encodeURIComponent(orderId)}`);
    }
    await settle(orderId, "failed", transId, { momo_return: req.query });
    return res.redirect(`${process.env.FRONTEND_URL}/payment/return?status=fail&order=${encodeURIComponent(orderId)}`);
  } catch {
    return res.redirect(`${process.env.FRONTEND_URL}/payment/return?status=fail&reason=exception`);
  }
};

/** ===== MoMo Webhook (IPN) ===== */
exports.momoWebhook = async (req, res) => {
  try {
    const ver = paymentGw.verifyMoMo(req.body || {});
    try {
      await PaymentWebhook.create({
        payment_id: req.body?.orderId || "unknown",
        headers: req.headers,
        raw_body: req.body,
        signature_valid: !!ver.valid,
      });
    } catch {}

    if (!ver.valid) return res.status(200).json({ resultCode: 97, message: "invalid signature" });

    if (String(ver.resultCode) === "0") {
      await settle(ver.orderId, "paid", ver.transId, { momo_ipn: req.body });
    } else {
      await settle(ver.orderId, "failed", ver.transId, { momo_ipn: req.body });
    }
    return res.status(200).json({ resultCode: 0, message: "ok" });
  } catch (e) {
    return res.status(500).json({ resultCode: 99, message: e.message });
  }
};
