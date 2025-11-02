const FlashSale = require("../models/FlashSale");

/**
 * Lấy flashsale theo ID
 */
exports.getById = async (id) => {
  const fs = await FlashSale.findById(id)
    .populate("products.product_id", "name price images") 
    .lean();
  if (!fs) return null;
  return fs;
};

/**
 * Lấy danh sách flashsale với phân trang và filter
 * filters có thể chứa: name, is_active, start_date, end_date
 */
exports.getAll = async ({ page = 1, limit = 10, filters = {} }) => {
  const query = {};

  if (filters.name) query.name = { $regex: filters.name, $options: "i" };
  if (filters.is_active !== undefined) query.is_active = filters.is_active;
  if (filters.start_date) query.start_date = { $gte: new Date(filters.start_date) };
  if (filters.end_date) query.end_date = { $lte: new Date(filters.end_date) };

  const total = await FlashSale.countDocuments(query);
  const flashSales = await FlashSale.find(query)
    .skip((page - 1) * limit)
    .limit(limit)
    .sort({ createdAt: -1 })
    .lean();

  return { data: flashSales, page, limit, total };
};

/**
 * Tạo flashsale mới
 */
exports.create = async (data) => {
  const fs = new FlashSale(data);
  await fs.save();
  return fs.toObject();
};

/**
 * Cập nhật flashsale theo ID
 */
exports.updateById = async (id, payload) => {
  const allow = [
    "name",
    "description",
    "discount_percent",
    "start_date",
    "end_date",
    "is_active",
    "products", 
  ];

  const $set = {};
  for (const key of allow) {
    if (payload[key] !== undefined) $set[key] = payload[key];
  }

  const fs = await FlashSale.findByIdAndUpdate(id, { $set }, { new: true, runValidators: true }).lean();
  return fs;
};

/**
 * Xóa flashsale
 */
exports.deleteById = async (id) => {
  const fs = await FlashSale.findByIdAndDelete(id).lean();
  return fs;
};
