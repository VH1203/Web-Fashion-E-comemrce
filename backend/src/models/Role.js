const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const RoleSchema = new mongoose.Schema(
  {
    _id: { type: String, default: () => `role-${uuidv4()}` },
    name: {
      type: String,
      required: true,
      unique: true,
      enum: [
        "customer",
        "shop_owner",
        "system_admin",
        "sales",
        "support"
      ],
    },
    description: String,
    permissions: [{ type: String }],
  },
  { timestamps: true, versionKey: false, collection: "roles" }
);

module.exports = mongoose.model("Role", RoleSchema);
