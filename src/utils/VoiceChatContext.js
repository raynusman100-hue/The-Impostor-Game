import React, { createContext, useContext, useState } from 'react';
import { Platform } from 'react-native';

// ============================================================
// AGORA VOICE CHAT DISABLED FOR EXPO GO TESTING
// Set VOICE_CHAT_ENABLED = true to re-enable Agora
// ============================================================
const VOICE_CHAT_ENABLED = false;

// Check if we're on web
const isWeb = Platform.OS === 'web';

const VoiceChatContext = createContext();

export const useVoiceChat = () => useContext(VoiceChatContext);

// Disabled stub provider - provides same interface but does nothing
const DisabledVoiceChatProvider = ({ children }) => {
    const [isMuted, setIsMuted] = useState(false);

    const joinChannel = async (channelName, uid) => {
        console.log('VoiceChat: DISABLED - joinChannel called for', channelName);
    };

    const leaveChannel = async () => {
        console.log('VoiceChat: DISABLED - leaveChannel called');
    };

    const toggleMute = () => {
        setIsMuted(prev => !prev);
        console.log('VoiceChat: DISABLED - toggleMute called');
    };

    return (
        <VoiceChatContext.Provider value={{
            isJoined: false,
            isMuted,
            remoteUsers: [],
            joinChannel,
            leaveChannel,
            toggleMute
        }}>
            {children}
        </VoiceChatContext.Provider>
    );
};

// Export the disabled provider (Agora not supported on web or when disabled)
export const VoiceChatProvider = DisabledVoiceChatProvider;
