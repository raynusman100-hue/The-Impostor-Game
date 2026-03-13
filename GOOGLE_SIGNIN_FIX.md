# Fix Google Sign-In Authorization Error

## 🔴 Current Error
```
Access blocked: Authorization Error
Parameter not allowed for this message type: code_challenge_method
Error 400: invalid_request
```

---

## 🎯 Root Cause

The error occurs because your Google Cloud Console OAuth configuration doesn't match your app's setup. The `code_challenge_method` error indicates that PKCE (Proof Key for Code Exchange) is being used, but your OAuth client isn't configured for it.

---

## ✅ Solution: Update Google Cloud Console

### Step 1: Go to Google Cloud Console

1. Visit: https://console.cloud.google.com/
2. Select your project: **project-831244408092**
3. Go to **APIs & Services** → **Credentials**

### Step 2: Find Your OAuth 2.0 Client ID

Look for the client ID that matches:
```
831244408092-mn4bhuvq6v4il0nippaiaf7q729o97bu.apps.googleusercontent.com
```

This is your **Web Client ID** (used in ProfileScreen.js)

### Step 3: Edit the OAuth Client

Click on the client ID to edit it, then:

#### A. Application Type
- Should be: **Web application**

#### B. Authorized JavaScript Origins
Add these URLs:
```
http://localhost
http://localhost:19006
https://auth.expo.io
```

#### C. Authorized Redirect URIs
Add these URLs:
```
http://localhost
http://localhost:19006
https://auth.expo.io/@your-expo-username/imposter-game
```

Replace `your-expo-username` with your actual Expo username.

#### D. Save Changes
Click **Save**

---

## 🔧 Alternative Fix: Create New OAuth Client

If editing doesn't work, create a new OAuth 2.0 Client ID:

### Step 1: Create Web Client

1. Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
2. Application type: **Web application**
3. Name: `Imposter Game Web Client`
4. Authorized JavaScript origins:
   ```
   http://localhost
   http://localhost:19006
   https://auth.expo.io
   ```
5. Authorized redirect URIs:
   ```
   http://localhost
   http://localhost:19006
   https://auth.expo.io/@your-expo-username/imposter-game
   ```
6. Click **Create**
7. Copy the new **Client ID**

### Step 2: Update Your Code

Update `src/screens/ProfileScreen.js`:

```javascript
GoogleSignin.configure({
    webClientId: 'YOUR_NEW_CLIENT_ID_HERE.apps.googleusercontent.com',
    iosClientId: '831244408092-oifo3c54on55brivq9kupic53ntbgrd2.apps.googleusercontent.com',
    offlineAccess: true,
});
```

---

## 📱 iOS Configuration (Already Done)

Your iOS client ID is already configured:
```
831244408092-oifo3c54on55brivq9kupic53ntbgrd2.apps.googleusercontent.com
```

This is in your `app.json` under `ios.infoPlist.CFBundleURLSchemes`.

---

## 🤖 Android Configuration

### Check google-services.json

Your `google-services.json` should have the correct OAuth client IDs. If not:

1. Go to Firebase Console: https://console.firebase.google.com/
2. Select your project
3. Go to **Project Settings** → **General**
4. Scroll to **Your apps** → Android app
5. Download the latest `google-services.json`
6. Replace the file in your project root

---

## 🔑 SHA-1 Fingerprint (For Android)

If you're testing on Android, you need to add SHA-1 fingerprints:

### Debug SHA-1 (For Development)

Get your debug SHA-1:
```bash
# On Windows
cd android
./gradlew signingReport

# Look for "SHA1" under "Variant: debug"
```

### Add to Firebase

1. Go to Firebase Console → Project Settings
2. Select your Android app
3. Click **Add fingerprint**
4. Paste the SHA-1 from above
5. Download new `google-services.json`

---

## 🧪 Testing the Fix

### Test on iOS:
1. Rebuild the app: `npx expo run:ios`
2. Try Google Sign-In
3. Should work without authorization error

### Test on Android:
1. Rebuild the app: `npx expo run:android`
2. Try Google Sign-In
3. Should work without authorization error

---

## 🚨 Common Issues

### Issue 1: "Developer Error" or "Error 10"
**Solution**: SHA-1 fingerprint not added to Firebase
- Add debug SHA-1 for development
- Add release SHA-1 for production builds

### Issue 2: "Sign in cancelled"
**Solution**: User cancelled the sign-in flow
- This is normal user behavior, not an error

### Issue 3: "Play Services not available"
**Solution**: Only on Android emulator without Google Play
- Use a real device or emulator with Google Play Services

---

## 📋 Checklist

- [ ] Go to Google Cloud Console
- [ ] Find OAuth 2.0 Client ID: `831244408092-mn4bhuvq6v4il0nippaiaf7q729o97bu`
- [ ] Add authorized JavaScript origins
- [ ] Add authorized redirect URIs
- [ ] Save changes
- [ ] (Android only) Add SHA-1 fingerprint to Firebase
- [ ] (Android only) Download new google-services.json
- [ ] Rebuild app
- [ ] Test Google Sign-In

---

## 🎯 Quick Fix Summary

**The main issue**: Your OAuth client in Google Cloud Console needs these redirect URIs:
```
http://localhost
https://auth.expo.io/@your-expo-username/imposter-game
```

Add them, save, and the error should be fixed!

---

## 📞 Need Help?

If the error persists:
1. Check that you're editing the correct OAuth client (the one matching your webClientId)
2. Wait 5-10 minutes after saving changes (Google's cache)
3. Clear app data and try again
4. Make sure you're using the correct Expo username in redirect URI

---

**Current Configuration:**
- Web Client ID: `831244408092-mn4bhuvq6v4il0nippaiaf7q729o97bu.apps.googleusercontent.com`
- iOS Client ID: `831244408092-oifo3c54on55brivq9kupic53ntbgrd2.apps.googleusercontent.com`
- Bundle ID: `com.rayn100.impostergame`
- Package Name: `com.rayn100.impostergame`
