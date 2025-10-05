const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

/**
 * Model: Brand
 * Mô tả thương hiệu sản phẩm (Uniqlo, Nike, Adidas...)
 * Dùng cho quản lý sản phẩm, filter, marketing banner, v.v.
 */

const brandSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: () => `brand-${uuidv4()}`,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
      unique: true,
    },

    country: {
      type: String,
      trim: true,
      default: "Unknown",
    },

    gender: {
      type: String,
      enum: ["men", "women", "unisex"],
      default: "unisex",
    },

    description: {
      type: String,
      trim: true,
      maxlength: 1000,
    },

    logo_url: {
      type: String,
      trim: true,
    },

    logo_public_id: {
      type: String,
      trim: true,
    },

    seo: {
      title: { type: String, trim: true },
      description: { type: String, trim: true },
      keywords: [{ type: String }],
    },

    is_active: {
      type: Boolean,
      default: true,
    },

    // Audit
    created_at: {
      type: Date,
      default: Date.now,
    },
    updated_at: {
      type: Date,
      default: Date.now,
    },
  },
  {
    versionKey: false,
    collection: "brands",
  }
);

brandSchema.pre("save", function (next) {
  this.updated_at = new Date();
  next();
});

module.exports = mongoose.model("Brand", brandSchema);
