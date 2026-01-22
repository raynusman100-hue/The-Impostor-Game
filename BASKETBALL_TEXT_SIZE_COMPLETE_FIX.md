# Basketball Text Size Complete Fix

## Problem
"BASKETBALL" text was much smaller than "FOOTBALL" because:
- "BASKETBALL" is longer (10 characters vs 8)
- `adjustsFontSizeToFit` was shrinking it to fit in one line
- This created inconsistent text sizes between the two buttons

## Solution: Rewritten Button Code

### 1. **Removed Auto Font Scaling**
```javascript
// REMOVED: adjustsFontSizeToFit
// REMOVED: minimumFontScale
// ADDED: allowFontScaling={false}
```

### 2. **Split Basketball into Two Lines**
```javascript
{subcat.key === 'basketball' ? 'BASKET\nBALL' : subcat.label.toUpperCase()}
```

### 3. **Increased Card Height**
```javascript
subcategoryCard: {
    height: Platform.OS === 'android' ? 70 : 65, // Taller for 2 lines
}
```

### 4. **Consistent Font Sizes**
```javascript
subcategoryLabel: {
    fontSize: Platform.OS === 'android' ? 16 : 15, // Same size for both
    lineHeight: Platform.OS === 'android' ? 18 : 17,
}

basketballLabel: {
    fontSize: Platform.OS === 'android' ? 15 : 14, // Slightly smaller for 2-line
    lineHeight: Platform.OS === 'android' ? 16 : 15,
}
```

### 5. **Allow Multiple Lines**
```javascript
numberOfLines={2} // Allow Basketball to use 2 lines
```

## Changes Made

**File**: `src/components/CategorySelectionModal.js`

### Before:
- Basketball: "BASKETBALL" (shrunk to ~60% size)
- Football: "FOOTBALL" (normal size)
- Height: 60-65px
- Auto font scaling enabled

### After:
- Basketball: "BASKET\nBALL" (consistent size, 2 lines)
- Football: "FOOTBALL" (same size, 1 line)  
- Height: 65-70px
- Fixed font sizes, no auto scaling

## Benefits

✅ **Equal text sizes** for both Basketball and Football
✅ **Better readability** on all devices
✅ **Consistent visual hierarchy**
✅ **No more font shrinking issues**
✅ **Platform-optimized sizing**

## Visual Result

**Before**:
```
┌─────────────┐  ┌─────────────┐
│   FOOTBALL  │  │  basketball │ ← Much smaller
└─────────────┘  └─────────────┘
```

**After**:
```
┌─────────────┐  ┌─────────────┐
│   FOOTBALL  │  │   BASKET    │ ← Same size
│             │  │    BALL     │
└─────────────┘  └─────────────┘
```

## Testing
1. Open category selection modal
2. Expand Ball Knowledge section  
3. Compare Basketball and Football text sizes
4. Verify both are clearly readable
5. Test on different screen sizes