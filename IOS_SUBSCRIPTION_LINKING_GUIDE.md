# iOS Subscription Linking Guide

## Your Situation

**Account Role**: Admin (not Account Holder/Developer)
**Issue**: Subscriptions show "Missing Metadata" and need to be linked to an app version
**Apple Requirement**: First subscription must be submitted with a new app version

---

## Can You Upload to TestFlight as Admin?

**YES!** As an Admin, you have permission to:
- ✅ Upload builds to TestFlight via EAS/Xcode
- ✅ Manage TestFlight builds and testers
- ✅ Create app versions in App Store Connect
- ✅ Link subscriptions to app versions
- ✅ Add metadata (screenshots, descriptions)
- ❌ Submit for App Review (requires Account Holder or Admin with App Manager role)

**You CAN do everything except the final "Submit for Review" button.**

---

## Step-by-Step: Upload Build & Link Subscriptions

### Step 1: Build and Upload to TestFlight

You can do this yourself right now:

```bash
# Build for iOS TestFlight
eas build --platform ios --profile preview
```

**Wait time**: 15-30 minutes for build to complete

### Step 2: Wait for Build Processing

After upload completes:
1. Go to [App Store Connect](https://appstoreconnect.apple.com)
2. Navigate to: **Your App → TestFlight tab**
3. Wait 5-10 minutes for Apple to process the build
4. Build will show "Processing" → "Ready to Test"

### Step 3: Create App Version (You Can Do This!)

1. Go to **App Store Connect → Your App**
2. Click **App Store tab** (not TestFlight)
3. Click **"+ Version or Platform"** button
4. Select **"iOS"**
5. Enter version number (e.g., "1.0" or whatever matches your app.json)
6. Click **"Create"**

### Step 4: Link Subscriptions to Version (CRITICAL STEP)

This is what makes subscriptions available in sandbox!

1. In the version page you just created, scroll down to **"In-App Purchases and Subscriptions"** section
2. Click the **"+"** button next to "In-App Purchases and Subscriptions"
3. A modal will appear showing all your subscriptions
4. **Select all 3 subscriptions**:
   - ☑️ Premium Weekly (iOS)
   - ☑️ Premium Monthly (iOS)  
   - ☑️ Premium Yearly (iOS)
5. Click **"Done"**
6. Click **"Save"** at the top right of the page

**IMPORTANT**: You don't need to fill out all the app metadata (screenshots, description, etc.) - just linking the subscriptions is enough for sandbox testing!

### Step 5: Add Screenshots to Subscriptions (Required)

Apple requires at least one screenshot per subscription:

1. Go to **App Store Connect → Your App → Subscriptions**
2. Click **"Premium Weekly (iOS)"**
3. Scroll to **"Review Information"** section
4. Under **"Screenshot"**, click **"Choose File"**
5. Upload ANY screenshot from your app (can be home screen, premium screen, anything)
   - Size: Any iPhone screenshot size works
   - Just take a screenshot from your TestFlight app if needed
6. Click **"Save"**
7. **Repeat for Monthly and Yearly subscriptions**

### Step 6: Wait for Sync (10-15 minutes)

After linking subscriptions and adding screenshots:
- Wait 10-15 minutes for Apple's systems to sync
- Subscriptions should change from "Missing Metadata" to "Ready to Submit"
- They'll now be available in sandbox for testing

### Step 7: Test in Sandbox

1. Force close your TestFlight app
2. Reopen the app
3. Navigate to Premium screen
4. Try purchasing - should work now!

---

## Do You Need to Submit for Review?

**NO!** For sandbox testing, you only need:
- ✅ Build uploaded to TestFlight
- ✅ Subscriptions linked to an app version
- ✅ Screenshots added to subscriptions

You do NOT need to:
- ❌ Submit the app for review
- ❌ Fill out all app metadata
- ❌ Wait for Account Holder to be online

**Sandbox testing works immediately after linking!**

---

## When Do You Need the Account Holder?

You'll need the Account Holder (or someone with App Manager role) to:
- Submit the app for App Review (when ready for production)
- Approve certain legal agreements
- Manage team roles and permissions

But for now, you can do everything yourself!

---

## Quick Checklist

- [ ] Run `eas build --platform ios --profile preview`
- [ ] Wait for build to upload and process (20-40 minutes total)
- [ ] Create app version in App Store Connect
- [ ] Link all 3 subscriptions to the version
- [ ] Add screenshots to all 3 subscriptions
- [ ] Save everything
- [ ] Wait 10-15 minutes
- [ ] Test in TestFlight app

---

## Troubleshooting

### "I don't see the + button to add subscriptions"
- Make sure you're in the **App Store tab**, not TestFlight
- Make sure you created a version (Step 3)
- Make sure you're viewing the version details page

### "Subscriptions still show Missing Metadata"
- Did you add screenshots to each subscription?
- Wait 15-20 minutes after adding screenshots
- Try refreshing the page

### "I can't create an app version"
- Check if a version already exists (look for "1.0" or similar)
- If version exists, just edit it and add subscriptions
- Make sure you have Admin role (check in Users and Access)

### "Build not showing in TestFlight"
- Wait 10-15 minutes after upload completes
- Check for email from Apple about build processing
- Look in TestFlight tab → iOS Builds section

---

## Summary

**You can do this yourself right now!** You don't need to wait for the developer. As an Admin, you have all the permissions needed to:
1. Upload builds
2. Create app versions
3. Link subscriptions
4. Add screenshots
5. Test in sandbox

The only thing you can't do is submit for final App Review, but that's not needed for testing.

**Estimated Time**: 1 hour total (mostly waiting for builds and processing)
