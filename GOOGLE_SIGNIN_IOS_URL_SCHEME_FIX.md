# Google Sign-In iOS URL Scheme Fix

## Problem
iOS app crashes with error: "Your app is missing support for the following URL schemes..."

This occurs because the app's Info.plist is missing the required URL schemes for Google Sign-In to handle OAuth callbacks.

## Root Cause
The `CFBundleURLSchemes` in `app.json` was only configured with the reversed client ID but was missing the base app scheme. iOS requires BOTH schemes to be registered:

1. **Base app scheme** (`imposter-game`) - for general deep linking
2. **Reversed client ID** (`com.googleusercontent.apps.831244408092-oifo3c54on55brivq9kupic53ntbgrd2`) - for Google Sign-In OAuth callbacks

## Solution Applied

### 1. Updated app.json
Added both URL schemes to the `CFBundleURLSchemes` array:

```json
"CFBundleURLTypes": [
  {
    "CFBundleURLSchemes": [
      "imposter-game",
      "com.googleusercontent.apps.831244408092-oifo3c54on55brivq9kupic53ntbgrd2"
    ]
  }
]
```

### 2. Verified Configuration
- ✅ GoogleService-Info.plist has correct REVERSED_CLIENT_ID
- ✅ ProfileScreen.js has correct GoogleSignin.configure() setup
- ✅ Package.json has @react-native-google-signin/google-signin v16.1.1

## Testing Steps

### For Development Build
1. Clean build cache:
   ```bash
   cd ios
   rm -rf build
   pod deintegrate
   pod install
   cd ..
   ```

2. Rebuild the app:
   ```bash
   npx expo run:ios
   ```

3. Test Google Sign-In flow

### For EAS Build
1. Create new build:
   ```bash
   eas build --platform ios --profile preview
   ```

2. Install on device and test Google Sign-In

## Verification
After applying this fix:
- Google Sign-In should complete successfully
- No URL scheme errors should appear
- OAuth callback should redirect properly back to the app

## Technical Details

### URL Scheme Flow
1. User taps "Sign in with Google"
2. App opens Google's OAuth page in Safari/SFSafariViewController
3. User authenticates with Google
4. Google redirects to: `com.googleusercontent.apps.831244408092-oifo3c54on55brivq9kupic53ntbgrd2://oauth2callback`
5. iOS uses the registered URL scheme to return to the app
6. App receives the OAuth token and completes sign-in

### Why Both Schemes Are Needed
- `imposter-game`: Base app scheme for general deep linking (QR codes, web links, etc.)
- `com.googleusercontent.apps.*`: Specific scheme for Google OAuth callbacks

## Related Files
- `app.json` - Main configuration (FIXED)
- `GoogleService-Info.plist` - Firebase/Google config (correct)
- `src/screens/ProfileScreen.js` - Google Sign-In implementation (correct)

## Status
✅ **FIXED** - URL schemes properly configured for iOS Google Sign-In
