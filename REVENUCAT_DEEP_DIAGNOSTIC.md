# RevenueCat Deep Diagnostic - Entitlement Not Showing

## Current Status
- ✅ Checked Sandbox view - entitlement granted there
- ❌ App still not seeing the entitlement
- Need to verify: User ID matching and app logs

## Step 1: Check Which User ID RevenueCat is Using

The app needs to check the EXACT user ID that RevenueCat is currently tracking.

### Add Diagnostic Button to Profile Screen

Add this temporary diagnostic code to see what's happening:

```javascript
// In ProfileScreen.js, add this import at the top
import Purchases from 'react-native-purchases';

// Add this diagnostic function
const runRevenueCatDiagnostics = async () => {
  try {
    console.log('=== REVENUCAT DIAGNOSTICS START ===');
    
    // 1. Get current RevenueCat App User ID
    const rcAppUserId = await Purchases.getAppUserID();
    console.log('1. RC App User ID:', rcAppUserId);
    
    // 2. Get Firebase User ID
    const firebaseUserId = auth.currentUser?.uid || 'NOT_SIGNED_IN';
    console.log('2. Firebase User ID:', firebaseUserId);
    
    // 3. Check if they match
    console.log('3. IDs Match?', rcAppUserId === firebaseUserId);
    
    // 4. Get customer info
    const customerInfo = await Purchases.getCustomerInfo();
    console.log('4. Original App User ID:', customerInfo.originalAppUserId);
    console.log('5. Active Entitlements:', Object.keys(customerInfo.entitlements.active));
    console.log('6. All Entitlements:', Object.keys(customerInfo.entitlements.all));
    
    // 7. Check specific premium entitlement
    const premiumEntitlement = customerInfo.entitlements.all['premium'];
    if (premiumEntitlement) {
      console.log('7. Premium Entitlement Found:');
      console.log('   - Is Active:', premiumEntitlement.isActive);
      console.log('   - Will Renew:', premiumEntitlement.willRenew);
      console.log('   - Expires:', premiumEntitlement.expirationDate);
      console.log('   - Product ID:', premiumEntitlement.productIdentifier);
    } else {
      console.log('7. Premium Entitlement: NOT FOUND');
    }
    
    console.log('=== REVENUCAT DIAGNOSTICS END ===');
    
    // Show alert with key info
    Alert.alert(
      'RevenueCat Diagnostics',
      `RC ID: ${rcAppUserId}\n\nFirebase ID: ${firebaseUserId}\n\nMatch: ${rcAppUserId === firebaseUserId}\n\nActive: ${Object.keys(customerInfo.entitlements.active).join(', ') || 'none'}\n\nAll: ${Object.keys(customerInfo.entitlements.all).join(', ') || 'none'}`,
      [{ text: 'OK' }]
    );
    
  } catch (error) {
    console.error('Diagnostic Error:', error);
    Alert.alert('Error', error.message);
  }
};

// Add a button in your render to trigger this
<Button title="🔍 RC Diagnostics" onPress={runRevenueCatDiagnostics} />
```

## Step 2: What to Look For

After running diagnostics, check these scenarios:

### Scenario A: IDs Don't Match
```
RC App User ID: $RCAnonymousId:abc123xyz
Firebase User ID: firebase-uid-456
IDs Match? false
```
**Problem**: RevenueCat is using an anonymous ID, not your Firebase ID
**Solution**: Linking failed - need to fix the linking code

### Scenario B: IDs Match, But No Entitlements
```
RC App User ID: firebase-uid-456
Firebase User ID: firebase-uid-456
IDs Match? true
Active Entitlements: []
All Entitlements: []
```
**Problem**: User is linked, but has no entitlements
**Solution**: Grant entitlement to the correct Firebase UID in dashboard

### Scenario C: Entitlement Exists But Not Active
```
RC App User ID: firebase-uid-456
Firebase User ID: firebase-uid-456
IDs Match? true
Active Entitlements: []
All Entitlements: ['premium']
Premium Is Active: false
```
**Problem**: Entitlement exists but is expired or inactive
**Solution**: Check expiration date, re-grant if needed

### Scenario D: Everything Looks Good
```
RC App User ID: firebase-uid-456
Firebase User ID: firebase-uid-456
IDs Match? true
Active Entitlements: ['premium']
Premium Is Active: true
```
**Problem**: RevenueCat sees it, but app logic doesn't
**Solution**: Check PremiumManager cache or logic issue

## Step 3: Force Sync After Diagnostics

If IDs match but entitlements are missing, force a sync:

```javascript
// Add this to the diagnostic function
await Purchases.syncPurchases();
console.log('Synced purchases');

// Invalidate cache
if (Purchases.invalidateCustomerInfoCache) {
  await Purchases.invalidateCustomerInfoCache();
  console.log('Invalidated cache');
}

// Check again
const freshInfo = await Purchases.getCustomerInfo();
console.log('Fresh Active Entitlements:', Object.keys(freshInfo.entitlements.active));
```

## Step 4: Check Dashboard for Correct User

In RevenueCat Dashboard (Sandbox view):
1. Go to **Customers** tab
2. Search for your **Firebase UID** (not email)
3. Verify:
   - Customer exists with that exact ID
   - "premium" entitlement is listed
   - Entitlement shows as "Active" (green)
   - Expiration date is in the future (or "Never" for lifetime)

## Step 5: Common Issues & Fixes

### Issue: Anonymous ID Instead of Firebase ID
**Cause**: Linking never happened or failed silently
**Fix**: 
```javascript
// Force re-link
const firebaseUid = auth.currentUser.uid;
await Purchases.logIn(firebaseUid);
```

### Issue: Wrong Firebase UID in Dashboard
**Cause**: Granted entitlement to wrong user
**Fix**: 
1. Get correct Firebase UID from diagnostics
2. Search for that user in dashboard
3. Grant entitlement to correct user

### Issue: Entitlement Expired
**Cause**: Test entitlement had expiration date
**Fix**: 
1. In dashboard, edit entitlement
2. Set expiration to "Never" or future date

### Issue: Build Type Mismatch
**Cause**: Using production build with sandbox entitlement
**Fix**: 
```bash
# Build a sandbox-compatible version
eas build --profile preview --platform android
```

## Next Steps

1. **Add the diagnostic button** to ProfileScreen
2. **Run diagnostics** and check the console logs
3. **Share the output** - specifically:
   - RC App User ID
   - Firebase User ID
   - Do they match?
   - Active Entitlements list
   - All Entitlements list
4. Based on output, we'll know exactly what's wrong
