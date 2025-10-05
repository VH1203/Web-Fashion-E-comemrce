const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  name: String,
  category_id: String,
  brand_id: String,
  description: String,
  tags: [String],
  images: [{ type: String }],
  image_public_ids: [{ type: String }],
  videos: [String],
  rating_avg: Number,
  sold_count: Number,
  stock_total: Number,
  seo: {
    title: String,
    description: String,
    keywords: [String]
  },
  is_featured: Boolean,
  base_price: Number,
  currency: String,
  attributes: Object,
  shop_id: String,
  status: String,
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Product", ProductSchema);
