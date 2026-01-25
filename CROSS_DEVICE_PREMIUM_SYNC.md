# Cross-Device Premium Sync Implementation

## Overview
This system ensures that when a user purchases premium on one device and signs in with their Google account on another device, their premium status is automatically synced and available.

## How It Works

### 1. RevenueCat Integration
RevenueCat is the source of truth for all premium purchases. It handles:
- Purchase processing
- Subscription management
- Cross-device sync
- Receipt validation

### 2. User Identification
When a user signs in with Google:
1. Firebase Authentication provides a unique `userId` (UID)
2. This `userId` is used to identify the user in RevenueCat
3. RevenueCat syncs all purchases associated with that `userId`

### 3. Premium Check Flow

```
User Signs In
     ↓
Firebase Auth (get userId)
     ↓
RevenueCat.loginUser(userId) ← Syncs purchases across devices
     ↓
RevenueCat.checkProStatus() ← Checks active entitlements
     ↓
Cache premium status locally (user-scoped)
     ↓
Premium features unlocked
```

### 4. Multi-Layer Premium Check

The system checks premium status in this order:

1. **RevenueCat** (Primary - Source of Truth)
   - Checks active subscriptions via RevenueCat SDK
   - Automatically syncs across all devices
   - Handles subscription renewals and expirations

2. **Developer List** (Fallback)
   - Hardcoded premium emails for testing/development
   - Located in `PremiumManager.js`

3. **Firebase Database** (Fallback)
   - `/premiumUsers/{userId}` - Premium by user ID
   - `/premiumEmails/{emailKey}` - Premium by email

4. **Local Cache** (Offline Fallback)
   - User-scoped AsyncStorage cache
   - Prevents cross-account contamination
   - Key format: `user_premium_status_{userId}`

## Implementation Details

### PurchaseManager.js
```javascript
// Login user to RevenueCat when they sign in
await PurchaseManager.loginUser(userId);

// Check premium status (synced across devices)
const isPremium = await PurchaseManager.checkProStatus();

// Logout when user signs out
await PurchaseManager.logoutUser();
```

### PremiumManager.js
```javascript
// Check premium with RevenueCat sync
const hasPremium = await checkPremiumStatus(userEmail, userId);

// This automatically:
// 1. Logs user into RevenueCat
// 2. Syncs purchases from all devices
// 3. Checks active entitlements
// 4. Falls back to Firebase/cache if needed
```

### ProfileScreen.js
```javascript
// On sign in - RevenueCat login happens automatically in checkPremiumStatus

// On sign out - Clear everything
await PurchaseManager.logoutUser(); // Logout from RevenueCat
await AsyncStorage.removeItem(`user_premium_status_${userId}`); // Clear cache
```

### AppInitializer.js
```javascript
// On app start with authenticated user
const hasPremium = await checkPremiumStatus(user.email, user.uid);
// This triggers RevenueCat login and sync automatically
```

## User Scenarios

### Scenario 1: Purchase on Device A, Sign in on Device B
1. User purchases premium on Device A
2. Purchase is recorded in RevenueCat under their userId
3. User signs in with same Google account on Device B
4. `checkPremiumStatus()` calls `RevenueCat.loginUser(userId)`
5. RevenueCat syncs purchases and returns active entitlements
6. Premium features are immediately available on Device B

### Scenario 2: Offline Access
1. User has premium and has used the app before
2. User goes offline
3. Premium status is cached locally with user-scoped key
4. Premium features remain available offline
5. When online again, RevenueCat syncs to verify status

### Scenario 3: Subscription Expiration
1. User's subscription expires
2. RevenueCat detects expiration
3. Next time `checkProStatus()` is called, returns false
4. Premium features are locked
5. User is prompted to renew

### Scenario 4: Multiple Accounts
1. User A signs in - premium status cached with `user_premium_status_A`
2. User A signs out - cache cleared
3. User B signs in - premium status cached with `user_premium_status_B`
4. No cross-contamination between accounts

## Security Considerations

### User-Scoped Caching
- All premium status is cached with userId: `user_premium_status_{userId}`
- Prevents one user's premium status from affecting another
- Cache is cleared on sign out

### RevenueCat as Source of Truth
- All purchases are validated server-side by RevenueCat
- Local cache is only used as fallback
- RevenueCat handles receipt validation and fraud prevention

### Firebase Fallback
- Firebase premium flags are secondary
- Used for manual premium grants (testing, support, etc.)
- Can be set independently of RevenueCat

## Testing Checklist

### Basic Flow
- [ ] Purchase premium on Device A
- [ ] Sign in with same account on Device B
- [ ] Verify premium features are available on Device B
- [ ] Sign out on Device B
- [ ] Sign in again - premium should still be available

### Multiple Accounts
- [ ] Sign in with Account A (premium)
- [ ] Verify premium features available
- [ ] Sign out
- [ ] Sign in with Account B (non-premium)
- [ ] Verify premium features NOT available
- [ ] Sign out
- [ ] Sign in with Account A again
- [ ] Verify premium features available again

### Offline Mode
- [ ] Sign in with premium account while online
- [ ] Go offline (airplane mode)
- [ ] Verify premium features still available
- [ ] Go back online
- [ ] Verify premium status syncs correctly

### Subscription Management
- [ ] Purchase subscription
- [ ] Verify premium features unlock
- [ ] Cancel subscription (let it expire)
- [ ] After expiration, verify premium features lock
- [ ] Restore subscription
- [ ] Verify premium features unlock again

## Configuration Required

### RevenueCat Setup
1. Create RevenueCat account
2. Configure products/subscriptions
3. Set up entitlement: `pro_version`
4. Get API keys for iOS and Android
5. Update `PurchaseManager.js` with real API keys:
   ```javascript
   const API_KEYS = {
       apple: 'appl_YOUR_KEY_HERE',
       google: 'goog_YOUR_KEY_HERE',
   };
   ```

### Firebase Setup
1. Premium users by UID: `/premiumUsers/{userId}: true`
2. Premium users by email: `/premiumEmails/{emailKey}: true`
3. Email key format: `email@example.com` → `email_example_com`

## Troubleshooting

### Premium not syncing across devices
- Check RevenueCat dashboard for user's purchases
- Verify userId is being passed to `loginUser()`
- Check console logs for RevenueCat errors
- Ensure API keys are correct

### Premium status incorrect
- Clear app data and sign in again
- Check RevenueCat dashboard for subscription status
- Verify entitlement ID matches: `pro_version`
- Check Firebase premium flags

### Cache issues
- Clear AsyncStorage: `user_premium_status_{userId}`
- Sign out and sign in again
- Check for multiple cached entries (legacy bug)

## Code Locations

- **PurchaseManager**: `src/utils/PurchaseManager.js`
- **PremiumManager**: `src/utils/PremiumManager.js`
- **ProfileScreen**: `src/screens/ProfileScreen.js`
- **AppInitializer**: `src/screens/AppInitializer.js`
- **PremiumScreen**: `src/screens/PremiumScreen.js`

## Key Functions

- `PurchaseManager.loginUser(userId)` - Login to RevenueCat
- `PurchaseManager.logoutUser()` - Logout from RevenueCat
- `PurchaseManager.checkProStatus()` - Check active entitlements
- `checkPremiumStatus(email, userId)` - Multi-layer premium check
- `setPremiumStatus(isPremium, userId, email)` - Set premium status

## Notes

- RevenueCat automatically handles subscription renewals
- Premium status is checked on every app launch
- Cache is user-scoped to prevent cross-account issues
- Firebase premium flags are manual overrides
- Developer emails in `PREMIUM_EMAILS` always have premium
