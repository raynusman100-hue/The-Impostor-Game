import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Animated, ActivityIndicator, TouchableOpacity, Alert, BackHandler } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../utils/ThemeContext';
import Button from '../components/Button';
import KodakButton from '../components/KodakButton';
import { playHaptic } from '../utils/haptics';
import { database } from '../utils/firebase';
import { ref, onValue, off, remove, get } from 'firebase/database';
import { CustomAvatar } from '../utils/AvatarGenerator';

import ChatSystem from '../components/ChatSystem';
// ... existing imports

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

export default function WifiLobbyScreen({ route, navigation }) {
    const { theme } = useTheme();
    const styles = getStyles(theme);
    const { roomCode, playerId, playerName } = route.params;
    const [players, setPlayers] = useState([]);
    const [roomStatus, setRoomStatus] = useState('lobby');

    // Host Data
    const [hostName, setHostName] = useState('Waiting...');
    const [hostAvatar, setHostAvatar] = useState(1);

    const [showChat, setShowChat] = useState(false);
    const [unreadMessages, setUnreadMessages] = useState(0);

    // Disable Android back button
    useEffect(() => {
        const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
            Alert.alert(
                'Leave Room?',
                'Are you sure you want to leave the room?',
                [
                    { text: 'Stay', style: 'cancel' },
                    { 
                        text: 'Leave', 
                        style: 'destructive',
                        onPress: async () => {
                            if (roomCode && playerId) {
                                const playerRef = ref(database, `rooms/${roomCode}/players/${playerId}`);
                                await remove(playerRef);
                            }
                            navigation.navigate('Home');
                        }
                    }
                ]
            );
            return true; // Prevent default back behavior
        });

        return () => backHandler.remove();
    }, [roomCode, playerId, navigation]);

    // Enhanced unread message handler
    const handleUnreadChange = useCallback((count) => {
        // Only show unread count when chat is not active
        if (!showChat) {
            setUnreadMessages(count);
        } else {
            setUnreadMessages(0);
        }
    }, [showChat]);
    const pulseAnim = React.useRef(new Animated.Value(1)).current;

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, { toValue: 1.05, duration: 1000, useNativeDriver: true }),
                Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
            ])
        ).start();

        let hasNavigated = false;
        
        const navigateToGame = (status) => {
            if (hasNavigated) return;
            hasNavigated = true;
            
            console.log(`🎯 LOBBY: Navigating to ${status} for player ${playerId}`);
            
            if (status === 'voting') {
                navigation.replace('WifiVoting', { roomCode, userId: playerId });
            } else if (status === 'game' || status === 'roles' || status === 'reveal') {
                navigation.replace('RoleReveal', {
                    mode: 'wifi',
                    roomCode: roomCode,
                    playerId: playerId,
                });
            }
        };

        const roomRef = ref(database, `rooms/${roomCode}`);
        const playersRef = ref(database, `rooms/${roomCode}/players`);

        // Listener for Room Status & Host Info
        const roomUnsubscribe = onValue(roomRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                console.log(`🎯 LOBBY: [${playerId}] Room status = ${data.status}`);
                setRoomStatus(data.status);
                setHostName(data.host || 'Unknown Host');
                setHostAvatar(data.hostAvatar || 1);

                if (!hasNavigated && (data.status === 'voting' || data.status === 'game' || data.status === 'roles' || data.status === 'reveal')) {
                    navigateToGame(data.status);
                }
            } else {
                // Room deleted - but wait a moment to confirm it's really gone
                // (prevents false positives during play again transitions)
                setTimeout(async () => {
                    if (hasNavigated) return;
                    
                    // Double-check the room is really gone
                    const recheck = await get(roomRef);
                    if (!recheck.exists() && !hasNavigated) {
                        hasNavigated = true;
                        Alert.alert('Room Closed', 'The host has ended the game.');
                        navigation.navigate('Home');
                    }
                }, 500);
            }
        });

        // Listener for Players - with immediate state update
        const playersUnsubscribe = onValue(playersRef, (snapshot) => {
            const data = snapshot.val();
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
            } else {
                setPlayers([]);
            }
        });

        // BACKUP: Periodic check every 2 seconds in case listener misses update
        const checkInterval = setInterval(async () => {
            if (hasNavigated) {
                clearInterval(checkInterval);
                return;
            }
            
            try {
                const snapshot = await get(roomRef);
                const data = snapshot.val();
                
                if (data && !hasNavigated) {
                    const status = data.status;
                    if (status === 'voting' || status === 'game' || status === 'roles' || status === 'reveal') {
                        console.log(`🎯 LOBBY: [PERIODIC CHECK] Status is ${status} - navigating!`);
                        clearInterval(checkInterval);
                        navigateToGame(status);
                    }
                }
            } catch (err) {
                console.error("🚨 LOBBY: Periodic check error:", err);
            }
        }, 2000);

        return () => {
            off(roomRef);
            off(playersRef);
            clearInterval(checkInterval);
        };
    }, [roomCode, playerId, navigation]);

    return (
        <LinearGradient
            colors={theme.colors.backgroundGradient || [theme.colors.background, theme.colors.background, theme.colors.background]}
            style={styles.container}
        >
            {/* Film perforations - side strips */}
            <FilmPerforations side="left" theme={theme} />
            <FilmPerforations side="right" theme={theme} />
            
            {/* Kodak Film Header */}
            <View style={styles.filmHeader}>
                <View style={styles.filmStrip}>
                    {[...Array(16)].map((_, i) => (
                        <View key={i} style={styles.filmHole} />
                    ))}
                </View>
            </View>
            
            <View style={styles.header}>
                <Text style={styles.roomLabel}>WAITING IN ROOM</Text>
                <Animated.Text style={[styles.roomCode, { transform: [{ scale: pulseAnim }] }]}>
                    {roomCode}
                </Animated.Text>
            </View>

            {/* Toggle Chat / Lobby */}
            <View style={styles.tabContainer}>
                <TouchableOpacity
                    style={[styles.tab, !showChat && styles.activeTab]}
                    onPress={() => {
                        playHaptic('light');
                        setShowChat(false);
                    }}
                >
                    <Text style={[styles.tabText, !showChat && styles.activeTabText]}>LOBBY</Text>
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

            <View style={styles.content}>
                {showChat ? (
                    <ChatSystem
                        roomCode={roomCode}
                        playerId={playerId}
                        playerName={playerName}
                        onUnreadChange={handleUnreadChange}
                    />
                ) : (
                    <>
                        <View style={styles.loaderContainer}>
                            <ActivityIndicator size="large" color={theme.colors.tertiary} style={styles.loader} />
                            <Text style={styles.statusText}>WAITING FOR HOST TO START...</Text>
                        </View>

                        <View style={styles.playerBox}>
                            <Text style={styles.playerCount}>PLAYERS JOINED: {players.length + 1}</Text>

                            {/* Host Row */}
                            <View style={styles.playerRow}>
                                <CustomAvatar id={hostAvatar} size={32} />
                                <Text style={styles.playerName} numberOfLines={1} ellipsizeMode="tail">
                                    {hostName.toUpperCase()} (HOST)
                                </Text>
                            </View>

                            {/* Players Rows */}
                            {players.map(p => (
                                <View key={p.id} style={styles.playerRow}>
                                    <CustomAvatar id={p.avatarId || 1} size={32} />
                                    <Text style={styles.playerName} numberOfLines={1} ellipsizeMode="tail">
                                        {p.name}
                                    </Text>
                                </View>
                            ))}
                        </View>
                    </>
                )}
            </View>

            {!showChat && (
                <KodakButton
                    title="LEAVE ROOM"
                    onPress={async () => {
                        playHaptic('medium');
                        if (roomCode && playerId) {
                            const playerRef = ref(database, `rooms/${roomCode}/players/${playerId}`);
                            await remove(playerRef);
                        }
                        navigation.navigate('Home');
                    }}
                    variant="secondary"
                    style={styles.leaveBtn}
                />
            )}
            
            {/* Kodak Film Footer */}
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

const getStyles = (theme) => StyleSheet.create({
    container: {
        flex: 1,
        padding: theme.spacing.xl,
        alignItems: 'center',
    },
    
    // Kodak Film Strip Decorations
    filmHeader: {
        width: '100%',
        position: 'absolute',
        top: 40,
        left: 0,
        right: 0,
    },
    filmFooter: {
        width: '100%',
        position: 'absolute',
        bottom: 15,
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
        marginTop: 60,
        alignItems: 'center',
        marginBottom: 20,
        position: 'relative',
        width: '100%',
    },
    roomLabel: {
        fontSize: 14,
        color: theme.colors.tertiary,
        fontFamily: theme.fonts.bold,
        letterSpacing: 6,
    },
    roomCode: {
        fontSize: 52,
        color: theme.colors.text,
        fontFamily: theme.fonts.header,
        letterSpacing: 10,
        ...theme.textShadows.depth,
    },
    
    tabContainer: {
        flexDirection: 'row',
        marginBottom: 15,
        backgroundColor: theme.colors.surface,
        borderRadius: 25,
        padding: 4,
        borderWidth: 2,
        borderColor: theme.colors.primary,
    },
    tab: {
        paddingVertical: 10,
        paddingHorizontal: 35,
        borderRadius: 20,
    },
    activeTab: {
        backgroundColor: theme.colors.primary,
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
    tabContent: {
        flexDirection: 'row',
        alignItems: 'center',
        position: 'relative',
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
    
    content: {
        flex: 1,
        width: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    loaderContainer: {
        alignItems: 'center',
        marginBottom: 30,
    },
    loader: {
        marginBottom: 20,
    },
    statusText: {
        fontSize: 18,
        color: theme.colors.text,
        fontFamily: theme.fonts.bold,
        textAlign: 'center',
        letterSpacing: 3,
        ...theme.textShadows.softDepth,
    },
    
    playerBox: {
        width: '100%',
        padding: 20,
        borderRadius: 16,
        borderWidth: 2,
        borderColor: theme.colors.primary,
        backgroundColor: theme.colors.surface,
    },
    playerCount: {
        fontSize: 14,
        color: theme.colors.tertiary,
        fontFamily: theme.fonts.bold,
        marginBottom: 15,
        letterSpacing: 3,
    },
    playerName: {
        fontSize: 18,
        color: theme.colors.text,
        fontFamily: theme.fonts.medium,
        marginBottom: 4,
        flex: 1,
        letterSpacing: 1,
    },
    playerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginBottom: 8
    },
    
    leaveBtn: {
        width: '100%',
        marginBottom: 50,
    },
});
