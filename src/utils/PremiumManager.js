import PurchaseManager from './PurchaseManager';
import { updateHostPremiumStatus } from './connectionUtils';

// Premium test users (for development/testing)
// NOTE: For production testing, use RevenueCat's sandbox mode instead
const PREMIUM_TEST_USERS = [
    // Add test emails here for testing
    // Example: 'test@example.com',
];

/**
 * INSTANT: Get cached premium status (synchronous, no network delay)
 * Returns immediately from in-memory cache loaded at app start
 * 
 * @param {string} userEmail - User's email address (optional, for test users)
 * @param {string} userId - User's ID (optional)
 * @returns {boolean} - True if user has premium (from cache)
 */
export function checkPremiumStatus(userEmail = null, userId = null) {
    // 1. Check if user is in test premium list (development only)
    if (userEmail && PREMIUM_TEST_USERS.includes(userEmail.toLowerCase())) {
        console.log('✨ Premium user detected (test list):', userEmail);
        return true;
    }

    // 2. Return cached status from PurchaseManager (INSTANT)
    // PurchaseManager.initialize() was called at app start and cached the status
    const hasPremium = PurchaseManager.getProStatus();
    
    console.log('✨ Premium status (cached):', hasPremium);
    return hasPremium;
}

/**
 * BACKGROUND: Refresh premium status from RevenueCat (async, for updates)
 * Use this when you need to check for recent changes (e.g., after purchase)
 * 
 * @returns {Promise<boolean>} - True if user has premium (fresh from RevenueCat)
 */
export async function refreshPremiumStatus() {
    try {
        console.log('🔄 Refreshing premium status from RevenueCat...');
        const hasPremium = await PurchaseManager.checkProStatus();
        console.log('✨ Premium status refreshed:', hasPremium);
        return hasPremium;
    } catch (error) {
        console.error('Error refreshing premium status:', error);
        return PurchaseManager.getProStatus(); // Fallback to cache
    }
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
 * INSTANT: Check host premium status and sync to Firebase
 * Uses cached premium status for instant response
 * 
 * @param {string} roomCode - The room code to sync premium status for
 * @param {string} hostId - The host's ID (optional, for logging)
 * @returns {Promise<boolean>} - True if host has premium
 */
export async function checkAndSyncHostPremium(roomCode, hostId = null) {
    try {
        console.log('Checking host premium status (cached)...');
        
        // Get cached premium status (INSTANT - no network call)
        const hasPremium = checkPremiumStatus();
        
        console.log(`Host premium status (cached): ${hasPremium}`);
        
        // Sync to Firebase (fast - Firebase has its own caching)
        await updateHostPremiumStatus(roomCode, hasPremium);
        
        console.log(`Successfully synced host premium status to Firebase: ${hasPremium}`);
        return hasPremium;
        
    } catch (error) {
        console.error('Premium sync failed:', error.message);
        
        // Fallback: Try to update Firebase with cached status
        try {
            const cachedStatus = checkPremiumStatus();
            await updateHostPremiumStatus(roomCode, cachedStatus);
            console.log('Successfully set fallback premium status:', cachedStatus);
            return cachedStatus;
        } catch (fallbackError) {
            console.error('Failed to set fallback premium status:', fallbackError.message);
            return false;
        }
    }
}

export default {
    checkPremiumStatus,
    refreshPremiumStatus,
    checkAndSyncHostPremium,
    shouldShowAds,
};
