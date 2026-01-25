import Purchases from 'react-native-purchases';
import { Platform } from 'react-native';

// TODO: Replace with your actual RevenueCat API Keys
const API_KEYS = {
    apple: 'appl_placeholder_key',
    google: 'goog_placeholder_key',
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
            if (Platform.OS === 'ios') {
                await Purchases.configure({ apiKey: API_KEYS.apple, appUserID: userId });
            } else if (Platform.OS === 'android') {
                await Purchases.configure({ apiKey: API_KEYS.google, appUserID: userId });
            }

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

    async purchaseRemoveAds() {
        try {
            // Fetch available offerings
            const offerings = await Purchases.getOfferings();

            if (offerings.current !== null && offerings.current.availablePackages.length !== 0) {
                // Assume the first package is the "Remove Ads" one
                const packageToBuy = offerings.current.availablePackages[0];

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
