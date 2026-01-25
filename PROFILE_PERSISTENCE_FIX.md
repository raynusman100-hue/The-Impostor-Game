# Profile Persistence Fix

## Issue
When a user logs in with Google, closes the app, and reopens it, they were required to sign in again. The profile was not being persisted properly.

## Root Causes

### 1. Firebase Auth Persistence
Firebase auth was actually configured correctly with `getReactNativePersistence(AsyncStorage)`, so the authentication state should persist. The issue was in the profile loading logic.

### 2. Broken loadProfile Function
The `loadProfile` function was trying to use state setters that didn't exist:
- `setSelectedAvatarId` - doesn't exist
- `setUseCustomAvatar` - doesn't exist  
- `setCustomAvatarConfig` - doesn't exist

This caused the function to fail silently, preventing profile data from loading.

### 3. Missing Profile Data Sync
The profile wasn't being properly synced between:
- Firebase Realtime Database (source of truth)
- AsyncStorage (local cache)
- Component state

## Solution

### 1. Fixed loadProfile Function
```javascript
const loadProfile = async (user) => {
    try {
        // Load from AsyncStorage first (for offline access)
        const savedProfile = await AsyncStorage.getItem('user_profile');
        if (savedProfile) {
            const profile = JSON.parse(savedProfile);
            setExistingProfile(profile);
            if (profile.username) setUsername(profile.username);
        }
        
        // Also load from Firebase (source of truth)
        if (user?.uid) {
            const userRef = ref(database, `users/${user.uid}`);
            const snapshot = await get(userRef);
            
            if (snapshot.exists()) {
                const userData = snapshot.val();
                const firebaseProfile = {
                    username: userData.username,
                    uid: user.uid,
                    email: user.email,
                    updatedAt: userData.updatedAt
                };
                
                setExistingProfile(firebaseProfile);
                if (userData.username) setUsername(userData.username);
                
                // Update local cache
                await AsyncStorage.setItem('user_profile', JSON.stringify(firebaseProfile));
                await AsyncStorage.setItem('displayName', userData.username);
            }
        }
    } catch (error) {
        console.log('Error loading profile', error);
    }
};
```

### 2. Enhanced onAuthStateChanged
Added better logging and immediate profile state setting:
```javascript
useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
        console.log('🔐 Auth state changed:', user ? user.email : 'signed out');
        
        if (user) {
            // Check Firebase for profile
            const userRef = ref(database, `users/${user.uid}`);
            const snapshot = await get(userRef);
            
            if (snapshot.exists() && snapshot.val().username) {
                // Set profile immediately
                setMode('profile_view');
                setUsername(snapshot.val().username);
                setExistingProfile({...});
                
                // Load full profile data
                await loadProfile(user);
            } else {
                setMode('profile_setup');
            }
        } else {
            setMode('signed_out');
            // Clear all state
        }
    });
    return unsubscribe;
}, []);
```

### 3. Data Flow
```
App Opens
    ↓
Firebase Auth checks persistence (AsyncStorage)
    ↓
User authenticated? → onAuthStateChanged fires
    ↓
Check Firebase for profile (/users/{uid})
    ↓
Profile exists? → Load into state
    ↓
Also load from AsyncStorage cache
    ↓
Sync Firebase → AsyncStorage → State
    ↓
User sees their profile (profile_view mode)
```

## How It Works Now

### First Time Sign In
1. User signs in with Google
2. Creates profile with username
3. Profile saved to:
   - Firebase: `/users/{uid}` and `/usernames/{username}`
   - AsyncStorage: `user_profile` and `displayName`
4. State updated: `mode = 'profile_view'`

### App Restart (Persistence)
1. App opens
2. Firebase Auth checks AsyncStorage for auth token
3. User is automatically authenticated
4. `onAuthStateChanged` fires with user object
5. Profile loaded from Firebase
6. Profile synced to AsyncStorage
7. State updated: `mode = 'profile_view'`
8. User sees their profile immediately

### Offline Access
1. User has signed in before
2. App opens offline
3. Firebase Auth loads from AsyncStorage
4. Profile loaded from AsyncStorage cache
5. User can view profile offline
6. When online, Firebase syncs latest data

## Storage Locations

### Firebase Realtime Database
```
/users/{uid}
  - username: "PlayerName"
  - updatedAt: 1234567890

/usernames/{username_lowercase}
  - uid: "user_uid_here"
```

### AsyncStorage (Local Cache)
```
user_profile: {
  username: "PlayerName",
  uid: "user_uid",
  email: "user@example.com",
  updatedAt: "2024-01-01T00:00:00.000Z"
}

displayName: "PlayerName"

wheelState_{uid}: {...} // Wheel configuration
```

## Testing Checklist

### Basic Persistence
- [ ] Sign in with Google
- [ ] Complete profile setup
- [ ] Close app completely
- [ ] Reopen app
- [ ] Verify profile loads automatically (no sign-in required)
- [ ] Verify username is displayed
- [ ] Verify mode is 'profile_view'

### Multiple Sessions
- [ ] Sign in on Device A
- [ ] Close app on Device A
- [ ] Sign in on Device B with same account
- [ ] Close app on Device B
- [ ] Reopen app on Device A
- [ ] Verify profile still loads

### Offline Mode
- [ ] Sign in while online
- [ ] Close app
- [ ] Turn off internet
- [ ] Reopen app
- [ ] Verify profile loads from cache
- [ ] Turn on internet
- [ ] Verify profile syncs with Firebase

### Sign Out
- [ ] Sign in and verify profile loads
- [ ] Sign out
- [ ] Close app
- [ ] Reopen app
- [ ] Verify user is signed out (not auto-signed in)

### Account Switching
- [ ] Sign in with Account A
- [ ] Verify profile loads
- [ ] Sign out
- [ ] Sign in with Account B
- [ ] Verify Account B's profile loads (not Account A's)

## Debug Logging

Added console logs to track the flow:
- `🔐 Auth state changed:` - When auth state changes
- `✅ User has profile in Firebase:` - Profile found in Firebase
- `✅ Profile loaded from cache:` - Profile loaded from AsyncStorage
- `✅ Profile loaded from Firebase:` - Profile loaded from Firebase
- `⚠️ User exists but no username` - User in Firebase but no profile
- `⚠️ No user profile in Firebase` - No profile found
- `❌ Error checking user profile:` - Error during profile check
- `👤 User signed out` - User signed out

## Common Issues

### Profile not loading after restart
- Check console for error messages
- Verify Firebase rules allow read access
- Check AsyncStorage for `user_profile` key
- Verify user has profile in Firebase `/users/{uid}`

### Wrong profile loading
- Clear AsyncStorage completely
- Sign out and sign in again
- Check that user-scoped keys are being used

### Profile loads but username is empty
- Check Firebase `/users/{uid}` has `username` field
- Verify `setUsername()` is being called
- Check `existingProfile` state

## Files Modified

- `src/screens/ProfileScreen.js` - Fixed loadProfile and onAuthStateChanged
- `src/utils/firebase.js` - Already had correct persistence setup

## Related Systems

- Firebase Authentication (auth persistence)
- Firebase Realtime Database (profile storage)
- AsyncStorage (local caching)
- WheelStateManager (avatar wheel persistence)
- PremiumManager (premium status persistence)
