# Bugfix Requirements Document

## Introduction

This bugfix addresses the incorrect implementation of premium screen frequency in ProfileScreen. The original design intended to show the premium screen every 3rd save using a deterministic counter stored in AsyncStorage, but someone mistakenly "fixed" it by using Math.random() < 0.33, which shows it randomly instead of on every 3rd save. Additionally, there was a bug where the save button remained stuck showing "Saving" text, which has already been fixed.

## Bug Analysis

### Current Behavior (Defect)

1.1 WHEN a non-premium user clicks the save button in ProfileScreen THEN the system uses Math.random() < 0.33 to show the premium screen randomly instead of deterministically every 3rd save

1.2 WHEN the save button is clicked multiple times THEN the system does not track or increment a save counter

1.3 WHEN the save button is clicked THEN the system does not use AsyncStorage key 'profile_save_count' to persist the counter across app sessions

### Expected Behavior (Correct)

2.1 WHEN a non-premium user clicks the save button in ProfileScreen THEN the system SHALL increment a counter stored in AsyncStorage with key 'profile_save_count'

2.2 WHEN the counter reaches 3 THEN the system SHALL show the premium screen and reset the counter to 1

2.3 WHEN the counter is 1 or 2 THEN the system SHALL navigate directly to HomeScreen without showing the premium screen

2.4 WHEN the premium screen is shown (on 3rd save) and the user closes it THEN the system SHALL navigate to HomeScreen

2.5 WHEN the save button is clicked THEN the system SHALL reset the save button to normal state (setIsSaving(false)) before navigation

### Unchanged Behavior (Regression Prevention)

3.1 WHEN a premium user clicks the save button in ProfileScreen THEN the system SHALL CONTINUE TO skip the premium screen and navigate directly to HomeScreen (counter should still increment but premium screen is not shown)

3.2 WHEN the save button is clicked THEN the system SHALL CONTINUE TO save the profile data locally to AsyncStorage immediately

3.3 WHEN the save button is clicked THEN the system SHALL CONTINUE TO perform background cloud sync to Firebase without blocking navigation

3.4 WHEN the save operation fails THEN the system SHALL CONTINUE TO show an error alert and reset the button state

3.5 WHEN the save button is clicked THEN the system SHALL CONTINUE TO play success haptic feedback

3.6 WHEN the save button is clicked THEN the system SHALL CONTINUE TO trim the username and validate profile data before saving

3.7 WHEN the save button is clicked THEN the system SHALL CONTINUE TO update local state with the new display name

3.8 WHEN navigation occurs (to either Premium or Home) THEN the system SHALL CONTINUE TO have already completed the local AsyncStorage save
