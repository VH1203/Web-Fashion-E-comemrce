const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const voucherSchema = new mongoose.Schema(
  {
    _id: { type: String, default: () => `voucher-${uuidv4()}` },
    code: { type: String, unique: true, required: true },
    discount_percent: { type: Number, required: true },
    max_uses: { type: Number, required: true },
    used_count: { type: Number, default: 0 },
    valid_from: { type: Date, required: true },
    valid_to: { type: Date, required: true },
    conditions: {
      min_order_value: { type: Number, default: 0 },
      applicable_products: [{ type: String }],
      applicable_users: [{ type: String }],
    },
    created_by: { type: String, required: true }, // ID người tạo (user._id)
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
  },
  { versionKey: false, collection: "vouchers" }
);

// Auto update updated_at trước khi save
voucherSchema.pre("save", function (next) {
  this.updated_at = new Date();
  next();
});

module.exports = mongoose.model("Voucher", voucherSchema);
