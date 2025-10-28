const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const CategorySchema = new mongoose.Schema(
  {
    _id: { type: String, default: () => `cat-${uuidv4()}` },
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    description: String,
    parent_id: { type: String, ref: "Category", default: null },
    level: { type: Number, default: 0 },
    path: { type: String },
    ancestors: [{ type: String, ref: "Category" }],
    children_count: { type: Number, default: 0 },
    image_url: String,
    image_public_id: String,
    seo: { title: String, description: String, keywords: [String] },
    is_active: { type: Boolean, default: true },
  },
  { timestamps: true, versionKey: false, collection: "categories" }
);

CategorySchema.virtual("children", {
  ref: "Category",
  localField: "_id",
  foreignField: "parent_id",
});

CategorySchema.index({ name: "text", slug: "text", description: "text" });
CategorySchema.index({ parent_id: 1 });

module.exports = mongoose.model("Category", CategorySchema);
