import { useEffect } from 'react';
import type { Game } from '../App';

interface UseAutoRevealProps {
  guessesLeft: number;
  allGamesComplete: boolean;
  dailyGames: Game[];
  correctGuesses: string[];
  revealedGames: string[];
  onDeduct: (amount: number) => void;
  onRevealGames: (gameNames: string[]) => void;
}

export const useAutoReveal = ({
  guessesLeft,
  allGamesComplete,
  dailyGames,
  correctGuesses,
  revealedGames,
  onDeduct,
  onRevealGames,
}: UseAutoRevealProps): void => {
  useEffect(() => {
    if (guessesLeft <= 0 && !allGamesComplete) {
      // Find games that haven't been guessed or revealed yet
      const gamesToReveal = dailyGames.filter(
        (game) =>
          !correctGuesses.includes(game.name) &&
          !revealedGames.includes(game.name),
      );

      if (gamesToReveal.length > 0) {
        // Calculate total points to deduct (200 per unrevealed game)
        const totalDeduction = gamesToReveal.length * 200;

        // Deduct all remaining points
        onDeduct(totalDeduction);

        // Mark all games as revealed
        onRevealGames(gamesToReveal.map((g) => g.name));
      }
    }
  }, [
    guessesLeft,
    dailyGames,
    correctGuesses,
    revealedGames,
    allGamesComplete,
    onDeduct,
    onRevealGames,
  ]);
};
