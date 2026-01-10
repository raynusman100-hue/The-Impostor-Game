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
                <Ionicons
                    name={isMuted ? "mic-off" : "mic"}
                    size={20}
                    color={isMuted ? theme.colors.text : "#000"}
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
        top: Platform.OS === 'ios' ? 60 : 40,
        left: '50%',
        marginLeft: -22, // Center the 44px button
        zIndex: 100,
    },
    button: {
        width: 44,
        height: 44,
        borderRadius: 22,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        elevation: 5,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
    },
    activeButton: {
        backgroundColor: theme.colors.primary, // Kodak Yellow
        borderColor: theme.colors.primary,
    },
    mutedButton: {
        backgroundColor: theme.colors.error, // Red
        borderColor: theme.colors.error,
    },
    decoLineTop: {
        position: 'absolute',
        top: -4,
        width: 2,
        height: 4,
        backgroundColor: theme.colors.text,
    },
    decoLineBottom: {
        position: 'absolute',
        bottom: -4,
        width: 2,
        height: 4,
        backgroundColor: theme.colors.text,
    }
});
