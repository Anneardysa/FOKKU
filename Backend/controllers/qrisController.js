// =====================================
// QRIS DIRECT PAYMENT CONTROLLER
// =====================================

const axios = require('axios');
const logger = require('../utils/logger');

/**
 * Create QRIS transaction directly with customer details
 */
exports.createQRISTransaction = async (req, res) => {
    try {
        const { amount, item_name, customer_name, customer_email, customer_phone } = req.body;

        // Validate required fields
        if (!amount || !item_name) {
            return res.status(400).json({
                error: 'Missing required fields',
                required: ['amount', 'item_name']
            });
        }

        // Validate customer details
        if (!customer_name || !customer_email || !customer_phone) {
            return res.status(400).json({
                error: 'Customer details are required',
                required: ['customer_name', 'customer_email', 'customer_phone']
            });
        }

        const orderId = 'PHOTOBOX-' + Date.now();
        
        logger.log(`Creating QRIS transaction: ${orderId}`);
        logger.log(`Customer: ${customer_name} (${customer_email}, ${customer_phone})`);

        // Prepare request body with full customer details
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
                first_name: customer_name.split(' ')[0] || customer_name,
                last_name: customer_name.split(' ').slice(1).join(' ') || '',
                email: customer_email,
                phone: customer_phone
            }
        };

        // Create base64 auth
        const serverKey = process.env.MIDTRANS_SERVER_KEY;
        const base64Auth = Buffer.from(serverKey + ':').toString('base64');

        logger.log('Calling Midtrans API...');

        // Call Midtrans Core API
        const response = await axios.post(
            'https://api.sandbox.midtrans.com/v2/charge',
            requestBody,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                    'Authorization': `Basic ${base64Auth}`
                },
                timeout: 15000
            }
        );

        const data = response.data;
        
        logger.log(`✅ QRIS transaction created: ${orderId}`);
        logger.log('Transaction status:', data.transaction_status);

        // Return QR code URL
        res.json({
            success: true,
            order_id: orderId,
            transaction_id: data.transaction_id,
            qr_code_url: data.actions ? data.actions.find(a => a.name === 'generate-qr-code')?.url : null,
            qr_string: data.qr_string,
            transaction_status: data.transaction_status,
            transaction_time: data.transaction_time,
            customer: {
                name: customer_name,
                email: customer_email,
                phone: customer_phone
            }
        });

    } catch (error) {
        logger.error('Create QRIS Transaction Error:', error.response?.data || error.message);
        
        res.status(500).json({
            error: 'Failed to create QRIS transaction',
            message: error.message,
            details: error.response?.data || null
        });
    }
};