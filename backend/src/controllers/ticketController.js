const service = require('../services/ticketService');

const create = async (req, res, next) => {
  try {
    // chỉ Customer mới được tạo
    const user = req.user; // từ authMiddleware
    const payload = {
      ...req.body,
      user_id: user.id || user._id,
    };

    // validate tối thiểu
    if (!payload.subject || !payload.message || !payload.shop_id) {
      return res.status(400).json({ message: 'subject, message, shop_id are required' });
    }

    const doc = await service.createTicket({ payload, files: req.files });
    res.status(201).json(doc);
  } catch (err) {
    next(err);
  }
};

const assign = async (req, res, next) => {
  try {
    const { id } = req.params; // ticketId
    const { supportId } = req.body;
    const actorId = req.user.id || req.user._id;
    const doc = await service.assignTicket({ ticketId: id, supportId, actorId });
    res.json(doc);
  } catch (err) {
    next(err);
  }
};

const addLog = async (req, res, next) => {
  try {
    const { id } = req.params;
    const byUserId = req.user.id || req.user._id;
    const { type = 'note', message } = req.body;
    const doc = await service.addLog({ ticketId: id, byUserId, type, message });
    res.json(doc);
  } catch (err) {
    next(err);
  }
};

const setStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const actorId = req.user.id || req.user._id;
    const doc = await service.updateStatus({ ticketId: id, status, actorId });
    res.json(doc);
  } catch (err) {
    next(err);
  }
};

const detail = async (req, res, next) => {
  try {
    const doc = await service.getTicket(req.params.id);
    if (!doc) return res.status(404).json({ message: 'Ticket not found' });
    res.json(doc);
  } catch (err) {
    next(err);
  }
};

const myTickets = async (req, res, next) => {
  try {
    const userId = req.user.id || req.user._id;
    const docs = await service.listByCustomer(userId, req.query);
    res.json(docs);
  } catch (err) {
    next(err);
  }
};

const supportQueue = async (req, res, next) => {
  try {
    const supportId = req.user.id || req.user._id;
    const shopId = req.user.shop_id || req.query.shop_id; // tuỳ hệ thống của anh
    if (!shopId) return res.status(400).json({ message: 'shop_id required' });

    const docs = await service.listForSupport({ supportId, shopId, status: req.query.status });
    res.json(docs);
  } catch (err) {
    next(err);
  }
};

module.exports = {
  create,
  assign,
  addLog,
  setStatus,
  detail,
  myTickets,
  supportQueue,
};
