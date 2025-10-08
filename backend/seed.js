/* =====================================================
   DFS SEED SCRIPT – Full 19 collections (v2025)
   Author: ChatGPT for Do Viet Anh
===================================================== */

require("dotenv").config();
const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

// ===== Import models =====
const Role = require("./src/models/Role");
const User = require("./src/models/User");
const Wallet = require("./src/models/Wallet");
const Brand = require("./src/models/Brand");
const Category = require("./src/models/Category");
const Product = require("./src/models/Product");
const ProductVariant = require("./src/models/ProductVariant");
const Voucher = require("./src/models/Voucher");
const Cart = require("./src/models/Cart");
const Order = require("./src/models/Order");
const Refund = require("./src/models/Refund");
const Transaction = require("./src/models/Transaction");
const Review = require("./src/models/Review");
const Ticket = require("./src/models/Ticket");
const Banner = require("./src/models/Banner");
const Attribute = require("./src/models/Attribute");
const ProductSizeChart = require("./src/models/ProductSizeChart");
const AuditLog = require("./src/models/AuditLog");
const Address = require("./src/models/Address");

// ===== Helper =====
const PLACEHOLDER = (w, h, txt) =>
  `https://via.placeholder.com/${w}x${h}.png?text=${encodeURIComponent(txt)}`;

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const slugify = (str) =>
  String(str)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "")
    .substring(0, 40);

async function connectDB() {
  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error("❌ Missing MONGO_URI in .env");
  await mongoose.connect(uri, { dbName: "WDP" });
  console.log("✅ Connected to MongoDB Atlas (WDP)");
}

function genOrderCode() {
  const y = new Date().getFullYear();
  const seq = Math.floor(100000 + Math.random() * 900000);
  return `DFS-${y}-${seq}`;
}

// ===== MAIN SEED =====
async function seed() {
  await connectDB();
  const collections = await mongoose.connection.db.listCollections().toArray();
for (const c of collections) {
  await mongoose.connection.db.collection(c.name).deleteMany({});
  console.log(`🧹 Cleared collection: ${c.name}`);
}


  /* ---------- 1. Roles ---------- */
  const roles = await Role.insertMany([
    { _id: "role-admin", name: "system_admin", description: "Quản trị hệ thống" },
    { _id: "role-shop", name: "shop_owner", description: "Chủ cửa hàng" },
    { _id: "role-customer", name: "customer", description: "Khách hàng" },
  ]);

  /* ---------- 2. Users ---------- */
  const admin = await User.create({
    _id: `user-${uuidv4()}`,
    name: "System Admin",
    username: "admin",
    email: "admin@dfs.vn",
    password_hash: "hashed-password",
    role_id: "role-admin",
    status: "active",
  });
  const shop = await User.create({
    _id: `user-${uuidv4()}`,
    name: "DFS Shop",
    username: "shop",
    email: "shop@dfs.vn",
    password_hash: "hashed-password",
    role_id: "role-shop",
    status: "active",
  });
  const customer = await User.create({
    _id: `user-${uuidv4()}`,
    name: "Khách hàng",
    username: "customer",
    email: "customer@dfs.vn",
    password_hash: "hashed-password",
    role_id: "role-customer",
    status: "active",
  });

  /* ---------- 3. Wallets ---------- */
  await Wallet.insertMany([
    { _id: `wallet-${uuidv4()}`, user_id: admin._id, type: "system", currency: "VND", balance_available: 0 },
    { _id: `wallet-${uuidv4()}`, user_id: shop._id, type: "shop", currency: "VND", balance_available: 0 },
    { _id: `wallet-${uuidv4()}`, user_id: customer._id, type: "customer", currency: "VND", balance_available: 0 },
  ]);

  /* ---------- 4. Brands ---------- */
  const brandNames = ["Uniqlo", "Adidas", "Nike", "Zara", "H&M", "Levi's", "Puma", "New Balance"];
  const brands = await Brand.insertMany(
    brandNames.map((b) => ({
      _id: `brand-${uuidv4()}`,
      name: b,
      slug: slugify(b),
      country: pick(["Japan", "Germany", "USA", "Spain", "Sweden"]),
      gender: pick(["men", "women", "unisex"]),
      description: `${b} brand`,
      logo_url: PLACEHOLDER(200, 100, b),
      seo: { title: `${b} - DFS`, description: `Thương hiệu ${b}`, keywords: [b, "thoi trang"] },
    }))
  );

  /* ---------- 5. Categories ---------- */
  const men = await Category.create({
    _id: `cat-${uuidv4()}`,
    name: "Nam",
    slug: "men",
    parent_id: null,
    is_active: true,
  });
  const women = await Category.create({
    _id: `cat-${uuidv4()}`,
    name: "Nữ",
    slug: "women",
    parent_id: null,
    is_active: true,
  });

  const menSubs = ["Áo", "Quần", "Giày", "Phụ kiện"].map((n) => ({
    _id: `cat-${uuidv4()}`,
    name: n,
    slug: slugify(n + "-nam"),
    parent_id: men._id,
  }));
  const womenSubs = ["Áo", "Váy", "Giày", "Phụ kiện"].map((n) => ({
    _id: `cat-${uuidv4()}`,
    name: n,
    slug: slugify(n + "-nu"),
    parent_id: women._id,
  }));

  const [menTops, menBottoms, menShoes] = await Category.insertMany(menSubs);
  const [womenTops, womenBottoms, womenShoes] = await Category.insertMany(womenSubs);

  /* ---------- 6. Attributes + SizeChart ---------- */
const attrColor = await Attribute.create({
  _id: `attr-${uuidv4()}`,
  code: "COLOR",
  name: "Màu sắc",
  slug: "color",
  values: ["Đen", "Trắng", "Be", "Xanh", "Hồng"],
  description: "Danh sách màu sắc cho sản phẩm",
});

const attrSize = await Attribute.create({
  _id: `attr-${uuidv4()}`,
  code: "SIZE",
  name: "Kích thước",
  slug: "size",
  values: ["S", "M", "L", "XL"],
  description: "Danh sách kích thước chung cho sản phẩm",
});
await Attribute.create({
  _id: `attr-${uuidv4()}`,
  code: "MATERIAL",
  name: "Chất liệu",
  slug: "material",
  values: ["Cotton", "Polyester", "Denim", "Nỉ"],
});


  await ProductSizeChart.create({
    _id: `chart-${uuidv4()}`,
    brand_id: brands[0]._id,
    gender: "men",
    category_id: menTops._id,
    size_type: "tops",
    chart_data: [
      { size: "S", chest: 88, length: 64 },
      { size: "M", chest: 94, length: 67 },
      { size: "L", chest: 100, length: 70 },
      { size: "XL", chest: 106, length: 73 },
    ],
  });

  /* ---------- 7. Products & Variants ---------- */
  const names = [
    "Áo thun cotton", "Áo sơ mi trắng", "Áo khoác bomber", "Áo polo basic",
    "Quần jeans slim", "Quần short thể thao", "Giày sneaker", "Giày da lười",
  ];
  const colors = ["Đen", "Trắng", "Xám", "Xanh"];
  const sizes = ["S", "M", "L", "XL"];

  const products = [];
  for (let i = 0; i < 15; i++) {
    const name = names[i % names.length] + " nam " + (i + 1);
    const cat = i < 5 ? menTops : i < 10 ? menBottoms : menShoes;
    const brand = pick(brands);
    const prodId = `prod-${uuidv4()}`;
    const p = await Product.create({
      _id: prodId,
      name,
      category_id: cat._id,
      brand_id: brand._id,
      description: `${name} chất liệu cao cấp.`,
      base_price: 199000 + i * 5000,
      stock_total: 0,
      shop_id: shop._id,
    });
    let total = 0;
    for (const sz of sizes)
      for (const c of colors) {
        const stock = Math.floor(Math.random() * 10) + 5;
        await ProductVariant.create({
          _id: `var-${uuidv4()}`,
          product_id: p._id,
          sku: `${slugify(name)}-${sz}-${c}`,
          attributes: { size: sz, color: c },
          price: p.base_price,
          stock,
        });
        total += stock;
      }
    await Product.updateOne({ _id: p._id }, { $set: { stock_total: total } });
    products.push(p);
  }

  for (let i = 0; i < 15; i++) {
    const name = names[i % names.length] + " nữ " + (i + 1);
    const cat = i < 5 ? womenTops : i < 10 ? womenBottoms : womenShoes;
    const brand = pick(brands);
    const prodId = `prod-${uuidv4()}`;
    const p = await Product.create({
      _id: prodId,
      name,
      category_id: cat._id,
      brand_id: brand._id,
      description: `${name} mềm mại, dễ phối đồ.`,
      base_price: 249000 + i * 7000,
      stock_total: 0,
      shop_id: shop._id,
    });
    let total = 0;
    for (const sz of sizes)
      for (const c of colors) {
        const stock = Math.floor(Math.random() * 10) + 5;
        await ProductVariant.create({
          _id: `var-${uuidv4()}`,
          product_id: p._id,
          sku: `${slugify(name)}-${sz}-${c}`,
          attributes: { size: sz, color: c },
          price: p.base_price,
          stock,
        });
        total += stock;
      }
    await Product.updateOne({ _id: p._id }, { $set: { stock_total: total } });
    products.push(p);
  }

  /* ---------- 8. Address ---------- */
  const address = await Address.create({
    _id: `addr-${uuidv4()}`,
    user_id: customer._id,
    name: "Anh Do",
    phone: "0987654321",
    city: "Hà Nội",
    district: "Cầu Giấy",
    ward: "Dịch Vọng",
    street: "123 Xuân Thủy",
    is_default: true,
  });
  await User.updateOne({ _id: customer._id }, { $set: { addresses: [address._id] } });

  /* ---------- 9. Vouchers ---------- */
  const now = new Date();
  const in30d = new Date(Date.now() + 30 * 86400000);
  await Voucher.insertMany([
    {
      _id: `voucher-${uuidv4()}`,
      code: "DFS10",
      discount_type: "percent",
      discount_value: 10,
      max_uses: 500,
      usage_limit_per_user: 3,
      valid_from: now,
      valid_to: in30d,
      created_by: admin._id,
      scope: "global",
    },
  ]);

  /* ---------- 10. Cart & Order ---------- */
  const var1 = await ProductVariant.findOne({ product_id: products[0]._id });
  const cart = await Cart.create({
    _id: `cart-${uuidv4()}`,
    user_id: customer._id,
    items: [
      {
        product_id: var1.product_id,
        variant_id: var1._id,
        name: products[0].name,
        image_url: PLACEHOLDER(400, 400, "Item"),
        qty: 2,
        price: var1.price,
        total: var1.price * 2,
      },
    ],
  });
  const order = await Order.create({
    _id: `ord-${uuidv4()}`,
    order_code: genOrderCode(),
    user_id: customer._id,
    shop_id: shop._id,
    items: cart.items,
    total_price: cart.items[0].total + 30000,
    payment_method: "COD",
    payment_status: "pending",
    shipping_fee: 30000,
    note: "Đơn hàng mẫu",
  });

  /* ---------- 11. Transaction ---------- */
  await Transaction.create({
    _id: `txn-${uuidv4()}`,
    wallet_id: `wallet-${uuidv4()}`,
    user_id: customer._id,
    type: "payment",
    amount: order.total_price,
    currency: "VND",
    direction: "out",
    reference: order._id,
    status: "success",
    created_at: now,
  });

  /* ---------- 12. Refund ---------- */
  await Refund.create({
    _id: `refund-${uuidv4()}`,
    order_id: order._id,
    user_id: customer._id,
    shop_id: shop._id,
    reason: "Đổi size",
    status: "approved",
    amount: cart.items[0].price,
    refund_method: "wallet",
    approved_by: shop._id,
  });

  /* ---------- 13. Review ---------- */
  await Review.create({
    _id: `review-${uuidv4()}`,
    product_id: products[0]._id,
    user_id: customer._id,
    rating: 5,
    comment: "Sản phẩm rất tốt!",
    created_at: now,
  });

  /* ---------- 14. Ticket ---------- */
  await Ticket.create({
    _id: `ticket-${uuidv4()}`,
    user_id: customer._id,
    order_id: order._id,
    type: "refund",
    subject: "Yêu cầu đổi hàng",
    message: "Muốn đổi size áo.",
    status: "open",
  });

  /* ---------- 15. Banner ---------- */
  await Banner.create({
    _id: `banner-${uuidv4()}`,
    title: "Flash Sale Cuối Tuần",
    image_url: PLACEHOLDER(1200, 400, "FLASH SALE"),
    link: "/flash-sale",
    position: "homepage_top",
    is_active: true,
    start_date: now,
    end_date: in30d,
    created_by: admin._id,
  });

  /* ---------- 16. Audit Logs ---------- */
  await AuditLog.create({
    _id: `log-${uuidv4()}`,
    actor_id: admin._id,
    action: "SEED_DATABASE",
    target: "All",
    description: "Khởi tạo dữ liệu DFS hoàn chỉnh.",
    created_at: now,
  });

  console.log("\n🎉 DFS Seed completed successfully!");
  console.log("✅ 19 collections populated in MongoDB Atlas.");
  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ SEED FAILED", err);
  process.exit(1);
});
