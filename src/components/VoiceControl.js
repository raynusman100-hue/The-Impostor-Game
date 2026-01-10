import React from 'react';
import { View, TouchableOpacity, StyleSheet, Text, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../utils/ThemeContext';
import { useVoiceChat } from '../utils/VoiceChatContext';
import { playHaptic } from '../utils/haptics';

export default function VoiceControl() {
    const { theme } = useTheme();
    const { isJoined, isMuted, toggleMute } = useVoiceChat();
    const styles = getStyles(theme);

    if (!isJoined) return null;

    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={[
                    styles.button,
                    isMuted ? styles.mutedButton : styles.activeButton
                ]}
                onPress={() => {
                    playHaptic('medium');
                    toggleMute();
                }}
                activeOpacity={0.8}
            >
                {/* Visual Background for contrast */}
                <View style={{
                    position: 'absolute',
                    width: 36,
                    height: 36,
                    borderRadius: 18,
                    backgroundColor: isMuted ? theme.colors.error : theme.colors.primary,
                    opacity: 0.2,
                }} />

                <Ionicons
                    name={isMuted ? "mic-off" : "mic"}
                    size={24}
                    color={isMuted ? theme.colors.error : theme.colors.primary}
                />

                {/* Tech Deco Lines */}
                <View style={styles.decoLineTop} />
                <View style={styles.decoLineBottom} />
            </TouchableOpacity>
        </View>
    );
}

const getStyles = (theme) => StyleSheet.create({
    container: {
        position: 'absolute',
        top: Platform.OS === 'ios' ? 50 : 35, // Align with typical header area
        left: '50%',
        marginLeft: -24, // Center the 48px button
        zIndex: 999, // Ensure it's on top of everything
    },
    button: {
        width: 48,
        height: 48,
        borderRadius: 24,
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
        backgroundColor: 'rgba(255, 184, 0, 0.1)', // Subtle tint
    },
    mutedButton: {
        borderColor: theme.colors.error,
        backgroundColor: 'rgba(255, 59, 48, 0.1)',
    },
    // Extra visual for "Cinematic" feel
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
