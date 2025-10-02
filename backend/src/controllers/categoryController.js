const Category = require("../models/Category");

async function getCategories(req, res, next) {
  try {
    const categories = await Category.find().exec();
    res.json(categories);
  } catch (err) {
    next(err);
  }
}

module.exports = { getCategories };
