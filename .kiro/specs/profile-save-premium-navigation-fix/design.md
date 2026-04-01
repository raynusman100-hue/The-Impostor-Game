# Profile Save Premium Navigation Fix - Bugfix Design

## Overview

This bugfix restores the deterministic save counter mechanism in ProfileScreen that was incorrectly replaced with random probability. The original design intended to show the premium screen every 3rd save using a counter stored in AsyncStorage, but was mistakenly "fixed" to use Math.random() < 0.33, which shows it randomly instead of deterministically. The fix will implement a proper counter that increments on each save, shows the premium screen on the 3rd save, and resets to 1 after showing the premium screen.

## Glossary

- **Bug_Condition (C)**: The condition that triggers the bug - when the save button is clicked and the system uses Math.random() instead of a deterministic counter
- **Property (P)**: The desired behavior - a deterministic counter that shows premium screen every 3rd save
- **Preservation**: Existing save functionality (local save, cloud sync, navigation, haptics, validation) that must remain unchanged
- **handleSaveProfile**: The function in `src/screens/ProfileScreen.js` that handles profile saving and navigation logic
- **profile_save_count**: The AsyncStorage key that stores the save counter value (1, 2, or 3)
- **Save Counter**: An integer value (1, 2, or 3) that tracks how many times the user has saved their profile

## Bug Details

### Bug Condition

The bug manifests when a non-premium user clicks the save button in ProfileScreen. The handleSaveProfile function uses Math.random() < 0.33 to determine whether to show the premium screen, resulting in random behavior instead of the intended deterministic "every 3rd save" pattern.

**Formal Specification:**
```
FUNCTION isBugCondition(input)
  INPUT: input of type { saveButtonClicked: boolean, isPremiumUser: boolean }
  OUTPUT: boolean
  
  RETURN input.saveButtonClicked == true
         AND input.isPremiumUser == false
         AND currentImplementationUsesRandomLogic()
         AND NOT deterministicCounterExists()
END FUNCTION
```

### Examples

- **Example 1**: User saves profile for the 1st time → Expected: Navigate to Home (counter=1), Actual: 33% chance of Premium screen (random)
- **Example 2**: User saves profile for the 2nd time → Expected: Navigate to Home (counter=2), Actual: 33% chance of Premium screen (random)
- **Example 3**: User saves profile for the 3rd time → Expected: Navigate to Premium (counter=3, then reset to 1), Actual: 33% chance of Premium screen (random)
- **Edge Case**: Premium user saves profile → Expected: Always navigate to Home (counter still increments but Premium screen never shown)

## Expected Behavior

### Preservation Requirements

**Unchanged Behaviors:**
- Profile data must continue to save locally to AsyncStorage immediately
- Background cloud sync to Firebase must continue without blocking navigation
- Username validation (trim, length check) must continue to work
- Haptic feedback (medium on start, success on complete, error on failure) must continue to play
- Button state management (setIsSaving) must continue to work correctly
- Error handling and alerts must continue to display for validation and save failures
- Local state updates (setDisplayName) must continue to work
- Premium users must continue to skip the premium screen entirely

**Scope:**
All inputs that do NOT involve the premium screen navigation decision should be completely unaffected by this fix. This includes:
- Profile save operations (local and cloud)
- Username validation and trimming
- Avatar selection and custom avatar configuration
- Haptic feedback and button state management
- Error handling and user feedback

## Hypothesized Root Cause

Based on the bug description, the issue is clear:

1. **Incorrect Logic Implementation**: Someone replaced the deterministic counter logic with Math.random() < 0.33, thinking it would achieve "1 in 3" behavior, but this creates random probability instead of deterministic "every 3rd save" behavior

2. **Missing AsyncStorage Counter**: The current implementation does not load, increment, or store a counter in AsyncStorage with key 'profile_save_count'

3. **No Counter Reset Logic**: The current implementation does not reset the counter to 1 after showing the premium screen on the 3rd save

## Correctness Properties

Property 1: Bug Condition - Deterministic Save Counter

_For any_ save operation where a non-premium user clicks the save button, the fixed handleSaveProfile function SHALL load the counter from AsyncStorage (key 'profile_save_count'), increment it, show the premium screen if counter equals 3 (then reset to 1), or navigate to Home if counter is 1 or 2.

**Validates: Requirements 2.1, 2.2, 2.3, 2.4, 2.5**

Property 2: Preservation - Existing Save Functionality

_For any_ save operation, the fixed handleSaveProfile function SHALL continue to perform local AsyncStorage save, background cloud sync, username validation, haptic feedback, button state management, and error handling exactly as the original function does, preserving all existing save functionality.

**Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8**

## Fix Implementation

### Changes Required

**File**: `src/screens/ProfileScreen.js`

**Function**: `handleSaveProfile`

**Specific Changes**:

1. **Load Counter from AsyncStorage**: Before checking premium status, load the current counter value from AsyncStorage with key 'profile_save_count'. If the key doesn't exist, initialize it to 0.

2. **Increment Counter**: Increment the loaded counter value by 1.

3. **Check Counter Value**: 
   - If counter equals 3: Set shouldShowPremium to true for non-premium users, and reset counter to 1
   - If counter is 1 or 2: Set shouldShowPremium to false

4. **Save Counter Back to AsyncStorage**: Store the updated counter value (or reset value of 1) back to AsyncStorage with key 'profile_save_count'

5. **Remove Random Logic**: Replace the line `const shouldShowPremium = !hasPremium && Math.random() < 0.33;` with the deterministic counter logic

6. **Ensure setIsSaving(false) Before Navigation**: Verify that setIsSaving(false) is called before both navigation.navigate('Premium') and navigation.navigate('Home') calls (this is already correct in the current code)

**Implementation Details**:
```javascript
// Load counter from AsyncStorage
const counterStr = await AsyncStorage.getItem('profile_save_count');
let counter = counterStr ? parseInt(counterStr, 10) : 0;

// Increment counter
counter = counter + 1;

// Check if counter is 3
let shouldShowPremium = false;
if (counter === 3) {
    shouldShowPremium = !hasPremium; // Only show for non-premium users
    counter = 1; // Reset counter to 1
}

// Save counter back to AsyncStorage
await AsyncStorage.setItem('profile_save_count', counter.toString());
```

## Testing Strategy

### Validation Approach

The testing strategy follows a two-phase approach: first, surface counterexamples that demonstrate the bug on unfixed code (random behavior), then verify the fix works correctly (deterministic counter) and preserves existing save functionality.

### Exploratory Bug Condition Checking

**Goal**: Surface counterexamples that demonstrate the bug BEFORE implementing the fix. Confirm that the current implementation uses random logic instead of a deterministic counter.

**Test Plan**: Write tests that simulate multiple save operations and verify that the premium screen appears randomly rather than deterministically every 3rd time. Run these tests on the UNFIXED code to observe the random behavior.

**Test Cases**:
1. **Random Behavior Test**: Simulate 30 saves and verify that premium screen appears approximately 10 times (33%) but NOT exactly on saves 3, 6, 9, etc. (will pass on unfixed code, demonstrating randomness)
2. **No Counter Storage Test**: Verify that AsyncStorage key 'profile_save_count' is never read or written (will pass on unfixed code)
3. **No Counter Reset Test**: Verify that there is no logic to reset a counter to 1 after showing premium screen (will pass on unfixed code)

**Expected Counterexamples**:
- Premium screen appears randomly across saves, not deterministically every 3rd save
- AsyncStorage key 'profile_save_count' is never accessed
- No counter increment or reset logic exists

### Fix Checking

**Goal**: Verify that for all save operations, the fixed function uses a deterministic counter that shows the premium screen every 3rd save.

**Pseudocode:**
```
FOR ALL saveOperation WHERE isBugCondition(saveOperation) DO
  result := handleSaveProfile_fixed(saveOperation)
  ASSERT counterIsLoadedFromAsyncStorage(result)
  ASSERT counterIsIncremented(result)
  ASSERT premiumScreenShownOnThirdSave(result)
  ASSERT counterResetToOneAfterThirdSave(result)
END FOR
```

### Preservation Checking

**Goal**: Verify that for all save operations, the fixed function continues to perform local save, cloud sync, validation, haptics, and error handling exactly as before.

**Pseudocode:**
```
FOR ALL saveOperation DO
  ASSERT localAsyncStorageSaveOccurs(saveOperation)
  ASSERT backgroundCloudSyncOccurs(saveOperation)
  ASSERT usernameValidationOccurs(saveOperation)
  ASSERT hapticFeedbackPlays(saveOperation)
  ASSERT buttonStateManagementWorks(saveOperation)
  ASSERT errorHandlingWorks(saveOperation)
END FOR
```

**Testing Approach**: Property-based testing is recommended for preservation checking because:
- It generates many test cases automatically across different save scenarios
- It catches edge cases like empty usernames, long usernames, network failures
- It provides strong guarantees that existing save functionality is unchanged

**Test Plan**: Observe behavior on UNFIXED code first for profile saves, validation, and error handling, then write property-based tests capturing that behavior.

**Test Cases**:
1. **Profile Save Preservation**: Observe that profile data saves to AsyncStorage correctly on unfixed code, then verify this continues after fix
2. **Validation Preservation**: Observe that username validation (trim, length) works on unfixed code, then verify this continues after fix
3. **Haptic Preservation**: Observe that haptic feedback plays correctly on unfixed code, then verify this continues after fix
4. **Error Handling Preservation**: Observe that error alerts display correctly on unfixed code, then verify this continues after fix

### Unit Tests

- Test counter initialization (first save should set counter to 1)
- Test counter increment (saves 1 and 2 should increment counter)
- Test counter reset (3rd save should reset counter to 1)
- Test premium user bypass (premium users should always go to Home, counter still increments)
- Test AsyncStorage persistence (counter should persist across app sessions)

### Property-Based Tests

- Generate random sequences of save operations and verify counter increments correctly
- Generate random premium/non-premium user states and verify navigation logic
- Test that all save operations continue to save profile data correctly regardless of counter value

### Integration Tests

- Test full flow: 3 consecutive saves should show premium screen on 3rd save
- Test counter persistence: Save, close app, reopen, save again - counter should continue from previous value
- Test premium user flow: Premium users should never see premium screen regardless of counter
- Test navigation flow: Verify PremiumScreen navigates to Home correctly after being shown
