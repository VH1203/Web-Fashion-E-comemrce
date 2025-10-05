const { v4: uuid } = require("uuid");
const Ticket = require("../models/Ticket");
const AuditLog = require("../models/AuditLog");

function canTransition(from, to) {
  const ok = {
    pending: ["processing"],
    processing: ["waiting_customer","escalated","resolved","closed"],
    waiting_customer: ["processing"],
    escalated: ["approved","rejected"],
    approved: ["resolved"],
    rejected: ["processing","closed"],
    resolved: ["closed"],
    closed: []
  };
  return ok[from]?.includes(to);
}

async function audit(actor, entityType, entityId, action, metadata, req) {
  await AuditLog.create({
    _id: uuid(),
    actor, entity: { type: entityType, id: entityId },
    action, metadata,
    ip: req.ip, userAgent: req.headers["user-agent"],
    at: new Date()
  });
}

async function listTickets(filter, options={}) {
  const { page=1, size=20, sort="-createdAt" } = options;
  const q = { isDeleted: false, ...filter };
  const [items, total] = await Promise.all([
    Ticket.find(q).sort(sort).skip((page-1)*size).limit(size),
    Ticket.countDocuments(q)
  ]);
  return { items, total, page, size };
}

async function getTicket(id) {
  return Ticket.findById(id);
}

async function createTicket(payload, actor, req) {
  const _id = payload._id || uuid();
  const code = payload.code || `TCK-${new Date().getFullYear()}-${String(Math.floor(Math.random()*1e6)).padStart(6,"0")}`;

  const doc = await Ticket.create({
    _id, code,
    shopId: payload.shopId,
    customerId: payload.customerId,
    orderId: payload.orderId,
    type: payload.type,
    title: payload.title,
    description: payload.description,
    priority: payload.priority || "medium",
    channel: payload.channel || "web",
    events: [{ by: actor, action:"create", note:"Created", at: new Date() }]
  });

  await audit(actor, "ticket", doc._id, "create", { code: doc.code }, req);
  return doc;
}

async function updateTicket(id, patch, actor, req) {
  const allowed = ["title","description","priority","tags"];
  const $set = {};
  for (const k of allowed) if (patch[k] !== undefined) $set[k] = patch[k];

  const doc = await Ticket.findByIdAndUpdate(id, { $set }, { new: true });
  if (!doc) return null;

  await audit(actor, "ticket", id, "update", { fields: Object.keys($set) }, req);
  return doc;
}

async function changeStatus(id, to, actor, note, req) {
  const doc = await Ticket.findById(id);
  if (!doc) return null;
  if (!canTransition(doc.status, to)) throw new Error(`Invalid transition ${doc.status} -> ${to}`);

  const from = doc.status;
  doc.status = to;
  doc.events.push({ at:new Date(), by: actor, action:"status_change", from, to, note });

  if (!doc.sla.firstResponseAt && to !== "pending") {
    doc.sla.firstResponseAt = new Date();
  }
  if (to === "resolved") doc.sla.resolvedAt = new Date();

  await doc.save();
  await audit(actor, "ticket", id, "status_change", { from, to, note }, req);
  return doc;
}

async function addAttachment(id, att, actor, req) {
  const doc = await Ticket.findById(id);
  if (!doc) return null;
  doc.attachments.push({ ...att, uploadedBy: att.uploadedBy || actor.role, at: new Date() });
  doc.events.push({ at:new Date(), by: actor, action:"add_attachment", note: att.url });
  await doc.save();
  await audit(actor, "ticket", id, "add_attachment", { url: att.url }, req);
  return doc;
}

async function askMoreInfo(id, message, actor, req) {
  await changeStatus(id, "waiting_customer", actor, message, req);
  // enqueue notify here if cần (email/SMS/push)
  return Ticket.findById(id);
}

async function startProcess(id, actor, req) {
  return changeStatus(id, "processing", actor, "CSKH start processing", req);
}

async function proposeSolution(id, proposal, actor, req) {
  const doc = await Ticket.findById(id);
  if (!doc) return null;

  // business validate
  if (proposal.kind === "refund" && !(proposal.amount > 0)) {
    throw new Error("Refund amount must be > 0");
  }

  doc.proposal = {
    kind: proposal.kind,
    amount: proposal.amount,
    exchangeSkuId: proposal.exchangeSkuId,
    reason: proposal.reason,
    createdAt: new Date(),
    createdBy: actor.id
  };
  await doc.save();

  await changeStatus(id, "escalated", actor, "Proposed by CSKH", req);
  await audit(actor, "ticket", id, "propose", { proposal: doc.proposal }, req);
  return Ticket.findById(id);
}

async function approve(id, reason, actor, req) {
  const doc = await Ticket.findById(id);
  if (!doc) return null;
  if (doc.status !== "escalated") throw new Error("Only escalated can be approved");

  doc.approval = { status: "approved", decidedBy: actor.id, decidedAt: new Date(), reason };
  await doc.save();
  await audit(actor, "ticket", id, "approve", { reason }, req);

  await changeStatus(id, "approved", actor, "Owner/Admin approved", req);
  return Ticket.findById(id);
}

async function reject(id, reason, actor, req) {
  const doc = await Ticket.findById(id);
  if (!doc) return null;
  if (doc.status !== "escalated") throw new Error("Only escalated can be rejected");

  doc.approval = { status: "rejected", decidedBy: actor.id, decidedAt: new Date(), reason };
  await doc.save();
  await audit(actor, "ticket", id, "reject", { reason }, req);

  await changeStatus(id, "rejected", actor, "Owner/Admin rejected", req);
  return Ticket.findById(id);
}

module.exports = {
  listTickets, getTicket, createTicket, updateTicket,
  changeStatus, addAttachment, askMoreInfo, startProcess,
  proposeSolution, approve, reject, audit
};
