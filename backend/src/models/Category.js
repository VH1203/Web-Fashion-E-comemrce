const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

/**
 * Model: Category
 * Dùng để quản lý danh mục sản phẩm (Nam, Nữ, Áo thun, Quần jean, Giày dép...)
 * Có thể chứa danh mục cha-con (parent_id).
 */

const categorySchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: () => `cat-${uuidv4()}`, // cat-uuid
    },

    // Tên danh mục
    name: {
      type: String,
      required: true,
      trim: true,
    },

    // slug cho SEO / URL (vd: ao-thun-nam)
    slug: {
      type: String,
      required: true,
      lowercase: true,
      unique: true,
      trim: true,
    },

    // Mô tả ngắn
    description: {
      type: String,
      trim: true,
      maxlength: 1000,
    },

    // Danh mục cha (nếu có)
    parent_id: {
      type: String,
      ref: "Category",
      default: null,
    },

    // ✅ Ảnh đại diện (hiển thị ở homepage, menu, banner)
    image_url: {
      type: String,
      trim: true,
    },

    image_public_id: {
      type: String,
      trim: true,
    },

    // SEO metadata (tùy chọn)
    seo: {
      title: { type: String, trim: true },
      description: { type: String, trim: true },
      keywords: [{ type: String, trim: true }],
    },

    // Trạng thái hoạt động
    is_active: {
      type: Boolean,
      default: true,
    },

    // Audit fields
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
    collection: "categories",
  }
);

categorySchema.pre("save", function (next) {
  this.updated_at = new Date();
  next();
});

categorySchema.index({ name: "text", slug: "text", description: "text" });

module.exports = mongoose.model("Category", categorySchema);
