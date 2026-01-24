import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import PurchaseManager from '../utils/PurchaseManager';
import { useTheme } from '../utils/ThemeContext';

const ProVersionScreen = () => {
    const navigation = useNavigation();
    const { theme } = useTheme();
    const [loading, setLoading] = useState(false);
    const [isPro, setIsPro] = useState(false);
    const [packageInfo, setPackageInfo] = useState(null);

    useEffect(() => {
        const checkStatus = async () => {
            const status = await PurchaseManager.checkProStatus();
            setIsPro(status);

            // Fetch price info
            if (!status) {
                const pkg = await PurchaseManager.getCurrentOffering();
                setPackageInfo(pkg);
            }
        };
        checkStatus();

        // Subscribe to changes
        const unsubscribe = PurchaseManager.addListener((status) => {
            setIsPro(status);
        });
        return unsubscribe;
    }, []);

    const handlePurchase = async () => {
        setLoading(true);
        const result = await PurchaseManager.purchaseRemoveAds();
        setLoading(false);

        if (result.success) {
            Alert.alert('Success', 'You are now a Pro user! Voice chat unlocked & ads removed.');
            navigation.goBack();
        } else if (result.error !== 'User cancelled') {
            Alert.alert('Error', result.error);
        }
    };

    const handleRestore = async () => {
        setLoading(true);
        const success = await PurchaseManager.restorePurchases();
        setLoading(false);

        if (success) {
            Alert.alert('Success', 'Purchases restored!');
        } else {
            Alert.alert('Notice', 'No active status found to restore.');
        }
    };

    const styles = getStyles(theme);

    if (isPro) {
        return (
            <LinearGradient
                colors={['#0a0a0a', '#1a1a1a']}
                style={styles.container}
            >
                <View style={styles.content}>
                    <Ionicons name="checkmark-circle" size={100} color="#FFD700" />
                    <Text style={[styles.title, { marginTop: 20 }]}>PREMIUM UNLOCKED</Text>
                    <Text style={styles.description}>
                        You have full access to Voice Chat and an Ad-Free experience. Thank you for your support!
                    </Text>

                    <TouchableOpacity style={styles.closeButton} onPress={() => navigation.goBack()}>
                        <Text style={styles.buttonText}>CLOSE</Text>
                    </TouchableOpacity>
                </View>
            </LinearGradient>
        );
    }

    return (
        <LinearGradient
            colors={['#000000', '#1a1a1a', '#000000']}
            style={styles.container}
        >
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                <Ionicons name="close" size={28} color="#ffffff" />
            </TouchableOpacity>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

                {/* Header Section */}
                <View style={styles.header}>
                    <LinearGradient
                        colors={['#FFD700', '#FFA500']}
                        style={styles.iconBackground}
                    >
                        <Ionicons name="diamond" size={48} color="#000" />
                    </LinearGradient>
                    <Text style={styles.title}>GO PREMIUM</Text>
                    <Text style={styles.subtitle}>Unlock the Full Experience</Text>
                </View>

                {/* Main Feature Card - Highly Visible */}
                <View style={styles.mainCard}>
                    <View style={styles.cardHeader}>
                        <Text style={styles.cardRank}>PRO ACCESS</Text>
                    </View>

                    <View style={styles.featuresContainer}>
                        <FeatureRow
                            icon="mic"
                            title="Access to Voice Chat"
                            subtitle="Talk with friends in real-time"
                            isPremium={true}
                            theme={theme}
                        />
                        <FeatureRow
                            icon="ban"
                            title="Remove All Ads"
                            subtitle="No more interruptions"
                            isPremium={true}
                            theme={theme}
                        />
                        <FeatureRow
                            icon="color-palette"
                            title="Premium Themes"
                            subtitle="Customize your experience (Soon)"
                            theme={theme}
                        />
                        <FeatureRow
                            icon="heart"
                            title="Support Development"
                            subtitle="Help us make the game better"
                            theme={theme}
                        />
                    </View>
                </View>

                {/* Purchase Button Area */}
                <View style={styles.footer}>
                    <TouchableOpacity
                        style={styles.purchaseButton}
                        onPress={handlePurchase}
                        disabled={loading}
                        activeOpacity={0.8}
                    >
                        <LinearGradient
                            colors={['#FFD700', '#FDB931']}
                            style={styles.gradientButton}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                        >
                            {loading ? (
                                <ActivityIndicator color="#000" />
                            ) : (
                                <View style={styles.priceContainer}>
                                    <Text style={styles.buttonText}>
                                        UNLOCK NOW
                                    </Text>
                                    <Text style={styles.priceText}>
                                        {packageInfo ? packageInfo.product.priceString : 'Loading Price...'} • One-time Purchase
                                    </Text>
                                </View>
                            )}
                        </LinearGradient>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.restoreButton} onPress={handleRestore} disabled={loading}>
                        <Text style={styles.restoreText}>Restore Purchases</Text>
                    </TouchableOpacity>
                </View>

                <Text style={styles.disclaimer}>
                    Secure payment via Google Play. No recurring subscription.
                </Text>

            </ScrollView>
        </LinearGradient>
    );
};

const FeatureRow = ({ icon, title, subtitle, isPremium, theme }) => {
    const styles = getStyles(theme);
    return (
        <View style={styles.featureRow}>
            <View style={[styles.iconContainer, isPremium && styles.iconContainerPremium]}>
                <Ionicons name={icon} size={24} color={isPremium ? "#000" : "#FFD700"} />
            </View>
            <View style={styles.textContainer}>
                <Text style={[styles.featureTitle, isPremium && styles.featureTitlePremium]}>{title}</Text>
                <Text style={styles.featureSubtitle}>{subtitle}</Text>
            </View>
        </View>
    );
};

const getStyles = (theme) => StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        paddingVertical: 60,
        paddingHorizontal: 20,
        alignItems: 'center',
    },
    backButton: {
        position: 'absolute',
        top: 50,
        right: 20,
        zIndex: 50,
        width: 44,
        height: 44,
        backgroundColor: 'rgba(255,255,255,0.1)',
        borderRadius: 22,
        justifyContent: 'center',
        alignItems: 'center',
    },
    header: {
        alignItems: 'center',
        marginBottom: 30,
    },
    iconBackground: {
        width: 80,
        height: 80,
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
        elevation: 10,
        shadowColor: '#FFD700',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
    },
    title: {
        fontSize: 36,
        fontFamily: 'Panchang-Bold', // Assuming font exists
        color: '#ffffff',
        textAlign: 'center',
        letterSpacing: 1,
    },
    subtitle: {
        fontSize: 14,
        color: '#aaaaaa',
        marginTop: 8,
        letterSpacing: 2,
        fontFamily: 'Teko-Medium', // Assuming font exists
        textTransform: 'uppercase',
    },
    mainCard: {
        width: '100%',
        backgroundColor: '#111',
        borderRadius: 24,
        padding: 4, // for border effect
        marginBottom: 30,
        borderWidth: 1,
        borderColor: '#333',
    },
    cardHeader: {
        alignItems: 'center',
        paddingVertical: 10,
        backgroundColor: '#1a1a1a',
        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#333',
    },
    cardRank: {
        fontSize: 12,
        color: '#FFD700',
        fontWeight: '900',
        letterSpacing: 2,
    },
    featuresContainer: {
        padding: 20,
        backgroundColor: '#0a0a0a',
        borderBottomLeftRadius: 20,
        borderBottomRightRadius: 20,
    },
    featureRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 24,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    iconContainerPremium: {
        backgroundColor: '#FFD700',
    },
    textContainer: {
        flex: 1,
    },
    featureTitle: {
        fontSize: 18,
        color: '#ffffff',
        fontWeight: '700',
        marginBottom: 2,
    },
    featureTitlePremium: {
        color: '#FFD700',
    },
    featureSubtitle: {
        fontSize: 13,
        color: '#666666',
    },
    footer: {
        width: '100%',
        alignItems: 'center',
    },
    purchaseButton: {
        width: '100%',
        borderRadius: 16,
        overflow: 'hidden',
        marginBottom: 16,
        elevation: 8,
        shadowColor: '#FFD700',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
    },
    gradientButton: {
        paddingVertical: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    priceContainer: {
        alignItems: 'center',
    },
    buttonText: {
        fontSize: 22,
        fontFamily: 'Panchang-Bold',
        color: '#000',
        marginBottom: 4,
    },
    priceText: {
        fontSize: 12,
        color: '#333',
        fontWeight: '600',
    },
    restoreButton: {
        padding: 10,
    },
    restoreText: {
        color: '#666',
        fontSize: 12,
        textDecorationLine: 'underline',
    },
    disclaimer: {
        marginTop: 20,
        color: '#444',
        fontSize: 10,
        textAlign: 'center',
    },
    // Success Screen Styles
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 30,
    },
    description: {
        fontSize: 16,
        color: '#ccc',
        textAlign: 'center',
        marginTop: 16,
        marginBottom: 40,
        lineHeight: 24,
    },
    closeButton: {
        backgroundColor: '#222',
        paddingHorizontal: 40,
        paddingVertical: 16,
        borderRadius: 30,
        borderWidth: 1,
        borderColor: '#444',
    },
});

export default ProVersionScreen;
