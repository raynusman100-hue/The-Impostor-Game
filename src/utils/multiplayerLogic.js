import { database } from './firebase';
import { ref, update, set, get } from 'firebase/database';
import { assignRoles } from './gameLogic';
import { getRandomWord } from './words';
import { translateGameContent } from './translationService';

/**
 * Host starts the game from the lobby
 */
export const startWifiGame = async (roomCode, players, settings) => {
    try {
        const { language, impostorCount = 1, categories = ['all'] } = settings;
        const roomRef = ref(database, `rooms/${roomCode}`);

        // 1. Fetch a random word
        const randomWord = getRandomWord(categories);

        // 2. Handle translation if needed
        let translatedWord = randomWord.word;
        let translatedHint = randomWord.hint;
        let malayalamData = { word: '', hint: '' };

        if (language !== 'en') {
            const translation = await translateGameContent(randomWord.word, randomWord.hint, language);
            translatedWord = translation.translatedWord;
            translatedHint = translation.translatedHint;

            // For backward compatibility with existing assignRoles
            if (language === 'ml') {
                malayalamData = { word: translatedWord, hint: translatedHint };
            }
        }

        // 3. Assign roles
        const assignedPlayers = assignRoles(
            players,
            impostorCount,
            translatedWord,
            translatedHint,
            malayalamData,
            randomWord.word,
            randomWord.hint,
            randomWord.impostorHint // Pass impostor hint (group name)
        );

        // 4. Map back to Firebase structure
        const assignments = {};
        assignedPlayers.forEach((p, index) => {
            assignments[p.id] = {
                ...p,
                ready: false,
                order: index
            };
        });

        // 5. Update room state to trigger navigation on all devices
        await update(roomRef, {
            status: 'reveal',
            gameState: {
                assignments,
                phase: 'reveal',
                startTime: Date.now(),
                duration: players.length * 60,
                isPaused: false,
                imposterCount: impostorCount, // Store impostor count for voting screen
                language: language // Store language for translation globe
            }
        });

        return true;
    } catch (error) {
        console.error("Start Game Error:", error);
        throw error;
    }
};

/**
 * Player sets their ready status after viewing card - ENHANCED WITH IMMEDIATE SYNC
 */
export const setPlayerReady = async (roomCode, playerId) => {
    try {
        console.log(`Setting player ${playerId} ready in room ${roomCode}`);
        
        // ENHANCED: Update with timestamp to force Firebase sync
        const readyRef = ref(database, `rooms/${roomCode}/gameState/assignments/${playerId}`);
        await update(readyRef, {
            ready: true,
            readyAt: Date.now() // Add timestamp to force sync
        });

        console.log(`Player ${playerId} ready status updated with timestamp`);

        // Check if everyone is ready - ENHANCED LOGIC
        const roomRef = ref(database, `rooms/${roomCode}`);
        const snapshot = await get(roomRef);
        if (snapshot.exists()) {
            const data = snapshot.val();
            if (!data.gameState || !data.gameState.assignments) return;

            const assignments = data.gameState.assignments;
            const players = Object.values(assignments);
            const allReady = players.every(p => p.ready === true);
            const readyCount = players.filter(p => p.ready).length;

            console.log(`Ready Check: ${readyCount}/${players.length} ready.`);
            console.log(`Players ready status:`, players.map(p => `${p.name}: ${p.ready}`));

            if (allReady && players.length > 0) {
                console.log("All players ready! Moving to Discussion IMMEDIATELY.");
                
                // IMMEDIATE SYNC: Set flags for instant client detection
                await update(roomRef, {
                    status: 'discussion',
                    'gameState/phase': 'discussion',
                    'gameState/discussionStartTime': Date.now(),
                    'gameState/allPlayersReady': true,  // Sync flag for immediate detection
                    'gameState/forceDiscussion': true,  // Additional sync flag
                    'gameState/lastActionAt': Date.now() // Force sync timestamp
                });
            }
        }
    } catch (error) {
        console.error("Set Ready Error:", error);
        throw error; // Re-throw to handle in UI
    }
};

/**
 * Submit vote in WiFi mode
 */
export const submitWifiVote = async (roomCode, voterId, targetId) => {
    const voteRef = ref(database, `rooms/${roomCode}/gameState/votes/${voterId}`);
    await set(voteRef, targetId);
};

/**
 * Restart Game directly (Skip Lobby)
 */
export const restartWifiGame = async (roomCode, playersJson, settings) => {
    // playersJson is array of players. 
    // We need to re-run startWifiGame logic but with existing players.
    // The previous assignment logic holds. 
    // We just need to call startWifiGame essentially, but ensure we have all players.
    // However, players arg in startWifiGame expects array. 
    // The Result screen reads 'players' from params.

    // settings: language, impostorCount, categories. 
    // We need to fetch previous settings or pass them.
    // For now, let's fetch from room metadata or just defaults? 
    // Actually, ResultScreen doesn't usually carry settings. 
    // We might need to fetch them from `rooms/${roomCode}/settings` if we stored them, or just use defaults.
    // Let's assume standard settings for now or Fetch from DB.

    // Let's try to just call startWifiGame. 
    // But we need to make sure 'players' structure matches.

    return startWifiGame(roomCode, playersJson, settings);
};
