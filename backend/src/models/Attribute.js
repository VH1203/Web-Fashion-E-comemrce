const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const AttributeSchema = new mongoose.Schema(
  {
    _id: { type: String, default: () => `attr-${uuidv4()}` },
    name: { type: String, required: true },
    code: { type: String, required: true, unique: true, lowercase: true },
    type: { type: String, enum: ["text", "number", "enum", "boolean"], default: "enum" },
    values: [String],
    unit: String,
    applicable_category_ids: [{ type: String, ref: "Category" }],
    is_variant_dimension: { type: Boolean, default: false },
    is_active: { type: Boolean, default: true },
    display_order: { type: Number, default: 0 },
  },
  { timestamps: true, versionKey: false, collection: "attributes" }
);

AttributeSchema.index({ code: 1 });

module.exports = mongoose.model("Attribute", AttributeSchema);
