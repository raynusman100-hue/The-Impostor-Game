# Agora Voice Chat Troubleshooting Guide

## Issue: Remote Users = 0 (Can't hear other players)

If you see "Is Joined: ✅ YES" but "Remote Users: 0", here are the fixes:

## Changes Made to Fix Voice Chat

### 1. Fixed Token Issue
- **Before**: Using empty string `''` as token
- **After**: Using `null` for testing mode (no token server required)
- **Production**: You'll need to implement a token server

### 2. Fixed UID Generation
- **Before**: Everyone using UID `0`
- **After**: Each user gets a unique random UID
- **Why**: Agora needs unique UIDs to identify different users

### 3. Added Audio Enablement
- **Before**: Audio module not explicitly enabled
- **After**: Calling `enableAudio()` before joining
- **Why**: Ensures audio is ready before channel join

### 4. Fixed Channel Profile Timing
- **Before**: Setting profile during join
- **After**: Setting profile BEFORE join
- **Why**: Profile must be set before joining channel

### 5. Added Channel Tracking
- **Before**: Could join same channel multiple times
- **After**: Tracks current channel, leaves before joining new one
- **Why**: Prevents duplicate joins and conflicts

### 6. Added Error Listeners
- Connection state changes
- Audio publish/subscribe states
- General errors
- **Why**: Better debugging and error detection

## Agora Console Settings to Check

### 1. Go to console.agora.io

### 2. Check Your Project

#### App ID
- Verify: `5756bd3b457b4ecdac763e0ce74cd044`
- Status: Should be "Enabled"
- Type: Should show "Voice Calling" or "RTC"

#### Authentication
For testing (current setup):
- **App Certificate**: Should be DISABLED or NOT GENERATED
- **Token**: Not required when certificate is disabled
- This allows using `null` as token

For production (recommended):
- **App Certificate**: ENABLED
- **Token Server**: Required (you'll need to build one)
- More secure but more complex

### 3. Check Usage & Billing

#### Free Tier Limits
- **10,000 minutes/month** free
- Check if you've exceeded limits
- Go to "Usage" tab in console

#### Project Status
- Make sure project is not suspended
- Check for any warnings or errors

### 4. Enable Required Features

In your Agora project settings, ensure these are enabled:
- ✅ **Voice Calling** (RTC)
- ✅ **Audio** features
- ❌ Don't need Video for voice-only

### 5. Check Service Status

Visit: https://status.agora.io/
- Make sure Agora services are operational
- Check for any ongoing incidents

## Testing Checklist

### Before Testing:
1. ✅ Built with development build (not Expo Go)
2. ✅ Microphone permissions granted
3. ✅ 2+ devices ready
4. ✅ Both devices have internet
5. ✅ Agora App ID is correct

### During Testing:
1. **Device 1**: Create room (Host)
2. **Device 2**: Join room (Player)
3. **Both**: Check debug panel shows "Is Joined: ✅ YES"
4. **Wait 5 seconds** for connection to establish
5. **Check**: "Remote Users" should show 1 (or more)
6. **Speak**: Other device should hear you

### Console Logs to Watch:

#### Successful Connection:
```
🎤 VoiceChat: ✅ Engine initialized successfully
🎤 HOST: Joining voice channel: 123456
🎤 VoiceChat: Audio enabled
🎤 VoiceChat: Channel profile set to Communication
🎤 VoiceChat: Client role set to Broadcaster
🎤 VoiceChat: Using UID: 847392
🎤 VoiceChat: ✅ Joined channel successfully! 123456
🎤 VoiceChat: ✅ User joined 582910
```

#### Failed Connection:
```
🎤 VoiceChat: ❌ Error: [error code]
🎤 VoiceChat: Connection state changed: FAILED
```

## Common Issues & Solutions

### Issue 1: "Is Joined: ❌ NO"
**Cause**: Engine not initialized or join failed
**Solution**:
- Check Agora App ID is correct
- Verify you're using dev build (not Expo Go)
- Check microphone permissions
- Look for error logs in console

### Issue 2: "Is Joined: ✅ YES" but "Remote Users: 0"
**Cause**: Other users not in channel or audio not publishing
**Solution**:
- Wait 5-10 seconds for connection
- Check other device also shows "Is Joined: ✅ YES"
- Verify both devices in same room code
- Check console for "User joined" logs
- Try unmuting both devices

### Issue 3: Can't hear other players
**Cause**: Audio not publishing or subscribing
**Solution**:
- Check both devices are unmuted
- Check device volume is up
- Look for "Audio publish state" logs
- Try toggling mute/unmute
- Restart the app

### Issue 4: "Token expired" error
**Cause**: Using token authentication without valid token
**Solution**:
- For testing: Disable App Certificate in Agora console
- For production: Implement token server
- Current code uses `null` token (works without certificate)

### Issue 5: "Invalid App ID" error
**Cause**: Wrong App ID or project disabled
**Solution**:
- Verify App ID in `src/utils/constants.js`
- Check project is enabled in Agora console
- Make sure no typos in App ID

## Advanced Debugging

### Enable Verbose Logging

In VoiceChatContext.js, the code already has extensive logging. Check console for:
- 🎤 emoji = Voice chat logs
- ✅ emoji = Success
- ❌ emoji = Error
- ⚠️ emoji = Warning

### Check Agora SDK Version

```bash
npm list react-native-agora
```

Should show: `react-native-agora@4.5.3`

### Test with Agora Demo App

1. Download Agora's official demo app
2. Use your App ID
3. Join same channel name
4. If demo works but yours doesn't = code issue
5. If demo doesn't work = Agora account issue

### Network Requirements

Agora needs:
- **UDP ports**: 1080, 4000-4030
- **TCP ports**: 1080, 8000, 9700, 25000, 30000
- **Firewall**: Allow Agora domains
- **NAT**: Should work behind NAT

## Production Checklist

Before going to production:

1. **Enable App Certificate** in Agora console
2. **Build Token Server** (Node.js/Python/etc)
3. **Update joinChannel** to use real tokens
4. **Set up token refresh** (tokens expire)
5. **Monitor usage** in Agora console
6. **Set up billing** if exceeding free tier
7. **Test with real users** in different networks

## Token Server (For Production)

You'll need to build a server that generates tokens:

```javascript
// Example: Update joinChannel to use token server
const joinChannel = async (channelName, uid) => {
    // Fetch token from your server
    const response = await fetch(`https://your-server.com/token?channel=${channelName}&uid=${uid}`);
    const { token } = await response.json();
    
    // Use real token instead of null
    await agoraEngineRef.current.joinChannel(
        token, // Real token from server
        channelName,
        uid,
        options
    );
};
```

## Support Resources

- **Agora Docs**: https://docs.agora.io/en/voice-calling/get-started/get-started-sdk
- **Agora Console**: https://console.agora.io/
- **Agora Status**: https://status.agora.io/
- **Agora Community**: https://www.agora.io/en/community/
- **GitHub Issues**: https://github.com/AgoraIO-Extensions/react-native-agora/issues

## Quick Fixes Summary

1. ✅ **Fixed token** - Using `null` for testing
2. ✅ **Fixed UIDs** - Unique random UIDs
3. ✅ **Added enableAudio()** - Explicitly enable audio
4. ✅ **Fixed timing** - Set profile before join
5. ✅ **Added tracking** - Prevent duplicate joins
6. ✅ **Added error logs** - Better debugging

**Try the app now and check the console logs!** 🎤
