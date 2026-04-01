# Bugfix Requirements Document

## Introduction

Users who sign in with Google are not appearing in the RevenueCat dashboard's "Non-subscription" customer list, despite the linking code being deployed in version code 8. The `linkUserToRevenueCat()` method in PurchaseManager.js catches all errors and returns false without throwing, allowing sign-in to continue even when RevenueCat linking fails silently. This prevents users from being searchable in RevenueCat by Firebase UID or email, and blocks the ability to manually grant premium entitlements.

The bug impacts both new Google sign-ins (ProfileScreen.js line 514) and existing signed-in users on app startup (AppInitializer.js line 25). Without proper error visibility, developers cannot diagnose whether the failure is due to SDK initialization timing, incorrect API keys, network issues, or platform mismatches.

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN a user signs in with Google AND RevenueCat linking fails THEN the system silently catches the error, logs it to console, returns false, and allows sign-in to complete without alerting the user or developer

1.2 WHEN RevenueCat linking fails on app startup for existing signed-in users THEN the system silently catches the error, logs it to console, and continues app initialization without any visible indication of failure

1.3 WHEN RevenueCat linking fails THEN the user does not appear in the RevenueCat dashboard's customer list, making them unsearchable by Firebase UID or email

1.4 WHEN RevenueCat linking fails THEN developers cannot manually grant premium entitlements to the user through the RevenueCat dashboard

1.5 WHEN RevenueCat linking fails THEN no diagnostic information is captured about whether the failure was due to SDK initialization timing, incorrect API keys, network issues, or platform mismatches

### Expected Behavior (Correct)

2.1 WHEN a user signs in with Google AND RevenueCat linking fails THEN the system SHALL log detailed error information (error code, message, SDK initialization state) and display a user-friendly warning that premium features may not be available

2.2 WHEN RevenueCat linking fails on app startup for existing signed-in users THEN the system SHALL log detailed error information and optionally retry the linking operation after a delay

2.3 WHEN RevenueCat linking succeeds THEN the user SHALL appear in the RevenueCat dashboard's customer list within 30 seconds, searchable by their Firebase UID

2.4 WHEN RevenueCat linking succeeds THEN developers SHALL be able to manually grant premium entitlements to the user through the RevenueCat dashboard using their Firebase UID

2.5 WHEN RevenueCat linking fails THEN the system SHALL capture and log diagnostic information including SDK initialization state, platform, API key prefix, and network connectivity status to aid debugging

### Unchanged Behavior (Regression Prevention)

3.1 WHEN RevenueCat linking succeeds THEN the system SHALL CONTINUE TO update the cached premium status from the returned customer info

3.2 WHEN RevenueCat linking succeeds THEN the system SHALL CONTINUE TO log transfer information if a customer ID transfer occurred

3.3 WHEN a user signs in with Google successfully THEN the system SHALL CONTINUE TO complete the sign-in flow and update the user profile in Firestore

3.4 WHEN RevenueCat is properly initialized THEN the system SHALL CONTINUE TO configure with the correct platform-specific API key (iOS: appl_GidmNgibMGrbuhmiJwrzLeJLEZM, Android: goog_WeLuvQfgjZEppbpIoqiqCzciCqq)

3.5 WHEN the app starts and a user is already signed in THEN the system SHALL CONTINUE TO attempt RevenueCat linking during app initialization

3.6 WHEN RevenueCat linking is called THEN the system SHALL CONTINUE TO use the Firebase UID as the RevenueCat customer ID
