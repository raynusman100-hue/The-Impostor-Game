import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Share, Alert, ActivityIndicator, Platform, TouchableOpacity, LayoutAnimation, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
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
import VoiceControl from '../components/VoiceControl';
import { useVoiceChat } from '../utils/VoiceChatContext';
import { CustomAvatar } from '../utils/AvatarGenerator';
import { CustomBuiltAvatar } from '../components/CustomAvatarBuilder';
import CategorySelectionModal from '../components/CategorySelectionModal';
import { useVoiceParticipantsTracker } from '../utils/VoiceParticipantsTracker';
import { checkPremiumStatus } from '../utils/PremiumManager';

// Film perforation component for Kodak aesthetic
const FilmPerforations = ({ side, theme }) => {
    const perforationColor = theme.colors.primary + '40';

    return (
        <View style={[filmPerforationStyles.perforationStrip, side === 'left' ? filmPerforationStyles.leftStrip : filmPerforationStyles.rightStrip]}>
            {[...Array(12)].map((_, i) => (
                <View key={i} style={[filmPerforationStyles.perforation, { backgroundColor: perforationColor }]} />
            ))}
        </View>
    );
};

const filmPerforationStyles = StyleSheet.create({
    perforationStrip: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        width: 18,
        justifyContent: 'space-evenly',
        alignItems: 'center',
        paddingVertical: 40,
        zIndex: 1,
    },
    leftStrip: { left: 2 },
    rightStrip: { right: 2 },
    perforation: {
        width: 10,
        height: 14,
        borderRadius: 2,
        borderWidth: 1,
        borderColor: 'rgba(255, 184, 0, 0.3)',
    },
});

export default function HostScreen({ navigation, route }) {
    const { theme } = useTheme();
    const styles = getStyles(theme);
    const { playerData, existingRoomCode } = route.params || {}; // Added existingRoomCode for play again

    const [roomCode, setRoomCode] = useState(existingRoomCode || '');
    const [players, setPlayers] = useState([]);
    const [isHostPremium, setIsHostPremium] = useState(false); // Added for local UI check

    // Game Settings
    const [impostorCount, setImpostorCount] = useState(1);
    const [selectedCategories, setSelectedCategories] = useState(['all']);
    const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
    const [language, setLanguage] = useState('en');
    const [isLanguageModalVisible, setIsLanguageModalVisible] = useState(false);

    useEffect(() => {
        if (!playerData) {
            Alert.alert("Error", "Missing profile data.", [
                { text: "Go Back", onPress: () => navigation.goBack() }
            ]);
            return;
        }

        const loadLanguage = async () => {
            try {
                const savedLanguage = await AsyncStorage.getItem('player_language_pref');
                if (savedLanguage && SUPPORTED_LANGUAGES.some(l => l.code === savedLanguage)) {
                    setLanguage(savedLanguage);
                }
            } catch (error) {
                console.log('Failed to load language', error);
            }
        };
        loadLanguage();
    }, [playerData]);

    const handleLanguageChange = async (lang) => {
        setLanguage(lang);
        setIsLanguageModalVisible(false);
        try {
            await AsyncStorage.setItem('player_language_pref', lang);
        } catch (error) {
            console.log('Failed to save language', error);
        }
    };

    const pulseAnim = React.useRef(new Animated.Value(1)).current;

    // Initialize room code once
    useEffect(() => {
        if (!playerData) return;

        if (!roomCode) {
            const code = existingRoomCode || Math.floor(100000 + Math.random() * 900000).toString();
            setRoomCode(code);
        }
    }, [playerData, existingRoomCode, roomCode]);

    // Track if listener is set up
    const listenerSetupRef = React.useRef(false);
    const currentRoomCodeRef = React.useRef(null);

    // Main room setup and listeners - only run when roomCode is set
    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, { toValue: 1.05, duration: 1000, useNativeDriver: true }),
                Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
            ])
        ).start();

        if (!playerData || !roomCode) return;

        // Skip if listener already set up for this room
        if (listenerSetupRef.current && currentRoomCodeRef.current === roomCode) {
            console.log("🔄 HOST: Listener already set up for room:", roomCode);
            return;
        }

        const roomRef = ref(database, `rooms/${roomCode}`);
        const playersRef = ref(database, `rooms/${roomCode}/players`);

        const setupRoom = async () => {
            if (existingRoomCode) {
                // RETURNING TO EXISTING ROOM - just update status, don't recreate
                console.log("🔄 HOST: Returning to existing room:", roomCode);

                // First cancel any existing onDisconnect handlers
                try {
                    await onDisconnect(roomRef).cancel();
                } catch (e) {
                    // Ignore if no handler exists
                }

                await update(roomRef, {
                    status: 'lobby',
                    gameStarted: false,
                    gameInProgress: false,
                    hostDisconnected: false,
                    hostLeft: false
                });
            } else {
                // CREATING NEW ROOM
                console.log("🔄 HOST: Creating new room:", roomCode);

                // 1. Fetch current Agora App ID from pool
                let stampedAppId = null;
                try {
                    stampedAppId = await fetchCurrentAgoraAppId();
                    console.log("🔄 HOST: Stamped room with App ID:", stampedAppId);
                } catch (err) {
                    console.warn("🔄 HOST: Failed to fetch App ID for stamp, using default/fallback logic");
                }

                // Check Premium Status
                const premiumStatus = await checkPremiumStatus(playerData.email, playerData.uid);
                console.log("🔄 HOST: Host is premium?", premiumStatus);
                setIsHostPremium(premiumStatus);

                await set(roomRef, {
                    status: 'lobby',
                    createdAt: Date.now(),
                    host: playerData.name,
                    hostId: playerData.uid,
                    hostAvatar: playerData.avatarId,
                    hostAvatarConfig: playerData.customAvatarConfig || null,
                    agoraAppId: stampedAppId, // <--- THE LOBBY STAMP 🏷️
                    hostIsPremium: premiumStatus // <--- LOCK VOICE CHAT 🔒
                });
            }

            // Set up disconnect handler AFTER room is ready
            onDisconnect(roomRef).remove();
        };

        setupRoom();

        console.log("🔄 HOST: Setting up players listener for room:", roomCode);
        listenerSetupRef.current = true;
        currentRoomCodeRef.current = roomCode;

        // Use the unsubscribe function returned by onValue
        const unsubscribePlayers = onValue(playersRef, (snapshot) => {
            const data = snapshot.val();
            console.log("🔄 HOST: Players update received:", data);
            if (data) {
                // Filter out any null/undefined entries and create fresh array
                const playerList = Object.entries(data)
                    .filter(([id, info]) => info && info.name) // Only include valid players
                    .map(([id, info]) => ({
                        id,
                        ...info
                    }));
                // Replace entire state with new array
                setPlayers(playerList);
                console.log("🔄 HOST: Players list updated:", playerList.length, "players");
            } else {
                setPlayers([]);
                console.log("🔄 HOST: No players in room");
            }
        });

        // When host navigates away (NOT during play again), delete the room
        // Only set this up for NEW rooms, not existing ones
        let beforeRemoveListener = null;
        if (!existingRoomCode) {
            beforeRemoveListener = navigation.addListener('beforeRemove', (e) => {
                // Don't delete room if navigating to game screens
                const targetRoute = e.data?.action?.payload?.name;
                if (targetRoute === 'RoleReveal' || targetRoute === 'Discussion' || targetRoute === 'WifiVoting' || targetRoute === 'Result') {
                    return; // Don't delete room during game
                }
                remove(roomRef);
            });
        }

        return () => {
            console.log("🔄 HOST: Cleaning up listeners for room:", roomCode);
            listenerSetupRef.current = false;
            currentRoomCodeRef.current = null;
            unsubscribePlayers(); // Use the unsubscribe function
            if (beforeRemoveListener) {
                beforeRemoveListener();
            }
        };
    }, [navigation, playerData, roomCode, existingRoomCode]);

    // Voice Chat Integration - Manual join only
    const { isJoined, joinChannel, leaveChannel } = useVoiceChat();
    const [voiceParticipants, setVoiceParticipants] = useState([]);

    // Track voice participants in Firebase
    useVoiceParticipantsTracker(
        roomCode,
        'host-id',
        playerData,
        isJoined,
        setVoiceParticipants
    );

    const toggleCategory = (key) => {
        playHaptic('light');
        setSelectedCategories(prev => {
            // If tapping 'Random (All)', select all FREE/unlocked categories
            if (key === 'all') {
                // Get all free categories (including subcategories)
                const freeCategories = CATEGORY_LABELS
                    .filter(c => c.key !== 'all' && (c.free === true || (!c.premium && !c.free)))
                    .flatMap(c => {
                        // If category has subcategories, include them instead of parent
                        if (c.subcategories) {
                            return c.subcategories.map(sub => sub.key);
                        }
                        return [c.key];
                    });
                return ['all', ...freeCategories];
            }
            let newCategories = prev.includes('all') ? [] : [...prev];
            if (newCategories.includes(key)) {
                newCategories = newCategories.filter(c => c !== key);
            } else {
                newCategories.push(key);
            }
            return newCategories.length ? newCategories : ['all'];
        });
    };

    const handleShare = async () => {
        try {
            await Share.share({
                message: `Join my Impostor IRL game! Room Code: ${roomCode}`,
            });
        } catch (error) {
            console.log(error.message);
        }
    };

    const getMaxImpostors = (totalPlayers) => {
        return Math.floor((totalPlayers - 1) / 2) || 1;
    };

    const handleStartGame = async () => {
        const totalPlayers = players.length + 1; // +1 for host
        if (totalPlayers < 3) {
            playHaptic('error');
            Alert.alert('Not Enough Players', 'Need at least 3 players (including you) to start!');
            return;
        }

        const maxImpostors = getMaxImpostors(totalPlayers);
        if (impostorCount > maxImpostors) {
            playHaptic('error');
            Alert.alert('Invalid Settings', `For ${totalPlayers} players, you can have max ${maxImpostors} impostors.`);
            setImpostorCount(maxImpostors);
            return;
        }

        try {
            playHaptic('success');
            const allPlayers = [
                { id: 'host-id', name: playerData.name, avatarId: playerData.avatarId },
                ...players
            ];

            await startWifiGame(roomCode, allPlayers, {
                language,
                impostorCount,
                categories: selectedCategories
            });

            navigation.navigate('RoleReveal', {
                mode: 'wifi',
                roomCode,
                playerId: 'host-id',
                category: selectedCategories[0]
            });
        } catch (error) {
            Alert.alert('Error', 'Failed to start game. Please try again.');
        }
    };

    const [showChat, setShowChat] = useState(false);
    const [activeTab, setActiveTab] = useState('lobby'); // 'lobby' | 'chat' | 'voice'
    const [unreadMessages, setUnreadMessages] = useState(0);

    // Enhanced unread message handler
    const handleUnreadChange = useCallback((count) => {
        // Only show unread count when chat is not active
        if (activeTab !== 'chat') {
            setUnreadMessages(count);
        } else {
            setUnreadMessages(0);
        }
    }, [activeTab]);

    if (!playerData) return null;

    return (
        <LinearGradient colors={theme.colors.backgroundGradient || [theme.colors.background, theme.colors.background, theme.colors.background]} style={styles.container}>
            {/* Film perforations - side strips */}
            <FilmPerforations side="left" theme={theme} />
            <FilmPerforations side="right" theme={theme} />

            {/* Header with room code */}
            <View style={styles.header}>
                <Text style={styles.title}>ROOM CODE</Text>
                <Animated.Text style={[styles.codeText, { transform: [{ scale: pulseAnim }] }]}>
                    {roomCode}
                </Animated.Text>
            </View>

            {/* Tabs: Lobby | Chat | Voice */}
            <View style={styles.tabContainer}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'lobby' && styles.activeTab]}
                    onPress={() => {
                        playHaptic('light');
                        setActiveTab('lobby');
                    }}
                >
                    <Text style={[styles.tabText, activeTab === 'lobby' && styles.activeTabText]}>LOBBY</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'chat' && styles.activeTab]}
                    onPress={() => {
                        playHaptic('light');
                        setActiveTab('chat');
                        setUnreadMessages(0);
                    }}
                >
                    <View style={styles.tabContent}>
                        <Text style={[styles.tabText, activeTab === 'chat' && styles.activeTabText]}>CHAT</Text>
                        {unreadMessages > 0 && activeTab !== 'chat' && (
                            <View style={styles.notificationDot} />
                        )}
                    </View>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'voice' && styles.activeTab]}
                    onPress={() => {
                        playHaptic('light');
                        setActiveTab('voice');
                    }}
                >
                    <Text style={[styles.tabText, activeTab === 'voice' && styles.activeTabText]}>VOICE</Text>
                </TouchableOpacity>
            </View>

            {activeTab === 'chat' ? (
                <View style={{ flex: 1, width: '100%', paddingBottom: 20 }}>
                    <ChatSystem
                        roomCode={roomCode}
                        playerId="host-id"
                        playerName={playerData.name}
                        onUnreadChange={handleUnreadChange}
                    />
                </View>
            ) : activeTab === 'voice' ? (
                <View style={[styles.voiceContainer, !isHostPremium && { justifyContent: 'center' }]}>
                    {!isHostPremium ? (
                        <View style={{ alignItems: 'center', justifyContent: 'center', padding: 20 }}>
                            <Ionicons name="lock-closed" size={64} color={theme.colors.textMuted} style={{ marginBottom: 20 }} />
                            <Text style={[styles.voiceInstructions, { fontSize: 20 }]}>PREMIUM ONLY</Text>
                            <Text style={[styles.voiceSubInstructions, { maxWidth: 300 }]}>
                                You need Premium to enable Voice Chat for this room.
                            </Text>
                            <KodakButton
                                title="GET PREMIUM"
                                onPress={() => navigation.navigate('Premium')}
                                variant="primary"
                                style={{ width: 200, marginTop: 20 }}
                            />
                        </View>
                    ) : !isJoined ? (
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
                                onPress={() => {
                                    playHaptic('heavy');
                                    joinChannel(roomCode, 0);
                                }}
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
                                            {participant.id === 'host-id' ? 'You' : participant.name}
                                        </Text>
                                    </View>
                                ))}
                            </View>

                            <VoiceControl />

                            <TouchableOpacity
                                style={styles.leaveVoiceBtn}
                                onPress={() => {
                                    playHaptic('medium');
                                    leaveChannel();
                                }}
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
                </View>
            ) : (
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {/* QR Code */}
                    <View style={styles.qrContainer}>
                        {roomCode ? (
                            <QRCode value={roomCode} size={120} color={theme.colors.tertiary} backgroundColor="transparent" />
                        ) : (
                            <ActivityIndicator color={theme.colors.tertiary} />
                        )}
                    </View>

                    {/* Host Info - Compact */}
                    <View style={styles.hostCard}>
                        {playerData.customAvatarConfig ? (
                            <CustomBuiltAvatar config={playerData.customAvatarConfig} size={50} />
                        ) : (
                            <CustomAvatar id={playerData.avatarId} size={50} />
                        )}
                        <View style={styles.hostInfo}>
                            <Text style={styles.hostName}>{playerData.name.toUpperCase()}</Text>
                            <View style={styles.hostBadge}>
                                <Text style={styles.hostBadgeText}>HOST</Text>
                            </View>
                        </View>
                    </View>

                    {/* Game Settings - Compact */}
                    <View style={styles.settingsCard}>
                        <View style={styles.settingRow}>
                            <Text style={styles.settingLabel}>IMPOSTORS</Text>
                            <View style={styles.counterControls}>
                                <TouchableOpacity onPress={() => setImpostorCount(Math.max(1, impostorCount - 1))} style={styles.countBtn}>
                                    <Text style={styles.countBtnText}>−</Text>
                                </TouchableOpacity>
                                <Text style={styles.countValue}>{impostorCount}</Text>
                                <TouchableOpacity onPress={() => {
                                    const max = getMaxImpostors(players.length + 1);
                                    if (impostorCount < max) {
                                        setImpostorCount(impostorCount + 1);
                                    } else {
                                        playHaptic('warning');
                                    }
                                }} style={styles.countBtn}>
                                    <Text style={styles.countBtnText}>+</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View style={styles.settingButtons}>
                            <TouchableOpacity
                                style={styles.settingBtn}
                                onPress={() => setIsLanguageModalVisible(true)}
                            >
                                <Text style={styles.settingBtnLabel}>LANG</Text>
                                <Text style={styles.settingBtnValue}>
                                    {SUPPORTED_LANGUAGES.find(l => l.code === language)?.code.toUpperCase()}
                                </Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={styles.settingBtn}
                                onPress={() => {
                                    playHaptic('light');
                                    setIsCategoriesOpen(true);
                                }}
                            >
                                <Text style={styles.settingBtnLabel}>CATEGORY</Text>
                                <Text style={styles.settingBtnValue}>
                                    {selectedCategories.includes('all') ? 'ALL' : selectedCategories.length}
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {/* Category Selection Modal */}
                        <CategorySelectionModal
                            visible={isCategoriesOpen}
                            onClose={() => setIsCategoriesOpen(false)}
                            selectedCategories={selectedCategories}
                            onSelectCategory={toggleCategory}
                            navigation={navigation}
                        />
                    </View>

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
                                <Text style={styles.playerName}>{playerData.name.toUpperCase()}</Text>
                                <Text style={styles.youTag}>(YOU)</Text>
                            </View>
                            {players.map((p) => (
                                <View key={p.id} style={styles.playerRow}>
                                    {p.customAvatarConfig ? (
                                        <CustomBuiltAvatar config={p.customAvatarConfig} size={28} />
                                    ) : (
                                        <CustomAvatar id={p.avatarId || 1} size={28} />
                                    )}
                                    <Text style={styles.playerName}>{p.name}</Text>
                                </View>
                            ))}
                        </View>
                    </View>

                    {/* Action Buttons */}
                    <View style={styles.footer}>
                        <KodakButton title="SHARE INVITE" onPress={handleShare} variant="secondary" />
                        <KodakButton title="START GAME" onPress={handleStartGame} disabled={players.length + 1 < 3} variant="primary" />
                    </View>
                </ScrollView>
            )}

            <LanguageSelectorModal
                visible={isLanguageModalVisible}
                onClose={() => setIsLanguageModalVisible(false)}
                onSelect={handleLanguageChange}
                currentLanguage={language}
            />
        </LinearGradient>
    );
}

function getStyles(theme) {
    return StyleSheet.create({
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

        // Voice Tab Styles
        voiceContainer: {
            flex: 1,
            justifyContent: 'center',
            alignItems: 'center',
            width: '100%',
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
            fontSize: 16,
            fontFamily: theme.fonts.medium,
            color: theme.colors.text,
            letterSpacing: 1,
            flex: 1,
        },
        joinVoiceBtn: {
            width: 120,
            height: 120,
            borderRadius: 60,
            backgroundColor: theme.colors.primary,
            justifyContent: 'center',
            alignItems: 'center',
            elevation: 10,
            shadowColor: theme.colors.primary,
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.5,
            shadowRadius: 10,
            marginTop: 20,
        },
        joinVoiceInner: {
            width: 110,
            height: 110,
            borderRadius: 55,
            borderWidth: 2,
            borderColor: theme.colors.secondary,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: theme.colors.primary,
        },
        joinVoiceText: {
            fontFamily: theme.fonts.bold,
            color: theme.colors.secondary,
            fontSize: 18,
            textAlign: 'center',
        },
        leaveVoiceBtn: {
            marginTop: 40,
            paddingVertical: 10,
            paddingHorizontal: 20,
            borderRadius: 8,
            borderWidth: 1,
            borderColor: theme.colors.error,
        },
        leaveVoiceText: {
            color: theme.colors.error,
            fontFamily: theme.fonts.bold,
            fontSize: 12,
            letterSpacing: 2,
        },
    });
}
