import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Dimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../utils/ThemeContext';
import { playHaptic } from '../utils/haptics';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const PricingCard = ({ price, period, duration, isSelected, onSelect, theme, styles }) => (
    <TouchableOpacity
        style={[styles.pricingCard, isSelected && styles.selectedCard]}
        onPress={() => {
            playHaptic('light');
            onSelect();
        }}
        activeOpacity={0.8}
    >
        <View style={styles.cardContent}>
            <Text style={[styles.duration, { color: isSelected ? theme.colors.primary : theme.colors.textMuted }]}>
                {duration}
            </Text>
            <View style={styles.priceRow}>
                <Text style={[styles.currency, { color: isSelected ? theme.colors.primary : theme.colors.text }]}>$</Text>
                <Text style={[styles.price, { color: isSelected ? theme.colors.primary : theme.colors.text }]}>{price}</Text>
            </View>
            <Text style={[styles.period, { color: theme.colors.textMuted }]}>/ {period}</Text>
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
    const [selectedPlan, setSelectedPlan] = useState('monthly'); // 'weekly', 'monthly', 'yearly'

    const handleClose = () => {
        playHaptic('medium');
        navigation.goBack();
    };

    const handleSubscribe = () => {
        playHaptic('medium');
        // TODO: Implement payment
        console.log('Selected plan:', selectedPlan);
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
                            { icon: 'game-controller', text: 'Exclusive Game Modes' }
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

                    <View style={styles.pricingRow}>
                        <PricingCard
                            price="2"
                            period="WEEK"
                            duration="WEEKLY"
                            isSelected={selectedPlan === 'weekly'}
                            onSelect={() => setSelectedPlan('weekly')}
                            theme={theme}
                            styles={styles}
                        />
                        <PricingCard
                            price="6"
                            period="MONTH"
                            duration="MONTHLY"
                            isSelected={selectedPlan === 'monthly'}
                            onSelect={() => setSelectedPlan('monthly')}
                            theme={theme}
                            styles={styles}
                        />
                        <PricingCard
                            price="20"
                            period="YEAR"
                            duration="YEARLY"
                            isSelected={selectedPlan === 'yearly'}
                            onSelect={() => setSelectedPlan('yearly')}
                            theme={theme}
                            styles={styles}
                        />
                    </View>

                    {/* Subscribe Button */}
                    <TouchableOpacity
                        style={[styles.subscribeButton, { backgroundColor: theme.colors.primary }]}
                        onPress={handleSubscribe}
                        activeOpacity={0.8}
                    >
                        <Text style={[styles.subscribeText, { color: theme.colors.secondary }]}>
                            SUBSCRIBE NOW
                        </Text>
                    </TouchableOpacity>

                    {/* Coming Soon Note */}
                    <Text style={[styles.comingSoonText, { color: theme.colors.tertiary }]}>
                        PAYMENT INTEGRATION COMING SOON
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
        content: {
            flex: 1,
            padding: 20,
            paddingTop: Platform.OS === 'ios' ? 100 : 80,
            justifyContent: 'space-between',
        },
        header: {
            alignItems: 'center',
            marginBottom: 16,
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
            marginBottom: 16,
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
            marginBottom: 10,
            textAlign: 'center',
        },
        pricingRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            gap: 8,
            marginBottom: 16,
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
        selectedCard: {
            borderColor: theme.colors.primary,
            borderWidth: 3,
            backgroundColor: theme.colors.primary + '10',
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
        subscribeText: {
            fontSize: 15,
            fontFamily: 'Panchang-Bold',
            letterSpacing: 3,
        },
        comingSoonText: {
            fontSize: 10,
            fontFamily: 'Panchang-Bold',
            letterSpacing: 2,
            textAlign: 'center',
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
