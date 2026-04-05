import { Platform } from 'react-native';
import { checkPremiumStatus, shouldShowAds } from './PremiumManager';

// ============================================================
// ADS ENABLED FOR PRODUCTION BUILD
// ============================================================
const ADS_ENABLED = true;

// Check if we're on web - ads not supported
const isWeb = Platform.OS === 'web';

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

    async loadInterstitial(userEmail = null, userId = null) {
        if (!ADS_ENABLED || isWeb) {
            console.log('AdManager: DISABLED - ads not enabled or on web platform');
            return;
        }

        // INSTANT: Check cached premium status
        const hasPremium = checkPremiumStatus(userEmail, userId);
        if (!shouldShowAds(hasPremium)) {
            console.log('AdManager: DISABLED - user has premium access');
            return;
        }

        this._loadInterstitialFull();
    }

    async showInterstitial(onAdClosed, userEmail = null, userId = null) {
        if (!ADS_ENABLED || isWeb) {
            console.log('AdManager: DISABLED - ads not enabled or on web platform');
            onAdClosed?.();
            return;
        }

        // INSTANT: Check cached premium status
        const hasPremium = checkPremiumStatus(userEmail, userId);
        if (!shouldShowAds(hasPremium)) {
            console.log('AdManager: DISABLED - user has premium access');
            onAdClosed?.();
            return;
        }

        this._showInterstitialFull(onAdClosed);
    }

    // Full implementations - only called when ADS_ENABLED = true and not on web
    _loadInterstitialFull() {
        // Dynamic import to avoid web bundling issues
        const { InterstitialAd, AdEventType, TestIds } = require('react-native-google-mobile-ads');
        const PurchaseManager = require('./PurchaseManager').default;

        const adUnitId = __DEV__
            ? TestIds.INTERSTITIAL
            : Platform.select({
                ios: 'ca-app-pub-7729962731169324~3612955915',
                android: 'ca-app-pub-7729962731169324/8893202750',
            });

        if (PurchaseManager.getProStatus()) return;

        if (this.interstitial) {
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
            this.loadInterstitial();
        });

        this.interstitial.addAdEventListener(AdEventType.ERROR, (error) => {
            console.log('AdManager Error:', error);
            this.loaded = false;
        });

        this.interstitial.load();
    }

    _showInterstitialFull(onAdClosed) {
        const { AdEventType } = require('react-native-google-mobile-ads');
        const PurchaseManager = require('./PurchaseManager').default;

        if (PurchaseManager.getProStatus()) {
            console.log('User is Pro, skipping interstitial');
            onAdClosed?.();
            return;
        }

        if (this.loaded && this.interstitial) {
            const unsubscribe = this.interstitial.addAdEventListener(AdEventType.CLOSED, () => {
                onAdClosed?.();
                unsubscribe();
            });

            this.interstitial.show();
            this.loaded = false;
        } else {
            console.log('Interstitial not ready, loading for next time');
            onAdClosed?.();
            this.loadInterstitial();
        }
    }
}

export default AdManager.getInstance();
