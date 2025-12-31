# Adding New Dark Theme Card Covers

## Step 1: Save the Images
Save the 4 new dark theme cover images you provided to the `assets` folder with these names:

1. **Vampire Character** → `assets/cover_dark_vampire.png`
2. **Artist Character** → `assets/cover_dark_artist.png` 
3. **Soldier Character** → `assets/cover_dark_soldier.png`
4. **Meditation Character** → `assets/cover_dark_meditation.png`

## Step 2: Update RoleCard.js
In `src/components/RoleCard.js`, find the `THEME_COVER_IMAGES` object and uncomment the new cover lines:

```javascript
'retro-pop': [
    require('../../assets/cover_midnight_1.png'),
    require('../../assets/cover_midnight_2.png'),
    require('../../assets/cover_midnight_3.png'),
    require('../../assets/cover_midnight_4.png'),
    require('../../assets/cover_midnight_5.png'),
    // Uncomment these lines after saving the images:
    require('../../assets/cover_dark_vampire.png'),
    require('../../assets/cover_dark_artist.png'),
    require('../../assets/cover_dark_soldier.png'),
    require('../../assets/cover_dark_meditation.png'),
]
```

## Step 3: Test the Implementation
1. Switch to the "Midnight" theme in the app
2. Start a new game and check the role reveal screen
3. The new dark covers should now appear randomly for different players

## Current Dark Theme Covers
The dark theme (`retro-pop`) currently has:
- 5 existing midnight covers (cover_midnight_1.png through cover_midnight_5.png)
- 4 new character covers (once you add them)
- Total: 9 different covers for variety

## Theme System
The card cover system automatically:
- Uses theme-specific covers when available
- Falls back to default covers if theme covers aren't defined
- Randomly selects covers for each player
- Supports sequential cover assignment if needed

## Benefits
- More visual variety for the dark theme
- Character-themed covers that match the dark aesthetic
- Better player experience with unique card designs
- Maintains consistency with the dark theme's visual style