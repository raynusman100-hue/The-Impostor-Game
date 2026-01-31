# Impostor Hint System - CORRECTED IMPLEMENTATION ✅

## CRITICAL FIX APPLIED

The hint system was implemented BACKWARDS initially. It has now been CORRECTED.

## CORRECT Hint System Logic

### Data Structure:
- **`impostorHint`**: What impostor sees when hints are **OFF** (LESS specific - category level)
- **`hint`**: What impostor sees when hints are **ON** (MORE specific - section level) + what citizens always see

### Display Logic:
- **Impostor with Hints OFF**: Shows `impostorHint` (category level)
- **Impostor with Hints ON**: Shows `hint` (section level - more helpful)
- **Citizen with Hints ON**: Shows `hint` (section level)

---

## Implementation by Category

### 1. Standard Categories (15 categories)
**Categories**: places, food, movies, games, objects, trends, sport, dailyLife, things, science, history, mythology, nature, tech, fashion

**Structure**:
```javascript
{ word: 'Paris', impostorHint: '(Place)', hint: '(Cities)' }
```

**Impostor Behavior**:
- Hints OFF → `(Place)`, `(Food)`, `(Movie)`, etc.
- Hints ON → `(Cities)`, `(Fruits)`, `(Superhero)`, etc.

**Citizen Behavior**:
- Hints ON → `(Cities)`, `(Fruits)`, `(Superhero)`, etc.

---

### 2. Football Category
**New Group Names**: ICONS, CURRENT STARS, CLUBS

**Structure**:
```javascript
{ word: 'Pelé', impostorHint: '(Football)', hint: '(Icons)' }
```

**Impostor Behavior**:
- Hints OFF → `(Football)`
- Hints ON → `(Icons)`, `(Current Stars)`, `(Clubs)`

**Citizen Behavior**:
- Hints ON → `(Icons)`, `(Current Stars)`, `(Clubs)`

---

### 3. Basketball Category
**New Group Names**: HALL OF FAME, ACTIVE STARS, FRANCHISES

**Structure**:
```javascript
{ word: 'Michael Jordan', impostorHint: '(Basketball)', hint: '(Hall of Fame)' }
```

**Impostor Behavior**:
- Hints OFF → `(Basketball)`
- Hints ON → `(Hall of Fame)`, `(Active Stars)`, `(Franchises)`

**Citizen Behavior**:
- Hints ON → `(Hall of Fame)`, `(Active Stars)`, `(Franchises)`

---

### 4. K-Pop Category

**Structure**:
```javascript
{ word: 'BTS', impostorHint: '(K-Pop)', hint: '(Groups)' }
```

**Impostor Behavior**:
- Hints OFF → `(K-Pop)`
- Hints ON → `(Groups)`, `(Soloists)`

**Citizen Behavior**:
- Hints ON → `(Groups)`, `(Soloists)`

---

### 5. Anime Category (SPECIAL LOGIC)

**Structure**:
```javascript
{ word: 'Naruto', impostorHint: '(Anime)', hint: 'Ninja world' }
{ word: 'Luffy', impostorHint: '(Character)', hint: 'Pirate King' }
```

**Impostor Behavior**:
- Hints OFF → `(Anime)` or `(Character)` based on word type
- Hints ON → Detailed description: "Ninja world", "Pirate King", "Saiyan warrior", etc.

**Citizen Behavior**:
- Hints ON → Detailed description: "Ninja world", "Pirate King", etc.

---

### 6. Gen Z Category (SPECIAL LOGIC)

**Structure**:
```javascript
{ word: 'Slay', impostorHint: '(Classic Slang)', hint: 'Do something great' }
{ word: 'Skibidi', impostorHint: '(Brainrot)', hint: 'Viral meme series' }
```

**Impostor Behavior**:
- Hints OFF → Section name: `(Classic Slang)` or `(Brainrot)`
- Hints ON → Detailed description: "Do something great", "Viral meme series", etc.

**Citizen Behavior**:
- Hints ON → Detailed description: "Do something great", "Viral meme series", etc.

---

### 7. Famous People Category (SPECIAL LOGIC)

**Structure**:
```javascript
{ word: 'Elon Musk', impostorHint: '(Famous People)', hint: '(Innovators)' }
```

**Impostor Behavior**:
- Hints OFF → `(Famous People)`
- Hints ON → Section name: `(Innovators)`, `(Leaders)`, `(Athletes)`, `(Musicians)`, `(Actors)`, `(Influencers)`

**Citizen Behavior**:
- Hints ON → Section name: `(Innovators)`, `(Leaders)`, `(Athletes)`, etc.

---

## RoleCard.js Logic (CORRECTED)

```javascript
{impostorHint && (
    <Text style={styles.hintText}>
        HINT: {hintsEnabled 
            ? (showOriginal && player.originalHint ? player.originalHint : player.hint || displayHint).toUpperCase()
            : (showOriginal && originalImpostorHint ? originalImpostorHint : impostorHint).toUpperCase()
        }
    </Text>
)}
```

**Logic**:
- **Hints ON**: Shows `player.hint` (section level - MORE specific)
- **Hints OFF**: Shows `impostorHint` (category level - LESS specific)

---

## Files Modified

1. **`src/utils/words.js`** - Completely rewritten with CORRECT structure
   - All 21 categories implemented
   - Correct `impostorHint` and `hint` fields
   - Helper functions added

2. **`src/components/RoleCard.js`** - Logic CORRECTED
   - Impostor now sees `hint` when hints are ON (more specific)
   - Impostor now sees `impostorHint` when hints are OFF (less specific)
   - Citizen label removed (already done)

---

## Summary of Hint Behavior

| Role | Hints Setting | What They See |
|------|--------------|---------------|
| **Impostor** | OFF | Category level (LESS specific) - e.g., `(Place)`, `(Football)` |
| **Impostor** | ON | Section level (MORE specific) - e.g., `(Cities)`, `(Icons)` |
| **Citizen** | OFF | No hint |
| **Citizen** | ON | Section level - e.g., `(Cities)`, `(Icons)` |

**Key Insight**: When hints are ON, impostors get MORE help (section names), making it easier for them to blend in!

---

## Testing Verification

Run these commands to verify:
```bash
node -e "const words = require('./src/utils/words.js'); console.log('Categories:', Object.keys(words.wordCategories).length);"
node -e "const words = require('./src/utils/words.js'); console.log(JSON.stringify(words.wordCategories.places[0], null, 2));"
node -e "const words = require('./src/utils/words.js'); console.log(JSON.stringify(words.wordCategories.football[0], null, 2));"
node -e "const words = require('./src/utils/words.js'); console.log(JSON.stringify(words.wordCategories.anime[0], null, 2));"
```

---

## ✅ IMPLEMENTATION COMPLETE AND CORRECTED!

All categories now have the CORRECT hint structure. The impostor gets more specific hints when hints are ON, making the game more balanced and fun!
