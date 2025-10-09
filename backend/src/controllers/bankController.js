const { v4: uuidv4 } = require("uuid");
const BankAccount = require("../models/BankAccount");

exports.getBanks = async (req, res, next) => {
  try {
    const banks = await BankAccount.find({ user_id: req.user.sub });
    res.json(banks);
  } catch (err) {
    next(err);
  }
};

exports.addBank = async (req, res, next) => {
  try {
    const { bank_name, account_number, owner_name, logo } = req.body;
    const newBank = new BankAccount({
      _id: uuidv4(),
      user_id: req.user.sub,
      bank_name,
      account_number,
      owner_name,
      logo,
    });
    await newBank.save();
    res.status(201).json(newBank);
  } catch (err) {
    next(err);
  }
};

exports.deleteBank = async (req, res, next) => {
  try {
    const { id } = req.params;
    await BankAccount.deleteOne({ _id: id, user_id: req.user.sub });
    res.json({ message: "Xóa tài khoản ngân hàng thành công" });
  } catch (err) {
    next(err);
  }
};
