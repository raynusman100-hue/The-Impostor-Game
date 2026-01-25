import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Animated, Platform, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../utils/ThemeContext';
import Button from '../components/Button';
import { playHaptic } from '../utils/haptics';
import { auth } from '../utils/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

export default function WifiModeSelectorScreen({ navigation }) {
    const { theme } = useTheme();
    const styles = getStyles(theme);
    const [fadeAnim] = useState(new Animated.Value(0));
    const [isAuthReady, setIsAuthReady] = useState(false);
    const [profileData, setProfileData] = useState(null);

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
        }).start();
    }, []);

    // Listen for auth state changes in real-time
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                // User is signed in, load profile
                try {
                    const savedProfile = await AsyncStorage.getItem('user_profile');
                    if (savedProfile) {
                        setProfileData(JSON.parse(savedProfile));
                        setIsAuthReady(true);
                    } else {
                        // Auth exists but no profile yet (race condition)
                        setProfileData(null);
                        setIsAuthReady(false);
                    }
                } catch (error) {
                    console.error('Error loading profile in auth listener:', error);
                    setProfileData(null);
                    setIsAuthReady(false);
                }
            } else {
                // User is signed out
                setProfileData(null);
                setIsAuthReady(false);
            }
        });

        return unsubscribe;
    }, []);

    // Refresh profile when screen gains focus (e.g., returning from Profile screen)
    useFocusEffect(
        useCallback(() => {
            const refreshProfile = async () => {
                const user = auth.currentUser;
                if (user) {
                    try {
                        const savedProfile = await AsyncStorage.getItem('user_profile');
                        if (savedProfile) {
                            setProfileData(JSON.parse(savedProfile));
                            setIsAuthReady(true);
                        } else {
                            setProfileData(null);
                            setIsAuthReady(false);
                        }
                    } catch (error) {
                        console.error('Error refreshing profile:', error);
                    }
                }
            };

            refreshProfile();
        }, [])
    );

    const checkAuthAndNavigate = (targetScreen) => {
        playHaptic('medium');

        // Check if auth is ready and profile is loaded
        const user = auth.currentUser;

        if (!user || !isAuthReady || !profileData) {
            Alert.alert(
                "Login Required",
                "You must be logged in with a profile to play online.",
                [
                    { text: "Cancel", style: "cancel" },
                    { text: "Go to Profile", onPress: () => navigation.navigate('Profile') }
                ]
            );
            return;
        }

        // Profile is already loaded from the auth state listener
        if (!profileData.username) {
            Alert.alert("Profile Incomplete", "Please set up your username first.", [
                { text: "Go to Profile", onPress: () => navigation.navigate('Profile') }
            ]);
            return;
        }

        // Navigate with pre-loaded profile data
        navigation.navigate(targetScreen, {
            playerData: {
                name: profileData.username,
                email: profileData.email, // Added for premium check
                avatarId: profileData.avatarId || 1,
                uid: user.uid,
                customAvatarConfig: profileData.customAvatarConfig || profileData.customAvatar || null,
                useCustomAvatar: !!(profileData.customAvatarConfig || profileData.customAvatar),
            }
        });
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
                        ONLINE MODE
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

function getStyles(theme) {
    return StyleSheet.create({
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
}
