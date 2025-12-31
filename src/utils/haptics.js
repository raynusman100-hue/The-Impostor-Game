import * as Haptics from 'expo-haptics';

/**
 * Haptic feedback utility
 * Uses expo-haptics for high-quality, granular feedback on both iOS and Android.
 */

export const playHaptic = async (type = 'light') => {
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
