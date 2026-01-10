import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Platform, PermissionsAndroid, Alert } from 'react-native';
import { createAgoraRtcEngine, ClientRoleType, ChannelProfileType } from 'react-native-agora';
import { Audio } from 'expo-av';
import { AGORA_APP_ID } from './constants';

const VoiceChatContext = createContext();

export const useVoiceChat = () => useContext(VoiceChatContext);

export const VoiceChatProvider = ({ children }) => {
    const agoraEngineRef = useRef(null);
    const [isJoined, setIsJoined] = useState(false);
    const [isMuted, setIsMuted] = useState(false); // Start unmuted or muted? Usually unmuted or let user decide
    const [remoteUsers, setRemoteUsers] = useState([]);
    const [engineInitialized, setEngineInitialized] = useState(false);

    // Initialize Agora Engine
    useEffect(() => {
        const init = async () => {
            try {
                if (AGORA_APP_ID === 'REPLACE_WITH_YOUR_AGORA_APP_ID') {
                    console.warn('VoiceChat: Missing Agora App ID');
                    return;
                }

                // Request permissions
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

                // Event Listeners
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
            // Ensure muted state is respected on join
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
