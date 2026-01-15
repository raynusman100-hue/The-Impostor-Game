import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Alert, TextInput, Modal } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { onAuthStateChanged, signOut, signInWithCredential, GoogleAuthProvider, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../utils/firebase';
import { useTheme } from '../utils/ThemeContext';
import { playHaptic } from '../utils/haptics';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import Constants from 'expo-constants';

// Check if running in Expo Go
const isExpoGo = Constants.appOwnership === 'expo';

// Configure Google Sign-In for native builds (only if not in Expo Go)
if (!isExpoGo) {
    GoogleSignin.configure({
        webClientId: '831244408092-mn4bhuvq6v4il0nippaiaf7q729o97bu.apps.googleusercontent.com',
        offlineAccess: true,
    });
}

export default function ProfileScreen({ navigation }) {
    const { theme } = useTheme();
    const [user, setUser] = useState(null);
    const [displayName, setDisplayName] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    
    // Email auth state (for testing)
    const [showEmailModal, setShowEmailModal] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSignUp, setIsSignUp] = useState(false);

    // Listen for auth state changes
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
            if (currentUser) {
                setDisplayName(currentUser.displayName || currentUser.email?.split('@')[0] || 'Player');
            }
        });
        return unsubscribe;
    }, []);

    // Load saved display name
    useEffect(() => {
        const loadDisplayName = async () => {
            try {
                const saved = await AsyncStorage.getItem('displayName');
                if (saved && !user) {
                    setDisplayName(saved);
                }
            } catch (e) {
                console.log('Error loading display name:', e);
            }
        };
        loadDisplayName();
    }, [user]);

    const handleGoogleSignIn = async () => {
        if (isExpoGo) {
            Alert.alert('Not Available', 'Google Sign-In requires a native build. Use Email sign-in for testing in Expo Go.');
            return;
        }
        
        playHaptic('medium');
        setIsLoading(true);
        try {
            // Check if device supports Google Play Services
            await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
            
            // Sign in with Google
            const userInfo = await GoogleSignin.signIn();
            console.log('Google Sign-In userInfo:', userInfo);
            
            // Get the ID token
            const idToken = userInfo.data?.idToken || userInfo.idToken;
            
            if (idToken) {
                // Create Firebase credential and sign in
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
    
    // Email/Password authentication (for testing)
    const handleEmailAuth = async () => {
        if (!email || !password) {
            Alert.alert('Error', 'Please enter email and password');
            return;
        }
        
        playHaptic('medium');
        setIsLoading(true);
        try {
            let userCredential;
            if (isSignUp) {
                userCredential = await createUserWithEmailAndPassword(auth, email, password);
                console.log('Email Sign-Up successful:', userCredential.user.email);
            } else {
                userCredential = await signInWithEmailAndPassword(auth, email, password);
                console.log('Email Sign-In successful:', userCredential.user.email);
            }
            setUser(userCredential.user);
            setShowEmailModal(false);
            setEmail('');
            setPassword('');
            playHaptic('success');
            Alert.alert('Success', isSignUp ? 'Account created!' : 'Signed in successfully!');
        } catch (error) {
            console.error('Email auth error:', error);
            let message = error.message;
            if (error.code === 'auth/email-already-in-use') {
                message = 'Email already in use. Try signing in instead.';
            } else if (error.code === 'auth/invalid-email') {
                message = 'Invalid email address.';
            } else if (error.code === 'auth/weak-password') {
                message = 'Password should be at least 6 characters.';
            } else if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
                message = 'Invalid email or password.';
            }
            Alert.alert('Error', message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSignOut = async () => {
        playHaptic('medium');
        try {
            // Sign out from Google (only if not in Expo Go)
            if (!isExpoGo) {
                try {
                    await GoogleSignin.signOut();
                } catch (e) {
                    console.log('Google signout error (may not be signed in):', e);
                }
            }
            // Sign out from Firebase
            await signOut(auth);
            setUser(null);
            setDisplayName('');
            Alert.alert('Signed Out', 'You have been signed out successfully.');
        } catch (error) {
            console.error('Sign out error:', error);
            Alert.alert('Error', 'Failed to sign out');
        }
    };

    const styles = getStyles(theme);

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => { playHaptic('light'); navigation.goBack(); }}>
                    <Text style={[styles.backButton, { color: theme.colors.primary }]}>← BACK</Text>
                </TouchableOpacity>
                <Text style={[styles.title, { color: theme.colors.text }]}>PROFILE</Text>
            </View>

            {/* Content */}
            <View style={styles.content}>
                {user ? (
                    // Signed In State
                    <View style={styles.signedInContainer}>
                        <View style={[styles.avatarCircle, { borderColor: theme.colors.primary }]}>
                            <Text style={[styles.avatarText, { color: theme.colors.primary }]}>
                                {displayName.charAt(0).toUpperCase()}
                            </Text>
                        </View>
                        <Text style={[styles.displayName, { color: theme.colors.text }]}>{displayName}</Text>
                        <Text style={[styles.email, { color: theme.colors.textMuted }]}>{user.email}</Text>
                        
                        <TouchableOpacity 
                            style={[styles.button, styles.signOutButton, { borderColor: theme.colors.error }]}
                            onPress={handleSignOut}
                        >
                            <Text style={[styles.buttonText, { color: theme.colors.error }]}>SIGN OUT</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    // Signed Out State
                    <View style={styles.signedOutContainer}>
                        <Text style={[styles.welcomeText, { color: theme.colors.text }]}>
                            Sign in to save your progress
                        </Text>
                        
                        <TouchableOpacity 
                            style={[styles.button, styles.googleButton, { 
                                backgroundColor: theme.colors.surface,
                                borderColor: theme.colors.primary,
                                opacity: isLoading ? 0.6 : 1
                            }]}
                            onPress={handleGoogleSignIn}
                            disabled={isLoading}
                        >
                            <Text style={[styles.buttonText, { color: theme.colors.text }]}>
                                {isLoading ? 'SIGNING IN...' : 'SIGN IN WITH GOOGLE'}
                            </Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity 
                            style={[styles.button, { 
                                backgroundColor: 'transparent',
                                borderColor: theme.colors.textMuted,
                            }]}
                            onPress={() => { playHaptic('light'); setShowEmailModal(true); setIsSignUp(false); }}
                        >
                            <Text style={[styles.buttonText, { color: theme.colors.textMuted }]}>
                                SIGN IN WITH EMAIL
                            </Text>
                        </TouchableOpacity>
                        
                        {isExpoGo && (
                            <Text style={[styles.hintText, { color: theme.colors.textMuted }]}>
                                Running in Expo Go - Use email for testing
                            </Text>
                        )}
                    </View>
                )}
            </View>
            
            {/* Email Auth Modal */}
            <Modal
                visible={showEmailModal}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowEmailModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
                        <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
                            {isSignUp ? 'CREATE ACCOUNT' : 'SIGN IN'}
                        </Text>
                        
                        <TextInput
                            style={[styles.input, { 
                                backgroundColor: theme.colors.background,
                                color: theme.colors.text,
                                borderColor: theme.colors.primary
                            }]}
                            placeholder="Email"
                            placeholderTextColor={theme.colors.textMuted}
                            value={email}
                            onChangeText={setEmail}
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                        
                        <TextInput
                            style={[styles.input, { 
                                backgroundColor: theme.colors.background,
                                color: theme.colors.text,
                                borderColor: theme.colors.primary
                            }]}
                            placeholder="Password"
                            placeholderTextColor={theme.colors.textMuted}
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                        />
                        
                        <TouchableOpacity 
                            style={[styles.button, { 
                                backgroundColor: theme.colors.primary,
                                borderColor: theme.colors.primary,
                                opacity: isLoading ? 0.6 : 1
                            }]}
                            onPress={handleEmailAuth}
                            disabled={isLoading}
                        >
                            <Text style={[styles.buttonText, { color: theme.colors.background }]}>
                                {isLoading ? 'PLEASE WAIT...' : (isSignUp ? 'CREATE ACCOUNT' : 'SIGN IN')}
                            </Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity 
                            onPress={() => setIsSignUp(!isSignUp)}
                        >
                            <Text style={[styles.switchText, { color: theme.colors.primary }]}>
                                {isSignUp ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
                            </Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity 
                            style={[styles.button, { 
                                backgroundColor: 'transparent',
                                borderColor: theme.colors.textMuted,
                                marginTop: 10
                            }]}
                            onPress={() => { setShowEmailModal(false); setEmail(''); setPassword(''); }}
                        >
                            <Text style={[styles.buttonText, { color: theme.colors.textMuted }]}>
                                CANCEL
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
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
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 40,
    },
    backButton: {
        fontSize: 14,
        fontFamily: 'CabinetGrotesk-Bold',
        letterSpacing: 1,
    },
    title: {
        fontSize: 20,
        fontFamily: 'Panchang-Bold',
        letterSpacing: 3,
        marginLeft: 20,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    signedInContainer: {
        alignItems: 'center',
    },
    signedOutContainer: {
        alignItems: 'center',
    },
    avatarCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        borderWidth: 3,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
    },
    avatarText: {
        fontSize: 40,
        fontFamily: 'Panchang-Bold',
    },
    displayName: {
        fontSize: 24,
        fontFamily: 'Panchang-Bold',
        letterSpacing: 2,
        marginBottom: 8,
    },
    email: {
        fontSize: 14,
        fontFamily: 'Teko-Medium',
        letterSpacing: 1,
        marginBottom: 40,
    },
    welcomeText: {
        fontSize: 16,
        fontFamily: 'Teko-Medium',
        letterSpacing: 1,
        marginBottom: 30,
        textAlign: 'center',
    },
    button: {
        paddingVertical: 14,
        paddingHorizontal: 30,
        borderRadius: 8,
        borderWidth: 2,
        minWidth: 200,
        alignItems: 'center',
    },
    googleButton: {
        marginBottom: 15,
    },
    signOutButton: {
        backgroundColor: 'transparent',
    },
    buttonText: {
        fontSize: 14,
        fontFamily: 'CabinetGrotesk-Black',
        letterSpacing: 2,
    },
    hintText: {
        fontSize: 12,
        fontFamily: 'Teko-Medium',
        marginTop: 20,
        textAlign: 'center',
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.8)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        width: '100%',
        maxWidth: 350,
        borderRadius: 16,
        padding: 24,
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 20,
        fontFamily: 'Panchang-Bold',
        letterSpacing: 2,
        marginBottom: 24,
    },
    input: {
        width: '100%',
        height: 50,
        borderRadius: 8,
        borderWidth: 1,
        paddingHorizontal: 16,
        marginBottom: 16,
        fontSize: 16,
        fontFamily: 'Teko-Medium',
    },
    switchText: {
        fontSize: 14,
        fontFamily: 'Teko-Medium',
        marginTop: 16,
    },
});
