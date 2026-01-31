# Quick Start: Internal Testing Release

## ✅ Already Fixed
- Package names: `com.raynusman100hue.impostorgame` (consistent everywhere)
- Build configurations ready
- Google Play Console app created

## 🔧 To Do Now

### 1. RevenueCat Android Key (5 min)
1. Go to https://app.revenuecat.com/
2. Add Android app with package: `com.rayn100.impostergame` ⚠️ **NO "hue"!**
3. Copy Android key (starts with `goog_`)
4. Update in `src/utils/PurchaseManager.js`

**Note:** The API key is SAFE in code - it's a public SDK key, not a secret.

### 2. Build AAB (Choose One)

#### Option A: EAS Build (RECOMMENDED - Easier)
```bash
eas build --platform android --profile production
```
- No keystore setup needed
- Automatic signing
- Takes ~15 minutes

#### Option B: Codemagic (Requires Setup)
- Need to upload keystore first
- See `CODEMAGIC_AAB_BUILD_COMPLETE_GUIDE.md`
- More complex but can auto-upload to Play Store

### 3. Upload to Google Play
1. Download AAB from build
2. Go to Google Play Console → Internal Testing
3. Create new release
4. Upload AAB file
5. Add release notes
6. Add testers (email list)
7. Start rollout

## 📚 Detailed Guides
- `INTERNAL_TESTING_RELEASE_GUIDE.md` - Full upload process
- `CODEMAGIC_AAB_BUILD_COMPLETE_GUIDE.md` - Codemagic setup
- `REVENUECAT_ANDROID_SETUP.md` - RevenueCat details

## 🚀 Recommended Path
1. Update RevenueCat key
2. Use EAS Build (simpler)
3. Upload to Google Play manually
4. Set up Codemagic later for automation

## ⏱️ Time Estimate
- RevenueCat setup: 5 minutes
- EAS build: 15 minutes
- Google Play upload: 10 minutes
- **Total: ~30 minutes**
