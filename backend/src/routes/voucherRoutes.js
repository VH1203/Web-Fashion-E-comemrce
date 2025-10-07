const express = require("express");
const router = express.Router();
const { authMiddleware } = require("../middlewares/authMiddleware");
const voucherCtrl = require("../controllers/voucherController");

// Lấy danh sách voucher (có thể thêm query params cho filter/search)
router.get("/", authMiddleware, voucherCtrl.getAllVouchers);

// Lấy voucher theo ID
router.get("/:id", authMiddleware, voucherCtrl.getVoucherById);

// Tạo voucher mới
router.post("/", authMiddleware, voucherCtrl.createVoucher);

// Cập nhật voucher
router.put("/:id", authMiddleware, voucherCtrl.updateVoucher);

// Xóa voucher
router.delete("/:id", authMiddleware, voucherCtrl.deleteVoucher);

module.exports = router;
