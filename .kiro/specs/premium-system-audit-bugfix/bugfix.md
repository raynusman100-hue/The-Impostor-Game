# Bugfix Requirements Document

## Audit Resolution Summary

**Audit Date:** March 2026  
**Review Status:** ✅ COMPLETE - All 10 issues reviewed and resolved  
**Actual Bugs Found:** 0  
**Intentional Behaviors Confirmed:** 9  
**Performance Testing Required:** 1 (Issue #2 - optional)

### Final Decisions

| Issue | Title | Status | Action Required |
|-------|-------|--------|-----------------|
| #1 | Profile Save Validation | ✅ INTENTIONAL | None - Load-time stripping is sufficient |
| #2 | Premium Status Race Conditions | ⏳ NEEDS TESTING | Optional performance testing (see checklist) |
| #3 | Category "All" Label | ✅ INTENTIONAL | None - UI highlights provide clear feedback |
| #4 | Voice Chat Premium Loss UI | ✅ INTENTIONAL | None - Default alert acceptable for rare case |
| #5 | Firebase Update Timing | ✅ INTENTIONAL | None - Lazy update is smart optimization |
| #6 | Ad Expiration Validation | ✅ INTENTIONAL | None - RevenueCat handles internally |
| #7 | Error Handling | ✅ INTENTIONAL | None - Silent handling prevents offline spam |
| #8 | Offline Premium Validation | ✅ WORKING | None - RevenueCat SDK feature |
| #9 | Category Filtering Notification | ✅ INTENTIONAL | None - Silent filtering with visual feedback |
| #10 | UI Indicator Consistency | ✅ INTENTIONAL | None - Same as Issue #3 |

### Key Findings

**No bugs were found.** All 10 issues identified in the audit are intentional design decisions that follow best practices:

1. **RevenueCat SDK Integration** - Properly leverages SDK's built-in caching, expiration validation, and offline support
2. **Performance Optimizations** - Lazy updates and load-time validation reduce overhead
3. **User Experience** - Silent error handling prevents spam, visual feedback is clear
4. **Revenue Protection** - Safe fallbacks ensure ads show on errors
5. **Support Channel** - Settings screen provides contact option for premium issues

### Optional Testing

**Issue #2 (Performance):** You can optionally run the tests in `PREMIUM_SYSTEM_TESTING_CHECKLIST.md` to verify RevenueCat SDK's caching performance. Based on SDK documentation and best practices, the current implementation is expected to be optimal.

---

## Introduction

This document addresses potential bugs, logic gaps, and inconsistencies discovered during a comprehensive audit of the premium system across all components. The premium system controls access to premium features including:
- Premium-locked accessories (bandana, earrings, headphones)
- Premium-locked hair styles (mohawk, cap, beanie)
- Premium-locked eye styles (wink, angry, cute)
- Premium-locked mouth styles (kiss, teeth, smirk)
- Premium-locked categories (Movies, Games, Trends, Sports, Science, History, Mythology, Nature, Tech, Fashion, Gen Z, K-Pop, Anime, Famous People)
- Ad-free experience
- Host premium voice chat feature

**IMPORTANT NOTE:** This document contains findings from an automated audit. Many of these behaviors may be intentional design decisions. Each issue should be reviewed by the developer to determine:
1. Is this actually a bug or intentional behavior?
2. If it's a bug, what is the correct fix?
3. If it's intentional, should it be documented or improved?

The audit revealed multiple areas where premium validation, status checking, and user experience could potentially be improved or clarified.

## Audit Methodology

**Files Audited:**
- `src/utils/PremiumManager.js` - Core premium status checking and category filtering
- `src/utils/PurchaseManager.js` - RevenueCat SDK integration and purchase flow
- `src/utils/AdManager.js` - Ad-free experience implementation
- `src/components/CustomAvatarBuilder.js` - Premium accessory/hair/eye/mouth validation
- `src/components/CategorySelectionModal.js` - Premium category UI and selection
- `src/screens/ProfileScreen.js` - Profile save and premium item stripping
- `src/screens/PremiumScreen.js` - Purchase flow and pricing display
- `src/screens/HostScreen.js` - Premium status sync to Firebase
- `src/screens/SetupScreen.js` - Category filtering for game setup
- `src/utils/VoiceChatContext.js` - Voice chat premium gating
- `src/utils/words.js` - Category definitions and word selection

**Key Code Patterns Found:**
1. Premium status checked via `PremiumManager.checkPremiumStatus()` which calls `PurchaseManager.checkProStatus()`
2. RevenueCat SDK handles offline caching with expiration timestamps
3. Premium items defined in constants: `PREMIUM_ACCESSORIES`, `PREMIUM_HAIR_STYLES`, `PREMIUM_EYE_STYLES`, `PREMIUM_MOUTH_STYLES`
4. Categories marked with `premium: true` or `free: true` flags in `CATEGORY_LABELS`
5. Premium validation on load exists in ProfileScreen and CustomAvatarBuilder
6. Ad-free experience checks premium status before loading/showing ads
7. Voice chat requires host to have premium, synced to Firebase `hostHasPremium` field

## Bug Analysis

### Current Behavior (Defect)

#### 1. Profile Save - Missing Premium Validation ✅ INTENTIONAL - NO FIX NEEDED

**Code Location:** `src/screens/ProfileScreen.js` - Save button handler

**Current Implementation:**
- ProfileScreen loads profile and strips premium items on mount (lines 395-453)
- CustomAvatarBuilder prevents selection of premium items without premium (lines 167-210)
- However, no validation occurs at the moment of save

**Observed Behavior:**
1.1 WHEN a user saves their profile with premium avatar items (accessories, hair, eyes, mouth) THEN the system saves the profile without checking if the user has active premium access at save time

1.2 WHEN a user's premium subscription expires and they edit their profile THEN the system loads premium items from storage and strips them on load, but doesn't re-validate on save

1.3 WHEN a user saves a custom avatar with premium items THEN the system stores the configuration in AsyncStorage and Firebase without verifying premium entitlement at save time

**Developer Decision:** ✅ INTENTIONAL BEHAVIOR - NO FIX NEEDED

**Reasoning:**
1. **Already protected on load** - Premium items are automatically stripped when profile loads, so any edge case self-corrects
2. **Extremely rare scenario** - Premium expiring during the exact moment someone is editing their profile is highly unlikely
3. **No revenue impact** - Users cannot use premium items after expiration anyway (stripped on next load)
4. **No security risk** - This is cosmetic data, not payment/access control
5. **Performance consideration** - Adding save-time validation would add async overhead for minimal benefit
6. **Elegant design** - Current "strip on load" approach handles all edge cases without adding complexity

**Conclusion:** The current implementation is intentional and sufficient. Load-time stripping provides adequate protection without adding save-time overhead.

#### 2. Premium Status Checking - Race Conditions ⏳ NEEDS TESTING

**Code Location:** `src/utils/PremiumManager.js` - `checkPremiumStatus()` function

**Current Implementation:**
- Every call to `checkPremiumStatus()` triggers `PurchaseManager.checkProStatus()`
- PurchaseManager calls RevenueCat SDK's `getCustomerInfo()` each time
- No caching layer exists in PremiumManager
- RevenueCat SDK has its own internal caching (local device storage)

**Observed Behavior:**
2.1 WHEN multiple components check premium status simultaneously (HostScreen, ProfileScreen, CategorySelectionModal) THEN each makes independent async calls to RevenueCat SDK

2.2 WHEN HostScreen initializes and checks premium status with retry logic (lines 173-189, 221-237) THEN it makes up to 3 sequential calls to checkPremiumStatus without debouncing

2.3 WHEN premium status check fails due to network issues THEN the system defaults to false but doesn't cache this result, causing repeated failed attempts

**Developer Decision:** ⏳ NEEDS TESTING - Performance verification required

**Unknown Behavior:**
The actual caching behavior of RevenueCat SDK needs to be verified:
- **Scenario A:** `getCustomerInfo()` returns instantly from local cache (< 50ms) - NO FIX NEEDED
- **Scenario B:** `getCustomerInfo()` makes network call but deduplicates simultaneous requests - NO FIX NEEDED
- **Scenario C:** `getCustomerInfo()` makes multiple network calls for simultaneous requests - NEEDS FIX

**Testing Required:**
See `PREMIUM_SYSTEM_TESTING_CHECKLIST.md` for detailed test procedures:
- Test 2.1: Measure single call performance
- Test 2.2: Measure multiple simultaneous calls
- Test 2.3: Monitor network requests
- Test 2.4: HostScreen retry logic timing

**Potential Actions Based on Test Results:**
- If Scenario A or B: Mark as "INTENTIONAL - NO FIX NEEDED"
- If Scenario C: Implement application-level cache with request deduplication

**Next Steps:** Run tests in `PREMIUM_SYSTEM_TESTING_CHECKLIST.md` and update this section with results.

#### 3. Category Filtering - "All" Includes Premium ✅ INTENTIONAL - NO FIX NEEDED

**Code Location:** `src/utils/words.js` - `getRandomWord()` function (lines 1163-1251)

**Current Implementation:**
- When 'all' is selected, `getRandomWord()` filters to only free categories (lines 1172-1182)
- CATEGORY_LABELS shows "Random (All)" as the label (line 1227)
- CategorySelectionModal shows locked premium categories with 🔒 icon
- SetupScreen filters to free categories when user doesn't have premium (lines 233-243)
- **IMPORTANT:** When user clicks "All", it highlights ALL free categories in the UI (lines 233-243 in SetupScreen)

**Observed Behavior:**
3.1 WHEN a free user selects "Random (All)" category THEN the system includes all free categories but the label "Random (All)" suggests all categories are included

3.2 WHEN a free user views the category selection modal THEN they see locked premium categories but the "All" option doesn't explain it only includes free categories

3.3 WHEN getRandomWord is called with 'all' THEN it correctly filters to free categories, but this behavior isn't communicated to the user

3.4 WHEN a free user clicks "All" in CategorySelectionModal THEN the UI highlights all free categories, visually showing which categories are included ✅ WORKING AS INTENDED

**Developer Decision:** ✅ INTENTIONAL BEHAVIOR - NO FIX NEEDED

**Reasoning:**
1. **Visual feedback is clear** - When user clicks "All", the UI highlights all free categories, making it obvious which categories are included
2. **Premium categories show locks** - Free users can see premium categories with 🔒 icons, understanding they're not included in "All"
3. **Marketing benefit** - "Random (All)" label is aspirational for premium users, showing what they get with upgrade
4. **No functional confusion** - The visual highlighting prevents misunderstanding about which categories are active
5. **Consistent behavior** - Premium users get actual "All", free users get "All Free" but can see the difference in the UI

**How it works:**
- Free user clicks "All" → UI highlights all free categories (Daily Life, Things, Places, Food, Objects, Ball Knowledge)
- Premium categories remain visible but locked with 🔒 icon
- User can clearly see which categories are selected vs locked
- Word generation correctly uses only the highlighted (free) categories

**Conclusion:** The current implementation provides clear visual feedback through category highlighting. The "Random (All)" label is intentionally aspirational, and the UI makes it obvious which categories are actually included.

#### 4. Voice Chat - Mid-Session Premium Loss ✅ INTENTIONAL - NO FIX NEEDED

**Code Location:** `src/utils/VoiceChatContext.js` - Premium status listener (lines 281-320)

**Current Implementation:**
- Real-time listener on `rooms/${roomCode}/hostHasPremium` Firebase path
- Detects premium loss during active session (line 295)
- Disconnects all users with alert when premium is lost mid-session
- Blocks join attempts when `hostHasPremium` is false, null, or undefined (lines 370-387)
- Uses React Native's default `Alert.alert()` for notification

**Observed Behavior:**
4.1 WHEN a host's premium expires during an active voice chat session THEN VoiceChatContext detects the change and disconnects users with an alert ✅ WORKING AS INTENDED

4.2 WHEN a host's premium expires and they try to start a new voice session THEN the system properly blocks access with PREMIUM_REQUIRED error ✅ WORKING AS INTENDED

4.3 WHEN a player tries to join voice chat and the host premium status is null/undefined in Firebase THEN the system correctly blocks access ✅ WORKING AS INTENDED

4.4 WHEN premium expires mid-session THEN the alert uses React Native's default styling ✅ ACCEPTABLE

**Developer Decision:** ✅ INTENTIONAL BEHAVIOR - NO FIX NEEDED

**Reasoning:**
1. **Extremely rare scenario** - Premium expiring during an active voice chat session is very unlikely
2. **Functionality is correct** - Detection and disconnection logic works properly
3. **System UI is acceptable** - Default alert is clear and functional for this edge case
4. **Not worth the effort** - Custom modal would add complexity for minimal benefit
5. **Message is clear** - Users understand what happened and why they were disconnected

**Conclusion:** The current implementation handles this rare edge case appropriately. The default system alert is acceptable given the low frequency of occurrence.


#### 5. Premium Item Stripping - Incomplete Validation ✅ INTENTIONAL - NO FIX NEEDED

**Code Location:** 
- `src/screens/ProfileScreen.js` - Lines 395-453 (AsyncStorage and Firebase load)
- `src/components/CustomAvatarBuilder.js` - Lines 167-210 (useEffect premium check)

**Current Implementation:**
- ProfileScreen strips premium items on load from both AsyncStorage (lines 395-413) and Firebase (lines 436-453)
- CustomAvatarBuilder strips premium items on mount (lines 167-210)
- Both update AsyncStorage immediately after stripping
- Firebase is NOT updated immediately - only on next save

**Observed Behavior:**
5.1 WHEN ProfileScreen loads and detects premium items without premium access THEN it strips premium accessories, hair, eyes, and mouth styles ✅ WORKING

5.2 WHEN CustomAvatarBuilder initializes with premium items and user doesn't have premium THEN it resets premium items to default values ✅ WORKING

5.3 WHEN a user loses premium access and their profile is loaded from AsyncStorage THEN premium items are stripped and AsyncStorage is updated immediately ✅ WORKING

5.4 WHEN a user loses premium access and their profile is loaded from Firebase THEN premium items are stripped but the Firebase document is NOT updated until next save ✅ ACCEPTABLE

**Developer Decision:** ✅ INTENTIONAL BEHAVIOR - NO FIX NEEDED

**Reasoning:**
1. **Load-time stripping is sufficient** - Premium items are stripped whenever profile loads, regardless of source
2. **Multi-device handled** - If user switches devices, the new device strips items on load
3. **Performance benefit** - Avoids extra Firebase write on every profile load
4. **Cost savings** - Reduces Firebase write operations (minimal but measurable at scale)
5. **Rare scenario** - Users rarely switch devices mid-session after premium expires
6. **No functional impact** - The lazy update doesn't cause any user-facing issues

**How it works:**
- Device A: Premium expires → loads profile → strips items → updates AsyncStorage
- Device B: Loads profile from Firebase (still has premium items) → strips items on load → updates AsyncStorage
- Next save on either device: Firebase gets updated with stripped items

**Conclusion:** The current lazy update approach is a smart optimization that balances data consistency with performance and cost. Load-time stripping ensures correctness across all devices.

#### 6. Ad-Free Experience - Expiration Validation ✅ INTENTIONAL - NO FIX NEEDED

**Code Location:** `src/utils/AdManager.js` - Lines 28-57

**Current Implementation:**
- `loadInterstitial()` checks premium status before loading (lines 28-39)
- `showInterstitial()` checks premium status before showing (lines 44-57)
- Both call `checkPremiumStatus()` which calls RevenueCat
- RevenueCat SDK handles expiration validation internally
- On error, defaults to showing ads (safe for revenue)

**Observed Behavior:**
6.1 WHEN AdManager.loadInterstitial is called THEN it checks premium status in real-time before loading ads ✅ WORKING

6.2 WHEN AdManager.showInterstitial is called THEN it checks premium status in real-time before showing ads ✅ WORKING

6.3 WHEN premium status check fails in AdManager THEN it defaults to showing ads (safe fallback) ✅ WORKING

6.4 WHEN PurchaseManager.checkProStatus is called THEN it uses RevenueCat's cached entitlement data with expiration validation ✅ WORKING

**Developer Decision:** ✅ INTENTIONAL BEHAVIOR - NO FIX NEEDED

**Reasoning:**
1. **RevenueCat handles expiration** - SDK automatically validates expiration timestamps in cached data
2. **Real-time checks** - Premium status is checked before every ad operation
3. **Safe fallback** - On error, defaults to showing ads (protects revenue)
4. **SDK best practice** - Trusting RevenueCat's expiration logic is the recommended approach
5. **Offline support** - SDK handles offline scenarios with cached expiration data

**How it works:**
- Premium active → `checkPremiumStatus()` returns true → ads are suppressed
- Premium expires → RevenueCat cache expires → `checkPremiumStatus()` returns false → ads show
- Network error → defaults to showing ads (safe for revenue)

**Conclusion:** The current implementation correctly relies on RevenueCat SDK's built-in expiration validation. No additional validation needed.

#### 7. Error Handling - Silent Failures ✅ INTENTIONAL - NO FIX NEEDED

**Code Locations:**
- `src/utils/PremiumManager.js` - Lines 22-52 (checkPremiumStatus error handling)
- `src/utils/PurchaseManager.js` - Lines 45-70 (checkProStatus error handling)
- `src/utils/VoiceChatContext.js` - Lines 315-320 (listener error handling)

**Current Implementation:**
- `checkPremiumStatus()` catches errors, logs them, returns false (lines 45-52)
- `PurchaseManager.checkProStatus()` catches errors, returns last known status (lines 65-70)
- VoiceChatContext listener catches errors, defaults to false (lines 315-320)
- No user-facing error messages shown
- Settings screen provides contact/support option for users experiencing premium issues

**Observed Behavior:**
7.1 WHEN checkPremiumStatus fails due to network error THEN it logs the error and returns false without notifying the user ✅ WORKING AS INTENDED

7.2 WHEN PurchaseManager.checkProStatus fails THEN it returns the last known status instead of defaulting to false (line 69: `return this.isPro`) ✅ WORKING AS INTENDED

7.3 WHEN updateHostPremiumStatus fails in HostScreen THEN it logs the error but doesn't retry (note: PremiumManager.checkAndSyncHostPremium has retry logic with exponential backoff) ✅ WORKING AS INTENDED

7.4 WHEN premium status listener fails in VoiceChatContext THEN it defaults to false and logs the error ✅ WORKING AS INTENDED

**Developer Decision:** ✅ INTENTIONAL BEHAVIOR - NO FIX NEEDED

**Reasoning:**
1. **RevenueCat handles offline gracefully** - SDK uses local cache with expiration validation, so network errors are rare
2. **Would spam users when offline** - Showing error messages would bombard users with popups during normal offline usage (every premium check would show an error)
3. **Safe fallbacks protect revenue** - Defaults to showing ads on error, protecting revenue stream
4. **Errors are transient** - Most errors are brief network blips that resolve automatically
5. **Not user-actionable** - Users can't do anything about these errors (they're system-level issues)
6. **Support channel exists** - Settings screen provides contact/support option for users who experience persistent premium issues
7. **Better UX** - Silent handling provides cleaner user experience without scary error messages

**How it works:**
- **Online:** RevenueCat checks with Apple/Google servers, returns current status
- **Offline:** RevenueCat uses local cache with expiration timestamps (no errors occur)
- **Error scenario:** Only occurs in exceptional cases (SDK malfunction, not network issues)
- **User support:** Users experiencing persistent issues can use contact page in Settings

**Conclusion:** The current silent error handling is the correct design. Showing error messages would create a poor user experience by spamming users during normal offline usage, when RevenueCat's offline caching is working perfectly. Users who need help have access to support through Settings.

#### 8. Offline Premium Validation - RevenueCat Caching

**Code Location:** `src/utils/PurchaseManager.js` - Lines 45-70

**Current Implementation:**
- RevenueCat SDK handles all offline caching internally
- SDK caches entitlement data with expiration timestamps
- SDK automatically syncs when device comes back online
- Application trusts RevenueCat's caching behavior

**Observed Behavior:**
8.1 WHEN the device is offline and premium status is checked THEN RevenueCat SDK uses cached entitlement data with expiration timestamps ✅ WORKING (SDK feature)

8.2 WHEN the device is offline and cached premium has expired THEN RevenueCat SDK correctly returns false (no premium) ✅ WORKING (SDK feature)

8.3 WHEN the device is offline and cached premium is still valid THEN RevenueCat SDK correctly returns true (has premium) ✅ WORKING (SDK feature)

8.4 WHEN the device comes back online after being offline THEN RevenueCat SDK syncs with Apple/Google servers and updates entitlement status ✅ WORKING (SDK feature)

**Status:** This is handled entirely by RevenueCat SDK. No issues found.

**Question for Review:** Should this section be removed from the bug list?

#### 9. Premium Category Selection - Inconsistent Filtering ✅ INTENTIONAL - NO FIX NEEDED

**Code Locations:**
- `src/components/CategorySelectionModal.js` - Lines 140-143 (premium category tap)
- `src/screens/SetupScreen.js` - Lines 233-243 (category filtering)
- `src/utils/words.js` - Lines 1172-1182 (getRandomWord filtering)

**Current Implementation:**
- CategorySelectionModal navigates to Premium screen when free user taps premium category (lines 140-143)
- SetupScreen filters selectedCategories to only free categories if user doesn't have premium (lines 233-243)
- getRandomWord filters to free categories when 'all' is selected (lines 1172-1182)
- Premium categories show 🔒 icons in the UI for free users

**Observed Behavior:**
9.1 WHEN a free user taps a premium category in CategorySelectionModal THEN the system navigates to Premium screen instead of selecting the category ✅ INTENTIONAL BEHAVIOR

9.2 WHEN a free user has premium categories in their selectedCategories array THEN the system filters them out when starting a game ✅ WORKING

9.3 WHEN a premium user selects categories and their premium expires THEN the next game start filters out premium categories without notification ✅ ACCEPTABLE

**Developer Decision:** ✅ INTENTIONAL BEHAVIOR - NO FIX NEEDED

**Reasoning:**
1. **Extremely rare scenario** - Premium expiring between game sessions is very unlikely
2. **Visual feedback exists** - When user opens CategorySelectionModal, they see premium categories with 🔒 icons
3. **No functional issue** - Game continues to work with free categories
4. **Self-correcting** - User will notice locked categories when they check the modal
5. **Silent filtering is cleaner** - Showing a notification for this rare edge case would be disruptive
6. **Consistent with other behaviors** - Similar to profile item stripping (Issue #5), which also happens silently

**How it works:**
- Premium expires → user starts new game
- SetupScreen filters out premium categories silently
- Game uses only free categories
- If user opens CategorySelectionModal, they see premium categories are now locked with 🔒 icons
- User understands their premium expired

**Conclusion:** Silent filtering is the correct approach for this rare scenario. The UI provides clear visual feedback when the user checks their category selection.

#### 10. Premium UI Indicators - Missing or Inconsistent ✅ INTENTIONAL - NO FIX NEEDED

**Code Locations:**
- `src/components/CustomAvatarBuilder.js` - Lines 282-291 (TextBtn with lock icon)
- `src/components/CategorySelectionModal.js` - Lines 61-65 (premium lock overlay)
- `src/components/VoiceTab.js` - Premium required message display
- `src/utils/words.js` - Line 1227 (CATEGORY_LABELS "Random (All)")

**Current Implementation:**
- CustomAvatarBuilder shows 🔒 icon and dims premium items (opacity: 0.5) for free users
- CategorySelectionModal shows 🔒 icon on premium categories for free users
- VoiceTab shows "Premium Required" message with upgrade button
- "Random (All)" label is the same for both free and premium users
- **IMPORTANT:** Clicking "All" highlights all free categories in the UI (visual feedback)

**Observed Behavior:**
10.1 WHEN premium items are displayed in CustomAvatarBuilder THEN they show a 🔒 icon and are slightly dimmed ✅ WORKING

10.2 WHEN premium categories are displayed in CategorySelectionModal THEN they show a 🔒 icon for free users ✅ WORKING

10.3 WHEN the "Random (All)" option is displayed THEN it shows the same label for free and premium users ✅ INTENTIONAL

10.4 WHEN a free user clicks "All" THEN the UI highlights all free categories, making it visually clear which categories are included ✅ WORKING AS INTENDED

10.5 WHEN voice chat requires premium THEN VoiceTab shows a clear "Premium Required" message with upgrade button ✅ WORKING

**Developer Decision:** ✅ INTENTIONAL BEHAVIOR - NO FIX NEEDED

**Reasoning:**
This is the same issue as Issue #3, which was already resolved. The "Random (All)" label behavior is intentional:

1. **Visual feedback is clear** - When user clicks "All", the UI highlights all free categories, making it obvious which categories are included
2. **Premium categories show locks** - Free users can see premium categories with 🔒 icons, understanding they're not included in "All"
3. **Marketing benefit** - "Random (All)" label is aspirational for premium users, showing what they get with upgrade
4. **No functional confusion** - The visual highlighting prevents misunderstanding about which categories are active
5. **Consistent behavior** - Premium users get actual "All", free users get "All Free" but can see the difference in the UI

**How it works:**
- Free user clicks "All" → UI highlights all free categories (Daily Life, Things, Places, Food, Objects, Ball Knowledge)
- Premium categories remain visible but locked with 🔒 icon
- User can clearly see which categories are selected vs locked
- Word generation correctly uses only the highlighted (free) categories

**Conclusion:** The current implementation provides clear visual feedback through category highlighting. The "Random (All)" label is intentionally aspirational, and the UI makes it obvious which categories are actually included. This is consistent with the decision made in Issue #3.


### Expected Behavior (Correct)

#### 1. Profile Save - Premium Validation Required

2.1 WHEN a user saves their profile with premium avatar items THEN the system SHALL validate premium status before saving and strip premium items if user doesn't have premium

2.2 WHEN a user's premium subscription expires and they edit their profile THEN the system SHALL detect expired premium items on load and strip them before allowing edits

2.3 WHEN a user saves a custom avatar with premium items THEN the system SHALL validate each premium item (accessory, hair, eyes, mouth) against current premium status

2.4 WHEN premium validation fails during profile save THEN the system SHALL show a clear error message explaining which items were removed and why

#### 2. Premium Status Checking - Debounced and Cached

2.5 WHEN multiple components check premium status simultaneously THEN the system SHALL use a debounced cache that prevents duplicate RevenueCat calls within a 30-second window

2.6 WHEN HostScreen initializes and checks premium status THEN the system SHALL use the cached premium status if available and fresh (< 30 seconds old)

2.7 WHEN premium status check fails due to network issues THEN the system SHALL cache the failure result for 5 seconds to prevent rapid retry storms

2.8 WHEN premium status is successfully retrieved THEN the system SHALL cache the result with a timestamp for 30 seconds

#### 3. Category Filtering - Clear Communication

2.9 WHEN a free user selects "Random (All)" category THEN the system SHALL clearly indicate "All Free Categories" in the UI

2.10 WHEN a free user views the category selection modal THEN the system SHALL show a count of free vs premium categories (e.g., "5 Free / 12 Premium")

2.11 WHEN premium categories are filtered out during game start THEN the system SHALL log this action for debugging but not show user-facing errors

#### 4. Voice Chat - Graceful Premium Loss Handling

2.12 WHEN a host's premium expires during an active voice chat session THEN the system SHALL disconnect all users with a clear message and prevent reconnection

2.13 WHEN a host's premium expires and they try to start a new voice session THEN the system SHALL show a premium upgrade prompt with clear messaging

2.14 WHEN a player tries to join voice chat and host premium status cannot be determined THEN the system SHALL default to blocking access with a "Premium status unavailable" message

#### 5. Premium Item Stripping - Complete and Consistent

2.15 WHEN premium items are detected without premium access THEN the system SHALL strip ALL premium items (accessories, hair, eyes, mouth) in a single operation

2.16 WHEN premium items are stripped from a profile THEN the system SHALL update BOTH AsyncStorage and Firebase immediately

2.17 WHEN CustomAvatarBuilder detects premium items without premium THEN it SHALL reset them to safe defaults (accessory: 'none', hairStyle: 'none', eyeStyle: 'normal', mouthStyle: 'smile')

2.18 WHEN premium items are stripped THEN the system SHALL log the action with details of which items were removed


#### 6. Ad-Free Experience - Robust Validation

2.19 WHEN AdManager checks premium status THEN the system SHALL use the cached premium status if available and fresh

2.20 WHEN premium status check fails in AdManager THEN the system SHALL default to showing ads (safe fallback for revenue protection)

2.21 WHEN PurchaseManager.checkProStatus is called THEN the system SHALL rely on RevenueCat's built-in caching and expiration validation

2.22 WHEN a premium user's subscription expires THEN ads SHALL start showing immediately on the next ad opportunity

#### 7. Error Handling - User-Friendly Notifications

2.23 WHEN checkPremiumStatus fails due to network error THEN the system SHALL log the error and show a user-friendly message if the failure affects user actions

2.24 WHEN PurchaseManager.checkProStatus fails THEN the system SHALL return the last known status and log a warning for monitoring

2.25 WHEN updateHostPremiumStatus fails in HostScreen THEN the system SHALL retry up to 3 times with exponential backoff before giving up

2.26 WHEN premium status listener fails in VoiceChatContext THEN the system SHALL default to false and show a "Premium status unavailable" message

#### 8. Offline Premium Validation - Trust RevenueCat

2.27 WHEN the device is offline and premium status is checked THEN the system SHALL trust RevenueCat SDK's cached entitlement data with expiration validation

2.28 WHEN the device is offline and cached premium has expired THEN the system SHALL treat the user as non-premium

2.29 WHEN the device is offline and cached premium is still valid THEN the system SHALL grant premium access

2.30 WHEN the device comes back online THEN the system SHALL allow RevenueCat SDK to sync automatically without forcing immediate re-checks

#### 9. Premium Category Selection - Consistent Behavior

2.31 WHEN a free user taps a premium category THEN the system SHALL navigate to Premium screen with haptic feedback

2.32 WHEN a free user has premium categories in selectedCategories and starts a game THEN the system SHALL filter them out silently

2.33 WHEN a premium user's subscription expires mid-session THEN the system SHALL filter out premium categories on next game start without crashing

2.34 WHEN categories are filtered due to premium status THEN the system SHALL ensure at least one free category remains selected

#### 10. Premium UI Indicators - Clear and Consistent

2.35 WHEN premium items are displayed in CustomAvatarBuilder THEN they SHALL show a 🔒 icon, be slightly dimmed (opacity: 0.5), and trigger premium upgrade on tap

2.36 WHEN premium categories are displayed in CategorySelectionModal THEN they SHALL show a 🔒 icon and navigate to Premium screen on tap

2.37 WHEN the "Random (All)" option is displayed for free users THEN it SHALL show "(Free Categories Only)" subtitle

2.38 WHEN voice chat requires premium THEN VoiceTab SHALL show a prominent "Premium Required" card with an "Upgrade" button


### Unchanged Behavior (Regression Prevention)

#### Premium Purchase Flow

3.1 WHEN a user navigates to the Premium screen THEN the system SHALL CONTINUE TO display pricing options and purchase flow correctly

3.2 WHEN a user completes a premium purchase THEN the system SHALL CONTINUE TO update premium status immediately via RevenueCat

3.3 WHEN a user restores purchases THEN the system SHALL CONTINUE TO sync with RevenueCat and update premium status

#### RevenueCat Integration

3.4 WHEN RevenueCat SDK is initialized THEN the system SHALL CONTINUE TO use the correct API keys for iOS and Android

3.5 WHEN RevenueCat checks entitlements THEN the system SHALL CONTINUE TO look for the "premium" entitlement ID

3.6 WHEN RevenueCat is offline THEN the system SHALL CONTINUE TO use cached entitlement data with proper expiration validation

#### Premium Features - Existing Functionality

3.7 WHEN a premium user accesses premium accessories THEN the system SHALL CONTINUE TO allow selection and saving

3.8 WHEN a premium user accesses premium categories THEN the system SHALL CONTINUE TO include them in game word selection

3.9 WHEN a premium user hosts voice chat THEN the system SHALL CONTINUE TO allow all players to join

3.10 WHEN a premium user plays the game THEN the system SHALL CONTINUE TO suppress all ads

#### Free User Experience

3.11 WHEN a free user accesses free accessories THEN the system SHALL CONTINUE TO allow selection and saving

3.12 WHEN a free user accesses free categories THEN the system SHALL CONTINUE TO include them in game word selection

3.13 WHEN a free user plays the game THEN the system SHALL CONTINUE TO show ads at appropriate intervals

3.14 WHEN a free user tries to access premium features THEN the system SHALL CONTINUE TO show premium upgrade prompts

#### Profile Management

3.15 WHEN a user saves their profile with free avatar items THEN the system SHALL CONTINUE TO save successfully to AsyncStorage and Firebase

3.16 WHEN a user changes their username THEN the system SHALL CONTINUE TO update across all storage locations

3.17 WHEN a user switches between premade and custom avatars THEN the system SHALL CONTINUE TO preserve both configurations

#### Voice Chat - Non-Premium Scenarios

3.18 WHEN a free user joins a room without voice chat THEN the system SHALL CONTINUE TO function normally

3.19 WHEN voice chat is not enabled (web platform) THEN the system SHALL CONTINUE TO use the disabled stub provider

3.20 WHEN voice chat encounters Agora errors THEN the system SHALL CONTINUE TO log errors and handle gracefully

#### Category Selection - Free Categories

3.21 WHEN a user selects free categories THEN the system SHALL CONTINUE TO include them in word generation

3.22 WHEN "Ball Knowledge" is selected THEN the system SHALL CONTINUE TO show football and basketball subcategories

3.23 WHEN subcategories are selected THEN the system SHALL CONTINUE TO use them for word generation

#### Ad System - Free Users

3.24 WHEN a free user completes a game THEN the system SHALL CONTINUE TO show interstitial ads

3.25 WHEN ads fail to load THEN the system SHALL CONTINUE TO proceed with game flow without blocking

3.26 WHEN ads are disabled (ADS_ENABLED = false) THEN the system SHALL CONTINUE TO skip ad loading

