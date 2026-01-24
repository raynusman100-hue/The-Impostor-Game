import AsyncStorage from '@react-native-async-storage/async-storage';
import { ref, get, set } from 'firebase/database';
import { database } from './firebase';

// Avatar property options
const FACE_SHAPES = ['round', 'oval', 'square', 'heart', 'long'];
const SKIN_COLORS = ['#FFDBB4', '#EDB98A', '#D08B5B', '#AE5D29', '#614335', '#F5D0C5'];
const EYE_STYLES = ['normal', 'happy', 'sleepy', 'wink', 'big', 'small', 'angry', 'cute'];
const MOUTH_STYLES = ['smile', 'grin', 'neutral', 'open', 'smirk', 'sad', 'kiss', 'teeth'];
const HAIR_STYLES = ['none', 'short', 'spiky', 'curly', 'wavy', 'long', 'ponytail', 'mohawk', 'buzz', 'cap', 'beanie'];
const HAIR_COLORS = ['#1a1a1a', '#4A3728', '#8B4513', '#D4A574', '#FFD700', '#FF6B6B', '#9B59B6', '#3498DB'];
const ACCESSORIES = ['none', 'glasses', 'sunglasses', 'roundGlasses', 'eyepatch', 'bandana', 'earrings', 'headphones'];
const BG_COLORS = ['#FFB800', '#FF6B6B', '#4ECDC4', '#9B59B6', '#3498DB', '#2ECC71', '#E74C3C', '#1a1a1a'];

// Generate random avatar configuration
export const generateRandomAvatarConfig = () => {
    return {
        faceShape: FACE_SHAPES[Math.floor(Math.random() * FACE_SHAPES.length)],
        skinColor: SKIN_COLORS[Math.floor(Math.random() * SKIN_COLORS.length)],
        eyeStyle: EYE_STYLES[Math.floor(Math.random() * EYE_STYLES.length)],
        mouthStyle: MOUTH_STYLES[Math.floor(Math.random() * MOUTH_STYLES.length)],
        hairStyle: HAIR_STYLES[Math.floor(Math.random() * HAIR_STYLES.length)],
        hairColor: HAIR_COLORS[Math.floor(Math.random() * HAIR_COLORS.length)],
        accessory: ACCESSORIES[Math.floor(Math.random() * ACCESSORIES.length)],
        bgColor: BG_COLORS[Math.floor(Math.random() * BG_COLORS.length)],
    };
};

// Check if two avatars are visually distinct
const isVisuallyDistinct = (config1, config2) => {
    const keys = ['faceShape', 'eyeStyle', 'mouthStyle', 'hairStyle', 'accessory'];
    let differences = 0;
    for (const key of keys) {
        if (config1[key] !== config2[key]) differences++;
    }
    return differences >= 3;
};

// Generate set of visually distinct avatars
export const generateUniqueAvatarSet = (count) => {
    const avatars = [];
    let attempts = 0;
    const maxAttempts = count * 50;

    while (avatars.length < count && attempts < maxAttempts) {
        const newAvatar = generateRandomAvatarConfig();
        const isDistinct = avatars.every(existing => isVisuallyDistinct(newAvatar, existing));
        if (isDistinct) {
            avatars.push(newAvatar);
        }
        attempts++;
    }

    while (avatars.length < count) {
        avatars.push(generateRandomAvatarConfig());
    }

    return avatars;
};

// Validate avatar configuration
const isValidAvatarConfig = (config) => {
    if (!config || typeof config !== 'object') return false;
    return (
        FACE_SHAPES.includes(config.faceShape) &&
        SKIN_COLORS.includes(config.skinColor) &&
        EYE_STYLES.includes(config.eyeStyle) &&
        MOUTH_STYLES.includes(config.mouthStyle) &&
        HAIR_STYLES.includes(config.hairStyle) &&
        HAIR_COLORS.includes(config.hairColor) &&
        ACCESSORIES.includes(config.accessory) &&
        BG_COLORS.includes(config.bgColor)
    );
};

// Validate wheel state
const isValidWheelState = (state) => {
    if (!state || typeof state !== 'object') return false;
    if (!Array.isArray(state.avatars) || state.avatars.length !== 12) return false;
    if (!Array.isArray(state.lockedSlots) || state.lockedSlots.length !== 12) return false;
    if (typeof state.selectedIndex !== 'number' || state.selectedIndex < 0 || state.selectedIndex > 11) return false;
    
    for (const config of state.avatars) {
        if (!isValidAvatarConfig(config)) return false;
    }
    
    for (const locked of state.lockedSlots) {
        if (typeof locked !== 'boolean') return false;
    }
    
    return true;
};

// WheelStateManager class
export default class WheelStateManager {
    constructor(initialState = null) {
        if (initialState && isValidWheelState(initialState)) {
            this.state = initialState;
        } else {
            this.state = this.createDefaultState();
        }
        this.userId = null;
        this.saveCallback = null;
    }

    createDefaultState() {
        return {
            avatars: generateUniqueAvatarSet(12),
            lockedSlots: Array(12).fill(false),
            selectedIndex: 0,
            version: 1,
        };
    }

    getState() {
        return { ...this.state };
    }

    setUserId(userId) {
        this.userId = userId;
    }

    setSaveCallback(callback) {
        this.saveCallback = callback;
    }

    setSelectedIndex(index) {
        if (index >= 0 && index < 12) {
            this.state.selectedIndex = index;
            this._triggerSave();
        }
    }

    regenerateSlot(index) {
        if (index < 0 || index >= 12) return false;
        if (this.state.lockedSlots[index]) return false;

        this.state.avatars[index] = generateRandomAvatarConfig();
        this._triggerSave();
        return true;
    }

    toggleLock(index) {
        if (index < 0 || index >= 12) return;
        this.state.lockedSlots[index] = !this.state.lockedSlots[index];
        this._triggerSave();
    }

    updateSlotConfig(index, config) {
        if (index < 0 || index >= 12) return;
        if (!isValidAvatarConfig(config)) return;

        this.state.avatars[index] = config;
        this.state.lockedSlots[index] = true;
        this._triggerSave();
    }

    randomizeAll() {
        let count = 0;
        for (let i = 0; i < 12; i++) {
            if (!this.state.lockedSlots[i]) {
                this.state.avatars[i] = generateRandomAvatarConfig();
                count++;
            }
        }
        this._triggerSave();
        return count;
    }

    async save() {
        const stateToSave = {
            avatars: this.state.avatars,
            lockedSlots: this.state.lockedSlots,
            selectedIndex: this.state.selectedIndex,
            version: this.state.version,
        };

        try {
            await AsyncStorage.setItem('wheel_state', JSON.stringify(stateToSave));
        } catch (error) {
            console.error('Failed to save wheel state to AsyncStorage:', error);
        }

        if (this.userId) {
            try {
                const userRef = ref(database, `users/${this.userId}/wheelState`);
                await set(userRef, stateToSave);
            } catch (error) {
                console.error('Failed to save wheel state to Firebase:', error);
            }
        }
    }

    static async load(userId = null) {
        let loadedState = null;

        if (userId) {
            try {
                const userRef = ref(database, `users/${userId}/wheelState`);
                const snapshot = await get(userRef);
                if (snapshot.exists()) {
                    loadedState = snapshot.val();
                }
            } catch (error) {
                console.error('Failed to load wheel state from Firebase:', error);
            }
        }

        if (!loadedState) {
            try {
                const stored = await AsyncStorage.getItem('wheel_state');
                if (stored) {
                    loadedState = JSON.parse(stored);
                }
            } catch (error) {
                console.error('Failed to load wheel state from AsyncStorage:', error);
            }
        }

        if (loadedState && isValidWheelState(loadedState)) {
            return loadedState;
        }

        return null;
    }

    _triggerSave() {
        if (this.saveCallback) {
            this.saveCallback(this.state);
        }
    }
}
