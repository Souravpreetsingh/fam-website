const express = require('express');
const cors = require('cors');
const path = require('path');
const mongoose = require('mongoose');

const app = express();

const corsOptions = {
  origin: process.env.FRONTEND_URL || '*',
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};
app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

let cachedDb = null;
async function connectDB() {
  if (cachedDb && mongoose.connection.readyState === 1) return;
  try {
    cachedDb = await mongoose.connect(process.env.MONGODB_URI);
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    throw error;
  }
}

app.use(async (req, res, next) => {
  try {
    await connectDB();
  } catch {
    return res.status(500).json({ success: false, message: 'Database connection failed' });
  }
  next();
});

app.use('/uploads', express.static(path.join(__dirname, '..', 'backend', 'uploads')));

app.use('/api/v1/auth', require('../backend/routes/authRoutes'));
app.use('/api/v1/users', require('../backend/routes/userRoutes'));
app.use('/api/v1/rooms', require('../backend/routes/roomRoutes'));
app.use('/api/v1/bookings', require('../backend/routes/bookingRoutes'));
app.use('/api/v1/payments', require('../backend/routes/paymentRoutes'));
app.use('/api/v1/reviews', require('../backend/routes/reviewRoutes'));
app.use('/api/v1/contact', require('../backend/routes/contactRoutes'));
app.use('/api/v1/admin', require('../backend/routes/adminRoutes'));
app.use('/api/v1/notifications', require('../backend/routes/notificationRoutes'));

app.get('/api/v1/health', (req, res) => {
  res.json({ success: true, message: 'Server is running', timestamp: new Date().toISOString() });
});

app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.originalUrl} not found` });
});

app.use((err, req, res, next) => {
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || 'Internal server error',
  });
});

module.exports = app;
