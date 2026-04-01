# Google Sign-In DEVELOPER_ERROR Fix for Internal Testing Build

## Problem
Google Sign-In shows `DEVELOPER_ERROR` immediately when clicking an account in the internal testing build downloaded from Play Store. This happens BEFORE the consent screen, indicating an OAuth client configuration issue.

## Root Cause Analysis

### Current Configuration Issues:
1. **Missing Play Store SHA-1**: The Play Store signing certificate SHA-1 is not registered in Firebase
2. **Wrong Web Client ID**: ProfileScreen.js is using an Android OAuth client ID instead of the Web client ID

### Current State:
- **Play Store SHA-1**: `F3:3A:6F:FE:30:10:3E:4E:CA:79:A5:2A:92:7C:C2:39:1B:7F:99:B9`
- **Registered OAuth clients in google-services.json**:
  - `5e8f16062ea3cd2c4a0d547876baa6f38cabf625` (Android)
  - `1fb5e79d76ffbf9e14dcc606464f6554f0bf4c6a` (Android)
  - `81af3830d1fc6ec12b54c5819ca6401343614f6b` (Android)
- **Web Client ID**: `831244408092-mn4bhuvq6v4il0nippaiaf7q729o97bu.apps.googleusercontent.com`
- **Currently used in code**: `831244408092-v3hlt8mhdeomk11nebfbe90vhh9t73cc.apps.googleusercontent.com` (WRONG - this is an Android client)

## Solution

### Step 1: Add Play Store SHA-1 to Firebase

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `imposter-game-e5f12`
3. Click the gear icon → Project Settings
4. Scroll down to "Your apps" section
5. Find your Android app: `com.rayn100.impostor`
6. Click "Add fingerprint"
7. Paste the Play Store SHA-1: `F3:3A:6F:FE:30:10:3E:4E:CA:79:A5:2A:92:7C:C2:39:1B:7F:99:B9`
8. Click "Save"

### Step 2: Fix Web Client ID in Code

The `webClientId` in `GoogleSignin.configure()` should use the Web client ID, not an Android client ID.

**File**: `src/screens/ProfileScreen.js`

**Current (WRONG)**:
```javascript
GoogleSignin.configure({
    webClientId: '831244408092-v3hlt8mhdeomk11nebfbe90vhh9t73cc.apps.googleusercontent.com',
    iosClientId: '831244408092-oifo3c54on55brivq9kupic53ntbgrd2.apps.googleusercontent.com',
    offlineAccess: true,
});
```

**Fixed (CORRECT)**:
```javascript
GoogleSignin.configure({
    webClientId: '831244408092-mn4bhuvq6v4il0nippaiaf7q729o97bu.apps.googleusercontent.com',
    iosClientId: '831244408092-oifo3c54on55brivq9kupic53ntbgrd2.apps.googleusercontent.com',
    offlineAccess: true,
});
```

### Step 3: Download Updated google-services.json

1. In Firebase Console → Project Settings → Your apps
2. Find your Android app: `com.rayn100.impostor`
3. Click "Download google-services.json"
4. Replace the existing `google-services.json` file in your project root
5. **IMPORTANT**: The new file will contain a 4th OAuth client with the Play Store certificate hash

### Step 4: Rebuild and Test

1. After making the code change and downloading the new google-services.json:
   ```bash
   eas build --platform android --profile production
   ```

2. Wait for build to complete (15-20 minutes)

3. Upload the new AAB to Google Play Console internal testing

4. Download and test on your MuMu emulator

## Why This Fixes the Issue

### The DEVELOPER_ERROR appears immediately because:
1. **Wrong Client ID**: Using an Android OAuth client ID as the `webClientId` parameter causes Google Sign-In to fail validation
2. **Missing Certificate**: The Play Store signing certificate is not registered, so Google can't verify the app's identity

### After the fix:
1. **Correct Web Client ID**: Google Sign-In will use the proper Web OAuth client for authentication
2. **Registered Certificate**: Firebase will recognize the Play Store signed build as legitimate
3. **OAuth Flow Works**: The authentication flow will proceed normally to the consent screen

## Verification Checklist

After applying the fix:
- [ ] Play Store SHA-1 added to Firebase
- [ ] Web Client ID updated in ProfileScreen.js
- [ ] New google-services.json downloaded and replaced
- [ ] New AAB build created with EAS
- [ ] AAB uploaded to internal testing
- [ ] App downloaded from Play Store on test device
- [ ] Google Sign-In button clicked
- [ ] Account selection works without DEVELOPER_ERROR
- [ ] Consent screen appears
- [ ] Sign-in completes successfully

## Technical Details

### Why Web Client ID is Required
The `@react-native-google-signin/google-signin` library requires a Web OAuth client ID (not an Android client ID) for the `webClientId` parameter. This is used for server-side authentication and token validation.

### Certificate Hash Format
- **Firebase/Google Cloud Console format**: Colon-separated uppercase hex (SHA-1)
  - Example: `F3:3A:6F:FE:30:10:3E:4E:CA:79:A5:2A:92:7C:C2:39:1B:7F:99:B9`
- **google-services.json format**: Lowercase hex without separators
  - Example: `f33a6ffe30103e4eca79a52a927cc2391b7f99b9`

### OAuth Client Types in google-services.json
- **Type 1**: Android OAuth client (requires package name + certificate hash)
- **Type 2**: iOS OAuth client (requires bundle ID)
- **Type 3**: Web OAuth client (no platform restrictions)

## Common Mistakes to Avoid

1. ❌ Using an Android OAuth client ID as `webClientId`
2. ❌ Forgetting to download updated google-services.json after adding SHA-1
3. ❌ Not rebuilding the app after configuration changes
4. ❌ Testing with a debug build instead of the Play Store signed build
5. ❌ Adding SHA-1 to the wrong Firebase project or app

## Additional Resources

- [Google Sign-In for Android Documentation](https://developers.google.com/identity/sign-in/android/start)
- [Firebase Android Setup](https://firebase.google.com/docs/android/setup)
- [React Native Google Sign-In Library](https://github.com/react-native-google-signin/google-signin)
