const Brand = require("../models/Brand");

exports.getAllBrands = async () => {
  return await Brand.find({ is_active: true })
    .sort({ name: 1 })
    .select("_id name slug logo_url country gender");
};
