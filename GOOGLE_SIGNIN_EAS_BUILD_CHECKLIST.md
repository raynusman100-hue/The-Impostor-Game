# Google Sign-In Pre-Build Checklist for EAS

## Current Status: ✅ READY (with one action required)

Your Google Sign-In configuration is mostly correct, but there's ONE CRITICAL STEP you need to do before building.

---

## ✅ What's Already Configured Correctly

### 1. ProfileScreen.js Configuration
```javascript
GoogleSignin.configure({
    webClientId: '831244408092-g256j85sdka2e5ql548r28ignggbjm7u.apps.googleusercontent.com',
    iosClientId: '831244408092-oifo3c54on55brivq9kupic53ntbgrd2.apps.googleusercontent.com',
    offlineAccess: true,
});
```
✅ Correct webClientId for Android
✅ Correct iosClientId for iOS

### 2. google-services.json
✅ Has 3 OAuth clients with different SHA-1 fingerprints:
- `5e8f16062ea3cd2c4a0d547876baa6f38cabf625` (Debug/Development)
- `1fb5e79d76ffbf9e14dcc606464f6554f0bf4c6a` (EAS Build - YOUR KEYSTORE)
- `81af3830d1fc6ec12b54c5819ca6401343614f6b` (Play Store Signing)

✅ Has webClientId: `831244408092-mn4bhuvq6v4il0nippaiaf7q729o97bu.apps.googleusercontent.com`

### 3. Package Name
✅ `com.rayn100.impostor` (consistent across app.json and google-services.json)

---

## 🔴 CRITICAL: What You MUST Do Before Building

### The Issue from Last Time

Your Google Sign-In failed because **EAS builds use a different signing key** than local development builds. 

**Your EAS keystore SHA-1**: `1FB5E79D76FFBF9E14DCC606464F6554F0BF4C6A`

This SHA-1 is already in your `google-services.json`, which is good! But you need to verify it's also registered in Firebase Console.

---

## 🎯 Pre-Build Action Required

### Step 1: Verify SHA-1 in Firebase Console

1. Go to Firebase Console: https://console.firebase.google.com/
2. Select project: **imposter-game-e5f12**
3. Click gear icon ⚙️ → **Project settings**
4. Scroll to **Your apps** → Find Android app `com.rayn100.impostor`
5. Scroll to **SHA certificate fingerprints** section

### Step 2: Check if This SHA-1 Exists

Look for: `1FB5E79D76FFBF9E14DCC606464F6554F0BF4C6A`

**If it EXISTS** ✅:
- You're good to go! Skip to "Build Command" section below.

**If it DOESN'T exist** ❌:
- Click **"Add fingerprint"**
- Paste: `1FB5E79D76FFBF9E14DCC606464F6554F0BF4C6A`
- Click **"Save"**
- Download the updated `google-services.json`
- Replace your current `google-services.json` with the new one
- Commit and push the changes

---

## 📱 Why This Matters

Google Sign-In verifies your app's identity using SHA-1 fingerprints. When you build with EAS:

1. **Local dev builds** use your debug keystore (different SHA-1)
2. **EAS builds** use your EAS keystore: `@rayn100__imposter-game.jks`
3. **Play Store builds** use Google's signing key (different SHA-1)

Each needs its own SHA-1 registered in Firebase!

---

## 🚀 Build Command (After Verification)

Once you've verified the SHA-1 is in Firebase:

```bash
# For internal testing (APK)
eas build --platform android --profile preview

# For Play Store (AAB)
eas build --platform android --profile production
```

---

## 🧪 Testing Google Sign-In

After installing the EAS build on your device:

### Expected Behavior ✅:
1. Tap "Sign in with Google"
2. Google account picker appears
3. Select account
4. Sign-in succeeds
5. Profile screen shows your Google name/email

### If It Fails ❌:

**Error: "Developer Error" or "Error 10"**
- **Cause**: SHA-1 not registered in Firebase
- **Fix**: Add `1FB5E79D76FFBF9E14DCC606464F6554F0BF4C6A` to Firebase Console

**Error: "Sign in cancelled"**
- **Cause**: User cancelled (normal behavior)
- **Fix**: None needed

**Error: "Play Services not available"**
- **Cause**: Device doesn't have Google Play Services
- **Fix**: Test on a different device with Play Services

---

## 📋 Quick Checklist

Before running `eas build`:

- [ ] Verified SHA-1 `1FB5E79D76FFBF9E14DCC606464F6554F0BF4C6A` exists in Firebase Console
- [ ] If missing, added it and downloaded new `google-services.json`
- [ ] Committed and pushed any changes
- [ ] Ready to build!

---

## 🔑 Your Key Information

**Package Name**: `com.rayn100.impostor`
**EAS Keystore SHA-1**: `1FB5E79D76FFBF9E14DCC606464F6554F0BF4C6A`
**Web Client ID**: `831244408092-g256j85sdka2e5ql548r28ignggbjm7u.apps.googleusercontent.com`
**iOS Client ID**: `831244408092-oifo3c54on55brivq9kupic53ntbgrd2.apps.googleusercontent.com`

---

## 💡 Pro Tip

After your first successful EAS build with Google Sign-In working:
- Keep a backup of your `google-services.json`
- Don't regenerate your EAS keystore (it will change the SHA-1)
- If you upload to Play Store, add the Play Store SHA-1 too (Google provides it)

---

## ❓ Need Help?

If Google Sign-In still fails after following this checklist:
1. Check Firebase Console logs for authentication errors
2. Verify the package name matches exactly: `com.rayn100.impostor`
3. Wait 5-10 minutes after adding SHA-1 (Google's cache)
4. Clear app data and try again

---

**TL;DR**: Check if SHA-1 `1FB5E79D76FFBF9E14DCC606464F6554F0BF4C6A` is in Firebase Console. If not, add it. Then build with EAS.
