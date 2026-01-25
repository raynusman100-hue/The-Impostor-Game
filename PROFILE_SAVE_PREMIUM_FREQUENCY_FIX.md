# Profile Save Premium Screen Frequency Fix

## Issue
Premium screen was showing too aggressively when saving profile - needed to reduce frequency from every 2nd save to every 3rd save.

## Solution Implemented

### 1. Profile Save Counter Added (ProfileScreen.js)
Added a separate counter specifically for profile saves that triggers premium screen every 3rd save:

```javascript
// Increment profile save counter
const saveCountStr = await AsyncStorage.getItem('profile_save_count');
const saveCount = saveCountStr ? parseInt(saveCountStr, 10) : 0;
const newSaveCount = saveCount + 1;
await AsyncStorage.setItem('profile_save_count', newSaveCount.toString());

console.log('💾 Profile saved', newSaveCount, 'times');

// Check if we should show premium (every 3rd save)
if (newSaveCount % 3 === 0 && newSaveCount > 0) {
    console.log('🎁 Navigating to Premium (save counter triggered)');
    Alert.alert('Saved!', 'Your profile has been updated.', [{ 
        text: 'OK', 
        onPress: () => {
            setMode('profile_view');
            setTimeout(() => {
                navigation.navigate('Premium');
            }, 300);
        }
    }]);
} else {
    Alert.alert('Saved!', 'Your profile has been updated.', [{ 
        text: 'OK', 
        onPress: () => setMode('profile_view') 
    }]);
}
```

### 2. Debug Tools Added (SettingsScreen.js)
Added debug buttons to check and reset the profile save counter:

- **Check Profile Save Count**: View current profile save count
- **Reset Profile Save Counter**: Set count to 2 (next save will trigger premium)

## Frequency Comparison

| Trigger | Old Frequency | New Frequency |
|---------|---------------|---------------|
| App Open | Every 3rd (33%) | Every 3rd (33%) - unchanged |
| Profile Save | N/A (not implemented) | Every 3rd (33%) |

## Testing

### Manual Test:
1. Go to Profile screen
2. Make a change and save
3. Repeat 3 times
4. On the 3rd save, premium screen should appear

### Quick Test:
1. Settings → DEBUG → "Reset Profile Save Counter"
2. Go to Profile and save
3. Premium screen should appear immediately

## Files Modified
- `src/screens/ProfileScreen.js` - Added profile save counter logic
- `src/screens/SettingsScreen.js` - Added debug tools for profile save counter

## Storage Keys
- `profile_save_count` - Tracks number of times profile has been saved
- `app_open_count` - Tracks number of times app has been opened (existing)

## Notes
- Profile save counter is independent from app open counter
- Both counters trigger premium screen at 33% frequency (every 3rd time)
- Counters persist across app restarts
- Premium screen only shows for non-premium users
