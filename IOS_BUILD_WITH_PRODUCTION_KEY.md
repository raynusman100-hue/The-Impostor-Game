# Rebuild iOS App with Production RevenueCat Key

## Issue
Your current TestFlight build has an old test RevenueCat key. The production key is now in the code but needs a new build.

## Solution: Rebuild iOS App

### Option 1: EAS Build (Recommended)

```bash
# Build for TestFlight
eas build --platform ios --profile production

# Or if you have a preview profile
eas build --platform ios --profile preview
```

After build completes:
1. Download the .ipa file from EAS dashboard
2. Upload to App Store Connect via Transporter app
3. Submit to TestFlight
4. Wait for processing (10-30 minutes)
5. Test the new build

### Option 2: Local Xcode Build

```bash
# Generate iOS project
npx expo prebuild --platform ios

# Open in Xcode
open ios/impostergame.xcworkspace

# In Xcode:
# 1. Select your team
# 2. Select "Any iOS Device" as target
# 3. Product → Archive
# 4. Distribute App → App Store Connect
# 5. Upload
```

## Verify the Fix

After installing the new TestFlight build:
1. Open the app
2. Sign in
3. Go to Profile screen
4. You should NOT see the "Wrong API Key" error
5. Premium features should work correctly

## Current Code Status ✅

The code is correct:
- Production iOS key: `appl_GidmNgibMGrbuhmiJwrzLeJLEZM`
- Production Android key: `goog_WeLuvQfgjZEppbpIoqiqCzciCqq`
- All code pushed to GitHub main branch

## What Happened

1. You built the iOS app for TestFlight earlier (probably in January)
2. That build had a test key
3. We just updated the code with the production key
4. The old TestFlight build still has the old test key
5. Need to rebuild with the new code

## After Rebuild

Once you rebuild and upload:
- TestFlight will have the production key
- Premium purchases will work in TestFlight (with sandbox accounts)
- App Store submission will work correctly
- No more "Wrong API Key" errors

---

**Next Step**: Run `eas build --platform ios --profile production` to create a new build with the production key.
