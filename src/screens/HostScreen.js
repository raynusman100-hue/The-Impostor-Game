import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Share, Alert, ActivityIndicator, Platform, TouchableOpacity, LayoutAnimation, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import QRCode from 'react-native-qrcode-svg';
import { useTheme } from '../utils/ThemeContext';
import KodakButton from '../components/KodakButton';
import { playHaptic } from '../utils/haptics';
import { database } from '../utils/firebase';
import { ref, set, onValue, off, onDisconnect, update, remove } from 'firebase/database';
import { startWifiGame } from '../utils/multiplayerLogic';
import { CATEGORY_LABELS } from '../utils/words';
import { SUPPORTED_LANGUAGES } from '../utils/translationService';
import LanguageSelectorModal from '../components/LanguageSelectorModal';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ChatSystem from '../components/ChatSystem';
import { CustomAvatar } from '../utils/AvatarGenerator';
import { CustomBuiltAvatar } from '../components/CustomAvatarBuilder';
import VoiceControl from '../components/VoiceControl';
import { useVoiceChat } from '../utils/VoiceChatContext';
import AdManager from '../utils/AdManager';

export default function HostScreen({ navigation, route }) {
    const { theme } = useTheme();
    const styles = getStyles(theme);
    const { playerData, existingRoomCode } = route.params || {};

    const [roomCode, setRoomCode] = useState(existingRoomCode || '');
    const [players, setPlayers] = useState([]);

    // Game Settings
    const [impostorCount, setImpostorCount] = useState(1);
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [language, setLanguage] = useState('en');

    // UI State
    const [showChat, setShowChat] = useState(false);

    // Voice Chat
    const { joinChannel, leaveChannel } = useVoiceChat();

    // Generate Room Code if needed
    useEffect(() => {
        if (!roomCode) {
            // Generate 4 letter code
            const code = Math.random().toString(36).substring(2, 6).toUpperCase();
            setRoomCode(code);
        }
    }, []);

    // Setup Room and Listeners
    useEffect(() => {
        if (!roomCode || !playerData) return;

        const roomRef = ref(database, `rooms/${roomCode}`);

        // Create room if new
        const setupRoom = async () => {
            if (!existingRoomCode) {
                console.log("🔄 HOST: Creating new room:", roomCode);
                await set(roomRef, {
                    status: 'lobby',
                    createdAt: Date.now(),
                    host: playerData.name,
                    hostId: playerData.uid,
                    hostAvatar: playerData.avatarId,
                    hostAvatarConfig: playerData.customAvatarConfig || null,
                    players: {
                        [playerData.uid]: {
                            id: playerData.uid,
                            name: playerData.name,
                            avatarId: playerData.avatarId,
                            customAvatarConfig: playerData.customAvatarConfig || null,
                            isHost: true
                        }
                    },
                    gameState: {
                        language: language,
                        impostorCount: impostorCount,
                        category: selectedCategory
                    }
                });
            }
            onDisconnect(roomRef).remove();
        };

        setupRoom();

        // Listen for players
        const playersRef = ref(database, `rooms/${roomCode}/players`);
        const unsubPlayers = onValue(playersRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const playerList = Object.values(data).filter(p => p.id !== playerData.uid);
                setPlayers(playerList);
            } else {
                setPlayers([]);
            }
        });

        return () => {
            off(playersRef);
        };
    }, [roomCode, playerData, existingRoomCode]);

    // Listen for Game Start (Navigation)
    useEffect(() => {
        if (!roomCode) return;
        const roomRef = ref(database, `rooms/${roomCode}`);
        const unsub = onValue(roomRef, (snapshot) => {
            const data = snapshot.val();
            if (data && data.status === 'reveal') {
                console.log("HOST: Game started, navigating to RoleReveal");
                navigation.replace('RoleReveal', {
                    mode: 'wifi',
                    roomCode: roomCode,
                    playerId: playerData.uid,
                    category: selectedCategory, // Pass category
                    playerCount: players.length + 1
                });
            }
        });
        return () => off(roomRef);
    }, [roomCode, navigation, playerData, players, selectedCategory]);

    // Cleanup Room on Unmount/Leave
    useEffect(() => {
        const unsubscribe = navigation.addListener('beforeRemove', (e) => {
            // If navigating to Game, don't destroy room.
            // If navigating back to Home, destroy room.
            const action = e.data.action;
            if (action.type === 'POP' || (action.payload && action.payload.name === 'Home')) {
                if (roomCode) {
                    remove(ref(database, `rooms/${roomCode}`));
                }
            }
        });
        return unsubscribe;
    }, [navigation, roomCode]);

    // Voice Chat Integration
    useEffect(() => {
        if (roomCode) {
            console.log("🔊 HOST: Joining voice channel", roomCode);
            joinChannel(roomCode, 0);
        }
        return () => {
            leaveChannel();
        };
    }, [roomCode]);

    // Load Ad
    useEffect(() => {
        AdManager.loadInterstitial();
    }, []);

    const handleStartGame = () => {
        if (players.length + 1 < 3) {
            Alert.alert("Not Enough Players", "You need at least 3 players to start.");
            return;
        }

        playHaptic('success');
        AdManager.showInterstitial(() => {
            startWifiGame(roomCode, players.length + 1, impostorCount, selectedCategory, language);
        });
    };

    const handlePlayerTap = (name) => {
        playHaptic('light');
        Alert.alert('Player', name);
    };

    return (
        <LinearGradient style={styles.container} colors={theme.colors.backgroundGradient || [theme.colors.background, theme.colors.background, theme.colors.background]}>
            {/* Film Strip Header */}
            <View style={styles.filmHeader}>
                <View style={styles.filmStrip}>
                    {[...Array(16)].map((_, i) => (
                        <View key={i} style={styles.filmHole} />
                    ))}
                </View>
            </View>

            <View style={styles.container}>
                {/* Voice Control */}
                <VoiceControl />

                {/* Header / Room Code */}
                <View style={styles.header}>
                    <Text style={styles.title}>ROOM CODE</Text>
                    <Text style={styles.codeText}>{roomCode}</Text>
                </View>

                {showChat ? (
                    <View style={{ flex: 1 }}>
                        <ChatSystem
                            roomCode={roomCode}
                            playerId={playerData.uid}
                            playerName={playerData.name}
                            onClose={() => setShowChat(false)}
                        />
                        <View style={{ padding: 10, alignItems: 'center' }}>
                            <KodakButton
                                title="CLOSE CHAT"
                                onPress={() => setShowChat(false)}
                                size="small"
                                variant="secondary"
                            />
                        </View>
                    </View>
                ) : (
                    <ScrollView contentContainerStyle={styles.scrollContent}>
                        {/* QR Code */}
                        <View style={styles.qrContainer}>
                            <QRCode value={roomCode || 'LOADING'} size={120} color={theme.colors.text} backgroundColor="transparent" />
                        </View>

                        {/* Chat Toggle */}
                        <TouchableOpacity style={styles.tabContainer} onPress={() => setShowChat(true)}>
                            <Text style={styles.tabText}>OPEN CHAT</Text>
                        </TouchableOpacity>

                        {/* Host Info */}
                        <TouchableOpacity onPress={() => handlePlayerTap(playerData.name)} activeOpacity={0.8} style={styles.hostCard}>
                            {playerData.customAvatarConfig ? (
                                <CustomBuiltAvatar config={playerData.customAvatarConfig} size={50} />
                            ) : (
                                <CustomAvatar id={playerData.avatarId} size={50} />
                            )}
                            <View style={styles.hostInfo}>
                                <Text style={styles.hostName}>{playerData.name?.toUpperCase()}</Text>
                                <View style={styles.hostBadge}>
                                    <Text style={styles.hostBadgeText}>HOST</Text>
                                </View>
                            </View>
                        </TouchableOpacity>

                        {/* Players List */}
                        <View style={styles.playersCard}>
                            <Text style={styles.playerCount}>PLAYERS ({players.length + 1}/3 MIN)</Text>
                            <View style={styles.playerList}>
                                <View style={styles.playerRow}>
                                    {playerData.customAvatarConfig ? (
                                        <CustomBuiltAvatar config={playerData.customAvatarConfig} size={28} />
                                    ) : (
                                        <CustomAvatar id={playerData.avatarId} size={28} />
                                    )}
                                    <Text style={styles.playerName}>{playerData.name}</Text>
                                    <Text style={styles.youTag}>(YOU)</Text>
                                </View>
                                {players.map(p => (
                                    <TouchableOpacity key={p.id} onPress={() => handlePlayerTap(p.name)} style={styles.playerRow}>
                                        {p.customAvatarConfig ? (
                                            <CustomBuiltAvatar config={p.customAvatarConfig} size={28} />
                                        ) : (
                                            <CustomAvatar id={p.avatarId || 1} size={28} />
                                        )}
                                        <Text style={styles.playerName}>{p.name}</Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        {/* Start Button */}
                        <View style={styles.footer}>
                            <KodakButton
                                title="START GAME"
                                onPress={handleStartGame}
                                variant="primary"
                                size="large"
                                disabled={players.length + 1 < 3}
                                fullWidth
                            />
                        </View>
                    </ScrollView>
                )}
            </View>
        </LinearGradient>
    );
}

const getStyles = (theme) => StyleSheet.create({
    container: { flex: 1 },
    scrollContent: {
        paddingHorizontal: 28,
        paddingTop: 10,
        paddingBottom: 30,
    },

    header: {
        marginTop: Platform.OS === 'ios' ? 50 : 35,
        alignItems: 'center',
        marginBottom: 10,
    },
    title: {
        fontSize: 12,
        color: theme.colors.tertiary,
        fontFamily: theme.fonts.bold,
        letterSpacing: 4,
    },
    codeText: {
        fontSize: 48,
        color: theme.colors.text,
        fontFamily: theme.fonts.header,
        letterSpacing: 8,
    },

    tabContainer: {
        flexDirection: 'row',
        marginBottom: 12,
        backgroundColor: theme.colors.surface,
        borderRadius: 25,
        padding: 4,
        borderWidth: 2,
        borderColor: theme.colors.primary,
        alignSelf: 'center',
    },
    tab: {
        paddingVertical: 8,
        paddingHorizontal: 30,
        borderRadius: 20,
    },
    activeTab: {
        backgroundColor: theme.colors.primary,
    },
    tabText: {
        color: theme.colors.textMuted,
        fontFamily: theme.fonts.bold,
        fontSize: 13,
        letterSpacing: 2,
        paddingHorizontal: 20,
        paddingVertical: 5
    },
    activeTabText: {
        color: theme.colors.secondary,
    },
    tabContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    notificationDot: {
        position: 'absolute',
        top: -6,
        right: -8,
        backgroundColor: theme.colors.error,
        borderRadius: 6,
        width: 12,
        height: 12,
        borderWidth: 2,
        borderColor: theme.colors.background,
    },

    qrContainer: {
        padding: 16,
        backgroundColor: theme.colors.surface,
        borderRadius: 16,
        marginBottom: 12,
        borderWidth: 2,
        borderColor: theme.colors.primary,
        alignSelf: 'center',
    },

    // Host Card - Compact horizontal layout
    hostCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 14,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: theme.colors.primary,
        backgroundColor: theme.colors.surface,
        marginBottom: 12,
        gap: 14,
    },
    hostInfo: {
        flex: 1,
    },
    hostName: {
        fontSize: 20,
        fontFamily: theme.fonts.bold,
        color: theme.colors.text,
        letterSpacing: 1,
    },
    hostBadge: {
        marginTop: 4,
        backgroundColor: theme.colors.primary,
        paddingHorizontal: 10,
        paddingVertical: 3,
        borderRadius: 8,
        alignSelf: 'flex-start',
    },
    hostBadgeText: {
        color: theme.colors.secondary,
        fontSize: 10,
        fontFamily: theme.fonts.bold,
        letterSpacing: 2,
    },

    // Settings Card - Compact
    settingsCard: {
        padding: 14,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: theme.colors.primary,
        backgroundColor: theme.colors.surface,
        marginBottom: 12,
    },
    settingRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 12,
    },
    settingLabel: {
        color: theme.colors.tertiary,
        fontSize: 12,
        fontFamily: theme.fonts.bold,
        letterSpacing: 2,
    },
    counterControls: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    countBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: theme.colors.surface,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: theme.colors.primary,
    },
    countBtnText: {
        color: theme.colors.text,
        fontSize: 20,
        fontFamily: theme.fonts.bold,
        lineHeight: 22,
    },
    countValue: {
        color: theme.colors.text,
        fontSize: 24,
        fontFamily: theme.fonts.header,
        minWidth: 30,
        textAlign: 'center',
    },
    settingButtons: {
        flexDirection: 'row',
        gap: 10,
    },
    settingBtn: {
        flex: 1,
        backgroundColor: theme.colors.surface,
        borderRadius: 10,
        padding: 10,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: theme.colors.textMuted,
    },
    settingBtnLabel: {
        color: theme.colors.textMuted,
        fontSize: 9,
        fontFamily: theme.fonts.medium,
        letterSpacing: 2,
    },
    settingBtnValue: {
        color: theme.colors.text,
        fontSize: 16,
        fontFamily: theme.fonts.bold,
        letterSpacing: 1,
    },

    categoryGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        marginTop: 12,
    },
    catItem: {
        paddingHorizontal: 12,
        paddingVertical: 8,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: theme.colors.textMuted,
        backgroundColor: theme.colors.surface,
    },
    catItemSelected: {
        backgroundColor: theme.colors.primary,
        borderColor: theme.colors.primary,
    },
    catText: {
        color: theme.colors.textSecondary,
        fontSize: 11,
        fontFamily: theme.fonts.bold,
        letterSpacing: 1,
    },
    catTextSelected: {
        color: theme.colors.secondary,
    },

    // Players Card
    playersCard: {
        padding: 14,
        borderRadius: 12,
        marginBottom: 16,
        borderWidth: 2,
        borderColor: theme.colors.primary,
        backgroundColor: theme.colors.surface,
    },
    playerCount: {
        fontSize: 11,
        color: theme.colors.tertiary,
        fontFamily: theme.fonts.bold,
        marginBottom: 10,
        letterSpacing: 2,
    },
    playerList: {
        gap: 8,
    },
    playerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    playerName: {
        fontSize: 16,
        color: theme.colors.text,
        fontFamily: theme.fonts.medium,
        letterSpacing: 1,
    },
    youTag: {
        fontSize: 12,
        color: theme.colors.textMuted,
        fontFamily: theme.fonts.medium,
    },

    footer: {
        gap: 12,
    },

    // Kodak Film Strip Decorations
    filmHeader: {
        width: '100%',
        position: 'absolute',
        top: 45,
        left: 0,
        right: 0,
        zIndex: 5
    },
    filmStrip: {
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        paddingHorizontal: 5,
    },
    filmHole: {
        width: 12,
        height: 8,
        backgroundColor: theme.colors.primary,
        borderRadius: 2,
        opacity: 0.8,
    },
});
