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


// (Optional) Enforce HTTPS behind proxy
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