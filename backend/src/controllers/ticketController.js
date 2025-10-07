// ticketController.js 
const { ticketsToCsv } = require("../utils/exportCsv");
const { ticketsToHtml } = require("../utils/exportPdf");
const ticketService = require("../services/ticketService");

function pickFilter(query, user) {
  const filter = { shopId: user.shopId }; // CSKH chỉ thấy ticket của shop mình
  if (query.status) filter.status = { $in: String(query.status).split(",") };
  if (query.type) filter.type = String(query.type);
  if (query.priority) filter.priority = String(query.priority);
  if (query.customerId) filter.customerId = String(query.customerId);
  if (query.channel) filter.channel = String(query.channel);
  if (query.from || query.to) {
    filter.createdAt = {};
    if (query.from) filter.createdAt.$gte = new Date(query.from);
    if (query.to) filter.createdAt.$lte = new Date(query.to);
  }
  if (query.keyword) {
    filter.$or = [
      { code: new RegExp(query.keyword, "i") },
      { title: new RegExp(query.keyword, "i") },
      { description: new RegExp(query.keyword, "i") }
    ];
  }
  return filter;
}

exports.list = async (req, res, next) => {
  try {
    const filter = pickFilter(req.query, req.user);
    const page = parseInt(req.query.page||"1",10);
    const size = parseInt(req.query.size||"20",10);
    const sort = req.query.sort || "-createdAt";
    const data = await ticketService.listTickets(filter, { page, size, sort });
    res.json(data);
  } catch (e) { next(e); }
};

exports.detail = async (req, res, next) => {
  try {
    const doc = await ticketService.getTicket(req.params.id);
    if (!doc || doc.shopId !== req.user.shopId) return res.status(404).json({ message:"Not found" });
    res.json(doc);
  } catch (e) { next(e); }
};

exports.create = async (req, res, next) => {
  try {
    const actor = { id: req.user.id, role: req.user.role };
    const payload = { ...req.body, shopId: req.user.shopId };
    const doc = await ticketService.createTicket(payload, actor, req);
    res.status(201).json(doc);
  } catch (e) { next(e); }
};

exports.update = async (req, res, next) => {
  try {
    const actor = { id: req.user.id, role: req.user.role };
    const doc = await ticketService.updateTicket(req.params.id, req.body, actor, req);
    if (!doc) return res.status(404).json({ message: "Not found" });
    res.json(doc);
  } catch (e) { next(e); }
};

exports.addAttachment = async (req, res, next) => {
  try {
    const actor = { id: req.user.id, role: req.user.role };
    const fileUrl = req.file?.cdnUrl || req.file?.path || req.body.url;
    if (!fileUrl) return res.status(400).json({ message: "Missing file/url" });
    const doc = await ticketService.addAttachment(req.params.id, { url:fileUrl, type:req.body.type||"image" }, actor, req);
    if (!doc) return res.status(404).json({ message: "Not found" });
    res.json(doc);
  } catch (e) { next(e); }
};

exports.askMore = async (req, res, next) => {
  try {
    const actor = { id: req.user.id, role: req.user.role };
    const doc = await ticketService.askMoreInfo(req.params.id, req.body.message, actor, req);
    if (!doc) return res.status(404).json({ message:"Not found" });
    res.json(doc);
  } catch (e) { next(e); }
};

exports.process = async (req, res, next) => {
  try {
    const actor = { id: req.user.id, role: req.user.role };
    const doc = await ticketService.startProcess(req.params.id, actor, req);
    if (!doc) return res.status(404).json({ message:"Not found" });
    res.json(doc);
  } catch (e) { next(e); }
};

exports.propose = async (req, res, next) => {
  try {
    const actor = { id: req.user.id, role: req.user.role };
    const doc = await ticketService.proposeSolution(req.params.id, req.body, actor, req);
    if (!doc) return res.status(404).json({ message:"Not found" });
    res.json(doc);
  } catch (e) { next(e); }
};

exports.approve = async (req, res, next) => {
  try {
    const actor = { id: req.user.id, role: req.user.role };
    const doc = await ticketService.approve(req.params.id, req.body.reason, actor, req);
    if (!doc) return res.status(404).json({ message:"Not found" });
    res.json(doc);
  } catch (e) { next(e); }
};

exports.reject = async (req, res, next) => {
  try {
    const actor = { id: req.user.id, role: req.user.role };
    const doc = await ticketService.reject(req.params.id, req.body.reason, actor, req);
    if (!doc) return res.status(404).json({ message:"Not found" });
    res.json(doc);
  } catch (e) { next(e); }
};

exports.resolve = async (req, res, next) => {
  try {
    const actor = { id: req.user.id, role: req.user.role };
    const doc = await ticketService.changeStatus(req.params.id, "resolved", actor, req.body?.note, req);
    if (!doc) return res.status(404).json({ message:"Not found" });
    res.json(doc);
  } catch (e) { next(e); }
};

exports.close = async (req, res, next) => {
  try {
    const actor = { id: req.user.id, role: req.user.role };
    const doc = await ticketService.changeStatus(req.params.id, "closed", actor, req.body?.note, req);
    if (!doc) return res.status(404).json({ message:"Not found" });
    res.json(doc);
  } catch (e) { next(e); }
};

exports.exportCsv = async (req, res, next) => {
  try {
    const filter = pickFilter(req.query, req.user);
    const { items } = await ticketService.listTickets(filter, { page:1, size:5000 });
    const csv = ticketsToCsv(items.map(i => i.toObject()));
    res.setHeader("Content-Type","text/csv; charset=utf-8");
    res.setHeader("Content-Disposition","attachment; filename=tickets.csv");
    res.send(csv);
  } catch (e) { next(e); }
};

exports.exportPdf = async (req, res, next) => {
  try {
    const filter = pickFilter(req.query, req.user);
    const { items } = await ticketService.listTickets(filter, { page:1, size:1000 });
    const html = ticketsToHtml(items);
    res.setHeader("Content-Type","text/html; charset=utf-8"); // bạn có thể render ra PDF thực sự bằng puppeteer
    res.send(html);
  } catch (e) { next(e); }
};
exports.createIntake = async (req,res,next)=>{
  try{
    const actor = { id:req.user.id, role:req.user.role };
    const doc = await ticketService.createIntake(req.body, actor, req);
    res.status(201).json(doc);
  }catch(e){ next(e); }
};

exports.routeToShop = async (req,res,next)=>{
  try{
    const actor = { id:req.user.id, role:req.user.role };
    const doc = await ticketService.routeToShop(req.params.id, req.body, actor, req);
    if(!doc) return res.status(404).json({message:"Not found"});
    res.json(doc);
  }catch(e){ next(e); }
};

exports.assignAgent = async (req,res,next)=>{
  try{
    const actor = { id:req.user.id, role:req.user.role };
    const doc = await ticketService.assignAgent(req.params.id, req.body, actor, req);
    if(!doc) return res.status(404).json({message:"Not found"});
    res.json(doc);
  }catch(e){ next(e); }
};

exports.claimTicket = async (req,res,next)=>{
  try{
    const actor = { id:req.user.id, role:req.user.role };
    const doc = await ticketService.claimTicket(req.params.id, actor, req);
    if(!doc) return res.status(404).json({message:"Not found"});
    res.json(doc);
  }catch(e){ next(e); }
};

exports.returnToSystem = async (req,res,next)=>{
  try{
    const actor = { id:req.user.id, role:req.user.role };
    const doc = await ticketService.returnToSystem(req.params.id, req.body?.reason, actor, req);
    if(!doc) return res.status(404).json({message:"Not found"});
    res.json(doc);
  }catch(e){ next(e); }
};
