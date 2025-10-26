
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const compression = require("compression");

const productRoutes = require("./routes/productRoutes");
const homeRoutes = require('./routes/homeRoutes');
const authRoutes = require("./routes/authRoutes");
const errorMiddleware = require("./middlewares/errorMiddleware");

const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const bannerRoutes = require('./routes/bannerRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const userRoutes = require('./routes/userRoutes');
const addressRoutes = require('./routes/addressRoutes');
const bankRoutes = require('./routes/bankRoutes');
const shopRoutes = require('./routes/shopRoutes');
const orderRoutes = require('./routes/orderRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const categoryRoutes = require('./routes/categoryRoutes')
const brandRoutes = require('./routes/brandRoutes');

const app = express();

// const orderRoutes = require("./routes/orderRoutes");
// const walletRoutes = require("./routes/walletRoutes");
// const refundRoutes = require("./routes/refundRoutes");
// const reviewRoutes = require("./routes/reviewRoutes");
// const voucherRoutes = require("./routes/voucherRoutes");
// const ticketRoutes = require("./routes/ticketRoutes");
// const shopRoutes = require("./routes/shopRoutes");
// const adminRoutes = require("./routes/adminRoutes");



app.use(helmet()); 
app.use(cors({
  origin: '*',
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(compression()); 
app.use(morgan("dev")); 
app.use('/api', homeRoutes);
app.use(
  rateLimit({
    windowMs: 60 * 1000, 
    max: 100, 
    message: "Too many requests, please try again later.",
  })
);


app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
// app.use("/api/orders", orderRoutes);
// app.use("/api/wallets", walletRoutes);
// app.use("/api/refunds", refundRoutes);
// app.use("/api/reviews", reviewRoutes);
// app.use("/api/vouchers", voucherRoutes);
// app.use("/api/tickets", ticketRoutes);
// app.use("/api/shops", shopRoutes);
// app.use("/api/admin", adminRoutes);


app.get("/", (req, res) => {
  res.status(200).json({
    message: "✅ DFS Backend API is running...",
    version: "1.0.0",
    time: new Date().toISOString(),
  });
// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Force HTTPS (for production)
app.enable('trust proxy');
app.use((req, res, next) => {
  if (process.env.NODE_ENV === 'production' && !req.secure) {
    return res.status(400).json({ message: 'HTTPS only' });
  }
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/banners', bannerRoutes);
app.use('/api/brands', brandRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/users', userRoutes);
app.use('/api/address', addressRoutes);
app.use('/api/bank', bankRoutes);
app.use('/api/shop', shopRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/transactions', transactionRoutes);
app.use((err, req, res, next) => {
  console.error("❌ Global error:", err);
  res.status(500).json({ message: err.message });
});


app.use(errorMiddleware);

module.exports = app;
