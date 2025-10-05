const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const authRoutes = require('./routes/authRoutes');
const { errorHandler } = require('./middlewares/errorMiddleware');
const { initRedis } = require('./config/redis');


const app = express();
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));
app.use(express.json({ limit:"5mb" }));
app.use(express.urlencoded({ extended:true }));
app.use("/api/tickets", require("./routes/ticketRoutes"));
app.use("/api/reviews", require("./routes/reviewRoutes"));
const productRoutes = require('./routes/productRoutes');
app.use('/api/products', productRoutes);

const bannerRoutes = require('./routes/bannerRoutes');
app.use('/api/banners', bannerRoutes);

const uploadRoutes = require('./routes/uploadRoutes');
app.use('/api/uploads', uploadRoutes);


app.enable('trust proxy');
app.use((req, res, next) => {
    if (process.env.NODE_ENV === 'production' && req.secure !== true) {
        return res.status(400).json({ message: 'HTTPS only' });
    }
    next();
});


app.use('/api/auth', authRoutes);
app.use(errorHandler);


initRedis();
module.exports = app;