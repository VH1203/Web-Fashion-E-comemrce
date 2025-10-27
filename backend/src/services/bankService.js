const BankAccount = require("../models/BankAccount");

exports.list = (userId) =>
  BankAccount.find({ user_id: userId }).sort({ createdAt: -1 }).lean();

exports.create = async (userId, p) => {
  const { bank_name, account_number, owner_name, logo_url } = p || {};
  if (!bank_name || !account_number || !owner_name) {
    const e = new Error("Missing required fields"); e.status = 400; throw e;
  }
  return BankAccount.create({ user_id: userId, bank_name, account_number, owner_name, logo_url });
};

exports.update = async (userId, id, p) => {
  const item = await BankAccount.findOne({ _id: id, user_id: userId });
  if (!item) return null;
  const { bank_name, account_number, owner_name, logo_url } = p || {};
  if (bank_name !== undefined) item.bank_name = bank_name;
  if (account_number !== undefined) item.account_number = account_number;
  if (owner_name !== undefined) item.owner_name = owner_name;
  if (logo_url !== undefined) item.logo_url = logo_url;
  await item.save();
  return item;
};

exports.remove = (userId, id) =>
  BankAccount.findOneAndDelete({ _id: id, user_id: userId });
