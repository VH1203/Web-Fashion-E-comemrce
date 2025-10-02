const Category = require("../models/Category");
const Product = require("../models/Product");

// -------------------
// GET /api/products/categories
// -------------------
const getCategories = async (req, res, next) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (error) {
    console.error("getCategories error:", error);
    res.status(500).json({ message: error.message });
  }
};

// -------------------
// GET /api/products?tag=sale&category=nam&sort=created_at&limit=8
// -------------------
const getProducts = async (req, res, next) => {
  try {
    const { tag, category, sort, limit } = req.query;
    let filter = {};

    if (tag) {
      filter.tags = tag; // "sale", "new", "winter", "summer"
    }

    if (category) {
      const cat = await Category.findOne({ slug: category });
      if (cat) {
        filter.category_id = cat._id;
      }
    }

    let query = Product.find(filter);

    if (sort === "created_at") {
      query = query.sort({ created_at: -1 });
    }

    if (limit) {
      query = query.limit(parseInt(limit));
    }

    const products = await query.exec();
    res.json(products);
  } catch (error) {
    console.error("getProducts error:", error);
    res.status(500).json({ message: error.message });
  }
};

// -------------------
// Export
// -------------------
module.exports = {
  getCategories,
  getProducts,
};
