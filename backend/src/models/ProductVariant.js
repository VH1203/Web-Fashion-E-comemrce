const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const ProductVariantSchema = new mongoose.Schema(
  {
    _id: { type: String, default: () => `var-${uuidv4()}` },
    product_id: { type: String, ref: "Product", required: true },
    sku: { type: String, unique: true, sparse: true },
    barcode: { type: String, unique: true, sparse: true },
    attributes: {},
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

ProductVariantSchema.index({ product_id: 1 });

module.exports = mongoose.model("ProductVariant", ProductVariantSchema);
