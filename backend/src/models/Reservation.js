// src/models/Reservation.js
const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const reservationSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: () => `res-${uuidv4()}`,
    },
    user_id: { type: String, ref: "User", required: true },
    product_id: { type: String, ref: "Product", required: true },
    variant_id: { type: String, ref: "ProductVariant", required: true },
    quantity: { type: Number, required: true, min: 1 },
    status: {
      type: String,
      enum: ["active", "released", "converted"],
      default: "active",
    },
    expires_at: {
      type: Date,
      required: true,
      index: { expires: 0 }, 
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Reservation", reservationSchema);
