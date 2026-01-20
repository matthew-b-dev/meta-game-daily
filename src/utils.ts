import type { Game } from './App';

export const DATE_OVERRIDE: string | null = null; // '2026-01-18'

// Per-game state interface
export interface GameState {
  revealed: { [key: string]: boolean };
  pointsDeducted: number;
  revealedTitle: boolean;
}

// Overall game session state
export interface SessionState {
  puzzleDate: string;
  score: number;
  guessesLeft: number;
  correctGuesses: string[];
  revealedGames: string[];
  missedGuesses: string[];
  gameStates: { [gameName: string]: GameState };
  gameCompleteDismissed: boolean;
}

const STORAGE_KEY = 'meta-game-daily-state';

/**
 * Load game state from localStorage
 */
export const loadGameState = (
  currentPuzzleDate: string,
): SessionState | null => {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (!saved) return null;

    const state: SessionState = JSON.parse(saved);

    // Only restore if it's the same puzzle date
    if (state.puzzleDate !== currentPuzzleDate) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }

    return state;
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
  const date = new Date(utcDate);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
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
