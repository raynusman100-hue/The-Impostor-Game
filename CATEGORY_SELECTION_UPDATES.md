# Category Selection Modal Updates

## Changes Made

### 1. **Ball Knowledge Positioning**
- Moved Ball Knowledge to display below the Premium card
- Remains as an expandable full-width card with subcategories (Football, Basketball)

### 2. **Premium Card Redesign**
- **Standalone Component**: Premium card is now completely independent from category selection
- **Always Yellow**: Uses fixed yellow gradient (`#FFC700` to `#FFB800`) regardless of theme or selection state
- **Non-Interactive with Categories**: Clicking Premium doesn't affect category selection
- **Transaction Ready**: Added `handlePremiumPress()` function (placeholder for future transaction screen navigation)
- **Visual Improvements**:
  - Dark text (`#1A1A1A`) for better contrast on yellow background
  - Arrow indicator (→) instead of checkmark to show it's a navigation action
  - Chromatic aberration effects for visual depth
  - Dark semi-transparent badge for "✨ PREMIUM" text

### 3. **Category Organization**
- **Premium Locked First**: Premium locked categories now appear at the top of the grid (after "All")
- **Free Categories After**: Free/unlocked categories appear after premium ones
- **Order**: All → Premium Locked → Free Categories → Ball Knowledge

### 4. **Unlocked Categories**
- **Places**: Changed from `premium: true` to `free: true`
- **Food**: Changed from `premium: true` to `free: true`

### 5. **Visual Hierarchy**
```
┌─────────────────────────────┐
│   PREMIUM CARD (Yellow)     │  ← Standalone, navigates to purchase
├─────────────────────────────┤
│   BALL KNOWLEDGE ▼          │  ← Expandable, BELOW PREMIUM
│   [Football] [Basketball]   │
├─────────────────────────────┤
│   SELECT CATEGORIES         │
├─────────────────────────────┤
│ [All] [Movies🔒] [Games🔒]  │  ← Premium locked first
│ [Trends🔒] [Sport🔒] etc.   │
│ [Daily Life] [Things]       │  ← Free categories
│ [Places] [Food] [Objects]   │
└─────────────────────────────┘
```

## Technical Implementation

### Files Modified
1. **src/utils/words.js**
   - Updated `places` and `food` from `premium: true` to `free: true`

2. **src/components/CategorySelectionModal.js**
   - Added `handlePremiumPress()` function
   - Separated categories into `premiumCategories` and `freeCategories`
   - Renamed `featuredCard` styles to `premiumCard` styles
   - Removed conditional styling based on selection state
   - Fixed yellow gradient and dark text colors
   - Reordered category rendering logic

### Key Functions
```javascript
const handlePremiumPress = () => {
    playHaptic('selection');
    // TODO: Navigate to transaction/purchase screen
    console.log('Navigate to Premium Purchase Screen');
};

const premiumCategories = CATEGORY_LABELS.filter(c => c.premium && c.key !== 'all' && c.key !== 'ballKnowledge');
const freeCategories = CATEGORY_LABELS.filter(c => (c.free || !c.premium) && c.key !== 'all' && c.key !== 'ballKnowledge');
```

## Next Steps
- Implement navigation to transaction/purchase screen in `handlePremiumPress()`
- Add purchase flow integration
- Consider adding more visual feedback when Premium card is pressed

## Testing Checklist
- [ ] Premium card displays with yellow background
- [ ] Premium card text is readable (dark on yellow)
- [ ] Clicking Premium card doesn't affect category selection
- [ ] Premium locked categories show lock icon (🔒)
- [ ] Premium locked categories appear before free ones
- [ ] Places and Food are unlocked and selectable
- [ ] Ball Knowledge appears at the bottom
- [ ] Ball Knowledge expands to show subcategories
- [ ] Category selection still works correctly
