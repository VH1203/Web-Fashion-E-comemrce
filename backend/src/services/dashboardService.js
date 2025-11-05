const Order = require("../models/Order");
const Product = require("../models/Product");
const User = require("../models/User");
const { forecastRevenue } = require("./forecastService");
const { startOfDay, endOfDay, startOfMonth, endOfMonth, startOfYear, endOfYear } = require("date-fns");

function parseRange({ from, to, granularity }) {
  const now = new Date();
  if (from && to) return { from: new Date(from), to: new Date(to) };
  if (granularity === "year") return { from: startOfYear(now), to: endOfYear(now) };
  if (granularity === "month") return { from: startOfMonth(now), to: endOfMonth(now) };
  return { from: startOfDay(now), to: endOfDay(now) };
}

exports.getKpis = async ({ shopId }) => {
  const [processingCount, todayRevenue] = await Promise.all([
    Order.countDocuments({ shop_id: shopId, status: { $in: ["pending", "processing", "confirmed"] } }),
    // revenue for today (paid + delivered; includes shipping_fee)
    Order.aggregate([
      { $match: { shop_id: shopId, payment_status: { $in: ["paid", "refunded"] }, createdAt: { $gte: startOfDay(new Date()), $lte: endOfDay(new Date()) } } },
      { $group: { _id: null, total: { $sum: "$total_price" } } },
    ])
  ]);
  return {
    processingOrders: processingCount,
    todayRevenue: todayRevenue?.[0]?.total || 0,
  };
};

exports.getRevenueSeries = async ({ shopId, granularity = "day", from, to }) => {
  const range = parseRange({ from, to, granularity });
  const dateTrunc = {
    day: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
    month: { $dateToString: { format: "%Y-%m", date: "$createdAt" } },
    year: { $dateToString: { format: "%Y", date: "$createdAt" } },
  }[granularity] || { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } };

  const rows = await Order.aggregate([
    { $match: { shop_id: shopId, payment_status: { $in: ["paid", "refunded"] }, createdAt: { $gte: range.from, $lte: range.to } } },
    { $group: { _id: dateTrunc, revenue: { $sum: "$total_price" }, orders: { $sum: 1 } } },
    { $sort: { _id: 1 } },
  ]);
  return rows.map(r => ({ date: r._id, revenue: r.revenue, orders: r.orders }));
};

exports.getOrderStatus = async ({ shopId }) => {
  const rows = await Order.aggregate([
    { $match: { shop_id: shopId } },
    { $group: { _id: "$status", count: { $sum: 1 } } },
  ]);
  const map = Object.fromEntries(rows.map(r => [r._id || "unknown", r.count]));
  const ordered = ["pending","processing","confirmed","shipping","delivered","canceled_by_customer","canceled_by_shop","refund_pending","refund_completed"].map(k => ({ status: k, count: map[k] || 0 }));
  return ordered;
};

exports.getTopProducts = async ({ shopId, limit = 10 }) => {
  const rows = await Order.aggregate([
    { $match: { shop_id: shopId, payment_status: { $in: ["paid", "refunded"] } } },
    { $unwind: "$items" },
    { $group: { _id: "$items.product_id", qty: { $sum: "$items.qty" }, revenue: { $sum: { $ifNull: ["$items.total", { $multiply: ["$items.price", "$items.qty"] }] } } } },
    { $sort: { qty: -1, revenue: -1 } },
    { $limit: limit },
    { $lookup: { from: "products", localField: "_id", foreignField: "_id", as: "product" } },
    { $unwind: "$product" },
    { $project: { _id: 0, product_id: "$product._id", name: "$product.name", image: { $arrayElemAt: ["$product.images", 0] }, qty: 1, revenue: 1 } },
  ]);
  return rows;
};

exports.getTopCustomers = async ({ shopId, limit = 10 }) => {
  const rows = await Order.aggregate([
    { $match: { shop_id: shopId, payment_status: { $in: ["paid", "refunded"] } } },
    { $group: { _id: "$user_id", orders: { $sum: 1 }, spend: { $sum: "$total_price" } } },
    { $sort: { spend: -1 } },
    { $limit: limit },
    { $lookup: { from: "users", localField: "_id", foreignField: "_id", as: "user" } },
    { $unwind: "$user" },
    { $project: { _id: 0, user_id: "$user._id", name: "$user.name", email: "$user.email", phone: "$user.phone", orders: 1, spend: 1 } },
  ]);
  return rows;
};

exports.getExportPayload = async ({ shopId, from, to }) => {
  const revenueDay = await exports.getRevenueSeries({ shopId, granularity: "day", from, to });
  const status = await exports.getOrderStatus({ shopId });
  const topProducts = await exports.getTopProducts({ shopId, limit: 20 });
  const topCustomers = await exports.getTopCustomers({ shopId, limit: 20 });
  return { revenueDay, status, topProducts, topCustomers };
};

exports.forecastRevenueNode = async (series, horizon) => {
  const data = series.map(x => ({ ds: x.date, y: x.revenue }));
   // Nếu thiếu dữ liệu, fallback trung bình
   if (data.length < 5) {
     const avg = data.reduce((s, v) => s + (v.y || 0), 0) / Math.max(1, data.length);
     return Array.from({ length: horizon }).map((_, i) => ({
       ds: data.length ? data[data.length - 1].ds : "",
       yhat: avg
     }));
   }
   return forecastRevenue({ series: data, horizon });
};
