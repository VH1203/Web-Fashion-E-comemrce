const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middlewares/authMiddleware");
const flashSaleCtrl = require("../controllers/flashsaleController");

// Định nghĩa routes cho FlashSale
router.get("/", verifyToken, flashSaleCtrl.getAllFlashSales);
router.get("/:id", verifyToken, flashSaleCtrl.getFlashSaleById);
router.post("/", verifyToken, flashSaleCtrl.createFlashSale);
router.put("/:id", verifyToken, flashSaleCtrl.updateFlashSale);
router.delete("/:id", verifyToken, flashSaleCtrl.deleteFlashSale);

module.exports = router;
