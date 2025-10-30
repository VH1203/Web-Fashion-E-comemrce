// backend/src/services/paymentGateway.js
const crypto = require("crypto");
const axios = require("axios");
const qs = require("qs");

/* ===== helpers ===== */
function sortObject(obj) {
  const sorted = {};
  const keys = Object.keys(obj).map(encodeURIComponent).sort();
  for (const k of keys) {
    const decK = decodeURIComponent(k);
    sorted[k] = encodeURIComponent(obj[decK]).replace(/%20/g, "+");
  }
  return sorted;
}

/* ===== VNPay ===== */
exports.buildVNPayUrl = ({ amount, orderId, orderInfo, returnUrl, bankCode, ipAddr = "127.0.0.1" }) => {
  const tmnCode = process.env.VNPAY_TMN_CODE;
  const secretKey = process.env.VNPAY_HASH_SECRET;
  const vnpUrl = process.env.VNPAY_URL; // sandbox: https://sandbox.vnpayment.vn/paymentv2/vpcpay.html

  if (!tmnCode || !secretKey || !vnpUrl) {
    throw new Error("VNPAY env missing (VNPAY_TMN_CODE, VNPAY_HASH_SECRET, VNPAY_URL)");
  }

  // yyyyMMddHHmmss theo GMT+7 là tốt nhất; tạm dùng giờ hệ thống
  const now = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  const vnp_CreateDate = [
    now.getFullYear(),
    pad(now.getMonth() + 1),
    pad(now.getDate()),
    pad(now.getHours()),
    pad(now.getMinutes()),
    pad(now.getSeconds()),
  ].join("");

  const vnpParams = {
    vnp_Version: "2.1.0",
    vnp_Command: "pay",
    vnp_TmnCode: tmnCode,
    vnp_Amount: Math.round(Number(amount) * 100), // VND * 100
    vnp_CurrCode: "VND",
    vnp_TxnRef: String(orderId),                  // NÊN dùng order_code
    vnp_OrderInfo: orderInfo || `Thanh toan don hang ${orderId}`,
    vnp_OrderType: "other",
    vnp_Locale: "vn",
    vnp_ReturnUrl: returnUrl,
    vnp_IpAddr: ipAddr,
    vnp_CreateDate,
  };
  if (bankCode) vnpParams.vnp_BankCode = bankCode;

  // sort + sign đúng chuẩn
  const sorted = sortObject(vnpParams);
  const signData = qs.stringify(sorted, { encode: false });
  const hmac = crypto.createHmac("sha512", secretKey);
  const signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");
  sorted["vnp_SecureHash"] = signed;

  return `${vnpUrl}?${qs.stringify(sorted, { encode: false })}`;
};

exports.verifyVNPay = (queryObj = {}) => {
  const secretKey = process.env.VNPAY_HASH_SECRET;
  const input = { ...queryObj };
  const secureHash = input.vnp_SecureHash || input.vnp_secureHash || "";
  delete input.vnp_SecureHash;
  delete input.vnp_SecureHashType;

  const sorted = (function sortObject(obj) {
    const sorted = {};
    const keys = Object.keys(obj).map(encodeURIComponent).sort();
    for (const k of keys) {
      const decK = decodeURIComponent(k);
      sorted[k] = encodeURIComponent(obj[decK]).replace(/%20/g, "+");
    }
    return sorted;
  })(input);

  const signData = qs.stringify(sorted, { encode: false });
  const hmac = require("crypto").createHmac("sha512", secretKey);
  const signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");

  return {
    valid: secureHash?.toLowerCase() === signed.toLowerCase(),
    orderRef: input.vnp_TxnRef,                  // có thể là order_code
    amount: Number(input.vnp_Amount || 0) / 100, // VND
    code: input.vnp_ResponseCode,
    bankTranNo: input.vnp_BankTranNo,
    transNo: input.vnp_TransactionNo,
  };
};

/* ===== MoMo (giữ nguyên của anh) ===== */
exports.createMoMoPayment = async ({ amount, orderId, orderInfo, returnUrl, notifyUrl }) => {
  const partnerCode = process.env.MOMO_PARTNER_CODE;
  const accessKey  = process.env.MOMO_ACCESS_KEY;
  const secretKey  = process.env.MOMO_SECRET_KEY;
  const requestId  = `${partnerCode}-${Date.now()}`;
  const orderInfoStr = orderInfo || `Thanh toan don hang ${orderId}`;

  const body = {
    partnerCode, accessKey,
    requestId, amount: String(amount),
    orderId, orderInfo: orderInfoStr,
    returnUrl, notifyUrl,
    requestType: "captureWallet",
    extraData: "",
    lang: "vi"
  };

  const raw = `accessKey=${accessKey}&amount=${body.amount}&extraData=${body.extraData}&ipnUrl=${notifyUrl}&orderId=${orderId}&orderInfo=${orderInfoStr}&partnerCode=${partnerCode}&redirectUrl=${returnUrl}&requestId=${requestId}&requestType=${body.requestType}`;
  body.signature = crypto.createHmac("sha256", secretKey).update(raw).digest("hex");

  const { data } = await axios.post(process.env.MOMO_API_URL, body, { headers: { "Content-Type": "application/json" } });
  if (data?.payUrl) return { payUrl: data.payUrl, raw: data };
  throw new Error(`MoMo error: ${data?.message || "unknown"}`);
};

exports.verifyMoMo = (rawBody = {}) => {
  const { signature, ...rest } = rawBody;
  const partnerCode = process.env.MOMO_PARTNER_CODE;
  const accessKey  = process.env.MOMO_ACCESS_KEY;
  const secretKey  = process.env.MOMO_SECRET_KEY;

  const raw = `accessKey=${accessKey}&amount=${rest.amount}&extraData=${rest.extraData}&message=${rest.message}&orderId=${rest.orderId}&orderInfo=${rest.orderInfo}&orderType=${rest.orderType}&partnerCode=${partnerCode}&payType=${rest.payType}&requestId=${rest.requestId}&responseTime=${rest.responseTime}&resultCode=${rest.resultCode}&transId=${rest.transId}`;
  const sign = crypto.createHmac("sha256", secretKey).update(raw).digest("hex");
  const valid = sign === signature;
  return { valid, orderId: rest.orderId, amount: Number(rest.amount || 0), resultCode: rest.resultCode, transId: rest.transId };
};
