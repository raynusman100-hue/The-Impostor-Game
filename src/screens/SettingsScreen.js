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
    Linking,
    Modal,
    TextInput
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { auth, database } from '../utils/firebase';
import { deleteUser, reauthenticateWithCredential, EmailAuthProvider } from 'firebase/auth';
import { ref, remove } from 'firebase/database';
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

export default function SettingsScreen({ navigation }) {
    const { theme } = useTheme();
    const { settings, updateSetting, resetSettings } = useSettings();
    const styles = getStyles(theme);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteStep, setDeleteStep] = useState(0); // 0: Hidden, 1: Warning, 2: Final/Password
    const [deletePassword, setDeletePassword] = useState('');

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

    const handleDeleteAccount = () => {
        const user = auth.currentUser;
        if (!user) {
            Alert.alert('Not Logged In', 'You need to be logged in to delete your account.');
            return;
        }

        // Start Step 1
        setDeleteStep(1);
        setShowDeleteModal(true);
    };

    const performAccountDeletion = async () => {
        const user = auth.currentUser;
        if (!user) return;

        const isGoogleUser = user.providerData.some(p => p.providerId === 'google.com');

        // For password users, validate password
        if (!isGoogleUser && !deletePassword) {
            Alert.alert('Error', 'Password is required.');
            return;
        }

        setShowDeleteModal(false);
        setDeleteStep(0);
        playHaptic('medium');

        try {
            if (!isGoogleUser) {
                const credential = EmailAuthProvider.credential(user.email, deletePassword);
                await reauthenticateWithCredential(user, credential);
            }

            // Delete user data from database
            if (user.displayName) {
                await remove(ref(database, `usernames/${user.displayName.toLowerCase()}`));
            }
            await remove(ref(database, `users/${user.uid}`));

            // Clear local storage
            await AsyncStorage.clear();

            // Delete Firebase account
            await deleteUser(user);

            playHaptic('success');
            Alert.alert('Account Deleted', 'Your account has been permanently deleted.', [
                { text: 'OK', onPress: () => navigation.navigate('Home') }
            ]);
        } catch (error) {
            playHaptic('error');
            setDeletePassword(''); // Clear password

            if (error.code === 'auth/wrong-password') {
                setShowDeleteModal(true); // Re-show modal
                setDeleteStep(2);
                Alert.alert('Error', 'Incorrect password.');
            } else if (error.code === 'auth/requires-recent-login') {
                Alert.alert('Security Check', 'For security, please sign out and sign in again to delete your account.');
            } else {
                console.error("Deletion error:", error);
                Alert.alert('Error', 'Failed to delete account. Please try again.');
            }
        }
    };

    const handleRateApp = () => {
        // Placeholder - update with actual store URLs
        Alert.alert('Rate Us', 'Thanks for your support! Rating coming soon.');
    };

    const handleShareApp = async () => {
        try {
            const { Share } = require('react-native');
            await Share.share({
                message: 'Check out Impostor Game! A fun party game to play with friends.',
            });
        } catch (e) {
            console.log('Share error:', e);
        }
    };

    const handleContact = () => {
        Linking.openURL('mailto:support@impostorgame.com?subject=Impostor Game Feedback');
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
                {/* Preferences */}
                <SectionHeader title="PREFERENCES" theme={theme} />
                <SettingToggle
                    label="Haptic Feedback"
                    description="Vibration on interactions"
                    value={settings.hapticsEnabled}
                    onToggle={(val) => updateSetting('hapticsEnabled', val)}
                    theme={theme}
                />
                <SettingToggle
                    label="Reduced Motion"
                    description="Minimize animations"
                    value={settings.reducedMotion}
                    onToggle={(val) => updateSetting('reducedMotion', val)}
                    theme={theme}
                />

                {/* Appearance */}
                <SectionHeader title="APPEARANCE" theme={theme} />
                <SettingButton
                    label="Theme"
                    description="Change app colors"
                    value={theme.name}
                    onPress={() => navigation.navigate('ThemeSelector')}
                    theme={theme}
                />

                {/* Account */}
                <SectionHeader title="ACCOUNT" theme={theme} />
                <SettingButton
                    label="Edit Profile"
                    description="Change name and avatar"
                    onPress={() => navigation.navigate('Profile')}
                    theme={theme}
                />

                {/* Support */}
                <SectionHeader title="SUPPORT" theme={theme} />
                <SettingButton
                    label="How to Play"
                    description="Learn the rules"
                    onPress={() => navigation.navigate('HowToPlay')}
                    theme={theme}
                />
                <SettingButton
                    label="Rate App"
                    description="Leave a review"
                    onPress={handleRateApp}
                    theme={theme}
                />
                <SettingButton
                    label="Share App"
                    description="Tell your friends"
                    onPress={handleShareApp}
                    theme={theme}
                />
                <SettingButton
                    label="Contact Us"
                    description="Send feedback"
                    onPress={handleContact}
                    theme={theme}
                />
                <SettingButton
                    label="Remove Ads (Pro)"
                    description="One-time purchase"
                    onPress={() => navigation.navigate('ProVersion')}
                    theme={theme}
                />

                {/* Legal */}
                <SectionHeader title="LEGAL" theme={theme} />
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
                    description="Restore defaults"
                    onPress={handleResetSettings}
                    theme={theme}
                />
                <SettingButton
                    label="Clear All Data"
                    description="Delete local saved data"
                    onPress={handleClearData}
                    theme={theme}
                    danger
                />
                <SettingButton
                    label="Delete Account"
                    description="Permanently delete your account"
                    onPress={handleDeleteAccount}
                    theme={theme}
                    danger
                />

                {/* DEBUG - Premium Testing */}
                <SectionHeader title="DEBUG (Testing Only)" theme={theme} />
                <SettingButton
                    label="Test Premium Screen"
                    description="Manually open premium page"
                    onPress={() => navigation.navigate('Premium')}
                    theme={theme}
                />
                <SettingButton
                    label="Check App Open Count"
                    description="View premium counter"
                    onPress={async () => {
                        const count = await AsyncStorage.getItem('app_open_count');
                        Alert.alert('Premium Counter', `App opened ${count || 0} times\nPremium shows every 2nd open (even numbers)`);
                    }}
                    theme={theme}
                />
                <SettingButton
                    label="Reset Premium Counter"
                    description="Set count to 1 (next open = premium)"
                    onPress={async () => {
                        await AsyncStorage.setItem('app_open_count', '1');
                        Alert.alert('Reset', 'Counter set to 1. Premium will show on next app open!');
                    }}
                    theme={theme}
                />

                {/* Footer */}
                <View style={styles.footer}>
                    <Text style={[styles.footerText, { color: theme.colors.textMuted }]}>
                        IMPOSTOR GAME
                    </Text>
                    <Text style={[styles.versionText, { color: theme.colors.textMuted }]}>
                        Version 1.0.0
                    </Text>
                </View>
            </ScrollView>

            {/* Delete Account 2-Step Modal */}
            <Modal visible={showDeleteModal} transparent animationType="fade" onRequestClose={() => setShowDeleteModal(false)}>
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
                        <Text style={[styles.modalTitle, { color: theme.colors.error }]}>
                            {deleteStep === 1 ? 'DELETE ACCOUNT?' : 'FINAL WARNING'}
                        </Text>

                        <Text style={[styles.modalText, { color: theme.colors.text }]}>
                            {deleteStep === 1
                                ? 'Are you sure you want to delete your account? This will permanently remove your profile, stats, and saved data.'
                                : 'This action CANNOT be undone. Your data will be lost forever.'}
                        </Text>

                        {/* Step 2: Password Input (Only for Email Users) */}
                        {deleteStep === 2 && auth.currentUser && !auth.currentUser.providerData.some(p => p.providerId === 'google.com') && (
                            <TextInput
                                style={[styles.modalInput, {
                                    backgroundColor: theme.colors.background,
                                    color: theme.colors.text,
                                    borderColor: theme.colors.primary
                                }]}
                                value={deletePassword}
                                onChangeText={setDeletePassword}
                                placeholder="Enter Password"
                                placeholderTextColor={theme.colors.textMuted}
                                secureTextEntry
                            />
                        )}

                        <View style={styles.modalButtons}>
                            <TouchableOpacity
                                onPress={() => { setShowDeleteModal(false); setDeleteStep(0); setDeletePassword(''); }}
                                style={[styles.modalBtn, { borderColor: theme.colors.primary }]}
                            >
                                <Text style={[styles.modalBtnText, { color: theme.colors.text }]}>CANCEL</Text>
                            </TouchableOpacity>

                            {deleteStep === 1 ? (
                                <TouchableOpacity
                                    onPress={() => { playHaptic('medium'); setDeleteStep(2); }}
                                    style={[styles.modalBtn, { backgroundColor: theme.colors.primary + '20', borderColor: theme.colors.error, borderWidth: 1 }]}
                                >
                                    <Text style={[styles.modalBtnText, { color: theme.colors.error }]}>CONTINUE</Text>
                                </TouchableOpacity>
                            ) : (
                                <TouchableOpacity
                                    onPress={performAccountDeletion}
                                    style={[styles.modalBtn, { backgroundColor: theme.colors.error, borderColor: theme.colors.error }]}
                                >
                                    <Text style={[styles.modalBtnText, { color: '#fff' }]}>DELETE FOREVER</Text>
                                </TouchableOpacity>
                            )}
                        </View>
                    </View>
                </View>
            </Modal>
        </LinearGradient>
    );
}

function getStyles(theme) {
    return StyleSheet.create({
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
            fontSize: 11,
            fontFamily: 'Panchang-Bold',
            letterSpacing: 3,
        },
        versionText: {
            fontSize: 11,
            fontFamily: 'Teko-Medium',
            letterSpacing: 1,
            marginTop: 4,
        },
        // Modal styles
        modalOverlay: {
            flex: 1,
            backgroundColor: 'rgba(0,0,0,0.8)',
            justifyContent: 'center',
            alignItems: 'center',
            padding: 20,
        },
        modalContent: {
            width: '100%',
            borderRadius: 16,
            padding: 24,
            alignItems: 'center',
        },
        modalTitle: {
            fontSize: 16,
            fontFamily: 'Panchang-Bold',
            letterSpacing: 2,
            marginBottom: 8,
        },
        modalText: {
            fontSize: 13,
            fontFamily: 'Teko-Medium',
            textAlign: 'center',
            marginBottom: 16,
        },
        modalInput: {
            width: '100%',
            height: 48,
            borderRadius: 8,
            borderWidth: 2,
            paddingHorizontal: 16,
            fontSize: 14,
            fontFamily: 'Teko-Medium',
            marginBottom: 16,
        },
        modalButtons: {
            flexDirection: 'row',
            gap: 12,
            width: '100%',
        },
        modalBtn: {
            flex: 1,
            paddingVertical: 12,
            borderRadius: 8,
            borderWidth: 2,
            borderColor: 'transparent',
            alignItems: 'center',
        },
        modalBtnText: {
            fontSize: 13,
            fontFamily: 'CabinetGrotesk-Black',
            letterSpacing: 1,
        },
    });
}

