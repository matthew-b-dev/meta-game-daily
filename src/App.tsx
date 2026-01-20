import { useState, useEffect, useRef } from 'react';
import * as React from 'react';
import toast, { Toaster } from 'react-hot-toast';
import {
  QuestionMarkCircleIcon,
  CalendarIcon,
} from '@heroicons/react/24/solid';
import './App.css';
import { gameDetails } from './game_details';
import { dummyGames } from './dummy_games';
import MissedGuesses from './components/MissedGuesses';
import GameTable from './components/GameTable';
import GuessInput from './components/GuessInput';
import GameCompleteModal from './components/GameCompleteModal';
import HelpModal from './components/HelpModal';
import Footer from './components/Footer';
import {
  getDailyGames,
  getPuzzleDate,
  getTimeUntilNextGame,
  loadGameState,
  saveGameState,
  clearGameState,
  isCloseGuess,
  type GameState,
  type MissedGuess,
} from './utils';

export type Game = {
  score?: string;
  name: string;
  platforms?: string;
  genres?: string;
  releaseDate?: string;
  releaseYear: number;
  reviewRank: number;
  developers?: string[];
  publishers?: string[];
  franchise?: string;
  screenshotUrl?: string;
  isDummyGame?: boolean;
};

const App = () => {
  const puzzleDate = getPuzzleDate();
  const dailyGames = getDailyGames(
    gameDetails.filter((g) => g.reviewRank < 40),
    5,
  ).sort((a, b) => a.reviewRank - b.reviewRank);

  // Load saved state or initialize with defaults
  const [stateLoaded, setStateLoaded] = useState(false);
  const [score, setScore] = useState(1000);
  const [guessesLeft, setGuessesLeft] = useState(10);
  const [correctGuesses, setCorrectGuesses] = useState<string[]>([]);
  const [revealedGames, setRevealedGames] = useState<string[]>([]);
  const [missedGuesses, setMissedGuesses] = useState<MissedGuess[]>([]);
  const [gameStates, setGameStates] = useState<{
    [gameName: string]: GameState;
  }>({});
  const [gameCompleteDismissed, setGameCompleteDismissed] = useState(false);

  // Timer for next game (set once on mount)
  const [timeLeft] = useState<{ h: number; m: number }>(() =>
    getTimeUntilNextGame(),
  );
  const [guess, setGuess] = useState<{ value: string; label: string } | null>(
    null,
  );
  const [inputValue, setInputValue] = useState('');
  const [showGameComplete, setShowGameComplete] = useState(false);
  const [displayScore, setDisplayScore] = useState(1000);
  const [showHelp, setShowHelp] = useState(false);

  // Load state from localStorage on mount
  useEffect(() => {
    const savedState = loadGameState(puzzleDate);
    if (savedState) {
      setScore(savedState.score);
      setGuessesLeft(savedState.guessesLeft);
      setCorrectGuesses(savedState.correctGuesses);
      setRevealedGames(savedState.revealedGames);
      setMissedGuesses(savedState.missedGuesses);
      setGameStates(savedState.gameStates);
      setGameCompleteDismissed(savedState.gameCompleteDismissed);
      setDisplayScore(savedState.score);
    } else {
      // Clear state when puzzle date changes (no saved state found)
      setScore(1000);
      setGuessesLeft(10);
      setCorrectGuesses([]);
      setRevealedGames([]);
      setMissedGuesses([]);
      setGameStates({});
      setGameCompleteDismissed(false);
      setDisplayScore(1000);
    }
    setStateLoaded(true);
  }, [puzzleDate]);

  // Merge real games and dummy games for dropdown options
  const allGameNames = [
    ...gameDetails.map((g) => g.name),
    ...dummyGames,
  ].sort();

  const gameOptions = allGameNames.map((name) => ({
    value: name,
    label: name,
  }));

  const allGuessesExhausted = guessesLeft <= 0;

  // Check if all games are complete
  const allGamesComplete = dailyGames.every(
    (game) =>
      correctGuesses.includes(game.name) || revealedGames.includes(game.name),
  );
  const gameOver = allGuessesExhausted || allGamesComplete;

  // Track previous game over state to detect transitions (only after state is loaded)
  const prevGameOver = useRef(false);
  const hasInitialized = useRef(false);

  // Check if game is complete
  React.useEffect(() => {
    // Skip until state has been loaded
    if (!stateLoaded) return;

    // On first run after state loads, just record current state without opening modal
    if (!hasInitialized.current) {
      prevGameOver.current = gameOver;
      hasInitialized.current = true;
      return;
    }

    const wasNotOver = !prevGameOver.current;
    const isNowOver = gameOver;

    // Only auto-open modal if game JUST became complete (transition from not-over to over)
    if (wasNotOver && isNowOver && !showGameComplete) {
      setShowGameComplete(true);
      // Reset dismissed flag since this is a fresh completion
      setGameCompleteDismissed(false);
    }

    prevGameOver.current = gameOver;
  }, [stateLoaded, gameOver, showGameComplete]);

  // Auto-reveal all non-guessed games when guesses are exhausted
  React.useEffect(() => {
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
        handleDeduct(totalDeduction);

        // Mark all games as revealed
        setRevealedGames((prev) => [
          ...prev,
          ...gamesToReveal.map((g) => g.name),
        ]);
      }
    }
  }, [
    guessesLeft,
    dailyGames,
    correctGuesses,
    revealedGames,
    allGamesComplete,
  ]);

  // Animate score counting down
  React.useEffect(() => {
    if (displayScore === score) return;

    const duration = 500; // milliseconds
    const startTime = Date.now();
    const startScore = displayScore;
    const change = score - displayScore;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease out function for smooth deceleration
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const current = Math.round(startScore + change * easeOut);

      setDisplayScore(current);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setDisplayScore(score);
      }
    };

    requestAnimationFrame(animate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [score]);

  // Only show options that match inputValue, and only if inputValue has 3+ chars
  // Don't count ":" and "-" towards the character minimum to prevent exploiting masked titles
  const guessedNames = new Set([
    ...correctGuesses,
    ...missedGuesses.map((g) => g.name),
    ...revealedGames,
  ]);
  const nonSpecialCharCount = inputValue.replace(/[:-]/g, '').length;
  const filteredOptions =
    nonSpecialCharCount >= 3
      ? gameOptions.filter(
          (opt) =>
            opt.label.toLowerCase().includes(inputValue.toLowerCase()) &&
            !guessedNames.has(opt.value),
        )
      : [];

  const handleGuess = (selected: { value: string; label: string } | null) => {
    if (allGuessesExhausted) return;
    if (selected) {
      const newGuessesLeft = guessesLeft - 1;
      setGuessesLeft(newGuessesLeft);
      if (dailyGames.some((g) => g.name === selected.value)) {
        setCorrectGuesses((prev) =>
          prev.includes(selected.value) ? prev : [...prev, selected.value],
        );
        toast.success('Correct!');
      } else {
        const isClose = isCloseGuess(selected.value, dailyGames);
        setMissedGuesses((prev) =>
          prev.some((g) => g.name === selected.value)
            ? prev
            : [...prev, { name: selected.value, isClose }],
        );
        if (isClose) {
          toast.error('Close guess! Try something similar.', {
            duration: 5000,
            icon: '🤏',
          });
        } else {
          toast.error(`Miss! ${newGuessesLeft} guesses remaining`);
        }
      }
    }
    setGuess(null);
    setInputValue('');
  };

  // Deduct points for revealing info
  const handleDeduct = (amount: number) => {
    setScore((s) => Math.max(0, s - amount));
  };

  // Track when a game is fully revealed
  const handleGameRevealed = (gameName: string) => {
    setRevealedGames((prev) =>
      prev.includes(gameName) ? prev : [...prev, gameName],
    );
  };

  // Update game state (for per-game revealed fields and points)
  const updateGameState = (gameName: string, state: Partial<GameState>) => {
    setGameStates((prev) => ({
      ...prev,
      [gameName]: {
        revealed: state.revealed ?? prev[gameName]?.revealed ?? {},
        pointsDeducted:
          state.pointsDeducted ?? prev[gameName]?.pointsDeducted ?? 0,
        revealedTitle:
          state.revealedTitle ?? prev[gameName]?.revealedTitle ?? false,
      },
    }));
  };

  // Save to localStorage whenever relevant state changes
  useEffect(() => {
    if (!stateLoaded) return; // Don't save until initial load is complete

    saveGameState({
      puzzleDate,
      score,
      guessesLeft,
      correctGuesses,
      revealedGames,
      missedGuesses,
      gameStates,
      gameCompleteDismissed,
    });
    // puzzleDate is purposefully left out as a dependency so we don't force a save when the date ticks over to the next.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    stateLoaded,
    score,
    guessesLeft,
    correctGuesses,
    revealedGames,
    missedGuesses,
    gameStates,
    gameCompleteDismissed,
  ]);

  const handleResetPuzzle = () => {
    // Clear localStorage
    clearGameState();

    // Reset all state to initial values
    setScore(1000);
    setDisplayScore(1000);
    setGuessesLeft(10);
    setCorrectGuesses([]);
    setRevealedGames([]);
    setMissedGuesses([]);
    setGameStates({});
    setGameCompleteDismissed(false);
    setShowGameComplete(false);
    setGuess(null);
    setInputValue('');

    toast.success('Puzzle reset!');
  };

  const handleCopyToShare = async () => {
    // Use the puzzle date instead of current date
    const dateStr = puzzleDate;

    // Generate emoji string for each game
    const emojis = dailyGames
      .map((game) => {
        if (correctGuesses.includes(game.name)) {
          return '✅';
        } else {
          return '❌';
        }
      })
      .join('');

    // Build the share text
    const shareText = `https://matthew-b-dev.github.io/meta-game-daily/\n${dateStr}\n${emojis}\n🏆 ${score} points`;

    // Copy to clipboard
    try {
      await navigator.clipboard.writeText(shareText);
      toast.success('Copied to clipboard!');
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      toast.error('Failed to copy');
    }
  };

  return (
    <div className="min-h-screen bg-zinc-900 w-full flex flex-col min-h-screen diagonal-pattern-bg">
      <Toaster position="top-center" />
      <div className="flex flex-col items-center w-full px-1 sm:px-4 flex-1">
        <div className="w-full max-w-[750px] p-2 sm:p-6">
          <div className="relative mb-6">
            <div className="text-center">
              <h1
                className="text-2xl sm:text-4xl font-black"
                style={{
                  fontFamily: 'Playfair Display, serif',
                  letterSpacing: '0.02em',
                }}
              >
                MetaGameDaily
              </h1>
              <p className="text-gray-400 text-sm mt-1">
                A daily Video Games Industry puzzle
              </p>
            </div>
            <button
              className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors flex items-center gap-1 px-2"
              onClick={() => setShowHelp(true)}
            >
              <QuestionMarkCircleIcon className="w-8 h-8" />
              <span className="text-sm font-semibold hidden sm:inline">
                How to play
              </span>
            </button>
          </div>

          <div className="mb-8">
            <GuessInput
              filteredOptions={filteredOptions}
              guess={guess}
              onGuess={handleGuess}
              inputValue={inputValue}
              setInputValue={setInputValue}
              gameOver={gameOver}
              nonSpecialCharCount={nonSpecialCharCount}
            />
            {!gameOver && (
              <>
                <div className="mt-4 flex justify-between items-center">
                  <div className="font-semibold">
                    <span className="bg-zinc-800 px-2 py-1 mr-1 rounded">
                      {guessesLeft}
                    </span>
                    guesses remaining
                  </div>
                  <div className="font-semibold">
                    Current Score:{' '}
                    <span className="bg-zinc-800 px-2 py-1 rounded">
                      {displayScore}
                    </span>
                  </div>
                </div>
                <MissedGuesses missedGuesses={missedGuesses} />
              </>
            )}
            {gameOver && (
              <div className="mt-4 mb-4 flex justify-center">
                <button
                  className="px-6 py-2 rounded bg-green-700 hover:bg-green-600 text-white text-sm font-semibold"
                  onClick={() => setShowGameComplete(true)}
                >
                  Show Results 🏆
                </button>
              </div>
            )}
          </div>
          <div className="-mx-2 sm:mx-0">
            <GameTable
              dailyGames={dailyGames}
              correctGuesses={correctGuesses}
              revealedGames={revealedGames}
              onDeduct={handleDeduct}
              onGameRevealed={handleGameRevealed}
              gameStates={gameStates}
              updateGameState={updateGameState}
            />
          </div>
          <div className="w-full max-w-[750px] mx-auto">
            <div className="text-center pt-6 text-gray-200 text-sm flex items-center justify-center gap-2">
              <CalendarIcon className="w-4 h-4" />
              {puzzleDate}
            </div>
            <div className="text-center text-gray-400 text-sm">
              Next game in {timeLeft.h}h, {timeLeft.m}m
            </div>
          </div>
          <Footer />
        </div>
      </div>
      <GameCompleteModal
        isOpen={showGameComplete}
        score={score}
        guessesLeft={guessesLeft}
        puzzleDate={puzzleDate}
        games={dailyGames}
        correctGuesses={correctGuesses}
        onClose={() => {
          setShowGameComplete(false);
          setGameCompleteDismissed(true);
        }}
        onCopyToShare={handleCopyToShare}
        onResetPuzzle={handleResetPuzzle}
      />
      <HelpModal isOpen={showHelp} onClose={() => setShowHelp(false)} />
    </div>
  );
};

export default App;
