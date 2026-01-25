# Premium Screen Frequency - Reduced to Every 3rd Time

## Change Summary

**Before:** Premium screen showed every 2nd time (50% frequency)
**After:** Premium screen shows every 3rd time (33% frequency)

## What Was Changed

### 1. AppInitializer.js - Premium Trigger Logic

**Before:**
```javascript
// Show premium every 2nd open (2, 4, 6...)
if (newCount % 2 === 0 && newCount > 0) {
    console.log('🎁 Premium screen should show (counter triggered)');
    setShowPremium(true);
}
```

**After:**
```javascript
// Show premium every 3rd open (3, 6, 9, 12...)
if (newCount % 3 === 0 && newCount > 0) {
    console.log('🎁 Premium screen should show (counter triggered)');
    setShowPremium(true);
}
```

### 2. SettingsScreen.js - Debug Messages

**Updated "Check App Open Count" button:**
- Before: "Premium shows every 2nd open (even numbers)"
- After: "Premium shows every 3rd open (3, 6, 9...)"

**Updated "Reset Premium Counter" button:**
- Before: Set count to 1 (next open triggers at 2)
- After: Set count to 2 (next open triggers at 3)

## How It Works Now

### Premium Screen Trigger Pattern

| App Opens | Shows Premium? |
|-----------|----------------|
| 1 | ❌ No |
| 2 | ❌ No |
| 3 | ✅ Yes |
| 4 | ❌ No |
| 5 | ❌ No |
| 6 | ✅ Yes |
| 7 | ❌ No |
| 8 | ❌ No |
| 9 | ✅ Yes |

**Frequency:** 33% (every 3rd time)

### What Counts as an "App Open"

The counter only increments when:
- More than 5 seconds have passed since last check
- This prevents counting rapid navigation as multiple "opens"

**Counts as app open:**
- User closes app and reopens
- User switches to another app and comes back (after 5+ seconds)
- User saves profile and navigates to home (after 5+ seconds)

**Does NOT count:**
- Quick navigation between screens
- Returning to home within 5 seconds

## Testing

### Test the New Frequency

1. **Check current count:**
   - Go to Settings → DEBUG section
   - Tap "Check App Open Count"
   - Note the current count

2. **Trigger premium screen:**
   - If count is 1 or 2: Open app 2-3 more times
   - If count is 4 or 5: Open app 1-2 more times
   - Premium screen should show on multiples of 3 (3, 6, 9...)

3. **Verify pattern:**
   - Open app 9 times total
   - Premium should show on opens: 3, 6, 9
   - Premium should NOT show on: 1, 2, 4, 5, 7, 8

### Quick Test with Reset

1. Go to Settings → DEBUG
2. Tap "Reset Premium Counter" (sets to 2)
3. Close and reopen app
4. Premium screen should show (count is now 3)

## Console Logs

### When Premium Shows:
```
📊 App opened 3 times
🎁 Premium screen should show (counter triggered)
```

### When Premium Doesn't Show:
```
📊 App opened 1 times
```
```
📊 App opened 2 times
```
```
📊 App opened 4 times
```

## Files Modified

1. **src/screens/AppInitializer.js**
   - Changed `newCount % 2 === 0` to `newCount % 3 === 0`
   - Updated comment to reflect new frequency

2. **src/screens/SettingsScreen.js**
   - Updated "Check App Open Count" message
   - Updated "Reset Premium Counter" to set count to 2

## Result

Premium screen now appears **33% less frequently** (every 3rd time instead of every 2nd time), making it less aggressive while still promoting premium features.
