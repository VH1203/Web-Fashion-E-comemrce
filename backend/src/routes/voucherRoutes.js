const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middlewares/authMiddleware");
const voucherCtrl = require("../controllers/voucherController");

// Định nghĩa routes
router.get("/", verifyToken, voucherCtrl.getAllVouchers);
router.get("/:id", verifyToken, voucherCtrl.getVoucherById);
router.post("/", verifyToken, voucherCtrl.createVoucher);
router.put("/:id", verifyToken, voucherCtrl.updateVoucher);
router.delete("/:id", verifyToken, voucherCtrl.deleteVoucher);

module.exports = router;
