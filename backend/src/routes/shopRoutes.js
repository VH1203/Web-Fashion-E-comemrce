// shopRoutes.js 
const express = require("express");
const shopController = require("../controllers/shopController");

const router = express.Router();
router.get("/analytics", shopController.getAnalytics);

module.exports = router;