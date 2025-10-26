const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const PaymentSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: () => `pay-${uuidv4()}`,
    },
    order_id: { type: String, ref: "Order", required: true },
    user_id: { type: String, ref: "User", required: true },
    shop_id: { type: String, ref: "User" },
    gateway: {
      type: String,
      enum: ["VNPAY", "MOMO", "COD", "BANK"], // ✅ hợp lệ với seed
      required: true,
    },
    method: {
      type: String,
      enum: ["cod", "bank_transfer", "wallet"], // ✅ hợp lệ với seed
      required: true,
    },
    amount: { type: Number, required: true }, // ✅ bắt buộc
    currency: { type: String, default: "VND" },
    status: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"], // ✅ hợp lệ với seed
      default: "pending",
    },
    provider_txn_id: String,
    idempotency_key: String,
    webhook_verified: { type: Boolean, default: false },
    return_url: String,
    expires_at: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Payment", PaymentSchema);
