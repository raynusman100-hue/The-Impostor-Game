import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, Animated, ActivityIndicator, TouchableOpacity, Alert, BackHandler } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../utils/ThemeContext';
import Button from '../components/Button';
import { playHaptic } from '../utils/haptics';
import { database } from '../utils/firebase';
import { ref, onValue, off, remove, get } from 'firebase/database';
import { CustomAvatar } from '../utils/AvatarGenerator';

import ChatSystem from '../components/ChatSystem';
// ... existing imports

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
                // Room deleted
                if (!hasNavigated) {
                    hasNavigated = true;
                    Alert.alert('Room Closed', 'The host has ended the game.');
                    navigation.navigate('Home');
                }
            }
        });

        // Listener for Players
        const playersUnsubscribe = onValue(playersRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const playerList = Object.entries(data).map(([id, info]) => ({
                    id,
                    ...info
                }));
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
            colors={theme.colors.backgroundGradient}
            style={styles.container}
        >
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
                        setUnreadMessages(0); // Clear unread when opening chat
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
                        <ActivityIndicator size="large" color={theme.colors.primary} style={styles.loader} />
                        <Text style={styles.statusText}>WAITING FOR HOST TO START...</Text>

                        <View style={[styles.playerBox, { backgroundColor: theme.colors.surface }]}>
                            <Text style={styles.playerCount}>PLAYERS JOINED: {players.length + 1}</Text>

                            {/* Host Row */}
                            <View style={styles.playerRow}>
                                <CustomAvatar id={hostAvatar} size={30} />
                                <Text style={styles.playerName} numberOfLines={1} ellipsizeMode="tail">
                                    {hostName.toUpperCase()} (HOST)
                                </Text>
                            </View>

                            {/* Players Rows */}
                            {players.map(p => (
                                <View key={p.id} style={styles.playerRow}>
                                    <CustomAvatar id={p.avatarId || 1} size={30} />
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
                <Button
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
        </LinearGradient>
    );
}

const getStyles = (theme) => StyleSheet.create({
    container: {
        flex: 1,
        padding: theme.spacing.xl,
        alignItems: 'center',
    },
    header: {
        marginTop: 40,
        alignItems: 'center',
        marginBottom: 20,
    },
    roomLabel: {
        fontSize: 18,
        color: theme.colors.tertiary,
        fontFamily: theme.fonts.medium,
        letterSpacing: 4,
    },
    roomCode: {
        fontSize: 56,
        color: theme.colors.text,
        fontFamily: theme.fonts.header,
        letterSpacing: 8,
    },
    tabContainer: {
        flexDirection: 'row',
        marginBottom: 10,
        backgroundColor: theme.colors.surface,
        borderRadius: 25,
        padding: 4,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
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
        color: theme.colors.textSecondary,
        fontFamily: theme.fonts.medium,
        fontSize: 14,
    },
    activeTabText: {
        color: '#fff',
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
        justifyContent: 'center', // Center content vertically
        alignItems: 'center',
    },
    loader: {
        marginBottom: 20,
    },
    statusText: {
        fontSize: 20,
        color: theme.colors.text,
        fontFamily: theme.fonts.medium,
        textAlign: 'center',
        marginBottom: 40,
        letterSpacing: 2,
    },
    playerBox: {
        width: '100%',
        padding: 20,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    playerCount: {
        fontSize: 16,
        color: theme.colors.primary,
        fontFamily: theme.fonts.bold,
        marginBottom: 10,
        letterSpacing: 2,
    },
    playerName: {
        fontSize: 18,
        color: theme.colors.text,
        fontFamily: theme.fonts.medium,
        marginBottom: 4,
        flex: 1,
    },
    leaveBtn: {
        width: '100%',
        marginBottom: 40,
        backgroundColor: 'transparent',
    },
    playerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        marginBottom: 4
    }
});
