const mongoose = require("mongoose");

const CategorySchema = new mongoose.Schema({
  _id: { type: String, required: true }, // UUID
  name: String,
  slug: String,
  description: String,
  parent_id: String,
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Category", CategorySchema);
