// Simple solid button - no shadows, no gradients (like SetupScreen ACTION! button)
import React, { useRef } from 'react';
import { TouchableOpacity, Text, StyleSheet, Animated, View } from 'react-native';
import { useTheme } from '../utils/ThemeContext';
import { playHaptic } from '../utils/haptics';

export default function Button({ title, onPress, variant = 'primary', style, textStyle, disabled }) {
    const { theme } = useTheme();
    const scaleAnim = useRef(new Animated.Value(1)).current;

    const handlePressIn = () => {
        Animated.spring(scaleAnim, {
            toValue: 0.96,
            friction: 8,
            useNativeDriver: true,
        }).start();
    };

    const handlePressOut = () => {
        Animated.spring(scaleAnim, {
            toValue: 1,
            friction: 4,
            tension: 50,
            useNativeDriver: true,
        }).start();
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
                textColor: theme.colors.textMuted,
            };
        }

        switch (variant) {
            case 'primary':
                return {
                    backgroundColor: theme.colors.primary,
                    textColor: theme.colors.secondary,
                };
            case 'secondary':
                return {
                    backgroundColor: theme.colors.surface,
                    textColor: theme.colors.primary,
                };
            case 'error':
                return {
                    backgroundColor: theme.colors.error,
                    textColor: theme.colors.text,
                };
            case 'success':
                return {
                    backgroundColor: theme.colors.success,
                    textColor: theme.colors.text,
                };
            case 'tertiary':
                return {
                    backgroundColor: theme.colors.surface,
                    textColor: theme.colors.textSecondary,
                };
            default:
                return {
                    backgroundColor: theme.colors.primary,
                    textColor: theme.colors.secondary,
                };
        }
    };

    const colors = getButtonColors();

    const styles = StyleSheet.create({
        container: {
            alignItems: 'center',
        },
        buttonWrapper: {
            borderRadius: 30,
            overflow: 'hidden',
        },
        button: {
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: colors.backgroundColor,
            borderRadius: 30,
            minHeight: 60,
            paddingHorizontal: 24,
            paddingVertical: 16,
        },
        text: {
            fontFamily: 'CabinetGrotesk-Black',
            fontSize: 18,
            fontWeight: '900',
            color: colors.textColor,
            textAlign: 'center',
            letterSpacing: 2,
            textTransform: 'uppercase',
        },
        disabled: {
            opacity: 0.5,
        },
    });

    return (
        <View style={[styles.container, style]}>
            <Animated.View
                style={[
                    styles.buttonWrapper,
                    { transform: [{ scale: scaleAnim }] }
                ]}
            >
                <TouchableOpacity
                    onPressIn={handlePressIn}
                    onPressOut={handlePressOut}
                    onPress={handlePress}
                    activeOpacity={0.8}
                    disabled={disabled}
                    style={[styles.button, disabled && styles.disabled]}
                >
                    <Text
                        style={[styles.text, textStyle]}
                        numberOfLines={1}
                        adjustsFontSizeToFit
                        minimumFontScale={0.7}
                    >
                        {title}
                    </Text>
                </TouchableOpacity>
            </Animated.View>
        </View>
    );
}
