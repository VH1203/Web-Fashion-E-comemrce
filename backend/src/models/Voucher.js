const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const voucherSchema = new mongoose.Schema(
  {
    _id: { type: String, default: () => `voucher-${uuidv4()}` },

    // Mã voucher (duy nhất)
    code: { type: String, required: true, unique: true, trim: true },

    // Loại giảm giá & giá trị
    discount_type: { type: String, enum: ["percent", "fixed"], default: "percent" },
    discount_value: { type: Number, required: true },

    // Giới hạn & đếm lượt
    max_uses: { type: Number, required: true },
    used_count: { type: Number, default: 0 },
    usage_limit_per_user: { type: Number, default: 1 },

    // Điều kiện
    min_order_value: { type: Number, default: 0 },
    applicable_products: [{ type: String, ref: "Product" }],
    applicable_users: [{ type: String, ref: "User" }],

    // Phạm vi áp dụng (shop / toàn hệ thống)
    scope: { type: String, enum: ["global", "shop"], default: "shop" },
    shop_id: { type: String, ref: "User" }, // null nếu global

    // Hiệu lực
    valid_from: { type: Date, required: true },
    valid_to: { type: Date, required: true },

    // Trạng thái
    is_active: { type: Boolean, default: true },

    // Người tạo
    created_by: { type: String, ref: "User", required: true },

    // Audit
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
  },
  { versionKey: false, collection: "vouchers" }
);

// Auto update timestamp
voucherSchema.pre("save", function (next) {
  this.updated_at = new Date();
  next();
});



module.exports = mongoose.model("Voucher", voucherSchema);
