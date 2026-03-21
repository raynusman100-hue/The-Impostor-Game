# Premium System Testing Checklist

This document contains manual tests to verify behaviors identified during the premium system audit. Each test corresponds to an issue in `.kiro/specs/premium-system-audit-bugfix/bugfix.md`.

---

## Issue #2: Premium Status Checking - Race Conditions

**Reference:** `.kiro/specs/premium-system-audit-bugfix/bugfix.md` - Issue #2

**Question to Answer:** Does RevenueCat's `getCustomerInfo()` return instantly from cache, or does it wait for network calls?

### Test 2.1: Measure Single Call Performance

**Objective:** Measure how long a single `checkPremiumStatus()` call takes.

**Steps:**
1. Add timing logs to `PremiumManager.checkPremiumStatus()`:
```javascript
export async function checkPremiumStatus(userEmail = null, userId = null) {
    const startTime = Date.now();
    try {
        // ... existing code ...
        const hasPremium = await PurchaseManager.checkProStatus();
        const endTime = Date.now();
        console.log(`⏱️ Premium check took ${endTime - startTime}ms`);
        return hasPremium;
    } catch (error) {
        const endTime = Date.now();
        console.log(`⏱️ Premium check FAILED after ${endTime - startTime}ms`);
        return false;
    }
}
```

2. Open the app and check console logs
3. Record the timing

**Expected Results:**
- **If < 50ms:** RevenueCat is using fast local cache (Scenario A - GOOD)
- **If 100-500ms:** RevenueCat might be making network calls (Scenario B/C - INVESTIGATE)
- **If > 500ms:** Definitely making network calls (Scenario C - PROBLEM)

**Test on:**
- [ ] First app launch (cold start)
- [ ] Second app launch (warm start)
- [ ] With good internet connection
- [ ] With airplane mode ON (offline)

**Results:**
```
Cold start timing: _____ ms
Warm start timing: _____ ms
Online timing: _____ ms
Offline timing: _____ ms
```

---

### Test 2.2: Measure Multiple Simultaneous Calls

**Objective:** See if multiple simultaneous calls cause delays or duplicate network requests.

**Steps:**
1. Add a test function to `PremiumManager.js`:
```javascript
// TEST FUNCTION - Remove after testing
export async function testSimultaneousCalls() {
    console.log('🧪 Starting simultaneous premium check test...');
    const startTime = Date.now();
    
    // Make 5 simultaneous calls
    const promises = [
        checkPremiumStatus(),
        checkPremiumStatus(),
        checkPremiumStatus(),
        checkPremiumStatus(),
        checkPremiumStatus(),
    ];
    
    const results = await Promise.all(promises);
    const endTime = Date.now();
    
    console.log('🧪 Test Results:');
    console.log(`   Total time: ${endTime - startTime}ms`);
    console.log(`   All results identical: ${results.every(r => r === results[0])}`);
    console.log(`   Results: ${JSON.stringify(results)}`);
}
```

2. Call this function from HomeScreen or ProfileScreen on mount
3. Check console logs

**Expected Results:**
- **Scenario A (BEST):** Total time ~50ms, all results identical
- **Scenario B (OK):** Total time ~200-500ms, all results identical (single network call, all waited)
- **Scenario C (BAD):** Total time >1000ms, possible inconsistent results (multiple network calls)

**Test on:**
- [ ] With good internet connection
- [ ] With airplane mode ON (offline)

**Results:**
```
Online - Total time: _____ ms, Results identical: _____
Offline - Total time: _____ ms, Results identical: _____
```

---

### Test 2.3: Monitor Network Requests

**Objective:** Verify if RevenueCat makes actual network calls or uses cache.

**Steps:**
1. Use React Native Debugger or Flipper network inspector
2. Open the app
3. Navigate to ProfileScreen, then HostScreen, then CategorySelectionModal
4. Watch for network requests to RevenueCat servers

**Expected Results:**
- **GOOD:** Only 1 network request on app start, then cache is used
- **OK:** 1 network request per screen, but fast
- **BAD:** Multiple network requests per screen

**Test on:**
- [ ] First app launch
- [ ] Navigating between screens

**Results:**
```
Number of network requests observed: _____
Request URLs: _____
```

---

### Test 2.4: HostScreen Retry Logic

**Objective:** Verify if HostScreen's 3 retry attempts cause performance issues.

**Steps:**
1. Add timing to `HostScreen.js` around premium check:
```javascript
const startTime = Date.now();
const hostPremium = await PremiumManager.checkAndSyncHostPremium(roomCode, user.uid);
const endTime = Date.now();
console.log(`🏠 HostScreen premium sync took ${endTime - startTime}ms`);
```

2. Navigate to HostScreen
3. Check console logs

**Expected Results:**
- **GOOD:** < 100ms total (cache is fast, retries don't matter)
- **OK:** 100-500ms total (one network call, retries use cache)
- **BAD:** > 1000ms total (each retry makes a network call)

**Results:**
```
HostScreen premium sync timing: _____ ms
```

---

## Decision Matrix for Issue #2

Based on test results, determine the appropriate action:

| Test Results | Conclusion | Action |
|--------------|------------|--------|
| All timings < 100ms | RevenueCat cache is fast and efficient | ✅ Mark as "INTENTIONAL - NO FIX NEEDED" |
| Timings 100-500ms, single network call | RevenueCat makes one network call, then caches | ✅ Mark as "INTENTIONAL - NO FIX NEEDED" (acceptable performance) |
| Timings > 500ms, multiple network calls | RevenueCat not caching properly | ⚠️ NEEDS FIX: Add application-level cache |
| Inconsistent results from simultaneous calls | Race condition exists | ⚠️ NEEDS FIX: Add request deduplication |

## Issue #4: Voice Chat - Mid-Session Premium Loss UI

**Reference:** `.kiro/specs/premium-system-audit-bugfix/bugfix.md` - Issue #4

**Question to Answer:** Is the alert message theme-matched and user-friendly?

### Test 4.1: Visual Alert Inspection

**Current Implementation:**
```javascript
Alert.alert(
    'Voice Chat Disconnected',
    'The host\'s premium subscription has expired. Voice chat is no longer available.',
    [{ text: 'OK' }]
);
```

**Objective:** Verify if the alert matches your app's theme and provides good UX.

**Steps:**
1. Simulate premium expiration during voice chat (or manually trigger the alert)
2. Check the alert appearance

**Questions to Answer:**
- [ ] Does the alert use React Native's default styling (white/gray)?
- [ ] Does it match your Kodak film theme?
- [ ] Is the message clear and user-friendly?
- [ ] Should it use a custom modal instead (like ConfirmModal)?

**Expected Results:**
- **If using default Alert:** Consider replacing with themed ConfirmModal component
- **If message is unclear:** Consider more user-friendly wording

**Recommendation:**
If the default alert doesn't match your theme, consider using your existing `ConfirmModal` component:
```javascript
// Instead of Alert.alert, use:
setConfirmModal({
    visible: true,
    title: 'Voice Chat Ended',
    message: 'The host\'s premium has expired. Voice chat is no longer available.',
    onConfirm: () => { /* disconnect logic */ }
});
```

**Results:**
```
Alert appearance: _____
Matches theme: Yes / No
Needs custom modal: Yes / No
```

---


