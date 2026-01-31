import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useTheme } from '../utils/ThemeContext';
import Button from '../components/Button';

export default function WhoStartsScreen({ route, navigation }) {
    const { theme } = useTheme();
    const styles = getStyles(theme);
    const { players, language } = route.params;
    const [startPlayer, setStartPlayer] = useState(null);

    useEffect(() => {
        // Randomly pick a player
        if (players && players.length > 0) {
            const randomPlayer = players[Math.floor(Math.random() * players.length)];
            setStartPlayer(randomPlayer);
        }
    }, []);

    const handleBegin = () => {
        const timeLeft = players.length * 60; // 1 minute per player
        navigation.replace('Discussion', { players, language, timeLeft });
    };

    if (!startPlayer) return null;

    return (
        <LinearGradient style={styles.container} colors={theme.colors.backgroundGradient}>
            <View style={styles.content}>
                <Text style={styles.title}>THE GAME BEGINS WITH</Text>

                <View style={{ alignItems: 'center' }}>

                    <Text style={styles.playerName}>{startPlayer.name.toUpperCase()}</Text>
                </View>
            </View>

            <View style={styles.footer}>
                <Button
                    title="BEGIN DISCUSSION"
                    onPress={handleBegin}
                    style={styles.button}
                    textStyle={styles.buttonText}
                />
            </View>
        </LinearGradient>
    );
}

function getStyles(theme) {
    return StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
        padding: theme.spacing.l,
        justifyContent: 'space-between',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    title: {
        fontSize: 48,
        color: theme.colors.tertiary, // Synchronized silver
        fontFamily: theme.fonts.header,
        letterSpacing: 4,
        marginBottom: theme.spacing.xl,
        textAlign: 'center',
        ...theme.textShadows.softDepth,
    },
    playerRole: {
        fontSize: theme.fontSize.large,
        color: theme.colors.textSecondary,
        fontFamily: theme.fonts.medium,
        letterSpacing: 2,
        marginBottom: theme.spacing.s,
    },
    playerName: {
        fontSize: 72,
        color: theme.colors.tertiary, // Synchronized silver
        fontFamily: theme.fonts.header,
        textAlign: 'center',
        letterSpacing: 2,
        ...theme.textShadows.depth,
    },
    footer: {
        paddingBottom: theme.spacing.xl,
    },
    button: {
        width: '100%',
    },
    buttonText: {
        fontSize: 32,
        letterSpacing: 4,
    }
});
}
