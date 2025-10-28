const express = require("express");
const router = express.Router();
const productController = require("../controllers/productController");

router.get("/tag/:tag", productController.getByTag);
router.get("/new", productController.getNew);
router.get("/category/:slug", productController.getByCategory);

module.exports = router;
