/**
 * Production-safe logger utility
 * Set IS_PRODUCTION to true before App Store/Play Store submission
 * This prevents console output in production builds
 */

// Toggle this to true for production builds
const IS_PRODUCTION = true;

export const logger = {
    log: (...args) => {
        if (!IS_PRODUCTION) {
            console.log(...args);
        }
    },
    warn: (...args) => {
        if (!IS_PRODUCTION) {
            console.warn(...args);
        }
    },
    error: (...args) => {
        if (!IS_PRODUCTION) {
            console.error(...args);
        }
    },
    // For critical errors that should always be logged (even in production)
    critical: (...args) => {
        console.error('[CRITICAL]', ...args);
    }
};

export default logger;
