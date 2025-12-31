import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity, Alert, KeyboardAvoidingView, Platform, Dimensions, BackHandler } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile, onAuthStateChanged, sendEmailVerification, signOut, reload, sendPasswordResetEmail } from 'firebase/auth';
import { ref, get, set, child } from 'firebase/database';
import { auth, database } from '../utils/firebase';
import { useTheme } from '../utils/ThemeContext';
import Button from '../components/Button';
import { playHaptic } from '../utils/haptics';
import { CustomAvatar } from '../utils/AvatarGenerator';

const { width } = Dimensions.get('window');

export default function ProfileScreen({ navigation }) {
    const { theme } = useTheme();
    const styles = getStyles(theme);

    // Auth State
    const [firebaseUser, setFirebaseUser] = useState(null);
    const [authLoading, setAuthLoading] = useState(true);

    // Form State
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [username, setUsername] = useState('');
    const [selectedAvatarId, setSelectedAvatarId] = useState(1);

    // UI Mode State
    // 'login' | 'signup' | 'verification' | 'profile_setup' | 'profile_view' | 'forgot_password'
    const [mode, setMode] = useState('login');

    const [generatedCode, setGeneratedCode] = useState('');
    const [existingProfile, setExistingProfile] = useState(null);

    // Handle Hardware Back Button & Unsaved Changes Logic
    useEffect(() => {
        const backAction = () => {
            handleBackPress();
            return true;
        };

        const backHandler = BackHandler.addEventListener(
            "hardwareBackPress",
            backAction
        );

        return () => backHandler.remove();
    }, [mode, username, selectedAvatarId, existingProfile]);

    const hasUnsavedChanges = () => {
        if (!existingProfile) return true; // New profile setup
        return (
            username !== existingProfile.username ||
            selectedAvatarId !== existingProfile.avatarId
        );
    };

    const handleBackPress = () => {
        if (mode === 'profile_setup' || (mode === 'profile_view' && hasUnsavedChanges())) {
            Alert.alert(
                "Unsaved Changes",
                "You have unsaved changes. Do you want to save them before leaving?",
                [
                    {
                        text: "Leave without Saving",
                        onPress: () => {
                            // Force go back (and potentially stay incomplete or incomplete session)
                            navigation.goBack();
                        },
                        style: "destructive"
                    },
                    {
                        text: "Save",
                        onPress: handleSaveProfile
                    },
                    {
                        text: "Cancel",
                        style: "cancel",
                        onPress: () => { }
                    }
                ]
            );
        } else {
            navigation.goBack();
        }
    };

    // Listen to Firebase auth state
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setFirebaseUser(user);
            setAuthLoading(false);

            if (user) {
                if (!user.emailVerified) {
                    setMode('verification');
                } else {
                    // Check if profile exists / is setup
                    const hasProfile = user.displayName;
                    if (hasProfile) {
                        setMode('profile_view');
                        setUsername(user.displayName);
                        // Try to load extra data (like avatar) from local or DB
                        loadProfile(user);
                    } else {
                        setMode('profile_setup');
                    }
                }
            } else {
                setMode('login'); // Default to login if not auth
            }
        });
        return unsubscribe;
    }, []);

    const loadProfile = async (user) => {
        try {
            // Try local first
            const savedProfile = await AsyncStorage.getItem('user_profile');
            if (savedProfile) {
                const profile = JSON.parse(savedProfile);
                setExistingProfile(profile);
                setSelectedAvatarId(profile.avatarId || 1);
                // Sync username just in case
                if (profile.username) setUsername(profile.username);
            } else {
                // Determine Avatar from somewhere or default
                // Ideally fetch from DB, but for now default or rebuild
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

    // --- Actions ---

    const handleSignup = async () => {
        if (!email.trim() || !password.trim()) {
            Alert.alert('Error', 'Please enter email and password');
            return;
        }
        if (password.length < 6) {
            Alert.alert('Error', 'Password must be at least 6 characters');
            return;
        }
        if (password !== confirmPassword) {
            Alert.alert('Error', 'Passwords do not match');
            return;
        }

        try {
            playHaptic('medium');
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            await sendEmailVerification(userCredential.user);

            playHaptic('success');
            // State listener will switch mode to 'verification'
        } catch (error) {
            console.error('Signup error:', error);
            if (error.code === 'auth/email-already-in-use') {
                Alert.alert('Error', 'Email already in use. Try signing in.');
            } else {
                Alert.alert('Signup Failed', error.message);
            }
        }
    };

    const handleLogin = async () => {
        if (!email.trim() || !password.trim()) {
            Alert.alert('Error', 'Please enter email and password');
            return;
        }

        try {
            playHaptic('medium');
            await signInWithEmailAndPassword(auth, email, password);
            playHaptic('success');
            // State listener handles the rest
        } catch (error) {
            console.error('Login error:', error);
            Alert.alert('Login Failed', 'Invalid email or password');
        }
    };

    const handlePasswordReset = async () => {
        if (!email.trim()) {
            Alert.alert('Error', 'Please enter your email address');
            return;
        }

        try {
            playHaptic('medium');
            await sendPasswordResetEmail(auth, email);
            playHaptic('success');
            Alert.alert(
                'Email Sent',
                'Password reset link has been sent to your email.',
                [{ text: 'OK', onPress: () => setMode('login') }]
            );
        } catch (error) {
            console.error('Reset error:', error);
            if (error.code === 'auth/user-not-found') {
                Alert.alert('Error', 'No account found with this email.');
            } else {
                Alert.alert('Error', 'Failed to send reset email. ' + error.message);
            }
        }
    };

    const handleCheckVerification = async () => {
        if (!firebaseUser) return;
        playHaptic('light');
        try {
            await reload(firebaseUser);
            if (firebaseUser.emailVerified) {
                playHaptic('success');
                // Listener might catch this, but we can force update or let effect handle
                if (!firebaseUser.displayName) {
                    setMode('profile_setup');
                } else {
                    setMode('profile_view');
                }
            } else {
                Alert.alert('Not Verified', 'Email is not verified yet. Please check your inbox.');
            }
        } catch (e) {
            console.log("Reload error", e);
        }
    };

    const handleResendVerification = async () => {
        if (!firebaseUser) return;
        try {
            playHaptic('medium');
            await sendEmailVerification(firebaseUser);
            playHaptic('success');
            Alert.alert('Email Sent', 'Verification email has been resent.');
        } catch (error) {
            if (error.code === 'auth/too-many-requests') {
                Alert.alert('Please Wait', 'Too many requests. Try again later.');
            } else {
                Alert.alert('Error', 'Failed to resend email.');
            }
        }
    };

    const checkUsernameOwner = async (name) => {
        const usernameRef = child(ref(database), `usernames/${name.toLowerCase()}`);
        const snapshot = await get(usernameRef);
        if (!snapshot.exists()) return null;
        
        const data = snapshot.val();
        
        // If it's just a UID string (old format), return it
        if (typeof data === 'string') return data;
        
        // New format: { uid, releasedAt? }
        // Check if name is in cooldown (released but not yet available)
        if (data.releasedAt) {
            const cooldownMs = 2 * 60 * 1000; // 2 minutes
            const now = Date.now();
            if (now - data.releasedAt >= cooldownMs) {
                // Cooldown expired, name is available
                return null;
            }
            // Still in cooldown, return the original owner so only they can reclaim
            return data.uid;
        }
        
        return data.uid || data;
    };

    const releaseUsername = async (oldName) => {
        if (!oldName || !firebaseUser) return;
        
        const usernameRef = ref(database, `usernames/${oldName.toLowerCase()}`);
        const snapshot = await get(usernameRef);
        
        if (snapshot.exists()) {
            const data = snapshot.val();
            const ownerUid = typeof data === 'string' ? data : data.uid;
            
            // Only release if we own it
            if (ownerUid === firebaseUser.uid) {
                // Mark as released with timestamp for 2-min cooldown
                await set(usernameRef, {
                    uid: firebaseUser.uid,
                    releasedAt: Date.now()
                });
                console.log(`Username "${oldName}" released with 2-min cooldown`);
            }
        }
    };

    const handleSaveProfile = async () => {
        const name = username.trim();
        if (!name) {
            Alert.alert('Error', 'Please enter a username');
            return;
        }
        if (name.length > 12) {
            Alert.alert('Error', 'Username too long (max 12 chars)');
            return;
        }

        playHaptic('medium');

        try {
            // Check if username is taken by SOMEONE ELSE
            const ownerUid = await checkUsernameOwner(name);

            if (ownerUid && ownerUid !== firebaseUser.uid) {
                playHaptic('error');
                Alert.alert('Username Taken', 'This username is already taken. Please choose another.');
                return;
            }

            // Get old username to release it
            const oldUsername = existingProfile?.username || firebaseUser.displayName;
            
            // Release old username if changing to a different one
            if (oldUsername && oldUsername.toLowerCase() !== name.toLowerCase()) {
                await releaseUsername(oldUsername);
            }

            // Save to Firebase
            // 1. Reserve Username (if not already set correctly)
            if (ownerUid !== firebaseUser.uid) {
                // Save as new format with uid
                await set(ref(database, `usernames/${name.toLowerCase()}`), {
                    uid: firebaseUser.uid
                });
            } else {
                // We own it, make sure it's not in released state
                await set(ref(database, `usernames/${name.toLowerCase()}`), {
                    uid: firebaseUser.uid
                });
            }

            // 2. Update Auth Profile
            await updateProfile(firebaseUser, { displayName: name });

            // 3. Save User Data to DB
            const userProfile = {
                username: name,
                avatarId: selectedAvatarId,
                userCode: existingProfile ? existingProfile.userCode : generatedCode,
                updatedAt: new Date().toISOString()
            };

            // Note: saving to a user specific path
            // await set(ref(database, `users/${firebaseUser.uid}/profile`), userProfile);

            // 4. Save Local
            await AsyncStorage.setItem('user_profile', JSON.stringify(userProfile));
            setExistingProfile(userProfile);

            playHaptic('success');
            Alert.alert('Saved', 'Your profile has been updated.', [
                {
                    text: 'OK', onPress: () => {
                        setMode('profile_view');
                        navigation.goBack();
                    }
                }
            ]);

        } catch (error) {
            console.error('Profile save error', error);
            Alert.alert('Error', 'Failed to save profile. ' + error.message);
        }
    };

    const handleLogout = async () => {
        Alert.alert(
            'Logout',
            'Are you sure you want to logout?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Logout',
                    style: 'destructive',
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
            ]
        );
    };

    // --- Renders ---

    const renderHeader = (title) => (
        <View style={styles.header}>
            {navigation.canGoBack() && (
                <TouchableOpacity onPress={handleBackPress} style={styles.backBtn}>
                    <Text style={styles.backText}>{'< BACK'}</Text>
                </TouchableOpacity>
            )}
            <Text style={styles.title}>{title}</Text>
        </View>
    );

    const renderAuthForm = () => (
        <View style={styles.authSection}>
            <Text style={styles.authTitle}>
                {mode === 'login' ? 'WELCOME BACK' : 'CREATE ACCOUNT'}
            </Text>

            <TextInput
                style={styles.authInput}
                value={email}
                onChangeText={setEmail}
                placeholder="EMAIL"
                placeholderTextColor={theme.colors.textSecondary}
                keyboardType="email-address"
                autoCapitalize="none"
            />
            <TextInput
                style={styles.authInput}
                value={password}
                onChangeText={setPassword}
                placeholder="PASSWORD (MIN 6 CHARS)"
                placeholderTextColor={theme.colors.textSecondary}
                secureTextEntry
                autoCapitalize="none"
            />

            {mode === 'signup' && (
                <TextInput
                    style={styles.authInput}
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    placeholder="CONFIRM PASSWORD"
                    placeholderTextColor={theme.colors.textSecondary}
                    secureTextEntry
                    autoCapitalize="none"
                />
            )}

            {mode === 'login' && (
                <TouchableOpacity
                    onPress={() => {
                        playHaptic('light');
                        setMode('forgot_password');
                    }}
                    style={{ alignSelf: 'flex-end', marginBottom: 20 }}
                >
                    <Text style={{ color: theme.colors.primary, fontSize: 14, fontFamily: theme.fonts.medium }}>
                        FORGOT PASSWORD?
                    </Text>
                </TouchableOpacity>
            )}

            <Button
                title={mode === 'login' ? "SIGN IN" : "SIGN UP"}
                onPress={mode === 'login' ? handleLogin : handleSignup}
                style={styles.authButton}
            />

            <TouchableOpacity
                onPress={() => {
                    playHaptic('light');
                    setMode(mode === 'login' ? 'signup' : 'login');
                }}
                style={styles.switchMode}
            >
                <Text style={styles.switchModeText}>
                    {mode === 'login' ? "New here? Create Account" : "Already have an account? Sign In"}
                </Text>
            </TouchableOpacity>
        </View>
    );

    const renderForgotPassword = () => (
        <View style={styles.authSection}>
            <Text style={styles.authTitle}>RESET PASSWORD</Text>

            <Text style={[styles.infoText, { marginBottom: 20 }]}>
                Enter your email address and we'll send you a link to reset your password.
            </Text>

            <TextInput
                style={styles.authInput}
                value={email}
                onChangeText={setEmail}
                placeholder="EMAIL"
                placeholderTextColor={theme.colors.textSecondary}
                keyboardType="email-address"
                autoCapitalize="none"
            />

            <Button
                title="SEND RESET LINK"
                onPress={handlePasswordReset}
                style={{ marginTop: 10 }}
            />

            <TouchableOpacity
                onPress={() => {
                    playHaptic('light');
                    setMode('login');
                }}
                style={styles.switchMode}
            >
                <Text style={styles.switchModeText}>Back to Login</Text>
            </TouchableOpacity>
        </View>
    );

    const renderVerification = () => (
        <View style={styles.card}>
            <Text style={[styles.authTitle, { color: '#f39c12' }]}>VERIFICATION PENDING</Text>
            <Text style={styles.infoText}>
                We have sent a verification email to:
            </Text>
            <Text style={[styles.infoText, { fontFamily: theme.fonts.bold, marginVertical: 10 }]}>
                {firebaseUser?.email}
            </Text>
            <Text style={styles.infoText}>
                Please verify your email to continue setting up your profile.
            </Text>

            <View style={{ gap: 10, marginTop: 20, width: '100%' }}>
                <Button
                    title="I HAVE VERIFIED"
                    onPress={handleCheckVerification}
                />
                <Button
                    title="RESEND EMAIL"
                    variant="secondary"
                    onPress={handleResendVerification}
                />
                <Button
                    title="LOGOUT"
                    variant="error"
                    onPress={handleLogout}
                />
            </View>
        </View>
    );

    const renderProfileSetup = (isEditing = false) => (
        <View>
            <View style={styles.card}>
                <Text style={styles.authTitle}>
                    {isEditing ? 'EDIT PROFILE' : 'SETUP PROFILE'}
                </Text>

                {/* Avatar Selection */}
                <Text style={styles.label}>CHOOSE AVATAR</Text>
                <View style={styles.avatarGrid}>
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((id) => (
                        <TouchableOpacity
                            key={id}
                            onPress={() => {
                                playHaptic('light');
                                setSelectedAvatarId(id);
                            }}
                            style={[
                                styles.avatarWrapper,
                                selectedAvatarId === id && styles.avatarSelected
                            ]}
                        >
                            <CustomAvatar id={id} size={50} />
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Selected Preview & Input */}
                <View style={{ alignItems: 'center', marginVertical: 20 }}>
                    <CustomAvatar id={selectedAvatarId} size={100} />
                </View>

                <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>UNIQUE USERNAME</Text>
                    <TextInput
                        style={styles.input}
                        value={username}
                        onChangeText={setUsername}
                        placeholder="USERNAME"
                        placeholderTextColor={theme.colors.textSecondary}
                        maxLength={12}
                        autoCapitalize="none" // Usernames usually lower/mixed but uniqueness check is lower
                    />
                    <Text style={{ color: theme.colors.textSecondary, fontSize: 10, textAlign: 'center', marginTop: 4 }}>
                        Validation: Unique across all players
                    </Text>
                </View>

                <Button
                    title="SAVE PROFILE"
                    onPress={handleSaveProfile}
                    style={{ marginTop: 10 }}
                />
            </View>

            {isEditing && (
                <Button
                    title="LOG OUT"
                    variant="error"
                    onPress={handleLogout}
                    style={styles.logoutBtn}
                />
            )}
        </View>
    );

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <LinearGradient
                colors={theme.colors.backgroundGradient}
                style={StyleSheet.absoluteFillObject}
            />

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {renderHeader(
                    mode === 'profile_view' ? 'YOUR PROFILE' :
                        mode === 'profile_setup' ? 'SETUP' :
                            mode === 'forgot_password' ? 'RECOVER' : 'ACCOUNT'
                )}

                {authLoading ? (
                    <Text style={styles.infoText}>Loading...</Text>
                ) : (
                    <>
                        {(mode === 'login' || mode === 'signup') && renderAuthForm()}
                        {mode === 'forgot_password' && renderForgotPassword()}
                        {mode === 'verification' && renderVerification()}
                        {(mode === 'profile_setup') && renderProfileSetup(false)}
                        {(mode === 'profile_view') && renderProfileSetup(true)}
                    </>
                )}
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const getStyles = (theme) => StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.background,
    },
    scrollContent: {
        padding: theme.spacing.l,
        paddingTop: Platform.OS === 'ios' ? 60 : 40,
        paddingBottom: 40,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: theme.spacing.xl,
    },
    backBtn: {
        marginRight: theme.spacing.m,
        padding: theme.spacing.s,
    },
    backText: {
        color: theme.colors.textSecondary,
        fontFamily: theme.fonts.medium,
        fontSize: theme.fontSize.medium,
    },
    title: {
        fontSize: 32,
        fontFamily: theme.fonts.header,
        color: theme.colors.tertiary,
        letterSpacing: 2,
        flex: 1,
        textAlign: 'center',
        marginRight: 40,
    },
    card: {
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.xl,
        padding: theme.spacing.l,
        marginBottom: theme.spacing.xl,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        ...theme.shadows.soft,
    },
    authSection: {
        width: '100%',
        backgroundColor: theme.colors.surface,
        borderRadius: theme.borderRadius.l,
        padding: theme.spacing.l,
        marginBottom: theme.spacing.m,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    authTitle: {
        fontSize: 24,
        fontFamily: theme.fonts.header,
        color: theme.colors.tertiary,
        textAlign: 'center',
        marginBottom: theme.spacing.l,
        letterSpacing: 2,
    },
    authInput: {
        backgroundColor: theme.colors.background,
        borderRadius: theme.borderRadius.m,
        padding: theme.spacing.m,
        color: theme.colors.text,
        fontFamily: theme.fonts.medium,
        fontSize: 16,
        marginBottom: theme.spacing.m,
        borderWidth: 1,
        borderColor: theme.colors.textSecondary,
    },
    authButton: {
        marginTop: theme.spacing.s,
        marginBottom: theme.spacing.m,
    },
    switchMode: {
        alignItems: 'center',
        padding: theme.spacing.s,
    },
    switchModeText: {
        color: theme.colors.primary,
        fontSize: theme.fontSize.small,
        fontFamily: theme.fonts.medium,
    },
    infoText: {
        color: theme.colors.textSecondary,
        fontSize: 16,
        textAlign: 'center',
        lineHeight: 24,
    },
    label: {
        color: theme.colors.textSecondary,
        fontFamily: theme.fonts.medium,
        fontSize: theme.fontSize.medium,
        marginBottom: theme.spacing.m,
        textAlign: 'center',
        letterSpacing: 2,
    },
    avatarGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: theme.spacing.m,
    },
    avatarWrapper: {
        padding: 4,
        borderRadius: 50,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    avatarSelected: {
        borderColor: theme.colors.primary,
        backgroundColor: 'rgba(255,255,255,0.1)',
    },
    inputContainer: {
        width: '100%',
        marginBottom: theme.spacing.m,
    },
    inputLabel: {
        color: theme.colors.textSecondary,
        fontFamily: theme.fonts.medium,
        fontSize: theme.fontSize.small,
        marginBottom: theme.spacing.xs,
        marginLeft: theme.spacing.s,
    },
    input: {
        width: '100%',
        backgroundColor: theme.colors.background,
        borderRadius: theme.borderRadius.l,
        padding: theme.spacing.m,
        color: theme.colors.text,
        fontFamily: theme.fonts.medium,
        fontSize: 20,
        textAlign: 'center',
        borderWidth: 1,
        borderColor: theme.colors.textSecondary,
    },
    logoutBtn: {
        width: '100%',
        marginTop: theme.spacing.m,
    },
});
