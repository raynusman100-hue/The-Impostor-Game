# Google Sign-In DEVELOPER_ERROR - Complete Fix Guide

## Current Status

You're getting "DEVELOPER_ERROR" when trying to sign in with Google on the internal testing build.

## Root Cause Analysis

The error is NOT about SHA-1 fingerprints (those are already correct in Firebase). The DEVELOPER_ERROR typically means:

1. **Package name mismatch** between app and Firebase
2. **OAuth client configuration issue** in Google Cloud Console
3. **google-services.json not matching the build**

## The Real Problem

When you upload an AAB to Play Store for internal testing, Google re-signs it with the **Play Store signing key**. This means:

- Your app's package name: `com.rayn100.impostor`
- Your app's SHA-1 after Play Store signing: `81:af:38:30:d1:fc:6e:c1:2b:54:c5:81:9c:a6:40:13:43:61:4f:6b`

But the OAuth client in your `google-services.json` might be configured for the EAS keystore SHA-1, not the Play Store SHA-1.

## Complete Fix

### Step 1: Verify Firebase Console Configuration

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select project: **imposter-game-e5f12**
3. Click gear icon ⚙️ → **Project settings**
4. Go to **Your apps** → Find Android app `com.rayn100.impostor`
5. Verify ALL THREE SHA-1 fingerprints are present:
   - `5e:8f:16:06:2e:a3:cd:2c:4a:0d:54:78:76:ba:a6:f3:8c:ab:f6:25` (Debug)
   - `1f:b5:e7:9d:76:ff:bf:9e:14:dc:c6:06:46:4f:65:54:f0:bf:4c:6a` (EAS)
   - `81:af:38:30:d1:fc:6e:c1:2b:54:c5:81:9c:a6:40:13:43:61:4f:6b` (Play Store) ← **CRITICAL**

### Step 2: Download NEW google-services.json

After verifying all SHA-1s are present:

1. In Firebase Console, scroll down to **google-services.json**
2. Click **Download google-services.json**
3. Replace your current `android/app/google-services.json` with the new one
4. **IMPORTANT**: Check the new file has OAuth clients for all 3 SHA-1s

### Step 3: Verify OAuth Client Configuration

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select project: **imposter-game-e5f12**
3. Go to **APIs & Services** → **Credentials**
4. Find the OAuth 2.0 Client ID for Android
5. Verify:
   - Package name: `com.rayn100.impostor`
   - SHA-1: `81:af:38:30:d1:fc:6e:c1:2b:54:c5:81:9c:a6:40:13:43:61:4f:6b` (Play Store)

### Step 4: Rebuild and Re-upload

```bash
# Build new AAB with updated google-services.json
eas build --platform android --profile production
```

### Step 5: Test Again

After uploading the new AAB to internal testing:

1. Download and install the app
2. Try Google Sign-In
3. It should work now

## Why This Happens

Google Sign-In validates:
1. Package name matches
2. SHA-1 fingerprint matches
3. OAuth client exists for that package + SHA-1 combination

When Play Store re-signs your app, the SHA-1 changes. If Firebase doesn't have an OAuth client for the Play Store SHA-1, you get DEVELOPER_ERROR.

## Verification Checklist

- [ ] All 3 SHA-1s in Firebase Console
- [ ] Downloaded fresh google-services.json
- [ ] Replaced old google-services.json with new one
- [ ] Rebuilt AAB with new google-services.json
- [ ] Uploaded new AAB to Play Console
- [ ] Tested Google Sign-In on downloaded build

## If It Still Fails

1. Check logcat for detailed error:
   ```bash
   adb logcat | grep -i "google"
   ```

2. Verify package name in app:
   ```bash
   aapt dump badging your-app.aab | grep package
   ```

3. Contact me with the exact error message from logcat

---

**TL;DR**: Download fresh `google-services.json` from Firebase Console (after verifying all 3 SHA-1s are present), replace the old one, rebuild AAB, and re-upload to Play Console.
