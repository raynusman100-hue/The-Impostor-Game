# Internal Testing Release Guide - Google Play Console

## ✅ FIXED: Package Name Consistency
All package names are now: `com.raynusman100hue.impostorgame`

## 🔧 Step 1: Complete RevenueCat Android Setup

### Get Your Android API Key:
1. Go to https://app.revenuecat.com/
2. Navigate to your project
3. Click **"Apps"** in the left sidebar
4. Click **"+ New"** to add Android app
5. Enter package name: `com.raynusman100hue.impostorgame`
6. Copy the **Google API Key** (starts with `goog_`)
7. Update `src/utils/PurchaseManager.js`:
   ```javascript
   google: 'goog_YOUR_ACTUAL_KEY_HERE',
   ```

### Link to Google Play:
1. In RevenueCat dashboard, under your Android app
2. Click **"Google Play"** tab
3. Upload your **Service Account JSON** (play-store-key.json)
4. This enables RevenueCat to verify purchases

---

## 📦 Step 2: Build the AAB File

### Option A: Build with EAS (Recommended)
```bash
eas build --platform android --profile production
```

This will:
- Build a signed AAB file
- Upload to EAS servers
- Provide download link

### Option B: Build Locally (Faster)
```bash
npx expo run:android --variant release
```

The AAB will be at: `android/app/build/outputs/bundle/release/app-release.aab`

---

## 🚀 Step 3: Upload to Google Play Console

### A. Navigate to Internal Testing:
1. Go to: https://play.google.com/console
2. Select your app: **Imposter game (Play Store)**
3. Left sidebar: **Testing → Internal testing**
4. Click **"Create new release"**

### B. Upload AAB:
1. Drag and drop your `.aab` file OR click "Upload"
2. Wait for upload to complete
3. Google will automatically sign it with Play App Signing

### C. Fill Release Details:

**Release name** (50 chars max):
```
Internal Test v1.0.0
```

**Release notes** (what's new):
```
Initial internal testing release:
- Multiplayer WiFi mode with voice chat
- Role assignment and voting system  
- Custom avatar builder
- Multiple language support
- Ad integration and Pro version
- COPPA compliant for all ages
```

### D. Review and Save:
1. Click **"Next"**
2. Review all details
3. Click **"Save"**

---

## 👥 Step 4: Add Internal Testers

### Create Tester List:
1. Go to **Testing → Internal testing → Testers** tab
2. Click **"Create email list"**
3. Name it: "Internal Testers"
4. Add Gmail addresses (up to 100):
   ```
   tester1@gmail.com
   tester2@gmail.com
   your.email@gmail.com
   ```
5. Save the list

### Assign to Release:
1. Go back to **Releases** tab
2. Your draft release should be there
3. Click **"Review release"**
4. Click **"Start rollout to Internal testing"**

---

## 📱 Step 5: Test the Release

### Testers will receive:
1. Email invitation to test
2. Link to opt-in page
3. After opt-in, they can download from Play Store

### Testing checklist:
- [ ] App installs successfully
- [ ] RevenueCat purchases work
- [ ] Ads display correctly
- [ ] Multiplayer WiFi mode works
- [ ] Voice chat functions
- [ ] All screens load properly

---

## 🔑 Important Notes

### About Signing:
- ✅ **EAS Build** creates a signed AAB automatically
- ✅ **Google Play** re-signs with Play App Signing (automatic)
- ❌ **You DON'T need** to provide production keystore manually
- ✅ **Internal testing** uses the same signing as production

### About Package Names:
- Package name is **LOCKED** after first upload
- Cannot be changed later
- Make sure it matches everywhere:
  - `app.json`: ✅ `com.raynusman100hue.impostorgame`
  - `build.gradle`: ✅ `com.raynusman100hue.impostorgame`
  - Google Play Console: ✅ `com.raynusman100hue.impostorgame`

### About RevenueCat:
- App ID: `appe839010e85` ✅
- iOS Key: `app06ec5f375b` ✅
- Android Key: `goog_xxxxxxxxxx` ⚠️ **UPDATE THIS**

---

## 🐛 Troubleshooting

### "Package name mismatch" error:
- Fixed! All package names now match.

### "Upload failed" error:
- Make sure you're uploading `.aab` not `.apk`
- Check file size (should be 30-80 MB)
- Try re-building with `eas build`

### "Signing error":
- EAS handles signing automatically
- No manual keystore needed for internal testing

### RevenueCat not working:
- Update Android API key in `PurchaseManager.js`
- Link Google Play service account in RevenueCat dashboard
- Test with real device (not emulator)

---

## 📋 Quick Command Reference

```bash
# Build production AAB with EAS
eas build --platform android --profile production

# Check build status
eas build:list

# Download AAB after build completes
# (EAS will provide download link)

# Commit changes before building
git add .
git commit -m "Fix package names and prepare for internal testing"
git push
```

---

## ✅ Checklist Before Upload

- [ ] Package names match everywhere
- [ ] RevenueCat Android key updated
- [ ] AAB file built successfully
- [ ] Release notes written
- [ ] Tester email list created
- [ ] Ready to upload!

---

**Your App Details:**
- Package: `com.raynusman100hue.impostorgame`
- RevenueCat ID: `appe839010e85`
- Version: 1.0.0 (versionCode: 1)
