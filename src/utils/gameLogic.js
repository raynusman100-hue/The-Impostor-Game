/**
 * Assign roles to players for the game.
 * 
 * @param {Array<Object>} players - Array of player objects (e.g. [{name: 'Player 1'}, ...])
 * @param {number} impostorCount - Number of impostors to assign
 * @param {string} crewWord - The secret word for the Crew
 * @param {string} crewHint - The hint for the Crew
 * @param {Object} crewMl - Malayalam translation { word, hint } for the Crew
 * @param {string} originalWord - Original English word
 * @param {string} originalHint - Original English hint for citizens
 * @param {string} impostorHint - Group name hint for impostors
 * @returns {Array<Object>} - Array of players with assigned roles, words, and hints.
 */
export function assignRoles(players, impostorCount, crewWord, crewHint, crewMl, originalWord, originalHint, impostorHint) {
  // Create a deep copy to avoid mutating the original array
  let assignedPlayers = players.map(p => ({ ...p }));

  // Shuffle the players array to randomize assignments
  assignedPlayers.sort(() => 0.5 - Math.random());

  // Assign roles
  assignedPlayers = assignedPlayers.map((p, i) => {
    if (i < impostorCount) {
      return {
        ...p,
        role: "Impostor",
        word: "Imposter",
        hint: impostorHint || "Blend in", // Use group name hint if available
        originalWord: "Imposter",
        impostorHint: impostorHint, // Store impostor hint for display
        ml: {
          word: "ചതിയൻ",
          hint: "കൂടിച്ചേരുക"
        }
      };
    } else {
      return {
        ...p,
        role: "Citizen",
        word: crewWord,
        hint: crewHint,
        originalWord: originalWord, // Assign original English word
        originalHint: originalHint || crewHint, // Store original English hint
        ml: crewMl
      };
    }
  });

  // Shuffle again to randomize turn order
  assignedPlayers.sort(() => 0.5 - Math.random());

  // Assign unique cover indices in a randomized sequence for non-repeating rotation (1,2,3,4 -> 2,3,4,1 etc)
  const coverSequence = [...Array(assignedPlayers.length).keys()];
  for (let i = coverSequence.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [coverSequence[i], coverSequence[j]] = [coverSequence[j], coverSequence[i]];
  }

  assignedPlayers = assignedPlayers.map((p, i) => ({
    ...p,
    coverIndex: coverSequence[i]
  }));

  return assignedPlayers;
}
