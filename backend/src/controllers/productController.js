const Category = require("../models/Category");
const Product = require("../models/Product");

// alias để frontend gọi cũ vẫn chạy
const CATEGORY_ALIAS = { men: "men", women: "women" };
const TAG_ALIAS = { "flash-sale": "sale" };

const isUuid = (v) => /^[0-9a-fA-F-]{36}$/.test(v);

// Lấy toàn bộ _id các danh mục con (bao gồm cả chính nó)
async function getDescendantCategoryIds(rootId) {
  const cats = await Category.find({}, { _id: 1, parent_id: 1 });
  const childrenMap = new Map();
  for (const c of cats) {
    const list = childrenMap.get(c.parent_id) || [];
    list.push(c);
    childrenMap.set(c.parent_id, list);
  }
  const result = new Set([rootId]);
  const queue = [rootId];
  while (queue.length) {
    const cur = queue.shift();
    const children = childrenMap.get(cur) || [];
    for (const ch of children) {
      if (!result.has(ch._id)) {
        result.add(ch._id);
        queue.push(ch._id);
      }
    }
  }
  return Array.from(result);
}

// -------------------
// GET /api/products/categories
// -------------------
const getCategories = async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (error) {
    console.error("getCategories error:", error);
    res.status(500).json({ message: error.message });
  }
};

// -------------------
// GET /api/products?tag=sale&category=men&sort=created_at&limit=8
// -------------------
const getProducts = async (req, res) => {
  try {
    let { tag, category, sort, limit } = req.query;
    let filter = {};

    // alias tag
    if (tag) {
      tag = TAG_ALIAS[tag] || tag;
      filter.tags = tag;
    }

    // filter category (slug hoặc _id)
    if (category) {
      category = CATEGORY_ALIAS[category] || category;

      let catDoc = null;
      if (isUuid(category)) {
        catDoc = await Category.findById(category);
      } else {
        catDoc = await Category.findOne({ slug: category });
      }

      if (!catDoc) return res.json([]);

      const ids = await getDescendantCategoryIds(catDoc._id);
      filter.category_id = { $in: ids };
    }

    let query = Product.find(filter);

    // sort
    if (sort === "created_at") query = query.sort({ created_at: -1 });

    // limit
    if (limit) {
      const n = parseInt(limit, 10);
      if (!Number.isNaN(n)) query = query.limit(n);
    }

    const products = await query.exec();
    res.json(products);
  } catch (error) {
    console.error("getProducts error:", error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getCategories, getProducts };
