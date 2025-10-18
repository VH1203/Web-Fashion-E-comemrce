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
