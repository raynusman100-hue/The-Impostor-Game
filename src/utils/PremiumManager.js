import AsyncStorage from '@react-native-async-storage/async-storage';

// Premium test users (for development/testing)
const PREMIUM_TEST_USERS = [
    'zayanusman36@gmail.com', // Premium access granted
    // Add more test emails here if needed
];

/**
 * Check if a user has premium access
 * @param {string} userEmail - User's email address
 * @param {string} userId - User's ID (optional, for future payment integration)
 * @returns {Promise<boolean>} - True if user has premium
 */
export async function checkPremiumStatus(userEmail, userId = null) {
    try {
        // 1. Check if user is in test premium list
        if (userEmail && PREMIUM_TEST_USERS.includes(userEmail.toLowerCase())) {
            console.log('✨ Premium user detected (test list):', userEmail);
            return true;
        }

        // 2. Check local premium status (for offline/cached status)
        const localPremium = await AsyncStorage.getItem('user_premium_status');
        if (localPremium === 'true') {
            console.log('✨ Premium user detected (local cache)');
            return true;
        }

        // 3. TODO: Check with payment provider (RevenueCat, Stripe, etc.)
        // const premiumStatus = await checkPaymentProvider(userId);
        // if (premiumStatus) return true;

        // 4. Check Firebase/backend for premium status
        // const backendStatus = await checkBackendPremium(userId);
        // if (backendStatus) return true;

        return false;
    } catch (error) {
        console.error('Error checking premium status:', error);
        return false;
    }
}

/**
 * Set premium status locally (for testing or after purchase)
 * @param {boolean} isPremium - Premium status
 */
export async function setPremiumStatus(isPremium) {
    try {
        await AsyncStorage.setItem('user_premium_status', isPremium ? 'true' : 'false');
        console.log('Premium status set:', isPremium);
    } catch (error) {
        console.error('Error setting premium status:', error);
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

export default {
    checkPremiumStatus,
    setPremiumStatus,
    getAvailableCategories,
    isCategoryAvailable,
    getPremiumStyling,
    shouldShowAds,
};
