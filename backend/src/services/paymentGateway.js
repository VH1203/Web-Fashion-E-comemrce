// backend/src/services/paymentGateway.js
const crypto = require("crypto");
const qs = require("qs");
const fetch = require("node-fetch");

const sortObj = (obj) => {
  const o = {};
  Object.keys(obj).sort().forEach(k => (o[k] = obj[k]));
  return o;
};

/* ============ VNPAY BUILD ============ */
exports.buildVNPayUrl = ({ amount, orderCode, orderInfo, returnUrl, bankCode, ipAddr="127.0.0.1" }) => {
  const base = process.env.VNPAY_PAY_URL;
  const tmn = process.env.VNPAY_TMN_CODE;
  const secret = process.env.VNPAY_HASH_SECRET;

  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth()+1).padStart(2,"0");
  const d = String(now.getDate()).padStart(2,"0");
  const hh = String(now.getHours()).padStart(2,"0");
  const mm = String(now.getMinutes()).padStart(2,"0");
  const ss = String(now.getSeconds()).padStart(2,"0");

  const input = {
    vnp_Version: "2.1.0",
    vnp_Command: "pay",
    vnp_TmnCode: tmn,
    vnp_Amount: amount * 100,     // lưu ý: *100
    vnp_CurrCode: "VND",
    vnp_TxnRef: String(orderCode),
    vnp_OrderInfo: orderInfo,
    vnp_OrderType: "other",
    vnp_Locale: "vn",
    vnp_ReturnUrl: returnUrl || process.env.VNPAY_RETURN_URL,
    vnp_IpAddr: ipAddr,
    vnp_CreateDate: `${y}${m}${d}${hh}${mm}${ss}`,
  };
  if (bankCode) input.vnp_BankCode = bankCode;

  const sorted = sortObj(input);
  const signData = qs.stringify(sorted, { encode: false });
  const secure = crypto.createHmac("sha512", secret).update(Buffer.from(signData,"utf-8")).digest("hex");
  return `${base}?${qs.stringify({ ...sorted, vnp_SecureHash: secure }, { encode:false })}`;
};

/* ============ VNPAY VERIFY ============ */
exports.verifyVNPay = (query) => {
  const secret = process.env.VNPAY_HASH_SECRET;
  const { vnp_SecureHash, vnp_SecureHashType, ...others } = query || {};
  const sorted = sortObj(others);
  const signData = qs.stringify(sorted, { encode:false });
  const check = crypto.createHmac("sha512", secret).update(Buffer.from(signData,"utf-8")).digest("hex");
  const valid = String(check).toLowerCase() === String(vnp_SecureHash || "").toLowerCase();

  return {
    valid,
    code: others.vnp_ResponseCode,             // "00" = success
    orderCode: others.vnp_TxnRef,              // chính là order_code
    transId: others.vnp_TransactionNo || null, // mã giao dịch cổng
    bankCode: others.vnp_BankCode || null
  };
};

/* ============ MOMO CREATE ============ */
exports.createMoMoPayment = async ({ amount, orderCode, orderInfo, returnUrl, notifyUrl, requestType="captureWallet", extraData="" }) => {
  const endpoint  = process.env.MOMO_ENDPOINT_CREATE;
  const partner   = process.env.MOMO_PARTNER_CODE;
  const accessKey = process.env.MOMO_ACCESS_KEY;
  const secretKey = process.env.MOMO_SECRET_KEY;

  const requestId = `${orderCode}-${Date.now()}`;

  // raw signature theo tài liệu MoMo v2
  const raw = [
    `accessKey=${accessKey}`,
    `amount=${amount}`,
    `extraData=${extraData}`,
    `ipnUrl=${notifyUrl || process.env.MOMO_IPN_URL}`,
    `orderId=${orderCode}`,
    `orderInfo=${orderInfo}`,
    `partnerCode=${partner}`,
    `redirectUrl=${returnUrl || process.env.MOMO_RETURN_URL}`,
    `requestId=${requestId}`,
    `requestType=${requestType}`,
  ].join("&");
  const signature = crypto.createHmac("sha256", secretKey).update(raw).digest("hex");

  const body = {
    partnerCode: partner,
    partnerName: "DFS",
    storeId: "DFS-STORE",
    requestId,
    amount,
    orderId: orderCode,
    orderInfo,
    redirectUrl: returnUrl || process.env.MOMO_RETURN_URL,
    ipnUrl: notifyUrl || process.env.MOMO_IPN_URL,
    lang: "vi",
    extraData,
    requestType,
    signature,
  };

  const res = await fetch(endpoint, { method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify(body) });
  return await res.json(); // { payUrl, resultCode, message, ... }
};

/* ============ MOMO VERIFY (IPN) ============ */
// IPN v2 gửi resultCode === 0 là thành công
exports.verifyMoMoIpn = (body) => {
  const secretKey = process.env.MOMO_SECRET_KEY;
  const {
    partnerCode, accessKey, requestId, amount, orderId, orderInfo,
    orderType = "", transId, message, localMessage, responseTime,
    errorCode, payType, extraData = "", signature, resultCode
  } = body || {};

  // raw ký theo docs (lưu ý dùng resultCode)
  const raw = [
    `accessKey=${accessKey}`,
    `amount=${amount}`,
    `extraData=${extraData}`,
    `localMessage=${localMessage}`,
    `message=${message}`,
    `orderId=${orderId}`,
    `orderInfo=${orderInfo}`,
    `orderType=${orderType}`,
    `partnerCode=${partnerCode}`,
    `payType=${payType}`,
    `requestId=${requestId}`,
    `responseTime=${responseTime}`,
    `resultCode=${resultCode}`,
    `transId=${transId}`
  ].join("&");

  const sign = crypto.createHmac("sha256", secretKey).update(raw).digest("hex");
  const valid = String(sign) === String(signature);
  return {
    valid,
    resultCode: Number(resultCode),
    orderCode: orderId,  // chính là order_code
    transId
  };
};
