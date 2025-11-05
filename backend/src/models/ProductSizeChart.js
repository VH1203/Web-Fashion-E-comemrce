// models/ProductSizeChart.js
const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const SizeRowSchema = new mongoose.Schema(
  {
    label: { type: String, required: true, trim: true }, 
    measurements: {
      chest: Number,
      waist: Number,
      hip: Number,
      shoulder: Number,
      sleeve_length: Number,
      shirt_length: Number,
      pant_length: Number,
      neck: Number,
      weight_min: Number,
      weight_max: Number,
      height_min: Number,
      height_max: Number,
      extra: { type: Map, of: Number },
    },
  },
  { _id: false }
);

const ProductSizeChartSchema = new mongoose.Schema(
  {
    _id: { type: String, default: () => `psz-${uuidv4()}` },
    brand_id: { type: String, ref: "Brand" }, 
    category_id: { type: String, ref: "Category" },
    gender: { type: String, enum: ["men", "women", "unisex"], default: "unisex" },

    unit: { type: String, enum: ["cm", "in"], default: "cm" },
    weight_unit: { type: String, enum: ["kg", "lb"], default: "kg" },
    height_unit: { type: String, enum: ["cm", "in"], default: "cm" },

    rows: [SizeRowSchema],
    notes: String,
    is_active: { type: Boolean, default: true },
  },
  { timestamps: true, versionKey: false, collection: "product_size_charts" }
);

ProductSizeChartSchema.index({ brand_id: 1, category_id: 1, gender: 1 }, { unique: false });

module.exports = mongoose.model("ProductSizeChart", ProductSizeChartSchema);
