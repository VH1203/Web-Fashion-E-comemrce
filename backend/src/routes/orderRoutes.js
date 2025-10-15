// orderRoutes.js 
const express = require("express");
const orderController = require("../controllers/orderController");

const router = express.Router();
router.get("/revenue-by-category", orderController.getRevenueByCategoryController);

module.exports = router;