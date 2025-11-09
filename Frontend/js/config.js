// =====================================
// CONFIGURATION FILE
// =====================================

const CONFIG = {
    MIDTRANS: {
        CLIENT_KEY: 'TOKEN',
        SERVER_URL: 'http://localhost:3000/api'
    },

    DSLR_BOOTH: {
        API_URL: 'http://localhost:1500/api/start',
        PASSWORD: 'TVfJT8hT40jUxHNI',
        MODE: 'print'
    },

    PAYMENT: {
        CHECK_INTERVAL: 3000,
        EXPIRY_MINUTES: 15
    },

    PACKAGES: [
        { id: 'collage', name: 'Photobooth Collage', price: 65000 },
        { id: 'strip', name: 'Photobooth Strip', price: 45000 },
        { id: 'high-angle', name: 'High Angle', price: 45000 },
        { id: 'wide-angle', name: 'Wide Angle', price: 45000 },
        { id: 'pas-foto', name: 'Pas Foto', price: 45000 }
    ],

    CUSTOMER: {
        NAME: 'Customer',
        EMAIL: 'customer@example.com'
    }
};

Object.freeze(CONFIG);