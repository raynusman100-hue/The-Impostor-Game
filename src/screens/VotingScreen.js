import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTheme } from '../utils/ThemeContext';
import Button from '../components/Button';

export default function VotingScreen({ route, navigation }) {
    const { theme } = useTheme();
    const styles = getStyles(theme);
    const { players, language } = route.params;

    const handleVote = (selectedPlayer) => {
        navigation.replace('Result', { eliminatedPlayer: selectedPlayer, players: players, language });
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>VOTING TIME</Text>
                <Text style={styles.subtitle}>WHO IS THE IMPOSTOR?</Text>
            </View>

            <ScrollView
                style={styles.list}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
            >
                {players.map((p, i) => (
                    <View key={i} style={styles.playerCard}>
                        <Button
                            title={`${p.name}`}
                            onPress={() => handleVote(p)}
                            variant="secondary"
                            textStyle={styles.playerButtonText}
                        />
                    </View>
                ))}

                <View style={styles.skipContainer}>
                    <Button
                        title="SKIP VOTE"
                        onPress={() => handleVote(null)}
                        variant="secondary"
                        style={styles.skipBtn}
                    />
                </View>
            </ScrollView>
        </View>
    );
}

const getStyles = (theme) => StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 60,
        paddingHorizontal: theme.spacing.l,
        backgroundColor: theme.colors.background,
    },
    header: {
        alignItems: 'center',
        marginBottom: theme.spacing.xl,
    },
    title: {
        fontSize: 72,
        color: theme.colors.text,
        fontFamily: theme.fonts.header,
        textAlign: 'center',
        letterSpacing: 2,
    },
    subtitle: {
        fontSize: theme.fontSize.large,
        color: theme.colors.textSecondary,
        textAlign: 'center',
        marginTop: theme.spacing.s,
        letterSpacing: 4,
        fontFamily: theme.fonts.medium,
        textTransform: 'uppercase',
    },
    list: {
        flex: 1,
    },
    listContent: {
        paddingBottom: 40,
    },
    playerCard: {
        marginBottom: theme.spacing.m,
    },
    playerButtonText: {
        fontSize: theme.fontSize.large,
        fontFamily: theme.fonts.medium,
        letterSpacing: 2,
    },
    skipContainer: {
        marginTop: theme.spacing.l,
        paddingBottom: theme.spacing.xl,
    },
    skipBtn: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: theme.colors.textMuted,
    },
});
