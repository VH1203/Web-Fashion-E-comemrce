const Banner = require("../models/Banner");
const Brand = require("../models/Brand");
const Category = require("../models/Category");
const Product = require("../models/Product");

exports.getHomepageData = async (categoryId = null) => {
  try {
    const now = new Date();

    // =========================================================
    // 1️⃣ Lấy Banner còn hiệu lực (hiển thị trang chủ)
    // =========================================================
    const banners = await Banner.find({
      is_active: true,
      start_date: { $lte: now },
      $or: [{ end_date: null }, { end_date: { $gte: now } }],
    })
      .sort({ createdAt: -1 })
      .limit(5)
      .lean();

    // =========================================================
    // 2️⃣ Lấy danh sách Brand & Category cha
    // =========================================================
    const [brands, categories] = await Promise.all([
      Brand.find({ is_active: true }).sort({ createdAt: -1 }).limit(10).lean(),
      Category.find({ is_active: true, level: 0 }).sort({ name: 1 }).lean(),
    ]);

    // =========================================================
    // 3️⃣ Chuẩn bị điều kiện lọc Product
    // =========================================================
    const productFilter = {
      status: "active",
      stock_total: { $gt: 0 },
    };

    // Nếu có categoryId được truyền vào
    if (categoryId && categoryId !== "0") {
      const selectedCategory = await Category.findById(categoryId).lean();

      if (selectedCategory) {
        if (selectedCategory.level === 0) {
          // 🔹 Nếu là CHA → lấy tất cả sản phẩm của nó + các category con
          const childCategories = await Category.find({
            parent_id: selectedCategory._id,
          })
            .select("_id")
            .lean();

          const categoryIds = [
            selectedCategory._id,
            ...childCategories.map((c) => c._id),
          ];

          productFilter.category_id = { $in: categoryIds };
        } else {
          // 🔹 Nếu là CON → chỉ lấy sản phẩm chính nó
          productFilter.category_id = selectedCategory._id;
        }
      }
    }

    // =========================================================
    // 4️⃣ Lấy danh sách Product và tổng số lượng
    // =========================================================
    const [products, total_products] = await Promise.all([
      Product.find(productFilter)
        .sort({ createdAt: -1 })
        .limit(12)
        .lean(),
      Product.countDocuments(productFilter),
    ]);

    // =========================================================
    // 5️⃣ Trả kết quả ra cho Controller
    // =========================================================
    return {
      success: true,
      message: "Homepage data fetched successfully",
      data: {
        banners,
        brands,
        categories,
        products,
        total_products,
      },
    };
  } catch (err) {
    console.error("❌ Error in getHomepageData service:", err);
    throw new Error("Failed to load homepage data");
  }
};
