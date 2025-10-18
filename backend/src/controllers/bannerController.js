const bannerService = require("../services/bannerService");

exports.getAllBanners = async (req, res, next) => {
  try {
    const { position } = req.query;
    const banners = await bannerService.getActiveBanners(position);
    res.json(banners);
  } catch (err) {
    next(err);
  }
};
