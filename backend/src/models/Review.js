// Review.js 
const mongoose = require("mongoose");
const ReviewSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  orderId: String,
  productId: String,
  customerId: String,
  rating: { type: Number, min:1, max:5, required: true },
  content: String,
  photos: [{ url: String, at: { type: Date, default: Date.now } }],
  reply: { by: String, content: String, at: Date }
}, { timestamps: true });

module.exports = mongoose.model("Review", ReviewSchema);
