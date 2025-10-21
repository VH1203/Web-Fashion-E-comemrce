const homeService = require("../services/homeService");

exports.getHomepage = async (req, res) => {
  try {
    const { category_id } = req.query;
    const result = await homeService.getHomepageData(category_id);
    res.status(200).json(result);
  } catch (err) {
    console.error("❌ Error in homeController:", err);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};
