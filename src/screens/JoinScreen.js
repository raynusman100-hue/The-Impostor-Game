import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, Alert, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useTheme } from '../utils/ThemeContext';
import Button from '../components/Button';
import { playHaptic } from '../utils/haptics';
import { database } from '../utils/firebase';
import { ref, get, set, push, onDisconnect } from 'firebase/database';
import { CustomAvatar } from '../utils/AvatarGenerator';

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
                    <Button
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
            colors={theme.colors.backgroundGradient}
            style={styles.container}
        >
            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Text style={styles.title}>JOIN GAME</Text>

                <View style={styles.inputSection}>
                    {/* User Profile Display */}
                    <View style={styles.profileCard}>
                        <CustomAvatar id={playerData.avatarId} size={80} />
                        <Text style={styles.profileName}>{playerData.name.toUpperCase()}</Text>
                        <Text style={styles.label}>LOGGED IN</Text>
                    </View>


                    <Text style={styles.label}>ROOM CODE</Text>
                    <TextInput
                        style={[styles.input, { color: theme.colors.text, borderColor: theme.colors.primary }]}
                        placeholder="6-Digit Code"
                        placeholderTextColor={theme.colors.textMuted}
                        keyboardType="numeric"
                        value={roomCode}
                        onChangeText={setRoomCode}
                        maxLength={6}
                    />
                </View>

                <View style={styles.buttonRow}>
                    <Button
                        title="JOIN CODE"
                        onPress={() => handleJoin()}
                        style={styles.modeButton}
                    />
                    <Button
                        title="SCAN QR"
                        onPress={startScanner}
                        style={styles.modeButton}
                    />
                </View>

            </ScrollView>
        </LinearGradient>
    );
}

const getStyles = (theme) => StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        padding: theme.spacing.xl,
        alignItems: 'center',
        paddingTop: Platform.OS === 'ios' ? 100 : 60,
    },
    title: {
        fontSize: 48,
        fontFamily: theme.fonts.header,
        color: theme.colors.tertiary, // Silver
        letterSpacing: 4,
        marginBottom: 40,
        ...theme.textShadows.depth,
    },
    inputSection: {
        width: '100%',
        marginBottom: 40,
    },
    label: {
        color: theme.colors.textSecondary,
        fontFamily: theme.fonts.medium,
        fontSize: 16,
        letterSpacing: 2,
        marginBottom: 8,
        marginLeft: 4,
    },
    input: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        height: 60,
        borderRadius: 12,
        paddingHorizontal: 20,
        fontSize: 24,
        fontFamily: theme.fonts.medium,
        borderWidth: 1,
        marginBottom: 20,
    },
    buttonRow: {
        flexDirection: 'row',
        width: '100%',
        gap: 12,
        marginBottom: 30,
    },
    modeButton: {
        flex: 1,
    },
    joinBtn: {
        width: '100%',
    },
    orText: {
        color: theme.colors.textMuted,
        fontFamily: theme.fonts.medium,
        fontSize: 18,
        textAlign: 'center',
        letterSpacing: 4,
    },
    scanBtn: {
        width: '100%',
        borderColor: theme.colors.primary,
        backgroundColor: 'transparent',
        borderWidth: 1,
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
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    scannerText: {
        color: 'white',
        fontSize: 24,
        fontFamily: theme.fonts.header,
        letterSpacing: 2,
        marginTop: 100,
    },
    profileCard: {
        alignItems: 'center',
        marginBottom: 30,
        backgroundColor: 'rgba(255,255,255,0.05)',
        padding: 20,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: theme.colors.primary
    },
    profileName: {
        color: theme.colors.text,
        fontSize: 24,
        fontFamily: theme.fonts.bold,
        marginTop: 10,
        marginBottom: 5,
        letterSpacing: 1
    },
    cancelScanBtn: {
        width: '100%',
        marginBottom: 40,
    }
});
