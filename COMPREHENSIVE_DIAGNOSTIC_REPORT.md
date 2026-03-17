# Comprehensive Diagnostic Report - Google Sign-In Issue

## Current State Analysis (March 17, 2026)

### ✅ What's Correct:

1. **Package Name**: `com.rayn100.impostor` (everywhere)
   - app.json ✅
   - google-services.json ✅
   - codemagic.yaml ✅
   - GoogleService-Info.plist (iOS) ✅

2. **Version Code**: 4 (ready for next build)
   - Previous: versionCode 3 (uploaded to Play Store)
   - Current: versionCode 4 (in app.json)

3. **Google Sign-In Configuration**:
   - webClientId: `831244408092-g256j85sdka2e5ql548r28ignggbjm7u.apps.googleusercontent.com`
   - This matches the OAuth client in google-services.json with SHA-1: `1fb5e79d76ffbf9e14dcc606464f6554f0bf4c6a`

4. **Firebase Config**:
   - google-services.json has ONLY `com.rayn100.impostor` (cleaned up)
   - No old package names present

5. **Keystore SHA-1**: `1F:B5:E7:9D:76:FF:BF:9E:14:DC:C6:06:46:4F:65:54:F0:BF:4C:6A`

---

## 🔴 Potential Issues (Why Google Sign-In Might Still Fail):

### Issue #1: Firebase Console SHA-1 Not Updated
**Problem**: The SHA-1 fingerprint might not be added to Firebase Console for the `com.rayn100.impostor` app.

**Solution**:
1. Go to: https://console.firebase.google.com/
2. Select project: `imposter-game-e5f12`
3. Click gear icon → Project settings
4. Scroll to "Your apps" → Find Android app with package `com.rayn100.impostor`
5. Scroll to "SHA certificate fingerprints"
6. Verify this SHA-1 is present: `1FB5E79D76FFBF9E14DCC606464F6554F0BF4C6A`
7. If not, click "Add fingerprint" and add it
8. Download the updated google-services.json
9. Replace in project and rebuild

---

### Issue #2: Google Cloud Console OAuth Client Not Configured
**Problem**: The webClientId `831244408092-g256j85sdka2e5ql548r28ignggbjm7u` might not have the correct redirect URIs or might be restricted.

**Solution**:
1. Go to: https://console.cloud.google.com/
2. Select project: `imposter-game-e5f12` (project number: 831244408092)
3. Go to: APIs & Services → Credentials
4. Find OAuth 2.0 Client ID: `831244408092-g256j85sdka2e5ql548r28ignggbjm7u`
5. Click to edit it
6. Check "Application type": Should be "Android" (NOT "Web application")
7. Check "Package name": Should be `com.rayn100.impostor`
8. Check "SHA-1 certificate fingerprint": Should be `1FB5E79D76FFBF9E14DCC606464F6554F0BF4C6A`
9. If any are wrong, fix them and save

---

### Issue #3: Testing with Wrong Build
**Problem**: You might be testing with an old APK/AAB that has the old package name or old configuration.

**Solution**:
1. Uninstall the app completely from your test device
2. Build a fresh AAB with the current configuration:
   ```bash
   eas build --platform android --profile production-aab --non-interactive
   ```
3. Upload to Play Console as version code 4
4. Download from Play Store internal testing
5. Test Google Sign-In

---

### Issue #4: Google Play Services Cache
**Problem**: Google Play Services on the device might have cached the old configuration.

**Solution**:
1. On your Android device, go to Settings → Apps
2. Find "Google Play Services"
3. Tap "Storage"
4. Tap "Clear Cache" (NOT "Clear Data")
5. Restart device
6. Try Google Sign-In again

---

### Issue #5: Wrong OAuth Client Type
**Problem**: The webClientId might be pointing to a "Web application" OAuth client instead of an "Android" OAuth client.

**Current webClientId**: `831244408092-g256j85sdka2e5ql548r28ignggbjm7u.apps.googleusercontent.com`

**What it should be**:
- Type: Android
- Package: com.rayn100.impostor
- SHA-1: 1FB5E79D76FFBF9E14DCC606464F6554F0BF4C6A

**Check in Google Cloud Console**:
1. Go to Credentials
2. Find this client ID
3. Verify it's type "Android" (not "Web")
4. If it's "Web", you need to use a different client ID or create a new Android one

---

## 🔍 Diagnostic Steps (Do These in Order):

### Step 1: Verify Firebase Console
```
1. Go to Firebase Console
2. Check if SHA-1 is added to com.rayn100.impostor app
3. If not, add it and download new google-services.json
```

### Step 2: Verify Google Cloud Console
```
1. Go to Google Cloud Console → Credentials
2. Find OAuth client: 831244408092-g256j85sdka2e5ql548r28ignggbjm7u
3. Verify it's type "Android" with correct package and SHA-1
4. If wrong, fix or create new Android OAuth client
```

### Step 3: Check google-services.json
```
1. Open google-services.json
2. Find the oauth_client with client_id: 831244408092-g256j85sdka2e5ql548r28ignggbjm7u
3. Verify it has:
   - package_name: com.rayn100.impostor
   - certificate_hash: 1fb5e79d76ffbf9e14dcc606464f6554f0bf4c6a
```

### Step 4: Build Fresh AAB
```bash
# Make sure all changes are committed
git status

# Build new AAB
eas build --platform android --profile production-aab --non-interactive

# Wait ~20 minutes for build to complete
```

### Step 5: Test on Clean Device
```
1. Uninstall old app completely
2. Clear Google Play Services cache
3. Install new AAB from Play Store
4. Test Google Sign-In
```

---

## 📊 Current Configuration Summary:

```json
{
  "package": "com.rayn100.impostor",
  "versionCode": 4,
  "webClientId": "831244408092-g256j85sdka2e5ql548r28ignggbjm7u.apps.googleusercontent.com",
  "iosClientId": "831244408092-oifo3c54on55brivq9kupic53ntbgrd2.apps.googleusercontent.com",
  "sha1": "1FB5E79D76FFBF9E14DCC606464F6554F0BF4C6A",
  "firebaseProject": "imposter-game-e5f12",
  "projectNumber": "831244408092"
}
```

---

## 🎯 Most Likely Root Cause:

Based on the "Developer Error" message, the most likely issue is:

**The OAuth client `831244408092-g256j85sdka2e5ql548r28ignggbjm7u` in Google Cloud Console is NOT configured as an Android client, or it doesn't have the correct package name and SHA-1 fingerprint.**

### To Fix:
1. Go to Google Cloud Console → Credentials
2. Check if this client exists and is type "Android"
3. If it's "Web" type, you need to either:
   - Create a NEW Android OAuth client with package `com.rayn100.impostor` and SHA-1
   - OR use the existing Android client ID from google-services.json

---

## 🔧 Alternative: Use Existing Android Client

Looking at your google-services.json, you have these Android OAuth clients:

1. `831244408092-0d1bc2s7kngio0eusdeip2m0pv8prv5k` (SHA: 5e8f16062ea3cd2c4a0d547876baa6f38cabf625)
2. `831244408092-g256j85sdka2e5ql548r28ignggbjm7u` (SHA: 1fb5e79d76ffbf9e14dcc606464f6554f0bf4c6a) ← USING THIS
3. `831244408092-v3hlt8mhdeomk11nebfbe90vhh9t73cc` (SHA: 81af3830d1fc6ec12b54c5819ca6401343614f6b)

The one you're using (#2) matches your keystore SHA-1, so it SHOULD work.

**But**: You need to verify in Google Cloud Console that this client ID actually exists and is properly configured.

---

## 📝 Action Items:

1. [ ] Check Firebase Console - verify SHA-1 is added
2. [ ] Check Google Cloud Console - verify OAuth client configuration
3. [ ] If needed, download new google-services.json
4. [ ] Build fresh AAB with versionCode 4
5. [ ] Test on clean device

---

## 🚨 CRITICAL: What I Changed

In my last commit, I:
1. ✅ Removed old package entries from google-services.json (GOOD)
2. ✅ Incremented versionCode to 4 (GOOD)
3. ❌ Did NOT verify Firebase Console SHA-1 (NEED TO CHECK)
4. ❌ Did NOT verify Google Cloud Console OAuth client (NEED TO CHECK)

**The file changes were correct, but the Firebase/Google Cloud Console configuration might still be wrong.**

---

## Next Steps:

**You need to manually check**:
1. Firebase Console → Project Settings → Your Apps → Android (com.rayn100.impostor) → SHA fingerprints
2. Google Cloud Console → APIs & Services → Credentials → Find OAuth client `831244408092-g256j85sdka2e5ql548r28ignggbjm7u`

If either is missing or wrong, that's your issue.
