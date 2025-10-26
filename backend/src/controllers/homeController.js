const homeService = require('../services/homeService');

exports.getHomepage = async (req, res, next) => {
    try {
        const data = await homeService.getHomepageData();
        return res.status(200).json({ status: 'success', data });
    } catch (err) {
        next(err);
    }
};


exports.getBanners = async (req, res, next) => {
    try {
        const data = await homeService.getActiveBanners();
        return res.status(200).json({ status: 'success', data });
    } catch (err) {
        next(err);
    }
};


exports.getFlashSale = async (req, res, next) => {
    try {
        const data = await homeService.getActiveFlashSale();
        return res.status(200).json({ status: 'success', data });
    } catch (err) {
        next(err);
    }
};


exports.getCategories = async (req, res, next) => {
    try {
        const data = await homeService.getCategoryTree();
        return res.status(200).json({ status: 'success', data });
    } catch (err) {
        next(err);
    }
};


exports.getRootProducts = async (req, res, next) => {
    try {
        const { slug } = req.params;
        const { limit } = req.query;
        const data = await homeService.getProductsByRootSlug(slug, Number(limit) || 12);
        return res.status(200).json({ status: 'success', data });
    } catch (err) {
        next(err);
    }
};