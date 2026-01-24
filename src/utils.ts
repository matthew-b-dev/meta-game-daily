import type { Game } from './App';

export const DATE_OVERRIDE: string | null = null; // '2026-01-23'

// Subtitle configuration
export interface SubtitleConfig {
  text: string;
  animated: boolean;
}

export const getSubtitle = (): SubtitleConfig => {
  return {
    text: '❤️ Ad-free and Open Source! 🛠️',
    animated: false,
  };
};

// Demo days configuration - hardcode specific games for specific dates
// Format: 'YYYY-MM-DD': ['Game Title 1', 'Game Title 2', ...]
export const DEMO_DAYS: { [date: string]: string[] } = {
  '2026-01-20': [
    'The Last of Us Part II',
    'Pentiment',
    'Valiant Hearts: The Great War',
    'Mighty No. 9',
    'Ace Combat 7: Skies Unknown',
  ],
  '2026-01-21': [
    'Rayman Legends',
    'Prince of Persia: The Lost Crown',
    'Yakuza: Like a Dragon',
    'Octopath Traveler II',
    'Moonlighter',
  ],
  '2026-01-22': [
    'Neon White',
    'Hollow Knight',
    'Suicide Squad: Kill The Justice League',
    "Luigi's Mansion 3",
    'Forza Horizon 3',
  ],
  '2026-01-23': [
    'Dota 2',
    'Owlboy',
    'A Hat in Time',
    'Visions of Mana',
    'Redfall',
  ],
  '2026-01-24': [
    'Star Wars Jedi: Survivor',
    "Teenage Mutant Ninja Turtles: Shredder's Revenge",
    'Donkey Kong Country: Tropical Freeze',
    'LEGO Jurassic World',
    'Silent Hill 2',
  ],
  '2026-01-25': [
    'The Legend of Zelda: Echoes of Wisdom',
    'SteamWorld Dig',
    'Skull and Bones',
    'Hot Wheels Unleashed',
    'Bayonetta 3',
  ],
  // 26: Splatoon 3
};

// Per-game state interface
export interface GameState {
  revealed: { [key: string]: boolean };
  pointsDeducted: number;
  revealedTitle: boolean;
}

// Missed guess with close detection
export interface MissedGuess {
  name: string;
  isClose: boolean;
}

// Overall game session state
export interface SessionState {
  puzzleDate: string;
  score: number;
  guessesLeft: number;
  correctGuesses: string[];
  revealedGames: string[];
  missedGuesses: MissedGuess[];
  gameStates: { [gameName: string]: GameState };
  gameCompleteDismissed: boolean;
  scoreSent: boolean;
}

const STORAGE_KEY = 'meta-game-daily-state';

/**
 * Calculate Levenshtein distance between two strings
 */
const levenshteinDistance = (str1: string, str2: string): number => {
  const s1 = str1.toLowerCase();
  const s2 = str2.toLowerCase();
  const len1 = s1.length;
  const len2 = s2.length;

  const dp: number[][] = Array(len1 + 1)
    .fill(null)
    .map(() => Array(len2 + 1).fill(0));

  for (let i = 0; i <= len1; i++) dp[i][0] = i;
  for (let j = 0; j <= len2; j++) dp[0][j] = j;

  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      if (s1[i - 1] === s2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
      }
    }
  }

  return dp[len1][len2];
};

/**
 * Check if a guess is close to any of the correct game names
 * Returns true if similarity is high enough
 */
export const isCloseGuess = (guess: string, correctGames: Game[]): boolean => {
  const guessLower = guess.toLowerCase();

  for (const game of correctGames) {
    const gameLower = game.name.toLowerCase();

    // Check if one contains the other (for partial matches)
    if (gameLower.includes(guessLower) || guessLower.includes(gameLower)) {
      return true;
    }

    // Calculate similarity based on Levenshtein distance
    const distance = levenshteinDistance(guess, game.name);
    const maxLength = Math.max(guess.length, game.name.length);
    const similarity = 1 - distance / maxLength;

    // Consider it close if similarity is >= 70%
    // 'The Last of Us Part II' is close to 'The Last of Us Part I'
    // 'Last Day of June' is NOT close to 'The Last of Us Part I'
    if (similarity >= 0.7) {
      return true;
    }
  }

  // Additional check for game series with colons (e.g., "Ace Combat 6: Fires of Liberation")
  // Split by colon and check if the parts are similar
  if (guess.includes(':')) {
    const guessParts = guess.split(':').map((p) => p.trim().toLowerCase());

    for (const game of correctGames) {
      if (game.name.includes(':')) {
        const gameParts = game.name
          .split(':')
          .map((p) => p.trim().toLowerCase());

        // Check if both parts before and after the colon are reasonably similar
        if (guessParts.length >= 1 && gameParts.length >= 1) {
          const beforeColonGuess = guessParts[0];
          const beforeColonGame = gameParts[0];

          // Check if the main title (before colon) is very similar
          const beforeDistance = levenshteinDistance(
            beforeColonGuess,
            beforeColonGame,
          );
          const beforeMaxLength = Math.max(
            beforeColonGuess.length,
            beforeColonGame.length,
          );
          const beforeSimilarity = 1 - beforeDistance / beforeMaxLength;

          // If the main title is >= 70% similar, consider it close
          // (e.g., "Ace Combat 6" vs "Ace Combat 7")
          if (beforeSimilarity >= 0.7) {
            return true;
          }
        }
      }
    }
  }

  return false;
};

/**
 * Load game state from localStorage
 */
export const loadGameState = (
  currentPuzzleDate: string,
): SessionState | null => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return null;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const state: any = JSON.parse(saved);

    // Only restore if it's the same puzzle date
    if (state.puzzleDate !== currentPuzzleDate) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }

    // Migrate old missedGuesses format (string[]) to new format (MissedGuess[])
    if (state.missedGuesses && state.missedGuesses.length > 0) {
      if (typeof state.missedGuesses[0] === 'string') {
        state.missedGuesses = state.missedGuesses.map((name: string) => ({
          name,
          isClose: false,
        }));
      }
    }

    return state as SessionState;
  } catch (error) {
    console.error('Failed to load game state:', error);
    return null;
  }
};

/**
 * Save game state to localStorage
 */
export const saveGameState = (state: SessionState): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error('Failed to save game state:', error);
  }
};

/**
 * Clear game state from localStorage
 */
export const clearGameState = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear game state:', error);
  }
};

/**
 * Get the UTC date string for the current day
 */
export const getUtcDateString = (): string => {
  if (DATE_OVERRIDE) {
    return DATE_OVERRIDE;
  }
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = String(now.getUTCMonth() + 1).padStart(2, '0');
  const day = String(now.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Deterministically select games for the current UTC day
 */
export const getDailyGames = (
  allGames: Game[],
  count = 5,
  dateOverride?: string,
): Game[] => {
  const utcDate = dateOverride || getUtcDateString();

  // Check if this is a demo day with hardcoded games
  if (DEMO_DAYS[utcDate]) {
    const demoGameTitles = DEMO_DAYS[utcDate];
    const demoGames = demoGameTitles
      .map((title) => allGames.find((g) => g.name === title))
      .filter((g): g is Game => g !== undefined);

    if (demoGames.length > 0) {
      return demoGames;
    }
    // If demo games not found in allGames, fall through to normal logic
  }

  // Simple hash function
  let hash = 0;
  for (let i = 0; i < utcDate.length; i++) {
    hash = (hash * 31 + utcDate.charCodeAt(i)) % 100000;
  }
  // The Review Rank was determined by how many critic reviews the title receieved. A lower rank means more reviews.
  // Separate games by review rank - we're going to make sure at least one of these is pretty freaking recognizable.
  // Note that we also just completely ignore games with a review rank > 40. I have arbitrarily chosen that threshold
  //   to prevent unknown games from being selected.
  const topGames = allGames.filter((g) => g.reviewRank < 10);
  const otherGames = allGames.filter(
    (g) => g.reviewRank >= 10 && g.reviewRank < 40,
  );

  // Shuffle top games
  const shuffledTop = topGames.slice();
  let topHash = hash;
  for (let i = shuffledTop.length - 1; i > 0; i--) {
    topHash = (topHash * 31 + i) % 100000;
    const j = topHash % (i + 1);
    [shuffledTop[i], shuffledTop[j]] = [shuffledTop[j], shuffledTop[i]];
  }

  // Shuffle other games
  const shuffledOther = otherGames.slice();
  let otherHash = hash;
  for (let i = shuffledOther.length - 1; i > 0; i--) {
    otherHash = (otherHash * 31 + i) % 100000;
    const j = otherHash % (i + 1);
    [shuffledOther[i], shuffledOther[j]] = [shuffledOther[j], shuffledOther[i]];
  }

  // Take at least 1 from top games, rest from other games
  const result = [
    ...shuffledTop.slice(0, Math.min(1, shuffledTop.length)),
    ...shuffledOther.slice(0, count - 1),
  ];

  return result.slice(0, count);
};

/**
 * Get formatted puzzle date for display
 */
export const getPuzzleDate = (): string => {
  const utcDate = getUtcDateString();
  const date = new Date(utcDate + 'T00:00:00Z');
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC',
  });
};

/**
 * Calculate time until next UTC day
 */
export const getTimeUntilNextGame = (): { h: number; m: number } => {
  const now = new Date();
  const nextUtcDay = new Date(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate() + 1,
      0,
      0,
      0,
      0,
    ),
  );
  const diff = nextUtcDay.getTime() - now.getTime();
  const h = Math.floor(diff / (1000 * 60 * 60));
  const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  return { h, m };
};

/**
 * Generate share text with score, rank, and emoji representation
 */
export const generateShareText = (
  score: number,
  todayScores: number[],
  puzzleDate: string,
  emojis: string,
): string => {
  // Sort scores in descending order (highest first)
  const sortedScores = [...todayScores].sort((a, b) => b - a);

  // Find user's rank (1-based index)
  const rank = sortedScores.findIndex((s) => s === score) + 1;
  const totalPlayers = todayScores.length;

  // Rank emoji lookup
  const rankEmojiMap: { [key: number]: string } = {
    1: '🥇',
    2: '🥈',
    3: '🥉',
  };

  const rankEmoji = rankEmojiMap[rank] || (rank === totalPlayers ? '💀' : '🏅');

  // Build rank text
  let rankText = '';

  // Rank 0 indicates the user's score did not make it to the DB due to some kind of failure
  // In that case we'll just not include any rank information in the share text
  if (totalPlayers > 3 && rank !== 0) {
    rankText = ` | ${rankEmoji} Rank #${rank} of ${totalPlayers}`;
  }

  // Build the share text
  return `https://matthew-b-dev.github.io/meta-game-daily/\n${puzzleDate}\n${emojis}\n🏆 ${score} points${rankText}`;
};

/**
 * Get percentile message based on user's performance
 */
export const getPercentileMessage = (
  percentile: number,
  score: number,
  todayScores: number[],
): string => {
  // Check if tied for first place
  const highestScore = Math.max(...todayScores);

  if (score === highestScore) {
    const countAtTop = todayScores.filter((s) => s === highestScore).length;

    if (countAtTop > 1) {
      return "🥇 You're tied for rank #1 today. 🥇";
    }
    return "🥇 So far, you're rank #1 today. 🥇";
  }

  if (percentile === 0) {
    return "That's the worst score today. 🤷";
  } else {
    return `That's better than ${percentile}% of players.`;
  }
};
