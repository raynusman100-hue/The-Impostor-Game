import React from 'react';
import { View, StyleSheet } from 'react-native';
import { CustomBuiltAvatar } from '../components/CustomAvatarBuilder';

/**
 * Generates a cinematic/Kodak themed avatar based on an ID (1-12)
 * Each avatar represents a film/cinema character or element
 * @param {number} id - Avatar ID (1-12)
 * @param {number} size - Size in pixels
 * @param {object} customConfig - Optional custom avatar configuration
 */
export const CustomAvatar = ({ id, size = 100, customConfig }) => {
    // If custom config is provided, render the custom avatar
    if (customConfig) {
        return <CustomBuiltAvatar config={customConfig} size={size} />;
    }

    // Normalize ID to 1-12
    const avatarId = Math.max(1, Math.min(12, id || 1));

    // Kodak/Cinema color palette
    const KODAK_AMBER = '#FFB800';
    const KODAK_DARK = '#1a1a1a';
    const FILM_BLACK = '#0a0a0a';
    const CREAM = '#F5F0E6';
    const WARM_WHITE = '#FFF8E7';
    const FILM_RED = '#C41E3A';
    const SPOTLIGHT_YELLOW = '#FFD700';
    const VINTAGE_BROWN = '#8B4513';
    const SILVER = '#C0C0C0';
    const TEAL = '#008080';
    const PURPLE = '#6B3FA0';

    // Avatar configurations: [bgColor, accentColor, type] - 12 avatars
    const avatarConfigs = [
        [KODAK_AMBER, KODAK_DARK, 'director'],      // 1: Director with beret
        [FILM_BLACK, KODAK_AMBER, 'filmReel'],      // 2: Film reel
        [KODAK_DARK, WARM_WHITE, 'clapperboard'],   // 3: Clapperboard
        [CREAM, KODAK_AMBER, 'camera'],             // 4: Vintage camera
        [FILM_RED, WARM_WHITE, 'star'],             // 5: Hollywood star
        [FILM_BLACK, FILM_RED, 'popcorn'],          // 6: Popcorn bucket
        [PURPLE, SPOTLIGHT_YELLOW, 'oscar'],        // 7: Oscar statue
        [TEAL, WARM_WHITE, 'mask'],                 // 8: Theater masks
        [SILVER, KODAK_DARK, 'filmStrip'],          // 9: Film strip
        [FILM_BLACK, SILVER, 'microphone'],         // 10: Vintage microphone
        [KODAK_AMBER, FILM_BLACK, 'megaphone'],     // 11: Director's megaphone
        [VINTAGE_BROWN, KODAK_AMBER, 'trophy'],     // 12: Film trophy
    ];

    const [bgColor, accentColor, type] = avatarConfigs[avatarId - 1];

    const styles = StyleSheet.create({
        container: {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: bgColor,
            overflow: 'hidden',
            alignItems: 'center',
            justifyContent: 'center',
            borderWidth: 2,
            borderColor: KODAK_AMBER,
        },
    });

    const renderAvatar = () => {
        const unit = size / 100;

        switch (type) {
            case 'director':
                return (
                    <View style={{ alignItems: 'center' }}>
                        <View style={{ width: unit * 50, height: unit * 20, backgroundColor: accentColor, borderRadius: unit * 25, marginBottom: -unit * 5, transform: [{ rotate: '-10deg' }] }} />
                        <View style={{ width: unit * 40, height: unit * 35, backgroundColor: CREAM, borderRadius: unit * 20 }}>
                            <View style={{ flexDirection: 'row', position: 'absolute', top: unit * 10, left: unit * 3, gap: unit * 4 }}>
                                <View style={{ width: unit * 14, height: unit * 10, backgroundColor: accentColor, borderRadius: unit * 3 }} />
                                <View style={{ width: unit * 14, height: unit * 10, backgroundColor: accentColor, borderRadius: unit * 3 }} />
                            </View>
                        </View>
                    </View>
                );

            case 'filmReel':
                return (
                    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                        <View style={{ width: unit * 60, height: unit * 60, borderRadius: unit * 30, borderWidth: unit * 6, borderColor: accentColor, alignItems: 'center', justifyContent: 'center' }}>
                            <View style={{ width: unit * 20, height: unit * 20, borderRadius: unit * 10, backgroundColor: accentColor }} />
                        </View>
                        {[0, 60, 120, 180, 240, 300].map((angle, i) => (
                            <View key={i} style={{ position: 'absolute', width: unit * 8, height: unit * 8, borderRadius: unit * 4, backgroundColor: accentColor, transform: [{ translateX: Math.cos(angle * Math.PI / 180) * unit * 22 }, { translateY: Math.sin(angle * Math.PI / 180) * unit * 22 }] }} />
                        ))}
                    </View>
                );

            case 'clapperboard':
                return (
                    <View style={{ alignItems: 'center' }}>
                        <View style={{ width: unit * 55, height: unit * 15, backgroundColor: accentColor, borderRadius: unit * 2, transform: [{ rotate: '-5deg' }], marginBottom: -unit * 3 }}>
                            <View style={{ flexDirection: 'row', height: '100%', overflow: 'hidden', borderRadius: unit * 2 }}>
                                {[0, 1, 2, 3, 4].map(i => (<View key={i} style={{ width: unit * 11, backgroundColor: i % 2 === 0 ? accentColor : bgColor }} />))}
                            </View>
                        </View>
                        <View style={{ width: unit * 55, height: unit * 35, backgroundColor: accentColor, borderRadius: unit * 3 }} />
                    </View>
                );

            case 'camera':
                return (
                    <View style={{ alignItems: 'center' }}>
                        <View style={{ width: unit * 50, height: unit * 35, backgroundColor: KODAK_DARK, borderRadius: unit * 5, alignItems: 'center', justifyContent: 'center' }}>
                            <View style={{ width: unit * 25, height: unit * 25, borderRadius: unit * 12.5, backgroundColor: '#333', borderWidth: unit * 3, borderColor: accentColor, alignItems: 'center', justifyContent: 'center' }}>
                                <View style={{ width: unit * 10, height: unit * 10, borderRadius: unit * 5, backgroundColor: '#1a1a1a' }} />
                            </View>
                        </View>
                        <View style={{ position: 'absolute', top: unit * 5, right: unit * 22, width: unit * 12, height: unit * 8, backgroundColor: accentColor, borderRadius: unit * 2 }} />
                    </View>
                );

            case 'star':
                return (
                    <View style={{ alignItems: 'center', justifyContent: 'center' }}>
                        <View style={{ width: 0, height: 0, borderLeftWidth: unit * 25, borderRightWidth: unit * 25, borderBottomWidth: unit * 40, borderLeftColor: 'transparent', borderRightColor: 'transparent', borderBottomColor: accentColor }} />
                        <View style={{ position: 'absolute', width: 0, height: 0, borderLeftWidth: unit * 25, borderRightWidth: unit * 25, borderTopWidth: unit * 40, borderLeftColor: 'transparent', borderRightColor: 'transparent', borderTopColor: accentColor, top: unit * 15 }} />
                    </View>
                );

            case 'filmStrip':
                return (
                    <View style={{ alignItems: 'center' }}>
                        <View style={{ width: unit * 45, height: unit * 55, backgroundColor: accentColor, borderRadius: unit * 3 }}>
                            <View style={{ position: 'absolute', left: unit * 2, top: unit * 5 }}>
                                {[0, 1, 2, 3].map(i => (<View key={i} style={{ width: unit * 6, height: unit * 8, backgroundColor: bgColor, borderRadius: unit * 1, marginBottom: unit * 5 }} />))}
                            </View>
                            <View style={{ position: 'absolute', right: unit * 2, top: unit * 5 }}>
                                {[0, 1, 2, 3].map(i => (<View key={i} style={{ width: unit * 6, height: unit * 8, backgroundColor: bgColor, borderRadius: unit * 1, marginBottom: unit * 5 }} />))}
                            </View>
                            <View style={{ position: 'absolute', left: unit * 10, top: unit * 10, width: unit * 25, height: unit * 35, backgroundColor: KODAK_AMBER, borderRadius: unit * 2 }} />
                        </View>
                    </View>
                );

            case 'megaphone':
                return (
                    <View style={{ alignItems: 'center', transform: [{ rotate: '-20deg' }] }}>
                        <View style={{ width: 0, height: 0, borderLeftWidth: unit * 30, borderRightWidth: unit * 30, borderBottomWidth: unit * 45, borderLeftColor: 'transparent', borderRightColor: 'transparent', borderBottomColor: accentColor, borderRadius: unit * 5 }} />
                        <View style={{ width: unit * 15, height: unit * 12, backgroundColor: VINTAGE_BROWN, borderRadius: unit * 3, marginTop: -unit * 2 }} />
                    </View>
                );

            case 'popcorn':
                return (
                    <View style={{ alignItems: 'center' }}>
                        <View style={{ flexDirection: 'row', marginBottom: -unit * 8 }}>
                            {[0, 1, 2].map(i => (<View key={i} style={{ width: unit * 12, height: unit * 12, borderRadius: unit * 6, backgroundColor: CREAM, marginHorizontal: unit * 1 }} />))}
                        </View>
                        <View style={{ width: unit * 40, height: unit * 35, backgroundColor: accentColor, borderTopLeftRadius: unit * 5, borderTopRightRadius: unit * 5, borderBottomLeftRadius: unit * 10, borderBottomRightRadius: unit * 10 }}>
                            <View style={{ position: 'absolute', left: unit * 8, top: 0, bottom: 0, width: unit * 6, backgroundColor: WARM_WHITE }} />
                            <View style={{ position: 'absolute', right: unit * 8, top: 0, bottom: 0, width: unit * 6, backgroundColor: WARM_WHITE }} />
                        </View>
                    </View>
                );

            case 'oscar': // Oscar statue
                return (
                    <View style={{ alignItems: 'center' }}>
                        {/* Head */}
                        <View style={{ width: unit * 16, height: unit * 16, borderRadius: unit * 8, backgroundColor: accentColor, marginBottom: -unit * 2 }} />
                        {/* Body */}
                        <View style={{ width: unit * 20, height: unit * 35, backgroundColor: accentColor, borderRadius: unit * 3 }} />
                        {/* Base */}
                        <View style={{ width: unit * 30, height: unit * 8, backgroundColor: accentColor, borderRadius: unit * 2, marginTop: -unit * 2 }} />
                    </View>
                );

            case 'mask': // Theater masks
                return (
                    <View style={{ flexDirection: 'row', gap: unit * 4 }}>
                        {/* Happy mask */}
                        <View style={{ width: unit * 28, height: unit * 32, backgroundColor: accentColor, borderRadius: unit * 14, alignItems: 'center' }}>
                            <View style={{ flexDirection: 'row', gap: unit * 6, marginTop: unit * 8 }}>
                                <View style={{ width: unit * 5, height: unit * 5, borderRadius: unit * 2.5, backgroundColor: bgColor }} />
                                <View style={{ width: unit * 5, height: unit * 5, borderRadius: unit * 2.5, backgroundColor: bgColor }} />
                            </View>
                            <View style={{ width: unit * 12, height: unit * 6, borderBottomLeftRadius: unit * 6, borderBottomRightRadius: unit * 6, backgroundColor: bgColor, marginTop: unit * 4 }} />
                        </View>
                        {/* Sad mask */}
                        <View style={{ width: unit * 28, height: unit * 32, backgroundColor: accentColor, borderRadius: unit * 14, alignItems: 'center' }}>
                            <View style={{ flexDirection: 'row', gap: unit * 6, marginTop: unit * 8 }}>
                                <View style={{ width: unit * 5, height: unit * 5, borderRadius: unit * 2.5, backgroundColor: bgColor }} />
                                <View style={{ width: unit * 5, height: unit * 5, borderRadius: unit * 2.5, backgroundColor: bgColor }} />
                            </View>
                            <View style={{ width: unit * 12, height: unit * 6, borderTopLeftRadius: unit * 6, borderTopRightRadius: unit * 6, backgroundColor: bgColor, marginTop: unit * 6 }} />
                        </View>
                    </View>
                );

            case 'microphone': // Vintage microphone
                return (
                    <View style={{ alignItems: 'center' }}>
                        {/* Mic head */}
                        <View style={{ width: unit * 35, height: unit * 35, borderRadius: unit * 17.5, backgroundColor: accentColor, borderWidth: unit * 3, borderColor: KODAK_DARK }} />
                        {/* Stand */}
                        <View style={{ width: unit * 8, height: unit * 25, backgroundColor: accentColor, marginTop: -unit * 2 }} />
                        {/* Base */}
                        <View style={{ width: unit * 30, height: unit * 6, backgroundColor: accentColor, borderRadius: unit * 3 }} />
                    </View>
                );

            case 'trophy': // Film trophy/award
                return (
                    <View style={{ alignItems: 'center' }}>
                        {/* Cup */}
                        <View style={{ width: unit * 35, height: unit * 30, backgroundColor: accentColor, borderTopLeftRadius: unit * 17.5, borderTopRightRadius: unit * 17.5, borderBottomLeftRadius: unit * 5, borderBottomRightRadius: unit * 5 }} />
                        {/* Handles */}
                        <View style={{ position: 'absolute', left: unit * 15, top: unit * 5, width: unit * 12, height: unit * 18, borderWidth: unit * 3, borderColor: accentColor, borderRadius: unit * 6, backgroundColor: 'transparent' }} />
                        <View style={{ position: 'absolute', right: unit * 15, top: unit * 5, width: unit * 12, height: unit * 18, borderWidth: unit * 3, borderColor: accentColor, borderRadius: unit * 6, backgroundColor: 'transparent' }} />
                        {/* Stem */}
                        <View style={{ width: unit * 10, height: unit * 12, backgroundColor: accentColor }} />
                        {/* Base */}
                        <View style={{ width: unit * 30, height: unit * 8, backgroundColor: accentColor, borderRadius: unit * 2 }} />
                    </View>
                );

            default:
                return (
                    <View style={{ width: unit * 30, height: unit * 30, borderRadius: unit * 15, backgroundColor: accentColor }} />
                );
        }
    };

    return (
        <View style={styles.container}>
            {renderAvatar()}
        </View>
    );
};

export const TOTAL_AVATARS = 12;

// Re-export custom avatar builder for convenience
export { CustomBuiltAvatar, AvatarBuilder } from '../components/CustomAvatarBuilder';
