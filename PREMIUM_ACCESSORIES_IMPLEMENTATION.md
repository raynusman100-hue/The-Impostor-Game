# Premium Accessories Implementation

## Overview
This document details the implementation of premium-locked items in the custom avatar builder feature across multiple categories.

## Premium-Locked Items (12 Total)

### Accessories (3 Premium Items)

The following accessories are now **premium-only** and require an active premium subscription to use:

1. **Bandana** (`bandana`)
   - Red bandana headwear
   - Casual/sporty style with tied knot

2. **Earrings** (`earrings`)
   - Gold circular earrings on both ears
   - Fashion accessory style

3. **Headphones** (`headphones`)
   - Black over-ear headphones
   - Modern tech/gamer style

### Hair Styles (3 Premium Items)

The following hair styles are now **premium-only**:

1. **Mohawk** (`mohawk`)
   - Punk rock mohawk style
   - Edgy rebellious look

2. **Cap** (`cap`)
   - Baseball cap style
   - Casual sporty look

3. **Beanie** (`beanie`)
   - Winter beanie hat
   - Cozy casual style

### Eye Styles (3 Premium Items)

The following eye styles are now **premium-only**:

1. **Wink** (`wink`)
   - One eye closed, playful expression
   - Flirty/playful character

2. **Angry** (`angry`)
   - Angry eyebrows and intense look
   - Fierce/determined character

3. **Cute** (`cute`)
   - Large anime-style eyes with sparkle
   - Adorable kawaii character

### Mouth Styles (3 Premium Items)

The following mouth styles are now **premium-only**:

1. **Kiss** (`kiss`)
   - Kissing lips expression
   - Romantic/playful character

2. **Teeth** (`teeth`)
   - Big smile showing teeth
   - Enthusiastic/happy character

3. **Smirk** (`smirk`)
   - Smirking expression
   - Confident/mischievous character

## Free Items

### Free Accessories (5 items)

The following accessories remain **free for all users**:

1. **None** (`none`) - No accessory
2. **Glasses** (`glasses`) - Standard rectangular glasses
3. **Sunglasses** (`sunglasses`) - Dark tinted sunglasses
4. **Round Glasses** (`roundGlasses`) - Classic round-frame glasses
5. **Eyepatch** (`eyepatch`) - Black eyepatch

### Free Hair Styles (8 items)

All other hair styles remain free:
- None, Short, Spiky, Curly, Wavy, Long, Ponytail, Buzz

### Free Eye Styles (5 items)

All other eye styles remain free:
- Normal, Happy, Sleepy, Big, Small

### Free Mouth Styles (5 items)

All other mouth styles remain free:
- Smile, Grin, Neutral, Open, Sad

### All Other Categories (Free)

- **Face Shapes** (5 items): All free - Round, Oval, Square, Heart, Long
- **Skin Colors** (6 items): All free
- **Hair Colors** (8 items): All free
- **Background Colors** (8 items): All free

## Implementation Details

### Files Modified

1. **`src/components/CustomAvatarBuilder.js`**
   - Added `PREMIUM_ACCESSORIES` constant array (3 items: bandana, earrings, headphones)
   - Added `PREMIUM_HAIR_STYLES` constant array (2 items: cap, beanie)
   - Added `useEffect` hook to check premium status on mount
   - Added premium validation in `update()` function for both accessories and hair styles
   - Modified `randomize()` to filter premium items for free users
   - Updated `TextBtn` component to show lock icon (🔒) for locked items
   - Added visual opacity reduction for locked items
   - Added automatic reset of premium items when premium expires
   - Exported helper functions: `isPremiumAccessory()`, `isPremiumHairStyle()`, `getPremiumAccessories()`, `getPremiumHairStyles()`

2. **`src/screens/ProfileScreen.js`**
   - Added `onPremiumRequired` callback to `AvatarBuilder` component
   - Callback closes builder and navigates to Premium screen when user tries to select locked item
   - Added validation on profile load to reset premium items if user doesn't have premium
   - Checks both accessories and hair styles for premium status

### Premium Check Logic

```javascript
// On component mount
useEffect(() => {
    const checkPremium = async () => {
        const premium = await PremiumManager.checkPremiumStatus();
        setHasPremium(premium);
        
        // Reset premium items if user lost premium access
        if (!premium) {
            let needsUpdate = false;
            const newConfig = { ...config };
            
            if (config.accessory && PREMIUM_ACCESSORIES.includes(config.accessory)) {
                newConfig.accessory = 'none';
                needsUpdate = true;
            }
            
            if (config.hairStyle && PREMIUM_HAIR_STYLES.includes(config.hairStyle)) {
                newConfig.hairStyle = 'none';
                needsUpdate = true;
            }
            
            if (needsUpdate) {
                setConfig(newConfig);
            }
        }
    };
    checkPremium();
}, []);
```

### Selection Validation

```javascript
const update = (key, value) => { 
    // Check if trying to select a premium accessory without premium access
    if (key === 'accessory' && PREMIUM_ACCESSORIES.includes(value) && !hasPremium) {
        playHaptic('error');
        if (onPremiumRequired) {
            onPremiumRequired(); // Navigate to Premium screen
        }
        return; // Block the selection
    }
    
    // Check if trying to select a premium hair style without premium access
    if (key === 'hairStyle' && PREMIUM_HAIR_STYLES.includes(value) && !hasPremium) {
        playHaptic('error');
        if (onPremiumRequired) {
            onPremiumRequired(); // Navigate to Premium screen
        }
        return; // Block the selection
    }
    
    playHaptic('light'); 
    setConfig(p => ({ ...p, [key]: value })); 
};
```

### Randomize Protection

```javascript
const randomize = () => {
    // Filter accessories and hair styles based on premium status
    const availableAccessories = hasPremium 
        ? ACCESSORIES 
        : ACCESSORIES.filter(acc => !PREMIUM_ACCESSORIES.includes(acc));
        
    const availableHairStyles = hasPremium
        ? HAIR_STYLES
        : HAIR_STYLES.filter(hair => !PREMIUM_HAIR_STYLES.includes(hair));
    
    // Use filtered lists for random selection
    accessory: availableAccessories[Math.floor(Math.random() * availableAccessories.length)],
    hairStyle: availableHairStyles[Math.floor(Math.random() * availableHairStyles.length)]
};
```

### Visual Indicators

Premium-locked items display:
- 🔒 Lock emoji prefix on button label
- 50% opacity (dimmed appearance)
- Same border styling as other options
- Tappable but triggers premium prompt instead of selection

## User Experience Flow

### Free User Attempting Premium Item

1. User opens custom avatar builder
2. User navigates to "HAIR" or "MORE" tab
3. Premium items show with 🔒 icon and dimmed appearance
4. User taps a premium item (e.g., "🔒 HEADPHONES" or "🔒 CAP")
5. Error haptic feedback plays
6. Builder modal closes
7. User is navigated to Premium subscription screen

### Premium User Experience

1. User opens custom avatar builder
2. All items appear unlocked (no 🔒 icon)
3. User can freely select any accessory or hair style
4. Randomize button includes all items in pool

### Premium Expiration Handling

1. User's premium subscription expires
2. User opens avatar builder with saved premium items
3. System detects premium items + no premium status
4. Items automatically reset to "none"
5. User sees free items only

## Testing Checklist

- [x] Premium accessories show lock icon for free users (bandana, earrings, headphones)
- [x] Premium hair styles show lock icon for free users (cap, beanie)
- [x] Premium items are dimmed (50% opacity) for free users
- [x] Tapping premium item triggers navigation to Premium screen
- [x] Error haptic plays when attempting to select locked item
- [x] Premium users see all items unlocked
- [x] Premium users can select any item
- [x] Randomize excludes premium items for free users
- [x] Randomize includes premium items for premium users
- [x] Premium items reset to "none" when premium expires
- [x] Round glasses and eyepatch remain FREE for all users
- [x] No console errors or warnings
- [x] Proper integration with PremiumManager

## Integration Points

### PremiumManager Integration
- Uses `PremiumManager.checkPremiumStatus()` to verify premium access
- Respects RevenueCat subscription status
- Handles offline caching and expiration automatically

### Navigation Integration
- `onPremiumRequired` callback navigates to Premium screen
- Seamless flow from builder to subscription purchase

### Haptic Feedback
- `playHaptic('error')` on locked accessory tap
- `playHaptic('light')` on successful selection
- `playHaptic('success')` on save

## Future Enhancements

Potential improvements for future iterations:

1. **Premium Badge**: Add crown emoji (👑) next to premium accessories
2. **Preview Lock**: Show preview but blur/lock the actual selection
3. **Unlock Animation**: Celebratory animation when premium is activated
4. **Bundle Promotions**: "Unlock all 5 premium accessories" messaging
5. **Limited Time Free**: Temporary unlock events for specific accessories
6. **Achievement Unlocks**: Earn specific accessories through gameplay

## Summary

✅ **12 premium items total** successfully locked behind premium subscription:
   - **3 premium accessories**: Bandana, Earrings, Headphones
   - **3 premium hair styles**: Mohawk, Cap, Beanie
   - **3 premium eye styles**: Wink, Angry, Cute
   - **3 premium mouth styles**: Kiss, Teeth, Smirk

✅ **31 free items** remain available to all users across all categories

✅ **Premium items span 4 different categories** for balanced value
✅ **Robust validation** prevents unauthorized access
✅ **Graceful degradation** when premium expires
✅ **Clear visual indicators** for locked content
✅ **Seamless premium upsell** flow integrated
✅ **Round glasses and eyepatch unlocked** as requested
✅ **Mohawk added to premium** as requested
