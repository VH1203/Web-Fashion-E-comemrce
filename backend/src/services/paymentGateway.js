const crypto = require("crypto");
const qs = require("qs");

const fetch = global.fetch || ((...args) => import('node-fetch').then(({default: f}) => f(...args)));

function sortObject(obj) {
  const sorted = {};
  const keys = Object.keys(obj).map(encodeURIComponent).sort();
  for (const k of keys) {
    const decK = decodeURIComponent(k);
    sorted[k] = encodeURIComponent(obj[decK]).replace(/%20/g, "+");
  }
  return sorted;
}

exports.buildVNPayUrl = ({ amount, orderId, orderInfo, returnUrl, bankCode, ipAddr = "127.0.0.1" }) => {
  const tmnCode   = process.env.VNPAY_TMN_CODE;
  const secretKey = process.env.VNPAY_HASH_SECRET;
  const vnpUrl    = process.env.VNPAY_URL;

  if (!tmnCode || !secretKey || !vnpUrl) {
    throw new Error("VNPAY env missing (VNPAY_TMN_CODE, VNPAY_HASH_SECRET, VNPAY_URL)");
  }

  const now = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  const vnp_CreateDate = [
    now.getFullYear(), pad(now.getMonth() + 1), pad(now.getDate()),
    pad(now.getHours()), pad(now.getMinutes()), pad(now.getSeconds()),
  ].join("");

  const vnpParams = {
    vnp_Version: "2.1.0",
    vnp_Command: "pay",
    vnp_TmnCode: tmnCode,
    vnp_Amount: Math.round(Number(amount) * 100),
    vnp_CurrCode: "VND",
    vnp_TxnRef: String(orderId),
    vnp_OrderInfo: orderInfo || `Thanh toan don hang ${orderId}`,
    vnp_OrderType: "other",
    vnp_Locale: "vn",
    vnp_ReturnUrl: returnUrl,
    vnp_IpAddr: ipAddr,
    vnp_CreateDate,
  };
  if (bankCode) vnpParams.vnp_BankCode = bankCode;

  const sorted = sortObject(vnpParams);
  const signData = qs.stringify(sorted, { encode: false });
  const hmac = crypto.createHmac("sha512", secretKey);
  const signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");
  sorted["vnp_SecureHash"] = signed;

  return `${vnpUrl}?${qs.stringify(sorted, { encode: false })}`;
};

exports.verifyVNPay = (queryObj = {}) => {
  const secretKey = process.env.VNPAY_HASH_SECRET;

  const input = {};
  for (const k in queryObj) {
    if (k.startsWith("vnp_")) input[k] = queryObj[k];
  }

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

  const signData = require("qs").stringify(sorted, { encode: false });
  const hmac = require("crypto").createHmac("sha512", secretKey);
  const signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");

  return {
    valid: String(secureHash).toLowerCase() === signed.toLowerCase(),
    orderRef: input.vnp_TxnRef,
    amount: Number(input.vnp_Amount || 0) / 100,
    code: input.vnp_ResponseCode,
    bankTranNo: input.vnp_BankTranNo,
    transNo: input.vnp_TransactionNo,
  };
};

exports.createMoMoPayment = async ({ amount, orderId, orderInfo, returnUrl, notifyUrl }) => {
  const partnerCode = process.env.MOMO_PARTNER_CODE;
  const accessKey   = process.env.MOMO_ACCESS_KEY;
  const secretKey   = process.env.MOMO_SECRET_KEY;
  const endpoint    = process.env.MOMO_API_URL || "https://test-payment.momo.vn/v2/gateway/api/create";

  if (!partnerCode || !accessKey || !secretKey) {
    throw new Error("MOMO env missing (MOMO_PARTNER_CODE, MOMO_ACCESS_KEY, MOMO_SECRET_KEY)");
  }

  const requestId = `${partnerCode}-${Date.now()}`;
  const orderInfoStr = orderInfo || `Thanh toan don hang ${orderId}`;
  const redirectUrl = returnUrl || process.env.MOMO_RETURN_URL;
  const ipnUrl = notifyUrl || process.env.MOMO_IPN_URL;
  const amountNum = Number(amount);

  // MoMo v2 (captureWallet)
  const requestType = "captureWallet";
  const raw = `accessKey=${accessKey}&amount=${amountNum}&extraData=&ipnUrl=${ipnUrl}&orderId=${orderId}&orderInfo=${orderInfoStr}&partnerCode=${partnerCode}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=${requestType}`;
  const signature = crypto.createHmac("sha256", secretKey).update(raw).digest("hex");

  const body = {
    partnerCode,
    partnerName: "DFS",
    storeId: "DFS-STORE",
    requestId,
    amount: amountNum,
    orderId,
    orderInfo: orderInfoStr,
    redirectUrl,
    ipnUrl,
    lang: "vi",
    extraData: "",
    requestType,
    signature,
  };

  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const json = await res.json();
  // json: { payUrl, resultCode, message, ... }
  if (json.resultCode !== 0 || !json.payUrl) {
    throw new Error(`MoMo error: ${json.message || "unknown"}`);
  }
  return json;
};
