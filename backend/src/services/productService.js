// backend/src/services/productService.js
const Product = require('../models/Product');
const Category = require('../models/Category');
const Brand = require('../models/Brand');
const FlashSale = require('../models/FlashSale');
const ProductVariant = require('../models/ProductVariant');
let Review; try { Review = require('../models/Review'); } catch (_) {}
const Attribute = require('../models/Attribute');
const ProductSizeChart = require('../models/ProductSizeChart');

async function findProductByIdOrSlug(idOrSlug) {
  return Product.findOne({ $or: [{ _id: idOrSlug }, { slug: idOrSlug }] }).lean();
}

async function getFlashSaleItemForProduct(productId) {
  const now = new Date();
  const fs = await FlashSale.findOne({
    status: 'active',
    start_time: { $lte: now },
    end_time: { $gte: now },
    'products.product_id': productId,
  }).lean();
  if (!fs) return null;
  const item = fs.products.find((x) => String(x.product_id) === String(productId));
  if (!item) return null;
  const discount_percent = Math.max(
    0,
    Math.round((1 - item.flash_price / (item.original_price || item.flash_price)) * 100)
  );
  return {
    flash_sale_id: fs._id,
    start_time: fs.start_time,
    end_time: fs.end_time,
    ...item,
    discount_percent,
    remaining: Math.max(0, (item.quantity_total || 0) - (item.quantity_sold || 0)),
  };
}

function toUrl(x) {
  if (!x) return "";
  if (typeof x === "string") return x;
  return x.url || x.secure_url || x.path || "";
}

function normalizeImageUrls(arr) {
  const a = Array.isArray(arr) ? arr : [];
  return a.map(toUrl).map(s => String(s).trim()).filter(Boolean);
}

function readVarAttrs(va) {
  if (!va) return {};
  if (va instanceof Map) return Object.fromEntries(va);
  return typeof va === "object" ? va : {};
}

function chooseGender(category) {
  const g = (category?.gender_hint || "").toLowerCase();
  return ["men","women","unisex"].includes(g) ? g : "unisex";
}

async function getProductDetail(idOrSlug) {
  const prodDoc = await findProductByIdOrSlug(idOrSlug);
  if (!prodDoc) return null;

  const variantsRaw = await ProductVariant.find({
    product_id: prodDoc._id, is_active: true
  })
    .select('_id product_id sku barcode variant_attributes price compare_at_price currency stock images is_active')
    .sort({ price: 1 })
    .lean();

  const [brand, category, flashItem] = await Promise.all([
    prodDoc.brand_id ? Brand.findById(prodDoc.brand_id).select('_id name slug logo_url logo_public_id').lean() : null,
    prodDoc.category_id ? Category.findById(prodDoc.category_id).select('_id name slug parent_id gender_hint').lean() : null,
    getFlashSaleItemForProduct(prodDoc._id),
  ]);

  // ===== Size chart: try (brand_id, category_id, gender) → (null, category_id, gender)
  let sizeChart = null;
  if (category?._id) {
    const gender = chooseGender(category);
    sizeChart =
      (await ProductSizeChart.findOne({ brand_id: prodDoc.brand_id || null, category_id: category._id, gender }).lean())
      || (await ProductSizeChart.findOne({ brand_id: null, category_id: category._id, gender }).lean())
      || null;
  }

  // price range
  let price_min = prodDoc.base_price;
  let price_max = prodDoc.base_price;
  if (variantsRaw?.length) {
    price_min = Math.min(...variantsRaw.map(v => v.price));
    price_max = Math.max(...variantsRaw.map(v => v.price));
  }

  // variant keys
  const variantKeys = Array.from(
    new Set(variantsRaw.flatMap(v => Object.keys(readVarAttrs(v.variant_attributes))))
  );

  // options master from Attribute
  let variant_options = {};
  if (variantKeys.length) {
    const attrs = await Attribute.find({ code: { $in: variantKeys }, is_active: true })
      .select('code values display_order')
      .lean();
    for (const a of attrs) {
      if (Array.isArray(a.values) && a.values.length) {
        variant_options[a.code] = a.values.map(String);
      }
    }
  }

  // product + variants normalize
  const product = {
    ...prodDoc,
    price_min,
    price_max,
    images: normalizeImageUrls(prodDoc.images),
  };

  const variants = (variantsRaw || []).map(v => ({
    ...v,
    images: normalizeImageUrls(v.images),
    variant_attributes: readVarAttrs(v.variant_attributes),
  }));

  return {
    product,
    variants,
    brand,
    category,
    flash_sale: flashItem,
    variant_options,
    size_chart: sizeChart, // 👈 FE dùng để gợi ý size
  };
}

async function getProductReviews(idOrSlug, page = 1, limit = 10) {
  if (!Review) return { total: 0, items: [] };
  const prod = await findProductByIdOrSlug(idOrSlug);
  if (!prod) return { total: 0, items: [] };

  const query = { product_id: prod._id, status: 'approved' };
  const [total, items] = await Promise.all([
    Review.countDocuments(query),
    Review.find(query).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean(),
  ]);
  return { total, items };
}

async function getRatingsSummary(idOrSlug) {
  if (!Review) return { average: 0, count: 0, histogram: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } };
  const prod = await findProductByIdOrSlug(idOrSlug);
  if (!prod) return { average: 0, count: 0, histogram: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 } };

  const rows = await Review.aggregate([
    { $match: { product_id: prod._id, status: 'approved' } },
    { $group: { _id: '$rating', c: { $sum: 1 } } },
  ]);

  const hist = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let total = 0, sum = 0;
  for (const r of rows) {
    const star = Math.max(1, Math.min(5, Number(r._id) || 0));
    hist[star] = r.c;
    total += r.c;
    sum += star * r.c;
  }
  const average = total ? +(sum / total).toFixed(2) : 0;
  return { average, count: total, histogram: hist };
}

async function getRelated(idOrSlug, limit = 12) {
  const prod = await Product.findOne({ $or: [{ _id: idOrSlug }, { slug: idOrSlug }] })
    .select('_id category_id')
    .lean();
  if (!prod || !prod.category_id) return [];

  const relatedRaw = await Product.find({
    status: 'active',
    category_id: prod.category_id,
    _id: { $ne: prod._id },
  })
    .select('_id name slug images base_price currency rating_avg sold_count is_featured')
    .sort({ is_featured: -1, sold_count: -1, createdAt: -1 })
    .limit(limit)
    .lean();

  return relatedRaw.map(r => ({
    ...r,
    images: normalizeImageUrls(r.images),
  }));
}

async function getAllproductsofShop() {
  try {
    const products = await Product.find().sort({ createdAt: -1 }).lean();
    console.log(`✅ Found ${products.length} products of Shop`);
    return products;
  } catch (err) {
    console.error("🔥 Lỗi Mongo khi find Product:", err);
    return [];
  }
}

async function searchProductsByName(keyword) {
  try {
    if (!keyword || typeof keyword !== 'string') {
      return await Product.find().sort({ createdAt: -1 }).lean();
    }

    let products = await Product.find(
      { $text: { $search: keyword } },
      { score: { $meta: "textScore" } }
    ).sort({ score: { $meta: "textScore" } }).lean();

    if (products.length === 0) {
      products = await Product.find({
        name: { $regex: keyword, $options: "i" }
      }).lean();
    }

    console.log(` Found ${products.length} products matching "${keyword}"`);
    return products;
  } catch (err) {
    console.error("🔥 Lỗi Mongo khi tìm kiếm Product:", err);
    return [];
  }
}

async function updateProduct(id, data){
  try {
    const product = await Product.findByIdAndUpdate(
      id,
      {
        $set: {
          name: data.name,
          description: data.description,
          base_price: data.base_price,
          stock_total: data.stock_total,
          status: data.status,
        },
      },
      { new: true }
    );
    if (!product) throw new Error("Không tìm thấy sản phẩm");
    return product;
  } catch (error) {
    console.error("Lỗi khi cập nhật sản phẩm:", error);
    throw error;
  }
}

async function deleteProductById(id){
  try {
    const product = await Product.findById(id);
    if (!product) throw new Error("Không tìm thấy sản phẩm");
    await Product.findByIdAndDelete(id);
    return {success: true, message: "Xóa sản phẩm thành công"};
  } catch (error) {
    console.error("Lỗi khi xóa sản phẩm:", error);
    throw error;
  }
}

module.exports = {
  getProductDetail,
  getProductReviews,
  getRatingsSummary,
  getRelated,
  getAllproductsofShop,
  searchProductsByName,
  updateProduct,
  deleteProductById,
};
