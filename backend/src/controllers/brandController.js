const brandService = require("../services/brandService");

exports.getAllBrands = async (req, res, next) => {
  try {
    const brands = await brandService.getAllBrands();
    res.json(brands);
  } catch (err) {
    next(err);
  }
};

exports.getBrandBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params;
    const brand = await brandService.getBrandBySlug(slug);
    if (!brand) {
      return res
        .status(404)
        .json({ status: "fail", message: "Brand not found" });
    }
    res.status(200).json({ status: "success", data: brand });
  } catch (err) {
    next(err);
  }
};
