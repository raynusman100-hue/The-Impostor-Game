import React from 'react';
import { View, Text, StyleSheet, Platform, ScrollView } from 'react-native';
import { useVoiceChat } from '../utils/VoiceChatContext';
import { AGORA_APP_ID } from '../utils/constants';

export default function VoiceChatDebug() {
    const { isJoined, isMuted, remoteUsers, engineInitialized, initError, joinError } = useVoiceChat();

    return (
        <View style={styles.container}>
            <Text style={styles.title}>🎤 VOICE CHAT DEBUG</Text>
            <ScrollView style={styles.scrollView}>
                <Text style={styles.text}>Platform: {Platform.OS}</Text>
                <Text style={styles.text}>App ID: {AGORA_APP_ID?.slice(0, 8)}...{AGORA_APP_ID?.slice(-8)}</Text>
                <Text style={styles.text}>App ID Length: {AGORA_APP_ID?.length || 0}</Text>
                <Text style={[styles.text, styles.separator]}>━━━━━━━━━━━━━━━━━━━━</Text>

                <Text style={[styles.text, engineInitialized ? styles.success : styles.error]}>
                    Engine Init: {engineInitialized ? '✅ YES' : '❌ NO'}
                </Text>
                {initError && <Text style={styles.errorText}>Init Error: {initError}</Text>}

                <Text style={[styles.text, styles.separator]}>━━━━━━━━━━━━━━━━━━━━</Text>

                <Text style={[styles.text, isJoined ? styles.success : styles.warning]}>
                    Is Joined: {isJoined ? '✅ YES' : '⏳ NO'}
                </Text>
                {joinError && <Text style={styles.errorText}>Join Error: {joinError}</Text>}

                <Text style={styles.text}>Is Muted: {isMuted ? '🔇 YES' : '🔊 NO'}</Text>
                <Text style={styles.text}>Remote Users: {remoteUsers.length}</Text>

                <Text style={[styles.text, styles.separator]}>━━━━━━━━━━━━━━━━━━━━</Text>
                <Text style={styles.hint}>Check Metro logs for [TRAP] messages</Text>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        bottom: 20,
        left: 20,
        backgroundColor: 'rgba(0, 0, 0, 0.95)',
        padding: 12,
        borderRadius: 8,
        borderWidth: 2,
        borderColor: '#FFB800',
        zIndex: 9999,
        maxHeight: 300,
        minWidth: 250,
    },
    scrollView: {
        maxHeight: 250,
    },
    title: {
        color: '#FFB800',
        fontSize: 12,
        fontWeight: 'bold',
        marginBottom: 8,
    },
    text: {
        color: '#FFFFFF',
        fontSize: 10,
        marginBottom: 3,
        fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    },
    separator: {
        color: '#666',
        marginVertical: 4,
    },
    success: {
        color: '#00FF00',
        fontWeight: 'bold',
    },
    warning: {
        color: '#FFA500',
    },
    error: {
        color: '#FF0000',
        fontWeight: 'bold',
    },
    errorText: {
        color: '#FF6B6B',
        fontSize: 9,
        marginLeft: 8,
        marginBottom: 4,
    },
    hint: {
        color: '#888',
        fontSize: 9,
        fontStyle: 'italic',
        marginTop: 4,
    },
});
