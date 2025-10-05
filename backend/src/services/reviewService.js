const { v4: uuid } = require("uuid");
const Review = require("../models/Review");
const AuditLog = require("../models/AuditLog");

async function replyReview(id, content, actor, req) {
  const doc = await Review.findById(id);
  if (!doc) return null;
  doc.reply = { by: actor.id, content, at: new Date() };
  await doc.save();

  await AuditLog.create({
    _id: uuid(),
    actor, entity: { type:"review", id },
    action:"reply", metadata:{ length: content?.length },
    ip:req.ip, userAgent:req.headers["user-agent"], at:new Date()
  });
  return doc;
}

module.exports = { replyReview };
