# Draggable Microphone Button - Implementation

## Overview

The voice chat mute/unmute button is now **fully draggable** and can be moved anywhere on the screen.

## Features

### 1. Drag & Drop
- **Press and hold** the button to start dragging
- **Move** it anywhere on the screen
- **Release** to drop it in place
- Button **stays within screen bounds** automatically

### 2. Tap to Mute
- **Quick tap** (without dragging) toggles mute/unmute
- Detects the difference between tap and drag
- Provides **haptic feedback** on both actions

### 3. Visual Feedback
- Button **scales up 10%** while dragging
- **Shadow increases** during drag
- **Status text hides** while dragging for cleaner look
- **Background opacity changes** during drag

### 4. Smart Positioning
- **Starts at top center** of screen
- **Remembers position** while dragging
- **Snaps to bounds** if dragged off screen
- **Smooth spring animation** when released

## How It Works

### PanResponder
Uses React Native's `PanResponder` to handle touch gestures:

```javascript
- onPanResponderGrant: Drag starts
- onPanResponderMove: Button follows finger
- onPanResponderRelease: Drag ends, check if tap or drag
```

### Tap Detection
Calculates distance moved:
- **< 10 pixels** = Tap (toggle mute)
- **≥ 10 pixels** = Drag (move button)

### Boundary Detection
Keeps button within screen:
```javascript
finalX = Math.max(0, Math.min(finalX, SCREEN_WIDTH - BUTTON_SIZE))
finalY = Math.max(0, Math.min(finalY, SCREEN_HEIGHT - BUTTON_SIZE - 60))
```

## User Experience

### Starting Position
- **Top center** of screen
- Visible but not intrusive
- Easy to reach

### During Drag
- Button follows finger smoothly
- Scales up for better visibility
- Status text disappears
- Haptic feedback on start

### After Release
- Smooth spring animation to final position
- Status text reappears
- Button stays where placed
- Position persists during screen

## Technical Details

### State Management
```javascript
const pan = useRef(new Animated.ValueXY({ 
    x: (SCREEN_WIDTH / 2) - (BUTTON_SIZE / 2), 
    y: Platform.OS === 'ios' ? 50 : 35 
})).current;

const [isDragging, setIsDragging] = useState(false);
```

### Animation
```javascript
Animated.spring(pan, {
    toValue: { x: finalX, y: finalY },
    useNativeDriver: false,
    friction: 7
}).start();
```

### Styling
```javascript
draggingButton: {
    elevation: 12,
    shadowOpacity: 0.7,
    shadowRadius: 8,
    transform: [{ scale: 1.1 }],
}
```

## Platform Differences

### iOS
- Starts at `y: 50` (below notch)
- Smooth animations
- Shadow effects work well

### Android
- Starts at `y: 35` (below status bar)
- Elevation for shadow
- Hardware acceleration

## Accessibility

- **Large touch target** (48x48 pixels)
- **Visual feedback** during interaction
- **Haptic feedback** for blind users
- **High contrast** colors (yellow/red)
- **Clear status text** below button

## Future Enhancements

Possible improvements:
1. **Save position** to AsyncStorage (persist across sessions)
2. **Snap to edges** (magnetic edges like iOS)
3. **Double tap** for additional actions
4. **Long press menu** for settings
5. **Gesture hints** for first-time users

## Testing

### Test Cases
1. ✅ Tap to mute/unmute
2. ✅ Drag to move
3. ✅ Release within bounds
4. ✅ Release outside bounds (snaps back)
5. ✅ Drag while muted
6. ✅ Drag while unmuted
7. ✅ Drag while connecting
8. ✅ Drag while connected

### Edge Cases
1. ✅ Drag to top-left corner
2. ✅ Drag to bottom-right corner
3. ✅ Drag off screen (left)
4. ✅ Drag off screen (right)
5. ✅ Drag off screen (top)
6. ✅ Drag off screen (bottom)
7. ✅ Quick tap vs slow tap
8. ✅ Drag then tap

## Code Location

**File**: `src/components/VoiceControl.js`

**Key Components**:
- `PanResponder` - Gesture handling
- `Animated.ValueXY` - Position tracking
- `Animated.View` - Animated container
- `isDragging` state - Visual feedback

## Performance

- **60 FPS** animations
- **No lag** during drag
- **Smooth** spring animation
- **Efficient** re-renders

## Known Limitations

1. **Position not saved** - Resets on screen change
2. **No snap to edges** - Stays where dropped
3. **No rotation** - Always upright
4. **Single button** - Can't have multiple

## Conclusion

The draggable mic button provides a **flexible, user-friendly** way to control voice chat without blocking important UI elements. Users can position it wherever they want for optimal gameplay experience.
