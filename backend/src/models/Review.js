const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const ReviewSchema = new mongoose.Schema(
  {
    _id: { type: String, default: () => `rev-${uuidv4()}` },
    order_id: { type: String, ref: "Order", required: true },
    product_id: { type: String, ref: "Product", required: true },
    user_id: { type: String, ref: "User", required: true },
    shop_id: { type: String, ref: "User" },
    rating: { type: Number, min: 1, max: 5, required: true },
    comment: { type: String, trim: true },
    images: [String],
    is_anonymous: { type: Boolean, default: false },
    size_feedback: {
      type: String,
      enum: ["fit", "tight", "loose", "unknown"],
      default: "unknown",
    },
    status: {
      type: String,
      enum: ["visible", "hidden", "pending", "deleted"], // ✅ thêm visible
      default: "visible",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Review", ReviewSchema);
