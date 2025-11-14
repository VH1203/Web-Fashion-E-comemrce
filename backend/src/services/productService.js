// backend/src/services/productService.js
const Product = require("../models/Product");
const Category = require("../models/Category");
const Brand = require("../models/Brand");
const FlashSale = require("../models/FlashSale");
const ProductVariant = require("../models/ProductVariant");
let Review;
try {
  Review = require("../models/Review");
} catch (_) {}
const Attribute = require("../models/Attribute");
const ProductSizeChart = require("../models/ProductSizeChart");
const slugify = require("slugify");

async function findProductByIdOrSlug(idOrSlug) {
  return Product.findOne({
    $or: [{ _id: idOrSlug }, { slug: idOrSlug }],
  }).lean();
}

async function getFlashSaleItemForProduct(productId) {
  const now = new Date();
  const fs = await FlashSale.findOne({
    status: "active",
    start_time: { $lte: now },
    end_time: { $gte: now },
    "products.product_id": productId,
  }).lean();
  if (!fs) return null;
  const item = fs.products.find(
    (x) => String(x.product_id) === String(productId)
  );
  if (!item) return null;
  const discount_percent = Math.max(
    0,
    Math.round(
      (1 - item.flash_price / (item.original_price || item.flash_price)) * 100
    )
  );
  return {
    flash_sale_id: fs._id,
    start_time: fs.start_time,
    end_time: fs.end_time,
    ...item,
    discount_percent,
    remaining: Math.max(
      0,
      (item.quantity_total || 0) - (item.quantity_sold || 0)
    ),
  };
}

function toUrl(x) {
  if (!x) return "";
  if (typeof x === "string") return x;
  return x.url || x.secure_url || x.path || "";
}

function normalizeImageUrls(arr) {
  const a = Array.isArray(arr) ? arr : [];
  return a
    .map(toUrl)
    .map((s) => String(s).trim())
    .filter(Boolean);
}

function readVarAttrs(va) {
  if (!va) return {};
  if (va instanceof Map) return Object.fromEntries(va);
  return typeof va === "object" ? va : {};
}

function chooseGender(category) {
  const g = (category?.gender_hint || "").toLowerCase();
  return ["men", "women", "unisex"].includes(g) ? g : "unisex";
}

async function getProductDetail(idOrSlug) {
  const prodDoc = await findProductByIdOrSlug(idOrSlug);
  if (!prodDoc) return null;

  const variantsRaw = await ProductVariant.find({
    product_id: prodDoc._id,
    is_active: true,
  })
    .select(
      "_id product_id sku barcode variant_attributes price compare_at_price currency stock images is_active"
    )
    .sort({ price: 1 })
    .lean();

  const [brand, category, flashItem] = await Promise.all([
    prodDoc.brand_id
      ? Brand.findById(prodDoc.brand_id)
          .select("_id name slug logo_url logo_public_id")
          .lean()
      : null,
    prodDoc.category_id
      ? Category.findById(prodDoc.category_id)
          .select("_id name slug parent_id gender_hint")
          .lean()
      : null,
    getFlashSaleItemForProduct(prodDoc._id),
  ]);

  // ===== Size chart: try (brand_id, category_id, gender) → (null, category_id, gender)
  let sizeChart = null;
  if (category?._id) {
    const gender = chooseGender(category);
    sizeChart =
      (await ProductSizeChart.findOne({
        brand_id: prodDoc.brand_id || null,
        category_id: category._id,
        gender,
      }).lean()) ||
      (await ProductSizeChart.findOne({
        brand_id: null,
        category_id: category._id,
        gender,
      }).lean()) ||
      null;
  }

  // price range
  let price_min = prodDoc.base_price;
  let price_max = prodDoc.base_price;
  if (variantsRaw?.length) {
    price_min = Math.min(...variantsRaw.map((v) => v.price));
    price_max = Math.max(...variantsRaw.map((v) => v.price));
  }

  // variant keys
  const variantKeys = Array.from(
    new Set(
      variantsRaw.flatMap((v) =>
        Object.keys(readVarAttrs(v.variant_attributes))
      )
    )
  );

  // options master from Attribute
  let variant_options = {};
  if (variantKeys.length) {
    const attrs = await Attribute.find({
      code: { $in: variantKeys },
      is_active: true,
    })
      .select("code values display_order")
      .lean();
    for (const a of attrs) {
      if (Array.isArray(a.values) && a.values.length) {
        variant_options[a.code] = a.values.map(String);
      }
    }
  }

  // product + variants normalize
  const product = {
    ...prodDoc,
    price_min,
    price_max,
    images: normalizeImageUrls(prodDoc.images),
  };

  const variants = (variantsRaw || []).map((v) => ({
    ...v,
    images: normalizeImageUrls(v.images),
    variant_attributes: readVarAttrs(v.variant_attributes),
  }));

  return {
    product,
    variants,
    brand,
    category,
    flash_sale: flashItem,
    variant_options,
    size_chart: sizeChart, // 👈 FE dùng để gợi ý size
  };
}

async function getProductReviews(idOrSlug, page = 1, limit = 10) {
  if (!Review) return { total: 0, items: [] };
  const prod = await findProductByIdOrSlug(idOrSlug);
  if (!prod) return { total: 0, items: [] };

  const query = { product_id: prod._id, status: "visible" };
  const [total, items] = await Promise.all([
    Review.countDocuments(query),
    Review.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean(),
  ]);
  return { total, items };
}

async function getRatingsSummary(idOrSlug) {
  if (!Review)
    return {
      average: 0,
      count: 0,
      histogram: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    };
  const prod = await findProductByIdOrSlug(idOrSlug);
  if (!prod)
    return {
      average: 0,
      count: 0,
      histogram: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 },
    };

  const rows = await Review.aggregate([
    { $match: { product_id: prod._id, status: "approved" } },
    { $group: { _id: "$rating", c: { $sum: 1 } } },
  ]);

  const hist = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
  let total = 0,
    sum = 0;
  for (const r of rows) {
    const star = Math.max(1, Math.min(5, Number(r._id) || 0));
    hist[star] = r.c;
    total += r.c;
    sum += star * r.c;
  }
  const average = total ? +(sum / total).toFixed(2) : 0;
  return { average, count: total, histogram: hist };
}

async function getRelated(idOrSlug, limit = 12) {
  const prod = await Product.findOne({
    $or: [{ _id: idOrSlug }, { slug: idOrSlug }],
  })
    .select("_id category_id")
    .lean();
  if (!prod || !prod.category_id) return [];

  const relatedRaw = await Product.find({
    status: "active",
    category_id: prod.category_id,
    _id: { $ne: prod._id },
  })
    .select(
      "_id name slug images base_price currency rating_avg sold_count is_featured"
    )
    .sort({ is_featured: -1, sold_count: -1, createdAt: -1 })
    .limit(limit)
    .lean();

  return relatedRaw.map((r) => ({
    ...r,
    images: normalizeImageUrls(r.images),
  }));
}

async function getAllproductsofShop() {
  try {
    const products = await Product.find().sort({ createdAt: -1 }).lean();
    console.log(`✅ Found ${products.length} products of Shop`);
    return products;
  } catch (err) {
    console.error("🔥 Lỗi Mongo khi find Product:", err);
    return [];
  }
}

async function searchProducts(keyword) {
  try {
    if (!keyword) {
      return [];
    }

    const products = await Product.find(
      { $text: { $search: keyword } },
      { score: { $meta: "textScore" } }
    )
      .sort({ score: { $meta: "textScore" } })
      .limit(10)
      .select("_id name slug images base_price currency")
      .lean();

    return products.map((p) => ({
      ...p,
      images: normalizeImageUrls(p.images),
    }));
  } catch (err) {
    console.error("Error searching products by name:", err);
    throw new Error("Error searching products");
  }
}

async function updateProduct(id, data) {
  const { variants, ...productData } = data;
  try {
    // Step 1: Update the main product document
    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      { $set: productData },
      { new: true }
    );
    if (!updatedProduct) {
      throw new Error("Không tìm thấy sản phẩm");
    }

    if (variants) {
      // Step 2: Get existing variants from DB
      const existingVariants = await ProductVariant.find({ product_id: id });
      const existingVariantIds = existingVariants.map((v) => v._id.toString());
      const incomingVariantIds = variants
        .map((v) => v._id)
        .filter((vid) => vid);

      // Step 3: Identify variants to delete
      const variantsToDelete = existingVariantIds.filter(
        (vid) => !incomingVariantIds.includes(vid)
      );
      if (variantsToDelete.length > 0) {
        await ProductVariant.deleteMany({ _id: { $in: variantsToDelete } });
      }

      // Step 4: Identify variants to update or create
      const variantsToUpsert = variants.map((variant) => {
        if (variant._id) {
          // Update existing variant
          return {
            updateOne: {
              filter: { _id: variant._id, product_id: id },
              update: { $set: variant },
            },
          };
        } else {
          // Create new variant
          return {
            insertOne: {
              document: { ...variant, product_id: id },
            },
          };
        }
      });

      if (variantsToUpsert.length > 0) {
        await ProductVariant.bulkWrite(variantsToUpsert);
      }
    }

    return updatedProduct;
  } catch (error) {
    console.error("Lỗi khi cập nhật sản phẩm:", error);
    throw error;
  }
}

async function deleteProductById(id) {
  try {
    const product = await Product.findById(id);
    if (!product) throw new Error("Không tìm thấy sản phẩm");
    await Product.findByIdAndDelete(id);
    return { success: true, message: "Xóa sản phẩm thành công" };
  } catch (error) {
    console.error("Lỗi khi xóa sản phẩm:", error);
    throw error;
  }
}

async function getProducts(options = {}) {
  const {
    page = 1,
    limit = 12,
    sortBy = "createdAt",
    sortOrder = "desc",
    filters = {},
  } = options;

  const query = { status: "active" };

  if (filters.category_slug) {
    const category = await Category.findOne({ slug: filters.category_slug })
      .select("_id")
      .lean();
    if (category) {
      query.category_id = category._id;
    } else {
      // If category slug is invalid, return no products
      return {
        docs: [],
        totalDocs: 0,
        limit,
        totalPages: 0,
        page,
        pagingCounter: 1,
        hasPrevPage: false,
        hasNextPage: false,
        prevPage: null,
        nextPage: null,
      };
    }
  }

  if (filters.brand_slug) {
    const brand = await Brand.findOne({ slug: filters.brand_slug })
      .select("_id")
      .lean();
    if (brand) {
      query.brand_id = brand._id;
    } else {
      // If brand slug is invalid, return no products
      return {
        docs: [],
        totalDocs: 0,
        limit,
        totalPages: 0,
        page,
        pagingCounter: 1,
        hasPrevPage: false,
        hasNextPage: false,
        prevPage: null,
        nextPage: null,
      };
    }
  }

  if (filters.status) {
    query.status = filters.status;
  }
  if (filters.is_featured) {
    query.is_featured = filters.is_featured === "true";
  }
  if (filters.category_id) {
    query.category_id = filters.category_id;
  }
  if (filters.brand_id) {
    query.brand_id = filters.brand_id;
  }
  if (filters.shop_id) {
    query.shop_id = filters.shop_id;
  }
  if (filters.q) {
    query.$text = { $search: filters.q };
  }

  const sort = { [sortBy]: sortOrder === "asc" ? 1 : -1 };

  try {
    const products = await Product.find(query)
      .populate("category_id", "name")
      .populate("brand_id", "name")
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(limit)
      .lean({ virtuals: true });

    const totalDocs = await Product.countDocuments(query);
    const totalPages = Math.ceil(totalDocs / limit);

    // Fetch variants for all returned products in one query
    const productIds = products.map((p) => p._id).filter(Boolean);
    let variantsByProduct = {};
    if (productIds.length) {
      const variantsRaw = await ProductVariant.find({
        product_id: { $in: productIds },
        is_active: true,
      })
        .select(
          "_id product_id sku barcode variant_attributes price compare_at_price currency stock images is_active"
        )
        .sort({ price: 1 })
        .lean();

      variantsByProduct = variantsRaw.reduce((acc, v) => {
        const pid = v.product_id;
        if (!acc[pid]) acc[pid] = [];
        acc[pid].push({
          ...v,
          images: normalizeImageUrls(v.images),
          variant_attributes: readVarAttrs(v.variant_attributes),
        });
        return acc;
      }, {});
    }

    return {
      docs: products.map((p) => ({
        ...p,
        images: normalizeImageUrls(p.images),
        variants: variantsByProduct[p._id] || [],
      })),
      totalDocs,
      limit,
      totalPages,
      page,
      pagingCounter: (page - 1) * limit + 1,
      hasPrevPage: page > 1,
      hasNextPage: page < totalPages,
      prevPage: page > 1 ? page - 1 : null,
      nextPage: page < totalPages ? page + 1 : null,
    };
  } catch (error) {
    console.error("Error fetching products:", error);
    throw new Error("Could not fetch products");
  }
}

async function createProduct(data) {
  const { variants, ...productData } = data;

  // Basic validation
  const requiredFields = ["name", "category_id"];
  for (const field of requiredFields) {
    if (!productData[field]) {
      throw new Error(
        `Please provide all required fields: name, base_price, stock_total, category_id`
      );
    }
  }
  if (productData.base_price === undefined || productData.base_price === null) {
    throw new Error(
      `Please provide all required fields: name, base_price, stock_total, category_id`
    );
  }
  if (
    productData.stock_total === undefined ||
    productData.stock_total === null
  ) {
    throw new Error(
      `Please provide all required fields: name, base_price, stock_total, category_id`
    );
  }

  try {
    const slug = slugify(productData.name, { lower: true, strict: true });
    const newProduct = new Product({
      ...productData,
      slug,
    });
    await newProduct.save();

    if (variants && variants.length > 0) {
      const variantsToCreate = variants.map((variant) => ({
        ...variant,
        product_id: newProduct._id,
      }));
      await ProductVariant.insertMany(variantsToCreate);
    }

    return newProduct;
  } catch (error) {
    console.error("Lỗi khi tạo sản phẩm:", error);
    if (error.code === 11000 && error.keyPattern && error.keyPattern.slug) {
      throw new Error("A product with this name already exists.");
    }
    // If product creation fails, we don't have variants to clean up.
    // If variant creation fails, the product is already created.
    // This is the trade-off for not using transactions.
    throw error;
  }
}

module.exports = {
  getProductDetail,
  getProductReviews,
  getRatingsSummary,
  getRelated,
  getAllproductsofShop,
  searchProductsByName: searchProducts,
  updateProduct,
  deleteProductById,
  getProducts,
  createProduct,
};
