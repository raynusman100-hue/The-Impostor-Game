// BACKUP OF ORIGINAL BUTTON COMPONENT - Created for retrieval if needed
import React, { useRef } from 'react';
import { TouchableOpacity, Text, StyleSheet, Animated, View, Platform } from 'react-native';
import { useTheme } from '../utils/ThemeContext';
import { playHaptic } from '../utils/haptics';

export default function Button({ title, onPress, variant = 'primary', style, textStyle, disabled }) {
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
                border: theme.colors.primary,
                text: theme.colors.text,
                shadow: theme.colors.primary,
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
            tertiary: {
                bg: theme.colors.tertiary,
                border: theme.colors.background,
                text: theme.colors.background,
                shadow: theme.colors.tertiary,
            },
        };

        const variantColors = colors[variant] || colors.primary;

        // Special handling for themes that need specific contrast
        if (theme.id === 'kodak-cinema') {
            if (variant === 'primary') {
                return {
                    backgroundColor: theme.colors.primary, // Kodak amber
                    borderColor: '#000000',
                    textColor: '#000000',
                    shadowColor: theme.colors.primary,
                };
            }
            if (variant === 'secondary') {
                return {
                    backgroundColor: '#1a1a1a',
                    borderColor: theme.colors.primary,
                    textColor: theme.colors.primary,
                    shadowColor: theme.colors.primary,
                };
            }
            if (variant === 'tertiary') {
                return {
                    backgroundColor: theme.colors.surface,
                    borderColor: theme.colors.textMuted,
                    textColor: theme.colors.text,
                    shadowColor: theme.colors.surface,
                };
            }
        }

        if (theme.id === 'kodak-daylight') {
            if (variant === 'primary') {
                return {
                    backgroundColor: theme.colors.primary, // Kodak amber
                    borderColor: theme.colors.secondary,
                    textColor: theme.colors.secondary,
                    shadowColor: theme.colors.tertiary,
                };
            }
            if (variant === 'secondary') {
                return {
                    backgroundColor: theme.colors.surface,
                    borderColor: theme.colors.primary,
                    textColor: theme.colors.text,
                    shadowColor: theme.colors.primary,
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

    // Filter out any external styling that might interfere with our button design
    const cleanStyle = style ? {
        ...style,
        // Remove any external border/background styling that might conflict
        borderWidth: undefined,
        borderColor: undefined,
        borderRadius: undefined,
        backgroundColor: undefined,
    } : {};

    const styles = StyleSheet.create({
        container: {
            alignItems: 'center',
        },
        button: {
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: colors.backgroundColor,
            borderWidth: 4,
            borderColor: colors.borderColor,
            borderRadius: 40,
            minHeight: 80,
            paddingHorizontal: 24,
            paddingVertical: 16,
            // Cross-platform shadow that works consistently
            shadowColor: colors.shadowColor,
            shadowOffset: { width: 3, height: 6 },
            shadowOpacity: 1,
            shadowRadius: 0,
            elevation: 0, // Disable Android elevation, use manual shadow
        },
        // Manual shadow for Android consistency
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
            fontSize: 20,
            fontWeight: '900',
            color: colors.textColor,
            textAlign: 'center',
            textAlignVertical: 'center',
            includeFontPadding: false,
            letterSpacing: 1.5,
        },
        disabled: {
            opacity: 0.6,
        },
    });

    return (
        <View style={[styles.container, cleanStyle]}>
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
