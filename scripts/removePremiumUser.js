const { initializeApp } = require("firebase/app");
const { getDatabase, ref, get, set, child } = require("firebase/database");

// CONFIGURATION (Same as other scripts)
const firebaseConfig = {
    apiKey: "AIzaSyCD7K1Yns29LwCCtN67PVy5e-AW3gG5A30",
    authDomain: "imposter-game-e5f12.firebaseapp.com",
    databaseURL: "https://imposter-game-e5f12-default-rtdb.firebaseio.com",
    projectId: "imposter-game-e5f12",
    storageBucket: "imposter-game-e5f12.firebasestorage.app",
    messagingSenderId: "831244408092",
    appId: "1:831244408092:web:36f1197484debe8937d6d9"
};

const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

const TARGET_EMAIL = "raynusman100@gmail.com";

const main = async () => {
    try {
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('🚮 REMOVING PREMIUM USER');
        console.log('Target:', TARGET_EMAIL);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

        const dbRef = ref(database);
        const snapshot = await get(child(dbRef, 'config/premiumEmails'));

        if (snapshot.exists()) {
            let emails = snapshot.val();
            // Normalize to array
            if (!Array.isArray(emails)) {
                emails = Object.values(emails);
            }

            console.log(`Found ${emails.length} premium emails.`);

            if (emails.includes(TARGET_EMAIL)) {
                const newList = emails.filter(e => e !== TARGET_EMAIL);
                await set(ref(database, 'config/premiumEmails'), newList);
                console.log('✅ SUCCESS! User removed.');
                console.log('New list:', newList);
            } else {
                console.log('⚠️ User was NOT found in the premium list.');
                console.log('Current list:', emails);
            }
        } else {
            console.log('⚠️ No premium emails configuration found in Firebase.');
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ ERROR:', error);
        process.exit(1);
    }
};

main();
