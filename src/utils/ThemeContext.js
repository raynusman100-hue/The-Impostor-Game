import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getThemeById } from './themes';

// Default to Kodak Daylight (light theme)
const DEFAULT_THEME_ID = 'kodak-daylight';

const ThemeContext = createContext();
const THEME_STORAGE_KEY = '@imposter_game_theme';

export const ThemeProvider = ({ children }) => {
    const [currentTheme, setCurrentTheme] = useState(getThemeById(DEFAULT_THEME_ID));

    // Load theme on mount
    useEffect(() => {
        const loadTheme = async () => {
            try {
                const savedThemeId = await AsyncStorage.getItem(THEME_STORAGE_KEY);
                if (savedThemeId) {
                    const theme = getThemeById(savedThemeId);
                    if (theme) setCurrentTheme(theme);
                }
            } catch (error) {
                console.error('Failed to load theme:', error);
            }
        };
        loadTheme();
    }, []);

    const changeTheme = async (themeId) => {
        const newTheme = getThemeById(themeId);
        if (newTheme) {
            setCurrentTheme(newTheme);
            try {
                await AsyncStorage.setItem(THEME_STORAGE_KEY, themeId);
            } catch (error) {
                console.error('Failed to save theme:', error);
            }
        }
    };

    return (
        <ThemeContext.Provider value={{ theme: currentTheme, changeTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
