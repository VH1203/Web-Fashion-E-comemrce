const { getAnalyticsData } = require('../services/shopService');

const getAnalytics = async (req, res) => {
  try {
    const stats = await getAnalyticsData();
    res.json(stats);
  } catch (error) {
    console.error("Error fetching analytics:", error);
    res.status(500).json({ message: "Lỗi server khi lấy dữ liệu thống kê" });
  }
};



module.exports = { getAnalytics};