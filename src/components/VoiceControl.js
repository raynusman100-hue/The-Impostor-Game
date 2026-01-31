import React, { useRef, useState } from 'react';
import { View, StyleSheet, Text, Platform, Animated, PanResponder, Dimensions, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../utils/ThemeContext';
import { useVoiceChat } from '../utils/VoiceChatContext';
import { playHaptic } from '../utils/haptics';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const BUTTON_SIZE = 48;

// ... existing imports

export default function VoiceControl() {
    const { theme } = useTheme();
    const { isJoined, isMuted, toggleMute, error } = useVoiceChat();
    const styles = getStyles(theme);

    // Draggable state
    const [isDragging, setIsDragging] = useState(false);
    const pan = useRef(new Animated.ValueXY({ x: SCREEN_WIDTH - 80, y: SCREEN_HEIGHT / 2 })).current;

    // PanResponder for dragging
    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => false,
            onMoveShouldSetPanResponder: (_, gestureState) => {
                return Math.abs(gestureState.dx) > 5 || Math.abs(gestureState.dy) > 5;
            },
            onPanResponderGrant: () => {
                setIsDragging(true);
                playHaptic('light');
                pan.setOffset({
                    x: pan.x._value,
                    y: pan.y._value,
                });
                pan.setValue({ x: 0, y: 0 });
            },
            onPanResponderMove: Animated.event(
                [null, { dx: pan.x, dy: pan.y }],
                { useNativeDriver: false }
            ),
            onPanResponderRelease: () => {
                setIsDragging(false);
                pan.flattenOffset();

                // Snap to edges
                const currentX = pan.x._value;
                const currentY = pan.y._value;
                const snapX = currentX > SCREEN_WIDTH / 2 ? SCREEN_WIDTH - 80 : 20;
                const constrainedY = Math.max(80, Math.min(SCREEN_HEIGHT - 100, currentY));

                Animated.spring(pan, {
                    toValue: { x: snapX, y: constrainedY },
                    useNativeDriver: false,
                    friction: 7,
                }).start();
            },
        })
    ).current;

    const handlePress = () => {
        if (isDragging) return;

        // If in error state, show explanation
        if (error) {
            playHaptic('heavy');
            Alert.alert(
                "Voice Chat Issue",
                `We encountered a connection problem.\n\nError: ${error}\n\nThis has been automatically reported to our team.`,
                [{ text: "OK" }]
            );
            return;
        }

        playHaptic('medium');
        toggleMute();
    };

    return (
        <Animated.View
            style={[
                styles.container,
                {
                    transform: [
                        { translateX: pan.x },
                        { translateY: pan.y }
                    ]
                }
            ]}
            {...panResponder.panHandlers}
        >
            <View
                style={[
                    styles.button,
                    isMuted ? styles.mutedButton : styles.activeButton,
                    isDragging && styles.draggingButton,
                    error && styles.errorButton // Error style
                ]}
                onTouchEnd={handlePress} // Use simpler touch handler for button press
            >
                {/* Visual Background */}
                <View style={{
                    position: 'absolute',
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                    backgroundColor: error ? theme.colors.error : (isMuted ? theme.colors.error : theme.colors.primary), // Red for error
                    opacity: isDragging ? 0.4 : 0.2,
                }} />

                <Ionicons
                    name={error ? "warning" : (isMuted ? "mic-off" : "mic")} // Warning icon for error
                    size={24}
                    color={error ? theme.colors.error : (isMuted ? theme.colors.error : theme.colors.primary)}
                />

                {/* Connection Status Indicator */}
                {!isJoined && !error && (
                    <View style={styles.disconnectedDot} />
                )}

                {/* Tech Deco Lines */}
                <View style={[styles.decoLineTop, { backgroundColor: error ? theme.colors.error : theme.colors.primary }]} />
                <View style={[styles.decoLineBottom, { backgroundColor: error ? theme.colors.error : theme.colors.primary }]} />
            </View>

            {/* Status Text */}
            {!isDragging && (
                <Text style={[styles.statusText, error && { color: theme.colors.error }]}>
                    {error ? 'ERROR' : (isJoined ? (isMuted ? 'MUTED' : 'LIVE') : 'CONNECTING...')}
                </Text>
            )}
        </Animated.View>
    );
}

// ... styles

function getStyles(theme) {
    return StyleSheet.create({
        container: {
            position: 'absolute',
            width: BUTTON_SIZE,
            height: BUTTON_SIZE + 20, // Extra space for text
            alignItems: 'center',
            zIndex: 999,
        },
        button: {
            width: BUTTON_SIZE,
            height: BUTTON_SIZE,
            borderRadius: BUTTON_SIZE / 2,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 2,
            elevation: 8,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.5,
            shadowRadius: 5,
            backgroundColor: theme.colors.surface,
        },
        activeButton: {
            borderColor: theme.colors.primary,
            backgroundColor: 'rgba(255, 184, 0, 0.1)',
        },
        mutedButton: {
            borderColor: theme.colors.error,
            backgroundColor: 'rgba(255, 59, 48, 0.1)',
        },
        draggingButton: {
            elevation: 12,
            shadowOpacity: 0.7,
            shadowRadius: 8,
            transform: [{ scale: 1.1 }],
        },
        disconnectedDot: {
            position: 'absolute',
            top: 2,
            right: 2,
            width: 10,
            height: 10,
            borderRadius: 5,
            backgroundColor: '#FF9500',
            borderWidth: 2,
            borderColor: theme.colors.surface,
        },
        statusText: {
            marginTop: 4,
            fontSize: 10,
            fontWeight: 'bold',
            color: theme.colors.primary,
            letterSpacing: 1,
            textAlign: 'center',
        },
        decoLineTop: {
            position: 'absolute',
            top: -6,
            width: 4,
            height: 6,
            backgroundColor: theme.colors.text,
            borderRadius: 2,
        },
        decoLineBottom: {
            position: 'absolute',
            bottom: -6,
            width: 4,
            height: 6,
            backgroundColor: theme.colors.text,
            borderRadius: 2,
        }
    });
}
