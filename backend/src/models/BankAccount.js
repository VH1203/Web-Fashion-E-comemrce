const mongoose = require("mongoose");

const BankAccountSchema = new mongoose.Schema({
  _id: { type: String, required: true }, // UUID
  user_id: { type: String, ref: "User", required: true },
  bank_name: { type: String, required: true },
  account_number: { type: String, required: true },
  owner_name: { type: String, required: true },
  logo: { type: String },
  created_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model("BankAccount", BankAccountSchema);
