// routes/shopRoutes.js
const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middlewares/authMiddleware");
const { requireShopAccess, requirePerm } = require("../middlewares/rbacMiddleware");
const ctrl = require("../controllers/shopController");

router.use(verifyToken, ...requireShopAccess());

router.get("/dashboard", ...requirePerm("shop:dashboard:view"), ctrl.dashboard);

router.post("/products", ...requirePerm("product:create"), ctrl.createProduct);
router.put("/products/:id", ...requirePerm("product:update"), ctrl.updateProduct);
router.delete("/products/:id", ...requirePerm("product:delete"), ctrl.deleteProduct);

module.exports = router;
