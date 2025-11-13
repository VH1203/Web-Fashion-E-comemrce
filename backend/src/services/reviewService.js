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

  // 1️ Kiểm tra xem đơn hàng có tồn tại & hợp lệ không
  const order = await Order.findOne({
    _id: order_id,
    user_id: userId,
    status: "delivered", // chỉ cho phép khi đơn đã hoàn thành
    "items.product_id": product_id,
  });

  if (!order) {
    throw new Error("Đơn hàng không hợp lệ hoặc chưa hoàn thành");
  }

  const existed = await Review.findOne({
    order_id,
    product_id,
    user_id: userId,
  });
  if (existed) {
    throw new Error("Bạn đã đánh giá sản phẩm này rồi");
  }

  // 3️Tạo mới review
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

  // 4️ Cập nhật lại điểm trung bình của product
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

async function getReviewsByProduct(productId) {
  const reviews = await Review.find({
    product_id: productId,
    status: "visible",
  })
    .populate("user_id", "name avatar_url")
    .sort({ created_at: -1 });
  return reviews;
}

async function getMyReviews(userId) {
  const reviews = await Review.find({ user_id: userId })
    .populate("product_id", "name slug")
    .sort({ created_at: -1 });
  return reviews;
}

async function getPendingReviews(userId) {
  // 1️ Lấy danh sách đơn hàng đã giao thành công của user
  const deliveredOrders = await Order.find({
    user_id: userId,
    status: "delivered",
  }).lean();

  if (!deliveredOrders.length) return [];

  // 2️ Lấy toàn bộ product_id từ các đơn đã giao
  const allItems = deliveredOrders.flatMap((order) =>
    order.items.map((it) => ({
      order_id: order._id,
      product_id: it.product_id,
      product_name: it.name,
      shop_id: order.shop_id,
      createdAt: order.createdAt,
    }))
  );

  // 3️ Lấy danh sách các product_id đã được review rồi
  const reviewed = await Review.find({
    user_id: userId,
    order_id: { $in: deliveredOrders.map((o) => o._id) },
  })
    .select("product_id order_id")
    .lean();

  const reviewedSet = new Set(
    reviewed.map((r) => `${r.order_id}_${r.product_id}`)
  );

  // 4️ Lọc ra những item chưa review
  const pending = allItems.filter(
    (item) => !reviewedSet.has(`${item.order_id}_${item.product_id}`)
  );

  // 5️ Join thêm thông tin sản phẩm để hiển thị ảnh, giá, v.v.
  const productIds = pending.map((p) => p.product_id);
  const products = await Product.find({ _id: { $in: productIds } })
    .select("_id name images base_price")
    .lean();

  const productMap = Object.fromEntries(products.map((p) => [p._id, p]));

  // 6️ Kết hợp dữ liệu
  return pending.map((item) => ({
    order_id: item.order_id,
    product_id: item.product_id,
    shop_id: item.shop_id,
    product_name: productMap[item.product_id]?.name || item.product_name,
    product_image: productMap[item.product_id]?.images?.[0] || null,
    price: productMap[item.product_id]?.base_price || null,
    order_date: item.createdAt,
  }));
}

module.exports = {
  createReview,
  getReviewsByProduct,
  getMyReviews,
  getPendingReviews,
};
