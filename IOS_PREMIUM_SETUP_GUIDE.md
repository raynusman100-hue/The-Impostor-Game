# iOS Premium Payment Integration Guide

Complete step-by-step guide to set up in-app purchases for iOS.

## Overview

You need to:
1. Create App Store Connect account (if not done)
2. Create app in App Store Connect
3. Set up in-app purchase products
4. Configure RevenueCat for iOS
5. Add iOS product IDs to your code
6. Test with sandbox accounts

---

## STEP 1: App Store Connect Setup

### 1.1 Create/Access App Store Connect Account
- Go to: https://appstoreconnect.apple.com
- Sign in with your Apple Developer account
- If you don't have Apple Developer account:
  - Go to: https://developer.apple.com/programs/
  - Enroll ($99/year)
  - Wait for approval (1-2 days)

### 1.2 Create Your App
1. Click "My Apps" → "+" → "New App"
2. Fill in:
   - **Platform:** iOS
   - **Name:** Impostor Game (or your app name)
   - **Primary Language:** English
   - **Bundle ID:** Select from dropdown (must match your app)
     - If not listed, create in Apple Developer Portal first
   - **SKU:** `impostor-game-001` (unique identifier)
   - **User Access:** Full Access

3. Click "Create"

---

## STEP 2: Create In-App Purchase Products

### 2.1 Navigate to In-App Purchases
1. In App Store Connect, select your app
2. Go to "Features" tab
3. Click "In-App Purchases"
4. Click "+" to create new

### 2.2 Create Monthly Subscription
1. **Type:** Auto-Renewable Subscription
2. Click "Create"

**Reference Name:** Premium Monthly
**Product ID:** `premium_monthly` (IMPORTANT: Must match Android)
**Subscription Group:** Create new → "Premium Subscriptions"

**Subscription Duration:** 1 Month

**Price:**
- Select your price tier (e.g., $4.99 USD)
- Apple will auto-convert to other currencies

**Localization (English):**
- **Display Name:** Premium Monthly
- **Description:** Unlock all premium features including exclusive categories, custom avatars, and ad-free experience. Billed monthly.

**Review Information:**
- **Screenshot:** (Upload later during app review)
- **Review Notes:** Premium subscription unlocks all game content

Click "Save"

### 2.3 Create Yearly Subscription
1. Click "+" again
2. **Type:** Auto-Renewable Subscription
3. Click "Create"

**Reference Name:** Premium Yearly
**Product ID:** `premium_yearly` (IMPORTANT: Must match Android)
**Subscription Group:** Select "Premium Subscriptions" (same as monthly)

**Subscription Duration:** 1 Year

**Price:**
- Select your price tier (e.g., $39.99 USD)
- Should be ~30% discount vs monthly

**Localization (English):**
- **Display Name:** Premium Yearly
- **Description:** Unlock all premium features including exclusive categories, custom avatars, and ad-free experience. Billed yearly. Best value!

**Review Information:**
- **Screenshot:** (Upload later during app review)
- **Review Notes:** Premium subscription unlocks all game content

Click "Save"

### 2.4 Submit for Review
- Both products need Apple approval before testing
- Click "Submit for Review" on each product
- Approval takes 24-48 hours
- You can still test in sandbox mode while pending

---

## STEP 3: Configure RevenueCat for iOS

### 3.1 Add iOS App to RevenueCat
1. Go to: https://app.revenuecat.com
2. Select your project
3. Click "Apps" in sidebar
4. Click "Add App" or "+" button
5. Fill in:
   - **Platform:** iOS
   - **App Name:** Impostor Game iOS
   - **Bundle ID:** `com.rayn100.impostergame` (your iOS bundle ID)
   - **App Store Connect Shared Secret:** (Get from next step)

### 3.2 Get App Store Connect Shared Secret
1. Go to App Store Connect
2. Select your app
3. Go to "App Information" (under General)
4. Scroll to "App-Specific Shared Secret"
5. Click "Generate" (or "View" if already exists)
6. Copy the secret key
7. Paste into RevenueCat

### 3.3 Link Products in RevenueCat
1. In RevenueCat, go to "Products"
2. You should see your Android products already:
   - `premium_monthly`
   - `premium_yearly`

3. Click on `premium_monthly`
4. Under "App Store Product ID", add: `premium_monthly`
5. Click "Save"

6. Click on `premium_yearly`
7. Under "App Store Product ID", add: `premium_yearly`
8. Click "Save"

**IMPORTANT:** Use the SAME product IDs as Android for cross-platform compatibility!

### 3.4 Get iOS API Key
1. In RevenueCat, go to "API Keys"
2. Find "Apple App Store" section
3. Copy the **Public API Key** (starts with `appl_`)
4. Save this - you'll need it for the code

---

## STEP 4: Update Your Code

### 4.1 Check Current iOS Configuration
Your code already has RevenueCat integrated. We just need to verify the iOS API key.

**File:** `src/utils/PremiumManager.js`

Current setup should have:
```javascript
const REVENUECAT_API_KEY = Platform.select({
  ios: 'appl_YOUR_IOS_KEY_HERE',
  android: 'goog_YOUR_ANDROID_KEY_HERE',
});
```

### 4.2 Add iOS API Key
Replace `appl_YOUR_IOS_KEY_HERE` with your actual iOS API key from RevenueCat.

### 4.3 Product IDs (Already Correct)
Your code already uses:
- `premium_monthly`
- `premium_yearly`

These match what we created in App Store Connect. ✅

---

## STEP 5: Create Sandbox Test Account

### 5.1 Create Sandbox Tester
1. Go to App Store Connect
2. Click "Users and Access" (top menu)
3. Click "Sandbox Testers" (left sidebar)
4. Click "+" to add tester
5. Fill in:
   - **First Name:** Test
   - **Last Name:** User
   - **Email:** Create a NEW email (e.g., `testuser@yourdomain.com`)
     - Must be unique, never used for Apple ID
     - Can be fake email, doesn't need to exist
   - **Password:** Create strong password
   - **Country:** United States (or your country)
   - **App Store Territory:** Same as country

6. Click "Create"
7. **SAVE THE EMAIL AND PASSWORD** - you'll need them for testing

### 5.2 Important Sandbox Notes
- Sandbox accounts are NOT real Apple IDs
- They only work in TestFlight or development builds
- You won't be charged real money
- Subscriptions renew every 5 minutes (not monthly) for testing

---

## STEP 6: Testing Checklist

### Before Testing:
- [ ] App created in App Store Connect
- [ ] In-app purchases created (`premium_monthly`, `premium_yearly`)
- [ ] Products submitted for review (can test while pending)
- [ ] RevenueCat configured with iOS app
- [ ] App Store Connect Shared Secret added to RevenueCat
- [ ] iOS API key added to code
- [ ] Sandbox test account created
- [ ] iOS build created with EAS

### Testing Steps:
1. Install TestFlight build on iOS device
2. Sign out of real App Store account (Settings → App Store → Sign Out)
3. Open your app
4. Try to purchase premium
5. When prompted, sign in with sandbox account
6. Complete purchase (won't be charged)
7. Verify premium features unlock

---

## STEP 7: Bundle ID Setup (If Not Done)

If your Bundle ID doesn't exist in App Store Connect dropdown:

### 7.1 Create Bundle ID in Developer Portal
1. Go to: https://developer.apple.com/account
2. Click "Certificates, Identifiers & Profiles"
3. Click "Identifiers"
4. Click "+" to add new
5. Select "App IDs" → Continue
6. Fill in:
   - **Description:** Impostor Game
   - **Bundle ID:** Explicit → `com.rayn100.impostergame`
   - **Capabilities:** Check "In-App Purchase"
7. Click "Continue" → "Register"

### 7.2 Update app.json (If Needed)
Your `app.json` should have:
```json
{
  "expo": {
    "ios": {
      "bundleIdentifier": "com.rayn100.impostergame"
    }
  }
}
```

---

## Quick Reference

### Product IDs (Must Match Exactly)
- Monthly: `premium_monthly`
- Yearly: `premium_yearly`

### Bundle ID
- `com.rayn100.impostergame`

### RevenueCat Keys
- Android: `goog_...` (already configured)
- iOS: `appl_...` (add from RevenueCat dashboard)

### Pricing Recommendations
- Monthly: $4.99 USD
- Yearly: $39.99 USD (33% discount)

---

## Common Issues

### "Product not found"
- Products not approved yet (wait 24-48 hours)
- Product IDs don't match exactly
- App not configured in RevenueCat

### "Cannot connect to iTunes Store"
- Not signed in with sandbox account
- Using production build instead of TestFlight
- Network issues

### "This Apple ID has not been set up for sandbox testing"
- Using real Apple ID instead of sandbox account
- Sign out of real account first

---

## Next Steps

1. Complete App Store Connect setup
2. Create in-app purchase products
3. Configure RevenueCat
4. Give me your iOS API key to update the code
5. Build iOS version with EAS
6. Test with sandbox account

Ready to start? Let me know when you've completed each step!
