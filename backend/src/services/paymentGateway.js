// paymentGateway.js 
const crypto = require("crypto");
const axios = require("axios");
const qs = require("qs");

// ===== VNPay =====
exports.buildVNPayUrl = ({ amount, orderId, orderInfo, returnUrl, bankCode }) => {
  const tmnCode = process.env.VNPAY_TMN_CODE;
  const secretKey = process.env.VNPAY_HASH_SECRET;
  const vnpUrl = process.env.VNPAY_URL; // sandbox url đã có trong .env
  const vnpParams = {
    vnp_Version: "2.1.0",
    vnp_Command: "pay",
    vnp_TmnCode: tmnCode,
    vnp_Amount: amount * 100,
    vnp_CurrCode: "VND",
    vnp_TxnRef: orderId,
    vnp_OrderInfo: orderInfo || `Thanh toan don hang ${orderId}`,
    vnp_OrderType: "other",
    vnp_Locale: "vn",
    vnp_ReturnUrl: returnUrl,
    vnp_IpAddr: "0.0.0.0",
    vnp_CreateDate: new Date().toISOString().replace(/[-:TZ.]/g, "").slice(0,14),
  };
  if (bankCode) vnpParams.vnp_BankCode = bankCode;

  const signData = qs.stringify(vnpParams, { encode: false });
  const hmac = crypto.createHmac("sha512", secretKey);
  vnpParams.vnp_SecureHash = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");

  const url = `${vnpUrl}?${qs.stringify(vnpParams, { encode: true })}`;
  return url;
};

exports.verifyVNPay = (queryObj) => {
  const secretKey = process.env.VNPAY_HASH_SECRET;
  const input = { ...queryObj };
  const secureHash = input.vnp_SecureHash || input.vnp_SecureHashType;
  delete input.vnp_SecureHash; delete input.vnp_SecureHashType;
  const signData = qs.stringify(input, { encode: false });
  const signed = crypto.createHmac("sha512", secretKey).update(Buffer.from(signData, "utf-8")).digest("hex");
  return { valid: secureHash?.toLowerCase() === signed.toLowerCase(), orderId: input.vnp_TxnRef, amount: Number(input.vnp_Amount || 0) / 100, code: input.vnp_ResponseCode };
};

// ===== MoMo =====
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

exports.verifyMoMo = (rawBody) => {
  const { signature, ...rest } = rawBody || {};
  const partnerCode = process.env.MOMO_PARTNER_CODE;
  const accessKey  = process.env.MOMO_ACCESS_KEY;
  const secretKey  = process.env.MOMO_SECRET_KEY;

  const raw = `accessKey=${accessKey}&amount=${rest.amount}&extraData=${rest.extraData}&message=${rest.message}&orderId=${rest.orderId}&orderInfo=${rest.orderInfo}&orderType=${rest.orderType}&partnerCode=${partnerCode}&payType=${rest.payType}&requestId=${rest.requestId}&responseTime=${rest.responseTime}&resultCode=${rest.resultCode}&transId=${rest.transId}`;
  const sign = crypto.createHmac("sha256", secretKey).update(raw).digest("hex");
  const valid = sign === signature;
  return { valid, orderId: rest.orderId, amount: Number(rest.amount || 0), resultCode: rest.resultCode, transId: rest.transId };
};
