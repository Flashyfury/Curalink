const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const chatRoutes = require('./routes/chat');
const publicationsRoutes = require('./routes/publications');
const trialsRoutes = require('./routes/trials');

const app = express();
const PORT = process.env.PORT || 8000;

/* ─────────────────────────────────────────────
   TRUST PROXY (needed on Render / Railway etc.)
───────────────────────────────────────────── */
app.set('trust proxy', 1);

/* ─────────────────────────────────────────────
   CORS (Production Ready)
───────────────────────────────────────────── */
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5173',
  'https://curalink-theta.vercel.app',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      // allow Postman / server-to-server / no-origin requests
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true
  })
);

/* ─────────────────────────────────────────────
   Middleware
───────────────────────────────────────────── */
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));

/* ─────────────────────────────────────────────
   Root Route
───────────────────────────────────────────── */
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Curalink Medical Assistant API is live'
  });
});

/* ─────────────────────────────────────────────
   API Routes
───────────────────────────────────────────── */
app.use('/api/chat', chatRoutes);
app.use('/api/publications', publicationsRoutes);
app.use('/api/trials', trialsRoutes);

/* ─────────────────────────────────────────────
   Health Check
───────────────────────────────────────────── */
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    service: 'Curalink Medical Assistant API',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString()
  });
});

/* ─────────────────────────────────────────────
   404 Handler
───────────────────────────────────────────── */
app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found'
  });
});

/* ─────────────────────────────────────────────
   Global Error Handler
───────────────────────────────────────────── */
app.use((err, req, res, next) => {
  console.error('Server Error:', err.message);

  res.status(500).json({
    error: 'Internal server error'
  });
});

/* ─────────────────────────────────────────────
   MongoDB Connection
───────────────────────────────────────────── */
const MONGODB_URI =
  process.env.MONGODB_URI ||
  'mongodb://127.0.0.1:27017/curalink';

async function startServer() {
  try {
    await mongoose.connect(MONGODB_URI);

    console.log('✅ Connected to MongoDB');

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);

    process.exit(1); // fail in production if DB not connected
  }
}

startServer();

module.exports = app;