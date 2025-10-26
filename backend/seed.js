/**
 * DFS Full Showcase Seed (Option B + Images)
 * - Seeds 15 brands, 10 categories, 50 products (100 variants), size charts
 * - Seeds vouchers, flash sales, orders, wallets, transactions, refunds, reviews, tickets, banners
 * - Uses UUID v4 with prefixes, safe re-run (clears collections), aligns with validations seen earlier
 */

require("dotenv").config();
const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

// Models
const Role = require("./src/models/Role");
const User = require("./src/models/User");
const Address = require("./src/models/Address");
const BankAccount = require("./src/models/BankAccount");
const Category = require("./src/models/Category");
const Brand = require("./src/models/Brand");
const Attribute = require("./src/models/Attribute");
const Product = require("./src/models/Product");
const ProductVariant = require("./src/models/ProductVariant");
const ProductSizeChart = require("./src/models/ProductSizeChart");
const Cart = require("./src/models/Cart");
const Order = require("./src/models/Order");
const Fulfillment = require("./src/models/Fulfillment");
const Wallet = require("./src/models/Wallet");
const Transaction = require("./src/models/Transaction");
const Payment = require("./src/models/Payment");
const PaymentWebhook = require("./src/models/PaymentWebhook");
const Refund = require("./src/models/Refund");
const Review = require("./src/models/Review");
const Voucher = require("./src/models/Voucher");
const FlashSale = require("./src/models/FlashSale");
const Reservation = require("./src/models/Reservation");
const Ticket = require("./src/models/Ticket");
const Banner = require("./src/models/Banner");
const AuditLog = require("./src/models/AuditLog");

// ---- helpers
const MONGO_URI = process.env.MONGO_URI;
if (!MONGO_URI) {
  console.error("❌ Missing MONGO_URI in .env");
  process.exit(1);
}
const now = () => new Date();
const hoursFromNow = (h) => new Date(Date.now() + h * 3600 * 1000);
const daysFromNow = (d) => new Date(Date.now() + d * 24 * 3600 * 1000);
const slugify = (s) =>
  s
    .toString()
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

const pick = (arr, n) =>
  arr.length <= n ? [...arr] : arr.sort(() => 0.5 - Math.random()).slice(0, n);

// ---- image placeholders (anh minh hoạ)
const cdn = "https://cdn.dfs-demo.com";
const imgBrand = (slug) => `${cdn}/brands/${slug}.png`;
const imgProduct = (slug, i = 1) => `${cdn}/products/${slug}-${i}.jpg`;
const imgBanner = (name) => `${cdn}/banners/${slugify(name)}.jpg`;

// ===================================================================

(async () => {
  try {
    await mongoose.connect(MONGO_URI, { dbName: "WDP" });
    console.log("✅ Connected to MongoDB");

    // Clear collections (safe re-run)
    const collections = [
      Role, User, Address, BankAccount, Category, Brand, Attribute, Product, ProductVariant,
      ProductSizeChart, Cart, Order, Fulfillment, Wallet, Transaction, Payment, PaymentWebhook,
      Refund, Review, Voucher, FlashSale, Reservation, Ticket, Banner, AuditLog
    ];
    await Promise.allSettled(collections.map((m) => m.deleteMany({})));
    console.log("🧹 Cleared all collections");

    // 1) Roles
    const roleDocs = await Role.insertMany([
      { _id: `rol-${uuidv4()}`, name: "customer" },
      { _id: `rol-${uuidv4()}`, name: "shop_owner" },
      { _id: `rol-${uuidv4()}`, name: "system_admin" },
      { _id: `rol-${uuidv4()}`, name: "sales" },
      { _id: `rol-${uuidv4()}`, name: "support" }
    ]);

    const findRoleId = (name) => roleDocs.find((r) => r.name === name)._id;

    // 2) Users (3 customers + 1 shop + 1 admin + 1 support)
    const userDocs = await User.insertMany([
      { _id: `usr-${uuidv4()}`, username: "cust01", email: "cust01@example.com", password: "hashed_password", role_id: findRoleId("customer"), name: "Nguyen Van A" },
      { _id: `usr-${uuidv4()}`, username: "cust02", email: "cust02@example.com", password: "hashed_password", role_id: findRoleId("customer"), name: "Tran Thi B" },
      { _id: `usr-${uuidv4()}`, username: "cust03", email: "cust03@example.com", password: "hashed_password", role_id: findRoleId("customer"), name: "Le Van C" },
      { _id: `usr-${uuidv4()}`, username: "shop1", email: "shop1@example.com", password: "hashed_password", role_id: findRoleId("shop_owner"), name: "DailyFit Shop" },
      { _id: `usr-${uuidv4()}`, username: "admin", email: "admin@dfs.com", password: "hashed_password", role_id: findRoleId("system_admin"), name: "System Admin" },
      { _id: `usr-${uuidv4()}`, username: "support", email: "support@dfs.com", password: "hashed_password", role_id: findRoleId("support"), name: "Customer Care" },
    ]);
    const getUser = (u) => userDocs.find((x) => x.username === u);
    console.log("✅ Seeded users");

    // Addresses for customers
    await Address.insertMany([
      {
        _id: `adr-${uuidv4()}`,
        user_id: getUser("cust01")._id,
        name: "Nguyen Van A",              // ✅ đúng field
        phone: "0909000001",               // ✅ đúng field
        city: "Hồ Chí Minh",               // ✅ đúng field
        district: "Quận 1",
        ward: "Bến Nghé",
        street: "12 Nguyễn Huệ",
        is_default: true,
      },
      {
        _id: `adr-${uuidv4()}`,
        user_id: getUser("cust02")._id,
        name: "Tran Thi B",
        phone: "0909000002",
        city: "Hồ Chí Minh",
        district: "Quận 3",
        ward: "Võ Thị Sáu",
        street: "45 Cách Mạng Tháng 8",
        is_default: true,
      },
      {
        _id: `adr-${uuidv4()}`,
        user_id: getUser("cust03")._id,
        name: "Le Van C",
        phone: "0909000003",
        city: "Hà Nội",
        district: "Cầu Giấy",
        ward: "Dịch Vọng",
        street: "99 Cầu Giấy",
        is_default: true,
      },
    ]);

    console.log("✅ Seeded addresses");

    // Bank accounts for customers + shop
    await BankAccount.insertMany([
      {
        _id: `bac-${uuidv4()}`,
        user_id: getUser("cust01")._id,
        bank_name: "VCB",
        account_number: "00112233",
        owner_name: "NGUYEN VAN A",   // ✅ đúng schema
        is_default: true,
      },
      {
        _id: `bac-${uuidv4()}`,
        user_id: getUser("cust02")._id,
        bank_name: "ACB",
        account_number: "44556677",
        owner_name: "TRAN THI B",     // ✅
        is_default: true,
      },
      {
        _id: `bac-${uuidv4()}`,
        user_id: getUser("shop1")._id,
        bank_name: "TPB",
        account_number: "99887766",
        owner_name: "DAILYFIT SHOP",  // ✅
        is_default: true,
      },
    ]);

    console.log("✅ Seeded bank accounts");

    // 3) Brands (15)
    const brandNames = [
      "Nike", "Adidas", "Uniqlo", "Zara", "H&M", "Levi's", "Mango", "Converse", "Puma",
      "The North Face", "Under Armour", "New Balance", "Lacoste", "Calvin Klein", "Guess"
    ];
    const brandDocs = await Brand.insertMany(
      brandNames.map((n) => {
        const slug = slugify(n);
        return { _id: `brd-${uuidv4()}`, name: n, slug, logo: imgBrand(slug), is_active: true };
      })
    );
    const brandByName = (n) => brandDocs.find((b) => b.name === n)._id;
    console.log("✅ Seeded 15 brands");

    // 4) Categories (10) with tree
    const cat = {};
    const catDocs = await Category.insertMany([
      { _id: cat.men = `cat-${uuidv4()}`, name: "Men", slug: "men", level: 0, path: [] },
      { _id: cat.women = `cat-${uuidv4()}`, name: "Women", slug: "women", level: 0, path: [] },
      { _id: cat.menTop = `cat-${uuidv4()}`, name: "Men Tops", slug: "men-tops", parent_id: cat.men, level: 1, path: [cat.men] },
      { _id: cat.menBottom = `cat-${uuidv4()}`, name: "Men Bottoms", slug: "men-bottoms", parent_id: cat.men, level: 1, path: [cat.men] },
      { _id: cat.menAcc = `cat-${uuidv4()}`, name: "Men Accessories", slug: "men-accessories", parent_id: cat.men, level: 1, path: [cat.men] },
      { _id: cat.womenTop = `cat-${uuidv4()}`, name: "Women Tops", slug: "women-tops", parent_id: cat.women, level: 1, path: [cat.women] },
      { _id: cat.womenBottom = `cat-${uuidv4()}`, name: "Women Bottoms", slug: "women-bottoms", parent_id: cat.women, level: 1, path: [cat.women] },
      { _id: cat.womenAcc = `cat-${uuidv4()}`, name: "Women Accessories", slug: "women-accessories", parent_id: cat.women, level: 1, path: [cat.women] },
      { _id: cat.shoes = `cat-${uuidv4()}`, name: "Shoes", slug: "shoes", level: 0, path: [] },
      { _id: cat.outer = `cat-${uuidv4()}`, name: "Outerwear", slug: "outerwear", level: 0, path: [] },
    ]);
    console.log("✅ Seeded categories");

    // 5) Attributes
    await Attribute.insertMany([
      { _id: `att-${uuidv4()}`, name: "Color", code: "color", type: "select", values: ["Black", "White", "Blue", "Red", "Green"] },
      { _id: `att-${uuidv4()}`, name: "Size", code: "size", type: "select", values: ["S", "M", "L", "XL"] },
      { _id: `att-${uuidv4()}`, name: "Material", code: "material", type: "select", values: ["Cotton", "Polyester", "Blend"] },
      { _id: `att-${uuidv4()}`, name: "Gender", code: "gender", type: "select", values: ["Men", "Women", "Unisex"] },
      { _id: `att-${uuidv4()}`, name: "Fit", code: "fit", type: "select", values: ["Regular", "Slim", "Relaxed"] },
    ]);
    console.log("✅ Seeded attributes");

    // 6) Product Size Charts (4)
    await ProductSizeChart.insertMany([
      {
        _id: `psc-${uuidv4()}`,
        brand_id: brandByName("Uniqlo"),
        category_id: cat.menTop,
        gender: "men",
        rows: [
          { size_label: "M", measurements: { chest: 96, waist: 82, length: 68, shoulder: 45 } },
          { size_label: "L", measurements: { chest: 102, waist: 88, length: 70, shoulder: 47 } },
          { size_label: "XL", measurements: { chest: 108, waist: 94, length: 72, shoulder: 49 } },
        ],
      },
      {
        _id: `psc-${uuidv4()}`,
        brand_id: brandByName("Zara"),
        category_id: cat.womenTop,
        gender: "women",
        rows: [
          { size_label: "S", measurements: { chest: 84, waist: 66, length: 58, shoulder: 36 } },
          { size_label: "M", measurements: { chest: 90, waist: 72, length: 60, shoulder: 38 } },
          { size_label: "L", measurements: { chest: 96, waist: 78, length: 62, shoulder: 40 } },
        ],
      },
      {
        _id: `psc-${uuidv4()}`,
        brand_id: brandByName("Nike"),
        category_id: cat.shoes,
        gender: "unisex",
        rows: [
          { size_label: "M", measurements: { length: 26 } },
          { size_label: "L", measurements: { length: 27 } },
          { size_label: "XL", measurements: { length: 28 } },
        ],
      },
      {
        _id: `psc-${uuidv4()}`,
        brand_id: brandByName("Levi's"),
        category_id: cat.menBottom,
        gender: "men",
        rows: [
          { size_label: "M", measurements: { waist: 82, hip: 98, length: 100 } },
          { size_label: "L", measurements: { waist: 88, hip: 104, length: 102 } },
          { size_label: "XL", measurements: { waist: 94, hip: 110, length: 104 } },
        ],
      },
    ]);
    console.log("✅ Seeded size charts");

    // 7) Products & Variants
    // Create 50 products programmatically across brands & categories
    const baseProducts = [
      { name: "Air Tee", brand: "Nike", category: cat.menTop },
      { name: "Run Tee", brand: "Adidas", category: cat.menTop },
      { name: "Everyday Tee", brand: "Uniqlo", category: cat.menTop },
      { name: "Classic Shirt", brand: "Zara", category: cat.menTop },
      { name: "Casual Shirt", brand: "H&M", category: cat.menTop },

      { name: "501 Jeans", brand: "Levi's", category: cat.menBottom },
      { name: "Chino Pants", brand: "Mango", category: cat.menBottom },
      { name: "Tapered Pants", brand: "Calvin Klein", category: cat.menBottom },
      { name: "Track Pants", brand: "Puma", category: cat.menBottom },
      { name: "Jogger Pants", brand: "Under Armour", category: cat.menBottom },

      { name: "Canvas Sneakers", brand: "Converse", category: cat.shoes },
      { name: "Running Shoes", brand: "New Balance", category: cat.shoes },
      { name: "Court Sneakers", brand: "Lacoste", category: cat.shoes },
      { name: "Trail Shoes", brand: "The North Face", category: cat.shoes },
      { name: "Street Sneakers", brand: "Guess", category: cat.shoes },

      { name: "Ribbed Tee", brand: "Zara", category: cat.womenTop },
      { name: "Slim Blouse", brand: "Mango", category: cat.womenTop },
      { name: "Cotton Top", brand: "H&M", category: cat.womenTop },
      { name: "Logo Tee", brand: "Calvin Klein", category: cat.womenTop },
      { name: "Essential Tee", brand: "Uniqlo", category: cat.womenTop },

      { name: "High Waist Jeans", brand: "Levi's", category: cat.womenBottom },
      { name: "Wide Pants", brand: "Zara", category: cat.womenBottom },
      { name: "Stretch Leggings", brand: "Under Armour", category: cat.womenBottom },
      { name: "Casual Skirt", brand: "H&M", category: cat.womenBottom },
      { name: "Pleated Skirt", brand: "Mango", category: cat.womenBottom },

      { name: "Fleece Hoodie", brand: "Nike", category: cat.outer },
      { name: "Windbreaker", brand: "Adidas", category: cat.outer },
      { name: "Denim Jacket", brand: "Levi's", category: cat.outer },
      { name: "Bomber Jacket", brand: "Puma", category: cat.outer },
      { name: "Puffer Jacket", brand: "The North Face", category: cat.outer },

      { name: "Cap Classic", brand: "New Balance", category: cat.menAcc },
      { name: "Canvas Belt", brand: "Converse", category: cat.menAcc },
      { name: "Sport Socks", brand: "Adidas", category: cat.menAcc },
      { name: "Leather Wallet", brand: "Calvin Klein", category: cat.menAcc },
      { name: "Logo Beanie", brand: "Guess", category: cat.menAcc },

      { name: "Scarf Soft", brand: "Zara", category: cat.womenAcc },
      { name: "Mini Shoulder Bag", brand: "Mango", category: cat.womenAcc },
      { name: "Logo Belt", brand: "H&M", category: cat.womenAcc },
      { name: "Sporty Cap", brand: "Under Armour", category: cat.womenAcc },
      { name: "Tote Bag", brand: "Uniqlo", category: cat.womenAcc },

      // add 10 more to reach 50
      { name: "Dry Polo", brand: "Uniqlo", category: cat.menTop },
      { name: "Club Tee", brand: "Nike", category: cat.menTop },
      { name: "Trefoil Tee", brand: "Adidas", category: cat.menTop },
      { name: "Logo Hoodie", brand: "Calvin Klein", category: cat.outer },
      { name: "Tech Fleece Pants", brand: "Nike", category: cat.menBottom },
      { name: "Air Max Runner", brand: "Nike", category: cat.shoes },
      { name: "ZX Runner", brand: "Adidas", category: cat.shoes },
      { name: "Court Classic", brand: "Lacoste", category: cat.shoes },
      { name: "Seamless Leggings", brand: "Under Armour", category: cat.womenBottom },
      { name: "A-Line Skirt", brand: "Zara", category: cat.womenBottom },
    ];

    const productDocs = [];
    const variantDocs = [];

    for (let i = 0; i < baseProducts.length; i++) {
      const b = baseProducts[i];
      const brandId = brandByName(b.brand);
      const base = 299000 + (i % 10) * 50000; // base price 299k..~
      const min = base - 50000 > 199000 ? base - 50000 : base;
      const max = base + 50000;

      const pId = `prd-${uuidv4()}`;
      const name = `${b.brand} ${b.name}`;
      const slug = slugify(`${b.brand} ${b.name} ${i + 1}`);

      const product = {
        _id: pId,
        name,
        slug,
        shop_id: getUser("shop1")._id,
        category_id: b.category,
        brand_id: brandId,
        base_price: base,
        price_min: min,
        price_max: max,
        stock_total: 50 + (i % 5) * 10,
        is_active: true,
        images: [imgProduct(slug, 1), imgProduct(slug, 2)],
        tags: ["demo", b.brand.toLowerCase(), "dfs"],
        description: `${name} with premium materials and comfort.`,
      };

      productDocs.push(product);

      // two variants: M Black, L White
      const v1 = {
        _id: `var-${uuidv4()}`,
        product_id: pId,
        sku: `${b.brand.slice(0, 3).toUpperCase()}-${i + 1}-M-BLK`,
        attributes: { size: "M", color: "Black" },
        price: min,
        stock: 20 + (i % 3) * 5,
        images: [imgProduct(slug, 1)]
      };
      const v2 = {
        _id: `var-${uuidv4()}`,
        product_id: pId,
        sku: `${b.brand.slice(0, 3).toUpperCase()}-${i + 1}-L-WHT`,
        attributes: { size: "L", color: "White" },
        price: max,
        stock: 20 + ((i + 1) % 3) * 5,
        images: [imgProduct(slug, 2)]
      };
      variantDocs.push(v1, v2);
    }

    await Product.insertMany(productDocs);
    await ProductVariant.insertMany(variantDocs);
    console.log(`✅ Seeded ${productDocs.length} products & ${variantDocs.length} variants`);

    // 8) Vouchers (5) — align with enum ('percent' | 'fixed'), add required fields
    const vouchers = await Voucher.insertMany([
      {
        _id: `vou-${uuidv4()}`,
        code: "SALE20",
        name: "20% off all items",
        // support both shapes: some schemas use 'type', some use 'discount_type'
        type: "percent",
        discount_type: "percent",
        discount_value: 20,
        max_uses: 500,
        used_count: 0,
        created_by: getUser("shop1")._id,
        valid_from: now(),
        valid_to: daysFromNow(14),
        is_active: true,
        shop_id: getUser("shop1")._id,
      },
      {
        _id: `vou-${uuidv4()}`,
        code: "SAVE50K",
        name: "₫50,000 off over ₫500,000",
        type: "fixed",
        discount_type: "fixed",
        discount_value: 50000,
        max_uses: 300,
        used_count: 0,
        created_by: getUser("shop1")._id,
        valid_from: now(),
        valid_to: daysFromNow(30),
        is_active: true,
        shop_id: getUser("shop1")._id,
      },
      {
        _id: `vou-${uuidv4()}`,
        code: "FREESHIP",
        name: "Free Shipping",
        type: "fixed",
        discount_type: "fixed",
        discount_value: 30000,
        max_uses: 1000,
        used_count: 0,
        created_by: getUser("admin")._id,
        valid_from: now(),
        valid_to: daysFromNow(60),
        is_active: true,
      },
      {
        _id: `vou-${uuidv4()}`,
        code: "BF50",
        name: "Black Friday 50% OFF",
        type: "percent",
        discount_type: "percent",
        discount_value: 50,
        max_uses: 200,
        used_count: 0,
        created_by: getUser("shop1")._id,
        valid_from: daysFromNow(-1),
        valid_to: daysFromNow(2),
        is_active: true,
        shop_id: getUser("shop1")._id,
      },
      {
        _id: `vou-${uuidv4()}`,
        code: "TET100K",
        name: "Tết giảm 100K",
        type: "fixed",
        discount_type: "fixed",
        discount_value: 100000,
        max_uses: 400,
        used_count: 0,
        created_by: getUser("admin")._id,
        valid_from: daysFromNow(10),
        valid_to: daysFromNow(40),
        is_active: true,
      },
    ]);
    console.log("✅ Seeded vouchers");

    // 9) Flash Sales (3) — pick random variants
    const sampleVariants = pick(variantDocs, 12); // 12 variants for 3 FS
    const flashSales = await FlashSale.insertMany([
      {
        _id: `fs-${uuidv4()}`,
        shop_id: getUser("shop1")._id,
        title: "11.11 Mega Sale",
        description: "Biggest single day sale!",
        start_time: daysFromNow(-1),
        end_time: daysFromNow(1),
        status: "active",
        discount_type: "percentage",
        discount_value: 40,
        max_per_user: 2,
        total_limit: 500,
        products: sampleVariants.slice(0, 4).map((v) => ({
          product_id: v.product_id,
          variant_id: v._id,
          flash_price: Math.max(99000, Math.round(v.price * 0.6)),
          original_price: v.price,
          quantity_total: 50,
          quantity_sold: Math.floor(Math.random() * 15),
        })),
        banner_image: imgBanner("11.11 Mega Sale"),
        created_by: getUser("admin")._id,
        approved_by: getUser("admin")._id,
      },
      {
        _id: `fs-${uuidv4()}`,
        shop_id: getUser("shop1")._id,
        title: "Black Friday 50%",
        description: "Half price on selected items.",
        start_time: daysFromNow(-2),
        end_time: daysFromNow(2),
        status: "active",
        discount_type: "percentage",
        discount_value: 50,
        max_per_user: 2,
        total_limit: 300,
        products: sampleVariants.slice(4, 8).map((v) => ({
          product_id: v.product_id,
          variant_id: v._id,
          flash_price: Math.max(99000, Math.round(v.price * 0.5)),
          original_price: v.price,
          quantity_total: 40,
          quantity_sold: Math.floor(Math.random() * 20),
        })),
        banner_image: imgBanner("Black Friday 50"),
        created_by: getUser("shop1")._id,
        approved_by: getUser("admin")._id,
      },
      {
        _id: `fs-${uuidv4()}`,
        shop_id: getUser("shop1")._id,
        title: "Tet Big Sale",
        description: "Tết sale rộn ràng!",
        start_time: daysFromNow(7),
        end_time: daysFromNow(12),
        status: "scheduled",
        discount_type: "percentage",
        discount_value: 35,
        max_per_user: 3,
        total_limit: 600,
        products: sampleVariants.slice(8, 12).map((v) => ({
          product_id: v.product_id,
          variant_id: v._id,
          flash_price: Math.max(99000, Math.round(v.price * 0.65)),
          original_price: v.price,
          quantity_total: 60,
          quantity_sold: 0,
        })),
        banner_image: imgBanner("Tet Big Sale"),
        created_by: getUser("shop1")._id,
        approved_by: getUser("admin")._id,
      },
    ]);
    console.log("✅ Seeded flash sales");

    // 10) Banners (3)
    await Banner.insertMany([
      { _id: `ban-${uuidv4()}`, title: "11.11 is here!", image_url: imgBanner("1111"), redirect_url: "/flash-sale/1111", position: "homepage_top", is_active: true, start_date: daysFromNow(-2), end_date: daysFromNow(2) },
      { _id: `ban-${uuidv4()}`, title: "Black Friday", image_url: imgBanner("black-friday"), redirect_url: "/flash-sale/black-friday", position: "homepage_mid", is_active: true, start_date: daysFromNow(-3), end_date: daysFromNow(3) },
      { _id: `ban-${uuidv4()}`, title: "New Arrivals", image_url: imgBanner("new-arrivals"), redirect_url: "/collections/new", position: "homepage_bottom", is_active: true, start_date: daysFromNow(-1), end_date: daysFromNow(30) },
    ]);
    console.log("✅ Seeded banners");

    // 11) Orders (10) + Payments + Fulfillments
    const customerUsers = ["cust01", "cust02", "cust03"].map(getUser);
    const orderDocs = [];
    for (let i = 0; i < 10; i++) {
      const buyer = customerUsers[i % customerUsers.length];
      const v = variantDocs[(i * 3) % variantDocs.length];
      const p = productDocs.find((pd) => pd._id === v.product_id);
      const qty = 1 + (i % 2);
      const price = v.price;
      const total = price * qty;

      const ord = await Order.create({
        _id: `ord-${uuidv4()}`,
        order_code: `DFS${1000 + i}`,
        user_id: buyer._id,
        shop_id: getUser("shop1")._id,
        items: [
          {
            product_id: p._id,
            variant_id: v._id,
            name: p.name,
            price,
            qty,
            total,
            image: p.images?.[0],
          },
        ],
        address_snapshot: {
          full_name: buyer.name,
          phone_number: "0909xxxxxx",
          street: "Demo street 123",
          district: "Demo District",
          province: "Demo City",
        },
        payment_status: i % 7 === 0 ? "failed" : "paid",
        status: i % 5 === 0 ? "processing" : i % 3 === 0 ? "delivered" : "confirmed",
        total_price: total,
        final_price: total,
        voucher_id: i % 4 === 0 ? vouchers[0]._id : undefined,
        flash_sale_id: i % 3 === 0 ? flashSales[0]._id : undefined,
        note: i % 2 === 0 ? "Leave at reception" : "",
        expected_delivery: daysFromNow(3),
      });
      orderDocs.push(ord);

      // Payment (only for paid)
      if (ord.payment_status === "paid") {
        const pay = await Payment.create({
  _id: `pay-${uuidv4()}`,
  order_id: ord._id,
  user_id: ord.user_id,
  shop_id: ord.shop_id,
  gateway: i % 2 === 0 ? "VNPAY" : "MOMO",  // ✅ hợp lệ
  method: "bank_transfer",                   // ✅ hợp lệ
  amount: ord.final_price || ord.total_price || 0,
  currency: "VND",
  status: "paid",                            // ✅ hợp lệ
  provider_txn_id: `PG${Date.now()}${i}`,
  idempotency_key: `idem-${uuidv4()}`,
  return_url: "https://dfs-demo.com/payment/return",
  webhook_verified: true,
  expires_at: hoursFromNow(1),
});


        await PaymentWebhook.create({
          _id: `pwh-${uuidv4()}`,
          payment_id: pay._id,
          headers: { "x-signature": "demo" },
          raw_body: { orderId: ord._id, amount: ord.final_price },
          signature_valid: true,
          attempt: 1,
          processed_at: now(),
        });
      }

const createPaymentForOrder = async (ord, gateway = "VNPAY") => {
  return await Payment.create({
    _id: `pay-${uuidv4()}`,
    order_id: ord._id,
    user_id: ord.user_id,
    shop_id: ord.shop_id,
    gateway,                         // ✅ hợp lệ
    method: "bank_transfer",          // ✅ enum đúng
    amount: ord.final_price || 0,     // ✅ tránh undefined
    currency: "VND",
    status: "paid",                   // ✅ enum đúng
    provider_txn_id: `PG${Date.now()}`,
    idempotency_key: `idem-${uuidv4()}`,
    webhook_verified: true,
    return_url: "https://dfs-demo.com/payment/return",
    expires_at: new Date(Date.now() + 3600 * 1000),
  });
};


if (ord.payment_status === "paid") {
  await createPaymentForOrder(ord, "VNPAY");
}
      // Fulfillment (some delivered)
      if (ord.status === "delivered" || ord.status === "processing" || ord.status === "confirmed") {
        await Fulfillment.create({
          _id: `ful-${uuidv4()}`,
          order_id: ord._id,
          shipping_provider: i % 2 === 0 ? "GHN" : "GHTK",
          tracking_code: `TRK${100000 + i}`,
          fee: 30000,
          status: ord.status === "delivered" ? "delivered" : "in_transit",
          address_snapshot: ord.address_snapshot,
          label_url: `${cdn}/labels/${ord.order_code}.pdf`,
          metadata: { note: "demo" },
        });
      }
    }
    console.log("✅ Seeded orders + payments + fulfillments");

    // 12) Wallets & Transactions
    const sysWal = await Wallet.create({
      _id: `wal-${uuidv4()}`,
      user_id: getUser("admin")._id,
      type: "system",
      balance_pending: 0,
      balance_available: 500000000,
      currency: "VND",
    });
    const shopWal = await Wallet.create({
      _id: `wal-${uuidv4()}`,
      user_id: getUser("shop1")._id,
      type: "shop",
      balance_pending: 0,
      balance_available: 20000000,
      currency: "VND",
    });

    const txnPayloads = [];
    for (let i = 0; i < orderDocs.length; i++) {
      const o = orderDocs[i];
      txnPayloads.push({
        _id: `txn-${uuidv4()}`,
        wallet_id: shopWal._id,
        order_id: o._id,
        type: "payment",
        direction: "in",
        amount: o.final_price || o.total_price || 0,
        status: o.payment_status === "paid" ? "success" : "failed",
        note: "Order payment",
      });
    }
    // one transfer from system to shop after SLA
    txnPayloads.push({
      _id: `txn-${uuidv4()}`,
      wallet_id: sysWal._id,
      type: "transfer",
      direction: "out",
      amount: 1000000,
      status: "success",
      note: "Escrow release to shop",
    });
    txnPayloads.push({
      _id: `txn-${uuidv4()}`,
      wallet_id: shopWal._id,
      type: "transfer",
      direction: "in",
      amount: 1000000,
      status: "success",
      note: "Escrow release from system",
    });

    await Transaction.insertMany(txnPayloads);
    console.log("✅ Seeded wallets & transactions");

    // 13) Refunds (5)
    const refundables = orderDocs.filter((o) => o.payment_status === "paid").slice(0, 5);
    await Refund.insertMany(
      refundables.map((o, idx) => ({
        _id: `ref-${uuidv4()}`,
        order_id: o._id,
        user_id: o.user_id,
        shop_id: o.shop_id,
        status: idx % 3 === 0 ? "approved" : idx % 3 === 1 ? "requested" : "refunded",
        reason: idx % 2 === 0 ? "Wrong size" : "Damaged packaging",
        reason_detail: "Customer reported issue via ticket.",
        refund_method: "bank_transfer",
        amount: o.final_price || o.total_price || 0,
        bank_transfer_slip: idx % 3 === 2 ? `${cdn}/slips/${o.order_code}.jpg` : undefined,
        evidence_images: [`${cdn}/evidence/${o.order_code}-1.jpg`],
        approved_by: getUser("support")._id,
      }))
    );
    console.log("✅ Seeded refunds");

    // 14) Reviews (10)
    const reviewOrders = orderDocs.filter((o) => o.status === "delivered").slice(0, 10);
    const reviewDocs = [];
    for (let i = 0; i < reviewOrders.length; i++) {
      const o = reviewOrders[i];
      const it = o.items[0];
      reviewDocs.push({
        _id: `rev-${uuidv4()}`,
        order_id: o._id,
        product_id: it.product_id,
        user_id: o.user_id,
        shop_id: o.shop_id,
        rating: 4 + (i % 2),
        comment: i % 2 === 0 ? "Great quality and comfy." : "Fits as expected, nice fabric.",
        images: [imgProduct(slugify(`review-${o.order_code}`), 1)],
        is_anonymous: i % 3 === 0,
        size_feedback: i % 3 === 0 ? "fit" : i % 3 === 1 ? "tight" : "loose",
        status: "visible",
      });
    }
    await Review.insertMany(reviewDocs);
    console.log("✅ Seeded reviews");

    // 15) Tickets (5)
    await Ticket.insertMany(
      orderDocs.slice(0, 5).map((o, i) => ({
        _id: `tkt-${uuidv4()}`,
        order_id: o._id,
        user_id: o.user_id,
        shop_id: o.shop_id,
        subject: i % 2 === 0 ? "Refund request" : "Delivery issue",
        message: i % 2 === 0 ? "Requesting refund due to wrong size." : "Package delayed by 2 days.",
        status: i % 3 === 0 ? "open" : "in_progress",
      }))
    );
    console.log("✅ Seeded tickets");

    // 16) Minimal carts (3) — optional
    // ✅ Mới (chuẩn theo CartSchema DFS)
await Cart.insertMany(
  customerUsers.map((u, i) => ({
    _id: `crt-${uuidv4()}`,
    user_id: u._id,
    items: [
      {
        product_id: productDocs[i]._id,
        variant_id: variantDocs[i]._id,
        name: productDocs[i].name,
        attributes: { size: "M", color: "Black" },
        qty: 1,                                        // ✅ đúng field
        price: variantDocs[i].price,                   // ✅ đúng field
        total: variantDocs[i].price * 1,               // ✅ đúng field
        image: productDocs[i].images?.[0],
      },
    ],
    subtotal: variantDocs[i].price,
    discount: 0,
    shipping_fee: 30000,
    total: variantDocs[i].price + 30000,
  }))
);

    console.log("✅ Seeded carts");

    // 17) Reservations (3) — TTL demo 15 minutes
    await Reservation.insertMany(
      [0, 1, 2].map((i) => ({
        _id: `res-${uuidv4()}`,
        user_id: customerUsers[i]._id,
        product_id: productDocs[i]._id,
        variant_id: variantDocs[i]._id,
        quantity: 1,
        status: "active",
        expires_at: new Date(Date.now() + 15 * 60 * 1000),
      }))
    );
    console.log("✅ Seeded reservations");

    // 18) Audit logs (a few)
    await AuditLog.insertMany([
      { _id: `aud-${uuidv4()}`, actor_id: getUser("admin")._id, action: "LOGIN", module: "auth", target_id: getUser("admin")._id, ip: "127.0.0.1", user_agent: "seed-script", createdAt: now() },
      { _id: `aud-${uuidv4()}`, actor_id: getUser("shop1")._id, action: "CREATE_PRODUCT", module: "product", target_id: productDocs[0]._id, ip: "127.0.0.1", user_agent: "seed-script", createdAt: now() },
      { _id: `aud-${uuidv4()}`, actor_id: getUser("support")._id, action: "APPROVE_REFUND", module: "refund", target_id: "ref-xxx", ip: "127.0.0.1", user_agent: "seed-script", createdAt: now() },
    ]);
    console.log("✅ Seeded audit logs");

    console.log("🎉 All collections seeded successfully!");
    process.exit(0);
  } catch (err) {
    console.error("❌ Seed failed:", err);
    process.exit(1);
  }
})();
