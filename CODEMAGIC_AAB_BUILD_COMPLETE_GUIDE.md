# Codemagic AAB Build - Complete Setup Guide

## Why Your Last Build Failed ❌

Codemagic **REQUIRES signing configuration** to build AAB files for Google Play. Without it, the build fails with keystore errors.

---

## 🎯 Two Options for Building AAB

### Option 1: Use EAS Build (RECOMMENDED - Easier) ✅

**Pros:**
- ✅ No keystore setup needed
- ✅ Automatic signing
- ✅ Simpler configuration
- ✅ Works immediately

**Command:**
```bash
eas build --platform android --profile production
```

**Why it's easier:**
- EAS handles all signing automatically
- No need to upload keystores
- No environment variables to configure

---

### Option 2: Use Codemagic (More Complex) ⚙️

**Pros:**
- ✅ Can auto-submit to Google Play
- ✅ More CI/CD control
- ✅ Free tier available

**Cons:**
- ❌ Requires keystore setup
- ❌ More configuration needed

---

## 🔐 Setting Up Codemagic for AAB (If You Choose Option 2)

### Step 1: Generate Production Keystore

If you don't have a production keystore yet:

```bash
keytool -genkeypair -v -storetype PKCS12 -keystore impostor-game-release.keystore -alias impostor-game -keyalg RSA -keysize 2048 -validity 10000
```

**You'll be asked for:**
- Keystore password (create a strong one)
- Key password (can be same as keystore password)
- Your name, organization, etc.

**IMPORTANT:** Save these passwords! You'll need them for Codemagic.

This creates: `impostor-game-release.keystore`

---

### Step 2: Upload Keystore to Codemagic

1. **Go to Codemagic**: https://codemagic.io/
2. **Select your app**: "The-Impostor-Game"
3. **Go to**: Settings → Code signing identities → Android
4. **Click**: "Add keystore"

**Fill in:**
- **Keystore file**: Upload `impostor-game-release.keystore`
- **Keystore password**: Your keystore password
- **Key alias**: `impostor-game` (or whatever you used)
- **Key password**: Your key password
- **Reference name**: `keystore_reference` (IMPORTANT - must match codemagic.yaml)

5. **Click**: "Save"

---

### Step 3: Add Google Play Service Account (Optional - for auto-upload)

If you want Codemagic to automatically upload to Google Play:

1. **In Codemagic**: Settings → Environment variables
2. **Add variable**:
   - **Name**: `GCLOUD_SERVICE_ACCOUNT_CREDENTIALS`
   - **Value**: Paste contents of your `play-store-key.json`
   - **Type**: Text
   - **Group**: `google_play`
   - **Secure**: ✅ Check this

---

### Step 4: Verify codemagic.yaml Configuration

The `codemagic.yaml` file is already created in your project root. It has two workflows:

#### Workflow 1: `android-production-aab`
- Builds signed AAB for Google Play
- Triggers on `main` or `production` branch
- Can auto-upload to Google Play (if service account configured)

#### Workflow 2: `android-preview-apk`
- Builds debug APK for testing
- Triggers on `codemagic` or `android-dev` branch
- No signing needed (uses debug keystore)

---

### Step 5: Trigger Production Build

1. **Commit and push** your changes:
   ```bash
   git add .
   git commit -m "Add Codemagic configuration for AAB build"
   git push origin main
   ```

2. **Go to Codemagic dashboard**
3. **Click**: "Start new build"
4. **Select**:
   - Branch: `main`
   - Workflow: `android-production-aab`
5. **Click**: "Start build"

---

## 📦 What Happens During Build

### For Production AAB:
1. ✅ Installs dependencies
2. ✅ Sets up Android SDK
3. ✅ Applies signing configuration
4. ✅ Builds signed AAB
5. ✅ (Optional) Uploads to Google Play Internal Testing
6. ✅ Emails you the download link

### Build Time:
- First build: ~15-20 minutes
- Subsequent builds: ~10-15 minutes

---

## 🐛 Troubleshooting

### Error: "CM_KEYSTORE not found"
**Solution:** Make sure you:
1. Uploaded keystore in Codemagic UI
2. Used reference name: `keystore_reference`
3. Saved the configuration

### Error: "Keystore password incorrect"
**Solution:** 
1. Double-check your keystore password
2. Re-upload keystore with correct password
3. Make sure key alias matches

### Error: "Package name mismatch"
**Solution:**
- Package name in code: `com.raynusman100hue.impostorgame` ✅
- Already fixed in this project!

### Build succeeds but no AAB file
**Solution:**
1. Check artifacts section in build logs
2. Make sure you selected `android-production-aab` workflow
3. Verify `bundleRelease` task completed

---

## 🎯 Recommended Approach

### For Internal Testing (NOW):
**Use EAS Build** - It's simpler and faster to set up:
```bash
eas build --platform android --profile production
```

### For CI/CD Pipeline (LATER):
**Use Codemagic** - Once you have everything working, set up Codemagic for:
- Automatic builds on push
- Auto-upload to Google Play
- Continuous deployment

---

## 📋 Quick Comparison

| Feature | EAS Build | Codemagic |
|---------|-----------|-----------|
| Setup Time | 5 minutes | 30 minutes |
| Signing | Automatic | Manual setup |
| Auto-upload to Play Store | Via `eas submit` | Built-in |
| Free Tier | 30 builds/month | 500 minutes/month |
| Best For | Quick releases | Full CI/CD |

---

## ✅ Next Steps

### If Using EAS (Recommended):
1. Run: `eas build --platform android --profile production`
2. Wait for build to complete (~15 min)
3. Download AAB from EAS dashboard
4. Upload to Google Play Console manually

### If Using Codemagic:
1. Generate keystore (if needed)
2. Upload to Codemagic
3. Push to `main` branch
4. Wait for automatic build
5. Download AAB from Codemagic artifacts

---

## 🔑 Important Files

- ✅ `codemagic.yaml` - Build configuration (created)
- ✅ `eas.json` - EAS build configuration (already exists)
- ✅ `app.json` - Package name fixed to `com.raynusman100hue.impostorgame`
- ✅ `android/app/build.gradle` - Package name fixed

---

## 💡 Pro Tip

For your **first internal testing release**, use **EAS Build**. It's faster and you can get your app to testers today.

Once you're comfortable with the process, set up Codemagic for automated builds.

---

**Your package name is now consistent everywhere:** ✅  
`com.raynusman100hue.impostorgame`

Ready to build! 🚀
