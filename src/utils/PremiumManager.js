import AsyncStorage from '@react-native-async-storage/async-storage';
import PurchaseManager from './PurchaseManager';

// ============================================================
// PREMIUM MANAGER - SIMPLE & SECURE
// ============================================================
// This is a MINIMAL implementation that ONLY uses hardcoded emails
// RevenueCat and Firebase premium grants are DISABLED until properly configured
// ============================================================

// ============================================================
// PREMIUM MANAGER - CLOUD ARCHITECTURE
// ============================================================
// 1. RevenueCat (Real Customers)
// 2. Firebase Remote Config (Friends/VIPs)
// 3. Local Cache (Offline Support)
// ============================================================

// Listener system for premium status changes
const premiumListeners = [];

/**
 * Add a listener for premium status changes
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
 */
function notifyListeners(isPremium) {
    premiumListeners.forEach(callback => {
        try {
            callback(isPremium);
        } catch (error) {
            console.error('Error in premium listener:', error);
        }
    });
}

/**
 * Clear premium cache for a specific user (call on sign out)
 */
export async function clearPremiumCache(userId) {
    if (!userId) return;

    try {
        await AsyncStorage.removeItem(`user_premium_${userId}`);
        console.log('🧹 Premium cache cleared for:', userId);
    } catch (error) {
        console.error('Error clearing premium cache:', error);
    }
}

/**
 * Check if a user has premium access
 * SIMPLE LOGIC: Checks hardcoded email list with offline fallback
 * 
 * @param {string} userEmail - User's email address
 * @param {string} userId - User's ID
 * @param {boolean} forceOffline - Force offline mode (for testing)
 * @returns {Promise<boolean>} - True if user has premium
 */
export async function checkPremiumStatus(userEmail, userId = null, forceOffline = false) {
    try {
        console.log('🔍 Checking premium for:', userEmail);

        // STEP 1: Check RevenueCat (Real Customers) - PRIORITY
        try {
            if (PurchaseManager && PurchaseManager.checkProStatus) {
                // RevenueCat has its own internal offline cache that respects expiration
                const isRevenueCatPro = await PurchaseManager.checkProStatus();
                if (isRevenueCatPro) {
                    console.log('✅ PREMIUM USER (RevenueCat):', userEmail);
                    // DO NOT CACHE 'true' HERE. RevenueCat manages its own validity.
                    // If we cache 'true', we lose the expiration date and grant lifetime access offline.

                    // Clear simple cache to avoid confusion if they switch from Lifetime -> Sub
                    if (userId) await AsyncStorage.removeItem(`user_premium_${userId}`);

                    notifyListeners(true);
                    return true;
                }
            }
        } catch (rcError) {
            console.log('⚠️ RevenueCat check failed:', rcError);
        }

        // STEP 2: Check Firebase Remote Config (VIPs/Friends)
        // Only if userEmail is provided
        if (userEmail && !forceOffline) {
            try {
                const { fetchPremiumEmails } = require('./remoteConfig');
                const remoteList = await fetchPremiumEmails();

                if (remoteList) { // Ensure fetch actually succeeded
                    if (remoteList.includes(userEmail.toLowerCase())) {
                        console.log('✅ PREMIUM USER (Firebase Remote Config):', userEmail);
                        // DO CACHE this, because lifetime access doesn't expire.
                        if (userId) await AsyncStorage.setItem(`user_premium_${userId}`, 'true');
                        notifyListeners(true);
                        return true;
                    } else {
                        // CRITICAL FIX: IF FETCH SUCCEEDED BUT USER IS NOT IN LIST -> REVOKE CACHE
                        // This prevents "Sticky Premium" where a removed user stays premium due to old cache.
                        console.log('🚫 User NOT in remote list -> Revoking simple cache');
                        if (userId) await AsyncStorage.setItem(`user_premium_${userId}`, 'false');
                        // Do NOT return false yet, technically could still be cached (though we just cleared it),
                        // or could have some other fallbacks (unlikely for lifetime).
                        // But effectively, this cleans the state.
                    }
                }
            } catch (remoteError) {
                console.log('⚠️ Remote Config check failed:', remoteError);
            }
        }

        // STEP 3: Cached Check (Offline Support for LIFETIME/FIREBASE ONLY)
        // RevenueCat offline support is already handled in Step 1 via its own SDK
        if (userId) {
            const cached = await AsyncStorage.getItem(`user_premium_${userId}`);
            if (cached === 'true') {
                console.log('✅ PREMIUM USER (Firebase cached):', userEmail);
                notifyListeners(true);
                return true;
            }
            // Explicitly set false if not found to clean up
            await AsyncStorage.setItem(`user_premium_${userId}`, 'false');
        }

        // STEP 4: Not premium
        console.log('❌ NOT PREMIUM:', userEmail);
        notifyListeners(false);
        return false;

    } catch (error) {
        console.error('Error checking premium:', error);
        notifyListeners(false);
        return false;
    }
}

/**
 * Get cached premium status (for offline use)
 * This is now integrated into checkPremiumStatus, but kept for backwards compatibility
 */
export async function getCachedPremiumStatus(userId) {
    if (!userId) return false;

    try {
        const cached = await AsyncStorage.getItem(`user_premium_${userId}`);
        const isPremium = cached === 'true';
        console.log('📦 Cached premium status for', userId, ':', isPremium);
        return isPremium;
    } catch (error) {
        console.error('Error getting cached premium:', error);
        return false;
    }
}

/**
 * Get all available categories based on premium status
 */
export function getAvailableCategories(hasPremium, allCategories) {
    if (hasPremium) {
        return allCategories;
    }

    // Free users only get free categories
    return allCategories.filter(cat =>
        cat.free === true || (!cat.premium && !cat.free)
    );
}

/**
 * Check if a specific category is available to the user
 */
export function isCategoryAvailable(categoryKey, hasPremium, allCategories) {
    if (hasPremium) return true;

    const category = allCategories.find(cat => cat.key === categoryKey);
    if (!category) return false;

    return category.free === true || (!category.premium && !category.free);
}

/**
 * Should show ads to this user?
 */
export function shouldShowAds(hasPremium) {
    return !hasPremium;
}

/**
 * Set premium status (for RevenueCat purchases)
 * NOTE: This should ONLY be called after verified purchase
 * Currently disabled - will be enabled when RevenueCat is configured
 */
export async function setPremiumStatus(isPremium, userId = null, userEmail = null) {
    console.warn('⚠️ setPremiumStatus called but is currently DISABLED');
    console.warn('⚠️ Premium can only be granted via PREMIUM_EMAILS list');
    console.warn('⚠️ Enable this function when RevenueCat is properly configured');

    // For now, just update the cache (won't actually grant premium)
    // CRITICAL: RevenueCat purchases should NOT be cached here as 'true'
    // because that overrides expiration logic.
    /* 
    if (userId && isPremium) {
        await AsyncStorage.setItem(`user_premium_${userId}`, 'true');
        console.log('📝 Premium cached locally (but not granted)');
    }
    */

    // Only cache if EXPLICITLY requested as lifetime/manual (rare)
    if (userId && isPremium && !PurchaseManager.isPro) {
        // This path is mostly unused now, but keeping for safety
        console.log('⚠️ setPremiumStatus: Skipping manual cache to prevent infinite premium bug.');
    }

    notifyListeners(isPremium);
}

/**
 * DEBUG: Check premium status with detailed logging
 */
export async function debugPremiumStatus(userId, userEmail) {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🔍 DEBUG PREMIUM STATUS');
    console.log('User:', userEmail);
    console.log('UID:', userId);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    // Check Firebase Remote Config list
    let inList = false;
    try {
        const { fetchPremiumEmails } = require('./remoteConfig');
        const remoteList = await fetchPremiumEmails();
        inList = remoteList && userEmail && remoteList.includes(userEmail.toLowerCase());
        console.log('1. remoteConfig list:', inList ? '✅ YES' : '❌ NO');
        console.log('   (List logic: ' + (remoteList ? remoteList.length + ' emails' : 'null') + ')');
    } catch (e) {
        console.log('1. remoteConfig list: ⚠️ ERROR', e);
    }

    // Check cache
    if (userId) {
        const cached = await AsyncStorage.getItem(`user_premium_${userId}`);
        console.log('2. Local cache:', cached === 'true' ? '✅ YES' : cached === 'false' ? '❌ NO' : '⚠️  NOT SET');
    }

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('RESULT (Remote):', inList ? '✅ PREMIUM' : '❌ NOT PREMIUM');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

    return inList;
}

/**
 * ADMIN: Manually clear all premium caches (nuclear option)
 */
export async function clearAllPremiumCaches() {
    try {
        const allKeys = await AsyncStorage.getAllKeys();
        const premiumKeys = allKeys.filter(key => key.startsWith('user_premium_'));

        if (premiumKeys.length > 0) {
            await AsyncStorage.multiRemove(premiumKeys);
            console.log('🧹 Cleared', premiumKeys.length, 'premium caches');
        }

        return true;
    } catch (error) {
        console.error('Error clearing all premium caches:', error);
        return false;
    }
}

if (PurchaseManager && PurchaseManager.addListener) {
    PurchaseManager.addListener((isPro) => {
        if (isPro) {
            console.log('💰 PurchaseManager reported PRO status -> Updating PremiumManager');
            notifyListeners(true);
        }
    });
}

// ============================================================
// AUTO-REFRESH ON INTERNET RECONNECT
// ============================================================
import NetInfo from '@react-native-community/netinfo';
import { auth } from './firebase';

NetInfo.addEventListener(state => {
    if (state.isConnected) {
        console.log('🌐 Internet Connected -> Re-verifying Premium Status...');
        const user = auth.currentUser;
        if (user) {
            // Force a re-check when back online to validate expiration/grants
            checkPremiumStatus(user.email, user.uid).catch(e => console.log('Re-check failed', e));
        }
    }
});

export default {
    checkPremiumStatus,
    getCachedPremiumStatus,
    clearPremiumCache,
    clearAllPremiumCaches,
    addPremiumListener,
    getAvailableCategories,
    isCategoryAvailable,
    shouldShowAds,
    setPremiumStatus,
    debugPremiumStatus,
};
