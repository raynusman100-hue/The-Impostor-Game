import React, { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import HomeScreen from './HomeScreen';
import PremiumScreen from './PremiumScreen';
import { checkPremiumStatus } from '../utils/PremiumManager';
import AdManager from '../utils/AdManager';
import { auth } from '../utils/firebase';
import PurchaseManager from '../utils/PurchaseManager';

export default function AppInitializer({ navigation }) {
    const [showPremium, setShowPremium] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkPremiumShow = async () => {
            try {
                // CRITICAL FIX: Link user to RevenueCat FIRST, then check premium status
                const user = auth.currentUser;
                if (user) {
                    console.log('🔗 [INIT] Linking user to RevenueCat...');
                    const linkingResult = await PurchaseManager.linkUserToRevenueCat(user.uid, true);
                    
                    // Log diagnostics if linking failed
                    if (linkingResult && !linkingResult.success) {
                        console.warn('RevenueCat linking failed on app startup:', linkingResult.diagnostics);
                    }
                    
                    // THEN refresh premium status from RevenueCat
                    console.log('🔄 [INIT] Refreshing premium status...');
                    await PurchaseManager.checkProStatus();
                }

                // Check if this is a fresh app launch (not just navigation)
                const lastCheckTime = await AsyncStorage.getItem('premium_last_check');
                const now = Date.now();
                
                // Only increment counter if it's been more than 5 seconds since last check
                // This prevents counting every navigation to Home as an "app open"
                const timeSinceLastCheck = lastCheckTime ? now - parseInt(lastCheckTime, 10) : Infinity;
                
                if (timeSinceLastCheck > 5000) { // 5 seconds threshold
                    const countStr = await AsyncStorage.getItem('app_open_count');
                    const count = countStr ? parseInt(countStr, 10) : 0;
                    const newCount = count + 1;

                    await AsyncStorage.setItem('app_open_count', newCount.toString());
                    await AsyncStorage.setItem('premium_last_check', now.toString());
                    console.log(`📊 App opened ${newCount} times`);

                    // CRITICAL: Check premium status AFTER linking completes
                    // Use cached status (which was just refreshed above)
                    const hasPremium = user ? checkPremiumStatus(user.email, user.uid) : false;
                    console.log('✅ [INIT] User premium status (after linking):', hasPremium);

                    // Show premium every 2nd open (2, 4, 6...) - AGGRESSIVE for app launches
                    // BUT only if user doesn't have premium
                    if (newCount % 2 === 0 && newCount > 0 && !hasPremium) {
                        console.log('🎁 Premium screen should show (counter triggered)');
                        setShowPremium(true);
                    } else {
                        if (hasPremium) {
                            console.log('⏭️ Skipping premium screen (user has premium)');
                        }
                        setShowPremium(false);
                    }
                } else {
                    console.log('⏭️ Skipping premium check (recent navigation)');
                    setShowPremium(false);
                }
            } catch (error) {
                console.error('Premium check error:', error);
                setShowPremium(false);
            } finally {
                setIsLoading(false);
            }
        };

        checkPremiumShow();
    }, []);

    const handlePremiumClose = () => {
        setShowPremium(false);
    };

    if (isLoading) {
        return null; // Or a loading screen
    }

    if (showPremium) {
        return <PremiumScreen navigation={{ ...navigation, goBack: handlePremiumClose }} />;
    }

    return <HomeScreen navigation={navigation} />;
}