import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Dimensions, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../utils/ThemeContext';
import { playHaptic } from '../utils/haptics';
import { checkPremiumStatus, setPremiumStatus } from '../utils/PremiumManager';
import { auth } from '../utils/firebase';
import PurchaseManager from '../utils/PurchaseManager'; // Import the real manager

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const PricingCard = ({ price, period, duration, isSelected, onSelect, onPurchase, bestValue, weeklyPrice, theme, styles, compact }) => (
    <TouchableOpacity
        style={[
            styles.pricingCard,
            isSelected && styles.selectedCard,
            bestValue && styles.bestValueCard,
            compact && styles.compactCard
        ]}
        onPress={() => {
            playHaptic('medium');
            onSelect();
            onPurchase(); // Instant purchase trigger
        }}
        activeOpacity={0.7}
    >
        {bestValue && (
            <View style={[styles.bestValueBadge, { backgroundColor: theme.colors.primary }]}>
                <Text style={[styles.bestValueText, { color: theme.colors.secondary }]}>BEST VALUE</Text>
            </View>
        )}
        <View style={styles.cardContent}>
            <Text style={[styles.duration, { color: isSelected ? theme.colors.primary : theme.colors.textMuted }]}>
                {duration}
            </Text>

            {/* DOMINANT WEEKLY PRICE FOR ANNUAL PLAN */}
            {bestValue && weeklyPrice ? (
                <View style={{ alignItems: 'center' }}>
                    <View style={styles.priceRow}>
                        <Text style={[styles.currency, { color: isSelected ? theme.colors.primary : theme.colors.text }]}>$</Text>
                        <Text style={[styles.priceLarge, { color: isSelected ? theme.colors.primary : theme.colors.text }]}>0.38</Text>
                        <Text style={[styles.period, { color: theme.colors.textMuted, alignSelf: 'flex-end', marginBottom: 8, marginLeft: 2 }]}>/ week</Text>
                    </View>
                    <Text style={[styles.subPriceText, { color: theme.colors.textMuted }]}>
                        Billed ${price} / year
                    </Text>
                </View>
            ) : (
                <View style={styles.priceRow}>
                    <Text style={[styles.currency, { color: isSelected ? theme.colors.primary : theme.colors.text }]}>$</Text>
                    <Text style={[styles.price, { color: isSelected ? theme.colors.primary : theme.colors.text }]}>{price}</Text>
                    {!compact && <Text style={[styles.period, { color: theme.colors.textMuted, alignSelf: 'flex-end', marginBottom: 6, marginLeft: 2 }]}>/ {period}</Text>}
                </View>
            )}

            {compact && <Text style={[styles.period, { color: theme.colors.textMuted }]}>/ {period}</Text>}
        </View>

        {isSelected && (
            <View style={[styles.checkmark, { backgroundColor: theme.colors.primary }]}>
                <Ionicons name="checkmark" size={20} color={theme.colors.secondary} />
            </View>
        )}
    </TouchableOpacity>
);

export default function PremiumScreen({ navigation }) {
    const { theme } = useTheme();
    const styles = getStyles(theme);
    const [selectedPlan, setSelectedPlan] = useState('yearly');
    const [hasPremium, setHasPremium] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkPremium = async () => {
            const user = auth.currentUser;
            if (user) {
                const premium = await checkPremiumStatus(user.email, user.uid);
                setHasPremium(premium);
                if (premium) {
                    setTimeout(() => {
                        navigation.goBack();
                    }, 1500);
                }
            }
            setIsLoading(false);
        };
        checkPremium();
    }, []);

    const handleClose = () => {
        playHaptic('medium');
        navigation.goBack();
    };

    const handleSubscribe = async (planType) => {
        const user = auth.currentUser;
        if (!user) {
            Alert.alert('Sign In Required', 'Please sign in to subscribe to premium.');
            return;
        }

        setIsLoading(true);

        try {
            // SECURE: Call RevenueCat Purchase
            // Note: Currently PurchaseManager.purchaseRemoveAds buys the default package.
            // You should update PurchaseManager to support specific packages if needed.
            const result = await PurchaseManager.purchaseRemoveAds();

            if (result.success) {
                await setPremiumStatus(true, user.uid, user.email);
                playHaptic('success');
                Alert.alert(
                    '🎉 Premium Activated!',
                    `You subscribed to the ${planType} plan.`,
                    [{ text: 'Awesome!', onPress: () => { setHasPremium(true); navigation.goBack(); } }]
                );
            } else {
                if (result.error !== 'User cancelled') {
                    Alert.alert('Purchase Failed', result.error || 'Could not verify payment.');
                }
            }
        } catch (error) {
            console.error('Premium activation error:', error);
            Alert.alert('Error', 'Failed to activate premium.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleRestore = async () => {
        setIsLoading(true);
        const success = await PurchaseManager.restorePurchases();
        setIsLoading(false);

        if (success) {
            const user = auth.currentUser;
            if (user) {
                await setPremiumStatus(true, user.uid, user.email);
            }
            setHasPremium(true);
            Alert.alert('Success', 'Purchases restored!');
        } else {
            Alert.alert('Not Found', 'No active premium subscription found to restore.');
        }
    };

    if (isLoading) {
        return <View style={styles.container}><LinearGradient colors={theme.colors.backgroundGradient} style={styles.background} /></View>;
    }

    if (hasPremium) {
        return (
            <View style={styles.container}>
                <LinearGradient colors={theme.colors.backgroundGradient} style={styles.background} />
                <View style={[styles.content, { justifyContent: 'center', alignItems: 'center' }]}>
                    <Ionicons name="checkmark-circle" size={80} color="#4CAF50" />
                    <Text style={[styles.title, { color: theme.colors.text }]}>YOU'RE PREMIUM!</Text>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <LinearGradient colors={theme.colors.backgroundGradient} style={styles.background} />

            <TouchableOpacity
                style={[styles.closeButton, { backgroundColor: theme.colors.surface }]}
                onPress={handleClose}
                activeOpacity={0.7}
            >
                <Ionicons name="close" size={24} color={theme.colors.text} />
            </TouchableOpacity>

            {/* SINGLE PAGE LAYOUT - NO SCROLLVIEW */}
            <View style={styles.content}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={[styles.pretitle, { color: theme.colors.primary }]}>UPGRADE TO</Text>
                    <Text style={[styles.title, { color: theme.colors.text }]}>PREMIUM</Text>
                    <View style={[styles.titleUnderline, { backgroundColor: theme.colors.primary }]} />
                </View>

                {/* Features - Compact */}
                <View style={[styles.featuresCard, {
                    backgroundColor: theme.colors.surface,
                    borderColor: theme.colors.primary + '40'
                }]}>
                    <View style={styles.featuresList}>
                        {[
                            { icon: 'mic', text: 'Access to Voice Chat' },
                            { icon: 'game-controller', text: 'Access to All Game Modes' },
                            { icon: 'color-palette', text: 'Custom Avatar Builder' },
                            { icon: 'close-circle', text: 'No Ads' }
                        ].map((feature, i) => (
                            <View key={i} style={styles.featureRow}>
                                <Ionicons name={feature.icon} size={20} color={theme.colors.primary} />
                                <Text style={[styles.featureText, { color: theme.colors.text }]}>{feature.text}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Pricing Options - Fill Remaining Space */}
                <View style={styles.pricingSection}>
                    <Text style={[styles.choosePlanText, { color: theme.colors.textMuted }]}>
                        SELECT A PLAN
                    </Text>

                    {/* Annual Plan (Featured on Top) */}
                    <View style={{ flex: 1.2, marginBottom: 10 }}>
                        <PricingCard
                            price="20"
                            period="YEAR"
                            duration="YEARLY ACCESS"
                            weeklyPrice="$0.38"
                            isSelected={selectedPlan === 'yearly'}
                            onSelect={() => setSelectedPlan('yearly')}
                            onPurchase={() => handleSubscribe('Yearly')}
                            bestValue={true}
                            theme={theme}
                            styles={styles}
                        />
                    </View>

                    {/* Other Plans (Side by Side) */}
                    <View style={[styles.pricingRow, { flex: 1 }]}>
                        <PricingCard
                            price="2"
                            period="WEEK"
                            duration="WEEKLY"
                            isSelected={selectedPlan === 'weekly'}
                            onSelect={() => setSelectedPlan('weekly')}
                            onPurchase={() => handleSubscribe('Weekly')}
                            theme={theme}
                            styles={styles}
                            compact={true}
                        />
                        <PricingCard
                            price="6"
                            period="MONTH"
                            duration="MONTHLY"
                            isSelected={selectedPlan === 'monthly'}
                            onSelect={() => setSelectedPlan('monthly')}
                            onPurchase={() => handleSubscribe('Monthly')}
                            theme={theme}
                            styles={styles}
                            compact={true}
                        />
                    </View>

                    <Text style={[styles.comingSoonText, { color: theme.colors.tertiary, marginTop: 16 }]}>
                        Tap a plan to subscribe • Cancel Anytime
                    </Text>

                    <TouchableOpacity onPress={handleRestore} style={{ marginTop: 20, padding: 10 }}>
                        <Text style={[styles.comingSoonText, { color: theme.colors.primary, textDecorationLine: 'underline' }]}>
                            Restore Purchases
                        </Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Film perforations */}
            <View style={styles.filmLeft} pointerEvents="none">
                {[...Array(15)].map((_, i) => (
                    <View key={i} style={[styles.filmHole, { backgroundColor: theme.colors.primary }]} />
                ))}
            </View>
            <View style={styles.filmRight} pointerEvents="none">
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
            width: 44,
            height: 44,
            borderRadius: 22,
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            borderWidth: 1,
            borderColor: theme.colors.primary + '40',
            backgroundColor: 'rgba(0,0,0,0.5)',
        },
        content: {
            flex: 1,
            padding: 24,
            paddingTop: Platform.OS === 'ios' ? 10 : 0, // MAX TOP PUSH
            // Removed justifyContent: center to allow top alignment
        },
        header: {
            alignItems: 'center',
            marginBottom: 8,
            marginTop: Platform.OS === 'ios' ? 50 : 30, // Clear header space
        },
        pretitle: {
            fontSize: 12, // Smaller
            fontFamily: 'Teko-Medium',
            letterSpacing: 4,
            marginBottom: 2,
        },
        title: {
            fontSize: 40, // Smaller to fit
            fontFamily: 'CabinetGrotesk-Extrabold',
            letterSpacing: 6,
            marginBottom: 4,
            ...theme.textShadows.depth,
        },
        titleUnderline: {
            width: 100,
            height: 4,
            borderRadius: 2,
        },
        featuresCard: {
            width: '100%',
            borderRadius: 16,
            padding: 12, // Compact padding
            marginBottom: 16,
            borderWidth: 1,
            backgroundColor: 'rgba(0,0,0,0.4)',
        },
        featuresList: {
            gap: 8, // Tighter gap
        },
        featureRow: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
        },
        featureText: {
            fontSize: 14, // Compact text
            fontFamily: 'CabinetGrotesk-Bold',
            letterSpacing: 0.5,
            flex: 1,
        },
        pricingSection: {
            flex: 1, // Take remaining space
            marginBottom: 10,
        },
        choosePlanText: {
            fontSize: 12,
            fontFamily: 'Teko-Medium',
            letterSpacing: 3,
            marginTop: 0,
            marginBottom: 12,
            textAlign: 'center',
            opacity: 0.8,
        },
        pricingRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            gap: 10,
        },
        pricingCard: {
            borderRadius: 16,
            borderWidth: 2,
            borderColor: theme.colors.primary + '50',
            backgroundColor: 'rgba(255,255,255,0.08)',
            position: 'relative',
            padding: 4,
            width: '100%', // Ensure full width in container
        },
        compactCard: {
            flex: 1, // Only verify flex in row
            minHeight: undefined, // Let flex handle height
        },
        selectedCard: {
            borderColor: theme.colors.primary,
            borderWidth: 3,
            backgroundColor: theme.colors.primary + '25',
            transform: [{ scale: 1.02 }],
            elevation: 10,
            shadowColor: theme.colors.primary,
            shadowOpacity: 0.6,
            shadowRadius: 15,
        },
        bestValueCard: {
            borderColor: theme.colors.primary + '70',
            flex: 1, // Fill container
        },
        cardContent: {
            padding: 6,
            alignItems: 'center',
            justifyContent: 'center',
            flex: 1,
        },
        duration: {
            fontSize: 12,
            fontFamily: 'Teko-Medium',
            letterSpacing: 2,
            marginBottom: 4,
            fontWeight: 'bold',
        },
        priceRow: {
            flexDirection: 'row',
            alignItems: 'flex-start',
            marginBottom: 0,
        },
        currency: {
            fontSize: 14,
            fontFamily: 'CabinetGrotesk-Bold',
            marginTop: 4,
            marginRight: 2,
        },
        price: {
            fontSize: 32,
            fontFamily: 'CabinetGrotesk-Black',
            lineHeight: 36,
        },
        priceLarge: {
            fontSize: 48, // HUGE weekly price
            fontFamily: 'CabinetGrotesk-Black',
            lineHeight: 54,
        },
        period: {
            fontSize: 10,
            fontFamily: 'Teko-Medium',
            letterSpacing: 1,
            marginTop: 4,
        },
        subPriceText: {
            fontSize: 11,
            fontFamily: 'Teko-Medium',
            letterSpacing: 1,
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
            borderWidth: 2,
            borderColor: theme.colors.background,
            elevation: 5,
        },
        bestValueBadge: {
            position: 'absolute',
            top: -8,
            left: 0,
            right: 0,
            alignItems: 'center',
            paddingVertical: 3,
            borderTopLeftRadius: 14,
            borderTopRightRadius: 14,
            zIndex: 10,
        },
        bestValueText: {
            fontSize: 8,
            fontFamily: 'Panchang-Bold',
            letterSpacing: 1.5,
        },
        comingSoonText: {
            fontSize: 10,
            fontFamily: 'Panchang-Bold',
            letterSpacing: 1,
            textAlign: 'center',
            opacity: 0.6,
        },
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
