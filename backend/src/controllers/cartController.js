// backend/src/controllers/cartController.js
const cartService = require("../services/cartService");

exports.getCart = async (req, res, next) => {
  try {
    const data = await cartService.getCart(req.user._id);
    res.json({ status: "success", data });
  } catch (e) { next(e); }
};

exports.addItem = async (req, res, next) => {
  try {
    const { product_id, variant_id, qty } = req.body;
    const data = await cartService.addItem(req.user._id, { product_id, variant_id, qty });
    res.json({ status: "success", data });
  } catch (e) { next(e); }
};

exports.updateItem = async (req, res, next) => {
  try {
    const { itemId } = req.params;
    const { qty, variant_id } = req.body;
    const data = await cartService.updateItem(req.user._id, itemId, { qty, variant_id });
    res.json({ status: "success", data });
  } catch (e) { next(e); }
};

exports.removeItem = async (req, res, next) => {
  try {
    const { itemId } = req.params;
    const data = await cartService.removeItem(req.user._id, itemId);
    res.json({ status: "success", data });
  } catch (e) { next(e); }
};

exports.clearCart = async (req, res, next) => {
  try {
    const data = await cartService.clearCart(req.user._id);
    res.json({ status: "success", data });
  } catch (e) { next(e); }
};
