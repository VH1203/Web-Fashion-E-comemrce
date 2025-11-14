const express = require("express");
const router = express.Router();
const brandController = require("../controllers/brandController");

router.get("/:slug", brandController.getBrandBySlug);

module.exports = router;
