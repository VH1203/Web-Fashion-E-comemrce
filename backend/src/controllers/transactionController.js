
const { getRevenueByMonth } = require("../services/transactionService");
const getRevenueByMonthController = async (req, res) => {
  try {
    const data = await getRevenueByMonth();
    res.status(200).json({
      success: true,
      message: "Lấy doanh thu theo tháng thành công",
      data,
    });
  } catch (error) {
    console.error("Error in getRevenueByMonthController:", error);
    res.status(500).json({
      success: false,
      message: "Không thể lấy doanh thu theo tháng",
    });
  }
};
module.exports = { getRevenueByMonthController };