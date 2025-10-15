const Transaction = require("../models/Transaction");
const getRevenueByMonth = async () => {
  try {
    const data = await Transaction.getRevenueByMonth();
    return data;
  } catch (error) {
    console.error("Error in getRevenueByMonth:", error);
    throw new Error("Không thể lấy dữ liệu doanh thu theo tháng");
  }
};

module.exports = {
  getRevenueByMonth,
};