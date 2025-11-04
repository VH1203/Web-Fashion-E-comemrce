// src/models/FlashSale.js
const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const flashSaleProductSchema = new mongoose.Schema(
  {
    product_id: { type: String, ref: "Product", required: true },
    variant_id: { type: String, ref: "ProductVariant", required: true },
    flash_price: { type: Number, required: true },
    original_price: { type: Number, required: true },
    quantity_total: { type: Number, required: true },
    quantity_sold: { type: Number, default: 0 },
  },
  { _id: false }
);

const flashSaleSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: () => `fs-${uuidv4()}`,
    },
    shop_id: { type: String, ref: "User", required: true },
    title: { type: String, required: true },
    description: { type: String },
    start_time: { type: Date, required: true },
    end_time: { type: Date, required: true },
    status: {
      type: String,
      enum: ["scheduled", "active", "ended", "cancelled"],
      default: "scheduled",
    },
    discount_type: {
      type: String,
      enum: ["percentage", "fixed"],
      required: true,
    },
    discount_value: { type: Number, required: true },
    max_per_user: { type: Number, default: 1 },
    total_limit: { type: Number, default: 0 },
    products: [flashSaleProductSchema],
    banner_image: { type: String },
    banner_id: { type: String, ref: "Banner" },
    created_by: { type: String, ref: "User" },
    approved_by: { type: String, ref: "User" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("FlashSale", flashSaleSchema);
