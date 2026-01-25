import React, { useEffect, useRef, useState, useCallback } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity, Dimensions, Platform, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../utils/ThemeContext';
import { useSettings } from '../utils/SettingsContext';
import { playHaptic } from '../utils/haptics';
import { CustomAvatar } from '../utils/AvatarGenerator';
import { CustomBuiltAvatar } from '../components/CustomAvatarBuilder';
import { Ionicons } from '@expo/vector-icons';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Film perforation component for Kodak aesthetic (same as SetupScreen)
const FilmPerforations = ({ side, theme }) => {
    const perforationColor = theme.colors.primary + '40'; // 40 = 25% opacity

    return (
        <View style={[filmStyles.perforationStrip, side === 'left' ? filmStyles.leftStrip : filmStyles.rightStrip]}>
            {[...Array(12)].map((_, i) => (
                <View key={i} style={[filmStyles.perforation, { backgroundColor: perforationColor }]} />
            ))}
        </View>
    );
};

const filmStyles = StyleSheet.create({
    perforationStrip: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        width: 18,
        justifyContent: 'space-evenly',
        alignItems: 'center',
        paddingVertical: 40,
        zIndex: 1,
    },
    leftStrip: { left: 2 },
    rightStrip: { right: 2 },
    perforation: {
        width: 10,
        height: 14,
        borderRadius: 2,
        borderWidth: 1,
        borderColor: 'rgba(255, 184, 0, 0.3)',
    },
});

// Premium Crystal Glass Button - Clean and sophisticated
const GlassmorphicButton = ({ title, onPress, isPrimary }) => {
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const { theme } = useTheme();

    const handlePressIn = () => {
        Animated.spring(scaleAnim, { toValue: 0.98, friction: 8, useNativeDriver: true }).start();
    };

    const handlePressOut = () => {
        Animated.spring(scaleAnim, { toValue: 1, friction: 4, useNativeDriver: true }).start();
    };

    return (
        <Animated.View style={[glassStyles.container, { transform: [{ scale: scaleAnim }] }]}>
            <TouchableOpacity
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                onPress={() => { playHaptic('medium'); onPress(); }}
                activeOpacity={0.9}
                style={glassStyles.touchable}
            >
                {/* Crystal glass background */}
                <LinearGradient
                    colors={isPrimary
                        ? [theme.colors.primary, theme.colors.primary]
                        : ['rgba(255, 255, 255, 0.08)', 'rgba(255, 255, 255, 0.05)']
                    }
                    start={{ x: 0, y: 0 }}
                    end={{ x: 0, y: 1 }}
                    style={[
                        glassStyles.glass,
                        {
                            borderColor: isPrimary
                                ? 'rgba(255, 255, 255, 0.3)'
                                : 'rgba(255, 255, 255, 0.15)',
                        }
                    ]}
                >
                    {/* Subtle top shine - very minimal */}
                    <View style={glassStyles.shineTop} />

                    {/* Bottom subtle glow */}
                    <View style={glassStyles.glowBottom} />

                    <Text style={[
                        glassStyles.title,
                        {
                            color: isPrimary ? theme.colors.secondary : theme.colors.text,
                        }
                    ]}>
                        {title}
                    </Text>
                </LinearGradient>
            </TouchableOpacity>
        </Animated.View>
    );
};

const glassStyles = StyleSheet.create({
    container: {
        width: '100%',
        marginBottom: 10,
    },
    touchable: {
        width: '100%',
    },
    glass: {
        height: 48,
        borderRadius: 24,
        borderWidth: 1,
        overflow: 'hidden',
        justifyContent: 'center',
        alignItems: 'center',
        // Premium shadow
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.2,
        shadowRadius: 16,
        elevation: 8,
    },
    shineTop: {
        position: 'absolute',
        top: 0,
        left: '10%',
        right: '10%',
        height: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.4)',
    },
    glowBottom: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        height: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    title: {
        fontSize: 13,
        fontFamily: 'Panchang-Bold',
        letterSpacing: 1.5,
        zIndex: 1,
    },
});

export default function HomeScreen({ navigation }) {
    const { theme } = useTheme();
    const styles = getStyles(theme);
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;
    const titleFlickerAnim = useRef(new Animated.Value(1)).current;
    const filmGrainAnim = useRef(new Animated.Value(0)).current;
    const [userProfile, setUserProfile] = useState(null);

    useFocusEffect(
        useCallback(() => {
            const loadProfile = async () => {
                try {
                    const savedProfile = await AsyncStorage.getItem('user_profile');
                    if (savedProfile) {
                        const profile = JSON.parse(savedProfile);
                        setUserProfile(profile);

                        // Enforce Profile Completion
                        if (!profile.hasCompletedProfile || !profile.username || profile.username.trim() === '') {
                            Alert.alert(
                                'Profile Incomplete',
                                'You need a username to play! Please complete your profile.',
                                [
                                    { text: 'Go to Profile', onPress: () => navigation.navigate('Profile') },
                                    { text: 'Cancel', style: 'cancel' }
                                ]
                            );
                        }
                    } else {
                        setUserProfile(null);
                        // Optional: Prompt new users to sign in?
                        // For now, allow them to see the screen but maybe block buttons later
                    }
                } catch (e) {
                    console.log('Failed to load profile');
                }
            };
            loadProfile();
        }, [])
    );

    useEffect(() => {
        // Delay entry animation slightly to sync with splash fade-out
        const animationTimeout = setTimeout(() => {
            // Entry animation - smooth fade and slide
            Animated.parallel([
                Animated.timing(fadeAnim, {
                    toValue: 1,
                    duration: 500,
                    useNativeDriver: true,
                }),
                Animated.spring(slideAnim, {
                    toValue: 0,
                    friction: 10,
                    tension: 50,
                    useNativeDriver: true,
                }),
            ]).start();
        }, 100);

        // Subtle title flicker effect (like old cinema) - start after initial animation
        const flickerTimeout = setTimeout(() => {
            const flicker = Animated.sequence([
                Animated.timing(titleFlickerAnim, { toValue: 0.92, duration: 80, useNativeDriver: true }),
                Animated.timing(titleFlickerAnim, { toValue: 1, duration: 80, useNativeDriver: true }),
                Animated.delay(4000),
            ]);
            Animated.loop(flicker).start();
        }, 600);

        // Film grain animation
        const grain = Animated.loop(
            Animated.sequence([
                Animated.timing(filmGrainAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
                Animated.timing(filmGrainAnim, { toValue: 0, duration: 100, useNativeDriver: true }),
            ])
        );
        grain.start();

        return () => {
            clearTimeout(animationTimeout);
            clearTimeout(flickerTimeout);
        };
    }, []);

    // Premium screen logic - show every 2nd app open
    useEffect(() => {
        const handlePremiumScreen = async () => {
            try {
                // Check if this is from navigation state (e.g., back button)
                const isNavigating = navigation.getState().routes.length > 1;
                if (isNavigating) {
                    console.log('HomeScreen: Skipping premium check (navigation state detected)');
                    return;
                }

                // Check if user has premium
                const { checkPremiumStatus } = require('../utils/PremiumManager');
                const { auth } = require('../utils/firebase');

                const user = auth.currentUser;
                if (user) {
                    const hasPremium = await checkPremiumStatus(user.email, user.uid);
                    if (hasPremium) {
                        console.log('💎 HomeScreen: User is PREMIUM - SUPPRESSING POPUP');
                        return; // EXIT IMMEDIATELY
                    }
                }

                // Get and increment app open count
                const countStr = await AsyncStorage.getItem('app_open_count');
                const count = countStr ? parseInt(countStr, 10) : 0;
                const newCount = count + 1;
                await AsyncStorage.setItem('app_open_count', newCount.toString());

                console.log('HomeScreen: App opened', newCount, 'times');

                // Show premium on even numbers (every 2nd open)
                if (newCount % 2 === 0 && newCount > 0) {
                    console.log('HomeScreen: Showing premium screen (2nd open trigger)');
                    // Small delay to ensure home screen is fully loaded
                    setTimeout(() => {
                        navigation.navigate('Premium');
                    }, 800);
                }
            } catch (error) {
                console.error('HomeScreen: Error in premium check:', error);
            }
        };

        handlePremiumScreen();
    }, []);

    return (
        <LinearGradient
            colors={theme.colors.backgroundGradient}
            style={styles.container}
        >
            {/* Film perforations */}
            <FilmPerforations side="left" theme={theme} />
            <FilmPerforations side="right" theme={theme} />

            {/* Settings button - top left */}
            <TouchableOpacity
                onPress={() => { playHaptic('light'); navigation.navigate('Settings'); }}
                style={styles.settingsButton}
            >
                <View style={styles.gearIcon}>
                    <Ionicons name="settings-sharp" size={24} color={theme.colors.primary} />
                </View>
            </TouchableOpacity>

            {/* Profile button - top right */}
            <TouchableOpacity
                onPress={() => { playHaptic('light'); navigation.navigate('Profile'); }}
                style={styles.profileButton}
            >
                {userProfile ? (
                    userProfile.useCustomAvatar && userProfile.customAvatarConfig ? (
                        <CustomBuiltAvatar config={userProfile.customAvatarConfig} size={34} />
                    ) : (
                        <CustomAvatar id={userProfile.avatarId} size={34} />
                    )
                ) : (
                    <View style={styles.profilePlaceholder}>
                        <View style={[styles.placeholderHead, { backgroundColor: theme.colors.textMuted }]} />
                        <View style={[styles.placeholderBody, { backgroundColor: theme.colors.textMuted }]} />
                    </View>
                )}
            </TouchableOpacity>

            {/* Premium button - small icon next to profile */}
            <TouchableOpacity
                onPress={() => {
                    playHaptic('medium');
                    navigation.navigate('Premium');
                }}
                style={styles.premiumButton}
                activeOpacity={0.7}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
                <LinearGradient
                    colors={['#FFD700', '#FFC700']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.premiumGradient}
                >
                    <Text style={styles.premiumIcon}>👑</Text>
                </LinearGradient>
            </TouchableOpacity>

            {/* Main content */}
            <Animated.View
                style={[
                    styles.content,
                    { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
                ]}
            >
                {/* Kodak-style film frame header - line only, no text */}
                <View style={styles.filmFrameTop}>
                    {/* Empty spacers to maintain line structure */}
                    <View style={styles.frameCode} />
                    <View style={styles.frameCode} />
                    <View style={styles.frameCode} />
                </View>

                {/* Title with cinematic glow - below the line, no flicker */}
                <View style={styles.titleContainer}>
                    <Text style={styles.titleMain}>IMPOSTOR</Text>
                    <Text style={styles.titleSub}>GAME</Text>
                </View>

                {/* Character Image */}
                <AnimatedCharacter theme={theme} />

                {/* Menu - Glassmorphism Style */}
                <View style={styles.menuContainer}>
                    <View style={styles.menuContent}>
                        <View style={styles.buttonColumn}>
                            <GlassmorphicButton
                                title="PASS & PLAY"
                                onPress={() => navigation.navigate('Setup')}
                                isPrimary={true}
                            />
                            <GlassmorphicButton
                                title="ONLINE MODE"
                                onPress={() => navigation.navigate('WifiModeSelector')}
                                isPrimary={true}
                            />
                            <GlassmorphicButton
                                title="THEMES"
                                onPress={() => navigation.navigate('ThemeSelector')}
                                isPrimary={false}
                            />
                            <GlassmorphicButton
                                title="HOW TO PLAY"
                                onPress={() => navigation.navigate('HowToPlay')}
                                isPrimary={false}
                            />
                        </View>
                    </View>
                </View>
            </Animated.View>
        </LinearGradient>
    );
}

function AnimatedCharacter({ theme }) {
    const { settings } = useSettings();
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const floatAnim = useRef(new Animated.Value(0)).current;
    const [imageError, setImageError] = useState(false);

    useEffect(() => {
        // If reduced motion is on, don't run the animations
        if (settings.reducedMotion) {
            scaleAnim.setValue(1);
            floatAnim.setValue(0);
            return;
        }

        const breathe = Animated.sequence([
            Animated.timing(scaleAnim, { toValue: 1.03, duration: 2500, useNativeDriver: true }),
            Animated.timing(scaleAnim, { toValue: 1, duration: 2500, useNativeDriver: true }),
        ]);

        const float = Animated.sequence([
            Animated.timing(floatAnim, { toValue: -8, duration: 2000, useNativeDriver: true }),
            Animated.timing(floatAnim, { toValue: 0, duration: 2000, useNativeDriver: true }),
        ]);

        const loop = Animated.loop(Animated.parallel([breathe, float]));
        loop.start();

        return () => loop.stop();
    }, [settings.reducedMotion]);

    // Responsive sizing based on screen height
    const getCharacterSize = () => {
        if (SCREEN_HEIGHT < 700) return 350;      // Small phones - slightly bigger
        if (SCREEN_HEIGHT < 800) return 400;      // Medium phones
        if (SCREEN_HEIGHT < 900) return 430;      // Large phones
        return 470;                                // Extra large phones/tablets
    };

    const getCharacterTop = () => {
        if (SCREEN_HEIGHT < 700) return '18%';    // Small phones - higher
        if (SCREEN_HEIGHT < 800) return '22%';    // Medium phones
        if (SCREEN_HEIGHT < 900) return '24%';    // Large phones
        return '26%';                              // Extra large phones/tablets
    };

    const characterSize = getCharacterSize();
    const characterTop = getCharacterTop();
    const characterSource = require('../../assets/sweat_boy.png');

    return (
        <Animated.View
            pointerEvents="none"
            style={[
                characterStyles.characterContainer,
                {
                    top: characterTop,
                    transform: [
                        { scale: scaleAnim },
                        { translateY: floatAnim }
                    ]
                }
            ]}
        >
            <Image
                source={characterSource}
                style={[characterStyles.characterImage, { width: characterSize, height: characterSize }]}
                onError={(e) => {
                    console.log('Character image failed to load:', e.nativeEvent.error);
                    setImageError(true);
                }}
                onLoad={() => console.log('Character image loaded successfully')}
            />
            {imageError && (
                <Text style={{ color: theme.colors.text, fontSize: 12, marginTop: 10 }}>
                    Character image failed to load
                </Text>
            )}
        </Animated.View>
    );
}

const characterStyles = StyleSheet.create({
    characterContainer: {
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 0, // Behind title text so it doesn't overshadow
    },
    characterImage: {
        opacity: 1, // Full opacity - character should be fully visible
        resizeMode: 'contain',
    },
});

function getStyles(theme) {
    return StyleSheet.create({
        container: {
            flex: 1,
        },
        settingsButton: {
            position: 'absolute',
            top: Platform.OS === 'ios' ? 45 : 30,
            left: 22,
            zIndex: 10,
            width: 42,
            height: 42,
            borderRadius: 21,
            backgroundColor: theme.colors.surface,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 2,
            borderColor: theme.colors.primary + '50',
        },
        gearIcon: {
            width: 42,
            height: 42,
            alignItems: 'center',
            justifyContent: 'center',
        },
        profileButton: {
            position: 'absolute',
            top: Platform.OS === 'ios' ? 45 : 30,
            right: 22,
            zIndex: 10,
            width: 42,
            height: 42,
            borderRadius: 21,
            backgroundColor: theme.colors.surface,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 2,
            borderColor: theme.colors.primary + '50',
        },
        premiumButton: {
            position: 'absolute',
            top: Platform.OS === 'ios' ? 45 : 30,
            right: 74,
            width: 42,
            height: 42,
            zIndex: 10,
            borderRadius: 21,
            overflow: 'hidden',
            borderWidth: 2,
            borderColor: '#FFD700',
            shadowColor: '#FFD700',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.3,
            shadowRadius: 4,
            elevation: 4,
        },
        premiumGradient: {
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
        },
        premiumIcon: {
            fontSize: 20,
            lineHeight: 20,
        },
        profilePlaceholder: {
            alignItems: 'center',
            justifyContent: 'center',
            paddingTop: 5,
        },
        placeholderHead: {
            width: 11,
            height: 11,
            borderRadius: 5.5,
            marginBottom: 2,
        },
        placeholderBody: {
            width: 18,
            height: 9,
            borderTopLeftRadius: 9,
            borderTopRightRadius: 9,
        },
        content: {
            flex: 1,
            alignItems: 'center',
            paddingTop: Platform.OS === 'ios' ? 50 : 35, // Moved up - no frame text needed
            paddingHorizontal: 26,
        },
        // Film frame header
        filmFrameTop: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            width: '100%',
            paddingVertical: 6,
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.primary + '30',
            marginBottom: 8,
        },
        frameCode: {
            opacity: 0.5,
        },
        frameCodeText: {
            color: theme.colors.primary,
            fontSize: 8,
            fontFamily: 'Teko-Medium',
            letterSpacing: 2,
        },
        kodakBadge: {
            backgroundColor: theme.colors.primary,
            paddingHorizontal: 12,
            paddingVertical: 2,
            borderRadius: 3,
        },
        kodakBadgeText: {
            color: theme.colors.secondary,
            fontSize: 9,
            fontFamily: 'Panchang-Bold',
            letterSpacing: 3,
        },
        // Title - below the line
        titleContainer: {
            alignItems: 'center',
            marginTop: 8, // Space below the line
            marginBottom: SCREEN_HEIGHT < 700 ? 50 : 60, // Space before character
            zIndex: 1, // Above character
        },
        titleMain: {
            fontSize: SCREEN_HEIGHT < 700 ? 48 : 52,
            color: theme.colors.text,
            fontFamily: 'BespokeStencil-Extrabold',
            letterSpacing: 2,
            ...theme.textShadows.depth,
            zIndex: 1,
        },
        titleSub: {
            fontSize: SCREEN_HEIGHT < 700 ? 36 : 40,
            color: theme.colors.primary,
            fontFamily: 'BespokeStencil-Extrabold',
            letterSpacing: 4,
            marginTop: -4,
            zIndex: 1,
        },
        // Menu - positioned at bottom, simple
        menuContainer: {
            position: 'absolute',
            bottom: Platform.OS === 'ios' ? 20 : 10, // Moved down (was 40/30)
            left: 26,
            right: 26,
        },
        menuContent: {
            paddingVertical: 8,
        },
        buttonColumn: {
            gap: 12,
        },
        // Film frame footer
        filmFrameBottom: {
            position: 'absolute',
            bottom: Platform.OS === 'ios' ? 20 : 12, // Reduced bottom space
            alignItems: 'center',
        },
        frameFooterText: {
            color: theme.colors.textMuted,
            fontSize: 8,
            fontFamily: 'Teko-Medium',
            letterSpacing: 3,
            opacity: 0.5,
        },
    });
}
