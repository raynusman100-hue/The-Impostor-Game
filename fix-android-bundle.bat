@echo off
echo Fixing Android Bundle Loading Issues...

echo.
echo 1. Stopping Metro bundler...
taskkill /f /im node.exe 2>nul

echo.
echo 2. Clearing Metro cache...
npx expo start --clear

echo.
echo 3. Alternative: Clear all caches...
echo Run these commands if the issue persists:
echo   npx expo install --fix
echo   cd android && ./gradlew clean && cd ..
echo   npx react-native start --reset-cache

echo.
echo 4. For persistent issues, try:
echo   - Restart your device/emulator
echo   - Check if you have enough storage space
echo   - Update Expo CLI: npm install -g @expo/cli

pause