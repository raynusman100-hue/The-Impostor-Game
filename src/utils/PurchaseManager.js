import Purchases from 'react-native-purchases';
import { Platform } from 'react-native';

// RevenueCat Public SDK Keys (Safe to include in app)
// These are PUBLIC keys - they cannot grant premium without actual payment
// All purchases are verified server-side by Apple/Google through RevenueCat
const API_KEYS = {
    apple: 'appl_GidmNgibMGrbuhmiJwrzLeJLEZM',  // iOS Public SDK Key
    google: 'goog_WeLuvQfgjZEppbpIoqiqCzciCqq',  // Android Public SDK Key
};

class PurchaseManager {
    static instance = null;

    constructor() {
        this.isPro = false;
        this.listeners = [];
        this.expirationDate = null;
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

            await this.checkProStatus();
        } catch (error) {
            console.log('PurchaseManager Init Error:', error);
        }
    }

    async checkProStatus() {
        try {
            const customerInfo = await Purchases.getCustomerInfo();
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
