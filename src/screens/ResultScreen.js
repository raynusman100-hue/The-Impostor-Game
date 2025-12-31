import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Vibration, Alert, BackHandler, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../utils/ThemeContext';
import Button from '../components/Button';
import { database } from '../utils/firebase';
import { ref, onValue, off, update, remove, get } from 'firebase/database';
import { playHaptic } from '../utils/haptics';

export default function ResultScreen({ route, navigation }) {
    const { theme } = useTheme();
    const styles = getStyles(theme);
    const { players, winners, mode } = route.params;
    const [isRevealed, setIsRevealed] = useState(false);
    
    const isWifi = mode === 'wifi';
    const roomCode = route.params.roomCode;
    const playerId = route.params.playerId;

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
                
            } catch (error) {
                console.error("🚨 PLAY AGAIN: Error:", error);
                Alert.alert('Error', 'Failed to return to lobby. Please try again.');
            }
        } else {
            // Local mode
            navigation.reset({
                index: 1,
                routes: [
                    { name: 'Home' },
                    { name: 'Setup', params: { players, impostorCount: impostors.length } }
                ]
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
                navigation.navigate('Home');
                
            } catch (error) {
                console.error("Leave Room Error:", error);
                navigation.navigate('Home');
            }
        } else {
            navigation.navigate('Home');
        }
    };

    return (
        <LinearGradient style={styles.container} colors={theme.colors.backgroundGradient}>
            <SafeAreaView style={styles.safeArea}>
                {!isRevealed ? (
                    <View style={styles.hiddenContainer}>
                        <Text style={styles.title}>ROUND OVER</Text>
                        {isWifi && winners && (
                            <Text style={[styles.winnerBanner, { color: theme.colors.primary }]}>
                                {winners} WIN!
                            </Text>
                        )}
                        <Text style={styles.subtitle}>READY TO SEE THE TRUTH?</Text>
                        <Button
                            title="REVEAL TRUTH"
                            onPress={handleReveal}
                            style={styles.revealBtn}
                        />
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
                        <Text style={styles.revealTitle}>TRUTH REVEALED</Text>

                        <View style={styles.resultCard}>
                            <View style={styles.cardContent}>
                                <Text style={styles.label}>SECRET WORD</Text>
                                <Text style={styles.word}>{secretWord}</Text>
                            </View>
                        </View>

                        <View style={[styles.resultCard, styles.impostorCard]}>
                            <View style={styles.cardContent}>
                                <Text style={styles.labelInverted}>
                                    {impostors.length > 1 ? 'IMPOSTORS' : 'IMPOSTOR'}
                                </Text>
                                {impostors.map((imp, index) => (
                                    <Text key={index} style={styles.impostorName}>
                                        {imp.name || imp.name}
                                    </Text>
                                ))}
                            </View>
                        </View>

                        {/* COMPLETELY REWRITTEN PLAY AGAIN LOGIC */}
                        {isWifi ? (
                            <View style={styles.buttonContainer}>
                                {route.params.playerId === 'host-id' ? (
                                    // HOST BUTTONS
                                    <>
                                        <Button
                                            title="RETURN TO LOBBY"
                                            onPress={handlePlayAgain}
                                            style={styles.playAgainBtn}
                                            variant="primary"
                                        />
                                        <Button
                                            title="LEAVE ROOM"
                                            onPress={handleLeaveRoom}
                                            style={styles.leaveBtn}
                                            variant="secondary"
                                        />
                                    </>
                                ) : (
                                    // NON-HOST BUTTONS
                                    <>
                                        <View style={styles.waitingContainer}>
                                            <Text style={styles.waitingText}>
                                                WAITING FOR HOST TO RETURN TO LOBBY...
                                            </Text>
                                        </View>
                                        <Button
                                            title="LEAVE ROOM"
                                            onPress={handleLeaveRoom}
                                            style={styles.leaveBtn}
                                            variant="secondary"
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
            </SafeAreaView>
        </LinearGradient>
    );
}

const getStyles = (theme) => StyleSheet.create({
    container: { flex: 1 },
    safeArea: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: theme.spacing.m },
    hiddenContainer: { alignItems: 'center', width: '100%', flex: 1, justifyContent: 'center' },
    revealedContainer: { flex: 1, width: '100%' },
    scrollContent: { alignItems: 'center', paddingTop: theme.spacing.l, paddingBottom: theme.spacing.xl },
    title: { fontSize: 56, fontFamily: theme.fonts.header, color: theme.colors.tertiary, marginBottom: theme.spacing.s, textAlign: 'center', letterSpacing: 4, ...theme.textShadows.depth },
    subtitle: { fontSize: theme.fontSize.large, color: theme.colors.textSecondary, marginBottom: theme.spacing.xl, fontFamily: theme.fonts.medium, letterSpacing: 2 },
    winnerBanner: { fontSize: 28, fontFamily: theme.fonts.header, marginBottom: 10, letterSpacing: 4, textTransform: 'uppercase' },
    revealBtn: { paddingVertical: theme.spacing.l, paddingHorizontal: theme.spacing.xl, width: '100%' },
    revealTitle: { fontSize: 32, fontFamily: theme.fonts.header, color: theme.colors.tertiary, marginBottom: theme.spacing.l, textAlign: 'center', letterSpacing: 4, lineHeight: 48, ...theme.textShadows.depth },
    resultCard: { width: '100%', marginBottom: theme.spacing.m, borderRadius: theme.borderRadius.l, overflow: 'hidden', borderWidth: 1, borderColor: theme.colors.textSecondary, backgroundColor: theme.colors.surface },
    impostorCard: { borderColor: theme.colors.error, backgroundColor: 'rgba(205, 92, 92, 0.1)' },
    cardContent: { padding: theme.spacing.l, alignItems: 'center', justifyContent: 'center' },
    label: { fontSize: theme.fontSize.medium, color: theme.colors.textSecondary, marginBottom: theme.spacing.s, fontFamily: theme.fonts.medium, letterSpacing: 3, textTransform: 'uppercase' },
    labelInverted: { fontSize: theme.fontSize.medium, color: theme.colors.text, marginBottom: theme.spacing.s, fontFamily: theme.fonts.medium, letterSpacing: 3, textTransform: 'uppercase' },
    word: { fontSize: 48, color: theme.colors.text, fontFamily: theme.fonts.header, letterSpacing: 2, textAlign: 'center' },
    impostorName: { fontSize: 36, color: theme.colors.error, fontFamily: theme.fonts.header, marginVertical: theme.spacing.xs, letterSpacing: 2, textTransform: 'uppercase' },
    homeBtn: { marginTop: theme.spacing.m, width: '100%', paddingVertical: theme.spacing.m },
    buttonContainer: { 
        width: '100%', 
        marginTop: theme.spacing.m,
        gap: theme.spacing.s 
    },
    playAgainBtn: { 
        width: '100%', 
        paddingVertical: theme.spacing.m 
    },
    leaveBtn: { 
        width: '100%', 
        paddingVertical: theme.spacing.s,
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: theme.colors.textSecondary
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
    waitingText: {
        color: theme.colors.textSecondary,
        fontFamily: theme.fonts.bold,
        fontSize: 16,
        letterSpacing: 2
    },
});
