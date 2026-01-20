# Android Development Build Guide

## What's Fixed

1. ✅ **iOS Character Image** - Now uses `star_character.png` on iOS (no spaces in filename)
2. ✅ **Google Sign-In Speed** - Added 5s timeout to Play Services check (was causing 30s delay)
3. ✅ **Android Dev Build** - New workflow for development APKs with Metro support

## Android Dev Build Workflow

### Purpose
Build a Debug APK that connects to Metro bundler for instant refresh, perfect for:
- Testing voice chat with multiple devices
- Quick iteration without rebuilding
- Testing multiplayer features locally

### How to Use

1. **Push to android-dev branch:**
   ```bash
   git checkout android-dev
   git push origin android-dev
   ```

2. **Codemagic builds Debug APK automatically**
   - Check Codemagic dashboard
   - Download APK from artifacts

3. **Install on multiple Android devices:**
   - Transfer APK to each device
   - Install (enable "Install from unknown sources")

4. **Start Metro bundler:**
   ```bash
   npx expo start --dev-client
   ```

5. **Connect devices:**
   - Open app on each device
   - Scan QR code or enter URL manually
   - All devices connect to same Metro instance

6. **Test features:**
   - Voice chat between devices
   - Multiplayer gameplay
   - WiFi mode features
   - Instant code refresh on all devices!

## Development Workflow

### Daily Development
```bash
# Start Metro
npx expo start --dev-client

# Make code changes
# Save file
# All connected devices refresh instantly!
```

### Testing Voice Chat
1. Install Debug APK on 2+ Android devices
2. Connect all to Metro (same WiFi)
3. Test voice chat features
4. Changes refresh on all devices

### Network Setup
- All devices must be on same WiFi as your computer
- Computer IP: Run `ipconfig` to find
- If QR scan doesn't work, manually enter: `exp://YOUR_IP:8081`

## Branch Overview

| Branch | Platform | Build Type | Use Case |
|--------|----------|------------|----------|
| android-dev | Android | Debug APK | Development with Metro |
| ios-dev | iOS | Debug IPA | Development with Metro |
| apk | Android | Release APK | Production testing |
| production | Both | Release | App Store/Play Store |

## Fixes Included

### iOS Character Image Fix
- Changed from `sweat boy .png` (with space) to `star_character.png`
- iOS is strict about filenames with spaces
- Android still uses original image

### Google Sign-In Speed Fix
- Added 5-second timeout to Play Services check
- Prevents 30s hang on slow networks
- Sign-in now starts within 5s max

## Troubleshooting

### APK won't install
- Enable "Install from unknown sources" in Android settings
- Check if you have enough storage

### Can't connect to Metro
- Verify same WiFi network
- Try manual URL entry: `exp://YOUR_COMPUTER_IP:8081`
- Check firewall isn't blocking port 8081

### Voice chat not working
- Ensure microphone permissions granted
- Check both devices are connected to Metro
- Test with 2 devices on same WiFi first

### Changes not refreshing
- Check Metro terminal for errors
- Shake device → Reload
- Verify device is connected (should see in Metro logs)

## Production Builds

When ready for production testing:

```bash
# Android Release APK
git checkout apk
git merge android-dev
git push origin apk

# iOS TestFlight
git checkout production
git merge ios-dev
git push origin production
```

## Quick Commands

```bash
# Switch to dev branches
git checkout android-dev  # Android development
git checkout ios-dev      # iOS development

# Start Metro for dev builds
npx expo start --dev-client

# Check your IP for manual connection
ipconfig  # Windows
ifconfig  # Mac/Linux
```
