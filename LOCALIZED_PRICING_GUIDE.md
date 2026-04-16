# Localized Pricing with RevenueCat - Complete Guide

## How It Works

### The System Flow

```
1. App Store Connect/Play Console
   ↓ (You set base price in USD)
   
2. Apple/Google Auto-Conversion
   ↓ (Converts to all currencies automatically)
   
3. RevenueCat SDK
   ↓ (Fetches localized prices via StoreKit/Billing API)
   
4. Your App
   ↓ (Displays user's local currency)
   
5. User Sees
   → ₹50 in India
   → $1.99 in USA
   → €1.99 in Europe
   → ¥200 in Japan
```

---

## Setting Regional Prices in App Store Connect

### Method 1: Automatic Conversion (Recommended)

Apple automatically converts your base USD price to all currencies:

1. Go to App Store Connect → Your App → Subscriptions
2. Click on a subscription (e.g., "Premium Weekly")
3. Click "Subscription Prices"
4. Click "+ Add Subscription Price"
5. Select **"United States"** as base territory
6. Enter **$1.99**
7. Click "Next"

**Apple automatically converts to:**
- India: ₹149 (or whatever Apple's conversion rate is)
- UK: £1.99
- Europe: €1.99
- Japan: ¥300
- etc.

### Method 2: Manual Regional Pricing

If you want custom prices per region (like ₹50 in India instead of ₹149):

1. In "Subscription Prices", click "+ Add Subscription Price"
2. Select **"India"** as territory
3. Choose **"₹50"** from the price tier dropdown
4. Click "Add"
5. Repeat for other regions

**Example Custom Pricing:**
- USA: $1.99
- India: ₹50 (cheaper than auto-conversion)
- UK: £1.49
- Europe: €1.79

---

## How RevenueCat Communicates with Apple/Google

### The Technical Flow

```javascript
// 1. Your app requests offerings
const offerings = await Purchases.getOfferings();

// 2. RevenueCat calls Apple StoreKit API
// (Behind the scenes: SKProductsRequest)

// 3. Apple returns product info with localized price
{
  productIdentifier: "ios_premium_weekly",
  price: 50.00,              // Numeric value
  priceString: "₹50",        // Formatted with currency symbol
  currencyCode: "INR",       // ISO currency code
  localizedTitle: "Premium Weekly",
  localizedDescription: "..."
}

// 4. Your app displays the priceString
<Text>{package.product.priceString}</Text>
// User sees: "₹50" (in India) or "$1.99" (in USA)
```

### What RevenueCat Does

1. **Fetches product info** from Apple/Google when app starts
2. **Caches pricing** for fast display
3. **Provides localized strings** ready to display
4. **Handles currency formatting** automatically

### What You DON'T Need to Do

- ❌ Currency conversion
- ❌ Exchange rate APIs
- ❌ Detecting user's country
- ❌ Formatting currency symbols
- ❌ Handling different number formats

**It's all automatic!**

---

## Implementation in Your App

### Current Implementation (After Update)

```javascript
// 1. Fetch packages with localized prices
const fetchPackages = async () => {
    const offerings = await Purchases.getOfferings();
    if (offerings.current) {
        setPackages({
            weekly: offerings.current.availablePackages.find(
                pkg => pkg.identifier === '$rc_weekly'
            ),
            monthly: offerings.current.availablePackages.find(
                pkg => pkg.identifier === '$rc_monthly'
            ),
            annual: offerings.current.availablePackages.find(
                pkg => pkg.identifier === '$rc_annual'
            ),
        });
    }
};

// 2. Display localized price
<PricingCard
    price={packages?.weekly?.product?.priceString || "Loading..."}
    // priceString is already formatted: "₹50", "$1.99", "€1.99", etc.
    localizedPrice={true}
    // ...
/>
```

### What the User Sees

**User in India:**
```
WEEKLY
₹50
/ WEEK
```

**User in USA:**
```
WEEKLY
$1.99
/ WEEK
```

**User in Europe:**
```
WEEKLY
€1,99
/ WEEK
```

**User in Japan:**
```
WEEKLY
¥200
/ WEEK
```

---

## Setting Up Regional Pricing

### Step 1: Configure Base Prices in App Store Connect

1. Go to your subscription
2. Click "Subscription Prices"
3. Click "+ Add Subscription Price"

**For Automatic Conversion:**
- Territory: United States
- Price: $1.99
- Apple converts to all other currencies

**For Custom Regional Pricing:**
- Add separate price for each region:
  - India: ₹50
  - USA: $1.99
  - UK: £1.49
  - Europe: €1.79

### Step 2: Configure in Google Play Console (Android)

1. Go to Play Console → Your App → Monetization → Subscriptions
2. Click on subscription
3. Click "Pricing"
4. Set base price in USD: $1.99
5. Google auto-converts to all currencies

**For Custom Pricing:**
- Click "Add country-specific pricing"
- Select India
- Enter ₹50
- Repeat for other countries

### Step 3: RevenueCat Syncs Automatically

RevenueCat automatically fetches the prices you set in App Store Connect and Play Console. No configuration needed!

---

## How Users See Their Currency

### Automatic Detection

1. **Device locale** determines currency
   - iPhone set to India → Shows ₹
   - iPhone set to USA → Shows $

2. **App Store account region** also matters
   - Indian App Store account → Indian prices
   - US App Store account → US prices

3. **RevenueCat provides the right price** based on:
   - User's App Store/Play Store region
   - Device locale settings
   - Account country

### Example Scenarios

**Scenario 1: Indian user with Indian Apple ID**
- Device: iPhone in India
- Apple ID: Indian account
- Sees: ₹50

**Scenario 2: American traveling in India**
- Device: iPhone in India (temporarily)
- Apple ID: US account
- Sees: $1.99 (US prices follow the account)

**Scenario 3: Indian with US Apple ID**
- Device: iPhone in India
- Apple ID: US account (changed region)
- Sees: $1.99 (account region takes precedence)

---

## Price Tiers and Conversion

### Apple's Price Tiers

Apple uses predefined price tiers that automatically convert:

**Tier 2 ($1.99 USD) converts to:**
- India: ₹149
- UK: £1.99
- Europe: €1.99
- Japan: ¥300
- Australia: A$2.99
- Canada: C$2.79

### Custom Pricing Example

If you want ₹50 in India instead of ₹149:

1. Set USA price: $1.99 (Tier 2)
2. Add custom India price: ₹50 (Tier 1 equivalent)
3. Result:
   - US users pay $1.99
   - Indian users pay ₹50
   - Other countries get auto-converted from $1.99

---

## Testing Regional Pricing

### Method 1: Change Device Region

1. iPhone Settings → General → Language & Region
2. Change "Region" to India
3. Restart your app
4. Prices should show in ₹

### Method 2: Use Different Apple ID

1. Create sandbox account with Indian region
2. Sign out of current Apple ID
3. Sign in with Indian sandbox account
4. Prices show in ₹

### Method 3: VPN (Doesn't Work!)

❌ Using VPN doesn't change pricing
✅ Pricing is based on Apple ID region, not IP address

---

## Common Questions

### Q: Do I need to do currency conversion in my code?
**A:** No! RevenueCat provides `priceString` already formatted with the correct currency symbol.

### Q: How does RevenueCat know the user's currency?
**A:** RevenueCat asks Apple/Google StoreKit API, which knows based on the user's account region.

### Q: Can I show prices in multiple currencies?
**A:** No, users only see their own currency. Apple/Google enforce this.

### Q: What if I want to charge less in India?
**A:** Set custom regional pricing in App Store Connect (see "Method 2" above).

### Q: Do I need to update my app when prices change?
**A:** No! Prices are fetched from Apple/Google servers, not hardcoded in your app.

### Q: What happens if RevenueCat can't fetch prices?
**A:** The fallback prices you set (e.g., "1.99") will show with a $ symbol.

---

## Implementation Checklist

### ✅ What You've Done (After This Update)

- [x] Fetch packages with `Purchases.getOfferings()`
- [x] Store packages in state
- [x] Display `product.priceString` (includes currency symbol)
- [x] Handle loading state with fallback prices
- [x] Support all currencies automatically

### ⏳ What You Need to Do

- [ ] Set regional prices in App Store Connect (if you want custom pricing)
- [ ] Set regional prices in Google Play Console (if you want custom pricing)
- [ ] Test with different device regions
- [ ] Test with sandbox accounts from different countries

---

## Example: Setting ₹50 for India

### In App Store Connect:

1. Go to subscription → Subscription Prices
2. Click "+ Add Subscription Price"
3. Territory: **India**
4. Price: Select **₹50** from dropdown (or closest tier)
5. Click "Add"
6. Save

### In Google Play Console:

1. Go to subscription → Pricing
2. Click "Add country-specific pricing"
3. Country: **India**
4. Price: **₹50**
5. Save

### In Your App:

No code changes needed! RevenueCat automatically fetches ₹50 for Indian users.

```javascript
// Indian user sees:
packages.weekly.product.priceString // "₹50"

// US user sees:
packages.weekly.product.priceString // "$1.99"
```

---

## Summary

### How It All Connects

1. **You set prices** in App Store Connect/Play Console
2. **Apple/Google stores** the prices for each region
3. **RevenueCat SDK** fetches prices when app starts
4. **Your app displays** `product.priceString`
5. **User sees** their local currency automatically

### No Manual Work Needed

- ✅ Currency symbols added automatically
- ✅ Number formatting handled (1.99 vs 1,99)
- ✅ Exchange rates managed by Apple/Google
- ✅ Regional pricing enforced by stores
- ✅ Updates happen server-side (no app update needed)

---

## Next Steps

1. **Set your base prices** in App Store Connect ($1.99, $4.99, $19.99)
2. **Optionally add custom regional pricing** (₹50 for India, etc.)
3. **Test with different regions** to verify pricing displays correctly
4. **Deploy and forget** - it all works automatically!

---

**Your app now supports localized pricing in 175+ countries with zero manual currency conversion!** 🎉
