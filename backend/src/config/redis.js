const Redis = require("ioredis");

let redis;

function initRedis() {
  if (redis) return redis;

  const url = process.env.REDIS_URL;
  if (!url) {
    console.error("❌ Không tìm thấy REDIS_URL trong .env");
    process.exit(1); // dừng app luôn để tránh lỗi undefined
  }

  const isTLS = url.startsWith("rediss://");

  redis = new Redis(url, {
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
  redis.on("reconnecting", () => console.warn("♻️ Redis reconnecting..."));

  return redis;
}

const redisInstance = initRedis();
module.exports = redisInstance;
