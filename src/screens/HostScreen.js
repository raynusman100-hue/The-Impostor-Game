import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Share, Alert, ActivityIndicator, Platform, TouchableOpacity, LayoutAnimation, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
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
import { CustomAvatar } from '../utils/AvatarGenerator';

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

    if (!playerData) return null;

    return (
        <LinearGradient colors={['#0a0a0a', '#121212', '#0a0a0a']} style={styles.container}>
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
                <ScrollView 
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {/* QR Code */}
                    <View style={styles.qrContainer}>
                        {roomCode ? (
                            <QRCode value={roomCode} size={120} color="#D4A000" backgroundColor="transparent" />
                        ) : (
                            <ActivityIndicator color="#D4A000" />
                        )}
                    </View>

                    {/* Host Info - Compact */}
                    <View style={styles.hostCard}>
                        <CustomAvatar id={playerData.avatarId} size={50} />
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
                                    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                                    setIsCategoriesOpen(!isCategoriesOpen);
                                }}
                            >
                                <Text style={styles.settingBtnLabel}>CATEGORY</Text>
                                <Text style={styles.settingBtnValue}>
                                    {selectedCategories.includes('all') ? 'ALL' : selectedCategories.length}
                                </Text>
                            </TouchableOpacity>
                        </View>

                        {isCategoriesOpen && (
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
                        )}
                    </View>

                    {/* Players List */}
                    <View style={styles.playersCard}>
                        <Text style={styles.playerCount}>PLAYERS ({players.length + 1}/3 MIN)</Text>
                        <View style={styles.playerList}>
                            <View style={styles.playerRow}>
                                <CustomAvatar id={playerData.avatarId} size={28} />
                                <Text style={styles.playerName}>{playerData.name.toUpperCase()}</Text>
                                <Text style={styles.youTag}>(YOU)</Text>
                            </View>
                            {players.map((p) => (
                                <View key={p.id} style={styles.playerRow}>
                                    <CustomAvatar id={p.avatarId || 1} size={28} />
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

const getStyles = (theme) => StyleSheet.create({
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
        color: '#D4A000', 
        fontFamily: theme.fonts.bold, 
        letterSpacing: 4,
    },
    codeText: { 
        fontSize: 48, 
        color: '#FFD54F', 
        fontFamily: theme.fonts.header, 
        letterSpacing: 8,
    },
    
    tabContainer: {
        flexDirection: 'row',
        marginBottom: 12,
        backgroundColor: 'rgba(26, 26, 26, 0.9)',
        borderRadius: 25,
        padding: 4,
        borderWidth: 2,
        borderColor: '#D4A000',
        alignSelf: 'center',
    },
    tab: {
        paddingVertical: 8,
        paddingHorizontal: 30,
        borderRadius: 20,
    },
    activeTab: {
        backgroundColor: '#D4A000',
    },
    tabText: {
        color: 'rgba(255, 213, 79, 0.6)',
        fontFamily: theme.fonts.bold,
        fontSize: 13,
        letterSpacing: 2,
    },
    activeTabText: {
        color: '#0a0a0a',
    },
    tabContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    notificationDot: {
        position: 'absolute',
        top: -6,
        right: -8,
        backgroundColor: '#ff3b30',
        borderRadius: 6,
        width: 12,
        height: 12,
        borderWidth: 2,
        borderColor: '#0a0a0a',
    },
    
    qrContainer: { 
        padding: 16, 
        backgroundColor: 'rgba(212, 160, 0, 0.08)', 
        borderRadius: 16, 
        marginBottom: 12,
        borderWidth: 2,
        borderColor: '#D4A000',
        alignSelf: 'center',
    },
    
    // Host Card - Compact horizontal layout
    hostCard: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 14,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#D4A000',
        backgroundColor: 'rgba(212, 160, 0, 0.08)',
        marginBottom: 12,
        gap: 14,
    },
    hostInfo: {
        flex: 1,
    },
    hostName: {
        fontSize: 20,
        fontFamily: theme.fonts.bold,
        color: '#FFD54F',
        letterSpacing: 1,
    },
    hostBadge: { 
        marginTop: 4,
        backgroundColor: '#D4A000',
        paddingHorizontal: 10,
        paddingVertical: 3,
        borderRadius: 8,
        alignSelf: 'flex-start',
    },
    hostBadgeText: {
        color: '#0a0a0a',
        fontSize: 10,
        fontFamily: theme.fonts.bold,
        letterSpacing: 2,
    },
    
    // Settings Card - Compact
    settingsCard: {
        padding: 14,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#D4A000',
        backgroundColor: 'rgba(212, 160, 0, 0.08)',
        marginBottom: 12,
    },
    settingRow: { 
        flexDirection: 'row', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        marginBottom: 12,
    },
    settingLabel: { 
        color: '#D4A000', 
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
        backgroundColor: 'rgba(212, 160, 0, 0.15)', 
        alignItems: 'center', 
        justifyContent: 'center', 
        borderWidth: 2, 
        borderColor: '#D4A000',
    },
    countBtnText: { 
        color: '#FFD54F', 
        fontSize: 20, 
        fontFamily: theme.fonts.bold,
        lineHeight: 22,
    },
    countValue: {
        color: '#FFD54F',
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
        backgroundColor: 'rgba(212, 160, 0, 0.1)',
        borderRadius: 10,
        padding: 10,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(212, 160, 0, 0.4)',
    },
    settingBtnLabel: {
        color: 'rgba(212, 160, 0, 0.7)',
        fontSize: 9,
        fontFamily: theme.fonts.medium,
        letterSpacing: 2,
    },
    settingBtnValue: {
        color: '#FFD54F',
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
        borderColor: 'rgba(212, 160, 0, 0.5)',
        backgroundColor: 'rgba(212, 160, 0, 0.1)',
    },
    catItemSelected: { 
        backgroundColor: '#D4A000', 
        borderColor: '#D4A000',
    },
    catText: { 
        color: 'rgba(255, 213, 79, 0.7)', 
        fontSize: 11, 
        fontFamily: theme.fonts.bold, 
        letterSpacing: 1,
    },
    catTextSelected: { 
        color: '#0a0a0a',
    },
    
    // Players Card
    playersCard: { 
        padding: 14, 
        borderRadius: 12, 
        marginBottom: 16, 
        borderWidth: 2, 
        borderColor: '#D4A000',
        backgroundColor: 'rgba(212, 160, 0, 0.08)',
    },
    playerCount: { 
        fontSize: 11, 
        color: '#D4A000', 
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
        color: '#FFD54F', 
        fontFamily: theme.fonts.medium, 
        letterSpacing: 1,
    },
    youTag: {
        fontSize: 12,
        color: 'rgba(212, 160, 0, 0.6)',
        fontFamily: theme.fonts.medium,
    },
    
    footer: { 
        gap: 12,
    },
});
