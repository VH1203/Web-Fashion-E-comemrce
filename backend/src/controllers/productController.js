const Category = require("../models/Category");
const Product = require("../models/Product");

const CATEGORY_ALIAS = { men: "nam", women: "nữ" };
const TAG_ALIAS = { "flash-sale": "sale" };
const isUuid = (v) => /^[0-9a-fA-F-]{36}$/.test(v);

async function getCategories(req, res, next) {
  try {
    const categories = await Category.find().lean();
    res.json(categories);
  } catch (err) {
    next(err);
  }
}

async function getDescendantCategoryIds(rootId) {
  const cats = await Category.find({}, { _id: 1, parent_id: 1 });
  const map = new Map();
  for (const c of cats) {
    const list = map.get(c.parent_id) || [];
    list.push(c);
    map.set(c.parent_id, list);
  }

  const result = new Set([rootId]);
  const queue = [rootId];
  while (queue.length) {
    const cur = queue.shift();
    const children = map.get(cur) || [];
    for (const ch of children) {
      if (!result.has(ch._id)) {
        result.add(ch._id);
        queue.push(ch._id);
      }
    }
  }
  return Array.from(result);
}

async function getProducts(req, res, next) {
  try {
    let { tag, category, sort = "created_at", limit, page = 1 } = req.query;
    const filter = {};

    // alias tag
    if (tag) {
      tag = TAG_ALIAS[tag] || tag;
      filter.tags = tag;
    }

    // category
    if (category) {
      const alias = CATEGORY_ALIAS[category] || category;
      const cat =
        isUuid(alias)
          ? await Category.findById(alias)
          : await Category.findOne({ slug: alias });

      if (cat) {
        const ids = await getDescendantCategoryIds(cat._id);
        filter.category_id = { $in: ids };
      }
    }

    let query = Product.find(filter);

    if (sort === "created_at") query = query.sort({ created_at: -1 });
    const perPage = parseInt(limit || 12);
    const skip = (parseInt(page) - 1) * perPage;

    const [total, products] = await Promise.all([
      Product.countDocuments(filter),
      query.skip(skip).limit(perPage).lean(),
    ]);

    res.json({ total, products });
  } catch (err) {
    next(err);
  }
}

// ✅ Lấy chi tiết sản phẩm
async function getProductDetail(req, res, next) {
  try {
    const p = await Product.findById(req.params.id).lean();
    if (!p) return res.status(404).json({ message: "Không tìm thấy sản phẩm" });
    res.json(p);
  } catch (err) {
    next(err);
  }
}

module.exports = { getCategories, getProducts, getProductDetail };
