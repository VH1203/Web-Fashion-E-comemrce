// services/productAdminService.js
const Product = require("../models/Product");
const ProductVariant = require("../models/ProductVariant");
const Category = require("../models/Category");
const Attribute = require("../models/Attribute");
const Brand = require("../models/Brand");
const { uploadImages, uploadVideo } = require("./mediaService");
const { importProductsFromExcel } = require("./importService");

/* ===== Products ===== */
exports.listProducts = async ({ shopId, q, page=1, limit=20, category_id, status }) => {
  const filter = { shop_id: shopId };
  if (q) filter.name = { $regex: q, $options: "i" };
  if (category_id) filter.category_id = category_id;
  if (status) filter.status = status;

  const agg = [
    { $match: filter },
    { $sort: { createdAt: -1 } },
    { $skip: (page-1)*limit }, { $limit: Number(limit) },
    { $lookup: { from: "categories", localField: "category_id", foreignField: "_id", as: "cat" } },
    { $addFields: { category_name: { $ifNull: [ { $arrayElemAt: ["$cat.name", 0] }, null ] } } },
    { $project: { cat:0 } }
  ];
  const [items, total] = await Promise.all([
    Product.aggregate(agg),
    Product.countDocuments(filter),
  ]);
  return { items, total, page: Number(page), limit: Number(limit) };
};

exports.createProduct = async (payload, shopId) => {
  let category_path = [];
  if (payload.category_id) {
    const cat = await Category.findById(payload.category_id).lean();
    if (cat) category_path = [...(cat.path||[]), cat.slug];
  }
  return Product.create({ ...payload, shop_id: shopId, category_path });
};

exports.updateProduct = async (id, payload, shopId) => {
  if (payload.category_id) {
    const cat = await Category.findById(payload.category_id).lean();
    payload.category_path = cat ? [...(cat.path||[]), cat.slug] : [];
  }
  return Product.findOneAndUpdate({ _id: id, shop_id: shopId }, { $set: payload }, { new: true });
};

/* ===== Variants single ===== */
exports.listVariants = (product_id, shopId) => ProductVariant.find({ product_id, shop_id: shopId }).lean();
exports.createVariant = async (product_id, body, shopId) => {
  const v = await ProductVariant.create({ product_id, shop_id: shopId, ...body });
  await exports.recomputeStockTotal(product_id, shopId);
  return v;
};
exports.updateVariant = async (variantId, body, shopId) => {
  const v = await ProductVariant.findOneAndUpdate({ _id: variantId, shop_id: shopId }, { $set: body }, { new: true });
  if (v) await exports.recomputeStockTotal(v.product_id, shopId);
  return v;
};
exports.deleteVariant = async (variantId, shopId) => {
  const v = await ProductVariant.findOneAndDelete({ _id: variantId, shop_id: shopId });
  if (v) await exports.recomputeStockTotal(v.product_id, shopId);
  return { ok: true };
};

/* ===== Variants bulk (ma trận) ===== */
exports.createVariantsBulk = async (product_id, rows = [], shopId) => {
  if (!Array.isArray(rows) || rows.length === 0) return { inserted: 0 };
  const docs = rows.map(r => ({
    product_id, shop_id: shopId,
    sku: r.sku,
    price: Number(r.price||0),
    stock: Number(r.stock||0),
    variant_attributes: r.variant_attributes || {}, // ví dụ: { color: "Đỏ", size: "M" }
    is_active: true,
  }));
  await ProductVariant.insertMany(docs, { ordered: false });
  await exports.recomputeStockTotal(product_id, shopId);
  return { inserted: docs.length };
};

exports.recomputeStockTotal = async (product_id, shopId) => {
  const agg = await ProductVariant.aggregate([
    { $match: { product_id, shop_id: shopId } },
    { $group: { _id: null, st: { $sum: "$stock" } } }
  ]);
  await Product.updateOne({ _id: product_id, shop_id: shopId }, { $set: { stock_total: agg?.[0]?.st || 0 } });
};

/* ===== Catalog basic ===== */
exports.listCategories = () => Category.find({ is_active: true }).sort({ level:1, name:1 }).lean();
exports.listAttributes = () => Attribute.find({ is_active: true }).lean();
exports.listBrands = () => Brand.find({ is_active: true }).lean();
exports.createCategory = (payload) => Category.create({ ...payload, slug: payload.slug || undefined, is_active: true });
exports.updateCategory = (id, payload) => Category.findByIdAndUpdate(id, { $set: payload }, { new: true });
exports.deleteCategory = (id) => Category.findByIdAndDelete(id);

/* ===== Media & Import giữ nguyên ===== */
exports.uploadImages = (files, shopId) => uploadImages(files, shopId);
exports.uploadVideo  = (file, shopId)  => uploadVideo(file, shopId);
exports.importExcel = (fileBuffer, shopId) => importProductsFromExcel(fileBuffer, shopId);

/* ===== Low stock giữ nguyên ===== */
exports.lowStock = async (shopId, threshold=5) => {
  const rows = await ProductVariant.find({ is_active: true, shop_id: shopId, stock: { $lte: Number(threshold) } }, { product_id:1, stock:1, variant_attributes:1, sku:1 }).limit(200).lean();
  return rows;
};
