# CodeMagic Keystore Configuration Fix

## Problem
```
ERROR: CM_KEYSTORE environment variable is NOT set!
Step 5 script `Setup Signing Keystore` exited with status code 1
```

## Solution: Add Keystore to CodeMagic

### Step 1: Generate Production Keystore (if you don't have one)

If you only have `debug.keystore`, you need to create a **production keystore** for Google Play:

```bash
keytool -genkeypair -v -storetype PKCS12 -keystore impostor-game-release.keystore -alias impostor-game -keyalg RSA -keysize 2048 -validity 10000
```

**Important**: Save the password you enter! You'll need it for CodeMagic.

This creates: `impostor-game-release.keystore`

### Step 2: Upload Keystore to CodeMagic

1. **Go to CodeMagic**: https://codemagic.io/
2. **Select your app**: "The-Impostor-Game"
3. **Go to Settings** → **Environment variables**
4. **Add these variables**:

#### Variable 1: CM_KEYSTORE
- **Name**: `CM_KEYSTORE`
- **Value**: Upload your `impostor-game-release.keystore` file
- **Type**: File
- **Group**: (optional) `android_signing`
- **Secure**: ✅ Check this box

#### Variable 2: CM_KEYSTORE_PASSWORD
- **Name**: `CM_KEYSTORE_PASSWORD`
- **Value**: Your keystore password (the one you entered when creating it)
- **Type**: Text
- **Group**: `android_signing`
- **Secure**: ✅ Check this box

#### Variable 3: CM_KEY_ALIAS
- **Name**: `CM_KEY_ALIAS`
- **Value**: `impostor-game` (or whatever alias you used)
- **Type**: Text
- **Group**: `android_signing`
- **Secure**: ✅ Check this box

#### Variable 4: CM_KEY_PASSWORD
- **Name**: `CM_KEY_PASSWORD`
- **Value**: Your key password (usually same as keystore password)
- **Type**: Text
- **Group**: `android_signing`
- **Secure**: ✅ Check this box

### Step 3: Update CodeMagic Workflow

Make sure your CodeMagic workflow uses these variables. The workflow should have something like:

```yaml
android:
  signing:
    - keystore_reference: CM_KEYSTORE
      keystore_password: $CM_KEYSTORE_PASSWORD
      key_alias: $CM_KEY_ALIAS
      key_password: $CM_KEY_PASSWORD
```

### Step 4: Trigger New Build

1. Go back to your app in CodeMagic
2. Click **Start new build**
3. Select branch: `android-dev`
4. Click **Start build**

---

## Alternative: Use Debug Keystore (Testing Only)

If you just want to test the build process (NOT for Google Play submission):

1. Upload `android/app/debug.keystore` as `CM_KEYSTORE`
2. Use these credentials:
   - **Password**: `android`
   - **Alias**: `androiddebugkey`
   - **Key Password**: `android`

⚠️ **WARNING**: Debug keystores CANNOT be used for Google Play production releases!

---

## Verify Keystore Info

To check your keystore details:

```bash
keytool -list -v -keystore impostor-game-release.keystore
```

This shows:
- Alias name
- Creation date
- Validity period
- Certificate fingerprints (needed for Google Play and RevenueCat)

---

## Next Steps After Build Succeeds

1. Download the AAB file from CodeMagic artifacts
2. Upload to Google Play Console
3. Get the SHA-1 certificate fingerprint for RevenueCat configuration

