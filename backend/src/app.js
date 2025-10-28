const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');
const { errorHandler } = require('./middlewares/errorMiddleware');
require('dotenv').config();

// --- Routes có sẵn
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const bannerRoutes = require('./routes/bannerRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const userRoutes = require('./routes/userRoutes');
const addressRoutes = require('./routes/addressRoutes');
const bankRoutes = require('./routes/bankRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const brandRoutes = require('./routes/brandRoutes');

// --- NEW: Ticket routes
const ticketRoutes = require('./routes/ticketRoutes');

const app = express();

// --------- Middleware chung ----------
app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  })
);

// JSON & form-data body (multer dùng form-data, nhưng nếu có field text cần urlencoded)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use(morgan('dev'));

// Force HTTPS (prod)
app.enable('trust proxy');
app.use((req, res, next) => {
  if (process.env.NODE_ENV === 'production' && !req.secure) {
    return res.status(400).json({ message: 'HTTPS only' });
  }
  next();
});

// Serve static cho file upload local (nếu uploadMiddleware lưu vào ./uploads)
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));

// --------- Mount routes ----------
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/banners', bannerRoutes);
app.use('/api/brands', brandRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/uploads', uploadRoutes);
app.use('/api/users', userRoutes);
app.use('/api/address', addressRoutes);
app.use('/api/bank', bankRoutes);

// --- NEW: Ticket API
app.use('/api/tickets', ticketRoutes);

// --------- Global error logging (giữ như anh đang có) ----------
app.use((err, req, res, next) => {
  console.error('❌ Global error:', err);
  res.status(500).json({ message: err.message });
});

// Error handler cuối cùng
app.use(errorHandler);

// Init Redis (kết nối 1 lần khi start)
require('./config/redis');

module.exports = app;
