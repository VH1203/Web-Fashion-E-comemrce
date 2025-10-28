// backend/src/services/cartService.js
const { v4: uuidv4 } = require("uuid");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const ProductVariant = require("../models/ProductVariant");

async function getOrCreateCart(userId) {
  let cart = await Cart.findOne({ user_id: userId });
  if (!cart) cart = await Cart.create({ user_id: userId, items: [] });
  return cart;
}

function attrLabel(attrs = {}) {
  const keys = Object.keys(attrs).sort((a, b) => a.localeCompare(b));
  return keys.map(k => `${k}: ${attrs[k]}`).join(", ");
}

async function getVariantFull(variant_id) {
  const variant = await ProductVariant.findById(variant_id);
  if (!variant) throw new Error("Biến thể không tồn tại");
  const product = await Product.findById(variant.product_id);
  if (!product) throw new Error("Sản phẩm không tồn tại");
  return { product, variant };
}

exports.getCart = async (userId) => {
  const cart = await getOrCreateCart(userId);

  // enrich để FE đổi biến thể: trả về danh sách biến thể còn trong DB cho từng product
  const productIds = [...new Set(cart.items.map(i => i.product_id))];
  const products = await Product.find({ _id: { $in: productIds } });
  const variants = await ProductVariant.find({ product_id: { $in: productIds } });

  const variantMap = variants.reduce((m, v) => {
    if (!m[v.product_id]) m[v.product_id] = [];
    m[v.product_id].push({
      _id: v._id,
      price: v.price,
      stock: v.stock,
      attributes: v.attributes || {},
      label: attrLabel(v.attributes || {}),
      images: v.images || [],
    });
    return m;
  }, {});

  const productMap = products.reduce((m, p) => {
    m[p._id] = { _id: p._id, name: p.name, slug: p.slug, images: p.images || [] };
    return m;
  }, {});

  const items = cart.items.map(it => ({
    ...it.toObject(),
    product: productMap[it.product_id] || null,
    available_variants: variantMap[it.product_id] || [],
  }));

  return {
    _id: cart._id,
    user_id: cart.user_id,
    items,
    total_price: cart.total_price,
    currency: cart.currency,
    updated_at: cart.updated_at,
  };
};

exports.addItem = async (userId, { product_id, variant_id, qty = 1 }) => {
  if (qty < 1) qty = 1;

  const { product, variant } = await getVariantFull(variant_id);
  if (product._id !== product_id) throw new Error("Biến thể không khớp sản phẩm");
  if ((variant.stock || 0) <= 0) throw new Error("Sản phẩm đã bán hết");
  if (qty > variant.stock) throw new Error("Không đủ tồn kho");

  const cart = await getOrCreateCart(userId);

  // nếu item trùng (cùng variant) thì cộng dồn
  const idx = cart.items.findIndex(i => i.variant_id === variant_id);
  if (idx >= 0) {
    const newQty = cart.items[idx].qty + qty;
    if (newQty > variant.stock) throw new Error("Không đủ tồn kho");
    cart.items[idx].qty = newQty;
  } else {
    cart.items.push({
      _id: `item-${uuidv4()}`,
      product_id,
      variant_id,
      name: product.name,
      image: (variant.images && variant.images[0]) || (product.images && product.images[0]) || "",
      price: variant.price,
      qty,
      total: variant.price * qty,
      attributes: variant.attributes || {},
    });
  }

  await cart.save();
  return this.getCart(userId);
};

exports.updateItem = async (userId, itemId, { qty, variant_id }) => {
  const cart = await getOrCreateCart(userId);
  const idx = cart.items.findIndex(i => i._id === itemId);
  if (idx < 0) throw new Error("Mục giỏ hàng không tồn tại");

  let current = cart.items[idx];

  // đổi biến thể
  if (variant_id && variant_id !== current.variant_id) {
    const { product, variant } = await getVariantFull(variant_id);
    if (product._id !== current.product_id) throw new Error("Biến thể không thuộc sản phẩm này");
    const newQty = qty != null ? Math.max(1, qty) : current.qty;
    if ((variant.stock || 0) <= 0) throw new Error("Sản phẩm đã bán hết");
    if (newQty > variant.stock) throw new Error("Không đủ tồn kho");

    current.variant_id = variant._id;
    current.price = variant.price;
    current.attributes = variant.attributes || {};
    current.image = (variant.images && variant.images[0]) || current.image;
    current.qty = newQty;
  }

  // đổi số lượng
  if (qty != null) {
    const newQty = Math.max(1, qty);
    // check tồn kho biến thể hiện tại
    const variant = await ProductVariant.findById(current.variant_id);
    if (!variant) throw new Error("Biến thể không tồn tại");
    if (newQty > (variant.stock || 0)) throw new Error("Không đủ tồn kho");
    current.qty = newQty;
  }

  cart.items[idx] = current;
  await cart.save();
  return this.getCart(userId);
};

exports.removeItem = async (userId, itemId) => {
  const cart = await getOrCreateCart(userId);
  const before = cart.items.length;
  cart.items = cart.items.filter(i => i._id !== itemId);
  if (cart.items.length === before) throw new Error("Mục giỏ hàng không tồn tại");
  await cart.save();
  return this.getCart(userId);
};

exports.clearCart = async (userId) => {
  const cart = await getOrCreateCart(userId);
  cart.items = [];
  await cart.save();
  return this.getCart(userId);
};
