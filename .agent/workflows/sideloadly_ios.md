---
description: Build iOS IPA and install via Sideloadly
---

# iOS IPA Build + Sideloadly Installation

This workflow shows you how to build an iOS IPA using EAS (cloud) and install it on your iPhone using Sideloadly.

## Prerequisites

✅ Sideloadly installed on Windows
✅ iPhone connected to PC via USB
✅ Apple ID (free account works)

## Build Type Comparison

### Development Build (Recommended)
- ✅ Connects to Metro bundler for instant reload
- ✅ Best for daily development
- ✅ Works like `npx expo run:android`
- ⏱️ Build once, develop for weeks

### Preview Build (Simpler)
- ✅ Standalone app (no Metro needed)
- ✅ Good for quick testing
- ❌ No instant reload
- ⏱️ Rebuild every time you want to test changes

## Workflow: Development Build

### 1. Build the IPA
```bash
eas build --profile development --platform ios
```

**What happens:**
- EAS asks for Apple ID (for code signing)
- Builds on Expo's Mac servers (~15-20 mins)
- Gives you download link

### 2. Download IPA
- Click the link EAS provides
- Save the `.ipa` file to your PC

### 3. Install via Sideloadly
1. Open Sideloadly
2. Connect iPhone via USB
3. Drag the `.ipa` file into Sideloadly
4. Enter your Apple ID credentials
5. Click "Start"
6. Wait for installation (~2-3 mins)
7. Trust developer certificate on iPhone:
   - Settings → General → VPN & Device Management
   - Tap your Apple ID → Trust

### 4. Daily Development
```bash
# Start Metro bundler
npx expo start --dev-client

# On iPhone:
# - Open the installed app
# - Scan the QR code OR enter the URL
# - Make changes → Press 'r' to reload
```

## Workflow: Preview Build (Faster Testing)

### 1. Build Preview IPA
```bash
eas build --profile preview --platform ios
```

### 2. Download & Install
- Same Sideloadly process as above

### 3. Use the App
- Opens like a normal app
- No Metro connection needed
- To test new changes: rebuild and reinstall

## When to Rebuild

### Development Build - Rebuild when:
- ❌ Adding new npm packages with native code
- ❌ Changing `app.json` configuration
- ❌ Updating Expo SDK
- ✅ JavaScript changes: NO rebuild needed (instant reload)

### Preview Build - Rebuild when:
- ❌ Any code change you want to test

## Pro Tips

### Faster Builds
```bash
# Build only iOS
eas build --profile development --platform ios

# Skip credentials prompt (after first build)
eas build --profile development --platform ios --non-interactive
```

### Check Build Status
```bash
eas build:list
```

### Download Previous Build
```bash
# View builds in browser
eas build:list --limit 10

# Download specific build
# (Get URL from build list)
```

## Troubleshooting

### Sideloadly Error: "Could not find developer disk image"
- Update Sideloadly to latest version
- Update iTunes

### App Crashes on Launch
- Check build logs: `eas build:list` → Click build → View logs
- Make sure you built with correct profile

### Metro Connection Issues
- Ensure iPhone and PC on same WiFi
- Check Windows Firewall allows Metro (port 8081)
- Try entering URL manually in app instead of QR

## Cost Estimate

- **Free tier:** 30 builds/month
- **Development builds:** ~1-2 rebuilds per month
- **Preview builds:** More frequent if you use this approach

**Verdict:** Free tier is plenty for development builds!
