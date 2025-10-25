const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const ProductSchema = new mongoose.Schema(
  {
    _id: { type: String, default: () => `prod-${uuidv4()}` },
    name: { type: String, required: true },
    category_id: { type: String, ref: "Category", required: true },
    brand_id: { type: String, ref: "Brand" },
    description: String,
    tags: [String],
    images: [String],
    image_public_ids: [String],
    videos: [String],
    rating_avg: { type: Number, default: 0 },
    rating_count: { type: Number, default: 0 },
    sold_count: { type: Number, default: 0 },
    stock_total: { type: Number, default: 0 },
    seo: { title: String, description: String, keywords: [String] },
    is_featured: { type: Boolean, default: false },
    base_price: { type: Number, required: true },
    currency: { type: String, default: "VND" },
    attributes: {},
    shop_id: { type: String, ref: "User" },
    status: { type: String, enum: ["active", "inactive", "out_of_stock"], default: "active" },
  },
  { timestamps: true, versionKey: false, collection: "products" }
);

ProductSchema.virtual("variants", {
  ref: "ProductVariant",
  localField: "_id",
  foreignField: "product_id",
});


module.exports = mongoose.model("Product", ProductSchema);
