import React, { useRef } from 'react';
import { TouchableOpacity, Text, StyleSheet, Animated, View, Platform } from 'react-native';
import { useTheme } from '../utils/ThemeContext';
import { playHaptic } from '../utils/haptics';

export default function FullWidthButton({ title, onPress, variant = 'secondary', style, textStyle, disabled }) {
    const { theme } = useTheme();
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const translateYAnim = useRef(new Animated.Value(0)).current;

    const handlePressIn = () => {
        Animated.parallel([
            Animated.spring(scaleAnim, {
                toValue: 0.98,
                useNativeDriver: true,
            }),
            Animated.spring(translateYAnim, {
                toValue: 2,
                useNativeDriver: true,
            })
        ]).start();
    };

    const handlePressOut = () => {
        Animated.parallel([
            Animated.spring(scaleAnim, {
                toValue: 1,
                friction: 3,
                tension: 40,
                useNativeDriver: true,
            }),
            Animated.spring(translateYAnim, {
                toValue: 0,
                friction: 3,
                tension: 40,
                useNativeDriver: true,
            })
        ]).start();
    };

    const handlePress = () => {
        if (disabled) return;
        playHaptic('medium');
        onPress && onPress();
    };

    const getButtonColors = () => {
        if (disabled) {
            return {
                backgroundColor: theme.colors.surface,
                borderColor: theme.colors.textMuted,
                textColor: theme.colors.textMuted,
                shadowColor: 'transparent',
            };
        }

        // Map variants to theme colors
        const colors = {
            primary: {
                bg: theme.colors.primary,
                border: theme.colors.text,
                text: theme.colors.background,
                shadow: theme.colors.text,
            },
            secondary: {
                bg: theme.colors.surface,
                border: theme.colors.tertiary,
                text: theme.colors.tertiary,
                shadow: theme.colors.tertiary,
            },
            error: {
                bg: theme.colors.error,
                border: theme.colors.text,
                text: theme.colors.text,
                shadow: theme.colors.text,
            },
            success: {
                bg: theme.colors.success,
                border: theme.colors.text,
                text: theme.colors.text,
                shadow: theme.colors.text,
            },
        };

        const variantColors = colors[variant] || colors.primary;

        // Special handling for Midnight theme (retro-pop id)
        if (theme.id === 'retro-pop') {
            if (variant === 'primary') {
                return {
                    backgroundColor: theme.colors.primary, // Silver
                    borderColor: '#000000',
                    textColor: '#000000',
                    shadowColor: theme.colors.primary,
                };
            }
            if (variant === 'secondary') {
                return {
                    backgroundColor: '#1a1a1a',
                    borderColor: theme.colors.tertiary, // Silver
                    textColor: theme.colors.tertiary,
                    shadowColor: theme.colors.tertiary,
                };
            }
        }

        return {
            backgroundColor: variantColors.bg,
            borderColor: variantColors.border,
            textColor: variantColors.text,
            shadowColor: variantColors.shadow,
        };
    };

    const colors = getButtonColors();

    const styles = StyleSheet.create({
        container: {
            width: '100%',
            paddingHorizontal: 8, // Only 8px from screen edges
        },
        button: {
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: colors.backgroundColor,
            borderWidth: 4,
            borderColor: colors.borderColor,
            borderRadius: 40,
            height: 70,
            paddingHorizontal: 20,
            paddingVertical: 12,
            width: '100%',
            // Cross-platform shadow
            shadowColor: colors.shadowColor,
            shadowOffset: { width: 3, height: 6 },
            shadowOpacity: 1,
            shadowRadius: 0,
            elevation: 0,
        },
        // Manual shadow for consistent cross-platform appearance
        androidShadow: {
            position: 'absolute',
            top: 6,
            left: 3,
            right: -3,
            bottom: -6,
            backgroundColor: colors.shadowColor,
            borderRadius: 40,
            zIndex: -1,
        },
        text: {
            fontFamily: 'CabinetGrotesk-Black',
            fontSize: 18,
            fontWeight: '900',
            color: colors.textColor,
            lineHeight: 22,
            textAlign: 'center',
            textAlignVertical: 'center',
            includeFontPadding: false,
            paddingTop: 2,
            letterSpacing: 1,
        },
        disabled: {
            opacity: 0.6,
        },
    });

    return (
        <View style={[styles.container, style]}>
            <Animated.View
                style={[
                    {
                        transform: [
                            { scale: scaleAnim },
                            { translateY: translateYAnim }
                        ]
                    }
                ]}
            >
                {/* Manual shadow for consistent cross-platform appearance */}
                <View style={[styles.androidShadow, { backgroundColor: colors.shadowColor }]} />

                <TouchableOpacity
                    onPressIn={handlePressIn}
                    onPressOut={handlePressOut}
                    onPress={handlePress}
                    activeOpacity={1}
                    disabled={disabled}
                    style={[styles.button, disabled && styles.disabled]}
                >
                    <Text
                        style={[styles.text, textStyle]}
                        numberOfLines={1}
                        adjustsFontSizeToFit
                        minimumFontScale={0.8}
                    >
                        {title}
                    </Text>
                </TouchableOpacity>
            </Animated.View>
        </View>
    );
}