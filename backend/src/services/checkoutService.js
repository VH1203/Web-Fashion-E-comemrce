const Cart = require("../models/Cart");
const Voucher = require("../models/Voucher");
const Order = require("../models/Order");
const Payment = require("../models/Payment");
const { v4: uuidv4 } = require("uuid");
const shippingSvc = require("./shippingService");
const paymentGw = require("./paymentGateway");

function toOrderItems(cartItems, selectedIds) {
  const ids = new Set(selectedIds || cartItems.map((i) => i._id));
  return cartItems.filter((i) => ids.has(i._id)).map((i) => ({
    product_id: i.product_id,
    variant_id: i.variant_id,
    name: i.name,
    image_url: i.image,
    qty: i.qty,
    price: i.price,
    discount: 0,
    total: i.price * i.qty,
  }));
}

async function applyVoucher(voucherCode, userId, subtotal) {
  if (!voucherCode) return { voucher: null, discount: 0 };
  const v = await Voucher.findOne({ code: voucherCode, is_active: true });
  if (!v) return { voucher: null, discount: 0 };
  // rules tối giản
  const discount = Math.min(
    v.type === "percent" ? Math.round((subtotal * v.value) / 100) : v.value,
    v.max_discount || Infinity
  );
  return { voucher: v, discount: Math.max(0, discount) };
}

exports.preview = async ({ userId, selected_item_ids, address, address_id, ship_provider, voucher_code }) => {
  const cart = await Cart.findOne({ user_id: userId }).lean();
  if (!cart || !cart.items?.length) throw Object.assign(new Error("Giỏ hàng trống"), { status: 400 });

  const items = toOrderItems(cart.items, selected_item_ids);
  if (!items.length) throw Object.assign(new Error("Chưa chọn sản phẩm"), { status: 400 });

  const subtotal = items.reduce((s, it) => s + it.total, 0);
  const shipping_fee = await shippingSvc.calculate(ship_provider || "GHN", address_id || null, address || null, items);
  const { voucher, discount } = await applyVoucher(voucher_code, userId, subtotal);
  const total = Math.max(0, subtotal + shipping_fee - discount);

  return {
    items, subtotal, shipping_fee, discount, total,
    currency: "VND",
    voucher: voucher ? { _id: voucher._id, code: voucher.code } : null,
    payment_methods: ["COD","VNPAY","MOMO","WALLET","CARD"],
  };
};

exports.confirm = async ({
  userId, shopId, address_id, note, ship_provider, voucher_code,
  selected_item_ids, payment_method, payment_extra = {}, return_urls
}) => {
  // 1) Preview để khoá số tiền
  const pv = await this.preview({ userId, selected_item_ids, address_id, ship_provider, voucher_code });

  const orderCode = `ORD${new Date().toISOString().slice(2,10).replace(/-/g,"")}-${uuidv4().slice(0,6).toUpperCase()}`;

  // 2) Tạo Order
  const order = await Order.create({
    order_code: orderCode,
    user_id: userId,
    shop_id: shopId || "shop-admin",
    items: pv.items,
    address_id,
    voucher_id: pv.voucher?._id || null,
    shipping_provider: ship_provider || "GHN",
    shipping_fee: pv.shipping_fee,
    total_price: pv.total,
    payment_method: payment_method || "COD",
    payment_status: "pending",
    note,
    status: "pending",
    // (Optional) lưu snapshot để đối soát
    preview_snapshot: {
      subtotal: pv.subtotal,
      shipping_fee: pv.shipping_fee,
      discount: pv.discount,
      total: pv.total,
      currency: pv.currency,
    },
  });

  // 3) COD -> return ngay
  if (!payment_method || payment_method === "COD") {
    return { order_id: order._id, order_code: order.order_code, pay_url: null };
  }

  // 4) Online -> tạo Payment
  await Payment.create({
    order_id: order._id,
    user_id: userId,
    shop_id: order.shop_id,
    gateway: payment_method === "MOMO" ? "MOMO" : (payment_method === "VNPAY" || payment_method === "CARD") ? "VNPAY" : "BANK",
    method: payment_method === "WALLET" ? "wallet" : "bank_transfer",
    amount: pv.total,
    currency: "VND",
    status: "pending",
    return_url: return_urls?.success,
    idempotency_key: uuidv4(),
    expires_at: new Date(Date.now() + 15 * 60 * 1000),
    // >>> thêm 2 dòng này để reconcile/tra cứu nhanh
    txn_ref: order.order_code,        // TxnRef chung (VNPAY vnp_TxnRef / MoMo orderId)
    gateway_txn_id: null,             // sẽ cập nhật khi IPN/return
  });

  // 5) Build pay URL theo cổng và mode
  let redirectUrl = null;

  if (payment_method === "VNPAY") {
    const mode = String(payment_extra?.vnpay_mode || "QR").toUpperCase(); // "QR" | "CARD"
    const bankCode = mode === "QR" ? "VNPAYQR" : "VNBANK"; // quốc tế dùng "INTCARD" nếu cần
    redirectUrl = paymentGw.buildVNPayUrl({
      amount: pv.total,
      orderCode: order.order_code,  // dùng order_code làm TxnRef
      orderInfo: `DFS ${order.order_code}`,
      returnUrl: return_urls?.vnpay || `${process.env.FRONTEND_URL}/payment/return?vnpay=1`,
      bankCode,
      ipAddr: "127.0.0.1",
    });
  } else if (payment_method === "MOMO") {
    const momo = await paymentGw.createMoMoPayment({
      amount: pv.total,
      orderCode: order.order_code,  // orderId của MoMo = order_code
      orderInfo: `DFS ${order.order_code}`,
      returnUrl: return_urls?.momo || `${process.env.FRONTEND_URL}/payment/return?momo=1`,
      notifyUrl: `${process.env.API_URL}/api/payment/momo/ipn`, // <== dùng /ipn cho khớp router
    });
    redirectUrl = momo.payUrl;
  } else if (payment_method === "CARD") {
    // đi VNPay mode thẻ
    const bankCode = "VNBANK"; // hoặc "INTCARD"
    redirectUrl = paymentGw.buildVNPayUrl({
      amount: pv.total,
      orderCode: order.order_code,
      orderInfo: `DFS ${order.order_code}`,
      returnUrl: return_urls?.vnpay || `${process.env.FRONTEND_URL}/payment/return?vnpay=1`,
      bankCode,
      ipAddr: "127.0.0.1",
    });
  }

  return { order_id: order._id, order_code: order.order_code, pay_url: redirectUrl };
};
