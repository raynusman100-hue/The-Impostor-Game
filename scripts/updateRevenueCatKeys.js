const admin = require('firebase-admin');
const serviceAccount = require('../imposter-game-e5f12-firebase-adminsdk-fbsvc-eccb71e756.json');

// Get keys from command line arguments
const appleKey = process.argv[2];
const googleKey = process.argv[3];

if (!appleKey && !googleKey) {
    console.error('Usage: node updateRevenueCatKeys.js <apple_key> [google_key]');
    process.exit(1);
}

// Initialize Firebase Admin
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: "https://imposter-game-e5f12-default-rtdb.firebaseio.com" // Inferring URL, might need to check
    });
}

const db = admin.database();

async function updateKeys() {
    try {
        console.log('Updating RevenueCat keys in Firebase...');
        const updates = {};

        if (appleKey) updates['config/revenueCatKeys/apple'] = appleKey;
        if (googleKey) updates['config/revenueCatKeys/google'] = googleKey;

        await db.ref().update(updates);
        console.log('✅ Successfully updated RevenueCat keys in Firebase!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error updating keys:', error);
        process.exit(1);
    }
}

updateKeys();
