const productService = require("../services/productService");

exports.getByTag = async (req, res, next) => {
  try {
    const { tag } = req.params;
    const products = await productService.getByTag(tag);
    res.json(products);
  } catch (err) {
    next(err);
  }
};

exports.getNew = async (req, res, next) => {
  try {
    const products = await productService.getNewProducts();
    res.json(products);
  } catch (err) {
    next(err);
  }
};

exports.getByCategory = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const products = await productService.getByCategory(slug);
    res.json(products);
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
