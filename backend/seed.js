/* eslint-disable no-console */
require("dotenv").config();
const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const MONGO_URI ="mongodb+srv://dfs_dev:vietanh2003@cluster1.tr8dadn.mongodb.net/WDP?retryWrites=true&w=majority";
const DB_NAME = "WDP";
const DRY_RUN = process.env.DRY_RUN === "1";

const Category = mongoose.model("Category", new mongoose.Schema({
  _id: String,
  name: String,
  slug: { type: String, lowercase: true, unique: true },
  description: String,
  parent_id: { type: String, ref: "Category", default: null },
  level: Number,
  path: [String],
  ancestors: [String],
  children_count: Number,
  image_url: String,
  image_public_id: String,
  seo: { title: String, description: String, keywords: [String] },
  gender_hint: { type: String, enum: ["men","women","unisex",null], default: null },
  is_active: { type: Boolean, default: true },
}, { collection: "categories", versionKey: false }));

async function idBySlug(slug) {
  const d = await Category.findOne({ slug }).lean();
  return d?._id || null;
}

async function ensureCategory({ name, slug, parentSlug = null, gender_hint = null }) {
  const parent_id = parentSlug ? await idBySlug(parentSlug) : null;

  const setOnInsert = { _id: `cat-${uuidv4()}` };
  const set = {
    name, is_active: true,
    gender_hint: parentSlug ? null : gender_hint, // chỉ set hint ở root
    parent_id: parent_id || null,
  };

  if (DRY_RUN) {
    console.log("[DRY] upsert category", { slug, parentSlug, set });
    return;
  }
  await Category.updateOne(
    { slug },
    { $setOnInsert: { ...setOnInsert, slug }, $set: set },
    { upsert: true }
  );
}

// cây danh mục tối thiểu để thỏa slug seed
const TREE = [
  // Root
  { name: "Thời trang nam", slug: "men", gender_hint: "men" },
  { name: "Thời trang nữ", slug: "women", gender_hint: "women" },
  { name: "Unisex",        slug: "unisex", gender_hint: "unisex" },

  // Level 1
  { name: "Áo nam",  slug: "ao-nam",  parentSlug: "men" },
  { name: "Đầm nữ",  slug: "dam-nu",  parentSlug: "women" },
  { name: "Hoodie",  slug: "hoodie",  parentSlug: "unisex" },

  // Level 2 (để khớp chính xác slug anh đang dùng trong seed)
  { name: "Áo thun nam",    slug: "ao-thun-nam",   parentSlug: "ao-nam" },
  { name: "Hoodie unisex",  slug: "hoodie-unisex", parentSlug: "hoodie" },
  // (dam-nu) đã là leaf luôn trong seed
];

(async () => {
  console.log("Connect:", MONGO_URI, "| dbName:", DB_NAME, "| DRY_RUN =", !!DRY_RUN);
  await mongoose.connect(MONGO_URI, { dbName: DB_NAME, autoIndex: false });

  for (const item of TREE) {
    await ensureCategory(item);
  }

  await mongoose.disconnect();
  console.log("✅ Seed categories minimal done", DRY_RUN ? "(dry-run)" : "");
})().catch(e => { console.error("❌ Seed categories error:", e); process.exit(1); });
