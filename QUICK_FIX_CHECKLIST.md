# Quick Fix Checklist - Google Sign-In DEVELOPER_ERROR

## What I Fixed
✅ Updated `webClientId` in ProfileScreen.js to use the correct Web OAuth client ID

## What You Need to Do

### 1. Add Play Store SHA-1 to Firebase (5 minutes)
1. Go to https://console.firebase.google.com/
2. Select project: `imposter-game-e5f12`
3. Click gear icon → Project Settings
4. Scroll to "Your apps" → Find `com.rayn100.impostor`
5. Click "Add fingerprint"
6. Paste: `F3:3A:6F:FE:30:10:3E:4E:CA:79:A5:2A:92:7C:C2:39:1B:7F:99:B9`
7. Click "Save"

### 2. Download Updated google-services.json
1. Still in Firebase Console → Project Settings
2. Find your Android app: `com.rayn100.impostor`
3. Click "Download google-services.json"
4. Replace the file in your project root
5. **Verify**: The new file should have 4 OAuth clients (currently has 3)

### 3. Build New AAB
```bash
eas build --platform android --profile production
```

### 4. Upload to Play Store Internal Testing
1. Wait for build to complete
2. Download the AAB
3. Upload to Google Play Console → Internal testing
4. Increment version code if needed (currently at 5)

### 5. Test on MuMu Emulator
1. Download internal testing build from Play Store
2. Open app
3. Go to Profile
4. Click "Sign in with Google"
5. Select account
6. **Expected**: Consent screen appears (no DEVELOPER_ERROR)
7. Complete sign-in

## Why This Fixes It

**Problem**: You were using an Android OAuth client ID as the `webClientId` parameter, which is incorrect.

**Solution**: Changed to the Web OAuth client ID (`type 3` in google-services.json).

**Additional**: Adding the Play Store SHA-1 ensures Firebase recognizes your Play Store signed build.

## If It Still Doesn't Work

Check these:
1. Did you download the NEW google-services.json after adding the SHA-1?
2. Did you rebuild the app AFTER replacing google-services.json?
3. Are you testing the NEW build from Play Store (not an old one)?
4. Is the SHA-1 added to the correct Firebase project and app?

## Files Changed
- ✅ `src/screens/ProfileScreen.js` - Fixed webClientId
- ⏳ `google-services.json` - You need to download the updated version from Firebase
