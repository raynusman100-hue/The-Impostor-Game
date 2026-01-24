import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, ScrollView, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../utils/ThemeContext';
import Button from '../components/Button';

export default function HowToPlayScreen({ navigation }) {
    const { theme } = useTheme();
    const styles = getStyles(theme);
    const fadeAnim = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(fadeAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
        }).start();
    }, []);

    return (
        <LinearGradient
            colors={theme.colors.backgroundGradient}
            style={styles.container}
        >
            <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
                <ScrollView
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    <Text style={styles.title}>
                        HOW TO PLAY
                    </Text>
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>
                            GAME OVERVIEW
                        </Text>
                        <Text style={[styles.text, { color: theme.colors.text }]}>
                            Impostor is a social deduction game where players try to identify the impostor among them.
                            Most players are Citizens who know a secret word, while one player is the Impostor who doesn't know it.
                        </Text>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>
                            SETUP
                        </Text>
                        <Text style={[styles.text, { color: theme.colors.text }]}>
                            • Choose the number of players (3-10 recommended){'\n'}
                            • Select a category for the secret word{'\n'}
                            • Enable hints if desired for easier gameplay{'\n'}
                            • Pass the device around for each player to see their role
                        </Text>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>
                            GAMEPLAY
                        </Text>
                        <Text style={[styles.text, { color: theme.colors.text }]}>
                            1. Each player secretly views their role card{'\n'}
                            2. Citizens see the secret word, Impostor sees only the category{'\n'}
                            3. Players discuss and ask questions about the word{'\n'}
                            4. The Impostor tries to blend in without revealing they don't know the word{'\n'}
                            5. After discussion, vote to eliminate the suspected Impostor
                        </Text>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>
                            WINNING
                        </Text>
                        <Text style={[styles.text, { color: theme.colors.text }]}>
                            • Citizens win if they correctly identify and vote out the Impostor{'\n'}
                            • Impostor wins if they avoid detection or correctly guess the secret word
                        </Text>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>
                            WIFI MODE
                        </Text>
                        <Text style={[styles.text, { color: theme.colors.text }]}>
                            • Play with friends nearby!{'\n'}
                            • Requires an active Internet Connection{'\n'}
                            • One player Hosts, others Join
                        </Text>
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>
                            TIPS
                        </Text>
                        <Text style={[styles.text, { color: theme.colors.text }]}>
                            • Ask specific questions about the word{'\n'}
                            • Pay attention to vague or evasive answers{'\n'}
                            • The Impostor should listen carefully and try to blend in{'\n'}
                            • Use hints wisely - they help everyone, including the Impostor
                        </Text>
                    </View>
                </ScrollView>

                <View style={styles.buttonContainer}>
                    <Button
                        title="GOT IT!"
                        onPress={() => navigation.goBack()}
                        style={styles.backButton}
                    />
                </View>
            </Animated.View>
        </LinearGradient>
    );
}

function getStyles(theme) {
    return StyleSheet.create({
        container: {
            flex: 1,
        },
        content: {
            flex: 1,
            paddingTop: 80,
            paddingHorizontal: 20,
            paddingBottom: 20,
        },
        title: {
            fontSize: 48,
            fontFamily: 'BespokeStencil-Extrabold',
            letterSpacing: 2,
            textAlign: 'center',
            marginBottom: 30,
            textTransform: 'uppercase',
            color: theme.colors.tertiary, // Synchronized silver
        },
        scrollView: {
            flex: 1,
        },
        scrollContent: {
            paddingBottom: 20,
        },
        section: {
            marginBottom: 24,
            backgroundColor: theme.colors.surface,
            padding: 20,
            borderRadius: 16,
            borderWidth: 1,
            borderColor: theme.colors.textSecondary,
        },
        sectionTitle: {
            fontSize: 24,
            fontFamily: 'BespokeStencil-Extrabold',
            letterSpacing: 1,
            marginBottom: 12,
            textTransform: 'uppercase',
            color: theme.colors.tertiary, // Synchronized silver
        },
        text: {
            fontSize: 16,
            fontFamily: theme.fonts.medium,
            lineHeight: 24,
            letterSpacing: 0.5,
        },
        buttonContainer: {
            paddingTop: 20,
            alignItems: 'center',
        },
        backButton: {
            minWidth: 200,
        },
    });
}