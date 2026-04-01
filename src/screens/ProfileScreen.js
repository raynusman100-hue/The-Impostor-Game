import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, Platform, Animated, PanResponder, Modal, KeyboardAvoidingView, LayoutAnimation, UIManager, Dimensions, Image, ActivityIndicator, ToastAndroid } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { onAuthStateChanged, signOut, signInWithCredential, GoogleAuthProvider, updateProfile } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { ref, get, set, child } from 'firebase/database';
import { auth, db, database } from '../utils/firebase';
import { useTheme } from '../utils/ThemeContext';
import { playHaptic } from '../utils/haptics';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { CustomAvatar, TOTAL_AVATARS } from '../utils/AvatarGenerator';
import { AvatarBuilder, CustomBuiltAvatar, isPremiumAccessory, isPremiumHairStyle, isPremiumEyeStyle, isPremiumMouthStyle } from '../components/CustomAvatarBuilder';
import PremiumManager from '../utils/PremiumManager';
import PurchaseManager from '../utils/PurchaseManager';
import Purchases from 'react-native-purchases';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android') {
    if (UIManager.setLayoutAnimationEnabledExperimental) {
        UIManager.setLayoutAnimationEnabledExperimental(true);
    }
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Configure Google Sign-In for native builds
// CRITICAL: webClientId must be the Web OAuth client (type 3), NOT an Android client
GoogleSignin.configure({
    webClientId: '831244408092-mn4bhuvq6v4il0nippaiaf7q729o97bu.apps.googleusercontent.com',
    iosClientId: '831244408092-oifo3c54on55brivq9kupic53ntbgrd2.apps.googleusercontent.com',
    offlineAccess: true,
});

// Spinning Avatar Wheel Component
const AvatarWheel = ({ selectedId, onSelect, theme }) => {
    // Increased Size for better fit in non-scrolling view
    const WHEEL_SIZE = 320;
    const CENTER_SIZE = 90;
    const AVATAR_SIZE = 50;
    const RADIUS = 110;
    const DEGREES_PER_AVATAR = 360 / TOTAL_AVATARS;
    const FRICTION = 0.98;
    const MIN_VELOCITY = 0.2;

    const [selected, setSelected] = useState(selectedId);
    const rotationRef = useRef(-((selectedId - 1) * DEGREES_PER_AVATAR));
    const rotation = useRef(new Animated.Value(rotationRef.current)).current;
    const centerScale = useRef(new Animated.Value(1)).current;
    const velocityRef = useRef(0);
    const animationRef = useRef(null);
    const isSpinning = useRef(false);
    const wheelLayoutRef = useRef({ x: 0, y: 0, width: WHEEL_SIZE, height: WHEEL_SIZE });
    const lastAngleRef = useRef(0);
    const prevAnglesRef = useRef([]);
    const wheelRef = useRef(null);
    const isDragging = useRef(false);

    useEffect(() => {
        if (!isSpinning.current) {
            const deg = -((selectedId - 1) * DEGREES_PER_AVATAR);
            rotationRef.current = deg;
            rotation.setValue(deg);
            setSelected(selectedId);
        }
    }, [selectedId]);

    const getAvatarAtTop = (deg) => {
        let normalized = (-deg) % 360;
        if (normalized < 0) normalized += 360;
        const index = Math.round(normalized / DEGREES_PER_AVATAR) % TOTAL_AVATARS;
        return index + 1;
    };

    const snapToNearest = () => {
        const currentAvatarAtTop = getAvatarAtTop(rotationRef.current);
        const snapDeg = -((currentAvatarAtTop - 1) * DEGREES_PER_AVATAR);
        let targetDeg = snapDeg;
        while (targetDeg - rotationRef.current > 180) targetDeg -= 360;
        while (targetDeg - rotationRef.current < -180) targetDeg += 360;

        Animated.spring(rotation, {
            toValue: targetDeg,
            friction: 10,
            tension: 40,
            useNativeDriver: true, // Switched to true for better performance (requires no logic in JS thread during animation)
        }).start(() => {
            rotationRef.current = targetDeg;
            const newId = getAvatarAtTop(targetDeg);
            playHaptic('light');
            setSelected(newId);
            onSelect(newId);
            Animated.sequence([
                Animated.timing(centerScale, { toValue: 1.15, duration: 100, useNativeDriver: true }),
                Animated.timing(centerScale, { toValue: 1, duration: 150, useNativeDriver: true }),
            ]).start();
            isSpinning.current = false;
        });
    };

    const startMomentumSpin = () => {
        if (animationRef.current) cancelAnimationFrame(animationRef.current);
        isSpinning.current = true;
        let lastUpdateTime = Date.now();
        let lastSelectedAvatar = selected;

        const animate = () => {
            velocityRef.current *= FRICTION;
            rotationRef.current += velocityRef.current;
            rotation.setValue(rotationRef.current);

            const now = Date.now();
            if (now - lastUpdateTime > 50) {
                const currentAvatar = getAvatarAtTop(rotationRef.current);
                if (currentAvatar !== lastSelectedAvatar) {
                    lastSelectedAvatar = currentAvatar;
                    setSelected(currentAvatar);
                    if (Math.abs(velocityRef.current) > 3) playHaptic('light');
                }
                lastUpdateTime = now;
            }

            if (Math.abs(velocityRef.current) > MIN_VELOCITY) {
                animationRef.current = requestAnimationFrame(animate);
            } else {
                velocityRef.current = 0;
                snapToNearest();
            }
        };
        animationRef.current = requestAnimationFrame(animate);
    };

    const stopAnimation = () => {
        if (animationRef.current) {
            cancelAnimationFrame(animationRef.current);
            animationRef.current = null;
        }
    };

    useEffect(() => () => stopAnimation(), []);

    const getAngle = (pageX, pageY) => {
        const layout = wheelLayoutRef.current;
        const centerX = layout.x + layout.width / 2;
        const centerY = layout.y + layout.height / 2;
        const dx = pageX - centerX;
        const dy = pageY - centerY;
        return Math.atan2(dx, -dy) * (180 / Math.PI);
    };

    const onWheelLayout = (event) => {
        if (wheelRef.current) {
            wheelRef.current.measure((fx, fy, w, h, px, py) => {
                wheelLayoutRef.current = { x: px, y: py, width: w, height: h };
            });
        }
    };

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => false,
            onMoveShouldSetPanResponder: (_, gesture) => {
                return Math.abs(gesture.dx) > 10 || Math.abs(gesture.dy) > 10;
            },
            onPanResponderGrant: (evt) => {
                stopAnimation();
                isSpinning.current = true;
                isDragging.current = true;
                prevAnglesRef.current = [];
                if (wheelRef.current) {
                    wheelRef.current.measure((fx, fy, w, h, px, py) => {
                        wheelLayoutRef.current = { x: px, y: py, width: w, height: h };
                    });
                }
                const { pageX, pageY } = evt.nativeEvent;
                lastAngleRef.current = getAngle(pageX, pageY);
            },
            onPanResponderMove: (evt) => {
                if (!isDragging.current) return;
                const { pageX, pageY } = evt.nativeEvent;
                const currentAngle = getAngle(pageX, pageY);
                let delta = currentAngle - lastAngleRef.current;
                if (delta > 180) delta -= 360;
                if (delta < -180) delta += 360;
                const now = Date.now();
                prevAnglesRef.current.push({ angle: currentAngle, time: now });
                if (prevAnglesRef.current.length > 5) prevAnglesRef.current.shift();
                lastAngleRef.current = currentAngle;
                rotationRef.current += delta;
                rotation.setValue(rotationRef.current);
                const currentAvatar = getAvatarAtTop(rotationRef.current);
                if (currentAvatar !== selected) {
                    setSelected(currentAvatar);
                }
            },
            onPanResponderRelease: () => {
                isDragging.current = false;
                const samples = prevAnglesRef.current;
                if (samples.length >= 2) {
                    const oldest = samples[0];
                    const newest = samples[samples.length - 1];
                    const timeDiff = newest.time - oldest.time;
                    if (timeDiff > 0) {
                        let angleDiff = newest.angle - oldest.angle;
                        if (angleDiff > 180) angleDiff -= 360;
                        if (angleDiff < -180) angleDiff += 360;
                        const velocity = (angleDiff / timeDiff) * 16.67 * 1.5;
                        if (Math.abs(velocity) > 1) {
                            velocityRef.current = velocity;
                            playHaptic('light');
                            startMomentumSpin();
                            return;
                        }
                    }
                }
                snapToNearest();
            },
        })
    ).current;

    const spinToAvatar = (avatarId) => {
        stopAnimation();
        isSpinning.current = true;
        const targetDeg = -((avatarId - 1) * DEGREES_PER_AVATAR);
        let diff = targetDeg - rotationRef.current;
        while (diff > 180) diff -= 360;
        while (diff < -180) diff += 360;
        const finalTarget = rotationRef.current + diff;
        playHaptic('medium');

        Animated.spring(rotation, {
            toValue: finalTarget,
            friction: 7,
            tension: 40,
            useNativeDriver: true,
        }).start(() => {
            rotationRef.current = finalTarget;
            setSelected(avatarId);
            onSelect(avatarId);
            playHaptic('light');
            Animated.sequence([
                Animated.timing(centerScale, { toValue: 1.15, duration: 100, useNativeDriver: true }),
                Animated.timing(centerScale, { toValue: 1, duration: 150, useNativeDriver: true }),
            ]).start();
            isSpinning.current = false;
        });
    };

    const renderAvatar = (index) => {
        const avatarId = index + 1;
        const angleInDegrees = -90 + (index * DEGREES_PER_AVATAR);
        const angleInRadians = (angleInDegrees * Math.PI) / 180;
        const x = WHEEL_SIZE / 2 + RADIUS * Math.cos(angleInRadians) - AVATAR_SIZE / 2;
        const y = WHEEL_SIZE / 2 + RADIUS * Math.sin(angleInRadians) - AVATAR_SIZE / 2;
        const isSelected = avatarId === selected;

        return (
            <TouchableOpacity
                key={avatarId}
                activeOpacity={0.7}
                onPress={() => spinToAvatar(avatarId)}
                style={[
                    wheelStyles.avatarSlot,
                    {
                        width: AVATAR_SIZE,
                        height: AVATAR_SIZE,
                        borderRadius: AVATAR_SIZE / 2,
                        backgroundColor: isSelected ? theme.colors.primary + '25' : theme.colors.surface,
                        borderColor: isSelected ? theme.colors.primary : theme.colors.primary + '30',
                        borderWidth: isSelected ? 3 : 2,
                        position: 'absolute',
                        left: x,
                        top: y,
                    }
                ]}
            >
                <CustomAvatar id={avatarId} size={AVATAR_SIZE - 12} />
            </TouchableOpacity>
        );
    };

    return (
        <View
            ref={wheelRef}
            onLayout={onWheelLayout}
            style={[wheelStyles.wheelContainer, { width: WHEEL_SIZE, height: WHEEL_SIZE }]}
            {...panResponder.panHandlers}
        >
            <View style={[wheelStyles.outerRing, {
                width: WHEEL_SIZE, height: WHEEL_SIZE,
                borderRadius: WHEEL_SIZE / 2,
                borderColor: theme.colors.primary + '20',
            }]} />
            <View style={[wheelStyles.innerRing, {
                width: WHEEL_SIZE - 40, height: WHEEL_SIZE - 40,
                borderRadius: (WHEEL_SIZE - 40) / 2,
                borderColor: theme.colors.primary + '10',
                backgroundColor: theme.colors.background,
            }]} />

            <View style={wheelStyles.selectorContainer}>
                <View style={[wheelStyles.selectorLine, { backgroundColor: theme.colors.primary }]} />
                <View style={[wheelStyles.selectorArrow, { borderTopColor: theme.colors.primary }]} />
            </View>

            <Animated.View
                style={[
                    wheelStyles.wheel,
                    {
                        width: WHEEL_SIZE,
                        height: WHEEL_SIZE,
                        transform: [{
                            rotate: rotation.interpolate({
                                inputRange: [-36000, 0, 36000],
                                outputRange: ['-36000deg', '0deg', '36000deg'],
                            })
                        }],
                    }
                ]}
            >
                {[...Array(TOTAL_AVATARS)].map((_, i) => renderAvatar(i))}
            </Animated.View>

            <Animated.View style={[
                wheelStyles.centerHub,
                {
                    width: CENTER_SIZE, height: CENTER_SIZE,
                    borderRadius: CENTER_SIZE / 2,
                    backgroundColor: theme.colors.surface,
                    borderColor: theme.colors.primary,
                    transform: [{ scale: centerScale }],
                }
            ]}>
                <View style={[wheelStyles.centerInner, {
                    width: CENTER_SIZE - 8, height: CENTER_SIZE - 8,
                    borderRadius: (CENTER_SIZE - 8) / 2,
                    backgroundColor: theme.colors.background,
                    borderColor: theme.colors.primary + '50',
                }]}>
                    <CustomAvatar id={selected} size={CENTER_SIZE - 22} />
                </View>
            </Animated.View>

            <View style={[wheelStyles.badge, { backgroundColor: theme.colors.primary }]}>
                <Text style={[wheelStyles.badgeText, { color: theme.colors.secondary }]}>{selected}/{TOTAL_AVATARS}</Text>
            </View>

            <Text style={[wheelStyles.hint, { color: theme.colors.textMuted }]}>← SPIN →</Text>
        </View>
    );
};

const wheelStyles = StyleSheet.create({
    wheelContainer: { alignItems: 'center', justifyContent: 'center' },
    outerRing: { position: 'absolute', borderWidth: 3 },
    innerRing: { position: 'absolute', borderWidth: 2 },
    wheel: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
    avatarSlot: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
    centerHub: { position: 'absolute', borderWidth: 4, alignItems: 'center', justifyContent: 'center', zIndex: 10 },
    centerInner: { alignItems: 'center', justifyContent: 'center', borderWidth: 2 },
    selectorContainer: { position: 'absolute', top: 0, alignItems: 'center', zIndex: 20 },
    selectorLine: { width: 4, height: 30, borderRadius: 2 },
    selectorArrow: { width: 0, height: 0, borderLeftWidth: 8, borderRightWidth: 8, borderTopWidth: 12, borderLeftColor: 'transparent', borderRightColor: 'transparent', marginTop: -2 },
    badge: { position: 'absolute', bottom: 10, paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, zIndex: 20 },
    badgeText: { fontSize: 11, fontFamily: 'Panchang-Bold', letterSpacing: 1 },
    hint: { position: 'absolute', bottom: -18, fontSize: 10, fontFamily: 'Teko-Medium', letterSpacing: 2 },
});

// Main ProfileScreen Component
export default function ProfileScreen({ navigation }) {
    const { theme } = useTheme();
    const [user, setUser] = useState(null);
    const [displayName, setDisplayName] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [selectedAvatarId, setSelectedAvatarId] = useState(1);
    const [username, setUsername] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    // Custom Avatar State
    const [showBuilder, setShowBuilder] = useState(false);
    const [customAvatarConfig, setCustomAvatarConfig] = useState(null);
    const [avatarMode, setAvatarMode] = useState('premade'); // 'premade' | 'custom'

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                try {
                    const localProfile = await AsyncStorage.getItem('user_profile');
                    
                    // CRITICAL: Check if cached data belongs to THIS user
                    if (localProfile) {
                        const parsed = JSON.parse(localProfile);
                        
                        // If cached UID doesn't match current user, ignore cache and fetch from Firestore
                        if (parsed.uid && parsed.uid !== currentUser.uid) {
                            console.log('⚠️ Cached profile belongs to different user - fetching fresh data');
                            // Clear stale cache
                            await AsyncStorage.removeItem('user_profile');
                            await AsyncStorage.removeItem('displayName');
                            // Fall through to Firestore fetch below
                        } else {
                            // Cache is valid for this user
                            const name = parsed.username || currentUser.displayName || 'Player';
                            setDisplayName(name);
                            setUsername(name);
                            setSelectedAvatarId(parsed.avatarId || 1);

                            // Load config WITHOUT premium validation (trust cached data)
                            let loadedConfig = parsed.customAvatarConfig || parsed.customAvatar || null;
                            setCustomAvatarConfig(loadedConfig);
                            setAvatarMode(parsed.useCustomAvatar ? 'custom' : 'premade');
                            setUser(currentUser);
                            
                            // Validate premium items in background (non-blocking)
                            if (loadedConfig) {
                                const hasPremiumAccessory = loadedConfig.accessory && isPremiumAccessory(loadedConfig.accessory);
                                const hasPremiumHair = loadedConfig.hairStyle && isPremiumHairStyle(loadedConfig.hairStyle);
                                const hasPremiumEye = loadedConfig.eyeStyle && isPremiumEyeStyle(loadedConfig.eyeStyle);
                                const hasPremiumMouth = loadedConfig.mouthStyle && isPremiumMouthStyle(loadedConfig.mouthStyle);
                                
                                if (hasPremiumAccessory || hasPremiumHair || hasPremiumEye || hasPremiumMouth) {
                                    // Background validation - don't block UI
                                PremiumManager.refreshPremiumStatus().then(hasPremium => {
                                    if (!hasPremium) {
                                        console.log('User has premium items but no premium - resetting');
                                        const resetConfig = { ...loadedConfig };
                                        if (hasPremiumAccessory) resetConfig.accessory = 'none';
                                        if (hasPremiumHair) resetConfig.hairStyle = 'none';
                                        if (hasPremiumEye) resetConfig.eyeStyle = 'normal';
                                        if (hasPremiumMouth) resetConfig.mouthStyle = 'smile';
                                        setCustomAvatarConfig(resetConfig);
                                        // Update stored profile in background
                                        parsed.customAvatarConfig = resetConfig;
                                        AsyncStorage.setItem('user_profile', JSON.stringify(parsed));
                                    }
                                }).catch(err => {
                                    console.error('Background premium validation failed:', err);
                                });
                            }
                            }
                            return; // Exit early - we used cached data
                        }
                    }

                    // Fetch from Firestore (either no cache or cache was invalid)
                    const userDoc = await getDoc(doc(db, "users", currentUser.uid));
                    if (userDoc.exists()) {
                        const userData = userDoc.data();
                        const name = userData.username || currentUser.displayName || 'Player';
                        setDisplayName(name);
                        setUsername(name);
                        setSelectedAvatarId(userData.avatarId || 1);

                        // Load config WITHOUT premium validation (trust cached data)
                        let loadedConfig = userData.customAvatarConfig || userData.customAvatar || null;
                        setCustomAvatarConfig(loadedConfig);
                        setAvatarMode(userData.useCustomAvatar ? 'custom' : 'premade');
                        setUser(currentUser);
                        
                        // Validate premium items in background (non-blocking)
                        if (loadedConfig) {
                            const hasPremiumAccessory = loadedConfig.accessory && isPremiumAccessory(loadedConfig.accessory);
                            const hasPremiumHair = loadedConfig.hairStyle && isPremiumHairStyle(loadedConfig.hairStyle);
                            const hasPremiumEye = loadedConfig.eyeStyle && isPremiumEyeStyle(loadedConfig.eyeStyle);
                            const hasPremiumMouth = loadedConfig.mouthStyle && isPremiumMouthStyle(loadedConfig.mouthStyle);
                            
                            if (hasPremiumAccessory || hasPremiumHair || hasPremiumEye || hasPremiumMouth) {
                                // Background validation - don't block UI
                                PremiumManager.refreshPremiumStatus().then(hasPremium => {
                                    if (!hasPremium) {
                                        console.log('User has premium items but no premium - resetting');
                                        const resetConfig = { ...loadedConfig };
                                        if (hasPremiumAccessory) resetConfig.accessory = 'none';
                                        if (hasPremiumHair) resetConfig.hairStyle = 'none';
                                        if (hasPremiumEye) resetConfig.eyeStyle = 'normal';
                                        if (hasPremiumMouth) resetConfig.mouthStyle = 'smile';
                                        setCustomAvatarConfig(resetConfig);
                                    }
                                }).catch(err => {
                                    console.error('Background premium validation failed:', err);
                                });
                            }
                        }
                        
                        // Save back to local storage for faster next load
                        await AsyncStorage.setItem('user_profile', JSON.stringify(userData));
                    } else {
                        // New user - no Firestore document yet
                        const name = currentUser.displayName || currentUser.email?.split('@')[0] || 'Player';
                        setDisplayName(name);
                        setUsername(name);
                        setSelectedAvatarId(1);
                        setCustomAvatarConfig(null);
                        setAvatarMode('premade');
                        setUser(currentUser);
                    }
                } catch (e) {
                    console.log('Error loading profile:', e);
                    const name = currentUser.displayName || currentUser.email?.split('@')[0] || 'Player';
                    setDisplayName(name);
                    setUsername(name);
                    setSelectedAvatarId(1);
                    setUser(currentUser);
                    setAvatarMode('premade');
                }
            } else {
                // No user signed in
                setUser(null);
                setDisplayName('');
                setUsername('');
                setSelectedAvatarId(1);
                setCustomAvatarConfig(null);
                setAvatarMode('premade');
            }
        });
        return unsubscribe;
    }, []);

    const handleGoogleSignIn = async () => {
        playHaptic('medium');
        setIsLoading(true);
        console.log('Starting Google Sign-In process...');

        try {
            await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
            const userInfo = await GoogleSignin.signIn();
            const idToken = userInfo.data?.idToken || userInfo.idToken;

            if (idToken) {
                const credential = GoogleAuthProvider.credential(idToken);
                const userCredential = await signInWithCredential(auth, credential);
                const user = userCredential.user;
                const newDisplayName = user.displayName || user.email?.split('@')[0] || 'Player';

                // Link RevenueCat to Firebase User
                const linkingResult = await PurchaseManager.linkUserToRevenueCat(user.uid);
                
                // Check if linking failed - show toast notification
                if (linkingResult && !linkingResult.success) {
                    console.warn('RevenueCat linking failed:', linkingResult.diagnostics);
                    
                    // Show toast notification (non-blocking)
                    if (Platform.OS === 'android') {
                        ToastAndroid.show('Premium sync issue - purchases may be delayed', ToastAndroid.SHORT);
                    } else {
                        // iOS: Use a brief alert that auto-dismisses feel
                        Alert.alert('Notice', 'Premium sync issue - purchases may be delayed', [{ text: 'OK' }]);
                    }
                }

                const userProfile = {
                    username: newDisplayName,
                    email: user.email,
                    avatarId: 1,
                    customAvatar: null,
                    useCustomAvatar: false,
                    uid: user.uid,
                    photoURL: user.photoURL,
                    lastLogin: new Date().toISOString()
                };

                await setDoc(doc(db, "users", user.uid), userProfile, { merge: true });
                await AsyncStorage.setItem('user_profile', JSON.stringify(userProfile));
                await AsyncStorage.setItem('displayName', newDisplayName);
                await new Promise(resolve => setTimeout(resolve, 150));

                setUser(user);
                setDisplayName(newDisplayName);
                setUsername(newDisplayName);
                setAvatarMode('premade');
                playHaptic('success');
            } else {
                throw new Error('No ID token received from Google');
            }
        } catch (error) {
            console.error('Google Sign-In error:', error);
            if (error.code === statusCodes.SIGN_IN_CANCELLED) {
                console.log('User cancelled sign-in');
            } else if (error.code === statusCodes.IN_PROGRESS) {
                Alert.alert('Sign-In', 'Sign-in already in progress');
            } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
                Alert.alert('Error', 'Google Play Services not available on this device');
            } else {
                Alert.alert('Sign-In Error', error.message || 'Something went wrong during sign-in. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    // FIXED: Optimistic Save (Local First -> Navigate -> Background Cloud Sync)
    // BUT with username availability checking FIRST
    const checkUsernameOwner = async (name) => {
        const usernameRef = child(ref(database), `usernames/${name.toLowerCase()}`);
        const snapshot = await get(usernameRef);
        if (!snapshot.exists()) return null;

        const data = snapshot.val();
        let ownerUid = null;

        if (typeof data === 'string') {
            ownerUid = data;
        } else if (data.releasedAt) {
            // Username was released - check cooldown
            const cooldownMs = 2 * 60 * 1000; // 2 minutes
            if (Date.now() - data.releasedAt >= cooldownMs) {
                // Cooldown passed, username is available - clean it up
                await set(ref(database, `usernames/${name.toLowerCase()}`), null);
                return null;
            }
            ownerUid = data.uid;
        } else {
            ownerUid = data.uid || data;
        }

        // IMPORTANT: Verify the owner UID still exists (account not deleted)
        if (ownerUid) {
            try {
                const userRef = child(ref(database), `users/${ownerUid}`);
                const userSnapshot = await get(userRef);

                // If user doesn't exist in database, the username is orphaned - clean it up
                if (!userSnapshot.exists()) {
                    await set(ref(database, `usernames/${name.toLowerCase()}`), null);
                    return null;
                }
            } catch (error) {
                // If we can't verify, assume username is taken to be safe
                console.log('Error verifying username owner:', error);
            }
        }

        return ownerUid;
    };

    const releaseUsername = async (oldName) => {
        if (!oldName || !user) return;
        const usernameRef = ref(database, `usernames/${oldName.toLowerCase()}`);
        const snapshot = await get(usernameRef);
        if (snapshot.exists()) {
            const data = snapshot.val();
            const ownerUid = typeof data === 'string' ? data : data.uid;
            if (ownerUid === user.uid) {
                await set(usernameRef, { uid: user.uid, releasedAt: Date.now() });
            }
        }
    };

    const handleSaveProfile = async () => {
        const trimmedUsername = username.trim();
        if (!trimmedUsername) {
            Alert.alert('Error', 'Please enter a username');
            return;
        }
        if (trimmedUsername.length > 12) {
            Alert.alert('Error', 'Username must be 12 characters or less');
            return;
        }

        setIsSaving(true);
        playHaptic('medium');

        try {
            // STEP 1: Check username availability (BLOCKING - must complete first)
            console.log('Checking username availability...');
            const ownerUid = await checkUsernameOwner(trimmedUsername);
            
            if (ownerUid && ownerUid !== user.uid) {
                playHaptic('error');
                Alert.alert('Username Taken', 'This username is already taken. Please choose another one.');
                setIsSaving(false);
                return;
            }

            // STEP 2: Release old username if changed
            const oldUsername = displayName;
            if (oldUsername && oldUsername.toLowerCase() !== trimmedUsername.toLowerCase()) {
                console.log('Releasing old username:', oldUsername);
                await releaseUsername(oldUsername);
            }

            // STEP 3: Reserve new username in Realtime Database
            console.log('Reserving username:', trimmedUsername);
            await set(ref(database, `usernames/${trimmedUsername.toLowerCase()}`), { uid: user.uid });

            // STEP 4: Save to Realtime Database (for username verification)
            await set(ref(database, `users/${user.uid}`), {
                username: trimmedUsername,
                avatarId: selectedAvatarId,
                updatedAt: Date.now()
            });

            const userProfile = {
                username: trimmedUsername,
                email: user.email,
                avatarId: selectedAvatarId,
                customAvatar: customAvatarConfig,
                useCustomAvatar: avatarMode === 'custom',
                customAvatarConfig: customAvatarConfig,
                uid: user.uid,
                photoURL: user.photoURL,
                lastLogin: new Date().toISOString()
            };

            // STEP 5: FAST SAVE: Local Storage (AsyncStorage)
            await AsyncStorage.setItem('user_profile', JSON.stringify(userProfile));
            await AsyncStorage.setItem('displayName', trimmedUsername);

            // Update local state
            setDisplayName(trimmedUsername);

            // STEP 6: BACKGROUND SAVE: Cloud Sync (Firestore + Auth)
            const backgroundSync = async () => {
                try {
                    await Promise.all([
                        setDoc(doc(db, "users", user.uid), userProfile, { merge: true }),
                        updateProfile(user, { displayName: trimmedUsername })
                    ]);
                    console.log('Background cloud sync complete');
                } catch (err) {
                    console.warn('Background cloud sync failed:', err);
                }
            };
            backgroundSync();

            // STEP 7: Navigate Immediately
            console.log('Local save done, navigating...');
            playHaptic('success');
            
            // Check if user has premium first
            const hasPremium = await PremiumManager.checkPremiumStatus();
            
            // Load counter from AsyncStorage
            const counterStr = await AsyncStorage.getItem('profile_save_count');
            let counter = counterStr ? parseInt(counterStr, 10) : 0;
            
            // Increment counter
            counter = counter + 1;
            
            // Check if counter is 3 (show premium every 3rd save)
            let shouldShowPremium = false;
            if (counter === 3) {
                shouldShowPremium = !hasPremium;
                counter = 1;
            }
            
            // Save counter back to AsyncStorage
            await AsyncStorage.setItem('profile_save_count', counter.toString());
            
            if (shouldShowPremium) {
                console.log('Navigating to Premium (3rd save)');
                setIsSaving(false);
                navigation.navigate('Premium');
            } else {
                console.log('Navigating to Home');
                setIsSaving(false);
                navigation.navigate('Home');
            }
        } catch (error) {
            console.error('Save profile failed:', error);
            playHaptic('error');
            Alert.alert('Error', 'Failed to save profile. Please try again.');
            setIsSaving(false);
        }
    };

    // 🔍 DIAGNOSTIC: Check RevenueCat status
    const runRevenueCatDiagnostics = async () => {
        try {
            console.log('=== REVENUCAT DIAGNOSTICS START ===');
            
            // 1. Get current RevenueCat App User ID
            const rcAppUserId = await Purchases.getAppUserID();
            console.log('1. RC App User ID:', rcAppUserId);
            
            // 2. Get Firebase User ID
            const firebaseUserId = auth.currentUser?.uid || 'NOT_SIGNED_IN';
            console.log('2. Firebase User ID:', firebaseUserId);
            
            // 3. Check if they match
            const idsMatch = rcAppUserId === firebaseUserId;
            console.log('3. IDs Match?', idsMatch);
            
            // 4. Get customer info
            const customerInfo = await Purchases.getCustomerInfo();
            console.log('4. Original App User ID:', customerInfo.originalAppUserId);
            
            const activeEntitlements = Object.keys(customerInfo.entitlements.active);
            const allEntitlements = Object.keys(customerInfo.entitlements.all);
            console.log('5. Active Entitlements:', activeEntitlements);
            console.log('6. All Entitlements:', allEntitlements);
            
            // 7. Check specific premium entitlement
            const premiumEntitlement = customerInfo.entitlements.all['premium'];
            let premiumStatus = 'NOT FOUND';
            if (premiumEntitlement) {
                premiumStatus = `Found - Active: ${premiumEntitlement.isActive}, Expires: ${premiumEntitlement.expirationDate || 'Never'}`;
                console.log('7. Premium Entitlement:', premiumStatus);
            } else {
                console.log('7. Premium Entitlement: NOT FOUND');
            }
            
            console.log('=== REVENUCAT DIAGNOSTICS END ===');
            
            // Show alert with key info
            Alert.alert(
                '🔍 RevenueCat Diagnostics',
                `RC ID:\n${rcAppUserId}\n\nFirebase ID:\n${firebaseUserId}\n\nMatch: ${idsMatch ? '✅ YES' : '❌ NO'}\n\nActive:\n${activeEntitlements.join(', ') || 'none'}\n\nAll:\n${allEntitlements.join(', ') || 'none'}\n\nPremium:\n${premiumStatus}`,
                [
                    { text: 'Copy RC ID', onPress: () => console.log('RC ID:', rcAppUserId) },
                    { text: 'OK' }
                ]
            );
            
        } catch (error) {
            console.error('Diagnostic Error:', error);
            Alert.alert('Diagnostic Error', error.message);
        }
    };

    const handleSignOut = async () => {
        try {
            // Unlink RevenueCat before signing out
            await PurchaseManager.unlinkUser();
            
            // CRITICAL: Clear AsyncStorage to prevent old user data from persisting
            await AsyncStorage.removeItem('user_profile');
            await AsyncStorage.removeItem('displayName');
            await AsyncStorage.removeItem('profile_save_count');
            
            await GoogleSignin.signOut();
            await signOut(auth);
            
            // Reset all state
            setUser(null);
            setDisplayName('');
            setUsername('');
            setSelectedAvatarId(1);
            setCustomAvatarConfig(null);
            setAvatarMode('premade');
            
            console.log('✅ Sign out complete - all data cleared');
        } catch (error) {
            console.error('Error signing out:', error);
            Alert.alert('Error', 'Failed to sign out');
        }
    };

    const styles = getStyles(theme);

    return (
        <KeyboardAvoidingView
            style={{ flex: 1 }}
            behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        >
            <View style={styles.container}>
                {/* Removed ScrollView, replaced with perfectly fitted View */}
                <View style={styles.content}>
                    {user ? (
                        // Signed In State
                        <View style={styles.signedInContainer}>

                            {/* Top Section: Toggle */}
                            <View style={styles.topSection}>
                                <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>AVATAR</Text>
                                <View style={styles.toggleContainer}>
                                    <TouchableOpacity
                                        style={[styles.toggleBtn, avatarMode === 'premade' && styles.toggleBtnActive]}
                                        onPress={() => {
                                            playHaptic('light');
                                            setAvatarMode('premade');
                                            LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                                        }}
                                    >
                                        <Text style={[styles.toggleBtnText, avatarMode === 'premade' && styles.toggleBtnTextActive]}>PRE MADE</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity
                                        style={[styles.toggleBtn, avatarMode === 'custom' && styles.toggleBtnActive]}
                                        onPress={() => {
                                            playHaptic('light');
                                            setAvatarMode('custom');
                                            if (!customAvatarConfig) setShowBuilder(true);
                                        }}
                                    >
                                        <Text style={[styles.toggleBtnText, avatarMode === 'custom' && styles.toggleBtnTextActive]}>CUSTOM</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>

                            {/* Middle Section: Avatar Display (Flexible) */}
                            <View style={styles.avatarDisplayArea}>
                                {avatarMode === 'custom' && customAvatarConfig ? (
                                    <View style={styles.customUrlContainer}>
                                        <View style={[styles.customAvatarPreview, { borderColor: theme.colors.primary }]}>
                                            <CustomBuiltAvatar
                                                config={customAvatarConfig}
                                                size={150} // Larger custom avatar
                                            />
                                        </View>
                                        <TouchableOpacity
                                            style={styles.editCustomBtn}
                                            onPress={() => setShowBuilder(true)}
                                        >
                                            <Text style={styles.editCustomBtnText}>EDIT CUSTOM AVATAR</Text>
                                        </TouchableOpacity>
                                    </View>
                                ) : (
                                    <AvatarWheel
                                        selectedId={selectedAvatarId}
                                        onSelect={setSelectedAvatarId}
                                        theme={theme}
                                    />
                                )}
                            </View>

                            {/* Bottom Section: Form & Buttons */}
                            <View style={styles.bottomSection}>
                                <View style={styles.formContainer}>
                                    <Text style={[styles.label, { color: theme.colors.textMuted }]}>USERNAME</Text>
                                    <TextInput
                                        style={[styles.input, {
                                            color: theme.colors.text,
                                            borderColor: theme.colors.primary + '50',
                                            backgroundColor: theme.colors.surface
                                        }]}
                                        value={username}
                                        onChangeText={setUsername}
                                        placeholder="Enter username"
                                        placeholderTextColor={theme.colors.textMuted + '80'}
                                        maxLength={12}
                                    />
                                    <Text style={[styles.email, { color: theme.colors.textMuted }]}>{user.email}</Text>
                                </View>

                                <View style={styles.buttonRow}>
                                    <TouchableOpacity
                                        style={[styles.saveButton, { backgroundColor: theme.colors.primary }]}
                                        onPress={handleSaveProfile}
                                        disabled={isSaving}
                                    >
                                        <Text style={[styles.buttonText, { color: theme.colors.background }]}>
                                            {isSaving ? 'SAVING...' : 'SAVE'}
                                        </Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={[styles.signOutButton, { borderColor: theme.colors.error }]}
                                        onPress={handleSignOut}
                                    >
                                        <Text style={[styles.buttonTextSmall, { color: theme.colors.error }]}>LOGOUT</Text>
                                    </TouchableOpacity>
                                </View>

                                {/* 🔍 DIAGNOSTIC BUTTON - Remove after debugging */}
                                <TouchableOpacity
                                    style={[styles.diagnosticButton, { borderColor: theme.colors.accent || '#FFD700' }]}
                                    onPress={runRevenueCatDiagnostics}
                                >
                                    <Text style={[styles.buttonTextSmall, { color: theme.colors.accent || '#FFD700' }]}>🔍 RC DEBUG</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    ) : (
                        <View style={styles.signedOutContainer}>
                            <View style={styles.placeholderIcon}>
                                <CustomAvatar id={1} size={100} />
                            </View>
                            <Text style={[styles.welcomeText, { color: theme.colors.text }]}>
                                Join to save your progress, stats, and custom avatar.
                            </Text>

                            {/* Google Sign-In - Black Style */}
                            <TouchableOpacity
                                style={styles.googleBlackBtn}
                                onPress={handleGoogleSignIn}
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <ActivityIndicator size="small" color="#FFF" />
                                ) : (
                                    <>
                                        <View style={styles.googleIconContainer}>
                                            <Image
                                                source={require('../../assets/google_g_logo.png')}
                                                style={styles.googleIconImage}
                                                resizeMode="contain"
                                            />
                                        </View>
                                        <Text style={styles.googleBlackBtnText}>Sign in with Google</Text>
                                    </>
                                )}
                            </TouchableOpacity>
                        </View>
                    )}
                </View>

                {/* Custom Avatar Builder Modal */}
                <Modal
                    visible={showBuilder}
                    animationType="slide"
                    presentationStyle="pageSheet"
                    onRequestClose={() => setShowBuilder(false)}
                >
                    <View style={styles.builderContainer}>
                        <View style={styles.builderHeader}>
                            <Text style={styles.builderTitle}>DESIGN YOUR AVATAR</Text>
                            <TouchableOpacity onPress={() => setShowBuilder(false)} style={styles.closeBtn}>
                                <Text style={styles.closeBtnText}>CLOSE</Text>
                            </TouchableOpacity>
                        </View>
                        <AvatarBuilder
                            initialConfig={customAvatarConfig}
                            theme={theme}
                            onCancel={() => setShowBuilder(false)}
                            onSave={(config) => {
                                setCustomAvatarConfig(config);
                                setShowBuilder(false);
                                playHaptic('success');
                            }}
                            onPremiumRequired={() => {
                                playHaptic('warning');
                                setShowBuilder(false);
                                navigation.navigate('Premium');
                            }}
                        />
                    </View>
                </Modal>
            </View>
        </KeyboardAvoidingView>
    );
}

function getStyles(theme) {
    return StyleSheet.create({
        container: { flex: 1, backgroundColor: theme.colors.background },
        content: { flex: 1 },

        // Signed In Styles - Flexbox Layout
        signedInContainer: { flex: 1, paddingHorizontal: 20, paddingBottom: 20, paddingTop: 10, justifyContent: 'space-between' },

        topSection: { alignItems: 'center', marginTop: 10 },
        sectionTitle: { fontSize: 14, fontFamily: 'Panchang-Bold', letterSpacing: 4, marginBottom: 12 },
        toggleContainer: { flexDirection: 'row', backgroundColor: theme.colors.surface, borderRadius: 12, padding: 4, borderWidth: 1, borderColor: theme.colors.primary + '30' },
        toggleBtn: { paddingVertical: 6, paddingHorizontal: 16, borderRadius: 8 },
        toggleBtnActive: { backgroundColor: theme.colors.primary },
        toggleBtnText: { fontSize: 11, fontFamily: 'Teko-Bold', color: theme.colors.textMuted, letterSpacing: 1 },
        toggleBtnTextActive: { color: theme.colors.secondary },

        avatarDisplayArea: { flex: 1, alignItems: 'center', justifyContent: 'center' },

        customUrlContainer: { alignItems: 'center', gap: 16 },
        customAvatarPreview: { width: 170, height: 170, borderRadius: 85, borderWidth: 4, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.surface },
        editCustomBtn: { paddingVertical: 8, paddingHorizontal: 16, borderWidth: 1, borderColor: theme.colors.primary, borderRadius: 8 },
        editCustomBtnText: { color: theme.colors.primary, fontFamily: 'Teko-Medium', fontSize: 14, letterSpacing: 1 },

        bottomSection: { width: '100%', gap: 10 },
        formContainer: { width: '100%', marginBottom: 10 },
        label: { fontSize: 11, fontFamily: 'Panchang-Bold', letterSpacing: 2, marginBottom: 6, marginLeft: 4 },
        input: { width: '100%', height: 48, borderRadius: 12, borderWidth: 1, paddingHorizontal: 16, fontSize: 18, fontFamily: 'Amulya-Bold' },
        email: { fontSize: 11, marginTop: 4, marginLeft: 4, fontFamily: 'CabinetGrotesk-Medium' },

        buttonRow: { flexDirection: 'row', gap: 12, alignItems: 'center' },
        saveButton: { flex: 2, height: 50, borderRadius: 25, alignItems: 'center', justifyContent: 'center', shadowColor: theme.colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
        buttonText: { fontSize: 16, fontFamily: 'Panchang-Bold', letterSpacing: 2 },

        signOutButton: { flex: 1, height: 50, borderRadius: 25, alignItems: 'center', justifyContent: 'center', borderWidth: 2 },
        buttonTextSmall: { fontSize: 14, fontFamily: 'Panchang-Bold', letterSpacing: 1 },
        
        diagnosticButton: { width: '100%', height: 50, borderRadius: 25, alignItems: 'center', justifyContent: 'center', borderWidth: 2, marginTop: 12 },

        // Signed Out Styles
        signedOutContainer: { flex: 1, padding: 40, alignItems: 'center', justifyContent: 'center' },
        placeholderIcon: { marginBottom: 30, opacity: 0.5 },
        welcomeText: { fontSize: 16, color: theme.colors.text, textAlign: 'center', fontFamily: 'CabinetGrotesk-Medium', lineHeight: 24, marginBottom: 40 },
        googleButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', width: '100%', height: 56, borderRadius: 28, borderWidth: 1, borderColor: '#ddd' },
        googleIconPlaceholder: { width: 20, height: 20, backgroundColor: 'red', marginRight: 10, borderRadius: 10 },

        // Builder Modal
        builderContainer: { flex: 1, paddingTop: Platform.OS === 'ios' ? 20 : 0, backgroundColor: theme.colors.background },
        builderHeader: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, alignItems: 'center', borderBottomWidth: 1, borderBottomColor: theme.colors.primary + '20' },
        builderTitle: { fontSize: 18, fontFamily: 'Panchang-Bold', letterSpacing: 2, color: theme.colors.text },
        closeBtn: { padding: 8 },
        closeBtnText: { fontFamily: 'Teko-Bold', fontSize: 16, color: theme.colors.textMuted },

        // Login UI Styles
        googleBlackBtn: {
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
            height: 56,
            borderRadius: 28,
            backgroundColor: '#131314', // Google Black
            borderWidth: 1,
            borderColor: '#555',
        },
        googleIconContainer: {
            marginRight: 12,
            backgroundColor: '#fff',
            borderRadius: 12,
            padding: 2,
        },
        googleIconImage: {
            width: 24,
            height: 24,
        },
        googleBlackBtnText: {
            color: '#FFFFFF',
            fontSize: 16,
            fontFamily: 'Roboto', // System font usually matches well, or Theme font
            fontWeight: 'bold',
            letterSpacing: 0.5,
        },
    });
}

