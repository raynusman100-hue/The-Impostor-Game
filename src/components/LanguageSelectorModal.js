import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Modal, TextInput, FlatList, TouchableOpacity } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { useTheme } from '../utils/ThemeContext';
import { SUPPORTED_LANGUAGES } from '../utils/translationService';
import { playHaptic } from '../utils/haptics';

export default function LanguageSelectorModal({ visible, onClose, onSelect, currentLanguage }) {
    const { theme } = useTheme();
    const styles = getStyles(theme);
    const [searchQuery, setSearchQuery] = useState('');
    const [filteredLanguages, setFilteredLanguages] = useState(SUPPORTED_LANGUAGES);
    const [showWarning, setShowWarning] = useState(false);

    useEffect(() => {
        if (!visible) {
            setSearchQuery('');
            setFilteredLanguages(SUPPORTED_LANGUAGES);
        }
    }, [visible]);

    const handleSearch = (text) => {
        setSearchQuery(text);
        const filtered = SUPPORTED_LANGUAGES.filter(lang =>
            lang.label.toLowerCase().includes(text.toLowerCase()) ||
            lang.nativeLabel.toLowerCase().includes(text.toLowerCase())
        );
        setFilteredLanguages(filtered);
    };

    const handleLanguageSelect = async (langCode) => {
        playHaptic('medium');

        // If English is selected, no internet needed
        if (langCode === 'en') {
            onSelect(langCode);
            return;
        }

        // Check internet connection for non-English languages
        const netState = await NetInfo.fetch();
        if (!netState.isConnected) {
            playHaptic('warning');
            setShowWarning(true);
            return;
        }

        // Connection is good, proceed with selection
        onSelect(langCode);
    };

    const renderLanguageItem = ({ item }) => {
        const isSelected = item.code === currentLanguage;
        return (
            <TouchableOpacity
                style={[styles.languageItem, isSelected && styles.selectedItem]}
                onPress={() => handleLanguageSelect(item.code)}
            >
                <Text
                    style={[styles.languageText, isSelected && styles.selectedText]}
                    numberOfLines={2}
                    adjustsFontSizeToFit
                    minimumFontScale={0.8}
                >
                    {item.nativeLabel} ({item.label})
                </Text>
                {isSelected && <Text style={styles.checkmark}>✓</Text>}
            </TouchableOpacity>
        );
    };

    return (
        <Modal
            visible={visible}
            animationType="slide"
            transparent={true}
            onRequestClose={onClose}
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <View style={styles.header}>
                        <Text style={styles.title}>SELECT LANGUAGE</Text>
                        <TouchableOpacity
                            onPress={() => {
                                playHaptic('light');
                                onClose();
                            }}
                            style={styles.closeButton}
                            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                        >
                            <Text style={styles.closeButtonText}>✕</Text>
                        </TouchableOpacity>
                    </View>

                    <View style={styles.searchContainer}>
                        <TextInput
                            style={styles.searchInput}
                            placeholder="SEARCH LANGUAGES..."
                            placeholderTextColor={theme.colors.textSecondary}
                            value={searchQuery}
                            onChangeText={handleSearch}
                            autoCorrect={false}
                        />
                    </View>

                    <FlatList
                        data={filteredLanguages}
                        renderItem={renderLanguageItem}
                        keyExtractor={item => item.code}
                        contentContainerStyle={styles.listContent}
                        showsVerticalScrollIndicator={false}
                        ListEmptyComponent={
                            <Text style={styles.emptyText}>No languages found</Text>
                        }
                    />
                </View>

                {/* Warning Modal */}
                <Modal
                    visible={showWarning}
                    animationType="fade"
                    transparent={true}
                    onRequestClose={() => setShowWarning(false)}
                >
                    <View style={styles.warningOverlay}>
                        <View style={styles.warningContent}>
                            <View style={styles.warningIconContainer}>
                                <Text style={styles.warningIcon}>⚠️</Text>
                            </View>
                            <Text style={styles.warningTitle}>NO INTERNET CONNECTION</Text>
                            <Text style={styles.warningMessage}>
                                You need an active internet connection to use languages other than English.
                            </Text>
                            <TouchableOpacity
                                style={styles.warningButton}
                                onPress={() => {
                                    playHaptic('light');
                                    setShowWarning(false);
                                }}
                            >
                                <Text style={styles.warningButtonText}>GOT IT</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </Modal>
            </View>
        </Modal>
    );
}

const getStyles = (theme) => StyleSheet.create({
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'flex-end',
    },
    modalContent: {
        backgroundColor: theme.colors.background,
        borderTopLeftRadius: theme.borderRadius.xl,
        borderTopRightRadius: theme.borderRadius.xl,
        height: '80%',
        padding: theme.spacing.l,
        paddingBottom: theme.spacing.xxl,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: theme.spacing.l,
    },
    title: {
        fontSize: theme.fontSize.xxlarge,
        color: theme.colors.tertiary, // Synchronized silver
        fontFamily: theme.fonts.header,
        letterSpacing: 2,
    },
    closeButton: {
        padding: theme.spacing.s,
    },
    closeButtonText: {
        fontSize: theme.fontSize.xlarge,
        color: theme.colors.textSecondary,
        fontFamily: theme.fonts.medium,
    },
    searchContainer: {
        marginBottom: theme.spacing.l,
        borderWidth: 1,
        borderColor: theme.colors.textSecondary,
        borderRadius: theme.borderRadius.pill,
        paddingHorizontal: theme.spacing.m,
        height: 50,
        justifyContent: 'center',
    },
    searchInput: {
        fontSize: theme.fontSize.medium,
        color: theme.colors.text,
        fontFamily: theme.fonts.medium,
        letterSpacing: 1,
    },
    listContent: {
        paddingBottom: 20,
    },
    languageItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: theme.spacing.m,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(0,0,0,0.1)',
    },
    selectedItem: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)', // Subtle selection background
        paddingHorizontal: theme.spacing.s,
        borderRadius: theme.borderRadius.m,
        borderBottomWidth: 0,
    },
    languageText: {
        fontSize: 16, // Explicitly slightly smaller than medium (18)
        color: theme.colors.text,
        fontFamily: theme.fonts.medium,
        letterSpacing: 0.5, // Tighter tracking for long words
        flex: 1, // Ensure text takes up available space before checkmark
        paddingRight: 10,
    },
    selectedText: {
        color: theme.colors.primary,
        fontFamily: theme.fonts.bold,
    },
    checkmark: {
        fontSize: theme.fontSize.medium,
        color: theme.colors.primary,
    },
    emptyText: {
        textAlign: 'center',
        color: theme.colors.textSecondary,
        marginTop: theme.spacing.xl,
        fontFamily: theme.fonts.medium,
        fontSize: theme.fontSize.medium,
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
