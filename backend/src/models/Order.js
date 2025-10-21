// src/models/Order.js
const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");
const OrderItemSchema = require("./OrderItemSchema");

/**
 * OrderSchema
 * - Đơn hàng của khách hàng (thuộc 1 shop)
 * - Liên kết với User, Address, Voucher, Payment, Shipper
 */
const OrderSchema = new mongoose.Schema(
  {
    _id: { type: String, default: () => `ord-${uuidv4()}` },
    order_code: { type: String, required: true, unique: true },
    user_id: { type: String, ref: "User", required: true },
    shop_id: { type: String, ref: "User", required: true },

    items: [OrderItemSchema],

    address_id: { type: String, ref: "Address" },
    voucher_id: { type: String, ref: "Voucher" },

    payment_method: {
      type: String,
      enum: ["COD", "VNPAY", "MOMO", "WALLET"],
      default: "COD",
    },
    payment_status: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },

    shipping_provider: { type: String, enum: ["GHN", "GHTK", "NONE"], default: "NONE" },
    shipping_fee: { type: Number, default: 0 },
    tracking_code: { type: String },
    expected_delivery: { type: Date },

    total_price: { type: Number, required: true },
    note: { type: String },

    status: {
      type: String,
      enum: ["processing","pending", "confirmed", "shipping", "delivered", "canceled_by_customer", "canceled_by_shop", "refund_pending", "refund_completed"],
      default: "pending",
    },

    inventory_adjusted: { type: Boolean, default: false },
    created_by: { type: String, ref: "User" },
  },
  { timestamps: true, versionKey: false, collection: "orders" }
);

// Tự động tính tổng tiền trước khi save
OrderSchema.pre("save", function (next) {
  if (this.items && this.items.length > 0) {
    const subtotal = this.items.reduce((sum, it) => sum + (it.total || (it.price - it.discount) * it.qty), 0);
    this.total_price = subtotal + (this.shipping_fee || 0);
  }
  next();
});


module.exports = mongoose.model("Order", OrderSchema);
