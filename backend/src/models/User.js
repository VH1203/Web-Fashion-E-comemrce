const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const userSchema = new mongoose.Schema(
  {
    _id: { type: String, default: () => `user-${uuidv4()}` },
    name: { type: String, required: true },
    username: { type: String, unique: true, required: true }, // ✅ Thêm
    email: { type: String, unique: true, required: true },
    phone: { type: String },
    gender: { type: String, enum: ["male", "female", "other"] },
    dob: { type: Date },
    address: { type: String },
    role: {
      _id: { type: String },
      name: { type: String, default: "customer" },
    },
    password_hash: { type: String, required: true }, // ✅ đổi từ "password"
    status: {
      type: String,
      enum: ["active", "inactive", "banned"],
      default: "active",
    },
    avatar_url: { type: String },
    avatar_public_id: { type: String },
    preferences: {
      height: Number,
      weight: Number,
      size_top: String,
      size_bottom: String,
    },
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
  },
  { versionKey: false, collection: "users" }
);

userSchema.pre("save", function (next) {
  this.updated_at = new Date();
  next();
});

module.exports = mongoose.model("User", userSchema);
