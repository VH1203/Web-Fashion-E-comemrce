// models/Category.js
const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

function slugifyVi(s="") {
  return String(s).trim().toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // bỏ dấu
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

const CategorySchema = new mongoose.Schema({
  _id: { type: String, default: () => `cat-${uuidv4()}` },
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: false, lowercase: true, trim: true },
  description: String,
  parent_id: { type: String, ref: "Category", default: null },
  level: { type: Number, default: 0 },
  path: { type: [String], default: [] },         
  ancestors: [{ type: String, ref: "Category" }],
  children_count: { type: Number, default: 0 },
  image_url: String,
  image_public_id: String,
  seo: { title: String, description: String, keywords: [String] },
  gender_hint: { type: String, enum: ["men", "women", "unisex", null], default: null },
  is_active: { type: Boolean, default: true },
}, { timestamps: true, versionKey: false, collection: "categories" });

CategorySchema.virtual("children", {
  ref: "Category",
  localField: "_id",
  foreignField: "parent_id",
});

CategorySchema.pre("validate", function(next) {
  if (!this.slug && this.name) this.slug = slugifyVi(this.name);
  next();
});

CategorySchema.index({ parent_id: 1, slug: 1 }, { unique: true });

CategorySchema.statics.recomputeTreeFields = async function(catId) {
  const cur = await this.findById(catId).lean();
  if (!cur) return;
  const ancestors = [];
  const path = [];
  let p = cur.parent_id ? await this.findById(cur.parent_id).lean() : null;
  while (p) {
    ancestors.unshift(p._id);
    path.unshift(p.slug);
    p = p.parent_id ? await this.findById(p.parent_id).lean() : null;
  }
  const level = ancestors.length;
  await this.updateOne({ _id: catId }, { $set: { ancestors, path, level } });
  if (cur.parent_id) {
    const count = await this.countDocuments({ parent_id: cur.parent_id });
    await this.updateOne({ _id: cur.parent_id }, { $set: { children_count: count } });
  }
};

CategorySchema.post("save", async function() {
  await this.constructor.recomputeTreeFields(this._id);
});

CategorySchema.post("findOneAndUpdate", async function(doc) {
  if (doc) await doc.constructor.recomputeTreeFields(doc._id);
});
CategorySchema.index({ ancestors: 1 });
CategorySchema.index({ path: 1 });

module.exports = mongoose.model("Category", CategorySchema);
