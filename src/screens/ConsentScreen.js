import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Platform, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../utils/ThemeContext';
import { playHaptic } from '../utils/haptics';

export default function ConsentScreen({ onAccept }) {
    const { theme } = useTheme();
    const styles = getStyles(theme);
    const [activeTab, setActiveTab] = useState('privacy'); // 'privacy' or 'terms'
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const slideAnim = useRef(new Animated.Value(30)).current;

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
            Animated.spring(slideAnim, { toValue: 0, friction: 10, tension: 50, useNativeDriver: true }),
        ]).start();
    }, []);

    const handleAccept = () => {
        playHaptic('medium');
        onAccept();
    };

    return (
        <View style={styles.container}>
            <LinearGradient colors={['#0a0a0a', '#1a1a1a', '#0a0a0a']} style={StyleSheet.absoluteFillObject} />
            
            <Animated.View style={[styles.content, { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }]}>
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.welcomeText}>WELCOME TO</Text>
                    <Text style={styles.titleText}>IMPOSTOR GAME</Text>
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>FIRST TIME SETUP</Text>
                    </View>
                </View>

                {/* Tab Selector */}
                <View style={styles.tabContainer}>
                    <TouchableOpacity 
                        style={[styles.tab, activeTab === 'privacy' && styles.activeTab]}
                        onPress={() => { playHaptic('light'); setActiveTab('privacy'); }}
                    >
                        <Text style={[styles.tabText, activeTab === 'privacy' && styles.activeTabText]}>
                            PRIVACY POLICY
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={[styles.tab, activeTab === 'terms' && styles.activeTab]}
                        onPress={() => { playHaptic('light'); setActiveTab('terms'); }}
                    >
                        <Text style={[styles.tabText, activeTab === 'terms' && styles.activeTabText]}>
                            TERMS OF SERVICE
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Scrollable Content */}
                <ScrollView 
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {activeTab === 'privacy' ? (
                        <PrivacyContent theme={theme} styles={styles} />
                    ) : (
                        <TermsContent theme={theme} styles={styles} />
                    )}
                </ScrollView>

                {/* Accept Button */}
                <View style={styles.footer}>
                    <Text style={styles.footerNote}>
                        By tapping "I Accept", you agree to our Privacy Policy and Terms of Service
                    </Text>
                    <TouchableOpacity style={styles.acceptButton} onPress={handleAccept} activeOpacity={0.8}>
                        <Text style={styles.acceptButtonText}>I ACCEPT</Text>
                    </TouchableOpacity>
                </View>
            </Animated.View>
        </View>
    );
}


function PrivacyContent({ theme, styles }) {
    return (
        <>
            <Text style={styles.lastUpdated}>Last Updated: January 2026</Text>
            
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>INFORMATION WE COLLECT</Text>
                <Text style={styles.paragraph}>
                    When you create an account, we collect your email address, username, and avatar selection. During gameplay, we temporarily process game session data and chat messages.
                </Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>HOW WE USE YOUR DATA</Text>
                <Text style={styles.paragraph}>
                    We use your data to create and manage your account, display your profile to other players, and enable multiplayer sessions. We do NOT use your data for advertising.
                </Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>DATA SHARING</Text>
                <Text style={styles.paragraph}>
                    Your username and avatar are visible to other players in game sessions. We do NOT sell or share your email with third parties.
                </Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>YOUR RIGHTS</Text>
                <Text style={styles.paragraph}>
                    You can delete your account and all data at any time from Profile → Delete Account, or by contacting theimpostergameonline@gmail.com
                </Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>DEVICE PERMISSIONS</Text>
                <Text style={styles.paragraph}>
                    Camera is used to scan QR codes for joining games. Microphone is used for voice messages in chat. These are only used for their stated purposes.
                </Text>
            </View>
        </>
    );
}

function TermsContent({ theme, styles }) {
    return (
        <>
            <Text style={styles.lastUpdated}>Last Updated: January 2026</Text>
            
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>ACCEPTANCE OF TERMS</Text>
                <Text style={styles.paragraph}>
                    By using Imposter Game, you agree to be bound by these Terms of Service. If you do not agree, do not use the app.
                </Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>USER ACCOUNTS</Text>
                <Text style={styles.paragraph}>
                    You must be at least 13 years old to create an account. You are responsible for maintaining account security and providing accurate information.
                </Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>USER CONDUCT</Text>
                <Text style={styles.paragraph}>
                    Do not use offensive usernames, harass other players, attempt to hack or exploit the game, or use the app for illegal purposes.
                </Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>FAIR PLAY</Text>
                <Text style={styles.paragraph}>
                    Imposter Game is meant to be fun! We encourage fair play and good sportsmanship. Cheating ruins the experience for everyone.
                </Text>
            </View>

            <View style={styles.section}>
                <Text style={styles.sectionTitle}>DISCLAIMER</Text>
                <Text style={styles.paragraph}>
                    Imposter Game is provided "as is" without warranties. We reserve the right to suspend accounts that violate these terms.
                </Text>
            </View>
        </>
    );
}

function getStyles(theme) {
    return StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0a0a0a',
    },
    content: {
        flex: 1,
        paddingTop: Platform.OS === 'ios' ? 60 : 45,
    },
    header: {
        alignItems: 'center',
        paddingHorizontal: 20,
        marginBottom: 20,
    },
    welcomeText: {
        color: '#888',
        fontSize: 14,
        fontFamily: 'Teko-Medium',
        letterSpacing: 4,
    },
    titleText: {
        color: '#FFB800',
        fontSize: 32,
        fontFamily: 'BespokeStencil-Extrabold',
        letterSpacing: 2,
        marginTop: 4,
    },
    badge: {
        backgroundColor: '#FFB800',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 4,
        marginTop: 12,
    },
    badgeText: {
        color: '#0a0a0a',
        fontSize: 9,
        fontFamily: 'Panchang-Bold',
        letterSpacing: 2,
    },
    tabContainer: {
        flexDirection: 'row',
        marginHorizontal: 20,
        marginBottom: 16,
        backgroundColor: '#1a1a1a',
        borderRadius: 8,
        padding: 4,
    },
    tab: {
        flex: 1,
        paddingVertical: 10,
        alignItems: 'center',
        borderRadius: 6,
    },
    activeTab: {
        backgroundColor: '#FFB800',
    },
    tabText: {
        color: '#888',
        fontSize: 10,
        fontFamily: 'Panchang-Bold',
        letterSpacing: 1,
    },
    activeTabText: {
        color: '#0a0a0a',
    },
    scrollView: {
        flex: 1,
        marginHorizontal: 20,
    },
    scrollContent: {
        paddingBottom: 20,
    },
    lastUpdated: {
        color: '#666',
        fontSize: 11,
        fontFamily: 'Teko-Medium',
        textAlign: 'center',
        marginBottom: 16,
        letterSpacing: 1,
    },
    section: {
        backgroundColor: '#151515',
        borderRadius: 10,
        padding: 14,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: '#FFB80020',
    },
    sectionTitle: {
        color: '#FFB800',
        fontSize: 11,
        fontFamily: 'Panchang-Bold',
        letterSpacing: 1,
        marginBottom: 8,
    },
    paragraph: {
        color: '#ccc',
        fontSize: 13,
        fontFamily: 'Teko-Medium',
        lineHeight: 19,
    },
    footer: {
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: Platform.OS === 'ios' ? 40 : 25,
        borderTopWidth: 1,
        borderTopColor: '#FFB80020',
        backgroundColor: '#0a0a0a',
    },
    footerNote: {
        color: '#666',
        fontSize: 11,
        fontFamily: 'Teko-Medium',
        textAlign: 'center',
        marginBottom: 14,
        lineHeight: 16,
    },
    acceptButton: {
        backgroundColor: '#FFB800',
        paddingVertical: 16,
        borderRadius: 30,
        alignItems: 'center',
    },
    acceptButtonText: {
        color: '#0a0a0a',
        fontSize: 14,
        fontFamily: 'CabinetGrotesk-Black',
        letterSpacing: 3,
    },
});
}
