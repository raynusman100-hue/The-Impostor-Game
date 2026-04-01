# Implementation Plan: RevenueCat-Firebase User Linking

## Overview

This implementation adds persistent user identification between RevenueCat and Firebase Authentication by calling `Purchases.logIn(firebaseUserId)` after successful Google Sign-In and `Purchases.logOut()` before sign-out. This enables administrators to grant premium access by email/Firebase UID, makes users visible in the RevenueCat Customer List before purchase, and ensures premium status persists across devices and app reinstalls.

The implementation modifies `PurchaseManager.js` to handle RevenueCat identity operations and updates `ProfileScreen.js` to trigger linking after authentication.

## Tasks

- [x] 1. Add RevenueCat login method to PurchaseManager
  - [x] 1.1 Implement `linkUserToRevenueCat(firebaseUserId)` method
    - Accept Firebase UID as parameter
    - Call `Purchases.logIn(firebaseUserId)` with the Firebase UID
    - Update cached premium status from returned customer info
    - Log the Firebase UID being linked
    - Log transfer information if `originalAppUserId` exists in customer info
    - Catch and log errors without throwing (graceful degradation)
    - Return boolean indicating success/failure
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 8.1, 8.3, 8.4_

  - [ ]* 1.2 Write property test for linkUserToRevenueCat
    - **Property 1: RevenueCat Login Called with Firebase UID**
    - **Property 2: Premium Status Updated After Successful Login**
    - **Property 3: Login Errors Do Not Block Execution**
    - **Property 4: Login Completes Before Promise Resolution**
    - **Property 11: Login Operations Logged**
    - **Property 13: Transfer Information Logged**
    - **Property 14: Errors Logged with Details**
    - **Validates: Requirements 1.1, 1.2, 1.3, 1.4, 8.1, 8.3, 8.4**

  - [ ]* 1.3 Write unit tests for linkUserToRevenueCat
    - Test successful login with valid Firebase UID
    - Test login with empty string Firebase UID
    - Test login with null Firebase UID
    - Test error handling when RevenueCat SDK throws error
    - Test premium status update after successful login
    - Test transfer logging when originalAppUserId exists
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [x] 2. Add RevenueCat logout method to PurchaseManager
  - [x] 2.1 Implement `unlinkUser()` method
    - Call `Purchases.logOut()`
    - Reset cached premium status to false
    - Log the logout operation
    - Catch and log errors without throwing (graceful degradation)
    - _Requirements: 3.1, 3.2, 3.4, 8.2, 8.4_

  - [ ]* 2.2 Write property test for unlinkUser
    - **Property 7: Logout Calls RevenueCat Logout**
    - **Property 8: Premium Status Reset After Logout**
    - **Property 9: Logout Errors Do Not Block Execution**
    - **Property 12: Logout Operations Logged**
    - **Property 14: Errors Logged with Details**
    - **Validates: Requirements 3.1, 3.2, 3.4, 8.2, 8.4**

  - [ ]* 2.3 Write unit tests for unlinkUser
    - Test successful logout
    - Test premium status reset after logout
    - Test error handling when RevenueCat SDK throws error
    - Test logout logging
    - _Requirements: 3.1, 3.2, 3.4, 8.2_

- [ ] 3. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 4. Integrate RevenueCat login into ProfileScreen sign-in flow
  - [x] 4.1 Add RevenueCat linking after Firebase authentication
    - Import PurchaseManager at top of ProfileScreen.js
    - In `handleGoogleSignIn`, after `signInWithCredential` succeeds, call `await PurchaseManager.linkUserToRevenueCat(user.uid)`
    - Place the call before Firestore save operations
    - Do not block UI on linking failure (already handled by PurchaseManager)
    - _Requirements: 1.1, 1.4, 4.1_

  - [ ]* 4.2 Write integration test for sign-in flow
    - Test that linkUserToRevenueCat is called with correct Firebase UID
    - Test that sign-in completes even if linking fails
    - Test that Firestore save occurs after linking
    - _Requirements: 1.1, 1.4, 4.1_

- [x] 5. Integrate RevenueCat logout into ProfileScreen sign-out flow
  - [x] 5.1 Add RevenueCat unlinking before Firebase sign-out
    - In `handleSignOut`, call `await PurchaseManager.unlinkUser()` before `GoogleSignin.signOut()`
    - Ensure logout completes even if unlinking fails
    - _Requirements: 3.1, 3.3, 4.2_

  - [ ]* 5.2 Write integration test for sign-out flow
    - Test that unlinkUser is called before Firebase sign-out
    - Test that sign-out completes even if unlinking fails
    - Test that UI state is reset after sign-out
    - _Requirements: 3.1, 3.3, 4.2_

- [x] 6. Verify initialization order
  - [x] 6.1 Confirm RevenueCat initializes before auth state listener
    - Review App.js to verify PurchaseManager.initialize() is called in useEffect
    - Verify auth state listener is registered after RevenueCat initialization
    - No code changes needed if order is correct
    - _Requirements: 2.1, 2.2_

  - [ ]* 6.2 Write property test for initialization
    - **Property 5: Configure Called During Initialization**
    - **Property 6: Initialization Errors Do Not Crash App**
    - **Validates: Requirements 2.1, 2.3, 2.4**

  - [ ]* 6.3 Write unit tests for initialization
    - Test iOS platform uses correct API key
    - Test Android platform uses correct API key
    - Test error handling during initialization
    - _Requirements: 2.1, 2.3, 2.4_

- [ ] 7. Add concurrency handling tests
  - [ ]* 7.1 Write property test for concurrent operations
    - **Property 10: Concurrent Operations Handled Safely**
    - **Validates: Requirements 4.4**
    - Test rapid login/logout sequences
    - Test multiple rapid login calls
    - Test login followed immediately by logout

- [ ] 8. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- Integration tests verify component interaction
- The implementation preserves existing premium status caching behavior
- Error handling ensures graceful degradation to anonymous mode if linking fails
- Background refresh (60-second interval) will retry failed operations automatically
