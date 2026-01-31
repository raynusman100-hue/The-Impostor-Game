# Premium Button on HomeScreen

## Feature Added
Added a premium button next to the profile icon on the HomeScreen for easy access to premium features.

## Location
**File:** `src/screens/HomeScreen.js`

**Position:** Top right corner, left of the profile button

## Visual Design

### Button Appearance:
- **Icon:** ✨ (sparkles emoji)
- **Shape:** Circular (42x42px)
- **Color:** Theme primary color background
- **Border:** Gold shimmer effect (rgba(255, 215, 0, 0.3))
- **Shadow:** Glowing gold shadow for premium feel
- **Animation:** Subtle pulsing (1.0 → 1.1 → 1.0 scale, 3 second cycle)

### Positioning:
```
[✨ Premium]  [👤 Profile]
    72px         22px from right
```

## Code Changes

### 1. Added Animation Reference
```javascript
const premiumPulseAnim = useRef(new Animated.Value(1)).current;
```

### 2. Added Pulse Animation
```javascript
// Premium button pulse animation - subtle and elegant
const premiumPulse = Animated.loop(
    Animated.sequence([
        Animated.timing(premiumPulseAnim, { toValue: 1.1, duration: 1500, useNativeDriver: true }),
        Animated.timing(premiumPulseAnim, { toValue: 1, duration: 1500, useNativeDriver: true }),
    ])
);
premiumPulse.start();
```

### 3. Added Premium Button Component
```javascript
{/* Premium button - next to profile */}
<Animated.View style={{ transform: [{ scale: premiumPulseAnim }] }}>
    <TouchableOpacity
        onPress={() => { playHaptic('medium'); navigation.navigate('Premium'); }}
        style={styles.premiumButton}
        activeOpacity={0.8}
    >
        <View style={[styles.premiumIconContainer, { backgroundColor: theme.colors.primary }]}>
            <Text style={[styles.premiumIcon, { color: theme.colors.secondary }]}>✨</Text>
        </View>
    </TouchableOpacity>
</Animated.View>
```

### 4. Added Styles
```javascript
premiumButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 45 : 30,
    right: 72, // Left of profile button
    zIndex: 10,
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
},
premiumIconContainer: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255, 215, 0, 0.3)', // Gold shimmer
    shadowColor: '#FFD700',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 5,
},
premiumIcon: {
    fontSize: 20,
    textShadowColor: 'rgba(255, 255, 255, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 4,
},
```

## User Experience

### Behavior:
1. **Tap:** Navigates to Premium screen with medium haptic feedback
2. **Visual:** Subtle pulsing animation draws attention without being annoying
3. **Accessibility:** Large enough touch target (42x42px)
4. **Positioning:** Easy to reach, doesn't interfere with profile button

### Why This Works:
- **Visibility:** Gold shimmer and pulsing animation make it noticeable
- **Premium Feel:** Sparkles emoji + gold effects = premium branding
- **Non-Intrusive:** Subtle animation doesn't distract from main content
- **Consistent:** Matches the cinematic theme of the app
- **Accessible:** Always visible, no need to dig through menus

## Theme Compatibility

Works with all themes:
- **Kodak Daylight:** Yellow/amber primary color
- **Dark themes:** Contrasts well with dark backgrounds
- **Light themes:** Gold shimmer provides distinction

## Testing

1. ✅ Button appears next to profile icon
2. ✅ Pulsing animation runs smoothly
3. ✅ Tapping navigates to Premium screen
4. ✅ Haptic feedback works
5. ✅ Doesn't overlap with profile button
6. ✅ Works on both iOS and Android
7. ✅ Responsive to theme changes

## Future Enhancements (Optional)

### Conditional Display:
```javascript
// Only show if user doesn't have premium
{!userHasPremium && (
    <Animated.View style={{ transform: [{ scale: premiumPulseAnim }] }}>
        {/* Premium button */}
    </Animated.View>
)}
```

### Badge for Special Offers:
```javascript
{hasSpecialOffer && (
    <View style={styles.offerBadge}>
        <Text style={styles.offerText}>50% OFF</Text>
    </View>
)}
```

### Different Icons Based on State:
- `✨` - Default (sparkles)
- `👑` - Premium user (crown)
- `🎁` - Special offer available (gift)
- `⭐` - Limited time deal (star)

## Analytics Tracking (Recommended)

Add tracking to measure button effectiveness:
```javascript
onPress={() => { 
    playHaptic('medium');
    // Track premium button click
    analytics.logEvent('premium_button_clicked', {
        source: 'home_screen',
        user_id: userProfile?.uid
    });
    navigation.navigate('Premium');
}}
```

## Summary

✅ **Premium button added to HomeScreen**
✅ **Positioned next to profile icon**
✅ **Subtle pulsing animation for attention**
✅ **Gold shimmer effect for premium feel**
✅ **Easy one-tap access to premium features**
✅ **Consistent with app's cinematic theme**
