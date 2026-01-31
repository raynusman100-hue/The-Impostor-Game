---
description: How to run iOS development builds (equivalent to run:android)
---

# iOS Development Build Workflow

Since you're on Windows and cannot run `npx expo run:ios` locally, this workflow shows you how to achieve the same **instant reload** experience using EAS development builds.

## What You're Getting

- ✅ iOS app that works like `npx expo run:android`
- ✅ Instant JavaScript reload via Metro bundler
- ✅ All native modules work (Google Sign-In, Agora Voice Chat)
- ✅ Install once, develop for weeks

## One-Time Setup

### 1. Install EAS CLI
```bash
npm install -g eas-cli
```

### 2. Login to Expo
```bash
eas login
```
Use your Expo account credentials (or create one at expo.dev)

### 3. Build iOS Development App (First Time)
```bash
eas build --profile development --platform ios
```

**What happens:**
- Builds on Expo's Mac servers (~15-20 minutes)
- Creates a development IPA file
- Gives you a download link or TestFlight install option

### 4. Install on iPhone
Choose ONE method:

**Method A: Direct Install**
- Open the link from EAS on your iPhone
- Tap "Install"
- Trust the developer certificate in Settings

**Method B: TestFlight**
- EAS can submit to TestFlight automatically
- Install from TestFlight app

## Daily Development Workflow

### 1. Start Metro Bundler
```bash
npx expo start --dev-client
```

### 2. Connect iPhone
- Make sure iPhone and PC are on same WiFi
- Open the development app on iPhone
- Scan the QR code OR enter the URL shown in terminal

### 3. Develop!
- Make changes to your code
- Press `r` to reload in terminal
- Changes appear instantly on iPhone
- **Exactly like `npx expo run:android`**

## Rebuilding (Only Needed When...)

You only need to rebuild when you:
- Add new native modules (npm packages with native code)
- Change `app.json` or native configuration
- Update Expo SDK version

To rebuild:
```bash
eas build --profile development --platform ios
```

## Comparison: Android vs iOS

| Action | Android (What you do now) | iOS (EAS Development) |
|--------|--------------------------|------------------------|
| **First time setup** | `npx expo run:android` | `eas build --profile development --platform ios` |
| **Daily development** | `npx expo run:android` | `npx expo start --dev-client` → Open app → Scan QR |
| **Rebuild needed?** | When native code changes | When native code changes |
| **Where it builds** | Your PC (Android Studio) | Expo's Mac servers (cloud) |
| **Reload speed** | Instant | Instant |

## Cost

- **Free tier:** 30 builds/month
- **Pro tier ($29/mo):** Unlimited builds

For development builds, you'll likely only need 1-2 builds per month (only rebuild when adding native modules).

## Alternative: Local iOS Simulator (Future)

If you get a Mac later, you can run:
```bash
npx expo run:ios
```

This will work exactly like `run:android` does now.
