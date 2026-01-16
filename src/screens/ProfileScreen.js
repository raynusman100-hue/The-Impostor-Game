import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, Alert, Platform, Animated, PanResponder, Dimensions } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { onAuthStateChanged, signOut, signInWithCredential, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../utils/firebase';
import { useTheme } from '../utils/ThemeContext';
import { playHaptic } from '../utils/haptics';
import { CustomAvatar, TOTAL_AVATARS } from '../utils/AvatarGenerator';
import { CustomBuiltAvatar, AvatarBuilder } from '../components/CustomAvatarBuilder';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';

// Configure Google Sign-In for native builds
GoogleSignin.configure({
    webClientId: '831244408092-mn4bhuvq6v4il0nippaiaf7q729o97bu.apps.googleusercontent.com',
    offlineAccess: true,
});

// Omnitrix-style Avatar Wheel - Drag to rotate like a dial!
const AvatarWheel = ({ selectedId, onSelect, theme }) => {
    const WHEEL_SIZE = 260;
    const CENTER_SIZE = 80;
    const AVATAR_SIZE = 44;
    const RADIUS = 88;
    const DEGREES_PER_AVATAR = 360 / TOTAL_AVATARS;
    const FRICTION = 0.96;
    const MIN_VELOCITY = 0.3;

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
            friction: 8,
            tension: 50,
            useNativeDriver: false,
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

    const wheelRef = useRef(null);
    const isDragging = useRef(false);

    const panResponder = useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: () => false,
            onMoveShouldSetPanResponder: (_, gesture) => Math.abs(gesture.dx) > 8 || Math.abs(gesture.dy) > 8,
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
                if (currentAvatar !== selected) setSelected(currentAvatar);
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
            onPanResponderTerminate: () => { isDragging.current = false; snapToNearest(); },
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
        Animated.spring(rotation, { toValue: finalTarget, friction: 7, tension: 40, useNativeDriver: false }).start(() => {
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
                style={[wheelStyles.avatarSlot, {
                    width: AVATAR_SIZE, height: AVATAR_SIZE, borderRadius: AVATAR_SIZE / 2,
                    backgroundColor: isSelected ? theme.colors.primary + '25' : theme.colors.surface,
                    borderColor: isSelected ? theme.colors.primary : theme.colors.primary + '30',
                    borderWidth: isSelected ? 3 : 2,
                    position: 'absolute', left: x, top: y,
                }]}
            >
                <CustomAvatar id={avatarId} size={AVATAR_SIZE - 12} />
            </TouchableOpacity>
        );
    };

    return (
        <View ref={wheelRef} style={[wheelStyles.wheelContainer, { width: WHEEL_SIZE, height: WHEEL_SIZE }]} {...panResponder.panHandlers}>
            <View style={[wheelStyles.outerRing, { width: WHEEL_SIZE, height: WHEEL_SIZE, borderRadius: WHEEL_SIZE / 2, borderColor: theme.colors.primary + '20' }]} />
            <View style={[wheelStyles.innerRing, { width: WHEEL_SIZE - 30, height: WHEEL_SIZE - 30, borderRadius: (WHEEL_SIZE - 30) / 2, borderColor: theme.colors.primary + '10', backgroundColor: theme.colors.background }]} />
            <View style={wheelStyles.selectorContainer}>
                <View style={[wheelStyles.selectorLine, { backgroundColor: theme.colors.primary }]} />
                <View style={[wheelStyles.selectorArrow, { borderTopColor: theme.colors.primary }]} />
            </View>
            <Animated.View style={[wheelStyles.wheel, { width: WHEEL_SIZE, height: WHEEL_SIZE, transform: [{ rotate: rotation.interpolate({ inputRange: [-36000, 0, 36000], outputRange: ['-36000deg', '0deg', '36000deg'] }) }] }]}>
                {[...Array(TOTAL_AVATARS)].map((_, i) => renderAvatar(i))}
            </Animated.View>
            <Animated.View style={[wheelStyles.centerHub, { width: CENTER_SIZE, height: CENTER_SIZE, borderRadius: CENTER_SIZE / 2, backgroundColor: theme.colors.surface, borderColor: theme.colors.primary, transform: [{ scale: centerScale }] }]}>
                <View style={[wheelStyles.centerInner, { width: CENTER_SIZE - 8, height: CENTER_SIZE - 8, borderRadius: (CENTER_SIZE - 8) / 2, backgroundColor: theme.colors.background, borderColor: theme.colors.primary + '50' }]}>
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

// Cinematic button component
const CinemaButton = ({ title, onPress, variant = 'primary', theme, style }) => (
    <TouchableOpacity
        onPress={() => { playHaptic('medium'); onPress(); }}
        activeOpacity={0.8}
        style={[{
            backgroundColor: variant === 'primary' ? theme.colors.primary : variant === 'error' ? theme.colors.error + '20' : theme.colors.surface,
            borderWidth: 2,
            borderColor: variant === 'primary' ? theme.colors.primary : variant === 'error' ? theme.colors.error : theme.colors.primary,
            borderRadius: 8, paddingVertical: 10, paddingHorizontal: 16, alignItems: 'center',
        }, style]}
    >
        <Text style={{ color: variant === 'primary' ? theme.colors.secondary : variant === 'error' ? theme.colors.error : theme.colors.text, fontSize: 13, fontFamily: 'CabinetGrotesk-Black', letterSpacing: 2 }}>
            {title}
        </Text>
    </TouchableOpacity>
);

export default function ProfileScreen({ navigation }) {
    const { theme } = useTheme();
    const styles = getStyles(theme);

    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [username, setUsername] = useState('');
    const [selectedAvatarId, setSelectedAvatarId] = useState(1);
    const [useCustomAvatar, setUseCustomAvatar] = useState(false);
    const [customAvatarConfig, setCustomAvatarConfig] = useState(null);
    const [showAvatarBuilder, setShowAvatarBuilder] = useState(false);
    const [existingProfile, setExistingProfile] = useState(null);
    const [mode, setMode] = useState('loading'); // 'loading', 'signed_out', 'profile_setup', 'profile_view'

    // Listen for auth state changes
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            setUser(currentUser);
            if (currentUser) {
                // Load existing profile
                await loadProfile(currentUser);
            } else {
                setMode('signed_out');
                setExistingProfile(null);
                setUsername('');
            }
        });
        return unsubscribe;
    }, []);

    const loadProfile = async (currentUser) => {
        try {
            const savedProfile = await AsyncStorage.getItem('user_profile');
            if (savedProfile) {
                const profile = JSON.parse(savedProfile);
                setExistingProfile(profile);
                setUsername(profile.username || currentUser.displayName || currentUser.email?.split('@')[0] || '');
                setSelectedAvatarId(profile.avatarId || 1);
                setUseCustomAvatar(profile.useCustomAvatar || false);
                setCustomAvatarConfig(profile.customAvatarConfig || null);
                // If profile has username, show profile view, otherwise setup
                setMode(profile.username ? 'profile_view' : 'profile_setup');
            } else {
                // No profile yet, go to setup
                const defaultName = currentUser.displayName || currentUser.email?.split('@')[0] || '';
                setUsername(defaultName);
                setMode('profile_setup');
            }
        } catch (e) {
            console.log('Error loading profile:', e);
            setMode('profile_setup');
        }
    };

    // ============ GOOGLE SIGN-IN (UNCHANGED) ============
    const handleGoogleSignIn = async () => {
        playHaptic('medium');
        setIsLoading(true);
        try {
            await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
            const userInfo = await GoogleSignin.signIn();
            console.log('Google Sign-In userInfo:', userInfo);
            const idToken = userInfo.data?.idToken || userInfo.idToken;
            if (idToken) {
                const credential = GoogleAuthProvider.credential(idToken);
                const userCredential = await signInWithCredential(auth, credential);
                console.log('Firebase Sign-In successful:', userCredential.user.email);
                setUser(userCredential.user);
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
                Alert.alert('Error', 'Google Play Services not available');
            } else {
                Alert.alert('Sign-In Error', error.message || 'Something went wrong');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleSignOut = async () => {
        playHaptic('medium');
        Alert.alert('Sign Out', 'Are you sure you want to sign out?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Sign Out', style: 'destructive',
                onPress: async () => {
                    try {
                        try { await GoogleSignin.signOut(); } catch (e) { console.log('Google signout error:', e); }
                        await signOut(auth);
                        await AsyncStorage.removeItem('user_profile');
                        await AsyncStorage.removeItem('displayName');
                        setUser(null);
                        setExistingProfile(null);
                        setUsername('');
                        setMode('signed_out');
                    } catch (error) {
                        console.error('Sign out error:', error);
                        Alert.alert('Error', 'Failed to sign out');
                    }
                }
            }
        ]);
    };
    // ============ END GOOGLE SIGN-IN ============

    const handleSaveProfile = async () => {
        const name = username.trim();
        if (!name) { Alert.alert('Error', 'Please enter a username'); return; }
        if (name.length > 12) { Alert.alert('Error', 'Username too long (max 12 characters)'); return; }
        
        playHaptic('medium');
        try {
            const userProfile = {
                username: name,
                avatarId: selectedAvatarId,
                useCustomAvatar: useCustomAvatar,
                customAvatarConfig: customAvatarConfig,
                uid: user.uid,
                email: user.email,
                updatedAt: new Date().toISOString()
            };
            await AsyncStorage.setItem('user_profile', JSON.stringify(userProfile));
            await AsyncStorage.setItem('displayName', name);
            setExistingProfile(userProfile);
            playHaptic('success');
            Alert.alert('Saved!', 'Your profile has been updated.', [
                { text: 'OK', onPress: () => setMode('profile_view') }
            ]);
        } catch (error) {
            Alert.alert('Error', 'Failed to save profile: ' + error.message);
        }
    };

    const safeGoBack = () => {
        if (navigation.canGoBack()) navigation.goBack();
        else navigation.navigate('Home');
    };

    // ============ RENDER FUNCTIONS ============
    const renderHeader = (title) => (
        <View style={styles.header}>
            <TouchableOpacity onPress={() => { playHaptic('light'); safeGoBack(); }} style={styles.backBtn}>
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

    const renderSignedOut = () => (
        <View style={styles.filmFrame}>
            <Text style={styles.frameTitle}>★ WELCOME ★</Text>
            <Text style={styles.infoText}>Sign in to save your progress and play online</Text>
            <CinemaButton
                title={isLoading ? "SIGNING IN..." : "SIGN IN WITH GOOGLE"}
                onPress={handleGoogleSignIn}
                theme={theme}
                style={{ marginTop: 16, opacity: isLoading ? 0.6 : 1 }}
            />
        </View>
    );

    const renderProfileSetup = () => {
        if (showAvatarBuilder) {
            return (
                <View style={[styles.filmFrame, { flex: 1 }]}>
                    <Text style={styles.frameTitle}>★ CREATE AVATAR ★</Text>
                    <AvatarBuilder
                        initialConfig={customAvatarConfig}
                        onSave={(config) => { setCustomAvatarConfig(config); setUseCustomAvatar(true); setShowAvatarBuilder(false); }}
                        onCancel={() => setShowAvatarBuilder(false)}
                        theme={theme}
                    />
                </View>
            );
        }

        return (
            <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 30 }} showsVerticalScrollIndicator={false}>
                <View style={styles.filmFrame}>
                    <Text style={styles.frameTitle}>★ SETUP PROFILE ★</Text>

                    {/* Avatar Type Toggle */}
                    <View style={styles.avatarToggle}>
                        <TouchableOpacity onPress={() => { playHaptic('light'); setUseCustomAvatar(false); }} style={[styles.toggleBtn, !useCustomAvatar && { backgroundColor: theme.colors.primary }]}>
                            <Text style={[styles.toggleText, { color: !useCustomAvatar ? theme.colors.secondary : theme.colors.textMuted }]}>PRE-MADE</Text>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => { playHaptic('light'); if (!customAvatarConfig) setShowAvatarBuilder(true); else setUseCustomAvatar(true); }} style={[styles.toggleBtn, useCustomAvatar && { backgroundColor: theme.colors.primary }]}>
                            <Text style={[styles.toggleText, { color: useCustomAvatar ? theme.colors.secondary : theme.colors.textMuted }]}>CUSTOM</Text>
                        </TouchableOpacity>
                    </View>

                    {/* Avatar Selection */}
                    {!useCustomAvatar ? (
                        <>
                            <Text style={styles.sectionLabel}>SPIN TO SELECT CHARACTER</Text>
                            <View style={styles.omnitrixContainer}>
                                <AvatarWheel selectedId={selectedAvatarId} onSelect={setSelectedAvatarId} theme={theme} />
                            </View>
                        </>
                    ) : (
                        <View style={styles.customAvatarSection}>
                            <Text style={styles.sectionLabel}>YOUR CUSTOM AVATAR</Text>
                            <View style={styles.customAvatarPreview}>
                                {customAvatarConfig ? <CustomBuiltAvatar config={customAvatarConfig} size={100} /> : (
                                    <View style={[styles.emptyAvatar, { borderColor: theme.colors.primary }]}>
                                        <Text style={{ color: theme.colors.textMuted, fontSize: 30 }}>?</Text>
                                    </View>
                                )}
                            </View>
                            <TouchableOpacity onPress={() => { playHaptic('medium'); setShowAvatarBuilder(true); }} style={[styles.editAvatarBtn, { borderColor: theme.colors.primary }]}>
                                <Text style={[styles.editAvatarText, { color: theme.colors.primary }]}>{customAvatarConfig ? '✏️ EDIT AVATAR' : '+ CREATE AVATAR'}</Text>
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
                </View>
            </ScrollView>
        );
    };

    const renderProfileView = () => (
        <View style={styles.filmFrame}>
            <Text style={styles.frameTitle}>★ YOUR PROFILE ★</Text>
            
            {/* Avatar Display */}
            <View style={styles.profileAvatarContainer}>
                {useCustomAvatar && customAvatarConfig ? (
                    <CustomBuiltAvatar config={customAvatarConfig} size={100} />
                ) : (
                    <CustomAvatar id={selectedAvatarId} size={100} />
                )}
            </View>
            
            <Text style={styles.profileUsername}>{username}</Text>
            <Text style={styles.profileEmail}>{user?.email}</Text>

            <CinemaButton title="EDIT PROFILE" onPress={() => setMode('profile_setup')} variant="secondary" theme={theme} style={{ marginTop: 20 }} />
            <CinemaButton title="SIGN OUT" onPress={handleSignOut} variant="error" theme={theme} style={{ marginTop: 12 }} />
        </View>
    );

    // Main render
    if (mode === 'loading') {
        return (
            <View style={[styles.container, { justifyContent: 'center', alignItems: 'center' }]}>
                <Text style={{ color: theme.colors.text }}>Loading...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {renderHeader('PROFILE')}
            <View style={styles.content}>
                {mode === 'signed_out' && renderSignedOut()}
                {mode === 'profile_setup' && renderProfileSetup()}
                {mode === 'profile_view' && renderProfileView()}
            </View>
        </View>
    );
}


const getStyles = (theme) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
        paddingTop: Platform.OS === 'ios' ? 50 : 35,
        paddingHorizontal: 24,
    },
    content: {
        flex: 1,
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
    infoText: {
        color: theme.colors.textSecondary,
        fontSize: 14,
        fontFamily: 'Teko-Medium',
        textAlign: 'center',
        lineHeight: 20,
    },
    // Input styles
    inputGroup: {
        marginBottom: 10,
        marginTop: 10,
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
    // Avatar Toggle
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
    sectionLabel: {
        color: theme.colors.primary,
        fontSize: 10,
        fontFamily: 'Panchang-Bold',
        letterSpacing: 2,
        textAlign: 'center',
        marginBottom: 6,
    },
    omnitrixContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 14,
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
    // Profile View
    profileAvatarContainer: {
        alignItems: 'center',
        marginVertical: 16,
    },
    profileUsername: {
        fontSize: 24,
        fontFamily: 'Panchang-Bold',
        color: theme.colors.text,
        textAlign: 'center',
        letterSpacing: 2,
    },
    profileEmail: {
        fontSize: 14,
        fontFamily: 'Teko-Medium',
        color: theme.colors.textMuted,
        textAlign: 'center',
        marginTop: 4,
    },
});
