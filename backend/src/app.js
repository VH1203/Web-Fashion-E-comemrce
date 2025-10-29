
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
const app = express();
const userRoutes = require('./routes/userRoutes');
const addressRoutes = require('./routes/addressRoutes');
const bankRoutes = require('./routes/bankRoutes');
const cartRoutes = require("./routes/cartRoutes");
const checkoutRoutes = require("./routes/checkoutRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const FE_ORIGIN = "https://resplendent-flow-production-eb08.up.railway.app";


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
  origin: [FE_ORIGIN],
  credentials: true,
  methods: ["GET","POST","PUT","PATCH","DELETE","OPTIONS"],
  allowedHeaders: ["Content-Type","Authorization"]
}));

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

app.use('/api', homeRoutes);

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);

app.use("/api/users", userRoutes);
app.use("/api/addresses", addressRoutes);
app.use("/api/banks", bankRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/checkout", checkoutRoutes);
app.use("/api/payment", paymentRoutes);

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
});


app.use(errorMiddleware);

module.exports = app;
