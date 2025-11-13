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

exports.getReviewsByProductController = async (req, res) => {
  try {
    const { product_id } = req.params;
    const data = await reviewService.getReviewsByProduct(product_id);

    res.status(200).json({
      success: true,
      message: "Lấy danh sách review thành công",
      data,
    });
  } catch (error) {
    console.error("Error in getReviewsByProductController:", error);
    res.status(500).json({
      success: false,
      message: "Không thể lấy danh sách review",
    });
  }
};

exports.getMyReviewsController = async (req, res) => {
  try {
    const userId = req.user._id;
    const data = await reviewService.getMyReviews(userId);

    res.status(200).json({
      success: true,
      message: "Lấy danh sách review của bạn thành công",
      data,
    });
  } catch (error) {
    console.error("Error in getMyReviewsController:", error);
    res.status(500).json({
      success: false,
      message: "Không thể lấy review của bạn",
    });
  }
};

exports.getPendingReviewsController = async (req, res) => {
  try {
    const userId = req.user._id; // user từ middleware auth
    const data = await reviewService.getPendingReviews(userId);

    res.status(200).json({
      success: true,
      message: "Lấy danh sách sản phẩm cần đánh giá thành công",
      data,
    });
  } catch (error) {
    console.error("Error in getPendingReviewsController:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Không thể lấy danh sách sản phẩm cần đánh giá",
    });
  }
};
