# Profile Screen: Unsaved Changes Fix

## Issue
Error: `Property 'wheelStateManager' doesn't exist` when saving profile.

## Root Cause
The initial implementation referenced `wheelStateManager` and `existingProfile` variables that don't exist in this version of ProfileScreen.

## Solution
Simplified the implementation to only track username changes using variables that actually exist:
- `user`
- `displayName`
- `username`

## Changes Made

### 1. State Variables (Lines 373-374)
```javascript
const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
const initialStateRef = useRef(null);
```

### 2. Track Initial Username (Lines 376-382)
```javascript
useEffect(() => {
    if (user && displayName && !initialStateRef.current) {
        initialStateRef.current = { username: displayName };
    }
}, [user, displayName]);
```

### 3. Detect Username Changes (Lines 384-395)
```javascript
useEffect(() => {
    if (!initialStateRef.current) {
        setHasUnsavedChanges(false);
        return;
    }

    const currentUsername = username.trim();
    const initialUsername = initialStateRef.current.username || '';
    const hasChanges = currentUsername !== initialUsername && currentUsername !== '';
    setHasUnsavedChanges(hasChanges);
}, [username]);
```

### 4. Navigation Listener (Lines 397-409)
```javascript
useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (e) => {
        if (!hasUnsavedChanges || isSaving) {
            return;
        }
        e.preventDefault();
        Alert.alert('Unsaved Changes', 'You have unsaved changes. Do you want to discard them?', [
            { text: 'Keep Editing', style: 'cancel' },
            { text: 'Discard', style: 'destructive', onPress: () => { setHasUnsavedChanges(false); navigation.dispatch(e.data.action); } }
        ]);
    });
    return unsubscribe;
}, [navigation, hasUnsavedChanges, isSaving]);
```

### 5. Reset After Save (Lines 585-590)
```javascript
// Reset unsaved changes flag and saving state
setHasUnsavedChanges(false);
setIsSaving(false);

// Update initial state ref to current state
initialStateRef.current = {
    username: trimmedUsername
};
```

## How It Works Now

1. When profile loads, stores the initial username from `displayName`
2. Watches for changes to the `username` field
3. If user tries to navigate away with unsaved username changes, shows confirmation
4. After successful save, resets the flag and updates initial state

## Testing

1. Open Profile screen
2. Change username
3. Try to go back
4. Should see "Unsaved Changes" popup
5. Test both "Keep Editing" and "Discard" options
6. Save profile - should navigate without popup

## Status
✅ FIXED - No longer references non-existent variables
