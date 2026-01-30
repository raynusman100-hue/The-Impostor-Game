# TestFlight Deployment Guide

## Prerequisites

Before you can push to TestFlight, you need:

### 1. Apple Developer Account
- Enrolled in Apple Developer Program ($99/year)
- Account holder or admin access
- Get credentials from your cousin

### 2. App Store Connect Setup
- App created in App Store Connect
- Bundle ID: `com.rayn100.impostergame`
- App name: "Impostor Game: Film Edition"

### 3. Required Files (Already in Project)
- ✅ `GoogleService-Info.plist` - Firebase iOS config
- ✅ `app.json` - Expo configuration with correct bundle ID
- ✅ iOS URL schemes configured for Google Sign-In

---

## Option 1: Build with EAS (Recommended - Easiest)

### Step 1: Install EAS CLI
```bash
npm install -g eas-cli
```

### Step 2: Login to Expo
```bash
eas login
```

### Step 3: Configure EAS Build (if not already done)
```bash
eas build:configure
```

### Step 4: Build for iOS
```bash
eas build --platform ios --profile production
```

This will:
- Build your app in the cloud
- Handle code signing automatically
- Upload to TestFlight automatically (if configured)

### Step 5: Submit to TestFlight (if not auto-uploaded)
```bash
eas submit --platform ios
```

---

## Option 2: Build with Codemagic (Automated CI/CD)

### Step 1: Setup Codemagic Environment Variables

Go to Codemagic → Your App → Environment Variables and add:

```bash
# Apple Developer Credentials
APPLE_ID=your_apple_id@email.com
APPLE_APP_SPECIFIC_PASSWORD=xxxx-xxxx-xxxx-xxxx

# App Store Connect API Key (Recommended)
APP_STORE_CONNECT_ISSUER_ID=xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
APP_STORE_CONNECT_KEY_IDENTIFIER=XXXXXXXXXX
APP_STORE_CONNECT_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----
...
-----END PRIVATE KEY-----

# App Info
APP_STORE_APP_ID=your_app_id_from_app_store_connect
BUNDLE_ID=com.rayn100.impostergame

# Expo (if using EAS in Codemagic)
EXPO_TOKEN=your_expo_token
```

### Step 2: Push to Production Branch
```bash
git push origin production
```

This triggers the `ios-testflight` workflow in `codemagic.yaml` which will:
1. Build the iOS app
2. Sign with your certificates
3. Upload to TestFlight automatically

---

## Option 3: Manual Build (Advanced)

### Step 1: Prebuild iOS Project
```bash
npx expo prebuild --platform ios --clean
```

### Step 2: Install Dependencies
```bash
cd ios
pod install
cd ..
```

### Step 3: Open in Xcode
```bash
open ios/ImposterGame.xcworkspace
```

### Step 4: Configure Signing
1. Select your project in Xcode
2. Go to "Signing & Capabilities"
3. Select your Team
4. Ensure Bundle ID is `com.rayn100.impostergame`
5. Select appropriate Provisioning Profile

### Step 5: Archive
1. Product → Archive
2. Wait for archive to complete
3. Click "Distribute App"
4. Select "App Store Connect"
5. Upload

---

## Getting App Store Connect API Key (Recommended)

This allows automated uploads without 2FA prompts.

### Step 1: Create API Key
1. Go to [App Store Connect](https://appstoreconnect.apple.com)
2. Users and Access → Keys → App Store Connect API
3. Click "+" to create new key
4. Name: "Codemagic" or "EAS Build"
5. Access: "App Manager" or "Developer"
6. Download the `.p8` file (you can only download once!)

### Step 2: Note These Values
- **Issuer ID**: Found at top of Keys page
- **Key ID**: The 10-character ID next to your key name
- **Private Key**: Contents of the `.p8` file

### Step 3: Add to Codemagic or EAS
- Codemagic: Add as environment variables (see Option 2)
- EAS: Add to `eas.json` submit profile

---

## Troubleshooting

### "No provisioning profiles found"
**Solution**: 
1. Go to Apple Developer Portal
2. Certificates, Identifiers & Profiles → Profiles
3. Create new "App Store" profile for `com.rayn100.impostergame`
4. Download and install

### "Bundle ID mismatch"
**Solution**: 
- Ensure `app.json` has `"bundleIdentifier": "com.rayn100.impostergame"`
- Ensure App Store Connect app has same Bundle ID
- Run `npx expo prebuild --clean` to regenerate iOS project

### "Google Sign-In not working"
**Solution**: 
- iOS URL schemes are already configured in `app.json`
- After rebuild, Google Sign-In should work
- Test on real device (not simulator)

### "Missing GoogleService-Info.plist"
**Solution**: 
- File is already in project root
- Codemagic workflow copies it to `ios/` folder automatically
- For manual builds, copy it to `ios/` folder before building

---

## Current Configuration Status

### ✅ Ready
- iOS Bundle ID: `com.rayn100.impostergame`
- iOS URL Schemes: Configured for Google Sign-In
- Firebase iOS: `GoogleService-Info.plist` present
- Codemagic workflow: Configured in `codemagic.yaml`

### ⏳ Needs Setup
- Apple Developer credentials (get from cousin)
- App Store Connect API Key (optional but recommended)
- App created in App Store Connect

---

## Quick Start (Recommended Path)

1. **Get Apple Developer credentials from cousin**
2. **Create app in App Store Connect**:
   - Bundle ID: `com.rayn100.impostergame`
   - Name: "Impostor Game: Film Edition"
3. **Use EAS Build** (easiest):
   ```bash
   npm install -g eas-cli
   eas login
   eas build --platform ios --profile production
   eas submit --platform ios
   ```

That's it! EAS handles everything else.

---

## Need Help?

If you get stuck:
1. Check the error message carefully
2. Verify Bundle ID matches everywhere
3. Ensure Apple Developer account is active
4. Try EAS Build first (it's the easiest)
5. Ask me for help with specific error messages
