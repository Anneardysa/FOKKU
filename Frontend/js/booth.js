// =====================================
// DSLR BOOTH HANDLER - WITH PROXY
// =====================================

/**
 * Start dslrBooth session after successful payment
 */
async function startBoothSession() {
    try {
        console.log('Starting booth session...');

        // Pakai backend proxy untuk avoid CORS
        const apiUrl = `${CONFIG.MIDTRANS.SERVER_URL}/trigger-booth`;

        console.log('Calling booth API via proxy:', apiUrl);

        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            }
        });

        console.log('Booth API response status:', response.status);

        const data = await response.json();
        console.log('Booth response:', data);
        
        if (data.success) {
            // Success
            console.log('Booth session started successfully!');
            setTimeout(() => {
                showBoothSuccess();
            }, 1000);
        } else {
            throw new Error(data.error || 'Gagal memulai sesi booth');
        }

    } catch (error) {
        console.error('Booth Error:', error);
        
        // Show detailed error
        let errorMessage = error.message;
        
        if (error.message.includes('Failed to fetch')) {
            errorMessage = 'Tidak dapat terhubung ke dslrBooth.\n\nPastikan:\n1. Software dslrBooth sudah running\n2. Port 1500 terbuka\n3. Backend server running';
        }
        
        alert(`Pembayaran berhasil!\nOrder ID: ${currentOrderId}\n\n⚠️ Error koneksi ke booth:\n${errorMessage}\n\nSilakan hubungi operator.`);
        
        // Log for troubleshooting
        console.error('Failed to connect to booth:', {
            orderId: currentOrderId,
            error: error.message,
            apiUrl: apiUrl
        });
        
        // Reload setelah beberapa detik
        setTimeout(() => {
            if (confirm('Reload halaman?')) {
                window.location.reload();
            }
        }, 3000);
    }
}

/**
 * Show success message and reset
 */
function showBoothSuccess() {
    alert('✅ Pembayaran berhasil!\n✅ Sesi foto berhasil dimulai!\n\n📸 Silakan menuju booth untuk memulai foto.');
    
    // Reload page after 2 seconds
    setTimeout(() => {
        window.location.reload();
    }, 2000);
}

/**
 * Manual trigger booth (for testing)
 */
function manualTriggerBooth(orderId) {
    currentOrderId = orderId || 'TEST-' + Date.now();
    startBoothSession();
}

// Expose for debugging
window.debugBooth = {
    startSession: startBoothSession,
    manualTrigger: manualTriggerBooth,
    testAPI: async () => {
        const apiUrl = `${CONFIG.MIDTRANS.SERVER_URL}/trigger-booth`;
        console.log('Testing booth API via proxy:', apiUrl);
        try {
            const response = await fetch(apiUrl);
            const data = await response.json();
            console.log('✅ Test result:', data);
            return data;
        } catch (error) {
            console.error('❌ Test failed:', error);
            return { success: false, error: error.message };
        }
    }
};