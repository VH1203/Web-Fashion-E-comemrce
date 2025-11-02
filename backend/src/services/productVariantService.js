const ProductVariant = require('../models/ProductVariant');

/**
 * Lấy variants của nhiều product theo mảng product_id
 * @param {string[]} productIds 
 * @returns {Promise<Object>} { [productId]: variants[] }
 */
async function getVariantsByProductIds(productIds = []) {
  if (!productIds.length) return {};

  try {
    const variants = await ProductVariant.find({
      product_id: { $in: productIds },
      is_active: true,
    })
      .select('_id product_id sku attributes price stock images')
      .lean();

    // gom variants theo product_id
    const grouped = {};
    productIds.forEach(id => grouped[id] = []);
    variants.forEach(v => {
      if (grouped[v.product_id]) grouped[v.product_id].push(v);
    });

    return grouped;
  } catch (err) {
    console.error(" Lỗi khi lấy variants theo productIds:", err);
    return {};
  }
}

module.exports = {
  getVariantsByProductIds,
};