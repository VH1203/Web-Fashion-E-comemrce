const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const AddressSchema = new mongoose.Schema(
  {
    _id: { type: String, default: () => `addr-${uuidv4()}` },
    user_id: { type: String, ref: "User", required: true },
    name: { type: String, required: true },
    phone: { type: String, required: true },
    city: { type: String, required: true },
    district: { type: String, required: true },
    ward: { type: String, required: true },
    street: { type: String, required: true },
    is_default: { type: Boolean, default: false },
  },
  { timestamps: true, versionKey: false, collection: "addresses" }
);


module.exports = mongoose.model("Address", AddressSchema);
