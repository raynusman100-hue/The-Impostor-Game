import React, { useState, useEffect, useRef, useCallback } from 'react';
import { View, Text, StyleSheet, BackHandler } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../utils/ThemeContext';
import { CustomAvatar } from '../utils/AvatarGenerator';
import { database } from '../utils/firebase';
import { ref, get, onValue, off, update } from 'firebase/database';
import { playHaptic } from '../utils/haptics';
import VoiceControl from '../components/VoiceControl';
import { useVoiceChat } from '../utils/VoiceChatContext';

export default function WifiWhoStartsScreen({ route, navigation }) {
    const { theme } = useTheme();
    const styles = getStyles(theme);
    const { roomCode, playerId, playerCount } = route.params;

    console.log(`🎯 WHO STARTS: Player ${playerId} entered screen for room ${roomCode}`);

    const [startPlayer, setStartPlayer] = useState(null);
    const isHost = playerId === 'host-id';
    const [countdown, setCountdown] = useState(5);
    const hasNavigated = useRef(false);
    const startPlayerSet = useRef(false);
    
    console.log(`🎯 WHO STARTS: isHost = ${isHost}, playerId = ${playerId}`);

    // Disable back button
    useEffect(() => {
        const backHandler = BackHandler.addEventListener('hardwareBackPress', () => true);
        return () => backHandler.remove();
    }, []);

    const navigateToDiscussion = useCallback(() => {
        if (hasNavigated.current) return;
        hasNavigated.current = true;

        playHaptic('medium');
        navigation.replace('Discussion', {
            timeLeft: playerCount * 60,
            mode: 'wifi',
            roomCode,
            playerId
        });
    }, [navigation, playerCount, roomCode, playerId]);

    // Timeout fallback - if no starting player after 3 seconds, go to discussion anyway
    useEffect(() => {
        const timeout = setTimeout(() => {
            if (!startPlayer && !hasNavigated.current) {
                console.log("[WifiWhoStarts] Timeout - no starting player, navigating anyway");
                navigateToDiscussion();
            }
        }, 3000);

        return () => clearTimeout(timeout);
    }, [startPlayer, navigateToDiscussion]);

    // Host picks and sets starting player, others ONLY listen for it from Firebase
    useEffect(() => {
        if (startPlayerSet.current) return;

        const gameStateRef = ref(database, `rooms/${roomCode}/gameState`);

        // Listen for starting player updates FIRST (for all players)
        const unsubscribe = onValue(gameStateRef, (snapshot) => {
            if (!snapshot.exists()) return;

            const gameState = snapshot.val();
            if (gameState.startingPlayerId) {
                const assignments = gameState.assignments || {};
                const players = Object.values(assignments);
                const starter = players.find(p => p.id === gameState.startingPlayerId);

                if (starter) {
                    console.log("[WifiWhoStarts] Firebase has starter:", starter.name);
                    startPlayerSet.current = true;
                    setStartPlayer(starter);
                } else if (gameState.startingPlayerName) {
                    console.log("[WifiWhoStarts] Using stored name from Firebase:", gameState.startingPlayerName);
                    startPlayerSet.current = true;
                    setStartPlayer({
                        id: gameState.startingPlayerId,
                        name: gameState.startingPlayerName,
                        avatarId: gameState.startingPlayerAvatar || 1
                    });
                }
            }
        });

        // Only HOST sets the starting player if not already set
        const setupStartingPlayer = async () => {
            if (!isHost) {
                console.log("[WifiWhoStarts] Not host, waiting for Firebase...");
                return; // Non-host players only listen, never set
            }

            try {
                const snapshot = await get(gameStateRef);

                if (!snapshot.exists()) {
                    console.log("[WifiWhoStarts] No game state found");
                    return;
                }

                const gameState = snapshot.val();
                const assignments = gameState.assignments || {};
                const players = Object.values(assignments);

                console.log("[WifiWhoStarts] Host checking - Players:", players.length);
                console.log("[WifiWhoStarts] Existing startingPlayerId:", gameState.startingPlayerId);

                // If starting player already set, don't override
                if (gameState.startingPlayerId) {
                    console.log("[WifiWhoStarts] Starting player already set, skipping");
                    return;
                }

                // Host picks the starting player
                if (players.length > 0) {
                    const randomPlayer = players[Math.floor(Math.random() * players.length)];
                    console.log("[WifiWhoStarts] Host picking starter:", randomPlayer.name);

                    // Save to Firebase so all devices see the same player
                    await update(gameStateRef, {
                        startingPlayerId: randomPlayer.id,
                        startingPlayerName: randomPlayer.name,
                        startingPlayerAvatar: randomPlayer.avatarId || 1
                    });

                    // The onValue listener above will pick this up and set the state
                }
            } catch (error) {
                console.error("[WifiWhoStarts] Error setting starting player:", error);
            }
        };

        // Small delay for host to ensure Firebase listener is ready
        if (isHost) {
            setTimeout(setupStartingPlayer, 300);
        }

        return () => off(gameStateRef);
    }, [roomCode, isHost]);

    // Auto-countdown to discussion
    useEffect(() => {
        if (!startPlayer) return;

        const timer = setInterval(() => {
            setCountdown(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [startPlayer]);

    // Navigate when countdown reaches 0
    useEffect(() => {
        if (countdown === 0 && startPlayer && !hasNavigated.current) {
            navigateToDiscussion();
        }
    }, [countdown, startPlayer, navigateToDiscussion]);

    // Voice Chat
    const { joinChannel } = useVoiceChat();
    useEffect(() => {
        if (roomCode) {
            joinChannel(roomCode, 0);
        }
    }, [roomCode]);

    if (!startPlayer) {
        return (
            <LinearGradient style={styles.loadingContainer} colors={theme.colors.backgroundGradient || [theme.colors.background, theme.colors.background]}>
                <Text style={styles.loading}>PREPARING...</Text>
            </LinearGradient>
        );
    }

    return (
        <LinearGradient style={styles.container} colors={theme.colors.backgroundGradient || [theme.colors.background, theme.colors.background]}>
            <VoiceControl />
            {/* Film Strip Header */}
            <View style={styles.filmHeader}>
                <View style={styles.filmStrip}>
                    {[...Array(16)].map((_, i) => (
                        <View key={i} style={styles.filmHole} />
                    ))}
                </View>
            </View>

            <View style={styles.content}>
                <Text style={styles.title}>DISCUSSION STARTS WITH</Text>

                <View style={styles.playerContainer}>
                    <View style={styles.avatarWrapper}>
                        <CustomAvatar id={startPlayer.avatarId || 1} size={120} />
                    </View>
                    <Text style={styles.playerName}>{startPlayer.name?.toUpperCase()}</Text>
                </View>

                <Text style={styles.hint}>THEY WILL GIVE THE FIRST CLUE</Text>
            </View>

            <View style={styles.footer}>
                <View style={styles.countdownContainer}>
                    <Text style={styles.countdownLabel}>STARTING IN</Text>
                    <Text style={styles.countdown}>{countdown}</Text>
                </View>
            </View>

            {/* Film Strip Footer */}
            <View style={styles.filmFooter}>
                <View style={styles.filmStrip}>
                    {[...Array(16)].map((_, i) => (
                        <View key={i} style={styles.filmHole} />
                    ))}
                </View>
            </View>
        </LinearGradient>
    );
}

function getStyles(theme) {
    return StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
        padding: theme.spacing.l,
        justifyContent: 'space-between',
    },
    loadingContainer: {
        flex: 1,
        backgroundColor: theme.colors.background,
        justifyContent: 'center',
        alignItems: 'center',
    },
    filmHeader: {
        position: 'absolute',
        top: 45,
        left: 0,
        right: 0,
    },
    filmFooter: {
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
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 60,
    },
    title: {
        fontSize: 28,
        color: theme.colors.tertiary,
        fontFamily: theme.fonts.header,
        letterSpacing: 4,
        marginBottom: theme.spacing.xl,
        textAlign: 'center',
        ...theme.textShadows?.softDepth,
    },
    playerContainer: {
        alignItems: 'center',
        marginBottom: theme.spacing.xl,
    },
    avatarWrapper: {
        marginBottom: theme.spacing.l,
        borderWidth: 3,
        borderColor: theme.colors.primary,
        borderRadius: 70,
        padding: 5,
    },
    playerName: {
        fontSize: 48,
        color: theme.colors.text,
        fontFamily: theme.fonts.header,
        textAlign: 'center',
        letterSpacing: 3,
        ...theme.textShadows?.depth,
    },
    hint: {
        fontSize: 14,
        color: theme.colors.textMuted,
        fontFamily: theme.fonts.medium,
        letterSpacing: 2,
        textAlign: 'center',
    },
    footer: {
        paddingBottom: theme.spacing.xl,
        alignItems: 'center',
    },
    countdownContainer: {
        alignItems: 'center',
        marginBottom: theme.spacing.l,
    },
    countdownLabel: {
        fontSize: 12,
        color: theme.colors.textMuted,
        fontFamily: theme.fonts.medium,
        letterSpacing: 2,
        marginBottom: theme.spacing.xs,
    },
    countdown: {
        fontSize: 64,
        color: theme.colors.primary,
        fontFamily: theme.fonts.header,
        ...theme.textShadows?.depth,
    },
    loading: {
        color: theme.colors.text,
        fontSize: 24,
        fontFamily: theme.fonts.header,
        textAlign: 'center',
    },
});
}
