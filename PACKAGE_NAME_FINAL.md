# Package Name - Final Decision

## ✅ FINAL PACKAGE NAME (Both Platforms)

```
com.rayn100.impostergame
```

**Reason:** iOS is already published with this package name, so Android must match.

---

## 📱 Platform Details

### iOS (Already Published)
- **Bundle ID**: `com.rayn100.impostergame`
- **Status**: ✅ Live on App Store
- **RevenueCat**: Already configured with `app06ec5f375b`

### Android (New)
- **Package Name**: `com.rayn100.impostergame`
- **Status**: 🆕 Creating now
- **RevenueCat**: Need to add Android app with this package name

---

## 🔧 What Was Changed

### Updated Files:
1. ✅ `app.json` - Android package changed to `com.rayn100.impostergame`
2. ⚠️ `android/app/build.gradle` - Will update on next build (folder is gitignored)

### Previous (WRONG):
```
Android: com.raynusman100hue.impostergame  ❌
iOS:     com.rayn100.impostergame          ✅
```

### Now (CORRECT):
```
Android: com.rayn100.impostergame  ✅
iOS:     com.rayn100.impostergame  ✅
```

---

## 📝 Google Play Console - Create App Form

Use these values:

| Field | Value |
|-------|-------|
| **App name** | `Imposter Game` (or your preferred name) |
| **Default language** | `English (United Kingdom) – en-GB` |
| **App or game** | ☑️ **Game** |
| **Free or paid** | ☑️ **Free** |
| **Developer Programme Policies** | ☑️ **Checked** |
| **US export laws** | ☑️ **Checked** |

---

## 🔑 RevenueCat Setup

### iOS (Already Done)
- ✅ App ID: `appe839010e85`
- ✅ API Key: `app06ec5f375b`

### Android (To Do)
1. Go to https://app.revenuecat.com/
2. Add Android app
3. **Package name**: `com.rayn100.impostergame` ⚠️ (NO "hue"!)
4. Get Android API key (starts with `goog_`)
5. Update `src/utils/PurchaseManager.js`

---

## ⚠️ CRITICAL: Before Building

When you build the Android app, the package name will be:
```
com.rayn100.impostergame
```

**NOT** `com.raynusman100hue.impostorgame`

This ensures iOS and Android have matching package names.

---

## 🚀 Next Steps

1. ✅ Package name fixed in `app.json`
2. 🔄 Create Google Play app with: `com.rayn100.impostergame`
3. 🔄 Add RevenueCat Android app with: `com.rayn100.impostergame`
4. 🔄 Build AAB with EAS
5. 🔄 Upload to Google Play

---

**Everything is now consistent!** ✅
