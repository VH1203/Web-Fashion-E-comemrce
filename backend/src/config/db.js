require("dotenv").config();
const mongoose = require("mongoose");

async function connectDB() {
  const uri = process.env.MONGO_URI;
  const dbName = process.env.MONGO_DB_NAME || "WDP";

  if (!uri) {
    console.error("❌ Missing MONGO_URI in .env");
    process.exit(1);
  }

  try {
    await mongoose.connect(uri, {
      dbName,               
      autoIndex: true,     
      retryWrites: true,
      w: "majority",
      family: 4,
    });

    console.log(`✅ MongoDB connected: ${mongoose.connection.host}`);
    console.log(`📂 Current database: ${mongoose.connection.name}`);
  } catch (err) {
    console.error("❌ MongoDB connection error:", err.message);
    if (String(err.message).includes("Authentication failed"))
      console.log("→ Kiểm tra lại username/password trong MONGO_URI");
    if (String(err.message).includes("IP address"))
      console.log("→ Cần Add IP vào Network Access trên Atlas.");
    process.exit(1);
  }
}

 
async function disconnectDB() {
  await mongoose.connection.close();
  console.log("🔌 MongoDB disconnected");
}

module.exports = { connectDB, disconnectDB, mongoose };
