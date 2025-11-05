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
module.exports = router;
