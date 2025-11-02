// controllers/checkoutController.js
const checkoutSvc = require("../services/checkoutService");

exports.preview = async (req, res, next) => {
  try {
    const r = await checkoutSvc.preview({
      userId: req.userId || req.user?._id,
      selected_item_ids: req.body.selected_item_ids,
      address_id: req.body.address_id,
      ship_provider: req.body.shipping_provider,
      voucher_code: req.body.voucher_code
    });
    res.json({ status: "success", data: r });
  } catch (e) {
    console.error("PREVIEW_ERROR:", e);
    next(e);
  }
};

exports.confirm = async (req, res, next) => {
  try {
    const payload = {
      userId: req.userId || req.user?._id,
      shopId: req.body.shop_id,
      selected_item_ids: req.body.selected_item_ids,
      address_id: req.body.address_id,
      note: req.body.note,
      ship_provider: req.body.shipping_provider,
      voucher_code: req.body.voucher_code,
      payment_method: req.body.payment_method,
      payment_extra: req.body.payment_extra || {},
      return_urls: req.body.return_urls
    };
    console.log("CONFIRM_IN:", {
      userId: payload.userId,
      address_id: payload.address_id,
      items: (payload.selected_item_ids || []).length,
      method: payload.payment_method
    });
    const r = await checkoutSvc.confirm(payload);
    res.json({ status: "success", data: r });
  } catch (e) {
    console.error("CONFIRM_ERROR:", e);
    next(e);
  }
};
