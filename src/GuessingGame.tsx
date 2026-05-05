import { useState, useCallback, useEffect, useMemo } from 'react';
import toast, { Toaster } from 'react-hot-toast';
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
import GiveUpModal from './components/GiveUpModal';
import ResetPuzzleButton from './components/ResetPuzzleButton';
import Footer from './components/Footer';
import PuzzleDateTime from './components/PuzzleDateTime';
import { XMarkIcon } from '@heroicons/react/24/solid';
import {
  getDailyGames,
  getPuzzleDate,
  getTimeUntilNextGame,
  isCloseGuess,
  createGameStateUpdater,
  copyShareToClipboard,
  getShareSuccessMessage,
} from './utils';

import DailyNotification from './components/DailyNotification';
const GuessingGame = () => {
  const puzzleDate = getPuzzleDate();
  const dailyGames = useMemo(() => getDailyGames(gameDetails, 5), []);

  // Use custom hooks for state management
  const {
    stateLoaded,
    score,
    bonusPoints,
    setScore,
    setBonusPoints,
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
  const [showGiveUpConfirm, setShowGiveUpConfirm] = useState(false);
  const [bonusCalculated, setBonusCalculated] = useState(false);

  // Informational banner
  const [showInfoBanner, setShowInfoBanner] = useState(
    () => localStorage.getItem('info-banner-dismissed') !== '1',
  );
  const handleDismissInfoBanner = () => {
    localStorage.setItem('info-banner-dismissed', '1');
    setShowInfoBanner(false);
  };

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
  } = useSendAndFetchScores(
    gameOver,
    allGamesComplete,
    bonusCalculated,
    score + bonusPoints,
    scoreSent,
    () => setScoreSent(true),
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

  // Calculate bonus points when game becomes complete
  useEffect(() => {
    if (gameOver && allGamesComplete && bonusPoints === 0) {
      // Check if all games were guessed correctly (not just revealed)
      const allGamesGuessed = dailyGames.every((game) =>
        correctGuesses.includes(game.name),
      );

      if (allGamesGuessed) {
        // 20 points for each unused guess
        const calculatedBonus = guessesLeft * 20;
        setBonusPoints(calculatedBonus);
      } else {
        // Any missed games = 0 bonus points
        setBonusPoints(0);
      }
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setBonusCalculated(true);
    }
  }, [
    gameOver,
    allGamesComplete,
    bonusPoints,
    dailyGames,
    correctGuesses,
    guessesLeft,
    setBonusPoints,
  ]);

  useEffect(() => {
    // Set bonusCalculated to true after bonusPoints is updated
    if (gameOver && allGamesComplete && bonusPoints !== 0 && !bonusCalculated) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setBonusCalculated(true);
    }
    // Also set to true if bonusPoints is 0 and game is over
    if (gameOver && allGamesComplete && bonusPoints === 0 && !bonusCalculated) {
      setBonusCalculated(true);
    }
  }, [gameOver, allGamesComplete, bonusPoints, bonusCalculated]);

  // Auto-reveal all non-guessed games when guesses are exhausted
  const handleDeduct = useCallback(
    (amount: number) => {
      setScore((s) => Math.max(0, s - amount));
    },
    [setScore],
  );

  // Update game state (for per-game revealed fields and points)
  const updateGameState = createGameStateUpdater(setGameStates);

  const handleRevealGames = useCallback(
    (gameNames: string[]) => {
      setRevealedGames((prev) => [...prev, ...gameNames]);
      // Update game states for all revealed games
      gameNames.forEach((gameName) => {
        updateGameState(gameName, {
          revealedTitle: true,
          pointsDeducted: 200,
          revealed: {
            details: true,
            platforms: true,
            publishers: true,
            screenshot: true,
          },
        });
      });
    },
    [setRevealedGames, updateGameState],
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

  const handleResetPuzzle = async () => {
    await resetPuzzle();
    setShowGameComplete(false);
    setGuess(null);
    setInputValue('');
    setBonusCalculated(false);
    window?.location?.reload?.();
  };

  const handleGiveUp = () => {
    setGuessesLeft(0);
    setShowGiveUpConfirm(false);
  };

  const handleCopyToShare = async () => {
    const result = await copyShareToClipboard(
      score,
      bonusPoints,
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
    <div className='w-full flex flex-col diagonal-pattern-bg'>
      <Toaster position='top-center' />
      <div className='flex flex-col items-center w-full flex-1'>
        <div className='w-full max-w-[750px]'>
          <div className='mb-8'>
            <DailyNotification />

            {showInfoBanner && (
              <div className='mb-4 bg-zinc-800/60 border border-zinc-600/50 rounded-lg px-4 py-3 text-sm text-zinc-300 leading-relaxed relative'>
                <button
                  onClick={handleDismissInfoBanner}
                  className='absolute top-2 right-2 p-1.5 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-700 rounded transition-colors'
                  aria-label='Dismiss'
                >
                  <XMarkIcon className='w-5 h-5' />
                </button>
                <div className='pr-7'>
                  On{' '}
                  <b>
                    <u>March 26, 2026</u>
                  </b>
                  , MetaGameDaily entered a "recycle" mode. I have since then
                  have shifted my focus to a different trivia site,{' '}
                  <a
                    href='https://steamdetective.wtf'
                    target='_blank'
                    rel='noopener noreferrer'
                    className='text-blue-400 hover:text-blue-300 underline'
                  >
                    SteamDetective.wtf
                  </a>
                  , which is being updated every day. <br />
                  <br /> I hope that you'll understand that running both became
                  too difficult on my own. Thank your for playing!{' '}
                  <button
                    onClick={handleDismissInfoBanner}
                    className='inline-flex items-center gap-0.5 underline text-zinc-500 hover:text-zinc-300'
                  >
                    <XMarkIcon className='w-3.5 h-3.5' />
                    Dismiss
                  </button>
                </div>
              </div>
            )}

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
                  <div className='font-semibold text-sm sm:text-base'>
                    <span className='bg-zinc-800 px-2 py-1 mr-1 rounded'>
                      {guessesLeft}
                    </span>
                    guesses remaining
                  </div>
                  <div className='font-semibold text-sm sm:text-base'>
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
              <div className='mt-4 flex flex-col items-center gap-2'>
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
            <div className='font-semibold pl-[46px] pr-[9px] py-2 flex-1 grid grid-cols-[1fr_60px_40px_1fr] sm:grid-cols-[1fr_60px_40px_1fr_78px] gap-2 text-sm sm:text-base'>
              <div>Game title</div>
              <div></div>
              {/* Empty header for +More badge column */}
              <div>Year</div>
              <div>Developer(s)</div>
              <div className='hidden sm:block'>Points</div>
            </div>
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
                  <div className='flex-1'>
                    <PuzzleDateTime
                      puzzleDate={puzzleDate}
                      timeLeft={timeLeft}
                    />
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
        bonusPoints={bonusPoints}
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
      <GiveUpModal
        isOpen={showGiveUpConfirm}
        onConfirm={handleGiveUp}
        onClose={() => setShowGiveUpConfirm(false)}
      />
    </div>
  );
};

export default GuessingGame;
