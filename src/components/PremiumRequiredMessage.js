import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../utils/ThemeContext';
import { playHaptic } from '../utils/haptics';

/**
 * PremiumRequiredMessage Component
 * 
 * Displays premium requirement messages with different content for hosts vs players.
 * Includes upgrade call-to-action for hosts and applies consistent Kodak film aesthetic.
 * 
 * @param {Object} props
 * @param {string} props.message - Custom message to display (optional)
 * @param {boolean} props.isHost - Whether the current user is the host
 * @param {Function} props.onUpgrade - Callback for upgrade button press (required for hosts)
 * @param {'host'|'player'|'lobby'|'discussion'} props.type - Message type for different contexts
 * @param {Object} props.style - Additional container styling
 * @param {boolean} props.compact - Whether to use compact layout
 */
export default function PremiumRequiredMessage({ 
    message, 
    isHost = false, 
    onUpgrade, 
    type = 'player',
    style,
    compact = false
}) {
    const { theme } = useTheme();
    const styles = getStyles(theme, compact);

    // Default messages based on type and role
    const getDefaultMessage = () => {
        if (message) return message;
        
        if (isHost) {
            switch (type) {
                case 'host':
                    return 'Voice chat requires premium. Upgrade to enable voice chat for all players.';
                case 'lobby':
                    return 'Voice chat is locked. Upgrade to premium to enable it for all players.';
                case 'discussion':
                    return 'Voice chat unavailable. Premium required.';
                default:
                    return 'Voice chat requires premium to enable for your room.';
            }
        } else {
            switch (type) {
                case 'player':
                    return 'Voice chat requires the host to have premium.';
                case 'lobby':
                    return 'Voice chat is locked. The host needs premium to enable it.';
                case 'discussion':
                    return 'Voice chat unavailable - host needs premium.';
                default:
                    return 'Voice chat requires the host to have premium.';
            }
        }
    };

    const handleUpgradePress = () => {
        if (!onUpgrade) return;
        playHaptic('medium');
        onUpgrade();
    };

    const displayMessage = getDefaultMessage();

    return (
        <View style={[styles.container, style]}>
            {/* Premium Lock Icon */}
            <View style={styles.iconContainer}>
                <Ionicons 
                    name="lock-closed" 
                    size={compact ? 20 : 24} 
                    color={theme.colors.primary} 
                />
                <View style={styles.crownIcon}>
                    <Text style={styles.crownEmoji}>👑</Text>
                </View>
            </View>

            {/* Message Text */}
            <Text style={styles.messageText}>
                {displayMessage}
            </Text>

            {/* Upgrade Button for Hosts */}
            {isHost && onUpgrade && (
                <TouchableOpacity
                    style={styles.upgradeButton}
                    onPress={handleUpgradePress}
                    activeOpacity={0.8}
                >
                    <Ionicons 
                        name="arrow-up-circle" 
                        size={16} 
                        color={theme.colors.secondary} 
                        style={styles.upgradeIcon}
                    />
                    <Text style={styles.upgradeText}>
                        UPGRADE TO PREMIUM
                    </Text>
                </TouchableOpacity>
            )}

            {/* Decorative Film Perforations */}
            {!compact && (
                <>
                    <View style={styles.filmLeft}>
                        {[...Array(3)].map((_, i) => (
                            <View key={i} style={styles.filmHole} />
                        ))}
                    </View>
                    <View style={styles.filmRight}>
                        {[...Array(3)].map((_, i) => (
                            <View key={i} style={styles.filmHole} />
                        ))}
                    </View>
                </>
            )}
        </View>
    );
}

function getStyles(theme, compact) {
    return StyleSheet.create({
        container: {
            backgroundColor: theme.colors.surface,
            borderRadius: compact ? 12 : 16,
            padding: compact ? 16 : 20,
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 2,
            borderColor: theme.colors.primary + '40',
            position: 'relative',
            minHeight: compact ? 80 : 120,
            ...theme.shadows.soft,
        },
        iconContainer: {
            position: 'relative',
            marginBottom: compact ? 8 : 12,
            alignItems: 'center',
            justifyContent: 'center',
        },
        crownIcon: {
            position: 'absolute',
            top: -8,
            right: -8,
            backgroundColor: theme.colors.primary,
            borderRadius: 10,
            width: 20,
            height: 20,
            alignItems: 'center',
            justifyContent: 'center',
        },
        crownEmoji: {
            fontSize: 10,
        },
        messageText: {
            fontSize: compact ? 13 : 14,
            fontFamily: 'CabinetGrotesk-Bold',
            color: theme.colors.text,
            textAlign: 'center',
            lineHeight: compact ? 18 : 20,
            marginBottom: compact ? 12 : 16,
            letterSpacing: 0.5,
            maxWidth: '90%',
        },
        upgradeButton: {
            backgroundColor: theme.colors.primary,
            paddingHorizontal: compact ? 16 : 20,
            paddingVertical: compact ? 8 : 10,
            borderRadius: compact ? 20 : 24,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            ...theme.shadows.soft,
        },
        upgradeIcon: {
            marginRight: 2,
        },
        upgradeText: {
            fontSize: compact ? 11 : 12,
            fontFamily: 'Panchang-Bold',
            color: theme.colors.secondary,
            letterSpacing: compact ? 1.5 : 2,
        },
        // Film perforation decorations
        filmLeft: {
            position: 'absolute',
            left: 4,
            top: 0,
            bottom: 0,
            justifyContent: 'space-evenly',
            alignItems: 'center',
            paddingVertical: 20,
        },
        filmRight: {
            position: 'absolute',
            right: 4,
            top: 0,
            bottom: 0,
            justifyContent: 'space-evenly',
            alignItems: 'center',
            paddingVertical: 20,
        },
        filmHole: {
            width: 6,
            height: 8,
            borderRadius: 1,
            backgroundColor: theme.colors.primary,
            opacity: 0.2,
        },
    });
}