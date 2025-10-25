const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const TicketSchema = new mongoose.Schema(
  {
    _id: { type: String, default: () => `tkt-${uuidv4()}` },
    order_id: { type: String, ref: "Order" },
    user_id: { type: String, ref: "User", required: true },
    shop_id: { type: String, ref: "User" },
    subject: { type: String, required: true },
    message: { type: String, required: true },
    description: String,
    images: [String],
    status: {
      type: String,
      enum: ["open", "in_progress", "escalated", "closed"],
      default: "open",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    assigned_to: { type: String, ref: "User" },
    logs: [
      {
        actor_id: { type: String, ref: "User" },
        action: String,
        created_at: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Ticket", TicketSchema);
