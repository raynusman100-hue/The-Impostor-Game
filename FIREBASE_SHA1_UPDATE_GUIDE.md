# Firebase SHA-1 Update Guide

After your upload key reset is active (March 15, 2026 at 11:21 PM UTC), you need to update Firebase with the new SHA-1 fingerprint to keep Google Sign-In working.

## Why This Is Needed

Google Sign-In verifies your app's signature using SHA-1 fingerprints. Since you're using a new upload key, you need to add its fingerprint to Firebase.

## Your New SHA-1 Fingerprint

```
1F:B5:E7:9D:76:FF:BF:9E:14:DC:C6:06:46:4F:65:54:F0:BF:4C:6A
```

This is from your EAS-generated keystore (`@rayn100__imposter-game.jks`).

## Step-by-Step Instructions

### 1. Open Firebase Console

1. Go to: https://console.firebase.google.com/
2. Select your project: **imposter-game-e5f12**

### 2. Navigate to Project Settings

1. Click the gear icon (⚙️) next to "Project Overview" in the left sidebar
2. Click **"Project settings"**

### 3. Find Your Android App

1. Scroll down to **"Your apps"** section
2. Find your Android app: **com.rayn100.impostergame**
3. Click on it to expand the details

### 4. Add SHA-1 Fingerprint

1. Scroll down to **"SHA certificate fingerprints"** section
2. Click **"Add fingerprint"**
3. Paste your new SHA-1:
   ```
   1F:B5:E7:9D:76:FF:BF:9E:14:DC:C6:06:46:4F:65:54:F0:BF:4C:6A
   ```
4. Click **"Save"**

### 5. Download Updated google-services.json

1. After adding the fingerprint, scroll back up
2. Click **"Download google-services.json"**
3. Replace the existing `google-services.json` in your project root
4. Commit and push the updated file

## Important Notes

- **Don't delete the old SHA-1** - Keep it in Firebase for backward compatibility with existing builds
- **Multiple SHA-1s are fine** - Firebase allows multiple fingerprints for the same app
- **Changes take effect immediately** - No waiting period for Firebase updates

## Verification

After updating Firebase:

1. Install the new AAB on a test device (via Play Console internal testing)
2. Try Google Sign-In
3. If it works, you're all set!

## Troubleshooting

### Google Sign-In still fails after update
- Wait 5-10 minutes for Firebase changes to propagate
- Clear app data and try again
- Verify the SHA-1 was copied correctly (no extra spaces)

### Can't find SHA certificate fingerprints section
- Make sure you're in the Android app settings (not iOS)
- Scroll down - it's below the app configuration details

---

**Timeline**: Do this AFTER March 15, 2026 at 11:21 PM UTC when your upload key becomes active.
