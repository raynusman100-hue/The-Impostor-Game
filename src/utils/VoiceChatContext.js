import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import { Platform, PermissionsAndroid, Alert } from 'react-native';
import { createAgoraRtcEngine, ClientRoleType, ChannelProfileType } from 'react-native-agora';
import { Audio } from 'expo-av';
import { AGORA_APP_ID } from './constants';
import { database } from './firebase';
import { ref, get, child, onValue } from 'firebase/database';

const VOICE_CHAT_ENABLED = true;

// Check if we're on web
const isWeb = Platform.OS === 'web';

const VoiceChatContext = createContext();

export const useVoiceChat = () => useContext(VoiceChatContext);

// Disabled stub provider - for web or when disabled
const DisabledVoiceChatProvider = ({ children }) => {
    const [isMuted, setIsMuted] = useState(false);
    const [hostHasPremium, setHostHasPremium] = useState(false);
    const [currentRoomCode, setCurrentRoomCode] = useState(null);

    const joinChannel = async (channelName, uid, roomCode = null) => {
        console.log('VoiceChat: DISABLED - joinChannel called for', channelName, 'room:', roomCode);
    };

    const leaveChannel = async () => {
        console.log('VoiceChat: DISABLED - leaveChannel called');
    };

    const toggleMute = () => {
        setIsMuted(prev => !prev);
    };

    const setRoomCodeForPremiumMonitoring = (roomCode) => {
        console.log('VoiceChat: DISABLED - setRoomCodeForPremiumMonitoring called for', roomCode);
        setCurrentRoomCode(roomCode);
    };

    const clearRoomCodeForPremiumMonitoring = () => {
        console.log('VoiceChat: DISABLED - clearRoomCodeForPremiumMonitoring called');
        setCurrentRoomCode(null);
        setHostHasPremium(false);
    };

    return (
        <VoiceChatContext.Provider value={{
            isJoined: false,
            isMuted,
            remoteUsers: [],
            joinChannel,
            leaveChannel,
            toggleMute,
            // Premium status management (disabled but consistent interface)
            hostHasPremium,
            currentRoomCode,
            premiumStatusLoading: false,
            setRoomCodeForPremiumMonitoring,
            clearRoomCodeForPremiumMonitoring,
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
    const [initError, setInitError] = useState(null);
    const [joinError, setJoinError] = useState(null);
    const [currentAppId, setCurrentAppId] = useState(null); // Track the actual ID used
    const [appIdLoading, setAppIdLoading] = useState(true); // Track if we're fetching from Firebase
    const currentChannelRef = useRef(null);
    
    // Premium status state management
    const [hostHasPremium, setHostHasPremium] = useState(false);
    const [currentRoomCode, setCurrentRoomCode] = useState(null);
    const [premiumStatusLoading, setPremiumStatusLoading] = useState(false);
    const premiumListenerRef = useRef(null);

    // Fetch current App ID from Firebase rotation pool
    const fetchCurrentAppId = async () => {
        try {
            console.log('🎤 [FIREBASE] Fetching current Agora App ID from rotation pool...');
            const dbRef = ref(database);
            const snapshot = await get(child(dbRef, 'config/agoraAccounts'));

            if (snapshot.exists()) {
                const data = snapshot.val();
                const accounts = data.accounts || [];
                const currentIndex = data.currentIndex || 0;
                const currentAccount = accounts[currentIndex];

                if (currentAccount && currentAccount.id) {
                    console.log(`🎤 [FIREBASE] ✅ Using App ID from: ${currentAccount.name}`);
                    console.log(`🎤 [FIREBASE] App ID: ${currentAccount.id.slice(0, 8)}...${currentAccount.id.slice(-8)}`);
                    console.log(`🎤 [FIREBASE] Pool position: ${currentIndex + 1}/${accounts.length}`);
                    setCurrentAppId(currentAccount.id);
                    setAppIdLoading(false);
                    return currentAccount.id;
                } else {
                    throw new Error('No valid account found in rotation pool');
                }
            } else {
                throw new Error('Agora rotation config not found in Firebase');
            }
        } catch (error) {
            console.error('🎤 [FIREBASE] ❌ Error fetching from Firebase:', error.message);
            console.log('🎤 [FIREBASE] ⚠️ Falling back to Account 1 from pool');
            setCurrentAppId(AGORA_APP_ID); // Fallback to Account 1
            setAppIdLoading(false);
            return AGORA_APP_ID;
        }
    };

    // Initialize Engine Once
    useEffect(() => {
        const init = async () => {
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('🎤 [TRAP 1] VoiceChat Init Started');
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

            try {
                // STEP 1: Fetch App ID from Firebase FIRST
                console.log('🎤 [TRAP 2] Fetching App ID from Firebase rotation pool...');
                const appId = await fetchCurrentAppId();

                console.log('🎤 [TRAP 2] Using App ID:', appId);
                console.log('🎤 [TRAP 2] App ID length:', appId?.length);

                if (!appId || appId.includes('placeholder')) {
                    const error = 'Invalid Agora App ID';
                    console.error('🎤 [TRAP 2] ❌ FAILED:', error);
                    setInitError(error);
                    return;
                }
                console.log('🎤 [TRAP 2] ✅ App ID valid');

                console.log('🎤 [TRAP 3] Requesting permissions for platform:', Platform.OS);
                if (Platform.OS === 'android') {
                    const granted = await PermissionsAndroid.requestMultiple([
                        PermissionsAndroid.PERMISSIONS.RECORD_AUDIO,
                    ]);
                    console.log('🎤 [TRAP 3] Android permissions result:', granted);
                } else if (Platform.OS === 'ios') {
                    const { granted } = await Audio.requestPermissionsAsync();
                    console.log('🎤 [TRAP 3] iOS permission granted:', granted);
                }
                console.log('🎤 [TRAP 3] ✅ Permissions requested');

                console.log('🎤 [TRAP 4] Creating Agora Engine...');
                const engine = createAgoraRtcEngine();
                console.log('🎤 [TRAP 4] Engine created:', !!engine);
                agoraEngineRef.current = engine;
                console.log('🎤 [TRAP 4] ✅ Engine created successfully');

                console.log('🎤 [TRAP 5] Initializing engine with fetched App ID...');
                engine.initialize({ appId: appId }); // Use fetched ID from Firebase

                // FORCE SPEAKERPHONE
                console.log('🎤 [TRAP 5.1] Forcing Speakerphone Output');
                engine.setDefaultAudioRouteToSpeakerphone(true);

                console.log('🎤 [TRAP 5] ✅ Engine initialized');

                console.log('🎤 [TRAP 6] Setting up event listeners...');

                // Event Listeners
                engine.addListener('onJoinChannelSuccess', (connection, elapsed) => {
                    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
                    console.log('🎤 [EVENT] ✅ onJoinChannelSuccess FIRED!');
                    console.log('🎤 [EVENT] Channel:', connection.channelId);
                    console.log('🎤 [EVENT] Elapsed:', elapsed);
                    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
                    setIsJoined(true);
                });

                engine.addListener('onUserJoined', (connection, remoteUid, elapsed) => {
                    console.log('🎤 [EVENT] User joined:', remoteUid);
                    setRemoteUsers(prev => [...prev, remoteUid]);
                });

                engine.addListener('onUserOffline', (connection, remoteUid, reason) => {
                    console.log('🎤 [EVENT] User offline:', remoteUid, 'reason:', reason);
                    setRemoteUsers(prev => prev.filter(uid => uid !== remoteUid));
                });

                engine.addListener('onLeaveChannel', (connection, stats) => {
                    console.log('🎤 [EVENT] Left channel');
                    setIsJoined(false);
                    setRemoteUsers([]);
                });

                engine.addListener('onError', (err, msg) => {
                    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
                    console.error('🎤 [EVENT] ❌ onError FIRED!');
                    console.error('🎤 [EVENT] Error code:', err);
                    console.error('🎤 [EVENT] Error message:', msg);
                    console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
                    if (err !== 0) {
                        setJoinError(`Agora Error ${err}: ${msg}`);
                    }
                });

                engine.addListener('onConnectionStateChanged', (connection, state, reason) => {
                    console.log('🎤 [EVENT] Connection state:', state, 'reason:', reason);
                });

                console.log('🎤 [TRAP 6] ✅ Event listeners added');

                console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
                console.log('🎤 [TRAP 7] ✅✅✅ INITIALIZATION COMPLETE ✅✅✅');
                console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
                setEngineInitialized(true);
            } catch (e) {
                console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
                console.error('🎤 [TRAP ERROR] ❌❌❌ Init EXCEPTION ❌❌❌');
                console.error('🎤 [TRAP ERROR] Error:', e);
                console.error('🎤 [TRAP ERROR] Stack:', e.stack);
                console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
                setInitError(e.message);
            }
        };

        init();

        return () => {
            if (agoraEngineRef.current) {
                console.log('🎤 [CLEANUP] Releasing engine');
                agoraEngineRef.current.release();
            }
        };
    }, []);

    // Listen for rotation changes in Firebase
    useEffect(() => {
        console.log('🎤 [ROTATION LISTENER] Setting up real-time listener...');

        const configRef = ref(database, 'config/agoraAccounts');

        const unsubscribe = onValue(configRef, (snapshot) => {
            if (snapshot.exists()) {
                const data = snapshot.val();
                const accounts = data.accounts || [];
                const currentIndex = data.currentIndex || 0;
                const newAppId = accounts[currentIndex]?.id;
                const accountName = accounts[currentIndex]?.name;

                if (newAppId && newAppId !== currentAppId) {
                    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
                    console.log('🎤 [ROTATION] 🔄 App ID rotation detected!');
                    console.log(`🎤 [ROTATION] Previous: ${currentAppId?.slice(0, 8)}...${currentAppId?.slice(-8)}`);
                    console.log(`🎤 [ROTATION] New: ${newAppId.slice(0, 8)}...${newAppId.slice(-8)}`);
                    console.log(`🎤 [ROTATION] Account: ${accountName}`);
                    console.log('🎤 [ROTATION] NOTE: Existing calls continue with old ID');
                    console.log('🎤 [ROTATION] NOTE: New calls will use new ID');
                    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
                    setCurrentAppId(newAppId);
                }
            }
        });

        return () => {
            console.log('🎤 [ROTATION LISTENER] Cleaning up listener');
            unsubscribe();
        };
    }, [currentAppId]);

    // Premium status monitoring for current room
    useEffect(() => {
        if (!currentRoomCode) {
            console.log('🎤 [PREMIUM LISTENER] No room code set, skipping premium listener');
            return;
        }

        console.log('🎤 [PREMIUM LISTENER] Setting up real-time premium status listener for room:', currentRoomCode);
        setPremiumStatusLoading(true);

        const premiumRef = ref(database, `rooms/${currentRoomCode}/hostHasPremium`);
        let previousPremiumStatus = null;

        const unsubscribe = onValue(premiumRef, (snapshot) => {
            const premiumStatus = snapshot.val();
            console.log('🎤 [PREMIUM LISTENER] Premium status update:', premiumStatus);
            
            // Handle different cases for premium status
            const newPremiumStatus = premiumStatus === null || premiumStatus === undefined ? false : Boolean(premiumStatus);
            
            // Check if premium was lost during active session
            if (previousPremiumStatus === true && newPremiumStatus === false && isJoined) {
                console.log('🎤 [PREMIUM LISTENER] ⚠️ Premium lost during active session - disconnecting voice chat');
                
                // Show alert to user
                Alert.alert(
                    'Voice Chat Disconnected',
                    'The host\'s premium subscription has expired. Voice chat is no longer available.',
                    [{ text: 'OK' }]
                );
                
                // Disconnect from voice chat
                leaveChannel().catch(err => {
                    console.error('🎤 [PREMIUM LISTENER] Error leaving channel on premium loss:', err);
                });
            }
            
            previousPremiumStatus = newPremiumStatus;
            setHostHasPremium(newPremiumStatus);
            setPremiumStatusLoading(false);
        }, (error) => {
            console.error('🎤 [PREMIUM LISTENER] Error listening to premium status:', error);
            // On error, default to no premium for security
            setHostHasPremium(false);
            setPremiumStatusLoading(false);
        });

        // Store the unsubscribe function
        premiumListenerRef.current = unsubscribe;

        return () => {
            console.log('🎤 [PREMIUM LISTENER] Cleaning up premium status listener');
            if (premiumListenerRef.current) {
                premiumListenerRef.current();
                premiumListenerRef.current = null;
            }
        };
    }, [currentRoomCode, isJoined]);

    // Function to set/update the room code for premium monitoring
    const setRoomCodeForPremiumMonitoring = (roomCode) => {
        console.log('🎤 [PREMIUM] Setting room code for premium monitoring:', roomCode);
        setCurrentRoomCode(roomCode);
        
        // Reset premium status when changing rooms
        if (roomCode !== currentRoomCode) {
            setHostHasPremium(false);
            setPremiumStatusLoading(true);
        }
    };

    // Function to clear room code and stop premium monitoring
    const clearRoomCodeForPremiumMonitoring = () => {
        console.log('🎤 [PREMIUM] Clearing room code, stopping premium monitoring');
        setCurrentRoomCode(null);
        setHostHasPremium(false);
        setPremiumStatusLoading(false);
        
        // Clean up existing listener
        if (premiumListenerRef.current) {
            premiumListenerRef.current();
            premiumListenerRef.current = null;
        }
    };

    const joinChannel = async (channelName, uid, roomCode = null, specificAppId = null) => {
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('🎤 [TRAP 10] joinChannel() CALLED');
        console.log('🎤 [TRAP 10] Channel:', channelName);
        console.log('🎤 [TRAP 10] UID:', uid);
        console.log('🎤 [TRAP 10] Room Code:', roomCode);
        console.log('🎤 [TRAP 10] Specific App ID:', specificAppId);

        // PREMIUM GATING: Check host premium status before allowing voice chat
        if (roomCode) {
            console.log('🎤 [PREMIUM] Checking host premium status for room:', roomCode);
            try {
                const roomRef = ref(database, `rooms/${roomCode}/hostHasPremium`);
                const snapshot = await get(roomRef);
                const hostHasPremium = snapshot.val();
                
                console.log('🎤 [PREMIUM] Host premium status:', hostHasPremium);
                
                if (hostHasPremium === false) {
                    const error = new Error('Voice chat requires the host to have premium');
                    error.code = 'PREMIUM_REQUIRED';
                    console.log('🎤 [PREMIUM] ❌ Premium required but not available');
                    throw error;
                } else if (hostHasPremium === null || hostHasPremium === undefined) {
                    console.log('🎤 [PREMIUM] ⚠️ Premium status not found, defaulting to no access');
                    const error = new Error('Voice chat requires the host to have premium');
                    error.code = 'PREMIUM_REQUIRED';
                    throw error;
                } else {
                    console.log('🎤 [PREMIUM] ✅ Host has premium, proceeding with voice chat');
                }
            } catch (error) {
                if (error.code === 'PREMIUM_REQUIRED') {
                    throw error; // Re-throw premium errors
                }
                console.error('🎤 [PREMIUM] ❌ Error checking premium status:', error);
                // On Firebase errors, default to no premium access for security
                const premiumError = new Error('Voice chat requires the host to have premium');
                premiumError.code = 'PREMIUM_REQUIRED';
                throw premiumError;
            }
        } else {
            console.log('🎤 [PREMIUM] ⚠️ No room code provided, skipping premium check');
        }

        // RE-INITIALIZATION LIGIC FOR ROTATION
        if (specificAppId && specificAppId !== currentAppId) {
            console.log('🎤 [ROTATION] 🔄 Detected different App ID for this room.');
            console.log(`🎤 [ROTATION] Current: ${currentAppId} -> New: ${specificAppId}`);

            try {
                if (agoraEngineRef.current) {
                    console.log('🎤 [ROTATION] Destroying old engine...');
                    agoraEngineRef.current.release();
                    agoraEngineRef.current = null;
                }

                // Re-create with new ID
                const engine = createAgoraRtcEngine();
                agoraEngineRef.current = engine;
                engine.initialize({ appId: specificAppId });
                engine.setDefaultAudioRouteToSpeakerphone(true);
                setCurrentAppId(specificAppId);

                // Re-attach listeners (simplified for brevity, main listeners are in effect hook but this needs care)
                // Note: The useEffect listeners might be detached. Ideally we should have a reliable init function.
                // For safety in this hotfix: We assume the engine is usable.
                // Better approach: Update state to trigger re-run of main useEffect? 
                // No, that's complex. Let's just init and use it, listeners might be lost. 
                // WAIT! The useEffect listeners are attached to `agoraEngineRef.current`. 
                // If we replace the object, we MUST re-attach listeners.

                console.log('🎤 [ROTATION] ✅ Engine re-initialized with new App ID');
                setEngineInitialized(true);

                // Re-attach essential listeners for this session
                engine.addListener('onJoinChannelSuccess', (connection, elapsed) => {
                    console.log('🎤 [EVENT] ✅ onJoinChannelSuccess (Rotated Engine)');
                    setIsJoined(true);
                });
                engine.addListener('onUserJoined', (connection, remoteUid, elapsed) => {
                    setRemoteUsers(prev => [...prev, remoteUid]);
                });
                engine.addListener('onUserOffline', (connection, remoteUid, reason) => {
                    setRemoteUsers(prev => prev.filter(uid => uid !== remoteUid));
                });
                engine.addListener('onLeaveChannel', (connection, stats) => {
                    setIsJoined(false);
                    setRemoteUsers([]);
                });

            } catch (e) {
                console.error('🎤 [ROTATION] ❌ Failed to switch App ID', e);
                setJoinError('Failed to switch voice server');
                return;
            }
        }

        console.log('🎤 [TRAP 10] Engine initialized?', engineInitialized);
        console.log('🎤 [TRAP 10] Engine exists?', !!agoraEngineRef.current);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

        if (!engineInitialized || !agoraEngineRef.current) {
            console.log('🎤 [TRAP 11] Engine not ready, retrying in 500ms...');
            setTimeout(() => joinChannel(channelName, uid, roomCode, specificAppId), 500);
            return;
        }
        console.log('🎤 [TRAP 11] ✅ Engine is ready');

        // Prevent duplicate join
        if (currentChannelRef.current === channelName && isJoined) {
            console.log('🎤 [TRAP 12] Already in channel, skipping');
            return;
        }
        console.log('🎤 [TRAP 12] ✅ Not a duplicate join');

        try {
            console.log('🎤 [TRAP 13] Enabling audio...');
            agoraEngineRef.current.enableAudio();
            console.log('🎤 [TRAP 13] ✅ Audio enabled');

            console.log('🎤 [TRAP 14] Setting channel profile...');
            agoraEngineRef.current.setChannelProfile(ChannelProfileType.ChannelProfileCommunication);
            console.log('🎤 [TRAP 14] ✅ Profile set');

            console.log('🎤 [TRAP 15] Setting client role...');
            agoraEngineRef.current.setClientRole(ClientRoleType.ClientRoleBroadcaster);
            console.log('🎤 [TRAP 15] ✅ Role set');

            const uniqueUid = uid || Math.floor(Math.random() * 1000000);
            console.log('🎤 [TRAP 16] Using UID:', uniqueUid);

            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('🎤 [TRAP 17] CALLING joinChannel() API...');
            console.log('🎤 [TRAP 17] Token: "" (empty)');
            console.log('🎤 [TRAP 17] Channel:', channelName);
            console.log('🎤 [TRAP 17] UID:', uniqueUid);
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

            const result = agoraEngineRef.current.joinChannel(
                "",
                channelName,
                uniqueUid,
                {
                    clientRoleType: ClientRoleType.ClientRoleBroadcaster,
                    autoSubscribeAudio: true,
                    publishMicrophoneTrack: !isMuted,
                }
            );

            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.log('🎤 [TRAP 18] joinChannel API returned:', result);
            console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

            if (result !== 0) {
                console.error('🎤 [TRAP 18] ❌ Error code:', result);
                setJoinError(`Join returned error code: ${result}`);
            } else {
                console.log('🎤 [TRAP 18] ✅ Join call successful (code 0)');
                console.log('🎤 [TRAP 18] Now waiting for onJoinChannelSuccess event...');
                currentChannelRef.current = channelName;
            }

            console.log('🎤 [TRAP 19] Setting mute state to:', isMuted);
            agoraEngineRef.current.muteLocalAudioStream(isMuted);

            // Re-enforcing speakerphone just in case
            agoraEngineRef.current.setEnableSpeakerphone(true);

            console.log('🎤 [TRAP 19] ✅ Mute state set & Speakerphone forced');

        } catch (e) {
            console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            console.error('🎤 [TRAP ERROR] ❌❌❌ Join EXCEPTION ❌❌❌');
            console.error('🎤 [TRAP ERROR]', e);
            console.error('🎤 [TRAP ERROR] Stack:', e.stack);
            console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
            setJoinError(e.message);
        }
    };

    const leaveChannel = async () => {
        if (!agoraEngineRef.current) return;
        try {
            await agoraEngineRef.current.leaveChannel();
            currentChannelRef.current = null;
            setIsJoined(false);
            setRemoteUsers([]);
        } catch (e) {
            console.error('🎤 VoiceChat: Leave failed', e);
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
            toggleMute,
            engineInitialized,
            initError,
            joinError,
            error: initError || joinError, // Consolidated error for UI
            currentAppId, // Exposed for debug
            // Premium status management
            hostHasPremium,
            currentRoomCode,
            premiumStatusLoading,
            setRoomCodeForPremiumMonitoring,
            clearRoomCodeForPremiumMonitoring,
        }}>
            {children}
        </VoiceChatContext.Provider>
    );
};

export const VoiceChatProvider = (isWeb || !VOICE_CHAT_ENABLED)
    ? DisabledVoiceChatProvider
    : FullVoiceChatProvider;
