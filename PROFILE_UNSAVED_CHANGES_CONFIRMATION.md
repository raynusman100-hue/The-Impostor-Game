# Profile Screen: Unsaved Changes Confirmation

## Implementation Summary

Added confirmation dialog when user tries to navigate back from Profile screen with unsaved changes.

## What Was Implemented

### 1. **Unsaved Changes Tracking**
- Added `hasUnsavedChanges` state to track if profile has been modified
- Added `initialStateRef` to store the initial state when entering edit mode
- Tracks changes to:
  - Username
  - Avatar wheel state (all 12 avatar slots)

### 2. **Navigation Interception**
- Added `beforeRemove` navigation listener to intercept back navigation
- Shows confirmation dialog: "You have unsaved changes. Are you sure you want to leave?"
- Options:
  - **Stay**: Cancels navigation, keeps user on profile screen
  - **Leave**: Discards changes and navigates back

### 3. **Android Hardware Back Button**
- Enhanced Android back button handler to check for unsaved changes
- Shows same confirmation dialog as iOS swipe-back gesture
- Maintains existing behavior for incomplete profile setup

### 4. **Save Profile Updates**
- Resets unsaved changes tracking after successful save
- Clears initial state reference to start fresh tracking

## User Experience

### Scenario 1: User Edits Profile
1. User navigates to Profile screen
2. User changes username or modifies avatars
3. User presses back button or swipes back
4. **Alert appears**: "Unsaved Changes - You have unsaved changes. Are you sure you want to leave?"
5. User can choose to stay or leave

### Scenario 2: User Saves Profile
1. User makes changes
2. User taps "SAVE PROFILE"
3. Changes are saved
4. Unsaved changes flag is reset
5. User can navigate back without confirmation

### Scenario 3: First-Time Setup
1. New user signs in
2. Must complete profile setup
3. Cannot navigate back until profile is saved
4. Shows: "Profile Incomplete - Please complete your profile setup before continuing."

## Technical Details

### State Management
```javascript
const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
const initialStateRef = useRef(null);
```

### Change Detection
- Compares current username with initial username
- Compares current wheel state JSON with initial wheel state JSON
- Updates `hasUnsavedChanges` whenever username or wheel state changes

### Navigation Listener
```javascript
navigation.addListener('beforeRemove', (e) => {
  if (mode === 'profile_setup' && hasUnsavedChanges) {
    e.preventDefault();
    // Show confirmation dialog
  }
});
```

## Files Modified

- `src/screens/ProfileScreen.js`
  - Added unsaved changes tracking
  - Added navigation interception
  - Enhanced Android back button handler
  - Updated save handler to reset tracking

## Testing Checklist

- [ ] Edit username and try to go back → Shows confirmation
- [ ] Edit avatars and try to go back → Shows confirmation
- [ ] Save profile and go back → No confirmation
- [ ] First-time setup → Cannot go back until saved
- [ ] Android hardware back button → Works correctly
- [ ] iOS swipe back gesture → Works correctly
- [ ] "Stay" button → Keeps user on screen
- [ ] "Leave" button → Navigates back and discards changes

## Notes

- Works on both iOS and Android
- Handles both swipe-back gestures and button presses
- Does not interfere with normal navigation when no changes made
- Maintains existing first-time setup protection
