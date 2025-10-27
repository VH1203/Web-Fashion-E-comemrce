// src/models/CartItemSchema.js
const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const CartItemSchema = new mongoose.Schema(
  {
    _id: { type: String, default: () => `item-${uuidv4()}` }, // <-- thêm id cho item
    product_id: { type: String, ref: "Product", required: true, index: true },
    variant_id: { type: String, ref: "ProductVariant", required: true, index: true },

    name: { type: String, required: true },
    image: { type: String },              
    sku: { type: String },
    attributes: { type: Object, default: {} },
    variant_label: { type: String },

    price: { type: Number, required: true, min: 0 }, 
    discount_amount: { type: Number, default: 0, min: 0 },
    qty: { type: Number, required: true, min: 1 },
    total: { type: Number, min: 0 },

    currency: { type: String, enum: ["VND", "USD"], default: "VND" },
    shop_id: { type: String, ref: "User" }, 
  },
  { versionKey: false }
);

CartItemSchema.pre("validate", function (next) {
  const unit = Math.max(0, (this.price || 0) - (this.discount_amount || 0));
  this.total = Math.max(0, unit * (this.qty || 0));
  next();
});

module.exports = CartItemSchema;
