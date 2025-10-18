const Category = require("../models/Category");

exports.getAllCategories = async () => {
  return await Category.find({ is_active: true })
    .sort({ name: 1 })
    .select("_id name slug image_url parent_id");
};
