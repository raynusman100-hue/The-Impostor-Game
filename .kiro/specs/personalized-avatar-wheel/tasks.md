# Implementation Plan: Personalized Custom Avatar Wheel

## Overview

This implementation plan converts the Personalized Custom Avatar Wheel design into discrete coding tasks. The approach is incremental: first establish the data structures and utilities, then modify the wheel component, add interaction handlers, implement persistence, and finally handle migrations. Each task builds on previous work and includes testing sub-tasks to validate correctness early.

## Tasks

- [-] 1. Create wheel state data structures and validation utilities
  - Create `src/utils/WheelStateManager.js` with WheelState data structure
  - Implement validation functions for avatar configurations and wheel state
  - Implement size calculation to ensure serialized state stays under 5KB
  - _Requirements: 8.1, 8.2, 8.3, 8.4_

- [ ] 1.1 Write property test for wheel state validation
  - **Property 16: Wheel State Serialization Is Valid JSON**
  - **Validates: Requirements 8.1**
  - Test that for any valid wheel state, serializing to JSON and parsing back produces equivalent state
  - _Requirements: 8.1_

- [ ] 1.2 Write property test for lock status array structure
  - **Property 17: Lock Status Array Structure**
  - **Validates: Requirements 8.2**
  - Test that for any valid wheel state, lockedSlots is an array of exactly 12 booleans
  - _Requirements: 8.2_

- [ ] 1.3 Write property test for selected index validation
  - **Property 18: Selected Index Is Valid Integer**
  - **Validates: Requirements 8.3**
  - Test that for any valid wheel state, selectedIndex is an integer between 0 and 11
  - _Requirements: 8.3_

- [ ] 1.4 Write property test for serialized state size constraint
  - **Property 19: Serialized State Size Constraint**
  - **Validates: Requirements 8.4**
  - Test that for any valid wheel state, serialized JSON is less than 5KB
  - _Requirements: 8.4_

- [-] 2. Implement avatar generation utilities
  - Create `generateRandomAvatarConfig()` function that randomly selects valid values for all properties
  - Create `generateUniqueAvatarSet(count)` function that generates visually distinct avatars
  - Implement `isVisuallyDistinct()` helper to ensure avatars differ in at least 3 properties
  - _Requirements: 1.1, 1.2, 1.3_

- [ ] 2.1 Write property test for generated avatar validity
  - **Property 2: Generated Avatars Use Valid Property Values**
  - **Validates: Requirements 1.2**
  - Test that for any generated avatar config, all properties have values from valid option sets
  - _Requirements: 1.2_

- [ ] 2.2 Write property test for visual distinctness
  - **Property 3: Generated Avatar Set Has Visual Distinctness**
  - **Validates: Requirements 1.3**
  - Test that for any set of 12 generated avatars, each pair differs in at least 3 properties
  - _Requirements: 1.3_

- [ ] 2.3 Write unit test for initial generation
  - Test that initial generation produces exactly 12 avatars
  - Test that selectedIndex is set to 0
  - Test that all locks are set to false
  - _Requirements: 1.1, 1.4_

- [-] 3. Implement WheelStateManager class
  - Create WheelStateManager class in `src/utils/WheelStateManager.js`
  - Implement `createDefaultState()` to generate initial wheel state with 12 unique avatars
  - Implement `regenerateSlot(index)` to regenerate a single slot
  - Implement `toggleLock(index)` to toggle lock status
  - Implement `updateSlotConfig(index, config)` to update slot with manual config and auto-lock
  - Implement `randomizeAll()` to regenerate all unlocked slots
  - Implement `getState()` to return current state
  - _Requirements: 1.1, 3.1, 5.1, 6.3, 6.4, 4.2_

- [ ] 3.1 Write property test for initial state generation
  - **Property 1: Initial Generation Produces Valid Wheel State**
  - **Validates: Requirements 1.1, 1.4**
  - Test that for any new initialization, state has 12 valid configs, all locks false, selectedIndex 0
  - _Requirements: 1.1, 1.4_

- [ ] 3.2 Write property test for single slot regeneration isolation
  - **Property 7: Single Slot Regeneration Isolation**
  - **Validates: Requirements 3.1**
  - Test that regenerating one slot changes only that slot, leaving other 11 unchanged
  - _Requirements: 3.1_

- [ ] 3.3 Write property test for locked slot prevention
  - **Property 8: Locked Slots Prevent Regeneration**
  - **Validates: Requirements 3.5**
  - Test that attempting to regenerate a locked slot leaves it unchanged
  - _Requirements: 3.5_

- [ ] 3.4 Write property test for bulk randomization respects locks
  - **Property 9: Bulk Randomization Respects Locks**
  - **Validates: Requirements 4.2**
  - Test that randomizeAll changes unlocked slots and preserves locked slots
  - _Requirements: 4.2_

- [ ] 3.5 Write property test for lock toggle idempotence
  - **Property 10: Lock Toggle Is Idempotent**
  - **Validates: Requirements 5.1**
  - Test that toggling lock twice restores original lock status
  - _Requirements: 5.1_

- [ ] 3.6 Write property test for manual edit updates correct slot
  - **Property 13: Manual Edit Updates Correct Slot**
  - **Validates: Requirements 6.3**
  - Test that updateSlotConfig changes only the specified slot
  - _Requirements: 6.3_

- [ ] 3.7 Write property test for manual edit auto-locks
  - **Property 14: Manual Edit Auto-Locks Slot**
  - **Validates: Requirements 6.4**
  - Test that updateSlotConfig sets lockedSlots[index] to true
  - _Requirements: 6.4_

- [ ] 4. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 5. Implement storage persistence layer
  - Add `save()` method to WheelStateManager to save state to AsyncStorage and Firebase
  - Add `load(userId)` static method to load state from Firebase (priority) or AsyncStorage (fallback)
  - Implement retry logic for failed save operations (3 retries with exponential backoff)
  - Implement error handling for storage failures
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 1.5, 3.6, 4.5, 5.5, 6.6_

- [ ] 5.1 Write property test for state persistence round-trip
  - **Property 4: Wheel State Round-Trip Preservation**
  - **Validates: Requirements 2.5, 2.6, 2.7**
  - Test that for any wheel state, saving then loading produces equivalent state
  - _Requirements: 2.5, 2.6, 2.7_

- [ ] 5.2 Write property test for Firebase priority
  - **Property 5: Firebase Takes Priority Over AsyncStorage**
  - **Validates: Requirements 2.3**
  - Test that when both Firebase and AsyncStorage have data, Firebase is used
  - _Requirements: 2.3_

- [ ] 5.3 Write property test for AsyncStorage fallback
  - **Property 6: AsyncStorage Fallback When Firebase Unavailable**
  - **Validates: Requirements 2.4**
  - Test that when Firebase fails, AsyncStorage is successfully used
  - _Requirements: 2.4_

- [ ] 5.4 Write property test for persistence after modifications
  - **Property 11: State Persistence After Modifications**
  - **Validates: Requirements 1.5, 2.1, 2.2, 3.6, 4.5, 5.5, 6.6**
  - Test that after any modification operation, state is saved to storage
  - _Requirements: 1.5, 2.1, 2.2, 3.6, 4.5, 5.5, 6.6_

- [ ] 5.5 Write unit tests for storage error handling
  - Test retry logic on save failures
  - Test fallback to AsyncStorage when Firebase unavailable
  - Test error messages displayed to user
  - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [-] 6. Create AvatarSlot component
  - Create `src/components/AvatarSlot.js` component
  - Render CustomBuiltAvatar with provided configuration
  - Add tap gesture handler for regeneration
  - Add long-press gesture handler for lock toggle
  - Add double-tap gesture handler for opening AvatarBuilder
  - Display lock icon overlay when isLocked is true
  - Implement visual feedback animations (scale, highlight)
  - Implement regeneration animation (fade-out, fade-in)
  - _Requirements: 3.1, 5.1, 6.1, 10.1, 10.2, 10.3, 10.5_

- [ ] 6.1 Write unit tests for AvatarSlot interactions
  - Test tap handler calls onTap callback
  - Test long-press handler calls onLongPress callback
  - Test double-tap handler calls onDoubleTab callback
  - Test lock icon renders when isLocked is true
  - _Requirements: 3.1, 5.1, 6.1_

- [x] 7. Modify AvatarWheel component to use custom avatars
  - Update `src/screens/ProfileScreen.js` AvatarWheel component
  - Replace cinema-themed avatar rendering with AvatarSlot components
  - Pass wheel state configurations to each AvatarSlot
  - Integrate WheelStateManager for state management
  - Add tap handler to call wheelStateManager.regenerateSlot(index)
  - Add long-press handler to call wheelStateManager.toggleLock(index)
  - Add double-tap handler to open AvatarBuilder with current config
  - Preserve all existing wheel mechanics (rotation, momentum, snap-to-position)
  - Update center hub to display CustomBuiltAvatar instead of cinema avatar
  - _Requirements: 3.1, 5.1, 6.1, 7.1, 7.2, 7.3, 7.4, 7.5, 7.6, 7.7_

- [ ] 7.1 Write integration test for slot regeneration flow
  - Test tapping slot regenerates only that slot
  - Test regenerated slot is saved to storage
  - Test other slots remain unchanged
  - _Requirements: 3.1, 3.2, 3.6_

- [ ] 7.2 Write integration test for lock toggle flow
  - Test long-pressing slot toggles lock
  - Test lock status is saved to storage
  - Test locked slot prevents regeneration
  - _Requirements: 5.1, 5.5, 3.5_

- [ ] 8. Add Randomize All button and confirmation dialog
  - Add "Randomize All" button below or near the AvatarWheel
  - Implement confirmation dialog with "Cancel" and "Confirm" options
  - On confirm, call wheelStateManager.randomizeAll()
  - Disable button if all slots are locked
  - Provide haptic feedback on button press
  - _Requirements: 4.1, 4.2, 4.5_

- [ ] 8.1 Write unit test for Randomize All button
  - Test button displays confirmation dialog
  - Test confirming calls randomizeAll
  - Test canceling leaves state unchanged
  - Test button disabled when all slots locked
  - _Requirements: 4.1, 4.2_

- [ ] 9. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 10. Integrate AvatarBuilder for manual customization
  - Update AvatarWheel double-tap handler to open AvatarBuilder modal
  - Pass current slot configuration as initialConfig to AvatarBuilder
  - On AvatarBuilder save, call wheelStateManager.updateSlotConfig(index, newConfig)
  - On AvatarBuilder cancel, close modal without changes
  - Ensure slot is auto-locked after manual edit
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 6.6_

- [ ] 10.1 Write property test for AvatarBuilder receives correct config
  - **Property 12: AvatarBuilder Receives Correct Initial Config**
  - **Validates: Requirements 6.2**
  - Test that opening builder for slot passes correct current config
  - _Requirements: 6.2_

- [ ] 10.2 Write property test for AvatarBuilder cancel preserves state
  - **Property 15: AvatarBuilder Cancel Preserves State**
  - **Validates: Requirements 6.5**
  - Test that canceling builder leaves slot config unchanged
  - _Requirements: 6.5_

- [ ] 10.3 Write integration test for manual customization flow
  - Test opening builder for slot
  - Test modifying config and saving
  - Test slot is updated with new config
  - Test slot is auto-locked
  - Test state is saved to storage
  - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.6_

- [ ] 11. Implement backward compatibility migration
  - Add migration logic in ProfileScreen loadProfile function
  - Detect legacy profiles without wheelState property
  - If avatarId exists, set selectedIndex to (avatarId - 1)
  - If customAvatarConfig exists, place in avatars[0] and lock slot 0
  - Generate remaining slots with random avatars
  - Save migrated wheelState to storage
  - _Requirements: 9.1, 9.2, 9.3, 9.4_

- [ ] 11.1 Write property test for migration creates wheel state
  - **Property 20: Migration Creates Wheel State For Legacy Profiles**
  - **Validates: Requirements 9.1**
  - Test that loading profile without wheelState generates and saves new state
  - _Requirements: 9.1_

- [ ] 11.2 Write property test for migration preserves avatar selection
  - **Property 21: Migration Preserves Legacy Avatar Selection**
  - **Validates: Requirements 9.2**
  - Test that profile with avatarId sets selectedIndex to (avatarId - 1)
  - _Requirements: 9.2_

- [ ] 11.3 Write property test for migration preserves custom avatar
  - **Property 22: Migration Preserves Legacy Custom Avatar**
  - **Validates: Requirements 9.3**
  - Test that profile with customAvatarConfig places it in avatars[0] and locks it
  - _Requirements: 9.3_

- [ ] 11.4 Write unit tests for migration edge cases
  - Test migration with avatarId only
  - Test migration with customAvatarConfig only
  - Test migration with both avatarId and customAvatarConfig
  - Test migration with completely empty profile
  - Test migration with corrupted legacy data
  - _Requirements: 9.1, 9.2, 9.3, 9.4_

- [ ] 12. Update ProfileScreen to initialize wheel state on first load
  - Modify ProfileScreen loadProfile to check for wheelState
  - If wheelState doesn't exist, create default state using WheelStateManager
  - Save initial wheelState to storage
  - Update profile save logic to include wheelState
  - _Requirements: 1.1, 1.5, 2.1, 2.2_

- [ ] 12.1 Write integration test for profile initialization
  - Test new user gets 12 unique avatars
  - Test wheel state is saved to storage
  - Test wheel state persists across app restarts
  - _Requirements: 1.1, 1.5, 2.1, 2.2_

- [ ] 13. Add visual feedback and animations
  - Implement slot regeneration animation (300ms fade-out, generate, 300ms fade-in)
  - Implement lock toggle animation (200ms scale on lock icon)
  - Implement bulk randomize staggered animations (50ms delay between slots)
  - Add haptic feedback for tap (light), long-press (medium), error (error)
  - Ensure lock icon has high contrast and clear visibility
  - _Requirements: 10.1, 10.2, 10.3, 10.5_

- [ ] 13.1 Write unit tests for animation triggers
  - Test regeneration triggers fade animation
  - Test lock toggle triggers scale animation
  - Test randomizeAll triggers staggered animations
  - _Requirements: 10.1, 10.3_

- [ ] 14. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 15. Integration and final testing
  - Test complete flow: new user → generate avatars → regenerate slots → lock favorites → randomize all → manual edit
  - Test persistence: save state → close app → reopen → verify state restored
  - Test migration: load legacy profile → verify migration → verify state saved
  - Test error handling: simulate storage failures → verify retry logic → verify user feedback
  - Test performance: measure serialization, deserialization, regeneration times
  - Test accessibility: verify touch targets, haptic feedback, screen reader support
  - _Requirements: All_

## Notes

- All tasks are required for comprehensive implementation
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties (minimum 100 iterations each)
- Unit tests validate specific examples and edge cases
- Integration tests validate end-to-end flows
- All tests should use fast-check library for property-based testing
- Each property test must include a comment tag: `// Feature: personalized-avatar-wheel, Property N: [Property Title]`
