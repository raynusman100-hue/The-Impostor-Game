import { InterstitialAd, AdEventType, TestIds } from 'react-native-google-mobile-ads';
import { Platform } from 'react-native';
import PurchaseManager from './PurchaseManager';

// Test IDs for development
const adUnitId = __DEV__
    ? TestIds.INTERSTITIAL
    : Platform.select({
        ios: 'ca-app-pub-xxxxxxxxxxxxxxxx/xxxxxxxxxx',
        android: 'ca-app-pub-xxxxxxxxxxxxxxxx/xxxxxxxxxx',
    });

class AdManager {
    static instance = null;

    constructor() {
        this.interstitial = null;
        this.loaded = false;
    }

    static getInstance() {
        if (!AdManager.instance) {
            AdManager.instance = new AdManager();
        }
        return AdManager.instance;
    }

    loadInterstitial() {
        // frequent checks to avoid loading if user is pro
        if (PurchaseManager.isPro) return;

        if (this.interstitial) {
            // already loading or loaded? 
            // We can just create a new one to be safe or reuse if not shown.
            // For simplicity, let's create a new one if not loaded, or return if loaded.
            if (this.loaded) return;
        }

        this.interstitial = InterstitialAd.createForAdRequest(adUnitId, {
            requestNonPersonalizedAdsOnly: true,
        });

        this.interstitial.addAdEventListener(AdEventType.LOADED, () => {
            this.loaded = true;
        });

        this.interstitial.addAdEventListener(AdEventType.CLOSED, () => {
            this.loaded = false;
            this.interstitial = null;
            // Preload the next one
            this.loadInterstitial();
        });

        this.interstitial.addAdEventListener(AdEventType.ERROR, (error) => {
            console.log('AdManager Error:', error);
            this.loaded = false;
        });

        this.interstitial.load();
    }

    showInterstitial(onAdClosed) {
        if (PurchaseManager.isPro) {
            console.log('User is Pro, skipping interstitial');
            onAdClosed?.();
            return;
        }

        if (this.loaded && this.interstitial) {
            // Add one-time listener for close event validation
            const unsubscribe = this.interstitial.addAdEventListener(AdEventType.CLOSED, () => {
                onAdClosed?.();
                unsubscribe();
            });

            this.interstitial.show();
            this.loaded = false; // reset immediately
        } else {
            console.log('Interstitial not ready, loading for next time');
            onAdClosed?.(); // Proceed if ad fails to show
            this.loadInterstitial();
        }
    }
}

export default AdManager.getInstance();
