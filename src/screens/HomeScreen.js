import React, { useEffect, useRef, useState, useCallback } from 'react';
import { View, Text, StyleSheet, Animated, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../utils/ThemeContext';
import { ALL_THEMES } from '../utils/themes';
import Button from '../components/Button';
import { playHaptic } from '../utils/haptics';
import { CustomAvatar } from '../utils/AvatarGenerator';

export default function HomeScreen({ navigation }) {
    const { theme, changeTheme } = useTheme();
    const styles = getStyles(theme);
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(50)).current;
    const [showMenu, setShowMenu] = useState(true);
    const [showThemeSelector, setShowThemeSelector] = useState(false);
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
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 1000,
                useNativeDriver: true,
            }),
            Animated.spring(slideAnim, {
                toValue: 0,
                friction: 6,
                tension: 40,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    const handleStartPress = () => {
        playHaptic('success');
        setShowMenu(true);
    };

    const handleThemeSelect = (themeId) => {
        playHaptic('medium');
        changeTheme(themeId);
        setShowThemeSelector(false);
    };

    return (
        <LinearGradient
            colors={theme.colors.backgroundGradient}
            style={styles.container}
        >
            <>
                <View style={styles.topRightButton}>
                    <TouchableOpacity
                        onPress={() => {
                            playHaptic('light');
                            navigation.navigate('Profile');
                        }}
                        style={styles.profileIconContainer}
                    >
                        {userProfile ? (
                            <CustomAvatar id={userProfile.avatarId} size={40} />
                        ) : (
                            <View style={[styles.placeholderAvatar, { borderColor: theme.colors.textSecondary }]}>
                                <View style={[styles.placeholderHead, { backgroundColor: theme.colors.textSecondary }]} />
                                <View style={[styles.placeholderBody, { backgroundColor: theme.colors.textSecondary }]} />
                            </View>
                        )}
                    </TouchableOpacity>
                </View>

                <Animated.View
                    style={[
                        styles.content,
                        {
                            opacity: fadeAnim,
                            transform: [{ translateY: slideAnim }]
                        }
                    ]}
                >

                    <View style={styles.titleContainer}>
                        <Text
                            style={[styles.titleMain, { color: theme.colors.tertiary }]}
                            numberOfLines={1}
                            adjustsFontSizeToFit
                            minimumFontScale={0.5}
                        >
                            IMPOSTOR
                        </Text>
                        <Text
                            style={[styles.titleMain, { color: theme.colors.tertiary }]}
                            numberOfLines={1}
                            adjustsFontSizeToFit
                            minimumFontScale={0.5}
                        >
                            GAME
                        </Text>
                    </View>

                    {/* Animated Character */}
                    <AnimatedCharacter />

                    <View style={styles.buttonContainer}>
                        {!showMenu ? (
                            <Button
                                title="START"
                                onPress={handleStartPress}
                                style={styles.mainButton}
                            />
                        ) : (
                            <>
                                <View style={styles.buttonGrid}>
                                    <View style={styles.buttonRow}>
                                        <Button
                                            title="PASS & PLAY"
                                            onPress={() => navigation.navigate('Setup')}
                                            style={styles.gridButton}
                                        />
                                        <Button
                                            title="WI-FI MODE"
                                            onPress={() => navigation.navigate('WifiModeSelector')}
                                            style={styles.gridButton}
                                        />
                                    </View>

                                    <View style={styles.buttonRow}>
                                        <Button
                                            title="  THEMES  "
                                            onPress={() => {
                                                playHaptic('light');
                                                navigation.navigate('ThemeSelector');
                                            }}
                                            variant="secondary"
                                            style={styles.gridButton}
                                        />
                                        <Button
                                            title="HOW TO PLAY"
                                            onPress={() => navigation.navigate('HowToPlay')}
                                            variant="secondary"
                                            style={styles.gridButton}
                                        />
                                    </View>
                                </View>
                            </>
                        )}
                    </View>
                </Animated.View>
            </>
        </LinearGradient >
    );
}

function AnimatedCharacter() {
    const { theme } = useTheme();
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const floatAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const breathe = Animated.sequence([
            Animated.timing(scaleAnim, { toValue: 1.05, duration: 2000, useNativeDriver: true }),
            Animated.timing(scaleAnim, { toValue: 1, duration: 2000, useNativeDriver: true }),
        ]);

        const float = Animated.sequence([
            Animated.timing(floatAnim, { toValue: -10, duration: 1500, useNativeDriver: true }),
            Animated.timing(floatAnim, { toValue: 0, duration: 1500, useNativeDriver: true }),
        ]);

        Animated.loop(Animated.parallel([breathe, float])).start();
    }, []);


    // Temporarily hidden as per user request - REMOVED
    // return null; 

    // Temporarily hidden as per user request - REMOVED
    // return null;

    if (theme.id !== 'sunset-coral' && theme.id !== 'retro-pop') return null;

    return (
        <Animated.View
            pointerEvents="none"
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                alignItems: 'center',
                justifyContent: 'center',
                marginTop: -20, // Adjusted centering
                zIndex: -1,
                transform: [
                    { scale: scaleAnim },
                    { translateY: floatAnim }
                ]
            }}
        >
            <Animated.Image
                source={theme.id === 'retro-pop' ? require('../../assets/star_character_midnight.png') : require('../../assets/star_character_final.png')}
                style={{ width: 400, height: 400, opacity: 0.9, resizeMode: 'contain' }}
            />
        </Animated.View>
    );
}

const getStyles = (theme) => StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    content: {
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
    },
    titleContainer: {
        alignItems: 'center',
        // Increased spacing to lift title up slightly
        marginBottom: 175,
        paddingHorizontal: 20,
        paddingTop: 20,
        width: '100%',
    },
    tapTo: {
        fontSize: 16,
        fontFamily: 'Teko-Medium',
        letterSpacing: 4,
        marginBottom: 20,
    },
    titleMain: {
        fontSize: 68,
        lineHeight: 72,
        fontFamily: 'Nippo-Bold',
        textTransform: 'uppercase',
        letterSpacing: 0,
        textAlign: 'center',
        marginVertical: 2,
        width: '100%',
        paddingVertical: 4,
        ...theme.textShadows.depth,
    },
    buttonContainer: {
        width: '100%',
        alignItems: 'center',
        paddingHorizontal: 12,
        // Reverted to default spacing
        marginTop: 20,
    },
    buttonGrid: {
        width: '100%',
        gap: 24,
    },
    buttonRow: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 16,
    },
    gridButton: {
        flex: 1,
        minWidth: 0,
        minHeight: 80,
        maxHeight: 80, // Ensure all buttons are exactly the same height
    },
    modeRow: {
        width: '100%',
        gap: 20,
        alignItems: 'center',
    },
    mainButton: {
        minWidth: 200,
        backgroundColor: 'transparent',
    },
    modeButton: {
        minWidth: 200,
        backgroundColor: 'transparent',
    },
    themeButton: {
        minWidth: 200,
        borderWidth: 2,
        marginTop: 8,
        borderRadius: theme.borderRadius.pill,
    },
    footer: {
        position: 'absolute',
        bottom: 32,
        fontFamily: 'Teko-Medium',
        fontSize: 14,
        letterSpacing: 2,
        opacity: 0.5,
    },
    backButton: {
        width: '100%',
        borderWidth: 2,
        marginTop: 16,
        borderRadius: theme.borderRadius.pill,
    },
    topRightButton: {
        position: 'absolute',
        top: 50,
        right: 20,
        zIndex: 10,
    },
    profileIconContainer: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255,255,255,0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
        overflow: 'hidden',
    },
    placeholderAvatar: {
        width: 40,
        height: 40,
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: 8,
    },
    placeholderHead: {
        width: 14,
        height: 14,
        borderRadius: 7,
        marginBottom: 2,
    },
    placeholderBody: {
        width: 24,
        height: 14,
        borderTopLeftRadius: 12,
        borderTopRightRadius: 12,
    },
});
