import React, { useRef, useState, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions, PanResponder, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../utils/ThemeContext';
import Button from './Button';

import { playHaptic } from '../utils/haptics';

const { width, height } = Dimensions.get('window');
// Scale card size responsively - use more screen space on larger devices
const CARD_WIDTH = Math.min(width * 0.9, 450); // Up to 90% width, max 450px
const CARD_HEIGHT = Math.min(height * 0.7, 600); // Up to 70% height, max 600px
const SLIDER_WIDTH = CARD_WIDTH - 60;
const KNOB_SIZE = 60;
const SLIDE_RANGE = SLIDER_WIDTH - KNOB_SIZE;

// Theme-Specific Cover Images - Each theme can have its own set of covers
const THEME_COVER_IMAGES = {
    // Default covers for all themes
    'default': [
        require('../../assets/cover_angry.png'),
        require('../../assets/cover_smile.png'),
        require('../../assets/cover_happy.png'),
        require('../../assets/cover_bronze.png'),
        require('../../assets/cover_final.png'),
        require('../../assets/cover_with_star.png'),
    ],
    'retro-pop': [
        require('../../assets/cover_midnight_1.png'),
        require('../../assets/cover_midnight_2.png'),
        require('../../assets/cover_midnight_3.png'),
        require('../../assets/cover_midnight_4.png'),
        require('../../assets/cover_midnight_5.png'),
        require('../../assets/assetscover_dark_vampire.png'),
        require('../../assets/assetscover_dark_artist.png'),
        require('../../assets/assetscover_dark_soldier..png'),
        require('../../assets/assetscover_dark_meditation.png'),
    ]
};


export default function RoleCard({ player, category, hintsEnabled, onNext, language, buttonTitle = "NEXT PLAYER", disabled = false }) {
    const { theme } = useTheme();
    const styles = getStyles(theme);
    const [hasPeeked, setHasPeeked] = useState(false);
    const [showOriginal, setShowOriginal] = useState(false);

    // Get the appropriate cover images for the current theme
    const currentThemeCovers = THEME_COVER_IMAGES[theme.id] || THEME_COVER_IMAGES['default'];

    // Use player.coverIndex if provided for sequential/non-repeating covers
    const [coverIndex, setCoverIndex] = useState(() => {
        if (player.coverIndex !== undefined) {
            return player.coverIndex % currentThemeCovers.length;
        }
        return Math.floor(Math.random() * currentThemeCovers.length);
    });

    const pan = useRef(new Animated.ValueXY()).current;

    // Reset hasPeeked and update cover when player or theme changes
    useEffect(() => {
        setHasPeeked(false);
        const covers = THEME_COVER_IMAGES[theme.id] || THEME_COVER_IMAGES['default'];

        if (player.coverIndex !== undefined) {
            // Priority: Use the assigned sequence index
            setCoverIndex(player.coverIndex % covers.length);
        } else if (covers.length > 1) {
            // Fallback: Randomize but ensure it's different (shuffle effect)
            let newIndex;
            do {
                newIndex = Math.floor(Math.random() * covers.length);
            } while (newIndex === coverIndex);
            setCoverIndex(newIndex);
        } else {
            setCoverIndex(0);
        }

        // Reset pan position as well
        pan.setValue({ x: 0, y: 0 });
    }, [player, theme.id]);

    // Clamped pan.x for visual movement of the knob and cover
    const clampedPanX = pan.x.interpolate({
        inputRange: [0, SLIDE_RANGE],
        outputRange: [0, SLIDE_RANGE],
        extrapolate: 'clamp',
    });

    // Cover moves with knob
    // We want the cover to move fully away when knob moves fully
    const coverTranslateX = clampedPanX.interpolate({
        inputRange: [0, SLIDE_RANGE],
        outputRange: [0, CARD_WIDTH * 1.2], // Move enough to reveal
        extrapolate: 'clamp',
    });

    // Button disappears only when cover is at least 25% open
    const nextButtonOpacity = clampedPanX.interpolate({
        inputRange: [0, SLIDE_RANGE * 0.25],
        outputRange: [1, 0],
        extrapolate: 'clamp',
    });

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: () => true,
            onPanResponderGrant: () => {
                pan.setOffset({
                    x: pan.x._value,
                    y: 0
                });
            },
            onPanResponderMove: Animated.event(
                [null, { dx: pan.x }],
                { useNativeDriver: false }
            ),
            onPanResponderRelease: (_, gestureState) => {
                pan.flattenOffset();

                // If dragged more than 60% (using raw pan.x value for threshold check)
                if (pan.x._value > SLIDE_RANGE * 0.60) {
                    if (!hasPeeked) {
                        playHaptic('heavy'); // Strong feedback on unlock
                        setHasPeeked(true);
                    }
                }

                // ALWAYS Snap back (Shoot back into place)
                Animated.spring(pan, {
                    toValue: { x: 0, y: 0 },
                    speed: 20, // Fast snap
                    bounciness: 10,
                    useNativeDriver: false
                }).start();
            }
        })
    ).current;

    const roleColor = player.role === 'Impostor' ? theme.colors.error : theme.colors.primary;



    const toggleLanguage = () => {
        playHaptic('light');
        setShowOriginal(!showOriginal);
    }

    // Determine what word/hint to show

    const displayWord = showOriginal ? player.originalWord : player.word;
    const displayHint = showOriginal ? player.originalHint : player.hint;

    return (
        <View style={styles.wrapper}>
            <View style={styles.cardContainer}>
                {/* BACK LAYER - The Info */}
                <View style={[styles.cardBackLayer, { borderColor: roleColor }]}>
                    <Text style={[styles.roleTitle, { color: roleColor }]}>
                        {player.role.toUpperCase()}
                    </Text>

                    <View style={styles.infoContainer}>
                        {player.role === 'Citizen' ? (
                            <>
                                <Text style={styles.label}>SECRET WORD</Text>
                                <Text
                                    style={styles.secretWord}
                                    numberOfLines={displayWord.includes(' ') ? 2 : 1}
                                    adjustsFontSizeToFit={true}
                                    minimumFontScale={0.3}
                                    textBreakStrategy="simple"
                                >
                                    {displayWord}
                                </Text>

                                {hintsEnabled && (
                                    <Text style={styles.hintText}>HINT: {displayHint}</Text>
                                )}
                            </>
                        ) : (
                            <>
                                <View style={styles.imposterContainer}>
                                    <Text style={[styles.imposterLabel, { color: theme.colors.error }]}>
                                        YOU ARE THE IMPOSTOR
                                    </Text>
                                    {hintsEnabled && category && (
                                        <Text style={styles.hintText}>CATEGORY: {category.toUpperCase()}</Text>
                                    )}
                                </View>
                            </>
                        )}
                    </View>
                </View>

                {/* FRONT LAYER - The Cover (Moves linked to Slider) */}
                <Animated.View
                    style={[
                        styles.cardFrontLayer,
                        { transform: [{ translateX: coverTranslateX }] }
                    ]}
                >
                    {/* Cover Image */}
                    <Image
                        source={currentThemeCovers[coverIndex]}
                        style={theme.id === 'retro-pop' ? {
                            width: '100%',
                            height: '100%',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                        } : {
                            width: CARD_WIDTH * 1.15,
                            height: CARD_HEIGHT * 1.15,
                            position: 'absolute',
                            top: -45,
                            left: -(CARD_WIDTH * 0.075),
                        }}
                        resizeMode={theme.id === 'retro-pop' ? "contain" : "cover"}
                    />

                    <View style={styles.coverHeader}>
                        <Text
                            style={styles.playerName}
                            numberOfLines={1}
                            adjustsFontSizeToFit
                        >
                            {player.name}
                        </Text>
                    </View>

                    {/* Next Player Button - Positioned below avatar area */}
                    {hasPeeked && (
                        <Animated.View style={[styles.nextButtonContainer, { opacity: nextButtonOpacity }]}>
                            <TouchableOpacity
                                onPress={() => {
                                    playHaptic('medium');
                                    onNext();
                                }}
                                activeOpacity={0.8}
                                style={styles.nextBtnOuter}
                                disabled={disabled}
                            >
                                <Text
                                    style={styles.nextBtnText}
                                    numberOfLines={1}
                                    adjustsFontSizeToFit
                                    minimumFontScale={0.7}
                                >
                                    {buttonTitle}
                                </Text>
                            </TouchableOpacity>
                        </Animated.View>
                    )}

                </Animated.View>

                {/* STATIONARY SLIDER BAR - Placed on top of everything but fixed position */}
                <View style={styles.sliderContainer}>
                    <View style={styles.sliderTrack}>
                        <Text style={styles.sliderText}>SLIDE TO REVEAL</Text>
                    </View>

                    <Animated.View
                        style={[
                            styles.sliderKnob,
                            { transform: [{ translateX: clampedPanX }] } // Use clamped value for visual knob
                        ]}
                        {...panResponder.panHandlers}
                    >
                        <Text style={styles.knobIcon}>➜</Text>
                    </Animated.View>
                </View>

                {/* Globe Icon - STATICALLY POSITIONED ON TOP OF EVERYTHING */}
                {onNext && language !== 'en' && (
                    <TouchableOpacity onPress={toggleLanguage} style={styles.globeIconContainer}>
                        <Ionicons name="globe-outline" size={32} color={theme.colors.primary} />
                    </TouchableOpacity>
                )}

            </View>
        </View>
    );
}

const getStyles = (theme) => StyleSheet.create({
    wrapper: {
        alignItems: 'center',
        padding: theme.spacing.m,
    },
    cardContainer: {
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
        borderRadius: theme.borderRadius.xl,
        backgroundColor: theme.colors.background,
        overflow: 'hidden',
        position: 'relative',
        borderWidth: 1,
        borderColor: theme.colors.textSecondary,
    },
    cardFrontLayer: {
        ...StyleSheet.absoluteFillObject,
        alignItems: 'center',
        zIndex: 10,
        overflow: 'hidden',
        borderRadius: theme.borderRadius.xl,
        backgroundColor: theme.colors.background, // Fallback
    },
    coverHeader: {
        marginTop: theme.spacing.l,
        marginBottom: theme.spacing.m,
        alignItems: 'center',
    },
    playerName: {
        fontSize: CARD_WIDTH * 0.095,
        color: theme.colors.tertiary, // Use silver tertiary
        fontFamily: theme.fonts.header,
        letterSpacing: 2,
        textTransform: 'uppercase',
        paddingHorizontal: theme.spacing.m,
    },
    // Avatar placeholder - central space for future avatars
    // Instruction text when not peeked
    instructionContainer: {
        position: 'absolute',
        bottom: 110,
        alignItems: 'center',
        width: '100%',
    },
    tapText: {
        color: '#FFFFFF',
        fontSize: CARD_WIDTH * 0.065, // Scaled (roughly 26-29px)
        fontFamily: theme.fonts.header,
        letterSpacing: 2,
        textAlign: 'center',
        width: '100%',
    },
    subText: {
        color: 'rgba(255, 255, 255, 0.7)',
        fontSize: 24,
        marginTop: theme.spacing.xs,
        textAlign: 'center',
    },
    // Next Player Button - Redesigned
    nextButtonContainer: {
        position: 'absolute',
        bottom: 100,
        width: '100%',
        alignItems: 'center',
        paddingHorizontal: theme.spacing.xl,
    },
    nextBtnOuter: {
        width: '80%',
        maxWidth: 300,
        paddingVertical: theme.spacing.m,
        paddingHorizontal: theme.spacing.l,
        backgroundColor: theme.colors.primary, // Use silver primary
        borderRadius: theme.borderRadius.pill,
        justifyContent: 'center',
        alignItems: 'center',
    },
    nextBtnText: {
        fontSize: CARD_WIDTH * 0.058,
        color: theme.colors.background, // Use black background for contrast
        fontWeight: '900',
        fontFamily: theme.fonts.header,
        letterSpacing: 2.5,
        textTransform: 'uppercase',
    },
    // Back Layer
    cardBackLayer: {
        flex: 1,
        backgroundColor: theme.colors.surface,
        alignItems: 'center',
        justifyContent: 'flex-start',
        padding: theme.spacing.xl,
    },
    roleTitle: {
        fontSize: 48,
        fontFamily: theme.fonts.header,
        letterSpacing: 4,
        marginTop: theme.spacing.xl,
        textAlign: 'center',
        marginBottom: theme.spacing.xl,
    },
    infoContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        flex: 1,
        width: '100%',
    },
    label: {
        color: theme.colors.textSecondary,
        fontSize: theme.fontSize.medium,
        fontFamily: theme.fonts.medium,
        letterSpacing: 2,
        marginBottom: theme.spacing.s,
    },
    secretWord: {
        color: theme.colors.text,
        fontSize: 56, // Slightly reduced base size
        fontFamily: theme.fonts.header,
        textAlign: 'center',
        letterSpacing: 2,
        marginBottom: theme.spacing.m,
        paddingHorizontal: 20, // Prevent edge touching
    },
    imposterContainer: {
        alignItems: 'center',
    },
    imposterLabel: {
        fontSize: 32,
        fontFamily: theme.fonts.header,
        letterSpacing: 2,
        marginBottom: theme.spacing.l,
        textAlign: 'center',
    },
    hintText: {
        color: theme.colors.textMuted,
        fontSize: theme.fontSize.medium,
        fontFamily: theme.fonts.medium,
        fontStyle: 'italic',
        textAlign: 'center',
    },
    // Slider Styles
    sliderContainer: {
        position: 'absolute',
        bottom: 20,
        left: (CARD_WIDTH - SLIDER_WIDTH) / 2, // Centered
        width: SLIDER_WIDTH,
        height: 70,
        borderRadius: 35,
        backgroundColor: theme.colors.surface,
        justifyContent: 'center',
        padding: 5,
        borderWidth: 1,
        borderColor: theme.colors.textSecondary,
        zIndex: 20, // Above Front Layer
    },
    sliderTrack: {
        ...StyleSheet.absoluteFillObject,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1,
    },
    sliderText: {
        color: theme.colors.textMuted,
        fontFamily: theme.fonts.medium,
        letterSpacing: 3,
        paddingLeft: 40,
    },
    sliderKnob: {
        width: KNOB_SIZE,
        height: KNOB_SIZE,
        borderRadius: KNOB_SIZE / 2,
        backgroundColor: theme.colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2,
        position: 'absolute',
        top: 4,
        left: 4,
    },
    knobIcon: {
        color: theme.colors.text,
        fontSize: 24,
        fontWeight: 'bold',
    },
    globeIconContainer: {
        position: 'absolute',
        top: 20,
        right: 20,
        backgroundColor: theme.colors.surface,
        padding: 8,
        borderRadius: 20, // Circle
        borderWidth: 1,
        borderColor: theme.colors.primary,
        elevation: 3,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        zIndex: 10,
    },
    globeIcon: {
        fontSize: 32, // Larger
        textAlign: 'center',
        color: theme.colors.primary, // Brown color
    },
});
