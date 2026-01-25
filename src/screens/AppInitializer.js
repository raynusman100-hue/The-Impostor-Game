import React, { useEffect, useState, useRef } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { onAuthStateChanged } from 'firebase/auth';
import HomeScreen from './HomeScreen';
import PremiumScreen from './PremiumScreen';
import { checkPremiumStatus, clearAllPremiumCaches } from '../utils/PremiumManager';
import AdManager from '../utils/AdManager';
import { auth } from '../utils/firebase';
import { useTheme } from '../utils/ThemeContext';

export default function AppInitializer({ navigation }) {
    const { theme } = useTheme();
    const [showPremium, setShowPremium] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const isMounted = useRef(true);

    // Track component mount status to prevent setState on unmounted component
    useEffect(() => {
        isMounted.current = true;
        return () => {
            isMounted.current = false;
        };
    }, []);

    // Auth state listener
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            try {
                if (user) {
                    console.log('🔐 User authenticated:', user.email);
                    await checkPremiumShow(user);
                } else {
                    console.log('👤 User signed out - clearing all premium caches');

                    // Only clear premium caches on sign-out (not on sign-in)
                    await clearAllPremiumCaches();

                    if (isMounted.current) {
                        setIsLoading(false);
                    }
                }
            } catch (error) {
                console.error('❌ Error in auth state change:', error);
                if (isMounted.current) {
                    setIsLoading(false);
                }
            }
        });

        return () => {
            unsubscribe();
        };
    }, []);

    const checkPremiumShow = async (user) => {
        try {
            // Check premium status (now supports offline mode)
            let hasPremium = false;
            if (user) {
                hasPremium = await checkPremiumStatus(user.email, user.uid);
                await AdManager.updatePremiumStatus(user.email, user.uid);
                console.log('📊 User premium status:', hasPremium);
            }

            // CRITICAL FIX: IF PREMIUM, NEVER SHOW POPUP
            if (hasPremium) {
                console.log('💎 User is Premium - Suppressing Premium Popup');
                if (isMounted.current) setShowPremium(false);
                return;
            }

            // Check if this is a fresh app launch (not just navigation)
            const lastCheckTime = await AsyncStorage.getItem('premium_last_check');
            const now = Date.now();

            // Only increment counter if it's been more than 5 seconds since last check
            const timeSinceLastCheck = lastCheckTime ? now - parseInt(lastCheckTime, 10) : Infinity;

            if (timeSinceLastCheck > 5000) {
                const countStr = await AsyncStorage.getItem('app_open_count');
                const count = countStr ? parseInt(countStr, 10) : 0;
                const newCount = count + 1;

                await AsyncStorage.setItem('app_open_count', newCount.toString());
                await AsyncStorage.setItem('premium_last_check', now.toString());
                console.log(`📊 App opened ${newCount} times`);

                // Show premium every 3rd open (3, 6, 9, 12...)
                if (newCount % 3 === 0 && newCount > 0) {
                    console.log('🎁 Premium screen should show (counter triggered)');
                    if (isMounted.current) {
                        setShowPremium(true);
                    }
                } else {
                    if (isMounted.current) {
                        setShowPremium(false);
                    }
                }
            } else {
                console.log('⏭️ Skipping premium check (recent navigation)');
                if (isMounted.current) {
                    setShowPremium(false);
                }
            }
        } catch (error) {
            console.error('Premium check error:', error);
            if (isMounted.current) {
                setShowPremium(false);
            }
        } finally {
            if (isMounted.current) {
                setIsLoading(false);
            }
        }
    };

    const handlePremiumClose = () => {
        setShowPremium(false);
    };

    // Loading screen
    if (isLoading) {
        return (
            <View style={{
                flex: 1,
                backgroundColor: theme.colors.background,
                justifyContent: 'center',
                alignItems: 'center'
            }}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
                <Text style={{
                    color: theme.colors.text,
                    marginTop: 16,
                    fontFamily: 'Teko-Medium',
                    fontSize: 16
                }}>
                    Loading...
                </Text>
            </View>
        );
    }

    if (showPremium) {
        return <PremiumScreen navigation={{ ...navigation, goBack: handlePremiumClose }} />;
    }

    return <HomeScreen navigation={navigation} />;
}
