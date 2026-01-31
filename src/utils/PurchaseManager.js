import Purchases from 'react-native-purchases';
import { Platform } from 'react-native';

// RevenueCat API Keys
const API_KEYS = {
    apple: 'app06ec5f375b',  // iOS Production Key
    google: 'goog_xxxxxxxxxx',  // Android Production Key - UPDATE THIS with your actual key from RevenueCat dashboard
};

class PurchaseManager {
    static instance = null;

    constructor() {
        this.isPro = false;
        this.listeners = [];
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
