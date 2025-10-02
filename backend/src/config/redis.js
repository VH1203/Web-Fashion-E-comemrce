const { createClient } = require('redis');
const client = createClient({
socket: { host: process.env.REDIS_HOST || '127.0.0.1', port: Number(process.env.REDIS_PORT || 6379) }
});
client.on('error', (err) => console.error('Redis error', err));
async function initRedis() { if (!client.isOpen) await client.connect(); }
module.exports = { redis: client, initRedis };