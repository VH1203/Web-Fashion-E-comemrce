// backend/src/models/Cart.js
const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");
const CartItemSchema = require("./CartItemSchema");

const CartSchema = new mongoose.Schema(
  {
    _id: { type: String, default: () => `cart-${uuidv4()}` },
    user_id: { type: String, ref: "User", required: true, index: true },
    items: [CartItemSchema],
    total_price: { type: Number, default: 0 },
    currency: { type: String, default: "VND" },
    updated_at: { type: Date, default: Date.now },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" }, versionKey: false, collection: "carts" }
);

CartSchema.pre("save", function (next) {
  if (Array.isArray(this.items)) {
    for (const it of this.items) {
      it.total = Math.max(0, (it.price || 0) * (it.qty || 0));
    }
    this.total_price = this.items.reduce((acc, it) => acc + (it.total || 0), 0);
  } else {
    this.total_price = 0;
  }
  this.updated_at = new Date();
  next();
});

module.exports = mongoose.model("Cart", CartSchema);
