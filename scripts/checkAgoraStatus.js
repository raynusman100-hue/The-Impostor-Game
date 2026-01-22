const { initializeApp } = require("firebase/app");
const { getDatabase, ref, get, child } = require("firebase/database");

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
        console.log('🔎 Checking Firebase Status...');
        const dbRef = ref(database);
        const snapshot = await get(child(dbRef, CONFIG_PATH));

        if (snapshot.exists()) {
            const data = snapshot.val();
            const accounts = data.accounts || [];
            const idx = data.currentIndex;

            console.log(`\n📊 STATUS:`);
            console.log(`   Current Index: ${idx}`);
            if (accounts[idx]) {
                console.log(`   Active Account: ${accounts[idx].name}`);
                console.log(`   Active ID:      ${accounts[idx].id}`);
            } else {
                console.log(`   ⚠️ Active Account is UNDEFINED at index ${idx}`);
            }
        } else {
            console.log('❌ No config found!');
        }
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
};

main();
