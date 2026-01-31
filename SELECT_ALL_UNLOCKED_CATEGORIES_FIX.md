# Select All - Only Unlocked Categories Fix

## Problem
When clicking "All" in the category selection modal, it was selecting ALL categories including premium/locked ones that users don't have access to.

## Solution
Modified the `toggleCategory` function in both SetupScreen and HostScreen to only select FREE/unlocked categories when "All" is clicked.

## Changes Made

### 1. SetupScreen.js - Line ~227
### 2. HostScreen.js - Line ~242

**Before:**
```javascript
const toggleCategory = (key) => {
    playHaptic('light');
    setSelectedCategories(prev => {
        if (key === 'all') return ['all']; // ❌ Just returns 'all'
        // ... rest of logic
    });
};
```

**After:**
```javascript
const toggleCategory = (key) => {
    playHaptic('light');
    setSelectedCategories(prev => {
        // If tapping 'Random (All)', select all FREE/unlocked categories
        if (key === 'all') {
            // Get all free categories (including subcategories)
            const freeCategories = CATEGORY_LABELS
                .filter(c => c.key !== 'all' && (c.free === true || (!c.premium && !c.free)))
                .flatMap(c => {
                    // If category has subcategories, include them instead of parent
                    if (c.subcategories) {
                        return c.subcategories.map(sub => sub.key);
                    }
                    return [c.key];
                });
            return ['all', ...freeCategories]; // ✅ Returns 'all' + all free categories
        }
        // ... rest of logic
    });
};
```

## What This Does

When user clicks "All", it now:
1. Filters CATEGORY_LABELS to get only free categories (`free: true` or no premium flag)
2. Handles subcategories (like Football and Basketball under Ball Knowledge)
3. Returns an array with 'all' plus all the free category keys

## Free Categories (as of now):
- Daily Life
- Things
- Places
- Food
- Objects
- Ball Knowledge (with subcategories):
  - Football
  - Basketball

## Premium Categories (excluded from "All"):
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

## Testing
1. Click "All" in category selection
2. Verify only free categories are selected (highlighted)
3. Premium categories should remain unselected and locked
4. Game should only use words from free categories when "All" is selected

## Expected Behavior
- "All" button selects all unlocked categories
- Premium categories remain locked and unselected
- Users can still manually select individual free categories
- If user has premium, this logic can be updated to include premium categories
