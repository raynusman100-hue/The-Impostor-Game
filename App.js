import React, { useCallback, useEffect, useState, useRef } from 'react';
import { StatusBar } from 'expo-status-bar';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from './src/screens/HomeScreen';
import ProfileScreen from './src/screens/ProfileScreen';
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
import { ThemeProvider, useTheme } from './src/utils/ThemeContext';

import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { useFonts } from 'expo-font';
import { View, Platform, Animated, StyleSheet, Image } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ConsentScreen from './src/screens/ConsentScreen';

// Prevent auto-hide, but catch errors (important for Expo Go)
SplashScreen.preventAutoHideAsync().catch(() => {
  // Ignore errors - splash screen may already be hidden in Expo Go
});

const Stack = createStackNavigator();

function AppNavigator() {
  const { theme } = useTheme();

  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerStyle: {
            backgroundColor: theme.colors.background,
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
        <Stack.Screen name="Home" component={HomeScreen} options={{ headerShown: false }} />
        <Stack.Screen name="HowToPlay" component={HowToPlayScreen} options={{ headerShown: true }} />
        <Stack.Screen name="WifiModeSelector" component={WifiModeSelectorScreen} options={{ headerShown: true }} />
        <Stack.Screen name="Host" component={HostScreen} options={{ headerShown: true }} />
        <Stack.Screen name="Join" component={JoinScreen} options={{ headerShown: true }} />
        <Stack.Screen name="WifiLobby" component={WifiLobbyScreen} options={{ headerShown: false }} />
        <Stack.Screen name="WifiVoting" component={WifiVotingScreen} options={{ headerShown: false }} />
        <Stack.Screen name="ThemeSelector" component={ThemeSelectorScreen} options={{ headerShown: true, title: '' }} />
        <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} options={{ headerShown: false }} />
        <Stack.Screen name="TermsOfService" component={TermsOfServiceScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Profile" component={ProfileScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Setup" component={SetupScreen} options={{ headerShown: true }} />
        <Stack.Screen name="RoleReveal" component={RoleRevealScreen} options={{ headerShown: false, gestureEnabled: false }} />
        <Stack.Screen name="WhoStarts" component={WhoStartsScreen} options={{ headerShown: false, gestureEnabled: false }} />
        <Stack.Screen name="WifiWhoStarts" component={WifiWhoStartsScreen} options={{ headerShown: false, gestureEnabled: false }} />
        <Stack.Screen name="Discussion" component={DiscussionScreen} options={{ headerShown: false, gestureEnabled: false }} />
        <Stack.Screen name="Result" component={ResultScreen} options={{ headerShown: false, gestureEnabled: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// Custom animated splash overlay for smooth transition
function AnimatedSplashOverlay({ onAnimationComplete }) {
  const fadeAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Smooth fade out with slight scale for cinematic feel
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1.1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onAnimationComplete();
    });
  }, []);

  return (
    <Animated.View
      style={[
        splashStyles.overlay,
        {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        },
      ]}
      pointerEvents="none"
    >
      <Image
        source={require('./assets/splash-icon.png')}
        style={splashStyles.splashImage}
        resizeMode="contain"
      />
    </Animated.View>
  );
}

const splashStyles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#0a0a0a',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 999,
  },
  splashImage: {
    width: 200,
    height: 200,
  },
});

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);
  const [splashAnimationComplete, setSplashAnimationComplete] = useState(false);
  const [hasAcceptedTerms, setHasAcceptedTerms] = useState(null); // null = loading, true/false = checked
  
  const [fontsLoaded] = useFonts({
    'Teko-Medium': require('./assets/Teko_Complete/Fonts/OTF/Teko-Medium.otf'),
    'Sharpie-Black': require('./assets/Sharpie-Black.otf'),
    'BespokeStencil-Extrabold': require('./assets/BespokeStencil-Extrabold.otf'),
    'Panchang-Bold': require('./assets/Panchang-Bold.otf'),
    'CabinetGrotesk-Bold': require('./assets/CabinetGrotesk-Bold.otf'),
    'CabinetGrotesk-Black': require('./assets/CabinetGrotesk-Black.otf'),
    'Nippo-Bold': require('./assets/Nippo-Bold.otf'),
    'Comico-Regular': require('./assets/Comico_Complete/Comico_Complete/Fonts/OTF/Comico-Regular.otf'),
    'Kola-Regular': require('./assets/Kola_Complete/Kola_Complete/Fonts/OTF/Kola-Regular.otf'),
  });

  useEffect(() => {
    async function prepare() {
      if (fontsLoaded) {
        // Check if user has accepted terms before
        try {
          const accepted = await AsyncStorage.getItem('terms_accepted');
          setHasAcceptedTerms(accepted === 'true');
        } catch (e) {
          setHasAcceptedTerms(false);
        }
        
        // Hide native splash immediately - we'll show our animated overlay
        try {
          await SplashScreen.hideAsync();
        } catch (e) {
          // Ignore errors - splash may already be hidden
        }
        // Small delay to ensure first frame is rendered
        await new Promise(resolve => setTimeout(resolve, 50));
        setAppIsReady(true);
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
        {/* Show consent screen if not accepted, otherwise show main app */}
        {hasAcceptedTerms === false ? (
          <ConsentScreen onAccept={handleAcceptTerms} />
        ) : hasAcceptedTerms === true ? (
          <AppNavigator />
        ) : null}
        
        {/* Animated splash overlay - fades out smoothly after app is ready */}
        {appIsReady && !splashAnimationComplete && hasAcceptedTerms !== null && (
          <AnimatedSplashOverlay 
            onAnimationComplete={() => setSplashAnimationComplete(true)} 
          />
        )}
        {/* Static overlay while fonts are loading but app not ready */}
        {!appIsReady && (
          <View style={splashStyles.overlay}>
            <Image
              source={require('./assets/splash-icon.png')}
              style={splashStyles.splashImage}
              resizeMode="contain"
            />
          </View>
        )}
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}
