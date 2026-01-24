import React, { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import HomeScreen from './HomeScreen';
import PremiumScreen from './PremiumScreen';
import { checkPremiumStatus, cleanupLegacyPremiumCache } from '../utils/PremiumManager';
import AdManager from '../utils/AdManager';
import { auth } from '../utils/firebase';

export default function AppInitializer({ navigation }) {
    const [showPremium, setShowPremium] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkPremiumShow = async () => {
            try {
                // Clean up legacy premium cache that was shared across accounts
                await cleanupLegacyPremiumCache();
                
                // Check premium status first
                const user = auth.currentUser;
                if (user) {
                    const hasPremium = await checkPremiumStatus(user.email, user.uid);
                    await AdManager.updatePremiumStatus(user.email, user.uid);
                    console.log('User premium status:', hasPremium);
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

                    // Show premium every 2nd open (2, 4, 6...) - AGGRESSIVE for app launches
                    if (newCount % 2 === 0 && newCount > 0) {
                        console.log('🎁 Premium screen should show (counter triggered)');
                        setShowPremium(true);
                    } else {
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