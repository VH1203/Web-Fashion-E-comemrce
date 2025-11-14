const productService = require("../services/productService");

exports.getDetail = async (req, res, next) => {
  try {
    const { idOrSlug } = req.params;
    const data = await productService.getProductDetail(idOrSlug);
    if (!data)
      return res
        .status(404)
        .json({ status: "fail", message: "Product not found" });
    res.status(200).json({ status: "success", data });
  } catch (err) {
    next(err);
  }
};

exports.getReviews = async (req, res, next) => {
  try {
    const { idOrSlug } = req.params;
    const page = Number(req.query.page) || 1;
    const limit = Math.min(Number(req.query.limit) || 10, 50);
    const data = await productService.getProductReviews(idOrSlug, page, limit);
    res.status(200).json({ status: "success", data });
  } catch (err) {
    next(err);
  }
};

exports.getRatingsSummary = async (req, res, next) => {
  try {
    const { idOrSlug } = req.params;
    const data = await productService.getRatingsSummary(idOrSlug);
    res.status(200).json({ status: "success", data });
  } catch (err) {
    next(err);
  }
};

exports.getRelated = async (req, res, next) => {
  try {
    const { idOrSlug } = req.params;
    const limit = Math.min(Number(req.query.limit) || 12, 48);
    const data = await productService.getRelated(idOrSlug, limit);
    res.status(200).json({ status: "success", data });
  } catch (err) {
    next(err);
  }
};

exports.getProducts = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 12,
      sortBy = "createdAt",
      sortOrder = "desc",
      category_slug,
      brand_slug,
      ...filters
    } = req.query;

    const options = {
      page: parseInt(page, 10),
      limit: parseInt(limit, 10),
      sortBy,
      sortOrder,
      filters: { ...filters, category_slug, brand_slug },
    };

    const result = await productService.getProducts(options);
    res.status(200).json({ status: "success", data: result });
  } catch (err) {
    next(err);
  }
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
exports.searchProducts = async (req, res, next) => {
  try {
    const { q } = req.query;
    const products = await productService.searchProductsByName(q);
    res.status(200).json({ status: "success", data: products });
  } catch (error) {
    next(error);
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

exports.createProduct = async (req, res, next) => {
  try {
    const newProduct = await productService.createProduct(req.body);
    res.status(201).json({
      success: true,
      message: "Tạo sản phẩm thành công",
      data: newProduct,
    });
  } catch (error) {
    next(error);
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
