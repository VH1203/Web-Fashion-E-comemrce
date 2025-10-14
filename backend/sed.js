/**
 * SEED SCRIPT – DFS (Daily Fit System)
 * Sinh tự động UUID cho _id (role-..., user-...)
 */

require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");

// ==============================
// MongoDB Connection
// ==============================
const MONGO_URI = process.env.MONGO_URI;
const MONGO_DB_NAME = process.env.MONGO_DB_NAME || "WDP";

if (!MONGO_URI) {
  console.error("❌ Missing MONGO_URI in .env file!");
  process.exit(1);
}

// ==============================
// Define Schemas
// ==============================
const RoleSchema = new mongoose.Schema(
  {
    _id: { type: String, default: () => `role-${uuidv4()}` },
    name: {
      type: String,
      required: true,
      unique: true,
      enum: ["customer", "shop_owner", "system_admin", "sales", "support"],
    },
    description: String,
    permissions: [{ type: String }],
  },
  { timestamps: true, versionKey: false, collection: "roles" }
);

const UserSchema = new mongoose.Schema(
  {
    _id: { type: String, default: () => `user-${uuidv4()}` },
    name: { type: String, required: true },
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, unique: true, sparse: true },
    gender: { type: String, enum: ["male", "female", "other"] },
    role_id: { type: String, ref: "Role", required: true },
    status: { type: String, enum: ["active", "inactive", "banned"], default: "active" },
    password_hash: String,
    refresh_token: String,
  },
  { timestamps: true, versionKey: false, collection: "users" }
);

const Role = mongoose.model("Role", RoleSchema);
const User = mongoose.model("User", UserSchema);

// ==============================
// Seed Data
// ==============================
const roleTemplates = [
  { name: "customer", description: "Khách hàng mua sắm trên hệ thống" },
  { name: "shop_owner", description: "Chủ cửa hàng quản lý sản phẩm và đơn hàng" },
  { name: "system_admin", description: "Quản trị hệ thống trung gian" },
  { name: "sales", description: "Nhân viên bán hàng" },
  { name: "support", description: "Nhân viên chăm sóc khách hàng" },
];

const userTemplates = [
  {
    name: "System Admin",
    username: "admin",
    email: "admin@dfs.com",
    phone: "0900000001",
    gender: "male",
    roleName: "system_admin",
  },
  {
    name: "Shop Test",
    username: "shoptest",
    email: "shop@dfs.com",
    phone: "0900000002",
    gender: "male",
    roleName: "shop_owner",
  },
  {
    name: "Sales Staff",
    username: "sales1",
    email: "sales@dfs.com",
    phone: "0900000003",
    gender: "female",
    roleName: "sales",
  },
  {
    name: "Support Staff",
    username: "support1",
    email: "support@dfs.com",
    phone: "0900000004",
    gender: "female",
    roleName: "support",
  },
  {
    name: "Customer Demo",
    username: "customer1",
    email: "customer@dfs.com",
    phone: "0900000005",
    gender: "male",
    roleName: "customer",
  },
];

// ==============================
// Seed Function
// ==============================
async function seed() {
  try {
    console.log(`🔌 Connecting to MongoDB: ${MONGO_URI}/${MONGO_DB_NAME}`);
    await mongoose.connect(MONGO_URI, {
      dbName: MONGO_DB_NAME,
      serverSelectionTimeoutMS: 10000,
    });
    console.log("✅ Connected successfully!");

    // Xóa dữ liệu cũ
    await Role.deleteMany({});
    await User.deleteMany({});
    console.log("🧹 Cleared old data");

    // Tạo Roles (UUID tự động)
    const insertedRoles = await Role.insertMany(roleTemplates);
    console.log(`✅ Inserted ${insertedRoles.length} roles`);
    insertedRoles.forEach((r) =>
      console.log(`   → ${r.name}: ${r._id}`)
    );

    // Hash mật khẩu mặc định
    const password = "123456";
    const hashed = await bcrypt.hash(password, 10);

    // Map roleName → role_id UUID
    const roleMap = {};
    insertedRoles.forEach((r) => (roleMap[r.name] = r._id));

    // Chuẩn bị users
    const users = userTemplates.map((u) => ({
      _id: `user-${uuidv4()}`,
      name: u.name,
      username: u.username,
      email: u.email,
      phone: u.phone,
      gender: u.gender,
      role_id: roleMap[u.roleName],
      password_hash: hashed,
      status: "active",
    }));

    // Insert users
    await User.insertMany(users);
    console.log(`✅ Inserted ${users.length} users (default password: ${password})`);

    users.forEach((u) =>
      console.log(`   → ${u.username}: ${u._id} (${u.role_id})`)
    );

    console.log("🎉 Seed completed successfully!");
  } catch (err) {
    console.error("❌ Seed failed:", err);
  } finally {
    await mongoose.disconnect();
    console.log("🔌 MongoDB disconnected");
  }
}

seed();
