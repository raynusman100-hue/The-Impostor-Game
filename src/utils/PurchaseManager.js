import Purchases from 'react-native-purchases';
import { Platform } from 'react-native';

// RevenueCat Public SDK Keys (Safe to include in app)
// These are PUBLIC keys - they cannot grant premium without actual payment
// All purchases are verified server-side by Apple/Google through RevenueCat
// 
// ⚠️ IMPORTANT: Use PRODUCTION keys for App Store builds!
// Get production keys from: RevenueCat Dashboard → Your App → API Keys → Production
const API_KEYS = {
    apple: 'appl_GidmNgibMGrbuhmiJwrzLeJLEZM',  // iOS Public SDK Key (Production)
    google: 'goog_WeLuvQfgjZEppbpIoqiqCzciCqq',  // Android Public SDK Key (Production)
};

class PurchaseManager {
    static instance = null;

    constructor() {
        this.isPro = false;
        this.listeners = [];
        this.expirationDate = null;
        this.isConfigured = false; // Track SDK initialization state
        this.debugText = "Loading RC...";
    }

    static getInstance() {
        if (!PurchaseManager.instance) {
            PurchaseManager.instance = new PurchaseManager();
        }
        return PurchaseManager.instance;
    }

    async initialize() {
        try {
            if (Platform.OS === 'ios') {
                await Purchases.configure({ apiKey: API_KEYS.apple });
            } else if (Platform.OS === 'android') {
                await Purchases.configure({ apiKey: API_KEYS.google });
            }

            // Mark SDK as configured
            this.isConfigured = true;

            // Initial check to populate cache
            await this.checkProStatus();
            
            // Set up background refresh every 60 seconds to keep cache fresh
            this.refreshInterval = setInterval(() => {
                console.log('🔄 Background premium refresh...');
                this.checkProStatus().catch(err => {
                    console.log('Background refresh failed:', err);
                });
            }, 60000); // 60 seconds
            
        } catch (error) {
            console.log('PurchaseManager Init Error:', error);
            this.isConfigured = false;
        }
    }

    // INSTANT: Return cached status synchronously
    getProStatus() {
        return this.isPro;
    }

    // BACKGROUND: Refresh premium status from RevenueCat (async)
    async checkProStatus() {
        try {
            const customerInfo = await Purchases.getCustomerInfo();
            
            // 🐛 DIAGNOSTIC LOGGING
            try {
                const appUserID = await Purchases.getAppUserID();
                this.debugText = `RC ID: ${appUserID}\nOrig: ${customerInfo.originalAppUserId}\nActive: ${Object.keys(customerInfo.entitlements.active || {}).join(',') || 'none'}\nAll: ${Object.keys(customerInfo.entitlements.all || {}).join(',') || 'none'}`;
                console.log('📊 [RC DEBUG] Current App User ID:', appUserID);
                console.log('📊 [RC DEBUG] Original App User ID:', customerInfo.originalAppUserId);
                console.log('📊 [RC DEBUG] Active Entitlements:', Object.keys(customerInfo.entitlements.active || {}));
                console.log('📊 [RC DEBUG] All Entitlements:', Object.keys(customerInfo.entitlements.all || {}));
            } catch (logErr) {
                this.debugText = `RC Log Err: ${logErr.message}`;
                console.warn('📊 [RC DEBUG] Failed to log diagnostics:', logErr);
            }

            // "premium" should be the Entitlement ID configured in RevenueCat
            const premiumEntitlement = customerInfo.entitlements.active['premium'];
            
            if (premiumEntitlement) {
                this.setProStatus(true);
                // Store expiration info for debugging/UI purposes
                this.expirationDate = premiumEntitlement.expirationDate;
                console.log('✅ Premium active, expires:', this.expirationDate);
                return true;
            } else {
                this.setProStatus(false);
                this.expirationDate = null;
                console.log('❌ No active premium entitlement');
                return false;
            }
        } catch (error) {
            console.log('Error checking pro status:', error);
            // Don't change current status on error - RevenueCat handles offline caching
            // Return current known status instead of defaulting to false
            console.log('Using last known premium status:', this.isPro);
            return this.isPro;
        }
    }

    // Get expiration date for UI display (optional)
    getExpirationDate() {
        return this.expirationDate;
    }

    /**
     * Links RevenueCat customer to Firebase user ID
     * @param {string} firebaseUserId - Firebase UID from auth.currentUser.uid
     * @param {boolean} retryOnFailure - Optional: retry once after 2 seconds if linking fails
     * @returns {Promise<{success: boolean, error?: string, diagnostics?: object}>} - Result object with success status and diagnostics
     */
    async linkUserToRevenueCat(firebaseUserId, retryOnFailure = false) {
        try {
            console.log('🔗 Linking RevenueCat to Firebase UID:', firebaseUserId);
            
            // Call RevenueCat logIn with Firebase UID
            const { customerInfo } = await Purchases.logIn(firebaseUserId);
            
            // Update cached premium status from returned customer info
            const premiumEntitlement = customerInfo.entitlements.active['premium'];
            this.setProStatus(!!premiumEntitlement);
            
            // Log transfer information if it occurred
            if (customerInfo.originalAppUserId && customerInfo.originalAppUserId !== firebaseUserId) {
                console.log('📦 Transfer:', customerInfo.originalAppUserId, '->', firebaseUserId);
            }
            
            console.log('✅ RevenueCat linked successfully');
            return { success: true };
        } catch (error) {
            // Capture detailed diagnostics
            const diagnostics = {
                sdkInitialized: this.isConfigured,
                platform: Platform.OS,
                apiKeyPrefix: API_KEYS[Platform.OS === 'ios' ? 'apple' : 'google'].substring(0, 10),
                errorCode: error.code || 'UNKNOWN',
                errorMessage: error.message || 'Unknown error',
                timestamp: new Date().toISOString(),
            };

            // Log detailed error information
            console.error('❌ RevenueCat login failed:', error);
            console.error('📊 Diagnostics:', JSON.stringify(diagnostics, null, 2));

            // Retry logic for app startup context
            if (retryOnFailure) {
                console.log('🔄 Retrying RevenueCat linking in 2 seconds...');
                await new Promise(resolve => setTimeout(resolve, 2000));
                
                try {
                    const { customerInfo } = await Purchases.logIn(firebaseUserId);
                    const premiumEntitlement = customerInfo.entitlements.active['premium'];
                    this.setProStatus(!!premiumEntitlement);
                    
                    if (customerInfo.originalAppUserId && customerInfo.originalAppUserId !== firebaseUserId) {
                        console.log('📦 Transfer:', customerInfo.originalAppUserId, '->', firebaseUserId);
                    }
                    
                    console.log('✅ RevenueCat linked successfully (after retry)');
                    return { success: true };
                } catch (retryError) {
                    const retryDiagnostics = {
                        ...diagnostics,
                        retryAttempted: true,
                        retryErrorCode: retryError.code || 'UNKNOWN',
                        retryErrorMessage: retryError.message || 'Unknown error',
                    };
                    console.error('❌ RevenueCat login retry failed:', retryError);
                    console.error('📊 Retry Diagnostics:', JSON.stringify(retryDiagnostics, null, 2));
                    return { success: false, error: retryError.message, diagnostics: retryDiagnostics };
                }
            }

            // Return error with diagnostics
            return { success: false, error: error.message, diagnostics };
        }
    }

    /**
     * Unlinks RevenueCat customer (logout)
     * @returns {Promise<void>}
     */
    async unlinkUser() {
        try {
            console.log('🔓 Unlinking RevenueCat user...');
            
            // Call RevenueCat logOut
            await Purchases.logOut();
            
            // Reset cached premium status
            this.setProStatus(false);
            this.expirationDate = null;
            
            console.log('✅ RevenueCat unlinked successfully');
        } catch (error) {
            console.error('❌ RevenueCat logout failed:', error);
            // Don't throw - allow app to continue with sign-out
        }
    }

    // NEW: Fetch current offering to get the display price
    async getCurrentOffering() {
        try {
            const offerings = await Purchases.getOfferings();
            if (offerings.current !== null && offerings.current.availablePackages.length !== 0) {
                return offerings.current.availablePackages[0];
            }
            return null;
        } catch (error) {
            console.log('Error fetching offering:', error);
            return null;
        }
    }

    async purchaseRemoveAds(planType) {
        try {
            // Fetch available offerings
            const offerings = await Purchases.getOfferings();

            if (offerings.current !== null && offerings.current.availablePackages.length !== 0) {
                // Find the package that matches the selected plan (weekly, monthly, yearly)
                const packageToBuy = offerings.current.availablePackages.find(
                    (pkg) => pkg.identifier === planType
                ) || offerings.current.availablePackages[0];

                const { customerInfo } = await Purchases.purchasePackage(packageToBuy);

                if (typeof customerInfo.entitlements.active['premium'] !== "undefined") {
                    this.setProStatus(true);
                    return { success: true };
                }
            }
            return { success: false, error: 'No offerings available' };
        } catch (error) {
            if (error.userCancelled) {
                return { success: false, error: 'User cancelled' };
            }
            return { success: false, error: error.message };
        }
    }

    async restorePurchases() {
        try {
            const customerInfo = await Purchases.restorePurchases();
            if (typeof customerInfo.entitlements.active['premium'] !== "undefined") {
                this.setProStatus(true);
                return true;
            }
            return false;
        } catch (error) {
            return false;
        }
    }

    // Force a fresh sync bypassing the local cache
    async forceSyncPurchases() {
        try {
            console.log('🔄 [RC DEBUG] Forcing RevenueCat sync...');
            if (Platform.OS === 'ios') {
                // Syncs purchases with App Store
                await Purchases.syncPurchases();
            }
            // Clears local cache to force a backend fetch on next getCustomerInfo
            if (Purchases.invalidateCustomerInfoCache) {
                await Purchases.invalidateCustomerInfoCache();
            }
            return await this.checkProStatus();
        } catch (error) {
            console.error('❌ [RC DEBUG] Force sync failed:', error);
            return this.isPro;
        }
    }

    setProStatus(status) {
        if (this.isPro !== status) {
            this.isPro = status;
            this.notifyListeners();
        }
    }

    addListener(callback) {
        this.listeners.push(callback);
        // Immediately trigger with current status
        callback(this.isPro);
        return () => {
            this.listeners = this.listeners.filter(cb => cb !== callback);
        };
    }

    notifyListeners() {
        this.listeners.forEach(cb => cb(this.isPro));
    }
}

export default PurchaseManager.getInstance();
