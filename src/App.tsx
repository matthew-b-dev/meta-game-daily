import { useState, useCallback } from 'react';
import toast, { Toaster } from 'react-hot-toast';
import { motion } from 'framer-motion';
import {
  QuestionMarkCircleIcon,
  CalendarIcon,
} from '@heroicons/react/24/solid';
import './App.css';
import { gameDetails } from './game_details';
import { dummyGames } from './dummy_games';
import { useSendAndFetchScores } from './hooks/useGameEndScores';
import { useGameState } from './hooks/useGameState';
import { useScoreAnimation } from './hooks/useScoreAnimation';
import { useGameCompletion } from './hooks/useGameCompletion';
import { useAutoReveal } from './hooks/useAutoReveal';
import { useFilteredOptions } from './hooks/useFilteredOptions';
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
  isCloseGuess,
  getSubtitle,
  createGameStateUpdater,
  copyShareToClipboard,
  getShareSuccessMessage,
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
  searchTerms?: string[]; // Additional search terms/aliases for the dropdown
};

const App = () => {
  const puzzleDate = getPuzzleDate();
  const subtitle = getSubtitle();
  const dailyGames = getDailyGames(
    gameDetails.filter((g) => g.reviewRank < 40),
    5,
  ).sort((a, b) => a.reviewRank - b.reviewRank);

  // Use custom hooks for state management
  const {
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
    setGameCompleteDismissed,
    scoreSent,
    setScoreSent,
    initialScores,
    resetPuzzle,
  } = useGameState({ puzzleDate });

  // Timer for next game (set once on mount)
  const [timeLeft] = useState<{ h: number; m: number }>(() =>
    getTimeUntilNextGame(),
  );
  const [guess, setGuess] = useState<{ value: string; label: string } | null>(
    null,
  );
  const [inputValue, setInputValue] = useState('');
  const [showGameComplete, setShowGameComplete] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showGiveUpConfirm, setShowGiveUpConfirm] = useState(false);

  // Animated score display
  const displayScore = useScoreAnimation({ targetScore: score });

  // Filtered options for dropdown
  const { filteredOptions, nonSpecialCharCount } = useFilteredOptions({
    gameDetails,
    dummyGames,
    inputValue,
    correctGuesses,
    missedGuesses,
    revealedGames,
  });

  const allGuessesExhausted = guessesLeft <= 0;

  // Check if all games are complete
  const allGamesComplete = dailyGames.every(
    (game) =>
      correctGuesses.includes(game.name) || revealedGames.includes(game.name),
  );
  const gameOver = allGuessesExhausted || allGamesComplete;

  // Send score and fetch fresh scores when game ends
  const {
    allScores,
    userPercentile,
    isLoading: scoresLoading,
  } = useSendAndFetchScores(gameOver, allGamesComplete, score, scoreSent, () =>
    setScoreSent(true),
  );

  // Handle game completion (open modal on transition to complete)
  const handleGameComplete = useCallback(() => {
    setShowGameComplete(true);
    setGameCompleteDismissed(false);
  }, [setShowGameComplete, setGameCompleteDismissed]);

  useGameCompletion({
    stateLoaded,
    gameOver,
    showGameComplete,
    onGameComplete: handleGameComplete,
  });

  // Auto-reveal all non-guessed games when guesses are exhausted
  const handleDeduct = useCallback(
    (amount: number) => {
      setScore((s) => Math.max(0, s - amount));
    },
    [setScore],
  );

  const handleRevealGames = useCallback(
    (gameNames: string[]) => {
      setRevealedGames((prev) => [...prev, ...gameNames]);
    },
    [setRevealedGames],
  );

  useAutoReveal({
    guessesLeft,
    allGamesComplete,
    dailyGames,
    correctGuesses,
    revealedGames,
    onDeduct: handleDeduct,
    onRevealGames: handleRevealGames,
  });

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

  // Track when a game is fully revealed
  const handleGameRevealed = useCallback(
    (gameName: string) => {
      setRevealedGames((prev) =>
        prev.includes(gameName) ? prev : [...prev, gameName],
      );
    },
    [setRevealedGames],
  );

  // Update game state (for per-game revealed fields and points)
  const updateGameState = createGameStateUpdater(setGameStates);

  const handleResetPuzzle = async () => {
    await resetPuzzle();
    setShowGameComplete(false);
    setGuess(null);
    setInputValue('');
    window?.location?.reload?.();
  };

  const handleGiveUp = () => {
    setGuessesLeft(0);
    setShowGiveUpConfirm(false);
    toast.error('Game ended. All remaining games revealed.');
  };

  const handleCopyToShare = async () => {
    const result = await copyShareToClipboard(
      score,
      allScores,
      initialScores,
      puzzleDate,
      dailyGames,
      gameStates,
      correctGuesses,
    );

    if (result.success) {
      toast.success(getShareSuccessMessage(result));
    } else {
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
              {subtitle.animated ? (
                <motion.p
                  className='text-gray-400 text-sm mt-1'
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{
                    opacity: 1,
                    scale: 1,
                    x: [0, -8, 8, -8, 8, -5, 5, 0],
                  }}
                  transition={{
                    duration: 1,
                    ease: 'easeOut',
                    x: {
                      duration: 0.5,
                      ease: 'easeInOut',
                      times: [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7],
                    },
                  }}
                >
                  {subtitle.text}
                </motion.p>
              ) : (
                <p className='text-gray-400 text-sm mt-1'>{subtitle.text}</p>
              )}
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
        todayScores={allScores}
        userPercentile={userPercentile}
        scoresLoading={scoresLoading}
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
