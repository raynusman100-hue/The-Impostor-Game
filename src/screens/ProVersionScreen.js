import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import PurchaseManager from '../utils/PurchaseManager';

const ProVersionScreen = () => {
    const navigation = useNavigation();
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
            Alert.alert('Success', 'You are now a Pro user! Ads have been removed.');
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

    if (isPro) {
        return (
            <LinearGradient
                colors={['#0a0a0a', '#1a1a1a']}
                style={styles.container}
            >
                <View style={styles.content}>
                    <Ionicons name="checkmark-circle" size={80} color="#4CAF50" />
                    <Text style={styles.title}>You are a Pro User!</Text>
                    <Text style={styles.description}>Thank you for your support. Enjoy the ad-free experience.</Text>

                    <TouchableOpacity style={styles.closeButton} onPress={() => navigation.goBack()}>
                        <Text style={styles.buttonText}>Close</Text>
                    </TouchableOpacity>
                </View>
            </LinearGradient>
        );
    }

    return (
        <LinearGradient
            colors={['#0a0a0a', '#1a1a1a']}
            style={styles.container}
        >
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
                <Ionicons name="arrow-back" size={24} color="#ffffff" />
            </TouchableOpacity>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <View style={styles.header}>
                    <Ionicons name="star" size={60} color="#FFD700" />
                    <Text style={styles.title}>Go Pro</Text>
                    <Text style={styles.subtitle}>Unlock the ultimate experience</Text>
                </View>

                <View style={styles.card}>
                    <FeatureRow icon="remove-circle-outline" text="Remove All Ads" />
                    <FeatureRow icon="color-palette-outline" text="Unlock All Themes (Coming Soon)" />
                    <FeatureRow icon="heart-outline" text="Support the Developer" />
                </View>

                <View style={styles.footer}>
                    <TouchableOpacity
                        style={styles.purchaseButton}
                        onPress={handlePurchase}
                        disabled={loading}
                    >
                        {loading ? (
                            <ActivityIndicator color="#000" />
                        ) : (
                            <>
                                <Text style={styles.buttonText}>
                                    {packageInfo ? `Upgrade for ${packageInfo.product.priceString}` : 'Upgrade Now'}
                                </Text>
                                <Text style={styles.priceText}>One-time purchase</Text>
                            </>
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.restoreButton} onPress={handleRestore} disabled={loading}>
                        <Text style={styles.restoreText}>Restore Purchases</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </LinearGradient>
    );
};

const FeatureRow = ({ icon, text }) => (
    <View style={styles.featureRow}>
        <View style={styles.iconContainer}>
            <Ionicons name={icon} size={24} color="#FFD700" />
        </View>
        <Text style={styles.featureText}>{text}</Text>
    </View>
);

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
        padding: 24,
        justifyContent: 'center',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    header: {
        alignItems: 'center',
        marginBottom: 40,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#ffffff',
        marginTop: 16,
        fontFamily: 'Inter_700Bold', // Assuming this font is available
    },
    subtitle: {
        fontSize: 16,
        color: '#888888',
        marginTop: 8,
        fontFamily: 'Inter_400Regular',
    },
    description: {
        fontSize: 16,
        color: '#cccccc',
        textAlign: 'center',
        marginTop: 16,
        marginBottom: 32,
        lineHeight: 24,
    },
    card: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 24,
        padding: 24,
        marginBottom: 40,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    featureRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 215, 0, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
    },
    featureText: {
        fontSize: 16,
        color: '#ffffff',
        fontWeight: '600',
    },
    footer: {
        width: '100%',
    },
    purchaseButton: {
        backgroundColor: '#FFD700',
        paddingVertical: 18,
        borderRadius: 16,
        alignItems: 'center',
        marginBottom: 16,
        elevation: 5,
        shadowColor: '#FFD700',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    buttonText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000000',
    },
    priceText: {
        fontSize: 12,
        color: 'rgba(0,0,0,0.6)',
        marginTop: 2,
    },
    restoreButton: {
        padding: 12,
        alignItems: 'center',
    },
    restoreText: {
        color: '#888888',
        fontSize: 14,
    },
    backButton: {
        position: 'absolute',
        top: 50,
        left: 20,
        zIndex: 10,
        width: 40,
        height: 40,
        backgroundColor: 'rgba(0,0,0,0.3)',
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    closeButton: {
        backgroundColor: '#333',
        paddingHorizontal: 32,
        paddingVertical: 16,
        borderRadius: 12,
    }
});

export default ProVersionScreen;
