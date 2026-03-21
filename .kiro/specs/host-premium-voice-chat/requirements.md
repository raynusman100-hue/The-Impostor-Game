# Requirements Document

## Introduction

This feature implements host-based premium voice chat access control for WiFi multiplayer mode. Voice chat functionality will be gated by the host's premium status - if the host has premium, all players in the session can use voice chat. If the host doesn't have premium, voice chat is disabled for everyone with an appropriate message displayed.

## Glossary

- **Host**: The player who creates and manages the WiFi multiplayer room
- **Premium_Status**: A boolean flag indicating whether a user has an active premium subscription
- **Voice_Chat_System**: The Agora-based voice communication system integrated into the app
- **WiFi_Session**: A multiplayer game session using local WiFi connectivity
- **Voice_Control**: The UI component that allows users to join/leave voice chat and toggle mute
- **Premium_Manager**: The utility module that checks and manages premium subscription status
- **Room_Code**: A unique 6-digit identifier for a WiFi multiplayer session
- **Player**: A non-host participant in a WiFi multiplayer session
- **Voice_Tab**: The UI tab in lobby/host screens where users can access voice chat features
- **Premium_Message**: An informational message displayed when voice chat is unavailable due to lack of premium

## Requirements

### Requirement 1: Host Premium Status Synchronization

**User Story:** As a host, I want my premium status to be synchronized to all players in my room, so that they know whether voice chat is available.

#### Acceptance Criteria

1. WHEN a host creates a WiFi room, THE System SHALL retrieve the host's Premium_Status from Premium_Manager
2. WHEN the host's Premium_Status is retrieved, THE System SHALL store it in the Firebase room data under the key `hostHasPremium`
3. WHEN a player joins a WiFi room, THE System SHALL receive the host's Premium_Status from Firebase
4. WHILE a WiFi_Session is active, THE System SHALL synchronize any changes to the host's Premium_Status to all connected players within 2 seconds
5. WHEN the host's Premium_Status changes during a session, THE System SHALL update the `hostHasPremium` field in Firebase

### Requirement 2: Voice Chat Access Control

**User Story:** As a player, I want voice chat to be available only when the host has premium, so that I understand the access requirements.

#### Acceptance Criteria

1. WHEN the host has Premium_Status true, THE Voice_Chat_System SHALL allow all players to join voice channels
2. WHEN the host has Premium_Status false, THE Voice_Chat_System SHALL prevent all players from joining voice channels
3. WHEN a player attempts to join voice chat and the host lacks Premium_Status, THE System SHALL display a Premium_Message
4. THE Premium_Message SHALL state "Voice chat requires the host to have premium"
5. WHEN the host has Premium_Status true, THE Voice_Control SHALL be fully functional for all players
6. WHEN the host has Premium_Status false, THE Voice_Control SHALL be hidden or disabled for all players

### Requirement 3: Voice Tab UI Updates

**User Story:** As a user, I want the Voice tab to clearly show whether voice chat is available, so that I understand why I can or cannot use it.

#### Acceptance Criteria

1. WHEN the host has Premium_Status true, THE Voice_Tab SHALL display the standard voice chat interface with join/leave controls
2. WHEN the host has Premium_Status false, THE Voice_Tab SHALL display a Premium_Message instead of voice controls
3. THE Premium_Message SHALL include an explanation that the host needs premium to enable voice chat
4. WHEN displaying the Premium_Message, THE System SHALL use consistent styling with the app's Kodak film aesthetic
5. THE Voice_Tab SHALL update its display within 1 second when the host's Premium_Status changes

### Requirement 4: Host Screen Voice Chat Integration

**User Story:** As a host, I want to see my premium status reflected in the voice chat interface, so that I know what features are available to my players.

#### Acceptance Criteria

1. WHEN a host with Premium_Status true views the Voice_Tab, THE System SHALL display standard voice chat controls
2. WHEN a host with Premium_Status false views the Voice_Tab, THE System SHALL display a message indicating that premium is required
3. THE host's Voice_Tab message SHALL include a call-to-action to upgrade to premium
4. WHEN the host upgrades to premium during a session, THE Voice_Tab SHALL automatically update to show available voice controls
5. THE System SHALL check the host's Premium_Status when the host screen loads

### Requirement 5: Lobby Screen Voice Chat Integration

**User Story:** As a player in the lobby, I want to know if voice chat is available before the game starts, so that I can decide whether to wait or leave.

#### Acceptance Criteria

1. WHEN a player views the WifiLobbyScreen Voice_Tab, THE System SHALL check the host's Premium_Status
2. WHEN the host has Premium_Status true, THE Voice_Tab SHALL display "JOIN CALL" button and participant count
3. WHEN the host has Premium_Status false, THE Voice_Tab SHALL display a Premium_Message
4. THE Premium_Message in the lobby SHALL state "Voice chat is locked. The host needs premium to enable it."
5. WHEN the host's Premium_Status changes from false to true, THE Voice_Tab SHALL update to show available controls within 2 seconds

### Requirement 6: Discussion Screen Voice Chat Integration

**User Story:** As a player during the discussion phase, I want voice chat to be available only if the host has premium, so that the feature is consistently gated.

#### Acceptance Criteria

1. WHEN the DiscussionScreen loads, THE System SHALL check the host's Premium_Status from Firebase
2. WHEN the host has Premium_Status true, THE Voice_Control SHALL be visible and functional
3. WHEN the host has Premium_Status false, THE Voice_Control SHALL be hidden
4. WHEN the host has Premium_Status false, THE System SHALL display a subtle Premium_Message in the discussion UI
5. THE System SHALL not automatically join voice channels when the host lacks Premium_Status

### Requirement 7: Edge Case - Host Disconnection

**User Story:** As a player, I want voice chat to remain functional if the host disconnects but had premium, so that my experience isn't disrupted unnecessarily.

#### Acceptance Criteria

1. WHEN the host disconnects from a WiFi_Session, THE System SHALL preserve the last known Premium_Status value in Firebase
2. WHILE the host is disconnected, THE Voice_Chat_System SHALL continue to function based on the preserved Premium_Status
3. WHEN the host reconnects, THE System SHALL re-verify the host's Premium_Status
4. IF the host's Premium_Status changed while disconnected, THE System SHALL update all players within 2 seconds of reconnection
5. WHEN the room is closed due to host disconnection, THE Voice_Chat_System SHALL gracefully disconnect all players

### Requirement 8: Edge Case - Premium Status Change Mid-Game

**User Story:** As a host, I want my premium status changes to take effect immediately, so that players can use voice chat as soon as I upgrade.

#### Acceptance Criteria

1. WHEN the host's Premium_Status changes from false to true during a session, THE System SHALL update Firebase within 1 second
2. WHEN Firebase is updated with new Premium_Status, THE System SHALL notify all connected players
3. WHEN players receive the Premium_Status update, THE Voice_Tab SHALL refresh to show available controls
4. WHEN the host's Premium_Status changes from true to false during a session, THE System SHALL disconnect all active voice chat participants
5. WHEN disconnecting due to Premium_Status loss, THE System SHALL display a message "Voice chat ended - host premium expired"

### Requirement 9: Error Handling and Fallback

**User Story:** As a user, I want the app to handle premium check failures gracefully, so that I'm not blocked from playing the game.

#### Acceptance Criteria

1. IF Premium_Manager fails to retrieve Premium_Status, THE System SHALL default to Premium_Status false
2. WHEN a premium check fails, THE System SHALL log the error for debugging
3. WHEN a premium check fails, THE System SHALL display a generic Premium_Message without exposing technical errors
4. THE System SHALL retry failed premium checks up to 3 times with exponential backoff
5. IF all retry attempts fail, THE System SHALL proceed with Premium_Status false and allow the game to continue

### Requirement 10: Firebase Data Structure

**User Story:** As a developer, I want a clear Firebase data structure for premium status, so that the feature is maintainable and scalable.

#### Acceptance Criteria

1. THE System SHALL store host Premium_Status in Firebase at path `rooms/{roomCode}/hostHasPremium`
2. THE `hostHasPremium` field SHALL be a boolean value
3. WHEN a room is created, THE System SHALL initialize `hostHasPremium` with the host's current Premium_Status
4. THE System SHALL update `hostHasPremium` whenever the host's Premium_Status changes
5. WHEN a room is deleted, THE System SHALL clean up the `hostHasPremium` field along with other room data
