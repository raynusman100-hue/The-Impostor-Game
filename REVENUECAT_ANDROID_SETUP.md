# RevenueCat Android App Setup

## 🔐 Security Note - API Keys Are Safe in Code!

**Q: Should RevenueCat API keys be hidden from the code?**  
**A: NO! The PUBLIC SDK keys are SAFE to include in your app code.**

Here's why:
- ✅ The keys in `PurchaseManager.js` are **PUBLIC SDK keys**
- ✅ They're designed to be in client-side code
- ✅ They only allow **reading** purchase status
- ✅ RevenueCat validates all purchases with Apple/Google servers (secure)
- ✅ Users cannot create fake purchases with these keys

**What you DON'T put in code:**
- ❌ RevenueCat **Secret API keys** (V1/V2 keys - server-side only)
- ❌ Google Play **Service Account JSON**
- ❌ Apple **App Store Connect API keys**

**Your current setup is correct and secure!** ✅

---

## Current Status

✅ **iOS App**: Already configured - `app06ec5f375b`  
❌ **Android App**: Need to add

---

## Quick Steps to Add Android App

### Step 1: Add Android App in RevenueCat

1. Go to your RevenueCat dashboard: https://app.revenuecat.com/
2. Click **"+ Add app config"** button (top right)
3. Select **Android**
4. Fill in:
   - **App name**: Impostor Game Android
   - **Package name**: `com.rayn100.impostergame` ⚠️ **NO "hue"!**
   - **Play Store Service Credentials**: Upload JSON (see below)

### Step 2: Get Google Play Service Credentials

#### Option A: Quick Method (If you have Google Play Console access)

1. Go to Google Play Console
2. Select your app (or create it if not exists)
3. Go to **Setup** → **API access**
4. Click **Link** next to "Google Play Android Developer API"
5. Click **Create new service account**
6. You'll be redirected to Google Cloud Console
7. Create service account:
   - **Name**: `revenuecat-android`
   - **Role**: Select "Service Account User"
8. Click **Done**
9. Click on the service account you just created
10. Go to **Keys** tab
11. Click **Add Key** → **Create new key**
12. Select **JSON**
13. Download the JSON file
14. Upload this JSON to RevenueCat

#### Option B: If You Don't Have Play Console Access Yet

You can still set up RevenueCat! Just:
1. Skip the service credentials for now
2. Get your Android API key
3. Add credentials later when you have Play Console access

### Step 3: Get Your Android API Key

After creating the Android app in RevenueCat:

1. Go to **Project Settings** (gear icon)
2. Click **API Keys**
3. Find your **Public Android SDK Key**
4. It will look like: `goog_xxxxxxxxxxxxxxxxxxxxxxxx`
5. Copy this key

### Step 4: Update Your Code

The iOS key is already updated! Once you have the Android key, update:

```javascript
const API_KEYS = {
    apple: 'app06ec5f375b',  // ✅ Already set
    google: 'goog_YOUR_ANDROID_KEY_HERE',  // Add this
};
```

---

## Testing Without Play Console Credentials

You can test RevenueCat on Android **without** Play Console credentials:

1. Create Android app in RevenueCat (skip credentials)
2. Get Android API key
3. Update your code
4. Build your app
5. Test with RevenueCat sandbox mode

**Note**: You'll need credentials later for production, but you can develop and test without them!

---

## What You Need from Your Keystore

When you do add Play Console credentials, RevenueCat will also ask for your app's **SHA-1 certificate fingerprint**.

Get it from your keystore:

```bash
keytool -list -v -keystore impostor-game-release.keystore -alias impostor-game
```

Look for:
```
SHA1: XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX
```

Add this to RevenueCat → Android App Settings → SHA-1 Certificate Fingerprints

---

## Summary

✅ **iOS**: Working - `app06ec5f375b`  
🔄 **Android**: Need to create app in RevenueCat  
⏱️ **Time**: 5-10 minutes  
🎯 **Next**: Add Android app, get key, update code

Your iOS setup is perfect! Just need to add Android now.

