const admin = require('firebase-admin');
const serviceAccount = require('../imposter-game-e5f12-firebase-adminsdk-fbsvc-eccb71e756.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://imposter-game-e5f12-default-rtdb.firebaseio.com"
});

const database = admin.database();
const TARGET_EMAIL = "raynusman100@gmail.com";

const main = async () => {
    try {
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('💎 ADDING PREMIUM USER (ADMIN SDK)');
        console.log('Target:', TARGET_EMAIL);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

        const ref = database.ref('config/premiumEmails');
        const snapshot = await ref.once('value');
        let emails = [];

        if (snapshot.exists()) {
            const val = snapshot.val();
            // Normalize to array
            if (Array.isArray(val)) {
                emails = val;
            } else if (typeof val === 'object') {
                emails = Object.values(val);
            }
            console.log(`Found ${emails.length} existing premium emails.`);
        } else {
            console.log('⚠️ No existing premium emails configuration found. Creating new list.');
        }

        if (emails.includes(TARGET_EMAIL)) {
            console.log('✅ User is ALREADY in the premium list.');
        } else {
            emails.push(TARGET_EMAIL);
            await ref.set(emails);
            console.log('✅ SUCCESS! User added to premium list via Admin SDK.');
        }
        console.log('Current list:', emails);

        process.exit(0);
    } catch (error) {
        console.error('❌ ERROR:', error);
        process.exit(1);
    }
};

main();
