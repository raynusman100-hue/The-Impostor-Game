# Internal Testing Release - Quick Start Guide

## 🎯 Goal
Get your app into Google Play Internal Testing so you can test with real users.

---

## ✅ What's Already Done

1. ✅ **Package names fixed** - All match: `com.raynusman100hue.impostorgame`
2. ✅ **Google Play Console** - App created
3. ✅ **RevenueCat ID** - `appe839010e85`
4. ✅ **iOS RevenueCat** - Working with key: `app06ec5f375b`
5. ✅ **Build configurations** - `eas.json` and `codemagic.yaml` ready

---

## 🔧 What You Need to Do

### Step 1: Get RevenueCat Android Key (5 minutes)

1. Go to https://app.revenuecat.com/
2. Click **"+ Add app config"**
3. Select **Android**
4. Enter package name: `com.raynusman100hue.impostorgame`
5. Copy the Android API key (starts with `goog_`)
6. Update `src/utils/PurchaseManager.js`:
   ```javascript
   g