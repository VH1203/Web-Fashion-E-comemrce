const express = require('express');
const router = express.Router();
const homeController = require('../controllers/homeController');

router.get('/homepage', homeController.getHomepage);
router.get('/home/banners', homeController.getBanners);
router.get('/home/flash-sale', homeController.getFlashSale);
router.get('/home/categories', homeController.getCategories);
router.get('/home/root/:slug', homeController.getRootProducts);

module.exports = router;