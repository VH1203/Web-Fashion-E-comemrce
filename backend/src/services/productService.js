const Product = require('../models/Product');
const Category = require('../models/Category');
const Brand = require('../models/Brand');
const FlashSale = require('../models/FlashSale');
const ProductVariant = require('../models/ProductVariant');
let Review; try { Review = require('../models/Review'); } catch (_) {}
const Attribute = require('../models/Attribute');

async function findProductByIdOrSlug(idOrSlug) {
  // TRẢ VỀ LEAN OBJECT
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

async function getProductDetail(idOrSlug) {
  const prodDoc = await findProductByIdOrSlug(idOrSlug);
  if (!prodDoc) return null;

  const variants = await ProductVariant.find({ product_id: prodDoc._id, is_active: true })
    .select('_id product_id sku barcode attributes price compare_at_price currency stock images is_active')
    .sort({ price: 1 })
    .lean();

  const [brand, category, flashItem] = await Promise.all([
    prodDoc.brand_id ? Brand.findById(prodDoc.brand_id).select('_id name slug logo').lean() : null,
    prodDoc.category_id ? Category.findById(prodDoc.category_id).select('_id name slug parent_id').lean() : null,
    getFlashSaleItemForProduct(prodDoc._id),
  ]);

  // Tính khoảng giá
  let price_min = prodDoc.base_price;
  let price_max = prodDoc.base_price;
  if (variants?.length) {
    price_min = Math.min(...variants.map(v => v.price));
    price_max = Math.max(...variants.map(v => v.price));
  }

  // 👉 Lấy các key thuộc tính xuất hiện trong variants
  const variantKeys = Array.from(
    new Set(
      variants.flatMap(v => Object.keys(v.attributes || {}))
    )
  );

  // 👉 Lấy master values theo code từ bảng attributes (nếu có)
  let variant_options = {};
  if (variantKeys.length) {
    const attrs = await Attribute.find({ code: { $in: variantKeys }, is_active: true })
      .select('code values display_order')
      .lean();
    for (const a of attrs) {
      // values có thể là mảng string hoặc object; ở đây giả định mảng string
      if (Array.isArray(a.values) && a.values.length) {
        variant_options[a.code] = a.values.map(String);
      }
    }
  }

  const product = { ...prodDoc, price_min, price_max };

  return {
    product,
    variants,
    brand,
    category,
    flash_sale: flashItem,
    variant_options, // <-- TRẢ VỀ FE
  };
}

async function getProductReviews(idOrSlug, page = 1, limit = 10) {
  if (!Review) return { total: 0, items: [] };
  const prod = await findProductByIdOrSlug(idOrSlug); // đã là object, ĐỪNG .lean()
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
  const prod = await findProductByIdOrSlug(idOrSlug); // đã là object, ĐỪNG .lean()
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

  const related = await Product.find({
    status: 'active',
    category_id: prod.category_id,
    _id: { $ne: prod._id },
  })
    .select('_id name slug images base_price currency rating_avg sold_count is_featured')
    .sort({ is_featured: -1, sold_count: -1, createdAt: -1 })
    .limit(limit)
    .lean();

  return related;
}

module.exports = {
  getProductDetail,
  getProductReviews,
  getRatingsSummary,
  getRelated,
};
