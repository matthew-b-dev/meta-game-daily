import { useState, useEffect, useCallback } from 'react';
import { Toaster } from 'react-hot-toast';
import toast from 'react-hot-toast';
import { getPuzzleDate, getTimeUntilNextGame, getUtcDateString } from './utils';
import PuzzleDateTime from './components/PuzzleDateTime';
import ResetPuzzleButton from './components/ResetPuzzleButton';
import SteamDetectiveFooter from './components/SteamDetectiveFooter';
import { useDailyGame } from './hooks/useDailyGame';
import { useCensoredDescription } from './hooks/useCensoredDescription';
import { useSteamDetectiveState } from './hooks/useSteamDetectiveState';
import { useGameActions } from './hooks/useGameActions';
import MissedGuesses from './components/MissedGuesses';
import {
  GameInput,
  SkipButton,
  ClueContainer,
  GameComplete,
} from './components/SteamDetective';

const SteamDetective = () => {
  const puzzleDate = getPuzzleDate();
  const [timeLeft] = useState<{ h: number; m: number }>(() =>
    getTimeUntilNextGame(),
  );
  const [flashGuesses, setFlashGuesses] = useState(false);

  // Custom hooks for state and data
  const dailyGame = useDailyGame();
  const censoredDescription = useCensoredDescription(
    dailyGame.shortDescription,
  );
  const { state, setState } = useSteamDetectiveState();
  const { handleSkip, handleGuess } = useGameActions({
    state,
    setState,
    gameName: dailyGame.name,
  });

  // One-off check for specific date and game
  useEffect(() => {
    const utcDate = getUtcDateString();
    if (utcDate === '2026-02-02' && dailyGame.name === 'Outer Wilds') {
      localStorage.removeItem('meta-game-daily-state');
      window?.location?.reload?.();
    }
  }, [dailyGame.name]);

  // Flash animation when guesses remaining changes

  useEffect(() => {
    if (state.guessesRemaining < 6 && !state.isComplete) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFlashGuesses(true);
      const timer = setTimeout(() => setFlashGuesses(false), 200);
      return () => clearTimeout(timer);
    }
  }, [state.guessesRemaining, state.isComplete]);

  // Determine which clues to show
  const showClue1 = state.currentClue >= 1 || state.isComplete;
  const showClue2 = state.currentClue >= 2 || state.isComplete;
  const showClue3 = state.currentClue >= 3 || state.isComplete;
  const showClue4 = state.currentClue >= 4 || state.isComplete;
  const showClue5 = state.currentClue >= 5 || state.isComplete;
  const showClue6 = state.currentClue >= 6 || state.isComplete;

  const handleCopyToShare = useCallback(
    (compact: boolean = false) => {
      // Generate emoji representation of guesses
      let emojiText = '';
      if (state.totalGuesses === 7) {
        // DNF - all red squares
        emojiText = '🟥 🟥 🟥 🟥 🟥 🟥';
      } else {
        // Build emoji string: red squares for wrong guesses, green check for correct, white squares for remaining
        const emojis = [];
        for (let i = 1; i <= 6; i++) {
          if (i < state.totalGuesses) {
            emojis.push('🟥');
          } else if (i === state.totalGuesses) {
            emojis.push('✅');
          } else {
            emojis.push('⬜');
          }
        }
        emojiText = emojis.join(' ');
      }

      const shareText = compact
        ? `<https://metagamedaily.com/> #SteamDetective ${emojiText}`
        : `https://metagamedaily.com/\n${puzzleDate} #SteamDetective\n${emojiText}`;
      navigator.clipboard.writeText(shareText);
      toast.success('Copied to clipboard!');
    },
    [state.totalGuesses, puzzleDate],
  );

  const handleScoreSent = useCallback(() => {
    setState({ ...state, scoreSent: true });
  }, [state, setState]);

  const handleResetPuzzle = async () => {
    localStorage.removeItem('meta-game-daily-state');
    window?.location?.reload?.();
  };

  return (
    <div className='min-h-screen text-[#c7d5e0]'>
      <Toaster position='top-center' />
      <hr className='h-[1px] bg-gray-700 border-none mb-4'></hr>
      <div className='relative max-w-[970px] mx-auto px-1 md:px-4'>
        <div className='relative flex justify-center items-center mb-4'>
          <h2
            className='text-lg text-white sm:text-2xl mb-[-5px] sm:py-0 sm:mb-0 pl-1 sm:pl-0 font-bold'
            style={{
              fontFamily: 'Playfair Display, serif',
            }}
          >
            Steam Detective
          </h2>
          <div className='ml-2'>
            <span className='relative sm:top-[-3px] inline-flex items-center rounded-md bg-yellow-400/10 px-[3px] py-0 text-xs font-medium text-yellow-500 border border-1 border-yellow-700'>
              New
            </span>
          </div>
        </div>
        {!state.isComplete && (
          <div className='mb-4 pt-4 font-semibold text-sm sm:text-base'>
            <span
              className={`px-2 py-1 mr-1 rounded transition-colors duration-200 ${
                flashGuesses ? 'bg-orange-300' : 'bg-zinc-800'
              }`}
            >
              {state.guessesRemaining}
            </span>
            guesses remaining
          </div>
        )}
        {!state.isComplete && (
          <GameInput onGuess={handleGuess} previousGuesses={state.guesses} />
        )}
        {!state.isComplete && (
          <div className='mb-6 relative flex justify-center items-end'>
            <div className='absolute left-0 font-semibold text-md sm:text-base'>
              Clue: #{state.currentClue}
            </div>
            <SkipButton onClick={handleSkip} currentClue={state.currentClue} />
          </div>
        )}
        {!state.isComplete && state.guesses.length > 0 && (
          <div className='max-w-[600px] mx-auto pb-3'>
            <MissedGuesses
              missedGuesses={state.guesses.map((guess) => ({
                name: guess,
                isClose: false,
              }))}
            />
          </div>
        )}

        <GameComplete
          show={state.isComplete}
          gameName={dailyGame.name}
          totalGuesses={state.totalGuesses}
          onCopyToShare={handleCopyToShare}
          scoreSent={state.scoreSent}
          onScoreSent={handleScoreSent}
        />

        <ClueContainer
          gameName={dailyGame.name}
          screenshot={dailyGame.primaryScreenshot}
          secondaryScreenshot={dailyGame.secondaryScreenshot}
          shortDescription={dailyGame.shortDescription}
          censoredDescription={censoredDescription}
          allReviewSummary={dailyGame.allReviewSummary}
          releaseDate={dailyGame.releaseDate}
          developer={dailyGame.developer}
          publisher={dailyGame.publisher}
          tags={dailyGame.userTags}
          blurredTags={dailyGame.blurredUserTags}
          isComplete={state.isComplete}
          showClue1={showClue1}
          showClue2={showClue2}
          showClue3={showClue3}
          showClue4={showClue4}
          showClue5={showClue5}
          showClue6={showClue6}
        />
      </div>

      {state.isComplete && (
        <div className='flex justify-center mb-4'>
          <ResetPuzzleButton onResetPuzzle={handleResetPuzzle} />
        </div>
      )}

      <PuzzleDateTime puzzleDate={puzzleDate} timeLeft={timeLeft} />

      <SteamDetectiveFooter />
    </div>
  );
};

export default SteamDetective;
