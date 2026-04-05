# Android Production Readiness Checklist

## Payment System Status: ⚠️ MOSTLY READY (2 Issues to Fix)

---

## ✅ READY - Payment System

### RevenueCat Configuration
- ✅ Production API keys configured
  - Android: `goog_WeLuvQfgjZEppbpIoqiqCzciCqq`
  - iOS: `appl_GidmNgibMGrbuhmiJwrzLeJLEZM`
- ✅ Premium entitlement ID: `premium`
- ✅ Server-side verification enabled
- ✅ User linking to Firebase working
- ✅ Error handling robust
- ✅ Offline caching implemented
- ✅ Background refresh (60s interval)

### Premium Features
- ✅ Premium categories locked for free users
- ✅ Premium avatar accessories locked
- ✅ Voice chat premium-only for hosts
- ✅ Ad removal for premium users
- ✅ Premium status synced to Firebase

### Code Quality
- ✅ No logic gaps found
- ✅ Error handling comprehensive
- ✅ Performance optimized (cached checks)
- ✅ Navigation helper prevents bugs

---

## ⚠️ ISSUES TO FIX BEFORE PRODUCTION

### 1. Google Mobile Ads - TEST IDs ❌

**Location:** `app.json` lines 57-58

**Current (TEST IDs):**
```json
"androidAppId": "ca-app-pub-3940256099942544~3347511713",
"iosAppId": "ca-app-pub-3940256099942544~1458002511"
```

**Problem:** These are Google's TEST ad IDs. You won't earn revenue!

**Fix Required:**
Replace with your REAL AdMob App IDs from Google AdMob console:
```json
"androidAppId": "ca-app-pub-YOUR_PUBLISHER_ID~YOUR_ANDROID_APP_ID",
"iosAppId": "ca-app-pub-YOUR_PUBLISHER_ID~YOUR_IOS_APP_ID"
```

**How to get real IDs:**
1. Go to https://apps.admob.google.com
2. Select your app
3. Copy the App ID (format: ca-app-pub-XXXXXXXXXXXXXXXX~XXXXXXXXXX)

---

### 2. AdManager - Placeholder Ad Unit IDs ❌

**Location:** `src/utils/AdManager.js` lines 70-71

**Current (Placeholders):**
```javascript
ios: 'ca-app-pub-xxxxxxxxxxxxxxxx/xxxxxxxxxx',
android: 'ca-app-pub-xxxxxxxxxxxxxxxx/xxxxxxxxxx',
```

**Problem:** These are placeholder IDs. Ads won't load!

**Fix Required:**
Replace with your REAL AdMob Interstitial Ad Unit IDs:
```javascript
ios: 'ca-app-pub-YOUR_PUBLISHER_ID/YOUR_IOS_INTERSTITIAL_ID',
android: 'ca-app-pub-YOUR_PUBLISHER_ID/YOUR_ANDROID_INTERSTITIAL_ID',
```

**How to get real IDs:**
1. Go to https://apps.admob.google.com
2. Select your app
3. Go to "Ad units"
4. Create/select Interstitial ad unit
5. Copy the Ad Unit ID (format: ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX)

---

## ✅ SAFE FOR PRODUCTION (No Changes Needed)

### Premium Test Users
**Location:** `src/utils/PremiumManager.js` line 6

```javascript
const PREMIUM_TEST_USERS = [
    // Add test emails here for testing
    // Example: 'test@example.com',
];
```

**Status:** ✅ Empty array - safe for production
**Note:** This is for development only. Empty = no test users = production ready

---

## Version Info

- ✅ Version: 1.0.0
- ✅ Version Code: 12 (bumped from 11)
- ✅ Package: com.rayn100.impostor

---

## Build Command

Once ad IDs are fixed, build with:
```bash
eas build --platform android --profile production
```

---

## Summary

### Must Fix Before Production:
1. ❌ Replace Google Mobile Ads TEST App IDs with real ones (app.json)
2. ❌ Replace AdManager placeholder Ad Unit IDs with real ones (AdManager.js)

### Already Production Ready:
- ✅ RevenueCat payment system
- ✅ Premium features
- ✅ User authentication
- ✅ Firebase integration
- ✅ Error handling
- ✅ Performance optimization

---

## Post-Fix Checklist

After fixing ad IDs:

1. ✅ Build AAB: `eas build --platform android --profile production`
2. ✅ Test on internal testing track
3. ✅ Verify ads load (for free users)
4. ✅ Verify premium purchase works
5. ✅ Verify premium users don't see ads
6. ✅ Submit to Play Store

---

## Revenue Streams Status

1. **In-App Purchases (RevenueCat):** ✅ READY
2. **Ads (AdMob):** ❌ NEEDS REAL IDs
3. **Premium Features:** ✅ READY

**Estimated Time to Fix:** 5-10 minutes (just copy-paste real ad IDs)
