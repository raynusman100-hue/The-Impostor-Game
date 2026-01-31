const { initializeApp } = require("firebase/app");
const { getDatabase, ref, get, child, update } = require("firebase/database");

// CONFIGURATION
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

const CONFIG_PATH = 'config/agoraAccounts';

const main = async () => {
    try {
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('🔄 AGORA ACCOUNT ROTATION TOOL');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

        const dbRef = ref(database);
        const snapshot = await get(child(dbRef, CONFIG_PATH));

        if (!snapshot.exists()) {
            throw new Error("Configuration not found! Run seedAgoraPool.js first.");
        }

        const data = snapshot.val();
        const accounts = data.accounts || [];
        const currentIndex = data.currentIndex || 0;

        if (accounts.length === 0) {
            throw new Error("No accounts in the pool.");
        }

        console.log(`\n📊 Current Status:`);
        console.log(`   Active Account: [${currentIndex}] ${accounts[currentIndex].name}`);
        console.log(`   ID: ${accounts[currentIndex].id}`);

        // CALCULATE NEXT
        const nextIndex = (currentIndex + 1) % accounts.length;
        const nextAccount = accounts[nextIndex];

        console.log(`\n⏭️  Rotating to:`);
        console.log(`   New Account:    [${nextIndex}] ${nextAccount.name}`);
        console.log(`   ID: ${nextAccount.id}`);

        // UPDATE FIREBASE
        const updates = {};
        updates[`${CONFIG_PATH}/currentIndex`] = nextIndex;
        updates[`${CONFIG_PATH}/lastRotated`] = Date.now();
        updates[`${CONFIG_PATH}/status`] = `Rotated to ${nextAccount.name}`;

        await update(ref(database), updates);

        console.log('\n✅ SUCCESS! Rotation complete.');
        console.log('NOTE: New rooms will use this account. Existing rooms stay on the old one.');

        process.exit(0);
    } catch (error) {
        console.error('\n❌ ERROR:', error.message);
        process.exit(1);
    }
};

main();
