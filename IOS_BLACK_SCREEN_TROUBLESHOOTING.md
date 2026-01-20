# iOS Black Screen Troubleshooting

## Problem
Black screen after scanning QR code, no iOS bundling logs in Metro.

## Quick Fixes (Try in Order)

### 1. Check Network Connection
**Most common issue - iPhone and computer must be on SAME WiFi**

```bash
# On your computer, find your IP address:
ipconfig
# Look for "IPv4 Address" under your WiFi adapter
```

Verify your iPhone is on the same network (Settings → WiFi).

### 2. Manually Enter Connection URL

Instead of scanning QR code:

1. **Shake your iPhone** to open dev menu
2. If dev menu doesn't appear, the app isn't a dev build
3. If it appears, tap **"Enter URL manually"**
4. Enter: `exp://YOUR_COMPUTER_IP:8081`
   - Example: `exp://192.168.1.100:8081`

### 3. Restart Metro with Tunnel

If same WiFi doesn't work (firewall/network issues):

```bash
# Stop current Metro (Ctrl+C)
npx expo start --dev-client --tunnel
```

This creates a tunnel that bypasses network restrictions. Scan the new QR code.

### 4. Clear Metro Cache

```bash
# Stop Metro, then:
npx expo start --dev-client --clear
```

### 5. Check Firewall

Windows Firewall might be blocking Metro (port 8081):

1. Windows Security → Firewall & network protection
2. Allow an app through firewall
3. Find "Node.js" or "Expo"
4. Enable for Private and Public networks

### 6. Verify Dev Build

The IPA must be a development build. Check Codemagic logs:

```
Build configuration: Debug
CODE_SIGNING_ALLOWED=NO
```

If it says "Release", it won't connect to Metro.

### 7. Check Metro Output

When you run `npx expo start --dev-client`, you should see:

```
Metro waiting on exp://192.168.x.x:8081
› Scan the QR code above with Expo Go (Android) or the Camera app (iOS)
```

If you see errors about ports or network, that's the issue.

## Advanced Debugging

### Check if Metro is Running

```bash
# In a new terminal:
curl http://localhost:8081/status
```

Should return: `packager-status:running`

### Test Network Connectivity

From your iPhone browser, visit:
```
http://YOUR_COMPUTER_IP:8081
```

Should show Metro bundler page. If it doesn't load, network issue.

### Check iOS Logs

If you have Xcode:
1. Window → Devices and Simulators
2. Select your iPhone
3. View Device Logs
4. Look for errors from your app

## Common Error Messages

### "Unable to connect to Metro"
- Network issue or firewall
- Try `--tunnel` flag

### "No bundle URL present"
- App isn't a dev build
- Rebuild with Debug configuration

### "Network request failed"
- iPhone can't reach computer
- Check WiFi, try manual URL entry

## Still Not Working?

Share these details:
1. Metro terminal output
2. Your computer's IP address (from ipconfig)
3. iPhone's IP address (Settings → WiFi → tap (i) icon)
4. Are they on the same network?
5. Can you shake device and see dev menu?
