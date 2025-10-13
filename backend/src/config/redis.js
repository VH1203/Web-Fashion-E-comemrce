const Redis = require("ioredis");

let redisClient;

function initRedis() {
  if (redisClient) return redisClient;

  redisClient = new Redis(process.env.REDIS_URL, {
    connectTimeout: 10000,
    retryStrategy(times) {
      return Math.min(times * 2000, 10000);
    },
  });

  redisClient.on("connect", () => console.log("✅ Connected to Upstash Redis (port 443)"));
  redisClient.on("error", (err) => console.error("❌ Redis error:", err.message));

  return redisClient;
}

module.exports = { initRedis, redisClient };
