import { useMemo } from 'react';
import type { Game } from '../types';
import type { MissedGuess } from '../utils';

// Helper function to normalize strings by removing accents
const normalizeString = (str: string): string => {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase();
};

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

    const normalizedInput = normalizeString(inputValue);

    return gameOptions.filter((opt) => {
      const normalizedLabel = normalizeString(opt.label);
      const matchesLabel = normalizedLabel.includes(normalizedInput);
      const matchesSearchTerms = opt.searchTerms?.some((term) =>
        normalizeString(term).includes(normalizedInput),
      );
      return (
        (matchesLabel || matchesSearchTerms) && !guessedNames.has(opt.value)
      );
    });
  }, [gameOptions, inputValue, nonSpecialCharCount, guessedNames]);

  return { filteredOptions, nonSpecialCharCount };
};
