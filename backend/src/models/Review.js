const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const ReviewSchema = new mongoose.Schema(
  {
    _id: { type: String, default: () => `rev-${uuidv4()}` },
    product_id: { type: String, ref: "Product", required: true },
    user_id: { type: String, ref: "User", required: true },
    rating: { type: Number, min: 1, max: 5, required: true },
    comment: String,
    images: [String],
    videos: [String],
    size_feedback: String,
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "approved" },
  },
  { timestamps: true, versionKey: false, collection: "reviews" }
);

ReviewSchema.index({ product_id: 1 });
ReviewSchema.index({ user_id: 1 });

module.exports = mongoose.model("Review", ReviewSchema);
