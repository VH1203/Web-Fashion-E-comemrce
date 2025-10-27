// src/models/Cart.js
const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");
const CartItemSchema = require("./CartItemSchema");


const CartSchema = new mongoose.Schema(
    {
        _id: { type: String, default: () => `cart-${uuidv4()}` },
        user_id: { type: String, ref: "User", required: true },
        items: [CartItemSchema],
        total_price: {
            type: Number,
            default: 0,
        },
        currency: { type: String, default: "VND" },
        updated_at: { type: Date, default: Date.now },
    },
    { timestamps: { createdAt: "created_at", updatedAt: "updated_at" }, versionKey: false, collection: "carts" }
);

// Tự động cập nhật tổng tiền
CartSchema.pre("save", function (next) {
    if (this.items && this.items.length > 0) {
        this.total_price = this.items.reduce((acc, it) => acc + (it.total || it.price * it.qty), 0);
    } else {
        this.total_price = 0;
    }
    this.updated_at = new Date();
    next();
});


module.exports = mongoose.model("Cart", CartSchema);
