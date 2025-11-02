const express = require("express");
const transactionController = require("../controllers/transactionController");

const router = express.Router();
router.get("/revenue-by-month", transactionController.getRevenueByMonthController);

module.exports = router;