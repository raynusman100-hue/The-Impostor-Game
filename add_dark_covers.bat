@echo off
echo Adding Dark Theme Card Covers
echo ==============================
echo.
echo Checking for your uploaded dark theme covers:
echo.

if exist "assets\assetscover_dark_vampire.png" (
    echo ✓ assetscover_dark_vampire.png found
) else (
    echo ✗ assetscover_dark_vampire.png missing
)

if exist "assets\assetscover_dark_artist.png" (
    echo ✓ assetscover_dark_artist.png found
) else (
    echo ✗ assetscover_dark_artist.png missing
)

if exist "assets\assetscover_dark_soldier..png" (
    echo ✓ assetscover_dark_soldier..png found
) else (
    echo ✗ assetscover_dark_soldier..png missing
)

if exist "assets\assetscover_dark_meditation.png" (
    echo ✓ assetscover_dark_meditation.png found
) else (
    echo ✗ assetscover_dark_meditation.png missing
)

echo.
echo ✓ Code has been updated in src\components\RoleCard.js to use your file names
echo.
echo Your dark theme now has 9 different card covers:
echo   - 5 existing midnight covers
echo   - 4 new character covers (vampire, artist, soldier, meditation)
echo.
echo Switch to "Midnight" theme in the app to see the new covers!
echo.
pause