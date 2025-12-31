import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, Alert, KeyboardAvoidingView, Platform, LayoutAnimation, UIManager, TouchableOpacity, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../utils/ThemeContext';
import Button from '../components/Button';
import FullWidthButton from '../components/FullWidthButton';
import { getRandomWord, CATEGORY_LABELS } from '../utils/words';
import { translateText, SUPPORTED_LANGUAGES } from '../utils/translationService';
import LanguageSelectorModal from '../components/LanguageSelectorModal';
import { playHaptic } from '../utils/haptics';

// Enable LayoutAnimation for Android
// LayoutAnimation experimental enable removed for New Architecture compatibility



// Memoized input row to prevent text glitching on Android
const PlayerRow = React.memo(({ name, index, onChange, onRemove, showRemove, theme, styles }) => (
    <View style={styles.playerRow}>
        <View style={styles.inputContainer}>
            <TextInput
                style={styles.input}
                placeholder={`PLAYER ${index + 1}`}
                placeholderTextColor={theme.colors.textSecondary}
                value={name}
                onChangeText={(text) => onChange(text, index)}
                autoCorrect={false}
                importantForAutofill="no"
                keyboardType="visible-password" // Disables predictive text on Android (fixes Samsung bug)
                autoCapitalize="words"
                maxLength={20}
            />
        </View>
        {showRemove && (
            <Button
                title="×"
                variant="error"
                onPress={() => onRemove(index)}
                style={styles.removeBtn}
                textStyle={{ fontSize: 24, lineHeight: 28 }}
            />
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


    // Load saved settings
    useEffect(() => {
        const loadSettings = async () => {
            try {
                const savedLanguage = await AsyncStorage.getItem('player_language_pref');
                console.log('Attempting to load language. Found:', savedLanguage);

                if (savedLanguage && SUPPORTED_LANGUAGES.some(l => l.code === savedLanguage)) {
                    console.log('Validation passed. Setting language to:', savedLanguage);
                    setLanguage(savedLanguage);
                } else {
                    console.log('No valid saved language found, keeping default (en).');
                }
            } catch (e) {
                console.error('Failed to load settings', e);
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
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setIsCategoriesOpen(!isCategoriesOpen);
    };

    const toggleCategory = (key) => {
        playHaptic('light');
        setSelectedCategories(prev => {
            // If tapping 'Random (All)', reset to just ['all']
            if (key === 'all') {
                return ['all'];
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

            // Fallback: If nothing selected, default to 'all' (Random)
            return newCategories.length ? newCategories : ['all'];
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

            // Live Translation if not English
            if (language !== 'en') {
                try {
                    const [translatedWord, translatedHint] = await Promise.all([
                        translateText(finalWord, language),
                        translateText(finalHint, language)
                    ]);
                    finalWord = translatedWord;
                    finalHint = translatedHint;
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


            <ScrollView contentContainerStyle={styles.scrollContent}>
                <Text style={styles.title}>SETUP GAME</Text>

                {/* Categories Section */}
                <View style={styles.section}>
                    <FullWidthButton
                        title={`CATEGORIES ${isCategoriesOpen ? '(-)' : '(+)'}`}
                        onPress={toggleCategoriesOpen}
                        variant="secondary"
                    />

                    {isCategoriesOpen && (
                        <View style={styles.categoryDropdownContainer}>
                            <View style={styles.categoryGrid}>
                                {CATEGORY_LABELS.map((cat) => {
                                    const isSelected = selectedCategories.includes(cat.key);
                                    return (
                                        <View key={cat.key} style={styles.gridItemWrapper}>
                                            <TouchableOpacity
                                                style={[
                                                    styles.categoryBtn,
                                                    isSelected && styles.categoryBtnSelected
                                                ]}
                                                onPress={() => toggleCategory(cat.key)}
                                            >
                                                <Text style={[
                                                    styles.categoryText,
                                                    isSelected && { color: theme.colors.secondary } // White text when selected
                                                ]}>
                                                    {cat.label.toUpperCase()}
                                                </Text>
                                            </TouchableOpacity>
                                        </View>
                                    );
                                })}
                            </View>
                        </View>
                    )}
                </View>

                {/* Impostor Count Section */}
                <View style={styles.section}>
                    <Text style={styles.label}>IMPOSTORS</Text>
                    <View style={styles.counterRow}>
                        <TouchableOpacity
                            style={styles.counterBtn}
                            onPress={decrementImpostors}
                        >
                            <Text style={styles.counterBtnText}>-</Text>
                        </TouchableOpacity>

                        <View style={styles.counterDisplay}>
                            <Text style={styles.counterValue}>{impostorCount}</Text>
                        </View>

                        <TouchableOpacity
                            style={styles.counterBtn}
                            onPress={incrementImpostors}
                        >
                            <Text style={styles.counterBtnText}>+</Text>
                        </TouchableOpacity>
                    </View>
                </View>
                {/* ... (lines 202-246 skipped for brevity, keeping context if needed in replace logic, but here I target specific blocks) */}
                {/* Actually, I need to be careful with the replace range. I'll split this if needed. Let's do the Category fix first. */
                /* Wait, I should do the player map key fix. */}

                {/* Hints Toggle */}
                <View style={styles.section}>
                    <FullWidthButton
                        title={`HINTS: ${hintsEnabled ? 'ON' : 'OFF'}`}
                        onPress={() => setHintsEnabled(!hintsEnabled)}
                        variant="secondary"
                    />
                </View>

                {/* Language Selector */}
                <View style={styles.section}>
                    <FullWidthButton
                        title={`LANGUAGE: ${SUPPORTED_LANGUAGES.find(l => l.code === language)?.nativeLabel || 'ENGLISH'}`}
                        onPress={() => setIsLanguageModalVisible(true)}
                        variant="secondary"
                    />
                </View>

                {/* Players Section */}
                <View style={styles.section}>
                    <Text style={styles.label}>PLAYERS ({players.length})</Text>
                    {
                        players.map((p, i) => (
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
                        ))
                    }
                    <Button
                        title="+ ADD PLAYER"
                        onPress={addPlayer}
                        variant="secondary"
                        style={{ marginTop: theme.spacing.s }}
                    />
                </View >

                <View style={styles.footer}>
                    <Button
                        title={isStarting ? "STARTING..." : "START GAME"}
                        onPress={startGame}
                        style={styles.startButton}
                        textStyle={{
                            fontSize: 32,
                            letterSpacing: 4,
                            fontFamily: theme.fonts.header,
                            lineHeight: 40, // Add line height for iOS
                            paddingTop: 4, // Add top padding for iOS
                            includeFontPadding: false, // Remove extra padding
                            textAlignVertical: 'center' // Center text vertically
                        }}
                    />
                </View>
            </ScrollView >

            <LanguageSelectorModal
                visible={isLanguageModalVisible}
                onClose={() => setIsLanguageModalVisible(false)}
                onSelect={(langCode) => {
                    setLanguage(langCode);
                    setIsLanguageModalVisible(false);
                }}
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
                        <View style={styles.warningIconContainer}>
                            <Text style={styles.warningIcon}>⚠️</Text>
                        </View>
                        <Text style={styles.warningTitle}>NO INTERNET CONNECTION</Text>
                        <Text style={styles.warningMessage}>
                            You need an active internet connection to start the game in {SUPPORTED_LANGUAGES.find(l => l.code === language)?.nativeLabel || 'this language'}. Please reconnect or switch to English.
                        </Text>
                        <TouchableOpacity
                            style={styles.warningButton}
                            onPress={() => {
                                playHaptic('light');
                                setShowOfflineWarning(false);
                            }}
                        >
                            <Text style={styles.warningButtonText}>GOT IT</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </KeyboardAvoidingView >
    );
}

const getStyles = (theme) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    scrollContent: {
        paddingVertical: theme.spacing.l,
        paddingTop: Platform.OS === 'ios' ? 40 : 24,
        paddingBottom: 50,
        paddingHorizontal: 0, // No horizontal padding - let buttons control their own spacing
    },
    title: {
        fontSize: 72,
        color: theme.colors.tertiary, // Synchronized silver
        fontFamily: theme.fonts.header,
        marginBottom: theme.spacing.xl,
        textAlign: 'center',
        letterSpacing: 4,
        transform: [{ scaleY: 1.1 }],
        lineHeight: 90,
        paddingVertical: 16,
        paddingTop: 20,
        includeFontPadding: false,
        textAlignVertical: 'center',
        ...theme.textShadows.depth,
    },
    section: {
        marginBottom: theme.spacing.xl,
        paddingHorizontal: theme.spacing.l, // Only for title and other content, not buttons
        marginHorizontal: 0,
    },
    label: {
        color: theme.colors.textSecondary,
        fontSize: theme.fontSize.large,
        fontFamily: theme.fonts.medium,
        letterSpacing: 2,
        marginBottom: theme.spacing.m,
    },
    categoryText: {
        color: theme.colors.textSecondary, // Dark brown for unselected
        fontFamily: theme.fonts.medium,
        fontSize: theme.fontSize.medium,
        textAlign: 'center',
        paddingVertical: 12, // Ensure touch target
        letterSpacing: 1,
    },
    categoryToggle: {
        marginBottom: theme.spacing.m,
        width: '100%',
        minHeight: 60,
        marginHorizontal: 0, // Remove any horizontal margins
        paddingHorizontal: 0, // Remove any horizontal padding
    },
    categoryDropdownContainer: {
        backgroundColor: theme.colors.surface, // Use theme surface instead of hardcoded creme
        borderRadius: theme.borderRadius.xl,
        padding: theme.spacing.m,
        marginTop: theme.spacing.s,
        borderWidth: 3, // Thicker border as requested
        borderColor: theme.colors.textSecondary,
        ...theme.shadows.soft,
    },
    categoryGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: theme.spacing.s,
    },
    gridItemWrapper: {
        width: '48%', // Two per row
    },
    categoryBtn: {
        width: '100%', // Fill wrapper
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: theme.colors.textSecondary,
        borderRadius: theme.borderRadius.pill, // Pill shape
    },
    categoryBtnSelected: {
        backgroundColor: theme.colors.primary,
        borderColor: theme.colors.primary,
    },
    counterRow: {
        flexDirection: 'row',
        gap: theme.spacing.m,
        alignItems: 'center',
    },
    counterBtn: {
        flex: 1,
        borderWidth: 1,
        borderColor: theme.colors.textSecondary,
        borderRadius: theme.borderRadius.pill, // Fix rectangle issue
        backgroundColor: 'transparent',
        justifyContent: 'center',
        alignItems: 'center',
        height: 60,
    },
    counterBtnText: {
        fontSize: 40,
        color: theme.colors.text, // Use dynamic theme color
        fontFamily: theme.fonts.medium,
        textAlign: 'center',
        lineHeight: 45, // Center vertically
        includeFontPadding: false,
    },
    counterDisplay: {
        paddingHorizontal: theme.spacing.xl,
        minWidth: 80,
        alignItems: 'center',
    },
    counterValue: {
        fontSize: 64,
        color: theme.colors.text,
        fontFamily: theme.fonts.header,
    },
    hintToggle: {
        width: '100%',
        minHeight: 60,
        borderWidth: 1,
        borderColor: theme.colors.textSecondary,
        borderRadius: theme.borderRadius.pill,
        marginHorizontal: 0, // Remove any horizontal margins
        paddingHorizontal: 0, // Remove any horizontal padding
    },
    hintToggleActive: {
        backgroundColor: 'rgba(50,205,50,0.1)',
        borderColor: theme.colors.primary,
    },
    playerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: theme.spacing.m,
        gap: theme.spacing.s,
    },
    inputContainer: {
        flex: 1,
        borderRadius: theme.borderRadius.pill, // ELONGATED OVAL
        backgroundColor: 'transparent', // Matte look
        borderWidth: 1,
        borderColor: theme.colors.textSecondary,
        minHeight: 60, // Ensure height for scaling
        justifyContent: 'center',
    },
    input: {
        color: theme.colors.text,
        paddingHorizontal: theme.spacing.l,
        fontSize: theme.fontSize.large,
        fontFamily: theme.fonts.medium,
        letterSpacing: 2,
        textTransform: 'uppercase',
        flex: 1,
    },
    screenTitle: { // New style added as per instruction
        fontSize: 48,
        fontFamily: 'Teko-Medium',
        letterSpacing: 3,
        textAlign: 'center',
        marginBottom: 24,
        marginTop: 50,
        color: theme.colors.tertiary, // Synchronized silver
    },
    removeBtn: {
        paddingHorizontal: theme.spacing.m,
        backgroundColor: 'transparent',
    },
    footer: {
        marginTop: theme.spacing.l,
    },
    startButton: {
        width: '100%',
        backgroundColor: theme.colors.primary,
        borderRadius: theme.borderRadius.pill,
        paddingVertical: 18, // Increased vertical padding for iOS
        minHeight: 70, // Ensure minimum height for text
    },
    // Warning Modal Styles
    warningOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: theme.spacing.l,
    },
    warningContent: {
        backgroundColor: theme.colors.background,
        borderRadius: theme.borderRadius.xl,
        padding: theme.spacing.xl,
        width: '90%',
        maxWidth: 400,
        alignItems: 'center',
        ...theme.shadows.soft,
        borderWidth: 2,
        borderColor: theme.colors.error,
    },
    warningIconContainer: {
        marginBottom: theme.spacing.m,
    },
    warningIcon: {
        fontSize: 64,
    },
    warningTitle: {
        fontSize: theme.fontSize.large,
        color: theme.colors.error,
        fontFamily: theme.fonts.bold,
        letterSpacing: 2,
        marginBottom: theme.spacing.m,
        textAlign: 'center',
    },
    warningMessage: {
        fontSize: theme.fontSize.medium,
        color: theme.colors.text,
        fontFamily: theme.fonts.medium,
        textAlign: 'center',
        marginBottom: theme.spacing.xl,
        lineHeight: 24,
        letterSpacing: 0.5,
    },
    warningButton: {
        backgroundColor: theme.colors.primary,
        paddingVertical: theme.spacing.m,
        paddingHorizontal: theme.spacing.xl,
        borderRadius: theme.borderRadius.pill,
        minWidth: 150,
        alignItems: 'center',
        ...theme.shadows.medium,
    },
    warningButtonText: {
        color: theme.colors.secondary,
        fontSize: theme.fontSize.medium,
        fontFamily: theme.fonts.bold,
        letterSpacing: 2,
    },

});
