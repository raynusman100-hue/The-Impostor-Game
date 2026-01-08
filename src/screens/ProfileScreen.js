import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, BackHandler, Animated, PanResponder, Dimensions, Modal } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile, onAuthStateChanged, sendEmailVerification, signOut, reload, sendPasswordResetEmail, deleteUser, reauthenticateWithCredential, EmailAuthProvider, signInWithCredential, GoogleAuthProvider } from 'firebase/auth';
import { ref, get, set, child, remove } from 'firebase/database';
import { auth, database } from '../utils/firebase';
import { useTheme } from '../utils/ThemeContext';
import { playHaptic } from '../utils/haptics';
import { CustomAvatar, TOTAL_AVATARS } from '../utils/AvatarGenerator';
import { CustomBuiltAvatar, AvatarBuilder } from '../components/CustomAvatarBuilder';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';

// Omnitrix-style Avatar Wheel - Drag to rotate like a dial!
const AvatarWheel = ({ selectedId, onSelect, theme }) => {
    const WHEEL_SIZE = 260;
    const CENTER_SIZE = 80;
    const AVATAR_SIZE = 44;
    const RADIUS = 88;
    const DEGREES_PER_AVATAR = 360 / TOTAL_AVATARS;

    // Physics constants
    const FRICTION = 0.96;
    const MIN_VELOCITY = 0.3;

    // State and refs
    const [selected, setSelected] = useState(selectedId);
    // To show avatar N at top, rotation = -((N-1) * DEGREES_PER_AVATAR)
    const rotationRef = useRef(-((selectedId - 1) * DEGREES_PER_AVATAR));
    const rotation = useRef(new Animated.Value(rotationRef.current)).current;
    const centerScale = useRef(new Animated.Value(1)).current;
    const velocityRef = useRef(0);
    const animationRef = useRef(null);
    const isSpinning = useRef(false);

    // For angular tracking - store wheel's position on screen
    const wheelLayoutRef = useRef({ x: 0, y: 0, width: WHEEL_SIZE, height: WHEEL_SIZE });
    const lastAngleRef = useRef(0);
    const prevAnglesRef = useRef([]); // Store recent angles for velocity calculation

    // Sync with external prop
    useEffect(() => {
        if (!isSpinning.current) {
            const deg = -((selectedId - 1) * DEGREES_PER_AVATAR);
            rotationRef.current = deg;
            rotation.setValue(deg);
            setSelected(selectedId);
        }
    }, [selectedId]);

    // Get avatar at TOP position (12 o'clock)
    // When wheel rotates clockwise (positive), avatars move clockwise away from top
    // So a positive rotation brings LOWER indexed avatars to top (wrapping around)
    const getAvatarAtTop = (deg) => {
        // Negative because clockwise rotation moves avatars away from top
        let normalized = (-deg) % 360;
        if (normalized < 0) normalized += 360;
        const index = Math.round(normalized / DEGREES_PER_AVATAR) % TOTAL_AVATARS;
        return index + 1;
    };

    // Snap to nearest avatar - ensure an avatar is exactly at top
    const snapToNearest = () => {
        // Calculate which avatar index is closest to being at top
        const currentAvatarAtTop = getAvatarAtTop(rotationRef.current);
        // Calculate the rotation needed to put that avatar exactly at top
        const snapDeg = -((currentAvatarAtTop - 1) * DEGREES_PER_AVATAR);
        // Normalize to be close to current rotation (avoid big jumps)
        let targetDeg = snapDeg;
        while (targetDeg - rotationRef.current > 180) targetDeg -= 360;
        while (targetDeg - rotationRef.current < -180) targetDeg += 360;

        Animated.spring(rotation, {
            toValue: targetDeg,
            friction: 8,
            tension: 50,
            useNativeDriver: false,
        }).start(() => {
            rotationRef.current = targetDeg;
            const newId = getAvatarAtTop(targetDeg);
            // Always update selection and call onSelect
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

    // Momentum spin animation - optimized for performance
    const startMomentumSpin = () => {
        if (animationRef.current) cancelAnimationFrame(animationRef.current);
        isSpinning.current = true;

        let lastUpdateTime = Date.now();
        let lastSelectedAvatar = selected;

        const animate = () => {
            velocityRef.current *= FRICTION;
            rotationRef.current += velocityRef.current;
            rotation.setValue(rotationRef.current);

            // Throttle state updates to reduce re-renders
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

    // Calculate angle from wheel center to a point (in degrees)
    const getAngle = (pageX, pageY) => {
        const layout = wheelLayoutRef.current;
        const centerX = layout.x + layout.width / 2;
        const centerY = layout.y + layout.height / 2;
        const dx = pageX - centerX;
        const dy = pageY - centerY;
        // atan2 returns angle in radians, convert to degrees
        // We want 0° at top, increasing clockwise
        return Math.atan2(dx, -dy) * (180 / Math.PI);
    };

    // Handle wheel layout measurement
    const onWheelLayout = (event) => {
        const { x, y, width, height } = event.nativeEvent.layout;
        // We need to measure relative to screen, so use measure()
        if (wheelRef.current) {
            wheelRef.current.measure((fx, fy, w, h, px, py) => {
                wheelLayoutRef.current = { x: px, y: py, width: w, height: h };
            });
        }
    };

    const wheelRef = useRef(null);
    const isDragging = useRef(false);

    // PanResponder with proper angular tracking
    // Only capture gestures when there's actual movement, allow taps to pass through
    const panResponder = useRef(
        PanResponder.create({
            // Don't capture on initial touch - let taps pass through to avatars
            onStartShouldSetPanResponder: () => false,
            // Only capture when there's significant movement (drag)
            onMoveShouldSetPanResponder: (_, gesture) => {
                const dominated = Math.abs(gesture.dx) > 8 || Math.abs(gesture.dy) > 8;
                return dominated;
            },

            onPanResponderGrant: (evt) => {
                stopAnimation();
                isSpinning.current = true;
                isDragging.current = true;
                prevAnglesRef.current = [];

                // Measure wheel position right when touch starts
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

                // Calculate delta with wrap-around handling
                let delta = currentAngle - lastAngleRef.current;
                if (delta > 180) delta -= 360;
                if (delta < -180) delta += 360;

                // Store for velocity calculation
                const now = Date.now();
                prevAnglesRef.current.push({ angle: currentAngle, time: now });
                // Keep only last 5 samples
                if (prevAnglesRef.current.length > 5) prevAnglesRef.current.shift();

                lastAngleRef.current = currentAngle;

                // Apply rotation directly - 1:1 tracking like Omnitrix dial
                rotationRef.current += delta;
                rotation.setValue(rotationRef.current);

                // Update selection during drag
                const currentAvatar = getAvatarAtTop(rotationRef.current);
                if (currentAvatar !== selected) {
                    setSelected(currentAvatar);
                }
            },

            onPanResponderRelease: () => {
                isDragging.current = false;

                // Calculate velocity from recent angle samples
                const samples = prevAnglesRef.current;
                if (samples.length >= 2) {
                    const oldest = samples[0];
                    const newest = samples[samples.length - 1];
                    const timeDiff = newest.time - oldest.time;

                    if (timeDiff > 0) {
                        let angleDiff = newest.angle - oldest.angle;
                        if (angleDiff > 180) angleDiff -= 360;
                        if (angleDiff < -180) angleDiff += 360;

                        // Convert to velocity (degrees per frame at 60fps)
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

            onPanResponderTerminate: () => {
                isDragging.current = false;
                snapToNearest();
            },
        })
    ).current;

    // Spin wheel to put a specific avatar at top
    const spinToAvatar = (avatarId) => {
        stopAnimation();
        isSpinning.current = true;

        // Calculate target rotation to put this avatar at top
        const targetDeg = -((avatarId - 1) * DEGREES_PER_AVATAR);

        // Find the shortest path (could go clockwise or counter-clockwise)
        let diff = targetDeg - rotationRef.current;
        // Normalize to -180 to 180
        while (diff > 180) diff -= 360;
        while (diff < -180) diff += 360;

        const finalTarget = rotationRef.current + diff;

        playHaptic('medium');

        Animated.spring(rotation, {
            toValue: finalTarget,
            friction: 7,
            tension: 40,
            useNativeDriver: false,
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

    // Render avatar at wheel position using trigonometry
    const renderAvatar = (index) => {
        const avatarId = index + 1;
        // Avatar 1 (index 0) should be at top (270° in standard math, or -90°)
        // Each subsequent avatar is spaced by DEGREES_PER_AVATAR clockwise
        const angleInDegrees = -90 + (index * DEGREES_PER_AVATAR);
        const angleInRadians = (angleInDegrees * Math.PI) / 180;

        // Calculate position on circle
        const x = WHEEL_SIZE / 2 + RADIUS * Math.cos(angleInRadians) - AVATAR_SIZE / 2;
        const y = WHEEL_SIZE / 2 + RADIUS * Math.sin(angleInRadians) - AVATAR_SIZE / 2;

        const isSelected = avatarId === selected;

        return (
            <TouchableOpacity
                key={avatarId}
                activeOpacity={0.7}
                onPress={() => spinToAvatar(avatarId)}
                style={[
                    styles.avatarSlot,
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
            style={[styles.wheelContainer, { width: WHEEL_SIZE, height: WHEEL_SIZE }]}
            {...panResponder.panHandlers}
        >
            {/* Background rings */}
            <View style={[styles.outerRing, {
                width: WHEEL_SIZE, height: WHEEL_SIZE,
                borderRadius: WHEEL_SIZE / 2,
                borderColor: theme.colors.primary + '20',
            }]} />
            <View style={[styles.innerRing, {
                width: WHEEL_SIZE - 30, height: WHEEL_SIZE - 30,
                borderRadius: (WHEEL_SIZE - 30) / 2,
                borderColor: theme.colors.primary + '10',
                backgroundColor: theme.colors.background,
            }]} />

            {/* Selection indicator at TOP (12 o'clock) */}
            <View style={styles.selectorContainer}>
                <View style={[styles.selectorLine, { backgroundColor: theme.colors.primary }]} />
                <View style={[styles.selectorArrow, { borderTopColor: theme.colors.primary }]} />
            </View>

            {/* Rotating wheel with avatars */}
            <Animated.View
                style={[
                    styles.wheel,
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

            {/* Center display - shows selected avatar */}
            <Animated.View style={[
                styles.centerHub,
                {
                    width: CENTER_SIZE, height: CENTER_SIZE,
                    borderRadius: CENTER_SIZE / 2,
                    backgroundColor: theme.colors.surface,
                    borderColor: theme.colors.primary,
                    transform: [{ scale: centerScale }],
                }
            ]}>
                <View style={[styles.centerInner, {
                    width: CENTER_SIZE - 8, height: CENTER_SIZE - 8,
                    borderRadius: (CENTER_SIZE - 8) / 2,
                    backgroundColor: theme.colors.background,
                    borderColor: theme.colors.primary + '50',
                }]}>
                    <CustomAvatar id={selected} size={CENTER_SIZE - 22} />
                </View>
            </Animated.View>

            {/* Badge showing current selection */}
            <View style={[styles.badge, { backgroundColor: theme.colors.primary }]}>
                <Text style={[styles.badgeText, { color: theme.colors.secondary }]}>{selected}/{TOTAL_AVATARS}</Text>
            </View>

            {/* Hint text */}
            <Text style={[styles.hint, { color: theme.colors.textMuted }]}>← SPIN →</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    wheelContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    outerRing: {
        position: 'absolute',
        borderWidth: 3,
    },
    innerRing: {
        position: 'absolute',
        borderWidth: 2,
    },
    wheel: {
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
    },
    avatarSlot: {
        position: 'absolute',
        alignItems: 'center',
        justifyContent: 'center',
    },
    centerHub: {
        position: 'absolute',
        borderWidth: 4,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 10,
    },
    centerInner: {
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
    },
    selectorContainer: {
        position: 'absolute',
        top: 0,
        alignItems: 'center',
        zIndex: 20,
    },
    selectorContainerRight: {
        position: 'absolute',
        right: 0,
        top: '50%',
        marginTop: -15,
        flexDirection: 'row',
        alignItems: 'center',
        zIndex: 20,
    },
    selectorLine: {
        width: 4,
        height: 30,
        borderRadius: 2,
    },
    selectorLineRight: {
        width: 30,
        height: 4,
        borderRadius: 2,
    },
    selectorArrow: {
        width: 0,
        height: 0,
        borderLeftWidth: 8,
        borderRightWidth: 8,
        borderTopWidth: 12,
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
        marginTop: -2,
    },
    selectorArrowRight: {
        width: 0,
        height: 0,
        borderTopWidth: 8,
        borderBottomWidth: 8,
        borderLeftWidth: 12,
        borderTopColor: 'transparent',
        borderBottomColor: 'transparent',
        marginRight: -2,
    },
    badge: {
        position: 'absolute',
        bottom: 10,
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
        zIndex: 20,
    },
    badgeText: {
        fontSize: 11,
        fontFamily: 'Panchang-Bold',
        letterSpacing: 1,
    },
    hint: {
        position: 'absolute',
        bottom: -18,
        fontSize: 10,
        fontFamily: 'Teko-Medium',
        letterSpacing: 2,
    },
});

// Film perforation component
const FilmPerforations = ({ side, theme }) => {
    const perforationColor = theme.colors.primary + '40';
    return (
        <View style={[filmStyles.perforationStrip, side === 'left' ? filmStyles.leftStrip : filmStyles.rightStrip]}>
            {[...Array(16)].map((_, i) => (
                <View key={i} style={[filmStyles.perforation, { backgroundColor: perforationColor, borderColor: theme.colors.primary + '30' }]} />
            ))}
        </View>
    );
};

const filmStyles = StyleSheet.create({
    perforationStrip: {
        position: 'absolute',
        top: 0,
        bottom: 0,
        width: 16,
        justifyContent: 'space-evenly',
        alignItems: 'center',
        paddingVertical: 30,
        zIndex: 1,
    },
    leftStrip: { left: 2 },
    rightStrip: { right: 2 },
    perforation: {
        width: 8,
        height: 12,
        borderRadius: 2,
        borderWidth: 1,
    },
});

// Cinematic button component
const CinemaButton = ({ title, onPress, variant = 'primary', theme, style }) => (
    <TouchableOpacity
        onPress={() => { playHaptic('medium'); onPress(); }}
        activeOpacity={0.8}
        style={[
            {
                backgroundColor: variant === 'primary' ? theme.colors.primary :
                    variant === 'error' ? theme.colors.error + '20' : theme.colors.surface,
                borderWidth: 2,
                borderColor: variant === 'primary' ? theme.colors.primary :
                    variant === 'error' ? theme.colors.error : theme.colors.primary,
                borderRadius: 8,
                paddingVertical: 10,
                paddingHorizontal: 16,
                alignItems: 'center',
            },
            style
        ]}
    >
        <Text style={{
            color: variant === 'primary' ? theme.colors.secondary :
                variant === 'error' ? theme.colors.error : theme.colors.text,
            fontSize: 13,
            fontFamily: 'CabinetGrotesk-Black',
            letterSpacing: 2,
        }}>
            {title}
        </Text>
    </TouchableOpacity>
);

export default function ProfileScreen({ navigation }) {
    const { theme } = useTheme();
    const styles = getStyles(theme);

    const [firebaseUser, setFirebaseUser] = useState(null);
    const [authLoading, setAuthLoading] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [username, setUsername] = useState('');
    const [selectedAvatarId, setSelectedAvatarId] = useState(1);
    const [useCustomAvatar, setUseCustomAvatar] = useState(false);
    const [customAvatarConfig, setCustomAvatarConfig] = useState(null);
    const [showAvatarBuilder, setShowAvatarBuilder] = useState(false);
    const [mode, setMode] = useState('login');
    const [generatedCode, setGeneratedCode] = useState('');
    const [existingProfile, setExistingProfile] = useState(null);

    useEffect(() => {
        const backAction = () => { handleBackPress(); return true; };
        const backHandler = BackHandler.addEventListener("hardwareBackPress", backAction);
        return () => backHandler.remove();
    }, [mode, username, selectedAvatarId, existingProfile]);

    const hasUnsavedChanges = () => {
        if (!existingProfile) return true;
        return username !== existingProfile.username ||
            selectedAvatarId !== existingProfile.avatarId ||
            useCustomAvatar !== (existingProfile.useCustomAvatar || false) ||
            JSON.stringify(customAvatarConfig) !== JSON.stringify(existingProfile.customAvatarConfig);
    };

    const handleBackPress = () => {
        if (mode === 'profile_setup' || (mode === 'profile_view' && hasUnsavedChanges())) {
            Alert.alert("Unsaved Changes", "Save before leaving?", [
                { text: "Leave", onPress: () => safeGoBack(), style: "destructive" },
                { text: "Save", onPress: handleSaveProfile },
                { text: "Cancel", style: "cancel" }
            ]);
        } else {
            safeGoBack();
        }
    };

    // Safe navigation that checks if we can go back
    const safeGoBack = () => {
        if (navigation.canGoBack()) {
            navigation.goBack();
        } else {
            navigation.navigate('Home');
        }
    };



    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setFirebaseUser(user);
            setAuthLoading(false);
            if (user) {
                if (!user.emailVerified) {
                    setMode('verification');
                } else {
                    if (user.displayName) {
                        setMode('profile_view');
                        setUsername(user.displayName);
                        loadProfile(user);
                    } else {
                        setMode('profile_setup');
                    }
                }
            } else {
                setMode('login');
            }
        });

        GoogleSignin.configure({
            webClientId: '831244408092-mn4bhuvq6v4il0nippaiaf7q729o97bu.apps.googleusercontent.com',
        });

        return unsubscribe;
    }, []);

    const handleGoogleLogin = async () => {
        try {
            playHaptic('medium');
            await GoogleSignin.hasPlayServices();
            const userInfo = await GoogleSignin.signIn();
            const idToken = userInfo.data.idToken;
            const credential = GoogleAuthProvider.credential(idToken);
            await signInWithCredential(auth, credential);
            playHaptic('success');
        } catch (error) {
            if (error.code === statusCodes.SIGN_IN_CANCELLED) {
                // user cancelled the login flow
            } else if (error.code === statusCodes.IN_PROGRESS) {
                // operation (e.g. sign in) is in progress already
            } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
                // play services not available or outdated
                Alert.alert('Error', 'Google Play Services not available');
            } else {
                // some other error happened
                console.error(error);
                Alert.alert('Google Login Error', error.message);
            }
        }
    };

    const loadProfile = async (user) => {
        try {
            const savedProfile = await AsyncStorage.getItem('user_profile');
            if (savedProfile) {
                const profile = JSON.parse(savedProfile);
                setExistingProfile(profile);
                setSelectedAvatarId(profile.avatarId || 1);
                setUseCustomAvatar(profile.useCustomAvatar || false);
                setCustomAvatarConfig(profile.customAvatarConfig || null);
                if (profile.username) setUsername(profile.username);
            } else {
                generateNewCode();
            }
        } catch (error) {
            console.log('Error loading profile', error);
        }
    };

    const generateNewCode = () => {
        const letters = "ABCDEFGHJKLMNPQRSTUVWXYZ";
        const numbers = "23456789";
        let code = "#";
        for (let i = 0; i < 2; i++) code += letters.charAt(Math.floor(Math.random() * letters.length));
        for (let i = 0; i < 2; i++) code += numbers.charAt(Math.floor(Math.random() * numbers.length));
        setGeneratedCode(code);
    };

    const handleSignup = async () => {
        if (!email.trim() || !password.trim()) { Alert.alert('Error', 'Please enter email and password'); return; }
        if (password.length < 6) { Alert.alert('Error', 'Password must be at least 6 characters'); return; }
        if (password !== confirmPassword) { Alert.alert('Error', 'Passwords do not match'); return; }
        try {
            playHaptic('medium');
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            await sendEmailVerification(userCredential.user);
            playHaptic('success');
        } catch (error) {
            if (error.code === 'auth/email-already-in-use') Alert.alert('Error', 'Email already in use.');
            else Alert.alert('Signup Failed', error.message);
        }
    };

    const handleLogin = async () => {
        if (!email.trim() || !password.trim()) { Alert.alert('Error', 'Please enter email and password'); return; }
        try {
            playHaptic('medium');
            await signInWithEmailAndPassword(auth, email, password);
            playHaptic('success');
        } catch (error) {
            Alert.alert('Login Failed', 'Invalid email or password');
        }
    };



    const handlePasswordReset = async () => {
        if (!email.trim()) { Alert.alert('Error', 'Please enter your email'); return; }
        try {
            playHaptic('medium');
            await sendPasswordResetEmail(auth, email);
            playHaptic('success');
            Alert.alert('Email Sent', 'Check your inbox for reset link.', [{ text: 'OK', onPress: () => setMode('login') }]);
        } catch (error) {
            Alert.alert('Error', error.code === 'auth/user-not-found' ? 'No account found.' : error.message);
        }
    };

    const handleCheckVerification = async () => {
        if (!firebaseUser) return;
        playHaptic('light');
        try {
            await reload(firebaseUser);
            if (firebaseUser.emailVerified) {
                playHaptic('success');
                setMode(firebaseUser.displayName ? 'profile_view' : 'profile_setup');
            } else {
                Alert.alert('Not Verified', 'Please check your inbox.');
            }
        } catch (e) { console.log("Reload error", e); }
    };

    const handleResendVerification = async () => {
        if (!firebaseUser) return;
        try {
            playHaptic('medium');
            await sendEmailVerification(firebaseUser);
            playHaptic('success');
            Alert.alert('Email Sent', 'Verification email resent.');
        } catch (error) {
            Alert.alert('Error', error.code === 'auth/too-many-requests' ? 'Too many requests.' : 'Failed to resend.');
        }
    };

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
                    // Also check if there's any auth user with this UID by checking usernames
                    // If the username entry exists but user data doesn't, it's orphaned
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
        if (!oldName || !firebaseUser) return;
        const usernameRef = ref(database, `usernames/${oldName.toLowerCase()}`);
        const snapshot = await get(usernameRef);
        if (snapshot.exists()) {
            const data = snapshot.val();
            const ownerUid = typeof data === 'string' ? data : data.uid;
            if (ownerUid === firebaseUser.uid) {
                await set(usernameRef, { uid: firebaseUser.uid, releasedAt: Date.now() });
            }
        }
    };

    const handleSaveProfile = async () => {
        const name = username.trim();
        if (!name) { Alert.alert('Error', 'Please enter a username'); return; }
        if (name.length > 12) { Alert.alert('Error', 'Username too long (max 12)'); return; }
        playHaptic('medium');
        try {
            const ownerUid = await checkUsernameOwner(name);
            if (ownerUid && ownerUid !== firebaseUser.uid) {
                playHaptic('error');
                Alert.alert('Username Taken', 'Choose another username.');
                return;
            }
            const oldUsername = existingProfile?.username || firebaseUser.displayName;
            if (oldUsername && oldUsername.toLowerCase() !== name.toLowerCase()) {
                await releaseUsername(oldUsername);
            }

            // Save username registry entry
            await set(ref(database, `usernames/${name.toLowerCase()}`), { uid: firebaseUser.uid });

            // Save user data (so we can verify username ownership later)
            await set(ref(database, `users/${firebaseUser.uid}`), {
                username: name,
                avatarId: selectedAvatarId,
                updatedAt: Date.now()
            });

            await updateProfile(firebaseUser, { displayName: name });
            const userProfile = {
                username: name,
                avatarId: selectedAvatarId,
                useCustomAvatar: useCustomAvatar,
                customAvatarConfig: customAvatarConfig,
                userCode: existingProfile ? existingProfile.userCode : generatedCode,
                updatedAt: new Date().toISOString()
            };
            await AsyncStorage.setItem('user_profile', JSON.stringify(userProfile));
            setExistingProfile(userProfile);
            playHaptic('success');
            Alert.alert('Saved', 'Profile updated.', [{ text: 'OK', onPress: () => { setMode('profile_view'); safeGoBack(); } }]);
        } catch (error) {
            Alert.alert('Error', 'Failed to save. ' + error.message);
        }
    };

    const handleLogout = async () => {
        Alert.alert('Logout', 'Are you sure?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Logout', style: 'destructive',
                onPress: async () => {
                    await AsyncStorage.removeItem('user_profile');
                    await signOut(auth);
                    setExistingProfile(null);
                    setUsername('');
                    setEmail('');
                    setPassword('');
                    setMode('login');
                    playHaptic('medium');
                }
            }
        ]);
    };

    const [deletePassword, setDeletePassword] = useState('');
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    // GOOGLE PLAY COMPLIANCE: In-app account deletion
    const handleDeleteAccount = async () => {
        Alert.alert(
            'Delete Account',
            'This will permanently delete your account and all associated data. This action cannot be undone.',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete Account',
                    style: 'destructive',
                    onPress: () => setShowDeleteModal(true)
                }
            ]
        );
    };

    const performAccountDeletion = async () => {
        if (!firebaseUser || !deletePassword) {
            Alert.alert('Error', 'Password is required to delete account.');
            return;
        }

        setShowDeleteModal(false);
        playHaptic('medium');

        try {
            // Re-authenticate user before deletion
            const credential = EmailAuthProvider.credential(firebaseUser.email, deletePassword);
            await reauthenticateWithCredential(firebaseUser, credential);

            // Delete username from database (check both existingProfile and displayName)
            const usernameToDelete = existingProfile?.username || firebaseUser.displayName;
            if (usernameToDelete) {
                await remove(ref(database, `usernames/${usernameToDelete.toLowerCase()}`));
            }
            await remove(ref(database, `users/${firebaseUser.uid}`));

            // Clear local storage
            await AsyncStorage.removeItem('user_profile');
            await AsyncStorage.removeItem('user_settings');

            // Delete Firebase Auth account
            await deleteUser(firebaseUser);

            playHaptic('success');
            Alert.alert('Account Deleted', 'Your account and all data have been permanently deleted.');

            setExistingProfile(null);
            setUsername('');
            setEmail('');
            setPassword('');
            setDeletePassword('');
            setMode('login');
        } catch (error) {
            playHaptic('error');
            setDeletePassword('');
            if (error.code === 'auth/wrong-password') {
                Alert.alert('Error', 'Incorrect password. Please try again.');
            } else if (error.code === 'auth/requires-recent-login') {
                Alert.alert('Session Expired', 'Please log out and log back in, then try again.');
            } else {
                Alert.alert('Error', 'Failed to delete account: ' + error.message);
            }
        }
    };

    // Open Privacy Policy
    const openPrivacyPolicy = () => {
        playHaptic('light');
        navigation.navigate('PrivacyPolicy');
    };

    // Open Terms of Service
    const openTermsOfService = () => {
        playHaptic('light');
        navigation.navigate('TermsOfService');
    };

    // --- Render Functions ---

    const renderHeader = (title) => (
        <View style={styles.header}>
            <TouchableOpacity onPress={handleBackPress} style={styles.backBtn}>
                <Text style={styles.backText}>‹</Text>
            </TouchableOpacity>
            <View style={styles.headerCenter}>
                <View style={styles.kodakBadge}>
                    <Text style={styles.kodakBadgeText}>{title}</Text>
                </View>
            </View>
            <View style={{ width: 40 }} />
        </View>
    );

    const renderAuthForm = () => (
        <View style={styles.filmFrame}>
            <Text style={styles.frameTitle}>
                {mode === 'login' ? '★ WELCOME BACK ★' : '★ JOIN THE CAST ★'}
            </Text>

            <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>EMAIL</Text>
                <TextInput
                    style={styles.input}
                    value={email}
                    onChangeText={setEmail}
                    placeholder="your@email.com"
                    placeholderTextColor={theme.colors.textMuted}
                    keyboardType="email-address"
                    autoCapitalize="none"
                />
            </View>

            <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>PASSWORD</Text>
                <TextInput
                    style={styles.input}
                    value={password}
                    onChangeText={setPassword}
                    placeholder="••••••"
                    placeholderTextColor={theme.colors.textMuted}
                    secureTextEntry
                    autoCapitalize="none"
                />
            </View>

            {mode === 'signup' && (
                <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>CONFIRM PASSWORD</Text>
                    <TextInput
                        style={styles.input}
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        placeholder="••••••"
                        placeholderTextColor={theme.colors.textMuted}
                        secureTextEntry
                        autoCapitalize="none"
                    />
                </View>
            )}

            {mode === 'login' && (
                <TouchableOpacity onPress={() => { playHaptic('light'); setMode('forgot_password'); }} style={styles.forgotBtn}>
                    <Text style={styles.forgotText}>FORGOT PASSWORD?</Text>
                </TouchableOpacity>
            )}

            <CinemaButton
                title={mode === 'login' ? "SIGN IN" : "SIGN UP"}
                onPress={mode === 'login' ? handleLogin : handleSignup}
                theme={theme}
                style={{ marginTop: 8 }}
            />

            {mode === 'login' && (
                <>
                    <View style={styles.divider}>
                        <View style={styles.dividerLine} />
                        <Text style={styles.dividerText}>OR</Text>
                        <View style={styles.dividerLine} />
                    </View>

                    <CinemaButton
                        title="G - SIGN IN WITH GOOGLE"
                        onPress={handleGoogleLogin}
                        theme={theme}
                        variant="secondary"
                        style={{ borderColor: theme.colors.textSecondary }}
                    />
                </>
            )}





            <TouchableOpacity onPress={() => { playHaptic('light'); setMode(mode === 'login' ? 'signup' : 'login'); }}>
                <Text style={styles.switchText}>
                    {mode === 'login' ? "New here? CREATE ACCOUNT" : "Have account? SIGN IN"}
                </Text>
            </TouchableOpacity>

            {/* Legal Links - Required by Apple before signup */}
            <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 12, marginTop: 14 }}>
                <TouchableOpacity onPress={openPrivacyPolicy}>
                    <Text style={{ color: theme.colors.textMuted, fontSize: 10, fontFamily: 'Teko-Medium', textDecorationLine: 'underline' }}>Privacy Policy</Text>
                </TouchableOpacity>
                <Text style={{ color: theme.colors.textMuted, fontSize: 10 }}>•</Text>
                <TouchableOpacity onPress={openTermsOfService}>
                    <Text style={{ color: theme.colors.textMuted, fontSize: 10, fontFamily: 'Teko-Medium', textDecorationLine: 'underline' }}>Terms of Service</Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    const renderForgotPassword = () => (
        <View style={styles.filmFrame}>
            <Text style={styles.frameTitle}>★ RESET PASSWORD ★</Text>
            <Text style={styles.infoText}>Enter your email to receive a reset link.</Text>
            <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>EMAIL</Text>
                <TextInput
                    style={styles.input}
                    value={email}
                    onChangeText={setEmail}
                    placeholder="your@email.com"
                    placeholderTextColor={theme.colors.textMuted}
                    keyboardType="email-address"
                    autoCapitalize="none"
                />
            </View>
            <CinemaButton title="SEND RESET LINK" onPress={handlePasswordReset} theme={theme} />
            <TouchableOpacity onPress={() => { playHaptic('light'); setMode('login'); }} style={{ marginTop: 16 }}>
                <Text style={styles.switchText}>← Back to Login</Text>
            </TouchableOpacity>
        </View>
    );

    const renderVerification = () => (
        <View style={styles.filmFrame}>
            <Text style={[styles.frameTitle, { color: theme.colors.primary }]}>★ VERIFICATION ★</Text>
            <Text style={styles.infoText}>We sent a verification email to:</Text>
            <Text style={[styles.infoText, { color: theme.colors.text, fontFamily: 'Panchang-Bold', marginVertical: 8 }]}>
                {firebaseUser?.email}
            </Text>
            <View style={{ gap: 10, marginTop: 16, width: '100%' }}>
                <CinemaButton title="I HAVE VERIFIED" onPress={handleCheckVerification} theme={theme} />
                <CinemaButton title="RESEND EMAIL" onPress={handleResendVerification} variant="secondary" theme={theme} />
                <CinemaButton title="LOGOUT" onPress={handleLogout} variant="error" theme={theme} />
            </View>
        </View>
    );

    const renderProfileSetup = (isEditing = false) => {
        // If showing avatar builder modal
        if (showAvatarBuilder) {
            return (
                <View style={[styles.filmFrame, { flex: 1 }]}>
                    <Text style={styles.frameTitle}>★ CREATE AVATAR ★</Text>
                    <AvatarBuilder
                        initialConfig={customAvatarConfig}
                        onSave={(config) => {
                            setCustomAvatarConfig(config);
                            setUseCustomAvatar(true);
                            setShowAvatarBuilder(false);
                        }}
                        onCancel={() => setShowAvatarBuilder(false)}
                        theme={theme}
                    />
                </View>
            );
        }

        return (
            <View style={styles.filmFrame}>
                <Text style={styles.frameTitle}>
                    {isEditing ? '★ YOUR PROFILE ★' : '★ SETUP PROFILE ★'}
                </Text>

                {/* Avatar Type Toggle */}
                <View style={styles.avatarToggle}>
                    <TouchableOpacity
                        onPress={() => { playHaptic('light'); setUseCustomAvatar(false); }}
                        style={[
                            styles.toggleBtn,
                            !useCustomAvatar && { backgroundColor: theme.colors.primary }
                        ]}
                    >
                        <Text style={[styles.toggleText, { color: !useCustomAvatar ? theme.colors.secondary : theme.colors.textMuted }]}>
                            PRE-MADE
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        onPress={() => {
                            playHaptic('light');
                            if (!customAvatarConfig) {
                                // No custom avatar yet, open builder
                                setShowAvatarBuilder(true);
                            } else {
                                // Already have custom avatar, just switch to it
                                setUseCustomAvatar(true);
                            }
                        }}
                        style={[
                            styles.toggleBtn,
                            useCustomAvatar && { backgroundColor: theme.colors.primary }
                        ]}
                    >
                        <Text style={[styles.toggleText, { color: useCustomAvatar ? theme.colors.secondary : theme.colors.textMuted }]}>
                            CUSTOM
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Avatar Selection */}
                {!useCustomAvatar ? (
                    <>
                        <Text style={styles.sectionLabel}>SPIN TO SELECT CHARACTER</Text>
                        <View style={styles.omnitrixContainer}>
                            <AvatarWheel
                                selectedId={selectedAvatarId}
                                onSelect={setSelectedAvatarId}
                                theme={theme}
                            />
                        </View>
                    </>
                ) : (
                    <View style={styles.customAvatarSection}>
                        <Text style={styles.sectionLabel}>YOUR CUSTOM AVATAR</Text>
                        <View style={styles.customAvatarPreview}>
                            {customAvatarConfig ? (
                                <CustomBuiltAvatar config={customAvatarConfig} size={100} />
                            ) : (
                                <View style={[styles.emptyAvatar, { borderColor: theme.colors.primary }]}>
                                    <Text style={{ color: theme.colors.textMuted, fontSize: 30 }}>?</Text>
                                </View>
                            )}
                        </View>
                        <TouchableOpacity
                            onPress={() => { playHaptic('medium'); setShowAvatarBuilder(true); }}
                            style={[styles.editAvatarBtn, { borderColor: theme.colors.primary }]}
                        >
                            <Text style={[styles.editAvatarText, { color: theme.colors.primary }]}>
                                {customAvatarConfig ? '✏️ EDIT AVATAR' : '+ CREATE AVATAR'}
                            </Text>
                        </TouchableOpacity>
                    </View>
                )}

                {/* Username Input */}
                <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>SCREEN NAME</Text>
                    <TextInput
                        style={[styles.input, styles.inputCentered]}
                        value={username}
                        onChangeText={setUsername}
                        placeholder="YOUR NAME"
                        placeholderTextColor={theme.colors.textMuted}
                        maxLength={12}
                        autoCapitalize="none"
                    />
                </View>

                <CinemaButton title="SAVE PROFILE" onPress={handleSaveProfile} theme={theme} style={{ marginTop: 8 }} />

                {isEditing && (
                    <CinemaButton title="LOG OUT" onPress={handleLogout} variant="secondary" theme={theme} style={{ marginTop: 12 }} />
                )}
            </View>
        );
    };

    // Use ScrollView for small screens (iPhone 8 height ~667)
    const { height } = Dimensions.get('window');
    const isSmallScreen = height < 700;
    const needsScroll = mode === 'login' || mode === 'signup' || mode === 'forgot_password' || (isSmallScreen && (mode === 'profile_view' || mode === 'profile_setup'));

    const content = (
        <>
            {renderHeader(
                mode === 'profile_view' ? 'PROFILE' :
                    mode === 'profile_setup' ? 'SETUP' :
                        mode === 'forgot_password' ? 'RECOVER' :
                            mode === 'verification' ? 'VERIFY' : 'ACCOUNT'
            )}

            {authLoading ? (
                <Text style={styles.infoText}>Loading...</Text>
            ) : (
                <>
                    {(mode === 'login' || mode === 'signup') && renderAuthForm()}
                    {mode === 'forgot_password' && renderForgotPassword()}
                    {mode === 'verification' && renderVerification()}
                    {mode === 'profile_setup' && renderProfileSetup(false)}
                    {mode === 'profile_view' && renderProfileSetup(true)}
                </>
            )}
        </>
    );

    return (
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
            <LinearGradient colors={theme.colors.backgroundGradient} style={StyleSheet.absoluteFillObject} />
            <FilmPerforations side="left" theme={theme} />
            <FilmPerforations side="right" theme={theme} />

            {needsScroll ? (
                <ScrollView
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                    keyboardShouldPersistTaps="handled"
                    bounces={false}
                >
                    {content}
                </ScrollView>
            ) : (
                <View style={styles.fixedContent}>
                    {content}
                </View>
            )}

            {/* Delete Account Confirmation Modal - Cross-platform */}
            <Modal
                visible={showDeleteModal}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowDeleteModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
                        <Text style={[styles.modalTitle, { color: theme.colors.error }]}>⚠️ CONFIRM DELETION</Text>
                        <Text style={[styles.modalText, { color: theme.colors.textSecondary }]}>
                            Enter your password to permanently delete your account:
                        </Text>
                        <TextInput
                            style={[styles.input, { marginVertical: 16 }]}
                            value={deletePassword}
                            onChangeText={setDeletePassword}
                            placeholder="Password"
                            placeholderTextColor={theme.colors.textMuted}
                            secureTextEntry
                            autoCapitalize="none"
                        />
                        <View style={{ flexDirection: 'row', gap: 12 }}>
                            <CinemaButton
                                title="CANCEL"
                                onPress={() => { setShowDeleteModal(false); setDeletePassword(''); }}
                                variant="secondary"
                                theme={theme}
                                style={{ flex: 1 }}
                            />
                            <CinemaButton
                                title="DELETE"
                                onPress={performAccountDeletion}
                                variant="error"
                                theme={theme}
                                style={{ flex: 1 }}
                            />
                        </View>
                    </View>
                </View>
            </Modal>
        </KeyboardAvoidingView>
    );
}


const getStyles = (theme) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    scrollContent: {
        paddingHorizontal: 24,
        paddingTop: Platform.OS === 'ios' ? 50 : 35,
        paddingBottom: 20,
        flexGrow: 1,
    },
    fixedContent: {
        flex: 1,
        paddingHorizontal: 24,
        paddingTop: Platform.OS === 'ios' ? 50 : 35,
        paddingBottom: 20,
    },
    // Header
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 16,
        paddingBottom: 10,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.primary + '30',
    },
    backBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: theme.colors.surface,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: theme.colors.primary + '50',
    },
    backText: {
        color: theme.colors.primary,
        fontSize: 26,
        fontFamily: 'CabinetGrotesk-Black',
        marginTop: -2,
    },
    headerCenter: {
        flex: 1,
        alignItems: 'center',
    },
    kodakBadge: {
        backgroundColor: theme.colors.primary,
        paddingHorizontal: 16,
        paddingVertical: 5,
        borderRadius: 4,
    },
    kodakBadgeText: {
        color: theme.colors.secondary,
        fontSize: 12,
        fontFamily: 'Panchang-Bold',
        letterSpacing: 3,
    },
    // Film Frame Card
    filmFrame: {
        backgroundColor: theme.colors.surface,
        borderRadius: 12,
        padding: 18,
        borderWidth: 2,
        borderColor: theme.colors.primary + '40',
    },
    frameTitle: {
        fontSize: 15,
        fontFamily: 'Panchang-Bold',
        color: theme.colors.text,
        textAlign: 'center',
        letterSpacing: 2,
        marginBottom: 14,
    },
    // Input styles
    inputGroup: {
        marginBottom: 10,
    },
    inputLabel: {
        color: theme.colors.primary,
        fontSize: 10,
        fontFamily: 'Panchang-Bold',
        letterSpacing: 2,
        marginBottom: 5,
        marginLeft: 4,
    },
    input: {
        backgroundColor: theme.colors.background,
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 14,
        color: theme.colors.text,
        fontFamily: 'Teko-Medium',
        fontSize: 18,
        borderWidth: 1,
        borderColor: theme.colors.textMuted + '50',
    },
    inputCentered: {
        textAlign: 'center',
        fontSize: 22,
        letterSpacing: 2,
    },
    forgotBtn: {
        alignSelf: 'flex-end',
        marginBottom: 12,
        marginTop: -4,
    },
    forgotText: {
        color: theme.colors.primary,
        fontSize: 11,
        fontFamily: 'Teko-Medium',
        letterSpacing: 1,
    },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 14,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: theme.colors.textMuted + '40',
    },
    dividerText: {
        color: theme.colors.textMuted,
        fontSize: 11,
        fontFamily: 'Teko-Medium',
        marginHorizontal: 12,
        letterSpacing: 2,
    },
    switchText: {
        color: theme.colors.textSecondary,
        fontSize: 13,
        fontFamily: 'Teko-Medium',
        textAlign: 'center',
        letterSpacing: 1,
    },
    infoText: {
        color: theme.colors.textSecondary,
        fontSize: 14,
        fontFamily: 'Teko-Medium',
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 8,
    },
    // Avatar Omnitrix Selector
    sectionLabel: {
        color: theme.colors.primary,
        fontSize: 10,
        fontFamily: 'Panchang-Bold',
        letterSpacing: 2,
        textAlign: 'center',
        marginBottom: 6,
    },
    avatarToggle: {
        flexDirection: 'row',
        backgroundColor: theme.colors.background,
        borderRadius: 25,
        padding: 4,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: theme.colors.primary + '30',
    },
    toggleBtn: {
        flex: 1,
        paddingVertical: 10,
        borderRadius: 22,
        alignItems: 'center',
    },
    toggleText: {
        fontSize: 11,
        fontFamily: 'CabinetGrotesk-Black',
        letterSpacing: 1,
    },
    customAvatarSection: {
        alignItems: 'center',
        marginBottom: 14,
    },
    customAvatarPreview: {
        marginVertical: 12,
    },
    emptyAvatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 3,
        borderStyle: 'dashed',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.colors.background,
    },
    editAvatarBtn: {
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 20,
        borderWidth: 2,
    },
    editAvatarText: {
        fontSize: 12,
        fontFamily: 'CabinetGrotesk-Bold',
        letterSpacing: 1,
    },
    omnitrixContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 14,
    },
    avatarFilmStrip: {
        backgroundColor: theme.colors.background,
        borderRadius: 8,
        paddingVertical: 8,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: theme.colors.primary + '30',
    },
    avatarScrollContent: {
        paddingHorizontal: 8,
        gap: 8,
    },
    avatarFrame: {
        backgroundColor: theme.colors.surface,
        borderRadius: 8,
        padding: 6,
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'transparent',
        position: 'relative',
    },
    avatarFrameSelected: {
        borderColor: theme.colors.primary,
        backgroundColor: theme.colors.primary + '15',
    },
    avatarSprocket: {
        width: 40,
        height: 4,
        backgroundColor: theme.colors.textMuted + '30',
        borderRadius: 2,
        marginVertical: 3,
    },
    selectedBadge: {
        position: 'absolute',
        top: -6,
        right: -6,
        width: 20,
        height: 20,
        borderRadius: 10,
        backgroundColor: theme.colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    selectedBadgeText: {
        color: theme.colors.secondary,
        fontSize: 12,
    },
    // Preview
    previewSection: {
        alignItems: 'center',
        marginBottom: 16,
    },
    previewFrame: {
        padding: 8,
        borderRadius: 50,
        borderWidth: 3,
        borderColor: theme.colors.primary,
        backgroundColor: theme.colors.background,
    },
    // Footer
    footer: {
        alignItems: 'center',
        marginTop: 16,
        paddingTop: 10,
        borderTopWidth: 1,
        borderTopColor: theme.colors.primary + '20',
    },
    footerText: {
        color: theme.colors.textMuted,
        fontSize: 9,
        fontFamily: 'Teko-Medium',
        letterSpacing: 3,
        opacity: 0.6,
    },
    // Delete Account Modal
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.8)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        width: '100%',
        maxWidth: 340,
        borderRadius: 16,
        padding: 24,
        borderWidth: 2,
        borderColor: theme.colors.error + '50',
    },
    modalTitle: {
        fontSize: 16,
        fontFamily: 'Panchang-Bold',
        textAlign: 'center',
        marginBottom: 12,
        letterSpacing: 2,
    },
    modalText: {
        fontSize: 14,
        fontFamily: 'Teko-Medium',
        textAlign: 'center',
        lineHeight: 20,
    },
});
