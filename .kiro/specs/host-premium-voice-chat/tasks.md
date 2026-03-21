# Implementation Plan: Host Premium Voice Chat

## Overview

This implementation plan converts the host premium voice chat feature design into actionable coding tasks. The feature gates voice chat functionality based on the host's premium subscription status - when the host has premium, all players can access voice chat. When the host lacks premium, voice chat is disabled with appropriate messaging.

The implementation leverages existing infrastructure (VoiceChatContext, PremiumManager, Firebase) while adding premium status synchronization and UI updates across all affected screens.

## Tasks

- [x] 1. Extend Firebase data structure for host premium status
  - Add `hostHasPremium` boolean field to room creation logic
  - Update room initialization in HostScreen to include premium status check
  - Ensure field is properly cleaned up when rooms are deleted
  - _Requirements: 1.1, 1.2, 10.1, 10.2, 10.5_

- [x] 2. Enhance PremiumManager with host premium synchronization
  - [x] 2.1 Create checkAndSyncHostPremium function
    - Implement function to check host premium status and sync to Firebase
    - Add error handling with fallback to false on failures
    - Include retry logic with exponential backoff (up to 3 attempts)
    - _Requirements: 1.1, 9.1, 9.4, 9.5_
  
  - [ ]* 2.2 Write property test for premium status synchronization
    - **Property 1: Premium Status Firebase Storage**
    - **Validates: Requirements 1.1, 1.2, 10.1, 10.2, 10.3, 10.4**
  
  - [x] 2.3 Create updateFirebaseHostPremium utility function
    - Implement Firebase update function for hostHasPremium field
    - Add error handling and logging for debugging
    - _Requirements: 1.5, 8.1, 10.4_
  
  - [ ]* 2.4 Write property test for Firebase premium updates
    - **Property 2: Premium Status Synchronization**
    - **Validates: Requirements 1.4, 1.5, 8.1, 8.2**

- [x] 3. Update VoiceChatContext for premium access control
  - [x] 3.1 Add premium gating to voice channel joining
    - Modify joinChannel function to check hostHasPremium from Firebase
    - Throw appropriate error when premium is required but not available
    - Preserve existing functionality when premium is available
    - _Requirements: 2.1, 2.2, 6.5_
  
  - [ ]* 3.2 Write property test for voice chat access control
    - **Property 3: Voice Chat Access Control**
    - **Validates: Requirements 2.1, 2.2, 2.5, 2.6**
  
  - [x] 3.3 Add hostHasPremium state management to VoiceChatContext
    - Add state for tracking host premium status
    - Implement real-time listener for premium status changes
    - Update context value to expose premium status to components
    - _Requirements: 1.3, 1.4, 8.2, 8.3_
  
  - [ ]* 3.4 Write property test for premium status retrieval
    - **Property 4: Premium Status Retrieval**
    - **Validates: Requirements 1.3, 4.5, 5.1, 6.1**

- [x] 4. Create premium message components
  - [x] 4.1 Implement PremiumRequiredMessage component
    - Create reusable component for displaying premium requirement messages
    - Include different messages for hosts vs players
    - Add upgrade call-to-action for hosts
    - Apply consistent Kodak film aesthetic styling
    - _Requirements: 2.3, 2.4, 3.2, 4.2_
  
  - [x] 4.2 Create VoiceTab component wrapper
    - Implement component that conditionally renders voice controls or premium message
    - Handle premium status checking and error states
    - Ensure proper state updates when premium status changes
    - _Requirements: 3.1, 3.5, 5.2, 5.5_
  
  - [ ]* 4.3 Write property test for premium message display
    - **Property 6: Premium Message Display**
    - **Validates: Requirements 2.3, 3.2, 4.2, 5.3, 6.4, 9.3**

- [x] 5. Update HostScreen for premium voice chat integration
  - [x] 5.1 Add premium status checking on screen load
    - Integrate checkAndSyncHostPremium call when room is created
    - Handle premium status changes during active sessions
    - Update Firebase hostHasPremium field when status changes
    - _Requirements: 4.5, 8.1, 8.2_
  
  - [x] 5.2 Modify Voice tab to show premium-aware interface
    - Replace existing voice controls with VoiceTab component
    - Display appropriate messages when host lacks premium
    - Include upgrade call-to-action for non-premium hosts
    - _Requirements: 4.1, 4.2, 4.3, 4.4_
  
  - [ ]* 5.3 Write property test for host screen UI updates
    - **Property 5: UI State Consistency**
    - **Validates: Requirements 3.1, 3.2, 4.1, 4.2, 5.2, 5.3**

- [x] 6. Update WifiLobbyScreen for premium voice chat integration
  - [x] 6.1 Add host premium status monitoring
    - Implement Firebase listener for hostHasPremium field
    - Update local state when host premium status changes
    - Handle real-time synchronization within 2 seconds
    - _Requirements: 5.1, 5.5, 1.4_
  
  - [x] 6.2 Modify Voice tab for premium-gated access
    - Replace voice controls with premium-aware VoiceTab component
    - Display locked message when host lacks premium
    - Show participant count and join controls when premium is available
    - _Requirements: 5.2, 5.3, 5.4_
  
  - [ ]* 6.3 Write property test for lobby voice integration
    - **Property 7: Dynamic Status Updates**
    - **Validates: Requirements 3.5, 4.4, 5.5, 8.3, 8.4**

- [x] 7. Update DiscussionScreen for premium voice chat integration
  - [x] 7.1 Add premium status checking and VoiceControl visibility
    - Check hostHasPremium from Firebase when screen loads
    - Conditionally render VoiceControl based on premium status
    - Display subtle premium message when voice is unavailable
    - _Requirements: 6.1, 6.2, 6.3, 6.4_
  
  - [x] 7.2 Prevent automatic voice joining for non-premium hosts
    - Modify existing auto-join logic to check premium status first
    - Ensure voice chat remains disabled when host lacks premium
    - _Requirements: 6.5, 2.6_
  
  - [ ]* 7.3 Write property test for discussion screen integration
    - **Property 10: Voice Chat Prevention**
    - **Validates: Requirements 6.5, 2.3**

- [x] 8. Implement edge case handling for host disconnection
  - [x] 8.1 Preserve premium status during host disconnection
    - Ensure hostHasPremium field persists when host disconnects
    - Continue voice chat functionality based on preserved status
    - _Requirements: 7.1, 7.2_
  
  - [x] 8.2 Handle premium status re-verification on reconnection
    - Re-check host premium status when host reconnects
    - Update all players if status changed during disconnection
    - Provide appropriate messaging for status changes
    - _Requirements: 7.3, 7.4_
  
  - [ ]* 8.3 Write property test for host disconnection handling
    - **Property 8: Host Disconnection Handling**
    - **Validates: Requirements 7.1, 7.2, 7.3, 7.4, 7.5**

- [x] 9. Implement mid-game premium status change handling
  - [x] 9.1 Add real-time premium status monitoring for active sessions
    - Set up Firebase listeners to detect premium status changes
    - Update UI components within 1 second of status change
    - _Requirements: 8.1, 8.2, 8.3_
  
  - [x] 9.2 Handle voice chat disconnection on premium loss
    - Disconnect all voice participants when host loses premium
    - Display appropriate message about premium expiration
    - Ensure graceful degradation of voice functionality
    - _Requirements: 8.4, 8.5_
  
  - [ ]* 9.3 Write property test for mid-game status changes
    - **Property 7: Dynamic Status Updates** (continued validation)
    - **Validates: Requirements 3.5, 4.4, 5.5, 8.3, 8.4**

- [x] 10. Checkpoint - Ensure all tests pass and basic functionality works
  - Ensure all tests pass, ask the user if questions arise.

- [x] 11. Implement comprehensive error handling and fallback mechanisms
  - [x] 11.1 Add error handling for premium check failures
    - Implement graceful fallback to no premium access on errors
    - Add proper error logging for debugging purposes
    - Ensure game continues to function when premium checks fail
    - _Requirements: 9.1, 9.2, 9.5_
  
  - [x] 11.2 Add retry logic for Firebase premium updates
    - Implement exponential backoff for failed Firebase operations
    - Queue premium updates for retry when connection is restored
    - _Requirements: 9.4_
  
  - [ ]* 11.3 Write property test for error handling
    - **Property 9: Error Handling and Fallback**
    - **Validates: Requirements 9.1, 9.2, 9.4, 9.5**

- [x] 12. Integration testing and cleanup
  - [x] 12.1 Test cross-screen premium status synchronization
    - Verify premium status updates propagate across all screens
    - Test voice chat access control in all affected screens
    - Validate error handling and fallback mechanisms
    - _Requirements: All requirements integration testing_
  
  - [ ]* 12.2 Write integration tests for complete feature
    - Test end-to-end premium voice chat functionality
    - Validate edge cases and error scenarios
    - Test real-time synchronization across multiple clients
  
  - [x] 12.3 Clean up debug logging and finalize implementation
    - Remove development-only console.log statements
    - Ensure proper error messages are user-friendly
    - Verify all Firebase data cleanup occurs properly
    - _Requirements: 10.5_

- [x] 13. Final checkpoint - Ensure all tests pass and feature is complete
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Property tests validate universal correctness properties from the design
- Integration tests ensure the feature works end-to-end across all screens
- The implementation builds incrementally, with each task depending on previous ones
- Error handling and edge cases are thoroughly covered to ensure robust functionality