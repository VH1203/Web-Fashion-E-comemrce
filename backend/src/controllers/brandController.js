const brandService = require("../services/brandService");

exports.getAllBrands = async (req, res, next) => {
  try {
    const brands = await brandService.getAllBrands();
    res.json(brands);
  } catch (err) {
    next(err);
  }
};
