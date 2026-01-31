# Impostor Hint System - Final Implementation

## ✅ COMPLETED

All categories have been updated with the correct hint structure as specified.

## Hint System Logic

### Standard Categories
**Categories**: places, food, movies, games, objects, trends, sport, dailyLife, things, science, history, mythology, nature, tech, fashion

**Structure**:
- `impostorHint`: Category name - e.g., `(Place)`, `(Food)`, `(Movie)`, `(Game)`
- `hint`: Section name - e.g., `(Cities)`, `(Fruits)`, `(Superhero)`, `(Battle Royale)`

**Behavior**:
- **Hints OFF**: Impostor sees category name only - `(Place)`, `(Food)`, etc.
- **Hints ON**: Impostor sees full category name - `(Place)`, `(Food)`, etc.
- **Citizens**: See section name when hints are ON - `(Cities)`, `(Fruits)`, etc.

---

### Football Category
**New Group Names** (updated from "Legends", "Modern Stars", "Teams"):
- **Icons** (formerly Legends) - Pelé, Maradona, Zidane, Ronaldinho, Beckham
- **Current Stars** (formerly Modern Stars) - Messi, Ronaldo, Neymar, Mbappé, Haaland
- **Clubs** (formerly Teams) - Barcelona, Real Madrid, Manchester United, Liverpool, Bayern Munich

**Structure**:
- `impostorHint`: `(Football)` for all entries
- `hint`: Section name - `(Icons)`, `(Current Stars)`, `(Clubs)`

**Behavior**:
- **Hints OFF**: Impostor sees `(Football)`
- **Hints ON**: Impostor sees `(Football)`
- **Citizens**: See section name - `(Icons)`, `(Current Stars)`, `(Clubs)`

---

### Basketball Category
**New Group Names** (updated from "Legends", "Modern Stars", "Teams"):
- **Hall of Fame** (formerly Legends) - Michael Jordan, Kobe Bryant, Magic Johnson, Larry Bird, Shaq
- **Active Stars** (formerly Modern Stars) - LeBron James, Stephen Curry, Kevin Durant, Giannis, Luka Doncic
- **Franchises** (formerly Teams) - Lakers, Warriors, Bulls, Celtics, Heat

**Structure**:
- `impostorHint`: `(Basketball)` for all entries
- `hint`: Section name - `(Hall of Fame)`, `(Active Stars)`, `(Franchises)`

**Behavior**:
- **Hints OFF**: Impostor sees `(Basketball)`
- **Hints ON**: Impostor sees `(Basketball)`
- **Citizens**: See section name - `(Hall of Fame)`, `(Active Stars)`, `(Franchises)`

---

### K-Pop Category
**Structure**:
- `impostorHint`: `(K-Pop)` for all entries
- `hint`: Section name - `(Groups)`, `(Soloists)`

**Entries**:
- Groups: BTS, BLACKPINK, EXO, TWICE, Stray Kids, NewJeans, SEVENTEEN
- Soloists: IU, PSY, Jungkook

**Behavior**:
- **Hints OFF**: Impostor sees `(K-Pop)`
- **Hints ON**: Impostor sees `(K-Pop)`
- **Citizens**: See section name - `(Groups)`, `(Soloists)`

---

### Anime Category (Special Logic)
**Structure**:
- `impostorHint`: `(Anime)` for series, `(Character)` for characters
- `hint`: Detailed description - "Ninja world", "Pirate King", "Saiyan warrior", etc.

**Entries**:
- Series: Naruto, One Piece, Dragon Ball, Attack on Titan, Death Note, Demon Slayer
- Characters: Luffy, Goku, Ichigo, Deku, Saitama, Eren, Light, Tanjiro, Sasuke

**Behavior**:
- **Hints OFF**: Impostor sees `(Anime)` or `(Character)` based on word type
- **Hints ON**: Impostor sees `(Anime)` or `(Character)` based on word type
- **Citizens**: See detailed description - "Ninja world", "Pirate King", "One punch hero", etc.

---

### Gen Z Category (Special Logic)
**Structure**:
- `impostorHint`: Section name - `(Classic Slang)` or `(Brainrot)`
- `hint`: Detailed description - "Do something great", "Charisma or charm", etc.

**Entries**:
- Classic Slang: Slay, Vibe, Lit, Flex, Cap, Bussin, Bet, Drip
- Brainrot: Skibidi, Rizz, Gyat, Sigma, Ohio, Fanum Tax

**Behavior**:
- **Hints OFF**: Impostor sees section name - `(Classic Slang)` or `(Brainrot)`
- **Hints ON**: Impostor sees section name - `(Classic Slang)` or `(Brainrot)`
- **Citizens**: See detailed description - "Do something great", "Viral meme series", etc.

---

### Famous People Category (Special Logic)
**Structure**:
- `impostorHint`: `(Famous People)` for all entries
- `hint`: Section name - `(Innovators)`, `(Leaders)`, `(Athletes)`, `(Musicians)`, `(Actors)`, `(Influencers)`

**Entries**:
- Innovators: Elon Musk, Steve Jobs, Bill Gates, Albert Einstein, Nikola Tesla
- Leaders: Nelson Mandela, Martin Luther King, Gandhi, Abraham Lincoln
- Athletes: Muhammad Ali, Usain Bolt, Serena Williams, Tiger Woods
- Musicians: Michael Jackson, Beyoncé, Taylor Swift, Drake
- Actors: Tom Cruise, Leonardo DiCaprio, Dwayne Johnson, Will Smith
- Influencers: MrBeast, PewDiePie, Charli D'Amelio

**Behavior**:
- **Hints OFF**: Impostor sees `(Famous People)`
- **Hints ON**: Impostor sees `(Famous People)`
- **Citizens**: See section name - `(Innovators)`, `(Leaders)`, `(Athletes)`, etc.

---

## RoleCard Display Logic

The `RoleCard.js` component correctly handles all hint types:

### For Citizens:
```javascript
{hintsEnabled && (
    <Text style={styles.hintText}>HINT: {displayHint}</Text>
)}
```
- Shows the `hint` field (section names or detailed descriptions)
- Only displays when `hintsEnabled` is true

### For Impostors:
```javascript
{impostorHint && (
    <Text style={styles.hintText}>
        HINT: {hintsEnabled 
            ? (showOriginal && originalImpostorHint ? originalImpostorHint : impostorHint).toUpperCase()
            : (showOriginal && originalImpostorHint ? originalImpostorHint : impostorHint).split(')')[0] + ')'
        }
    </Text>
)}
```
- When hints are **ON**: Shows full `impostorHint` in uppercase
- When hints are **OFF**: Shows only the category part (before closing parenthesis)
- Supports language toggle with `originalImpostorHint`

---

## Summary of Changes

### ✅ Completed Tasks:
1. ✅ Updated all standard categories (places, food, movies, games, objects, trends, sport, dailyLife, things, science, history, mythology, nature, tech, fashion) with correct hint structure
2. ✅ Added Football category with new group names: Icons, Current Stars, Clubs
3. ✅ Added Basketball category with new group names: Hall of Fame, Active Stars, Franchises
4. ✅ Added K-Pop category with Groups and Soloists
5. ✅ Added Anime category with special logic (Anime/Character hints + detailed descriptions)
6. ✅ Added Gen Z category with special logic (section name as impostor hint + detailed descriptions)
7. ✅ Added Famous People category with special logic (Famous People as impostor hint + section names)
8. ✅ Removed "CITIZEN" label from RoleCard (already completed in previous session)
9. ✅ Added helper functions: `getRandomWord()`, `getAllCategories()`, `getCategoryWordCount()`

### Files Modified:
- `src/utils/words.js` - Complete rewrite with all categories and correct hint structure
- `src/components/RoleCard.js` - Already had correct hint display logic (no changes needed)

---

## Testing Checklist

Test each category to verify:
- [ ] **Hints OFF**: Impostor sees category-level hint
- [ ] **Hints ON**: Impostor sees category-level hint (or section for GenZ)
- [ ] **Citizens with Hints ON**: See section names or detailed descriptions
- [ ] **Language toggle**: Works correctly for both impostor and citizen hints
- [ ] **All 21 categories**: places, food, movies, games, objects, trends, sport, dailyLife, things, science, history, mythology, nature, tech, fashion, football, basketball, kpop, anime, genZ, famousPeople

---

## Implementation Complete! 🎉

All categories now have the correct hint structure as specified. The system supports:
- Standard categories with category/section hints
- Special categories (Anime, GenZ, Famous People) with custom logic
- Renamed groups for Football and Basketball
- Proper hint display for both local and WiFi modes
- Language support with original hint fallback
