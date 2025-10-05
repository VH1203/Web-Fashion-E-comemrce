const crypto = require("crypto");

const seen = new Map(); // key -> { hash, until, response }
const TTL_MS = 24 * 60 * 60 * 1000;

function hashPayload(obj) {
  return crypto.createHash("sha256").update(JSON.stringify(obj || {})).digest("hex");
}

module.exports = function idempotency() {
  return async (req, res, next) => {
    const key = req.header("Idempotency-Key");
    if (!key) return next();
    const sign = `${req.user?.id || "anon"}:${req.method}:${req.originalUrl}`;
    const payloadHash = hashPayload(req.body);
    const k = `${sign}:${key}`;

    const hit = seen.get(k);
    if (hit && hit.hash === payloadHash && Date.now() < hit.until) {
      return res.status(200).json(hit.response);
    }

    const json = res.json.bind(res);
    res.json = (data) => {
      seen.set(k, { hash: payloadHash, until: Date.now() + TTL_MS, response: data });
      return json(data);
    };
    next();
  };
};
