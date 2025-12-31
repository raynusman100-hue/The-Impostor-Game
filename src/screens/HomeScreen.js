import React, { useEffect, useRef, useState, useCallback } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity, Dimensions, Platform, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../utils/ThemeContext';
import { playHaptic } from '../utils/haptics';
import { CustomAvatar } from '../utils/AvatarGenerator';

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

// Simple Menu Button - Clean and minimal
const SimpleMenuButton = ({ title, onPress, isPrimary }) => {
    const scaleAnim = useRef(new Animated.Value(1)).current;
    
    const handlePressIn = () => {
        Animated.spring(scaleAnim, { toValue: 0.95, friction: 8, useNativeDriver: true }).start();
    };
    
    const handlePressOut = () => {
        Animated.spring(scaleAnim, { toValue: 1, friction: 4, useNativeDriver: true }).start();
    };

    return (
        <Animated.View style={[{ transform: [{ scale: scaleAnim }], flex: 1 }]}>
            <TouchableOpacity
                onPressIn={handlePressIn}
                onPressOut={handlePressOut}
                onPress={() => { playHaptic('medium'); onPress(); }}
                activeOpacity={0.8}
                style={[
                    simpleButtonStyles.button,
                    isPrimary ? simpleButtonStyles.primaryButton : simpleButtonStyles.secondaryButton
                ]}
            >
                <Text style={[
                    simpleButtonStyles.buttonText,
                    isPrimary ? simpleButtonStyles.primaryText : simpleButtonStyles.secondaryText
                ]}>
                    {title}
                </Text>
            </TouchableOpacity>
        </Animated.View>
    );
};

const simpleButtonStyles = StyleSheet.create({
    button: {
        height: 52,
        borderRadius: 26,
        justifyContent: 'center',
        alignItems: 'center',
    },
    primaryButton: {
        backgroundColor: '#FFB800',
    },
    secondaryButton: {
        backgroundColor: 'transparent',
        borderWidth: 2,
        borderColor: '#FFB800',
    },
    buttonText: {
        fontSize: 14,
        fontFamily: 'CabinetGrotesk-Black',
        letterSpacing: 2,
    },
    primaryText: {
        color: '#0a0a0a',
    },
    secondaryText: {
        color: '#FFB800',
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
                        setUserProfile(JSON.parse(savedProfile));
                    } else {
                        setUserProfile(null);
                    }
                } catch (e) {
                    console.log('Failed to load profile');
                }
            };
            loadProfile();
        }, [])
    );

    useEffect(() => {
        // Entry animation
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
            }),
            Animated.spring(slideAnim, {
                toValue: 0,
                friction: 8,
                tension: 40,
                useNativeDriver: true,
            }),
        ]).start();

        // Subtle title flicker effect (like old cinema)
        const flicker = Animated.sequence([
            Animated.timing(titleFlickerAnim, { toValue: 0.92, duration: 80, useNativeDriver: true }),
            Animated.timing(titleFlickerAnim, { toValue: 1, duration: 80, useNativeDriver: true }),
            Animated.delay(4000),
        ]);
        Animated.loop(flicker).start();
        
        // Film grain animation
        const grain = Animated.loop(
            Animated.sequence([
                Animated.timing(filmGrainAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
                Animated.timing(filmGrainAnim, { toValue: 0, duration: 100, useNativeDriver: true }),
            ])
        );
        grain.start();
    }, []);

    return (
        <LinearGradient
            colors={theme.colors.backgroundGradient}
            style={styles.container}
        >
            {/* Film perforations */}
            <FilmPerforations side="left" theme={theme} />
            <FilmPerforations side="right" theme={theme} />

            {/* Profile button */}
            <TouchableOpacity
                onPress={() => { playHaptic('light'); navigation.navigate('Profile'); }}
                style={styles.profileButton}
            >
                {userProfile ? (
                    <CustomAvatar id={userProfile.avatarId} size={34} />
                ) : (
                    <View style={styles.profilePlaceholder}>
                        <View style={[styles.placeholderHead, { backgroundColor: theme.colors.textMuted }]} />
                        <View style={[styles.placeholderBody, { backgroundColor: theme.colors.textMuted }]} />
                    </View>
                )}
            </TouchableOpacity>

            {/* Main content */}
            <Animated.View
                style={[
                    styles.content,
                    { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
                ]}
            >
                {/* Kodak-style film frame header */}
                <View style={styles.filmFrameTop}>
                    <View style={styles.frameCode}>
                        <Text style={styles.frameCodeText}>▶ 35MM</Text>
                    </View>
                    <View style={styles.kodakBadge}>
                        <Text style={styles.kodakBadgeText}>IMPOSTOR</Text>
                    </View>
                    <View style={styles.frameCode}>
                        <Text style={styles.frameCodeText}>FRAME 01</Text>
                    </View>
                </View>

                {/* Title with cinematic glow */}
                <Animated.View style={[styles.titleContainer, { opacity: titleFlickerAnim }]}>
                    <Text style={styles.titleMain}>IMPOSTOR</Text>
                    <Text style={styles.titleSub}>GAME</Text>
                </Animated.View>

                {/* Character Image */}
                <AnimatedCharacter theme={theme} />

                {/* Menu - Simple and clean */}
                <View style={styles.menuContainer}>
                    <View style={styles.menuContent}>
                        <View style={styles.buttonColumn}>
                            <SimpleMenuButton
                                title="PASS & PLAY"
                                onPress={() => navigation.navigate('Setup')}
                                isPrimary={true}
                            />
                            <SimpleMenuButton
                                title="WI-FI MODE"
                                onPress={() => navigation.navigate('WifiModeSelector')}
                                isPrimary={true}
                            />
                            <SimpleMenuButton
                                title="THEMES"
                                onPress={() => navigation.navigate('ThemeSelector')}
                                isPrimary={false}
                            />
                            <SimpleMenuButton
                                title="HOW TO PLAY"
                                onPress={() => navigation.navigate('HowToPlay')}
                                isPrimary={false}
                            />
                        </View>
                    </View>
                </View>

                {/* Film frame footer */}
                <View style={styles.filmFrameBottom}>
                    <Text style={styles.frameFooterText}>KODAK VISION3 500T 5219</Text>
                </View>
            </Animated.View>
        </LinearGradient>
    );
}

function AnimatedCharacter({ theme }) {
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const floatAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const breathe = Animated.sequence([
            Animated.timing(scaleAnim, { toValue: 1.03, duration: 2500, useNativeDriver: true }),
            Animated.timing(scaleAnim, { toValue: 1, duration: 2500, useNativeDriver: true }),
        ]);

        const float = Animated.sequence([
            Animated.timing(floatAnim, { toValue: -8, duration: 2000, useNativeDriver: true }),
            Animated.timing(floatAnim, { toValue: 0, duration: 2000, useNativeDriver: true }),
        ]);

        Animated.loop(Animated.parallel([breathe, float])).start();
    }, []);

    // Responsive sizing based on screen height
    const getCharacterSize = () => {
        if (SCREEN_HEIGHT < 700) return 340;      // Small phones
        if (SCREEN_HEIGHT < 800) return 380;      // Medium phones
        if (SCREEN_HEIGHT < 900) return 420;      // Large phones
        return 460;                                // Extra large phones/tablets
    };

    const getCharacterTop = () => {
        if (SCREEN_HEIGHT < 700) return '16%';    // Small phones - higher
        if (SCREEN_HEIGHT < 800) return '22%';    // Medium phones
        if (SCREEN_HEIGHT < 900) return '24%';    // Large phones
        return '26%';                              // Extra large phones/tablets
    };

    const characterSize = getCharacterSize();
    const characterTop = getCharacterTop();
    const characterSource = require('../../assets/starboy imposter 3.png');

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
            />
        </Animated.View>
    );
}

const characterStyles = StyleSheet.create({
    characterContainer: {
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: -1,
    },
    characterImage: {
        opacity: 0.85,
        resizeMode: 'contain',
    },
});

const getStyles = (theme) => StyleSheet.create({
    container: {
        flex: 1,
    },
    profileButton: {
        position: 'absolute',
        top: Platform.OS === 'ios' ? 50 : 36,
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
        paddingTop: Platform.OS === 'ios' ? 50 : 36,
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
    // Title - more compact
    titleContainer: {
        alignItems: 'center',
        marginTop: 4,
        marginBottom: SCREEN_HEIGHT < 700 ? 100 : 120,
    },
    titleMain: {
        fontSize: SCREEN_HEIGHT < 700 ? 48 : 52,
        color: theme.colors.text,
        fontFamily: 'BespokeStencil-Extrabold',
        letterSpacing: 2,
        ...theme.textShadows.depth,
    },
    titleSub: {
        fontSize: SCREEN_HEIGHT < 700 ? 36 : 40,
        color: theme.colors.primary,
        fontFamily: 'BespokeStencil-Extrabold',
        letterSpacing: 4,
        marginTop: -4,
    },
    // Menu - positioned at bottom, simple
    menuContainer: {
        position: 'absolute',
        bottom: Platform.OS === 'ios' ? 50 : 35,
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
        bottom: Platform.OS === 'ios' ? 25 : 15,
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
