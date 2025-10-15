const mongoose = require("mongoose");

const uri = process.env.MONGO_URI;
const dbName = process.env.MONGO_DB_NAME || "WDP_dev";

/**
 * Kết nối MongoDB
 */
async function connectDB() {
  if (!uri) {
    console.error("❌ Missing MONGO_URI in .env");
    process.exit(1);
  }

  try {
    // Nếu đã có kết nối sẵn thì không cần kết nối lại
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(uri, {
        dbName,
        retryWrites: true,
        w: "majority",
        family: 4,
      });
      console.log(`✅ MongoDB connected: ${mongoose.connection.host}/${dbName}`);
    }
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
    if (String(err.message).includes("Authentication failed"))
      console.log("→ Kiểm tra lại username/password.");
    if (String(err.message).includes("IP address"))
      console.log("→ Cần Add IP vào Network Access trên Atlas.");
    throw err;
  }
}

/**
 * Ngắt kết nối (dành cho Jest teardown)
 */
async function disconnectDB() {
  await mongoose.connection.close();
  console.log("🔌 MongoDB disconnected");
}

module.exports = { connectDB, disconnectDB, mongoose };
