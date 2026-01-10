import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, Alert, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useTheme } from '../utils/ThemeContext';
import Button from '../components/Button';
import KodakButton from '../components/KodakButton';
import { playHaptic } from '../utils/haptics';
import { database } from '../utils/firebase';
import { ref, get, set, push, onDisconnect } from 'firebase/database';
import { CustomAvatar } from '../utils/AvatarGenerator';
import { CustomBuiltAvatar } from '../components/CustomAvatarBuilder';
import VoiceControl from '../components/VoiceControl';
import { useVoiceChat } from '../utils/VoiceChatContext';

export default function JoinScreen({ navigation, route }) {
    const { theme } = useTheme();
    const styles = getStyles(theme);
    const { playerData } = route.params || {};

    const [roomCode, setRoomCode] = useState('');
    const [isScanning, setIsScanning] = useState(false);
    const [permission, requestPermission] = useCameraPermissions();

    const [isJoining, setIsJoining] = useState(false);
    const joinInProgress = React.useRef(false);

    useEffect(() => {
        if (!playerData) {
            Alert.alert("Error", "Missing profile data.", [
                { text: "Go Back", onPress: () => navigation.goBack() }
            ]);
        }
    }, [playerData]);

    const handleJoin = async (targetCode = roomCode) => {
        if (!targetCode || targetCode.length !== 6) {
            Alert.alert('Invalid Code', 'Please enter a 6-digit room code.');
            return;
        }

        if (joinInProgress.current) return;

        try {
            setIsJoining(true);
            joinInProgress.current = true;
            playHaptic('medium');

            const roomRef = ref(database, `rooms/${targetCode}`);
            const snapshot = await get(roomRef);

            if (snapshot.exists()) {
                const roomData = snapshot.val();
                if (roomData.status !== 'lobby') {
                    Alert.alert('Game Started', 'This room is already in a game.');
                    setIsJoining(false);
                    joinInProgress.current = false;
                    return;
                }

                const playersRef = ref(database, `rooms/${targetCode}/players`);
                const playersSnapshot = await get(playersRef);
                let pId = null;
                let existingPlayerRef = null;

                // Check for existing player with same UID
                if (playersSnapshot.exists()) {
                    const playersData = playersSnapshot.val();
                    const existingEntry = Object.entries(playersData).find(
                        ([key, val]) => val.uid === playerData.uid
                    );
                    if (existingEntry) {
                        pId = existingEntry[0];
                        existingPlayerRef = ref(database, `rooms/${targetCode}/players/${pId}`);
                    }
                }

                if (!existingPlayerRef) {
                    existingPlayerRef = push(playersRef);
                    pId = existingPlayerRef.key;
                }

                // Set up auto-cleanup on disconnect
                onDisconnect(existingPlayerRef).remove();

                await set(existingPlayerRef, {
                    name: playerData.name,
                    avatarId: playerData.avatarId,
                    uid: playerData.uid,
                    status: 'waiting',
                    customAvatarConfig: playerData.customAvatarConfig || null // SAVE CONFIG
                });

                // Navigate to lobby
                navigation.navigate('WifiLobby', {
                    roomCode: targetCode,
                    playerId: pId,
                    playerName: playerData.name
                });
            } else {
                Alert.alert('Not Found', 'Room code does not exist.');
            }
        } catch (error) {
            console.error("Join Error:", error);
            Alert.alert('Error', 'Failed to join room. Check your internet connection.');
        } finally {
            setIsJoining(false);
            joinInProgress.current = false;
        }
    };

    const handleBarCodeScanned = ({ data }) => {
        if (data && data.length === 6 && !isNaN(data)) {
            setIsScanning(false);
            setRoomCode(data);
            handleJoin(data);
        }
    };

    const startScanner = async () => {
        if (!permission?.granted) {
            const result = await requestPermission();
            if (!result.granted) {
                Alert.alert('Permission Denied', 'Camera permission is required to scan QR codes.');
                return;
            }
        }
        setIsScanning(true);
    };

    if (isScanning) {
        return (
            <View style={styles.scannerContainer}>
                <CameraView
                    style={StyleSheet.absoluteFillObject}
                    onBarcodeScanned={handleBarCodeScanned}
                    barcodeScannerSettings={{
                        barcodeTypes: ["qr"],
                    }}
                />
                <View style={styles.scannerOverlay}>
                    <Text style={styles.scannerText}>SCAN ROOM QR CODE</Text>
                    <KodakButton
                        title="CANCEL"
                        onPress={() => setIsScanning(false)}
                        variant="secondary"
                        style={styles.cancelScanBtn}
                    />
                </View>
            </View>
        );
    }

    if (!playerData) return null;

    return (
        <LinearGradient
            colors={theme.colors.backgroundGradient || [theme.colors.background, theme.colors.background, theme.colors.background]}
            style={styles.container}
        >
            {/* Kodak Film Header */}
            <View style={styles.filmHeader}>
                <View style={styles.filmStrip}>
                    {[...Array(16)].map((_, i) => (
                        <View key={i} style={styles.filmHole} />
                    ))}
                </View>
            </View>

            <VoiceControl />

            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Text style={styles.title}>JOIN GAME</Text>

                <View style={styles.inputSection}>
                    {/* User Profile Display */}
                    <View style={styles.profileCard}>
                        {playerData.customAvatarConfig ? (
                            <CustomBuiltAvatar config={playerData.customAvatarConfig} size={80} />
                        ) : (
                            <CustomAvatar id={playerData.avatarId} size={80} />
                        )}
                        <Text style={styles.profileName}>{playerData.name.toUpperCase()}</Text>
                        <View style={styles.loggedInBadge}>
                            <Text style={styles.loggedInText}>LOGGED IN</Text>
                        </View>
                    </View>


                    <Text style={styles.label}>ROOM CODE</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="6-Digit Code"
                        placeholderTextColor={theme.colors.textMuted}
                        keyboardType="numeric"
                        value={roomCode}
                        onChangeText={setRoomCode}
                        maxLength={6}
                    />
                </View>

                <View style={styles.buttonRow}>
                    <KodakButton
                        title="JOIN CODE"
                        onPress={() => handleJoin()}
                        variant="primary"
                        style={styles.modeButton}
                    />
                    <KodakButton
                        title="SCAN QR"
                        onPress={startScanner}
                        variant="secondary"
                        style={styles.modeButton}
                    />
                </View>

            </ScrollView>

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
    },

    // Kodak Film Strip Decorations
    filmHeader: {
        width: '100%',
        paddingTop: Platform.OS === 'ios' ? 60 : 40,
    },
    filmFooter: {
        width: '100%',
        paddingBottom: 20,
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

    scrollContent: {
        padding: theme.spacing.xl,
        alignItems: 'center',
        paddingTop: 20,
    },
    title: {
        fontSize: 44,
        fontFamily: theme.fonts.header,
        color: theme.colors.text,
        letterSpacing: 6,
        marginBottom: 30,
        ...theme.textShadows.depth,
    },

    inputSection: {
        width: '100%',
        marginBottom: 30,
    },
    label: {
        color: theme.colors.tertiary,
        fontFamily: theme.fonts.bold,
        fontSize: 14,
        letterSpacing: 4,
        marginBottom: 10,
        marginLeft: 4,
    },
    input: {
        backgroundColor: theme.colors.surface,
        height: 65,
        borderRadius: 16,
        paddingHorizontal: 24,
        fontSize: 28,
        fontFamily: theme.fonts.header,
        borderWidth: 2,
        borderColor: theme.colors.primary,
        color: theme.colors.text,
        marginBottom: 20,
        letterSpacing: 8,
        textAlign: 'center',
    },

    buttonRow: {
        flexDirection: 'row',
        width: '100%',
        gap: 15,
        marginBottom: 30,
    },
    modeButton: {
        flex: 1,
    },

    scannerContainer: {
        flex: 1,
        backgroundColor: 'black',
    },
    scannerOverlay: {
        flex: 1,
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 40,
        backgroundColor: 'rgba(0,0,0,0.6)',
    },
    scannerText: {
        color: theme.colors.text,
        fontSize: 24,
        fontFamily: theme.fonts.header,
        letterSpacing: 4,
        marginTop: 100,
        ...theme.textShadows.depth,
    },

    profileCard: {
        alignItems: 'center',
        marginBottom: 30,
        backgroundColor: theme.colors.surface,
        padding: 25,
        borderRadius: 20,
        borderWidth: 2,
        borderColor: theme.colors.primary,
    },
    profileName: {
        color: theme.colors.text,
        fontSize: 24,
        fontFamily: theme.fonts.bold,
        marginTop: 12,
        marginBottom: 8,
        letterSpacing: 2,
        ...theme.textShadows.softDepth,
    },
    loggedInBadge: {
        backgroundColor: theme.colors.primary,
        paddingHorizontal: 14,
        paddingVertical: 5,
        borderRadius: 10,
    },
    loggedInText: {
        color: theme.colors.secondary,
        fontSize: 11,
        fontFamily: theme.fonts.bold,
        letterSpacing: 3,
    },
    cancelScanBtn: {
        width: '100%',
        marginBottom: 40,
    }
});
