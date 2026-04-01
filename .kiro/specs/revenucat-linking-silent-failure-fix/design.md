# RevenueCat Linking Silent Failure Bugfix Design

## Overview

This bugfix addresses the silent failure of RevenueCat user linking during Google sign-in and app startup. Currently, when `linkUserToRevenueCat()` fails, errors are caught and logged but no diagnostic information is captured, preventing developers from identifying root causes (SDK initialization timing, API key issues, network problems, or platform mismatches). Users who experience linking failures don't appear in the RevenueCat dashboard, making them unsearchable and preventing manual premium entitlement grants.

The fix adds comprehensive error diagnostics, user-facing warnings for sign-in failures, and optional retry logic for app startup failures, while preserving all existing successful linking behavior.

## Glossary

- **Bug_Condition (C)**: The condition that triggers the bug - when RevenueCat linking fails but the error is silently caught without diagnostic information
- **Property (P)**: The desired behavior when linking fails - detailed error diagnostics are logged and users are notified appropriately
- **Preservation**: Existing successful linking behavior, premium status caching, and sign-in flow completion that must remain unchanged
- **linkUserToRevenueCat**: The method in `src/utils/PurchaseManager.js` that calls `Purchases.logIn()` to associate a Firebase UID with a RevenueCat customer
- **SDK Initialization State**: Whether `Purchases.configure()` has been called and completed before attempting to link a user
- **Customer Info**: The RevenueCat object returned by `Purchases.logIn()` containing entitlements and user data

## Bug Details

### Bug Condition

The bug manifests when `linkUserToRevenueCat()` is called and the RevenueCat SDK throws an error. The current implementation catches all errors, logs a generic message to console, and returns false without capturing diagnostic information. This prevents developers from determining whether the failure was due to SDK not being initialized, incorrect API keys, network connectivity issues, or platform configuration problems.

**Formal Specification:**
```
FUNCTION isBugCondition(input)
  INPUT: input of type { firebaseUserId: string, context: 'sign-in' | 'app-startup' }
  OUTPUT: boolean
  
  RETURN linkUserToRevenueCat(input.firebaseUserId) throws error
         AND error is caught silently
         AND no diagnostic information is captured
         AND (context === 'sign-in' AND user sees no warning)
            OR (context === 'app-startup' AND no retry attempted)
END FUNCTION
```

### Examples

- **Sign-in Context**: User signs in with Google on ProfileScreen, RevenueCat SDK is not initialized yet, `Purchases.logIn()` throws "SDK not configured", error is logged but user sees no warning and completes sign-in successfully
- **App Startup Context**: Existing signed-in user opens app, AppInitializer calls `linkUserToRevenueCat()`, network request fails, error is logged but no retry is attempted and app continues normally
- **API Key Mismatch**: Android device with iOS API key configured, `Purchases.logIn()` fails with platform error, no diagnostic captures the platform/API key mismatch
- **Edge Case - Success**: User signs in, RevenueCat linking succeeds, customer info is returned and cached - this should continue working exactly as before

## Expected Behavior

### Preservation Requirements

**Unchanged Behaviors:**
- When RevenueCat linking succeeds, the system must continue to update cached premium status from returned customer info
- When RevenueCat linking succeeds, the system must continue to log transfer information if a customer ID transfer occurred
- When a user signs in with Google successfully, the system must continue to complete the sign-in flow and update the user profile in Firestore
- When RevenueCat is properly initialized, the system must continue to configure with the correct platform-specific API key
- When the app starts and a user is already signed in, the system must continue to attempt RevenueCat linking during app initialization
- When RevenueCat linking is called, the system must continue to use the Firebase UID as the RevenueCat customer ID

**Scope:**
All inputs where RevenueCat linking succeeds should be completely unaffected by this fix. This includes:
- Successful linking during Google sign-in
- Successful linking during app startup
- Successful premium status updates
- Successful customer ID transfers

## Hypothesized Root Cause

Based on the bug description, the most likely issues are:

1. **Insufficient Error Context**: The catch block only logs `error` without capturing additional diagnostic information like SDK initialization state, platform, or API key configuration

2. **No User Notification**: When linking fails during sign-in, the user is not informed that premium features may not work correctly, leading to confusion later

3. **No Retry Logic**: When linking fails during app startup (potentially due to transient network issues), no retry is attempted, leaving the user unlinked for the entire session

4. **Missing SDK State Check**: The code doesn't verify that `Purchases.configure()` has completed before calling `Purchases.logIn()`, leading to timing-related failures

## Correctness Properties

Property 1: Bug Condition - Diagnostic Information Captured on Failure

_For any_ call to `linkUserToRevenueCat()` where the RevenueCat SDK throws an error, the fixed function SHALL log detailed diagnostic information including error code, error message, SDK initialization state (whether configure was called), current platform (iOS/Android), API key prefix (first 10 characters), and network connectivity status.

**Validates: Requirements 2.1, 2.2, 2.5**

Property 2: Preservation - Successful Linking Behavior

_For any_ call to `linkUserToRevenueCat()` where the RevenueCat SDK successfully returns customer info, the fixed function SHALL produce exactly the same behavior as the original function, preserving premium status caching, transfer logging, and return value of true.

**Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 3.6**

## Fix Implementation

### Changes Required

Assuming our root cause analysis is correct:

**File**: `src/utils/PurchaseManager.js`

**Function**: `linkUserToRevenueCat`

**Specific Changes**:
1. **Add SDK Initialization State Tracking**: Add a class property `isConfigured` that is set to true after `Purchases.configure()` completes in the `initialize()` method

2. **Enhance Error Logging**: In the catch block, log detailed diagnostics including:
   - Error code and message
   - SDK initialization state (`this.isConfigured`)
   - Platform (`Platform.OS`)
   - API key prefix (first 10 characters of the configured key)
   - Network connectivity status (if available)

3. **Return Enhanced Error Object**: Instead of returning just `false`, return an object like `{ success: false, error: errorMessage, diagnostics: {...} }` to provide calling code with actionable information

4. **Add Optional Retry Parameter**: Add an optional `retryOnFailure` parameter that, when true, will attempt the linking operation again after a 2-second delay (useful for app startup context)

5. **Preserve Existing Success Behavior**: Ensure all existing success path code remains unchanged (premium status update, transfer logging, return true)

**File**: `src/screens/ProfileScreen.js`

**Location**: Line 514 (after Google sign-in, before Firestore update)

**Specific Changes**:
1. **Check Linking Result**: Change from `await PurchaseManager.linkUserToRevenueCat(user.uid)` to capturing the result

2. **Display Warning on Failure**: If linking returns `success: false`, display a non-blocking Alert warning the user that premium features may not be available, but allow sign-in to continue

3. **Log Diagnostics**: Log the returned diagnostics object for developer visibility

**File**: `src/screens/AppInitializer.js`

**Location**: Line 25 (during app startup linking)

**Specific Changes**:
1. **Enable Retry on Failure**: Pass `retryOnFailure: true` parameter to `linkUserToRevenueCat()` for app startup context

2. **Log Diagnostics**: Log the returned diagnostics object if linking fails after retry

## Testing Strategy

### Validation Approach

The testing strategy follows a two-phase approach: first, surface counterexamples that demonstrate the bug on unfixed code by simulating various failure scenarios, then verify the fix captures diagnostics correctly and preserves existing successful behavior.

### Exploratory Bug Condition Checking

**Goal**: Surface counterexamples that demonstrate the bug BEFORE implementing the fix. Confirm or refute the root cause analysis. If we refute, we will need to re-hypothesize.

**Test Plan**: Write tests that mock the RevenueCat SDK to throw various errors (SDK not configured, network failure, platform mismatch) and verify that the UNFIXED code fails to capture diagnostic information. Run these tests to observe the silent failures.

**Test Cases**:
1. **SDK Not Initialized Test**: Mock `Purchases.logIn()` to throw "SDK not configured" error, verify UNFIXED code logs generic error but doesn't capture SDK state (will fail on unfixed code)
2. **Network Failure Test**: Mock `Purchases.logIn()` to throw network timeout error, verify UNFIXED code doesn't capture network diagnostics (will fail on unfixed code)
3. **Platform Mismatch Test**: Mock `Purchases.logIn()` to throw platform error, verify UNFIXED code doesn't capture platform/API key info (will fail on unfixed code)
4. **Sign-In Context Test**: Simulate linking failure during ProfileScreen sign-in, verify UNFIXED code doesn't show user warning (will fail on unfixed code)

**Expected Counterexamples**:
- Generic error logs like "❌ RevenueCat login failed: [Error object]" without diagnostic details
- Possible causes: missing SDK state tracking, no diagnostic capture logic, no user notification logic

### Fix Checking

**Goal**: Verify that for all inputs where the bug condition holds (linking fails), the fixed function produces the expected behavior (captures diagnostics and notifies appropriately).

**Pseudocode:**
```
FOR ALL input WHERE isBugCondition(input) DO
  result := linkUserToRevenueCat_fixed(input.firebaseUserId, input.context)
  ASSERT result.diagnostics.sdkInitialized is defined
  ASSERT result.diagnostics.platform is defined
  ASSERT result.diagnostics.apiKeyPrefix is defined
  IF input.context === 'sign-in' THEN
    ASSERT userWarningDisplayed === true
  END IF
  IF input.context === 'app-startup' THEN
    ASSERT retryAttempted === true
  END IF
END FOR
```

### Preservation Checking

**Goal**: Verify that for all inputs where the bug condition does NOT hold (linking succeeds), the fixed function produces the same result as the original function.

**Pseudocode:**
```
FOR ALL input WHERE NOT isBugCondition(input) DO
  ASSERT linkUserToRevenueCat_original(input.firebaseUserId) = linkUserToRevenueCat_fixed(input.firebaseUserId)
END FOR
```

**Testing Approach**: Property-based testing is recommended for preservation checking because:
- It generates many test cases automatically across the input domain
- It catches edge cases that manual unit tests might miss
- It provides strong guarantees that behavior is unchanged for all successful linking scenarios

**Test Plan**: Observe behavior on UNFIXED code first for successful linking scenarios (various Firebase UIDs, customer info responses), then write property-based tests capturing that behavior.

**Test Cases**:
1. **Successful Linking Preservation**: Mock successful `Purchases.logIn()` responses with various customer info, verify premium status is cached identically in fixed code
2. **Transfer Logging Preservation**: Mock customer info with `originalAppUserId` different from input UID, verify transfer is logged identically in fixed code
3. **Return Value Preservation**: Verify successful linking returns `true` (or `{ success: true }`) in both original and fixed code
4. **Premium Status Update Preservation**: Verify that when customer info contains active premium entitlement, `setProStatus(true)` is called identically in both versions

### Unit Tests

- Test diagnostic capture for SDK not initialized error
- Test diagnostic capture for network failure error
- Test diagnostic capture for platform mismatch error
- Test user warning display during sign-in context failure
- Test retry logic during app startup context failure
- Test that successful linking preserves all existing behavior

### Property-Based Tests

- Generate random Firebase UIDs and verify successful linking behavior is identical between original and fixed code
- Generate random error scenarios and verify diagnostics are always captured in fixed code
- Generate random customer info responses and verify premium status caching is identical

### Integration Tests

- Test full Google sign-in flow with RevenueCat linking failure, verify user sees warning but sign-in completes
- Test app startup with existing signed-in user and linking failure, verify retry is attempted
- Test successful linking during sign-in and app startup, verify no behavior changes
