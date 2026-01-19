import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Vibration, Alert, BackHandler, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../utils/ThemeContext';
import Button from '../components/Button';
import KodakButton from '../components/KodakButton';
import { database } from '../utils/firebase';
import { ref, onValue, off, update, remove, get } from 'firebase/database';
import { playHaptic } from '../utils/haptics';
import AdManager from '../utils/AdManager';
import AdComponent from '../components/AdComponent';

import { CustomAvatar } from '../utils/AvatarGenerator';
import { CustomBuiltAvatar } from '../components/CustomAvatarBuilder';
import VoiceControl from '../components/VoiceControl';
import { useVoiceChat } from '../utils/VoiceChatContext';

export default function ResultScreen({ route, navigation }) {
    const { theme } = useTheme();
    const styles = getStyles(theme);
    const { players, winners, mode } = route.params;
    const [isRevealed, setIsRevealed] = useState(false);

    const isWifi = mode === 'wifi';
    const roomCode = route.params.roomCode;
    const playerId = route.params.playerId;

    // Room Data for Avatar Lookup
    const [roomData, setRoomData] = useState(null);

    // Voice Chat
    const { joinChannel } = useVoiceChat();
    useEffect(() => {
        if (isWifi && roomCode) {
            joinChannel(roomCode, 0);
        }
    }, [isWifi, roomCode]);

    // Disable Android back button in WiFi mode
    useEffect(() => {
        if (!isWifi) return;

        const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
            // Simply block back button on result screen
            return true;
        });

        return () => backHandler.remove();
    }, [isWifi]);

    const [gameStateData, setGameStateData] = useState(null);
    const [hasNavigated, setHasNavigated] = useState(false);
    const fadeAnim = useRef(new Animated.Value(0)).current;

    // For WiFi mode, get data from Firebase game state, for local mode use route params
    const impostors = isWifi && gameStateData?.impostors
        ? gameStateData.impostors
        : players.filter(p => p.role === 'Impostor' || p.isImposter);

    // Helper to get avatar config for an impostor
    const getImpostorAvatar = (imp) => {
        if (isWifi) {
            // Try to find in roomData.players
            if (roomData?.players) {
                // First try by ID if available
                if (imp.id && roomData.players[imp.id]) return roomData.players[imp.id];
                // Fallback to name match
                const found = Object.values(roomData.players).find(p => p.name === imp.name);
                if (found) return found;
            }
            // If not found (or data not loaded), return imp as fallback (might have avatarId)
            return imp;
        } else {
            // Local mode - imp is the player object
            return imp;
        }
    };

    // FIX: Better secret word extraction - prioritize Firebase data
    const secretWord = (() => {
        // First try from gameStateData (WiFi mode) - this is the most reliable source
        if (isWifi && gameStateData?.secretWord) {
            console.log("🎯 RESULT: Using secretWord from gameStateData:", gameStateData.secretWord);
            return gameStateData.secretWord;
        }

        // Then try from route params
        if (route.params.secretWord) {
            console.log("🎯 RESULT: Using secretWord from route params:", route.params.secretWord);
            return route.params.secretWord;
        }

        // Then try from players array - find a citizen with a real word (not "Imposter")
        const citizenPlayer = players.find(p => {
            const isCitizen = p.role === 'Citizen' || !p.isImposter;
            const hasValidWord = p.word && p.word !== 'Imposter' && p.word !== 'IMPOSTER';
            const hasOriginalWord = p.originalWord && p.originalWord !== 'Imposter';
            return isCitizen && (hasValidWord || hasOriginalWord);
        });

        if (citizenPlayer) {
            const word = citizenPlayer.originalWord || citizenPlayer.word;
            console.log("🎯 RESULT: Using secretWord from citizen player:", word);
            return word;
        }

        console.log("🎯 RESULT: Could not find secretWord, using Unknown");
        return "Unknown";
    })();

    useEffect(() => {
        if (isRevealed) {
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 500,
                useNativeDriver: true,
            }).start();
        }
    }, [isRevealed]);

    // LOAD GAME STATE DATA FOR WIFI MODE - Use listener for real-time updates
    useEffect(() => {
        if (!isWifi || !roomCode) return;

        console.log("🎯 RESULT: Setting up game state listener");
        const gameStateRef = ref(database, `rooms/${roomCode}/gameState`);

        const unsubscribe = onValue(gameStateRef, (snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.val();
                console.log("🎯 RESULT: Game state updated:", {
                    secretWord: data.secretWord,
                    winners: data.winners,
                    impostors: data.impostors
                });
                setGameStateData(data);
            }
        }, (error) => {
            console.error("🎯 RESULT: Game state listener error:", error);
        });

        return () => {
            off(gameStateRef);
        };
    }, [isWifi, roomCode]);

    // Load Interstitial on Mount
    useEffect(() => {
        AdManager.loadInterstitial();
    }, []);

    // SIMPLE AND STABLE NAVIGATION LISTENER + PERIODIC CHECK
    useEffect(() => {
        if (!isWifi || !roomCode) return;

        let hasNavigatedLocal = false;

        const navigateToLobby = (data) => {
            if (hasNavigatedLocal) return;
            hasNavigatedLocal = true;
            setHasNavigated(true);

            const isHost = playerId === 'host-id' || data.hostId === playerId;

            if (isHost) {
                console.log("🔄 RESULT: Navigating HOST to host screen with existing room:", roomCode);
                navigation.replace('Host', {
                    playerData: {
                        name: data.host || 'Host',
                        avatarId: data.hostAvatar || 1,
                        uid: playerId
                    },
                    existingRoomCode: roomCode
                });
            } else {
                // Check if player still exists in the room before navigating to lobby
                const playerStillInRoom = data.players && data.players[playerId];

                if (!playerStillInRoom) {
                    // Player already left - don't navigate them anywhere, just ignore
                    // They're already on their way home or already there
                    console.log("🔄 RESULT: Player no longer in room, ignoring lobby navigation");
                    hasNavigatedLocal = true; // Prevent further navigation attempts
                    return;
                }

                console.log("🔄 RESULT: Navigating PLAYER to lobby, room:", roomCode);
                const playerName = data.players?.[playerId]?.name ||
                    players.find(p => p.id === playerId)?.name || 'Player';
                navigation.replace('WifiLobby', {
                    roomCode,
                    playerId: playerId,
                    playerName: playerName
                });
            }
        };

        console.log("🎯 RESULT: Setting up room listener for player:", playerId);
        const roomRef = ref(database, `rooms/${roomCode}`);

        const handleRoomUpdate = (snapshot) => {
            const data = snapshot.val();

            if (!data) {
                console.log("🚨 RESULT: Room deleted");
                if (!hasNavigatedLocal) {
                    hasNavigatedLocal = true;
                    setHasNavigated(true);
                    Alert.alert('Room Closed', 'The host has ended the game.');
                    navigation.navigate('Home');
                }
                return;
            }

            // Save room Data for Avatar lookup
            setRoomData(data);

            console.log(`🎯 RESULT: [${playerId}] Room status = ${data.status}`);

            if (data.status === 'lobby' && !hasNavigatedLocal) {
                console.log("🔄 RESULT: Status is LOBBY - navigating!");
                navigateToLobby(data);
            } else if (data.status === 'reveal' && !hasNavigatedLocal) {
                console.log("🔄 RESULT: Status changed to REVEAL");
                hasNavigatedLocal = true;
                setHasNavigated(true);
                navigation.replace('RoleReveal', {
                    mode: 'wifi',
                    roomCode,
                    playerId: playerId,
                    category: 'all'
                });
            }
        };

        const unsubscribe = onValue(roomRef, handleRoomUpdate, (error) => {
            console.error("🚨 RESULT: Listener error:", error);
        });

        // BACKUP: Periodic check every 2 seconds in case listener misses update
        const checkInterval = setInterval(async () => {
            if (hasNavigatedLocal) {
                clearInterval(checkInterval);
                return;
            }

            try {
                const snapshot = await get(roomRef);
                const data = snapshot.val();

                if (data && data.status === 'lobby' && !hasNavigatedLocal) {
                    console.log("🔄 RESULT: [PERIODIC CHECK] Status is LOBBY - navigating!");
                    clearInterval(checkInterval);
                    navigateToLobby(data);
                }
            } catch (err) {
                console.error("🚨 RESULT: Periodic check error:", err);
            }
        }, 2000);

        return () => {
            console.log("🎯 RESULT: Cleaning up listener");
            off(roomRef);
            clearInterval(checkInterval);
        };
    }, [isWifi, roomCode, playerId, navigation, players]);

    const handleReveal = () => {
        playHaptic('heavy');
        // Dramatic vibration pattern: 500ms on, 200ms off, 500ms on
        Vibration.vibrate([0, 500, 200, 500]);
        setIsRevealed(true);
    };

    const handlePlayAgain = async () => {
        playHaptic('medium');

        if (isWifi) {
            console.log("🔄 PLAY AGAIN: Starting process for room:", roomCode);

            try {
                const roomRef = ref(database, `rooms/${roomCode}`);
                const roomSnapshot = await get(roomRef);

                if (!roomSnapshot.exists()) {
                    Alert.alert('Error', 'Room no longer exists.');
                    navigation.navigate('Home');
                    return;
                }

                const roomData = roomSnapshot.val();

                // Verify host
                const isHost = playerId === 'host-id' || roomData.hostId === playerId;
                if (!isHost) {
                    Alert.alert('Not Authorized', 'Only the host can return to lobby.');
                    return;
                }

                console.log("🔄 PLAY AGAIN: Host verified, resetting room to lobby");

                // Clear game state first
                await remove(ref(database, `rooms/${roomCode}/gameState`));

                // Update room to lobby status - keep the same room!
                await update(roomRef, {
                    status: 'lobby',
                    lastActionAt: Date.now(),
                    gameStarted: false,
                    gameInProgress: false,
                    hostDisconnected: false,
                    hostLeft: false
                });

                console.log("✅ PLAY AGAIN: Room reset complete, navigating host to lobby with SAME room code:", roomCode);

                console.log("✅ PLAY AGAIN: Room reset complete, navigating host to lobby with SAME room code:", roomCode);

                // Show Ad before navigating
                AdManager.showInterstitial(() => {
                    // DIRECT NAVIGATION for host - pass the EXISTING room code
                    setHasNavigated(true);
                    navigation.replace('Host', {
                        playerData: {
                            name: roomData.host || 'Host',
                            avatarId: roomData.hostAvatar || 1,
                            uid: playerId
                        },
                        existingRoomCode: roomCode  // PASS THE EXISTING ROOM CODE
                    });
                });

            } catch (error) {
                console.error("🚨 PLAY AGAIN: Error:", error);
                Alert.alert('Error', 'Failed to return to lobby. Please try again.');
            }
        } else {
            // Local mode
            // Local mode
            AdManager.showInterstitial(() => {
                navigation.reset({
                    index: 1,
                    routes: [
                        { name: 'Home' },
                        { name: 'Setup', params: { players, impostorCount: impostors.length } }
                    ]
                });
            });
        }
    };

    const handleLeaveRoom = async () => {
        playHaptic('medium');

        if (isWifi) {
            const roomCode = route.params.roomCode;
            const playerId = route.params.playerId;

            try {
                // Remove player from room
                if (playerId !== 'host-id') {
                    const playerRef = ref(database, `rooms/${roomCode}/players/${playerId}`);
                    await remove(playerRef);
                }

                // Navigate to home
                AdManager.showInterstitial(() => {
                    navigation.navigate('Home');
                });

            } catch (error) {
                console.error("Leave Room Error:", error);
                // Even on error, try to show ad then go home
                AdManager.showInterstitial(() => {
                    navigation.navigate('Home');
                });
            }
        } else {
            AdManager.showInterstitial(() => {
                navigation.navigate('Home');
            });
        }
    };

    return (
        <LinearGradient style={styles.container} colors={theme.colors.backgroundGradient || [theme.colors.background, theme.colors.background, theme.colors.background]}>
            {isWifi && <VoiceControl />}
            <SafeAreaView style={styles.safeArea}>
                {/* Kodak Film Header */}
                {isWifi && (
                    <View style={styles.filmHeader}>
                        <View style={styles.filmStrip}>
                            {[...Array(16)].map((_, i) => (
                                <View key={i} style={styles.filmHole} />
                            ))}
                        </View>
                    </View>
                )}

                {!isRevealed ? (
                    <View style={styles.hiddenContainer}>
                        <Text style={[styles.title, isWifi && styles.kodakTitle]}>ROUND OVER</Text>
                        {isWifi && winners && (
                            <View style={styles.winnerContainer}>
                                <Text style={[styles.winnerBanner, isWifi && styles.kodakWinner]}>
                                    {winners} WIN!
                                </Text>
                            </View>
                        )}
                        <Text style={[styles.subtitle, isWifi && styles.kodakSubtitle]}>READY TO SEE THE TRUTH?</Text>
                        {isWifi ? (
                            <KodakButton
                                title="REVEAL TRUTH"
                                onPress={handleReveal}
                                variant="primary"
                                style={styles.revealBtn}
                                size="large"
                            />
                        ) : (
                            <Button
                                title="REVEAL TRUTH"
                                onPress={handleReveal}
                                style={styles.revealBtn}
                            />
                        )}
                    </View>
                ) : (
                    <Animated.View
                        style={[
                            styles.revealedContainer,
                            { opacity: fadeAnim }
                        ]}
                    >
                        <ScrollView
                            contentContainerStyle={styles.scrollContent}
                            showsVerticalScrollIndicator={false}
                        >
                            <Text style={[styles.revealTitle, isWifi && styles.kodakRevealTitle]}>TRUTH REVEALED</Text>

                            <View style={[styles.resultCard, isWifi && styles.kodakCard]}>
                                <View style={styles.cardContent}>
                                    <Text style={[styles.label, isWifi && styles.kodakLabel]}>SECRET WORD</Text>
                                    <Text style={[styles.word, isWifi && styles.kodakWord]}>{secretWord}</Text>
                                </View>
                                {/* Film perforation decoration */}
                                {isWifi && (
                                    <View style={styles.cardFilmStrip}>
                                        {[...Array(8)].map((_, i) => (
                                            <View key={i} style={styles.cardFilmHole} />
                                        ))}
                                    </View>
                                )}
                            </View>

                            <View style={[styles.resultCard, styles.impostorCard, isWifi && styles.kodakImpostorCard]}>
                                <View style={[styles.cardContent, { gap: 10 }]}>
                                    <Text style={[styles.labelInverted, isWifi && styles.kodakImpostorLabel]}>
                                        {impostors.length > 1 ? 'IMPOSTORS' : 'IMPOSTOR'}
                                    </Text>
                                    {impostors.map((imp, index) => {
                                        const pData = getImpostorAvatar(imp);
                                        return (
                                            <TouchableOpacity
                                                key={index}
                                                activeOpacity={isWifi ? 0.8 : 1}
                                                onPress={() => {
                                                    if (isWifi) {
                                                        playHaptic('light');
                                                        Alert.alert('Impostor', pData.name);
                                                    }
                                                }}
                                                style={{ alignItems: 'center' }}
                                            >
                                                {/* ONLY SHOW AVATAR IN WIFI MODE */}
                                                {isWifi && (
                                                    pData.customAvatarConfig ? (
                                                        <CustomBuiltAvatar config={pData.customAvatarConfig} size={60} />
                                                    ) : (
                                                        <CustomAvatar id={pData.avatarId || 1} size={60} />
                                                    )
                                                )}

                                                <Text style={[styles.impostorName, isWifi && styles.kodakImpostorName]}>
                                                    {pData.name || imp.name}
                                                </Text>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </View>
                            </View>

                            {/* COMPLETELY REWRITTEN PLAY AGAIN LOGIC */}
                            {isWifi ? (
                                <View style={styles.buttonContainer}>
                                    {route.params.playerId === 'host-id' ? (
                                        // HOST BUTTONS
                                        <>
                                            <KodakButton
                                                title="RETURN TO LOBBY"
                                                onPress={handlePlayAgain}
                                                variant="primary"
                                                style={styles.playAgainBtn}
                                                size="large"
                                            />
                                            <KodakButton
                                                title="LEAVE ROOM"
                                                onPress={handleLeaveRoom}
                                                variant="secondary"
                                                style={styles.leaveBtn}
                                                size="medium"
                                            />
                                        </>
                                    ) : (
                                        // NON-HOST BUTTONS
                                        <>
                                            <View style={[styles.waitingContainer, styles.kodakWaiting]}>
                                                <Text style={styles.waitingText}>
                                                    WAITING FOR HOST TO RETURN TO LOBBY...
                                                </Text>
                                            </View>
                                            <KodakButton
                                                title="LEAVE ROOM"
                                                onPress={handleLeaveRoom}
                                                variant="secondary"
                                                style={styles.leaveBtn}
                                                size="medium"
                                            />
                                        </>
                                    )}
                                </View>
                            ) : (
                                // LOCAL MODE
                                <Button
                                    title="PLAY AGAIN"
                                    onPress={handlePlayAgain}
                                    style={styles.playAgainBtn}
                                    variant="primary"
                                />
                            )}
                        </ScrollView>
                    </Animated.View>
                )}

                {/* Kodak Film Footer */}
                {isWifi && (
                    <View style={styles.filmFooter}>
                        <View style={styles.filmStrip}>
                            {[...Array(16)].map((_, i) => (
                                <View key={i} style={styles.filmHole} />
                            ))}
                        </View>
                    </View>
                )}
            </SafeAreaView>
        </LinearGradient>
    );
}

const getStyles = (theme) => StyleSheet.create({
    container: { flex: 1 },
    safeArea: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: theme.spacing.m },

    // Kodak Film Strip Decorations
    filmHeader: {
        width: '100%',
        paddingTop: 10,
        position: 'absolute',
        top: 50,
        left: 0,
        right: 0,
    },
    filmFooter: {
        width: '100%',
        paddingBottom: 10,
        position: 'absolute',
        bottom: 20,
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
    cardFilmStrip: {
        position: 'absolute',
        bottom: 8,
        left: 0,
        right: 0,
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        paddingHorizontal: 20,
    },
    cardFilmHole: {
        width: 8,
        height: 5,
        backgroundColor: theme.colors.primary,
        borderRadius: 1,
        opacity: 0.4,
    },

    hiddenContainer: { alignItems: 'center', width: '100%', flex: 1, justifyContent: 'center' },
    revealedContainer: { flex: 1, width: '100%' },
    scrollContent: { alignItems: 'center', paddingTop: theme.spacing.l, paddingBottom: theme.spacing.xl },

    title: { fontSize: 48, fontFamily: theme.fonts.header, color: theme.colors.tertiary, marginBottom: theme.spacing.s, textAlign: 'center', letterSpacing: 4, ...theme.textShadows.depth },
    kodakTitle: {
        color: theme.colors.text,
        ...theme.textShadows.depth,
    },

    subtitle: { fontSize: theme.fontSize.large, color: theme.colors.textSecondary, marginBottom: theme.spacing.xl, fontFamily: theme.fonts.medium, letterSpacing: 2 },
    kodakSubtitle: {
        color: theme.colors.textMuted,
        letterSpacing: 4,
    },

    winnerContainer: {
        marginBottom: 15,
    },
    winnerBanner: { fontSize: 28, fontFamily: theme.fonts.header, marginBottom: 10, letterSpacing: 4, textTransform: 'uppercase' },
    kodakWinner: {
        color: theme.colors.text,
        ...theme.textShadows.depth,
    },

    revealBtn: { paddingVertical: theme.spacing.l, paddingHorizontal: theme.spacing.xl, width: '100%' },

    revealTitle: { fontSize: 28, fontFamily: theme.fonts.header, color: theme.colors.tertiary, marginBottom: theme.spacing.m, textAlign: 'center', letterSpacing: 4, lineHeight: 40, ...theme.textShadows.depth },
    kodakRevealTitle: {
        color: theme.colors.text,
        ...theme.textShadows.depth,
    },

    resultCard: { width: '100%', marginBottom: theme.spacing.m, borderRadius: theme.borderRadius.l, overflow: 'hidden', borderWidth: 1, borderColor: theme.colors.textSecondary, backgroundColor: theme.colors.surface },
    kodakCard: {
        borderWidth: 2,
        borderColor: theme.colors.primary,
        backgroundColor: theme.colors.surface,
        ...theme.shadows.medium,
    },

    impostorCard: { borderColor: theme.colors.error, backgroundColor: 'rgba(205, 92, 92, 0.1)' },
    kodakImpostorCard: {
        borderWidth: 2,
        borderColor: theme.colors.error,
        backgroundColor: 'rgba(255, 59, 48, 0.1)',
    },

    cardContent: { padding: theme.spacing.l, alignItems: 'center', justifyContent: 'center' },

    label: { fontSize: theme.fontSize.medium, color: theme.colors.textSecondary, marginBottom: theme.spacing.s, fontFamily: theme.fonts.medium, letterSpacing: 3, textTransform: 'uppercase' },
    kodakLabel: {
        color: theme.colors.tertiary,
        letterSpacing: 5,
    },

    labelInverted: { fontSize: theme.fontSize.medium, color: theme.colors.text, marginBottom: theme.spacing.s, fontFamily: theme.fonts.medium, letterSpacing: 3, textTransform: 'uppercase' },
    kodakImpostorLabel: {
        color: '#ff6b6b',
        letterSpacing: 5,
    },

    word: { fontSize: 42, color: theme.colors.text, fontFamily: theme.fonts.header, letterSpacing: 2, textAlign: 'center' },
    kodakWord: {
        color: theme.colors.text,
        ...theme.textShadows.softDepth,
    },

    impostorName: { fontSize: 32, color: theme.colors.error, fontFamily: theme.fonts.header, marginVertical: theme.spacing.xs, letterSpacing: 2, textTransform: 'uppercase' },
    kodakImpostorName: {
        color: '#ff6b6b',
    },

    homeBtn: { marginTop: theme.spacing.m, width: '100%', paddingVertical: theme.spacing.m },
    buttonContainer: {
        width: '100%',
        marginTop: theme.spacing.m,
        gap: theme.spacing.m
    },
    playAgainBtn: {
        width: '100%',
        paddingVertical: theme.spacing.m
    },
    leaveBtn: {
        width: '100%',
        paddingVertical: theme.spacing.s,
    },
    waitingContainer: {
        width: '100%',
        paddingVertical: theme.spacing.m,
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: theme.colors.textSecondary,
        borderRadius: theme.borderRadius.m,
        alignItems: 'center',
        justifyContent: 'center'
    },
    kodakWaiting: {
        borderWidth: 2,
        borderColor: theme.colors.primary,
        backgroundColor: theme.colors.surface,
    },
    waitingText: {
        color: theme.colors.tertiary,
        fontFamily: theme.fonts.bold,
        fontSize: 14,
        letterSpacing: 3,
        textAlign: 'center',
    },
});
