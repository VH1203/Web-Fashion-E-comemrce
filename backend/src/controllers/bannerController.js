const Banner = require("../models/Banner");

const getBanners = async (req, res) => {
  try {
    const banners = await Banner.find({ active: true }).sort({ created_at: -1 });
    res.json(banners);
  } catch (error) {
    console.error("getBanners error:", error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getBanners };
