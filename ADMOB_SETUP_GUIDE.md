# AdMob Production Setup Guide

## Step 1: Get Your AdMob IDs

### A. Go to AdMob Console
1. Visit: https://apps.admob.google.com
2. Sign in with your Google account
3. Select your app "Impostor Game: Film Edition" (or create it if not exists)

### B. Get App ID
1. In the left sidebar, click "App settings"
2. Copy the "App ID" - looks like: `ca-app-pub-1234567890123456~1234567890`
3. You need BOTH Android and iOS App IDs (if you have iOS app)

### C. Create/Get Interstitial Ad Unit
1. In the left sidebar, click "Ad units"
2. If you don't have an Interstitial ad unit:
   - Click "+ ADD AD UNIT"
   - Select "Interstitial"
   - Name it: "Interstitial Ad"
   - Click "CREATE AD UNIT"
3. Copy the "Ad unit ID" - looks like: `ca-app-pub-1234567890123456/1234567890`

---

## Step 2: Update app.json

**Current (TEST IDs):**
```json
"react-native-google-mobile-ads",
{
  "androidAppId": "ca-app-pub-3940256099942544~3347511713",
  "iosAppId": "ca-app-pub-3940256099942544~1458002511"
}
```

**Replace with YOUR real IDs:**
```json
"react-native-google-mobile-ads",
{
  "androidAppId": "ca-app-pub-YOUR_ANDROID_APP_ID",
  "iosAppId": "ca-app-pub-YOUR_IOS_APP_ID"
}
```

---

## Step 3: Update AdManager.js

**Current (Placeholder):**
```javascript
ios: 'ca-app-pub-xxxxxxxxxxxxxxxx/xxxxxxxxxx',
android: 'ca-app-pub-xxxxxxxxxxxxxxxx/xxxxxxxxxx',
```

**Replace with YOUR real Ad Unit IDs:**
```javascript
ios: 'ca-app-pub-YOUR_IOS_INTERSTITIAL_AD_UNIT_ID',
android: 'ca-app-pub-YOUR_ANDROID_INTERSTITIAL_AD_UNIT_ID',
```

---

## Quick Reference

### What You Need:
1. ✅ Android App ID (for app.json)
2. ✅ iOS App ID (for app.json) - if you have iOS
3. ✅ Android Interstitial Ad Unit ID (for AdManager.js)
4. ✅ iOS Interstitial Ad Unit ID (for AdManager.js) - if you have iOS

### ID Format Examples:
- App ID: `ca-app-pub-1234567890123456~1234567890` (has ~)
- Ad Unit ID: `ca-app-pub-1234567890123456/1234567890` (has /)

---

## After You Get Your IDs

Tell me your IDs and I'll update the files for you, or you can:

1. Update `app.json` lines 57-58
2. Update `src/utils/AdManager.js` lines 70-71
3. Build: `eas build --platform android --profile production`

---

## Important Notes

⚠️ **Don't share your real AdMob IDs publicly** - but it's safe to share with me for updating your code

✅ **Test IDs are fine for development** - but won't earn revenue in production

✅ **AdMob takes 24-48 hours** to start serving ads after first setup

---

## If You Don't Have AdMob Set Up Yet

1. Go to https://apps.admob.google.com
2. Click "Get Started"
3. Add your app:
   - Platform: Android
   - App name: Impostor Game: Film Edition
   - Package name: com.rayn100.impostor
4. Create Interstitial ad unit
5. Copy the IDs and share them with me
