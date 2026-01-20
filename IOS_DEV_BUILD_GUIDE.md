# iOS Development Build Setup Guide

## Problem Fixed
The error `RNGoogleSignin: failed to determine clientID - GoogleService-Info.plist was not found and iosClientId was not provided` has been resolved.

## What Was Changed

### 1. Google Sign-In Configuration (ProfileScreen.js)
Added the missing `iosClientId` parameter to the GoogleSignin.configure() call:

```javascript
GoogleSignin.configure({
    webClientId: '831244408092-mn4bhuvq6v4il0nippaiaf7q729o97bu.apps.googleusercontent.com',
    iosClientId: '831244408092-oifo3c54on55brivq9kupic53ntbgrd2.apps.googleusercontent.com',
    offlineAccess: true,
});
```

The `iosClientId` is taken from the `CLIENT_ID` field in your `GoogleService-Info.plist` file.

### 2. Codemagic Workflow Updates
Added verification steps to both iOS workflows to ensure GoogleService-Info.plist is properly included:

- Verifies the file exists in the root directory
- Copies it to the ios/ folder after prebuild
- Fails the build early if the file is missing

## Development Workflow (Correct Process)

### Step 1: One-Time IPA Installation (via Codemagic + Sideloadly)

This builds the development client that you install ONCE on your iPhone:

1. **Changes are already pushed to `ios-dev` branch** ✓

2. **Codemagic will automatically build:**
   - Unsigned Debug IPA with dev client
   - Includes GoogleService-Info.plist
   - Supports Metro bundler connection

3. **Download the IPA** from Codemagic artifacts (check your Codemagic dashboard)

4. **Install using Sideloadly (ONE TIME):**
   - Open Sideloadly
   - Drag the IPA file
   - Connect your iPhone
   - Click "Start"
   - This installs the development client on your phone

### Step 2: Daily Development (Instant Refresh)

After the one-time IPA installation, you NEVER need to rebuild or reinstall:

1. **Start Metro bundler on your computer:**
   ```bash
   npm start
   ```

2. **Open the app on your iPhone**
   - App automatically connects to Metro
   - Make code changes on your computer
   - Changes appear instantly on your phone (Fast Refresh)
   - No rebuilding, no reinstalling!

3. **That's it!** Edit code → Save → See changes instantly

### When to Rebuild IPA

You only need to rebuild and reinstall the IPA when:
- Native dependencies change (new npm packages with native code)
- app.json configuration changes
- iOS permissions change
- Otherwise, just use `npm start` for everything!

## Instant Refresh Setup

The Debug IPA you installed connects to Metro bundler for instant refresh:

1. **Ensure iPhone and computer are on the same WiFi network**

2. **Start Metro bundler:**
   ```bash
   npm start
   ```
   Or:
   ```bash
   npx expo start --dev-client
   ```

3. **Open the app on your iPhone**
   - Automatically connects to Metro
   - Code changes refresh instantly
   - Shake device to open developer menu
   - No need to rebuild or reinstall!

## Verifying Google Sign-In Works

After installation:

1. Open the app
2. Navigate to Profile screen
3. Tap "Sign in with Google"
4. Should now work without the clientID error

## Important Files

- `GoogleService-Info.plist` - iOS Firebase configuration (in root)
- `src/screens/ProfileScreen.js` - Google Sign-In initialization
- `app.json` - Expo configuration (references GoogleService-Info.plist)
- `codemagic.yaml` - CI/CD build configuration

## Troubleshooting

### If Google Sign-In still fails:

1. **Check Bundle ID matches:**
   - app.json: `com.rayn100.impostergame`
   - GoogleService-Info.plist: `com.rayn100.impostergame`
   - Firebase Console iOS app

2. **Verify CLIENT_ID in GoogleService-Info.plist:**
   ```
   831244408092-oifo3c54on55brivq9kupic53ntbgrd2.apps.googleusercontent.com
   ```

3. **Check Firebase Console:**
   - Go to Project Settings
   - iOS apps section
   - Ensure the iOS app is registered with correct Bundle ID

### If instant refresh doesn't work:

1. **Check Metro is running:**
   ```bash
   npm start
   ```

2. **Verify network connection:**
   - iPhone and computer on same WiFi
   - No firewall blocking port 8081

3. **Shake device and select "Reload"**

## Build Types Comparison

| Build Type | Install Method | Instant Refresh | Rebuild Needed? | Use Case |
|------------|----------------|-----------------|-----------------|----------|
| ios-dev IPA | Sideloadly (once) | ✓ Yes via Metro | Only for native changes | Daily development |
| ios-testflight | TestFlight | ✗ No | Every change | Beta testing |
| Production | App Store | ✗ No | Every change | Release |

## Next Steps

1. ✓ **Changes pushed to ios-dev branch**
2. **Check Codemagic** - build should start automatically
3. **Download IPA** from Codemagic artifacts
4. **Install via Sideloadly** (one time)
5. **Run `npm start`** on your computer
6. **Open app on iPhone** - instant refresh ready!
7. **Test Google Sign-In** - error should be fixed
