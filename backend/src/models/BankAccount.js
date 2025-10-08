const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const BankAccountSchema = new mongoose.Schema(
  {
    _id: { type: String, default: () => `bank-${uuidv4()}` },
    user_id: { type: String, ref: "User", required: true },
    bank_name: { type: String, required: true },
    account_number: { type: String, required: true },
    owner_name: { type: String, required: true },
    logo_url: String,
    logo_public_id: String,
  },
  { timestamps: true, versionKey: false, collection: "bank_accounts" }
);

BankAccountSchema.index({ user_id: 1 });

module.exports = mongoose.model("BankAccount", BankAccountSchema);
