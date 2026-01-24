# Curly Hair Positioning Fix

## Issue
Curly hair style was misplaced - appearing at the top of the avatar circle instead of properly positioned on the head.

## Root Cause
The curly hair was using:
1. Too many curls (7 instead of 6)
2. Incorrect positioning calculation that extended beyond the face width
3. Wrong vertical offset for square face shapes

## Fix Applied

**Before:**
```javascript
case 'curly':
    const curlSize = FW * 0.18, curlTop = isSquare ? hairTop : hairTop - FH * 0.05;
    return <View style={{ position: 'absolute', left: 0, top: curlTop, width: FW, height: FH * 0.4 }}>
        {[0,1,2,3,4,5,6].map(i => 
            <View key={i} style={{ 
                position: 'absolute', 
                left: (i * FW * 0.14) - sideExtend,  // ❌ Extends beyond face
                top: (i % 2) * FH * 0.06, 
                width: curlSize, 
                height: curlSize, 
                backgroundColor: hairColor, 
                borderRadius: curlSize / 2 
            }} />
        )}
    </View>;
```

**After:**
```javascript
case 'curly':
    const curlSize = FW * 0.18;
    const curlTop = isSquare ? hairTop + FH * 0.05 : hairTop;  // ✅ Better vertical position
    const curlSpacing = FW * 0.14;
    const totalCurls = 6;  // ✅ Reduced from 7 to 6
    const totalWidth = totalCurls * curlSpacing;
    const startX = (FW - totalWidth) / 2;  // ✅ Center the curls
    return <View style={{ position: 'absolute', left: 0, top: curlTop, width: FW, height: FH * 0.4 }}>
        {[0,1,2,3,4,5].map(i => 
            <View key={i} style={{ 
                position: 'absolute', 
                left: startX + (i * curlSpacing),  // ✅ Properly centered
                top: (i % 2) * FH * 0.05, 
                width: curlSize, 
                height: curlSize, 
                backgroundColor: hairColor, 
                borderRadius: curlSize / 2 
            }} />
        )}
    </View>;
```

## Changes Made

1. **Reduced curl count**: 7 → 6 curls (fits better on head)
2. **Centered positioning**: Calculate `startX` to center the curls horizontally
3. **Fixed vertical offset**: Adjusted `curlTop` for square faces to sit properly on head
4. **Removed side extend**: No longer extends beyond face width

## Testing

To verify the fix:
1. Restart Metro: `npx expo start --clear`
2. Reload app
3. Go to Profile → Edit Profile
4. Select "Curly" hair style
5. Verify curls are positioned on top of the head, not floating above the circle

## File Modified
- `src/components/CustomAvatarBuilder.js` (line ~60)

## Status
✅ Fixed - Curly hair now properly positioned on the head
