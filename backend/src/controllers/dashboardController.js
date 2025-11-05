const dashboardService = require("../services/dashboardService");
const { buildExcelBuffer, buildPdfBuffer } = require("../utils/exporter");

exports.getKpis = async (req, res, next) => {
  try {
    const shopId = req.user._id; // shop owner == user id for shop scope
    const data = await dashboardService.getKpis({ shopId });
    res.json({ success: true, data });
  } catch (e) { next(e); }
};

exports.getRevenueSeries = async (req, res, next) => {
  try {
    const { granularity = "day", from, to } = req.query;
    const shopId = req.user._id;
    const data = await dashboardService.getRevenueSeries({ shopId, granularity, from, to });
    res.json({ success: true, data });
  } catch (e) { next(e); }
};

exports.getOrderStatus = async (req, res, next) => {
  try {
    const shopId = req.user._id;
    const data = await dashboardService.getOrderStatus({ shopId });
    res.json({ success: true, data });
  } catch (e) { next(e); }
};

exports.getTopProducts = async (req, res, next) => {
  try {
    const shopId = req.user._id;
    const limit = Number(req.query.limit || 10);
    const data = await dashboardService.getTopProducts({ shopId, limit });
    res.json({ success: true, data });
  } catch (e) { next(e); }
};

exports.getTopCustomers = async (req, res, next) => {
  try {
    const shopId = req.user._id;
    const limit = Number(req.query.limit || 10);
    const data = await dashboardService.getTopCustomers({ shopId, limit });
    res.json({ success: true, data });
  } catch (e) { next(e); }
};

exports.exportExcel = async (req, res, next) => {
  try {
    const shopId = req.user._id;
    const { from, to } = req.query;
    const payload = await dashboardService.getExportPayload({ shopId, from, to });
    const buffer = await buildExcelBuffer(payload);
    res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
    res.setHeader("Content-Disposition", `attachment; filename=dfs-dashboard-${Date.now()}.xlsx`);
    res.send(buffer);
  } catch (e) { next(e); }
};

exports.exportPdf = async (req, res, next) => {
  try {
    const shopId = req.user._id;
    const { from, to } = req.query;
    const payload = await dashboardService.getExportPayload({ shopId, from, to });
    const buffer = await buildPdfBuffer(payload);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=dfs-dashboard-${Date.now()}.pdf`);
    res.send(buffer);
  } catch (e) { next(e); }
};

exports.getRevenueForecast = async (req, res, next) => {
  try {
    const shopId = req.user._id;
    const horizon = Number(req.query.horizon || 14); // days to forecast
    const series = await dashboardService.getRevenueSeries({ shopId, granularity: "day" });
    const forecast = await dashboardService.forecastRevenueNode(series, horizon);
    res.json({ success: true, data: forecast });
  } catch (e) { next(e); }
};
