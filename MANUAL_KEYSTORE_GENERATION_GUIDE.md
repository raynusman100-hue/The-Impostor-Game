# Manual Keystore Generation Guide

Use this guide if you want to generate your own keystore locally before uploading to Play Console.

## Prerequisites

You need Java JDK installed. Choose one option:

### Option A: Install Java JDK (Recommended)

1. Go to: https://adoptium.net/temurin/releases/
2. Download: **Windows x64 JDK 17 (LTS)** - `.msi` installer
3. Run the installer
4. **Important**: During installation, check these boxes:
   - ✅ Set JAVA_HOME variable
   - ✅ Add to PATH
5. Restart your terminal/PowerShell
6. Verify installation:
   ```bash
   java -version
   keytool
   ```

### Option B: Use Android Studio's keytool

If you have Android Studio installed:

```bash
# Find keytool location
where /r "C:\Program Files\Android" keytool.exe

# Use full path to keytool
"C:\Program Files\Android\Android Studio\jbr\bin\keytool.exe" -version
```

### Option C: Use KeyStore Explorer (GUI Tool)

1. Download: https://keystore-explorer.org/downloads.html
2. Install and open KeyStore Explorer
3. Click **"Create a new KeyStore"**
4. Select **"PKCS12"**
5. Click **"Generate Key Pair"**
6. Fill in the details (see below)
7. Save as `release.keystore`

## Step 1: Generate Release Keystore

Open PowerShell in your project directory and run:

```bash
keytool -genkeypair -v -storetype PKCS12 -keystore android/app/release.keystore -alias release-key -keyalg RSA -keysize 2048 -validity 10000
```

### You'll be prompted for:

1. **Enter keystore password**: 
   - Choose a strong password (min 6 characters)
   - Example: `MySecurePassword123!`
   - **SAVE THIS PASSWORD** - you'll need it forever

2. **Re-enter new password**: 
   - Type the same password again

3. **What is your first and last name?**
   - Enter your name or company name
   - Example: `Rayn Usman` or `Impostor Game Studios`

4. **What is the name of your organizational unit?**
   - Your team/department
   - Example: `Development` or `Mobile Team`

5. **What is the name of your organization?**
   - Your company name
   - Example: `Impostor Game Studios`

6. **What is the name of your City or Locality?**
   - Your city
   - Example: `New York`

7. **What is the name of your State or Province?**
   - Your state
   - Example: `NY`

8. **What is the two-letter country code for this unit?**
   - Your country code
   - Example: `US`, `GB`, `CA`, etc.

9. **Is CN=..., OU=..., O=..., L=..., ST=..., C=... correct?**
   - Type: `yes`

10. **Enter key password for <release-key>**
    - Press ENTER to use the same password as keystore
    - Or enter a different password (not recommended)

### Example Session:

```
Enter keystore password: MySecurePassword123!
Re-enter new password: MySecurePassword123!
What is your first and last name?
  [Unknown]:  Rayn Usman
What is the name of your organizational unit?
  [Unknown]:  Development
What is the name of your organization?
  [Unknown]:  Impostor Game Studios
What is the name of your City or Locality?
  [Unknown]:  New York
What is the name of your State or Province?
  [Unknown]:  NY
What is the two-letter country code for this unit?
  [Unknown]:  US
Is CN=Rayn Usman, OU=Development, O=Impostor Game Studios, L=New York, ST=NY, C=US correct?
  [no]:  yes

Generating 2,048 bit RSA key pair and self-signed certificate (SHA256withRSA) with a validity of 10,000 days
        for: CN=Rayn Usman, OU=Development, O=Impostor Game Studios, L=New York, ST=NY, C=US
[Storing android/app/release.keystore]
```

## Step 2: Verify Keystore Created

```bash
dir android\app\release.keystore
```

You should see the file listed.

## Step 3: Get Keystore Information

```bash
keytool -list -v -keystore android/app/release.keystore -alias release-key
```

This will show:
- Certificate fingerprints (SHA-1, SHA-256)
- Validity dates
- Owner information

**Save the SHA-1 fingerprint** - you'll need it for Google Sign-In configuration.

## Step 4: Secure Your Keystore

**CRITICAL**: This keystore is your app's identity. If you lose it, you can never update your app on Play Store.

1. **Backup the keystore file**:
   - Copy `android/app/release.keystore` to a secure location
   - Use a password manager (1Password, LastPass, Bitwarden)
   - Or encrypted cloud storage (Google Drive, Dropbox with encryption)

2. **Save your passwords**:
   - Keystore password
   - Key alias: `release-key`
   - Key password (if different from keystore password)

3. **Add to .gitignore** (already done):
   ```
   *.keystore
   *.jks
   ```

## Step 5: Upload to Codemagic

1. Go to: https://codemagic.io/apps
2. Select "The-Impostor-Game"
3. Click **"Teams"** (left sidebar)
4. Click **"Code signing identities"**
5. Click **"Android keystores"** tab
6. Click **"Choose a file"** or drag and drop
7. Select `android/app/release.keystore`
8. Fill in the form:
   - **Keystore reference**: `keystore_reference`
   - **Keystore password**: (the password you set)
   - **Key alias**: `release-key`
   - **Key password**: (same as keystore password, or different if you set one)
9. Click **"Add keystore"**

## Step 6: Update codemagic.yaml

Make sure your codemagic.yaml has the signing configuration:

```yaml
environment:
  android_signing:
    - keystore_reference
  vars:
    PACKAGE_NAME: "com.rayn100.impostergame"
  node: 20
```

## Step 7: Update Google Services

You need to add the SHA-1 fingerprint to Firebase:

1. Get SHA-1 from keystore:
   ```bash
   keytool -list -v -keystore android/app/release.keystore -alias release-key | findstr SHA1
   ```

2. Go to Firebase Console: https://console.firebase.google.com/
3. Select your project: `imposter-game-e5f12`
4. Click ⚙️ → Project settings
5. Scroll to "Your apps" → Android app
6. Click "Add fingerprint"
7. Paste the SHA-1 fingerprint
8. Download new `google-services.json`
9. Replace the file in your project
10. Commit and push

## Step 8: Trigger Build

```bash
git add .
git commit -m "Update google-services.json with release SHA-1"
git push origin main
```

Codemagic will now build a signed AAB ready for Play Store.

## Troubleshooting

### "keytool: command not found"
- Java JDK is not installed or not in PATH
- Install Java JDK (see Prerequisites)
- Or use full path to keytool

### "Keystore was tampered with, or password was incorrect"
- You entered the wrong password
- Try again with the correct password
- If you forgot it, you must generate a new keystore (and can't update existing Play Store app)

### "Alias <release-key> does not exist"
- You used a different alias name
- List all aliases: `keytool -list -keystore android/app/release.keystore`
- Use the correct alias name

### "Invalid keystore format"
- Make sure you used `-storetype PKCS12`
- Regenerate the keystore with the correct command

## Important Notes

- **Never commit your keystore to git** - it's in .gitignore
- **Keystore password should be strong** - treat it like your bank password
- **Backup your keystore** - losing it means you can't update your app
- **Validity is 10,000 days** (~27 years) - plenty of time
- **SHA-1 fingerprint** - needed for Google Sign-In and Firebase

---

**Next Steps**: Once your keystore is uploaded to Codemagic, all builds will be automatically signed and ready for Play Store release.
