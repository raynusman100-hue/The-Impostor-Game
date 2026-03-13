# Play Store App Signing Setup Guide (Recommended)

This is the **recommended approach** by Google. Google manages your production signing key, and you only need an upload key for CI/CD.

## Overview

- **Production signing key**: Managed by Google (secure, never leaves Google's servers)
- **Upload key**: Used by you/Codemagic to upload AABs
- **Benefit**: If you lose your upload key, Google can reset it. Production key is always safe.

## Step 1: Build Unsigned AAB with Codemagic

Your codemagic.yaml is already configured to build unsigned AABs.

1. Go to Codemagic: https://codemagic.io/apps
2. Select "The-Impostor-Game"
3. Click "Start new build" on the `main` branch
4. Wait for build to complete (~10-15 minutes)
5. Download the AAB from "Artifacts" section

## Step 2: Upload to Google Play Console

1. Go to: https://play.google.com/console
2. Select your app (or create new app if first time)
3. Navigate to: **Release → Internal testing** (left sidebar)
4. Click **"Create new release"**
5. Click **"Upload"** and select your AAB file

## Step 3: Enroll in Play App Signing

When you upload your first AAB, Google will prompt you:

1. You'll see: **"Use Google Play App Signing"**
2. Click **"Continue"**
3. Google will:
   - Generate a production signing key (managed by Google)
   - Generate an upload key for you
   - Show you the certificate fingerprints

## Step 4: Download Upload Certificate

1. After enrollment, go to: **Setup → App signing** (left sidebar)
2. Scroll to **"Upload key certificate"** section
3. You'll see the SHA-1 and SHA-256 fingerprints
4. Click **"Download upload certificate"** (if available)
   - This downloads a `.der` file
   - You'll need to convert it to a keystore

## Step 5: Create Upload Keystore from Certificate

If Google provides a `.der` certificate, convert it:

```bash
# Convert .der to .pem
openssl x509 -inform DER -in upload_cert.der -out upload_cert.pem

# Create keystore from certificate
keytool -import -file upload_cert.pem -keystore upload.keystore -alias upload
```

**OR** Google may provide a keystore directly - download and save it securely.

## Step 6: Upload Keystore to Codemagic

1. Go to Codemagic → Your app → **Teams** → **Code signing identities**
2. Click **"Android keystores"** tab
3. Click **"Choose a file"**
4. Upload your `upload.keystore` file
5. Fill in:
   - **Keystore reference**: `keystore_reference`
   - **Keystore password**: (provided by Google or set by you)
   - **Key alias**: `upload` (or as specified by Google)
   - **Key password**: (same as keystore password)
6. Click **"Add keystore"**

## Step 7: Update codemagic.yaml

Restore the signing configuration:

```yaml
environment:
  android_signing:
    - keystore_reference
  vars:
    PACKAGE_NAME: "com.rayn100.impostergame"
  node: 20
```

## Step 8: Trigger New Build

1. Push any change to `main` branch
2. Codemagic will build a signed AAB
3. Upload to Play Console for release

## Important Notes

- **Save your upload keystore securely** - you'll need it for all future releases
- **Never share your keystore** - treat it like a password
- **Backup your keystore** - store it in a secure location (password manager, encrypted drive)
- If you lose your upload key, contact Google Play support to reset it

## Troubleshooting

### "Upload key doesn't match"
- Make sure you're using the upload key, not creating a new one
- Verify the key alias and passwords match

### "Signature mismatch"
- You may have uploaded with a different key initially
- Contact Google Play support to reset your upload key

### "Can't find upload certificate"
- Some apps don't show a download option
- You may need to generate your own upload key (see next guide)

---

**Next Steps**: Once setup is complete, all future builds will be automatically signed by Codemagic and ready for Play Store upload.
