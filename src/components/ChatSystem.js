import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, ActivityIndicator, Alert, Platform } from 'react-native';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system/legacy';
import { ref, push, onValue, off, set } from 'firebase/database';
import { database } from '../utils/firebase';
import { useTheme } from '../utils/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { playHaptic } from '../utils/haptics';

export default function ChatSystem({ roomCode, playerId, playerName, onUnreadChange }) {
    const { theme } = useTheme();
    const styles = getStyles(theme);

    const [messages, setMessages] = useState([]);
    const [inputText, setInputText] = useState('');
    const [isRecording, setIsRecording] = useState(false);
    const [recording, setRecording] = useState(null);
    const [isSending, setIsSending] = useState(false);
    const [lastReadTimestamp, setLastReadTimestamp] = useState(Date.now());
    const [isActive, setIsActive] = useState(true); // Track if chat is currently active

    // Audio Player State
    const [sound, setSound] = useState(null);
    const [playingMsgId, setPlayingMsgId] = useState(null);

    const flatListRef = useRef(null);
    const lastMessageCountRef = useRef(0);

    useEffect(() => {
        const chatRef = ref(database, `rooms/${roomCode}/chat`);
        const unsubscribe = onValue(chatRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const msgList = Object.entries(data).map(([id, val]) => ({
                    id,
                    ...val
                }));
                // Sort by timestamp
                msgList.sort((a, b) => a.timestamp - b.timestamp);
                setMessages(msgList);

                // ENHANCED: Calculate unread messages more reliably
                const currentMessageCount = msgList.length;
                const newMessages = msgList.filter(msg => 
                    msg.senderId !== playerId && 
                    msg.timestamp > lastReadTimestamp
                );

                console.log(`Chat: ${newMessages.length} unread messages for ${playerId}`);

                // Only count as unread if chat is not currently active
                const unreadCount = isActive ? 0 : newMessages.length;

                // Notify parent component about unread messages
                if (onUnreadChange) {
                    onUnreadChange(unreadCount);
                }

                lastMessageCountRef.current = currentMessageCount;
            } else {
                setMessages([]);
                if (onUnreadChange) {
                    onUnreadChange(0);
                }
            }
        });

        // Request permissions on mount
        Audio.requestPermissionsAsync();

        return () => {
            off(chatRef);
            if (sound) {
                sound.unloadAsync();
            }
        };
    }, [roomCode, playerId, lastReadTimestamp, onUnreadChange, isActive]);

    // Mark messages as read when chat becomes active
    useEffect(() => {
        if (isActive) {
            setLastReadTimestamp(Date.now());
            if (onUnreadChange) {
                onUnreadChange(0); // Clear unread count when chat is active
            }
        }
    }, [isActive, onUnreadChange]);

    // Component mount/unmount tracking
    useEffect(() => {
        setIsActive(true);
        setLastReadTimestamp(Date.now());
        
        return () => {
            setIsActive(false);
        };
    }, []);

    // Update last read timestamp when component becomes active
    const markAsRead = () => {
        setLastReadTimestamp(Date.now());
        if (onUnreadChange) {
            onUnreadChange(0);
        }
    };

    // Cleanup sound when unmounting or switching
    useEffect(() => {
        return sound
            ? () => {
                sound.unloadAsync();
            }
            : undefined;
    }, [sound]);

    // Scroll to bottom on new message
    useEffect(() => {
        if (messages.length > 0) {
            flatListRef.current?.scrollToEnd({ animated: true });
        }
    }, [messages]);


    // --- TEXT MESSAGING ---

    const handleSendText = async () => {
        if (!inputText.trim()) return;

        playHaptic('light');
        const text = inputText.trim();
        setInputText('');

        try {
            const chatRef = ref(database, `rooms/${roomCode}/chat`);
            const newMsgRef = push(chatRef);
            await set(newMsgRef, {
                senderId: playerId,
                senderName: playerName,
                text: text,
                type: 'text',
                timestamp: Date.now()
            });
        } catch (error) {
            console.error("Error sending text:", error);
            Alert.alert("Error", "Could not send message.");
        }
    };


    // --- VOICE MESSAGING ---

    const isProcessingRef = useRef(false);
    const [recordingDuration, setRecordingDuration] = useState(0);
    const [meteringLevels, setMeteringLevels] = useState([]);

    const durationInterval = useRef(null);

    const cleanupRecording = async () => {
        if (durationInterval.current) {
            clearInterval(durationInterval.current);
            durationInterval.current = null;
        }
        if (recording) {
            try {
                await recording.stopAndUnloadAsync();
            } catch (err) {
                // Ignore cleanup errors
            }
            setRecording(null);
            setIsRecording(false);
        }
        setRecordingDuration(0);
        setMeteringLevels([]);
    };

    const startRecording = async () => {
        if (isProcessingRef.current) return;
        isProcessingRef.current = true;

        try {
            // Ensure previous recording is cleaned up
            if (recording) {
                await cleanupRecording();
            }

            playHaptic('medium');

            const perm = await Audio.requestPermissionsAsync();
            if (perm.status !== 'granted') {
                Alert.alert('Permission Denied', 'Microphone permission is required.');
                isProcessingRef.current = false;
                return;
            }

            // Prepare Audio Mode
            await Audio.setAudioModeAsync({
                allowsRecordingIOS: true,
                playsInSilentModeIOS: true,
                staysActiveInBackground: false,
                shouldDuckAndroid: true,
                playThroughEarpieceAndroid: false
            });

            const { recording: newRecording } = await Audio.Recording.createAsync(
                Audio.RecordingOptionsPresets.HIGH_QUALITY
            );

            setRecording(newRecording);
            setIsRecording(true);
            setRecordingDuration(0);
            setMeteringLevels([]);

            // Timer for duration & metering
            const startTime = Date.now();
            durationInterval.current = setInterval(async () => {
                const now = Date.now();
                const diff = Math.floor((now - startTime) / 1000);
                setRecordingDuration(diff);

                // Get metering data
                const status = await newRecording.getStatusAsync();
                if (status.isRecording) {
                    // Metering is usually float between -160 and 0. Normalize to 0-100
                    const rawLevel = status.metering || -160;
                    const normalized = Math.max(0, (rawLevel + 160) / 1.6); // 0 to 100 approx
                    setMeteringLevels(prev => [...prev, normalized]);
                }
            }, 100); // 100ms updates

        } catch (err) {
            console.log('Failed to start recording', err);
        } finally {
            // Keep locked for a moment to prevent accidental double-tap
            setTimeout(() => {
                isProcessingRef.current = false;
            }, 500);
        }
    };

    const stopRecording = async () => {
        if (!recording) return;

        setIsRecording(false);
        if (durationInterval.current) {
            clearInterval(durationInterval.current);
            durationInterval.current = null;
        }

        try {
            await recording.stopAndUnloadAsync();
            const uri = recording.getURI();
            const finalDuration = recordingDuration;
            const finalWaveform = [...meteringLevels]; // Snapshot

            setRecording(null);

            if (uri) {
                // Filter down waveform to manageable size (e.g., 20 bars max)
                const simplifiedWaveform = simplifyWaveform(finalWaveform, 20);
                sendAudioMessage(uri, finalDuration, simplifiedWaveform);
            }
        } catch (error) {
            // Ignore "Recorder does not exist" which happens on rapid taps
            if (error.message && error.message.includes('Recorder does not exist')) {
                setRecording(null);
                return;
            }
            console.log('Failed to stop recording', error);
        }
    };

    const simplifyWaveform = (levels, count) => {
        if (!levels.length) return Array(count).fill(10); // Default flat if empty
        if (levels.length <= count) return levels;

        // Simple downsample
        const step = Math.ceil(levels.length / count);
        const result = [];
        for (let i = 0; i < levels.length; i += step) {
            result.push(levels[i]);
        }
        return result.slice(0, count);
    };

    const sendAudioMessage = async (uri, durationSec, waveform) => {
        setIsSending(true);
        try {
            // Fix: Use string literal 'base64' instead of relying on FileSystem.EncodingType.Base64
            // sometimes the enum access fails if imports are wonky.
            const base64Audio = await FileSystem.readAsStringAsync(uri, {
                encoding: 'base64',
            });

            const chatRef = ref(database, `rooms/${roomCode}/chat`);
            const newMsgRef = push(chatRef);
            await set(newMsgRef, {
                senderId: playerId,
                senderName: playerName,
                audioData: base64Audio,
                type: 'audio',
                timestamp: Date.now(),
                duration: durationSec,
                waveform: waveform || []
            });
            playHaptic('success');
        } catch (error) {
            console.error("Error sending audio:", error);
            Alert.alert("Error", "Failed to send voice note.");
        } finally {
            setIsSending(false);
            setRecordingDuration(0);
            setMeteringLevels([]);
        }
    };

    const playAudioMessage = async (base64Data, msgId) => {
        try {
            // Stop current if playing
            if (sound) {
                await sound.unloadAsync();
                setSound(null);
                setPlayingMsgId(null);
                // If clicking same message, just stop toggles it off
                if (playingMsgId === msgId) return;
            }

            // IMPORTANT: Set audio mode for playback through main speaker
            await Audio.setAudioModeAsync({
                allowsRecordingIOS: false,  // Disable recording mode for playback
                playsInSilentModeIOS: true,
                staysActiveInBackground: false,
                shouldDuckAndroid: true,
                playThroughEarpieceAndroid: false,
                // iOS specific - use speaker instead of earpiece
                interruptionModeIOS: 1, // INTERRUPTION_MODE_IOS_DO_NOT_MIX
                interruptionModeAndroid: 1, // INTERRUPTION_MODE_ANDROID_DO_NOT_MIX
            });

            // Create a temp file for the audio
            const tempUri = FileSystem.cacheDirectory + `temp_audio_${msgId}.m4a`;
            await FileSystem.writeAsStringAsync(tempUri, base64Data, {
                encoding: 'base64',
            });

            const { sound: newSound } = await Audio.Sound.createAsync(
                { uri: tempUri },
                { shouldPlay: true }
            );

            setSound(newSound);
            setPlayingMsgId(msgId);

            newSound.setOnPlaybackStatusUpdate((status) => {
                if (status.didJustFinish) {
                    setPlayingMsgId(null);
                    newSound.unloadAsync();
                    setSound(null);
                }
            });

        } catch (error) {
            console.error("Error playing audio", error);
            Alert.alert("Error", "Could not play audio.");
        }
    };

    // --- RENDERS ---

    const renderMessage = ({ item }) => {
        const isMe = item.senderId === playerId;
        const isPlaying = playingMsgId === item.id;

        return (
            <View style={[
                styles.messageContainer,
                isMe ? styles.myMessage : styles.theirMessage
            ]}>
                <Text style={styles.senderLabel} numberOfLines={1} ellipsizeMode="tail">
                    {item.senderName}
                </Text>

                {item.type === 'text' ? (
                    <Text style={styles.messageText}>{item.text}</Text>
                ) : (
                    <TouchableOpacity
                        style={styles.audioBubble}
                        onPress={() => playAudioMessage(item.audioData, item.id)}
                    >
                        <View style={styles.playIconBox}>
                            <Ionicons
                                name={isPlaying ? "pause" : "play"}
                                size={20}
                                color={theme.colors.text}
                            />
                        </View>

                        {/* Waveform Visualization */}
                        <View style={styles.waveformContainer}>
                            {(item.waveform || [20, 40, 60, 30, 50, 20, 40, 60]).map((level, index) => (
                                <View
                                    key={index}
                                    style={[
                                        styles.waveformBar,
                                        {
                                            height: Math.max(4, level / 3), // Scale height
                                            backgroundColor: isPlaying ? theme.colors.text : 'rgba(255,255,255,0.5)'
                                        }
                                    ]}
                                />
                            ))}
                        </View>

                        <View style={styles.durationBadge}>
                            <Text style={styles.durationText}>
                                {new Date((item.duration || 0) * 1000).toISOString().substr(14, 5)}
                            </Text>
                        </View>
                    </TouchableOpacity>
                )}
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <FlatList
                ref={flatListRef}
                data={messages}
                renderItem={renderMessage}
                keyExtractor={item => item.id}
                style={styles.list}
                contentContainerStyle={styles.listContent}
                onScrollBeginDrag={markAsRead}
                onMomentumScrollEnd={markAsRead}
            />

            <View style={styles.inputBar}>
                <TextInput
                    style={styles.input}
                    value={inputText}
                    onChangeText={setInputText}
                    placeholder="Type a message..."
                    placeholderTextColor={theme.colors.textSecondary}
                    editable={!isRecording}
                />

                {inputText.length > 0 ? (
                    <TouchableOpacity onPress={handleSendText} style={styles.sendButton}>
                        <Ionicons name="send" size={24} color={theme.colors.primary} />
                    </TouchableOpacity>
                ) : (
                    <TouchableOpacity
                        onPress={() => {
                            if (isRecording) {
                                stopRecording();
                            } else {
                                startRecording();
                            }
                        }}
                        style={[styles.micButton, isRecording && styles.micActive]}
                        disabled={isSending}
                    >
                        {isSending ? (
                            <ActivityIndicator color="#fff" size="small" />
                        ) : isRecording ? (
                            <Ionicons name="send" size={24} color="#fff" />
                        ) : (
                            <Ionicons name="mic" size={24} color="#fff" />
                        )}
                    </TouchableOpacity>
                )}
            </View>

            {isRecording && (
                <View style={styles.recordingOverlay}>
                    <Text style={styles.recordingText}>
                        Recording {new Date(recordingDuration * 1000).toISOString().substr(14, 5)}... Tap to Send
                    </Text>
                </View>
            )}
        </View>
    );
}

const getStyles = (theme) => StyleSheet.create({
    container: {
        flex: 1,
        width: '100%',
        backgroundColor: 'rgba(0,0,0,0.6)', // Darker overlay for better contrast
        borderTopWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)',
    },
    list: { flex: 1 },
    listContent: { padding: 10 },
    messageContainer: {
        maxWidth: '80%',
        padding: 10,
        borderRadius: 12,
        marginBottom: 10,
    },
    myMessage: {
        alignSelf: 'flex-end',
        backgroundColor: theme.colors.primary,
    },
    theirMessage: {
        alignSelf: 'flex-start',
        backgroundColor: theme.colors.surface,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    senderLabel: {
        fontSize: 10,
        color: 'rgba(255,255,255,0.7)',
        marginBottom: 2,
        maxWidth: '100%',
    },
    messageText: {
        color: theme.colors.text,
        fontSize: 16,
        fontFamily: theme.fonts.medium,
    },
    audioBubble: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 5,
        gap: 10,
    },
    playIconBox: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(255,255,255,0.2)',
        alignItems: 'center',
        justifyContent: 'center'
    },
    waveformContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
        height: 30, // Max height
    },
    waveformBar: {
        width: 3,
        borderRadius: 2,
    },
    durationBadge: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 10
    },
    durationText: {
        color: theme.colors.text,
        fontSize: 10,
        fontFamily: theme.fonts.bold,
    },
    inputBar: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 10,
        backgroundColor: theme.colors.surface, // Use surface color
        borderTopWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        paddingBottom: Platform.OS === 'ios' ? 20 : 10
    },
    input: {
        flex: 1,
        backgroundColor: 'rgba(255,255,255,0.1)', // Lighter background for input
        borderRadius: 20,
        paddingHorizontal: 15,
        paddingVertical: 10,
        color: theme.colors.text,
        marginRight: 10,
        fontFamily: theme.fonts.medium,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.2)'
    },
    sendButton: { padding: 10 },
    micButton: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: theme.colors.secondary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    micActive: {
        backgroundColor: '#e74c3c', // Red when recording
        transform: [{ scale: 1.2 }],
    },
    recordingOverlay: {
        position: 'absolute',
        bottom: 80,
        alignSelf: 'center',
        backgroundColor: '#e74c3c',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
        elevation: 5
    },
    recordingText: {
        color: '#fff',
        fontFamily: theme.fonts.bold,
    }
});
