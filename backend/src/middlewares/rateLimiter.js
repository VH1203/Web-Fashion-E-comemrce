const redis = require("../config/redis");

/**
 * Giới hạn gửi OTP: tối đa 3 lần / 10 phút mỗi email/SĐT
 * Dùng cho các route như /register/request-otp hoặc /forgot-password/request-otp
 */
async function limitOtpSends(req, res, next) {
  try {
    const identifier = (
      req.body.identifier ||
      req.body.email ||
      req.body.phone ||
      ""
    ).toLowerCase();

    if (!identifier)
      return res.status(400).json({ message: "Thiếu email hoặc số điện thoại" });

    const key = `otp:sends:${identifier}`;
    const ttl = 600; // 10 phút
    const maxSends = 100;

    // Lấy số lần gửi hiện tại
    let count = await redis.get(key);
    count = count ? parseInt(count) : 0;

    if (count >= maxSends) {
      return res.status(429).json({
        message: `Bạn đã vượt quá ${maxSends} lần gửi OTP trong 10 phút. Vui lòng thử lại sau.`,
      });
    }

    // Tăng bộ đếm + set TTL nếu chưa có
    const pipeline = redis.multi();
    pipeline.incr(key);
    if (count === 0) pipeline.expire(key, ttl);
    await pipeline.exec();

    next();
  } catch (error) {
    console.error("❌ OTP limiter error:", error);
    res.status(500).json({ message: "Lỗi hệ thống khi giới hạn OTP" });
  }
}

module.exports = { limitOtpSends };
