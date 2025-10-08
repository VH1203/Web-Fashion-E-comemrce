const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const TicketSchema = new mongoose.Schema(
  {
    _id: { type: String, default: () => `ticket-${uuidv4()}` },
    user_id: { type: String, ref: "User", required: true },
    order_id: { type: String, ref: "Order" },
    subject: { type: String, required: true },
    message: { type: String, required: true },
    images: [String],
    status: { type: String, enum: ["open", "in_progress", "resolved", "closed"], default: "open" },
    assigned_to: { type: String, ref: "User" },
  },
  { timestamps: true, versionKey: false, collection: "tickets" }
);

TicketSchema.index({ user_id: 1 });
TicketSchema.index({ status: 1 });

module.exports = mongoose.model("Ticket", TicketSchema);
