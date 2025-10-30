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

exports.confirm = async ({ userId, shopId, address_id, note, ship_provider, voucher_code, selected_item_ids, payment_method, return_urls }) => {
  // preview lại để khóa số tiền
  const pv = await this.preview({ userId, selected_item_ids, address_id, ship_provider, voucher_code });
  const orderCode = `ORD${new Date().toISOString().slice(2,10).replace(/-/g,"")}-${uuidv4().slice(0,6).toUpperCase()}`;

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
    payment_status: payment_method === "COD" ? "pending" : "pending",
    note,
    status: "pending",
  });

  // Online → tạo Payment và payUrl
  if (payment_method && payment_method !== "COD") {
    const pay = await Payment.create({
      order_id: order._id,
      user_id: userId,
      shop_id: order.shop_id,
      gateway: payment_method === "MOMO" ? "MOMO" : payment_method === "VNPAY" ? "VNPAY" : "BANK",
      method: payment_method === "WALLET" ? "wallet" : "bank_transfer",
      amount: pv.total,
      currency: "VND",
      status: "pending",
      return_url: return_urls?.success,
      idempotency_key: uuidv4(),
      expires_at: new Date(Date.now() + 15 * 60 * 1000),
    });

    let redirectUrl = null;
  if (payment_method === "VNPAY") {
    redirectUrl = paymentGw.buildVNPayUrl({
      amount: pv.total,
      orderId: order.order_code,                    
      orderInfo: `DFS ${order.order_code}`,
      returnUrl: return_urls?.vnpay || `${process.env.FRONTEND_URL}/payment/return?vnpay=1`,
    });
    } else if (payment_method === "MOMO") {
      const momo = await paymentGw.createMoMoPayment({
        amount: pv.total,
        orderId: order._id,
        orderInfo: `DFS ${orderCode}`,
        returnUrl: return_urls?.momo || `${process.env.FRONTEND_URL}/payment/return?momo=1`,
        notifyUrl: `${process.env.API_URL}/api/payment/momo/webhook`,
      });
      redirectUrl = momo.payUrl;
   } else if (payment_method === "CARD" || payment_method === "BANK") {
    redirectUrl = paymentGw.buildVNPayUrl({
      amount: pv.total,
      orderId: order.order_code,                    
      orderInfo: `DFS ${order.order_code}`,
      returnUrl: return_urls?.vnpay || `${process.env.FRONTEND_URL}/payment/return?vnpay=1`,
      bankCode: "VNBANK"
    });
    }

    return { order_id: order._id, order_code: order.order_code, pay_url: redirectUrl };
  }

  // COD
  return { order_id: order._id, order_code: order.order_code, pay_url: null };
};
