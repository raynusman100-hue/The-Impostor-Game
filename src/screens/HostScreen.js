import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Share, Alert, ActivityIndicator, TextInput, Platform, TouchableOpacity, LayoutAnimation, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import QRCode from 'react-native-qrcode-svg';
import { useTheme } from '../utils/ThemeContext';
import Button from '../components/Button';
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

export default function HostScreen({ navigation, route }) {
    const { theme } = useTheme();
    const styles = getStyles(theme);
    const { playerData, existingRoomCode } = route.params || {}; // Added existingRoomCode for play again

    const [roomCode, setRoomCode] = useState(existingRoomCode || '');
    const [players, setPlayers] = useState([]);
    const [isReturningToLobby, setIsReturningToLobby] = useState(!!existingRoomCode);

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

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(pulseAnim, { toValue: 1.05, duration: 1000, useNativeDriver: true }),
                Animated.timing(pulseAnim, { toValue: 1, duration: 1000, useNativeDriver: true }),
            ])
        ).start();

        if (!playerData) return;

        // If returning to existing room, use that code; otherwise create new
        const code = existingRoomCode || Math.floor(100000 + Math.random() * 900000).toString();
        setRoomCode(code);

        const roomRef = ref(database, `rooms/${code}`);
        
        if (existingRoomCode) {
            // RETURNING TO EXISTING ROOM - just update status
            console.log("🔄 HOST: Returning to existing room:", code);
            update(roomRef, {
                status: 'lobby',
                gameStarted: false,
                gameInProgress: false
            });
        } else {
            // CREATING NEW ROOM
            console.log("🔄 HOST: Creating new room:", code);
            set(roomRef, {
                status: 'lobby',
                createdAt: Date.now(),
                host: playerData.name,
                hostId: playerData.uid,
                hostAvatar: playerData.avatarId
            });
        }

        // Simple: if host disconnects/closes app, delete the room
        onDisconnect(roomRef).remove();

        const playersRef = ref(database, `rooms/${code}/players`);
        const unsubscribe = onValue(playersRef, (snapshot) => {
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

        // When host navigates away, delete the room
        const beforeRemoveListener = navigation.addListener('beforeRemove', () => {
            remove(roomRef);
        });

        return () => {
            off(playersRef);
            beforeRemoveListener();
        };
    }, [navigation, playerData, existingRoomCode]);

    const toggleCategory = (key) => {
        playHaptic('light');
        setSelectedCategories(prev => {
            if (key === 'all') return ['all'];
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

    if (!playerData) return null; // Should be handled by useEffect redirect

    return (
        <LinearGradient colors={theme.colors.backgroundGradient} style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>ROOM CODE</Text>
                <Animated.Text style={[styles.codeText, { transform: [{ scale: pulseAnim }] }]}>
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

            {showChat ? (
                <View style={{ flex: 1, width: '100%', paddingBottom: 20 }}>
                    <ChatSystem
                        roomCode={roomCode}
                        playerId="host-id"
                        playerName={playerData.name}
                        onUnreadChange={handleUnreadChange}
                    />
                </View>
            ) : (
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <View style={styles.qrContainer}>
                        {roomCode ? (
                            <QRCode value={roomCode} size={150} color={theme.colors.primary} backgroundColor="transparent" />
                        ) : (
                            <ActivityIndicator color={theme.colors.primary} />
                        )}
                    </View>

                    {/* Host Info - Replaces Input */}
                    <View style={[styles.section, { backgroundColor: theme.colors.surface, alignItems: 'center' }]}>
                        <Text style={styles.sectionTitle}>YOUR PROFILE</Text>
                        <CustomAvatar id={playerData.avatarId} size={70} />
                        <Text style={[styles.settingLabel, { marginTop: 10, fontSize: 24, fontFamily: theme.fonts.bold }]}>
                            {playerData.name.toUpperCase()}
                        </Text>
                        <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>HOST</Text>
                    </View>

                    {/* Game Settings */}
                    <View style={[styles.section, { backgroundColor: theme.colors.surface }]}>
                        <Text style={styles.sectionTitle}>GAME SETTINGS</Text>

                        <View style={styles.settingRow}>
                            <Text style={styles.settingLabel}>IMPOSTORS: {impostorCount}</Text>
                            <View style={styles.counterControls}>
                                <TouchableOpacity onPress={() => setImpostorCount(Math.max(1, impostorCount - 1))} style={styles.countBtn}>
                                    <Text style={styles.countBtnText}>-</Text>
                                </TouchableOpacity>
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

                        <Button
                            title={`LANGUAGE: ${SUPPORTED_LANGUAGES.find(l => l.code === language)?.label.toUpperCase()}`}
                            onPress={() => setIsLanguageModalVisible(true)}
                            variant="secondary"
                            style={styles.settingBtn}
                        />

                        <Button
                            title={`CATEGORIES ${isCategoriesOpen ? '(-)' : '(+)'}`}
                            onPress={() => {
                                LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                                setIsCategoriesOpen(!isCategoriesOpen);
                            }}
                            variant="secondary"
                            style={styles.settingBtn}
                        />

                        {isCategoriesOpen && (
                            <View style={styles.categoryDropdownContainer}>
                                <View style={styles.categoryGrid}>
                                    {CATEGORY_LABELS.map((cat) => (
                                        <TouchableOpacity
                                            key={cat.key}
                                            style={[styles.catItem, selectedCategories.includes(cat.key) && styles.catItemSelected]}
                                            onPress={() => toggleCategory(cat.key)}
                                        >
                                            <Text style={[styles.catText, selectedCategories.includes(cat.key) && styles.catTextSelected]}>
                                                {cat.label.toUpperCase()}
                                            </Text>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>
                        )}
                    </View>

                    <View style={[styles.playerSection, { backgroundColor: theme.colors.surface }]}>
                        <Text style={styles.playerCount}>PLAYERS: {players.length + 1} / 3 MIN</Text>
                        <View style={styles.playerList}>
                            <View style={styles.playerRow}>
                                <CustomAvatar id={playerData.avatarId} size={30} />
                                <Text style={styles.playerItem}>{playerData.name.toUpperCase()} (YOU)</Text>
                            </View>
                            {players.map((p) => (
                                <View key={p.id} style={styles.playerRow}>
                                    <CustomAvatar id={p.avatarId || 1} size={30} />
                                    <Text style={styles.playerItem}>{p.name}</Text>
                                </View>
                            ))}
                        </View>
                    </View>

                    <View style={styles.footer}>
                        <Button title="SHARE INVITE" onPress={handleShare} variant="secondary" />
                        <Button title="START GAME" onPress={handleStartGame} disabled={players.length + 1 < 3} />
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

const getStyles = (theme) => StyleSheet.create({
    container: { flex: 1 },
    scrollContent: { padding: theme.spacing.l, alignItems: 'center' },
    header: { marginTop: Platform.OS === 'ios' ? 80 : 40, alignItems: 'center', marginBottom: 10 },
    title: { fontSize: 20, color: theme.colors.tertiary, fontFamily: theme.fonts.medium, letterSpacing: 4 },
    codeText: { fontSize: 56, color: theme.colors.text, fontFamily: theme.fonts.header, letterSpacing: 6 },
    tabContainer: {
        flexDirection: 'row',
        marginBottom: 10,
        backgroundColor: theme.colors.surface,
        borderRadius: 25,
        padding: 4,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        alignSelf: 'center'
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
    qrContainer: { padding: 15, backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 15, marginVertical: 20 },
    section: { width: '100%', padding: 15, borderRadius: 16, marginBottom: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
    sectionTitle: { fontSize: 14, color: theme.colors.primary, fontFamily: theme.fonts.bold, marginBottom: 15, letterSpacing: 2 },
    settingRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
    settingLabel: { color: theme.colors.text, fontSize: 18, fontFamily: theme.fonts.medium },
    counterControls: { flexDirection: 'row', gap: 10 },
    countBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: theme.colors.textSecondary },
    countBtnText: { color: theme.colors.text, fontSize: 24 },
    settingBtn: {
        width: '100%',
        marginBottom: 15,
        minHeight: 60
    },
    categoryDropdownContainer: {
        backgroundColor: 'rgba(255,255,255,0.08)',
        borderRadius: 16,
        padding: 15,
        marginTop: 10,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.15)',
    },
    categoryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
    catItem: { paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: theme.colors.textSecondary },
    catItemSelected: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
    catText: { color: theme.colors.textSecondary, fontSize: 12, fontFamily: theme.fonts.medium },
    catTextSelected: { color: theme.colors.secondary },
    playerSection: { width: '100%', padding: 15, borderRadius: 16, marginBottom: 30, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
    playerCount: { fontSize: 16, color: theme.colors.primary, fontFamily: theme.fonts.bold, marginBottom: 10, letterSpacing: 2 },
    playerList: { gap: 10 },
    playerRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    playerItem: { fontSize: 18, color: theme.colors.text, fontFamily: theme.fonts.medium },
    footer: { width: '100%', gap: 10, paddingBottom: 40 },
    input: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        height: 50,
        borderRadius: 12,
        paddingHorizontal: 15,
        fontSize: 18,
        fontFamily: theme.fonts.medium,
        borderWidth: 1,
    },
    inputRow: {
        flexDirection: 'row',
        gap: 10,
        marginTop: 10,
    },
    generateBtn: {
        width: 50,
        height: 50,
        borderRadius: 12,
        paddingHorizontal: 0,
        paddingVertical: 0,
        justifyContent: 'center',
        alignItems: 'center',
    }
});
