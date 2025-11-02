const { getRevenueByCategory } = require("../services/orderService");

const Order = require("../models/Order");
const Cart = require("../models/Cart");
const Refund = require("../models/Refund");
const Ticket = require("../models/Ticket");
const shippingSvc = require("../services/shippingService");
const invoiceSvc = require("../services/invoiceService");
const { v4: uuidv4 } = require("uuid");
const notification = require("../services/notificationService");
const User = require("../models/User");

const SAFE_FIELDS =
  "_id order_code items address_id voucher_id payment_method payment_status shipping_provider shipping_fee total_price note status inventory_adjusted createdAt updatedAt";

const STATUS_MAP = {
  pending: "Chờ xác nhận",
  confirmed: "Đang xử lý",
  processing: "Đang xử lý",
  shipping: "Đang giao",
  delivered: "Hoàn thành",
  canceled: "Đã hủy",
  refund_pending: "Chờ hoàn tiền/đổi trả",
  refund_completed: "Hoàn tiền/Đổi trả xong",
  review: "Cần kiểm tra",
};

// ================== LIST ==================
exports.list = async (req, res, next) => {
  try {
    const userId = req.userId || req.user?._id;
    const { status, page = 1, limit = 10, q } = req.query;

    const cond = { user_id: userId };
    if (status) cond.status = status;
    if (q) cond.order_code = new RegExp(q, "i");

    const skip = (Number(page) - 1) * Number(limit);

    const [items, total] = await Promise.all([
      Order.find(cond)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .select(SAFE_FIELDS)
        .lean(),
      Order.countDocuments(cond),
    ]);

    res.json({
      status: "success",
      data: { items, total, page: Number(page), limit: Number(limit) },
    });
  } catch (e) {
    next(e);
  }
};

// ================== DETAIL ==================
exports.detail = async (req, res, next) => {
  try {
    const userId = req.userId || req.user?._id;
    const id = req.params.id;

    const ord = await Order.findOne({
      user_id: userId,
      $or: [{ _id: id }, { order_code: id }],
    }).lean();

    if (!ord)
      return res
        .status(404)
        .json({ status: "fail", message: "Không tìm thấy đơn" });

    ord.status_text = STATUS_MAP[ord.status] || ord.status;

    res.json({ status: "success", data: ord });
  } catch (e) {
    next(e);
  }
};

// ================== CANCEL ==================
exports.cancel = async (req, res, next) => {
  try {
    const userId = req.userId || req.user?._id;
    const id = req.params.id;

    const ord = await Order.findOne({
      user_id: userId,
      $or: [{ _id: id }, { order_code: id }],
    });

    if (!ord)
      return res
        .status(404)
        .json({ status: "fail", message: "Không tìm thấy đơn" });

    if (["shipping", "delivered"].includes(ord.status)) {
      return res.status(400).json({
        status: "fail",
        message: "Đơn đang giao/đã giao, không thể hủy.",
      });
    }

    ord.status = "canceled";
    if (ord.payment_status === "paid") {
      ord.payment_status = "refund_pending";
    }
    await ord.save();

    res.json({
      status: "success",
      data: { order_id: ord._id, status: ord.status },
    });
  } catch (e) {
    next(e);
  }
};

// ================== REORDER ==================
exports.reorder = async (req, res, next) => {
  try {
    const userId = req.userId || req.user?._id;
    const id = req.params.id;

    const ord = await Order.findOne({
      user_id: userId,
      $or: [{ _id: id }, { order_code: id }],
    }).lean();

    if (!ord)
      return res
        .status(404)
        .json({ status: "fail", message: "Không tìm thấy đơn" });

    let cart = await Cart.findOne({ user_id: userId });
    if (!cart)
      cart = await Cart.create({
        _id: `cart-${uuidv4()}`,
        user_id: userId,
        items: [],
      });

    const mapKey = (it) => `${it.product_id}-${it.variant_id || ""}`;
    const ex = new Map((cart.items || []).map((i) => [mapKey(i), i]));

    for (const it of ord.items || []) {
      const key = mapKey(it);
      const exist = ex.get(key);
      if (exist) {
        exist.qty = (exist.qty || 0) + (it.qty || 1);
      } else {
        cart.items.push({
          _id: `ci-${uuidv4()}`,
          product_id: it.product_id,
          variant_id: it.variant_id,
          name: it.name,
          image: it.image_url,
          qty: it.qty || 1,
          price: it.price,
        });
      }
    }

    await cart.save();

    res.json({
      status: "success",
      data: { cart_id: cart._id, count: cart.items.length },
    });
  } catch (e) {
    next(e);
  }
};

// ================== REQUEST REFUND ==================
exports.requestRefund = async (req, res, next) => {
  try {
    const userId = req.userId || req.user?._id;
    const id = req.params.id;
    const { reason, items = [], images = [] } = req.body || {};

    const ord = await Order.findOne({
      user_id: userId,
      $or: [{ _id: id }, { order_code: id }],
    });

    if (!ord)
      return res
        .status(404)
        .json({ status: "fail", message: "Không tìm thấy đơn" });

    if (ord.status !== "delivered") {
      return res.status(400).json({
        status: "fail",
        message: "Chỉ yêu cầu hoàn/đổi sau khi đơn đã giao thành công.",
      });
    }

    const now = Date.now();
    const deliveredAt = new Date(ord.updatedAt).getTime();
    const diffDays = (now - deliveredAt) / (1000 * 60 * 60 * 24);

    if (diffDays > 3) {
      return res.status(400).json({
        status: "fail",
        message: "Đã quá hạn 3 ngày để yêu cầu hoàn/đổi.",
      });
    }

    const refund = await Refund.create({
      _id: `rf-${uuidv4()}`,
      order_id: ord._id,
      user_id: userId,
      reason,
      items,
      images,
      status: "refund_pending",
      method: "bank_transfer",
    });

    ord.status = "refund_pending";
    await ord.save();

    res.json({
      status: "success",
      data: { refund_id: refund._id, order_status: ord.status },
    });
  } catch (e) {
    next(e);
  }
};

// ================== TRACKING ==================
exports.tracking = async (req, res, next) => {
  try {
    const userId = req.userId || req.user?._id;
    const id = req.params.id;

    const ord = await Order.findOne({
      user_id: userId,
      $or: [{ _id: id }, { order_code: id }],
    }).lean();

    if (!ord)
      return res
        .status(404)
        .json({ status: "fail", message: "Không tìm thấy đơn" });

    const t = await shippingSvc.getTracking(
      ord.shipping_provider,
      ord.order_code
    );

    res.json({ status: "success", data: t });
  } catch (e) {
    next(e);
  }
};

// ================== INVOICE PDF ==================
exports.invoicePdf = async (req, res, next) => {
  try {
    const userId = req.userId || req.user?._id;
    const id = req.params.id;

    const ord = await Order.findOne({
      user_id: userId,
      $or: [{ _id: id }, { order_code: id }],
    });

    if (!ord)
      return res
        .status(404)
        .json({ status: "fail", message: "Không tìm thấy đơn" });

    const url = await invoiceSvc.generateInvoice(ord.toObject());

    res.json({ status: "success", data: { url } });
  } catch (e) {
    next(e);
  }
};

// ================== SEND REVIEW REMINDER ==================
exports.sendReviewReminder = async (req, res, next) => {
  try {
    const userId = req.userId || req.user?._id;
    const id = req.params.id;

    const ord = await Order.findOne({
      user_id: userId,
      $or: [{ _id: id }, { order_code: id }],
    }).lean();

    if (!ord)
      return res
        .status(404)
        .json({ status: "fail", message: "Không tìm thấy đơn" });

    if (ord.status !== "delivered") {
      return res.status(400).json({
        status: "fail",
        message: "Chỉ nhắc đánh giá khi đơn đã hoàn thành.",
      });
    }

    const user = await User.findById(userId).lean();
    const email = user?.email;
    const pushToken = user?.push_token;

    if (email) {
      await notification.sendEmail({
        to: email,
        subject: `Đánh giá đơn hàng ${ord.order_code}`,
        html: `<p>Chào bạn,</p>
               <p>Đơn <b>${ord.order_code}</b> đã hoàn thành. Mời bạn để lại đánh giá sản phẩm để nhận ưu đãi.</p>
               <p><a href="${process.env.FRONTEND_URL}/orders/${ord._id}">Mở đơn hàng</a></p>`,
      });
    }

    if (pushToken) {
      await notification.sendPush({
        token: pushToken,
        title: "Đánh giá đơn hàng",
        body: `Đơn ${ord.order_code} đã hoàn thành – mời bạn đánh giá!`,
        data: { order_id: ord._id },
      });
    }

    res.json({
      status: "success",
      data: { mailed: !!email, pushed: !!pushToken },
    });
  } catch (e) {
    next(e);
  }
};

exports.getRevenueByCategoryController = async (req, res) => {
  try {
    const data = await getRevenueByCategory();
    res.status(200).json({
      success: true,
      message: "Lấy doanh thu theo danh mục thành công",
      data,
    });
  } catch (error) {
    console.error("Error in getRevenueByCategoryController:", error);
    res.status(500).json({
      success: false,
      message: "Không thể lấy doanh thu theo danh mục",
    });
  }
};
