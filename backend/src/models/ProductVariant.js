// models/ProductVariant.js
const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

/**
 * Mỗi biến thể có thể khác:
 * - giá, ảnh, barcode/SKU, tồn kho
 * - thuộc tính biến thể: color/size/material_variant/...
 */
const ProductVariantSchema = new mongoose.Schema(
  {
    _id: { type: String, default: () => `var-${uuidv4()}` },
    product_id: { type: String, ref: "Product", required: true },

    sku: { type: String, unique: true, sparse: true, trim: true },
    barcode: { type: String, unique: true, sparse: true, trim: true },

    variant_attributes: {
      type: Map,
      of: String,
      default: {}
    },

    price: { type: Number, required: true },
    compare_at_price: Number,
    currency: { type: String, default: "VND" },

    stock: { type: Number, default: 0 },
    low_stock_threshold: { type: Number, default: 5 },

    images: [String],
    image_public_ids: [String],

    is_active: { type: Boolean, default: true },
  },
  { timestamps: true, versionKey: false, collection: "product_variants" }
);

// Tối ưu tra cứu biến thể theo thuộc tính
ProductVariantSchema.index({ product_id: 1, "variant_attributes.color": 1, "variant_attributes.size": 1 });

module.exports = mongoose.model("ProductVariant", ProductVariantSchema);
