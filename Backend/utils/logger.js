// =====================================
// SIMPLE LOGGER UTILITY
// =====================================

const logger = {
    log: (message, data = null) => {
        const timestamp = new Date().toISOString();
        console.log(`[${timestamp}] INFO:`, message);
        if (data) {
            console.log(JSON.stringify(data, null, 2));
        }
    },

    error: (message, error = null) => {
        const timestamp = new Date().toISOString();
        console.error(`[${timestamp}] ERROR:`, message);
        if (error) {
            console.error(error);
        }
    },

    warn: (message, data = null) => {
        const timestamp = new Date().toISOString();
        console.warn(`[${timestamp}] WARN:`, message);
        if (data) {
            console.warn(data);
        }
    }
};

module.exports = logger;