# Chromatic Aberration Effect Guide 🎨

## What is Chromatic Aberration?

Chromatic aberration is a visual effect that simulates the RGB color split you see in old cameras, VHS tapes, or glitchy digital displays. It creates a retro-futuristic, cinematic look by separating the red, green, and blue color channels.

## Implementation in CategorySelectionModal

### 1. **Header Title Effect**
- **Red channel**: Shifted +2px to the right with 30% opacity
- **Blue/Cyan channel**: Shifted -2px to the left with 30% opacity
- **Main text**: Centered, full opacity
- Creates a subtle RGB split on "FILM GENRES"

### 2. **Category Card Labels**
When a category is selected:
- **Red ghost text**: Shifted +1.5px right, 40% opacity
- **Blue/Cyan ghost text**: Shifted -1.5px left, 40% opacity
- **Main text**: Centered with full color
- Effect is only visible on selected cards

### 3. **Featured "SURPRISE ME" Card**
When selected:
- **Card-level chromatic layers**: RGB split on the entire card background
  - Red layer: +3px right shift
  - Blue layer: -3px left shift
- **Title text chromatic**: Same RGB split on "SURPRISE ME" text
  - Red: +2px right, 50% opacity
  - Cyan: -2px left, 50% opacity

### 4. **Category Card Background Layers**
Selected cards have subtle chromatic layers:
- **Red layer**: Shifted +2px right
- **Blue layer**: Shifted -2px left  
- **Green layer**: Shifted +1px down
- Creates a glowing, glitchy halo effect

## Visual Effect Breakdown

```
Normal Text:     FILM GENRES
                 
With Chromatic:  F̶I̶L̶M̶ ̶G̶E̶N̶R̶E̶S̶  (red, shifted right)
                 F̶I̶L̶M̶ ̶G̶E̶N̶R̶E̶S̶  (cyan, shifted left)
                 FILM GENRES  (main, centered)
                 
Result:          F̷I̷L̷M̷ ̷G̷E̷N̷R̷E̷S̷  (RGB split effect)
```

## Color Channels Used

- **Red**: `#FF0000` - Warm, aggressive shift
- **Cyan**: `#00FFFF` - Cool, opposite of red for maximum contrast
- **Green**: `#00FF00` - Subtle vertical shift for depth

## Opacity Levels

- **Header title**: 30% opacity on ghost layers (subtle)
- **Card labels**: 40% opacity (more visible)
- **Featured card title**: 50% opacity (most prominent)
- **Background layers**: 10-20% opacity (atmospheric)

## When Effects Activate

- Effects only appear on **selected** items
- Creates visual feedback for user interaction
- Reinforces the "film/cinema" theme with VHS-style glitches

## Customization Tips

To adjust the intensity:
1. **Increase shift distance** (translateX/Y values) for more dramatic effect
2. **Increase opacity** for more visible color separation
3. **Add more color channels** (yellow, magenta) for rainbow effect
4. **Animate the shifts** for dynamic glitch effect

## Performance Notes

- Uses absolute positioning for ghost layers (no layout recalculation)
- Minimal performance impact
- Only renders on selected items
- No animations (static effect)

---

**Effect Style**: Retro-futuristic, VHS glitch, cinematic
**Theme Fit**: Perfect for film/movie category selection
**User Experience**: Clear visual feedback for selections
