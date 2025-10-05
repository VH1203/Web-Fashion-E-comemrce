// AuditLog.js 
const mongoose = require("mongoose");

const AuditLogSchema = new mongoose.Schema({
  _id: { type: String, required: true }, // UUID
  actor: { id: String, role: String },
  entity: { type: { type: String }, id: String },
  action: { type: String, required: true },
  metadata: { type: Object },
  ip: String,
  userAgent: String,
  at: { type: Date, default: Date.now }
}, { timestamps: false });

AuditLogSchema.index({ "entity.type":1, "entity.id":1, at:-1 });

module.exports = mongoose.model("AuditLog", AuditLogSchema);
