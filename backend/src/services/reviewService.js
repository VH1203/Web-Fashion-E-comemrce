const Review = require("../models/Review");
const Order = require("../models/Order");
const Product = require("../models/Product");

async function createReview(userId, payload) {
  const {
    order_id,
    product_id,
    rating,
    comment,
    images,
    is_anonymous,
    size_feedback,
  } = payload;

  // 1️⃣ Kiểm tra xem đơn hàng có tồn tại & hợp lệ không
  const order = await Order.findOne({
    _id: order_id,
    user_id: userId,
    status: "delivered", // chỉ cho phép khi đơn đã hoàn thành
    "items.product_id": product_id,
  });

  if (!order) {
    throw new Error("Đơn hàng không hợp lệ hoặc chưa hoàn thành");
  }

  // 2️⃣ Kiểm tra trùng lặp review (một sản phẩm trong một đơn chỉ được review 1 lần)
  const existed = await Review.findOne({
    order_id,
    product_id,
    user_id: userId,
  });
  if (existed) {
    throw new Error("Bạn đã đánh giá sản phẩm này rồi");
  }

  // 3️⃣ Tạo mới review
  const review = await Review.create({
    order_id,
    product_id,
    user_id: userId,
    shop_id: order.shop_id,
    rating,
    comment,
    images,
    is_anonymous,
    size_feedback,
    status: "visible",
  });

  // 4️⃣ Cập nhật lại điểm trung bình của product
  const stats = await Review.aggregate([
    { $match: { product_id, status: "visible" } },
    {
      $group: {
        _id: null,
        avgRating: { $avg: "$rating" },
        count: { $sum: 1 },
      },
    },
  ]);

  if (stats.length > 0) {
    await Product.findByIdAndUpdate(product_id, {
      rating_avg: stats[0].avgRating,
      rating_count: stats[0].count,
    });
  }

  return review;
}

module.exports = { createReview };
