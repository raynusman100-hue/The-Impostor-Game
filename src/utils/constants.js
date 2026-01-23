// Global Constants - Agora Rotation Pool
// These are fallback IDs if Firebase fetch fails
// The app will fetch the current active ID from Firebase rotation pool
// NOTE: All accounts have certificates DISABLED (no token complexity)

export const AGORA_POOL_ACCOUNTS = [
    {
        id: '712b822c94dc41d6b4a80caa4b7ad0bc', // OG Account
        name: 'Account 1 (OG)',
    },
    {
        id: 'eb3eda0ef15b45b3bb486e96d4e661ce', // New Account 2
        name: 'Account 2',
    },
    {
        id: '4ed4a4305a4d4159aee9efd2ef4758f6', // impostor
        name: 'Account 3 (impostor)',
    },
    {
        id: 'bda4d8d8080e4ab0a3f40fa683c3d3f6', // New Account 4
        name: 'Account 4',
    },
    {
        id: '8fd2593a98744c1e947481cc84f339e2', // Imp
        name: 'Account 5 (Imp)',
    }
];

// Fallback to first account (OG) if Firebase is unavailable
export const AGORA_APP_ID = AGORA_POOL_ACCOUNTS[0].id; 
