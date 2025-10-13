const Redis = require("ioredis");

let redisClient;

function initRedis() {
  if (redisClient) return redisClient;

  redisClient = new Redis({
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT,
    password: process.env.REDIS_PASSWORD,
    tls: {
      rejectUnauthorized: false,
    },
    retryStrategy(times) {
      return Math.min(times * 100, 3000);
    },
  });

  redisClient.on("connect", () => console.log("✅ Connected to Redis Cloud via TLS"));
  redisClient.on("error", (err) => console.error("❌ Redis error:", err.message));

  return redisClient;
}

module.exports = { initRedis, redisClient };
