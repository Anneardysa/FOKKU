// =====================================
// PAYMENT HANDLER - QRIS DIRECT
// =====================================

let currentOrderId = null;
let paymentCheckInterval = null;

/**
 * Start QRIS payment (langsung QR code)
 */
async function startPaymentQRIS() {
    const startBtn = document.getElementById('startBtn');
    const loading = document.getElementById('loading');

    try {
        startBtn.disabled = true;
        loading.classList.add('active');

        console.log('Creating QRIS transaction...');

        // Create QRIS transaction
        const response = await fetch(`${CONFIG.MIDTRANS.SERVER_URL}/create-qris-transaction`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                amount: CONFIG.PAYMENT.AMOUNT,
                item_name: CONFIG.PAYMENT.ITEM_NAME,
                customer_name: CONFIG.CUSTOMER.NAME,
                customer_email: CONFIG.CUSTOMER.EMAIL
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('QRIS transaction created:', data);
        
        if (data.qr_code_url || data.qr_string) {
            currentOrderId = data.order_id;
            
            // Display QR Code
            displayQRCodeDirect(data.qr_code_url, data.qr_string, data.order_id);
            
            loading.classList.remove('active');
            startBtn.style.display = 'none';

            // Start checking payment status
            startPaymentStatusCheck();
        } else {
            throw new Error('QR Code tidak tersedia');
        }

    } catch (error) {
        console.error('Payment Error:', error);
        alert(`Terjadi kesalahan: ${error.message}\nSilakan coba lagi.`);
        
        startBtn.disabled = false;
        loading.classList.remove('active');
    }
}

/**
 * Display QR Code directly
 */
function displayQRCodeDirect(qrUrl, qrString, orderId) {
    // Create container for QR display
    const container = document.querySelector('.container');
    
    // Hide status card and features
    document.querySelector('.status-card').style.display = 'none';
    document.querySelector('.features').style.display = 'none';
    
    // Create QR display
    const qrDisplay = document.createElement('div');
    qrDisplay.className = 'qr-container active';
    qrDisplay.innerHTML = `
        <h3 style="color: #1d1d1f; margin-bottom: 8px;">Scan QR untuk Pembayaran</h3>
        <p style="color: #86868b; font-size: 14px; margin-bottom: 16px;">Gunakan aplikasi pembayaran QRIS Anda</p>
        <div class="qr-code">
            ${qrUrl ? `<img src="${qrUrl}" alt="QR Code QRIS">` : 
              `<div style="padding: 20px; background: white;">
                <canvas id="qrCanvas"></canvas>
              </div>`}
        </div>
        <p class="payment-info">Menunggu pembayaran...</p>
        <div class="order-id">Order ID: ${orderId}</div>
    `;
    
    // Insert before loading
    const loading = document.getElementById('loading');
    container.insertBefore(qrDisplay, loading);
    
    // If using QR string, generate QR code with library
    if (!qrUrl && qrString) {
        generateQRFromString(qrString);
    }
}

/**
 * Generate QR Code from string (optional - needs QR library)
 */
function generateQRFromString(qrString) {
    // Bisa pakai library seperti qrcode.js
    // Untuk sekarang, tampilkan text saja
    const canvas = document.getElementById('qrCanvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        ctx.font = '12px monospace';
        ctx.fillText('QR String: ' + qrString.substring(0, 50) + '...', 10, 50);
    }
}

/**
 * Start checking payment status
 */
function startPaymentStatusCheck() {
    console.log('Starting payment status check...');
    
    paymentCheckInterval = setInterval(async () => {
        try {
            const response = await fetch(
                `${CONFIG.MIDTRANS.SERVER_URL}/check-payment/${currentOrderId}`
            );
            
            if (!response.ok) {
                console.warn('Payment check failed:', response.status);
                return;
            }

            const data = await response.json();
            console.log('Payment status:', data.transaction_status);

            if (data.transaction_status === 'settlement' || 
                data.transaction_status === 'capture') {
                clearInterval(paymentCheckInterval);
                onPaymentSuccess();
            }
        } catch (error) {
            console.error('Error checking payment:', error);
        }
    }, CONFIG.PAYMENT.CHECK_INTERVAL);
}

/**
 * Handle successful payment
 */
function onPaymentSuccess() {
    console.log('Payment successful!');
    
    const successMessage = document.getElementById('successMessage');
    const loading = document.getElementById('loading');
    const qrContainer = document.querySelector('.qr-container');

    // Hide QR, show success
    if (qrContainer) qrContainer.style.display = 'none';
    successMessage.classList.add('active');
    loading.classList.add('active');

    // Start booth session
    startBoothSession();
}

window.addEventListener('beforeunload', () => {
    if (paymentCheckInterval) {
        clearInterval(paymentCheckInterval);
    }
});