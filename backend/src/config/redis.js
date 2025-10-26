
const Redis = require("ioredis");

const url = process.env.REDIS_URL || "redis://127.0.0.1:6379";
const isTLS = url.startsWith("rediss://");

const redis = new Redis(url, {
  tls: isTLS ? { rejectUnauthorized: false } : undefined,
  connectTimeout: 10000,
  retryStrategy(times) {
    return Math.min(times * 2000, 10000);
  },
});

redis.on("connect", () =>
  console.log(`✅ Redis connected (${isTLS ? "TLS" : "No TLS"})`)
);
redis.on("ready", () => console.log("⚡ Redis ready for commands"));
redis.on("error", (err) =>
  console.error("❌ Redis error:", err.message)
);
redis.on("reconnecting", () =>
  console.warn("♻️ Redis reconnecting...")
);

module.exports = redis;
