const mongoose = require("mongoose");

const RoleSchema = new mongoose.Schema(
  {
    _id: { type: String },
    name: { type: String, required: true, unique: true },
    description: String,
    permissions: [String],
  },
  { timestamps: true, versionKey: false, collection: "roles" }
);

module.exports = mongoose.model("Role", RoleSchema);
