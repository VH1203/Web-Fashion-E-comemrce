const Order = require("../models/Order");
const Product = require("../models/Product");
const User = require("../models/User");
const dayjs = require("dayjs");
const ExcelJS = require("exceljs");
const PDFDocument = require("pdfkit");
const { EventEmitter } = require("events");
const { SLR } = require("ml-regression-simple-linear"); // dự báo đơn giản

// Realtime emitter (dùng tạm nếu chưa tích hợp socket.io)
const emitter = new EventEmitter();
exports.onRealtime  = (fn) => emitter.on("event", fn);
exports.offRealtime = (fn) => emitter.off("event", fn);

// Gợi ý tích hợp trong Order controller khi có hành động:
// emitter.emit("event", { type:"order_updated", payload: { order_id, status, ts: Date.now() } });

exports.getOverview = async (shopId) => {
  const now = new Date();
  const from = dayjs(now).startOf("day").toDate();
  const to   = dayjs(now).endOf("day").toDate();

  const [todayRevenue, processingCount, totalOrders, totalCustomers] = await Promise.all([
    Order.aggregate([
      { $match: { shop_id: shopId, createdAt: { $gte: from, $lte: to }, status: { $in: ["paid","confirmed","shipped","delivered"] } } },
      { $group: { _id: null, sum: { $sum: "$total_amount" } } }
    ]),
    Order.countDocuments({ shop_id: shopId, status: { $in: ["pending","confirmed","packing","shipped"] } }),
    Order.countDocuments({ shop_id: shopId }),
    User.countDocuments({ "last_order_shop_id": shopId }) // nếu có trường track, nếu không thì count theo orders distinct user_id
  ]);

  return {
    today_revenue: todayRevenue?.[0]?.sum || 0,
    processing_orders: processingCount,
    total_orders: totalOrders,
    total_customers: totalCustomers
  };
};

exports.getRevenueSeries = async (shopId, granularity="day", range=30) => {
  const end = dayjs().endOf(granularity);
  const start = end.subtract(range-1, granularity).startOf(granularity);

  const fmt = granularity === "day"   ? "%Y-%m-%d"
             : granularity === "month"? "%Y-%m"
             : "%Y";

  const rows = await Order.aggregate([
    { $match: { shop_id: shopId, createdAt: { $gte: start.toDate(), $lte: end.toDate() }, status: { $in: ["paid","confirmed","shipped","delivered"] } } },
    { $group: {
        _id: { $dateToString: { format: fmt, date: "$createdAt" } },
        revenue: { $sum: "$total_amount" },
        count: { $sum: 1 }
    }},
    { $sort: { _id: 1 } }
  ]);

  // fill missing buckets
  const out = [];
  for (let i=0; i<range; i++) {
    const key = start.add(i, granularity).format(fmt.replace("%Y","YYYY").replace("%m","MM").replace("%d","DD"));
    const found = rows.find(r => r._id === key);
    out.push({ x: key, revenue: found?.revenue || 0, count: found?.count || 0 });
  }
  return out;
};

exports.getStatusSummary = async (shopId) => {
  const rows = await Order.aggregate([
    { $match: { shop_id: shopId } },
    { $group: { _id: "$status", cnt: { $sum: 1 } } }
  ]);
  // map friendly order
  const order = ["pending","confirmed","packing","shipped","delivered","canceled","refunded"];
  const map = new Map(rows.map(r => [r._id, r.cnt]));
  return order.map(k => ({ status: k, count: map.get(k) || 0 }));
};

exports.getTopProducts = async (shopId, limit=10) => {
  // giả sử Order có mảng items: [{ product_id, qty, amount }]
  const rows = await Order.aggregate([
    { $match: { shop_id: shopId, status: { $in: ["paid","confirmed","shipped","delivered"] } } },
    { $unwind: "$items" },
    { $group: {
        _id: "$items.product_id",
        qty: { $sum: "$items.qty" },
        revenue: { $sum: "$items.amount" }
    }},
    { $sort: { qty: -1 } },
    { $limit: limit },
    { $lookup: { from: "products", localField: "_id", foreignField: "_id", as: "prod" } },
    { $addFields: { product: { $arrayElemAt: ["$prod", 0] } } },
    { $project: { prod:0 } }
  ]);
  return rows;
};

exports.getTopCustomers = async (shopId, limit=10) => {
  const rows = await Order.aggregate([
    { $match: { shop_id: shopId, status: { $in: ["paid","confirmed","shipped","delivered"] } } },
    { $group: { _id: "$customer_id", total_spent: { $sum: "$total_amount" }, orders: { $sum: 1 } } },
    { $sort: { total_spent: -1 } },
    { $limit: limit },
    { $lookup: { from: "users", localField: "_id", foreignField: "_id", as: "u" } },
    { $addFields: { customer: { $arrayElemAt: ["$u", 0] } } },
    { $project: { u:0 } }
  ]);
  return rows;
};

exports.getForecast = async (shopId, granularity="day", range=90, future=14) => {
  // Lấy series doanh thu
  const series = await exports.getRevenueSeries(shopId, granularity, range);
  if (series.length === 0) return { history: [], forecast: [] };

  // Dự báo sơ bộ bằng hồi quy tuyến tính, để FE gắn nhãn “(preview)”
  const xs = series.map((_, i) => i);
  const ys = series.map(r => r.revenue);
  const reg = new SLR(xs, ys);
  const forecast = [];
  for (let i=0; i<future; i++) {
    const x = xs.length + i;
    forecast.push({ x, revenue: Math.max(0, Math.round(reg.predict(x))) });
  }
  return { history: series, forecast };
};

exports.exportExcel = async (shopId) => {
  const [ov, status, topP, topC] = await Promise.all([
    exports.getOverview(shopId),
    exports.getStatusSummary(shopId),
    exports.getTopProducts(shopId, 10),
    exports.getTopCustomers(shopId, 10)
  ]);

  const wb = new ExcelJS.Workbook();
  const s1 = wb.addWorksheet("Overview");
  s1.addRow(["Today revenue", ov.today_revenue]);
  s1.addRow(["Processing orders", ov.processing_orders]);
  s1.addRow(["Total orders", ov.total_orders]);
  s1.addRow(["Total customers", ov.total_customers]);

  const s2 = wb.addWorksheet("Status Summary");
  s2.addRow(["Status","Count"]);
  status.forEach(r => s2.addRow([r.status, r.count]));

  const s3 = wb.addWorksheet("Top Products");
  s3.addRow(["ProductID","Name","Qty","Revenue"]);
  topP.forEach(r => s3.addRow([r._id, r.product?.name || "", r.qty, r.revenue]));

  const s4 = wb.addWorksheet("Top Customers");
  s4.addRow(["CustomerID","Name/Email","Orders","Total Spent"]);
  topC.forEach(r => s4.addRow([r._id, r.customer?.name || r.customer?.email || "", r.orders, r.total_spent]));

  return wb.xlsx.writeBuffer();
};

exports.exportPdf = async (shopId) => {
  const [ov, status] = await Promise.all([
    exports.getOverview(shopId),
    exports.getStatusSummary(shopId),
  ]);
  const doc = new PDFDocument({ margin: 32 });
  doc.fontSize(18).text("DFS Shop Analytics", { underline: true });
  doc.moveDown();

  doc.fontSize(12).text(`Today revenue: ${ov.today_revenue}`);
  doc.text(`Processing orders: ${ov.processing_orders}`);
  doc.text(`Total orders: ${ov.total_orders}`);
  doc.text(`Total customers: ${ov.total_customers}`);
  doc.moveDown();

  doc.text("Status Summary:");
  status.forEach(s => doc.text(`- ${s.status}: ${s.count}`));

  doc.moveDown().text(`Generated at: ${new Date().toISOString()}`);
  doc.end();
  return doc; // stream
};
