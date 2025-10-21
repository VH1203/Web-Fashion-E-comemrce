const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const AuditLogSchema = new mongoose.Schema(
  {
    _id: { type: String, default: () => `log-${uuidv4()}` },
    actor_id: { type: String, ref: "User" },
    action: { type: String, required: true },
    target_collection: { type: String },
    target_id: { type: String },
    ip_address: String,
    user_agent: String,
    metadata: {},
  },
  { timestamps: true, versionKey: false, collection: "audit_logs" }
);


module.exports = mongoose.model("AuditLog", AuditLogSchema);
