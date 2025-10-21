const Product = require("../models/Product");
const Category = require("../models/Category");

/**
 * Lấy sản phẩm theo tag (ví dụ: "flash-sale")
 */
exports.getByTag = async (tag) => {
  try {
    const products = await Product.find({ tags: tag, status: "active" })
      .sort({ createdAt: -1 })
      .limit(10)
      .select("_id name base_price images sold_count tags");

    console.log(`✅ Found ${products.length} products by tag: ${tag}`);
    return products;
  } catch (err) {
    console.error("❌ getByTag error:", err);
    return [];
  }
};

/**
 * Lấy sản phẩm mới nhất
 */
exports.getNewProducts = async () => {
  try {
    const products = await Product.find({ status: "active" })
      .sort({ createdAt: -1 })
      .limit(10)
      .select("_id name base_price images sold_count tags");

    console.log(`✅ Found ${products.length} new products`);
    return products;
  } catch (err) {
    console.error("❌ getNewProducts error:", err);
    return [];
  }
};

exports.getByCategory = async (categorySlug) => {
  try {
    // 1️⃣ Tìm category gốc theo slug
    const root = await Category.findOne({ slug: categorySlug }).lean();
    if (!root) {
      console.warn(`⚠️ Không tìm thấy category slug: ${categorySlug}`);
      return [];
    }

    // 2️⃣ Lấy toàn bộ category
    const allCategories = await Category.find({ is_active: true }).lean();

    // 3️⃣ Chuẩn hóa ID và parent_id sang string
    const normalized = allCategories.map(c => ({
      _id: String(c._id).trim(),
      parent_id: c.parent_id ? String(c.parent_id).trim() : null,
    }));

    // 4️⃣ Hàm đệ quy lấy toàn bộ ID con/cháu
    const collectChildren = (parentId) => {
      const pid = String(parentId).trim();
      const children = normalized.filter(c => c.parent_id === pid);
      let ids = [];
      for (const child of children) {
        ids.push(child._id);
        ids = ids.concat(collectChildren(child._id));
      }
      return ids;
    };

    const childIds = collectChildren(String(root._id).trim());
    const categoryIds = [String(root._id).trim(), ...childIds];

    console.log("🔍 Root:", root._id);
    console.log("🔍 Category IDs:", categoryIds);

    // 5️⃣ Lấy sản phẩm thuộc tất cả các danh mục này
    let products = await Product.find({
      status: "active",
      category_id: { $in: categoryIds },
    })
      .sort({ createdAt: -1 })
      .limit(20)
      .select("_id name base_price images sold_count tags category_id");

    // 6️⃣ Nếu vẫn không có sản phẩm, fallback regex (đảm bảo luôn ra)
    if (products.length === 0) {
      const prefix = `cat-${categorySlug}`;
      console.log(`⚙️ Fallback regex: ^${prefix}`);
      products = await Product.find({
        status: "active",
        category_id: new RegExp(`^${prefix}`, "i"),
      })
        .sort({ createdAt: -1 })
        .limit(20)
        .select("_id name base_price images sold_count tags category_id");
    }

    console.log(`✅ Found ${products.length} products in category: ${categorySlug}`);
    return products;
  } catch (err) {
    console.error("❌ getByCategory error:", err);
    return [];
  }
};

// get all products của role Shop 
exports.getAllproductsofShop = async() =>{
try{
const products = await Product.find().sort({ createdAt: -1 }).lean();
console.log(` Found ${products.length} products of Shop`);
return products;

}catch(err){
   console.error("🔥 Lỗi Mongo khi find Product:", error);
  console.error(" getAllproductsofShop error:", err);
  return [];
};      
};
