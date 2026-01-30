import type { Game } from './types';
import type { ReactNode } from 'react';
import { DATE_OVERRIDE, DEMO_DAYS, SUNDAY_SHUFFLE_DEMO_DAYS } from './demos';

export const MAX_REVIEW_RANK = 50;
// Subtitle configuration
export interface SubtitleConfig {
  content: ReactNode;
  animated: boolean;
}

export const getSubtitle = (): SubtitleConfig => {
  // <>❤️ Ad-free and Open-Source! 🛠️</>,
  return {
    content: <>❤️ Ad-free and Open-Source! 🛠️</>,
    animated: false,
  };
};

// Per-game state interface
export interface GameState {
  revealed: { [key: string]: boolean };
  pointsDeducted: number;
  revealedTitle: boolean;
  revealedMaskedTitle?: boolean;
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
  bonusPoints: number;
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

    // Special case: if both contain "Super Mario", consider them close
    if (
      guessLower.includes('super mario') &&
      gameLower.includes('super mario')
    ) {
      return true;
    }

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
  // Bucket games by difficulty based on review rank
  // Lower rank means more reviews, so more recognizable
  const buckets = {
    trivial: [] as Game[],
    easy: [] as Game[],
    medium: [] as Game[],
    hard: [] as Game[],
  };
  for (const game of allGames) {
    if (game.reviewRank < 5) {
      buckets.trivial.push(game);
    } else if (game.reviewRank < 10) {
      buckets.easy.push(game);
    } else if (game.reviewRank < 25) {
      buckets.medium.push(game);
    } else if (game.reviewRank < MAX_REVIEW_RANK) {
      buckets.hard.push(game);
    }
  }

  // Shuffle function
  const shuffle = (arr: Game[], seed: number): Game[] => {
    const shuffled = arr.slice();
    let h = seed;
    for (let i = shuffled.length - 1; i > 0; i--) {
      h = (h * 31 + i) % 100000;
      const j = h % (i + 1);
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  // Shuffle each bucket with different seeds
  const shuffledTrivial = shuffle(buckets.trivial, hash + 5);
  const shuffledEasy = shuffle(buckets.easy, hash + 6);
  const shuffledMedium = shuffle(buckets.medium, hash + 7);
  const shuffledHard = shuffle(buckets.hard, hash + 8);

  // Select games: 1 trivial, 2 easy, 1 medium, 1 hard
  const result = [
    ...shuffledTrivial.slice(0, 1),
    ...shuffledEasy.slice(0, 1),
    ...shuffledMedium.slice(0, 2),
    ...shuffledHard.slice(0, 1),
  ];

  return result.slice(0, count);
};

// Shuffle array deterministically
function shuffleArray<T>(arr: T[], seed: number): T[] {
  const shuffled = arr.slice();
  let h = seed;
  for (let i = shuffled.length - 1; i > 0; i--) {
    h = (h * 31 + i) % 100000;
    const j = h % (i + 1);
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Helper for releaseYear variant
const getReleaseYearVariant = (allGames: Game[], hash: number): Game[] => {
  // Filter games with reviewRank < 15
  const eligible = allGames.filter((g) => g.reviewRank < 15);
  // Group by releaseYear
  const byYear: { [year: number]: Game[] } = {};
  for (const game of eligible) {
    if (!byYear[game.releaseYear]) byYear[game.releaseYear] = [];
    byYear[game.releaseYear].push(game);
  }
  // Get unique years, sort them
  const years = Object.keys(byYear)
    .map(Number)
    .sort((a, b) => a - b);
  // Shuffle years deterministically
  const shuffledYears = shuffleArray(years, hash);
  // Pick up to 4 years, and from each, pick one game deterministically
  const result: Game[] = [];
  let seed = hash;
  for (const year of shuffledYears.slice(0, 4)) {
    const games = byYear[year];
    if (games.length > 0) {
      const shuffledGames = shuffleArray(games, seed);
      result.push(shuffledGames[0]);
      seed += 1;
    }
  }
  return result;
};

// Helper for critic variant
const getCriticVariant = (allGames: Game[], hash: number): Game[] => {
  // Filter games with score
  const eligible = allGames.filter((g) => g.score != null);
  // Sort by score
  const sorted = eligible.sort(
    (a, b) => parseInt(a.score || '0', 10) - parseInt(b.score || '0', 10),
  );
  // Try to find 4 games with scores at least 7 apart
  let attempt = 0;
  while (attempt < 10) {
    const shuffled = shuffleArray(sorted, hash + attempt);
    const selected: Game[] = [];
    for (const game of shuffled) {
      const gameScore = parseInt(game.score || '0', 10);
      if (
        selected.every(
          (s) => Math.abs(parseInt(s.score || '0', 10) - gameScore) >= 7,
        )
      ) {
        selected.push(game);
        if (selected.length === 4) return selected;
      }
    }
    attempt++;
  }
  // Fallback: return first 4 shuffled
  return shuffleArray(sorted, hash).slice(0, 4);
};

// Helper for hltb variant
const getHltbVariant = (allGames: Game[], hash: number): Game[] => {
  // Filter games with hltb.main > 0 and reviewRank <= 40
  const eligible = allGames.filter(
    (g) => g.hltb?.main != null && g.hltb.main > 0 && g.reviewRank <= 40,
  );
  // Sort by hltb.main
  const sorted = eligible.sort(
    (a, b) => (a.hltb?.main || 0) - (b.hltb?.main || 0),
  );
  // Try to find 4 games with hltb.main differences > 10
  let attempt = 0;
  while (attempt < 10) {
    const shuffled = shuffleArray(sorted, hash + attempt);
    const selected: Game[] = [];
    for (const game of shuffled) {
      const gameHltb = game.hltb?.main || 0;
      if (
        selected.every((s) => Math.abs((s.hltb?.main || 0) - gameHltb) > 10)
      ) {
        selected.push(game);
        if (selected.length === 4) return selected;
      }
    }
    attempt++;
  }
  // Fallback: return first 4 shuffled
  return shuffleArray(sorted, hash).slice(0, 4);
};

/**
 * Deterministically select 4 games for Sunday Shuffle
 */
export const getSundayShuffleGames = (
  allGames: Game[],
  variant: 'critic' | 'releaseYear' | 'hltb',
  dateOverride?: string,
): Game[] => {
  const utcDate = dateOverride || getUtcDateString();

  // Check if this is a demo day with hardcoded games
  if (SUNDAY_SHUFFLE_DEMO_DAYS[utcDate]) {
    const demoGameTitles = SUNDAY_SHUFFLE_DEMO_DAYS[utcDate];
    const demoGames = demoGameTitles
      .map((title) => allGames.find((g) => g.name === title))
      .filter((g): g is Game => g !== undefined);

    if (demoGames.length >= 4) {
      return demoGames.slice(0, 4);
    }
    // If demo games not found in allGames, fall through to normal logic
  }

  // Simple hash function
  let hash = 0;
  for (let i = 0; i < utcDate.length; i++) {
    hash = (hash * 31 + utcDate.charCodeAt(i)) % 100000;
  }

  if (variant === 'releaseYear') {
    return getReleaseYearVariant(allGames, hash);
  } else if (variant === 'critic') {
    return getCriticVariant(allGames, hash);
  } else {
    return getHltbVariant(allGames, hash);
  }
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
 * Get rank emoji based on rank and total players
 */
export const getRankEmoji = (rank: number, totalPlayers: number): string => {
  const rankEmojiMap: { [key: number]: string } = {
    1: '🥇',
    2: '🥈',
    3: '🥉',
  };

  return rankEmojiMap[rank] || (rank === totalPlayers ? '💀' : '🏅');
};

/**
 * Generate share text with score, rank, and emoji representation
 */
export const generateShareText = (
  score: number,
  bonusPoints: number,
  todayScores: number[],
  puzzleDate: string,
  emojis: string,
): string => {
  const totalScore = score + bonusPoints;
  // Sort scores in descending order (highest first)
  const sortedScores = [...todayScores].sort((a, b) => b - a);

  const minScore = Math.min(...todayScores);
  const isWorstScore = totalScore === minScore;
  const countAtBottom = todayScores.filter((s) => s === minScore).length;
  const isTiedForWorst = isWorstScore && countAtBottom > 1;

  // Find user's rank (1-based index)
  let rank;
  if (isTiedForWorst) {
    rank = todayScores.length;
  } else {
    rank = sortedScores.findIndex((s) => s === totalScore) + 1;
  }
  const totalPlayers = todayScores.length;

  const rankEmoji = getRankEmoji(rank, totalPlayers);

  // Build rank text
  let rankText = '';

  // Rank 0 indicates the user's score did not make it to the DB due to some kind of failure
  // In that case we'll just not include any rank information in the share text
  if (totalPlayers > 2 && rank !== 0) {
    if (isTiedForWorst) {
      rankText = ` | ${rankEmoji} Rank ${totalPlayers}/${totalPlayers}`;
    } else {
      rankText = ` | ${rankEmoji} Rank #${rank} of ${totalPlayers}`;
    }
  }

  // Build the share text
  return `https://metagamedaily.com/\n${puzzleDate}\n${emojis}\n🏆 ${totalScore} points${rankText}`;
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

/**
 * Generate emoji string for share based on game performance
 */
export const generateGameEmojis = (
  dailyGames: Game[],
  gameStates: { [gameName: string]: GameState },
  correctGuesses: string[],
  bonusPoints: number,
): string => {
  // The score wasn't perfect, represent each Game with it's corresponding emoji
  const emojiText = dailyGames
    .map((game) => {
      const pointsDeducted = gameStates[game.name]?.pointsDeducted ?? 0;
      const earnedPoints = 200 - pointsDeducted;
      const isGuessed = correctGuesses.includes(game.name);

      if (isGuessed && earnedPoints === 200) {
        return '🟩'; // Green square for perfect
      } else if (isGuessed && earnedPoints < 200) {
        return '🟨'; // Yellow square for guessed with hints
      } else {
        return '🟥'; // Red square for missed/gave up
      }
    })
    .join('');

  // If every game was guessed without reveals, add some text to the final string
  if (emojiText === '🟩🟩🟩🟩🟩') {
    if (bonusPoints === 100) return '🟦🟦🟦🟦🟦 (Perfection)';
    else return '🟩🟩🟩🟩🟩 (No Reveals)';
  }

  return emojiText;
};

/**
 * Copy share text to clipboard
 * Returns true if successful, false otherwise
 */
export const copyShareToClipboard = async (
  score: number,
  bonusPoints: number,
  allScores: number[],
  initialScores: number[],
  puzzleDate: string,
  dailyGames: Game[],
  gameStates: { [gameName: string]: GameState },
  correctGuesses: string[],
): Promise<{ success: boolean; isWorst: boolean }> => {
  const emojis = generateGameEmojis(
    dailyGames,
    gameStates,
    correctGuesses,
    bonusPoints,
  );
  const scoresToUse = allScores.length > 0 ? allScores : initialScores;
  const shareText = generateShareText(
    score,
    bonusPoints,
    scoresToUse,
    puzzleDate,
    emojis,
  );

  try {
    await navigator.clipboard.writeText(shareText);
    return { success: true, isWorst: shareText.includes('💀') };
  } catch {
    return { success: false, isWorst: false };
  }
};

/**
 * Get success message for share action
 */
export const getShareSuccessMessage = (result: {
  success: boolean;
  isWorst: boolean;
}): string => {
  return result.isWorst ? 'Respect.' : 'Copied to clipboard!';
};

/**
 * Update game state with new values
 */
export const createGameStateUpdater = (
  setGameStates: React.Dispatch<
    React.SetStateAction<{ [gameName: string]: GameState }>
  >,
) => {
  return (gameName: string, state: Partial<GameState>) => {
    setGameStates((prev) => ({
      ...prev,
      [gameName]: {
        revealed: state.revealed ?? prev[gameName]?.revealed ?? {},
        pointsDeducted:
          state.pointsDeducted ?? prev[gameName]?.pointsDeducted ?? 0,
        revealedTitle:
          state.revealedTitle ?? prev[gameName]?.revealedTitle ?? false,
        revealedMaskedTitle:
          state.revealedMaskedTitle ??
          prev[gameName]?.revealedMaskedTitle ??
          false,
      },
    }));
  };
};
