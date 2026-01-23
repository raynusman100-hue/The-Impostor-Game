const { initializeApp } = require("firebase/app");
const { getDatabase, ref, set } = require("firebase/database");

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

// YOUR ACCOUNTS (from Agora Console)
// NOTE: All accounts have certificates DISABLED
const myAccounts = [
    {
        id: "712b822c94dc41d6b4a80caa4b7ad0bc", // OG Account
        name: "Account 1 (OG)",
        status: "active"
    },
    {
        id: "eb3eda0ef15b45b3bb486e96d4e661ce", // New Account 2
        name: "Account 2",
        status: "standby"
    },
    {
        id: "4ed4a4305a4d4159aee9efd2ef4758f6", // impostor
        name: "Account 3 (impostor)",
        status: "standby"
    },
    {
        id: "bda4d8d8080e4ab0a3f40fa683c3d3f6", // New Account 4
        name: "Account 4",
        status: "standby"
    },
    {
        id: "8fd2593a98744c1e947481cc84f339e2", // Imp
        name: "Account 5 (Imp)",
        status: "standby"
    }
];

const main = async () => {
    try {
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('🎤 AGORA ACCOUNT POOL SETUP (AUTO)');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

        console.log('\n📝 Preparing config with 5 accounts (50,000 free min/month)...');
        const configData = {
            accounts: myAccounts,
            currentIndex: 0, // Start with Account 1
            lastRotated: Date.now(),
            rotationHistory: {
                [Date.now()]: 'Initial Auto-Seeding'
            }
        };

        console.log('📤 Uploading to Firebase...');
        await set(ref(database, 'config/agoraAccounts'), configData);

        console.log('\n✅ SUCCESS! Account pool created in Firebase.');
        console.log(`Active: ${myAccounts[0].id}`);
        console.log(`Pool Size: ${myAccounts.length}`);

        process.exit(0);
    } catch (error) {
        console.error('\n❌ ERROR:', error);
        process.exit(1);
    }
};

main();
