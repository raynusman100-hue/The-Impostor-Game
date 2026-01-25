# Premium Activation System Briefing

## Overview
The application uses a hybrid system to determine premium status, combining **RevenueCat** for real-money purchases and a **Local/Hardcoded** fallback system for developers and offline access.

The core logic is split between two files:
1.  **`src/utils/PremiumManager.js`**: High-level "Gatekeeper". Determines if a user has access to features/content.
2.  **`src/utils/PurchaseManager.js`**: Low-level "Connector". Directly interacts with the RevenueCat SDK (`react-native-purchases`).

---

## 1. Purchase Verification Flow (`PremiumManager.js`)

When the app needs to know if a user is Premium (e.g., to unlock categories or hide ads), it calls `checkPremiumStatus(userEmail, userId)`. The verification happens in this priority order:

1.  **Hardcoded Developer Check**:
    *   Checks if `userEmail` exists in the `PREMIUM_EMAILS` array (e.g., `zayanusman36@gmail.com`).
    *   **Result**: If found, immediately returns `true` (Free Premium for devs).

2.  **RevenueCat Validation (The Real Check)**:
    *   Calls `PurchaseManager.checkProStatus()`.
    *   This checks the RevenueCat servers for an active Entitlement.
    *   **Result**: If active, returns `true`, caches the result locally, and notifies listeners.

3.  **Offline/Cache Fallback**:
    *   If the network fails or RevenueCat is unreachable, it checks `AsyncStorage` for the key `user_premium_${userId}`.
    *   **Result**: Returns the cached value if available.

---

## 2. RevenueCat Integration (`PurchaseManager.js`)

This file handles the actual transaction logic. The new developer needs to focus here.

### Critical Configurations Required
The current file contains **placeholder API keys**. You must replace them with active keys from the RevenueCat dashboard.

```javascript
// src/utils/PurchaseManager.js
const API_KEYS = {
    apple: 'REPLACE_WITH_YOUR_RC_APPLE_KEY',  // <-- ACTION REQUIRED
    google: 'REPLACE_WITH_YOUR_RC_GOOGLE_KEY', // <-- ACTION REQUIRED
};
```

### Entitlement & Offering Structure
The code assumes specific configuration names in the RevenueCat Dashboard. **You must match these exactly** or update the code:

*   **Entitlement Identifier**: `'pro_version'`
    *   *Where is it used?* `PurchaseManager.checkProStatus()` checks `customerInfo.entitlements.active['pro_version']`.
*   **Offering**: The code uses the **Current Offering**.
    *   *Logic*: It fetches `Purchases.getOfferings()` and attempts to purchase the **first available package** in `offerings.current`.
    *   *Requirement*: Ensure you have a "Default" offering configured in RevenueCat with at least one package (e.g., "Lifetime Unlock" or "Monthly Sub").

### Key Methods to Maintain

*   **`initialize(userId)`**: Identifies the user in RevenueCat using their Firebase UID. This allows sharing purchases across devices if they log in with the same account.
*   **`purchaseRemoveAds()`**:
    *   Fetches current offerings.
    *   Buys the first package.
    *   Updates local "Pro" status upon success.
*   **`restorePurchases()`**: Standard "Restore" functionality for users reinstalling the app.

---

## 3. Action Items for Payment Integration

1.  **RevenueCat Setup**:
    *   Create a Project in RevenueCat.
    *   Connect to Apple App Store Connect and Google Play Console.
    *   Create an Entitlement named **`pro_version`**.
    *   Create an Offering (set as Default) with your products.
    *   Get public API keys for iOS and Android.

2.  **Code Updates**:
    *   Update `src/utils/PurchaseManager.js` with the real API keys.
    *   Verify that `purchaseRemoveAds` pulls the correct package if you add multiple options (e.g., Monthly vs Lifetime). Currently, it blindly buys `availablePackages[0]`.

3.  **Firebase Settings (Optional)**:
    *   `PremiumManager.js` has commented-out code to sync premium status to Firebase Realtime Database (`premiumUsers/${userId}`).
    *   Uncomment and configure this if you want a server-side "Source of Truth" independent of RevenueCat, or for web usage.

## 4. UI Triggers
*   **Premium Screen**: Likely triggered when a user clicks a locked category or "Remove Ads" button.
*   **Flow**: User clicks Buy -> `PurchaseManager.purchaseRemoveAds()` -> RevenueCat processes payment -> `PurchaseManager` updates status -> `PremiumManager` detects change -> UI unlocks.
