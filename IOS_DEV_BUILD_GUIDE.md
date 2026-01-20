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

## How to Build & Test with Instant Refresh

### Option 1: Using Codemagic (Recommended for Testing)

1. **Push to the `ios-dev` branch:**
   ```bash
   git add .
   git commit -m "Fix iOS Google Sign-In configuration"
   git push origin ios-dev
   ```

2. **Codemagic will automatically:**
   - Build an unsigned Debug IPA
   - Include GoogleService-Info.plist
   - Enable Metro bundler support for instant refresh

3. **Download the IPA** from Codemagic artifacts

4. **Install using Sideloadly:**
   - Open Sideloadly
   - Drag the IPA file
   - Connect your iPhone
   - Click "Start"

### Option 2: Local Development Build

For the fastest development cycle with instant refresh:

1. **Install Expo Dev Client:**
   ```bash
   npm install -g expo-cli
   npx expo install expo-dev-client
   ```

2. **Start Metro bundler:**
   ```bash
   npx expo start --dev-client
   ```

3. **Build and install on device:**
   ```bash
   npx expo run:ios --device
   ```

## Instant Refresh Setup

Once installed, the Debug build will connect to Metro bundler for instant refresh:

1. **Ensure your iPhone and computer are on the same WiFi network**

2. **Start the Metro bundler:**
   ```bash
   npm start
   ```

3. **Open the app on your iPhone**
   - It will automatically connect to Metro
   - Changes will refresh instantly (Fast Refresh)
   - Shake device to open developer menu

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

| Build Type | Signing | Instant Refresh | Use Case |
|------------|---------|-----------------|----------|
| ios-dev (Codemagic) | Unsigned | ✓ Yes | Quick testing with Sideloadly |
| Local expo run:ios | Debug | ✓ Yes | Active development |
| ios-testflight | Signed | ✗ No | Beta testing |

## Next Steps

1. Push your changes to trigger a Codemagic build
2. Download and install the IPA via Sideloadly
3. Test Google Sign-In functionality
4. Enjoy instant refresh during development!
