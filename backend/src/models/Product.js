// models/Product.js
const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const ProductSchema = new mongoose.Schema(
  {
    _id: { type: String, default: () => `prod-${uuidv4()}` },
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },

    category_id: { type: String, ref: "Category", required: true },
    brand_id: { type: String, ref: "Brand" },

    description: { type: String, default: "" },

    detail_info: {
      origin_country: { type: String, default: "" },             
      materials: [{ type: String, trim: true }],                
      material_ratio: { type: Map, of: Number },                 
      customization_available: { type: Boolean, default: false },
      seasons: [{ type: String, enum: ["spring", "summer", "autumn", "winter", "all-season"] }],
      care_instructions: { type: String, default: "" },       
      extras: { type: Map, of: mongoose.Schema.Types.Mixed },  
    },

    tags: [{ type: String, trim: true }],

    images: [String],
    image_public_ids: [String],
    videos: [String],

    rating_avg: { type: Number, default: 0 },
    rating_count: { type: Number, default: 0 },
    sold_count: { type: Number, default: 0 },

    stock_total: { type: Number, default: 0 },

    seo: { title: String, description: String, keywords: [String] },

    is_featured: { type: Boolean, default: false },
    status: { type: String, enum: ["active", "inactive", "out_of_stock"], default: "active" },

    base_price: { type: Number, required: true },
    currency: { type: String, default: "VND" },

    shop_id: { type: String, ref: "User" },

    variant_dimensions: [{ type: String, enum: ["color", "size", "material_variant", "pattern", "fit"] }],

    attributes: { type: Map, of: mongoose.Schema.Types.Mixed },
  },
  { timestamps: true, versionKey: false, collection: "products" }
);

ProductSchema.virtual("variants", {
  ref: "ProductVariant",
  localField: "_id",
  foreignField: "product_id",
});

ProductSchema.index({ category_id: 1, brand_id: 1, status: 1 });
ProductSchema.index({ name: "text", "detail_info.materials": "text", tags: "text" });

module.exports = mongoose.model("Product", ProductSchema);
