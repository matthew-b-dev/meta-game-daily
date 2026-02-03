import { useState, useEffect, useCallback, useRef } from 'react';
import { Toaster } from 'react-hot-toast';
import toast from 'react-hot-toast';
import { getPuzzleDate, getTimeUntilNextGame } from './utils';
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
  const prevShowCluesRef = useRef<boolean[]>([
    false,
    false,
    false,
    false,
    false,
    false,
  ]);

  // Custom hooks for state and data
  const dailyGame = useDailyGame();
  const censoredDescription = useCensoredDescription(
    dailyGame.shortDescription,
  );
  const { state, setState } = useSteamDetectiveState(dailyGame.name);
  const { handleSkip, handleGuess } = useGameActions({
    state,
    setState,
    gameName: dailyGame.name,
  });

  // Flash animation when guesses remaining changes
  useEffect(() => {
    if (state.guessesRemaining < 6 && !state.isComplete) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFlashGuesses(true);
      const timer = setTimeout(() => setFlashGuesses(false), 200);
      return () => clearTimeout(timer);
    }
  }, [state.guessesRemaining, state.isComplete]);

  // Scroll to top when game is completed
  useEffect(() => {
    if (state.isComplete) {
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    }
  }, [state.isComplete]);

  // Determine which clues to show based on custom clue order
  // Default order: tags, details, desc (clues 1-3), then screenshot1, screenshot2, title (clues 4-6)
  const clueOrder = dailyGame.clueOrder || ['tags', 'details', 'desc'];

  // Map custom order to showClues array [showClue1=tags, showClue2=details, showClue3=desc, showClue4=screenshot1, showClue5=screenshot2, showClue6=title]
  const clueMapping: Record<string, number> = {
    tags: 1,
    details: 2,
    desc: 3,
  };

  // Create mapping from currentClue to which canonical clues should be shown
  const getShowClues = (): boolean[] => {
    const result = [false, false, false, false, false, false]; // [tags, details, desc, screenshot1, screenshot2, title]

    if (state.isComplete) {
      return [true, true, true, true, true, true];
    }

    // Show clues based on current clue and custom order
    for (let i = 0; i < state.currentClue && i < 6; i++) {
      if (i < 3) {
        // First 3 clues use custom order
        const clueType = clueOrder[i];
        const clueIndex = clueMapping[clueType] - 1; // Convert to 0-indexed
        result[clueIndex] = true;
      } else if (i === 3) {
        // Clue 4: first screenshot
        result[3] = true;
      } else if (i === 4) {
        // Clue 5: second screenshot
        result[4] = true;
      } else if (i === 5) {
        // Clue 6: title
        result[5] = true;
      }
    }

    return result;
  };

  const showClues = getShowClues();

  // Auto-scroll down when a new clue becomes the lowest displayed clue
  useEffect(() => {
    // Canonical positions (lower number = higher on page, higher number = lower on page)
    const canonicalPositions = {
      title: 0,
      screenshot1: 1,
      screenshot2: 2,
      desc: 3,
      details: 4,
      tags: 5,
    };

    // Map showClues indices to canonical clue names
    const clueNames = [
      'tags',
      'details',
      'desc',
      'screenshot1',
      'screenshot2',
      'title',
    ];

    // Get the canonical position of the lowest currently shown clue
    const getLowestPosition = (clues: boolean[]): number => {
      let lowestPosition = -1;
      clues.forEach((shown, index) => {
        if (shown) {
          const clueName = clueNames[index] as keyof typeof canonicalPositions;
          const position = canonicalPositions[clueName];
          if (position > lowestPosition) {
            lowestPosition = position;
          }
        }
      });
      return lowestPosition;
    };

    const prevLowestPosition = getLowestPosition(prevShowCluesRef.current);
    const currentLowestPosition = getLowestPosition(showClues);

    // Check if this is the first clue (all previous clues were false)
    const isFirstClue = prevShowCluesRef.current.every((clue) => !clue);

    // If a new clue has become the lowest (higher canonical position number), scroll down
    // Exception: don't scroll on the first clue
    if (
      !isFirstClue &&
      currentLowestPosition > prevLowestPosition &&
      currentLowestPosition >= 0
    ) {
      const scrollAmount = window.innerHeight * 0.25; // 25% of viewport height

      // Delay scroll to ensure DOM has updated with new content
      setTimeout(() => {
        window.scrollBy({
          top: scrollAmount,
          behavior: 'smooth',
        });
      }, 100);
    } else {
    }

    // Update ref for next comparison
    prevShowCluesRef.current = showClues;
  }, [showClues]);

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
            emojis.push('⬛');
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
        : `https://metagamedaily.com/\n${puzzleDate} #SteamDetective 🔍🕵️ #MetaGameDaily\n${emojiText}`;
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
    <div className='text-[#c7d5e0]'>
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
          <div className='max-w-[600px] pb-3'>
            <MissedGuesses missedGuesses={state.guesses} />
          </div>
        )}

        <GameComplete
          show={state.isComplete}
          gameName={dailyGame.name}
          totalGuesses={state.totalGuesses}
          onCopyToShare={handleCopyToShare}
          scoreSent={state.scoreSent}
          onScoreSent={handleScoreSent}
          blurTitleAndAsAmpersand={dailyGame.blurTitleAndAsAmpersand}
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
          blurScreenshotQuarter={dailyGame.blurScreenshotQuarter}
          blurTitleAndAsAmpersand={dailyGame.blurTitleAndAsAmpersand}
          overrideCensoredTitle={dailyGame.overrideCensoredTitle}
          isComplete={state.isComplete}
          showClues={showClues}
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
