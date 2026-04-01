# Implementation Plan: Old Premium System Cleanup

## Overview
This task list implements the systematic removal of verified dead code from the old manual premium system. All code elements have been triple-verified as unused through comprehensive codebase searches. The cleanup follows an exploratory approach: first verify the code is truly unused, then remove it safely while preserving all current RevenueCat functionality.

---

## Tasks

- [x] 1. Write bug condition exploration test
  - **Property 1: Bug Condition** - Old Premium System Remnants Exist
  - **CRITICAL**: This test MUST FAIL on unfixed code - failure confirms the dead code exists
  - **DO NOT attempt to fix the test or the code when it fails**
  - **NOTE**: This test encodes the expected behavior - it will validate the fix when it passes after implementation
  - **GOAL**: Surface counterexamples that demonstrate old premium system code still exists in the codebase
  - **Scoped PBT Approach**: Scope the property to concrete failing cases - check for specific files and functions that should not exist
  - Test that ProVersionScreen.js file exists (from Bug Condition in design)
  - Test that App.js imports ProVersionScreen (from Bug Condition in design)
  - Test that App.js registers "ProVersion" navigation route (from Bug Condition in design)
  - Test that PremiumManager.js exports getAvailableCategories, isCategoryAvailable, getPremiumStyling (from Bug Condition in design)
  - Run test on UNFIXED code
  - **EXPECTED OUTCOME**: Test FAILS (this is correct - it proves the old system remnants exist)
  - Document counterexamples found: which files/functions/imports/exports still exist
  - Mark task complete when test is written, run, and failure is documented
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_

- [x] 2. Write preservation property tests (BEFORE implementing fix)
  - **Property 2: Preservation** - Current RevenueCat System Unchanged
  - **IMPORTANT**: Follow observation-first methodology
  - Observe behavior on UNFIXED code for current RevenueCat premium system
  - Write property-based tests capturing observed behavior patterns from Preservation Requirements
  - Test that PremiumScreen navigation works from HomeScreen, ProfileScreen, CategorySelectionModal, SettingsScreen
  - Test that PremiumManager.checkPremiumStatus() returns cached premium status
  - Test that PremiumManager.refreshPremiumStatus() fetches from RevenueCat
  - Test that PremiumManager.checkAndSyncHostPremium() syncs to Firebase
  - Test that PremiumManager.shouldShowAds() returns correct value based on premium status
  - Test that PurchaseManager functions are accessible and work correctly
  - Property-based testing generates many test cases for stronger guarantees
  - Run tests on UNFIXED code
  - **EXPECTED OUTCOME**: Tests PASS (this confirms baseline behavior to preserve)
  - Mark task complete when tests are written, run, and passing on unfixed code
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6, 3.7, 3.8, 3.9, 3.10_

- [x] 3. Remove old premium system remnants

  - [x] 3.1 Remove ProVersionScreen from App.js
    - Remove import statement: `import ProVersionScreen from './src/screens/ProVersionScreen';` (line 26)
    - Remove navigation route: `<Stack.Screen name="ProVersion" component={ProVersionScreen} options={{ headerShown: false }} />` (line 143)
    - Verify no other files import ProVersionScreen
    - _Bug_Condition: isBugCondition(codeElement) where codeElement is ProVersionScreen import or navigation route_
    - _Expected_Behavior: ProVersionScreen is not imported or registered in navigation_
    - _Preservation: All other navigation routes and imports remain unchanged_
    - _Requirements: 1.2, 2.2_

  - [x] 3.2 Delete ProVersionScreen.js file
    - Delete file: `src/screens/ProVersionScreen.js`
    - Verify file no longer exists in filesystem
    - Verify bundle size is reduced
    - _Bug_Condition: isBugCondition(codeElement) where codeElement.path = "src/screens/ProVersionScreen.js"_
    - _Expected_Behavior: ProVersionScreen.js file does not exist_
    - _Preservation: All other screen files remain unchanged_
    - _Requirements: 1.1, 2.1_

  - [x] 3.3 Remove unused helper functions from PremiumManager.js
    - Remove getAvailableCategories function (lines 58-68 including JSDoc)
    - Remove isCategoryAvailable function (lines 77-86 including JSDoc)
    - Remove getPremiumStyling function (lines 92-113 including JSDoc)
    - Update default export object to only include active functions:
      - checkPremiumStatus
      - refreshPremiumStatus
      - checkAndSyncHostPremium
      - shouldShowAds
    - Verify no imports of removed functions exist
    - _Bug_Condition: isBugCondition(codeElement) where codeElement is unused helper function with zero imports_
    - _Expected_Behavior: Only active functions are exported from PremiumManager_
    - _Preservation: Active functions (checkPremiumStatus, refreshPremiumStatus, checkAndSyncHostPremium, shouldShowAds) remain unchanged_
    - _Requirements: 1.3, 2.3_

  - [x] 3.4 Verify bug condition exploration test now passes
    - **Property 1: Expected Behavior** - Old Premium System Remnants Removed
    - **IMPORTANT**: Re-run the SAME test from task 1 - do NOT write a new test
    - The test from task 1 encodes the expected behavior
    - When this test passes, it confirms the old system remnants are removed
    - Run bug condition exploration test from step 1
    - **EXPECTED OUTCOME**: Test PASSES (confirms dead code is removed)
    - Verify ProVersionScreen.js file does not exist
    - Verify App.js does not import ProVersionScreen
    - Verify App.js does not register "ProVersion" route
    - Verify PremiumManager.js does not export unused functions
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5_

  - [x] 3.5 Verify preservation tests still pass
    - **Property 2: Preservation** - Current RevenueCat System Unchanged
    - **IMPORTANT**: Re-run the SAME tests from task 2 - do NOT write new tests
    - Run preservation property tests from step 2
    - **EXPECTED OUTCOME**: Tests PASS (confirms no regressions)
    - Verify PremiumScreen navigation works from all entry points
    - Verify PremiumManager active functions work correctly
    - Verify PurchaseManager integration is unchanged
    - Verify Firebase hostHasPremium synchronization works
    - Verify VoiceChatContext premium monitoring works
    - Confirm all tests still pass after fix (no regressions)

- [x] 4. Checkpoint - Ensure all tests pass and cleanup is complete
  - Run full test suite to verify no regressions
  - Verify application builds successfully
  - Verify no import errors or missing module errors
  - Test premium navigation from all entry points (HomeScreen, ProfileScreen, CategorySelectionModal, SettingsScreen)
  - Test premium status checking and refresh
  - Test host premium sync to Firebase
  - Test ad gating based on premium status
  - Verify bundle size reduction (~10-15 KB)
  - Ask user if any questions arise or additional verification is needed

---

## Notes

- This cleanup is LOW RISK because all removed code has been triple-verified as unused
- The fix is surgical and minimal - only removes confirmed dead code
- All current RevenueCat premium functionality is preserved
- The cleanup reduces bundle size and eliminates developer confusion
- No behavioral changes to the application - purely code cleanup
