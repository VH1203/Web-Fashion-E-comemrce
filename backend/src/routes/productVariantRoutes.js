const express = require('express');
const router = express.Router();
const productVariantController = require('../controllers/productVariantController');

router.post("/", productVariantController.getVariantsByProduct);

module.exports = router;