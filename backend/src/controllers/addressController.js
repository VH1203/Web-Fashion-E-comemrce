// backend/src/controllers/addressController.js
const { v4: uuidv4 } = require("uuid");
const Address = require("../models/Address");

exports.getAddresses = async (req, res, next) => {
  try {
    const addresses = await Address.find({ user_id: req.user.sub });
    res.json(addresses);
  } catch (err) {
    next(err);
  }
};

exports.addAddress = async (req, res, next) => {
  try {
    const { name, phone, city, district, ward, street, is_default } = req.body;
    const addr = new Address({
      _id: uuidv4(),
      user_id: req.user.sub,
      name,
      phone,
      city,
      district,
      ward,
      street,
      is_default,
    });
    await addr.save();
    res.status(201).json(addr);
  } catch (err) {
    next(err);
  }
};

exports.deleteAddress = async (req, res, next) => {
  try {
    const { id } = req.params;
    await Address.deleteOne({ _id: id, user_id: req.user.sub });
    res.json({ message: "Xóa địa chỉ thành công" });
  } catch (err) {
    next(err);
  }
};
