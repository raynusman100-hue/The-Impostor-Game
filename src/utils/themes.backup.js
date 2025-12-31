// BACKUP - Retro Pop Theme (Dark theme with navy background and bright accents)
// Saved on 2025-12-29
// To restore: copy this theme object back to themes.js

export const retroPopThemeBackup = {
    id: 'retro-pop',
    name: 'Retro Pop',
    colors: {
        background: '#1a1a2e',
        backgroundGradient: ['#1a1a2e', '#16213e'],
        surface: '#0f3460',
        primary: '#e94560',
        secondary: '#f9a826',
        accent: '#00adb5',
        text: '#eaeaea',
        textSecondary: '#c4c4c4',
        textMuted: '#888888',
        error: '#ff4757',
        success: '#2ed573',
        cardCover: '#e94560',
        cardRevealed: '#eaeaea',
    },
    borderRadius: {
        s: 8,
        m: 12,
        l: 16,
        pill: 25,
    },
    spacing: {
        xs: 4,
        s: 8,
        m: 16,
        l: 24,
        xl: 32,
        xxl: 48,
    },
    fontSize: {
        small: 12,
        medium: 16,
        large: 20,
        xlarge: 32,
        xxlarge: 48,
    },
    fonts: {
        regular: 'System',
        medium: 'Teko-Medium',
        bold: 'Panchang-Bold',
        header: 'CabinetGrotesk-Black',
    },
    textShadows: {
        depth: {
            textShadowColor: 'rgba(0, 0, 0, 0.6)',
            textShadowOffset: { width: 2, height: 2 },
            textShadowRadius: 4,
        },
        softDepth: {
            textShadowColor: 'rgba(0, 0, 0, 0.4)',
            textShadowOffset: { width: 1, height: 1 },
            textShadowRadius: 2,
        }
    },
    shadows: {
        none: {
            elevation: 0,
            shadowOpacity: 0,
        },
        soft: {
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.5,
            shadowRadius: 4.65,
            elevation: 8,
        },
        medium: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.3,
            shadowRadius: 8,
            elevation: 4,
        },
    },
};
