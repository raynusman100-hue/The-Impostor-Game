import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import { Platform, PermissionsAndroid } from 'react-native';
import { createAgoraRtcEngine, ClientRoleType, ChannelProfileType } from 'react-native-agora';
import { Audio } from 'expo-av';
import { AGORA_APP_ID } from './constants';

// ============================================================
// AGORA VOICE CHAT ENABLED FOR PRODUCTION BUILD
// ============================================================
const VOICE_CHAT_ENABLED = true;

// Check if we're on web
const isWeb = Platform.OS === 'web';

const VoiceChatContext = createContext();

export const useVoiceChat = () => useContext(VoiceChatContext);

// Disabled stub provider - for web or when disabled
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

// Full Agora provider
const FullVoiceChatProvider = ({ children }) => {
    const agoraEngineRef = useRef(null);
    const [isJoined, setIsJoined] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [remoteUsers, setRemoteUsers] = useState([]);
    const [engineInitialized, setEngineInitialized] = useState(false);

    useEffect(() => {
        const init = async () => {
            try {
                if (AGORA_APP_ID === 'REPLACE_WITH_YOUR_AGORA_APP_ID') {
                    console.warn('VoiceChat: Missing Agora App ID');
                    return;
                }

                if (Platform.OS === 'android') {
                    await PermissionsAndroid.requestMultiple([
                        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
                    ]);
                } else {
                    await Audio.requestPermissionsAsync();
                }

                const engine = createAgoraRtcEngine();
                agoraEngineRef.current = engine;

                engine.initialize({ appId: AGORA_APP_ID });

                engine.addListener('onJoinChannelSuccess', (connection, elapsed) => {
                    console.log('VoiceChat: Joined channel', connection.channelId);
                    setIsJoined(true);
                });

                engine.addListener('onUserJoined', (connection, remoteUid, elapsed) => {
                    console.log('VoiceChat: User joined', remoteUid);
                    setRemoteUsers(prev => [...prev, remoteUid]);
                });

                engine.addListener('onUserOffline', (connection, remoteUid, reason) => {
                    console.log('VoiceChat: User offline', remoteUid);
                    setRemoteUsers(prev => prev.filter(uid => uid !== remoteUid));
                });

                engine.addListener('onLeaveChannel', (connection, stats) => {
                    console.log('VoiceChat: Left channel');
                    setIsJoined(false);
                    setRemoteUsers([]);
                });

                setEngineInitialized(true);
            } catch (e) {
                console.error('VoiceChat: Init failed', e);
            }
        };

        init();

        return () => {
            if (agoraEngineRef.current) {
                agoraEngineRef.current.release();
            }
        };
    }, []);

    const joinChannel = async (channelName, uid) => {
        if (!engineInitialized || !agoraEngineRef.current) return;

        try {
            agoraEngineRef.current.setChannelProfile(ChannelProfileType.ChannelProfileCommunication);
            agoraEngineRef.current.joinChannel('', channelName, uid, {
                clientRoleType: ClientRoleType.ClientRoleBroadcaster,
                autoSubscribeAudio: true,
                publishMicrophoneTrack: !isMuted,
            });
            agoraEngineRef.current.muteLocalAudioStream(isMuted);
        } catch (e) {
            console.error('VoiceChat: Join failed', e);
        }
    };

    const leaveChannel = async () => {
        if (!agoraEngineRef.current) return;
        try {
            agoraEngineRef.current.leaveChannel();
        } catch (e) {
            console.error('VoiceChat: Leave failed', e);
        }
    };

    const toggleMute = () => {
        if (!agoraEngineRef.current) return;
        const newMutedState = !isMuted;

        agoraEngineRef.current.muteLocalAudioStream(newMutedState);
        setIsMuted(newMutedState);
    };

    return (
        <VoiceChatContext.Provider value={{
            isJoined,
            isMuted,
            remoteUsers,
            joinChannel,
            leaveChannel,
            toggleMute
        }}>
            {children}
        </VoiceChatContext.Provider>
    );
};

// Export the appropriate provider - use disabled on web, full on native
export const VoiceChatProvider = (isWeb || !VOICE_CHAT_ENABLED) 
    ? DisabledVoiceChatProvider 
    : FullVoiceChatProvider;
