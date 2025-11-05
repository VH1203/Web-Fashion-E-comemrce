// models/Attribute.js
const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const AttributeSchema = new mongoose.Schema(
  {
    _id: { type: String, default: () => `attr-${uuidv4()}` },
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, unique: true, lowercase: true, trim: true },
    type: { type: String, enum: ["text", "number", "enum", "boolean", "select"], default: "enum" },
    values: [{ type: String, trim: true }], 
    unit: { type: String },                
    scope: { type: String, enum: ["variant", "product", "both"], default: "both" },
    applicable_category_ids: [{ type: String, ref: "Category" }], 
    is_variant_dimension: { type: Boolean, default: false },    
    display_order: { type: Number, default: 0 },
    is_active: { type: Boolean, default: true },
  },
  { timestamps: true, versionKey: false, collection: "attributes" }
);

module.exports = mongoose.model("Attribute", AttributeSchema);
