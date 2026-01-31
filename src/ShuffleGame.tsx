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
    variant: 'critic',
    topDesc: 'Lowest OpenCritic score',
    bottomDesc: 'Highest OpenCritic score',
    desc: (
      <>
        Sort these games from <b>lowest to highest</b> <i>OpenCritic</i> score.
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

  // Get the games and sort them by the current round's variant
  const correctlySortedGames = useMemo(() => {
    const variant = ROUND_DETAILS[currentRound].variant as
      | 'hltb'
      | 'critic'
      | 'releaseYear';
    const games = getSundayShuffleGames(gameDetails, variant);

    let sortedGames;
    if (variant === 'hltb') {
      sortedGames = games
        .filter(
          (game) => game.hltb?.main !== undefined && game.hltb?.main !== null,
        )
        .sort((a, b) => a.hltb!.main! - b.hltb!.main!);
    } else if (variant === 'critic') {
      sortedGames = games
        .filter((game) => game.score !== undefined && game.score !== null)
        .sort(
          (a, b) => parseInt(a.score || '0', 10) - parseInt(b.score || '0', 10),
        );
    } else {
      sortedGames = games
        .filter(
          (game) => game.releaseYear !== undefined && game.releaseYear !== null,
        )
        .sort((a, b) => a.releaseYear - b.releaseYear);
    }

    // Apply game count limit if in testing mode
    if (TESTING_MODE && GAME_COUNT) {
      sortedGames = sortedGames.slice(0, GAME_COUNT);
    }

    return sortedGames.map((game, index) => ({
      ...game,
      id: `game-${index}`,
    }));
  }, [currentRound]);

  // Initialize games - shuffle unless in testing mode
  const [currentOrder, setCurrentOrder] = useState<GameWithId[]>([]);

  // Track which games are frozen (correctly positioned)
  const [frozenIds, setFrozenIds] = useState<Set<string>>(
    savedState?.frozenIds ? new Set(savedState.frozenIds) : new Set(),
  );

  // Track which games are currently shaking (incorrect items)
  const [shakingIds, setShakingIds] = useState<Set<string>>(new Set());

  // Initialize game state on first load from savedState or fresh
  useEffect(() => {
    // Only run initial setup once
    if (stateLoaded) return;

    // Check if we have saved state to restore
    if (savedState && savedState.currentOrder.length > 0) {
      // Restore from saved state
      const restoredOrder = savedState.currentOrder
        .map((item) => {
          const game = correctlySortedGames.find((g) => g.name === item.name);
          return game ? { ...game, id: item.id } : null;
        })
        .filter((g): g is GameWithId => g !== null);

      if (restoredOrder.length > 0) {
        setCurrentOrder(restoredOrder);
        setStateLoaded(true);
        return;
      }
    }

    // No saved state, initialize fresh
    if (TESTING_MODE) {
      // Testing mode: keep sorted order
      setCurrentOrder([...correctlySortedGames]);
    } else {
      // Normal mode: shuffle
      const shuffled = [...correctlySortedGames];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      setCurrentOrder(shuffled);
    }
    setFrozenIds(
      TESTING_MODE && FROZEN_INDICES.length > 0
        ? new Set(
            FROZEN_INDICES.map((i) => correctlySortedGames[i]?.id).filter(
              Boolean,
            ),
          )
        : new Set(),
    );
    setIsRoundComplete(false);
    setStateLoaded(true);
  }, [correctlySortedGames, savedState, stateLoaded]);

  // Re-shuffle games when round changes (not on initial load)
  useEffect(() => {
    // Only run when round changes, not on initial load
    if (!stateLoaded || currentRound === (savedState?.currentRound ?? 0)) {
      return;
    }

    // Shuffle games for the new round
    if (TESTING_MODE) {
      setCurrentOrder([...correctlySortedGames]);
    } else {
      const shuffled = [...correctlySortedGames];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      setCurrentOrder(shuffled);
    }
  }, [
    currentRound,
    correctlySortedGames,
    stateLoaded,
    savedState?.currentRound,
  ]);

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
    const newFrozenIds = new Set(frozenIds);
    const incorrectIds = new Set<string>();
    let correctCount = 0;

    currentOrder.forEach((game, index) => {
      const correctIndex = correctlySortedGames.findIndex(
        (g) => g.name === game.name,
      );
      if (correctIndex === index) {
        newFrozenIds.add(game.id);
        correctCount++;
      } else {
        incorrectIds.add(game.id);
      }
    });

    setFrozenIds(newFrozenIds);

    // Increment total guesses for current round (every submission counts)
    setMissedGuessesByRound((prev) => {
      const updated = [...prev];
      updated[currentRound] = (updated[currentRound] || 0) + 1;
      return updated;
    });

    // Reset order changed flag after submission
    setHasOrderChanged(false);

    // Check if all are correct
    if (correctCount === currentOrder.length) {
      setIsButtonFading(true);
      setTimeout(() => {
        setIsRoundComplete(true);
        setIsButtonFading(false);
      }, 300);
      if (currentRound === ROUND_DETAILS.length - 1) {
        // Show completion modal after a brief delay
        setTimeout(() => {
          setShowCompleteModal(true);
        }, 500);
      }
    } else if (incorrectIds.size > 0) {
      // Shake incorrect items
      setShakingIds(incorrectIds);
      // Clear shake animation after it completes
      setTimeout(() => {
        setShakingIds(new Set());
      }, 500);
    }
  };

  const handleNextRound = () => {
    if (currentRound < ROUND_DETAILS.length - 1) {
      setIsFadingOut(true);
      setTimeout(() => {
        setCurrentRound(currentRound + 1);
        setIsRoundComplete(false); // Reset completion status for new round
        setFrozenIds(new Set()); // Clear frozen items for new round
        setIsFadingOut(false);
        setHasOrderChanged(true); // Allow submission in new round
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
        <h2 className='text-xl text-center sm:text-2xl'>Weekend Shuffle</h2>
        <div className='text-gray-500 italic text-center mb-3'>
          (Saturday/Sunday Game Mode)
        </div>
        <div className='flex items-center justify-center sm:justify-start gap-2 mb-2'>
          <span className='inline-flex items-center px-2.5 py-1 rounded-md text-xs font-medium bg-gray-800 text-gray-300 border border-gray-700'>
            Round {currentRound + 1}/{ROUND_DETAILS.length}
          </span>
        </div>
        <div className='flex justify-center sm:block sm:justify-start'>
          <div className='text-md text-gray-200 min-h-[40px]'>
            {ROUND_DETAILS[currentRound].desc}
          </div>
        </div>
      </div>

      {/* Mobile instructions alert */}
      <div className='md:hidden mb-3 p-2 bg-amber-900/30 border border-amber-700 rounded-lg text-center'>
        <p className='text-sm text-amber-200'>
          📱 <b>Mobile Users</b>: Tap and Hold first, then drag.
        </p>
      </div>

      <div className='text-right mb-2'>
        <p className='text-sm text-gray-400 italic'>
          {ROUND_DETAILS[currentRound].topDesc}
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
            {currentOrder.map((game, index) => (
              <SortableGameItem
                key={game.id}
                game={game}
                id={game.id}
                index={index}
                isFrozen={frozenIds.has(game.id)}
                isCorrect={
                  frozenIds.has(game.id) &&
                  correctlySortedGames.findIndex(
                    (g) => g.name === game.name,
                  ) === index
                }
                isShaking={shakingIds.has(game.id)}
                showHiddenInfo={isRoundComplete}
                variant={
                  ROUND_DETAILS[currentRound].variant as
                    | 'hltb'
                    | 'critic'
                    | 'releaseYear'
                }
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <div className='text-right mb-4'>
        <p className='text-sm text-zinc-400 italic'>
          {ROUND_DETAILS[currentRound].bottomDesc}
        </p>
      </div>

      <div
        className={`flex flex-col items-center transition-opacity duration-300 ${
          isFadingOut || isButtonFading ? 'opacity-0' : 'opacity-100'
        }`}
      >
        {isRoundComplete && currentRound === ROUND_DETAILS.length - 1 ? (
          <div className='flex flex-col items-center gap-3'>
            <button
              className='px-6 py-2 rounded bg-green-700 hover:bg-green-600 text-white text-sm font-semibold'
              onClick={() => setShowCompleteModal(true)}
            >
              Show Results 🏆
            </button>
            <ResetPuzzleButton onResetPuzzle={handleResetPuzzle} />
          </div>
        ) : (
          <>
            <button
              onClick={isRoundComplete ? handleNextRound : handleSubmitGuess}
              className='px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg enabled:hover:bg-blue-700 transition-colors shadow-md flex items-center gap-2 disabled:opacity-50 disabled:cursor-default'
              disabled={!isRoundComplete && !hasOrderChanged}
            >
              {isRoundComplete ? (
                <>
                  Next Round
                  <svg
                    className='w-5 h-5'
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
      <div className='pt-6'>
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
