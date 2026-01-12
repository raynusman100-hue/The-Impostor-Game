import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { updateHapticsEnabled } from './haptics';

const SETTINGS_STORAGE_KEY = '@imposter_game_settings';

const defaultSettings = {
    // Preferences
    hapticsEnabled: true,
    reducedMotion: false,
};

const SettingsContext = createContext();

export const SettingsProvider = ({ children }) => {
    const [settings, setSettings] = useState(defaultSettings);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const loadSettings = async () => {
            try {
                const saved = await AsyncStorage.getItem(SETTINGS_STORAGE_KEY);
                if (saved) {
                    const parsed = JSON.parse(saved);
                    setSettings({ ...defaultSettings, ...parsed });
                    if (parsed.hapticsEnabled !== undefined) {
                        updateHapticsEnabled(parsed.hapticsEnabled);
                    }
                }
            } catch (e) {
                console.error('Failed to load settings:', e);
            } finally {
                setIsLoaded(true);
            }
        };
        loadSettings();
    }, []);

    const updateSettings = async (newSettings) => {
        const updated = { ...settings, ...newSettings };
        setSettings(updated);
        
        if ('hapticsEnabled' in newSettings) {
            updateHapticsEnabled(newSettings.hapticsEnabled);
        }
        
        try {
            await AsyncStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(updated));
        } catch (e) {
            console.error('Failed to save settings:', e);
        }
    };

    const updateSetting = async (key, value) => {
        await updateSettings({ [key]: value });
    };

    const resetSettings = async () => {
        setSettings(defaultSettings);
        updateHapticsEnabled(true);
        try {
            await AsyncStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(defaultSettings));
        } catch (e) {
            console.error('Failed to reset settings:', e);
        }
    };

    return (
        <SettingsContext.Provider value={{ settings, updateSettings, updateSetting, resetSettings, isLoaded }}>
            {children}
        </SettingsContext.Provider>
    );
};

export const useSettings = () => {
    const context = useContext(SettingsContext);
    if (!context) {
        throw new Error('useSettings must be used within a SettingsProvider');
    }
    return context;
};

export { defaultSettings };
