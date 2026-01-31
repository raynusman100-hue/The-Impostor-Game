import { initializeApp } from "firebase/app";
import { getDatabase } from "firebase/database";
import { getFirestore } from "firebase/firestore";
import { initializeAuth, getReactNativePersistence, getAuth, browserLocalPersistence } from "firebase/auth";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Configuration updated with your real project credentials
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

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const database = getDatabase(app);
export const db = getFirestore(app);

// Use different persistence for web vs native
let auth;
if (Platform.OS === 'web') {
    auth = initializeAuth(app, {
        persistence: browserLocalPersistence
    });
} else {
    auth = initializeAuth(app, {
        persistence: getReactNativePersistence(AsyncStorage)
    });
}
export { auth };
