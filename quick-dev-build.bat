@echo off
echo ========================================
echo QUICK DEV CLIENT BUILD (No Prebuild)
echo ========================================
echo.
echo Building with maximum speed...
echo.

cd android

gradlew.bat assembleDebug ^
  -PreactNativeArchitectures=arm64-v8a ^
  --parallel ^
  --max-workers=4 ^
  --build-cache ^
  --configuration-cache ^
  -x lint ^
  -x test

cd ..

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo Installing on device...
    echo ========================================
    call npx expo run:android --no-build-cache
    
    echo.
    echo SUCCESS! Now run: npx expo start --dev-client
) else (
    echo BUILD FAILED!
    pause
)
