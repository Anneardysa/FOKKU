// =====================================
// CONFIGURATION FILE
// =====================================

const CONFIG = {
    // Midtrans Configuration
    MIDTRANS: {
        CLIENT_KEY: 'TOKEN_KEY_YANG_BARU',
        SERVER_URL: 'http://localhost:3000/api'
    },

    // dslrBooth Configuration
    DSLR_BOOTH: {
        API_URL: 'http://localhost:1500/api/start',
        PASSWORD: 'TVfJT8hT40jUxHNI',
        MODE: 'print'
    },

    // Payment Configuration
    PAYMENT: {
        AMOUNT: 25000,
        ITEM_NAME: 'Photobox Session',
        PACKAGE: 'standard',
        CHECK_INTERVAL: 3000 // Check every 3 seconds
    },

    // Customer Default Info
    CUSTOMER: {
        NAME: 'Customer',
        EMAIL: 'customer@example.com'
    }
};

// Freeze configuration to prevent modifications
Object.freeze(CONFIG);