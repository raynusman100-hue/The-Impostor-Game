# RevenueCat Sandbox vs Production Diagnostic Guide

## Current Situation

Your app uses RevenueCat API keys that automatically determine the environment:
- **iOS Key**: `appl_GidmNgibMGrbuhmiJwrzLeJLEZM`
- **Android Key**: `goog_WeLuvQfgjZEppbpIoqiqCzciCqq`

## How to Check Which Environment You're Using

### Method 1: Check Your RevenueCat Dashboard (EASIEST)

1. **Go to RevenueCat Dashboard**: https://app.revenuecat.com
2. **Look at the top-right corner** of the dashboard
3. **You'll see a toggle** that says either:
   - "Sandbox" (with a toggle switch)
   - "Production" (with a toggle switch)
4. **The current view** is what you're looking at
5. **Toggle it** to switch between Sandbox and Production views

### Method 2: Check Your API Keys in RevenueCat

1. Go to **RevenueCat Dashboard** → **Project Settings** → **API Keys**
2. Look for your keys:
   - Keys starting with `appl_` are iOS keys
   - Keys starting with `goog_` are Android keys
3. **Each key shows its environment**:
   - Look for a label like "Public app-specific key" or similar
   - It will indicate if it's for Sandbox or Production

### Method 3: Check in Your App Build (MOST RELIABLE)

The environment is determined by **how your app is built and signed**:

#### For iOS:
- **Sandbox**: Development builds, TestFlight builds, Xcode debug builds
- **Production**: App Store builds only

#### For Android:
- **Sandbox**: Debug builds (signed with debug keystore)
- **Production**: Release builds (signed with upload/release keystore)

**Your current build type**:
```bash
# Check your current build in EAS
eas build:list --platform=android --limit=1

# Or check locally if you have the APK/AAB
# Debug builds = Sandbox
# Release builds = Production
```

## Quick Diagnostic: Add Logging to Your App

Add this code to see which environment RevenueCat is using:

```javascript
// In PurchaseManager.js, add to the initialize() method:

async initialize() {
    try {
        if (Platform.OS === 'ios') {
            await Purchases.configure({ apiKey: API_KEYS.apple });
        } else if (Platform.OS === 'android') {
            await Purchases.configure({ apiKey: API_KEYS.google });
        }

        // 🔍 ADD THIS DIAGNOSTIC CODE:
        const appUserID = await Purchases.getAppUserID();
        const customerInfo = await Purchases.getCustomerInfo();
        
        console.log('🔍 [ENVIRONMENT CHECK]');
        console.log('App User ID:', appUserID);
        console.log('Original App User ID:', customerInfo.originalAppUserId);
        console.log('Request Date:', customerInfo.requestDate);
        
        // Check if we're in sandbox by looking at the receipt
        if (Platform.OS === 'ios') {
            console.log('iOS Environment: Check receipt in logs');
        } else {
            console.log('Android Environment: Check build type');
        }

        this.isConfigured = true;
        await this.checkProStatus();
        
        // ... rest of code
    } catch (error) {
        console.log('PurchaseManager Init Error:', error);
        this.isConfigured = false;
    }
}
```

## Most Likely Issue: Dashboard View Mismatch

Based on your screenshot showing "Sandbox data" toggle:

1. **You granted the entitlement in Sandbox view**
2. **But your app might be a Production build**
3. **Solution**: Toggle the dashboard view to Production and check if the entitlement exists there

### How to Fix:

1. **Go to RevenueCat Dashboard**
2. **Toggle from "Sandbox" to "Production"** (top-right)
3. **Search for your user** (by Firebase UID or email)
4. **Check if the entitlement exists in Production**

If it doesn't exist in Production:
- You need to grant it in Production view
- OR rebuild your app as a debug/sandbox build

## Recommended Solution

Since you're testing, the easiest approach is:

### Option A: Use Sandbox Build (Recommended for Testing)
1. Build a **debug/development build**:
   ```bash
   # For Android
   eas build --profile development --platform android
   
   # For iOS
   eas build --profile development --platform ios
   ```
2. Install this build on your device
3. The entitlements you granted in Sandbox will work

### Option B: Grant Entitlement in Production
1. Toggle dashboard to **Production** view
2. Find your user
3. Grant the "premium" entitlement again
4. Your production build will see it

## Verification Steps

After choosing an option above:

1. **Force sync** in your app:
   ```javascript
   // Add a button in your app to test
   await PurchaseManager.forceSyncPurchases();
   ```

2. **Check the logs** for:
   ```
   📊 [RC DEBUG] Active Entitlements: premium
   ✅ Premium active
   ```

3. **Verify in dashboard** that you're viewing the correct environment

## Key Takeaway

**The #1 rule**: Your app's build type (debug/release) must match the dashboard view (Sandbox/Production) where you granted the entitlement.

- Debug build → Check Sandbox view
- Release build → Check Production view

---

## YOUR CURRENT SITUATION (Based on Screenshot)

**Dashboard Status**: Toggle is OFF = Viewing **Production** data

**What this means**:
- You're currently looking at Production environment
- The entitlement is NOT in Production (that's why you don't see it)
- You need to either:
  1. **Turn the toggle ON** to view Sandbox data (where your entitlement likely is)
  2. **OR** Grant the entitlement in Production

**Your Build Profiles** (from eas.json):
- `development` profile → **Sandbox** (development client)
- `preview` profile → **Sandbox** (internal distribution, APK)
- `production` profile → **Production** (release build, AAB)
- `production-aab` profile → **Production** (release build)

**Action Required**:
1. **Click the toggle to turn it ON** (switch to Sandbox view)
2. Search for your user in Sandbox
3. Verify the entitlement exists there
4. Make sure you're testing with a `development` or `preview` build (NOT production)

**Quick Test**:
```bash
# Build a Sandbox-compatible version
eas build --profile preview --platform android

# This will create an APK that uses Sandbox environment
# Install it and test - your entitlement should work
```
