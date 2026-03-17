# Codemagic Keystore Setup Guide

This guide shows you how to upload your keystore to Codemagic so future builds are automatically signed.

## Prerequisites

- You have the keystore file: `@rayn100__imposter-game.jks` (in your project directory)
- You have the keystore credentials (from EAS)

## Keystore Credentials

```
Keystore file: @rayn100__imposter-game.jks
Key alias: 5eb50e518e76a8b774d0b31e21f3d640
Keystore password: e9bcfa89244a87f046241c81532319a7
Key password: 2d80b4b7c1a271d12dfbba49590d6dc7
SHA-1: 1F:B5:E7:9D:76:FF:BF:9E:14:DC:C6:06:46:4F:65:54:F0:BF:4C:6A
```

## Step 1: Upload Keystore to Codemagic

1. Go to: https://codemagic.io/apps
2. Select your app: **The-Impostor-Game**
3. Click **"Teams"** in the top navigation
4. Click **"Code signing identities"** tab
5. Click **"Android keystores"** section
6. Click **"Choose a file"** or **"Upload keystore"**
7. Select the file: `@rayn100__imposter-game.jks` from your project directory

## Step 2: Configure Keystore Details

Fill in the form with these exact values:

- **Keystore reference**: `keystore_reference`
  (This is the name you'll use in codemagic.yaml)

- **Keystore password**: `e9bcfa89244a87f046241c81532319a7`

- **Key alias**: `5eb50e518e76a8b774d0b31e21f3d640`

- **Key password**: `2d80b4b7c1a271d12dfbba49590d6dc7`

Click **"Add keystore"** or **"Save"**

## Step 3: Verify Upload

After uploading, you should see:
- Keystore reference: `keystore_reference`
- Key alias: `5eb50e518e76a8b774d0b31e21f3d640`
- Status: Active/Available

## Step 4: Update codemagic.yaml

The signing configuration has been restored in your `codemagic.yaml`:

```yaml
environment:
  android_signing:
    - keystore_reference
  vars:
    PACKAGE_NAME: "com.rayn100.impostergame"
  node: 20
```

This tells Codemagic to use the keystore you uploaded.

## Step 5: Trigger a Build

1. Make any small change to your code (or just push)
2. Push to `main` branch
3. Codemagic will automatically:
   - Build the AAB
   - Sign it with your keystore
   - Email you the signed AAB

## Step 6: Verify Signed AAB

After the build completes:

1. Download the AAB from Codemagic artifacts
2. Upload to Play Console
3. It should be accepted without signature errors

## Important Notes

- **Keystore is stored securely** - Codemagic encrypts it
- **Never commit keystore to git** - It's already in `.gitignore`
- **Backup your keystore** - Keep a copy in a secure location (password manager, encrypted drive)
- **One-time setup** - You only need to do this once

## Troubleshooting

### "Keystore reference not found"
- Make sure you uploaded the keystore in Step 1
- Verify the reference name is exactly `keystore_reference`

### "Invalid keystore password"
- Double-check the password: `e9bcfa89244a87f046241c81532319a7`
- Make sure there are no extra spaces

### "Key alias not found"
- Verify the alias: `5eb50e518e76a8b774d0b31e21f3d640`
- This is case-sensitive

### Build fails with signing error
- Check Codemagic build logs for specific error
- Verify all credentials match exactly

---

**Timeline**: Do this AFTER you've successfully uploaded your first AAB to Play Console (after March 15, 2026 at 11:21 PM UTC).
