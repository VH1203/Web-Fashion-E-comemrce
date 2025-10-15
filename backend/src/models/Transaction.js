const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const TransactionSchema = new mongoose.Schema(
  {
    _id: { type: String, default: () => `txn-${uuidv4()}` },
    wallet_id: { type: String, ref: "Wallet", required: true },
    type: { type: String, enum: ["deposit", "withdraw", "payment", "refund"], required: true },
    direction: { type: String, enum: ["in", "out"], required: true },
    amount: { type: Number, required: true },
    currency: { type: String, default: "VND" },
    status: { type: String, enum: ["pending", "success", "failed"], default: "pending" },
    reference_id: String,
    description: String,
  },
  { timestamps: true, versionKey: false, collection: "transactions" }
);

TransactionSchema.index({ wallet_id: 1, createdAt: -1 });
TransactionSchema.statics.getRevenueByMonth = async function () {
  return this.aggregate([
    { $match: { status: "success" } },
    {
      $group: {
        _id: { $month: "$createdAt" },
        totalRevenue: { $sum: "$amount" },
        totalTransactions: { $sum: 1 },
      },
    },
    { $sort: { "_id": 1 } },
    {
      $project: {
        _id: 0,
        month: {
          $arrayElemAt: [
            ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
            { $subtract: ["$_id", 1] },
          ],
        },
        totalRevenue: 1,
        totalTransactions: 1,
      },
    },
  ]);
};

module.exports = mongoose.model("Transaction", TransactionSchema);
