import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../utils/ThemeContext';
import { playHaptic } from '../utils/haptics';

export default function PrivacyPolicyScreen({ navigation }) {
    const { theme } = useTheme();
    const styles = getStyles(theme);

    return (
        <View style={styles.container}>
            <LinearGradient colors={theme.colors.backgroundGradient} style={StyleSheet.absoluteFillObject} />
            
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => { playHaptic('light'); navigation.goBack(); }} style={styles.backBtn}>
                    <Text style={styles.backText}>‹</Text>
                </TouchableOpacity>
                <View style={styles.headerCenter}>
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>PRIVACY POLICY</Text>
                    </View>
                </View>
                <View style={{ width: 40 }} />
            </View>

            <ScrollView 
                style={styles.scrollView}
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator={false}
            >
                <Text style={styles.lastUpdated}>Last Updated: January 2026</Text>
                
                <Text style={styles.intro}>
                    This Privacy Policy explains how Imposter Game ("we", "our", or "the app") collects, uses, and protects your information.
                </Text>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>1. INFORMATION WE COLLECT</Text>
                    <Text style={styles.paragraph}>
                        When you create an account, we collect:
                    </Text>
                    <View style={styles.bulletList}>
                        <Text style={styles.bullet}>• Email address — for account authentication and password recovery</Text>
                        <Text style={styles.bullet}>• Username — chosen by you, displayed to other players</Text>
                        <Text style={styles.bullet}>• Avatar selection — your chosen character, visible in games</Text>
                    </View>
                    <Text style={styles.paragraph}>
                        During gameplay, we temporarily process:
                    </Text>
                    <View style={styles.bulletList}>
                        <Text style={styles.bullet}>• Game session data — room codes, player lists, votes</Text>
                        <Text style={styles.bullet}>• Chat messages — text and voice messages sent during games</Text>
                        <Text style={styles.bullet}>• Device network information — for WiFi multiplayer connectivity</Text>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>2. HOW WE USE YOUR INFORMATION</Text>
                    <View style={styles.bulletList}>
                        <Text style={styles.bullet}>• To create and manage your account</Text>
                        <Text style={styles.bullet}>• To display your username and avatar to other players during games</Text>
                        <Text style={styles.bullet}>• To enable multiplayer game sessions</Text>
                        <Text style={styles.bullet}>• To send password reset emails when requested</Text>
                    </View>
                    <Text style={styles.paragraph}>
                        We do NOT use your data for advertising, profiling, or marketing purposes.
                    </Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>3. DATA SHARING</Text>
                    <Text style={styles.paragraph}>
                        Your username and avatar are visible to other players in the same game session. This is necessary for gameplay.
                    </Text>
                    <Text style={styles.paragraph}>
                        We do NOT sell, rent, or share your email address or personal data with third parties for marketing or any other purpose.
                    </Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>4. DATA STORAGE & SECURITY</Text>
                    <View style={styles.bulletList}>
                        <Text style={styles.bullet}>• All data is transmitted using HTTPS/TLS encryption</Text>
                        <Text style={styles.bullet}>• Authentication is handled by Firebase Authentication (Google)</Text>
                        <Text style={styles.bullet}>• Game data is stored in Firebase Realtime Database with security rules</Text>
                        <Text style={styles.bullet}>• Passwords are never stored in plain text</Text>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>5. DATA RETENTION</Text>
                    <Text style={styles.paragraph}>
                        Account data (email, username, avatar) is retained until you delete your account.
                    </Text>
                    <Text style={styles.paragraph}>
                        Game session data is temporary and automatically deleted when the game ends or the room expires.
                    </Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>6. YOUR RIGHTS & DATA DELETION</Text>
                    <Text style={styles.paragraph}>
                        You have the right to delete your account and all associated data at any time:
                    </Text>
                    <View style={styles.bulletList}>
                        <Text style={styles.bullet}>• In the app: Go to Profile → Delete Account</Text>
                        <Text style={styles.bullet}>• Via email: Contact theimpostergameonline@gmail.com</Text>
                    </View>
                    <Text style={styles.paragraph}>
                        When you delete your account, we permanently remove your email, username, avatar selection, and any associated data from our servers.
                    </Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>7. CHILDREN'S PRIVACY</Text>
                    <Text style={styles.paragraph}>
                        Imposter Game is intended for users aged 13 and older. We do not knowingly collect personal information from children under 13. If you believe a child under 13 has provided us with personal data, please contact us to have it removed.
                    </Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>8. DEVICE PERMISSIONS</Text>
                    <Text style={styles.paragraph}>
                        The app may request the following permissions:
                    </Text>
                    <View style={styles.bulletList}>
                        <Text style={styles.bullet}>• Camera — to scan QR codes for joining game rooms quickly</Text>
                        <Text style={styles.bullet}>• Microphone — to record voice messages in the game chat</Text>
                    </View>
                    <Text style={styles.paragraph}>
                        These permissions are only used for the stated purposes. Camera images and voice recordings are not stored permanently — they are only used in real-time for their intended function.
                    </Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>9. THIRD-PARTY SERVICES</Text>
                    <Text style={styles.paragraph}>
                        We use the following third-party services:
                    </Text>
                    <View style={styles.bulletList}>
                        <Text style={styles.bullet}>• Firebase Authentication — for secure login</Text>
                        <Text style={styles.bullet}>• Firebase Realtime Database — for multiplayer game data</Text>
                    </View>
                    <Text style={styles.paragraph}>
                        These services are provided by Google and are subject to Google's Privacy Policy.
                    </Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>10. CHANGES TO THIS POLICY</Text>
                    <Text style={styles.paragraph}>
                        We may update this Privacy Policy from time to time. We will notify you of significant changes by updating the "Last Updated" date at the top of this policy.
                    </Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>11. CONTACT US</Text>
                    <Text style={styles.paragraph}>
                        If you have questions about this Privacy Policy or your data, contact us at:
                    </Text>
                    <Text style={styles.contactEmail}>theimpostergameonline@gmail.com</Text>
                </View>

                <View style={styles.footer}>
                    <Text style={styles.footerText}>★ IMPOSTER GAME ★</Text>
                </View>
            </ScrollView>
        </View>
    );
}

function getStyles(theme) {
    return StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: Platform.OS === 'ios' ? 55 : 40,
        paddingBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.primary + '30',
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: theme.colors.surface,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: theme.colors.primary + '50',
    },
    backText: {
        color: theme.colors.primary,
        fontSize: 26,
        fontFamily: 'CabinetGrotesk-Black',
        marginTop: -2,
    },
    headerCenter: {
        flex: 1,
        alignItems: 'center',
    },
    badge: {
        backgroundColor: theme.colors.primary,
        paddingHorizontal: 14,
        paddingVertical: 5,
        borderRadius: 4,
    },
    badgeText: {
        color: theme.colors.secondary,
        fontSize: 11,
        fontFamily: 'Panchang-Bold',
        letterSpacing: 2,
    },
    scrollView: {
        flex: 1,
    },
    content: {
        padding: 20,
        paddingBottom: 40,
    },
    lastUpdated: {
        color: theme.colors.textMuted,
        fontSize: 12,
        fontFamily: 'Teko-Medium',
        textAlign: 'center',
        marginBottom: 16,
        letterSpacing: 1,
    },
    intro: {
        color: theme.colors.textSecondary,
        fontSize: 14,
        fontFamily: 'Teko-Medium',
        lineHeight: 20,
        marginBottom: 20,
        textAlign: 'center',
    },
    section: {
        backgroundColor: theme.colors.surface,
        borderRadius: 10,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: theme.colors.primary + '20',
    },
    sectionTitle: {
        color: theme.colors.primary,
        fontSize: 13,
        fontFamily: 'Panchang-Bold',
        letterSpacing: 1,
        marginBottom: 10,
    },
    paragraph: {
        color: theme.colors.text,
        fontSize: 14,
        fontFamily: 'Teko-Medium',
        lineHeight: 20,
        marginBottom: 8,
    },
    bulletList: {
        marginLeft: 4,
        marginBottom: 8,
    },
    bullet: {
        color: theme.colors.textSecondary,
        fontSize: 13,
        fontFamily: 'Teko-Medium',
        lineHeight: 20,
        marginBottom: 4,
    },
    contactEmail: {
        color: theme.colors.primary,
        fontSize: 15,
        fontFamily: 'Panchang-Bold',
        textAlign: 'center',
        marginTop: 8,
    },
    footer: {
        alignItems: 'center',
        marginTop: 20,
        paddingTop: 16,
        borderTopWidth: 1,
        borderTopColor: theme.colors.primary + '20',
    },
    footerText: {
        color: theme.colors.textMuted,
        fontSize: 11,
        fontFamily: 'Panchang-Bold',
        letterSpacing: 3,
        opacity: 0.5,
    },
});
}
