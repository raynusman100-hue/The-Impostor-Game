import React, { useState, useEffect } from 'react';
import { View, Platform } from 'react-native';
import { BannerAd, BannerAdSize, TestIds } from 'react-native-google-mobile-ads';
import PurchaseManager from '../utils/PurchaseManager';

const adUnitId = __DEV__
    ? TestIds.BANNER
    : Platform.select({
        ios: 'ca-app-pub-xxxxxxxxxxxxxxxx/xxxxxxxxxx',
        android: 'ca-app-pub-xxxxxxxxxxxxxxxx/xxxxxxxxxx',
    });

const AdComponent = () => {
    const [isPro, setIsPro] = useState(PurchaseManager.isPro);

    useEffect(() => {
        // Initial check
        setIsPro(PurchaseManager.isPro);

        // Subscribe to pro status changes
        const unsubscribe = PurchaseManager.addListener((status) => {
            setIsPro(status);
        });
        return unsubscribe;
    }, []);

    if (isPro) {
        return null;
    }

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
