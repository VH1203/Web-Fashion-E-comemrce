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

exports.getAllProducts = async (req, res) => {
   try {
    const products = await productService.getAllproductsofShop();
    return res.status(200).json({
      success: true,
      data: products,
    });
  } catch (error) {
   console.error("Lỗi khi lấy sản phẩm:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi máy chủ khi lấy danh sách sản phẩm",
    });
  }
};
exports.searchProducts = async (req, res) => {
  try {
    const { q } = req.query;   
    const products = await productService.searchProductsByName(q);
    return res.status(200).json({
      success: true,
      data: products,
    });
  } catch (error) {
    console.error("Lỗi khi tìm kiếm Product:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi máy chủ khi tìm kiếm Product",
    });
  }
};
exports.updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedProduct = await productService.updateProduct(id, req.body);

    res.status(200).json({
      success: true,
      message: "Cập nhật sản phẩm thành công",
      data: updatedProduct,
    });
  } catch (error) {
    console.error("Lỗi controller:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Lỗi máy chủ khi cập nhật sản phẩm",
    });
  }
};
// Xóa sản phẩm
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await productService.deleteProductById(id);

    if (!result.success) {
      return res.status(404).json({ success: false, message: result.message });
    }

    return res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    console.error("Lỗi controller khi xóa sản phẩm:", error);
    return res.status(500).json({
      success: false,
      message: "Lỗi máy chủ khi xóa sản phẩm!",
    });
  }
};
