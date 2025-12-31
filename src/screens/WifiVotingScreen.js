import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator, AppState, BackHandler } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../utils/ThemeContext';
import Button from '../components/Button';
import { playHaptic } from '../utils/haptics';
import { database } from '../utils/firebase';
import { ref, onValue, off, set, get, update, onDisconnect } from 'firebase/database';
import { retryFirebaseOperation, safeFirebaseUpdate, verifyRoomAccess } from '../utils/connectionUtils';
import ChatSystem from '../components/ChatSystem';

export default function WifiVotingScreen({ route, navigation }) {
    const { theme } = useTheme();
    const styles = getStyles(theme);
    const { roomCode, userId } = route.params;

    const [players, setPlayers] = useState([]);
    const [myVotes, setMyVotes] = useState([]);
    const [imposterCount, setImposterCount] = useState(1);
    const [showChat, setShowChat] = useState(false);

    const [votingTimeLeft, setVotingTimeLeft] = useState(20);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [votingConcluded, setVotingConcluded] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState('connected');
    const [reconnectAttempts, setReconnectAttempts] = useState(0);
    const [votingStatus, setVotingStatus] = useState({}); // Track who has voted
    const [unreadMessages, setUnreadMessages] = useState(0);

    // Disable Android back button during voting
    useEffect(() => {
        const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
            // Simply block back button during voting
            return true;
        });

        return () => backHandler.remove();
    }, []);

    // Enhanced unread message handler
    const handleUnreadChange = (count) => {
        // Only show unread count when chat is not active
        if (!showChat) {
            setUnreadMessages(count);
        } else {
            setUnreadMessages(0);
        }
    };

    // CLIENT-SIDE VOTING STATUS TRACKING - ENHANCED REAL-TIME SYNC
    useEffect(() => {
        if (!roomCode || !players.length) return;

        console.log("📊 CLIENT: Setting up real-time voting status tracking for", players.length, "players");
        console.log("📊 CLIENT: Players list:", players.map(p => `${p.name} (${p.id})`));
        
        const votesRef = ref(database, `rooms/${roomCode}/gameState/votes`);
        
        const unsub = onValue(votesRef, (snapshot) => {
            const votes = snapshot.val() || {};
            const votedPlayerIds = Object.keys(votes);
            
            console.log(`📊 CLIENT: Raw Firebase votes data:`, votes);
            console.log(`📊 CLIENT: Vote status update - received votes from:`, votedPlayerIds);
            console.log(`📊 CLIENT: Total votes: ${votedPlayerIds.length}/${players.length}`);
            
            // Update voting status for all players
            const newVotingStatus = {};
            players.forEach(player => {
                const hasVoted = votedPlayerIds.includes(player.id);
                newVotingStatus[player.id] = hasVoted;
                console.log(`📊 CLIENT: Player ${player.name} (${player.id}): ${hasVoted ? 'VOTED' : 'NOT VOTED'}`);
            });
            
            console.log(`📊 CLIENT: Final voting status:`, newVotingStatus);
            setVotingStatus(newVotingStatus);

            // CRITICAL: Check if THIS player has voted and sync isSubmitted state
            if (votedPlayerIds.includes(userId)) {
                console.log(`📊 CLIENT: Detected my vote (${userId}) in Firebase, updating UI`);
                if (!isSubmitted) {
                    setIsSubmitted(true);
                }
            }

            console.log(`📊 CLIENT: Voting status update complete - ${votedPlayerIds.length}/${players.length} voted`);
        }, (error) => {
            console.error("📊 CLIENT: Voting status listener error:", error);
        });

        return () => {
            console.log("📊 CLIENT: Cleaning up voting status listener");
            off(votesRef);
        };
    }, [roomCode, players, userId, isSubmitted]);

    // Periodic Room Verification (every 10 seconds)
    useEffect(() => {
        if (!roomCode || !userId) return;

        const verifyInterval = setInterval(async () => {
            try {
                const { exists, data } = await verifyRoomAccess(roomCode);

                if (!exists) {
                    console.log("VOTING: Room no longer exists during verification");
                    clearInterval(verifyInterval);
                    Alert.alert('Room Closed', 'The room has been closed.');
                    navigation.navigate('Home');
                    return;
                }

                // Check if we're still supposed to be in voting
                if (data.status !== 'voting') {
                    console.log(`VOTING: Room status changed to ${data.status} during verification`);
                    clearInterval(verifyInterval);

                    // Handle status change
                    if (data.status === 'result') {
                        navigation.replace('Result', {
                            mode: 'wifi',
                            roomCode,
                            playerId: userId,
                            winners: data.gameState?.winners || 'Unknown',
                            players: players
                        });
                    } else if (data.status === 'discussion') {
                        navigation.replace('Discussion', {
                            mode: 'wifi',
                            roomCode,
                            playerId: userId,
                            timeLeft: data.gameState?.discussionDuration || 60
                        });
                    }
                }

            } catch (error) {
                console.error("VOTING: Room verification error:", error);
                // Don't navigate away on verification errors, let other systems handle it
            }
        }, 10000); // Check every 10 seconds

        return () => clearInterval(verifyInterval);
    }, [roomCode, userId, navigation, players]);

    // Connection Monitoring and Presence System
    useEffect(() => {
        if (!roomCode || !userId) return;

        // Set up presence system
        const presenceRef = ref(database, `rooms/${roomCode}/presence/${userId}`);
        const connectedRef = ref(database, '.info/connected');

        const setupPresence = () => {
            // When connected, set presence and set up disconnect handler
            onValue(connectedRef, (snapshot) => {
                if (snapshot.val() === true) {
                    console.log("VOTING: Connected to Firebase");
                    setConnectionStatus('connected');
                    setReconnectAttempts(0);

                    // Set presence
                    set(presenceRef, {
                        online: true,
                        lastSeen: Date.now(),
                        screen: 'voting'
                    });

                    // Set up disconnect handler
                    onDisconnect(presenceRef).set({
                        online: false,
                        lastSeen: Date.now(),
                        screen: 'voting'
                    });
                } else {
                    console.log("VOTING: Disconnected from Firebase");
                    setConnectionStatus('disconnected');
                    setReconnectAttempts(prev => prev + 1);
                }
            });
        };

        setupPresence();

        // App state change handler
        const handleAppStateChange = (nextAppState) => {
            if (nextAppState === 'active') {
                console.log("VOTING: App became active, refreshing presence");
                setupPresence();
            }
        };

        const subscription = AppState.addEventListener('change', handleAppStateChange);

        return () => {
            subscription?.remove();
            off(connectedRef);
            // Clean up presence on unmount
            set(presenceRef, {
                online: false,
                lastSeen: Date.now(),
                screen: 'voting'
            }).catch(() => {
                // Ignore cleanup errors
            });
        };
    }, [roomCode, userId]);

    // Host Logic: Initialize Timer on Entry - STRICT HOST-ID CHECK
    useEffect(() => {
        if (!roomCode || userId !== 'host-id') return;

        const initializeVotingTimer = async () => {
            try {
                const gameStateRef = ref(database, `rooms/${roomCode}/gameState`);
                const snapshot = await get(gameStateRef);
                const gameState = snapshot.val() || {};

                // Only set timer if not already set and voting hasn't concluded
                if (!gameState.votingExpiresAt && !gameState.votingConcluded) {
                    console.log("HOST: Initializing voting timer (15 seconds)");
                    await update(gameStateRef, {
                        votingExpiresAt: Date.now() + 15000,
                        votingConcluded: false,
                        allVotesReceived: false,
                        skipTimer: false,
                        lastActionAt: Date.now()
                    });
                }
            } catch (error) {
                console.error("HOST: Error initializing voting timer:", error);
            }
        };

        initializeVotingTimer();
    }, [roomCode, userId]);

    // Client Logic: Enhanced Timer Sync with Reconnection Handling
    useEffect(() => {
        if (!roomCode || votingConcluded) return;

        const timerRef = ref(database, `rooms/${roomCode}/gameState/votingExpiresAt`);
        const unsub = onValue(timerRef, (snapshot) => {
            const expiresAt = snapshot.val();
            if (expiresAt) {
                const now = Date.now();
                const left = Math.ceil((expiresAt - now) / 1000);
                const timeLeft = Math.max(0, left);

                console.log(`CLIENT: Timer sync - ${timeLeft}s remaining`);
                setVotingTimeLeft(timeLeft);

                // If timer is very close to expiry, prepare for conclusion
                if (timeLeft <= 1 && !votingConcluded) {
                    console.log("CLIENT: Timer about to expire, preparing for conclusion");
                }
            } else {
                // Timer was cleared - voting concluded
                console.log("CLIENT: Timer cleared, voting concluded");
                setVotingTimeLeft(0);
                if (!votingConcluded) {
                    setVotingConcluded(true);
                }
            }
        }, (error) => {
            console.error("CLIENT: Timer sync error:", error);
            // On error, don't immediately conclude - let failsafe handle it
        });

        return () => off(timerRef);
    }, [roomCode, votingConcluded]);

    // Enhanced Voting Conclusion Detection with Debouncing - IMPROVED SYNC
    useEffect(() => {
        if (!roomCode || votingConcluded) return;

        const gameStateRef = ref(database, `rooms/${roomCode}/gameState`);
        const unsub = onValue(gameStateRef, (snapshot) => {
            const gameState = snapshot.val();
            if (gameState && !votingConcluded) {
                // Check for multiple conclusion signals
                const conclusionSignals = [
                    gameState.allVotesReceived === true,
                    gameState.votingConcluded === true,
                    gameState.skipTimer === true,
                    gameState.votingExpiresAt === null
                ];

                const hasConclusion = conclusionSignals.some(signal => signal === true);

                if (hasConclusion) {
                    console.log("CLIENT: Voting conclusion detected - IMMEDIATE UI UPDATE:", {
                        allVotesReceived: gameState.allVotesReceived,
                        votingConcluded: gameState.votingConcluded,
                        skipTimer: gameState.skipTimer,
                        timerCleared: gameState.votingExpiresAt === null
                    });

                    // IMMEDIATE local state update
                    setVotingConcluded(true);
                    setVotingTimeLeft(0);

                    // Force UI update to show "PROCESSING..." state immediately
                    setIsSubmitted(true);
                    
                    console.log("CLIENT: UI updated to show processing state");
                }
            }
        }, (error) => {
            console.error("CLIENT: Game state sync error:", error);
        });

        return () => off(gameStateRef);
    }, [roomCode, votingConcluded]);

    // Local Timer Ticker - STOP when voting concluded
    useEffect(() => {
        if (votingConcluded) return; // Don't run timer if voting is concluded

        const interval = setInterval(() => {
            setVotingTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
        }, 1000);
        return () => clearInterval(interval);
    }, [votingConcluded]);

    // BULLETPROOF HOST VOTE MONITORING - IMMEDIATE RESULT TRANSITION
    useEffect(() => {
        if (!players.length || votingConcluded || userId !== 'host-id') return;

        console.log("🎯 HOST: Setting up BULLETPROOF vote monitoring for", players.length, "players");

        const votesRef = ref(database, `rooms/${roomCode}/gameState/votes`);
        let processingResults = false; // Prevent double processing

        const unsub = onValue(votesRef, async (snapshot) => {
            try {
                const votes = snapshot.val() || {};
                const votedPlayerIds = Object.keys(votes);
                const votedCount = votedPlayerIds.length;

                console.log(`🎯 HOST: Vote update - ${votedCount}/${players.length} voted:`, votedPlayerIds);

                // Update voting status for UI
                const newVotingStatus = {};
                players.forEach(player => {
                    newVotingStatus[player.id] = votedPlayerIds.includes(player.id);
                });
                setVotingStatus(newVotingStatus);

                // IMMEDIATE RESULT PROCESSING - NO DELAYS, NO RACE CONDITIONS
                if (votedCount >= players.length && players.length > 0 && !processingResults && !votingConcluded) {
                    processingResults = true; // Lock to prevent double processing

                    console.log("🚀 HOST: ALL PLAYERS VOTED - IMMEDIATE RESULT PROCESSING");
                    console.log("🚀 HOST: Votes received:", votes);

                    // Set local state immediately
                    setVotingConcluded(true);
                    setVotingTimeLeft(0);

                    // PRECOMPUTE RESULTS IMMEDIATELY - NO DELAYS
                    const tally = {};
                    Object.values(votes).forEach(voteList => {
                        if (Array.isArray(voteList)) {
                            voteList.forEach(targetId => {
                                tally[targetId] = (tally[targetId] || 0) + 1;
                            });
                        }
                    });

                    let maxVotes = 0;
                    Object.values(tally).forEach(count => {
                        if (count > maxVotes) maxVotes = count;
                    });

                    const topCandidates = Object.keys(tally).filter(id => tally[id] === maxVotes);
                    console.log("🚀 HOST: PRECOMPUTED - Vote tally:", tally, "Top candidates:", topCandidates);

                    // IMMEDIATE Firebase update with PRECOMPUTED results
                    try {
                        const roomRef = ref(database, `rooms/${roomCode}`);
                        
                        if (maxVotes === 0 || topCandidates.length > 1) {
                            // TIE OR NO VOTES - Back to discussion
                            console.log("🔄 HOST: Tie/No votes - immediate return to discussion");
                            await update(roomRef, {
                                status: 'discussion',
                                'gameState/phase': 'discussion',
                                'gameState/discussionDuration': 60,
                                'gameState/discussionStartedAt': Date.now(),
                                'gameState/voteTied': true,
                                'gameState/votes': null,
                                'gameState/votingExpiresAt': null,
                                'gameState/allVotesReceived': true,
                                'gameState/votingConcluded': true,
                                'gameState/skipTimer': true,
                                'gameState/lastActionAt': Date.now()
                            });
                        } else {
                            // CLEAR WINNER - IMMEDIATE results with precomputed data
                            const ejectedId = topCandidates[0];
                            const ejectedPlayer = players.find(p => p.id === ejectedId);

                            let winner = 'Impostor';
                            if (ejectedPlayer && (ejectedPlayer.role === 'Impostor' || ejectedPlayer.isImposter)) {
                                winner = 'Citizen';
                            }

                            const citizenPlayer = players.find(p => p.role === 'Citizen' || (!p.isImposter && p.word && p.word !== 'Imposter'));
                            const secretWord = citizenPlayer ? (citizenPlayer.word || citizenPlayer.originalWord || 'Unknown') : 'Unknown';
                            const impostors = players.filter(p => p.role === 'Impostor' || p.isImposter);

                            console.log(`🏆 HOST: IMMEDIATE RESULTS - Winner: ${winner}, Secret: ${secretWord}, Ejected: ${ejectedPlayer?.name}`);

                            // SINGLE ATOMIC UPDATE - NO DELAYS
                            await update(roomRef, {
                                status: 'result',
                                'gameState/phase': 'result',
                                'gameState/winners': winner,
                                'gameState/secretWord': secretWord,
                                'gameState/impostors': impostors.map(imp => ({ id: imp.id, name: imp.name })),
                                'gameState/ejectedPlayer': ejectedPlayer ? { id: ejectedPlayer.id, name: ejectedPlayer.name } : null,
                                'gameState/votingExpiresAt': null,
                                'gameState/allVotesReceived': true,
                                'gameState/votingConcluded': true,
                                'gameState/skipTimer': true,
                                'gameState/lastActionAt': Date.now()
                            });
                        }
                        
                        console.log("🚀 HOST: IMMEDIATE TRANSITION COMPLETE - NO DELAYS");
                        
                    } catch (error) {
                        console.error("🚨 HOST: Immediate result processing failed:", error);
                        processingResults = false;
                    }
                }
            } catch (error) {
                console.error("🚨 HOST: Vote monitoring error:", error);
                processingResults = false;
            }
        }, (error) => {
            console.error("🚨 HOST: Vote listener error:", error);
        });

        return () => {
            console.log("🎯 HOST: Cleaning up vote monitoring");
            off(votesRef);
        };
    }, [players, userId, roomCode, votingConcluded]);

    // Enhanced Timer Expiry Handling with Better Failsafes
    useEffect(() => {
        if (votingTimeLeft === 0 && !votingConcluded) {
            console.log("VOTING: Timer reached 0, initiating conclusion process");

            // Set local conclusion state immediately
            setVotingConcluded(true);

            // If I'm the host, handle the conclusion IMMEDIATELY
            if (userId === 'host-id' && players.length > 0) {
                console.log("HOST: Timer expired, processing votes IMMEDIATELY");

                // Get current votes and process them IMMEDIATELY
                const processTimerExpiry = async () => {
                    try {
                        const votesSnapshot = await get(ref(database, `rooms/${roomCode}/gameState/votes`));
                        const votes = votesSnapshot.val() || {};

                        console.log("🏁 HOST: Timer expiry - immediate vote processing");
                        
                        // PRECOMPUTE RESULTS IMMEDIATELY
                        const tally = {};
                        Object.values(votes).forEach(voteList => {
                            if (Array.isArray(voteList)) {
                                voteList.forEach(targetId => {
                                    tally[targetId] = (tally[targetId] || 0) + 1;
                                });
                            }
                        });

                        let maxVotes = 0;
                        Object.values(tally).forEach(count => {
                            if (count > maxVotes) maxVotes = count;
                        });

                        const topCandidates = Object.keys(tally).filter(id => tally[id] === maxVotes);
                        const roomRef = ref(database, `rooms/${roomCode}`);

                        if (maxVotes === 0 || topCandidates.length > 1) {
                            // TIE OR NO VOTES - Back to discussion
                            console.log("🔄 HOST: Timer expiry - tie/no votes, returning to discussion");
                            await update(roomRef, {
                                status: 'discussion',
                                'gameState/phase': 'discussion',
                                'gameState/discussionDuration': 60,
                                'gameState/discussionStartedAt': Date.now(),
                                'gameState/voteTied': true,
                                'gameState/votes': null,
                                'gameState/votingExpiresAt': null,
                                'gameState/timerExpired': true,
                                'gameState/lastActionAt': Date.now()
                            });
                        } else {
                            // CLEAR WINNER - IMMEDIATE results
                            const ejectedId = topCandidates[0];
                            const ejectedPlayer = players.find(p => p.id === ejectedId);

                            let winner = 'Impostor';
                            if (ejectedPlayer && (ejectedPlayer.role === 'Impostor' || ejectedPlayer.isImposter)) {
                                winner = 'Citizen';
                            }

                            const citizenPlayer = players.find(p => p.role === 'Citizen' || (!p.isImposter && p.word && p.word !== 'Imposter'));
                            const secretWord = citizenPlayer ? (citizenPlayer.word || citizenPlayer.originalWord || 'Unknown') : 'Unknown';
                            const impostors = players.filter(p => p.role === 'Impostor' || p.isImposter);

                            console.log(`🏆 HOST: Timer expiry results - Winner: ${winner}, Ejected: ${ejectedPlayer?.name}`);

                            await update(roomRef, {
                                status: 'result',
                                'gameState/phase': 'result',
                                'gameState/winners': winner,
                                'gameState/secretWord': secretWord,
                                'gameState/impostors': impostors.map(imp => ({ id: imp.id, name: imp.name })),
                                'gameState/ejectedPlayer': ejectedPlayer ? { id: ejectedPlayer.id, name: ejectedPlayer.name } : null,
                                'gameState/votingExpiresAt': null,
                                'gameState/timerExpired': true,
                                'gameState/lastActionAt': Date.now()
                            });
                        }
                        
                        console.log("🚀 HOST: Timer expiry processing complete - IMMEDIATE");
                        
                    } catch (error) {
                        console.error("HOST: Timer expiry processing error:", error);
                        // Fallback navigation
                        navigation.navigate('Home');
                    }
                };

                processTimerExpiry();
                return;
            }

            // For non-hosts, wait for room status change with enhanced failsafe
            const failsafeTimeout = setTimeout(async () => {
                try {
                    console.log("CLIENT: Failsafe check after timer expiry");
                    const roomSnapshot = await get(ref(database, `rooms/${roomCode}`));

                    if (!roomSnapshot.exists()) {
                        console.log("CLIENT: Room doesn't exist, going home");
                        navigation.navigate('Home');
                        return;
                    }

                    const data = roomSnapshot.val();
                    console.log(`CLIENT: Failsafe - room status is ${data.status}`);

                    // Navigate based on current status
                    if (data.status === 'result') {
                        navigation.replace('Result', {
                            mode: 'wifi',
                            roomCode,
                            playerId: userId,
                            winners: data.gameState?.winners || 'Unknown',
                            players: players
                        });
                    } else if (data.status === 'discussion') {
                        navigation.replace('Discussion', {
                            mode: 'wifi',
                            roomCode,
                            playerId: userId,
                            timeLeft: 60
                        });
                    } else if (data.status === 'reveal') {
                        navigation.replace('RoleReveal', {
                            mode: 'wifi',
                            roomCode,
                            playerId: userId,
                            category: 'all'
                        });
                    } else {
                        // Still in voting - something went wrong
                        console.log("CLIENT: Still in voting after timer expiry, going home");
                        navigation.navigate('Home');
                    }
                } catch (error) {
                    console.error("CLIENT: Failsafe error:", error);
                    navigation.navigate('Home');
                }
            }, 3000); // Wait 3 seconds for host to process

            return () => clearTimeout(failsafeTimeout);
        }
    }, [votingTimeLeft, votingConcluded, roomCode, navigation, userId, players]);

    const handleVoteConclusion = async (votes) => {
        console.log("🏁 HOST: BULLETPROOF vote conclusion processing");

        try {
            // Calculate results
            const tally = {};
            Object.values(votes).forEach(voteList => {
                if (Array.isArray(voteList)) {
                    voteList.forEach(targetId => {
                        tally[targetId] = (tally[targetId] || 0) + 1;
                    });
                }
            });

            let maxVotes = 0;
            Object.values(tally).forEach(count => {
                if (count > maxVotes) maxVotes = count;
            });

            const topCandidates = Object.keys(tally).filter(id => tally[id] === maxVotes);
            console.log("🏁 HOST: Vote tally:", tally, "Top candidates:", topCandidates);

            const roomRef = ref(database, `rooms/${roomCode}`);

            // TIE OR NO VOTES - Back to discussion
            if (maxVotes === 0 || topCandidates.length > 1) {
                playHaptic('warning');
                console.log("🔄 HOST: Tie/No votes - returning to discussion");

                await update(roomRef, {
                    status: 'discussion',
                    'gameState/phase': 'discussion',
                    'gameState/discussionDuration': 60,
                    'gameState/discussionStartedAt': Date.now(),
                    'gameState/voteTied': true,
                    'gameState/votes': null,
                    'gameState/votingExpiresAt': null,
                    'gameState/consensusExpiresAt': null,
                    'gameState/endRequests': {},
                    'gameState/isPaused': false,
                    'gameState/allVotesReceived': null,
                    'gameState/votingConcluded': null,
                    'gameState/skipTimer': null,
                    'gameState/timerExpired': null,
                    'gameState/lastActionAt': Date.now()
                });

                console.log("✅ HOST: Successfully reset to discussion");
            } else {
                // CLEAR WINNER - Go to results
                const ejectedId = topCandidates[0];
                const ejectedPlayer = players.find(p => p.id === ejectedId);

                let winner = 'Impostor';
                if (ejectedPlayer && (ejectedPlayer.role === 'Impostor' || ejectedPlayer.isImposter)) {
                    winner = 'Citizen';
                }

                const citizenPlayer = players.find(p => p.role === 'Citizen' || (!p.isImposter && p.word && p.word !== 'Imposter'));
                const secretWord = citizenPlayer ? (citizenPlayer.word || citizenPlayer.originalWord || 'Unknown') : 'Unknown';
                const impostors = players.filter(p => p.role === 'Impostor' || p.isImposter);

                console.log(`🏆 HOST: Winner: ${winner}, Secret: ${secretWord}, Ejected: ${ejectedPlayer?.name}`);

                // IMMEDIATE TRANSITION TO RESULTS - BULLETPROOF
                await update(roomRef, {
                    status: 'result',
                    'gameState/phase': 'result',
                    'gameState/winners': winner,
                    'gameState/secretWord': secretWord,
                    'gameState/impostors': impostors.map(imp => ({ id: imp.id, name: imp.name })),
                    'gameState/ejectedPlayer': ejectedPlayer ? { id: ejectedPlayer.id, name: ejectedPlayer.name } : null,
                    'gameState/votingExpiresAt': null,
                    'gameState/allVotesReceived': true,
                    'gameState/votingConcluded': true,
                    'gameState/skipTimer': true,
                    'gameState/lastActionAt': Date.now()
                });

                console.log("🚀 HOST: IMMEDIATE RESULT TRANSITION COMPLETE");
            }
        } catch (error) {
            console.error("🚨 HOST: Vote conclusion error:", error);

            // Emergency fallback
            try {
                await update(ref(database, `rooms/${roomCode}`), {
                    status: 'discussion',
                    'gameState/discussionDuration': 60,
                    'gameState/votes': null,
                    'gameState/votingExpiresAt': null,
                    'gameState/lastActionAt': Date.now()
                });
                console.log("🆘 HOST: Emergency fallback to discussion successful");
            } catch (fallbackError) {
                console.error("🚨 HOST: Emergency fallback failed:", fallbackError);
            }
        }
    };

    // Enhanced Navigation Listener with Connection Resilience - IMPROVED RESPONSIVENESS
    useEffect(() => {
        if (!roomCode) return;

        let hasNavigated = false;
        
        const navigateToResult = (data) => {
            if (hasNavigated) return;
            hasNavigated = true;
            console.log("VOTING: Navigating to result screen");
            navigation.replace('Result', {
                mode: 'wifi',
                roomCode,
                playerId: userId,
                winners: data.gameState?.winners || 'Unknown',
                players: players
            });
        };

        console.log("VOTING: Setting up enhanced navigation listener");
        const roomRef = ref(database, `rooms/${roomCode}`);

        const unsub = onValue(roomRef, (snapshot) => {
            const data = snapshot.val();

            if (!data) {
                console.log("VOTING: Room deleted, going home");
                if (!hasNavigated) {
                    hasNavigated = true;
                    Alert.alert('Room Closed', 'The host has ended the game.');
                    navigation.navigate('Home');
                }
                return;
            }

            // Check for result status immediately
            if (data.status === 'result' && !hasNavigated) {
                console.log("VOTING: Status is RESULT - navigating immediately!");
                setVotingConcluded(true);
                setVotingTimeLeft(0);
                navigateToResult(data);
                return;
            }

            // Host disconnection handling
            if (data.hostDisconnected || data.hostLeft) {
                console.log('VOTING: Host disconnected/left, returning to lobby');
                Alert.alert(
                    'Host Disconnected',
                    'The host has disconnected. Returning to lobby...',
                    [{
                        text: 'OK', onPress: () => {
                            if (userId === 'host-id') {
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
                                    playerId: userId,
                                    playerName: players.find(p => p.id === userId)?.name || 'Player'
                                });
                            }
                        }
                    }]
                );
                return;
            }

            console.log(`VOTING: Room status is ${data.status}`);

            // Enhanced status-based navigation with immediate response
            if (data.status === 'discussion') {
                console.log("VOTING: Status changed to discussion, navigating...");
                // Immediate navigation without debounce for better responsiveness
                if (navigation.isFocused()) {
                    navigation.replace('Discussion', {
                        mode: 'wifi',
                        roomCode,
                        playerId: userId,
                        timeLeft: data.gameState?.discussionDuration || 60
                    });
                }
            } else if (data.status === 'result') {
                console.log("VOTING: Status changed to result, navigating...");
                if (!hasNavigated) {
                    setVotingConcluded(true);
                    setVotingTimeLeft(0);
                    navigateToResult(data);
                }
            } else if (data.status === 'reveal') {
                console.log("VOTING: Play again - navigating to role reveal");
                if (navigation.isFocused() && !hasNavigated) {
                    hasNavigated = true;
                    navigation.replace('RoleReveal', {
                        mode: 'wifi',
                        roomCode,
                        playerId: userId,
                        category: 'all'
                    });
                }
            }
        }, (error) => {
            console.error("VOTING: Navigation listener error:", error);
            // On persistent errors, navigate to safe state
            setTimeout(() => {
                if (navigation.isFocused() && !hasNavigated) {
                    hasNavigated = true;
                    navigation.navigate('Home');
                }
            }, 1000);
        });

        // BACKUP: Periodic check every 2 seconds for result status
        const checkInterval = setInterval(async () => {
            if (hasNavigated) {
                clearInterval(checkInterval);
                return;
            }
            
            try {
                const snapshot = await get(roomRef);
                const data = snapshot.val();
                
                if (data && data.status === 'result' && !hasNavigated) {
                    console.log("VOTING: [PERIODIC CHECK] Status is RESULT - navigating!");
                    clearInterval(checkInterval);
                    setVotingConcluded(true);
                    setVotingTimeLeft(0);
                    navigateToResult(data);
                }
            } catch (err) {
                console.error("VOTING: Periodic check error:", err);
            }
        }, 2000);

        return () => {
            console.log("VOTING: Cleaning up navigation listener");
            off(roomRef);
            clearInterval(checkInterval);
        };
    }, [roomCode, navigation, players, userId]);

    // Initial Data Fetch
    useEffect(() => {
        const roomRef = ref(database, `rooms/${roomCode}/gameState`);
        onValue(roomRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                if (data.assignments) {
                    const playerList = Object.values(data.assignments);
                    setPlayers(prev => {
                        if (JSON.stringify(prev) === JSON.stringify(playerList)) return prev;
                        return playerList;
                    });
                }
                if (data.imposterCount) {
                    setImposterCount(prev => {
                        if (prev === data.imposterCount) return prev;
                        return data.imposterCount;
                    });
                }
            }
        });

        return () => { }; // No local interval to clear here anymore
    }, [roomCode]);

    // Voting Actions
    const toggleVote = (targetId) => {
        playHaptic('selection');
        setMyVotes((prev) => {
            if (prev.includes(targetId)) {
                return prev.filter(id => id !== targetId);
            }
            if (prev.length < imposterCount) {
                return [...prev, targetId];
            }
            // Replace the last one for responsive feeling
            const newVotes = [...prev.slice(1), targetId];
            return newVotes;
        });
    };

    const submitVotes = async () => {
        if (myVotes.length !== imposterCount) {
            Alert.alert("Incomplete", `Please select ${imposterCount} suspect(s).`);
            return;
        }

        if (isSubmitted || votingConcluded) {
            console.log("Vote submission blocked - already submitted or voting concluded");
            return;
        }

        console.log(`🗳️ VOTE SUBMIT: Player ${userId} submitting votes:`, myVotes);
        playHaptic('success');
        setIsSubmitted(true); // Set immediately for UI feedback

        try {
            // Direct Firebase update - more reliable than safeFirebaseUpdate for votes
            const votesRef = ref(database, `rooms/${roomCode}/gameState/votes/${userId}`);
            const lastActionRef = ref(database, `rooms/${roomCode}/gameState/lastActionAt`);
            
            // Submit vote directly
            await set(votesRef, myVotes);
            await set(lastActionRef, Date.now());
            
            console.log("✅ VOTE SUBMIT: Vote submission successful for player", userId);
            
        } catch (error) {
            console.error("🚨 VOTE SUBMIT: Vote submission error:", error);
            setIsSubmitted(false);
            
            // More specific error handling
            if (error.code === 'PERMISSION_DENIED') {
                Alert.alert("Error", "You don't have permission to vote in this room.");
            } else if (error.code === 'NETWORK_ERROR') {
                Alert.alert("Network Error", "Please check your connection and try again.");
            } else {
                Alert.alert("Error", "Vote failed to submit. Please try again.");
            }
        }
    };

    return (
        <LinearGradient style={styles.container} colors={['#0a0a0a', '#121212', '#0a0a0a']}>
            {/* Kodak Film Header */}
            <View style={styles.filmHeader}>
                <View style={styles.filmStrip}>
                    {[...Array(16)].map((_, i) => (
                        <View key={i} style={styles.filmHole} />
                    ))}
                </View>
            </View>
            
            <View style={styles.header}>
                <View style={styles.timerBadge}>
                    <Text style={[
                        styles.timerText,
                        votingTimeLeft <= 5 && !votingConcluded && { color: '#ff3b30' },
                        votingConcluded && { color: '#4cd964' }
                    ]}>
                        {votingConcluded ? (isSubmitted ? "✓ VOTED" : "SKIPPED") : `${votingTimeLeft}s`}
                    </Text>
                </View>
                {connectionStatus !== 'connected' && (
                    <View style={styles.connectionBadge}>
                        <Text style={styles.connectionText}>
                            {connectionStatus === 'disconnected' ? 'RECONNECTING...' : 'SYNCING...'}
                        </Text>
                    </View>
                )}
                <Text style={styles.title}>VOTING</Text>
                <Text style={styles.subtitle}>
                    {votingConcluded ? "ALL VOTES RECEIVED - GOING TO RESULTS..." : `SELECT THE ${imposterCount > 1 ? `${imposterCount} IMPOSTORS` : 'IMPOSTOR'}`}
                </Text>

                {/* TABS */}
                <View style={styles.tabContainer}>
                    <TouchableOpacity
                        style={[styles.tab, !showChat && styles.activeTab]}
                        onPress={() => { playHaptic('light'); setShowChat(false); }}
                    >
                        <Text style={[styles.tabText, !showChat && styles.activeTabText]}>VOTE</Text>
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
                                <View style={styles.notificationBadge}>
                                    <Text style={styles.notificationText}>
                                        {unreadMessages === 1 ? "1 MSG" : `${unreadMessages} MSGS`}
                                    </Text>
                                </View>
                            )}
                        </View>
                    </TouchableOpacity>
                </View>
            </View>

            <View style={{ flex: 1, width: '100%' }}>
                {showChat ? (
                    <ChatSystem
                        roomCode={roomCode}
                        playerId={userId}
                        playerName={players.find(p => p.id === userId)?.name || 'Player'}
                        onUnreadChange={handleUnreadChange}
                    />
                ) : (
                    <ScrollView contentContainerStyle={styles.scrollContent}>
                        {/* Player Status Display - NEW DESIGN */}
                        <View style={styles.playerStatusContainer}>
                            <Text style={styles.playerStatusTitle}>PLAYER STATUS</Text>

                            <View style={styles.playerStatusRow}>
                                {players.map((player) => {
                                    const hasVoted = votingStatus[player.id];
                                    const isActive = !hasVoted; // Or utilize presence if available

                                    return (
                                        <View key={player.id} style={styles.playerStatusAvatarContainer}>
                                            <View style={[
                                                styles.playerAvatarCircle,
                                                hasVoted ? styles.avatarVoted : styles.avatarActive
                                            ]}>
                                                {/* Use first letter of name for avatar if no image */}
                                                <Text style={styles.avatarText}>
                                                    {player.name.charAt(0).toUpperCase()}
                                                </Text>
                                            </View>

                                            {/* Status Badge */}
                                            <View style={[
                                                styles.statusBadge,
                                                hasVoted ? styles.statusBadgeVoted : styles.statusBadgePending
                                            ]}>
                                                {hasVoted ? (
                                                    <Text style={styles.checkmarkIcon}>✓</Text>
                                                ) : (
                                                    <View style={styles.pendingDot} />
                                                )}
                                            </View>
                                        </View>
                                    );
                                })}
                            </View>

                            <Text style={styles.readyText}>
                                {Object.values(votingStatus).filter(v => v).length} / {players.length} READY
                            </Text>
                        </View>

                        <View style={styles.playerGrid}>
                            {players.map((player) => (
                                <TouchableOpacity
                                    key={player.id}
                                    style={[
                                        styles.playerCard,
                                        { backgroundColor: theme.colors.surface },
                                        myVotes.includes(player.id) && styles.selectedCard,
                                        player.id === userId && styles.selfCard
                                    ]}
                                    onPress={() => toggleVote(player.id)}
                                    disabled={isSubmitted || player.id === userId}
                                >
                                    <Text style={[styles.playerName, { color: theme.colors.text }]}>
                                        {player.name.toUpperCase()} {player.id === userId ? '(YOU)' : ''}
                                    </Text>
                                    {myVotes.includes(player.id) && (
                                        <Text style={styles.voteMarker}>✓ SUSPECT</Text>
                                    )}
                                </TouchableOpacity>
                            ))}
                        </View>
                    </ScrollView>
                )}


                {!showChat && (
                    <View style={styles.footer}>
                        <Text style={styles.statusText}>
                            {votingConcluded ? "ALL VOTES RECEIVED - GOING TO RESULTS..." :
                                isSubmitted ? "WAITING FOR OTHERS..." :
                                    `SUSPECTS TO PICK: ${imposterCount - myVotes.length}`}
                        </Text>
                        <Button
                            title={votingConcluded ? "PROCESSING..." : connectionStatus !== 'connected' ? "RECONNECTING..." : "SUBMIT VOTES"}
                            onPress={submitVotes}
                            disabled={votingConcluded || isSubmitted || myVotes.length !== imposterCount || connectionStatus !== 'connected'}
                            style={styles.submitBtn}
                        />
                    </View>
                )}
            </View>
        </LinearGradient>
    );
}

const getStyles = (theme) => StyleSheet.create({
    container: { flex: 1, alignItems: 'center' },
    // Kodak Film Strip Decorations
    filmHeader: {
        width: '100%',
        paddingTop: 50,
    },
    filmFooter: {
        width: '100%',
        paddingBottom: 10,
        position: 'absolute',
        bottom: 0,
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
        backgroundColor: '#D4A000',
        borderRadius: 2,
        opacity: 0.8,
    },
    header: { marginTop: 10, alignItems: 'center', marginBottom: 10, width: '100%' },
    title: { 
        fontSize: 40, 
        color: '#FFD54F', 
        fontFamily: theme.fonts.header, 
        letterSpacing: 4,
        textShadowColor: '#D4A000',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 25,
    },
    subtitle: { 
        fontSize: 14, 
        color: '#D4A000', 
        fontFamily: theme.fonts.medium, 
        letterSpacing: 3, 
        marginBottom: 5, 
        textAlign: 'center' 
    },
    scrollContent: { padding: 20, width: '100%' },
    playerGrid: { gap: 10, width: '100%' },
    playerCard: { 
        padding: 18, 
        borderRadius: 10, 
        borderWidth: 2, 
        borderColor: 'rgba(212, 160, 0, 0.3)', 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        width: '100%',
        backgroundColor: 'rgba(26, 26, 26, 0.9)',
    },
    selectedCard: { 
        borderColor: '#FFD54F', 
        backgroundColor: 'rgba(212, 160, 0, 0.15)',
        shadowColor: '#FFB800',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 12,
        elevation: 8,
    },
    selfCard: { opacity: 0.5 },
    playerName: { fontSize: 18, fontFamily: theme.fonts.header, letterSpacing: 2, color: '#FFD54F' },
    voteMarker: { color: '#FFD54F', fontFamily: theme.fonts.bold, fontSize: 13, letterSpacing: 2 },
    footer: { padding: 20, gap: 10, marginBottom: 20, width: '100%' },
    statusText: { 
        textAlign: 'center', 
        color: '#D4A000', 
        fontFamily: theme.fonts.medium, 
        fontSize: 14, 
        letterSpacing: 3 
    },
    submitBtn: { width: '100%' },
    timerBadge: {
        position: 'absolute',
        top: -30,
        right: 20,
        backgroundColor: 'rgba(212, 160, 0, 0.2)',
        paddingHorizontal: 16,
        paddingVertical: 6,
        borderRadius: 20,
        borderWidth: 2,
        borderColor: '#D4A000'
    },
    timerText: {
        color: '#FFD54F',
        fontFamily: theme.fonts.bold,
        fontSize: 18,
        letterSpacing: 2
    },
    connectionBadge: {
        position: 'absolute',
        top: -30,
        left: 20,
        backgroundColor: 'rgba(255, 165, 0, 0.8)',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 15,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.3)'
    },
    connectionText: {
        color: '#fff',
        fontFamily: theme.fonts.bold,
        fontSize: 12,
        letterSpacing: 1
    },
    votingStatusContainer: {
        width: '100%',
        marginBottom: 20,
        backgroundColor: 'rgba(212, 160, 0, 0.1)',
        borderRadius: 12,
        padding: 15,
        borderWidth: 2,
        borderColor: 'rgba(212, 160, 0, 0.3)'
    },
    // NEW PLAYER STATUS STYLES - KODAK CINEMATIC
    playerStatusContainer: {
        width: '100%',
        alignItems: 'center',
        marginBottom: 25,
        backgroundColor: 'rgba(212, 160, 0, 0.08)',
        borderRadius: 12,
        padding: 15,
        borderWidth: 2,
        borderColor: 'rgba(212, 160, 0, 0.25)',
    },
    playerStatusTitle: {
        color: '#D4A000',
        fontFamily: theme.fonts.header,
        fontSize: 14,
        marginBottom: 12,
        letterSpacing: 4,
        textTransform: 'uppercase'
    },
    playerStatusRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 16,
        marginBottom: 12
    },
    playerStatusAvatarContainer: {
        position: 'relative',
        width: 54,
        height: 54,
    },
    playerAvatarCircle: {
        width: 54,
        height: 54,
        borderRadius: 27,
        borderWidth: 3,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(212, 160, 0, 0.1)'
    },
    avatarActive: {
        borderColor: 'rgba(212, 160, 0, 0.4)'
    },
    avatarVoted: {
        borderColor: '#FFD54F',
        shadowColor: '#FFB800',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.6,
        shadowRadius: 10,
    },
    avatarText: {
        color: '#FFD54F',
        fontFamily: theme.fonts.bold,
        fontSize: 22
    },
    statusBadge: {
        position: 'absolute',
        bottom: -2,
        right: -4,
        width: 22,
        height: 22,
        borderRadius: 11,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#0a0a0a'
    },
    statusBadgeVoted: {
        backgroundColor: '#FFD54F'
    },
    statusBadgePending: {
        backgroundColor: 'rgba(212, 160, 0, 0.5)',
        width: 18,
        height: 18,
        bottom: 0,
        right: -2
    },
    checkmarkIcon: {
        color: '#0a0a0a',
        fontSize: 12,
        fontWeight: 'bold'
    },
    pendingDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: '#0a0a0a'
    },
    readyText: {
        color: '#FFD54F',
        fontFamily: theme.fonts.header,
        fontSize: 20,
        letterSpacing: 3,
        textShadowColor: '#D4A000',
        textShadowOffset: { width: 0, height: 0 },
        textShadowRadius: 10,
    },
    // TAB STYLES - KODAK CINEMATIC
    tabContainer: {
        flexDirection: 'row',
        marginTop: 10,
        backgroundColor: 'rgba(26, 26, 26, 0.9)',
        borderRadius: 25,
        padding: 4,
        borderWidth: 2,
        borderColor: '#D4A000',
        alignSelf: 'center',
    },
    tab: {
        paddingVertical: 8,
        paddingHorizontal: 28,
        borderRadius: 20,
    },
    activeTab: {
        backgroundColor: '#D4A000',
    },
    tabContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    tabText: {
        color: 'rgba(212, 160, 0, 0.6)',
        fontFamily: theme.fonts.bold,
        fontSize: 13,
        letterSpacing: 2,
    },
    activeTabText: {
        color: '#0a0a0a',
        fontFamily: theme.fonts.bold,
    },
    notificationBadge: {
        position: 'absolute',
        top: -12,
        right: -25,
        backgroundColor: '#ff3b30',
        paddingHorizontal: 6,
        paddingVertical: 2,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: '#0a0a0a'
    },
    notificationText: {
        color: '#fff',
        fontSize: 9,
        fontFamily: theme.fonts.bold
    }
});
