// Agora Voice Chat Configuration
// IMPORTANT: Make sure in your Agora Console:
// 1. Go to Project Management > Your Project > Edit
// 2. Under "App certificate", select "No certificate" for testing
//    OR generate tokens server-side for production
// 3. Enable "Primary Certificate" is DISABLED for App ID only auth

export const AGORA_APP_ID = 'a1e24bb78f9e4369a60476b4896c838d';

// Channel name will be based on room code for multiplayer games
export const getChannelName = (roomCode) => `imposter_${roomCode}`;
