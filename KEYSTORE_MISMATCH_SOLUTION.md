# Keystore Mismatch Solution Guide

## The Problem

Your app was previously uploaded to Google Play Console with a keystore that has SHA1:
```
56:D9:41:F4:A4:56:74:5E:72:E0:45:AA:28:94:9D:90:7C:FC:41:17
```

But your current local keystore has SHA1:
```
1F:B5:E7:9D:76:FF:BF:9E:14:DC:C6:06:46:4F:65:54:F0:BF:4C:6A
```

Google Play locks your app to the first keystore signature it sees. You MUST use the original keystore.

---

## Solution: Find the Original Keystore

### Step 1: Check Where You Built the First AAB

The original keystore is wherever you built the first AAB that was uploaded to Play Console. Check these locations:

**A. EAS Build Credentials**
```bash
eas credentials
```
- Select Android
- Select Production
- View keystore details
- Download the keystore if available
- Check its SHA1 fingerprint

**B. Codemagic Previous Builds**
1. Go to https://codemagic.io/apps
2. Select "The-Impostor-Game"
3. Check build history for successful AAB builds
4. Look at the signing configuration used
5. Check if keystore is still uploaded in "Code signing identities"

**C. Local Backup Folders**
Search your computer for `.jks` or `.keystore` files:
```bash
# Search in common locations
dir /s *.jks
dir /s *.keystore
```

Check these folders:
- `C:\Users\shuai\.android\`
- `C:\Users\shuai\OneDrive\Desktop\`
- Any backup folders
- Old project folders

**D. Google Play Console**
1. Go to Play Console → Setup → App signing
2. Look for "App signing key certificate"
3. Check if SHA1 matches: `56:D9:41:F4:A4:56:74:5E:72:E0:45:AA:28:94:9D:90:7C:FC:41:17`
4. If Google is managing app signing, download the upload certificate

---

### Step 2: Verify the Keystore SHA1

Once you find a keystore file, check its fingerprint:

```bash
keytool -list -v -keystore <keystore-file-name>.jks
```

Look for the SHA1 line. It MUST match:
```
SHA1: 56:D9:41:F4:A4:56:74:5E:72:E0:45:AA:28:94:9D:90:7C:FC:41:17
```

---

### Step 3: Upload Correct Keystore to Codemagic

Once you find the correct keystore:

1. Go to https://codemagic.io/apps
2. Select "The-Impostor-Game"
3. Click "Teams" (top navigation)
4. Click "Code signing identities" tab
5. Click "Android keystores"
6. Click "Upload keystore"
7. Upload the correct keystore file
8. Fill in the credentials:
   - **Keystore reference**: `keystore_reference`
   - **Keystore password**: (from when you created it)
   - **Key alias**: (from when you created it)
   - **Key password**: (from when you created it)
9. Save

---

### Step 4: Rebuild with Correct Keystore

Your `codemagic.yaml` already has signing configured:

```yaml
environment:
  android_signing:
    - keystore_reference
```

Just trigger a new build:
1. Push any change to `main` branch
2. Codemagic will build and sign with the correct keystore
3. Upload the AAB to Play Console - it should work!

---

## Alternative: Request Upload Key Reset from Google

If you absolutely cannot find the original keystore:

### Step 1: Contact Google Play Support

1. Go to Play Console → Help → Contact us
2. Select "App signing"
3. Explain: "I lost my upload key and need to reset it"
4. Provide your app details

### Step 2: Wait for Google's Response

Google will:
- Verify your identity
- Reset your upload key
- Allow you to register a new keystore

This can take 3-7 days.

### Step 3: Register Your Current Keystore

Once approved:
1. Upload your current keystore (`@rayn100__imposter-game.jks`) to Codemagic
2. Build a new AAB
3. Upload to Play Console
4. Google will accept the new signature

---

## Important Notes

- **Production signing key** (managed by Google) never changes
- **Upload key** is what you use to sign AABs before uploading
- If Google manages app signing, you can reset the upload key
- If you manage your own signing, losing the key means you can't update the app

---

## Quick Checklist

- [ ] Check EAS credentials for the original keystore
- [ ] Check Codemagic code signing identities
- [ ] Search local computer for `.jks` files
- [ ] Check Google Play Console app signing settings
- [ ] Verify keystore SHA1 matches expected value
- [ ] Upload correct keystore to Codemagic
- [ ] Rebuild and test upload

---

## Need Help?

If you're stuck, check:
1. When did you first upload to Play Console?
2. What tool did you use? (EAS, Codemagic, local build)
3. Do you have any backup of that build environment?

The keystore MUST exist somewhere - you successfully uploaded an AAB before!
