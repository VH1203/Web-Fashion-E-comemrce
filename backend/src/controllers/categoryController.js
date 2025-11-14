const categoryService = require("../services/categoryService");

exports.getAllCategories = async (req, res, next) => {
  try {
    const categories = await categoryService.getAll();
    res.status(200).json({
      status: "success",
      data: categories,
    });
  } catch (err) {
    next(err);
  }
};

exports.getCategoryBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const category = await categoryService.getCategoryBySlug(slug);
    if (!category) {
      return res
        .status(404)
        .json({ status: "fail", message: "Category not found" });
    }
    res.status(200).json({ status: "success", data: category });
  } catch (err) {
    next(err);
  }
};
