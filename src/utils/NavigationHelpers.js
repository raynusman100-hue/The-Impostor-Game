import { checkPremiumStatus } from './PremiumManager';

/**
 * Smart navigation to Premium screen
 * - Premium users: Does nothing (no navigation, no screen shown)
 * - Non-premium users: Navigates to Premium screen
 * 
 * INSTANT: Uses cached premium status (no delay)
 * 
 * @param {object} navigation - React Navigation object
 * @param {string} userEmail - Optional user email for test users
 * @returns {boolean} - True if navigated to Premium, false if user already has premium
 */
export function navigateToPremiumIfNeeded(navigation, userEmail = null) {
    // Check cached premium status (INSTANT - no network call)
    const hasPremium = checkPremiumStatus(userEmail);
    
    if (hasPremium) {
        console.log('✨ User already has premium - skipping Premium screen');
        return false; // Did not navigate
    }
    
    console.log('💎 Navigating to Premium screen');
    navigation.navigate('Premium');
    return true; // Navigated
}

export default {
    navigateToPremiumIfNeeded,
};
