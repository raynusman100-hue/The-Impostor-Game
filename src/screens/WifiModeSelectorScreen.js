import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, Platform, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../utils/ThemeContext';
import Button from '../components/Button';
import { playHaptic } from '../utils/haptics';
import { auth } from '../utils/firebase';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

export default function WifiModeSelectorScreen({ navigation }) {
    const { theme } = useTheme();
    const styles = getStyles(theme);
    const fadeAnim = new Animated.Value(0);

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
        }).start();
    }, []);

    const checkAuthAndNavigate = async (targetScreen) => {
        playHaptic('medium');

        // 1. Check Firebase Auth
        const user = auth.currentUser;
        if (!user) {
            Alert.alert(
                "Login Required",
                "You must be logged in to play online.",
                [
                    { text: "Cancel", style: "cancel" },
                    { text: "Login", onPress: () => navigation.navigate('Profile') }
                ]
            );
            return;
        }

        // 2. Load Profile Data
        try {
            const savedProfile = await AsyncStorage.getItem('user_profile');
            if (savedProfile) {
                const profile = JSON.parse(savedProfile);

                if (!profile.username) {
                    // Should technically be caught by !user check if flow is correct, but safe fallback
                    Alert.alert("Profile Incomplete", "Please set up your username first.", [
                        { text: "Go to Profile", onPress: () => navigation.navigate('Profile') }
                    ]);
                    return;
                }

                navigation.navigate(targetScreen, {
                    playerData: {
                        name: profile.username,
                        avatarId: profile.avatarId || 1, // Default if missing
                        uid: user.uid
                    }
                });

            } else {
                Alert.alert("Profile Not Found", "Please save your profile first.", [
                    { text: "Go to Profile", onPress: () => navigation.navigate('Profile') }
                ]);
            }
        } catch (error) {
            console.error("Auth check error", error);
            Alert.alert("Error", "Failed to load profile.");
        }
    };

    const handleHost = () => {
        checkAuthAndNavigate('Host');
    };

    const handleJoin = () => {
        checkAuthAndNavigate('Join');
    };

    return (
        <LinearGradient
            colors={theme.colors.backgroundGradient}
            style={styles.container}
        >
            <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
                <View style={styles.header}>
                    <Text
                        style={styles.title}
                        numberOfLines={1}
                        adjustsFontSizeToFit
                        minimumFontScale={0.5}
                    >
                        MULTIPLAYER WI-FI
                    </Text>
                </View>

                <View style={styles.buttonRow}>
                    <Button
                        title="HOST"
                        onPress={handleHost}
                        style={styles.modeButton}
                    />
                    <Button
                        title="JOIN"
                        onPress={handleJoin}
                        style={styles.modeButton}
                    />
                </View>
            </Animated.View>
        </LinearGradient>
    );
}

const getStyles = (theme) => StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    content: {
        width: '100%',
        padding: theme.spacing.xl,
        alignItems: 'center',
    },
    header: {
        alignItems: 'center',
        marginBottom: 60,
        marginTop: Platform.OS === 'ios' ? 80 : 60, // Accommodate header
    },
    title: {
        fontSize: 72,
        color: theme.colors.tertiary, // Silver
        fontFamily: theme.fonts.header,
        letterSpacing: 2,
        ...theme.textShadows.depth,
    },
    subtitle: {
        fontSize: 24,
        color: theme.colors.primary,
        fontFamily: theme.fonts.medium,
        letterSpacing: 8,
        marginTop: -10,
    },
    buttonRow: {
        flexDirection: 'row',
        width: '100%',
        gap: 12,
        marginBottom: 30,
    },
    modeButton: {
        flex: 1,
    },
    orText: {
        color: theme.colors.textMuted,
        fontFamily: theme.fonts.medium,
        fontSize: 20,
        textAlign: 'center',
        letterSpacing: 4,
    },
});
