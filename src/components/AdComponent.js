import React, { useState, useEffect } from 'react';
import { View, Platform } from 'react-native';
import PurchaseManager from '../utils/PurchaseManager';

// ============================================================
// ADS DISABLED FOR EXPO GO TESTING
// Set ADS_ENABLED = true to re-enable Google Mobile Ads
// ============================================================
const ADS_ENABLED = false;

// Check if we're on web - ads not supported
const isWeb = Platform.OS === 'web';

const AdComponent = () => {
    const [isPro, setIsPro] = useState(PurchaseManager.isPro);

    useEffect(() => {
        setIsPro(PurchaseManager.isPro);

        const unsubscribe = PurchaseManager.addListener((status) => {
            setIsPro(status);
        });
        return unsubscribe;
    }, []);

    // Don't render anything on web or when disabled
    if (isPro || !ADS_ENABLED || isWeb) {
        return null;
    }

    // Only load and render BannerAd when enabled and on native
    const { BannerAd, BannerAdSize, TestIds } = require('react-native-google-mobile-ads');
    
    const adUnitId = __DEV__
        ? TestIds.BANNER
        : Platform.select({
            ios: 'ca-app-pub-xxxxxxxxxxxxxxxx/xxxxxxxxxx',
            android: 'ca-app-pub-xxxxxxxxxxxxxxxx/xxxxxxxxxx',
        });

    return (
        <View style={{ alignItems: 'center', justifyContent: 'center', marginVertical: 10 }}>
            <BannerAd
                unitId={adUnitId}
                size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
                requestOptions={{
                    requestNonPersonalizedAdsOnly: true,
                }}
            />
        </View>
    );
};

export default AdComponent;
