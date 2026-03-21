# PremiumRequiredMessage Component Usage Guide

## Overview

The `PremiumRequiredMessage` component displays premium requirement messages with different content for hosts vs players. It includes upgrade call-to-action for hosts and applies consistent Kodak film aesthetic styling.

## Import

```javascript
import PremiumRequiredMessage from '../components/PremiumRequiredMessage';
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `message` | string | undefined | Custom message to display (optional) |
| `isHost` | boolean | false | Whether the current user is the host |
| `onUpgrade` | function | undefined | Callback for upgrade button press (required for hosts) |
| `type` | string | 'player' | Message type: 'host', 'player', 'lobby', 'discussion' |
| `style` | object | undefined | Additional container styling |
| `compact` | boolean | false | Whether to use compact layout |

## Usage Examples

### Basic Player Message
```javascript
<PremiumRequiredMessage />
// Displays: "Voice chat requires the host to have premium."
```

### Host Message with Upgrade Button
```javascript
<PremiumRequiredMessage 
    isHost={true}
    onUpgrade={() => navigation.navigate('Premium')}
/>
// Displays message with "UPGRADE TO PREMIUM" button
```

### Lobby Context
```javascript
<PremiumRequiredMessage 
    type="lobby"
    isHost={false}
/>
// Displays: "Voice chat is locked. The host needs premium to enable it."
```

### Discussion Screen (Compact)
```javascript
<PremiumRequiredMessage 
    type="discussion"
    compact={true}
/>
// Displays compact version for discussion screen
```

### Custom Message
```javascript
<PremiumRequiredMessage 
    message="Voice chat temporarily unavailable"
    compact={true}
/>
// Displays custom message
```

## Integration in Voice Tabs

### HostScreen Voice Tab
```javascript
const VoiceTab = ({ hostHasPremium, onUpgrade }) => {
    if (!hostHasPremium) {
        return (
            <PremiumRequiredMessage 
                type="host"
                isHost={true}
                onUpgrade={onUpgrade}
            />
        );
    }
    
    return <VoiceControls />;
};
```

### WifiLobbyScreen Voice Tab
```javascript
const VoiceTab = ({ hostHasPremium, isHost, onUpgrade }) => {
    if (!hostHasPremium) {
        return (
            <PremiumRequiredMessage 
                type="lobby"
                isHost={isHost}
                onUpgrade={isHost ? onUpgrade : undefined}
            />
        );
    }
    
    return <VoiceControls />;
};
```

### DiscussionScreen Integration
```javascript
const DiscussionScreen = ({ hostHasPremium }) => {
    return (
        <View>
            {/* Other discussion content */}
            
            {!hostHasPremium && (
                <PremiumRequiredMessage 
                    type="discussion"
                    compact={true}
                />
            )}
            
            {hostHasPremium && <VoiceControl />}
        </View>
    );
};
```

## Styling Features

- **Kodak Film Aesthetic**: Consistent with app's cinematic theme
- **Film Perforations**: Decorative elements on sides (disabled in compact mode)
- **Premium Lock Icon**: Lock icon with crown badge
- **Responsive Layout**: Adapts to compact mode for smaller spaces
- **Theme Integration**: Uses theme colors and shadows
- **Upgrade Button**: Styled call-to-action for hosts

## Requirements Satisfied

- ✅ **Requirement 2.3**: Premium messages displayed when voice chat unavailable
- ✅ **Requirement 2.4**: Clear messaging about premium requirements
- ✅ **Requirement 3.2**: Consistent Kodak film aesthetic styling
- ✅ **Requirement 4.2**: Upgrade call-to-action for hosts
- ✅ **Requirement 5.3**: Appropriate lobby messages
- ✅ **Requirement 6.4**: Subtle discussion screen integration

## Component Features

1. **Context-Aware Messages**: Different messages for different screen contexts
2. **Role-Based Content**: Different content for hosts vs players
3. **Upgrade Integration**: Call-to-action button for premium upgrade
4. **Flexible Styling**: Compact mode for space-constrained areas
5. **Accessibility**: Clear messaging and proper contrast
6. **Reusable Design**: Single component for all premium messaging needs