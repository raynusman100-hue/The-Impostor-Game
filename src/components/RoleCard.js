import React, { useRef, useState, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions, PanResponder, TouchableOpacity, Image, useWindowDimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../utils/ThemeContext';

import { playHaptic } from '../utils/haptics';

const KNOB_SIZE = 60;

// Theme-Specific Cover Images - Each theme can have its own set of covers
const THEME_COVER_IMAGES = {
    // Kodak Daylight covers - new character images
    'default': [
        require('../../assets/ChatGPT Image Dec 31, 2025, 11_08_31 PM.png'),
        require('../../assets/ChatGPT Image Dec 31, 2025, 11_08_42 PM.png'),
        require('../../assets/ChatGPT Image Dec 31, 2025, 11_08_45 PM.png'),
        require('../../assets/ChatGPT Image Dec 31, 2025, 11_16_45 PM.png'),
        require('../../assets/ChatGPT Image Dec 31, 2025, 11_16_50 PM.png'),
        require('../../assets/ChatGPT Image Dec 31, 2025, 11_16_52 PM.png'),
    ],
    'kodak-daylight': [
        require('../../assets/ChatGPT Image Dec 31, 2025, 11_08_31 PM.png'),
        require('../../assets/ChatGPT Image Dec 31, 2025, 11_08_42 PM.png'),
        require('../../assets/ChatGPT Image Dec 31, 2025, 11_08_45 PM.png'),
        require('../../assets/ChatGPT Image Dec 31, 2025, 11_16_45 PM.png'),
        require('../../assets/ChatGPT Image Dec 31, 2025, 11_16_50 PM.png'),
        require('../../assets/ChatGPT Image Dec 31, 2025, 11_16_52 PM.png'),
    ],
    'kodak-cinema': [
        require('../../assets/Black1.png'),
        require('../../assets/Black2.png'),
        require('../../assets/Black3.png'),
        require('../../assets/Black4.png'),
        require('../../assets/Black5.png'),
        require('../../assets/Black6.png'),
    ],
    'retro-pop': [
        require('../../assets/Black1.png'),
        require('../../assets/Black2.png'),
        require('../../assets/Black3.png'),
        require('../../assets/Black4.png'),
        require('../../assets/Black5.png'),
        require('../../assets/Black6.png'),
    ]
};


export default function RoleCard({ player, category, hintsEnabled, onNext, language, buttonTitle = "NEXT PLAYER", disabled = false, isWifi = false }) {
    const { theme } = useTheme();
    
    // Use dynamic dimensions hook to handle orientation changes and get accurate sizes
    const { width: windowWidth, height: windowHeight } = useWindowDimensions();
    
    // Calculate card dimensions dynamically
    const CARD_WIDTH = Math.min(windowWidth * 0.9, 450);
    const CARD_HEIGHT = Math.min(windowHeight * 0.7, 600);
    const SLIDER_WIDTH = CARD_WIDTH - 60;
    const SLIDE_RANGE = SLIDER_WIDTH - KNOB_SIZE;
    
    const styles = getStyles(theme, CARD_WIDTH, CARD_HEIGHT, SLIDER_WIDTH);
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
    const slideRangeRef = useRef(SLIDE_RANGE);
    const hasPeekedRef = useRef(false);
    const lastPlayerIdRef = useRef(player?.id);
    
    // Keep refs in sync
    useEffect(() => {
        slideRangeRef.current = SLIDE_RANGE;
    }, [SLIDE_RANGE]);
    
    useEffect(() => {
        hasPeekedRef.current = hasPeeked;
    }, [hasPeeked]);

    // Reset hasPeeked and update cover ONLY when player ID changes (different player)
    // Not when other player properties update (like ready status)
    useEffect(() => {
        // Only reset if this is actually a different player
        if (lastPlayerIdRef.current !== player?.id) {
            setHasPeeked(false);
            hasPeekedRef.current = false;
            lastPlayerIdRef.current = player?.id;
            
            // Reset pan position for new player
            pan.setValue({ x: 0, y: 0 });
        }
        
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
    }, [player?.id, theme.id]);

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
            onPanResponderRelease: () => {
                pan.flattenOffset();

                // If dragged more than 60% (using ref for current value)
                if (pan.x._value > slideRangeRef.current * 0.60) {
                    if (!hasPeekedRef.current) {
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
                        style={{
                            // Same styling for all themes - center character properly
                            width: CARD_WIDTH,
                            height: CARD_HEIGHT,
                            position: 'absolute',
                            top: 0,
                            left: 0,
                        }}
                        resizeMode="cover"
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
                                style={[
                                    styles.nextBtnOuter,
                                    isWifi && styles.kodakNextBtnOuter
                                ]}
                                disabled={disabled}
                            >
                                <Text
                                    style={[
                                        styles.nextBtnText,
                                        isWifi && styles.kodakNextBtnText
                                    ]}
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
                <View style={[styles.sliderContainer, isWifi && styles.kodakSliderContainer]}>
                    <View style={styles.sliderTrack}>
                        <Text style={[styles.sliderText, isWifi && styles.kodakSliderText]}>SLIDE TO REVEAL</Text>
                    </View>

                    <Animated.View
                        style={[
                            styles.sliderKnob,
                            isWifi && styles.kodakSliderKnob,
                            { transform: [{ translateX: clampedPanX }] } // Use clamped value for visual knob
                        ]}
                        {...panResponder.panHandlers}
                    >
                        <Text style={[styles.knobIcon, isWifi && styles.kodakKnobIcon]}>➜</Text>
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

const getStyles = (theme, CARD_WIDTH, CARD_HEIGHT, SLIDER_WIDTH) => StyleSheet.create({
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
    kodakNextBtnOuter: {
        backgroundColor: '#E5A500',
        borderWidth: 2,
        borderColor: '#FFD54F',
        shadowColor: '#FFB800',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.6,
        shadowRadius: 12,
        elevation: 10,
    },
    nextBtnText: {
        fontSize: CARD_WIDTH * 0.058,
        color: theme.colors.background, // Use black background for contrast
        fontWeight: '900',
        fontFamily: theme.fonts.header,
        letterSpacing: 2.5,
        textTransform: 'uppercase',
    },
    kodakNextBtnText: {
        color: '#0a0a0a',
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
    kodakSliderContainer: {
        backgroundColor: 'rgba(26, 26, 26, 0.95)',
        borderWidth: 2,
        borderColor: '#D4A000',
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
    kodakSliderText: {
        color: '#D4A000',
        letterSpacing: 4,
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
    kodakSliderKnob: {
        backgroundColor: '#E5A500',
        borderWidth: 2,
        borderColor: '#FFD54F',
        shadowColor: '#FFB800',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.6,
        shadowRadius: 8,
        elevation: 8,
    },
    knobIcon: {
        color: theme.colors.text,
        fontSize: 24,
        fontWeight: 'bold',
    },
    kodakKnobIcon: {
        color: '#0a0a0a',
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
