const productService = require('../services/productService');

exports.getDetail = async (req, res, next) => {
  try {
    const { idOrSlug } = req.params;
    const data = await productService.getProductDetail(idOrSlug);
    if (!data) return res.status(404).json({ status: 'fail', message: 'Product not found' });
    res.status(200).json({ status: 'success', data });
  } catch (err) { next(err); }
};

exports.getReviews = async (req, res, next) => {
  try {
    const { idOrSlug } = req.params;
    const page = Number(req.query.page) || 1;
    const limit = Math.min(Number(req.query.limit) || 10, 50);
    const data = await productService.getProductReviews(idOrSlug, page, limit);
    res.status(200).json({ status: 'success', data });
  } catch (err) { next(err); }
};

exports.getRatingsSummary = async (req, res, next) => {
  try {
    const { idOrSlug } = req.params;
    const data = await productService.getRatingsSummary(idOrSlug);
    res.status(200).json({ status: 'success', data });
  } catch (err) { next(err); }
};

exports.getRelated = async (req, res, next) => {
  try {
    const { idOrSlug } = req.params;
    const limit = Math.min(Number(req.query.limit) || 12, 48);
    const data = await productService.getRelated(idOrSlug, limit);
    res.status(200).json({ status: 'success', data });
  } catch (err) { next(err); }
};
