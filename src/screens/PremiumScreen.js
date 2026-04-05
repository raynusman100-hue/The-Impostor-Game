import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Dimensions, Alert, ActivityIndicator } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../utils/ThemeContext';
import { playHaptic } from '../utils/haptics';
import PremiumManager from '../utils/PremiumManager';
import PurchaseManager from '../utils/PurchaseManager';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const PricingCard = ({ price, period, duration, isSelected, onPurchase, theme, styles, badge, yearlyPrice }) => (
    <TouchableOpacity
        style={[styles.pricingCard, isSelected && styles.selectedCard, badge && styles.bestValueCard]}
        onPress={() => {
            playHaptic('medium');
            onPurchase();
        }}
        activeOpacity={0.8}
    >
        {badge && (
            <View style={[styles.badge, { backgroundColor: theme.colors.primary }]}>
                <Text style={[styles.badgeText, { color: theme.colors.secondary }]}>{badge}</Text>
            </View>
        )}
        <View style={styles.cardContent}>
            <Text style={[styles.duration, { color: isSelected ? theme.colors.primary : theme.colors.textMuted }]}>
                {duration}
            </Text>
            <View style={styles.priceRow}>
                <Text style={[styles.currency, { color: isSelected ? theme.colors.primary : theme.colors.text }]}>$</Text>
                <Text style={[styles.price, { color: isSelected ? theme.colors.primary : theme.colors.text }]}>{price}</Text>
            </View>
            <Text style={[styles.period, { color: theme.colors.textMuted }]}>/ {period}</Text>
            {yearlyPrice && (
                <Text style={[styles.billedYearly, { color: theme.colors.textMuted }]}>
                    Billed as ${yearlyPrice}/year
                </Text>
            )}
        </View>
        {isSelected && (
            <View style={[styles.checkmark, { backgroundColor: theme.colors.primary }]}>
                <Ionicons name="checkmark" size={16} color={theme.colors.secondary} />
            </View>
        )}
    </TouchableOpacity>
);

export default function PremiumScreen({ navigation }) {
    const { theme } = useTheme();
    const styles = getStyles(theme);
    const [isProcessing, setIsProcessing] = useState(false);
    const [hasPremium, setHasPremium] = useState(null); // null = loading, true/false = status
    const [premiumExpiry, setPremiumExpiry] = useState(null);

    // Check premium status on mount
    useEffect(() => {
        checkPremiumStatus();
        
        // Listen for premium status changes
        const unsubscribe = PurchaseManager.addListener((isPremium) => {
            setHasPremium(isPremium);
            if (isPremium) {
                setPremiumExpiry(PurchaseManager.getExpirationDate());
            }
        });
        
        return () => unsubscribe();
    }, []);

    const checkPremiumStatus = async () => {
        try {
            // Check cached status first for instant response
            const cachedStatus = PremiumManager.checkPremiumStatus();
            setHasPremium(cachedStatus);
            
            // Then refresh from RevenueCat in background
            const isPremium = await PremiumManager.refreshPremiumStatus();
            setHasPremium(isPremium);
            
            if (isPremium) {
                setPremiumExpiry(PurchaseManager.getExpirationDate());
            }
        } catch (error) {
            console.error('Error checking premium status:', error);
            // Fallback to cached status
            setHasPremium(PremiumManager.checkPremiumStatus());
        }
    };

    const handleClose = () => {
        playHaptic('medium');
        
        // Check if there's a custom goBack function (from AppInitializer)
        if (navigation.goBack && typeof navigation.goBack === 'function') {
            navigation.goBack();
        } else if (navigation.canGoBack && navigation.canGoBack()) {
            // Standard navigation goBack
            navigation.goBack();
        } else {
            // Fallback to Home
            navigation.navigate('Home');
        }
    };

    const handlePurchase = async (planType) => {
        if (isProcessing) return;
        
        setIsProcessing(true);

        try {
            // Use RevenueCat for actual purchases, passing the selected plan
            const result = await PurchaseManager.purchaseRemoveAds(planType);
            
            if (result.success) {
                // Purchase successful - refresh cache immediately
                await PremiumManager.refreshPremiumStatus();
                setHasPremium(true);
                playHaptic('success');
                
                Alert.alert(
                    '🎉 Welcome to Premium!',
                    'You now have access to all premium features!\n\n• No Ads\n• 12 Premium Categories\n• Custom Avatar Builder\n• Exclusive Game Modes',
                    [
                        {
                            text: 'Awesome!',
                            onPress: () => {
                                setIsProcessing(false);
                                navigation.navigate('Home');
                            }
                        }
                    ]
                );
            } else {
                // Purchase failed or cancelled
                setIsProcessing(false);
                
                if (result.error !== 'User cancelled') {
                    Alert.alert(
                        'Purchase Failed', 
                        result.error || 'Unable to complete purchase. Please try again.',
                        [{ text: 'OK' }]
                    );
                }
            }
        } catch (error) {
            console.error('Purchase error:', error);
            setIsProcessing(false);
            Alert.alert(
                'Purchase Error', 
                'Unable to process purchase. Please check your connection and try again.',
                [{ text: 'OK' }]
            );
        }
    };

    const handleRestorePurchases = async () => {
        if (isProcessing) return;
        
        setIsProcessing(true);
        playHaptic('medium');

        try {
            const restored = await PurchaseManager.restorePurchases();
            
            if (restored) {
                await PremiumManager.refreshPremiumStatus();
                setHasPremium(true);
                playHaptic('success');
                
                Alert.alert(
                    '✅ Purchases Restored!',
                    'Your premium subscription has been restored.',
                    [
                        {
                            text: 'Great!',
                            onPress: () => {
                                setIsProcessing(false);
                                navigation.navigate('Home');
                            }
                        }
                    ]
                );
            } else {
                setIsProcessing(false);
                Alert.alert(
                    'No Purchases Found',
                    'We couldn\'t find any previous purchases to restore.',
                    [{ text: 'OK' }]
                );
            }
        } catch (error) {
            console.error('Restore error:', error);
            setIsProcessing(false);
            Alert.alert(
                'Restore Failed',
                'Unable to restore purchases. Please try again.',
                [{ text: 'OK' }]
            );
        }
    };

    // Loading state
    if (hasPremium === null) {
        return (
            <View style={styles.container}>
                <LinearGradient
                    colors={theme.colors.backgroundGradient || ['#000000', '#1a1a1a', '#050505']}
                    style={styles.background}
                />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                    <Text style={[styles.loadingText, { color: theme.colors.text }]}>
                        Checking Premium Status...
                    </Text>
                </View>
            </View>
        );
    }

    // Already Premium - Show status screen
    if (hasPremium) {
        return (
            <View style={styles.container}>
                <LinearGradient
                    colors={theme.colors.backgroundGradient || ['#000000', '#1a1a1a', '#050505']}
                    style={styles.background}
                />

                {/* Close Button */}
                <TouchableOpacity
                    style={[styles.closeButton, { backgroundColor: theme.colors.surface }]}
                    onPress={handleClose}
                    activeOpacity={0.7}
                >
                    <Ionicons name="close" size={24} color={theme.colors.text} />
                </TouchableOpacity>

                <View style={styles.content}>
                    {/* Premium Active Header */}
                    <View style={styles.header}>
                        <Ionicons name="checkmark-circle" size={80} color={theme.colors.primary} />
                        <Text style={[styles.pretitle, { color: theme.colors.primary, marginTop: 20 }]}>
                            YOU'RE PREMIUM
                        </Text>
                        <Text style={[styles.title, { color: theme.colors.text }]}>ACTIVE</Text>
                        <View style={[styles.titleUnderline, { backgroundColor: theme.colors.primary }]} />
                        
                        {premiumExpiry && (
                            <Text style={[styles.expiryText, { color: theme.colors.textMuted, marginTop: 16 }]}>
                                Expires: {new Date(premiumExpiry).toLocaleDateString()}
                            </Text>
                        )}
                    </View>

                    {/* Active Features */}
                    <View style={[styles.featuresCard, {
                        backgroundColor: theme.colors.surface,
                        borderColor: theme.colors.primary + '40'
                    }]}>
                        <Text style={[styles.activeFeaturesTitle, { color: theme.colors.primary }]}>
                            YOUR PREMIUM FEATURES
                        </Text>
                        <View style={styles.featuresList}>
                            {[
                                { icon: 'close-circle', text: 'No Ads' },
                                { icon: 'film', text: '12 Premium Categories' },
                                { icon: 'color-palette', text: 'Custom Avatar Builder' },
                                { icon: 'mic', text: 'Host Voice Chat Access' }
                            ].map((feature, i) => (
                                <View key={i} style={styles.featureRow}>
                                    <Ionicons 
                                        name={feature.icon} 
                                        size={20} 
                                        color={theme.colors.primary} 
                                    />
                                    <Text style={[styles.featureText, { color: theme.colors.text }]}>
                                        {feature.text}
                                    </Text>
                                    <Ionicons name="checkmark" size={20} color={theme.colors.primary} />
                                </View>
                            ))}
                        </View>
                    </View>

                    {/* Back to Home Button */}
                    <TouchableOpacity
                        style={[styles.backButton, { backgroundColor: theme.colors.primary }]}
                        onPress={handleClose}
                        activeOpacity={0.8}
                    >
                        <Text style={[styles.backButtonText, { color: theme.colors.secondary }]}>
                            BACK TO HOME
                        </Text>
                    </TouchableOpacity>

                    {/* RC UI DEBUG INFO */}
                    <View style={{ marginTop: 20, padding: 10, backgroundColor: 'rgba(0,255,0,0.2)', borderRadius: 8 }}>
                        <Text style={{ color: 'white', fontSize: 10, fontFamily: 'Courier', textAlign: 'center' }}>
                            {PurchaseManager.debugText}
                        </Text>
                    </View>
                </View>

                {/* Film perforations */}
                <View style={styles.filmLeft}>
                    {[...Array(15)].map((_, i) => (
                        <View key={i} style={[styles.filmHole, { backgroundColor: theme.colors.primary }]} />
                    ))}
                </View>
                <View style={styles.filmRight}>
                    {[...Array(15)].map((_, i) => (
                        <View key={i} style={[styles.filmHole, { backgroundColor: theme.colors.primary }]} />
                    ))}
                </View>
            </View>
        );
    }

    // Not Premium - Show paywall

    return (
        <View style={styles.container}>
            <LinearGradient
                colors={theme.colors.backgroundGradient || ['#000000', '#1a1a1a', '#050505']}
                style={styles.background}
            />

            {/* Close Button */}
            <TouchableOpacity
                style={[styles.closeButton, { backgroundColor: theme.colors.surface }]}
                onPress={handleClose}
                activeOpacity={0.7}
            >
                <Ionicons name="close" size={24} color={theme.colors.text} />
            </TouchableOpacity>

            <View style={styles.content}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={[styles.pretitle, { color: theme.colors.primary }]}>UPGRADE TO</Text>
                    <Text style={[styles.title, { color: theme.colors.text }]}>PREMIUM</Text>
                    <View style={[styles.titleUnderline, { backgroundColor: theme.colors.primary }]} />
                </View>

                {/* Features */}
                <View style={[styles.featuresCard, {
                    backgroundColor: theme.colors.surface,
                    borderColor: theme.colors.primary + '40'
                }]}>
                    <View style={styles.featuresList}>
                        {[
                            { icon: 'close-circle', text: 'No Ads' },
                            { icon: 'film', text: '12 Premium Categories' },
                            { icon: 'color-palette', text: 'Custom Avatar Builder' },
                            { icon: 'mic', text: 'Host Voice Chat Access' }
                        ].map((feature, i) => (
                            <View key={i} style={styles.featureRow}>
                                <Ionicons 
                                    name={feature.icon} 
                                    size={20} 
                                    color={theme.colors.primary} 
                                />
                                <Text style={[styles.featureText, { color: theme.colors.text }]}>{feature.text}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Pricing Options */}
                <View>
                    <Text style={[styles.choosePlanText, { color: theme.colors.textMuted }]}>
                        CHOOSE YOUR PLAN
                    </Text>

                    <View style={styles.pricingColumn}>
                        {/* Yearly - Best Value (Top) */}
                        <PricingCard
                            price="0.38"
                            period="WEEK"
                            duration="YEARLY"
                            yearlyPrice="19.99"
                            badge="BEST VALUE"
                            isSelected={false}
                            onPurchase={() => handlePurchase('$rc_annual')}
                            theme={theme}
                            styles={styles}
                        />
                        
                        {/* Monthly and Weekly in a row */}
                        <View style={styles.pricingRow}>
                            <PricingCard
                                price="1.99"
                                period="WEEK"
                                duration="WEEKLY"
                                isSelected={false}
                                onPurchase={() => handlePurchase('$rc_weekly')}
                                theme={theme}
                                styles={styles}
                            />
                            <PricingCard
                                price="4.99"
                                period="MONTH"
                                duration="MONTHLY"
                                isSelected={false}
                                onPurchase={() => handlePurchase('$rc_monthly')}
                                theme={theme}
                                styles={styles}
                            />
                        </View>
                    </View>

                    {/* Secure Payment Note - Moved to bottom */}
                    <Text style={[styles.securePaymentText, { color: theme.colors.textMuted }]}>
                        SECURE PAYMENT VIA GOOGLE PLAY
                    </Text>

                    {/* Restore Purchases Button */}
                    <TouchableOpacity
                        style={styles.restoreButton}
                        onPress={handleRestorePurchases}
                        disabled={isProcessing}
                        activeOpacity={0.7}
                    >
                        <Text style={[styles.restoreButtonText, { color: theme.colors.primary }]}>
                            Restore Purchases
                        </Text>
                    </TouchableOpacity>

                    {/* RC UI DEBUG INFO */}
                    <View style={{ marginTop: 20, padding: 10, backgroundColor: 'rgba(255,0,0,0.2)', borderRadius: 8 }}>
                        <Text style={{ color: 'white', fontSize: 10, fontFamily: 'Courier', textAlign: 'center' }}>
                            {PurchaseManager.debugText}
                        </Text>
                    </View>
                </View>
            </View>

            {/* Film perforations */}
            <View style={styles.filmLeft}>
                {[...Array(15)].map((_, i) => (
                    <View key={i} style={[styles.filmHole, { backgroundColor: theme.colors.primary }]} />
                ))}
            </View>
            <View style={styles.filmRight}>
                {[...Array(15)].map((_, i) => (
                    <View key={i} style={[styles.filmHole, { backgroundColor: theme.colors.primary }]} />
                ))}
            </View>
        </View>
    );
}

function getStyles(theme) {
    return StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: theme.colors.background,
        },
        background: {
            ...StyleSheet.absoluteFillObject,
        },
        closeButton: {
            position: 'absolute',
            top: Platform.OS === 'ios' ? 50 : 40,
            right: 20,
            width: 40,
            height: 40,
            borderRadius: 20,
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            elevation: 1000,
            borderWidth: 1,
            borderColor: theme.colors.primary + '40',
        },
        content: {
            flex: 1,
            padding: 20,
            paddingTop: Platform.OS === 'ios' ? 100 : 80,
            paddingBottom: 20,
        },
        header: {
            alignItems: 'center',
            marginBottom: 20,
        },
        pretitle: {
            fontSize: 12,
            fontFamily: 'Teko-Medium',
            letterSpacing: 4,
            marginBottom: 4,
        },
        title: {
            fontSize: 44,
            fontFamily: 'CabinetGrotesk-Extrabold',
            letterSpacing: 6,
            marginBottom: 8,
            ...theme.textShadows.depth,
        },
        titleUnderline: {
            width: 80,
            height: 3,
            borderRadius: 2,
        },
        featuresCard: {
            width: '100%',
            borderRadius: 16,
            padding: 18,
            marginBottom: 24,
            borderWidth: 2,
        },
        featuresList: {
            gap: 12,
        },
        featureRow: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
        },
        featureText: {
            fontSize: 15,
            fontFamily: 'CabinetGrotesk-Bold',
            letterSpacing: 0.5,
            flex: 1,
        },
        choosePlanText: {
            fontSize: 12,
            fontFamily: 'Teko-Medium',
            letterSpacing: 3,
            marginBottom: 16,
            textAlign: 'center',
        },
        securePaymentText: {
            fontSize: 9,
            fontFamily: 'Panchang-Bold',
            letterSpacing: 1.5,
            textAlign: 'center',
            marginTop: 20,
        },
        pricingColumn: {
            gap: 16,
        },
        pricingRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            gap: 12,
        },
        pricingCard: {
            flex: 1,
            borderRadius: 12,
            borderWidth: 2,
            borderColor: theme.colors.primary + '40',
            backgroundColor: theme.colors.surface,
            position: 'relative',
            minHeight: 110,
        },
        bestValueCard: {
            borderColor: theme.colors.primary,
            borderWidth: 3,
            backgroundColor: theme.colors.primary + '15',
        },
        selectedCard: {
            borderColor: theme.colors.primary,
            borderWidth: 3,
            backgroundColor: theme.colors.primary + '10',
        },
        badge: {
            position: 'absolute',
            top: -10,
            left: '50%',
            transform: [{ translateX: -40 }],
            paddingHorizontal: 12,
            paddingVertical: 4,
            borderRadius: 12,
            zIndex: 10,
        },
        badgeText: {
            fontSize: 9,
            fontFamily: 'Panchang-Bold',
            letterSpacing: 1.5,
        },
        cardContent: {
            padding: 12,
            alignItems: 'center',
            justifyContent: 'center',
            flex: 1,
        },
        duration: {
            fontSize: 10,
            fontFamily: 'Teko-Medium',
            letterSpacing: 2,
            marginBottom: 4,
        },
        priceRow: {
            flexDirection: 'row',
            alignItems: 'flex-start',
            marginBottom: 2,
        },
        currency: {
            fontSize: 14,
            fontFamily: 'CabinetGrotesk-Bold',
            marginTop: 3,
            marginRight: 1,
        },
        price: {
            fontSize: 32,
            fontFamily: 'CabinetGrotesk-Black',
            lineHeight: 32,
        },
        period: {
            fontSize: 9,
            fontFamily: 'Teko-Medium',
            letterSpacing: 1,
        },
        billedYearly: {
            fontSize: 9,
            fontFamily: 'Teko-Medium',
            letterSpacing: 0.5,
            marginTop: 4,
        },
        checkmark: {
            position: 'absolute',
            top: -8,
            right: -8,
            width: 24,
            height: 24,
            borderRadius: 12,
            alignItems: 'center',
            justifyContent: 'center',
        },
        subscribeButton: {
            width: '100%',
            paddingVertical: 14,
            borderRadius: 12,
            alignItems: 'center',
            marginBottom: 10,
        },
        subscribeButtonDisabled: {
            opacity: 0.6,
        },
        subscribeText: {
            fontSize: 15,
            fontFamily: 'Panchang-Bold',
            letterSpacing: 3,
        },
        loadingContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            gap: 16,
        },
        loadingText: {
            fontSize: 14,
            fontFamily: 'CabinetGrotesk-Bold',
            letterSpacing: 1,
        },
        expiryText: {
            fontSize: 12,
            fontFamily: 'Teko-Medium',
            letterSpacing: 1,
        },
        activeFeaturesTitle: {
            fontSize: 12,
            fontFamily: 'Teko-Medium',
            letterSpacing: 3,
            marginBottom: 12,
            textAlign: 'center',
        },
        backButton: {
            width: '100%',
            paddingVertical: 16,
            borderRadius: 12,
            alignItems: 'center',
            marginTop: 24,
        },
        backButtonText: {
            fontSize: 15,
            fontFamily: 'Panchang-Bold',
            letterSpacing: 3,
        },
        restoreButton: {
            width: '100%',
            paddingVertical: 12,
            alignItems: 'center',
            marginTop: 16,
        },
        restoreButtonText: {
            fontSize: 12,
            fontFamily: 'CabinetGrotesk-Bold',
            letterSpacing: 1,
            textDecorationLine: 'underline',
        },

        // Film perforations
        filmLeft: {
            position: 'absolute',
            left: 8,
            top: 0,
            bottom: 0,
            justifyContent: 'space-evenly',
            alignItems: 'center',
            paddingVertical: 40,
        },
        filmRight: {
            position: 'absolute',
            right: 8,
            top: 0,
            bottom: 0,
            justifyContent: 'space-evenly',
            alignItems: 'center',
            paddingVertical: 40,
        },
        filmHole: {
            width: 8,
            height: 12,
            borderRadius: 2,
            opacity: 0.3,
        },
    });
}
