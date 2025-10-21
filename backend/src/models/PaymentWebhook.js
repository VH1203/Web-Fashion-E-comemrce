// src/models/PaymentWebhook.js
const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const paymentWebhookSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: () => `pwh-${uuidv4()}`,
    },
    payment_id: { type: String, ref: "Payment", required: true },
    headers: { type: Object },            // Header từ request
    raw_body: { type: Object },           // Payload JSON gốc từ VNPay / MoMo
    signature_valid: { type: Boolean, default: false },
    attempt: { type: Number, default: 1 },
    processed_at: { type: Date, default: Date.now },
    error: { type: String },              // Lưu lỗi nếu verify thất bại
  },
  { timestamps: true }
);

module.exports = mongoose.model("PaymentWebhook", paymentWebhookSchema);
