# Locked Categories & Premium Screen - Final Fix

## Issues Fixed

### 1. ✅ Locked Categories Appearing in Game
**Problem:** Premium categories (like "Famous People") were appearing in games even when not selected.

**Root Cause:** The `getRandomWord()` function in `words.js` was including ALL categories when 'all' was selected, without checking if they were premium/locked.

**Fix:** Modified `getRandomWord()` to only include FREE categories when 'all' is selected.

**File:** `src/utils/words.js`

```javascript
// BEFORE - Included ALL categories
if (keys.includes('all') || keys.length === 0) {
    Object.keys(wordCategories).forEach(key => {
        availableWords = [...availableWords, ...addCategory(wordCategories[key], key)];
    });
}

// AFTER - Only includes FREE categories
if (keys.includes('all') || keys.length === 0) {
    const freeCategories = CATEGORY_LABELS
        .filter(c => c.key !== 'all' && (c.free === true || (!c.premium && !c.free)))
        .flatMap(c => {
            if (c.subcategories) {
                return c.subcategories.map(sub => sub.key);
            }
            return [c.key];
        });
    
    freeCategories.forEach(key => {
        if (wordCategories[key]) {
            availableWords = [...availableWords, ...addCategory(wordCategories[key], key)];
        }
    });
}
```

### 2. ✅ "All" Button Selects Only Unlocked Categories
**Problem:** Clicking "All" in category selection was selecting locked categories too.

**Fix:** Modified `toggleCategory()` in both SetupScreen and HostScreen to only select free categories.

**Files:** `src/screens/SetupScreen.js` & `src/screens/HostScreen.js`

```javascript
if (key === 'all') {
    // Get all free categories (including subcategories)
    const freeCategories = CATEGORY_LABELS
        .filter(c => c.key !== 'all' && (c.free === true || (!c.premium && !c.free)))
        .flatMap(c => {
            if (c.subcategories) {
                return c.subcategories.map(sub => sub.key);
            }
            return [c.key];
        });
    return ['all', ...freeCategories];
}
```

### 3. ✅ Premium Screen Frequency - Dual Strategy
**Problem:** Premium screen was showing too often on navigation, not enough on app launches.

**Solution:** Implemented TWO separate counters:
- **App Launch Counter:** Shows premium every 2nd launch (50% - AGGRESSIVE)
- **Profile Save Counter:** Shows premium every 3rd save (33% - BALANCED)

#### App Launch Premium (AppInitializer.js)
```javascript
// Only counts actual app launches (>5 seconds apart)
if (timeSinceLastCheck > 5000) {
    const newCount = count + 1;
    
    // Show premium every 2nd open (50% frequency)
    if (newCount % 2 === 0 && newCount > 0) {
        navigation.navigate('Premium');
    }
}
```

**Behavior:**
- Open app → count = 1 (no premium)
- Open app → count = 2 (PREMIUM SHOWS) ✅
- Open app → count = 3 (no premium)
- Open app → count = 4 (PREMIUM SHOWS) ✅

#### Profile Save Premium (ProfileScreen.js)
```javascript
// Check if we should show premium (every 3rd save)
const saveCountStr = await AsyncStorage.getItem('profile_save_count');
const saveCount = saveCountStr ? parseInt(saveCountStr, 10) : 0;
const newSaveCount = saveCount + 1;
await AsyncStorage.setItem('profile_save_count', newSaveCount.toString());

// Show premium every 3rd save
if (newSaveCount % 3 === 0 && newSaveCount > 0) {
    navigation.navigate('Premium');
} else {
    navigation.navigate('Home');
}
```

**Behavior:**
- Save profile → count = 1 (no premium, go to Home)
- Save profile → count = 2 (no premium, go to Home)
- Save profile → count = 3 (PREMIUM SHOWS) ✅
- Save profile → count = 4 (no premium, go to Home)
- Save profile → count = 5 (no premium, go to Home)
- Save profile → count = 6 (PREMIUM SHOWS) ✅

## AsyncStorage Keys Used

1. **`app_open_count`** - Counts actual app launches
2. **`premium_last_check`** - Timestamp to distinguish launches from navigation
3. **`profile_save_count`** - Counts profile save button clicks

## Free vs Premium Categories

### Free Categories (Unlocked):
- Daily Life
- Things
- Places
- Food
- Objects
- Ball Knowledge
  - Football (subcategory)
  - Basketball (subcategory)

### Premium Categories (Locked):
- Movies
- Games
- Trends
- Sports
- Science
- History
- Mythology
- Nature
- Tech
- Fashion
- Gen Z
- Famous People

## Testing Checklist

### Test Locked Categories Fix:
1. ✅ Select "All" in category selection
2. ✅ Start a game
3. ✅ Verify NO premium category words appear (no Famous People, Movies, etc.)
4. ✅ Only free category words should appear

### Test "All" Button:
1. ✅ Click "All" in category modal
2. ✅ Verify only FREE categories are highlighted/selected
3. ✅ Premium categories should remain locked and unselected

### Test App Launch Premium:
1. ✅ Close app completely
2. ✅ Open app (count = 1, no premium)
3. ✅ Close app, open again (count = 2, PREMIUM SHOWS)
4. ✅ Close app, open again (count = 3, no premium)
5. ✅ Close app, open again (count = 4, PREMIUM SHOWS)

### Test Profile Save Premium:
1. ✅ Save profile (count = 1, go to Home)
2. ✅ Save profile (count = 2, go to Home)
3. ✅ Save profile (count = 3, PREMIUM SHOWS)
4. ✅ Save profile (count = 4, go to Home)
5. ✅ Save profile (count = 5, go to Home)
6. ✅ Save profile (count = 6, PREMIUM SHOWS)

### Test Navigation Doesn't Trigger Premium:
1. ✅ Navigate from Home → Settings → Home (no premium)
2. ✅ Navigate from Home → Profile → Home (no premium, unless save clicked)
3. ✅ Play game → back to Home (no premium)

## Frequency Adjustment

If you want to change frequencies:

### App Launch Frequency:
```javascript
// Every 2nd (50%) - Current ✅
if (newCount % 2 === 0) { ... }

// Every 3rd (33%)
if (newCount % 3 === 0) { ... }

// Every 4th (25%)
if (newCount % 4 === 0) { ... }
```

### Profile Save Frequency:
```javascript
// Every 3rd (33%) - Current ✅
if (newSaveCount % 3 === 0) { ... }

// Every 2nd (50%)
if (newSaveCount % 2 === 0) { ... }

// Every 4th (25%)
if (newSaveCount % 4 === 0) { ... }
```

## Console Logs for Monitoring

Watch for these logs:
- `📊 App opened X times` - App launch counter
- `💾 Profile saved X times` - Profile save counter
- `🎁 Premium screen should show (counter triggered)` - App launch premium
- `🎁 Navigating to Premium (save counter triggered)` - Profile save premium
- `⏭️ Skipping premium check (recent navigation)` - Navigation ignored

## Summary

✅ **Locked categories will NEVER appear in games**
✅ **"All" button only selects unlocked categories**
✅ **Premium shows every 2nd app launch (aggressive monetization)**
✅ **Premium shows every 3rd profile save (balanced UX)**
✅ **In-app navigation doesn't trigger premium**
✅ **Stable and predictable behavior**
