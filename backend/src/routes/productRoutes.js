const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");

// GET /api/products/categories
router.get("/categories", productController.getCategories);

// GET /api/products
router.get("/", productController.getProducts);

module.exports = router;
