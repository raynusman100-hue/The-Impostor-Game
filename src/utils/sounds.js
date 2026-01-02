import { Audio } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SETTINGS_STORAGE_KEY = '@imposter_game_settings';

let soundsLoaded = false;
let soundEnabled = true;
const sounds = {};

// Load setting from storage
const loadSoundSetting = async () => {
    try {
        const saved = await AsyncStorage.getItem(SETTINGS_STORAGE_KEY);
        if (saved) {
            const parsed = JSON.parse(saved);
            soundEnabled = parsed.soundEnabled !== false;
        }
    } catch (e) {
        soundEnabled = true;
    }
};

loadSoundSetting();

export const updateSoundEnabled = (enabled) => {
    soundEnabled = enabled;
};

// Sound file requires - add files to assets/sounds/
// Download free sounds from https://pixabay.com/sound-effects/
const soundFiles = {
    // Uncomment these lines after adding the sound files:
    // tap: require('../../assets/sounds/tap.mp3'),
    // success: require('../../assets/sounds/success.mp3'),
    // error: require('../../assets/sounds/error.mp3'),
    // reveal: require('../../assets/sounds/reveal.mp3'),
    // timer: require('../../assets/sounds/timer.mp3'),
    // vote: require('../../assets/sounds/vote.mp3'),
};

// Load sounds into memory
export const loadSounds = async () => {
    if (soundsLoaded) return;
    
    try {
        await Audio.setAudioModeAsync({
            playsInSilentModeIOS: true,
            staysActiveInBackground: false,
            shouldDuckAndroid: true,
        });

        for (const [key, file] of Object.entries(soundFiles)) {
            try {
                const { sound } = await Audio.Sound.createAsync(file, { 
                    shouldPlay: false, 
                    volume: 0.6 
                });
                sounds[key] = sound;
            } catch (e) {
                console.log(`Sound load failed: ${key}`);
            }
        }
        
        soundsLoaded = true;
    } catch (e) {
        console.log('Audio init error');
        soundsLoaded = true;
    }
};

// Play a sound by name
export const playSound = async (soundName) => {
    if (!soundEnabled) return;
    if (!soundsLoaded) await loadSounds();
    
    const sound = sounds[soundName];
    if (!sound) return;
    
    try {
        await sound.setPositionAsync(0);
        await sound.playAsync();
    } catch (e) {}
};

// Cleanup
export const unloadSounds = async () => {
    for (const sound of Object.values(sounds)) {
        try { await sound.unloadAsync(); } catch (e) {}
    }
    soundsLoaded = false;
};

// Convenience functions
export const playTap = () => playSound('tap');
export const playSuccess = () => playSound('success');
export const playError = () => playSound('error');
export const playReveal = () => playSound('reveal');
export const playTimer = () => playSound('timer');
export const playVote = () => playSound('vote');
