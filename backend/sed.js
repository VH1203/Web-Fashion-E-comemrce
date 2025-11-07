// backend/sed.js
/* eslint-disable no-console */
require("dotenv").config();
const mongoose = require("mongoose");

// ====== DÙNG URI CỐ ĐỊNH (theo yêu cầu) ======
const MONGO_URI = `${process.env.MONGO_URI}/${process.env.MONGO_DB_NAME}?retryWrites=true&w=majority`;
// Bật tắt chỉ log (không ghi DB) qua env DRY_RUN=true/false
// scripts/seedCategories.js

// node src/scripts/seedCategories.js
const Category = require("../backend/src/models/Category");

function slugifyVi(s = "") {
  return String(s)
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

/** Tạo nếu chưa có – dò theo (parent_id + slug) hoặc (parent_id + name) để tương thích index cũ */
async function ensureCategory({ name, parent_id = null, gender_hint = null }) {
  const slug = slugifyVi(name);
  let cat = await Category.findOne({
    parent_id: parent_id || null,
    $or: [{ slug }, { name }],
  });
  if (!cat) cat = await Category.create({ name, slug, parent_id, gender_hint });
  return cat;
}

(async () => {
  await mongoose.connect(MONGO_URI);

  const roots = [
    { name: "Thời trang nam", gender_hint: "men" },
    { name: "Thời trang nữ", gender_hint: "women" },
    { name: "Unisex", gender_hint: "unisex" },
  ];

  for (const r of roots) {
    const root = await ensureCategory({
      name: r.name,
      gender_hint: r.gender_hint,
    });

    const ao = await ensureCategory({
      name: "Áo",
      parent_id: root._id,
      gender_hint: r.gender_hint,
    });
    const quan = await ensureCategory({
      name: "Quần",
      parent_id: root._id,
      gender_hint: r.gender_hint,
    });
    await Promise.all([
      ensureCategory({
        name: "Áo polo",
        parent_id: ao._id,
        gender_hint: r.gender_hint,
      }),
      ensureCategory({
        name: "Áo thun",
        parent_id: ao._id,
        gender_hint: r.gender_hint,
      }),
      ensureCategory({
        name: "Áo sơ mi",
        parent_id: ao._id,
        gender_hint: r.gender_hint,
      }),
      ensureCategory({
        name: "Quần jean",
        parent_id: quan._id,
        gender_hint: r.gender_hint,
      }),
      ensureCategory({
        name: "Quần short",
        parent_id: quan._id,
        gender_hint: r.gender_hint,
      }),
    ]);
  }

  // recompute tree fields
  const all = await Category.find({}, { _id: 1 });
  for (const c of all) await Category.recomputeTreeFields(c._id);

  console.log("Seed categories (idempotent) done.");
  process.exit(0);
})();
