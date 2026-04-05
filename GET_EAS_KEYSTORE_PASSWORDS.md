# How to Get EAS Keystore Passwords for Codemagic

## The Problem
EAS stores keystore passwords securely and doesn't expose them easily through the CLI or dashboard.

## Solution Options

### Option 1: Contact Expo Support (Recommended)
1. Go to https://expo.dev/
2. Click "Help" or "Support"
3. Request: "I need the keystore passwords for my Android credentials to use with Codemagic CI/CD"
4. Provide your project slug: `imposter-game`
5. They can provide the passwords securely

### Option 2: Use EAS Build API
If you have an Expo access token, you can query the API:

```bash
curl -H "Authorization: Bearer YOUR_EXPO_TOKEN" \
  https://api.expo.dev/v2/accounts/YOUR_ACCOUNT/projects/imposter-game/credentials/android
```

Get your token from: https://expo.dev/accounts/[your-account]/settings/access-tokens

### Option 3: Build Locally with EAS
Run a local EAS build which will download credentials temporarily:

```bash
eas build --platform android --profile production --local
```

During the build, EAS downloads the keystore to a temp directory. You can:
1. Pause the build (Ctrl+Z)
2. Find the keystore in the temp directory
3. The build script might show the passwords in logs

### Option 4: Switch to EAS Build Permanently
- EAS Build is free for open source projects
- Paid plans are $29/month for unlimited builds
- No need to manage keystores manually
- Automatic signing handled by EAS

### Option 5: Create New Upload Key (Last Resort)
If you absolutely can't get the passwords:

1. Go to Play Console → Setup → App signing
2. Click "Request upload key reset"
3. Google will allow you to register a new upload key
4. Create a new keystore with known passwords
5. Upload to both EAS and Codemagic

**Note:** This takes 3-7 days for Google to approve.

---

## For Future: Store Passwords Securely

Once you get the passwords, store them in:
- Password manager (1Password, LastPass, Bitwarden)
- Encrypted note
- Secure team vault

Never commit them to git!

---

## Quick Win: Just Use EAS Build

For now, use EAS Build:
```bash
eas build --platform android --profile production
```

It's fast enough and handles signing automatically. You can switch to Codemagic later once you have the passwords.
