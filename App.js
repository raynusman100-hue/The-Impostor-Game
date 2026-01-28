import React, { useCallback, useEffect, useState, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, Text, Platform, Animated, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from './src/screens/HomeScreen';
import AppInitializer from './src/screens/AppInitializer';
import ProfileScreen from './src/screens/ProfileScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import SetupScreen from './src/screens/SetupScreen';
import RoleRevealScreen from './src/screens/RoleRevealScreen';
import DiscussionScreen from './src/screens/DiscussionScreen';
import WhoStartsScreen from './src/screens/WhoStartsScreen';
import WifiWhoStartsScreen from './src/screens/WifiWhoStartsScreen';
import ResultScreen from './src/screens/ResultScreen';
import WifiModeSelectorScreen from './src/screens/WifiModeSelectorScreen';
import HostScreen from './src/screens/HostScreen';
import JoinScreen from './src/screens/JoinScreen';
import WifiLobbyScreen from './src/screens/WifiLobbyScreen';
import WifiVotingScreen from './src/screens/WifiVotingScreen';
import HowToPlayScreen from './src/screens/HowToPlayScreen';
import ThemeSelectorScreen from './src/screens/ThemeSelectorScreen';
import PrivacyPolicyScreen from './src/screens/PrivacyPolicyScreen';
import TermsOfServiceScreen from './src/screens/TermsOfServiceScreen';

import PremiumScreen from './src/screens/PremiumScreen';
import { ThemeProvider, useTheme } from './src/utils/ThemeContext';
import { SettingsProvider } from './src/utils/SettingsContext';
import { VoiceChatProvider } from './src/utils/VoiceChatContext';

// --- TEMP: SEED FIREBASE CONFIG (DISABLED - CAUSING ERRORS) ---
// This seeding function was causing permission errors on app start
// The Agora config is now managed through the rotation scripts
// If you need to seed, run: node scripts/seedAgoraPool.js
// ----------------------------------

import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { useFonts } from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import ConsentScreen from './src/screens/ConsentScreen';

console.log('🚀 App.js: TOP LEVEL - File is loading');

// Prevent auto-hide, but catch errors (important for Expo Go)
SplashScreen.preventAutoHideAsync().catch(() => {
  // Ignore errors - splash screen may already be hidden in Expo Go
});

const Stack = createStackNavigator();

function AppNavigator() {
  const { theme } = useTheme();
  const [isNavigationReady, setIsNavigationReady] = useState(false);

  // Track app opens and show premium every 2nd time - AFTER navigation is ready
  useEffect(() => {
    if (!isNavigationReady) return;

    // App initialization logic can go here if needed
  }, [isNavigationReady]);

  return (
    <NavigationContainer onReady={() => setIsNavigationReady(true)}>
      <StatusBar style="light" />
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerStyle: {
            backgroundColor: 'transparent',
            elevation: 0,
            shadowOpacity: 0,
            borderBottomWidth: 0,
            height: Platform.OS === 'android' ? 45 : 50, // Even smaller: 45 for Android, 50 for iOS
          },
          headerTintColor: theme.colors.primary,
          headerTitleStyle: {
            fontFamily: 'Teko-Medium',
            fontSize: 18, // Further reduced font size
          },
          cardStyle: { backgroundColor: theme.colors.background },
          headerTitleAlign: 'center',
          headerBackTitleVisible: false,
          headerTransparent: true,
          headerTitle: "",
          gestureEnabled: true, // Enable iOS swipe back gesture
        }}
      >
        <Stack.Screen name="Home" component={AppInitializer} options={{ headerShown: false }} />
        <Stack.Screen name="Settings" component={SettingsScreen} options={{ headerShown: false }} />
        <Stack.Screen name="HowToPlay" component={HowToPlayScreen} options={{ headerShown: true }} />
        <Stack.Screen name="WifiModeSelector" component={WifiModeSelectorScreen} options={{ headerShown: true, headerTransparent: true }} />
        <Stack.Screen name="Host" component={HostScreen} options={{ headerShown: true }} />
        <Stack.Screen name="Join" component={JoinScreen} options={{ headerShown: true }} />
        <Stack.Screen name="WifiLobby" component={WifiLobbyScreen} options={{ headerShown: false }} />
        <Stack.Screen name="WifiVoting" component={WifiVotingScreen} options={{ headerShown: false }} />
        <Stack.Screen name="ThemeSelector" component={ThemeSelectorScreen} options={{ headerShown: true, title: '' }} />
        <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} options={{ headerShown: false }} />
        <Stack.Screen name="TermsOfService" component={TermsOfServiceScreen} options={{ headerShown: false }} />
        <Stack.Screen
          name="Profile"
          component={ProfileScreen}
          options={{
            headerShown: true,
            headerTransparent: false,
            headerTitle: "PROFILE",
            headerStyle: {
              backgroundColor: theme.colors.background,
              height: 70,
              elevation: 0,
              shadowOpacity: 0,
              borderBottomWidth: 1,
              borderBottomColor: theme.colors.primary + '30',
            },
            headerTintColor: theme.colors.primary,
            headerTitleStyle: {
              fontFamily: 'Panchang-Bold',
              fontSize: 24,
              letterSpacing: 4,
            },
            headerTitleAlign: 'center',
            headerBackTitleVisible: false,
          }}
        />
        <Stack.Screen name="Setup" component={SetupScreen} options={{ headerShown: true }} />
        <Stack.Screen name="RoleReveal" component={RoleRevealScreen} options={{ headerShown: false, gestureEnabled: false }} />
        <Stack.Screen name="WhoStarts" component={WhoStartsScreen} options={{ headerShown: false, gestureEnabled: false }} />
        <Stack.Screen name="WifiWhoStarts" component={WifiWhoStartsScreen} options={{ headerShown: false, gestureEnabled: false }} />
        <Stack.Screen name="Discussion" component={DiscussionScreen} options={{ headerShown: false, gestureEnabled: false }} />
        <Stack.Screen name="Result" component={ResultScreen} options={{ headerShown: false, gestureEnabled: false }} />

        <Stack.Screen name="Premium" component={PremiumScreen} options={{ headerShown: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}



export default function App() {
  console.log('🚀 App.js: App() function called');

  // SEEDING DISABLED - was causing Firebase permission errors
  // To seed Agora config, run: node scripts/seedAgoraPool.js

  const [appIsReady, setAppIsReady] = useState(false);
  const [hasAcceptedTerms, setHasAcceptedTerms] = useState(null); // null = loading, true/false = checked

  console.log('🚀 App.js: About to load fonts');

  const [fontsLoaded, fontError] = useFonts({
    'Teko-Medium': require('./assets/Teko_Complete/Fonts/OTF/Teko-Medium.otf'),
    'Sharpie-Black': require('./assets/Sharpie-Black.otf'),
    'BespokeStencil-Extrabold': require('./assets/BespokeStencil-Extrabold.otf'),
    'Panchang-Bold': require('./assets/Panchang-Bold.otf'),
    'CabinetGrotesk-Bold': require('./assets/CabinetGrotesk-Bold.otf'),
    'CabinetGrotesk-Black': require('./assets/CabinetGrotesk-Black.otf'),
    'CabinetGrotesk-Extrabold': require('./assets/CabinetGrotesk_Complete/Fonts/OTF/CabinetGrotesk-Extrabold.otf'),
    'Nippo-Bold': require('./assets/Nippo-Bold.otf'),
    'Comico-Regular': require('./assets/Comico_Complete/Comico_Complete/Fonts/OTF/Comico-Regular.otf'),
    'Kola-Regular': require('./assets/Kola_Complete/Kola_Complete/Fonts/OTF/Kola-Regular.otf'),
  });

  console.log('🚀 App.js: Fonts loaded?', fontsLoaded, 'Font error?', fontError);

  useEffect(() => {
    if (fontError) {
      console.error("App: Font loading error:", fontError);
    }
  }, [fontError]);

  useEffect(() => {
    async function prepare() {
      console.log('App: Prepare started');
      try {
        if (fontsLoaded) {
          console.log('App: Fonts loaded, checking terms');
          // Check if user has accepted terms before
          try {
            const accepted = await AsyncStorage.getItem('terms_accepted');
            console.log('App: Terms accepted status:', accepted);
            setHasAcceptedTerms(accepted === 'true');
          } catch (e) {
            console.error('App: Failed to read terms:', e);
            setHasAcceptedTerms(false);
          }

          // Hide native splash immediately - we'll show our animated overlay
          try {
            console.log('App: Hiding native splash');
            await SplashScreen.hideAsync();
          } catch (e) {
            console.warn('App: Error hiding splash:', e);
            // Ignore errors - splash may already be hidden
          }
          // Small delay to ensure first frame is rendered
          await new Promise(resolve => setTimeout(resolve, 50));
          console.log('App: Setting appIsReady to true');
          setAppIsReady(true);
        } else {
          console.log('App: Fonts NOT loaded yet');
        }
      } catch (e) {
        console.error('App: Error during prepare:', e);
      }
    }
    prepare();
  }, [fontsLoaded]);

  const handleAcceptTerms = async () => {
    try {
      await AsyncStorage.setItem('terms_accepted', 'true');
      setHasAcceptedTerms(true);
    } catch (e) {
      console.log('Failed to save terms acceptance');
    }
  };

  if (!fontsLoaded) {
    // Return a view with matching background color while fonts load
    return <View style={{ flex: 1, backgroundColor: '#0a0a0a' }} />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: '#0a0a0a' }}>
      <ThemeProvider>
        <VoiceChatProvider>
          <SettingsProvider>
            {/* Show consent screen if not accepted, otherwise show main app */}
            {hasAcceptedTerms === false ? (
              <ConsentScreen onAccept={handleAcceptTerms} />
            ) : hasAcceptedTerms === true ? (
              <AppNavigator />
            ) : null}

            {/* Smooth fade overlay removed */}
            {/* Static overlay while fonts are loading */}
            {!appIsReady && (
              <View style={{ flex: 1, backgroundColor: '#0a0a0a' }} />
            )}
          </SettingsProvider>
        </VoiceChatProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
