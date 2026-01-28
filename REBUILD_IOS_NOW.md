# Rebuild iOS App - Google Sign-In Fix Applied

## What Was Fixed
Added the missing `imposter-game` URL scheme to `app.json`. iOS needs BOTH URL schemes:
- `imposter-game` (base app scheme)
- `com.googleusercontent.apps.831244408092-oifo3c54on55brivq9kupic53ntbgrd2` (Google OAuth)

## Rebuild Instructions

### Option 1: EAS Build (Recommended for Production)
```bash
eas build --platform ios --profile production
```

### Option 2: Local Development Build
```bash
npx expo prebuild --clean
npx expo run:ios
```

### Option 3: If You Have Xcode Project
```bash
cd ios
pod deintegrate
pod install
cd ..
npx react-native run-ios
```

## What to Test
1. Open the app
2. Go to Profile screen
3. Tap "Sign in with Google"
4. Complete Google authentication
5. Verify you're redirected back to the app successfully
6. Check that no URL scheme errors appear

## Expected Result
✅ Google Sign-In completes without errors
✅ User is signed in and profile data loads
✅ No console errors about missing URL schemes

## If Still Having Issues
1. Make sure you're testing on a REAL device (not simulator)
2. Verify the build includes the updated app.json
3. Check that GoogleService-Info.plist is in the project root
4. Ensure bundle identifier matches: `com.rayn100.impostergame`

## Files Changed
- ✅ `app.json` - Added `imposter-game` to CFBundleURLSchemes

That's it! The fix is minimal but critical for production.
