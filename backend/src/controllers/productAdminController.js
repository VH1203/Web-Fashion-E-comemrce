const svc = require("../services/productAdminService");
const categorySvc = require("../services/categoryService");

/* Products */
exports.listProducts = async (req, res, next) => {
    try {
        const shopId = req.user._id;
        const data = await svc.listProducts({ shopId, ...req.query });
        res.json({ success: true, data });
    } catch (e) { next(e); }
};
exports.getProduct = async (req, res, next) => {
    try {
        const doc = await svc.getProduct(req.params.id, req.user._id);
        if (!doc) return res.status(404).json({ message: "Not found" });
        res.json({ success: true, data: doc });
    } catch (e) { next(e); }
};
exports.createProduct = async (req, res, next) => {
    try { res.json({ success: true, data: await svc.createProduct(req.body, req.user._id) }); }
    catch (e) { next(e); }
};
exports.updateProduct = async (req, res, next) => {
    try { res.json({ success: true, data: await svc.updateProduct(req.params.id, req.body, req.user._id) }); }
    catch (e) { next(e); }
};
exports.deleteProduct = async (req, res, next) => {
    try { res.json({ success: true, data: await svc.deleteProduct(req.params.id, req.user._id) }); }
    catch (e) { next(e); }
};

/* Variants */
exports.listVariants = async (req, res, next) => {
    try { res.json({ success: true, data: await svc.listVariants(req.params.id, req.user._id) }); }
    catch (e) { next(e); }
};
exports.createVariant = async (req, res, next) => {
    try { res.json({ success: true, data: await svc.createVariant(req.params.id, req.body, req.user._id) }); }
    catch (e) { next(e); }
};
exports.updateVariant = async (req, res, next) => {
    try { res.json({ success: true, data: await svc.updateVariant(req.params.variantId, req.body, req.user._id) }); }
    catch (e) { next(e); }
};
exports.deleteVariant = async (req, res, next) => {
    try { res.json({ success: true, data: await svc.deleteVariant(req.params.variantId, req.user._id) }); }
    catch (e) { next(e); }
};

/* Catalog */
exports.listCategories = async (req, res, next) => { try { res.json({ success: true, data: await svc.listCategories() }); } catch (e) { next(e); } };
exports.listAttributes = async (req, res, next) => { try { res.json({ success: true, data: await svc.listAttributes() }); } catch (e) { next(e); } };
exports.listBrands = async (req, res, next) => { try { res.json({ success: true, data: await svc.listBrands() }); } catch (e) { next(e); } };
exports.createCategory = async (req, res, next) => { try { res.json({ success: true, data: await svc.createCategory(req.body) }); } catch (e) { next(e); } };
exports.updateCategory = async (req, res, next) => { try { res.json({ success: true, data: await svc.updateCategory(req.params.id, req.body) }); } catch (e) { next(e); } };
exports.deleteCategory = async (req, res, next) => { try { res.json({ success: true, data: await svc.deleteCategory(req.params.id) }); } catch (e) { next(e); } };
exports.createAttribute = async (req, res, next) => { try { res.json({ success: true, data: await svc.createAttribute(req.body) }); } catch (e) { next(e); } };
exports.updateAttribute = async (req, res, next) => { try { res.json({ success: true, data: await svc.updateAttribute(req.params.id, req.body) }); } catch (e) { next(e); } };
exports.deleteAttribute = async (req, res, next) => { try { res.json({ success: true, data: await svc.deleteAttribute(req.params.id) }); } catch (e) { next(e); } };
exports.createBrand = async (req, res, next) => { try { res.json({ success: true, data: await svc.createBrand(req.body) }); } catch (e) { next(e); } };
exports.updateBrand = async (req, res, next) => { try { res.json({ success: true, data: await svc.updateBrand(req.params.id, req.body) }); } catch (e) { next(e); } };
exports.deleteBrand = async (req, res, next) => { try { res.json({ success: true, data: await svc.deleteBrand(req.params.id) }); } catch (e) { next(e); } };

/* Media */
exports.uploadImages = async (req, res, next) => {
    try { res.json({ success: true, data: await svc.uploadImages(req.files || [], req.user._id) }); }
    catch (e) { next(e); }
};
exports.uploadVideo = async (req, res, next) => {
    try {
        if (!req.file) return res.status(400).json({ message: "Missing video" });
        res.json({ success: true, data: await svc.uploadVideo(req.file, req.user._id) });
    }
    catch (e) { next(e); }
};

/* Import */
exports.importExcel = async (req, res, next) => {
    try {
        if (!req.file) return res.status(400).json({ message: "Missing file" });
        res.json({ success: true, data: await svc.importExcel(req.file.buffer, req.user._id) });
    }
    catch (e) { next(e); }
};

/* Inventory */
exports.lowStock = async (req, res, next) => {
    try {
        const threshold = Number(req.query.threshold || 5);
        res.json({ success: true, data: await svc.lowStock(req.user._id, threshold) });
    }
    catch (e) { next(e); }
};
exports.categoryTree = async (req, res, next) => {
  try { const depth = Number(req.query.depth || 3);
        res.json({ success: true, data: await categorySvc.getTree(depth) }); }
  catch (e) { next(e); }
};

// Tạo biến thể hàng loạt (ma trận)
exports.createVariantsBulk = async (req, res, next) => {
  try { const { rows } = req.body; // [{ sku, price, stock, variant_attributes }]
        res.json({ success: true, data: await svc.createVariantsBulk(req.params.id, rows, req.user._id) }); }
  catch (e) { next(e); }
};
