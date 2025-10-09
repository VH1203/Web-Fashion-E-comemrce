// src/models/CartItemSchema.js
const mongoose = require("mongoose");

/**
 * CartItemSchema
 * Mỗi phần tử trong giỏ hàng của khách hàng
 * - Không có _id riêng (subdocument)
 * - Lưu thông tin snapshot của sản phẩm tại thời điểm thêm
 */
const CartItemSchema = new mongoose.Schema(
  {
    product_id: { type: String, ref: "Product", required: true },
    variant_id: { type: String, ref: "ProductVariant" },
    name: { type: String, required: true },
    image_url: { type: String },
    price: { type: Number, required: true, min: 0 },
    qty: { type: Number, required: true, min: 1 },
    currency: { type: String, default: "VND" },
    shop_id: { type: String, ref: "User" },
    total: {
      type: Number,
      default: function () {
        return this.price * this.qty;
      },
    },
  },
  { _id: false } // không tạo _id riêng cho từng item
);

module.exports = CartItemSchema;
