# Requirements Document

## Introduction

This document specifies the requirements for the Personalized Custom Avatar Wheel feature. The feature replaces the current 12 pre-made cinema-themed avatars in the avatar wheel with 12 randomly generated custom avatars that are unique to each user and persist across sessions. Users can regenerate individual slots, lock favorites, and manually customize specific avatars using the existing AvatarBuilder component.

## Glossary

- **Avatar_Wheel**: The spinning wheel UI component that displays 12 avatar slots arranged in a circle
- **Avatar_Slot**: One of the 12 positions on the Avatar_Wheel that contains an avatar configuration
- **Custom_Avatar**: An avatar created using the CustomBuiltAvatar component with randomized or user-defined configuration
- **Avatar_Configuration**: A data structure containing all properties needed to render a Custom_Avatar (faceShape, skinColor, eyeStyle, mouthStyle, hairStyle, hairColor, accessory, bgColor)
- **Wheel_State**: The complete state of the Avatar_Wheel including all 12 Avatar_Configurations, lock statuses, and selected index
- **Lock_Status**: A boolean flag indicating whether an Avatar_Slot is protected from randomization
- **AvatarBuilder**: The existing UI component that allows manual customization of Custom_Avatar properties
- **User_Profile**: The Firebase and AsyncStorage data structure containing user information including Wheel_State
- **Randomization**: The process of generating a new Avatar_Configuration with random values for all properties

## Requirements

### Requirement 1: Initial Avatar Generation

**User Story:** As a new user, I want to see 12 unique custom avatars when I first access the avatar wheel, so that I have a personalized experience from the start.

#### Acceptance Criteria

1. WHEN a user accesses the Avatar_Wheel for the first time, THE System SHALL generate 12 unique Avatar_Configurations
2. WHEN generating Avatar_Configurations, THE System SHALL randomize all properties (faceShape, skinColor, eyeStyle, mouthStyle, hairStyle, hairColor, accessory, bgColor)
3. WHEN Avatar_Configurations are generated, THE System SHALL ensure each configuration is visually distinct from the others
4. WHEN initial generation completes, THE System SHALL set Avatar_Slot 1 as the selected avatar
5. WHEN initial generation completes, THE System SHALL save the Wheel_State to User_Profile

### Requirement 2: Wheel State Persistence

**User Story:** As a user, I want my custom avatar wheel to persist across app sessions and devices, so that I see the same avatars when I return.

#### Acceptance Criteria

1. WHEN a user saves their profile, THE System SHALL store the complete Wheel_State in Firebase
2. WHEN a user saves their profile, THE System SHALL store the complete Wheel_State in AsyncStorage
3. WHEN a user loads their profile, THE System SHALL retrieve the Wheel_State from Firebase if available
4. IF Firebase is unavailable, THEN THE System SHALL retrieve the Wheel_State from AsyncStorage
5. WHEN Wheel_State is loaded, THE System SHALL render all 12 Avatar_Slots with their saved Avatar_Configurations
6. WHEN Wheel_State is loaded, THE System SHALL restore all Lock_Status values for each Avatar_Slot
7. WHEN Wheel_State is loaded, THE System SHALL restore the previously selected avatar index

### Requirement 3: Individual Slot Regeneration

**User Story:** As a user, I want to regenerate individual avatar slots I don't like, so that I can customize my wheel without changing avatars I already like.

#### Acceptance Criteria

1. WHEN a user taps an Avatar_Slot, THE System SHALL generate a new random Avatar_Configuration for that slot only
2. WHEN an Avatar_Slot is regenerated, THE System SHALL leave all other Avatar_Slots unchanged
3. WHEN an Avatar_Slot is regenerated, THE System SHALL provide haptic feedback
4. WHEN an Avatar_Slot is regenerated, THE System SHALL animate the slot to indicate the change
5. IF an Avatar_Slot has Lock_Status true, THEN THE System SHALL prevent regeneration and display a visual indicator
6. WHEN an Avatar_Slot is regenerated, THE System SHALL immediately save the updated Wheel_State to User_Profile

### Requirement 4: Bulk Randomization

**User Story:** As a user, I want to regenerate all unlocked avatar slots at once, so that I can quickly explore different avatar combinations.

#### Acceptance Criteria

1. WHEN a user activates the "Randomize All" action, THE System SHALL display a confirmation dialog
2. WHEN the user confirms randomization, THE System SHALL generate new Avatar_Configurations for all unlocked Avatar_Slots
3. WHEN bulk randomization occurs, THE System SHALL preserve Avatar_Configurations for all locked Avatar_Slots
4. WHEN bulk randomization occurs, THE System SHALL provide haptic feedback
5. WHEN bulk randomization completes, THE System SHALL save the updated Wheel_State to User_Profile

### Requirement 5: Favorite/Lock System

**User Story:** As a user, I want to lock specific avatar slots to prevent them from changing, so that I can protect my favorite avatars during randomization.

#### Acceptance Criteria

1. WHEN a user long-presses an Avatar_Slot, THE System SHALL toggle the Lock_Status for that slot
2. WHEN an Avatar_Slot is locked, THE System SHALL display a visual lock indicator on that slot
3. WHEN an Avatar_Slot is unlocked, THE System SHALL remove the lock indicator
4. WHEN toggling Lock_Status, THE System SHALL provide haptic feedback
5. WHEN Lock_Status changes, THE System SHALL save the updated Wheel_State to User_Profile
6. WHEN "Randomize All" is executed, THE System SHALL skip all Avatar_Slots with Lock_Status true
7. WHEN a user taps a locked Avatar_Slot, THE System SHALL prevent regeneration and display feedback

### Requirement 6: Manual Customization

**User Story:** As a user, I want to manually design specific avatars using the builder, so that I can create exactly the avatar I want for specific slots.

#### Acceptance Criteria

1. WHEN a user long-presses or double-taps an Avatar_Slot, THE System SHALL open the AvatarBuilder for that specific slot
2. WHEN the AvatarBuilder opens, THE System SHALL pass the current Avatar_Configuration for that slot as initial state
3. WHEN the user saves in the AvatarBuilder, THE System SHALL update the Avatar_Configuration for that specific slot
4. WHEN the user saves in the AvatarBuilder, THE System SHALL automatically set Lock_Status to true for that slot
5. WHEN the user cancels in the AvatarBuilder, THE System SHALL close the builder without modifying the Avatar_Configuration
6. WHEN manual customization completes, THE System SHALL save the updated Wheel_State to User_Profile

### Requirement 7: Wheel UI Preservation

**User Story:** As a user, I want the avatar wheel to maintain its familiar spinning mechanics, so that the interaction feels consistent with the current experience.

#### Acceptance Criteria

1. THE Avatar_Wheel SHALL maintain the existing spinning animation behavior
2. THE Avatar_Wheel SHALL maintain the existing drag-to-spin interaction
3. THE Avatar_Wheel SHALL maintain the existing momentum physics
4. THE Avatar_Wheel SHALL maintain the existing snap-to-position behavior
5. THE Avatar_Wheel SHALL display Custom_Avatars in all 12 slots instead of cinema-themed avatars
6. THE Avatar_Wheel SHALL maintain the existing center hub display showing the selected avatar
7. THE Avatar_Wheel SHALL maintain the existing badge showing current position (e.g., "3/12")

### Requirement 8: Data Structure Efficiency

**User Story:** As a system architect, I want the avatar wheel data to be stored efficiently, so that user profiles remain performant and don't bloat the database.

#### Acceptance Criteria

1. WHEN storing Wheel_State, THE System SHALL use a compact JSON structure for Avatar_Configurations
2. WHEN storing Wheel_State, THE System SHALL store Lock_Status as a boolean array
3. WHEN storing Wheel_State, THE System SHALL store the selected index as a single integer
4. THE System SHALL limit the total Wheel_State size to under 5KB
5. WHEN syncing to Firebase, THE System SHALL use atomic updates to prevent data corruption

### Requirement 9: Backward Compatibility

**User Story:** As an existing user, I want my profile to work seamlessly after the update, so that I don't lose my current avatar selection.

#### Acceptance Criteria

1. WHEN an existing user profile is loaded without Wheel_State, THE System SHALL generate initial Avatar_Configurations
2. WHEN an existing user has a selected cinema avatar ID, THE System SHALL preserve that selection index
3. WHEN an existing user has a custom avatar configuration, THE System SHALL place it in Avatar_Slot 1 and lock it
4. WHEN backward compatibility migration occurs, THE System SHALL save the new Wheel_State to User_Profile

### Requirement 10: Visual Feedback and Animations

**User Story:** As a user, I want clear visual feedback when interacting with avatar slots, so that I understand what actions are available and what's happening.

#### Acceptance Criteria

1. WHEN a user taps an Avatar_Slot, THE System SHALL provide immediate visual feedback (scale animation or highlight)
2. WHEN an Avatar_Slot is locked, THE System SHALL display a lock icon overlay on that slot
3. WHEN an Avatar_Slot is regenerating, THE System SHALL display a loading or transition animation
4. WHEN the "Randomize All" button is visible, THE System SHALL position it accessibly near the wheel
5. WHEN a locked slot is tapped, THE System SHALL animate the lock icon to indicate it's protected
