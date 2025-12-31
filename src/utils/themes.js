// Multiple theme definitions for the game
// Kodak-inspired cinematic themes

export const ALL_THEMES = [
    {
        id: 'kodak-daylight',
        name: 'Kodak Daylight',
        colors: {
            // Warm cream/beige base like vintage Kodak film packaging
            background: '#F5F0E6',
            backgroundGradient: ['#F5F0E6', '#EDE5D8', '#E8DFD0'],
            surface: '#FFFDF8',
            // Kodak yellow/amber as primary
            primary: '#FFB800',
            secondary: '#1a1a1a',
            tertiary: '#D4A000',
            accent: '#FFB800',
            // Dark text for readability
            text: '#1a1a1a',
            textSecondary: '#4a4a4a',
            textMuted: '#8a8a8a',
            error: '#D32F2F',
            success: '#388E3C',
            // Card colors
            cardCover: '#FFB800',
            cardRevealed: '#1a1a1a',
        },
        borderRadius: {
            s: 8,
            m: 12,
            l: 16,
            xl: 20,
            pill: 30,
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
                textShadowColor: 'rgba(0, 0, 0, 0.15)',
                textShadowOffset: { width: 1, height: 2 },
                textShadowRadius: 3,
            },
            softDepth: {
                textShadowColor: 'rgba(0, 0, 0, 0.1)',
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
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 4,
                elevation: 3,
            },
            medium: {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.15,
                shadowRadius: 8,
                elevation: 6,
            },
        },
    },
    {
        id: 'kodak-cinema',
        name: 'Kodak Cinema',
        colors: {
            // Deep cinematic black
            background: '#0a0a0a',
            backgroundGradient: ['#1a1a1a', '#0d0d0d', '#000000'],
            surface: '#1a1a1a',
            // Kodak amber/gold as primary
            primary: '#FFB800',
            secondary: '#2a2a2a',
            tertiary: '#FFB800',
            accent: '#FFB800',
            // Light text for dark mode
            text: '#ffffff',
            textSecondary: 'rgba(255, 255, 255, 0.7)',
            textMuted: 'rgba(255, 255, 255, 0.4)',
            error: '#ff3b30',
            success: '#4cd964',
            // Card colors
            cardCover: '#FFB800',
            cardRevealed: '#0a0a0a',
        },
        borderRadius: {
            s: 8,
            m: 12,
            l: 16,
            xl: 20,
            pill: 30,
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
                textShadowColor: '#FFB800',
                textShadowOffset: { width: 0, height: 0 },
                textShadowRadius: 15,
            },
            softDepth: {
                textShadowColor: 'rgba(255, 184, 0, 0.3)',
                textShadowOffset: { width: 0, height: 0 },
                textShadowRadius: 8,
            }
        },
        shadows: {
            none: {
                elevation: 0,
                shadowOpacity: 0,
            },
            soft: {
                shadowColor: "#FFB800",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.2,
                shadowRadius: 6,
                elevation: 4,
            },
            medium: {
                shadowColor: '#FFB800',
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.3,
                shadowRadius: 12,
                elevation: 8,
            },
        },
    },
];

// Get theme by ID
export const getThemeById = (themeId) => {
    return ALL_THEMES.find(theme => theme.id === themeId) || ALL_THEMES[0];
};

// Default export is the first theme (Kodak Daylight)
export default ALL_THEMES[0];

// For backward compatibility - map old names to new themes
export const sunsetCoralTheme = ALL_THEMES[0];
export const retroPopTheme = ALL_THEMES[1];
