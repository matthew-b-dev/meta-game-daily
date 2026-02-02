import { useState, useCallback, useEffect } from 'react';
import { MAX_CLUES } from '../components/SteamDetective/utils';
import {
  getPuzzleDate,
  loadSteamDetectiveState,
  saveSteamDetectiveState,
  type SteamDetectiveState as SteamDetectiveStateType,
} from '../utils';

export interface SteamDetectiveState extends SteamDetectiveStateType {
  puzzleDate: string;
}

export const useSteamDetectiveState = () => {
  const puzzleDate = getPuzzleDate();

  // Load or initialize state
  const loadState = useCallback((): SteamDetectiveState => {
    const savedState = loadSteamDetectiveState(puzzleDate);

    if (savedState) {
      return {
        puzzleDate,
        ...savedState,
      };
    }

    // Return default state
    return {
      puzzleDate,
      currentClue: 1,
      guessesRemaining: MAX_CLUES,
      isComplete: false,
      isCorrect: false,
      guesses: [],
      totalGuesses: 0,
      scoreSent: false,
    };
  }, [puzzleDate]);

  const [state, setState] = useState<SteamDetectiveState>(loadState);

  // Save state to localStorage whenever it changes
  useEffect(() => {
    const { puzzleDate: _, ...stateWithoutDate } = state;
    saveSteamDetectiveState(state.puzzleDate, stateWithoutDate);
  }, [state]);

  return { state, setState };
};
