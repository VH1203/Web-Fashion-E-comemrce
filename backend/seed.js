// backend/scripts/seed_products_50.js
require("dotenv").config();
const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const Category = require("../backend/src/models/Category");
const Brand = require("../backend/src/models/Brand");
const Product = require("../backend/src/models/Product");
const ProductVariant = require("../backend/src/models/ProductVariant");
let User;
try {
  User = require("../backend/src/models/User");
} catch (_) {}

const MONGO_URI = `${process.env.MONGO_URI}/${process.env.MONGO_DB_NAME}?retryWrites=true&w=majority`;
const SEED_SHOP_ID = "user-acd80ed5-dfda-4e0d-9387-ba077d6a1d78";
const SEED_TAG = "seed-50-v2"; // dùng để clean

/* ===== Helpers ===== */
const rint = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const uniq = (arr) => Array.from(new Set(arr));

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

// SKU unique: bám theo productId + 3 ký tự màu + size + random
function skuFor(prodId, color, size, idx = 0) {
  const pid = String(prodId).slice(-6).toUpperCase();
  const c3 = slugifyVi(color).slice(0, 3).toUpperCase() || "CLR";
  const s = String(size)
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");
  const rand = Math.random().toString(36).slice(-3).toUpperCase();
  return `SKU-${pid}-${c3}-${s}-${idx}${rand}`;
}

const COLORS = [
  "Black",
  "White",
  "Grey",
  "Navy",
  "Blue",
  "Light Blue",
  "Red",
  "Maroon",
  "Green",
  "Olive",
  "Brown",
  "Beige",
  "Pink",
  "Purple",
  "Yellow",
  "Orange",
];

const SIZES_TOP = ["XS", "S", "M", "L", "XL", "XXL"];
const SIZES_UNISEX = ["S", "M", "L", "XL", "XXL"];
const SIZES_BOTTOM = ["28", "29", "30", "31", "32", "33", "34", "36"];
const SIZES_DRESS = ["S", "M", "L", "XL"];

const NAME_TOPS = [
  "Áo thun",
  "Áo sơ mi",
  "Áo polo",
  "Áo nỉ",
  "Áo khoác",
  "Áo len",
];
const NAME_BOTTOMS = [
  "Quần jeans",
  "Quần tây",
  "Quần kaki",
  "Quần jogger",
  "Quần short",
];
const NAME_DRESS = ["Váy chữ A", "Váy xòe", "Đầm suông", "Đầm body"];
const NAME_SLEEP = ["Đồ ngủ cotton", "Pyjama", "Áo choàng ngủ"];
const NAME_UNDER = ["Áo lót", "Quần lót", "Bralette"];
const NAME_SET = ["Bộ đồ thể thao", "Bộ mặc nhà", "Bộ nỉ"];

const PLACEHOLDER_IMAGES = [
  "https://images.unsplash.com/photo-1520975739546-0e3fb5b1c549",
  "https://images.unsplash.com/photo-1512436991641-6745cdb1723f",
  "https://images.unsplash.com/photo-1520975693413-35a9da9f3d59",
];

function namesByCategorySlugPath(path = []) {
  const has = (slug) => path.includes(slug);
  if (has("vay") || has("dam")) return NAME_DRESS;
  if (has("do-ngu")) return NAME_SLEEP;
  if (has("do-lot")) return NAME_UNDER;
  if (has("bo")) return NAME_SET;
  if (has("quan")) return NAME_BOTTOMS;
  if (has("ao")) return NAME_TOPS;
  // default:
  return [...NAME_TOPS, ...NAME_BOTTOMS];
}

function sizesByCategorySlugPath(path = []) {
  const has = (slug) => path.includes(slug);
  if (has("vay") || has("dam")) return SIZES_DRESS;
  if (has("quan")) return SIZES_BOTTOM;
  if (has("ao")) return SIZES_TOP;
  return SIZES_UNISEX;
}

async function ensureBrands() {
  const names = [
    "DFS Basics",
    "BluePeak",
    "UrbanFit",
    "EcoWear",
    "ClassicLine",
  ];
  const out = [];
  for (const n of names) {
    const slug = slugifyVi(n);
    const doc = await Brand.findOneAndUpdate(
      { slug },
      {
        $setOnInsert: {
          name: n,
          slug,
          country: "VN",
          gender_focus: "mixed",
          is_active: true,
        },
      },
      { new: true, upsert: true }
    );
    out.push(doc);
  }
  return out;
}

async function guessShopId() {
  // cố gắng tìm 1 shop owner để gán shop_id (không bắt buộc)
  if (!User) return null;
  const q = [
    { role: "shop_owner" },
    { role_id: "shop_owner" },
    { role_id: /shop/i },
  ];
  for (const cond of q) {
    const u = await User.findOne(cond).lean();
    if (u?._id) return u._id;
  }
  return null;
}

async function getLeafCategories() {
  // lá: children_count === 0; nếu thiếu trường này thì lấy level >= 2
  let leaves = await Category.find({
    is_active: true,
    children_count: { $in: [0, undefined, null] },
  }).lean();
  if (!leaves?.length)
    leaves = await Category.find({
      is_active: true,
      level: { $gte: 2 },
    }).lean();
  return leaves;
}

/* ===== MAIN ===== */
(async () => {
  await mongoose.connect(MONGO_URI, {});
  console.log("✓ Mongo connected");

  const [brands, leaves, shopId] = await Promise.all([
    ensureBrands(),
    getLeafCategories(),
    guessShopId(),
  ]);
  if (!leaves.length)
    throw new Error(
      "Không tìm thấy category lá. Hãy import categories 3 cấp trước."
    );

  console.log(
    `• Leaves: ${leaves.length} | Brands: ${brands.length} | Shop: ${
      shopId || "(none)"
    }`
  );

  const createdProducts = [];
  const createdVariants = [];

  for (let i = 0; i < 50; i++) {
    const cat = pick(leaves);
    // path slugs để suy luận tên/sizes
    const pathSlugs = (cat.path || []).concat(cat.slug || []);
    const nameLib = namesByCategorySlugPath(pathSlugs);
    const sizesLib = sizesByCategorySlugPath(pathSlugs);

    const baseName = pick(nameLib);
    const flavor = pick([
      "Basic",
      "Premium",
      "Classic",
      "Regular",
      "Essential",
    ]);
    const name = `${baseName} ${flavor} #${rint(100, 999)}`;

    const slug = `${slugifyVi(name)}-${uuidv4().slice(0, 6)}`;
    const base_price = rint(199_000, 799_000);
    const brand = pick(brands);

    const p = await Product.create({
      name,
      slug,
      category_id: cat._id,
      brand_id: brand?._id,
      description: `${baseName} phong cách ${flavor}.`,
      detail_info: {
        origin_country: "VN",
        materials: pick([
          ["cotton"],
          ["cotton", "polyester"],
          ["spandex", "polyester"],
        ]),
        seasons: pick([
          ["all-season"],
          ["summer"],
          ["winter"],
          ["spring", "autumn"],
        ]),
        care_instructions: "Giặt máy nhẹ, không tẩy.",
      },
      tags: ["dfs", "seed", SEED_TAG],
      images: PLACEHOLDER_IMAGES,
      videos: [],
      stock_total: 0,
      seo: {
        title: name,
        description: `${name} – DFS`,
        keywords: [baseName, "thời trang"],
      },
      is_featured: Math.random() < 0.15,
      status: "active",
      base_price,
      currency: "VND",
      shop_id: shopId || undefined,
      variant_dimensions: ["color", "size"],
      attributes: { seed_tag: SEED_TAG, path: pathSlugs },
    });

    createdProducts.push(p);

    // chọn biến thể: 2–4 màu, 3–6 size
    const nColors = rint(2, 4);
    const nSizes = rint(3, Math.min(6, sizesLib.length));
    const colors = uniq(Array.from({ length: nColors }, () => pick(COLORS)));
    const sizes = uniq(Array.from({ length: nSizes }, () => pick(sizesLib)));

    let idx = 0;
    for (const color of colors) {
      for (const size of sizes) {
        const price = base_price + rint(0, 120_000);
        const stock = rint(2, 25);
        const sku = skuFor(p._id, color, size, idx);
        const barcode = `BC${Date.now()}${i}${idx}${rint(100, 999)}`;

        createdVariants.push({
          _id: `var-${uuidv4()}`,
          product_id: p._id,
          sku,
          barcode,
          variant_attributes: { color, size },
          price,
          currency: "VND",
          stock,
          low_stock_threshold: 5,
          images: p.images,
          image_public_ids: [],
          is_active: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        idx++;
      }
    }
  }

  // insert variants bulk (avoid E11000 với sku trùng: đã có rand suffix)
  if (createdVariants.length) {
    await ProductVariant.insertMany(createdVariants, { ordered: false });
  }

  // recompute stock_total
  const sums = await ProductVariant.aggregate([
    { $match: { product_id: { $in: createdProducts.map((p) => p._id) } } },
    { $group: { _id: "$product_id", st: { $sum: "$stock" } } },
  ]);
  for (const s of sums) {
    await Product.updateOne({ _id: s._id }, { $set: { stock_total: s.st } });
  }

  console.log(
    `✓ Seeded products: ${createdProducts.length}, variants: ${createdVariants.length}`
  );
  await mongoose.disconnect();
  process.exit(0);
})().catch(async (e) => {
  console.error(e);
  try {
    await mongoose.disconnect();
  } catch (_) {}
  process.exit(1);
});
