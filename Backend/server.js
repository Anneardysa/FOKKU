// =====================================
// PHOTOBOX BACKEND SERVER
// =====================================

// Load environment variables FIRST
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const paymentRoutes = require('./routes/paymentRoutes');
const logger = require('./utils/logger');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Logging middleware
app.use((req, res, next) => {
    logger.log(`${req.method} ${req.url}`);
    next();
});

// Routes
app.use('/api', paymentRoutes);

// Health check
app.get('/', (req, res) => {
    res.json({
        status: 'OK',
        message: 'Photobox Backend Server is running',
        timestamp: new Date().toISOString()
    });
});

// Error handling
app.use((err, req, res, next) => {
    logger.error('Server Error:', err);
    res.status(500).json({
        error: 'Internal Server Error',
        message: err.message
    });
});

// Start server
app.listen(PORT, () => {
    logger.log(`🚀 Server running on http://localhost:${PORT}`);
    logger.log(`📸 Photobox Backend is ready!`);
});