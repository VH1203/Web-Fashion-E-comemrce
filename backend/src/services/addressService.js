const Address = require("../models/Address");

exports.list = (userId) =>
  Address.find({ user_id: userId }).sort({ is_default: -1, createdAt: -1 }).lean();

exports.create = async (userId, p) => {
  const { name, phone, city, district, ward, street, is_default } = p || {};
  if (!name || !phone || !city || !district || !ward || !street) {
    const e = new Error("Missing required fields"); e.status = 400; throw e;
  }
  if (is_default) {
    await Address.updateMany({ user_id: userId, is_default: true }, { $set: { is_default: false } });
  }
  return Address.create({ user_id: userId, name, phone, city, district, ward, street, is_default: !!is_default });
};

exports.update = async (userId, id, p) => {
  const addr = await Address.findOne({ _id: id, user_id: userId });
  if (!addr) return null;
  const { name, phone, city, district, ward, street, is_default } = p || {};
  if (is_default === true) {
    await Address.updateMany({ user_id: userId, is_default: true }, { $set: { is_default: false } });
  }
  Object.assign(addr, { name, phone, city, district, ward, street, is_default });
  await addr.save();
  return addr;
};

exports.remove = (userId, id) => Address.findOneAndDelete({ _id: id, user_id: userId });

exports.setDefault = async (userId, id) => {
  const addr = await Address.findOne({ _id: id, user_id: userId });
  if (!addr) return null;
  await Address.updateMany({ user_id: userId, is_default: true }, { $set: { is_default: false } });
  addr.is_default = true; await addr.save();
  return addr;
};
