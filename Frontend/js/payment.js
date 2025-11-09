// =====================================
// PAYMENT HANDLER WITH PACKAGE SELECTION
// =====================================

let currentOrderId = null;
let paymentCheckInterval = null;
let countdownInterval = null;
let expiryTime = null;
let customerData = null;
let selectedPackage = null; // Store selected package

const packageIcons = {
    'collage': '📸',
    'strip': '📷',
    'high-angle': '🎯',
    'wide-angle': '🎬',
    'pas-foto': '🆔'
};

/**
 * Select package
 */
function selectPackage(element) {
    // Remove previous selection
    document.querySelectorAll('.package-card').forEach(card => {
        card.classList.remove('selected');
    });
    
    // Add selection to clicked card
    element.classList.add('selected');
    
    // Store package data
    selectedPackage = {
        name: element.querySelector('.package-name').textContent,
        price: parseInt(element.getAttribute('data-price')),
        package_id: element.getAttribute('data-package')
    };
    
    console.log('Package selected:', selectedPackage);
    
    // Show continue button
    document.getElementById('continueBtn').style.display = 'block';
}

/**
 * Proceed to customer form
 */
function proceedToCustomerForm() {
    if (!selectedPackage) {
        alert('Silakan pilih paket terlebih dahulu!');
        return;
    }
    
    document.getElementById('packageSelection').style.display = 'none';
    
    const customerForm = document.getElementById('customerForm');
    customerForm.style.display = 'block';
    
    // Update selected package info dengan icon
    document.getElementById('previewIcon').textContent = packageIcons[selectedPackage.package_id];
    document.getElementById('selectedPackageName').textContent = selectedPackage.name;
    document.getElementById('selectedPackagePrice').textContent = formatPrice(selectedPackage.price);
    
    setTimeout(() => {
        document.getElementById('customerName').focus();
    }, 100);
}

/**
 * Back to package selection
 */
function backToPackageSelection() {
    // Show package selection
    document.getElementById('packageSelection').style.display = 'block';
    
    // Hide customer form
    document.getElementById('customerForm').style.display = 'none';
    
    // Reset form
    document.getElementById('customerDataForm').reset();
}

/**
 * Handle customer form submit
 */
function handleCustomerSubmit(event) {
    event.preventDefault();

    // Get form data
    const name = document.getElementById('customerName').value.trim();
    const phone = document.getElementById('customerPhone').value.trim();
    const email = document.getElementById('customerEmail').value.trim();

    // Validate
    if (!name || !phone || !email) {
        alert('Semua field harus diisi!');
        return;
    }

    // Validate phone number
    if (!/^(08|628|\+628)[0-9]{8,11}$/.test(phone)) {
        alert('Nomor HP tidak valid!\nFormat: 08xxxxxxxxxx atau 628xxxxxxxxxx');
        return;
    }

    // Validate email
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        alert('Email tidak valid!');
        return;
    }

    // Store customer data
    customerData = {
        name: name,
        phone: phone,
        email: email
    };

    console.log('Customer data:', customerData);
    console.log('Selected package:', selectedPackage);

    // Hide form and proceed to payment
    document.getElementById('customerForm').style.display = 'none';

    // Start payment
    startPaymentQRIS();
}

/**
 * Start QRIS payment with customer data and package
 */
async function startPaymentQRIS() {
    const loading = document.getElementById('loading');

    try {
        loading.classList.add('active');

        console.log('Creating QRIS transaction...');

        // Create QRIS transaction with customer details and package
        const response = await fetch(`${CONFIG.MIDTRANS.SERVER_URL}/create-qris-transaction`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                amount: selectedPackage.price,
                item_name: selectedPackage.name,
                package_id: selectedPackage.package_id,
                customer_name: customerData.name,
                customer_email: customerData.email,
                customer_phone: customerData.phone
            })
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        console.log('QRIS transaction created:', data);
        
        if (data.qr_code_url || data.qr_string) {
            currentOrderId = data.order_id;
            
            // Set expiry time
            expiryTime = new Date(Date.now() + CONFIG.PAYMENT.EXPIRY_MINUTES * 60 * 1000);
            
            // Display QR Code with countdown
            displayQRCodeDirect(data.qr_code_url, data.qr_string, data.order_id);
            
            loading.classList.remove('active');

            // Start countdown
            startCountdown();

            // Start checking payment status
            startPaymentStatusCheck();
        } else {
            throw new Error('QR Code tidak tersedia');
        }

    } catch (error) {
        console.error('Payment Error:', error);
        alert(`Terjadi kesalahan: ${error.message}\nSilakan coba lagi.`);
        
        loading.classList.remove('active');
        
        // Show form again
        document.getElementById('customerForm').style.display = 'block';
    }
}

/**
 * Display QR Code with package and customer info
 */
function displayQRCodeDirect(qrUrl, qrString, orderId) {
    const container = document.querySelector('.container');
    
    const qrDisplay = document.createElement('div');
    qrDisplay.className = 'qr-container active';
    qrDisplay.id = 'qrDisplay';
    qrDisplay.innerHTML = `
        <h3 style="color: #1d1d1f; margin-bottom: 8px;">Scan QR untuk Pembayaran</h3>
        <p style="color: #86868b; font-size: 14px; margin-bottom: 16px;">Gunakan aplikasi pembayaran QRIS Anda</p>
        
        <!-- Package & Customer Info -->
        <div style="background: #f5f5f7; border-radius: 12px; padding: 16px; margin-bottom: 16px; text-align: left;">
            <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 12px;">
                <div>
                    <div style="font-size: 12px; color: #86868b; margin-bottom: 4px;">Paket</div>
                    <div style="font-size: 16px; font-weight: 700; color: #1d1d1f;">${selectedPackage.name}</div>
                </div>
                <div style="font-size: 22px; font-weight: 700; color: #667eea;">${formatPrice(selectedPackage.price)}</div>
            </div>
            <div style="border-top: 1px solid #e0e0e0; padding-top: 12px;">
                <div style="font-size: 12px; color: #86868b; margin-bottom: 4px;">Customer</div>
                <div style="font-size: 14px; font-weight: 600; color: #1d1d1f;">${customerData.name}</div>
                <div style="font-size: 13px; color: #86868b; margin-top: 2px;">${customerData.phone}</div>
            </div>
        </div>
        
        <!-- Countdown Timer -->
        <div class="countdown-timer" id="countdownTimer">
            <h4>Waktu Tersisa</h4>
            <div class="countdown-display" id="countdownDisplay">${CONFIG.PAYMENT.EXPIRY_MINUTES}:00</div>
        </div>
        
        <div class="qr-code">
            ${qrUrl ? `<img src="${qrUrl}" alt="QR Code QRIS">` : 
              `<div style="padding: 20px; background: white;">QR Code</div>`}
        </div>
        
        <p class="payment-info">Menunggu pembayaran...</p>
        <div class="order-id" style="margin-top: 12px; font-size: 12px; color: #86868b;">Order ID: ${orderId}</div>
        
        <!-- Mock Button -->
        <button 
            onclick="mockPaymentSuccess()" 
            style="margin-top: 20px; padding: 12px 24px; background: #34c759; color: white; border: none; border-radius: 8px; cursor: pointer; font-size: 14px; font-weight: 600;">
            🧪 Test: Simulasi Pembayaran Berhasil
        </button>
    `;
    
    const loading = document.getElementById('loading');
    container.insertBefore(qrDisplay, loading);
}

/**
 * Format price to IDR
 */
function formatPrice(price) {
    return 'Rp ' + price.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

/**
 * Start countdown timer
 */
function startCountdown() {
    updateCountdownDisplay();
    
    countdownInterval = setInterval(() => {
        updateCountdownDisplay();
        
        const now = new Date();
        if (now >= expiryTime) {
            handleExpiredPayment();
        }
    }, 1000);
}

/**
 * Update countdown display
 */
function updateCountdownDisplay() {
    const now = new Date();
    const timeLeft = expiryTime - now;
    
    if (timeLeft <= 0) {
        return;
    }
    
    const minutes = Math.floor(timeLeft / 1000 / 60);
    const seconds = Math.floor((timeLeft / 1000) % 60);
    
    const display = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    
    const countdownDisplay = document.getElementById('countdownDisplay');
    if (countdownDisplay) {
        countdownDisplay.textContent = display;
        
        countdownDisplay.classList.remove('warning', 'danger');
        
        if (minutes < 1) {
            countdownDisplay.classList.add('danger');
        } else if (minutes < 3) {
            countdownDisplay.classList.add('warning');
        }
    }
}

/**
 * Handle expired payment
 */
function handleExpiredPayment() {
    console.log('⏰ Payment expired!');
    
    clearInterval(countdownInterval);
    clearInterval(paymentCheckInterval);
    
    const countdownTimer = document.getElementById('countdownTimer');
    if (countdownTimer) {
        countdownTimer.className = 'countdown-timer countdown-expired';
        countdownTimer.innerHTML = `
            <h4>⏰ Waktu Habis</h4>
            <p style="margin: 12px 0; font-size: 14px;">QR Code sudah kadaluarsa</p>
            <button 
                onclick="location.reload()" 
                style="padding: 10px 20px; background: #667eea; color: white; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
                Coba Lagi
            </button>
        `;
    }
    
    const qrCode = document.querySelector('.qr-code');
    if (qrCode) {
        qrCode.style.opacity = '0.3';
        qrCode.style.filter = 'grayscale(100%)';
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
                clearInterval(countdownInterval);
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
    console.log('✅ Payment successful!');
    
    const successMessage = document.getElementById('successMessage');
    const loading = document.getElementById('loading');
    const qrDisplay = document.getElementById('qrDisplay');

    if (qrDisplay) qrDisplay.style.display = 'none';
    successMessage.classList.add('active');
    loading.classList.add('active');

    // Trigger booth dengan package info
    startBoothSession();
}

/**
 * Mock payment success
 */
function mockPaymentSuccess() {
    console.log('🧪 Mock payment success triggered');
    clearInterval(paymentCheckInterval);
    clearInterval(countdownInterval);
    onPaymentSuccess();
}

/**
 * Cleanup
 */
window.addEventListener('beforeunload', () => {
    if (paymentCheckInterval) clearInterval(paymentCheckInterval);
    if (countdownInterval) clearInterval(countdownInterval);
});