// Kodak Cinematic Button - Simple solid color style (like SetupScreen)
import React, { useRef } from 'react';
import { TouchableOpacity, Text, StyleSheet, Animated, View } from 'react-native';
import { useTheme } from '../utils/ThemeContext';
import { playHaptic } from '../utils/haptics';

export default function KodakButton({ 
    title, 
    onPress, 
    variant = 'primary', 
    style, 
    textStyle, 
    disabled,
    icon, // Optional icon component
    size = 'medium', // 'small', 'medium', 'large'
}) {
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

    const getButtonStyle = () => {
        if (disabled) {
            return {
                backgroundColor: '#2a2a2a',
                textColor: '#555',
            };
        }

        switch (variant) {
            case 'primary':
                return {
                    backgroundColor: '#FFB800', // Kodak amber
                    textColor: '#0a0a0a',
                };
            case 'secondary':
                return {
                    backgroundColor: '#2a2a2a',
                    textColor: '#FFD54F',
                };
            case 'danger':
                return {
                    backgroundColor: '#D32F2F',
                    textColor: '#FFFFFF',
                };
            case 'success':
                return {
                    backgroundColor: '#2E7D32',
                    textColor: '#FFFFFF',
                };
            default:
                return {
                    backgroundColor: '#FFB800',
                    textColor: '#0a0a0a',
                };
        }
    };

    const getSizeStyle = () => {
        switch (size) {
            case 'small':
                return { paddingVertical: 12, paddingHorizontal: 20, fontSize: 14, letterSpacing: 2 };
            case 'large':
                return { paddingVertical: 18, paddingHorizontal: 36, fontSize: 20, letterSpacing: 4 };
            default:
                return { paddingVertical: 16, paddingHorizontal: 28, fontSize: 16, letterSpacing: 3 };
        }
    };

    const buttonStyle = getButtonStyle();
    const sizeStyle = getSizeStyle();

    const styles = StyleSheet.create({
        container: {
            alignItems: 'center',
        },
        buttonWrapper: {
            borderRadius: 30,
            overflow: 'hidden',
        },
        button: {
            backgroundColor: buttonStyle.backgroundColor,
            paddingVertical: sizeStyle.paddingVertical,
            paddingHorizontal: sizeStyle.paddingHorizontal,
            borderRadius: 30,
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'row',
            gap: 10,
        },
        text: {
            fontFamily: 'CabinetGrotesk-Black',
            fontSize: sizeStyle.fontSize,
            fontWeight: '900',
            color: buttonStyle.textColor,
            textAlign: 'center',
            letterSpacing: sizeStyle.letterSpacing,
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
                    {
                        transform: [{ scale: scaleAnim }],
                    }
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
                    {icon && icon}
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
