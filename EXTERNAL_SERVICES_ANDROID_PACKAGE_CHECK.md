# External Services - Android Package Name Change Impact

## Summary
You changed the Android package name from `com.usman.impostergame` to `com.rayn100.impostergame`. Here's what needs to be checked/updated in external services:

---

## ✅ Services Already Configured Correctly

### 1. Firebase
**Status**: ✅ **GOOD - No changes needed**

Both package names are registered in `google-services.json`:
- `com.rayn100.impostergame` - **WITH OAuth client** (your new package)
- `com.usman.impostergame` - WITHOUT OAuth client (old package)

**Conclusion**: Firebase is ready for the new package name.

---

### 2. Google Sign-In OAuth
**Status**: ✅ **GOOD - No changes needed**

The OAuth client in Firebase is configured for `com.rayn100.impostergame`:
```json
"oauth_client": [
  {
    "client_id": "831244408092-iqro5t18mgktp3mg6lkb1m3270990o62.apps.googleusercontent.com",
    "client_type": 1,
    "android_info": {
      "package_name": "com.rayn100.impostergame",
      "certificate_hash": "81af3830d1fc6ec12b54c5819ca6401343614f6b"
    }
  }
]
```

**Conclusion**: Google Sign-In will work with the new package name.

---

### 3. RevenueCat (In-App Purchases)
**Status**: ✅ **GOOD - Using test keys**

Current configuration in `PurchaseManager.js`:
```javascript
const API_KEYS = {
    apple: 'test_TnKjYrBPiEbigNCyWVqzMRvEwHx',
    google: 'test_TnKjYrBPiEbigNCyWVqzMRvEwHx',
};
```

**Analysis**:
- Currently using **test store keys** (same for both platforms)
- Test keys are **NOT package-specific**
- When you switch to production keys, RevenueCat will automatically detect the package name from your app

**Conclusion**: No changes needed now. When you get production keys from Google Play Console, RevenueCat will work with whatever package name your app uses.

---

## ⚠️ Services That MIGHT Need Updates

### 4. Google Play Console
**Status**: ⚠️ **CRITICAL - Check if app is already published**

**If app is NOT yet published**:
- ✅ You're good! Just publish with the new package name `com.rayn100.impostergame`

**If app IS already published with `com.usman.impostergame`**:
- ❌ **PROBLEM**: You CANNOT change the package name of a published app
- Changing the package name creates a **completely new app** in Google Play
- You would lose all reviews, downloads, and ratings
- Users would NOT get automatic updates

**What to check**:
1. Go to Google Play Console
2. Check if an app with package `com.usman.impostergame` exists
3. If YES → You need to decide:
   - **Option A**: Revert `app.json` back to `com.usman.impostergame` and add OAuth to Firebase
   - **Option B**: Publish as a new app with `com.rayn100.impostergame` (lose existing app data)

**Recommendation**: Check Play Console BEFORE rebuilding Android app.

---

### 5. Codemagic CI/CD
**Status**: ⚠️ **NEEDS UPDATE**

Found old package name in `codemagic.yaml`:
```yaml
ios-testflight:
  environment:
    vars:
      BUNDLE_ID: "com.usman.impostergame"  # ← OLD PACKAGE NAME
```

**Impact**: This is for iOS builds, not Android, but should be updated for consistency.

**Fix needed**:
```yaml
ios-testflight:
  environment:
    vars:
      BUNDLE_ID: "com.rayn100.impostergame"  # ← UPDATE THIS
```

---

## 🔍 Services to Check (If Configured)

### 6. Google AdMob
**Status**: ℹ️ **CHECK IF CONFIGURED**

Current `app.json` uses **test ad IDs**:
```json
"androidAppId": "ca-app-pub-3940256099942544~3347511713",  // Test ID
"iosAppId": "ca-app-pub-3940256099942544~1458002511"       // Test ID
```

**If you have real AdMob account**:
- Check if you created an app with package `com.usman.impostergame`
- If yes, you'll need to create a new app in AdMob with `com.rayn100.impostergame`
- Update the app IDs in `app.json`

**If still using test IDs**:
- ✅ No changes needed

---

### 7. Firebase Analytics / Crashlytics
**Status**: ✅ **GOOD - Handled by google-services.json**

Since both packages are in `google-services.json`, Firebase services will work.

---

### 8. App Store Connect (iOS)
**Status**: ✅ **GOOD - iOS bundle ID is correct**

iOS bundle ID is already `com.rayn100.impostergame` in `app.json`:
```json
"ios": {
  "bundleIdentifier": "com.rayn100.impostergame"
}
```

No changes needed for iOS.

---

## 📋 Action Checklist

### BEFORE Rebuilding Android App:

- [ ] **CRITICAL**: Check Google Play Console
  - Is app already published with `com.usman.impostergame`?
  - If YES → Decide: Revert package name OR publish as new app
  - If NO → Proceed with new package name

- [ ] Update `codemagic.yaml` iOS bundle ID (line 283)
  ```yaml
  BUNDLE_ID: "com.rayn100.impostergame"
  ```

- [ ] Check AdMob (if using real ads)
  - Verify if app exists with old package name
  - Create new app if needed

### AFTER Rebuilding Android App:

- [ ] Test Google Sign-In on Android
- [ ] Test in-app purchases (when production keys are added)
- [ ] Verify Firebase Analytics is tracking correctly
- [ ] Test ads (if using real AdMob)

---

## 🎯 Recommendation

**STOP and check Google Play Console first!**

If your app is already published with `com.usman.impostergame`, you have two options:

### Option A: Keep Old Package (Safer)
1. Revert `app.json` Android package to `com.usman.impostergame`
2. Add OAuth client for `com.usman.impostergame` in Firebase Console
3. Rebuild and test

### Option B: Use New Package (Fresh Start)
1. Accept that this will be a new app in Play Store
2. Update `codemagic.yaml` bundle ID
3. Create new AdMob app (if needed)
4. Rebuild and publish as new app

**Which option is better?**
- If app has users/reviews → **Option A** (keep old package)
- If app is not published yet → **Option B** (use new package)

---

## Summary

### Already Good:
- ✅ Firebase
- ✅ Google Sign-In OAuth
- ✅ RevenueCat (test keys)
- ✅ iOS configuration

### Needs Attention:
- ⚠️ **Google Play Console** (CRITICAL - check first!)
- ⚠️ Codemagic CI/CD (update bundle ID)
- ℹ️ AdMob (check if configured)

### Next Step:
**Check Google Play Console to see if app is already published with old package name.**

This will determine whether you should proceed with the new package name or revert to the old one.
