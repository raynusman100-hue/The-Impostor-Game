import { useEffect } from 'react';
import { database } from './firebase';
import { ref, set, remove, onValue, off } from 'firebase/database';

/**
 * Hook to track and sync voice chat participants to Firebase
 * @param {string} roomCode - The room code
 * @param {string} playerId - The current player's ID
 * @param {object} playerData - Player info (name, avatarId, customAvatarConfig)
 * @param {boolean} isJoined - Whether the player is joined to voice
 * @param {function} onParticipantsChange - Callback with participants list
 */
export const useVoiceParticipantsTracker = (
    roomCode,
    playerId,
    playerData,
    isJoined,
    onParticipantsChange
) => {
    // Sync local voice state to Firebase
    useEffect(() => {
        if (!roomCode || !playerId || !playerData) return;

        const participantRef = ref(database, `rooms/${roomCode}/voiceParticipants/${playerId}`);

        if (isJoined) {
            // Write participant data when joined
            console.log('🎤 VoiceTracker: Adding participant to Firebase:', playerId);
            set(participantRef, {
                name: playerData.name,
                avatarId: playerData.avatarId || 1,
                customAvatarConfig: playerData.customAvatarConfig || null,
                joinedAt: Date.now(),
            }).catch(err => console.error('🎤 VoiceTracker: Failed to add participant:', err));
        } else {
            // Remove participant when left
            console.log('🎤 VoiceTracker: Removing participant from Firebase:', playerId);
            remove(participantRef).catch(err => console.error('🎤 VoiceTracker: Failed to remove participant:', err));
        }

        // Cleanup on unmount
        return () => {
            if (isJoined) {
                console.log('🎤 VoiceTracker: Cleanup - removing participant:', playerId);
                remove(participantRef).catch(err => console.error('🎤 VoiceTracker: Cleanup failed:', err));
            }
        };
    }, [roomCode, playerId, playerData, isJoined]);

    // Listen to all participants in real-time
    useEffect(() => {
        if (!roomCode || !onParticipantsChange) return;

        const participantsRef = ref(database, `rooms/${roomCode}/voiceParticipants`);

        const unsubscribe = onValue(participantsRef, (snapshot) => {
            const data = snapshot.val();
            if (data) {
                const participantsList = Object.entries(data).map(([id, info]) => ({
                    id,
                    ...info,
                }));
                console.log('🎤 VoiceTracker: Participants updated:', participantsList.length);
                onParticipantsChange(participantsList);
            } else {
                console.log('🎤 VoiceTracker: No participants in voice');
                onParticipantsChange([]);
            }
        });

        return () => {
            console.log('🎤 VoiceTracker: Cleaning up listener');
            off(participantsRef);
        };
    }, [roomCode, onParticipantsChange]);
};
