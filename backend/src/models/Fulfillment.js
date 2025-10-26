// src/models/Fulfillment.js
const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const fulfillmentSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: () => `ful-${uuidv4()}`,
    },
    order_id: { type: String, ref: "Order", required: true },
    shipping_provider: { type: String, enum: ["GHN", "GHTK"], required: true },
    tracking_code: { type: String },
    fee: { type: Number, default: 0 },
    status: {
      type: String,
      enum: [
        "ready_to_pick",
        "picking",
        "in_transit",
        "out_for_delivery",
        "delivered",
        "delivery_failed",
        "canceled",
      ],
      default: "ready_to_pick",
    },
    address_snapshot: { type: Object },
    label_url: { type: String },
    metadata: { type: Object },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Fulfillment", fulfillmentSchema);
