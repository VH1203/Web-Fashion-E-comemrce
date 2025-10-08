// src/models/User.js
const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const userSchema = new mongoose.Schema(
  {
    _id: { type: String, default: () => `user-${uuidv4()}` },
    name: { type: String, required: true },
    username: { type: String, unique: true, required: true },
    email: { type: String, unique: true, required: true },
    phone: { type: String, unique: true, sparse: true },
    gender: { type: String, enum: ["male", "female", "other"] },
    dob: Date,
    address: String,
    role: {
      _id: { type: String, default: "role-customer" },
      name: { type: String, default: "customer" },
    },
    status: {
      type: String,
      enum: ["active", "inactive", "banned"],
      default: "active",
    },
    password_hash: String,
    refresh_token: String,
    last_login: Date,
    login_attempts: { type: Number, default: 0 },
    avatar_url: String,
    avatar_public_id: String,
    preferences: {
      height: Number,
      weight: Number,
      size_top: String,
      size_bottom: String,
    },
    bank_accounts: [{ type: String, ref: "BankAccount" }],
    addresses: [{ type: String, ref: "Address" }],
  },
  { timestamps: false, versionKey: false, collection: "users" }
);

module.exports = mongoose.model("User", userSchema);
