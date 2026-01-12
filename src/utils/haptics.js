import * as Haptics from 'expo-haptics';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Haptic feedback utility
 * Uses expo-haptics for high-quality, granular feedback on both iOS and Android.
 */

const SETTINGS_STORAGE_KEY = '@imposter_game_settings';

// Cache for haptics enabled state
let hapticsEnabledCache = true;

// Load haptics setting from storage
const loadHapticsSetting = async () => {
    try {
        const savedSettings = await AsyncStorage.getItem(SETTINGS_STORAGE_KEY);
        if (savedSettings) {
            const parsed = JSON.parse(savedSettings);
            hapticsEnabledCache = parsed.hapticsEnabled !== false;
        }
    } catch (error) {
        // Default to enabled
        hapticsEnabledCache = true;
    }
};

// Initialize on module load
loadHapticsSetting();

// Update cache when settings change (call this from SettingsContext)
export const updateHapticsEnabled = (enabled) => {
    hapticsEnabledCache = enabled;
};

export const playHaptic = async (type = 'light') => {
    // Check if haptics are enabled
    if (!hapticsEnabledCache) return;
    
    try {
        switch (type) {
            case 'light':
                await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                break;
            case 'medium':
                await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                break;
            case 'heavy':
                await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
                break;
            case 'success':
                await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
                break;
            case 'error':
                await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
                break;
            default:
                await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
    } catch (error) {
        // Haptics might fail on some devices or if unsupported, just ignore.
        console.log('Haptics not supported or failed', error);
    }
};
