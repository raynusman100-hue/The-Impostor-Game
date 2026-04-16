# iOS Premium Setup - Summary

## What We Did Today (April 10, 2026)

### Problem
- iOS users getting "Purchase Failed" error when clicking premium plans
- Root cause: Old Product IDs (`premium_weekly`, `premium_monthly`, `premium_yearly`) were permanently blocked by Apple after deletion

### Solution
Created separate iOS Product IDs while keeping Android ones unchanged

---

## ✅ Completed Steps

### 1. App Store Connect - Subscriptions Created
- **Subscription Group**: "Premium Subscriptions"
- **3 Subscriptions**:
  - `ios_premium_weekly` - $1.99/week
  - `ios_premium_monthly` - $4.99/month
  - `ios_premium_yearly` - $19.99/year
- **Status**: "Missing Metadata" (normal, can test in sandbox)

### 2. RevenueCat - Products Configured
- **iOS Products Created**:
  - Weekly subscription (`ios_premium_weekly`)
  - Monthly subscription (`ios_premium_monthly`)
  - Yearly subscription (`ios_premium_yearly`)

- **Android Products** (unchanged):
  - Weekly (`premium_weekly:weekly-base`)
  - Monthly (`premium_monthly:monthly-base`)
  - Yearly (`premium_yearly:yearly-base`)

### 3. RevenueCat - Entitlement
- All 6 products (3 iOS + 3 Android) attached to "premium" entitlement

### 4. RevenueCat - Offering
- **Offering**: "default" (set as Current)
- **Packages**:
  - `$rc_weekly` → Android: premium_weekly + iOS: ios_premium_weekly
  - `$rc_monthly` → Android: premium_monthly + iOS: ios_premium_monthly
  - `$rc_annual` → Android: premium_yearly + iOS: ios_premium_yearly

### 5. RevenueCat - App Store Connect Shared Secret
- ✅ Updated with new shared secret from current app
- Old secret was from deleted app (causing the error)

### 6. Code
- ✅ iOS API key already enabled in `src/utils/PurchaseManager.js`
- No rebuild needed!

---

## Current Status

### What's Working
- ✅ App Store Connect: Products created
- ✅ RevenueCat: Products configured
- ✅ RevenueCat: Entitlement attached
- ✅ RevenueCat: Offering configured
- ✅ RevenueCat: Shared Secret updated
- ✅ Code: iOS API key enabled

### What's Pending
- ⏳ **Waiting for Apple to sync products** (2-24 hours typical)
- ⏳ **Waiting for RevenueCat cache to clear** (5-10 minutes)

---

## Testing Instructions

### When to Test
- **Minimum wait**: 10 minutes after updating Shared Secret
- **If still failing**: Wait 2-4 hours for Apple product sync
- **Maximum wait**: 24 hours

### How to Test

1. **Force close app completely**
2. **Reopen app**
3. **Navigate to Premium screen**
4. **Click a pricing plan**

### Expected Results

**Success:**
- Apple payment sheet appears
- Shows correct price
- Prompts for Apple ID

**Still failing:**
- Same error = Apple hasn't synced products yet (wait longer)
- Different error = Let me know what it says

---

## Sandbox Testing Setup

### Create Sandbox Account
1. App Store Connect → Users and Access → Sandbox Testers
2. Click "+" to add tester
3. Fill in:
   - Email: Any fake email (doesn't need to exist)
   - Password: Make one up
   - Country: United States
4. Save the credentials

### Use Sandbox Account
1. iOS device → Settings → App Store → Sign Out
2. Open your app → Try to purchase
3. When prompted, sign in with sandbox account
4. Complete purchase (won't be charged)

---

## Product ID Reference

### Android (Google Play)
- Weekly: `premium_weekly`
- Monthly: `premium_monthly`
- Yearly: `premium_yearly`

### iOS (App Store)
- Weekly: `ios_premium_weekly`
- Monthly: `ios_premium_monthly`
- Yearly: `ios_premium_yearly`

### Code (Platform-agnostic)
- Weekly: `$rc_weekly`
- Monthly: `$rc_monthly`
- Yearly: `$rc_annual`

**How it works**: RevenueCat automatically maps the package IDs to the correct platform Product IDs.

---

## Troubleshooting

### "No offerings available"
- Wait 5-10 minutes for RevenueCat cache
- Force close and reopen app
- Check offering is set as "Current" in RevenueCat

### "Products could not be fetched"
- Wait 2-24 hours for Apple to sync new products
- Verify Shared Secret is correct in RevenueCat
- Check Product IDs match exactly in App Store Connect and RevenueCat

### "Cannot connect to iTunes Store"
- Using real Apple ID instead of sandbox account
- Sign out of real Apple ID in Settings → App Store
- Sign in with sandbox account when prompted in app

---

## Next Steps

1. ⏰ Wait 10 minutes minimum
2. 🔄 Force close and reopen app
3. 🧪 Test purchase flow
4. ✅ If working: Create sandbox account and test full flow
5. ❌ If still failing: Wait 2-4 hours and try again

---

## Configuration Details

**Bundle ID**: `com.rayn100.impostor`

**RevenueCat API Keys**:
- iOS: `appl_GidmNgibMGrbuhmiJwrzLeJLEZM`
- Android: `goog_WeLuvQfgjZEppbpIoqiqCzciCqq`

**Entitlement ID**: `premium`

**Offering ID**: `default`

---

## Timeline

- **Setup completed**: April 10, 2026 ~2:30 AM
- **Shared Secret updated**: April 10, 2026 ~2:30 AM
- **Expected working**: April 10, 2026 ~2:40 AM (if products synced)
- **Maximum wait**: April 11, 2026 ~2:30 AM (24 hours)

---

## Support

If issues persist after 24 hours:
- Check RevenueCat Dashboard → Products → Status
- Check RevenueCat Dashboard → Customer Lists for test purchases
- Contact RevenueCat support with Project ID
- Check Apple Developer Forums for App Store Connect issues

---

**Status**: Waiting for Apple product sync and RevenueCat cache clear
