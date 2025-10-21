const express = require("express");
const router = express.Router();
const homeController = require("../controllers/homeController");

// GET /api/home
router.get("/", homeController.getHomepage);

module.exports = router;
