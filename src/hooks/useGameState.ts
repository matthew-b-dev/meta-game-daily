import { useState, useEffect } from 'react';
import {
  loadGameState,
  saveGameState,
  clearGameState,
  type GameState,
  type MissedGuess,
} from '../utils';
import { fetchTodayScores } from '../lib/supabaseClient';

interface UseGameStateProps {
  puzzleDate: string;
}

interface UseGameStateReturn {
  stateLoaded: boolean;
  score: number;
  setScore: React.Dispatch<React.SetStateAction<number>>;
  guessesLeft: number;
  setGuessesLeft: React.Dispatch<React.SetStateAction<number>>;
  correctGuesses: string[];
  setCorrectGuesses: React.Dispatch<React.SetStateAction<string[]>>;
  revealedGames: string[];
  setRevealedGames: React.Dispatch<React.SetStateAction<string[]>>;
  missedGuesses: MissedGuess[];
  setMissedGuesses: React.Dispatch<React.SetStateAction<MissedGuess[]>>;
  gameStates: { [gameName: string]: GameState };
  setGameStates: React.Dispatch<
    React.SetStateAction<{ [gameName: string]: GameState }>
  >;
  gameCompleteDismissed: boolean;
  setGameCompleteDismissed: React.Dispatch<React.SetStateAction<boolean>>;
  scoreSent: boolean;
  setScoreSent: React.Dispatch<React.SetStateAction<boolean>>;
  initialScores: number[];
  setInitialScores: React.Dispatch<React.SetStateAction<number[]>>;
  resetPuzzle: () => Promise<void>;
}

export const useGameState = ({
  puzzleDate,
}: UseGameStateProps): UseGameStateReturn => {
  // Load state from localStorage on mount
  const savedState = loadGameState(puzzleDate);

  const [stateLoaded] = useState(true); // Always true since we load on initialization
  const [score, setScore] = useState(savedState?.score ?? 1000);
  const [guessesLeft, setGuessesLeft] = useState(savedState?.guessesLeft ?? 10);
  const [correctGuesses, setCorrectGuesses] = useState<string[]>(
    savedState?.correctGuesses ?? [],
  );
  const [revealedGames, setRevealedGames] = useState<string[]>(
    savedState?.revealedGames ?? [],
  );
  const [missedGuesses, setMissedGuesses] = useState<MissedGuess[]>(
    savedState?.missedGuesses ?? [],
  );
  const [gameStates, setGameStates] = useState<{
    [gameName: string]: GameState;
  }>(savedState?.gameStates ?? {});
  const [gameCompleteDismissed, setGameCompleteDismissed] = useState(
    savedState?.gameCompleteDismissed ?? false,
  );
  const [scoreSent, setScoreSent] = useState(savedState?.scoreSent ?? false);
  const [initialScores, setInitialScores] = useState<number[]>([]);

  // Fetch today's scores on mount
  useEffect(() => {
    const fetchScores = async () => {
      try {
        const scores = await fetchTodayScores();
        setInitialScores(scores);
      } catch (error) {
        console.error('Failed to fetch scores from Supabase:', error);
        setInitialScores([]);
      }
    };

    fetchScores();
  }, []);

  // Save to localStorage whenever relevant state changes
  useEffect(() => {
    saveGameState({
      puzzleDate,
      score,
      guessesLeft,
      correctGuesses,
      revealedGames,
      missedGuesses,
      gameStates,
      gameCompleteDismissed,
      scoreSent,
    });
  }, [
    puzzleDate,
    score,
    guessesLeft,
    correctGuesses,
    revealedGames,
    missedGuesses,
    gameStates,
    gameCompleteDismissed,
    scoreSent,
  ]);

  const resetPuzzle = async () => {
    clearGameState();
  };

  return {
    stateLoaded,
    score,
    setScore,
    guessesLeft,
    setGuessesLeft,
    correctGuesses,
    setCorrectGuesses,
    revealedGames,
    setRevealedGames,
    missedGuesses,
    setMissedGuesses,
    gameStates,
    setGameStates,
    gameCompleteDismissed,
    setGameCompleteDismissed,
    scoreSent,
    setScoreSent,
    initialScores,
    setInitialScores,
    resetPuzzle,
  };
};
