# Testing Guide: Impostor Hint System

## What to Test

The new hint system provides different hints for impostors vs citizens:
- **Impostors** see GROUP NAMES (e.g., "Legends", "Action", "Fruits")
- **Citizens** see DETAILED DESCRIPTIONS (e.g., "Brazil Legend", "Earths mightiest heroes", "A red or green fruit")

## Test Scenarios

### 1. Local Mode - Single Device

#### Test as Impostor:
1. Start a new game from HomeScreen
2. Select any category (e.g., "Football")
3. Set number of players (e.g., 4 players)
4. Set impostor count to 1
5. Enable hints
6. Start the game
7. **Expected**: When you get the impostor role, you should see:
   - "YOU ARE THE IMPOSTOR"
   - "HINT: LEGENDS" (or "MODERN STARS" or "TEAMS" depending on the word)
   - The hint should be a GROUP NAME, not a detailed description

#### Test as Citizen:
1. Continue through the same game
2. **Expected**: When you get a citizen role, you should see:
   - The actual word (e.g., "Pelé")
   - "HINT: Brazil Legend" (detailed description)
   - The hint should be SPECIFIC, not a group name

### 2. WiFi Mode - Multiple Devices

#### Host Setup:
1. Go to WiFi Mode
2. Create a room
3. Select category (e.g., "Movies")
4. Enable hints
5. Wait for players to join
6. Start the game

#### Player Testing:
1. Each player should see their role card
2. **Impostor players** should see:
   - "YOU ARE THE IMPOSTOR"
   - "HINT: ACTION" (or "ANIMATED", "DRAMA", "TV SERIES")
   - Group name hint
3. **Citizen players** should see:
   - The actual word (e.g., "Avengers")
   - "HINT: Earths mightiest heroes"
   - Detailed description

### 3. Test All Categories

Test at least one word from each category to verify hints work:

| Category | Example Word | Impostor Hint | Citizen Hint |
|----------|-------------|---------------|--------------|
| Places | Paris | Cities | City of Lights |
| Food | Sushi | Meals | Japanese rice dish |
| Movies | Avengers | Action | Earths mightiest heroes |
| Games | Fortnite | Shooter | Battle royale game |
| Objects | Chair | Furniture | You sit on it |
| Trends | AI | Tech Trends | Artificial Intelligence |
| Sport | Soccer | Ball Sports | Football (World) |
| Daily Life | Traffic | Transport | Cars on road |
| Things | Box | Containers | Container |
| Science | Atom | Physics | Basic unit of matter |
| History | Pyramid | Ancient Egypt | Egyptian tomb |
| Mythology | Dragon | Creatures | Fire breathing lizard |
| Nature | Flower | Flowers | Colorful plant part |
| Tech | Robot | Computing | Automated machine |
| Fashion | Dress | Tops | One piece cloth |
| Football | Pelé | Legends | Brazil Legend |
| Basketball | Michael Jordan | Legends | GOAT |
| Gen Z | Slay | Classic Slang | Do something great |
| Famous People | Albert Einstein | Innovators | Theory of Relativity scientist |

### 4. Test Hints Toggle

1. Start a game with hints DISABLED
2. **Expected**: No hints should appear for either role
3. Start a game with hints ENABLED
4. **Expected**: Hints should appear based on role

### 5. Test Language Support

1. Start a game in English
2. Verify hints display correctly
3. Switch to another language (if supported)
4. Verify hints are translated properly
5. **Note**: Impostor hints should remain as group names even in other languages

## Common Issues to Check

### Issue 1: Impostor sees detailed hint instead of group name
- **Cause**: RoleCard not using impostorHint prop
- **Check**: Verify RoleCard.js line 251-252

### Issue 2: Citizen sees group name instead of detailed hint
- **Cause**: RoleCard using wrong hint field
- **Check**: Verify RoleCard.js is using player.hint for citizens

### Issue 3: No hints appear at all
- **Cause**: hintsEnabled is false or impostorHint not passed
- **Check**: Verify SetupScreen passes impostorHint in navigation params

### Issue 4: WiFi mode doesn't show correct hints
- **Cause**: multiplayerLogic not passing impostorHint
- **Check**: Verify multiplayerLogic.js line 43 passes impostorHint

## Success Criteria

✅ Impostors see group names (short, categorical hints)
✅ Citizens see detailed descriptions (specific hints)
✅ All 19 categories work correctly
✅ Both local and WiFi modes work
✅ Hints toggle works (on/off)
✅ No crashes or errors
✅ Hints are appropriate and helpful

## Reporting Issues

If you find any issues:
1. Note which category/word caused the issue
2. Note whether it was impostor or citizen role
3. Note whether it was local or WiFi mode
4. Take a screenshot if possible
5. Check the console for any error messages
