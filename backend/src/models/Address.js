const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const AddressSchema = new mongoose.Schema(
  {
    _id: { type: String, default: () => `addr-${uuidv4()}` },

    user_id: { type: String, ref: "User", required: true },

    name:   { type: String, required: true, trim: true },
    phone:  { type: String, required: true, trim: true },
    city:   { type: String, required: true, trim: true },
    ward:   { type: String, required: true, trim: true },
    street: { type: String, required: true, trim: true },

    district: {
      type: String,
      trim: true,
      default: "",
      required: function () {
        const mode = this.source || "63";
        return mode !== "34";
      },
    },

    source: { type: String, enum: ["63", "34"], default: "63" },

    province_code: { type: String, default: null },
    district_code: { type: String, default: null },
    ward_code:     { type: String, default: null },

    is_default: { type: Boolean, default: false },
  },
  { timestamps: true, versionKey: false, collection: "addresses" }
);

AddressSchema.index({ user_id: 1, is_default: 1 });

module.exports = mongoose.model("Address", AddressSchema);
