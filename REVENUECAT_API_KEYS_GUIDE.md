# RevenueCat API Keys Setup Guide

## Your Questions Answered

### Q1: Does iOS API key work right now?
**Answer**: The iOS key in your code is a **placeholder** (`appl_placeholder_key`). You need to replace it with your actual RevenueCat iOS API key.

### Q2: Can I get Android API key now or need submission first?
**Answer**: You can get it **NOW** - no submission required! Here's how:

---

## Getting RevenueCat API Keys (No Submission Needed)

### Step 1: Create RevenueCat Account
1. Go to https://www.revenuecat.com/
2. Sign up for free account
3. Create a new project: "Impostor Game"

### Step 2: Add iOS App

1. In RevenueCat dashboard, click **Apps**
2. Click **+ New App**
3. Select **iOS**
4. Fill in:
   - **App name**: Impostor Game
   - **Bundle ID**: `com.raynusman100hue.impostorgame` (check your `app.json`)
   - **App Store Connect Shared Secret**: (get from App Store Connect)

5. **Get iOS API Key**:
   - After creating the app, go to **Project Settings** → **API Keys**
   - Copy the **Public iOS SDK Key**
   - This is your iOS API key!

### Step 3: Add Android App

1. Click **+ New App** again
2. Select **Android**
3. Fill in:
   - **App name**: Impostor Game Android
   - **Package name**: `com.raynusman100hue.impostorgame` (check your `app.json`)
   - **Google Play Service Credentials**: (upload JSON - see below)

4. **Get Android API Key**:
   - After creating the app, go to **Project Settings** → **API Keys**
   - Copy the **Public Android SDK Key**
   - This is your Android API key!

---

## Getting Google Play Service Credentials (For Android)

### Option 1: From Google Play Console (Recommended)

1. Go to Google Play Console: https://play.google.com/console
2. Select your app
3. Go to **Setup** → **API access**
4. Click **Create new service account**
5. Follow the link to Google Cloud Console
6. Create service account:
   - Name: `revenuecat-service-account`
   - Role: **Pub/Sub Admin** (or use predefined role)
7. Create JSON key
8. Download the JSON file
9. Upload this JSON to RevenueCat

### Option 2: Quick Setup (No App Submission Required)

You can set up RevenueCat **before** submitting to Google Play:

1. Create the app in Google Play Console (draft state is fine)
2. Enable API access
3. Create service account
4. Get JSON credentials
5. Upload to RevenueCat

**You do NOT need to submit the app to get API keys!**

---

## Updating Your Code

Once you have both API keys, update `src/utils/PurchaseManager.js`:

```javascript
const API_KEYS = {
    apple: 'appl_xxxxxxxxxxxxxxxxxxxxxxxx',  // Your actual iOS key
    google: 'goog_xxxxxxxxxxxxxxxxxxxxxxxx', // Your actual Android key
};
```

---

## Getting SHA-1 Certificate (For Android)

RevenueCat needs your app's SHA-1 certificate fingerprint for Android:

### From Your Keystore:

```bash
keytool -list -v -keystore impostor-game-release.keystore -alias impostor-game
```

Look for:
```
Certificate fingerprints:
     SHA1: XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX:XX
```

Copy this SHA-1 and add it to:
1. **Google Play Console** → **Setup** → **App signing**
2. **RevenueCat** → **Android App Settings** → **SHA-1 Certificate Fingerprints**

---

## Creating Products in RevenueCat

### Step 1: Create Entitlement

1. In RevenueCat, go to **Entitlements**
2. Click **+ New Entitlement**
3. Create entitlement:
   - **Identifier**: `pro_version`
   - **Display name**: Pro Version
   - **Description**: Remove ads and unlock premium features

### Step 2: Create Products

#### iOS Product (App Store Connect):
1. Go to App Store Connect
2. Select your app → **In-App Purchases**
3. Create new product:
   - **Type**: Non-Consumable
   - **Product ID**: `com.raynusman100hue.impostorgame.removeads`
   - **Price**: $2.99 (or your choice)
   - **Display name**: Remove Ads
4. Submit for review (can be done before app submission)

#### Android Product (Google Play Console):
1. Go to Google Play Console
2. Select your app → **Monetize** → **In-app products**
3. Create new product:
   - **Product ID**: `remove_ads`
   - **Type**: One-time purchase
   - **Price**: $2.99
   - **Title**: Remove Ads
4. Activate the product

### Step 3: Link Products in RevenueCat

1. Go to RevenueCat → **Products**
2. Click **+ New Product**
3. Link to App Store product: `com.raynusman100hue.impostorgame.removeads`
4. Link to Google Play product: `remove_ads`
5. Attach to entitlement: `pro_version`

### Step 4: Create Offering

1. Go to **Offerings**
2. Create **Current** offering
3. Add your product to the offering
4. This is what your app will fetch with `Purchases.getOfferings()`

---

## Testing RevenueCat (Before Submission)

### iOS Testing:
1. Add test user in App Store Connect → **Users and Access** → **Sandbox Testers**
2. Sign out of App Store on device
3. Run your app
4. When prompted, sign in with sandbox tester account
5. Test purchase flow

### Android Testing:
1. Add test user in Google Play Console → **Setup** → **License testing**
2. Add email to **License testers** list
3. Install app on device
4. Test purchase flow (will show "Test purchase" dialog)

---

## Summary

✅ **You can get API keys NOW** - no submission required  
✅ **iOS key**: Get from RevenueCat after adding iOS app  
✅ **Android key**: Get from RevenueCat after adding Android app  
✅ **Google Play credentials**: Need to create service account (app can be in draft)  
✅ **Testing**: Can test purchases before app submission using sandbox/test accounts

---

## Current Status of Your Code

Your `PurchaseManager.js` has:
```javascript
const API_KEYS = {
    apple: 'appl_placeholder_key',   // ❌ Replace with real key
    google: 'goog_placeholder_key',  // ❌ Replace with real key
};
```

**Action Required**: Replace both keys with actual RevenueCat API keys from your dashboard.

