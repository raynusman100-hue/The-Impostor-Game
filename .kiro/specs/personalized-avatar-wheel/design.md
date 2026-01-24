# Design Document: Personalized Custom Avatar Wheel

## Overview

The Personalized Custom Avatar Wheel feature transforms the existing avatar selection system from 12 static cinema-themed avatars to 12 dynamically generated custom avatars unique to each user. The design leverages the existing `CustomBuiltAvatar` component and randomization logic while introducing new state management for wheel configurations, lock statuses, and persistence mechanisms.

The core design principle is to maintain the existing wheel UI/UX (spinning, momentum, snap-to-position) while replacing the avatar rendering logic and adding new interaction patterns (tap-to-regenerate, long-press-to-lock, double-tap-to-customize).

## Architecture

### Component Structure

```
ProfileScreen
├── AvatarWheel (modified)
│   ├── Wheel State Management
│   ├── 12 × AvatarSlot (new)
│   │   ├── CustomBuiltAvatar
│   │   ├── Lock Indicator
│   │   └── Interaction Handlers
│   ├── Center Hub (existing)
│   └── Randomize All Button (new)
└── AvatarBuilder Modal (existing, enhanced)
```

### Data Flow

1. **Initial Load**: ProfileScreen → AsyncStorage/Firebase → Wheel State → AvatarWheel
2. **Slot Interaction**: User Tap → Regenerate Avatar → Update State → Save to Storage
3. **Lock Toggle**: User Long-Press → Toggle Lock → Update State → Save to Storage
4. **Manual Edit**: User Double-Tap → Open AvatarBuilder → Save Config → Lock Slot → Update State
5. **Bulk Randomize**: User Action → Confirm → Regenerate Unlocked → Update State → Save to Storage

## Components and Interfaces

### 1. Wheel State Data Structure

```typescript
interface AvatarConfiguration {
  faceShape: 'round' | 'oval' | 'square' | 'heart' | 'long';
  skinColor: string; // hex color
  eyeStyle: 'normal' | 'happy' | 'sleepy' | 'wink' | 'big' | 'small' | 'angry' | 'cute';
  mouthStyle: 'smile' | 'grin' | 'neutral' | 'open' | 'smirk' | 'sad' | 'kiss' | 'teeth';
  hairStyle: 'none' | 'short' | 'spiky' | 'curly' | 'wavy' | 'long' | 'ponytail' | 'mohawk' | 'buzz' | 'cap' | 'beanie';
  hairColor: string; // hex color
  accessory: 'none' | 'glasses' | 'sunglasses' | 'roundGlasses' | 'eyepatch' | 'bandana' | 'earrings' | 'headphones';
  bgColor: string; // hex color
}

interface WheelState {
  avatars: AvatarConfiguration[]; // Array of 12 configurations
  lockedSlots: boolean[]; // Array of 12 booleans
  selectedIndex: number; // 0-11
  version: number; // For future migrations
}
```

### 2. AvatarSlot Component (New)

```typescript
interface AvatarSlotProps {
  index: number; // 0-11
  config: AvatarConfiguration;
  isLocked: boolean;
  isSelected: boolean;
  onTap: (index: number) => void;
  onLongPress: (index: number) => void;
  onDoubleTab: (index: number) => void;
  size: number;
  theme: Theme;
}
```

**Responsibilities:**
- Render CustomBuiltAvatar with provided configuration
- Display lock indicator overlay when isLocked is true
- Handle tap gesture for regeneration
- Handle long-press gesture for lock toggle
- Handle double-tap gesture for manual customization
- Provide visual feedback for all interactions
- Animate slot changes (fade-in, scale, etc.)

### 3. Avatar Generation Utility

```typescript
function generateRandomAvatarConfig(): AvatarConfiguration {
  // Randomly select from available options for each property
  // Ensure visual distinctness by avoiding recent combinations
}

function generateUniqueAvatarSet(count: number): AvatarConfiguration[] {
  // Generate 'count' visually distinct avatar configurations
  // Use a diversity algorithm to maximize visual differences
}

function isVisuallyDistinct(config1: AvatarConfiguration, config2: AvatarConfiguration): boolean {
  // Calculate visual similarity score
  // Return true if configurations are sufficiently different
}
```

**Visual Distinctness Algorithm:**
- Track recently generated combinations
- Ensure at least 3 properties differ between adjacent avatars
- Prioritize variation in prominent features (face shape, hair style, accessories)

### 4. Wheel State Manager

```typescript
class WheelStateManager {
  private state: WheelState;
  
  constructor(initialState?: WheelState) {
    this.state = initialState || this.createDefaultState();
  }
  
  createDefaultState(): WheelState {
    // Generate 12 unique avatar configurations
    // Initialize all locks to false
    // Set selectedIndex to 0
  }
  
  regenerateSlot(index: number): void {
    // Generate new config for slot at index
    // Preserve lock status
    // Trigger save
  }
  
  toggleLock(index: number): void {
    // Toggle lockedSlots[index]
    // Trigger save
  }
  
  updateSlotConfig(index: number, config: AvatarConfiguration): void {
    // Update avatars[index] with new config
    // Set lockedSlots[index] to true (manual edit implies lock)
    // Trigger save
  }
  
  randomizeAll(): void {
    // For each slot where lockedSlots[i] === false:
    //   Generate new random config
    // Trigger save
  }
  
  getState(): WheelState {
    return this.state;
  }
  
  async save(): Promise<void> {
    // Save to AsyncStorage
    // Save to Firebase if user is authenticated
  }
  
  async load(userId?: string): Promise<WheelState> {
    // Try Firebase first if userId provided
    // Fall back to AsyncStorage
    // Return loaded state or create default
  }
}
```

### 5. Modified AvatarWheel Component

**Changes to Existing Component:**

1. **Replace Avatar Rendering:**
   - Remove cinema-themed avatar rendering logic
   - Replace with AvatarSlot components using CustomBuiltAvatar
   - Pass wheel state configurations to each slot

2. **Add Interaction Handlers:**
   - Tap handler: Regenerate individual slot
   - Long-press handler: Toggle lock status
   - Double-tap handler: Open AvatarBuilder for slot

3. **Add Lock Indicators:**
   - Render lock icon overlay on locked slots
   - Position lock icon in top-right corner of slot
   - Animate lock icon on interaction attempts

4. **Add Randomize All Button:**
   - Position button below wheel or in accessible location
   - Show confirmation dialog on press
   - Disable if all slots are locked

5. **Preserve Existing Mechanics:**
   - Keep all rotation, momentum, and snap logic unchanged
   - Keep center hub display unchanged
   - Keep badge display unchanged
   - Keep drag-to-spin interaction unchanged

### 6. Storage Integration

**AsyncStorage Schema:**
```json
{
  "user_profile": {
    "username": "string",
    "avatarId": "number (deprecated)",
    "useCustomAvatar": "boolean (deprecated)",
    "customAvatarConfig": "object (deprecated)",
    "wheelState": {
      "avatars": [...],
      "lockedSlots": [...],
      "selectedIndex": 0,
      "version": 1
    },
    "uid": "string",
    "email": "string",
    "updatedAt": "ISO string"
  }
}
```

**Firebase Schema:**
```
users/
  {uid}/
    username: string
    wheelState:
      avatars: array[12]
      lockedSlots: array[12]
      selectedIndex: number
      version: number
    updatedAt: timestamp
```

## Data Models

### AvatarConfiguration Model

**Properties:**
- `faceShape`: One of 5 face shapes
- `skinColor`: Hex color from predefined palette (6 options)
- `eyeStyle`: One of 8 eye styles
- `mouthStyle`: One of 8 mouth styles
- `hairStyle`: One of 11 hair styles
- `hairColor`: Hex color from predefined palette (8 options)
- `accessory`: One of 8 accessories
- `bgColor`: Hex color from predefined palette (8 options)

**Total Combinations:** 5 × 6 × 8 × 8 × 11 × 8 × 8 × 8 = 10,813,440 possible avatars

**Serialization:** JSON object (~150-200 bytes per configuration)

### WheelState Model

**Properties:**
- `avatars`: Array of 12 AvatarConfiguration objects
- `lockedSlots`: Array of 12 booleans
- `selectedIndex`: Integer 0-11
- `version`: Integer for schema versioning

**Total Size:** ~2-3KB (well under 5KB requirement)

**Validation Rules:**
- avatars.length must equal 12
- lockedSlots.length must equal 12
- selectedIndex must be between 0 and 11
- Each avatar config must have all required properties
- All color values must be valid hex strings

## Correctness Properties

*A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*


### Property 1: Initial Generation Produces Valid Wheel State

*For any* new user initialization, generating the initial wheel state should produce exactly 12 valid avatar configurations with all locks set to false and selectedIndex set to 0.

**Validates: Requirements 1.1, 1.4**

### Property 2: Generated Avatars Use Valid Property Values

*For any* generated avatar configuration, all properties (faceShape, skinColor, eyeStyle, mouthStyle, hairStyle, hairColor, accessory, bgColor) should have values from their respective valid option sets.

**Validates: Requirements 1.2**

### Property 3: Generated Avatar Set Has Visual Distinctness

*For any* set of 12 generated avatar configurations, each pair of avatars should differ in at least 3 properties to ensure visual distinctness.

**Validates: Requirements 1.3**

### Property 4: Wheel State Round-Trip Preservation

*For any* valid wheel state (including all 12 avatar configurations, lock statuses, and selected index), saving to storage then loading should produce an equivalent wheel state.

**Validates: Requirements 2.5, 2.6, 2.7**

### Property 5: Firebase Takes Priority Over AsyncStorage

*For any* user with wheel state in both Firebase and AsyncStorage, loading the profile should retrieve the wheel state from Firebase.

**Validates: Requirements 2.3**

### Property 6: AsyncStorage Fallback When Firebase Unavailable

*For any* user when Firebase is unavailable or returns an error, loading the profile should successfully retrieve the wheel state from AsyncStorage.

**Validates: Requirements 2.4**

### Property 7: Single Slot Regeneration Isolation

*For any* wheel state and any slot index, regenerating that slot should change only that slot's avatar configuration while leaving all other 11 slots unchanged.

**Validates: Requirements 3.1**

### Property 8: Locked Slots Prevent Regeneration

*For any* wheel state and any slot index where lockedSlots[index] is true, attempting to regenerate that slot should leave the avatar configuration unchanged.

**Validates: Requirements 3.5**

### Property 9: Bulk Randomization Respects Locks

*For any* wheel state, executing randomizeAll should generate new configurations for all slots where lockedSlots[index] is false, while preserving configurations for all slots where lockedSlots[index] is true.

**Validates: Requirements 4.2**

### Property 10: Lock Toggle Is Idempotent

*For any* wheel state and any slot index, toggling the lock twice should restore the original lock status (toggle is its own inverse).

**Validates: Requirements 5.1**

### Property 11: State Persistence After Modifications

*For any* wheel state modification operation (regenerate slot, toggle lock, manual edit, randomize all), the updated wheel state should be immediately saved to both AsyncStorage and Firebase (if authenticated).

**Validates: Requirements 1.5, 2.1, 2.2, 3.6, 4.5, 5.5, 6.6**

### Property 12: AvatarBuilder Receives Correct Initial Config

*For any* wheel state and any slot index, opening the AvatarBuilder for that slot should pass the current avatar configuration at that index as the initial state.

**Validates: Requirements 6.2**

### Property 13: Manual Edit Updates Correct Slot

*For any* wheel state, slot index, and new avatar configuration, saving from the AvatarBuilder should update only the avatar configuration at that specific slot index.

**Validates: Requirements 6.3**

### Property 14: Manual Edit Auto-Locks Slot

*For any* wheel state and slot index, completing a manual edit via AvatarBuilder should set lockedSlots[index] to true.

**Validates: Requirements 6.4**

### Property 15: AvatarBuilder Cancel Preserves State

*For any* wheel state and slot index, canceling the AvatarBuilder should leave the avatar configuration at that slot unchanged.

**Validates: Requirements 6.5**

### Property 16: Wheel State Serialization Is Valid JSON

*For any* valid wheel state, serializing it to JSON should produce valid JSON that can be parsed back to an equivalent wheel state.

**Validates: Requirements 8.1**

### Property 17: Lock Status Array Structure

*For any* valid wheel state, the lockedSlots property should be an array of exactly 12 boolean values.

**Validates: Requirements 8.2**

### Property 18: Selected Index Is Valid Integer

*For any* valid wheel state, the selectedIndex property should be an integer between 0 and 11 (inclusive).

**Validates: Requirements 8.3**

### Property 19: Serialized State Size Constraint

*For any* valid wheel state, the serialized JSON representation should be less than 5KB in size.

**Validates: Requirements 8.4**

### Property 20: Migration Creates Wheel State For Legacy Profiles

*For any* user profile without a wheelState property, loading the profile should generate and save a new wheel state with 12 avatar configurations.

**Validates: Requirements 9.1**

### Property 21: Migration Preserves Legacy Avatar Selection

*For any* user profile with an avatarId property but no wheelState, migration should set selectedIndex to (avatarId - 1).

**Validates: Requirements 9.2**

### Property 22: Migration Preserves Legacy Custom Avatar

*For any* user profile with a customAvatarConfig property but no wheelState, migration should place that configuration in avatars[0] and set lockedSlots[0] to true.

**Validates: Requirements 9.3**

## Error Handling

### Invalid Wheel State

**Scenario:** Loaded wheel state has invalid structure (wrong array lengths, missing properties, invalid values)

**Handling:**
1. Log error with details of validation failure
2. Generate new default wheel state
3. Save corrected state to storage
4. Display user-friendly message: "Avatar wheel reset to defaults"

### Storage Failures

**Scenario:** AsyncStorage or Firebase write operations fail

**Handling:**
1. Retry operation up to 3 times with exponential backoff
2. If all retries fail, log error but allow user to continue
3. Queue failed write for retry on next app launch
4. Display warning: "Changes may not be saved. Please check your connection."

### Concurrent Modifications

**Scenario:** User modifies wheel state on multiple devices simultaneously

**Handling:**
1. Use Firebase timestamps to determine most recent change
2. On conflict, prefer most recent timestamp
3. Merge lock statuses (union of locked slots from both versions)
4. Notify user if significant conflict detected: "Avatar wheel synced from another device"

### Avatar Generation Failures

**Scenario:** Random generation produces invalid configuration

**Handling:**
1. Validate generated configuration before applying
2. If invalid, retry generation up to 5 times
3. If all retries fail, use fallback configuration (default values)
4. Log error for debugging

### Migration Failures

**Scenario:** Legacy profile data is corrupted or incomplete

**Handling:**
1. Attempt to salvage any valid data (username, email)
2. Generate fresh wheel state with defaults
3. Log migration error with profile details
4. Continue with new wheel state

## Testing Strategy

### Unit Testing

Unit tests will focus on specific examples, edge cases, and error conditions:

**State Management Tests:**
- Test WheelStateManager initialization with valid/invalid data
- Test individual slot regeneration with various indices
- Test lock toggle on first and last slots
- Test randomizeAll with all locked, all unlocked, and mixed scenarios
- Test manual edit updates correct slot
- Test state validation catches invalid structures

**Storage Tests:**
- Test AsyncStorage save/load with valid wheel state
- Test Firebase save/load with valid wheel state
- Test fallback to AsyncStorage when Firebase fails
- Test storage retry logic on failures

**Migration Tests:**
- Test migration from profile with avatarId only
- Test migration from profile with customAvatarConfig
- Test migration from profile with both
- Test migration from completely empty profile

**Edge Cases:**
- Empty wheel state (should be rejected)
- Wheel state with 11 or 13 avatars (should be rejected)
- Negative selectedIndex (should be rejected)
- selectedIndex > 11 (should be rejected)
- Invalid color values (should be rejected)
- Invalid enum values for properties (should be rejected)

### Property-Based Testing

Property-based tests will verify universal properties across all inputs using a property-based testing library (fast-check for JavaScript/TypeScript). Each test will run a minimum of 100 iterations with randomized inputs.

**Test Configuration:**
- Library: fast-check (npm package)
- Iterations per test: 100 minimum
- Shrinking: Enabled to find minimal failing cases
- Seed: Random (logged for reproducibility)

**Property Test Suite:**

Each property test must include a comment tag referencing the design document property:

```javascript
// Feature: personalized-avatar-wheel, Property 1: Initial Generation Produces Valid Wheel State
```

**Test Organization:**
- Group tests by requirement area (generation, persistence, interaction, migration)
- Use descriptive test names matching property titles
- Include property number in test tags for traceability

**Generator Strategy:**
- Create custom generators for AvatarConfiguration (random valid configs)
- Create custom generators for WheelState (random valid states)
- Create generators for invalid states (for negative testing)
- Ensure generators produce diverse test cases

**Assertion Strategy:**
- Use deep equality for configuration comparisons
- Use structural validation for wheel state integrity
- Use size checks for serialization constraints
- Use isolation checks for slot operations

### Integration Testing

Integration tests will verify end-to-end flows:

**Profile Load Flow:**
1. Create user profile with wheel state
2. Save to storage
3. Clear in-memory state
4. Load profile
5. Verify wheel state matches original

**Slot Interaction Flow:**
1. Initialize wheel with known state
2. Tap slot to regenerate
3. Verify only that slot changed
4. Verify state saved to storage
5. Reload and verify persistence

**Lock and Randomize Flow:**
1. Initialize wheel with known state
2. Lock specific slots
3. Execute randomizeAll
4. Verify locked slots unchanged
5. Verify unlocked slots changed
6. Verify state saved to storage

**Manual Edit Flow:**
1. Initialize wheel with known state
2. Open AvatarBuilder for slot
3. Modify configuration
4. Save from builder
5. Verify slot updated
6. Verify slot auto-locked
7. Verify state saved to storage

### Performance Testing

**Metrics to Monitor:**
- Wheel state serialization time (target: < 10ms)
- Wheel state deserialization time (target: < 10ms)
- Single slot regeneration time (target: < 50ms)
- Bulk randomization time (target: < 200ms)
- Storage save time (target: < 100ms)
- Storage load time (target: < 150ms)

**Load Testing:**
- Test with maximum size wheel state (all properties at max length)
- Test rapid successive regenerations (stress test)
- Test concurrent save operations (race condition testing)

### Accessibility Testing

**Requirements:**
- All interactive elements (slots, buttons) must have minimum 44x44pt touch targets
- Lock indicators must have sufficient color contrast
- Haptic feedback must be consistent across interactions
- Screen reader support for slot status (locked/unlocked)

## Implementation Notes

### Backward Compatibility Strategy

1. **Detect Legacy Profile:** Check for presence of `wheelState` property
2. **If Missing:** Run migration logic to create wheelState from legacy properties
3. **Preserve Legacy Data:** Keep old properties for potential rollback
4. **Version Flag:** Set `wheelState.version = 1` to track schema version

### Performance Optimizations

1. **Lazy Loading:** Only load wheel state when ProfileScreen is mounted
2. **Debounced Saves:** Batch rapid state changes into single save operation
3. **Memoization:** Cache serialized wheel state to avoid repeated JSON.stringify
4. **Shallow Comparison:** Use shallow equality checks for unchanged slots

### Animation Considerations

1. **Slot Regeneration:** 300ms fade-out, generate new config, 300ms fade-in
2. **Lock Toggle:** 200ms scale animation on lock icon
3. **Bulk Randomize:** Stagger slot animations by 50ms for visual effect
4. **Wheel Spin:** Preserve existing momentum physics unchanged

### Accessibility Enhancements

1. **VoiceOver Support:** Announce slot number, lock status, and avatar description
2. **Haptic Patterns:** Distinct patterns for regenerate (light), lock (medium), error (error)
3. **Visual Indicators:** High contrast lock icons, clear selection highlighting
4. **Touch Targets:** Ensure all slots meet 44x44pt minimum size

### Security Considerations

1. **Input Validation:** Validate all loaded wheel states before applying
2. **Sanitization:** Sanitize color values to prevent injection
3. **Rate Limiting:** Limit regeneration frequency to prevent abuse
4. **Data Integrity:** Use checksums to detect corrupted storage data
