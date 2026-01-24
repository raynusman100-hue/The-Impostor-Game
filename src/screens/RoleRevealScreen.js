import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView, Image, Alert, BackHandler, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../utils/ThemeContext';
import RoleCard from '../components/RoleCard';
import { playHaptic } from '../utils/haptics';
import { assignRoles } from '../utils/gameLogic';
import { setPlayerReady } from '../utils/multiplayerLogic';
import { database } from '../utils/firebase';
import { ref, onValue, off, get, update } from 'firebase/database';
import { CustomAvatar } from '../utils/AvatarGenerator';
import { CustomBuiltAvatar } from '../components/CustomAvatarBuilder';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SUPPORTED_LANGUAGES } from '../utils/translationService';
import VoiceControl from '../components/VoiceControl';
import { useVoiceChat } from '../utils/VoiceChatContext';

export default function RoleRevealScreen({ route, navigation }) {
    const { theme } = useTheme();
    const styles = getStyles(theme);
    const params = route.params;

    // Check if we are in Wi-Fi mode
    const isWifi = params.mode === 'wifi';

    const [assignedPlayers, setAssignedPlayers] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [readyStatus, setReadyStatus] = useState(false);

    // WiFi State
    const [allPlayersStatus, setAllPlayersStatus] = useState([]); // Array of { name, ready, avatarId }
    const [isRoomClosed, setIsRoomClosed] = useState(false);
    const [gameLanguage, setGameLanguage] = useState(params.language || 'en');

    // Load language from Firebase gameState for WiFi mode (synced from host)
    useEffect(() => {
        if (isWifi && params.roomCode) {
            const languageRef = ref(database, `rooms/${params.roomCode}/gameState/language`);
            const unsub = onValue(languageRef, (snapshot) => {
                const lang = snapshot.val();
                if (lang && SUPPORTED_LANGUAGES.some(l => l.code === lang)) {
                    console.log("[Language] Loaded from Firebase:", lang);
                    setGameLanguage(lang);
                }
            });

            return () => off(languageRef);
        }
    }, [isWifi, params.roomCode]);

    // Voice Chat
    const { joinChannel } = useVoiceChat();
    useEffect(() => {
        if (isWifi && params.roomCode) {
            joinChannel(params.roomCode, 0);
        }
    }, [isWifi, params.roomCode]);

    // Disable Android back button in WiFi mode
    useEffect(() => {
        if (!isWifi) return;

        const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
            // Simply block back button - no confirmation needed during game
            return true;
        });

        return () => backHandler.remove();
    }, [isWifi]);

    // WiFi specific listeners
    useEffect(() => {
        if (!isWifi) {
            // Local Pass & Play logic setup
            const { players, impostorCount, crewWord, crewHint, crewMl, originalWord, originalHint } = params;
            const roles = assignRoles(players, impostorCount, crewWord, crewHint, crewMl, originalWord, originalHint);
            setAssignedPlayers(roles);
            return;
        }

        const { roomCode, playerId } = params;

        // Track if we've already navigated to prevent double navigation
        let hasNavigated = false;

        const navigateToDiscussion = (playerCount) => {
            if (hasNavigated) {
                console.log("[Sync] Already navigated, skipping");
                return;
            }
            hasNavigated = true;
            console.log("[Sync] Navigating to WifiWhoStarts with", playerCount, "players");
            playHaptic('success');

            // Navigate to WifiWhoStarts screen first (shows who starts the discussion)
            navigation.replace('WifiWhoStarts', {
                playerCount: playerCount,
                mode: 'wifi',
                roomCode,
                playerId
            });
        };

        // Listener 1: Game Status (Navigation) - SIMPLIFIED
        const statusRef = ref(database, `rooms/${roomCode}/status`);

        const unsubStatus = onValue(statusRef, (snapshot) => {
            const status = snapshot.val();
            console.log("=== ROLE REVEAL STATUS LISTENER ===");
            console.log("Status received:", status);
            console.log("Has navigated:", hasNavigated);

            if (status === 'discussion' && !hasNavigated) {
                console.log("[Sync] Status is DISCUSSION - navigating");
                // Get player count then navigate
                get(ref(database, `rooms/${roomCode}/gameState/assignments`)).then(snap => {
                    const assignments = snap.val();
                    const count = assignments ? Object.keys(assignments).length : 3;
                    navigateToDiscussion(count);
                }).catch(err => {
                    console.error("[Sync] Error getting assignments:", err);
                    navigateToDiscussion(3); // Fallback to 3 players
                });
            } else if (status === 'reveal') {
                // PLAY AGAIN: Reset ready states when returning to role reveal
                console.log("[Sync] Status Listener: Returning to role reveal (play again)");
                hasNavigated = false; // Reset navigation flag
                setReadyStatus(false); // Reset local ready status

                // Reset all players' ready status in Firebase (only host should do this)
                if (playerId === 'host-id') {
                    console.log("[Sync] Host resetting all ready states for play again");
                    const gameStateRef = ref(database, `rooms/${roomCode}/gameState`);
                    get(gameStateRef).then(snap => {
                        if (snap.exists()) {
                            const gameState = snap.val();
                            const assignments = gameState.assignments || {};

                            const updates = {};
                            Object.keys(assignments).forEach(pid => {
                                updates[`assignments/${pid}/ready`] = false;
                                updates[`assignments/${pid}/readyAt`] = null;
                            });

                            updates['allPlayersReady'] = null;
                            updates['forceDiscussion'] = null;
                            updates['phase'] = 'reveal';
                            updates['lastActionAt'] = Date.now();

                            update(gameStateRef, updates).then(() => {
                                console.log("[Sync] Ready states reset complete");
                            });
                        }
                    });
                }
            }
            console.log("=== ROLE REVEAL STATUS LISTENER END ===");
        });

        // Listener 2: Game State flags - BACKUP navigation trigger
        const gameStateRef = ref(database, `rooms/${roomCode}/gameState`);
        const unsubGameState = onValue(gameStateRef, (snapshot) => {
            const gameState = snapshot.val();
            if (gameState && (gameState.allPlayersReady || gameState.forceDiscussion) && !hasNavigated) {
                console.log("[Sync] Immediate discussion flag detected! allPlayersReady:", gameState.allPlayersReady, "forceDiscussion:", gameState.forceDiscussion);
                const assignments = gameState.assignments;
                const count = assignments ? Object.keys(assignments).length : 3;
                navigateToDiscussion(count);
            }
        });

        // Listener 2: Ready Status (UI Sync) + Room Monitoring - ENHANCED SYNC
        const assignmentsRef = ref(database, `rooms/${roomCode}/gameState/assignments`);
        const unsubAssignments = onValue(assignmentsRef, (snapshot) => {
            const assignments = snapshot.val();
            if (assignments) {
                console.log("[Sync] Assignments update received:", assignments);

                // My Card
                const myData = assignments[playerId];
                if (myData) {
                    setAssignedPlayers([myData]);
                    // Update my ready status from Firebase
                    setReadyStatus(myData.ready || false);
                }

                // Others Status - ENHANCED LOGGING
                const statusList = Object.values(assignments).map(p => ({
                    id: p.id,
                    name: p.name,
                    ready: p.ready || false, // Ensure boolean
                    avatarId: p.avatarId,
                    customAvatarConfig: p.customAvatarConfig,
                    order: p.order || 0
                })).sort((a, b) => a.order - b.order);

                console.log("[Sync] Status list updated:", statusList.map(p => `${p.name}: ${p.ready}`));
                setAllPlayersStatus(statusList);

                // Force re-render by updating state
                setAllPlayersStatus(prev => [...statusList]);
            } else {
                console.log("[Sync] No assignments data received");
            }
        }, (error) => {
            console.error("[Sync] Assignments listener error:", error);
        });

        const roomRef = ref(database, `rooms/${roomCode}`);
        const unsubRoom = onValue(roomRef, (snapshot) => {
            const data = snapshot.val();
            if (!data) {
                Alert.alert('Room Closed', 'The room has been closed.');
                navigation.navigate('Home');
                return;
            }

            // Check if host disconnected or left
            if (data.hostDisconnected || data.hostLeft) {
                console.log('ROLE REVEAL: Host disconnected/left, forcing back to lobby');
                Alert.alert(
                    'Host Disconnected',
                    'The host has disconnected. Returning to lobby...',
                    [{
                        text: 'OK', onPress: () => {
                            if (playerId === 'host-id') {
                                navigation.navigate('Host', {
                                    playerData: {
                                        name: data.host || 'Host',
                                        avatarId: data.hostAvatar || 1,
                                        uid: data.hostId || 'host-id'
                                    }
                                });
                            } else {
                                navigation.navigate('WifiLobby', {
                                    roomCode,
                                    playerId: playerId,
                                    playerName: assignedPlayers[0]?.name || 'Player'
                                });
                            }
                        }
                    }]
                );
            }
        });

        // PERIODIC SYNC CHECK: Backup mechanism to catch missed updates
        const syncInterval = setInterval(async () => {
            try {
                // First check if we should have navigated to discussion
                const statusSnap = await get(ref(database, `rooms/${roomCode}/status`));
                const currentStatus = statusSnap.val();

                if (currentStatus === 'discussion' && !hasNavigated) {
                    console.log("[PERIODIC SYNC] Detected we should be in discussion but haven't navigated!");
                    const assignSnap = await get(ref(database, `rooms/${roomCode}/gameState/assignments`));
                    const assignments = assignSnap.val();
                    const count = assignments ? Object.keys(assignments).length : 3;
                    navigateToDiscussion(count);
                    return;
                }

                // Check ready status sync
                const snapshot = await get(ref(database, `rooms/${roomCode}/gameState/assignments`));
                if (snapshot.exists()) {
                    const assignments = snapshot.val();
                    const readyCount = Object.values(assignments).filter(p => p.ready).length;
                    const totalCount = Object.values(assignments).length;

                    // Check if our local state is out of sync
                    const localReadyCount = allPlayersStatus.filter(p => p.ready).length;
                    if (localReadyCount !== readyCount) {
                        console.log(`[PERIODIC SYNC] Detected sync issue: local=${localReadyCount}, firebase=${readyCount}`);
                        // Force update
                        const statusList = Object.values(assignments).map(p => ({
                            id: p.id,
                            name: p.name,
                            ready: p.ready || false,
                            avatarId: p.avatarId,
                            order: p.order || 0
                        })).sort((a, b) => a.order - b.order);
                        setAllPlayersStatus(statusList);
                    }
                }
            } catch (error) {
                console.error("[PERIODIC SYNC] Error:", error);
            }
        }, 2000); // Check every 2 seconds (more frequent)

        // Check for room existence occasionally or via specific listener? 
        // Let's add a disconnect check or root check if needed.
        // For now, simpler is better.

        return () => {
            off(statusRef);
            off(gameStateRef);
            off(assignmentsRef);
            off(roomRef);
            if (syncInterval) clearInterval(syncInterval); // Clean up periodic sync
        };
    }, [isWifi]);

    const handleNext = async () => {
        if (isWifi) {
            // Wi-Fi mode - Enhanced ready handling
            if (readyStatus) {
                console.log("Player already ready, ignoring click");
                return; // Prevent double-clicks
            }

            setReadyStatus(true); // Optimistic UI update
            console.log(`Player ${params.playerId} clicking ready...`);

            try {
                await setPlayerReady(params.roomCode, params.playerId);
                console.log(`Player ${params.playerId} ready status sent to Firebase`);
            } catch (error) {
                console.error("Failed to sync ready state", error);
                setReadyStatus(false); // Revert on error
                Alert.alert("Connection Error", "Failed to update ready status. Please try again.");
            }
        } else {
            // Local mode
            if (currentIndex < assignedPlayers.length - 1) {
                setCurrentIndex(currentIndex + 1);
            } else {
                navigation.replace('WhoStarts', {
                    players: assignedPlayers,
                    language: params.language
                });
            }
        }
    };

    if (assignedPlayers.length === 0) {
        return (
            <View style={styles.container}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
                <Text style={styles.loading}>DEALING CARDS...</Text>
            </View>
        );
    }

    const currentPlayer = assignedPlayers[currentIndex];

    // Button Logic
    let buttonTitle = "NEXT PLAYER";
    if (!isWifi) {
        if (currentIndex === assignedPlayers.length - 1) buttonTitle = "START GAME";
    } else {
        buttonTitle = readyStatus ? "WAITING..." : "I'M READY";
    }

    return (
        <LinearGradient style={styles.container} colors={theme.colors.backgroundGradient || [theme.colors.background, theme.colors.background, theme.colors.background]}>
            {/* Kodak Film Header for WiFi */}
            {isWifi && (
                <View style={styles.filmHeader}>
                    <View style={styles.filmStrip}>
                        {[...Array(16)].map((_, i) => (
                            <View key={i} style={styles.filmHole} />
                        ))}
                    </View>
                </View>
            )}

            {/* Voice Control for Wifi Mode */}
            {isWifi && <VoiceControl />}

            <Text
                style={[styles.header, isWifi && styles.kodakHeader]}
                numberOfLines={1}
                adjustsFontSizeToFit
                minimumFontScale={0.5}
            >
                {isWifi ? "YOUR SECRET ROLE" : `PASS TO ${currentPlayer.name?.toUpperCase()}`}
            </Text>

            <RoleCard
                key={`player-${currentIndex}`}
                player={currentPlayer}
                category={params.category || params.crewCategory}
                impostorHint={params.impostorHint}
                hintsEnabled={params.hintsEnabled}
                onNext={handleNext}
                language={isWifi ? gameLanguage : (params.language || 'en')}
                buttonTitle={buttonTitle}
                disabled={readyStatus}
                isWifi={isWifi}
                playerIndex={currentIndex}
            />

            {/* Ready Status List for WiFi Mode */}
            {isWifi && (
                <View style={styles.statusListContainer}>
                    <Text style={[styles.statusHeader, styles.kodakStatusHeader]}>PLAYER STATUS</Text>
                    <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        contentContainerStyle={styles.statusListContent}
                    >
                        {allPlayersStatus.map((p) => (
                            <TouchableOpacity
                                key={p.id}
                                style={[styles.statusItem, styles.kodakStatusItem, p.ready && styles.statusItemReady, p.ready && styles.kodakStatusItemReady]}
                                onPress={() => { playHaptic('light'); Alert.alert('Player', p.name); }}
                            >
                                {p.customAvatarConfig ? (
                                    <CustomBuiltAvatar config={p.customAvatarConfig} size={30} />
                                ) : (
                                    <CustomAvatar id={p.avatarId} size={30} />
                                )}
                                <View style={[styles.statusBadge, styles.kodakStatusBadge]}>
                                    {p.ready ? (
                                        <Text style={styles.checkMark}>✓</Text>
                                    ) : (
                                        <ActivityIndicator size={10} color={theme.colors.secondary} />
                                    )}
                                </View>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                    <Text style={[styles.statusCount, styles.kodakStatusCount]}>
                        {allPlayersStatus.filter(p => p.ready).length} / {allPlayersStatus.length} READY
                    </Text>
                </View>
            )}

            {/* Local Pass & Play Progress dots */}
            {!isWifi && (
                <View style={styles.progressContainer}>
                    <Text style={styles.progress}>
                        PLAYER {currentIndex + 1} / {assignedPlayers.length}
                    </Text>
                    <View style={styles.progressBar}>
                        {assignedPlayers.map((_, index) => (
                            <View
                                key={index}
                                style={[
                                    styles.progressDot,
                                    index <= currentIndex && styles.progressDotActive
                                ]}
                            />
                        ))}
                    </View>
                </View>
            )}

            {/* Kodak Film Footer for WiFi */}
            {isWifi && (
                <View style={styles.filmFooter}>
                    <View style={styles.filmStrip}>
                        {[...Array(16)].map((_, i) => (
                            <View key={i} style={styles.filmHole} />
                        ))}
                    </View>
                </View>
            )}
        </LinearGradient>
    );
}

function getStyles(theme) {
    return StyleSheet.create({
        container: {
            flex: 1,
            backgroundColor: theme.colors.background,
            alignItems: 'center',
            justifyContent: 'center',
            padding: theme.spacing.m,
        },

        // Kodak Film Strip Decorations
        filmHeader: {
            width: '100%',
            position: 'absolute',
            top: 45,
            left: 0,
            right: 0,
        },
        filmFooter: {
            width: '100%',
            position: 'absolute',
            bottom: 10,
            left: 0,
            right: 0,
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

        header: {
            fontSize: 28,
            color: theme.colors.tertiary,
            marginBottom: theme.spacing.s,
            textAlign: 'center',
            fontFamily: theme.fonts.header,
            letterSpacing: 2,
            textTransform: 'uppercase',
        },
        kodakHeader: {
            color: theme.colors.text,
            ...theme.textShadows.depth,
            letterSpacing: 4,
        },
        loading: {
            color: theme.colors.text,
            fontSize: 24,
            fontFamily: theme.fonts.header,
            textAlign: 'center',
            marginTop: 20,
        },
        // Local Progress
        progressContainer: {
            alignItems: 'center',
            marginTop: theme.spacing.l,
            gap: theme.spacing.s,
            width: '100%',
        },
        progress: {
            color: theme.colors.textSecondary,
            fontSize: theme.fontSize.small,
            fontFamily: theme.fonts.medium,
            letterSpacing: 2,
            width: '90%',
            textAlign: 'center',
        },
        progressBar: {
            flexDirection: 'row',
            gap: 6,
        },
        progressDot: {
            width: 12,
            height: 6,
            borderRadius: 3,
            backgroundColor: theme.colors.surface,
            borderWidth: 1,
            borderColor: theme.colors.textSecondary,
        },
        progressDotActive: {
            backgroundColor: theme.colors.primary,
            borderColor: theme.colors.primary,
            width: 24,
        },
        // WiFi Status
        statusListContainer: {
            marginTop: 15,
            height: 75,
            width: '100%',
            alignItems: 'center',
        },
        statusHeader: {
            color: theme.colors.textSecondary,
            fontSize: 10,
            fontFamily: theme.fonts.bold,
            letterSpacing: 1,
            marginBottom: 8,
        },
        kodakStatusHeader: {
            color: theme.colors.tertiary,
            letterSpacing: 3,
        },
        statusListContent: {
            alignItems: 'center',
            gap: 12,
            paddingHorizontal: 20
        },
        statusItem: {
            width: 40,
            height: 40,
            borderRadius: 20,
            borderWidth: 2,
            borderColor: theme.colors.textMuted,
            justifyContent: 'center',
            alignItems: 'center',
            position: 'relative'
        },
        kodakStatusItem: {
            borderColor: theme.colors.textMuted,
        },
        statusItemReady: {
            borderColor: theme.colors.success
        },
        kodakStatusItemReady: {
            borderColor: theme.colors.primary,
        },
        statusBadge: {
            position: 'absolute',
            bottom: -4,
            right: -4,
            width: 16,
            height: 16,
            borderRadius: 8,
            backgroundColor: theme.colors.textSecondary,
            justifyContent: 'center',
            alignItems: 'center',
            borderWidth: 1,
            borderColor: theme.colors.background
        },
        kodakStatusBadge: {
            backgroundColor: theme.colors.primary,
            borderColor: theme.colors.background,
        },
        checkMark: {
            color: theme.colors.background,
            fontSize: 10,
            fontWeight: 'bold'
        },
        statusCount: {
            marginTop: 8,
            color: theme.colors.primary,
            fontFamily: theme.fonts.bold
        },
        kodakStatusCount: {
            color: theme.colors.text,
            letterSpacing: 2,
        }
    });
}

