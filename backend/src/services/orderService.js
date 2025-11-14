// orderService.js
const Order = require("../models/Order");
const getRevenueByCategory = async () => {
  try {
    const data = await Order.getRevenueByCategory();
    return data;
  } catch (error) {
    console.error("Error in getRevenueByCategory:", error);
    throw new Error("Không thể lấy dữ liệu doanh thu theo danh mục");
  }
};

module.exports = {
  getRevenueByCategory,
};
