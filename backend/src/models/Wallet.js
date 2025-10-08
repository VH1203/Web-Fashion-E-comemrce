const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const WalletSchema = new mongoose.Schema(
  {
    _id: { type: String, default: () => `wallet-${uuidv4()}` },
    user_id: { type: String, ref: "User", required: true },
    type: { type: String, enum: ["customer", "shop", "system"], default: "customer" },
    balance_available: { type: Number, default: 0 },
    balance_pending: { type: Number, default: 0 },
    currency: { type: String, default: "VND" },
    last_transaction_id: { type: String, ref: "Transaction" },
    is_active: { type: Boolean, default: true },
  },
  { timestamps: true, versionKey: false, collection: "wallets" }
);

WalletSchema.index({ user_id: 1 });

module.exports = mongoose.model("Wallet", WalletSchema);
