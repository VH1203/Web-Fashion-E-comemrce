const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const BannerSchema = new mongoose.Schema(
  {
    _id: { type: String, default: () => `banner-${uuidv4()}` },
    title: { type: String, required: true },
    image_url: { type: String, required: true },
    link: { type: String, default: "#" },
    position: {
      type: String,
      enum: ["homepage_top", "homepage_middle", "homepage_bottom", "category_page"],
      default: "homepage_top",
    },
    is_active: { type: Boolean, default: true },
    start_date: { type: Date, default: Date.now },
    end_date: { type: Date },
    created_by: { type: String, ref: "User" },
    image_public_id: String,
  },
  { timestamps: true, versionKey: false, collection: "banners" }
);

BannerSchema.index({ position: 1, is_active: 1 });

module.exports = mongoose.model("Banner", BannerSchema);
