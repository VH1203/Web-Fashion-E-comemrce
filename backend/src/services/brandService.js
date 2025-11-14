const Brand = require("../models/Brand");

exports.getBrandBySlug = async function (slug) {
  return Brand.findOne({ slug }).select("name slug").lean();
};
