// =====================================
// PAYMENT CONTROLLER
// =====================================

const { snap } = require('../config/midtrans');
const logger = require('../utils/logger');

/**
 * Create new transaction
 */
exports.createTransaction = async (req, res) => {
    try {
        const { amount, item_name, customer_name, customer_email } = req.body;

        // Validate input
        if (!amount || !item_name) {
            return res.status(400).json({
                error: 'Missing required fields',
                required: ['amount', 'item_name']
            });
        }

        // Generate unique order ID
        const orderId = 'PHOTOBOX-' + Date.now();
        
        logger.log(`Creating transaction: ${orderId}`);

        // Prepare transaction parameter
        const parameter = {
            transaction_details: {
                order_id: orderId,
                gross_amount: amount,
                enabled_payments: qris
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
            },

            // Hanya enable QRIS
            enabled_payments: ['qris']
            
        };

        logger.log('Transaction parameter:', parameter);

        // Create transaction
        const transaction = await snap.createTransaction(parameter);
        
        logger.log(`Transaction created successfully: ${orderId}`);
        logger.log('Transaction response:', transaction);

        // Return response
        res.json({
            success: true,
            order_id: orderId,
            token: transaction.token,
            redirect_url: transaction.redirect_url
        });

    } catch (error) {
        logger.error('Create Transaction Error:', error);
        
        // Detailed error response
        res.status(500).json({
            error: 'Failed to create transaction',
            message: error.message,
            details: error.ApiResponse || error.rawHttpClientData || null
        });
    }
};

/**
 * Check payment status
 */
exports.checkPaymentStatus = async (req, res) => {
    try {
        const { orderId } = req.params;

        logger.log(`Checking payment status: ${orderId}`);

        // Use Snap transaction status (different from Core API)
        const statusResponse = await snap.transaction.status(orderId);
        
        logger.log(`Payment status: ${statusResponse.transaction_status}`);

        res.json({
            success: true,
            order_id: orderId,
            transaction_status: statusResponse.transaction_status,
            payment_type: statusResponse.payment_type,
            transaction_time: statusResponse.transaction_time,
            status_code: statusResponse.status_code
        });

    } catch (error) {
        logger.error('Check Payment Error:', error);
        
        if (error.httpStatusCode === 404) {
            return res.status(404).json({
                error: 'Order not found',
                order_id: req.params.orderId
            });
        }

        res.status(500).json({
            error: 'Failed to check payment status',
            message: error.message
        });
    }
};

/**
 * Handle Midtrans notification/callback
 */
exports.handleNotification = async (req, res) => {
    try {
        const notification = req.body;
        
        logger.log('Received notification:', notification);

        // Verify notification using Snap
        const statusResponse = await snap.transaction.notification(notification);
        
        const orderId = statusResponse.order_id;
        const transactionStatus = statusResponse.transaction_status;
        const fraudStatus = statusResponse.fraud_status;

        logger.log(`Notification: ${orderId} - ${transactionStatus}`);

        // Handle based on transaction status
        if (transactionStatus === 'capture') {
            if (fraudStatus === 'accept') {
                logger.log(`Payment captured: ${orderId}`);
            }
        } else if (transactionStatus === 'settlement') {
            logger.log(`Payment settled: ${orderId}`);
        } else if (transactionStatus === 'cancel' || 
                   transactionStatus === 'deny' || 
                   transactionStatus === 'expire') {
            logger.log(`Payment failed: ${orderId} - ${transactionStatus}`);
        } else if (transactionStatus === 'pending') {
            logger.log(`Payment pending: ${orderId}`);
        }

        res.status(200).json({ success: true });

    } catch (error) {
        logger.error('Notification Error:', error);
        res.status(500).json({
            error: 'Failed to handle notification',
            message: error.message
        });
    }
};