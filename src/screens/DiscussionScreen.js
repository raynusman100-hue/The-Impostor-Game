import React, { useState, useEffect, useRef, memo, useCallback } from 'react';
import { View, Text, StyleSheet, Animated, Alert, TouchableOpacity, ScrollView, Platform, BackHandler } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../utils/ThemeContext';
import Button from '../components/Button';
import KodakButton from '../components/KodakButton';
import AnimatedHourglass from '../components/AnimatedHourglass';
import ConfirmModal from '../components/ConfirmModal';
import { playHaptic } from '../utils/haptics';
import { database } from '../utils/firebase';
import { ref, onValue, off, update, set, get, serverTimestamp, remove } from 'firebase/database';
import { safeFirebaseUpdate, verifyRoomAccess } from '../utils/connectionUtils';
import ChatSystem from '../components/ChatSystem';
import VoiceControl from '../components/VoiceControl';
import { useVoiceChat } from '../utils/VoiceChatContext';

// Film perforation component for Kodak aesthetic (same as SetupScreen)
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

export default function DiscussionScreen({ route, navigation }) {
    const { theme } = useTheme();
    const styles = getStyles(theme);
    const params = route.params || {};

    const isWifi = params.mode === 'wifi';
    const roomCode = params.roomCode;
    const playerId = params.playerId || 'guest';

    // State
    const [timeLeft, setTimeLeft] = useState(params.timeLeft || 180);
    const [isPaused, setIsPaused] = useState(false);
    const [endRequests, setEndRequests] = useState({});
    const [consensusCountdown, setConsensusCountdown] = useState(null);
    const [neededToEnd, setNeededToEnd] = useState(0);
    const [totalPlayersCount, setTotalPlayersCount] = useState(0);
    const [imposterCount, setImposterCount] = useState(1); // Track impostor count
    const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
    const [voteTied, setVoteTied] = useState(false); // Track if vote ended in a draw
    const [timerInitialized, setTimerInitialized] = useState(false); // Track if timer was set from Firebase

    // Handle leaving the room
    const handleLeaveRoom = async () => {
        setShowLeaveConfirm(false);
        try {
            if (playerId !== 'host-id') {
                const playerRef = ref(database, `rooms/${roomCode}/players/${playerId}`);
                await remove(playerRef);
            }
            navigation.navigate('Home');
        } catch (error) {
            console.error("Leave room error:", error);
            navigation.navigate('Home');
        }
    };

    // Back button shows confirmation in WiFi mode
    useEffect(() => {
        if (!isWifi) return;

        const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
            setShowLeaveConfirm(true);
            return true;
        });

        return () => backHandler.remove();
    }, [isWifi]);
    const [showChat, setShowChat] = useState(false);
    const [myPlayerName, setMyPlayerName] = useState('Player');
    const [unreadMessages, setUnreadMessages] = useState(0);

    // Enhanced unread message handler
    const handleUnreadChange = useCallback((count) => {
        // Only show unread count when chat is not active
        if (!showChat) {
            setUnreadMessages(count);
        } else {
            setUnreadMessages(0);
        }
    }, [showChat]);

    const isPausedRef = useRef(false);
    const pulseAnim = useRef(new Animated.Value(1)).current;

    // Animation Loop
    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, { toValue: 1.05, duration: 1000, useNativeDriver: true }),
                Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
            ])
        ).start();
    }, []);

    // Periodic Room Verification for Discussion Screen - OPTIMIZED TO PREVENT DOUBLE LOADING
    useEffect(() => {
        if (!isWifi || !roomCode || !playerId) return;

        let verificationActive = true;
        const verifyInterval = setInterval(async () => {
            // Skip verification if component is unmounting or navigation is happening
            if (!verificationActive) return;

            try {
                const { exists, data } = await verifyRoomAccess(roomCode);

                if (!exists) {
                    console.log("DISCUSSION: Room no longer exists during verification");
                    verificationActive = false;
                    clearInterval(verifyInterval);
                    Alert.alert('Room Closed', 'The room has been closed.');
                    navigation.navigate('Home');
                    return;
                }

                // CRITICAL: Only navigate if we're still focused and status actually changed
                if (data.status !== 'discussion' && navigation.isFocused()) {
                    console.log(`DISCUSSION: Room status changed to ${data.status} during verification`);
                    verificationActive = false;
                    clearInterval(verifyInterval);

                    // Small delay to prevent race conditions with main listener
                    setTimeout(() => {
                        if (navigation.isFocused()) {
                            // Handle status change
                            if (data.status === 'voting') {
                                navigation.replace('WifiVoting', { roomCode, userId: playerId });
                            } else if (data.status === 'result') {
                                navigation.replace('Result', {
                                    mode: 'wifi',
                                    roomCode,
                                    playerId: playerId,
                                    winners: data.gameState?.winners || 'Unknown',
                                    players: Object.values(data.gameState?.assignments || {})
                                });
                            } else if (data.status === 'reveal') {
                                navigation.replace('RoleReveal', {
                                    mode: 'wifi',
                                    roomCode,
                                    playerId: playerId,
                                    category: 'all'
                                });
                            }
                        }
                    }, 100);
                }

            } catch (error) {
                console.error("DISCUSSION: Room verification error:", error);
                // Don't navigate away on verification errors
            }
        }, 10000); // Increased to 10 seconds to reduce conflicts

        return () => {
            verificationActive = false;
            clearInterval(verifyInterval);
        };
    }, [isWifi, roomCode, playerId, navigation]);

    // 1. Fetch My Name (Wifi Only)
    useEffect(() => {
        if (isWifi && roomCode && playerId) {
            const playerRef = ref(database, `rooms/${roomCode}/gameState/assignments/${playerId}/name`);
            const unsub = onValue(playerRef, snap => {
                if (snap.exists()) setMyPlayerName(snap.val());
            });
            return () => off(playerRef);
        }
    }, [isWifi, roomCode, playerId]);

    // Voice Chat Integration
    const { joinChannel } = useVoiceChat();
    useEffect(() => {
        if (isWifi && roomCode) {
            joinChannel(roomCode, 0);
        }
    }, [isWifi, roomCode]);

    // 2. Main Game Stream Listener + Room Monitoring - OPTIMIZED TO PREVENT DOUBLE LOADING
    useEffect(() => {
        if (isWifi && roomCode) {
            const roomRef = ref(database, `rooms/${roomCode}`);
            let navigationInProgress = false;

            const unsub = onValue(roomRef, (snapshot) => {
                const data = snapshot.val();
                if (!data) {
                    Alert.alert('Room Closed', 'The host has ended the game.');
                    navigation.navigate('Home');
                    return;
                }

                // ROOM PERSISTENCE: Check if host disconnected or left
                if (data.hostDisconnected || data.hostLeft) {
                    console.log('Host disconnected/left, forcing back to lobby');
                    Alert.alert(
                        'Host Disconnected',
                        'The host has disconnected. Returning to lobby...',
                        [{
                            text: 'OK', onPress: () => {
                                if (playerId === 'host-id') {
                                    // If I'm the host, go to host screen
                                    navigation.navigate('Host', {
                                        playerData: {
                                            name: data.host || 'Host',
                                            avatarId: data.hostAvatar || 1,
                                            uid: data.hostId || 'host-id'
                                        }
                                    });
                                } else {
                                    // If I'm a player, go to lobby
                                    navigation.navigate('WifiLobby', {
                                        roomCode,
                                        playerId: playerId,
                                        playerName: myPlayerName
                                    });
                                }
                            }
                        }]
                    );
                    return;
                }

                // CRITICAL: Prevent double navigation with debouncing
                if (data.status !== 'discussion' && !navigationInProgress && navigation.isFocused()) {
                    navigationInProgress = true;

                    // Status Check: Voting
                    if (data.status === 'voting') {
                        console.log("DISCUSSION: Main listener - navigating to voting");
                        navigation.replace('WifiVoting', { roomCode, userId: playerId });
                        return;
                    } else if (data.status === 'reveal') {
                        // PLAY AGAIN: Navigate back to role reveal
                        console.log("DISCUSSION: Main listener - play again, navigating to role reveal");
                        navigation.replace('RoleReveal', {
                            mode: 'wifi',
                            roomCode,
                            playerId: playerId,
                            category: 'all'
                        });
                        return;
                    }

                    // Reset navigation flag after a delay
                    setTimeout(() => {
                        navigationInProgress = false;
                    }, 1000);
                }

                // Only update state if we're staying in discussion
                if (data.status === 'discussion') {
                    const gameState = data.gameState || {};

                    // Pause Sync
                    if (gameState.isPaused !== undefined) {
                        setIsPaused(gameState.isPaused);
                        isPausedRef.current = gameState.isPaused;
                    }

                    // FIXED: Only set timer ONCE when entering discussion (not continuously)
                    // Use discussionStartedAt to detect a new discussion session
                    if (gameState.discussionDuration && gameState.discussionStartedAt && !timerInitialized) {
                        console.log(`Setting discussion timer to ${gameState.discussionDuration} seconds (new session)`);
                        setTimeLeft(gameState.discussionDuration);
                        setTimerInitialized(true);
                    }

                    // Check if this is a tie/draw situation
                    if (gameState.voteTied) {
                        setVoteTied(true);
                    }

                    // Assignments Info (for calculation)
                    if (gameState.assignments) {
                        const playersList = Object.values(gameState.assignments);
                        setTotalPlayersCount(playersList.length);

                        // For end discussion: ALL players (including impostors) must vote to end
                        // But majority can start 20s countdown
                        setNeededToEnd(playersList.length); // All players needed to end immediately

                        // UNPLAYABLE GAME CHECK: If impostors >= citizens, game is unplayable
                        const currentImposterCount = gameState.imposterCount || 1;
                        const citizenCount = playersList.length - currentImposterCount;

                        if (citizenCount <= currentImposterCount && playersList.length > 0) {
                            console.log(`⚠️ GAME UNPLAYABLE: ${currentImposterCount} impostors vs ${citizenCount} citizens`);

                            // Check if current player is still in the game
                            const isStillInGame = playersList.some(p => p.id === playerId);

                            if (!isStillInGame) {
                                // Player already left - just go home silently
                                console.log("Player already left, navigating home silently");
                                navigation.navigate('Home');
                                return;
                            }

                            Alert.alert(
                                'Game Unplayable',
                                'Too many players have left. The game cannot continue with equal or more impostors than citizens.',
                                [{
                                    text: 'OK',
                                    onPress: async () => {
                                        // Host resets the room, others just go home
                                        if (playerId === 'host-id') {
                                            try {
                                                const roomRef = ref(database, `rooms/${roomCode}`);
                                                await update(roomRef, {
                                                    status: 'lobby',
                                                    'gameState': null,
                                                    gameStarted: false,
                                                    gameInProgress: false
                                                });
                                            } catch (err) {
                                                console.error("Error resetting room:", err);
                                            }
                                        }
                                        navigation.navigate('Home');
                                    }
                                }]
                            );
                            return;
                        }
                    }

                    // Impostor Count Sync
                    if (gameState.imposterCount) {
                        setImposterCount(gameState.imposterCount);
                    }

                    // End Requests Sync
                    if (gameState.endRequests) {
                        setEndRequests(gameState.endRequests);
                    } else {
                        setEndRequests({});
                    }

                    // Consensus Timer Sync
                    if (gameState.consensusExpiresAt) {
                        const now = Date.now();
                        const secondsLeft = Math.ceil((gameState.consensusExpiresAt - now) / 1000);
                        setConsensusCountdown(secondsLeft > 0 ? secondsLeft : 0);
                    } else {
                        setConsensusCountdown(null);
                    }
                }
            });

            return () => off(roomRef);
        }
    }, [isWifi, roomCode, navigation, playerId, timeLeft, myPlayerName]);

    // 3. Local Timer Logic
    useEffect(() => {
        let interval;
        if (!isPaused && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft((prev) => prev - 1);
            }, 1000);
        } else if (timeLeft === 0 && !isPaused && !isWifi) {
            // Local Mode End
            navigation.replace('Result', { players: params.players, language: params.language });
        }
        return () => clearInterval(interval);
    }, [isPaused, timeLeft, isWifi]);

    // 4. Client Side Countdown Tick (Smoothing)
    useEffect(() => {
        if (consensusCountdown !== null && consensusCountdown > 0) {
            const interval = setInterval(() => {
                setConsensusCountdown(prev => (prev > 0 ? prev - 1 : 0));
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [consensusCountdown]);

    // 5. HOST LOGIC: Fixed and Improved
    const timeLeftRef = useRef(timeLeft);
    useEffect(() => { timeLeftRef.current = timeLeft; }, [timeLeft]);

    useEffect(() => {
        if (!isWifi || !roomCode) return;

        let hostInterval = null;

        const runHostLogic = async () => {
            try {
                const assignRef = ref(database, `rooms/${roomCode}/gameState/assignments`);
                const snap = await get(assignRef);
                if (!snap.exists()) return;

                const assignments = snap.val();
                const playersList = Object.values(assignments).sort((a, b) => (a.order || 0) - (b.order || 0));

                // AM I HOST? (ID Match OR First Player Fallback)
                const isHost = playerId === 'host-id' || (playersList.length > 0 && playersList[0].id === playerId);

                if (!isHost) return;

                console.log("I AM HOST - Running Logic Loop");

                hostInterval = setInterval(async () => {
                    try {
                        // Fetch Latest State
                        const roomRef = ref(database, `rooms/${roomCode}`);
                        const roomSnap = await get(roomRef);
                        if (!roomSnap.exists()) {
                            console.log("HOST: Room no longer exists, stopping");
                            clearInterval(hostInterval);
                            return;
                        }

                        const data = roomSnap.val();
                        const gs = data.gameState || {};

                        // Only run if still in discussion
                        if (data.status !== 'discussion') {
                            console.log("HOST: No longer in discussion, stopping");
                            clearInterval(hostInterval);
                            return;
                        }

                        // A. CHECK MAIN TIMER
                        if (timeLeftRef.current <= 0) {
                            console.log("HOST: Time Expired -> Voting");
                            await update(roomRef, {
                                status: 'voting',
                                'gameState/phase': 'voting',
                                'gameState/votingExpiresAt': Date.now() + 15000,
                                'gameState/voteTied': null,
                                'gameState/lastActionAt': serverTimestamp()
                            });
                            clearInterval(hostInterval);
                            return;
                        }

                        // B. CHECK CONSENSUS LOGIC
                        const requests = gs.endRequests || {};
                        const requestCount = Object.values(requests).filter(v => v === true).length;
                        const assignments = gs.assignments || {};
                        const playersList = Object.values(assignments);
                        const totalPlayers = playersList.length;
                        const imposterCount = gs.imposterCount || 1; // Get impostor count from game state

                        // If ALL players have clicked end, immediately go to voting
                        if (requestCount >= totalPlayers && totalPlayers > 0) {
                            console.log("HOST: ALL PLAYERS CLICKED END -> Immediate Voting");
                            await update(roomRef, {
                                status: 'voting',
                                'gameState/phase': 'voting',
                                'gameState/votingExpiresAt': Date.now() + 15000,
                                'gameState/consensusExpiresAt': null,
                                'gameState/endRequests': {},
                                'gameState/voteTied': null,
                                'gameState/lastActionAt': serverTimestamp()
                            });
                            clearInterval(hostInterval);
                            return;
                        }

                        // FIXED LOGIC: Start countdown when remaining players equals impostor count
                        // If Y impostors exist and Y players haven't clicked end, start countdown
                        const remainingPlayers = totalPlayers - requestCount;
                        const shouldStartCountdown = remainingPlayers === imposterCount && imposterCount > 0;

                        if (shouldStartCountdown && totalPlayers > 0) {
                            if (gs.consensusExpiresAt) {
                                // Check if countdown expired
                                if (Date.now() >= gs.consensusExpiresAt) {
                                    console.log("HOST: Consensus Timer Expired -> Voting");
                                    await update(roomRef, {
                                        status: 'voting',
                                        'gameState/phase': 'voting',
                                        'gameState/votingExpiresAt': Date.now() + 15000,
                                        'gameState/consensusExpiresAt': null,
                                        'gameState/endRequests': {},
                                        'gameState/voteTied': null,
                                        'gameState/lastActionAt': serverTimestamp()
                                    });
                                    clearInterval(hostInterval);
                                }
                            } else {
                                // Start 20s countdown
                                console.log(`HOST: Starting 20s Consensus Timer - ${remainingPlayers} players left (equals ${imposterCount} impostors)`);
                                await update(ref(database, `rooms/${roomCode}/gameState`), {
                                    consensusExpiresAt: Date.now() + 20000
                                });
                            }
                        } else if (gs.consensusExpiresAt) {
                            // FIXED: Cancel countdown if condition is no longer met (player un-clicked)
                            console.log("HOST: Cancelling consensus timer - condition no longer met");
                            await update(ref(database, `rooms/${roomCode}/gameState`), {
                                consensusExpiresAt: null
                            });
                        }

                    } catch (error) {
                        console.error("Host logic error:", error);
                        // On error, stop the interval to prevent spam
                        clearInterval(hostInterval);
                    }
                }, 1000);
            } catch (error) {
                console.error("Host setup error:", error);
            }
        };

        runHostLogic();

        return () => {
            if (hostInterval) {
                console.log("HOST: Cleaning up host interval");
                clearInterval(hostInterval);
            }
        };
    }, [isWifi, roomCode, playerId]);

    // Actions
    const handlePauseToggle = useCallback(async () => {
        playHaptic('medium');
        if (isWifi) {
            if (!roomCode) return;
            try {
                await safeFirebaseUpdate(`rooms/${roomCode}/gameState`, {
                    isPaused: !isPaused,
                    lastActionAt: serverTimestamp()
                });
            } catch (err) {
                console.error('Pause toggle error:', err);
                Alert.alert('Error', 'Failed to toggle pause. Please try again.');
            }
        } else {
            setIsPaused(p => !p);
        }
    }, [isWifi, roomCode, isPaused]);

    const toggleEndRequest = useCallback(async () => {
        if (!isWifi) {
            navigation.replace('Result', { players: params.players, language: params.language });
            return;
        }

        playHaptic('medium');
        if (!roomCode || !playerId) return;

        try {
            const currentStatus = endRequests[playerId] || false;
            console.log(`Player ${playerId} toggling end request: ${currentStatus} -> ${!currentStatus}`);

            // Use safe Firebase update with retry logic
            await safeFirebaseUpdate(`rooms/${roomCode}/gameState/endRequests`, {
                [playerId]: !currentStatus
            });

        } catch (err) {
            console.error('End request toggle error:', err);
            Alert.alert('Error', 'Failed to vote end. Please try again.');
        }
    }, [isWifi, roomCode, playerId, endRequests, navigation, params]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    const isLowTime = timeLeft < 30;

    return (
        <LinearGradient style={styles.container} colors={theme.colors.backgroundGradient || [theme.colors.background, theme.colors.background, theme.colors.background]}>
            {/* Film perforations - side strips */}
            <FilmPerforations side="left" theme={theme} />
            <FilmPerforations side="right" theme={theme} />

            <SafeAreaView style={styles.safeArea}>
                {/* Kodak Film Header - Both modes */}
                <View style={styles.filmHeader}>
                    <View style={styles.filmStrip}>
                        {[...Array(16)].map((_, i) => (
                            <View key={i} style={styles.filmHole} />
                        ))}
                    </View>
                </View>

                {/* Voice Control for Wifi Mode */}
                {isWifi && <VoiceControl />}

                {/* Header / Room Code */}
                <View style={styles.header}>
                    {isWifi ? (
                        <View style={styles.roomCodeContainer}>
                            <Text style={styles.roomCodeLabel}>ROOM</Text>
                            <Text style={styles.roomCodeSmall}>{roomCode}</Text>
                        </View>
                    ) : (
                        <View style={styles.roomCodeContainer}>
                            <Text style={styles.roomCodeLabel}>PASS & PLAY</Text>
                        </View>
                    )}
                </View>

                {/* TABS */}
                {isWifi && (
                    <View style={styles.tabContainer}>
                        <TouchableOpacity
                            style={[styles.tab, !showChat && styles.activeTab]}
                            onPress={() => { playHaptic('light'); setShowChat(false); }}
                        >
                            <Text style={[styles.tabText, !showChat && styles.activeTabText]}>TIMER</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[styles.tab, showChat && styles.activeTab]}
                            onPress={() => {
                                playHaptic('light');
                                setShowChat(true);
                                setUnreadMessages(0);
                            }}
                        >
                            <View style={styles.tabContent}>
                                <Text style={[styles.tabText, showChat && styles.activeTabText]}>CHAT</Text>
                                {unreadMessages > 0 && !showChat && (
                                    <View style={styles.notificationDot} />
                                )}
                            </View>
                        </TouchableOpacity>
                    </View>
                )}

                {/* CONTENT */}
                <View style={styles.contentContainer}>
                    {showChat && isWifi ? (
                        <ChatSystem
                            roomCode={roomCode}
                            playerId={playerId}
                            playerName={myPlayerName}
                            onUnreadChange={handleUnreadChange}
                        />
                    ) : (
                        <>
                            <View style={styles.titleContainer}>
                                <Text style={styles.kodakTitle}>DISCUSSION</Text>
                                {voteTied ? (
                                    <Text style={[styles.subtitle, styles.tiedText]}>VOTE ENDED IN A DRAW!</Text>
                                ) : (
                                    <Text style={styles.kodakSubtitle}>FIND THE IMPOSTOR</Text>
                                )}
                            </View>

                            <Animated.View style={[styles.timerContainer, { transform: [{ scale: isLowTime ? pulseAnim : 1 }] }]}>
                                <View style={[styles.timerCircle, styles.kodakTimerCircle, isLowTime && styles.timerCircleAlert]}>
                                    <AnimatedHourglass
                                        isRunning={!isPaused && timeLeft > 0}
                                        style={styles.hourglassPosition}
                                    />
                                    <View style={styles.timeTextContainer}>
                                        <Text style={styles.kodakTimer}>{formatTime(timeLeft)}</Text>
                                        <Text style={styles.kodakTimerLabel}>{isPaused ? 'PAUSED' : 'REMAINING'}</Text>
                                    </View>
                                </View>
                            </Animated.View>

                            {/* Consensus Overlay */}
                            {consensusCountdown !== null && (
                                <View style={styles.kodakOverlay}>
                                    <Text style={styles.countdownTitle}>VOTING IN</Text>
                                    <Text style={styles.kodakCountdown}>{consensusCountdown}</Text>
                                    <Text style={styles.countdownNote}>MAJORITY VOTED TO END</Text>
                                </View>
                            )}

                            <ControlButtons
                                isPaused={isPaused}
                                isWifi={isWifi}
                                onPause={handlePauseToggle}
                                onEnd={toggleEndRequest}
                                endRequests={endRequests}
                                needed={neededToEnd}
                                total={totalPlayersCount}
                                imposterCount={imposterCount}
                                theme={theme}
                            />
                        </>
                    )}
                </View>

                {/* Kodak Film Footer - Both modes */}
                <View style={styles.filmFooter}>
                    <View style={styles.filmStrip}>
                        {[...Array(16)].map((_, i) => (
                            <View key={i} style={styles.filmHole} />
                        ))}
                    </View>
                </View>
            </SafeAreaView>

            {/* Leave Room Confirmation Modal */}
            <ConfirmModal
                visible={showLeaveConfirm}
                title="LEAVE GAME?"
                message="Are you sure you want to leave? You won't be able to rejoin this round."
                confirmText="LEAVE"
                cancelText="STAY"
                variant="danger"
                onConfirm={handleLeaveRoom}
                onCancel={() => setShowLeaveConfirm(false)}
            />
        </LinearGradient>
    );
}

const ControlButtons = memo(({ isPaused, isWifi, onPause, onEnd, endRequests, needed, total, imposterCount, theme }) => {
    const styles = getStyles(theme);
    const currentReady = Object.values(endRequests || {}).filter(v => v === true).length;

    // Logic for Button Variant - FIXED: Use impostor count rule
    // Countdown starts when remaining players equals impostor count
    const remainingPlayers = total - currentReady;
    const countdownReady = remainingPlayers === imposterCount && imposterCount > 0;
    const allReady = currentReady >= total && total > 0;

    // Debug logging for the new logic
    if (isWifi && total > 0) {
        console.log(`DISCUSSION BUTTON: ${currentReady}/${total} voted, ${remainingPlayers} remaining, ${imposterCount} impostors - Countdown ready: ${countdownReady}`);
    }

    const endTitle = isWifi ? `END (${currentReady}/${total})` : "END GAME";

    // Use KodakButton for both modes (Kodak cinematic style)
    return (
        <View style={styles.controls}>
            <KodakButton
                title={isPaused ? "RESUME" : "PAUSE"}
                onPress={onPause}
                variant="secondary"
                style={styles.controlBtn}
                size="medium"
            />
            <KodakButton
                title={endTitle}
                onPress={onEnd}
                style={styles.controlBtn}
                variant={allReady ? "success" : countdownReady ? "danger" : "primary"}
                size="medium"
            />
        </View>
    );
});

const getStyles = (theme) => StyleSheet.create({
    container: { flex: 1 },
    safeArea: { flex: 1, alignItems: 'center' },

    // Kodak Film Strip Decorations
    filmHeader: {
        width: '100%',
        paddingTop: 5,
    },
    filmFooter: {
        width: '100%',
        paddingBottom: 10,
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
        width: '100%',
        alignItems: 'center',
        paddingVertical: 10,
        flexDirection: 'row',
        justifyContent: 'center',
        paddingHorizontal: 20,
    },
    roomCodeContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: theme.colors.surface,
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 25,
        borderWidth: 2,
        borderColor: theme.colors.primary,
    },
    roomCodeLabel: {
        color: theme.colors.tertiary,
        fontSize: 12,
        fontFamily: theme.fonts.bold,
        marginRight: 10,
        letterSpacing: 3,
    },
    roomCodeSmall: {
        color: theme.colors.text,
        fontSize: 20,
        fontFamily: theme.fonts.header,
        letterSpacing: 6,
    },

    tabContainer: {
        flexDirection: 'row',
        marginBottom: 10,
        backgroundColor: theme.colors.surface,
        borderRadius: 25,
        padding: 4,
        borderWidth: 2,
        borderColor: theme.colors.primary,
        alignSelf: 'center',
        zIndex: 50
    },
    tab: {
        paddingVertical: 10,
        paddingHorizontal: 35,
        borderRadius: 20,
    },
    activeTab: {
        backgroundColor: theme.colors.primary,
    },
    tabContent: {
        flexDirection: 'row',
        alignItems: 'center',
        position: 'relative',
    },
    tabText: {
        color: theme.colors.textMuted,
        fontFamily: theme.fonts.bold,
        fontSize: 14,
        letterSpacing: 2,
    },
    activeTabText: {
        color: theme.colors.secondary,
        fontFamily: theme.fonts.bold,
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

    contentContainer: {
        flex: 1,
        width: '100%',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: theme.spacing.m,
        paddingBottom: 15,
        paddingTop: 10,
    },

    titleContainer: { alignItems: 'center', marginTop: 5 },
    kodakTitle: {
        fontSize: 42,
        color: theme.colors.text,
        fontFamily: theme.fonts.header,
        letterSpacing: 3,
    },
    subtitle: {
        fontSize: theme.fontSize.medium,
        color: theme.colors.textSecondary,
        marginTop: 5,
        letterSpacing: 4,
        fontFamily: theme.fonts.medium,
        textTransform: 'uppercase'
    },
    kodakSubtitle: {
        fontSize: 14,
        color: theme.colors.textMuted,
        letterSpacing: 5,
        marginTop: 4,
        fontFamily: theme.fonts.medium,
    },
    tiedText: {
        color: theme.colors.error,
        fontFamily: theme.fonts.bold,
    },

    timerContainer: {
        width: 280,
        height: 280,
        alignItems: 'center',
        justifyContent: 'center',
    },
    timerCircle: {
        width: 260,
        height: 260,
        borderRadius: 130,
        borderWidth: 4,
        borderColor: theme.colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'transparent',
        position: 'relative',
    },
    kodakTimerCircle: {
        width: 260,
        height: 260,
        borderRadius: 130,
        borderWidth: 3,
        borderColor: theme.colors.primary,
        backgroundColor: 'transparent',
    },
    timerCircleAlert: { borderColor: theme.colors.error },
    hourglassPosition: {
        position: 'absolute',
        top: 55,
        zIndex: 1,
    },
    timeTextContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
        position: 'absolute',
        top: 25,
    },
    timer: { fontSize: 64, color: theme.colors.text, fontFamily: theme.fonts.header, letterSpacing: 4 },
    kodakTimer: {
        fontSize: 64,
        color: theme.colors.text,
        fontFamily: theme.fonts.header,
        letterSpacing: 4,
    },
    timerLabel: { fontSize: theme.fontSize.small, color: theme.colors.textMuted, fontFamily: theme.fonts.medium, letterSpacing: 2, textTransform: 'uppercase', marginTop: 4 },
    kodakTimerLabel: {
        fontSize: 12,
        color: theme.colors.tertiary,
        letterSpacing: 4,
        fontFamily: theme.fonts.medium,
        marginTop: 4,
    },

    controls: {
        width: '100%',
        flexDirection: 'row',
        justifyContent: 'space-around',
        gap: theme.spacing.s,
        paddingHorizontal: theme.spacing.s,
    },
    controlBtn: { flex: 1 },

    kodakOverlay: {
        position: 'absolute',
        top: '30%',
        backgroundColor: theme.colors.surface,
        padding: 30,
        borderRadius: 20,
        alignItems: 'center',
        zIndex: 100,
        width: '90%',
        borderWidth: 3,
        borderColor: theme.colors.primary,
        ...theme.shadows.medium,
    },
    countdownTitle: { color: theme.colors.textSecondary, fontSize: 16, fontFamily: theme.fonts.bold, letterSpacing: 4 },
    kodakCountdown: {
        fontSize: 80,
        color: theme.colors.text,
        fontFamily: theme.fonts.header,
        ...theme.textShadows.depth,
    },
    countdownNote: { color: theme.colors.textMuted, fontSize: 12, fontFamily: theme.fonts.medium, textAlign: 'center', letterSpacing: 2 }
});
