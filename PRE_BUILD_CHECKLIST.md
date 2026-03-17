# Pre-Build Checklist - Version 3 (com.rayn100.impostor)

## ✅ VERIFIED CONFIGURATIONS

### 1. Package Name ✅
- **app.json**: `com.rayn100.impostor` ✅
- **codemagic.yaml**: `com.rayn100.impostor` ✅
- **iOS bundleIdentifier**: `com.rayn100.impostor` ✅

### 2. Version Information ✅
- **version**: `1.0.0` ✅
- **versionCode**: `2` (current in Play Store)
- **Next versionCode**: `3` (for new build) ⚠️ NEEDS INCREMENT

### 3. Google Sign-In Configuration ✅
- **webClientId**: `831244408092-g256j85sdka2e5ql548r28ignggbjm7u.apps.googleusercontent.com` ✅
  - This matches package `com.rayn100.impostor` with SHA-1: `1fb5e79d76ffbf9e14dcc606464f6554f0bf4c6a`
- **iosClientId**: `831244408092-oifo3c54on55brivq9kupic53ntbgrd2.apps.googleusercontent.com` ✅

### 4. Firebase Configuration ✅
- **google-services.json**: Contains `com.rayn100.impostor` with OAuth clients ✅
- **SHA-1 Fingerprint**: `1fb5e79d76ffbf9e14dcc606464f6554f0bf4c6a` ✅
- **OAuth clients for com.rayn100.impostor**:
  - `831244408092-0d1bc2s7kngio0eusdeip2m0pv8prv5k.apps.googleusercontent.com` (SHA: 5e8f16062ea3cd2c4a0d547876baa6f38cabf625)
  - `831244408092-g256j85sdka2e5ql548r28ignggbjm7u.apps.googleusercontent.com` (SHA: 1fb5e79d76ffbf9e14dcc606464f6554f0bf4c6a) ✅ USING THIS
  - `831244408092-v3hlt8mhdeomk11nebfbe90vhh9t73cc.apps.googleusercontent.com` (SHA: 81af3830d1fc6ec12b54c5819ca6401343614f6b)

### 5. EAS Build Configuration ✅
- **Profile**: `production-aab` ✅
- **Build Type**: `app-bundle` ✅
- **Gradle Command**: `:app:bundleRelease` ✅

### 6. Keystore Information ✅
- **File**: `@rayn100__imposter-game.jks` ✅
- **Key Alias**: `5eb50e518e76a8b774d0b31e21f3d640` ✅
- **SHA-1**: `1F:B5:E7:9D:76:FF:BF:9E:14:DC:C6:06:46:4F:65:54:F0:BF:4C:6A` ✅

---

## ⚠️ REQUIRED ACTION BEFORE BUILD

### Increment Version Code

Current `app.json` has `versionCode: 2` (already uploaded to Play Store).
You MUST increment to `3` for the new build.

**Update app.json:**
```json
"android": {
  "package": "com.rayn100.impostor",
  "versionCode": 3,  // ← Change from 2 to 3
  ...
}
```

---

## 🔍 POTENTIAL ISSUES CHECKED

### ❌ No Issues Found in:
- Package name references
- Google Sign-In client IDs
- Firebase configuration
- Build configuration
- Keystore setup

### ✅ All Systems Ready

---

## 📋 BUILD COMMAND

After incrementing versionCode to 3:

```bash
eas build --platform android --profile production-aab --non-interactive
```

---

## 🎯 EXPECTED RESULT

- **Package**: `com.rayn100.impostor`
- **Version**: `1.0.0 (3)`
- **Google Sign-In**: Will work with new webClientId
- **Firebase**: Configured correctly
- **Play Store**: Ready to upload as version code 3

---

## 📝 POST-BUILD STEPS

1. Download AAB from EAS
2. Go to Play Console → Internal testing
3. Create new release
4. Upload AAB (version code 3)
5. Add release notes
6. Start rollout to internal testing
7. Test Google Sign-In on device

---

## ✅ FINAL VERIFICATION

Before building, confirm:
- [ ] versionCode incremented to 3 in app.json
- [ ] google-services.json is the latest (with com.rayn100.impostor)
- [ ] ProfileScreen.js has correct webClientId
- [ ] All changes committed and pushed to git

---

**Status**: Ready to build after versionCode increment ✅
**Confidence Level**: HIGH - All configurations verified
**Risk Level**: LOW - No issues detected
