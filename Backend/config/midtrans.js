// =====================================
// MIDTRANS CONFIGURATION
// =====================================

const midtransClient = require('midtrans-client');
require('dotenv').config();

console.log('=== MIDTRANS CONFIG DEBUG ===');
console.log('Server Key:', process.env.MIDTRANS_SERVER_KEY ? 'Found' : 'MISSING');
console.log('Client Key:', process.env.MIDTRANS_CLIENT_KEY ? 'Found' : 'MISSING');
console.log('Is Production:', process.env.MIDTRANS_IS_PRODUCTION);

// Validasi environment variables
if (!process.env.MIDTRANS_SERVER_KEY || !process.env.MIDTRANS_CLIENT_KEY) {
    console.error('ERROR: Midtrans API Keys not found in .env file!');
    process.exit(1);
}

// Initialize Snap API dengan konfigurasi yang benar
const snap = new midtransClient.Snap({
    isProduction: process.env.MIDTRANS_IS_PRODUCTION === 'true',
    serverKey: process.env.MIDTRANS_SERVER_KEY,
    clientKey: process.env.MIDTRANS_CLIENT_KEY
});

console.log('Midtrans Snap initialized');
console.log('============================');

module.exports = { snap };