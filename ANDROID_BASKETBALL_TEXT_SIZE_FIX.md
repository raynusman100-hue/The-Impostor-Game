# Android Basketball Text Size Fix

## Problem
Basketball text in the Ball Knowledge subcategories was too small on Android devices, making it hard to read.

## Solution Applied

### 1. **Increased Font Size for Android**
```javascript
subcategoryLabel: {
    fontSize: Platform.OS === 'android' ? 18 : 16, // Larger font for Android
    // iOS: 16px, Android: 18px
}
```

### 2. **Increased Card Height for Android**
```javascript
subcategoryCard: {
    height: Platform.OS === 'android' ? 65 : 60, // Slightly taller for Android
    // iOS: 60px, Android: 65px
}
```

### 3. **Improved Font Scaling for Android**
```javascript
minimumFontScale={Platform.OS === 'android' ? 0.9 : 0.8}
// Android: Won't scale below 90% of original size
// iOS: Can scale down to 80% of original size
```

### 4. **Added Platform Import**
```javascript
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, Dimensions, Platform } from 'react-native';
```

## Changes Made

**File**: `src/components/CategorySelectionModal.js`

### Before (All Platforms):
- Font size: 16px
- Card height: 60px  
- Minimum font scale: 0.8 (80%)

### After:
**iOS** (unchanged):
- Font size: 16px
- Card height: 60px
- Minimum font scale: 0.8 (80%)

**Android** (improved):
- Font size: 18px (+2px larger)
- Card height: 65px (+5px taller)
- Minimum font scale: 0.9 (90% - less shrinking)

## Benefits

✅ **Better readability** on Android devices
✅ **Platform-specific optimization** without affecting iOS
✅ **Maintains design consistency** across platforms
✅ **Prevents text from becoming too small** on Android

## Testing

1. Open category selection modal
2. Expand Ball Knowledge section
3. Check Basketball and Football text readability
4. Verify text fits properly in cards
5. Test on different Android screen sizes

## Result

Basketball and Football text should now be clearly readable on Android devices while maintaining the original design on iOS.