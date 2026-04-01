# Requirements Document

## Introduction

This feature links RevenueCat user identification with Firebase/Google Sign-In authentication to enable customer identification before purchase, premium granting by email/Firebase UID, and proper user tracking across the app lifecycle.

Currently, RevenueCat creates anonymous user IDs until a purchase is made, preventing administrators from granting premium access by email and making users invisible in the RevenueCat Customer List until they purchase. By calling `Purchases.logIn(firebaseUserId)` after Google Sign-In, we establish a persistent link between Firebase authentication and RevenueCat's customer records.

## Glossary

- **RevenueCat**: Third-party subscription management service that handles in-app purchases and entitlements
- **Firebase_Auth**: Firebase Authentication service managing user sign-in with Google
- **Firebase_User_ID**: Unique identifier assigned by Firebase to authenticated users (UID)
- **RevenueCat_Customer**: User record in RevenueCat system, identified by app user ID
- **App_User_ID**: Identifier used by RevenueCat to track customers (will be Firebase UID after linking)
- **Anonymous_ID**: Temporary RevenueCat identifier created before user authentication
- **Purchase_Manager**: Singleton service managing RevenueCat SDK interactions
- **Profile_Screen**: UI screen where users sign in with Google
- **Auth_State_Listener**: Firebase callback that fires when authentication state changes
- **Premium_Entitlement**: RevenueCat entitlement named "premium" that grants access to premium features
- **Customer_List**: RevenueCat dashboard view showing all identified customers
- **Transfer_Behavior**: RevenueCat feature that migrates purchases from anonymous ID to authenticated ID

## Requirements

### Requirement 1: Link RevenueCat to Firebase User After Sign-In

**User Story:** As a user, I want my RevenueCat account linked to my Firebase identity after signing in with Google, so that my purchases and premium status are associated with my authenticated account.

#### Acceptance Criteria

1. WHEN a user successfully signs in with Google, THE Purchase_Manager SHALL call `Purchases.logIn()` with the Firebase_User_ID
2. WHEN `Purchases.logIn()` succeeds, THE Purchase_Manager SHALL update the cached premium status from the returned customer info
3. IF `Purchases.logIn()` fails, THEN THE Purchase_Manager SHALL log the error and continue with anonymous mode
4. THE Purchase_Manager SHALL complete the login call before returning control to the Profile_Screen
5. WHEN RevenueCat transfers purchases from Anonymous_ID to Firebase_User_ID, THE Purchase_Manager SHALL preserve all existing entitlements

### Requirement 2: Initialize RevenueCat Before Authentication

**User Story:** As a developer, I want RevenueCat initialized before any authentication occurs, so that the SDK is ready to handle login calls immediately after sign-in.

#### Acceptance Criteria

1. WHEN the app launches, THE Purchase_Manager SHALL call `Purchases.configure()` before any authentication state changes
2. THE Purchase_Manager SHALL complete SDK initialization before the Auth_State_Listener is registered
3. IF RevenueCat initialization fails, THEN THE Purchase_Manager SHALL log the error and allow the app to continue
4. THE Purchase_Manager SHALL use the correct API key for the current platform (iOS or Android)

### Requirement 3: Handle User Logout Properly

**User Story:** As a user, I want my RevenueCat session cleared when I sign out, so that the next user on this device doesn't see my premium status.

#### Acceptance Criteria

1. WHEN a user signs out from Firebase_Auth, THE Purchase_Manager SHALL call `Purchases.logOut()`
2. WHEN `Purchases.logOut()` completes, THE Purchase_Manager SHALL reset the cached premium status to false
3. THE Purchase_Manager SHALL call `Purchases.logOut()` before Firebase sign-out completes
4. IF `Purchases.logOut()` fails, THEN THE Purchase_Manager SHALL log the error and proceed with Firebase sign-out

### Requirement 4: Sync on Authentication State Changes

**User Story:** As a user, I want my RevenueCat identity synchronized whenever my authentication state changes, so that my premium status is always accurate.

#### Acceptance Criteria

1. WHEN the Auth_State_Listener detects a signed-in user, THE Purchase_Manager SHALL call `Purchases.logIn()` with the Firebase_User_ID
2. WHEN the Auth_State_Listener detects a signed-out state, THE Purchase_Manager SHALL call `Purchases.logOut()`
3. WHEN a user is already signed in at app launch, THE Purchase_Manager SHALL link RevenueCat during initialization
4. THE Purchase_Manager SHALL handle rapid authentication state changes without race conditions

### Requirement 5: Enable Premium Granting by Email

**User Story:** As an administrator, I want to grant premium access using a user's email or Firebase UID in the RevenueCat dashboard, so that I can provide promotional access or resolve customer support issues.

#### Acceptance Criteria

1. WHEN a user signs in with Google, THE RevenueCat_Customer SHALL be identifiable by Firebase_User_ID in the Customer_List
2. THE RevenueCat_Customer SHALL display the user's email address from Firebase_Auth
3. WHEN an administrator grants a Premium_Entitlement to a Firebase_User_ID, THE Purchase_Manager SHALL detect the entitlement on next status check
4. THE Purchase_Manager SHALL refresh premium status within 60 seconds of an administrator granting access

### Requirement 6: Maintain Backward Compatibility

**User Story:** As an existing user with anonymous purchases, I want my premium access preserved when I sign in for the first time, so that I don't lose what I've already paid for.

#### Acceptance Criteria

1. WHEN a user with an Anonymous_ID signs in for the first time, THE RevenueCat SDK SHALL transfer existing purchases to the Firebase_User_ID
2. WHEN purchase transfer occurs, THE Purchase_Manager SHALL preserve all active Premium_Entitlement records
3. THE Purchase_Manager SHALL not require users to restore purchases manually after first sign-in
4. IF a user has purchases on both Anonymous_ID and Firebase_User_ID, THEN THE RevenueCat SDK SHALL merge the entitlements

### Requirement 7: Handle Network Failures Gracefully

**User Story:** As a user with poor network connectivity, I want the app to continue functioning even if RevenueCat login fails, so that I can still use the app.

#### Acceptance Criteria

1. IF `Purchases.logIn()` fails due to network error, THEN THE Purchase_Manager SHALL retry on next app launch
2. WHEN RevenueCat login fails, THE Purchase_Manager SHALL not block the user from accessing the Profile_Screen
3. THE Purchase_Manager SHALL use cached premium status when RevenueCat API calls fail
4. WHEN network connectivity is restored, THE Purchase_Manager SHALL automatically sync RevenueCat identity on next status check

### Requirement 8: Log RevenueCat Identity Operations

**User Story:** As a developer, I want detailed logs of RevenueCat identity operations, so that I can debug customer support issues and verify correct linking behavior.

#### Acceptance Criteria

1. WHEN `Purchases.logIn()` is called, THE Purchase_Manager SHALL log the Firebase_User_ID being linked
2. WHEN `Purchases.logOut()` is called, THE Purchase_Manager SHALL log the logout operation
3. WHEN purchase transfer occurs, THE Purchase_Manager SHALL log the transfer from Anonymous_ID to Firebase_User_ID
4. IF any RevenueCat identity operation fails, THEN THE Purchase_Manager SHALL log the error with full details
