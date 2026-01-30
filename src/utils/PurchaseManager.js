import Purchases from 'react-native-purchases';
import { Platform } from 'react-native';
import { fetchRevenueCatKeys } from './remoteConfig';

// RevenueCat API Keys
// Hardcoded Fallback (Test Keys) - Used if Remote Config fails
const FALLBACK_KEYS = {
    apple: 'appl_GidmNgibMGrbuhmiJwrzLeJLEZM',
    google: 'test_TnKjYrBPiEbigNCyWVqzMRvEwHx', // Waiting for Android key (goog_...)
};

class PurchaseManager {
    static instance = null;

    constructor() {
        this.isPro = false;
        this.listeners = [];
        this.isConfigured = false;
    }

    static getInstance() {
        if (!PurchaseManager.instance) {
            PurchaseManager.instance = new PurchaseManager();
        }
        return PurchaseManager.instance;
    }

    async initialize(userId = null) {
        if (this.isConfigured) return;

        try {
            // 1. Fetch keys from Remote Config (with fallback to hardcoded)
            const remoteKeys = await fetchRevenueCatKeys();

            // Determine which key to use
            let apiKey = null;

            if (Platform.OS === 'ios') {
                apiKey = remoteKeys?.apple || FALLBACK_KEYS.apple;
            } else if (Platform.OS === 'android') {
                apiKey = remoteKeys?.google || FALLBACK_KEYS.google;
            }

            if (!apiKey) {
                console.error('❌ PurchaseManager: No Valid API Key found!');
                return;
            }

            console.log(`💳 PurchaseManager: Configuring with ${remoteKeys ? 'Remote' : 'Fallback'} Key...`);
            await Purchases.configure({ apiKey, appUserID: userId });

            this.isConfigured = true;
            console.log('✅ RevenueCat configured with user:', userId);

            await this.checkProStatus();
        } catch (error) {
            console.log('PurchaseManager Init Error:', error);
        }
    }

    async ensureInit() {
        if (!this.isConfigured) {
            console.log('⚠️ PurchaseManager not initialized, lazy loading...');
            await this.initialize();
        }
    }

    /**
     * Login user to RevenueCat - syncs purchases across devices
     * @param {string} userId - User's unique ID (Firebase UID)
     */
    async loginUser(userId) {
        try {
            await this.ensureInit();

            if (!userId) {
                console.warn('⚠️ No userId provided to loginUser');
                return;
            }

            console.log('🔐 Logging in user to RevenueCat:', userId);
            await Purchases.logIn(userId);

            // Check premium status after login
            const isPremium = await this.checkProStatus();
            console.log('✅ User logged in to RevenueCat. Premium status:', isPremium);

            return isPremium;
        } catch (error) {
            console.error('❌ Error logging in user to RevenueCat:', error);
            return false;
        }
    }

    /**
     * Logout user from RevenueCat
     */
    async logoutUser() {
        try {
            console.log('👋 Logging out user from RevenueCat');
            await Purchases.logOut();
            this.setProStatus(false);
        } catch (error) {
            console.error('Error logging out from RevenueCat:', error);
        }
    }

    async checkProStatus() {
        try {
            await this.ensureInit();

            const customerInfo = await Purchases.getCustomerInfo();
            // "pro_version" should be the Entitlement ID configured in RevenueCat
            if (typeof customerInfo.entitlements.active['pro_version'] !== "undefined") {
                this.setProStatus(true);
                return true;
            } else {
                this.setProStatus(false);
                return false;
            }
        } catch (error) {
            console.log('Error checking pro status:', error);
            return false;
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

    async purchaseRemoveAds(packageType = 'ANNUAL') {
        try {
            // Fetch available offerings
            const offerings = await Purchases.getOfferings();

            if (offerings.current !== null && offerings.current.availablePackages.length !== 0) {
                let packageToBuy = null;

                // Try to find the specific package type requested
                // RevenueCat package types: 0=UNKNOWN, 1=LIFETIME, 2=ANNUAL, 3=SIX_MONTH, 4=THREE_MONTH, 5=TWO_MONTH, 6=MONTHLY, 7=WEEKLY
                if (packageType) {
                    packageToBuy = offerings.current.availablePackages.find(
                        pkg => pkg.packageType === packageType
                    );
                }

                // Fallback: If no specific type found (or requested), use the first available
                if (!packageToBuy) {
                    console.log(`⚠️ Requested package type ${packageType} not found, falling back to first available.`);
                    packageToBuy = offerings.current.availablePackages[0];
                }

                console.log(`🛒 Buying package: ${packageToBuy.product.identifier} (${packageToBuy.packageType})`);
                const { customerInfo } = await Purchases.purchasePackage(packageToBuy);

                if (typeof customerInfo.entitlements.active['pro_version'] !== "undefined") {
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
            if (typeof customerInfo.entitlements.active['pro_version'] !== "undefined") {
                this.setProStatus(true);
                return true;
            }
            return false;
        } catch (error) {
            return false;
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
