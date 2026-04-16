# iOS Premium Setup - Complete Step-by-Step Guide

## Overview

This guide will walk you through setting up iOS in-app purchases with separate Product IDs from Android, configuring RevenueCat, and enabling premium features.

**Why separate Product IDs?**
- Apple permanently reserves deleted Product IDs
- Your old `premium_weekly`, `premium_monthly`, `premium_yearly` IDs are blocked forever
- Solution: Use iOS-specific IDs that RevenueCat will map to the same features

---

## Part 1: App Store Connect - Create Subscription Group

### Step 1.1: Navigate to Subscriptions

1. Go to: https://appstoreconnect.apple.com
2. Click **"My Apps"**
3. Select: **"ImpostorGameFilmEdition"** (the one with bundle ID `com.rayn100.impostor`)
4. In the left sidebar, under **"MONETIZATION"**, click **"Subscriptions"**

### Step 1.2: Create Subscription Group

1. You should see a section called **"Subscription Groups"**
2. Click the blue **"Create"** button
3. Fill in:
   - **Reference Name**: `Premium Subscriptions`
   - This is internal only, users won't see it
4. Click **"Create"**

✅ **Checkpoint**: You should now see "Premium Subscriptions" group listed

---

## Part 2: App Store Connect - Create 3 Subscriptions

Now you'll create 3 subscriptions inside the group you just made.

### Step 2.1: Create Weekly Subscription

1. Inside the "Premium Subscriptions" group, click **"+"** or **"Add Subscription"**
2. A dialog will appear (like in your screenshot)

**Fill in the form:**

**Reference Name:**
```
Premium Weekly (iOS)
```
- This is internal only
- Character limit: 64

**Product ID:**
```
ios_premium_weekly
```
- ⚠️ CRITICAL: Must be EXACTLY this (case-sensitive)
- This is permanent and cannot be changed
- Character limit: 100

3. Click **"Create"**

### Step 2.2: Configure Weekly Subscription Details

After clicking Create, you'll see a detailed configuration page:

**Subscription Duration:**
- Select: **"1 Week"**

**Subscription Prices:**
1. Click **"Add Subscription Price"** or **"+"**
2. Select pricing:
   - **Price**: $1.99 USD (Tier 2)
   - Or manually enter $1.99
3. Click **"Next"** or **"Add"**

**Localization (English - U.S.):**
1. Click **"Add Localization"** or **"+"**
2. Select: **"English (U.S.)"**
3. Fill in:
   - **Display Name**: `Premium Weekly`
   - **Description**: 
     ```
     Unlock all premium features including 12 exclusive categories, custom avatar builder, and ad-free experience. Subscription renews weekly.
     ```
4. Click **"Save"**

**Review Information:**
- **Screenshot**: You can add this later (required before submission)
- For now, you can skip this

**Save the subscription:**
- Click **"Save"** button (top right)

✅ **Checkpoint**: Weekly subscription created!

---

### Step 2.3: Create Monthly Subscription

1. Go back to the "Premium Subscriptions" group
2. Click **"+"** or **"Add Subscription"** again

**Fill in the form:**

**Reference Name:**
```
Premium Monthly (iOS)
```

**Product ID:**
```
ios_premium_monthly
```
- ⚠️ CRITICAL: Must be EXACTLY this

3. Click **"Create"**

**Configure Monthly Details:**

**Subscription Duration:**
- Select: **"1 Month"**

**Subscription Prices:**
- **Price**: $4.99 USD (Tier 5)

**Localization (English - U.S.):**
- **Display Name**: `Premium Monthly`
- **Description**: 
  ```
  Unlock all premium features including 12 exclusive categories, custom avatar builder, and ad-free experience. Subscription renews monthly.
  ```

**Save the subscription:**
- Click **"Save"**

✅ **Checkpoint**: Monthly subscription created!

---

### Step 2.4: Create Yearly Subscription

1. Go back to the "Premium Subscriptions" group
2. Click **"+"** or **"Add Subscription"** again

**Fill in the form:**

**Reference Name:**
```
Premium Yearly (iOS)
```

**Product ID:**
```
ios_premium_yearly
```
- ⚠️ CRITICAL: Must be EXACTLY this

3. Click **"Create"**

**Configure Yearly Details:**

**Subscription Duration:**
- Select: **"1 Year"**

**Subscription Prices:**
- **Price**: $19.99 USD (Tier 20)

**Localization (English - U.S.):**
- **Display Name**: `Premium Yearly`
- **Description**: 
  ```
  Unlock all premium features including 12 exclusive categories, custom avatar builder, and ad-free experience. Subscription renews yearly. Best value!
  ```

**Save the subscription:**
- Click **"Save"**

✅ **Checkpoint**: All 3 subscriptions created!

---

## Part 3: App Store Connect - Submit for Review

### Step 3.1: Check Subscription Status

1. Go to your "Premium Subscriptions" group
2. You should see all 3 subscriptions:
   - Premium Weekly (iOS) - `ios_premium_weekly`
   - Premium Monthly (iOS) - `ios_premium_monthly`
   - Premium Yearly (iOS) - `ios_premium_yearly`

3. Check their status:
   - Should show: **"Missing Metadata"** or **"Ready to Submit"**

### Step 3.2: Submit Each Subscription

For each subscription:

1. Click on the subscription
2. Look for **"Submit for Review"** button (usually top right)
3. Click it
4. Confirm submission

**Note**: You can submit them even with "Missing Metadata" - Apple will request screenshots during app review if needed.

✅ **Checkpoint**: Subscriptions submitted! (Approval takes 24-48 hours, but you can test in sandbox immediately)

---

## Part 4: App Store Connect - Paid Applications Agreement

This is CRITICAL - without this, purchases won't work!

### Step 4.1: Navigate to Agreements

1. In App Store Connect, click your name (top right)
2. Select **"Agreements, Tax, and Banking"** from dropdown
3. Or go directly to: https://appstoreconnect.apple.com/agreements

### Step 4.2: Check Paid Applications Status

Look for **"Paid Applications"** agreement:

**If status is "Active":**
- ✅ You're good! Skip to Part 5

**If status is "Request" or "Pending":**
- You need to set this up

### Step 4.3: Set Up Paid Applications (If Needed)

1. Click **"Request"** or **"Set Up"** next to Paid Applications
2. You'll need to provide:

**Contact Information:**
- Legal Entity Name
- Address
- Phone Number
- Email

**Bank Information:**
- Bank Name
- Account Holder Name
- Account Number
- Routing Number (US) or IBAN (International)
- Bank Address

**Tax Information:**
- Tax ID / EIN
- Business Type
- Tax Forms (W-9 for US, W-8 for international)

3. Submit the information
4. Apple will review (can take 24-48 hours)

✅ **Checkpoint**: Paid Applications Agreement active or pending

---

## Part 5: RevenueCat Dashboard - Link iOS Products

### Step 5.1: Log into RevenueCat

1. Go to: https://app.revenuecat.com
2. Log in
3. Select your project: **"Impostor game"**

### Step 5.2: Navigate to Products

1. In the left sidebar, click **"Product catalog"**
2. Click **"Products"**
3. You should see your 3 existing products:
   - Premium Yearly
   - Premium Monthly
   - Premium Weekly

### Step 5.3: Update Premium Weekly Product

1. Click on **"Premium Weekly"** product
2. You should see:
   - **Google Play Product ID**: `premium_weekly` (already set)
   - **App Store Product ID**: (empty or old value)

3. In the **"App Store Product ID"** field, enter:
   ```
   ios_premium_weekly
   ```

4. Click **"Save"** or **"Update"**

✅ **Checkpoint**: Weekly product linked to iOS!

### Step 5.4: Update Premium Monthly Product

1. Click on **"Premium Monthly"** product
2. In the **"App Store Product ID"** field, enter:
   ```
   ios_premium_monthly
   ```

3. Click **"Save"**

✅ **Checkpoint**: Monthly product linked to iOS!

### Step 5.5: Update Premium Yearly Product

1. Click on **"Premium Yearly"** product
2. In the **"App Store Product ID"** field, enter:
   ```
   ios_premium_yearly
   ```

3. Click **"Save"**

✅ **Checkpoint**: Yearly product linked to iOS!

---

## Part 6: RevenueCat Dashboard - Verify Configuration

### Step 6.1: Check Products

Go to **Products** page and verify each product shows:

**Premium Weekly:**
- Store: Google Play
- Product ID: `premium_weekly`
- Store: App Store
- Product ID: `ios_premium_weekly`

**Premium Monthly:**
- Store: Google Play
- Product ID: `premium_monthly`
- Store: App Store
- Product ID: `ios_premium_monthly`

**Premium Yearly:**
- Store: Google Play
- Product ID: `premium_yearly`
- Store: App Store
- Product ID: `ios_premium_yearly`

### Step 6.2: Check Entitlement

1. Go to **"Entitlements"**
2. Click on **"premium"** entitlement
3. Verify all 3 products are attached:
   - Premium Weekly
   - Premium Monthly
   - Premium Yearly

### Step 6.3: Check Offering

1. Go to **"Offerings"**
2. Click on **"default"** offering
3. Verify it has 3 packages:
   - **$rc_weekly** → Premium Weekly
   - **$rc_monthly** → Premium Monthly
   - **$rc_annual** → Premium Yearly

4. Verify offering is set as **"Current"** (should have a badge or indicator)

✅ **Checkpoint**: RevenueCat fully configured!

---

## Part 7: Get App Store Connect Shared Secret

### Step 7.1: Navigate to App Information

1. In App Store Connect, go to your app
2. In left sidebar, under **"General"**, click **"App Information"**

### Step 7.2: Generate Shared Secret

1. Scroll down to **"App-Specific Shared Secret"** section
2. If you see **"Generate"** button:
   - Click it
   - Copy the generated secret key
3. If you see **"View"** or **"Manage"**:
   - Click it
   - Copy the existing secret key

**The secret looks like**: `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6`

### Step 7.3: Add to RevenueCat

1. Go back to RevenueCat Dashboard
2. Click **"Project Settings"** (gear icon)
3. Click **"Apps"** tab
4. Find your iOS app or click **"Add App"** if not added
5. Fill in:
   - **Platform**: iOS
   - **App Name**: Impostor Game iOS
   - **Bundle ID**: `com.rayn100.impostor`
   - **App Store Connect Shared Secret**: (paste the secret you copied)

6. Click **"Save"**

✅ **Checkpoint**: Shared Secret configured!

---

## Part 8: Enable iOS API Key in Code

### Step 8.1: Open PurchaseManager.js

The file is located at: `src/utils/PurchaseManager.js`

### Step 8.2: Update API Keys

Find line 11 (around there) that looks like:

```javascript
const API_KEYS = {
    apple: '', // iOS not configured
    google: 'goog_WeLuvQfgjZEppbpIoqiqCzciCqq',
};
```

Change it to:

```javascript
const API_KEYS = {
    apple: 'appl_GidmNgibMGrbuhmiJwrzLeJLEZM',  // iOS Public SDK Key (Production)
    google: 'goog_WeLuvQfgjZEppbpIoqiqCzciCqq',  // Android Public SDK Key (Production)
};
```

### Step 8.3: Save the File

Save the file. That's it - no other code changes needed!

✅ **Checkpoint**: iOS API key enabled!

---

## Part 9: Testing

### Step 9.1: Create Sandbox Test Account

1. Go to App Store Connect
2. Click your name (top right) → **"Users and Access"**
3. Click **"Sandbox Testers"** in left sidebar
4. Click **"+"** to add tester
5. Fill in:
   - **First Name**: Test
   - **Last Name**: User
   - **Email**: Create a unique email (e.g., `testuser123@yourdomain.com`)
     - Doesn't need to be real
     - Must be unique (never used for Apple ID)
   - **Password**: Create a strong password
   - **Country**: United States
   - **App Store Territory**: United States

6. Click **"Create"**
7. **SAVE THE EMAIL AND PASSWORD** - you'll need them!

### Step 9.2: Build iOS App

1. Make sure your code changes are saved
2. Build iOS app with EAS:
   ```bash
   eas build --platform ios --profile preview
   ```

3. Or use your existing TestFlight build

### Step 9.3: Install on iOS Device

1. Install via TestFlight
2. **Important**: Sign OUT of your real Apple ID:
   - Go to Settings → App Store
   - Tap your name at top
   - Tap **"Sign Out"**

### Step 9.4: Test Purchase Flow

1. Open your app
2. Navigate to Premium screen
3. Click on a pricing plan (Weekly, Monthly, or Yearly)
4. Apple will prompt for Apple ID
5. **Sign in with your SANDBOX account** (the test email you created)
6. Complete the purchase
7. You won't be charged (it's sandbox mode)

### Step 9.5: Verify Premium Unlocked

1. Premium features should unlock immediately
2. Check that:
   - Ads are hidden
   - Premium categories are unlocked
   - Custom avatar builder is accessible
   - Voice chat works (if host)

✅ **Checkpoint**: iOS purchases working!

---

## Part 10: Verify in RevenueCat Dashboard

### Step 10.1: Check Customer

1. Go to RevenueCat Dashboard
2. Click **"Customer Lists"** in sidebar
3. Search for your test email
4. You should see:
   - Active `premium` entitlement
   - Purchase details
   - Subscription status

✅ **Checkpoint**: Purchase tracked in RevenueCat!

---

## Part 11: Production Checklist

Before submitting to App Store:

### App Store Connect:
- [ ] All 3 subscriptions created with iOS Product IDs
- [ ] Subscriptions submitted for review
- [ ] Paid Applications Agreement active
- [ ] App Store Connect Shared Secret generated
- [ ] Subscription screenshots added (required for review)

### RevenueCat:
- [ ] All 3 products have both Google Play and App Store IDs
- [ ] Products attached to `premium` entitlement
- [ ] Offering `default` has 3 packages
- [ ] Offering set as "Current"
- [ ] Shared Secret added to iOS app config

### Code:
- [ ] iOS API key enabled in PurchaseManager.js
- [ ] No code changes needed (RevenueCat handles platform differences)

### Testing:
- [ ] Sandbox account created
- [ ] Tested all 3 subscription tiers
- [ ] Premium features unlock correctly
- [ ] Purchases appear in RevenueCat dashboard

---

## Troubleshooting

### "No offerings available"
**Cause**: RevenueCat cache hasn't updated yet
**Solution**: 
- Wait 5 minutes
- Restart app
- Check offering is set as "Current"

### "Product not found"
**Cause**: Products not approved or Product IDs don't match
**Solution**:
- Check Product IDs are EXACTLY: `ios_premium_weekly`, `ios_premium_monthly`, `ios_premium_yearly`
- Wait for Apple approval (24-48 hours)
- Verify products are in correct app (`com.rayn100.impostor`)

### "Cannot connect to iTunes Store"
**Cause**: Not using sandbox account or wrong build type
**Solution**:
- Sign out of real Apple ID
- Sign in with sandbox account
- Use TestFlight or development build (not production)

### "This Apple ID has not been set up for sandbox testing"
**Cause**: Using real Apple ID instead of sandbox account
**Solution**:
- Sign out completely from Settings → App Store
- Sign in with sandbox test account when prompted in app

### Purchase completes but premium doesn't unlock
**Cause**: Entitlement not configured correctly
**Solution**:
- Check entitlement ID is exactly `premium` (case-sensitive)
- Verify products are attached to entitlement in RevenueCat
- Check RevenueCat dashboard for the purchase
- Try calling `PurchaseManager.checkProStatus()` manually

---

## Summary of Product IDs

### Android (Google Play):
- Weekly: `premium_weekly`
- Monthly: `premium_monthly`
- Yearly: `premium_yearly`

### iOS (App Store):
- Weekly: `ios_premium_weekly`
- Monthly: `ios_premium_monthly`
- Yearly: `ios_premium_yearly`

### RevenueCat Packages (Platform-agnostic):
- Weekly: `$rc_weekly`
- Monthly: `$rc_monthly`
- Yearly: `$rc_annual`

**How it works:**
- Your code uses `$rc_weekly`, `$rc_monthly`, `$rc_annual`
- RevenueCat automatically maps to correct platform Product ID
- Android users get `premium_weekly`, iOS users get `ios_premium_weekly`
- Both unlock the same `premium` entitlement
- No platform-specific code needed!

---

## Timeline

- **App Store Connect setup**: 30-45 minutes
- **RevenueCat configuration**: 15-20 minutes
- **Code update**: 2 minutes
- **Apple product approval**: 24-48 hours
- **Paid Applications setup**: 1-2 days (if not done)
- **Testing**: 10-15 minutes

**Total active time**: ~1 hour
**Total wait time**: 1-2 days (for Apple approval)

---

## Support Resources

- **RevenueCat Docs**: https://docs.revenuecat.com
- **RevenueCat Support**: support@revenuecat.com
- **Apple Developer**: https://developer.apple.com/support
- **App Store Connect**: https://appstoreconnect.apple.com

---

## Current Configuration

**Bundle ID**: `com.rayn100.impostor`

**RevenueCat API Keys**:
- Android: `goog_WeLuvQfgjZEppbpIoqiqCzciCqq`
- iOS: `appl_GidmNgibMGrbuhmiJwrzLeJLEZM`

**Entitlement ID**: `premium` (exactly this, case-sensitive)

**Offering ID**: `default`

---

## Next Steps

1. ✅ Create subscription group in App Store Connect
2. ✅ Create 3 subscriptions with iOS Product IDs
3. ✅ Submit subscriptions for review
4. ✅ Set up Paid Applications Agreement (if needed)
5. ✅ Link iOS Product IDs in RevenueCat
6. ✅ Add Shared Secret to RevenueCat
7. ✅ Enable iOS API key in code
8. ✅ Test with sandbox account
9. ⏳ Wait for Apple approval
10. 🚀 Submit app to App Store!

---

**You're all set! Follow this guide step-by-step and iOS premium will work perfectly!** 🎉
