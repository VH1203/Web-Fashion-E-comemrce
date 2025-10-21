const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const RefundSchema = new mongoose.Schema(
  {
    _id: { type: String, default: () => `refund-${uuidv4()}` },
    order_id: { type: String, ref: "Order", required: true },
    user_id: { type: String, ref: "User", required: true },
    reason: { type: String, required: true },
    amount: { type: Number, required: true },
    status: {
      type: String,
      enum: ["requested", "approved", "rejected", "refunded"],
      default: "requested",
    },
    processed_by: { type: String, ref: "User" },
    processed_at: Date,
  },
  { timestamps: true, versionKey: false, collection: "refunds" }
);


module.exports = mongoose.model("Refund", RefundSchema);
