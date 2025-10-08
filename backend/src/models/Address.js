const mongoose = require("mongoose");

const AddressSchema = new mongoose.Schema({
  _id: { type: String, required: true }, // UUID
  user_id: { type: String, ref: "User", required: true },
  name: { type: String, required: true },
  phone: { type: String, required: true },
  city: { type: String, required: true },
  district: { type: String, required: true },
  ward: { type: String, required: true },
  street: { type: String, required: true },
  is_default: { type: Boolean, default: false },
  created_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Address", AddressSchema);
