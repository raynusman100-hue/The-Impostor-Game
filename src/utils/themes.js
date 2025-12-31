// Multiple theme definitions for the game
// Each theme has a unique visual identity

export const ALL_THEMES = [
    {
        id: 'sunset-coral',
        name: 'Sunset Coral',
        colors: {
            background: '#FFF5E4',
            backgroundGradient: ['#FFF5E4', '#FFE4D6', '#FFD1DC'],
            surface: '#FFE4D6',
            primary: '#FF6B6B',
            secondary: '#4ECDC4',
            tertiary: '#FF8E72',
            accent: '#FF6B6B',
            text: '#2C3E50',
            textSecondary: '#34495E',
            textMuted: '#7F8C8D',
            error: '#E74C3C',
            success: '#2ECC71',
            cardCover: '#FF6B6B',
            cardRevealed: '#2C3E50',
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
                textShadowColor: 'rgba(0, 0, 0, 0.3)',
                textShadowOffset: { width: 2, height: 2 },
                textShadowRadius: 4,
            },
            softDepth: {
                textShadowColor: 'rgba(0, 0, 0, 0.2)',
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
                shadowOpacity: 0.3,
                shadowRadius: 4.65,
                elevation: 8,
            },
            medium: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.2,
                shadowRadius: 8,
                elevation: 4,
            },
        },
    },
    {
        id: 'retro-pop',
        name: 'Midnight',
        colors: {
            background: '#000000',
            backgroundGradient: ['#000000', '#121212'],
            surface: '#1a1a1a',
            primary: '#E0E0E0',
            secondary: '#333333',
            tertiary: '#E0E0E0',
            accent: '#E0E0E0',
            text: '#ffffff',
            textSecondary: '#cccccc',
            textMuted: '#666666',
            error: '#ff3b30',
            success: '#4cd964',
            cardCover: '#ffffff',
            cardRevealed: '#000000',
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
                textShadowColor: 'rgba(255, 255, 255, 0.4)',
                textShadowOffset: { width: 1, height: 1 },
                textShadowRadius: 2,
            },
            softDepth: {
                textShadowColor: 'rgba(255, 255, 255, 0.2)',
                textShadowOffset: { width: 1, height: 1 },
                textShadowRadius: 1,
            }
        },
        shadows: {
            none: {
                elevation: 0,
                shadowOpacity: 0,
            },
            soft: {
                shadowColor: "#fff",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.2,
                shadowRadius: 4,
                elevation: 4,
            },
            medium: {
                shadowColor: '#fff',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 8,
            },
        },
    },
];

// Get theme by ID
export const getThemeById = (themeId) => {
    return ALL_THEMES.find(theme => theme.id === themeId) || ALL_THEMES[0];
};

// Default export is the first theme (Sunset Coral)
export default ALL_THEMES[0];

// For backward compatibility
export const sunsetCoralTheme = ALL_THEMES[0];
export const retroPopTheme = ALL_THEMES[1];
