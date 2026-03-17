# Play Store Release Timeline

Complete timeline for releasing your app to Play Store internal testing.

## Current Status: Waiting for Upload Key Activation ⏳

Your upload key reset was approved by Google on March 14, 2026.

**Activation deadline**: March 15, 2026 at 11:21 PM UTC (approximately 24 hours from approval)

---

## Timeline Overview

```
✅ COMPLETED:
- EAS build with correct package name (com.rayn100.impostergame)
- Upload key reset request submitted and approved
- Keystore downloaded (@rayn100__imposter-game.jks)
- Certificate exported (upload_certificate.pem)
- Codemagic configuration updated

⏳ WAITING:
- Upload key activation (March 15, 2026 at 11:21 PM UTC)

📋 TODO (After March 15, 2026 at 11:21 PM UTC):
1. Upload AAB to Play Console
2. Update Firebase SHA-1 fingerprint
3. Upload keystore to Codemagic
```

---

## Step 1: Wait Until March 15, 2026 at 11:21 PM UTC ⏳

You cannot upload the AAB until the deadline passes. Just wait.

**What you're waiting for**: Google to activate your new upload key

---

## Step 2: Upload AAB to Play Console (After Deadline)

### 2.1 Get Your AAB File

You should have the AAB from your EAS build. If you need to download it again:

1. Go to: https://expo.dev/accounts/[your-account]/projects/the-impostor-game/builds
2. Find the latest successful build (the one with package name `com.rayn100.impostergame`)
3. Click **"Download"** to get the AAB file

### 2.2 Upload to Play Console

1. Go to: https://play.google.com/console
2. Select your app
3. Navigate to: **Release → Internal testing** (left sidebar)
4. Click **"Create new release"**
5. Click **"Upload"** button
6. Select your AAB file
7. The upload should now succeed (no signature mismatch error)
8. Fill in release notes (optional)
9. Click **"Review release"**
10. Click **"Start rollout to Internal testing"**

**Expected result**: AAB is accepted and uploaded successfully.

---

## Step 3: Update Firebase SHA-1 Fingerprint

See detailed guide: `FIREBASE_SHA1_UPDATE_GUIDE.md`

### Quick Steps:

1. Go to: https://console.firebase.google.com/
2. Select project: **imposter-game-e5f12**
3. Click gear icon → **Project settings**
4. Scroll to **"Your apps"** → Find **com.rayn100.impostergame**
5. Scroll to **"SHA certificate fingerprints"**
6. Click **"Add fingerprint"**
7. Paste: `1F:B5:E7:9D:76:FF:BF:9E:14:DC:C6:06:46:4F:65:54:F0:BF:4C:6A`
8. Click **"Save"**
9. Download updated `google-services.json`
10. Replace the file in your project root
11. Commit and push

**Why**: This ensures Google Sign-In continues working with your new keystore.

---

## Step 4: Upload Keystore to Codemagic

See detailed guide: `CODEMAGIC_KEYSTORE_SETUP_GUIDE.md`

### Quick Steps:

1. Go to: https://codemagic.io/apps
2. Select: **The-Impostor-Game**
3. Click **"Teams"** → **"Code signing identities"**
4. Click **"Android keystores"**
5. Click **"Upload keystore"**
6. Select file: `@rayn100__imposter-game.jks`
7. Fill in:
   - **Keystore reference**: `keystore_reference`
   - **Keystore password**: `e9bcfa89244a87f046241c81532319a7`
   - **Key alias**: `5eb50e518e76a8b774d0b31e21f3d640`
   - **Key password**: `2d80b4b7c1a271d12dfbba49590d6dc7`
8. Click **"Add keystore"**

**Why**: This allows Codemagic to automatically sign future builds.

---

## Step 5: Test Codemagic Automated Build

1. Make a small change to your code (or just push)
2. Push to `main` branch
3. Codemagic will automatically build and sign the AAB
4. Download the signed AAB from Codemagic artifacts
5. Upload to Play Console to verify it works

---

## Summary of Files

- `@rayn100__imposter-game.jks` - Your keystore (keep secure, backup)
- `upload_certificate.pem` - Certificate you uploaded to Play Console (can delete after setup)
- `google-services.json` - Will need to be updated with new SHA-1

## Important Reminders

- **Wait until March 15, 2026 at 11:21 PM UTC** before uploading AAB
- **Backup your keystore** - Store `@rayn100__imposter-game.jks` securely
- **Never commit keystore to git** - Already in `.gitignore`
- **Keep credentials secure** - Treat them like passwords

---

## Quick Reference: Keystore Info

```
File: @rayn100__imposter-game.jks
Key Alias: 5eb50e518e76a8b774d0b31e21f3d640
Keystore Password: e9bcfa89244a87f046241c81532319a7
Key Password: 2d80b4b7c1a271d12dfbba49590d6dc7
SHA-1: 1F:B5:E7:9D:76:FF:BF:9E:14:DC:C6:06:46:4F:65:54:F0:BF:4C:6A
```

---

**Next Action**: Wait until March 15, 2026 at 11:21 PM UTC, then follow Step 2 to upload your AAB!
