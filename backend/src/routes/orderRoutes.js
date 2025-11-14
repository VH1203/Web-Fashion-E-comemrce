// orderRoutes.js
const express = require("express");

const router = express.Router();
const ctrl = require("../controllers/orderController");
const orderShopController = require("../controllers/orderShopController");
const { verifyToken } = require("../middlewares/authMiddleware");

router.use(verifyToken);

router.get("/", ctrl.list);

// phan order cua shop
router.get(
  "/revenue-by-category",
  orderShopController.getRevenueByCategoryController
);

router.get("/:id", ctrl.detail);
router.post("/:id/cancel", ctrl.cancel);
router.post("/:id/reorder", ctrl.reorder);
router.post("/:id/refund", ctrl.requestRefund);

router.get("/:id/tracking", ctrl.tracking);
router.get("/:id/invoice", ctrl.invoicePdf);
router.post("/:id/review-reminder", ctrl.sendReviewReminder);

module.exports = router;
