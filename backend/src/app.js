const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { errorHandler } = require('./middlewares/errorMiddleware');
const { initRedis } = require('./config/redis');

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

const app = express();

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
app.use('/api/uploads', uploadRoutes);
app.use('/api/users', userRoutes);
app.use('/api/address', addressRoutes);
app.use('/api/bank', bankRoutes);
app.use('/api/shop', shopRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/transactions', transactionRoutes);
// Error handler
app.use(errorHandler);

// Initialize Redis (connect once at startup)
initRedis();

module.exports = app;
