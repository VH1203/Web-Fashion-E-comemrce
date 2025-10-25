const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const BrandSchema = new mongoose.Schema(
  {
    _id: { type: String, default: () => `brand-${uuidv4()}` },
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    country: { type: String, default: "Unknown" },
    gender: { type: String, enum: ["men", "women", "unisex"], default: "unisex" },
    description: String,
    logo_url: String,
    logo_public_id: String,
    seo: { title: String, description: String, keywords: [String] },
    is_active: { type: Boolean, default: true },
  },
  { timestamps: true, versionKey: false, collection: "brands" }
);


module.exports = mongoose.model("Brand", BrandSchema);
