const Order = require("../models/Order");
const PaymentWebhook = require("../models/PaymentWebhook"); // tái dụng để log webhook

const MAP = {
  ghn: {
    picking: "processing",
    storing: "processing",
    delivering: "shipping",
    delivered: "delivered",
    return: "canceled",
    cancel: "canceled",
  },
  ghtk: {
    picking: "processing",
    delivering: "shipping",
    delivered: "delivered",
    returned: "canceled",
    cancel: "canceled",
  },
};

function headerToken(req) {
  return (
    req.headers["x-webhook-token"] ||
    req.headers["x-ghtk-token"] ||
    req.headers["x-ghn-token"] ||
    req.headers["authorization"]?.replace(/^Bearer\s+/i, "")
  );
}

async function updateOrderByCode(orderCode, provider, rawStatus, rawBody) {
  const ord = await Order.findOne({ order_code: orderCode });
  if (!ord) return { ok: false, reason: "not_found" };

  const map = MAP[provider] || {};
  const next = map[rawStatus] || null;

  try {
    await PaymentWebhook.create({
      payment_id: orderCode,
      provider,
      raw_body: rawBody,
      signature_valid: true,
    });
  } catch {}

  if (!next) return { ok: true, noChange: true };

  const finalStates = ["delivered", "canceled", "refund_completed"];
  if (finalStates.includes(ord.status)) return { ok: true, alreadyFinal: true };

  ord.status = next;
  await ord.save();
  return { ok: true, status: next };
}

exports.ghn = async (req, res) => {
  try {
    const token = headerToken(req);
    if (token !== process.env.GHN_WEBHOOK_TOKEN) {
      return res.status(401).json({ message: "unauthorized" });
    }
    const { OrderCode, CurrentStatus } = req.body || {};
    if (!OrderCode) return res.status(400).json({ message: "bad_request" });

    const r = await updateOrderByCode(
      OrderCode,
      "ghn",
      String(CurrentStatus || "").toLowerCase(),
      req.body
    );
    return res.json({ ok: true, result: r });
  } catch (e) {
    return res.status(500).json({ ok: false, message: e.message });
  }
};

exports.ghtk = async (req, res) => {
  try {
    const token = headerToken(req);
    if (token !== process.env.GHTK_WEBHOOK_TOKEN) {
      return res.status(401).json({ message: "unauthorized" });
    }
    const { label_id, status } = req.body || {};
    if (!label_id) return res.status(400).json({ message: "bad_request" });

    const r = await updateOrderByCode(
      label_id,
      "ghtk",
      String(status || "").toLowerCase(),
      req.body
    );
    return res.json({ ok: true, result: r });
  } catch (e) {
    return res.status(500).json({ ok: false, message: e.message });
  }
};
