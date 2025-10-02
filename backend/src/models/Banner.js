const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const bannerSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: uuidv4,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    image_url: {
      type: String,
      required: true, // link ảnh từ Cloudinary/S3/CDN
    },
    link: {
      type: String,
      default: "#", // khi click banner thì dẫn tới đâu (sản phẩm / trang khuyến mãi)
    },
    position: {
      type: String,
      enum: ["homepage_top", "homepage_middle", "homepage_bottom", "category_page"],
      default: "homepage_top",
    },
    is_active: {
      type: Boolean,
      default: true,
    },
    start_date: {
      type: Date,
      default: Date.now,
    },
    end_date: {
      type: Date,
    },
    created_by: {
      type: String, // userId của Admin/Shop Owner tạo banner
      ref: "User",
    },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

bannerSchema.index({ position: 1, is_active: 1 });
bannerSchema.index({ start_date: 1, end_date: 1 });

module.exports = mongoose.model("Banner", bannerSchema);
