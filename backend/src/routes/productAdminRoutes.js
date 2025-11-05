const express = require("express");
const { verifyToken } = require("../middlewares/authMiddleware");
const { requireShopAccess } = require("../middlewares/rbacMiddleware");
const ctrl = require("../controllers/productAdminController");
const { uploadImagesMw, uploadVideoMw, uploadAnySingle } = require("../middlewares/uploadMiddleware");

const router = express.Router();
router.use(verifyToken, ...requireShopAccess());

// Products
router.get("/products", ctrl.listProducts);
router.get("/products/:id", ctrl.getProduct);
router.post("/products", ctrl.createProduct);
router.put("/products/:id", ctrl.updateProduct);
router.delete("/products/:id", ctrl.deleteProduct);

// Variants
router.get("/products/:id/variants", ctrl.listVariants);
router.post("/products/:id/variants", ctrl.createVariant);
router.put("/variants/:variantId", ctrl.updateVariant);
router.delete("/variants/:variantId", ctrl.deleteVariant);
router.post("/products/:id/variants/bulk", ctrl.createVariantsBulk);

// Catalog
router.get("/categories", ctrl.listCategories);
router.post("/categories", ctrl.createCategory);
router.put("/categories/:id", ctrl.updateCategory);
router.delete("/categories/:id", ctrl.deleteCategory);
router.get("/categories/tree", ctrl.categoryTree);

router.get("/attributes", ctrl.listAttributes);
router.post("/attributes", ctrl.createAttribute);
router.put("/attributes/:id", ctrl.updateAttribute);
router.delete("/attributes/:id", ctrl.deleteAttribute);

router.get("/brands", ctrl.listBrands);
router.post("/brands", ctrl.createBrand);
router.put("/brands/:id", ctrl.updateBrand);
router.delete("/brands/:id", ctrl.deleteBrand);

// Media
router.post("/media/images", uploadImagesMw, ctrl.uploadImages);
router.post("/media/video",  uploadVideoMw,  ctrl.uploadVideo);

// Import Excel
router.post("/products/import", uploadAnySingle, ctrl.importExcel);

// Inventory alerts
router.get("/inventory/low-stock", ctrl.lowStock);

module.exports = router;
