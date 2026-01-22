import React, { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import HomeScreen from './HomeScreen';
import PremiumScreen from './PremiumScreen';

export default function AppInitializer({ navigation }) {
    const [showPremium, setShowPremium] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkPremiumShow = async () => {
            try {
                const countStr = await AsyncStorage.getItem('app_open_count');
                const count = countStr ? parseInt(countStr, 10) : 0;
                const newCount = count + 1;

                await AsyncStorage.setItem('app_open_count', newCount.toString());
                console.log(`📊 App opened ${newCount} times`);

                // Show premium every 2nd open (even numbers: 2, 4, 6...)
                if (newCount % 2 === 0 && newCount > 0) {
                    console.log('🎁 Premium screen should show (counter triggered)');
                    setShowPremium(true);
                } else {
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