const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const ProductSizeChartSchema = new mongoose.Schema(
  {
    _id: { type: String, default: () => `psz-${uuidv4()}` },
    brand_id: { type: String, ref: "Brand" },
    category_id: { type: String, ref: "Category" },
    gender: { type: String, enum: ["men", "women", "unisex"], default: "unisex" },
    unit: { type: String, enum: ["cm", "in"], default: "cm" },
    rows: [{ label: String, measurements: {} }],
    notes: String,
    is_active: { type: Boolean, default: true },
  },
  { timestamps: true, versionKey: false, collection: "product_size_charts" }
);

module.exports = mongoose.model("ProductSizeChart", ProductSizeChartSchema);
