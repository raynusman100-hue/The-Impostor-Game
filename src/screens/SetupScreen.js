import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, Alert, KeyboardAvoidingView, Platform, LayoutAnimation, TouchableOpacity, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../utils/ThemeContext';
import { getRandomWord, CATEGORY_LABELS } from '../utils/words';
import { translateText, SUPPORTED_LANGUAGES } from '../utils/translationService';
import LanguageSelectorModal from '../components/LanguageSelectorModal';
import { playHaptic } from '../utils/haptics';
import { checkPremiumStatus, addPremiumListener } from '../utils/PremiumManager';
import { auth } from '../utils/firebase';
import CategorySelectionModal from '../components/CategorySelectionModal';

// Enable LayoutAnimation for Android
// LayoutAnimation experimental enable removed for New Architecture compatibility



// Film perforation component for Kodak aesthetic
const FilmPerforations = ({ side, theme }) => {
    // Use primary color with opacity for visibility on both light/dark themes
    const perforationColor = theme.colors.primary + '40'; // 40 = 25% opacity

    return (
        <View style={[filmStyles.perforationStrip, side === 'left' ? filmStyles.leftStrip : filmStyles.rightStrip]}>
            {[...Array(12)].map((_, i) => (
                <View key={i} style={[filmStyles.perforation, { backgroundColor: perforationColor }]} />
            ))}
        </View>
    );
};

const filmStyles = StyleSheet.create({
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

// Compact player input row with Kodak styling
const PlayerRow = React.memo(({ name, index, onChange, onRemove, showRemove, theme, styles }) => (
    <View style={styles.playerRow}>
        <View style={styles.playerNumber}>
            <Text style={styles.playerNumberText}>{String(index + 1).padStart(2, '0')}</Text>
        </View>
        <View style={styles.inputContainer}>
            <TextInput
                style={styles.input}
                placeholder={`PLAYER ${index + 1}`}
                placeholderTextColor={theme.colors.textMuted}
                value={name}
                onChangeText={(text) => onChange(text, index)}
                autoCorrect={false}
                importantForAutofill="no"
                keyboardType="visible-password"
                autoCapitalize="words"
                maxLength={15}
            />
        </View>
        {showRemove && (
            <TouchableOpacity onPress={() => onRemove(index)} style={styles.removeBtn}>
                <Text style={styles.removeBtnText}>×</Text>
            </TouchableOpacity>
        )}
    </View>
));

export default function SetupScreen({ navigation, route }) {
    const { theme } = useTheme();
    const styles = getStyles(theme);
    const [players, setPlayers] = useState(['', '', '']); // Start with 3 inputs
    const [impostorCount, setImpostorCount] = useState(1);
    const [selectedCategories, setSelectedCategories] = useState(['all']);
    const [isCategoriesOpen, setIsCategoriesOpen] = useState(false);
    const [hintsEnabled, setHintsEnabled] = useState(true);
    const [language, setLanguage] = useState('en'); // Language code
    const [isLanguageModalVisible, setIsLanguageModalVisible] = useState(false);
    const [isStarting, setIsStarting] = useState(false);
    const [showOfflineWarning, setShowOfflineWarning] = useState(false);
    const [settingsLoaded, setSettingsLoaded] = useState(false); // Flag to prevent save before load
    const [isPremium, setIsPremium] = useState(false);

    // Check Premium Status on Mount & Listen for Changes
    useEffect(() => {
        const updatePremium = async () => {
            if (auth.currentUser) {
                const premium = await checkPremiumStatus(auth.currentUser.email, auth.currentUser.uid);
                setIsPremium(premium);
            }
        };

        // Initial check
        updatePremium();

        // Subscribe to real-time updates (e.g. immediately after purchase)
        const unsubscribe = addPremiumListener((status) => {
            console.log('SetupScreen: Premium status updated to:', status);
            setIsPremium(status);
        });

        // Re-check on focus (e.g. returning from PremiumScreen)
        const focusUnsubscribe = navigation.addListener('focus', updatePremium);

        return () => {
            unsubscribe();
            focusUnsubscribe();
        };
    }, [navigation]);

    // Load saved players on mount
    useEffect(() => {
        const loadPlayers = async () => {
            // If players are passed via params (e.g. Play Again), don't overwrite with saved data
            if (route.params?.players) return;

            try {
                const savedPlayers = await AsyncStorage.getItem('recentPlayers');
                if (savedPlayers) {
                    const parsed = JSON.parse(savedPlayers);
                    if (Array.isArray(parsed) && parsed.length > 0) {
                        setPlayers(parsed);
                    }
                }
            } catch (e) {
                console.log('Failed to load players');
            }
        };
        loadPlayers();
    }, []);

    // Save players whenever they change
    useEffect(() => {
        const savePlayers = async () => {
            try {
                await AsyncStorage.setItem('recentPlayers', JSON.stringify(players));
            } catch (e) {
                console.log('Failed to save players');
            }
        };
        const timeoutId = setTimeout(savePlayers, 500); // Debounce
        return () => clearTimeout(timeoutId);
    }, [players]);

    // Save Categories (only after settings are loaded to prevent overwriting)
    useEffect(() => {
        if (!settingsLoaded) return; // Don't save until initial load is complete

        const saveCategories = async () => {
            try {
                console.log('Saving categories:', selectedCategories);
                await AsyncStorage.setItem('player_categories', JSON.stringify(selectedCategories));
            } catch (e) {
                console.log('Failed to save categories');
            }
        };
        saveCategories();
    }, [selectedCategories, settingsLoaded]);

    // Save Hints (only after settings are loaded)
    useEffect(() => {
        if (!settingsLoaded) return;

        const saveHints = async () => {
            try {
                await AsyncStorage.setItem('player_hints', String(hintsEnabled));
            } catch (e) {
                console.log('Failed to save hints');
            }
        };
        saveHints();
    }, [hintsEnabled, settingsLoaded]);


    // Load saved settings
    useEffect(() => {
        const loadSettings = async () => {
            try {
                const [savedLanguage, savedCategories, savedHints] = await Promise.all([
                    AsyncStorage.getItem('player_language_pref'),
                    AsyncStorage.getItem('player_categories'),
                    AsyncStorage.getItem('player_hints')
                ]);

                console.log('Loading settings - categories:', savedCategories);

                if (savedLanguage && SUPPORTED_LANGUAGES.some(l => l.code === savedLanguage)) {
                    setLanguage(savedLanguage);
                }

                if (savedCategories) {
                    const parsedCats = JSON.parse(savedCategories);
                    if (Array.isArray(parsedCats) && parsedCats.length > 0) {
                        setSelectedCategories(parsedCats);
                    }
                }

                if (savedHints !== null) {
                    setHintsEnabled(savedHints === 'true');
                }
            } catch (e) {
                console.error('Failed to load settings', e);
            } finally {
                // Mark settings as loaded so save effects can run
                setSettingsLoaded(true);
            }
        };
        loadSettings();
    }, []);

    useEffect(() => {
        if (route.params?.players) {
            const playerNames = route.params.players.map(p => p.name || p);
            setPlayers(playerNames);
        }
        if (route.params?.impostorCount) {
            setImpostorCount(route.params.impostorCount);
        }
        // Fix persistence: Check if language was passed back
        if (route.params?.language) {
            setLanguage(route.params.language);
            // Also save it if passed back
            AsyncStorage.setItem('player_language_pref', route.params.language);
        }
    }, [route.params]);

    const handleLanguageChange = async (lang) => {
        setLanguage(lang);
        setIsLanguageModalVisible(false);
        try {
            await AsyncStorage.setItem('player_language_pref', lang);
        } catch (error) {
            console.log('Failed to save language', error);
        }
    };

    const toggleCategoriesOpen = () => {
        playHaptic('light');
        setIsCategoriesOpen(true);
    };

    const getAvailableCategoriesList = () => {
        const availableCategories = CATEGORY_LABELS
            .filter(c => {
                // Filter out 'all' itself
                if (c.key === 'all') return false;

                // If premium, include everything. If not, include only free.
                if (isPremium) return true;
                return c.free === true || (!c.premium && !c.free);
            })
            .flatMap(c => {
                // If category has subcategories, include them instead of parent
                if (c.subcategories) {
                    return c.subcategories.map(sub => sub.key);
                }
                return [c.key];
            });

        return ['all', ...availableCategories];
    };

    const toggleCategory = (key) => {
        playHaptic('light');
        setSelectedCategories(prev => {
            // If tapping 'Random (All)'
            if (key === 'all') {
                // User Request: Clicking 'all' again results in 'dailyLife' only
                if (prev.includes('all')) {
                    return ['dailyLife'];
                }
                // Otherwise select everything
                return getAvailableCategoriesList();
            }

            let newCategories = [...prev];

            // If 'all' was previously selected, remove it since we are selecting specific
            if (newCategories.includes('all')) {
                newCategories = newCategories.filter(c => c !== 'all');
            }

            // Toggle the clicked category
            if (newCategories.includes(key)) {
                newCategories = newCategories.filter(c => c !== key);
            } else {
                newCategories.push(key);
            }

            // Fallback: If nothing selected, default to 'all' (Random) AND expand it
            return newCategories.length ? newCategories : getAvailableCategoriesList();
        });
    };

    const updatePlayerName = (text, index) => {
        const newPlayers = [...players];
        newPlayers[index] = text;
        setPlayers(newPlayers);
    };

    const addPlayer = () => {
        if (players.length < 20) {
            setPlayers([...players, '']);
        } else {
            Alert.alert('Max Limit', 'Maximum 20 players allowed.');
        }
    };

    const removePlayer = (index) => {
        if (players.length > 3) {
            const newPlayers = players.filter((_, i) => i !== index);
            setPlayers(newPlayers);
            // Re-adjust impostor count if needed
            const maxImpostors = Math.floor((newPlayers.length - 1) / 2) || 1;
            if (impostorCount > maxImpostors) {
                setImpostorCount(maxImpostors);
            }
        }
    };

    const getMaxImpostors = (totalPlayers) => {
        return Math.max(1, Math.floor((totalPlayers - 1) / 2));
    };

    const incrementImpostors = () => {
        const max = getMaxImpostors(players.length);
        if (impostorCount < max) {
            playHaptic('light');
            setImpostorCount(impostorCount + 1);
        } else {
            playHaptic('warning');
            Alert.alert("Limit Reached", "Impostors must be the minority.");
        }
    };

    const decrementImpostors = () => {
        if (impostorCount > 1) {
            playHaptic('light');
            setImpostorCount(impostorCount - 1);
        }
    };

    const startGame = async () => {
        if (isStarting) return;

        // Auto-assign names to empty slots
        const finalPlayers = players.map((p, i) => {
            const name = p.trim();
            return name.length > 0 ? name : `PLAYER ${i + 1}`;
        });

        if (finalPlayers.length < 3) {
            Alert.alert('Not Enough Players', 'You need at least 3 players to start.');
            return;
        }

        const maxImpostors = getMaxImpostors(finalPlayers.length);
        if (impostorCount > maxImpostors) {
            Alert.alert('Invalid Config', `Max ${maxImpostors} impostors for ${finalPlayers.length} players.`);
            return;
        }

        // Check internet connection if non-English language is selected
        if (language !== 'en') {
            const netState = await NetInfo.fetch();
            if (!netState.isConnected) {
                playHaptic('warning');
                setShowOfflineWarning(true);
                return;
            }
        }

        setIsStarting(true);
        try {
            const wordData = getRandomWord(selectedCategories);
            let finalWord = wordData.word;
            let finalHint = wordData.hint;
            let finalImpostorHint = wordData.impostorHint;

            // Live Translation if not English
            if (language !== 'en') {
                try {
                    const [translatedWord, translatedHint, translatedImpostorHint] = await Promise.all([
                        translateText(finalWord, language),
                        translateText(finalHint, language),
                        translateText(finalImpostorHint, language)
                    ]);
                    finalWord = translatedWord;
                    finalHint = translatedHint;
                    finalImpostorHint = translatedImpostorHint;
                } catch (translationError) {
                    // Translation failed (timeout or network error)
                    console.error('Translation error:', translationError);
                    playHaptic('error');
                    setIsStarting(false);

                    Alert.alert(
                        'Translation Failed',
                        'Unable to translate the game content. Please check your internet connection and try again, or switch to English.',
                        [
                            {
                                text: 'Try Again',
                                onPress: () => startGame(),
                                style: 'default'
                            },
                            {
                                text: 'Switch to English',
                                onPress: () => {
                                    setLanguage('en');
                                    playHaptic('light');
                                },
                                style: 'cancel'
                            }
                        ]
                    );
                    return;
                }
            }

            const playerObjects = finalPlayers.map(name => ({ name }));

            navigation.navigate('RoleReveal', {
                players: playerObjects,
                impostorCount,
                crewWord: finalWord,
                crewHint: finalHint,
                originalWord: wordData.word, // Pass original word
                originalHint: wordData.hint, // Pass original hint
                impostorHint: finalImpostorHint, // Pass translated (or default) impostor hint
                originalImpostorHint: wordData.impostorHint, // Pass original impostor hint
                crewCategory: wordData.category,
                hintsEnabled,
                language
            });
        } catch (error) {
            console.error('Start game error:', error);
            playHaptic('error');
            Alert.alert('Error', 'Failed to start game. Please try again.');
        } finally {
            setIsStarting(false);
        }
    };



    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <LinearGradient
                colors={theme.colors.backgroundGradient}
                style={StyleSheet.absoluteFillObject}
            />

            {/* Film grain overlay */}
            <View style={styles.filmGrainOverlay} pointerEvents="none" />

            {/* Film perforations */}
            <FilmPerforations side="left" theme={theme} />
            <FilmPerforations side="right" theme={theme} />

            <ScrollView
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Kodak-style header */}
                <View style={styles.headerFrame}>
                    <View style={styles.kodakBadge}>
                        <Text style={styles.kodakText}>PASS & PLAY</Text>
                    </View>
                    <Text style={styles.title}>SETUP</Text>
                    <View style={styles.frameNumber}>
                        <Text style={styles.frameNumberText}>{players.length} PLAYERS</Text>
                    </View>
                </View>

                {/* Compact settings row */}
                <View style={styles.settingsRow}>
                    {/* Impostor Counter */}
                    <View style={styles.compactSection}>
                        <Text style={styles.compactLabel}>IMPOSTORS</Text>
                        <View style={styles.miniCounterRow}>
                            <TouchableOpacity style={styles.miniCounterBtn} onPress={decrementImpostors}>
                                <Text style={styles.miniCounterBtnText}>−</Text>
                            </TouchableOpacity>
                            <Text style={styles.miniCounterValue}>{impostorCount}</Text>
                            <TouchableOpacity style={styles.miniCounterBtn} onPress={incrementImpostors}>
                                <Text style={styles.miniCounterBtnText}>+</Text>
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Hints Toggle */}
                    <View style={styles.compactSection}>
                        <Text style={styles.compactLabel}>HINTS</Text>
                        <TouchableOpacity
                            style={[styles.toggleBtn, hintsEnabled && styles.toggleBtnActive]}
                            onPress={() => { playHaptic('light'); setHintsEnabled(!hintsEnabled); }}
                        >
                            <Text style={[styles.toggleBtnText, hintsEnabled && styles.toggleBtnTextActive]}>
                                {hintsEnabled ? 'ON' : 'OFF'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Language & Categories - Compact buttons */}
                <View style={styles.optionsRow}>
                    <TouchableOpacity
                        style={styles.optionBtn}
                        onPress={() => setIsLanguageModalVisible(true)}
                    >
                        <Text style={styles.optionBtnLabel}>LANG</Text>
                        <Text style={styles.optionBtnValue}>
                            {SUPPORTED_LANGUAGES.find(l => l.code === language)?.code.toUpperCase() || 'EN'}
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.optionBtn}
                        onPress={toggleCategoriesOpen}
                    >
                        <Text style={styles.optionBtnLabel}>CATEGORY</Text>
                        <Text style={styles.optionBtnValue}>
                            {selectedCategories.includes('all') ? 'ALL' : selectedCategories.length}
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Category Selection Modal */}
                <CategorySelectionModal
                    visible={isCategoriesOpen}
                    onClose={() => setIsCategoriesOpen(false)}
                    selectedCategories={selectedCategories}
                    onSelectCategory={toggleCategory}
                    navigation={navigation}
                />

                {/* Players Section - Film frame style */}
                <View style={styles.playersFrame}>
                    <View style={styles.frameHeader}>
                        <Text style={styles.frameHeaderText}>CAST</Text>
                        <TouchableOpacity style={styles.addPlayerBtn} onPress={addPlayer}>
                            <Text style={styles.addPlayerBtnText}>+ ADD</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.playersList}>
                        {players.map((p, i) => (
                            <PlayerRow
                                key={i}
                                name={p}
                                index={i}
                                onChange={updatePlayerName}
                                onRemove={removePlayer}
                                showRemove={players.length > 3}
                                theme={theme}
                                styles={styles}
                            />
                        ))}
                    </View>
                </View>

                {/* Start Button - Kodak style */}
                <TouchableOpacity
                    style={[styles.startButton, isStarting && styles.startButtonDisabled]}
                    onPress={startGame}
                    disabled={isStarting}
                    activeOpacity={0.8}
                >
                    <View style={styles.startButtonInner}>
                        <Text style={styles.startButtonText}>
                            {isStarting ? 'LOADING...' : 'ACTION!'}
                        </Text>
                    </View>
                </TouchableOpacity>

                <View style={styles.bottomSpacer} />
            </ScrollView>

            <LanguageSelectorModal
                visible={isLanguageModalVisible}
                onClose={() => setIsLanguageModalVisible(false)}
                onSelect={handleLanguageChange}
                currentLanguage={language}
            />

            {/* Offline Warning Modal */}
            <Modal
                visible={showOfflineWarning}
                animationType="fade"
                transparent={true}
                onRequestClose={() => setShowOfflineWarning(false)}
            >
                <View style={styles.warningOverlay}>
                    <View style={styles.warningContent}>
                        <Text style={styles.warningIcon}>📡</Text>
                        <Text style={styles.warningTitle}>NO CONNECTION</Text>
                        <Text style={styles.warningMessage}>
                            Internet required for {SUPPORTED_LANGUAGES.find(l => l.code === language)?.nativeLabel || 'this language'}.
                        </Text>
                        <TouchableOpacity
                            style={styles.warningButton}
                            onPress={() => { playHaptic('light'); setShowOfflineWarning(false); }}
                        >
                            <Text style={styles.warningButtonText}>GOT IT</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </KeyboardAvoidingView>
    );
}

function getStyles(theme) {
    return StyleSheet.create({
        container: {
            flex: 1,
        },
        filmGrainOverlay: {
            ...StyleSheet.absoluteFillObject,
            backgroundColor: 'transparent',
            opacity: 0.03,
        },
        scrollContent: {
            paddingTop: Platform.OS === 'ios' ? 50 : 30,
            paddingBottom: 30,
            paddingHorizontal: 24,
        },
        // Kodak Header
        headerFrame: {
            alignItems: 'center',
            marginBottom: 16,
            paddingVertical: 12,
            borderTopWidth: 2,
            borderBottomWidth: 2,
            borderColor: theme.colors.primary,
        },
        kodakBadge: {
            backgroundColor: theme.colors.primary,
            paddingHorizontal: 16,
            paddingVertical: 4,
            borderRadius: 4,
            marginBottom: 4,
        },
        kodakText: {
            color: theme.colors.secondary,
            fontSize: 10,
            fontFamily: theme.fonts.bold,
            letterSpacing: 3,
        },
        title: {
            fontSize: 48,
            color: theme.colors.text,
            fontFamily: theme.fonts.header,
            letterSpacing: 8,
            ...theme.textShadows.depth,
        },
        frameNumber: {
            marginTop: 4,
        },
        frameNumberText: {
            color: theme.colors.primary,
            fontSize: 11,
            fontFamily: theme.fonts.medium,
            letterSpacing: 2,
        },
        // Compact Settings Row
        settingsRow: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: 12,
            gap: 12,
        },
        compactSection: {
            flex: 1,
            backgroundColor: theme.colors.surface,
            borderRadius: 12,
            padding: 12,
            borderWidth: 1,
            borderColor: theme.colors.primary + '50',
        },
        compactLabel: {
            color: theme.colors.primary,
            fontSize: 10,
            fontFamily: theme.fonts.bold,
            letterSpacing: 2,
            marginBottom: 8,
            textAlign: 'center',
        },
        miniCounterRow: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12,
        },
        miniCounterBtn: {
            width: 36,
            height: 36,
            borderRadius: 18,
            backgroundColor: theme.colors.primary + '30',
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 1,
            borderColor: theme.colors.primary,
        },
        miniCounterBtnText: {
            color: theme.colors.primary,
            fontSize: 20,
            fontFamily: theme.fonts.bold,
            lineHeight: 22,
        },
        miniCounterValue: {
            color: theme.colors.text,
            fontSize: 28,
            fontFamily: theme.fonts.header,
            minWidth: 30,
            textAlign: 'center',
        },
        toggleBtn: {
            backgroundColor: theme.colors.surface,
            borderRadius: 20,
            paddingVertical: 10,
            alignItems: 'center',
            borderWidth: 1,
            borderColor: theme.colors.textMuted,
        },
        toggleBtnActive: {
            backgroundColor: theme.colors.primary,
            borderColor: theme.colors.primary,
        },
        toggleBtnText: {
            color: theme.colors.textSecondary,
            fontSize: 14,
            fontFamily: theme.fonts.bold,
            letterSpacing: 2,
        },
        toggleBtnTextActive: {
            color: theme.colors.secondary,
        },
        // Options Row
        optionsRow: {
            flexDirection: 'row',
            gap: 12,
            marginBottom: 12,
        },
        optionBtn: {
            flex: 1,
            backgroundColor: theme.colors.surface,
            borderRadius: 12,
            padding: 12,
            alignItems: 'center',
            borderWidth: 1,
            borderColor: theme.colors.textMuted + '40',
        },
        optionBtnLabel: {
            color: theme.colors.textMuted,
            fontSize: 9,
            fontFamily: theme.fonts.medium,
            letterSpacing: 2,
            marginBottom: 4,
        },
        optionBtnValue: {
            color: theme.colors.text,
            fontSize: 18,
            fontFamily: theme.fonts.bold,
            letterSpacing: 1,
        },
        // Category Dropdown
        categoryDropdown: {
            backgroundColor: theme.colors.surface,
            borderRadius: 12,
            padding: 12,
            marginBottom: 12,
            borderWidth: 1,
            borderColor: theme.colors.primary + '40',
        },
        categoryGrid: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            gap: 8,
        },
        categoryChip: {
            paddingHorizontal: 14,
            paddingVertical: 8,
            borderRadius: 16,
            backgroundColor: theme.colors.background,
            borderWidth: 1,
            borderColor: theme.colors.textMuted + '50',
        },
        categoryChipSelected: {
            backgroundColor: theme.colors.primary,
            borderColor: theme.colors.primary,
        },
        categoryChipText: {
            color: theme.colors.textSecondary,
            fontSize: 11,
            fontFamily: theme.fonts.medium,
            letterSpacing: 1,
        },
        categoryChipTextSelected: {
            color: theme.colors.secondary,
        },
        // Players Frame
        playersFrame: {
            backgroundColor: theme.colors.surface,
            borderRadius: 16,
            padding: 16,
            marginBottom: 20,
            borderWidth: 2,
            borderColor: theme.colors.primary + '50',
        },
        frameHeader: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 12,
            paddingBottom: 10,
            borderBottomWidth: 1,
            borderBottomColor: theme.colors.primary + '30',
        },
        frameHeaderText: {
            color: theme.colors.primary,
            fontSize: 14,
            fontFamily: theme.fonts.bold,
            letterSpacing: 4,
        },
        addPlayerBtn: {
            backgroundColor: theme.colors.primary + '30',
            paddingHorizontal: 14,
            paddingVertical: 6,
            borderRadius: 12,
            borderWidth: 1,
            borderColor: theme.colors.primary,
        },
        addPlayerBtnText: {
            color: theme.colors.primary,
            fontSize: 12,
            fontFamily: theme.fonts.bold,
            letterSpacing: 1,
        },
        playersList: {
            gap: 8,
        },
        playerRow: {
            flexDirection: 'row',
            alignItems: 'center',
            gap: 10,
        },
        playerNumber: {
            width: 28,
            height: 28,
            borderRadius: 6,
            backgroundColor: theme.colors.primary + '25',
            alignItems: 'center',
            justifyContent: 'center',
        },
        playerNumberText: {
            color: theme.colors.primary,
            fontSize: 11,
            fontFamily: theme.fonts.bold,
        },
        inputContainer: {
            flex: 1,
            height: 44,
            borderRadius: 10,
            backgroundColor: theme.colors.background,
            borderWidth: 1,
            borderColor: theme.colors.textMuted + '40',
            justifyContent: 'center',
        },
        input: {
            color: theme.colors.text,
            paddingHorizontal: 14,
            fontSize: 15,
            fontFamily: theme.fonts.medium,
            letterSpacing: 1,
        },
        removeBtn: {
            width: 32,
            height: 32,
            borderRadius: 16,
            backgroundColor: theme.colors.error + '30',
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 1,
            borderColor: theme.colors.error + '80',
        },
        removeBtnText: {
            color: theme.colors.error,
            fontSize: 20,
            fontFamily: theme.fonts.bold,
            lineHeight: 22,
        },
        // Start Button - Kodak style (simple, no shadow)
        startButton: {
            backgroundColor: theme.colors.primary,
            borderRadius: 30,
            overflow: 'hidden',
        },
        startButtonDisabled: {
            opacity: 0.6,
        },
        startButtonInner: {
            paddingVertical: 18,
            alignItems: 'center',
        },
        startButtonText: {
            color: theme.colors.secondary,
            fontSize: 28,
            fontFamily: theme.fonts.header,
            letterSpacing: 6,
        },
        bottomSpacer: {
            height: 20,
        },
        // Warning Modal
        warningOverlay: {
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.9)',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 24,
        },
        warningContent: {
            backgroundColor: theme.colors.surface,
            borderRadius: 20,
            padding: 24,
            width: '100%',
            maxWidth: 320,
            alignItems: 'center',
            borderWidth: 2,
            borderColor: theme.colors.primary,
        },
        warningIcon: {
            fontSize: 48,
            marginBottom: 12,
        },
        warningTitle: {
            fontSize: 18,
            color: theme.colors.primary,
            fontFamily: theme.fonts.bold,
            letterSpacing: 2,
            marginBottom: 12,
            textAlign: 'center',
        },
        warningMessage: {
            fontSize: 14,
            color: theme.colors.textSecondary,
            fontFamily: theme.fonts.medium,
            textAlign: 'center',
            marginBottom: 20,
            lineHeight: 20,
        },
        warningButton: {
            backgroundColor: theme.colors.primary,
            paddingVertical: 12,
            paddingHorizontal: 32,
            borderRadius: 20,
        },
        warningButtonText: {
            color: theme.colors.secondary,
            fontSize: 14,
            fontFamily: theme.fonts.bold,
            letterSpacing: 2,
        },
    });
}
