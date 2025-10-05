// Ticket.js 
const mongoose = require("mongoose");

const AttachmentSchema = new mongoose.Schema({
  url: { type: String, required: true },
  type: { type: String, enum: ["image", "video", "file"], default: "image" },
  uploadedBy: { type: String, enum: ["customer", "cskh", "system"], required: true },
  at: { type: Date, default: Date.now }
}, {_id:false});

const EventSchema = new mongoose.Schema({
  at: { type: Date, default: Date.now },
  by: { id: { type: String }, role: { type: String } },
  action: { type: String },
  note: { type: String },
  from: { type: String }, to: { type: String }
}, {_id:false});

const ProposalSchema = new mongoose.Schema({
  kind: { type: String, enum: ["refund","exchange","warranty","reject"], required: true },
  amount: { type: Number, min: 0 },
  exchangeSkuId: { type: String },
  reason: { type: String, maxlength: 2000 },
  createdAt: { type: Date, default: Date.now },
  createdBy: { type: String, required: true }
}, {_id:false});

const ApprovalSchema = new mongoose.Schema({
  status: { type: String, enum: ["approved","rejected","pending"], default: "pending" },
  decidedBy: { type: String },
  decidedAt: { type: Date },
  reason: { type: String }
}, {_id:false});

const SLASchema = new mongoose.Schema({
  createdAt: { type: Date, default: Date.now },
  firstResponseAt: { type: Date },
  resolvedAt: { type: Date }
}, {_id:false});

const TicketSchema = new mongoose.Schema({
  _id: { type: String, required: true }, // UUID
  code: { type: String, required: true, unique: true }, // e.g. TCK-2025-000123
  orderId: { type: String },
  shopId: { type: String, index: true },
  customerId: { type: String, index: true },
  type: { type: String, enum: ["refund","exchange","warranty","not_received","damaged","other"], required: true },
  title: { type: String, required: true },
  description: { type: String, maxlength: 4000 },
  status: { 
    type: String,
    enum: ["pending","processing","waiting_customer","escalated","approved","rejected","resolved","closed"],
    default: "pending",
    index: true
  },
  priority: { type: String, enum:["low","medium","high","critical"], default:"medium", index:true },
  attachments: [AttachmentSchema],
  channel: { type: String, enum: ["web","zalo","hotline","email","chat_widget"], default: "web" },
  events: [EventSchema],
  proposal: { type: ProposalSchema },
  approval: { type: ApprovalSchema, default: { status: "pending" } },
  sla: { type: SLASchema, default: () => ({}) },
  tags: [{ type: String }],
  isDeleted: { type: Boolean, default: false }
}, { timestamps: true });

TicketSchema.index({ shopId: 1, status: 1, priority: 1, createdAt: -1 });
TicketSchema.index({ code: 1 }, { unique: true });
TicketSchema.index({ customerId: 1, createdAt: -1 });

module.exports = mongoose.model("Ticket", TicketSchema);
