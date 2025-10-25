const Banner = require('../models/Banner');
const FlashSale = require('../models/FlashSale');
const Category = require('../models/Category');
const Product = require('../models/Product');

async function getActiveBanners() {
    const now = new Date();
    const query = {
        is_active: true,
        $and: [
            { $or: [{ start_date: { $lte: now } }, { start_date: { $exists: false } }] },
            { $or: [{ end_date: { $gte: now } }, { end_date: { $exists: false } }] },
        ],
        position: { $in: ['homepage_top', 'homepage_mid', 'homepage_bottom'] },
    };
    const banners = await Banner.find(query)
        .sort({ position: 1, createdAt: -1 })
        .lean();
    const grouped = {
        homepage_top: [],
        homepage_mid: [],
        homepage_bottom: [],
    };
    for (const b of banners) grouped[b.position]?.push(b);
    return grouped;
}

async function getActiveFlashSale(limitItems = 20) {
    const now = new Date();
    const fs = await FlashSale.findOne({
        status: 'active',
        start_time: { $lte: now },
        end_time: { $gte: now },
    })
        .sort({ start_time: 1 })
        .lean();


    if (!fs) return null;


    // Enrich with product data
    const productIds = fs.products.map((p) => p.product_id);
    const products = await Product.find({ _id: { $in: productIds }, status: 'active' })
        .select('_id name images base_price currency rating_avg sold_count brand_id category_id')
        .lean();
    const prodMap = new Map(products.map((p) => [p._id, p]));


    const items = fs.products
        .slice(0, limitItems)
        .map((item) => ({
            ...item,
            product: prodMap.get(item.product_id) || null,
            discount_percent: Math.max(
                0,
                Math.round((1 - item.flash_price / (item.original_price || item.flash_price)) * 100)
            ),
            remaining: Math.max(0, (item.quantity_total || 0) - (item.quantity_sold || 0)),
        }));


    return { ...fs, items };
}

async function getCategoryTree() {
    const parents = await Category.find({ parent_id: null, is_active: true })
        .sort({ name: 1 })
        .lean();
    const parentIds = parents.map((p) => p._id);
    const children = await Category.find({ parent_id: { $in: parentIds }, is_active: true })
        .sort({ name: 1 })
        .lean();
    const childMap = children.reduce((acc, c) => {
        acc[c.parent_id] = acc[c.parent_id] || [];
        acc[c.parent_id].push(c);
        return acc;
    }, {});
    return parents.map((p) => ({ ...p, children: childMap[p._id] || [] }));
}

async function getProductsByRootSlug(rootSlug, limit = 12) {
    const root = await Category.findOne({ slug: rootSlug, is_active: true }).lean();
    if (!root) return [];
    // find all descendant category ids using path array (contains ancestor ids)
    const descendants = await Category.find({ $or: [{ _id: root._id }, { path: root._id }] })
        .select('_id')
        .lean();
    const catIds = descendants.map((c) => c._id);
    const products = await Product.find({ category_id: { $in: catIds }, status: 'active' })
        .sort({ is_featured: -1, sold_count: -1, createdAt: -1 })
        .limit(limit)
        .select('_id name images base_price currency rating_avg sold_count category_id brand_id')
        .lean();
    return products;
}

async function getHomepageData() {
    const [banners, flashSale, categories, men, women] = await Promise.all([
        getActiveBanners(),
        getActiveFlashSale(20),
        getCategoryTree(),
        getProductsByRootSlug('men', 12),
        getProductsByRootSlug('women', 12),
    ]);
    return { banners, flashSale, categories, men, women };
}


module.exports = {
    getActiveBanners,
    getActiveFlashSale,
    getCategoryTree,
    getProductsByRootSlug,
    getHomepageData,
};