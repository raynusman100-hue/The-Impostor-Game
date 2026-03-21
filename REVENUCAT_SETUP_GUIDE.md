# RevenueCat Setup Guide - Step by Step

## Current Status
- ✅ Code is fully integrated
- ✅ SDK is initialized with correct API keys
- ❌ **Products NOT configured in RevenueCat dashboard**
- ❌ **This is why purchases show "processing" but fail**

---

## Prerequisites

Before starting, you need:
1. RevenueCat account (sign up at https://app.revenuecat.com)
2. Google Play Console access
3. App Store Connect access (for iOS later)
4. Your app package name: `com.rayn100.impostergame`

---

## Part 1: Google Play Console Setup (Android)

### Step 1: Create Subscription Products in Google Play Console

1. Go to Google Play Console: https://play.google.com/console
2. Select your app "Play Games Sidekick"
3. Navigate to: **Monetize → Subscriptions**
4. Click **Create subscription**

#### Create 3 Subscriptions:

**Subscription 1: Weekly Premium**
- Product ID: `premium_weekly`
- Name: `Premium Weekly`
- Description: `Premium access for 1 week - No ads, 12 premium categories, custom avatars`
- Billing period: `1 week`
- Price: `$1.99 USD`
- Free trial: None (optional: add 3-day trial)
- Grace period: 3 days (recommended)
- Click **Save**

**Subscription 2: Monthly Premium**
- Product ID: `premium_monthly`
- Name: `Premium Monthly`
- Description: `Premium access for 1 month - No ads, 12 premium categories, custom avatars`
- Billing period: `1 month`
- Price: `$4.99 USD`
- Free trial: None (optional: add 7-day trial)
- Grace period: 3 days (recommended)
- Click **Save**

**Subscription 3: Yearly Premium (Best Value)**
- Product ID: `premium_yearly`
- Name: `Premium Yearly`
- Description: `Premium access for 1 year - No ads, 12 premium categories, custom avatars - Best Value!`
- Billing period: `1 year`
- Price: `$19.99 USD`
- Free trial: None (optional: add 7-day trial)
- Grace period: 3 days (recommended)
- Click **Save**

### Step 2: Activate Subscriptions

1. After creating each subscription, click **Activate**
2. Wait for Google to process (can take a few minutes)
3. Verify all 3 subscriptions show as "Active"

---

## Part 2: RevenueCat Dashboard Setup

### Step 1: Log into RevenueCat

1. Go to: https://app.revenuecat.com
2. Log in with your account
3. Select your project (or create one if needed)

### Step 2: Add Google Play Store Integration

1. In RevenueCat dashboard, go to: **Project Settings → Integrations**
2. Find **Google Play** and click **Connect**
3. You'll need to provide:
   - **Service Account JSON**: Download from Google Play Console
     - Go to Play Console → Setup → API access
     - Create or use existing service account
     - Download JSON key file
     - Upload to RevenueCat
4. Click **Save**

### Step 3: Create Entitlement

1. In RevenueCat, go to: **Entitlements**
2. Click **+ New Entitlement**
3. Enter:
   - Identifier: `premium` (MUST be exactly this - your code uses this)
   - Display name: `Premium Access`
   - Description: `Full premium features`
4. Click **Save**

### Step 4: Add Products to RevenueCat

1. Go to: **Products**
2. Click **+ New**
3. For each subscription, enter:

**Product 1: Weekly**
- Store: `Google Play`
- Product identifier: `premium_weekly` (must match Google Play Console)
- Type: `Subscription`
- Click **Save**

**Product 2: Monthly**
- Store: `Google Play`
- Product identifier: `premium_monthly`
- Type: `Subscription`
- Click **Save**

**Product 3: Yearly**
- Store: `Google Play`
- Product identifier: `premium_yearly`
- Type: `Subscription`
- Click **Save**

### Step 5: Attach Products to Entitlement

1. Go back to: **Entitlements**
2. Click on your `premium` entitlement
3. Click **Attach Products**
4. Select all 3 products:
   - `premium_weekly`
   - `premium_monthly`
   - `premium_yearly`
5. Click **Save**

### Step 6: Create Offering

1. Go to: **Offerings**
2. Click **+ New Offering**
3. Enter:
   - Identifier: `default` (recommended)
   - Display name: `Default Offering`
   - Description: `Main premium offering`
4. Click **Save**

### Step 7: Add Packages to Offering

1. Click on your `default` offering
2. Click **+ Add Package**
3. Create 3 packages:

**Package 1: Weekly**
- Package identifier: `weekly`
- Product: Select `premium_weekly`
- Click **Save**

**Package 2: Monthly**
- Package identifier: `monthly`
- Product: Select `premium_monthly`
- Click **Save**

**Package 3: Yearly**
- Package identifier: `yearly`
- Product: Select `premium_yearly`
- Click **Save**

### Step 8: Set as Current Offering

1. In the Offerings list, find your `default` offering
2. Click the **⋮** menu
3. Select **Set as Current**
4. Confirm

---

## Part 3: Testing Setup

### Step 1: Add Test Users in Google Play Console

1. Go to Google Play Console
2. Navigate to: **Setup → License testing**
3. Add test email addresses (Gmail accounts)
4. These users can test subscriptions without being charged

### Step 2: Test in RevenueCat Sandbox

1. In RevenueCat, go to: **Customer Lists**
2. You can view test purchases here
3. Use internal testing track to test purchases

---

## Part 4: Verification Checklist

Before testing, verify:

### In Google Play Console:
- [ ] 3 subscription products created (`premium_weekly`, `premium_monthly`, `premium_yearly`)
- [ ] All subscriptions are **Active**
- [ ] Prices are set correctly ($1.99, $4.99, $19.99)
- [ ] Test users added to license testing

### In RevenueCat Dashboard:
- [ ] Google Play integration connected
- [ ] Entitlement `premium` created
- [ ] 3 products added and linked to Google Play
- [ ] All 3 products attached to `premium` entitlement
- [ ] Offering `default` created with 3 packages
- [ ] Offering set as **Current**

### In Your App:
- [ ] RevenueCat SDK initialized (already done ✓)
- [ ] API keys correct (already done ✓)
- [ ] Entitlement ID is `premium` (already done ✓)

---

## Part 5: Testing the Purchase Flow

### Step 1: Build and Install

1. Wait for your production AAB build to complete
2. Upload to Play Console internal testing
3. Download on your test device

### Step 2: Test Purchase

1. Open the app
2. Navigate to Premium screen
3. Click on a pricing plan
4. Should see Google Play purchase dialog ✓
5. Complete purchase with test account
6. Should see success message ✓
7. Premium features should unlock ✓

### Step 3: Verify in RevenueCat

1. Go to RevenueCat dashboard
2. Navigate to: **Customer Lists**
3. Search for your test user email
4. Should see active `premium` entitlement ✓

---

## Troubleshooting

### "No offerings available" error:
- Check that offering is set as "Current" in RevenueCat
- Verify products are attached to entitlement
- Wait 5 minutes for RevenueCat cache to update
- Try restarting the app

### Purchase dialog doesn't appear:
- Verify product IDs match exactly between Google Play and RevenueCat
- Check that subscriptions are "Active" in Google Play Console
- Ensure test user is added to license testing

### Purchase completes but premium doesn't unlock:
- Check entitlement ID is exactly `premium` (case-sensitive)
- Verify products are attached to the entitlement
- Check RevenueCat dashboard for the purchase
- Try calling `PurchaseManager.checkProStatus()` manually

### "Item not available" error:
- Subscriptions need to be activated in Google Play Console
- Can take up to 24 hours for new products to propagate
- Try using internal testing track instead of production

---

## Important Notes

1. **Product IDs must match exactly** between Google Play Console and RevenueCat
2. **Entitlement ID must be `premium`** - your code depends on this
3. **Set offering as "Current"** - otherwise SDK won't find it
4. **Test with internal testing** - don't use production until verified
5. **Grace periods recommended** - gives users time if payment fails

---

## After Setup is Complete

Once everything is configured:
1. Purchases will work immediately
2. No code changes needed
3. RevenueCat handles all subscription management
4. You can monitor purchases in RevenueCat dashboard

---

## Timeline

- **Google Play Console setup**: 15-30 minutes
- **RevenueCat setup**: 15-20 minutes
- **Product activation**: Up to 24 hours (usually instant)
- **Testing**: 10-15 minutes

**Total**: ~1 hour (plus waiting for product activation)

---

## Support

If you get stuck:
- RevenueCat docs: https://docs.revenuecat.com
- RevenueCat support: support@revenuecat.com
- Google Play support: https://support.google.com/googleplay/android-developer

---

**Your API Keys (already in code):**
- Android: `goog_WeLuvQfgjZEppbpIoqiqCzciCqq`
- iOS: `appl_GidmNgibMGrbuhmiJwrzLeJLEZM`

**Your Package Name:**
- `com.rayn100.impostergame`

**Required Entitlement ID:**
- `premium` (exactly this, case-sensitive)

---

Once you complete these steps, purchases will work and you'll be production-ready! 🚀
