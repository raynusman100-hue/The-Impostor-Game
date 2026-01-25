import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Alert, Platform, Animated, PanResponder, Modal, KeyboardAvoidingView, LayoutAnimation, UIManager, Dimensions, Image, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { onAuthStateChanged, signOut, signInWithCredential, GoogleAuthProvider, updateProfile } from 'firebase/auth'; // Added updateProfile
import { doc, setDoc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from '../utils/firebase';
import { useTheme } from '../utils/ThemeContext';
import { playHaptic } from '../utils/haptics';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import { CustomAvatar, TOTAL_AVATARS } from '../utils/AvatarGenerator';
import { AvatarBuilder, CustomBuiltAvatar } from '../components/CustomAvatarBuilder';
import { checkPremiumStatus, addPremiumListener } from '../utils/PremiumManager';
import PurchaseManager from '../utils/PurchaseManager';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android') {
    if (UIManager.setLayoutAnimationEnabledExperimental) {
        UIManager.setLayoutAnimationEnabledExperimental(true);
    }
}

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Configure Google Sign-In for native builds
GoogleSignin.configure({
    webClientId: '831244408092-mn4bhuvq6v4il0nippaiaf7q729o97bu.apps.googleusercontent.com',
    iosClientId: '831244408092-oifo3c54on55brivq9kupic53ntbgrd2.apps.googleusercontent.com',
    offlineAccess: true,
});

// Spinning Avatar Wheel Component
const AvatarWheel = ({ selectedId, onSelect, theme }) => {
    // Dynamic Size for iPhone 8 / Small Screens
    const isSmallScreen = SCREEN_HEIGHT < 700;

    // Scaled dimensions - Increased Sizes
    const WHEEL_SIZE = isSmallScreen ? 300 : 350; // Increased
    const CENTER_SIZE = isSmallScreen ? 90 : 110; // Increased
    const AVATAR_SIZE = isSmallScreen ? 50 : 60;  // Increased
    const RADIUS = isSmallScreen ? 105 : 125;     // Increased

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
    const [isPremium, setIsPremium] = useState(false); // Track premium status locally

    // Check premium status on mount and listen for updates
    useEffect(() => {
        const checkPremium = async () => {
            if (user) {
                const premium = await checkPremiumStatus(user.email, user.uid);
                setIsPremium(premium);
            }
        };

        checkPremium();

        // Subscribe to real-time updates (handles instant purchase updates)
        const unsubscribe = addPremiumListener((status) => {
            setIsPremium(status);
        });

        return () => {
            unsubscribe();
        };
    }, [user]);

    const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
    const initialStateRef = useRef(null);

    // Track initial state when user loads or saves
    useEffect(() => {
        if (!user) {
            initialStateRef.current = null;
            return;
        }

        if (!initialStateRef.current) {
            initialStateRef.current = {
                username: displayName || '',
                avatarId: selectedAvatarId,
                avatarMode: avatarMode,
                customAvatarConfig: customAvatarConfig
            };
        }
    }, [user, displayName, selectedAvatarId, avatarMode, customAvatarConfig]);

    // Detect unsaved changes across ALL fields
    useEffect(() => {
        if (!initialStateRef.current) {
            setHasUnsavedChanges(false);
            return;
        }

        const currentUsername = username.trim();
        const initial = initialStateRef.current;

        // Compare all fields
        const usernameChanged = currentUsername !== initial.username && currentUsername !== '';
        const avatarIdChanged = selectedAvatarId !== initial.avatarId;
        const modeChanged = avatarMode !== initial.avatarMode;

        // Deep comparison for custom config object
        const configChanged = JSON.stringify(customAvatarConfig) !== JSON.stringify(initial.customAvatarConfig);

        const hasChanges = usernameChanged || avatarIdChanged || modeChanged || configChanged;

        setHasUnsavedChanges(hasChanges);
    }, [username, selectedAvatarId, avatarMode, customAvatarConfig]);

    // PREVENT SWIPE BUG: Disable gesture when dirty
    useEffect(() => {
        navigation.setOptions({
            gestureEnabled: !hasUnsavedChanges
        });
    }, [navigation, hasUnsavedChanges]);

    // Intercept back navigation
    useEffect(() => {
        const unsubscribe = navigation.addListener('beforeRemove', (e) => {
            // CRITICAL FIX: Only block navigation if the user is ACTUALLY on the profile screen.
            // This prevents "Play Again" (navigation.reset) from triggering this popup from the background.
            if (!navigation.isFocused()) {
                return;
            }

            if (!hasUnsavedChanges || isSaving) {
                return;
            }

            e.preventDefault();

            Alert.alert(
                'Unsaved Changes',
                'You have unsaved changes. Do you want to discard them?',
                [
                    {
                        text: 'Keep Editing',
                        style: 'cancel',
                        onPress: () => {
                            // Fix for iOS Swipe Back: If user is halfway through swipe,
                            // we need to ensure we snap back to the profile screen visually.
                            // preventDefault() handles logic, but explicit navigate helps UI sync.
                            navigation.navigate('Profile');
                        }
                    },
                    {
                        text: 'Discard',
                        style: 'destructive',
                        onPress: () => {
                            setHasUnsavedChanges(false);
                            navigation.dispatch(e.data.action);
                        }
                    }
                ]
            );
        });
        return unsubscribe;
    }, [navigation, hasUnsavedChanges, isSaving]);
    // Custom Avatar State
    const [showBuilder, setShowBuilder] = useState(false);
    const [customAvatarConfig, setCustomAvatarConfig] = useState(null);
    const [avatarMode, setAvatarMode] = useState('premade'); // 'premade' | 'custom'

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                try {
                    const localProfile = await AsyncStorage.getItem('user_profile');
                    if (localProfile) {
                        const parsed = JSON.parse(localProfile);
                        const name = parsed.username || currentUser.displayName || 'Player';
                        const avatarId = parsed.avatarId || 1;
                        const config = parsed.customAvatarConfig || parsed.customAvatar || null;
                        const mode = parsed.useCustomAvatar ? 'custom' : 'premade';

                        setDisplayName(name);
                        setUsername(name);
                        setSelectedAvatarId(avatarId);
                        setCustomAvatarConfig(config);
                        setAvatarMode(mode);

                        // FIX: Set initial state immediately to match loaded data
                        initialStateRef.current = {
                            username: name,
                            avatarId: avatarId,
                            avatarMode: mode,
                            customAvatarConfig: config
                        };

                        setUser(currentUser);
                        return;
                    }

                    const userDoc = await getDoc(doc(db, "users", currentUser.uid));
                    if (userDoc.exists()) {
                        const userData = userDoc.data();
                        const name = userData.username || currentUser.displayName || 'Player';
                        const avatarId = userData.avatarId || 1;
                        const config = userData.customAvatarConfig || userData.customAvatar || null;
                        const mode = userData.useCustomAvatar ? 'custom' : 'premade';

                        setDisplayName(name);
                        setUsername(name);
                        setSelectedAvatarId(avatarId);
                        setCustomAvatarConfig(config);
                        setAvatarMode(mode);

                        // FIX: Set initial state immediately to match loaded data
                        initialStateRef.current = {
                            username: name,
                            avatarId: avatarId,
                            avatarMode: mode,
                            customAvatarConfig: config
                        };

                        setUser(currentUser);
                        // Save back to local storage for faster next load
                        await AsyncStorage.setItem('user_profile', JSON.stringify(userData));
                    } else {
                        const name = currentUser.displayName || currentUser.email?.split('@')[0] || 'Player';
                        setDisplayName(name);
                        setUsername(name);
                        setCustomAvatarConfig(null);
                        setAvatarMode('premade');

                        // FIX: Set initial baseline for new user
                        initialStateRef.current = {
                            username: name,
                            avatarId: 1,
                            avatarMode: 'premade',
                            customAvatarConfig: null
                        };

                        setUser(currentUser);
                    }

                    // REVENUECAT LOGIN
                    if (currentUser && currentUser.uid) {
                        try {
                            await PurchaseManager.loginUser(currentUser.uid);
                            console.log('Synced with RevenueCat');
                        } catch (err) {
                            console.log('RC Sync Error:', err);
                        }
                    }
                } catch (e) {
                    console.log('Error loading profile:', e);
                    const name = currentUser.displayName || currentUser.email?.split('@')[0] || 'Player';
                    setDisplayName(name);
                    setUsername(name);
                    setUser(currentUser);
                    setAvatarMode('premade');

                    // FIX: Set baseline on error fallback
                    initialStateRef.current = {
                        username: name,
                        avatarId: 1,
                        avatarMode: 'premade',
                        customAvatarConfig: null
                    };
                }
            } else {
                setUser(null);
                setDisplayName('');
                setUsername('');
                setCustomAvatarConfig(null);
                setAvatarMode('premade');
                initialStateRef.current = null;
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

                // Sync with RevenueCat for cross-device premium access
                await PurchaseManager.loginUser(user.uid);

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

        // CHECK UNIQUENESS
        if (trimmedUsername !== displayName) {
            try {
                const usersRef = collection(db, "users");
                const q = query(usersRef, where("username", "==", trimmedUsername));
                const querySnapshot = await getDocs(q);

                if (!querySnapshot.empty) {
                    // Check if the found user is NOT the current user (just in case)
                    const isTaken = querySnapshot.docs.some(doc => doc.id !== user.uid);
                    if (isTaken) {
                        Alert.alert('Username Taken', 'This username is already in use. Please choose another.');
                        setIsSaving(false);
                        return;
                    }
                }
            } catch (error) {
                console.error("Error checking username uniqueness:", error);
                Alert.alert('Error', 'Could not verify username availability. Please check your connection.');
                setIsSaving(false);
                return;
            }
        }
        playHaptic('medium');

        const userProfile = {
            username: trimmedUsername,
            email: user.email,
            avatarId: selectedAvatarId,
            customAvatar: customAvatarConfig,
            useCustomAvatar: avatarMode === 'custom', // Use explicit mode
            customAvatarConfig: customAvatarConfig,
            uid: user.uid,
            photoURL: user.photoURL,
            lastLogin: new Date().toISOString()
        };

        try {
            console.log('Saving profile (Optimistic)...');

            // 1. FAST SAVE: Local Storage (AsyncStorage)
            // This is blocking but fast (ms). Ensures next screen has data.
            await AsyncStorage.setItem('user_profile', JSON.stringify(userProfile));
            await AsyncStorage.setItem('displayName', trimmedUsername);

            // Update local state
            setDisplayName(trimmedUsername);

            // 2. BACKGROUND SAVE: Cloud Sync
            // Fire and forget. We don't block navigation for this.
            const backgroundSync = async () => {
                try {
                    await Promise.all([
                        setDoc(doc(db, "users", user.uid), userProfile, { merge: true }),
                        updateProfile(user, { displayName: trimmedUsername })
                    ]);
                    console.log('Background cloud sync complete');
                } catch (err) {
                    console.warn('Background cloud sync failed:', err);
                    // Silently fail or retry next time opens app
                }
            };
            backgroundSync();

            // 3. Navigate Immediately
            console.log('Local save done, navigating home...');
            playHaptic('success');

            // Check if we should show premium (every 3rd save)
            const saveCountStr = await AsyncStorage.getItem('profile_save_count');
            const saveCount = saveCountStr ? parseInt(saveCountStr, 10) : 0;
            const newSaveCount = saveCount + 1;
            await AsyncStorage.setItem('profile_save_count', newSaveCount.toString());
            console.log('Profile saved ' + newSaveCount + ' times');

            // Reset unsaved changes flag
            setHasUnsavedChanges(false);
            // DO NOT set isSaving(false) here - keep it true until navigation is done to prevent double clicks

            // Update initial state ref to current state
            initialStateRef.current = {
                username: trimmedUsername,
                avatarId: selectedAvatarId,
                avatarMode: avatarMode,
                customAvatarConfig: customAvatarConfig
            };

            // Check Premium Status
            const hasPremium = await checkPremiumStatus(user.email, user.uid);

            // Show premium every 3rd save ONLY IF not already premium
            if (!hasPremium && newSaveCount % 3 === 0 && newSaveCount > 0) {
                console.log('Navigating to Premium (save counter triggered)');
                // Pass returnToHome: true so 'x' goes to Home, not Profile
                navigation.navigate('Premium', { returnToHome: true });
            } else {
                navigation.navigate('Home');
            }
        } catch (error) {
            console.error('Local save failed:', error);
            playHaptic('error');
            Alert.alert('Error', 'Failed to save profile locally. Please try again.');
            setIsSaving(false);
        }
    };

    const handleSignOut = async () => {
        try {
            // Clear premium status BEFORE signing out acts to prevent UI flicker or race conditions
            if (user && user.uid) {
                const { clearPremiumCache } = require('../utils/PremiumManager');
                await clearPremiumCache(user.uid);
            }

            await GoogleSignin.signOut();
            await signOut(auth);
            await PurchaseManager.logoutUser(); // Clear RevenueCat user
            setUser(null);
            setDisplayName('');
            setUsername('');
            setCustomAvatarConfig(null);
            setAvatarMode('premade');
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

                            {/* Top Section: Username Form (Moved to Top) */}
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

                            {/* Middle Section: Avatar Toggle & Display */}
                            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                                {/* Toggle */}
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

                                {/* Avatar Wheel / Display */}
                                <View style={styles.avatarDisplayArea}>
                                    {avatarMode === 'custom' && customAvatarConfig ? (
                                        <View style={styles.customUrlContainer}>
                                            <View style={[styles.customAvatarPreview, { borderColor: theme.colors.primary }]}>
                                                <CustomBuiltAvatar
                                                    config={customAvatarConfig}
                                                    size={160} // Larger custom avatar
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
                            </View>

                            {/* Bottom Section: Buttons */}
                            <View style={styles.bottomSection}>
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
                        {/* Header with Safe Area spacing */}
                        <View style={styles.builderHeader}>
                            <Text style={styles.builderTitle}>DESIGN YOUR AVATAR</Text>
                            <TouchableOpacity
                                onPress={() => setShowBuilder(false)}
                                style={styles.closeBtn}
                                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                            >
                                <Text style={styles.closeBtnText}>CLOSE</Text>
                            </TouchableOpacity>
                        </View>

                        <AvatarBuilder
                            initialConfig={customAvatarConfig}
                            theme={theme}
                            hasPremium={isPremium}
                            navigation={navigation}
                            onCancel={() => setShowBuilder(false)}
                            onSave={(config) => {
                                setCustomAvatarConfig(config);
                                setShowBuilder(false);
                                playHaptic('success');
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

        topSection: { alignItems: 'center', marginTop: 10, zIndex: 60 },
        sectionTitle: { fontSize: 14, fontFamily: 'Panchang-Bold', letterSpacing: 4, marginBottom: 12 },
        toggleContainer: { flexDirection: 'row', backgroundColor: theme.colors.surface, borderRadius: 12, padding: 4, borderWidth: 1, borderColor: theme.colors.primary + '30' },
        toggleBtn: { paddingVertical: 6, paddingHorizontal: 16, borderRadius: 8 },
        toggleBtnActive: { backgroundColor: theme.colors.primary },
        toggleBtnText: { fontSize: 11, fontFamily: 'Teko-Bold', color: theme.colors.textMuted, letterSpacing: 1 },
        toggleBtnTextActive: { color: theme.colors.secondary },

        avatarDisplayArea: { flex: 1, alignItems: 'center', justifyContent: 'center', zIndex: 10 },

        customUrlContainer: { alignItems: 'center', gap: 16 },
        customAvatarPreview: { width: 170, height: 170, borderRadius: 85, borderWidth: 4, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.surface },
        editCustomBtn: { paddingVertical: 8, paddingHorizontal: 16, borderWidth: 1, borderColor: theme.colors.primary, borderRadius: 8 },
        editCustomBtnText: { color: theme.colors.primary, fontFamily: 'Teko-Medium', fontSize: 14, letterSpacing: 1 },

        bottomSection: { width: '100%', gap: 10, zIndex: 100 },
        formContainer: { width: '100%', marginBottom: 10 },
        label: { fontSize: 11, fontFamily: 'Panchang-Bold', letterSpacing: 2, marginBottom: 6, marginLeft: 4 },
        input: { width: '100%', height: 48, borderRadius: 12, borderWidth: 1, paddingHorizontal: 16, fontSize: 18, fontFamily: 'Amulya-Bold' },
        email: { fontSize: 11, marginTop: 4, marginLeft: 4, fontFamily: 'CabinetGrotesk-Medium' },

        buttonRow: { flexDirection: 'row', gap: 12, alignItems: 'center' },
        saveButton: { flex: 2, height: 50, borderRadius: 25, alignItems: 'center', justifyContent: 'center', shadowColor: theme.colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 4 },
        buttonText: { fontSize: 16, fontFamily: 'Panchang-Bold', letterSpacing: 2 },

        signOutButton: { flex: 1, height: 50, borderRadius: 25, alignItems: 'center', justifyContent: 'center', borderWidth: 2 },
        buttonTextSmall: { fontSize: 14, fontFamily: 'Panchang-Bold', letterSpacing: 1 },

        // Signed Out Styles
        signedOutContainer: { flex: 1, padding: 40, alignItems: 'center', justifyContent: 'center' },
        placeholderIcon: { marginBottom: 30, opacity: 0.5 },
        welcomeText: { fontSize: 16, color: theme.colors.text, textAlign: 'center', fontFamily: 'CabinetGrotesk-Medium', lineHeight: 24, marginBottom: 40 },
        googleButton: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', width: '100%', height: 56, borderRadius: 28, borderWidth: 1, borderColor: '#ddd' },
        googleIconPlaceholder: { width: 20, height: 20, backgroundColor: 'red', marginRight: 10, borderRadius: 10 },

        // Builder Modal
        builderContainer: { flex: 1, paddingTop: Platform.OS === 'ios' ? 20 : 40, backgroundColor: theme.colors.background },
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


