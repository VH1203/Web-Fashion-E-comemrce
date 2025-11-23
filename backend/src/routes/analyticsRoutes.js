const router = require("express").Router();
const auth = require("../middlewares/authMiddleware");
const ctrl = require("../controllers/analyticsController");

router.use(auth.verifyToken); 

router.get("/overview", ctrl.overview);          
router.get("/revenue-series", ctrl.revenueSeries);
router.get("/status-summary", ctrl.statusSummary);
router.get("/top-products", ctrl.topProducts);
router.get("/top-customers", ctrl.topCustomers);
router.get("/realtime", ctrl.realtimeSSE);
router.get("/forecast", ctrl.forecast);            

router.get("/export/excel", ctrl.exportExcel);    
router.get("/export/pdf", ctrl.exportPdf);

module.exports = router;
