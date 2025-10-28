const mongoose = require('mongoose');

const LogSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ['chat', 'email', 'sms', 'call', 'push', 'note'], default: 'note' },
    message: { type: String, required: true },
    by_user_id: { type: String, required: true }, // id của support/customer thực hiện log
  },
  { _id: true, timestamps: { createdAt: true, updatedAt: false } }
);

const TicketSchema = new mongoose.Schema(
  {
    order_id: { type: String, default: null },
    user_id: { type: String, required: true }, // customer tạo
    shop_id: { type: String, required: true },

    subject: { type: String, required: true, trim: true, maxlength: 200 },
    message: { type: String, required: true, trim: true, maxlength: 5000 },
    images: [{ type: String }],

    status: {
      type: String,
      enum: ['pending', 'in_progress', 'escalated', 'resolved', 'closed'],
      default: 'pending',
      index: true,
    },
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },

    // optional: ai đang xử lý
    assigned_to: { type: String, default: null }, // support id
    escalated_to: { type: String, default: null }, // owner id

    logs: { type: [LogSchema], default: [] },
  },
  { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } }
);

// Index phục vụ lọc
TicketSchema.index({ user_id: 1, createdAt: -1 });
TicketSchema.index({ shop_id: 1, status: 1, updatedAt: -1 });
TicketSchema.index({ assigned_to: 1, status: 1 });

module.exports = mongoose.model('Ticket', TicketSchema);
