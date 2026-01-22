import { ref, push, serverTimestamp } from 'firebase/database';
import { database } from './firebase';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const MAX_LOGS = 10; // Keep local logs small

export const reportError = async (category, error, context = {}) => {
    try {
        console.log(`🚨 ErrorReporter: Reporting ${category} error...`);

        // 1. Get User ID if available (pushed from context often, but we can try getting from storage if missing)
        let userId = context.userId;
        if (!userId) {
            try {
                const userJson = await AsyncStorage.getItem('user_profile');
                if (userJson) {
                    userId = JSON.parse(userJson).id;
                }
            } catch (e) {
                userId = 'anonymous';
            }
        }

        // 2. Construct Log Object
        const logEntry = {
            timestamp: serverTimestamp(),
            category: category,
            message: error.message || String(error),
            stack: error.stack || null,
            platform: Platform.OS,
            version: Platform.Version,
            context: {
                ...context,
                userId: userId || 'unknown'
            }
        };

        // 3. Push to Firebase
        // Path: debug_logs/{date}/{category}/{logId}
        const dateStr = new Date().toISOString().split('T')[0];
        const logsRef = ref(database, `debug_logs/${dateStr}/${category}`);

        await push(logsRef, logEntry);
        console.log('🚨 ErrorReporter: ✅ Error reported to Firebase');

    } catch (reportErr) {
        // Failsafe: Don't crash because reporting failed
        console.error('🚨 ErrorReporter: ❌ Failed to report error', reportErr);
    }
};
