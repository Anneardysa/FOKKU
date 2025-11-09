// =====================================
// QRIS DIRECT PAYMENT CONTROLLER
// =====================================

const axios = require('axios');
const logger = require('../utils/logger');

/**
 * Create QRIS transaction directly
 */
exports.createQRISTransaction = async (req, res) => {
    try {
        const { amount, item_name, customer_name, customer_email } = req.body;

        if (!amount || !item_name) {
            return res.status(400).json({
                error: 'Missing required fields',
                required: ['amount', 'item_name']
            });
        }

        const orderId = 'PHOTOBOX-' + Date.now();
        
        logger.log(`Creating QRIS transaction: ${orderId}`);

        // Prepare request body
        const requestBody = {
            payment_type: 'qris',
            transaction_details: {
                order_id: orderId,
                gross_amount: amount
            },
            item_details: [{
                id: 'PHOTOBOX-001',
                price: amount,
                quantity: 1,
                name: item_name
            }],
            customer_details: {
                first_name: customer_name || 'Customer',
                email: customer_email || 'customer@example.com'
            }
        };

        // Create base64 auth
        const serverKey = process.env.MIDTRANS_SERVER_KEY;
        const base64Auth = Buffer.from(serverKey + ':').toString('base64');

        // Call Midtrans Core API
        const response = await axios.post(
            'https://api.sandbox.midtrans.com/v2/charge',
            requestBody,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Basic ${base64Auth}`
                }
            }
        );

        const data = response.data;
        
        logger.log(`QRIS transaction created: ${orderId}`);
        logger.log('QRIS Response:', data);

        // Return QR code URL
        res.json({
            success: true,
            order_id: orderId,
            transaction_id: data.transaction_id,
            qr_code_url: data.actions ? data.actions.find(a => a.name === 'generate-qr-code')?.url : null,
            qr_string: data.qr_string,
            transaction_status: data.transaction_status,
            transaction_time: data.transaction_time
        });

    } catch (error) {
        logger.error('Create QRIS Transaction Error:', error.response?.data || error);
        
        res.status(500).json({
            error: 'Failed to create QRIS transaction',
            message: error.message,
            details: error.response?.data || null
        });
    }
};