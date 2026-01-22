import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../utils/ThemeContext';
import { playHaptic } from '../utils/haptics';

export default function TermsOfServiceScreen({ navigation }) {
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
                        <Text style={styles.badgeText}>TERMS OF SERVICE</Text>
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
                    By using Imposter Game, you agree to these Terms of Service. Please read them carefully.
                </Text>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>1. ACCEPTANCE OF TERMS</Text>
                    <Text style={styles.paragraph}>
                        By downloading, installing, or using Imposter Game, you agree to be bound by these Terms of Service. If you do not agree, do not use the app.
                    </Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>2. DESCRIPTION OF SERVICE</Text>
                    <Text style={styles.paragraph}>
                        Imposter Game is a social deduction party game where players try to identify the "imposter" among them. The game can be played locally (pass-and-play) or via WiFi multiplayer.
                    </Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>3. USER ACCOUNTS</Text>
                    <View style={styles.bulletList}>
                        <Text style={styles.bullet}>• You must be at least 13 years old to create an account</Text>
                        <Text style={styles.bullet}>• You are responsible for maintaining the security of your account</Text>
                        <Text style={styles.bullet}>• You must provide accurate information when creating an account</Text>
                        <Text style={styles.bullet}>• One account per person is allowed</Text>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>4. USER CONDUCT</Text>
                    <Text style={styles.paragraph}>
                        You agree NOT to:
                    </Text>
                    <View style={styles.bulletList}>
                        <Text style={styles.bullet}>• Use offensive, inappropriate, or misleading usernames</Text>
                        <Text style={styles.bullet}>• Harass, bully, or abuse other players</Text>
                        <Text style={styles.bullet}>• Attempt to hack, exploit, or disrupt the game or servers</Text>
                        <Text style={styles.bullet}>• Use the app for any illegal purpose</Text>
                        <Text style={styles.bullet}>• Impersonate other users or entities</Text>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>5. INTELLECTUAL PROPERTY</Text>
                    <Text style={styles.paragraph}>
                        All content in Imposter Game, including graphics, designs, text, and code, is owned by us and protected by copyright laws. You may not copy, modify, or distribute any part of the app without permission.
                    </Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>6. GAME RULES & FAIR PLAY</Text>
                    <Text style={styles.paragraph}>
                        Imposter Game is meant to be fun! We encourage fair play and good sportsmanship. Cheating or exploiting bugs ruins the experience for everyone.
                    </Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>7. ACCOUNT TERMINATION</Text>
                    <Text style={styles.paragraph}>
                        We reserve the right to suspend or terminate accounts that violate these terms. You may delete your account at any time from the Profile screen.
                    </Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>8. DISCLAIMER OF WARRANTIES</Text>
                    <Text style={styles.paragraph}>
                        Imposter Game is provided "as is" without warranties of any kind. We do not guarantee the app will be error-free or uninterrupted.
                    </Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>9. LIMITATION OF LIABILITY</Text>
                    <Text style={styles.paragraph}>
                        To the maximum extent permitted by law, we shall not be liable for any indirect, incidental, or consequential damages arising from your use of the app.
                    </Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>10. CHANGES TO TERMS</Text>
                    <Text style={styles.paragraph}>
                        We may update these Terms from time to time. Continued use of the app after changes constitutes acceptance of the new terms.
                    </Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>11. CONTACT</Text>
                    <Text style={styles.paragraph}>
                        For questions about these Terms, contact us at:
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
        fontSize: 10,
        fontFamily: 'Panchang-Bold',
        letterSpacing: 1,
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
