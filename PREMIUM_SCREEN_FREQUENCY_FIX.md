# Premium Screen Frequency Fix

## Problem Discovered
When clicking "Save" in ProfileScreen, the premium screen was appearing. This was happening because:

1. **Root Cause:** The "Home" screen in App.js is actually `AppInitializer`, not `HomeScreen`
2. **Bug:** AppInitializer incremented the counter **every time you navigated to Home**, not just on app launches
3. **Result:** Premium screen showed 50% of the time (every 2nd navigation to Home)

## Previous Behavior (BROKEN)
```
User opens app → counter = 1 (no premium)
User saves profile → navigates to Home → counter = 2 (PREMIUM SHOWS) ❌
User goes to settings → back to Home → counter = 3 (no premium)
User starts game → back to Home → counter = 4 (PREMIUM SHOWS) ❌
```

**This was TOO AGGRESSIVE** - showing premium on every other Home navigation!

## New Behavior (FIXED)
```
User opens app → counter = 1 (no premium)
User saves profile → navigates to Home → skipped (recent navigation)
User closes app, reopens → counter = 2 (no premium)
User closes app, reopens → counter = 3 (PREMIUM SHOWS) ✅
User saves profile → navigates to Home → skipped (recent navigation)
User closes app, reopens → counter = 4 (no premium)
User closes app, reopens → counter = 5 (no premium)
User closes app, reopens → counter = 6 (PREMIUM SHOWS) ✅
```

## Changes Made

### File: `src/screens/AppInitializer.js`

**1. Added Time-Based Check**
- Stores timestamp of last premium check
- Only increments counter if >5 seconds since last check
- Prevents counting in-app navigation as "app opens"

**2. Changed Frequency**
- **Before:** Every 2nd open (50% frequency) - `newCount % 2 === 0`
- **After:** Every 3rd open (33% frequency) - `newCount % 3 === 0`

**3. Added Logging**
- Logs when premium check is skipped due to recent navigation
- Helps debug and monitor behavior

## Code Changes

**Before:**
```javascript
const countStr = await AsyncStorage.getItem('app_open_count');
const count = countStr ? parseInt(countStr, 10) : 0;
const newCount = count + 1;

await AsyncStorage.setItem('app_open_count', newCount.toString());

// Show premium every 2nd open (50% frequency)
if (newCount % 2 === 0 && newCount > 0) {
    setShowPremium(true);
}
```

**After:**
```javascript
const lastCheckTime = await AsyncStorage.getItem('premium_last_check');
const now = Date.now();
const timeSinceLastCheck = lastCheckTime ? now - parseInt(lastCheckTime, 10) : Infinity;

// Only count if >5 seconds since last check (actual app launch)
if (timeSinceLastCheck > 5000) {
    const countStr = await AsyncStorage.getItem('app_open_count');
    const count = countStr ? parseInt(countStr, 10) : 0;
    const newCount = count + 1;

    await AsyncStorage.setItem('app_open_count', newCount.toString());
    await AsyncStorage.setItem('premium_last_check', now.toString());

    // Show premium every 3rd open (33% frequency)
    if (newCount % 3 === 0 && newCount > 0) {
        setShowPremium(true);
    }
} else {
    // Skip - this is just navigation, not a fresh app launch
    setShowPremium(false);
}
```

## AsyncStorage Keys Used

1. **`app_open_count`** - Total number of actual app launches
2. **`premium_last_check`** - Timestamp (ms) of last premium check

## Frequency Options

You can adjust the frequency by changing the modulo value:

```javascript
// Every 2nd open (50% frequency) - AGGRESSIVE
if (newCount % 2 === 0) { ... }

// Every 3rd open (33% frequency) - BALANCED ✅ Current
if (newCount % 3 === 0) { ... }

// Every 4th open (25% frequency) - CONSERVATIVE
if (newCount % 4 === 0) { ... }

// Every 5th open (20% frequency) - VERY CONSERVATIVE
if (newCount % 5 === 0) { ... }
```

## Time Threshold Options

You can adjust the time threshold (currently 5 seconds):

```javascript
// 3 seconds - More sensitive to app relaunches
if (timeSinceLastCheck > 3000) { ... }

// 5 seconds - Balanced ✅ Current
if (timeSinceLastCheck > 5000) { ... }

// 10 seconds - Less sensitive, only counts cold starts
if (timeSinceLastCheck > 10000) { ... }
```

## Testing

1. **Test In-App Navigation:**
   - Save profile → Should NOT show premium
   - Go to settings → back to Home → Should NOT show premium
   - Start game → back to Home → Should NOT show premium

2. **Test App Launches:**
   - Close app completely
   - Reopen app 3 times
   - Premium should show on 3rd launch

3. **Test Counter:**
   - Check console logs for "App opened X times"
   - Verify counter only increments on actual launches

## Monitoring

Check console logs:
- `📊 App opened X times` - Counter incremented (actual launch)
- `⏭️ Skipping premium check (recent navigation)` - Navigation ignored
- `🎁 Premium screen should show (counter triggered)` - Premium will display

## Rollback

If you want to revert to the old behavior (not recommended):

```javascript
// Remove time check, go back to every navigation
const countStr = await AsyncStorage.getItem('app_open_count');
const count = countStr ? parseInt(countStr, 10) : 0;
const newCount = count + 1;
await AsyncStorage.setItem('app_open_count', newCount.toString());

if (newCount % 2 === 0 && newCount > 0) {
    setShowPremium(true);
}
```

## Recommendation

**Current settings are BALANCED for monetization vs UX:**
- Shows premium every 3rd actual app launch (33%)
- Doesn't interrupt in-app navigation
- Still provides good premium exposure
- Better user experience

If you want more aggressive monetization, change to `% 2` (50%).
If you want less aggressive, change to `% 4` (25%) or `% 5` (20%).
