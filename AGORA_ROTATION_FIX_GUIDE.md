# Agora Rotation System Fix Guide

## Problem Identified

Your Agora rotation system is set up in Firebase, but the app is using a **hardcoded App ID** instead of fetching from Firebase.

**Current Setup:**
- ✅ Firebase has 3 Agora accounts configured
- ✅ Rotation scripts work correctly
- ❌ App uses hardcoded ID: `712b822c94dc41d6b4a80caa4b7ad0bc`
- ❌ App doesn't fetch from Firebase rotation pool

**Your Firebase Pool:**
1. Account 1: `5756bd3b457b4ecdac763e0ce74cd044` (The Imposter Game)
2. Account 2: `8fd2593a98744c1e947481cc84f339e2` (Imp)
3. Account 3: `4ed4a4305a4d4159aee9efd2ef4758f6` (impostor)

## Solution: Make App Use Firebase Rotation

### Step 1: Update VoiceChatContext to Fetch from Firebase

The app needs to fetch the current App ID from Firebase before initializing Agora.

**File:** `src/utils/VoiceChatContext.js`

Add this import at the top:
```javascript
import { database } from './firebase';
import { ref, get, child, onValue } from 'firebase/database';
```

Add state for dynamic App ID:
```javascript
const [currentAppId, setCurrentAppId] = useState(null);
const [appIdLoading, setAppIdLoading] = useState(true);
```

Add function to fetch App ID from Firebase:
```javascript
const fetchCurrentAppId = async () => {
    try {
        console.log('🎤 Fetching current Agora App ID from Firebase...');
        const dbRef = ref(database);
        const snapshot = await get(child(dbRef, 'config/agoraAccounts'));
        
        if (snapshot.exists()) {
            const data = snapshot.val();
            const accounts = data.accounts || [];
            const currentIndex = data.currentIndex || 0;
            const currentAccount = accounts[currentIndex];
            
            if (currentAccount && currentAccount.id) {
                console.log(`🎤 ✅ Using App ID from: ${currentAccount.name}`);
                console.log(`🎤 App ID: ${currentAccount.id.slice(0, 8)}...${currentAccount.id.slice(-8)}`);
                setCurrentAppId(currentAccount.id);
                return currentAccount.id;
            } else {
                throw new Error('No valid account found in pool');
            }
        } else {
            throw new Error('Agora config not found in Firebase');
        }
    } catch (error) {
        console.error('🎤 ❌ Error fetching App ID from Firebase:', error);
        console.log('🎤 ⚠️ Falling back to hardcoded App ID');
        setCurrentAppId(AGORA_APP_ID); // Fallback to hardcoded
        return AGORA_APP_ID;
    } finally {
        setAppIdLoading(false);
    }
};
```

Update initializeEngine to use fetched App ID:
```javascript
const initializeEngine = async () => {
    if (!VOICE_CHAT_ENABLED) {
        console.log('🎤 Voice chat is disabled');
        return;
    }

    if (agoraEngineRef.current) {
        console.log('🎤 Engine already initialized');
        return;
    }

    try {
        // FETCH APP ID FROM FIREBASE FIRST
        const appId = await fetchCurrentAppId();
        
        if (!appId || appId.includes('placeholder')) {
            throw new Error('Invalid Agora App ID');
        }

        console.log('🎤 Creating Agora engine...');
        const engine = createAgoraRtcEngine();
        agoraEngineRef.current = engine;

        console.log('🎤 Initializing engine with fetched App ID...');
        engine.initialize({ appId: appId }); // Use fetched ID

        // Rest of initialization...
        engine.enableAudio();
        // ... etc
        
    } catch (error) {
        console.error('🎤 ❌ Failed to initialize:', error);
    }
};
```

### Step 2: Add Real-Time Listener (Optional but Recommended)

Add a listener to detect when rotation happens:

```javascript
useEffect(() => {
    // Listen for App ID changes in Firebase
    const configRef = ref(database, 'config/agoraAccounts');
    
    const unsubscribe = onValue(configRef, (snapshot) => {
        if (snapshot.exists()) {
            const data = snapshot.val();
            const accounts = data.accounts || [];
            const currentIndex = data.currentIndex || 0;
            const newAppId = accounts[currentIndex]?.id;
            
            if (newAppId && newAppId !== currentAppId) {
                console.log('🎤 🔄 App ID rotation detected!');
                console.log(`🎤 New App ID: ${newAppId.slice(0, 8)}...${newAppId.slice(-8)}`);
                // Note: Existing rooms will continue with old ID
                // New rooms will use new ID
                setCurrentAppId(newAppId);
            }
        }
    });

    return () => unsubscribe();
}, [currentAppId]);
```

### Step 3: Update Debug Component

**File:** `src/components/VoiceChatDebug.js`

Show which account is being used:

```javascript
import { useState, useEffect } from 'react';
import { database } from '../utils/firebase';
import { ref, get, child } from 'firebase/database';

export default function VoiceChatDebug() {
    const { isJoined, remoteUsers, isMuted, currentChannel } = useVoiceChat();
    const [accountInfo, setAccountInfo] = useState(null);

    useEffect(() => {
        const fetchAccountInfo = async () => {
            try {
                const dbRef = ref(database);
                const snapshot = await get(child(dbRef, 'config/agoraAccounts'));
                if (snapshot.exists()) {
                    const data = snapshot.val();
                    const accounts = data.accounts || [];
                    const currentIndex = data.currentIndex || 0;
                    setAccountInfo({
                        name: accounts[currentIndex]?.name,
                        id: accounts[currentIndex]?.id,
                        index: currentIndex,
                        total: accounts.length
                    });
                }
            } catch (error) {
                console.error('Error fetching account info:', error);
            }
        };
        fetchAccountInfo();
    }, []);

    return (
        <View style={styles.container}>
            <ScrollView style={styles.scrollView}>
                <Text style={styles.text}>Platform: {Platform.OS}</Text>
                
                {accountInfo && (
                    <>
                        <Text style={styles.text}>Account: {accountInfo.name}</Text>
                        <Text style={styles.text}>App ID: {accountInfo.id?.slice(0, 8)}...{accountInfo.id?.slice(-8)}</Text>
                        <Text style={styles.text}>Pool: {accountInfo.index + 1}/{accountInfo.total}</Text>
                    </>
                )}
                
                {/* Rest of debug info */}
            </ScrollView>
        </View>
    );
}
```

## Step 4: Verify Firebase Configuration

### Check Firebase Console

1. Go to: https://console.firebase.google.com/
2. Select project: `imposter-game-e5f12`
3. Go to **Realtime Database**
4. Navigate to: `config/agoraAccounts`
5. Verify structure:

```json
{
  "config": {
    "agoraAccounts": {
      "accounts": [
        {
          "id": "5756bd3b457b4ecdac763e0ce74cd044",
          "name": "Account 1 (The Imposter Game)",
          "status": "active"
        },
        {
          "id": "8fd2593a98744c1e947481cc84f339e2",
          "name": "Account 2 (Imp)",
          "status": "standby"
        },
        {
          "id": "4ed4a4305a4d4159aee9efd2ef4758f6",
          "name": "Account 3 (impostor)",
          "status": "standby"
        }
      ],
      "currentIndex": 0,
      "lastRotated": 1234567890,
      "status": "Active"
    }
  }
}
```

### Set Firebase Rules

Make sure the config is readable:

```json
{
  "rules": {
    "config": {
      ".read": true,
      ".write": false
    }
  }
}
```

## Step 5: Test the Rotation System

### Initial Setup

1. **Seed the pool** (if not done):
```bash
node scripts/seedAgoraPool.js
```

2. **Check status**:
```bash
node scripts/checkAgoraStatus.js
```

Should show:
```
📊 STATUS:
   Current Index: 0
   Active Account: Account 1 (The Imposter Game)
   Active ID:      5756bd3b457b4ecdac763e0ce74cd044
```

### Test Rotation

1. **Create a room** with current account
2. **Rotate to next account**:
```bash
node scripts/rotateAgora.js
```

3. **Check new status**:
```bash
node scripts/checkAgoraStatus.js
```

Should show:
```
📊 STATUS:
   Current Index: 1
   Active Account: Account 2 (Imp)
   Active ID:      8fd2593a98744c1e947481cc84f339e2
```

4. **Create a NEW room** - should use Account 2
5. **Old room** - still uses Account 1 (this is correct!)

## Step 6: Verify All Agora Accounts

### Check Each Account in Agora Console

For each App ID, verify in https://console.agora.io/:

#### Account 1: 5756bd3b457b4ecdac763e0ce74cd044
- ✅ Project enabled
- ✅ App Certificate: DISABLED (for testing)
- ✅ Usage: Under 10,000 min/month
- ✅ Status: Active

#### Account 2: 8fd2593a98744c1e947481cc84f339e2
- ✅ Project enabled
- ✅ App Certificate: DISABLED (for testing)
- ✅ Usage: Under 10,000 min/month
- ✅ Status: Active

#### Account 3: 4ed4a4305a4d4159aee9efd2ef4758f6
- ✅ Project enabled
- ✅ App Certificate: DISABLED (for testing)
- ✅ Usage: Under 10,000 min/month
- ✅ Status: Active

### Important Settings for Each Account

1. **Authentication**: App Certificate should be DISABLED for testing
2. **Features**: Enable "Voice Calling" (RTC)
3. **Usage**: Monitor to stay under free tier
4. **Status**: All projects should be "Enabled"

## Step 7: Testing Checklist

### Before Testing:
- [ ] Firebase has 3 accounts configured
- [ ] All 3 Agora accounts are enabled
- [ ] App fetches from Firebase (not hardcoded)
- [ ] Firebase rules allow reading config
- [ ] Built with dev build (not Expo Go)

### Test Scenario 1: Single Account
1. Check current account: `node scripts/checkAgoraStatus.js`
2. Create room on Device 1
3. Join room on Device 2
4. Verify voice works
5. Check debug panel shows correct App ID

### Test Scenario 2: After Rotation
1. Rotate: `node scripts/rotateAgora.js`
2. Create NEW room on Device 1
3. Join NEW room on Device 2
4. Verify voice works with new account
5. Old room should still work with old account

### Test Scenario 3: All Accounts
1. Test Account 1 (index 0)
2. Rotate and test Account 2 (index 1)
3. Rotate and test Account 3 (index 2)
4. Rotate back to Account 1 (index 0)

## Troubleshooting

### Issue: App still uses hardcoded ID

**Check:**
- Did you update VoiceChatContext.js?
- Is Firebase fetch function being called?
- Check console logs for "Fetching current Agora App ID"

**Solution:**
- Make sure `fetchCurrentAppId()` is called before `engine.initialize()`
- Check Firebase rules allow reading
- Verify network connection

### Issue: Firebase fetch fails

**Check:**
- Firebase config in constants.js is correct
- Database URL is correct
- Rules allow reading config path

**Solution:**
- Test Firebase connection separately
- Check console for specific error
- Verify path: `config/agoraAccounts`

### Issue: Voice works with one account but not others

**Check:**
- All accounts enabled in Agora console
- All accounts have App Certificate DISABLED
- All accounts under usage limits

**Solution:**
- Log into each Agora account
- Verify project status
- Check usage/billing tab

### Issue: Rotation doesn't take effect

**Remember:**
- Existing rooms keep using old account
- Only NEW rooms use rotated account
- This is by design (prevents disruption)

**To test:**
- Create a completely new room after rotation
- Don't rejoin old rooms

## Production Considerations

### When to Rotate

**Manual Rotation:**
- When approaching 10,000 min limit
- When testing different accounts
- When troubleshooting issues

**Automatic Rotation (Future):**
- Set up Cloud Function to rotate daily
- Monitor usage and rotate at 80% limit
- Rotate on errors/failures

### Monitoring

**Track Usage:**
```javascript
// Add to Firebase
{
  "config": {
    "agoraAccounts": {
      "accounts": [...],
      "usageTracking": {
        "account1": { "minutes": 5420, "lastUpdated": 1234567890 },
        "account2": { "minutes": 3210, "lastUpdated": 1234567890 },
        "account3": { "minutes": 1890, "lastUpdated": 1234567890 }
      }
    }
  }
}
```

### Scaling Beyond 3 Accounts

If you need more accounts:

1. Create more Agora projects
2. Add to `seedAgoraPool.js`:
```javascript
const myAccounts = [
    // ... existing 3 accounts
    {
        id: "new-app-id-here",
        name: "Account 4",
        status: "standby"
    },
    // Add more as needed
];
```

3. Re-run: `node scripts/seedAgoraPool.js`

## Summary

**The Fix:**
1. ✅ App fetches App ID from Firebase (not hardcoded)
2. ✅ Uses current account from rotation pool
3. ✅ Listens for rotation changes
4. ✅ Shows which account is active in debug

**Benefits:**
- 30,000 free minutes/month (3 accounts × 10,000)
- Easy rotation with one command
- No app rebuild needed for rotation
- Automatic failover to hardcoded ID if Firebase fails

**Next Steps:**
1. Update VoiceChatContext.js with Firebase fetch
2. Test with current account
3. Rotate and test with next account
4. Monitor usage in Agora console

🎤 **Your rotation system will now work!**
