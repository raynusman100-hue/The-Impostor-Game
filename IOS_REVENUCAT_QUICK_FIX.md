# iOS RevenueCat Quick Fix Guide

## Current Status
- ✅ RevenueCat configured with offerings and packages
- ✅ Bundle ID: `com.rayn100.impostor`
- ⏳ iOS products need to be verified in App Store Connect
- ⏳ iOS API key temporarily disabled until products are ready

---

## Step 1: Verify In-App Purchases Location

Once the page loads, check:

1. Click on **"In-App Purchases"** in the left sidebar (under MONETIZATION)
2. Look for these 3 products:
   - `premium_weekly`
   - `premium_monthly`
   - `premium_yearly`

### If You See Them:
✅ Great! Go to Step 2

### If You DON'T See Them:
You need to create them. Click **"+"** and create each one:

**Product 1: Weekly**
- Type: Auto-Renewable Subscription
- Reference Name: Premium Weekly
- Product ID: `premium_weekly`
- Subscription Group: Premium Subscriptions (create if needed)
- Duration: 1 Week
- Price: $1.99 USD

**Product 2: Monthly**
- Type: Auto-Renewable Subscription
- Reference Name: Premium Monthly
- Product ID: `premium_monthly`
- Subscription Group: Premium Subscriptions (same as above)
- Duration: 1 Month
- Price: $4.99 USD

**Product 3: Yearly**
- Type: Auto-Renewable Subscription
- Reference Name: Premium Yearly
- Product ID: `premium_yearly`
- Subscription Group: Premium Subscriptions (same as above)
- Duration: 1 Year
- Price: $19.99 USD

---

## Step 2: Check Product Status

For each product, check the status:
- ✅ **"Ready to Submit"** or **"Approved"** = Good!
- ❌ **"Missing Metadata"** = Need to add description/screenshot
- ❌ **"Rejected"** = Need to fix and resubmit

---

## Step 3: Paid Applications Agreement

This is CRITICAL - without this, products won't work!

1. Go to top menu: **"Agreements, Tax, and Banking"**
2. Look for **"Paid Applications"** agreement
3. Status should be: **"Active"**

### If NOT Active:
1. Click **"Request"** or **"Set Up"**
2. Fill in:
   - Contact Information
   - Bank Account Information
   - Tax Information
3. Submit and wait for Apple approval (can take 24-48 hours)

---

## Step 4: Get App Store Connect Shared Secret

1. In your app, go to **"App Information"** (under General)
2. Scroll to **"App-Specific Shared Secret"**
3. Click **"Generate"** (or "View" if already exists)
4. Copy the secret key
5. Add it to RevenueCat:
   - Go to RevenueCat Dashboard
   - Project Settings → Apps → Your iOS App
   - Paste the Shared Secret

---

## Step 5: Re-enable iOS API Key

Once products are approved and Paid Applications Agreement is active:

1. Open: `src/utils/PurchaseManager.js`
2. Change line 11 from:
   ```javascript
   apple: '', // iOS not configured
   ```
   To:
   ```javascript
   apple: 'appl_GidmNgibMGrbuhmiJwrzLeJLEZM',
   ```
3. Save the file
4. Restart your app

---

## Step 6: Test

1. Wait 5 minutes for RevenueCat cache to clear
2. Restart your app
3. Navigate to Premium screen
4. Should see 3 pricing options
5. Click one to test purchase

---

## Troubleshooting

### "No offerings available"
- Wait 5 more minutes for cache
- Check offering is set as "Current" in RevenueCat
- Restart app

### "Products not found"
- Products not approved yet (wait 24-48 hours)
- Paid Applications Agreement not signed
- Wrong bundle ID in RevenueCat

### "Cannot connect to iTunes Store"
- Using production build instead of TestFlight
- Not signed in with sandbox account
- Network issues

---

## Timeline

- **Product creation**: 10-15 minutes
- **Apple approval**: 24-48 hours
- **Paid Applications setup**: 1-2 days (if not done)
- **Testing**: 5-10 minutes (after approval)

---

## For Now: Test on Android

While waiting for iOS approval:
- ✅ Android is fully configured and working
- ✅ Test premium purchases on Android device
- ✅ Verify all features work correctly

Once iOS is approved, it will work identically to Android!

---

## Current Bundle ID
- iOS: `com.rayn100.impostor`
- Android: `com.rayn100.impostor`
- ✅ Both match (correct!)

---

## RevenueCat Configuration
- ✅ Offering: `default` (set as Current)
- ✅ Packages: `$rc_weekly`, `$rc_monthly`, `$rc_annual`
- ✅ Entitlement: `premium`
- ✅ Products linked to both App Store and Google Play

---

**Next Step**: Once the page loads, check if the 3 products exist in the In-App Purchases section!
