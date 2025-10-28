const Ticket = require('../models/Ticket');
const AuditLog = require('../models/AuditLog'); // file AuditLog.js anh đã có

async function createTicket({ payload, files }) {
  const images = (files || []).map(f => f.path || f.location || f.url || f.filename).filter(Boolean);

  const doc = await Ticket.create({
    order_id: payload.order_id || null,
    user_id: payload.user_id,        // từ auth
    shop_id: payload.shop_id,
    subject: payload.subject,
    message: payload.message,
    images,
    priority: payload.priority || 'medium',
    status: 'pending',
    logs: [
      {
        type: 'note',
        message: 'Ticket created',
        by_user_id: payload.user_id,
      },
    ],
  });

  await AuditLog.create({
    actor_id: payload.user_id,
    action: 'ticket.create',
    target_id: doc._id.toString(),
    metadata: { order_id: payload.order_id, shop_id: payload.shop_id },
  });

  return doc;
}

async function assignTicket({ ticketId, supportId, actorId }) {
  const doc = await Ticket.findByIdAndUpdate(
    ticketId,
    { assigned_to: supportId, status: 'in_progress' },
    { new: true }
  );
  if (!doc) throw new Error('Ticket not found');

  doc.logs.push({ type: 'note', message: 'Assigned to support', by_user_id: actorId });
  await doc.save();

  await AuditLog.create({
    actor_id: actorId,
    action: 'ticket.assign',
    target_id: ticketId,
    metadata: { supportId },
  });

  return doc;
}

async function addLog({ ticketId, byUserId, type = 'note', message }) {
  const doc = await Ticket.findById(ticketId);
  if (!doc) throw new Error('Ticket not found');
  doc.logs.push({ type, message, by_user_id: byUserId });
  await doc.save();

  await AuditLog.create({
    actor_id: byUserId,
    action: 'ticket.log',
    target_id: ticketId,
    metadata: { type },
  });

  return doc;
}

async function updateStatus({ ticketId, status, actorId }) {
  const allow = ['pending', 'in_progress', 'escalated', 'resolved', 'closed'];
  if (!allow.includes(status)) throw new Error('Invalid status');

  const doc = await Ticket.findByIdAndUpdate(ticketId, { status }, { new: true });
  if (!doc) throw new Error('Ticket not found');

  doc.logs.push({ type: 'note', message: `Status -> ${status}`, by_user_id: actorId });
  await doc.save();

  await AuditLog.create({
    actor_id: actorId,
    action: 'ticket.status',
    target_id: ticketId,
    metadata: { status },
  });

  return doc;
}

async function getTicket(id) {
  return Ticket.findById(id);
}

async function listByCustomer(userId, query = {}) {
  const { status } = query;
  const filter = { user_id: userId };
  if (status) filter.status = status;
  return Ticket.find(filter).sort({ createdAt: -1 });
}

async function listForSupport({ supportId, shopId, status }) {
  const filter = { shop_id: shopId };
  if (status) filter.status = status;
  // chỉ những ticket đã assign cho support này hoặc chưa assign (queue)
  filter.$or = [{ assigned_to: supportId }, { assigned_to: null }];
  return Ticket.find(filter).sort({ updatedAt: -1 });
}

module.exports = {
  createTicket,
  assignTicket,
  addLog,
  updateStatus,
  getTicket,
  listByCustomer,
  listForSupport,
};
