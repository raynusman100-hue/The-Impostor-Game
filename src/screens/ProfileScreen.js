import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { onAuthStateChanged, signOut, signInWithCredential, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../utils/firebase';
import { useTheme } from '../utils/ThemeContext';
import { playHaptic } from '../utils/haptics';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';

// Configure Google Sign-In for native builds
GoogleSignin.configure({
    webClientId: '831244408092-mn4bhuvq6v4il0nippaiaf7q729o97bu.apps.googleusercontent.com',
    offlineAccess: true,
});

export default function ProfileScreen({ navigation }) {
    const { theme } = useTheme();
    const [user, setUser] = useState(null);
    const [displayName, setDisplayName] = useState('');
    const [isLoading, setIsLoading] = useState(false);

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

    const handleSignOut = async () => {
        playHaptic('medium');
        try {
            // Sign out from Google
            try {
                await GoogleSignin.signOut();
            } catch (e) {
                console.log('Google signout error (may not be signed in):', e);
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
                    </View>
                )}
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
});
