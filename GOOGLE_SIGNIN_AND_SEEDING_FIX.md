# Google Sign-In & Seeding Error - Complete Fix

## Issues Fixed

### 1. Firebase Seeding Error (FIXED ✅)
**Problem**: App was trying to write Agora config to Firebase on every startup, causing permission errors.

**Solution**: Disabled automatic seeding in `App.js`. The seeding function was:
- Running on every app start
- Trying to write to Firebase without proper permissions
- Causing console errors that confused debugging

**What Changed**:
- Removed `seedConfig()` function call from `useEffect` in `App.js`
- Added comments explaining how to seed manually if needed
- Seeding should only be done via: `node scripts/seedAgoraPool.js`

### 2. Google Sign-In URL Scheme Error (REQUIRES REBUILD)
**Problem**: iOS app missing URL scheme support for Google OAuth callbacks.

**Solution Applied**: Added `imposter-game` to `CFBundleURLSchemes` in `app.json`

**CRITICAL**: This fix only works in NEW builds. Your current installed app doesn't have the fix yet.

## What You Need To Do

### Option A: Test the Seeding Fix Now (Immediate)
The seeding error is fixed in the current code. Just reload the app:

1. In Expo Go or your dev build, shake device
2. Tap "Reload"
3. The seeding error should be gone

### Option B: Fix Google Sign-In (Requires Rebuild)
The URL scheme fix is in `app.json` but you need a new build:

#### For Development Testing:
```bash
# Clean and rebuild
npx expo prebuild --clean
npx expo run:ios
```

#### For Production/TestFlight:
```bash
# Create new EAS build
eas build --platform ios --profile production
```

## Verification Steps

### 1. Verify Seeding Error is Gone
- Open app
- Check console logs
- Should NOT see: "🌱 SEEDING: ❌ Failed"
- Should NOT see any Firebase permission errors on startup

### 2. Verify Google Sign-In (After Rebuild)
- Go to Profile screen
- Tap "Sign in with Google"
- Complete Google authentication
- Should redirect back to app successfully
- Should NOT see: "Your app is missing support for the following URL schemes"

## Technical Details

### Seeding Fix
**Before**:
```javascript
useEffect(() => { seedConfig(); }, []); // Ran on every app start
```

**After**:
```javascript
// SEEDING DISABLED - was causing Firebase permission errors
// To seed Agora config, run: node scripts/seedAgoraPool.js
```

### URL Scheme Fix
**Before**:
```json
"CFBundleURLSchemes": [
  "com.googleusercontent.apps.831244408092-oifo3c54on55brivq9kupic53ntbgrd2"
]
```

**After**:
```json
"CFBundleURLSchemes": [
  "imposter-game",
  "com.googleusercontent.apps.831244408092-oifo3c54on55brivq9kupic53ntbgrd2"
]
```

## Why The Google Error Still Appears

If you're still seeing the Google Sign-In error, it's because:

1. **You're testing on an OLD build** - The URL scheme fix is in `app.json` but your installed app was built BEFORE the fix
2. **Info.plist hasn't been regenerated** - The fix needs to go through the build process to update the actual iOS Info.plist file
3. **Expo Go limitations** - If using Expo Go, it may not support custom URL schemes properly

## Quick Test

### Test Seeding Fix (Works Now):
```bash
# Just reload the app - seeding error should be gone
```

### Test Google Sign-In Fix (Needs Rebuild):
```bash
# Option 1: Local rebuild
npx expo prebuild --clean
npx expo run:ios

# Option 2: EAS build
eas build --platform ios --profile preview
```

## Files Changed
- ✅ `App.js` - Removed automatic seeding (ACTIVE NOW)
- ✅ `app.json` - Added URL scheme (NEEDS REBUILD TO TAKE EFFECT)

## Status
- ✅ Seeding error: FIXED (active in current code)
- ⏳ Google Sign-In error: FIXED (requires rebuild to test)
