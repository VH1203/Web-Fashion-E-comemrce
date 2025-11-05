// reviewController.js
const reviewService = require("../services/reviewService");

exports.createReviewController = async (req, res) => {
  try {
    const userId = req.user._id; // user từ middleware auth
    const data = await reviewService.createReview(userId, req.body);

    res.status(201).json({
      success: true,
      message: "Đánh giá sản phẩm thành công",
      data,
    });
  } catch (error) {
    console.error("Error in createReviewController:", error);
    res.status(400).json({
      success: false,
      message: error.message || "Không thể tạo đánh giá",
    });
  }
};
