import { ref, get, update, onValue } from 'firebase/database';
import { database } from './firebase';

/**
 * Retry a Firebase operation with exponential backoff
 */
export const retryFirebaseOperation = async (operation, maxRetries = 3, baseDelay = 1000) => {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
            return await operation();
        } catch (error) {
            console.log(`Firebase operation attempt ${attempt} failed:`, error.message);
            
            if (attempt === maxRetries) {
                throw error;
            }
            
            // Exponential backoff with jitter
            const delay = baseDelay * Math.pow(2, attempt - 1) + Math.random() * 1000;
            await new Promise(resolve => setTimeout(resolve, delay));
        }
    }
};

/**
 * Check if a room exists and is accessible
 */
export const verifyRoomAccess = async (roomCode) => {
    try {
        const roomRef = ref(database, `rooms/${roomCode}`);
        const snapshot = await get(roomRef);
        return {
            exists: snapshot.exists(),
            data: snapshot.val()
        };
    } catch (error) {
        console.error('Room verification error:', error);
        return { exists: false, data: null, error };
    }
};

/**
 * Safely update Firebase with retry logic
 */
export const safeFirebaseUpdate = async (path, updates, maxRetries = 3) => {
    return retryFirebaseOperation(async () => {
        const updateRef = typeof path === 'string' ? ref(database, path) : path;
        await update(updateRef, updates);
        console.log('Firebase update successful:', Object.keys(updates));
    }, maxRetries);
};

/**
 * Update host premium status in Firebase
 */
export const updateHostPremiumStatus = async (roomCode, hasPremium) => {
    return safeFirebaseUpdate(`rooms/${roomCode}`, { hostHasPremium: hasPremium });
};

/**
 * Update Firebase host premium status with comprehensive error handling and logging
 * This function provides enhanced debugging capabilities for premium status updates
 */
export const updateFirebaseHostPremium = async (roomCode, hasPremium) => {
    console.log(`[updateFirebaseHostPremium] Starting update for room ${roomCode}, premium: ${hasPremium}`);
    
    try {
        // Validate inputs
        if (!roomCode || typeof roomCode !== 'string') {
            throw new Error('Invalid room code provided');
        }
        
        if (typeof hasPremium !== 'boolean') {
            throw new Error('Premium status must be a boolean value');
        }
        
        // Perform the Firebase update with retry logic
        await safeFirebaseUpdate(`rooms/${roomCode}`, { hostHasPremium: hasPremium });
        
        console.log(`[updateFirebaseHostPremium] Successfully updated room ${roomCode} with premium status: ${hasPremium}`);
        return { success: true, roomCode, hasPremium };
        
    } catch (error) {
        console.error(`[updateFirebaseHostPremium] Failed to update room ${roomCode}:`, {
            error: error.message,
            roomCode,
            hasPremium,
            timestamp: new Date().toISOString()
        });
        
        // Re-throw the error for upstream handling
        throw new Error(`Firebase premium update failed for room ${roomCode}: ${error.message}`);
    }
};

/**
 * Monitor connection status and provide callbacks
 */
export const createConnectionMonitor = (onConnected, onDisconnected) => {
    const connectedRef = ref(database, '.info/connected');
    let isConnected = false;
    
    const unsubscribe = onValue(connectedRef, (snapshot) => {
        const connected = snapshot.val() === true;
        
        if (connected && !isConnected) {
            isConnected = true;
            onConnected?.();
        } else if (!connected && isConnected) {
            isConnected = false;
            onDisconnected?.();
        }
    });
    
    return unsubscribe;
};