require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const compression = require("compression");
const path = require("path");

const productRoutes = require("./routes/productRoutes");
const homeRoutes = require("./routes/homeRoutes");
const authRoutes = require("./routes/authRoutes");
const errorMiddleware = require("./middlewares/errorMiddleware");
const userRoutes = require("./routes/userRoutes");
const voucherRouters = require("./routes/voucherRoutes");
const addressRoutes = require("./routes/addressRoutes");
const bankRoutes = require("./routes/bankRoutes");
const bannerRoutes = require("./routes/bannerRoutes");
const cartRoutes = require("./routes/cartRoutes");
const checkoutRoutes = require("./routes/checkoutRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const orderRoutes = require("./routes/orderRoutes");
const shippingRoutes = require("./routes/shippingRoutes");
const shopRoutes = require("./routes/shopRoutes");
const transactionRoutes = require("./routes/transactionRoutes");

const FE_ORIGIN = process.env.FE_ORIGIN || "http://localhost:5173";

const app = express();

/* ==== Security & CORS ==== */
app.use(
  helmet({
    // Không bật CSP mặc định để tránh chặn ảnh từ CDN.
    contentSecurityPolicy: false,
  })
);

// Nếu bạn muốn bật CSP nghiêm ngặt, dùng block dưới và sửa domain ảnh cho đúng:
/*
app.use(
  helmet.contentSecurityPolicy({
    useDefaults: true,
    directives: {
      "img-src": ["'self'", "data:", "https:", "http:", "https://cdn.dfs-demo.com", "https://cdn.hstatic.net"],
    },
  })
);
*/

// Cho phép ảnh cross-origin nếu cần hiển thị từ CDN
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
const flashSaleRoutes = require("./routes/flashSaleRoutes");
const productVariant = require("./routes/productVariantRoutes");
// const walletRoutes = require("./routes/walletRoutes");
// const refundRoutes = require("./routes/refundRoutes");
// const reviewRoutes = require("./routes/reviewRoutes");
// const ticketRoutes = require("./routes/ticketRoutes");
 const shopRoutes = require("./routes/shopRoutes");
// const adminRoutes = require("./routes/adminRoutes");
const transactionRoutes = require("./routes/transactionRoutes");

app.use(
  cors({
    origin: [FE_ORIGIN],
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

/* ==== Chống 304 cho JSON API ==== */
// Tắt ETag để Express không trả 304 cho endpoint động
app.set("etag", false);

// Với mọi response dưới /api → no-store để trình duyệt luôn xin dữ liệu mới
app.use("/api", (req, res, next) => {
  res.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
  res.set("Pragma", "no-cache");
  res.set("Expires", "0");
  next();
});

/* ==== Parsers & Perf ==== */
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(compression());
app.use(morgan("dev"));
app.use(
  rateLimit({
    windowMs: 60 * 1000,
    max: 100,
    message: "Too many requests, please try again later.",
  })
);

/* ==== Routes ==== */
app.use("/api", homeRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/users", userRoutes);
app.use("/api/addresses", addressRoutes);
app.use("/api/banks", bankRoutes);
app.use("/api/vouchers", voucherRouters);
app.use("/api/banners", bannerRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/checkout", checkoutRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/orders", orderRoutes); // <- tránh khai báo trùng 2 lần
app.use("/api/shipping/webhooks", shippingRoutes);
app.use("/api/flashsales", flashSaleRoutes);
app.use("/api/product-variant", productVariant);
app.use("/static/invoices", express.static(path.join(__dirname, "../public/invoices")));

 app.use("/api/orders", orderRoutes);
// app.use("/api/wallets", walletRoutes);
// app.use("/api/refunds", refundRoutes);
// app.use("/api/reviews", reviewRoutes);
// app.use("/api/tickets", ticketRoutes);
app.use("/api/shop", shopRoutes);
app.use("/api/transactions", transactionRoutes);

app.use("/static/invoices", express.static(path.join(__dirname, "../public/invoices")));

/* ==== Health ==== */
app.get("/", (req, res) => {
  res.status(200).json({
    message: "✅ DFS Backend API is running...",
    version: "1.0.0",
    time: new Date().toISOString(),
  });
});

/* ==== Error ==== */
app.use(errorMiddleware);

module.exports = app;
