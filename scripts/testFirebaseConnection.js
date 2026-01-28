// scripts/testFirebaseConnection.js
// Run with: node scripts/testFirebaseConnection.js

// Import Firebase (using the same SDK version as the app)
const { initializeApp } = require("firebase/app");
const { getDatabase, ref, get, child } = require("firebase/database");

// The config from src/utils/firebase.js
// NOTE: I am using the API Key from firebase.js to verify IF IT WORKS.
const firebaseConfig = {
    apiKey: "AIzaSyCD7K1Yns29LwCCtN67PVy5e-AW3gG5A30",
    authDomain: "imposter-game-e5f12.firebaseapp.com",
    databaseURL: "https://imposter-game-e5f12-default-rtdb.firebaseio.com",
    projectId: "imposter-game-e5f12",
    storageBucket: "imposter-game-e5f12.firebasestorage.app",
    messagingSenderId: "831244408092",
    appId: "1:831244408092:web:36f1197484debe8937d6d9",
    measurementId: "G-P1WE2053W6"
};

console.log("🔍 Testing Firebase Connection...");
console.log(`📡 URL: ${firebaseConfig.databaseURL}`);

try {
    const app = initializeApp(firebaseConfig);
    const db = getDatabase(app);
    const dbRef = ref(db);

    console.log("🔄 Attempting to read 'config/agoraAccounts'...");

    get(child(dbRef, 'config/agoraAccounts'))
        .then((snapshot) => {
            if (snapshot.exists()) {
                console.log("✅ SUCCESS! Data found:");
                console.log(JSON.stringify(snapshot.val(), null, 2));
            } else {
                console.log("✅ SUCCESS! Connected, but 'config/agoraAccounts' is empty/null.");
            }
            process.exit(0);
        })
        .catch((error) => {
            console.error("❌ FAILURE! Could not read database.");
            console.error("🚫 Error Code:", error.code);
            console.error("🚫 Message:", error.message);
            console.log("\n⚠️ DIAGNOSIS:");
            if (error.code === 'PERMISSION_DENIED') {
                console.log("❌ RULES ISSUE: The database blocked the read request.");
                console.log("   -> Verify you clicked 'Publish' in the Firebase Console.");
                console.log("   -> Verify the rules allow read access to 'config'.");
            } else if (error.code === 'NETWORK_ERROR') {
                console.log("❌ NETWORK ISSUE: Could not reach Firebase.");
            } else {
                console.log("❌ CONFIG/OTHER ISSUE: Check API Key or Project status.");
            }
            process.exit(1);
        });

} catch (e) {
    console.error("❌ CRITICAL SETUP ERROR:", e.message);
}
