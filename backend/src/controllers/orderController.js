// orderController.js 
const { getRevenueByCategory } = require("../services/orderService");

// get revenue by category build chart
const getRevenueByCategoryController = async (req, res) => {
  try {
    const data = await getRevenueByCategory();
    res.status(200).json({
      success: true,
      message: "Lấy doanh thu theo danh mục thành công",
      data,
    });
  } catch (error) {
    console.error("Error in getRevenueByCategoryController:", error);
    res.status(500).json({
      success: false,
      message: "Không thể lấy doanh thu theo danh mục",
    });
  }
};

module.exports = { getRevenueByCategoryController };