const svc = require("../services/analyticsService");

// GET /api/analytics/overview
exports.overview = async (req, res, next) => {
  try {
    const shopId = req.user._id;
    const data = await svc.getOverview(shopId);
    res.json({ success: true, data });
  } catch (e) { next(e); }
};

// GET /api/analytics/revenue-series?granularity=day&range=30
exports.revenueSeries = async (req, res, next) => {
  try {
    const shopId = req.user._id;
    const { granularity="day", range="30" } = req.query;
    const data = await svc.getRevenueSeries(shopId, granularity, Number(range));
    res.json({ success: true, data });
  } catch (e) { next(e); }
};

// GET /api/analytics/status-summary
exports.statusSummary = async (req, res, next) => {
  try { res.json({ success: true, data: await svc.getStatusSummary(req.user._id) }); }
  catch (e) { next(e); }
};

// GET /api/analytics/top-products?limit=10
exports.topProducts = async (req, res, next) => {
  try { res.json({ success: true, data: await svc.getTopProducts(req.user._id, Number(req.query.limit||10)) }); }
  catch (e) { next(e); }
};

// GET /api/analytics/top-customers?limit=10
exports.topCustomers = async (req, res, next) => {
  try { res.json({ success: true, data: await svc.getTopCustomers(req.user._id, Number(req.query.limit||10)) }); }
  catch (e) { next(e); }
};

// GET /api/analytics/realtime  (SSE fallback)
exports.realtimeSSE = (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();
  // Gắn tạm vào global EventEmitter (xem service)
  const handler = (payload) => res.write(`data: ${JSON.stringify(payload)}\n\n`);
  svc.onRealtime(handler);
  req.on("close", () => svc.offRealtime(handler));
};

// GET /api/analytics/forecast?granularity=day&range=90&future=14
exports.forecast = async (req, res, next) => {
  try {
    const shopId = req.user._id;
    const { granularity="day", range="90", future="14" } = req.query;
    const data = await svc.getForecast(shopId, granularity, Number(range), Number(future));
    res.json({ success: true, data });
  } catch (e) { next(e); }
};

// GET /api/analytics/export/excel
exports.exportExcel = async (req, res, next) => {
  try {
    const shopId = req.user._id;
    const buffer = await svc.exportExcel(shopId);
    res.setHeader("Content-Disposition", `attachment; filename="dfs_analytics.xlsx"`);
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.send(buffer);
  } catch (e) { next(e); }
};

// GET /api/analytics/export/pdf
exports.exportPdf = async (req, res, next) => {
  try {
    const shopId = req.user._id;
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="dfs_analytics.pdf"`);
    const stream = await svc.exportPdf(shopId);
    stream.pipe(res);
  } catch (e) { next(e); }
};
