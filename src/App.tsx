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
import { sendScore, fetchTodayScores } from './lib/supabaseClient';
import MissedGuesses from './components/MissedGuesses';
import GameTable from './components/GameTable';
import GuessInput from './components/GuessInput';
import GameCompleteModal from './components/GameCompleteModal';
import HelpModal from './components/HelpModal';
import GiveUpModal from './components/GiveUpModal';
import ResetPuzzleButton from './components/ResetPuzzleButton';
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
  const [scoreSent, setScoreSent] = useState(false);
  const [todayScores, setTodayScores] = useState<number[]>([]);
  const [userPercentile, setUserPercentile] = useState<number | null>(null);

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
  const [showGiveUpConfirm, setShowGiveUpConfirm] = useState(false);

  // Fetch today's scores on mount
  useEffect(() => {
    const fetchScores = async () => {
      const scores = await fetchTodayScores();

      // Seed the scores with some mocked ones so the graph makes sense alongside fetched scores
      const mockScores = [540, 520, 480, 270];
      setTodayScores([...mockScores, ...scores]);
    };

    fetchScores();
  }, []);

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
      setScoreSent(savedState.scoreSent ?? false);
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
      setScoreSent(false);
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

  // Send score to Supabase when game becomes over (exactly once)
  React.useEffect(() => {
    // Only send if:
    // 1. State is loaded
    // 2. Game is over
    // 3. Score hasn't been sent yet
    // 4. All games are complete (ensures all deductions have been applied)
    if (stateLoaded && gameOver && !scoreSent && allGamesComplete) {
      sendScore(score);
      setScoreSent(true);
    }
  }, [stateLoaded, gameOver, scoreSent, score, allGamesComplete]);

  console.log('current score:', score);

  // Calculate percentile when game is over and scores are available
  React.useEffect(() => {
    if (gameOver && todayScores.length > 0 && allGamesComplete) {
      // Add user's score to the list if not already included
      const scoresWithUser = todayScores.includes(score)
        ? todayScores
        : [...todayScores, score];

      // Sort scores in ascending order
      const sortedScores = [...scoresWithUser].sort((a, b) => a - b);

      // Count how many scores are below the user's score
      const scoresBelowUser = sortedScores.filter((s) => s < score).length;

      // Calculate percentile (what percentage of players the user beat)
      const percentile = Math.round(
        (scoresBelowUser / sortedScores.length) * 100,
      );

      setUserPercentile(percentile);

      // Update todayScores to include user's score for the graph
      if (!todayScores.includes(score)) {
        setTodayScores(scoresWithUser);
      }
    }
  }, [gameOver, todayScores, score, allGamesComplete]);

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
      scoreSent,
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
    scoreSent,
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
    setScoreSent(false);
    setShowGameComplete(false);
    setGuess(null);
    setInputValue('');

    toast.success('Puzzle reset!');
  };

  const handleGiveUp = () => {
    setGuessesLeft(0);
    setShowGiveUpConfirm(false);
    toast.error('Game ended. All remaining games revealed.');
  };

  const handleCopyToShare = async () => {
    // Use the puzzle date instead of current date
    const dateStr = puzzleDate;

    // Generate emoji string for each game
    const emojis = dailyGames
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
    <div className='min-h-screen bg-zinc-900 w-full flex flex-col min-h-screen diagonal-pattern-bg'>
      <Toaster position='top-center' />
      <div className='flex flex-col items-center w-full px-1 sm:px-4 flex-1'>
        <div className='w-full max-w-[750px] p-2 sm:p-6'>
          <div className='relative mb-6'>
            <div className='text-center'>
              <h1
                className='text-2xl sm:text-4xl font-black'
                style={{
                  fontFamily: 'Playfair Display, serif',
                  letterSpacing: '0.02em',
                }}
              >
                MetaGameDaily
              </h1>
              <p className='text-gray-400 text-sm mt-1'>
                A daily <i>Video Games Industry</i> puzzle
              </p>
            </div>
            <button
              className='absolute right-0 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300 transition-colors flex items-center gap-1 px-2'
              onClick={() => setShowHelp(true)}
            >
              <QuestionMarkCircleIcon className='w-8 h-8' />
              <span className='text-sm font-semibold hidden sm:inline'>
                How to play
              </span>
            </button>
          </div>

          <div className='mb-8'>
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
                <div className='mt-4 flex justify-between items-center'>
                  <div className='font-semibold'>
                    <span className='bg-zinc-800 px-2 py-1 mr-1 rounded'>
                      {guessesLeft}
                    </span>
                    guesses remaining
                  </div>
                  <div className='font-semibold'>
                    Current Score:{' '}
                    <span className='bg-zinc-800 px-2 py-1 rounded'>
                      {displayScore}
                    </span>
                  </div>
                </div>
                <MissedGuesses missedGuesses={missedGuesses} />
              </>
            )}
            {gameOver && (
              <div className='mt-4 mb-4 flex flex-col items-center gap-2'>
                <button
                  className='px-6 py-2 rounded bg-green-700 hover:bg-green-600 text-white text-sm font-semibold'
                  onClick={() => setShowGameComplete(true)}
                >
                  Show Results 🏆
                </button>
                <ResetPuzzleButton onResetPuzzle={handleResetPuzzle} />
              </div>
            )}
          </div>
          <div className='-mx-2 sm:mx-0'>
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
          <div className='w-full max-w-[750px] mx-auto'>
            {(() => {
              const giveUpButton = !gameOver && (
                <button
                  className='px-3 py-1.5 rounded border-1 border-red-600 bg-transparent text-red-500 hover:bg-red-600/10 text-sm font-semibold transition-colors'
                  onClick={() => setShowGiveUpConfirm(true)}
                >
                  Give up?
                </button>
              );

              return (
                <div className='pt-6 flex flex-col md:flex-row md:items-center md:justify-between'>
                  {/* Give up button - shows above date on mobile, on to the right on desktop */}
                  <div className='flex justify-center md:hidden mb-3'>
                    {giveUpButton}
                  </div>

                  <div className='hidden md:block md:flex-1' />
                  <div className='flex-1 flex flex-col items-center'>
                    <div className='text-gray-200 text-sm flex items-center gap-2'>
                      <CalendarIcon className='w-4 h-4' />
                      {puzzleDate}
                    </div>
                    <div className='text-gray-400 text-sm'>
                      Next game in {timeLeft.h}h, {timeLeft.m}m
                    </div>
                  </div>
                  <div className='hidden md:flex md:flex-1 md:justify-end'>
                    {giveUpButton}
                  </div>
                </div>
              );
            })()}
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
        gameStates={gameStates}
        todayScores={todayScores}
        userPercentile={userPercentile}
        onClose={() => {
          setShowGameComplete(false);
          setGameCompleteDismissed(true);
        }}
        onCopyToShare={handleCopyToShare}
      />
      <HelpModal isOpen={showHelp} onClose={() => setShowHelp(false)} />
      <GiveUpModal
        isOpen={showGiveUpConfirm}
        onConfirm={handleGiveUp}
        onClose={() => setShowGiveUpConfirm(false)}
      />
    </div>
  );
};

export default App;
