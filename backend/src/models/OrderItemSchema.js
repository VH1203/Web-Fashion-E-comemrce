// src/models/OrderItemSchema.js
const mongoose = require("mongoose");

/**
 * OrderItemSchema
 * - Mỗi sản phẩm trong đơn hàng
 * - Lưu snapshot tại thời điểm đặt
 * - Có thể theo dõi shipped_qty, refunded_qty
 */
const OrderItemSchema = new mongoose.Schema(
  {
    product_id: { type: String, ref: "Product", required: true },
    variant_id: { type: String, ref: "ProductVariant" },
    name: { type: String, required: true },
    image_url: { type: String },
    qty: { type: Number, required: true, min: 1 },
    price: { type: Number, required: true, min: 0 },
    discount: { type: Number, default: 0 },
    total: {
      type: Number,
      default: function () {
        return (this.price - this.discount) * this.qty;
      },
    },
    currency: { type: String, default: "VND" },
    refunded_qty: { type: Number, default: 0 },
    shipped_qty: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ["pending", "confirmed", "shipping", "delivered", "returned"],
      default: "pending",
    },
  },
  { _id: false }
);

module.exports = OrderItemSchema;
