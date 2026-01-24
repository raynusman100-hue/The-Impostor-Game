import AsyncStorage from '@react-native-async-storage/async-storage';
import { ref, get } from 'firebase/database';
import { database } from './firebase';

// Premium emails granted by developer
const PREMIUM_EMAILS = [
    'zayanusman36@gmail.com', // Developer
];

// Listener system for premium status changes
const premiumListeners = [];

/**
 * Add a listener for premium status changes
 * @param {Function} callback - Called when premium status changes
 * @returns {Function} - Unsubscribe function
 */
export function addPremiumListener(callback) {
    premiumListeners.push(callback);
    return () => {
        const index = premiumListeners.indexOf(callback);
        if (index > -1) {
            premiumListeners.splice(index, 1);
        }
    };
}

/**
 * Notify all listeners of premium status change
 * @param {boolean} isPremium - New premium status
 */
function notifyListeners(isPremium) {
    premiumListeners.forEach(callback => callback(isPremium));
}

/**
 * Clean up old non-user-scoped premium cache entries
 * This fixes the bug where premium status was shared across all accounts
 */
export async function cleanupLegacyPremiumCache() {
    try {
        // Remove the old global premium status key
        await AsyncStorage.removeItem('user_premium_status');
        console.log('🧹 Cleaned up legacy premium cache');
    } catch (error) {
        console.error('Error cleaning legacy cache:', error);
    }
}

/**
 * Check if a user has premium access via Firebase
 * @param {string} userEmail - User's email address
 * @param {string} userId - User's ID (optional)
 * @returns {Promise<boolean>} - True if user has premium
 */
export async function checkPremiumStatus(userEmail, userId = null) {
    try {
        // 1. Check if user is in developer premium list
        if (userEmail && PREMIUM_EMAILS.includes(userEmail.toLowerCase())) {
            console.log('✨ Premium user detected (developer list):', userEmail);
            // Cache locally with userId to prevent cross-account contamination
            if (userId) {
                await AsyncStorage.setItem(`user_premium_status_${userId}`, 'true');
            }
            return true;
        }

        // 2. Check Firebase /premiumUsers/{userId}
        if (userId) {
            const userPremiumRef = ref(database, `premiumUsers/${userId}`);
            const userSnapshot = await get(userPremiumRef);
            if (userSnapshot.exists() && userSnapshot.val() === true) {
                console.log('✨ Premium user detected (Firebase UID):', userId);
                await AsyncStorage.setItem(`user_premium_status_${userId}`, 'true');
                return true;
            }
        }

        // 3. Check Firebase /premiumEmails/{emailKey}
        if (userEmail) {
            const emailKey = userEmail.toLowerCase().replace(/[.@]/g, '_');
            const emailPremiumRef = ref(database, `premiumEmails/${emailKey}`);
            const emailSnapshot = await get(emailPremiumRef);
            if (emailSnapshot.exists() && emailSnapshot.val() === true) {
                console.log('✨ Premium user detected (Firebase email):', userEmail);
                // Cache locally with userId to prevent cross-account contamination
                if (userId) {
                    await AsyncStorage.setItem(`user_premium_status_${userId}`, 'true');
                }
                return true;
            }
        }

        // 4. Check local cache (User Scoped)
        if (userId) {
            const localPremium = await AsyncStorage.getItem(`user_premium_status_${userId}`);
            if (localPremium === 'true') {
                console.log('✨ Premium user detected (offline cache)');
                return true;
            }
        }

        // Not premium
        if (userId) {
            await AsyncStorage.setItem(`user_premium_status_${userId}`, 'false');
        }
        return false;
    } catch (error) {
        console.error('Error checking premium status:', error);

        // Fallback to local user cache on error
        if (userId) {
            const localPremium = await AsyncStorage.getItem(`user_premium_status_${userId}`);
            return localPremium === 'true';
        }
        return false;
    }
}

/**
 * Set premium status locally and in Firebase
 * @param {boolean} isPremium - Premium status
 * @param {string} userId - User's ID
 * @param {string} userEmail - User's email
 */
export async function setPremiumStatus(isPremium, userId = null, userEmail = null) {
    try {
        // Save locally (User Scoped)
        if (userId) {
            await AsyncStorage.setItem(`user_premium_status_${userId}`, isPremium ? 'true' : 'false');
            console.log('Premium status set locally for:', userId, isPremium);
        }

        // Save to Firebase if userId provided
        if (isPremium && userId) {
            const { set } = require('firebase/database');
            await set(ref(database, `premiumUsers/${userId}`), true);
            console.log('Premium status saved to Firebase (UID):', userId);
        }

        // Save to Firebase by email if provided
        if (isPremium && userEmail) {
            const { set } = require('firebase/database');
            const emailKey = userEmail.toLowerCase().replace(/[.@]/g, '_');
            await set(ref(database, `premiumEmails/${emailKey}`), true);
            console.log('Premium status saved to Firebase (email):', userEmail);
        }

        // Notify all listeners
        notifyListeners(isPremium);
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
    addPremiumListener,
    getAvailableCategories,
    isCategoryAvailable,
    getPremiumStyling,
    shouldShowAds,
    cleanupLegacyPremiumCache,
};
