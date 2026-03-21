import PurchaseManager from './PurchaseManager';
import { updateHostPremiumStatus } from './connectionUtils';

// Premium test users (for development/testing)
// NOTE: For production testing, use RevenueCat's sandbox mode instead
const PREMIUM_TEST_USERS = [
    // Add test emails here for testing
    // Example: 'test@example.com',
];

/**
 * Check if a user has premium access
 * Uses RevenueCat SDK which handles:
 * - Online: Fetches latest status from Apple/Google servers
 * - Offline: Uses cached entitlement data with expiration validation
 * - Expiration: Automatically expires premium when subscription ends (even offline)
 * 
 * @param {string} userEmail - User's email address (optional, for test users)
 * @param {string} userId - User's ID (optional)
 * @returns {Promise<boolean>} - True if user has premium
 */
export async function checkPremiumStatus(userEmail = null, userId = null) {
    try {
        // 1. Check if user is in test premium list (development only)
        if (userEmail && PREMIUM_TEST_USERS.includes(userEmail.toLowerCase())) {
            console.log('✨ Premium user detected (test list):', userEmail);
            return true;
        }

        // 2. Check RevenueCat for actual purchase status (SINGLE SOURCE OF TRUTH)
        // RevenueCat SDK automatically handles:
        // - Purchase verification with Apple/Google
        // - Subscription status (active/expired/cancelled)
        // - Receipt validation
        // - Cross-device sync
        // - Refund detection
        // - Offline caching with expiration timestamps
        // - Automatic expiration when subscription ends (even offline)
        const hasPremium = await PurchaseManager.checkProStatus();
        
        console.log('✨ Premium status from RevenueCat:', hasPremium);
        return hasPremium;
        
    } catch (error) {
        console.error('Error checking premium status:', error);
        // On error, default to no premium access
        // RevenueCat SDK already has offline caching built-in with proper expiration
        return false;
    }
}

/**
 * Get all available categories based on premium status
 * @param {boolean} hasPremium - Whether user has premium
 * @param {Array} allCategories - All category labels
 * @returns {Array} - Available categories
 */
export function getAvailableCategories(hasPremium, allCategories) {
    if (hasPremium) {
        // Premium users get all categories
        return allCategories;
    }
    
    // Free users only get free categories
    return allCategories.filter(cat => 
        cat.free === true || (!cat.premium && !cat.free)
    );
}

/**
 * Check if a specific category is available to the user
 * @param {string} categoryKey - Category key to check
 * @param {boolean} hasPremium - Whether user has premium
 * @param {Array} allCategories - All category labels
 * @returns {boolean} - True if category is available
 */
export function isCategoryAvailable(categoryKey, hasPremium, allCategories) {
    if (hasPremium) return true;
    
    const category = allCategories.find(cat => cat.key === categoryKey);
    if (!category) return false;
    
    return category.free === true || (!category.premium && !category.free);
}

/**
 * Get premium user styling (golden username, badges, etc.)
 * @param {boolean} hasPremium - Whether user has premium
 * @param {object} theme - Current theme
 * @returns {object} - Styling object
 */
export function getPremiumStyling(hasPremium, theme) {
    if (!hasPremium) {
        return {
            usernameColor: theme.colors.text,
            usernameShadow: null,
            badge: null,
            borderColor: theme.colors.primary + '50',
        };
    }
    
    return {
        usernameColor: '#FFD700', // Gold
        usernameShadow: {
            textShadowColor: 'rgba(255, 215, 0, 0.5)',
            textShadowOffset: { width: 0, height: 0 },
            textShadowRadius: 8,
        },
        badge: '👑', // Crown emoji
        borderColor: '#FFD700', // Gold border
    };
}

/**
 * Should show ads to this user?
 * @param {boolean} hasPremium - Whether user has premium
 * @returns {boolean} - True if should show ads
 */
export function shouldShowAds(hasPremium) {
    return !hasPremium;
}

/**
 * Check host premium status and sync to Firebase
 * Implements retry logic with exponential backoff for robust operation
 * 
 * @param {string} roomCode - The room code to sync premium status for
 * @param {string} hostId - The host's ID (optional, for logging)
 * @returns {Promise<boolean>} - True if host has premium, false on error or no premium
 */
export async function checkAndSyncHostPremium(roomCode, hostId = null) {
    const maxRetries = 3;
    let lastError = null;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            console.log(`Checking host premium status (attempt ${attempt}/${maxRetries})...`);
            
            // Check premium status using existing function
            const hasPremium = await checkPremiumStatus();
            
            console.log(`Host premium status: ${hasPremium}`);
            
            // Sync to Firebase with retry logic built into updateHostPremiumStatus
            await updateHostPremiumStatus(roomCode, hasPremium);
            
            console.log(`Successfully synced host premium status to Firebase: ${hasPremium}`);
            return hasPremium;
            
        } catch (error) {
            lastError = error;
            console.error(`Premium sync attempt ${attempt} failed:`, error.message);
            
            if (attempt === maxRetries) {
                console.error('All premium sync attempts failed, defaulting to false');
                break;
            }
            
            // Exponential backoff with jitter
            const delay = Math.pow(2, attempt - 1) * 1000 + Math.random() * 500;
            console.log(`Retrying in ${delay}ms...`);
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
    
    // Fallback to false on all failures
    console.error('Premium sync failed after all retries:', lastError?.message || 'Unknown error');
    
    // Try to update Firebase with false status as fallback
    try {
        await updateHostPremiumStatus(roomCode, false);
        console.log('Successfully set fallback premium status to false');
    } catch (fallbackError) {
        console.error('Failed to set fallback premium status:', fallbackError.message);
    }
    
    return false;
}

export default {
    checkPremiumStatus,
    checkAndSyncHostPremium,
    getAvailableCategories,
    isCategoryAvailable,
    getPremiumStyling,
    shouldShowAds,
};
