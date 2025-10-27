const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');




router.get('/:idOrSlug', productController.getDetail);
router.get('/:idOrSlug/reviews', productController.getReviews);
router.get('/:idOrSlug/ratings-summary', productController.getRatingsSummary);
router.get('/:idOrSlug/related', productController.getRelated);

router.get("/all-products", productController.getAllProducts);


module.exports = router;