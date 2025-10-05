const { redis } = require('../config/redis');


async function limitOtpSends(req, res, next) {
    try {
        const keyBase = (req.body.identifier || req.body.email || req.body.phone || '').toLowerCase();
        if (!keyBase) return res.status(400).json({ message: 'Missing identifier' });
        const key = `otp:sends:${keyBase}`;
        const count = Number(await redis.get(key)) || 0;
        if (count >= 100) {
            return res.status(429).json({ message: 'OTP limit reached. Try again later (max 100/10 minutes).' });
        }
        await redis.multi().incr(key).expire(key, 600).exec();
        next();
    } catch (e) { next(e); }
}


module.exports = { limitOtpSends };