const ProductVariant = require('../models/ProductVariant');
const Product = require('../models/Product');

exports.getVariantsByProduct = async (req, res, next) => {
  try {
    const { product_ids } = req.body; // mảng product_id
    if (!Array.isArray(product_ids) || !product_ids.length) {
      return res.status(400).json({ status: 'fail', message: 'product_ids is required' });
    }

    const variants = await ProductVariant.find({ product_id: { $in: product_ids }, is_active: true })
      .select('_id product_id sku attributes price stock')
      .lean();

    res.status(200).json({ status: 'success', data: variants });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 'fail', message: 'Server error' });
  }
};