@echo off
echo ========================================
echo  RESTARTING METRO WITH CLEARED CACHE
echo ========================================
echo.
echo This will:
echo 1. Clear Metro bundler cache
echo 2. Start Expo development server
echo 3. Allow you to test the custom avatar wheel
echo.
echo Press Ctrl+C to stop Metro when done testing
echo.
pause

echo.
echo Starting Expo with cleared cache...
echo.
npx expo start --clear
