import AsyncStorage from '@react-native-async-storage/async-storage';
import { database } from './firebase';
import { ref, get, child } from 'firebase/database';
import { AGORA_APP_ID as HARDCODED_APP_ID } from './constants';

const CACHE_KEY = 'cached_agora_app_id';
const CONFIG_PATH = 'config/agoraAccounts'; // Updated path for the POOL
const FETCH_TIMEOUT_MS = 5000;

/**
 * Fetches the CURRENTLY ACTIVE Agora App ID from the pool.
 * Enhanced for the "Lobby Stamp" strategy.
 */
export const fetchCurrentAgoraAppId = async () => {
    let remoteId = null;

    // 1. Try fetching from Firebase with timeout
    try {
        console.log('📡 RemoteConfig: Fetching App ID from Account Pool...');

        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Firebase fetch timeout')), FETCH_TIMEOUT_MS)
        );

        const dbRef = ref(database);
        const fetchPromise = get(child(dbRef, CONFIG_PATH));

        const snapshot = await Promise.race([fetchPromise, timeoutPromise]);

        if (snapshot.exists()) {
            const data = snapshot.val();
            // Data structure: { accounts: [...], currentIndex: 0 }

            if (data.accounts && typeof data.currentIndex !== 'undefined') {
                const activeAccount = data.accounts[data.currentIndex];
                if (activeAccount && activeAccount.id) {
                    remoteId = activeAccount.id;
                    console.log(`📡 RemoteConfig: ✅ Active Account: [Index ${data.currentIndex}] ${activeAccount.name}`);

                    // Update Cache
                    AsyncStorage.setItem(CACHE_KEY, remoteId).catch(console.error);
                    return remoteId;
                }
            }
        }

        console.log('📡 RemoteConfig: ⚠️ Pool structure not found or invalid');
    } catch (error) {
        console.warn('📡 RemoteConfig: ⚠️ Fetch failed:', error.message);
    }

    // 2. Fallback to Cache
    try {
        const cachedId = await AsyncStorage.getItem(CACHE_KEY);
        if (cachedId) {
            console.log('📡 RemoteConfig: ℹ️ Using Cached ID:', cachedId);
            return cachedId;
        }
    } catch (e) {
        console.error('📡 RemoteConfig: Cache read error', e);
    }

    // 3. Ultimate Fallback
    console.log('📡 RemoteConfig: ⚠️ Using Hardcoded Fallback ID');
    return HARDCODED_APP_ID;
};

/**
 * Fetches the list of Premium Emails from Firebase.
 * Returns an array of strings. Defaults to empty array if fetch fails.
 * Path: config/premiumEmails
 */
export const fetchPremiumEmails = async () => {
    try {
        console.log('📡 RemoteConfig: Fetching Premium Emails...');

        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('Firebase fetch timeout')), FETCH_TIMEOUT_MS)
        );

        const dbRef = ref(database);
        const fetchPromise = get(child(dbRef, 'config/premiumEmails'));

        const snapshot = await Promise.race([fetchPromise, timeoutPromise]);

        if (snapshot.exists()) {
            const data = snapshot.val();
            // Data should be an array of strings: ["email1@gmail.com", "email2@gmail.com"]
            if (Array.isArray(data)) {
                console.log(`📡 RemoteConfig: ✅ Fetched ${data.length} premium emails`);
                return data;
            } else if (typeof data === 'object') {
                // Handle case where Firebase stores array as object with index keys
                const emails = Object.values(data);
                console.log(`📡 RemoteConfig: ✅ Fetched ${emails.length} premium emails (from object)`);
                return emails;
            }
        }
    } catch (error) {
        console.warn('📡 RemoteConfig: ⚠️ Premium fetch failed:', error.message);
    }

    return []; // Fail safe: Return empty array -> No free premium
};

// Backward compatibility alias (if used elsewhere)
export const fetchAgoraAppId = fetchCurrentAgoraAppId; 
