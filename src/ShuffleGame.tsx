import { useMemo, useState, useEffect } from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import {
  getSundayShuffleGames,
  getUtcDateString,
  getPuzzleDate,
  getTimeUntilNextGame,
  loadShuffleGameState,
  saveShuffleGameState,
  clearShuffleGameState,
} from './utils';
import { gameDetails } from './game_details';
import { SortableGameItem } from './components/SortableGameItem';
import { frozenVerticalListStrategy } from './lib/frozenSortingStrategy';
import type { Game } from './types';
import ResetPuzzleButton from './components/ResetPuzzleButton';
import ShuffleFooter from './components/ShuffleFooter';
import ShuffleCompleteModal from './components/ShuffleCompleteModal';
import PuzzleDateTime from './components/PuzzleDateTime';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/20/solid';
import { fetchShuffleScores } from './lib/supabaseClient';

interface GameWithId extends Game {
  id: string;
}

// ===== TESTING CONFIGURATION =====
// Set to true to enable testing mode with fixed game state
const TESTING_MODE = false;
// Indices of games to freeze (0-based). Example: [1, 2] freezes 2nd and 3rd items
const FROZEN_INDICES = [1];
// Number of games to show (set to null for all games)
const GAME_COUNT = 4;
// ===== END TESTING CONFIGURATION =====

const ROUND_DETAILS = [
  {
    variant: 'hltb',
    topDesc: 'Shortest "Main Story"',
    bottomDesc: 'Longest "Main Story"',
    desc: (
      <>
        Sort these games from <b>shortest to longest</b> "Main Story" according
        to <i>HowLongToBeat</i>.
      </>
    ),
  },
  {
    variant: 'score',
    topDesc: 'Lowest score',
    bottomDesc: 'Highest score',
    desc: (
      <>
        Sort these games from <b>lowest to highest</b> score.
      </>
    ),
  },
  {
    variant: 'releaseYear',
    topDesc: 'Oldest',
    bottomDesc: 'Newest',
    desc: (
      <>
        Sort these games from <b>oldest to newest</b> by release year.
      </>
    ),
  },
];

const ShuffleGame = () => {
  const puzzleDate = getUtcDateString();
  const formattedPuzzleDate = getPuzzleDate();
  const [timeLeft] = useState<{ h: number; m: number }>(() =>
    getTimeUntilNextGame(),
  );
  const savedState = loadShuffleGameState(puzzleDate);

  // Track current round and completion status
  const [currentRound, setCurrentRound] = useState(
    savedState?.currentRound ?? 0,
  );
  const [isRoundComplete, setIsRoundComplete] = useState(
    savedState?.isRoundComplete ?? false,
  );
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [isButtonFading, setIsButtonFading] = useState(false);
  const [stateLoaded, setStateLoaded] = useState(false);
  const [hasOrderChanged, setHasOrderChanged] = useState(true); // Start as true for first submission

  // Track missed guesses per round
  const [missedGuessesByRound, setMissedGuessesByRound] = useState<number[]>(
    savedState?.missedGuessesByRound ?? [0, 0, 0], // Initialize with 0 for each of the 3 rounds
  );

  // Track if score has been sent to database
  const [scoreSent, setScoreSent] = useState(savedState?.scoreSent ?? false);

  // Track if game is complete and modal should be shown
  const [showCompleteModal, setShowCompleteModal] = useState(false);

  // Track which round user is viewing (for navigation after completion)
  const [viewingRound, setViewingRound] = useState(
    savedState?.viewingRound ?? currentRound,
  );

  // Check if all rounds are complete
  const allRoundsComplete =
    currentRound === ROUND_DETAILS.length - 1 && isRoundComplete;

  // Get the games and sort them by the current round's variant
  const correctlySortedGames = useMemo(() => {
    return [];
  }, []);

  // Initialize games - shuffle unless in testing mode
  const [currentOrder, setCurrentOrder] = useState<GameWithId[]>([]);

  // Track which games are frozen (correctly positioned)
  const [frozenIds, setFrozenIds] = useState<Set<string>>(
    savedState?.frozenIds ? new Set(savedState.frozenIds) : new Set(),
  );

  // Track which games are currently shaking (incorrect items)
  const [shakingIds, setShakingIds] = useState<Set<string>>(new Set());

  // Fetch shuffle scores on mount
  useEffect(() => {
    const loadScores = async () => {
      try {
        await fetchShuffleScores();
      } catch (error) {
        console.error('Failed to fetch shuffle scores:', error);
      }
    };

    loadScores();
  }, []);

  // Initialize game state on first load from savedState or fresh
  useEffect(() => {
    return;
  }, [correctlySortedGames, savedState, stateLoaded]);

  // Update games when viewing different rounds after completion
  useEffect(() => {
    return;
  }, [viewingRound, allRoundsComplete, correctlySortedGames, stateLoaded]);

  const sensors = useSensors(
    /*
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 150,
        tolerance: 32,
      },
    }),*/
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  // Save state to localStorage whenever it changes
  useEffect(() => {
    if (stateLoaded && currentOrder.length > 0) {
      saveShuffleGameState(puzzleDate, {
        currentRound,
        isRoundComplete,
        currentOrder: currentOrder.map((game) => ({
          id: game.id,
          name: game.name,
        })),
        frozenIds: Array.from(frozenIds),
        missedGuessesByRound,
        scoreSent,
        viewingRound,
      });
    }
  }, [
    puzzleDate,
    currentRound,
    isRoundComplete,
    currentOrder,
    frozenIds,
    stateLoaded,
    missedGuessesByRound,
    scoreSent,
    viewingRound,
  ]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) {
      return;
    }

    // Don't allow moving frozen items
    if (frozenIds.has(active.id as string)) {
      return;
    }

    setCurrentOrder((items) => {
      const newIndex = items.findIndex((item) => item.id === over.id);

      // Can't move to a frozen item's position
      if (frozenIds.has(items[newIndex].id)) {
        return items;
      }

      // Extract frozen items and their positions
      const frozenPositions = new Map<number, GameWithId>();
      items.forEach((item, idx) => {
        if (frozenIds.has(item.id)) {
          frozenPositions.set(idx, item);
        }
      });

      // Get only non-frozen items
      const nonFrozenItems = items.filter((item) => !frozenIds.has(item.id));

      // Find the positions in the non-frozen array
      const nonFrozenOldIndex = nonFrozenItems.findIndex(
        (item) => item.id === active.id,
      );
      const nonFrozenNewIndex = nonFrozenItems.findIndex(
        (item) => item.id === over.id,
      );

      // Reorder only the non-frozen items
      const reorderedNonFrozen = arrayMove(
        nonFrozenItems,
        nonFrozenOldIndex,
        nonFrozenNewIndex,
      );

      // Rebuild the full array with frozen items in their original positions
      const result: GameWithId[] = [];
      let nonFrozenIndex = 0;

      for (let i = 0; i < items.length; i++) {
        if (frozenPositions.has(i)) {
          result.push(frozenPositions.get(i)!);
        } else {
          result.push(reorderedNonFrozen[nonFrozenIndex]);
          nonFrozenIndex++;
        }
      }

      return result;
    });

    // Mark that the order has changed
    setHasOrderChanged(true);
  };

  const handleSubmitGuess = () => {
    return;
  };

  const handleNextRound = () => {
    if (currentRound < ROUND_DETAILS.length - 1) {
      setIsFadingOut(true);
      setTimeout(() => {
        setCurrentRound(currentRound + 1);
        setViewingRound(currentRound + 1); // Update viewing round too
        setIsRoundComplete(false); // Reset completion status for new round
        setFrozenIds(new Set()); // Clear frozen items for new round
        setIsFadingOut(false);
        setHasOrderChanged(true); // Allow submission in new round
      }, 300);
    }
  };

  const handlePrevRound = () => {
    if (viewingRound > 0) {
      setIsFadingOut(true);
      setTimeout(() => {
        setViewingRound(viewingRound - 1);
        setIsFadingOut(false);
      }, 300);
    }
  };

  const handleNextViewRound = () => {
    if (viewingRound < ROUND_DETAILS.length - 1) {
      setIsFadingOut(true);
      setTimeout(() => {
        setViewingRound(viewingRound + 1);
        setIsFadingOut(false);
      }, 300);
    }
  };

  const handleResetPuzzle = () => {
    clearShuffleGameState();
    window.location.reload();
  };

  return (
    <div className='mb-8 max-w-2xl mx-auto px-0 sm:px-4'>
      <hr className='h-[1px] bg-gray-700 border-none mb-4' />
      <div className='mb-3'>
        <div className='relative flex justify-center items-center'>
          <h2
            className='text-lg sm:text-2xl mb-[-5px] sm:py-0 sm:mb-0 pl-1 sm:pl-0 font-bold'
            style={{
              fontFamily: 'Playfair Display, serif',
            }}
          >
            Weekend Shuffle
          </h2>
          <div className='ml-2'>
            <span className='relative sm:top-[-3px] inline-flex items-center rounded-md bg-yellow-400/10 px-[3px] py-0 text-xs font-medium text-yellow-500 border border-1 border-yellow-700'>
              New
            </span>
          </div>
        </div>
        <div className='text-gray-500 text-xs sm:text-sm italic text-center mb-3 mt-[-1px] sm:mt-[-4px]'>
          (Saturday/Sunday)
        </div>
        <div className='flex items-center justify-center sm:justify-start gap-2 mb-2'>
          <span className='inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-gray-800 text-gray-300 border border-gray-700'>
            Round {(allRoundsComplete ? viewingRound : currentRound) + 1}/
            {ROUND_DETAILS.length}
          </span>
        </div>
        <div className='flex justify-center sm:block sm:justify-start'>
          <div className='text-md text-gray-200 min-h-[48px]'>
            {
              ROUND_DETAILS[allRoundsComplete ? viewingRound : currentRound]
                .desc
            }
          </div>
        </div>
      </div>

      <div className='text-right mb-2'>
        <p className='text-sm text-gray-400 italic'>
          {
            ROUND_DETAILS[allRoundsComplete ? viewingRound : currentRound]
              .topDesc
          }
        </p>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={currentOrder.map((g) => g.id)}
          strategy={frozenVerticalListStrategy(
            frozenIds,
            currentOrder.map((g) => g.id),
          )}
        >
          <div
            className={`transition-opacity duration-300 ${isFadingOut ? 'opacity-0' : 'opacity-100'}`}
          >
            <div></div>
          </div>
        </SortableContext>
      </DndContext>

      <div className='text-right mb-4'>
        <p className='text-sm text-zinc-400 italic'>
          {
            ROUND_DETAILS[allRoundsComplete ? viewingRound : currentRound]
              .bottomDesc
          }
        </p>
      </div>

      <div
        className={`flex flex-col items-center transition-opacity duration-300 ${
          isFadingOut || isButtonFading ? 'opacity-0' : 'opacity-100'
        }`}
      >
        {allRoundsComplete ? (
          <div className='flex flex-col items-center gap-3'>
            <div className='flex items-center gap-2'>
              <button
                className='px-3 py-2 rounded bg-gray-700 hover:bg-gray-600 text-white text-sm font-semibold flex items-center gap-1 transition-opacity'
                onClick={handlePrevRound}
                style={{
                  opacity: viewingRound === 0 ? 0 : 1,
                  pointerEvents: viewingRound === 0 ? 'none' : 'auto',
                }}
              >
                <ChevronLeftIcon className='w-4 h-4' />
                Prev.<span className='hidden sm:inline'> Round</span>
              </button>
              <button
                className='px-6 py-2 rounded bg-green-700 hover:bg-green-600 text-white text-sm font-semibold'
                onClick={() => setShowCompleteModal(true)}
              >
                <span className='hidden sm:inline'>Show</span> Results 🏆
              </button>
              <button
                className='px-3 py-2 rounded bg-gray-700 hover:bg-gray-600 text-white text-sm font-semibold flex items-center gap-1 transition-opacity'
                onClick={handleNextViewRound}
                style={{
                  opacity: viewingRound === ROUND_DETAILS.length - 1 ? 0 : 1,
                  pointerEvents:
                    viewingRound === ROUND_DETAILS.length - 1 ? 'none' : 'auto',
                }}
              >
                Next<span className='hidden sm:inline'> Round</span>
                <ChevronRightIcon className='w-4 h-4' />
              </button>
            </div>
            <ResetPuzzleButton onResetPuzzle={handleResetPuzzle} />
          </div>
        ) : (
          <>
            <button
              onClick={isRoundComplete ? handleNextRound : handleSubmitGuess}
              className='w-full sm:w-auto mt-[-6px] sm:mt-0 px-6 py-3 bg-yellow-400 text-gray-800 font-semibold rounded-lg enabled:hover:bg-yellow-500 transition-colors shadow-md flex items-center justify-center disabled:opacity-50 disabled:cursor-default disabled:outline-none focus:outline-none'
              disabled={!isRoundComplete && !hasOrderChanged}
            >
              {isRoundComplete ? (
                <>
                  Next Round
                  <svg
                    className='w-5 h-5 ml-2 relative top-[1px]'
                    fill='currentColor'
                    viewBox='0 0 20 20'
                  >
                    <path d='M4.555 5.168A1 1 0 003 6v8a1 1 0 001.555.832L10 11.202V14a1 1 0 001.555.832l6-4a1 1 0 000-1.664l-6-4A1 1 0 0010 6v2.798l-5.445-3.63z' />
                  </svg>
                </>
              ) : (
                'Submit Guess'
              )}
            </button>
            <span className='inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-gray-800 text-gray-300 border border-gray-700 mt-2'>
              Total Guesses:{' '}
              {missedGuessesByRound.reduce((sum, count) => sum + count, 0)}
            </span>
          </>
        )}
      </div>

      <div className='pt-6 pb-2'>
        <PuzzleDateTime puzzleDate={formattedPuzzleDate} timeLeft={timeLeft} />
      </div>

      <div className='pt-4'>
        <ShuffleFooter />
      </div>

      {showCompleteModal && (
        <ShuffleCompleteModal
          missedGuessesByRound={missedGuessesByRound}
          scoreSent={scoreSent}
          onScoreSent={() => setScoreSent(true)}
          onClose={() => setShowCompleteModal(false)}
          puzzleDate={puzzleDate}
          isOpen={showCompleteModal}
        />
      )}
    </div>
  );
};

export default ShuffleGame;
