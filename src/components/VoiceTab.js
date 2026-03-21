import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useTheme } from '../utils/ThemeContext';
import { useVoiceChat } from '../utils/VoiceChatContext';
import { playHaptic } from '../utils/haptics';
import VoiceControl from './VoiceControl';
import PremiumRequiredMessage from './PremiumRequiredMessage';
import { CustomAvatar } from '../utils/AvatarGenerator';
import { CustomBuiltAvatar } from '../components/CustomAvatarBuilder';

/**
 * VoiceTab Component
 * 
 * Conditionally renders voice controls or premium message based on host premium status.
 * Handles premium status checking, error states, and real-time updates.
 * 
 * @param {Object} props
 * @param {string} props.roomCode - The room code for voice chat
 * @param {string} props.playerId - Current player's ID
 * @param {string} props.playerName - Current player's name (for non-host)
 * @param {Array} props.voiceParticipants - List of voice chat participants
 * @param {boolean} props.isHost - Whether current user is the host
 * @param {Function} props.onPremiumRequired - Callback when premium upgrade is needed
 * @param {'host'|'lobby'|'discussion'} props.context - Context for different messaging
 * @param {string} props.stampedAppId - Agora app ID for this room (optional)
 */
export default function VoiceTab({ 
    roomCode, 
    playerId, 
    playerName,
    voiceParticipants = [],
    isHost = false,
    onPremiumRequired,
    context = 'lobby',
    stampedAppId
}) {
    const { theme } = useTheme();
    const styles = getStyles(theme);
    
    const { 
        isJoined, 
        joinChannel, 
        leaveChannel, 
        hostHasPremium, 
        premiumStatusLoading,
        setRoomCodeForPremiumMonitoring,
        error
    } = useVoiceChat();

    // Set up premium monitoring for this room
    useEffect(() => {
        if (roomCode) {
            console.log('🎤 [VoiceTab] Setting up premium monitoring for room:', roomCode);
            setRoomCodeForPremiumMonitoring(roomCode);
        }
        
        return () => {
            // Don't clear monitoring here as other components might need it
            // The context will handle cleanup when appropriate
        };
    }, [roomCode, setRoomCodeForPremiumMonitoring]);

    // Handle voice chat join with premium check and error handling
    const handleJoinVoice = async () => {
        try {
            playHaptic('heavy');
            console.log('🎤 [VoiceTab] Attempting to join voice chat for room:', roomCode);
            
            if (stampedAppId) {
                console.log('🎤 [VoiceTab] Using stamped App ID:', stampedAppId);
                await joinChannel(roomCode, 0, roomCode, stampedAppId);
            } else {
                await joinChannel(roomCode, 0, roomCode);
            }
        } catch (err) {
            console.error('🎤 [VoiceTab] Join voice error:', err);
            
            if (err.code === 'PREMIUM_REQUIRED') {
                // Premium error is expected and handled by showing premium message
                console.log('🎤 [VoiceTab] Premium required - this is expected behavior');
            } else {
                // Unexpected error - show user-friendly message
                playHaptic('error');
                // The VoiceControl component will show the error state
            }
        }
    };

    const handleLeaveVoice = () => {
        playHaptic('medium');
        leaveChannel();
    };

    // Show loading state while checking premium status
    if (premiumStatusLoading) {
        return (
            <View style={styles.container}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
                <Text style={styles.loadingText}>Checking voice chat availability...</Text>
            </View>
        );
    }

    // Show premium required message if host doesn't have premium
    if (!hostHasPremium) {
        return (
            <View style={styles.container}>
                <PremiumRequiredMessage
                    isHost={isHost}
                    onUpgrade={onPremiumRequired}
                    type={context}
                    style={styles.premiumMessage}
                />
            </View>
        );
    }

    // Show voice controls when host has premium
    return (
        <View style={styles.container}>
            {!isJoined ? (
                <>
                    <Text style={styles.voiceInstructions}>
                        VOICE CHAT
                    </Text>
                    {voiceParticipants.length > 0 ? (
                        <Text style={styles.voiceSubInstructions}>
                            {voiceParticipants.length} {voiceParticipants.length === 1 ? 'MEMBER' : 'MEMBERS'} IN CALL
                        </Text>
                    ) : (
                        <Text style={styles.voiceSubInstructions}>
                            No one in voice chat yet
                        </Text>
                    )}
                    <TouchableOpacity
                        style={styles.joinVoiceBtn}
                        onPress={handleJoinVoice}
                        disabled={premiumStatusLoading}
                    >
                        <View style={styles.joinVoiceInner}>
                            <Text
                                style={styles.joinVoiceText}
                                numberOfLines={1}
                                adjustsFontSizeToFit
                            >
                                JOIN CALL
                            </Text>
                        </View>
                    </TouchableOpacity>
                </>
            ) : (
                <>
                    <Text style={styles.voiceInstructions}>
                        IN VOICE CHAT
                    </Text>

                    {/* Participants List */}
                    <View style={styles.voiceParticipantsList}>
                        {voiceParticipants.map((participant) => (
                            <View key={participant.id} style={styles.voiceParticipantRow}>
                                {participant.customAvatarConfig ? (
                                    <CustomBuiltAvatar config={participant.customAvatarConfig} size={32} />
                                ) : (
                                    <CustomAvatar id={participant.avatarId || 1} size={32} />
                                )}
                                <Text style={styles.voiceParticipantName} numberOfLines={1}>
                                    {participant.id === playerId ? 'You' : participant.name}
                                </Text>
                            </View>
                        ))}
                    </View>

                    {/* Show floating voice control for mute/unmute */}
                    <VoiceControl />

                    {/* Additional instructions for non-host users */}
                    {!isHost && (
                        <Text style={[styles.voiceSubInstructions, { marginTop: 20, color: theme.colors.tertiary }]}>
                            Use the floating mic button to mute/unmute
                        </Text>
                    )}

                    <TouchableOpacity
                        style={styles.leaveVoiceBtn}
                        onPress={handleLeaveVoice}
                    >
                        <Text
                            style={styles.leaveVoiceText}
                            numberOfLines={1}
                            adjustsFontSizeToFit
                        >
                            LEAVE CALL
                        </Text>
                    </TouchableOpacity>
                </>
            )}

            {/* Show error state if there's a voice chat error */}
            {error && (
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>
                        Voice chat temporarily unavailable
                    </Text>
                </View>
            )}
        </View>
    );
}

function getStyles(theme) {
    return StyleSheet.create({
        container: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            width: '100%',
            paddingHorizontal: 20,
        },
        loadingText: {
            fontSize: 14,
            fontFamily: theme.fonts.medium,
            color: theme.colors.textMuted,
            marginTop: 12,
            textAlign: 'center',
        },
        premiumMessage: {
            width: '100%',
            maxWidth: 400,
        },
        voiceInstructions: {
            fontSize: 24,
            fontFamily: theme.fonts.header,
            color: theme.colors.primary,
            letterSpacing: 2,
            marginBottom: 10,
            textAlign: 'center',
            ...theme.textShadows.glow,
        },
        voiceSubInstructions: {
            fontSize: 14,
            fontFamily: theme.fonts.medium,
            color: theme.colors.tertiary,
            letterSpacing: 1,
            textAlign: 'center',
            opacity: 0.8,
            marginBottom: 30,
        },
        voiceParticipantsList: {
            width: '100%',
            maxWidth: 300,
            marginVertical: 20,
            gap: 12,
        },
        voiceParticipantRow: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
            paddingVertical: 8,
            paddingHorizontal: 16,
            borderRadius: 12,
            backgroundColor: theme.colors.surface,
            borderWidth: 1,
            borderColor: theme.colors.primary + '30',
        },
        voiceParticipantName: {
            fontSize: 14,
            fontFamily: theme.fonts.medium,
            color: theme.colors.text,
            flex: 1,
        },
        joinVoiceBtn: {
            width: 120,
            height: 120,
            borderRadius: 60,
            backgroundColor: theme.colors.primary,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 4,
            borderColor: theme.colors.secondary,
            ...theme.shadows.heavy,
        },
        joinVoiceInner: {
            alignItems: 'center',
            justifyContent: 'center',
        },
        joinVoiceText: {
            fontSize: 14,
            fontFamily: theme.fonts.bold,
            color: theme.colors.secondary,
            letterSpacing: 2,
            textAlign: 'center',
        },
        leaveVoiceBtn: {
            backgroundColor: theme.colors.error,
            paddingHorizontal: 24,
            paddingVertical: 12,
            borderRadius: 20,
            marginTop: 20,
            borderWidth: 2,
            borderColor: theme.colors.secondary,
            ...theme.shadows.soft,
        },
        leaveVoiceText: {
            fontSize: 12,
            fontFamily: theme.fonts.bold,
            color: theme.colors.secondary,
            letterSpacing: 2,
        },
        errorContainer: {
            position: 'absolute',
            bottom: 20,
            left: 20,
            right: 20,
            backgroundColor: theme.colors.error + '20',
            borderRadius: 12,
            padding: 12,
            borderWidth: 1,
            borderColor: theme.colors.error + '40',
        },
        errorText: {
            fontSize: 12,
            fontFamily: theme.fonts.medium,
            color: theme.colors.error,
            textAlign: 'center',
        },
    });
}