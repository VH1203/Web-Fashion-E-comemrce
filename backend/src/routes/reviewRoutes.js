// reviewRoutes.js
const express = require("express");
const reviewController = require("../controllers/reviewController");
const { verifyToken } = require("../middlewares/authMiddleware");
const router = express.Router();
router.post(
  "/test-review",
  verifyToken,
  reviewController.createReviewController
);
router.get(
  "/product/:product_id",
  reviewController.getReviewsByProductController
);
router.get("/my-reviews", verifyToken, reviewController.getMyReviewsController);
router.get(
  "/pending-reviews",
  verifyToken,
  reviewController.getPendingReviewsController
);
module.exports = router;
