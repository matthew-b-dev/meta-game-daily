import { useMemo } from 'react';
import type { Game } from '../App';
import type { MissedGuess } from '../utils';

interface GameOption {
  value: string;
  label: string;
  searchTerms: string[];
}

interface UseFilteredOptionsProps {
  gameDetails: Game[];
  dummyGames: string[];
  inputValue: string;
  correctGuesses: string[];
  missedGuesses: MissedGuess[];
  revealedGames: string[];
}

export const useFilteredOptions = ({
  gameDetails,
  dummyGames,
  inputValue,
  correctGuesses,
  missedGuesses,
  revealedGames,
}: UseFilteredOptionsProps): {
  filteredOptions: GameOption[];
  nonSpecialCharCount: number;
} => {
  const gameOptions = useMemo(
    () =>
      [
        ...gameDetails.map((g) => ({
          value: g.name,
          label: g.name,
          searchTerms: g.searchTerms || [],
        })),
        ...dummyGames.map((name) => ({
          value: name,
          label: name,
          searchTerms: [],
        })),
      ].sort((a, b) => a.label.localeCompare(b.label)),
    [gameDetails, dummyGames],
  );

  const guessedNames = useMemo(
    () =>
      new Set([
        ...correctGuesses,
        ...missedGuesses.map((g) => g.name),
        ...revealedGames,
      ]),
    [correctGuesses, missedGuesses, revealedGames],
  );

  const nonSpecialCharCount = inputValue.replace(/[:-]/g, '').length;

  const filteredOptions = useMemo(() => {
    if (nonSpecialCharCount < 3) return [];

    return gameOptions.filter((opt) => {
      const lowerInput = inputValue.toLowerCase();
      const matchesLabel = opt.label.toLowerCase().includes(lowerInput);
      const matchesSearchTerms = opt.searchTerms?.some((term) =>
        term.toLowerCase().includes(lowerInput),
      );
      return (
        (matchesLabel || matchesSearchTerms) && !guessedNames.has(opt.value)
      );
    });
  }, [gameOptions, inputValue, nonSpecialCharCount, guessedNames]);

  return { filteredOptions, nonSpecialCharCount };
};
