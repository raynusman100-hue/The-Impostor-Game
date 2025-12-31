import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../utils/ThemeContext';
import { ALL_THEMES } from '../utils/themes';
import { playHaptic } from '../utils/haptics';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ThemeSelectorScreen({ navigation }) {
    const { theme, changeTheme } = useTheme();
    const styles = getStyles(theme);

    const handleThemeSelect = (themeId) => {
        playHaptic('medium');
        changeTheme(themeId);
    };

    return (
        <LinearGradient
            colors={theme.colors.backgroundGradient}
            style={styles.container}
        >
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.content}>
                    <ScrollView
                        contentContainerStyle={styles.themeGrid}
                        showsVerticalScrollIndicator={false}
                    >
                        <Text style={[styles.title, { color: theme.colors.text }]}>
                            CHOOSE THEME
                        </Text>

                        {ALL_THEMES.map((themeOption) => (
                            <TouchableOpacity
                                key={themeOption.id}
                                style={[
                                    styles.themeCard,
                                    {
                                        backgroundColor: themeOption.colors.surface,
                                        borderColor: themeOption.colors.primary,
                                        borderWidth: theme.id === themeOption.id ? 4 : 2,
                                    }

                                ]}
                                onPress={() => handleThemeSelect(themeOption.id)}
                                activeOpacity={0.8}
                            >
                                <Text style={[styles.themeName, { color: themeOption.colors.text }]}>
                                    {themeOption.name}
                                </Text>

                                <View style={styles.colorPreview}>
                                    <View style={[styles.colorDot, { backgroundColor: themeOption.colors.primary }]} />
                                    <View style={[styles.colorDot, { backgroundColor: themeOption.colors.secondary }]} />
                                    <View style={[styles.colorDot, { backgroundColor: themeOption.colors.accent }]} />
                                </View>

                                {theme.id === themeOption.id && (
                                    <Text style={[styles.activeIndicator, { color: themeOption.colors.primary }]}>
                                        ✓ ACTIVE
                                    </Text>
                                )}
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                </View>
            </SafeAreaView>
        </LinearGradient>
    );
}

const getStyles = (theme) => StyleSheet.create({
    container: {
        flex: 1,
    },
    safeArea: {
        flex: 1,
    },
    content: {
        flex: 1,
        paddingHorizontal: 20,
        paddingTop: 20, // Reset to smaller padding since title scrolls now
    },
    title: {
        fontSize: 48,
        fontFamily: 'Teko-Medium',
        letterSpacing: 3,
        textAlign: 'center',
        marginBottom: 24,
        marginTop: 50,
        color: theme.colors.tertiary, // Synchronized silver
    },
    themeGrid: {
        paddingBottom: 40,
        gap: 16,
    },
    themeCard: {
        padding: 20,
        borderRadius: 16,
        marginBottom: 12,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    themeName: {
        fontSize: 32,
        fontFamily: 'Teko-Medium',
        letterSpacing: 2,
        marginBottom: 12,
        textTransform: 'uppercase',
    },
    colorPreview: {
        flexDirection: 'row',
        gap: 12,
        marginVertical: 8,
    },
    colorDot: {
        width: 40,
        height: 40,
        borderRadius: 20,
        borderWidth: 2,
        borderColor: 'rgba(0,0,0,0.1)',
    },
    activeIndicator: {
        fontSize: 18,
        fontFamily: 'Teko-Medium',
        letterSpacing: 2,
        marginTop: 8,
        fontWeight: 'bold',
    },
});
