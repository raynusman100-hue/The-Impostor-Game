# Premium Screen Timing Fix

## Problem
The premium screen was appearing randomly due to conflicting logic:
- **App.js** had `app_open_count` counter (but no navigation)
- **HomeScreen.js** had `app_launch_count` counter (with navigation)
- This created unpredictable timing and duplicate counting

## Solution
Consolidated the logic into a single, controlled flow:

### 1. **App.js** (Counter & Flag Setting)
- Counts app opens using `app_open_count`
- Shows premium every 2nd open (2, 4, 6, 8...)
- Sets a flag `should_show_premium` when it's time to show

### 2. **HomeScreen.js** (Flag Reading & Navigation)
- Checks for the `should_show_premium` flag
- If flag exists, shows premium screen after 1.5s delay
- Clears the flag immediately to prevent duplicate shows

## New Behavior
✅ **First app open**: No premium screen
✅ **Second app open**: Premium screen appears
✅ **Third app open**: No premium screen  
✅ **Fourth app open**: Premium screen appears
✅ **Pattern continues**: Every 2nd open only

## Technical Changes

### App.js
```javascript
// Sets flag when premium should show
if (newCount % 2 === 0 && newCount > 0) {
  await AsyncStorage.setItem('should_show_premium', 'true');
}
```

### HomeScreen.js
```javascript
// Checks flag and shows premium
const shouldShow = await AsyncStorage.getItem('should_show_premium');
if (shouldShow === 'true') {
  await AsyncStorage.removeItem('should_show_premium');
  setTimeout(() => navigation.navigate('Premium'), 1500);
}
```

## Benefits
- **Predictable**: Premium shows exactly every 2nd app open
- **No duplicates**: Flag system prevents multiple shows
- **Clean timing**: 1.5s delay allows home screen to load properly
- **Single source of truth**: One counter, one logic flow

## Testing
1. Open app → No premium (count: 1)
2. Close and reopen → Premium shows (count: 2)
3. Close and reopen → No premium (count: 3)
4. Close and reopen → Premium shows (count: 4)