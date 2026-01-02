import React, { useState } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    ScrollView, 
    TouchableOpacity, 
    Switch, 
    Platform,
    Alert,
    Modal
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../utils/ThemeContext';
import { useSettings } from '../utils/SettingsContext';
import { playHaptic } from '../utils/haptics';

// Film perforation component
const FilmPerforations = ({ side, theme }) => {
    const perforationColor = theme.colors.primary + '40';
    return (
        <View style={[filmStyles.perforationStrip, side === 'left' ? filmStyles.leftStrip : filmStyles.rightStrip]}>
            {[...Array(16)].map((_, i) => (
                <View key={i} style={[filmStyles.perforation, { backgroundColor: perforationColor, borderColor: theme.colors.primary + '30' }]} />
            ))}
        </View>
    );
};

const filmStyles = StyleSheet.create({
    perforationStrip: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        width: 16,
        justifyContent: 'space-evenly',
        alignItems: 'center',
        paddingVertical: 30,
        zIndex: 1,
    },
    leftStrip: { left: 2 },
    rightStrip: { right: 2 },
    perforation: {
        width: 8,
        height: 12,
        borderRadius: 2,
        borderWidth: 1,
    },
});

// Setting Toggle Row
const SettingToggle = ({ label, description, value, onToggle, theme }) => (
    <View style={[rowStyles.container, { borderBottomColor: theme.colors.primary + '20' }]}>
        <View style={rowStyles.textContainer}>
            <Text style={[rowStyles.label, { color: theme.colors.text }]}>{label}</Text>
            {description && (
                <Text style={[rowStyles.description, { color: theme.colors.textMuted }]}>{description}</Text>
            )}
        </View>
        <Switch
            value={value}
            onValueChange={(val) => {
                playHaptic('light');
                onToggle(val);
            }}
            trackColor={{ false: theme.colors.surface, true: theme.colors.primary + '60' }}
            thumbColor={value ? theme.colors.primary : theme.colors.textMuted}
            ios_backgroundColor={theme.colors.surface}
        />
    </View>
);

// Setting Button Row
const SettingButton = ({ label, description, onPress, theme, value, danger }) => (
    <TouchableOpacity 
        style={[rowStyles.container, { borderBottomColor: theme.colors.primary + '20' }]}
        onPress={() => { playHaptic('light'); onPress(); }}
        activeOpacity={0.7}
    >
        <View style={rowStyles.textContainer}>
            <Text style={[rowStyles.label, { color: danger ? theme.colors.error : theme.colors.text }]}>{label}</Text>
            {description && (
                <Text style={[rowStyles.description, { color: theme.colors.textMuted }]}>{description}</Text>
            )}
        </View>
        {value && (
            <Text style={[rowStyles.value, { color: theme.colors.primary }]}>{value}</Text>
        )}
        <Text style={[rowStyles.arrow, { color: theme.colors.textMuted }]}>›</Text>
    </TouchableOpacity>
);

// Section Header
const SectionHeader = ({ title, theme }) => (
    <View style={sectionStyles.container}>
        <Text style={[sectionStyles.title, { color: theme.colors.primary }]}>{title}</Text>
    </View>
);

const rowStyles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 14,
        paddingHorizontal: 20,
        borderBottomWidth: 1,
    },
    textContainer: {
        flex: 1,
        marginRight: 12,
    },
    label: {
        fontSize: 15,
        fontFamily: 'CabinetGrotesk-Bold',
        letterSpacing: 0.5,
    },
    description: {
        fontSize: 12,
        fontFamily: 'Teko-Medium',
        marginTop: 2,
        letterSpacing: 0.5,
    },
    value: {
        fontSize: 13,
        fontFamily: 'Teko-Medium',
        marginRight: 8,
        letterSpacing: 1,
    },
    arrow: {
        fontSize: 22,
        fontWeight: '300',
    },
});

const sectionStyles = StyleSheet.create({
    container: {
        paddingHorizontal: 20,
        paddingTop: 24,
        paddingBottom: 8,
    },
    title: {
        fontSize: 11,
        fontFamily: 'Panchang-Bold',
        letterSpacing: 3,
    },
});

// Timer Duration Selector Modal
const TimerSelector = ({ visible, currentValue, onSelect, onClose, theme }) => {
    if (!visible) return null;
    
    const options = [30, 45, 60, 90, 120, 180];
    
    return (
        <Modal transparent visible={visible} animationType="fade">
            <View style={modalStyles.overlay}>
                <View style={[modalStyles.container, { backgroundColor: theme.colors.surface }]}>
                    <Text style={[modalStyles.title, { color: theme.colors.text }]}>DISCUSSION TIMER</Text>
                    <View style={modalStyles.options}>
                        {options.map((seconds) => (
                            <TouchableOpacity
                                key={seconds}
                                style={[
                                    modalStyles.option,
                                    { 
                                        backgroundColor: currentValue === seconds ? theme.colors.primary : theme.colors.background,
                                        borderColor: theme.colors.primary,
                                    }
                                ]}
                                onPress={() => {
                                    playHaptic('medium');
                                    onSelect(seconds);
                                    onClose();
                                }}
                            >
                                <Text style={[
                                    modalStyles.optionText,
                                    { color: currentValue === seconds ? theme.colors.secondary : theme.colors.text }
                                ]}>
                                    {seconds < 60 ? `${seconds}s` : `${seconds / 60}m`}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                    <TouchableOpacity
                        style={[modalStyles.closeButton, { borderColor: theme.colors.primary }]}
                        onPress={() => { playHaptic('light'); onClose(); }}
                    >
                        <Text style={[modalStyles.closeText, { color: theme.colors.primary }]}>CANCEL</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </Modal>
    );
};

const modalStyles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.7)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    container: {
        width: '80%',
        borderRadius: 16,
        padding: 24,
        alignItems: 'center',
    },
    title: {
        fontSize: 14,
        fontFamily: 'Panchang-Bold',
        letterSpacing: 2,
        marginBottom: 20,
    },
    options: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: 10,
        marginBottom: 20,
    },
    option: {
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 8,
        borderWidth: 2,
        minWidth: 70,
        alignItems: 'center',
    },
    optionText: {
        fontSize: 14,
        fontFamily: 'CabinetGrotesk-Black',
        letterSpacing: 1,
    },
    closeButton: {
        paddingVertical: 10,
        paddingHorizontal: 30,
        borderRadius: 20,
        borderWidth: 2,
    },
    closeText: {
        fontSize: 12,
        fontFamily: 'CabinetGrotesk-Black',
        letterSpacing: 2,
    },
});

export default function SettingsScreen({ navigation }) {
    const { theme } = useTheme();
    const { settings, updateSetting, resetSettings } = useSettings();
    const [showTimerSelector, setShowTimerSelector] = useState(false);
    const styles = getStyles(theme);

    const formatTimer = (seconds) => {
        if (seconds < 60) return `${seconds}s`;
        return `${seconds / 60}m`;
    };

    const handleResetSettings = () => {
        Alert.alert(
            'Reset Settings',
            'Reset all settings to default?',
            [
                { text: 'Cancel', style: 'cancel' },
                { 
                    text: 'Reset', 
                    style: 'destructive',
                    onPress: () => {
                        playHaptic('medium');
                        resetSettings();
                    }
                }
            ]
        );
    };

    const handleClearData = () => {
        Alert.alert(
            'Clear All Data',
            'This will delete your profile and all saved data. This cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                { 
                    text: 'Clear All', 
                    style: 'destructive',
                    onPress: async () => {
                        playHaptic('heavy');
                        await AsyncStorage.clear();
                        Alert.alert('Done', 'All data cleared. Restart the app.');
                    }
                }
            ]
        );
    };

    return (
        <LinearGradient colors={theme.colors.backgroundGradient} style={styles.container}>
            <FilmPerforations side="left" theme={theme} />
            <FilmPerforations side="right" theme={theme} />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity 
                    onPress={() => { playHaptic('light'); navigation.goBack(); }}
                    style={styles.backButton}
                >
                    <Text style={[styles.backText, { color: theme.colors.primary }]}>‹</Text>
                </TouchableOpacity>
                <Text style={[styles.headerTitle, { color: theme.colors.text }]}>SETTINGS</Text>
                <View style={styles.backButton} />
            </View>

            <ScrollView 
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                {/* Feedback */}
                <SectionHeader title="FEEDBACK" theme={theme} />
                <SettingToggle
                    label="Sound Effects"
                    description="Play sounds during gameplay"
                    value={settings.soundEnabled}
                    onToggle={(val) => updateSetting('soundEnabled', val)}
                    theme={theme}
                />
                <SettingToggle
                    label="Haptic Feedback"
                    description="Vibration on button presses"
                    value={settings.hapticsEnabled}
                    onToggle={(val) => updateSetting('hapticsEnabled', val)}
                    theme={theme}
                />

                {/* Game Settings */}
                <SectionHeader title="GAME" theme={theme} />
                <SettingButton
                    label="Discussion Timer"
                    description="Default time for discussions"
                    value={formatTimer(settings.timerDuration)}
                    onPress={() => setShowTimerSelector(true)}
                    theme={theme}
                />
                <SettingToggle
                    label="Show Role Hints"
                    description="Tips during role reveal"
                    value={settings.showRoleHints}
                    onToggle={(val) => updateSetting('showRoleHints', val)}
                    theme={theme}
                />

                {/* Appearance */}
                <SectionHeader title="APPEARANCE" theme={theme} />
                <SettingButton
                    label="Theme"
                    value={theme.name}
                    onPress={() => navigation.navigate('ThemeSelector')}
                    theme={theme}
                />
                <SettingToggle
                    label="Reduced Motion"
                    description="Less animations"
                    value={settings.reducedMotion}
                    onToggle={(val) => updateSetting('reducedMotion', val)}
                    theme={theme}
                />

                {/* Info */}
                <SectionHeader title="INFO" theme={theme} />
                <SettingButton
                    label="How to Play"
                    onPress={() => navigation.navigate('HowToPlay')}
                    theme={theme}
                />
                <SettingButton
                    label="Privacy Policy"
                    onPress={() => navigation.navigate('PrivacyPolicy')}
                    theme={theme}
                />
                <SettingButton
                    label="Terms of Service"
                    onPress={() => navigation.navigate('TermsOfService')}
                    theme={theme}
                />

                {/* Data */}
                <SectionHeader title="DATA" theme={theme} />
                <SettingButton
                    label="Reset Settings"
                    onPress={handleResetSettings}
                    theme={theme}
                />
                <SettingButton
                    label="Clear All Data"
                    description="Delete profile and saved data"
                    onPress={handleClearData}
                    theme={theme}
                    danger
                />

                {/* Footer */}
                <View style={styles.footer}>
                    <Text style={[styles.footerText, { color: theme.colors.textMuted }]}>
                        IMPOSTOR GAME v1.0.0
                    </Text>
                </View>
            </ScrollView>

            <TimerSelector
                visible={showTimerSelector}
                currentValue={settings.timerDuration}
                onSelect={(val) => updateSetting('timerDuration', val)}
                onClose={() => setShowTimerSelector(false)}
                theme={theme}
            />
        </LinearGradient>
    );
}

const getStyles = (theme) => StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: Platform.OS === 'ios' ? 56 : 40,
        paddingHorizontal: 16,
        paddingBottom: 12,
    },
    backButton: {
        width: 44,
        height: 44,
        alignItems: 'center',
        justifyContent: 'center',
    },
    backText: {
        fontSize: 36,
        fontWeight: '300',
    },
    headerTitle: {
        fontSize: 16,
        fontFamily: 'Panchang-Bold',
        letterSpacing: 3,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 40,
    },
    footer: {
        alignItems: 'center',
        paddingVertical: 30,
    },
    footerText: {
        fontSize: 10,
        fontFamily: 'Teko-Medium',
        letterSpacing: 2,
    },
});
