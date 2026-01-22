import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Platform, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../utils/ThemeContext';
import { playHaptic } from '../utils/haptics';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

const PricingCard = ({ price, period, duration, isPopular, theme, styles }) => (
    <View style={[styles.pricingCard, isPopular && styles.popularCard]}>
        {isPopular && (
            <View style={[styles.popularBadge, { backgroundColor: theme.colors.primary }]}>
                <Text style={[styles.popularText, { color: '#000' }]}>BEST VALUE</Text>
            </View>
        )}
        <View style={styles.cardContent}>
            <Text style={[styles.duration, { color: theme.colors.text }]}>{duration}</Text>
            <View style={styles.priceRow}>
                <Text style={[styles.currency, { color: theme.colors.primary }]}>$</Text>
                <Text style={[styles.price, { color: theme.colors.text }]}>{price}</Text>
            </View>
            <Text style={[styles.period, { color: theme.colors.textMuted }]}>/ {period}</Text>

            {/* Decorative lines */}
            <View style={[styles.decorLine, { backgroundColor: theme.colors.primary }]} />
        </View>
    </View>
);

export default function PremiumScreen({ navigation }) {
    const { theme } = useTheme();
    const styles = getStyles(theme);

    const handleClose = () => {
        playHaptic('medium');
        navigation.goBack();
    };

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

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
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
                    <Text style={[styles.featuresTitle, { color: theme.colors.primary }]}>
                        UNLOCK ALL FEATURES
                    </Text>
                    <View style={styles.featuresList}>
                        {['No Ads', 'Unlock Premium Categories', 'Priority Support', 'Advanced Features'].map((feature, i) => (
                            <View key={i} style={styles.featureRow}>
                                <Ionicons name="checkmark-circle" size={20} color={theme.colors.primary} />
                                <Text style={[styles.featureText, { color: theme.colors.text }]}>{feature}</Text>
                            </View>
                        ))}
                    </View>
                </View>

                {/* Pricing Options */}
                <Text style={[styles.choosePlanText, { color: theme.colors.textMuted }]}>
                    CHOOSE YOUR PLAN
                </Text>

                <View style={styles.pricingGrid}>
                    <PricingCard
                        price="2"
                        period="WEEK"
                        duration="WEEKLY"
                        theme={theme}
                        styles={styles}
                    />
                    <PricingCard
                        price="6"
                        period="MONTH"
                        duration="MONTHLY"
                        isPopular={true}
                        theme={theme}
                        styles={styles}
                    />
                    <PricingCard
                        price="20"
                        period="YEAR"
                        duration="YEARLY"
                        theme={theme}
                        styles={styles}
                    />
                </View>

                {/* CTA Note */}
                <Text style={[styles.comingSoonText, { color: theme.colors.tertiary }]}>
                    PAYMENT INTEGRATION COMING SOON
                </Text>

                <Text style={[styles.disclaimer, { color: theme.colors.textMuted }]}>
                    Payment will be charged to your account at confirmation of purchase. Auto-renewal can be turned off at any time.
                </Text>
            </ScrollView>

            {/* Film perforations for theme consistency */}
            <View style={styles.filmLeft}>
                {[...Array(20)].map((_, i) => (
                    <View key={i} style={[styles.filmHole, { backgroundColor: theme.colors.primary }]} />
                ))}
            </View>
            <View style={styles.filmRight}>
                {[...Array(20)].map((_, i) => (
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
            zIndex: 100,
            borderWidth: 1,
            borderColor: theme.colors.primary + '40',
        },
        scrollContent: {
            padding: 24,
            paddingTop: Platform.OS === 'ios' ? 100 : 80,
            alignItems: 'center',
        },
        header: {
            alignItems: 'center',
            marginBottom: 32,
        },
        pretitle: {
            fontSize: 12,
            fontFamily: 'Teko-Medium',
            letterSpacing: 4,
            marginBottom: 4,
        },
        title: {
            fontSize: 52,
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
            borderRadius: 20,
            padding: 24,
            marginBottom: 32,
            borderWidth: 2,
        },
        featuresTitle: {
            fontSize: 16,
            fontFamily: 'Panchang-Bold',
            letterSpacing: 3,
            marginBottom: 20,
            textAlign: 'center',
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
            fontSize: 16,
            fontFamily: 'CabinetGrotesk-Bold',
            letterSpacing: 0.5,
        },
        choosePlanText: {
            fontSize: 12,
            fontFamily: 'Teko-Medium',
            letterSpacing: 3,
            marginBottom: 20,
        },
        pricingGrid: {
            width: '100%',
            gap: 16,
            marginBottom: 24,
        },
        pricingCard: {
            width: '100%',
            borderRadius: 16,
            borderWidth: 2,
            borderColor: theme.colors.primary + '40',
            backgroundColor: theme.colors.surface,
            overflow: 'visible',
            position: 'relative',
        },
        popularCard: {
            borderColor: theme.colors.primary,
            borderWidth: 3,
            transform: [{ scale: 1.02 }],
        },
        popularBadge: {
            position: 'absolute',
            top: -12,
            left: '50%',
            transform: [{ translateX: -50 }],
            paddingHorizontal: 16,
            paddingVertical: 4,
            borderRadius: 12,
            zIndex: 10,
        },
        popularText: {
            fontSize: 10,
            fontFamily: 'Panchang-Bold',
            letterSpacing: 2,
        },
        cardContent: {
            padding: 24,
            alignItems: 'center',
        },
        duration: {
            fontSize: 14,
            fontFamily: 'Teko-Medium',
            letterSpacing: 3,
            marginBottom: 8,
        },
        priceRow: {
            flexDirection: 'row',
            alignItems: 'flex-start',
            marginBottom: 4,
        },
        currency: {
            fontSize: 24,
            fontFamily: 'CabinetGrotesk-Bold',
            marginTop: 8,
            marginRight: 2,
        },
        price: {
            fontSize: 56,
            fontFamily: 'CabinetGrotesk-Black',
            lineHeight: 56,
        },
        period: {
            fontSize: 14,
            fontFamily: 'Teko-Medium',
            letterSpacing: 2,
        },
        decorLine: {
            width: 40,
            height: 2,
            marginTop: 16,
            borderRadius: 1,
        },
        comingSoonText: {
            fontSize: 12,
            fontFamily: 'Panchang-Bold',
            letterSpacing: 2,
            marginBottom: 16,
            textAlign: 'center',
        },
        disclaimer: {
            fontSize: 10,
            fontFamily: 'Teko-Medium',
            textAlign: 'center',
            lineHeight: 14,
            opacity: 0.6,
            maxWidth: 300,
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
