@echo off
echo ========================================
echo ULTRA FAST DEV CLIENT BUILD
echo ========================================
echo.
echo This will:
echo - Build DEV CLIENT (with voice, debugging, etc)
echo - Build ONLY arm64-v8a (your device arch)
echo - Skip lint, tests, and other checks
echo - Use all CPU cores and build cache
echo.

echo Step 1: Installing dependencies...
call npm install

echo.
echo Step 2: Prebuild (if needed)...
call npx expo prebuild --clean

echo.
echo Step 3: Starting ULTRA FAST build...
cd android

gradlew.bat assembleDebug ^
  -PreactNativeArchitectures=arm64-v8a ^
  --parallel ^
  --max-workers=4 ^
  --build-cache ^
  --configuration-cache ^
  -x lint ^
  -x lintVitalAnalyzeRelease ^
  -x lintVitalReportRelease ^
  -x test ^
  -x testDebugUnitTest

cd ..

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo BUILD SUCCESS!
    echo ========================================
    echo.
    echo Step 4: Installing on your device...
    call npx expo run:android --no-build-cache
    
    echo.
    echo ========================================
    echo DONE! Dev client installed!
    echo ========================================
    echo.
    echo Now run: npx expo start --dev-client
    echo Then press 'a' for instant updates!
) else (
    echo.
    echo ========================================
    echo BUILD FAILED!
    echo ========================================
    pause
)
