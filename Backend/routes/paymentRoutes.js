const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const qrisController = require('../controllers/qrisController');
const axios = require('axios');

// Snap transaction (dengan pilihan payment)
router.post('/create-transaction', paymentController.createTransaction);

// QRIS direct (langsung QR code)
router.post('/create-qris-transaction', qrisController.createQRISTransaction);

// Check payment status
router.get('/check-payment/:orderId', paymentController.checkPaymentStatus);

// Midtrans notification
router.post('/midtrans-notification', paymentController.handleNotification);

// Proxy untuk dslrBooth
router.get('/trigger-booth', async (req, res) => {
    try {
        console.log('🎬 Triggering dslrBooth...');
        
        const boothUrl = 'http://localhost:1500/api/start?mode=print&password=TVfJT8hT40jUxHNI';
        
        const response = await axios.get(boothUrl, {
            timeout: 10000, // 10 seconds timeout
            headers: {
                'User-Agent': 'Photobox/1.0'
            }
        });
        
        console.log('✅ dslrBooth response:', response.data);
        
        res.json({
            success: true,
            message: 'Booth session started',
            data: response.data
        });
        
    } catch (error) {
        console.error('❌ dslrBooth error:', error.message);
        
        res.status(500).json({
            success: false,
            error: error.message,
            details: error.code || 'UNKNOWN_ERROR'
        });
    }
});

module.exports = router;