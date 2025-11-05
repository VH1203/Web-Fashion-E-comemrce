const express = require("express");
const router = express.Router();
const ctrl = require("../controllers/dashboardController");
const { verifyToken } = require("../middlewares/authMiddleware");
const { requireShopAccess } = require("../middlewares/rbacMiddleware");

// All routes require auth + shop role
// Apply authentication then shop-specific RBAC handlers
router.use(verifyToken, ...requireShopAccess());

router.get("/kpis", ctrl.getKpis);                 // revenue, counts, live processing
router.get("/revenue", ctrl.getRevenueSeries);     // time-series (day/month/year)
router.get("/order-status", ctrl.getOrderStatus);  // pie
router.get("/top-products", ctrl.getTopProducts);  // table
router.get("/top-customers", ctrl.getTopCustomers);// table

// Exporters
router.get("/export/excel", ctrl.exportExcel);
router.get("/export/pdf", ctrl.exportPdf);

// ML forecast
router.get("/forecast/revenue", ctrl.getRevenueForecast);

module.exports = router;
