# Agora Voice Chat Setup Guide

## ✅ WHAT'S DONE

The voice chat UI is now **fully implemented and visible**:

1. **Mute/Unmute Button** - Always visible at top center of screen
2. **Status Indicator** - Shows "CONNECTING...", "LIVE", or "MUTED"
3. **Visual Feedback** - Orange dot when not connected, changes color when muted
4. **Works on All Screens** - Lobby, Discussion, Voting, Results
5. **Debug Panel** - Shows connection status (bottom-left corner)

## ❌ WHY YOU CAN'T HEAR ANYTHING

**The Agora SDK is not connecting because you're using Expo Go.**

Agora requires **native code** that must be compiled into the app. Expo Go doesn't include the Agora native modules.

## 🔧 SOLUTION: Build a Development Build

You **MUST** create a development build to use voice chat. Here's how:

### Option 1: EAS Build (Recommended - Cloud Build)

#### Step 1: Install EAS CLI
```bash
npm install -g eas-cli
```

#### Step 2: Login to Expo
```bash
eas login
```

#### Step 3: Build for Android (Faster to test)
```bash
eas build --profile development --platform android
```

This will:
- Build your app with all native modules (including Agora)
- Give you a downloadable APK
- Takes about 10-15 minutes

#### Step 4: Install on Device
- Download the APK from the EAS build page
- Install on your Android device
- Run the app

#### Step 5: Start Development Server
```bash
npx expo start --dev-client
```

### Option 2: Local Build (Faster but requires setup)

#### For Android:
```bash
npx expo run:android
```

Requirements:
- Android Studio installed
- Android SDK configured
- Android device or emulator

#### For iOS:
```bash
npx expo run:ios
```

Requirements:
- macOS only
- Xcode installed
- iOS Simulator or physical device

## Testing Voice Chat

Once you have a development build:

1. **Create a room** on one device (Host)
2. **Join the room** on another device (Player)
3. **Look for the mute button** at the top center
4. **Check the debug panel** - should show "Is Joined: ✅ YES"
5. **Test muting/unmuting** - icon should change
6. **Speak** - other players should hear you

## Debug Panel Information

The black debug panel shows:
- **Platform**: android/ios/web
- **Is Joined**: ✅ YES (connected) or ❌ NO (not connected)
- **Is Muted**: 🔇 YES or 🔊 NO
- **Remote Users**: Number of other players in voice chat

## Remove Debug Panel (After Testing)

Once voice chat is working, remove the debug panel:

### In `src/screens/WifiLobbyScreen.js`:
Remove these lines:
```javascript
import VoiceChatDebug from '../components/VoiceChatDebug';
// ... and ...
<VoiceChatDebug />
```

### In `src/screens/HostScreen.js`:
Remove these lines:
```javascript
import VoiceChatDebug from '../components/VoiceChatDebug';
// ... and ...
<VoiceChatDebug />
```

## Troubleshooting

### "Is Joined: ❌ NO" even in dev build

1. **Check permissions**: Make sure microphone permission is granted
2. **Check Agora App ID**: Verify it's correct in `src/utils/constants.js`
3. **Check console logs**: Look for 🎤 emoji logs for errors
4. **Rebuild the app**: Sometimes a clean rebuild helps

### No audio from other players

1. **Check their mute status**: They might be muted
2. **Check volume**: Device volume might be low
3. **Check network**: Both devices need internet connection
4. **Check Agora console**: Verify your App ID is active at console.agora.io

### Button not visible

1. **Check z-index**: VoiceControl has z-index: 999
2. **Check screen**: Make sure you're on a WiFi multiplayer screen
3. **Check imports**: Verify VoiceControl is imported and rendered

## Quick Test Commands

### Check if Agora is installed:
```bash
npm list react-native-agora
```

Should show: `react-native-agora@4.5.3`

### Rebuild after changes:
```bash
# Android
eas build --profile development --platform android --clear-cache

# iOS
eas build --profile development --platform ios --clear-cache
```

## Current Configuration

✅ Agora App ID: `5756bd3b457b4ecdac763e0ce74cd044`
✅ Voice chat enabled: `VOICE_CHAT_ENABLED = true`
✅ Permissions configured in app.json
✅ VoiceControl component on all screens
✅ Debug panel for testing

## Next Steps

1. **Build a development build** (EAS or local)
2. **Install on 2+ devices**
3. **Test voice chat** in a multiplayer game
4. **Remove debug panel** once working
5. **Build production** when ready

## Production Build (When Ready)

```bash
# Android
eas build --profile production --platform android

# iOS
eas build --profile production --platform ios
```

## Support

If voice chat still doesn't work after building:
1. Check console logs for 🎤 errors
2. Verify Agora App ID at console.agora.io
3. Test with 2 devices on same WiFi network first
4. Check Agora SDK documentation: https://docs.agora.io/en/voice-calling/get-started/get-started-sdk
