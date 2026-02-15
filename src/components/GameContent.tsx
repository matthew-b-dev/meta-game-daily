import React, { useState, useEffect } from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { XMarkIcon } from '@heroicons/react/24/solid';
import { motion, AnimatePresence } from 'framer-motion';
import type { Game } from '../types';
import type { GameState } from '../utils';

const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

const getFieldDisplayName = (field: string): string => {
  const displayNames: { [key: string]: string } = {
    maskedTitle: 'MASKED (***) Title',
    details: 'Details/Genres',
    publishers: 'Publisher(s)',
    screenshot: 'Screenshot',
    platforms: 'Platforms',
  };
  return displayNames[field] || capitalize(field);
};

export interface GameContentProps {
  game: Game;
  gameState?: GameState;
  correctGuesses: string[];
  revealedGames: string[];
  onDeduct: (amount: number) => void;
  onGameRevealed?: (gameName: string) => void;
  updateGameState: (gameName: string, state: Partial<GameState>) => void;
  revealed: { [key: string]: boolean };
  revealedTitle: boolean;
  pointsDeducted: number;
  fieldDeductions: { [key: string]: number };
  revealFields: string[];
}

export const GameContent: React.FC<GameContentProps> = ({
  game,
  gameState,
  correctGuesses,
  revealedGames,
  onDeduct,
  onGameRevealed,
  updateGameState,
  revealed,
  revealedTitle,
  pointsDeducted,
  fieldDeductions,
  revealFields,
}) => {
  const [showScreenshot, setShowScreenshot] = useState(false);
  const [detailsHeight, setDetailsHeight] = useState<number | 'auto'>('auto');
  const detailsRef = React.useRef<HTMLSpanElement>(null);

  // Helper to check if a field is a free reveal
  const isFreeReveal = (field: string): boolean => {
    const freeRevealMap: { [key: string]: string } = {
      ss: 'screenshot',
      meta: 'details',
      pub: 'publishers',
      platforms: 'platforms',
    };
    return game.freeReveal ? freeRevealMap[game.freeReveal] === field : false;
  };

  // Helper to get filtered details/genres, removing 'Behind-Overhead Perspective'
  // if first-person perspective is also present, and 'Sideview' if 'Side Scroller' is also present
  const getFilteredDetails = (): string => {
    let combined = [...(game.other || []), ...(game.details || [])];

    const hasBehindOverhead = combined.includes('Behind-Overhead Perspective');
    const hasFirstPerson = combined.some((item) =>
      ['Firstperson', 'FPS', 'First-person'].includes(item),
    );

    if (hasBehindOverhead && hasFirstPerson) {
      combined = combined.filter(
        (item) => item !== 'Behind-Overhead Perspective',
      );
    }

    const hasSideview = combined.includes('Sideview');
    const hasSideScroller = combined.includes('Side Scroller');

    if (hasSideview && hasSideScroller) {
      combined = combined.filter((item) => item !== 'Sideview');
    }

    return combined.join(', ');
  };

  // Sync external reveals (when parent marks game as revealed)
  useEffect(() => {
    if (revealedGames.includes(game.name) && !revealedTitle) {
      const newRevealed: { [key: string]: boolean } = {};
      revealFields.forEach((field) => {
        if (field !== 'maskedTitle') {
          newRevealed[field] = true;
        }
      });
      updateGameState(game.name, {
        revealed: newRevealed,
        revealedMaskedTitle: game.redactName
          ? true
          : gameState?.revealedMaskedTitle,
        revealedTitle: true,
        pointsDeducted: 200,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [revealedGames, game.name, revealedTitle]);

  // Measure and set the height of details content when revealed
  useEffect(() => {
    const isDetailsRevealed =
      revealed['details'] || correctGuesses.includes(game.name);
    if (isDetailsRevealed && detailsRef.current) {
      // Use setTimeout to ensure content is rendered before measuring
      const timeout = setTimeout(() => {
        if (detailsRef.current) {
          const height = detailsRef.current.offsetHeight;
          setDetailsHeight(height);
        }
      }, 0);
      return () => clearTimeout(timeout);
    }
  }, [revealed, correctGuesses, game.name, game.details]);

  // Handle free reveals - auto reveal the designated field without deducting points
  useEffect(() => {
    if (!game.freeReveal || gameState?.freeRevealed) return;

    // Map freeReveal values to field names
    const freeRevealFieldMap: { [key: string]: string } = {
      ss: 'screenshot',
      meta: 'details',
      pub: 'publishers',
      platforms: 'platforms',
    };

    const fieldToReveal = freeRevealFieldMap[game.freeReveal];
    if (fieldToReveal && !revealed[fieldToReveal]) {
      const newRevealed = { ...revealed, [fieldToReveal]: true };

      updateGameState(game.name, {
        revealed: newRevealed,
        freeRevealed: fieldToReveal,
        pointsDeducted: pointsDeducted || 0, // Ensure pointsDeducted is preserved
      });
    }
  }, [
    game.freeReveal,
    game.name,
    gameState?.freeRevealed,
    revealed,
    updateGameState,
  ]);

  const handleReveal = (field: string) => {
    // Don't allow revealing the free revealed field (it's already revealed)
    if (field === gameState?.freeRevealed) {
      return;
    }

    if (field === 'maskedTitle') {
      const deduction = fieldDeductions[field] || 0;
      const newPointsDeducted = pointsDeducted + deduction;

      updateGameState(game.name, {
        revealedMaskedTitle: true,
        pointsDeducted: newPointsDeducted,
      });

      onDeduct(deduction);
    } else if (!revealed[field]) {
      const newRevealed = { ...revealed, [field]: true };
      const deduction = fieldDeductions[field] || 0;
      const newPointsDeducted = pointsDeducted + deduction;

      updateGameState(game.name, {
        revealed: newRevealed,
        pointsDeducted: newPointsDeducted,
      });

      onDeduct(deduction);
    }
  };

  const allRevealed =
    revealFields.every((field) => field === 'maskedTitle' || revealed[field]) &&
    (!game.redactName || gameState?.revealedMaskedTitle);

  const calculateRevealAllCost = () => {
    let total = 0;
    const freeRevealedField = gameState?.freeRevealed;

    revealFields.forEach((field) => {
      if (
        field !== 'maskedTitle' &&
        !revealed[field] &&
        field !== freeRevealedField
      ) {
        total += fieldDeductions[field] || 0;
      }
    });
    if (game.redactName && !gameState?.revealedMaskedTitle) {
      total += fieldDeductions.maskedTitle || 0;
    }
    return total;
  };

  const calculateGiveUpCost = () => {
    const revealAllFieldsCost = calculateRevealAllCost();
    // Give up costs whatever is needed to bring earned points to 0
    const titleDeduction = 200 - pointsDeducted - revealAllFieldsCost;
    return revealAllFieldsCost + titleDeduction;
  };

  const handleRevealAllFields = () => {
    const newRevealed = { ...revealed };
    let totalDeduction = 0;
    const freeRevealedField = gameState?.freeRevealed;

    revealFields.forEach((field) => {
      if (field !== 'maskedTitle' && !revealed[field]) {
        newRevealed[field] = true;
        // Don't charge for the free revealed field
        if (field !== freeRevealedField) {
          totalDeduction += fieldDeductions[field] || 0;
        }
      }
    });

    const shouldRevealMaskedTitle =
      game.redactName && !gameState?.revealedMaskedTitle;
    if (shouldRevealMaskedTitle) {
      totalDeduction += fieldDeductions.maskedTitle || 0;
    }

    if (totalDeduction > 0) {
      const newPointsDeducted = pointsDeducted + totalDeduction;

      updateGameState(game.name, {
        revealed: newRevealed,
        revealedMaskedTitle: shouldRevealMaskedTitle
          ? true
          : gameState?.revealedMaskedTitle,
        pointsDeducted: newPointsDeducted,
      });

      onDeduct(totalDeduction);
    }
  };

  const handleRevealAll = () => {
    const newRevealed = { ...revealed };
    let totalDeduction = 0;
    const freeRevealedField = gameState?.freeRevealed;

    revealFields.forEach((field) => {
      if (field !== 'maskedTitle' && !revealed[field]) {
        newRevealed[field] = true;
        // Don't charge for the free revealed field
        if (field !== freeRevealedField) {
          totalDeduction += fieldDeductions[field] || 0;
        }
      }
    });

    const shouldRevealMaskedTitle =
      game.redactName && !gameState?.revealedMaskedTitle;
    if (shouldRevealMaskedTitle) {
      totalDeduction += fieldDeductions.maskedTitle || 0;
    }

    // Calculate how many points remain to deduct all of them (bring earned points to 0)
    const titleDeduction = 200 - pointsDeducted - totalDeduction;
    const totalWithTitle = totalDeduction + titleDeduction;

    updateGameState(game.name, {
      revealed: newRevealed,
      revealedMaskedTitle: shouldRevealMaskedTitle
        ? true
        : gameState?.revealedMaskedTitle,
      revealedTitle: true,
      pointsDeducted: pointsDeducted + totalWithTitle,
    });

    onDeduct(totalWithTitle);

    if (onGameRevealed) {
      onGameRevealed(game.name);
    }
  };

  return (
    <div className='flex flex-col gap-2 items-start'>
      {revealFields.map((field) =>
        field === 'details' ? (
          <div
            key={field}
            className={`w-full flex gap-2 relative overflow-visible min-h-[26px] ${
              revealed[field] || correctGuesses.includes(game.name)
                ? 'items-start'
                : 'items-center'
            }`}
          >
            <AnimatePresence mode='wait' initial={false}>
              {!correctGuesses.includes(game.name) && !revealed[field] ? (
                <motion.div
                  key='reveal-btn'
                  className='flex items-center gap-2'
                  initial={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                >
                  <span
                    className={`font-semibold ${
                      game.freeReveal === 'meta' && field === 'details'
                        ? 'text-green-500'
                        : ''
                    }`}
                  >
                    {getFieldDisplayName(field)}:
                  </span>
                  <button
                    onClick={() => handleReveal(field)}
                    className='px-2 py-1 rounded font-bold bg-gray-700 hover:bg-gray-600 text-white text-xs transition-colors'
                  >
                    Reveal (-{fieldDeductions[field] || 0}pts.)
                  </button>
                </motion.div>
              ) : isFreeReveal(field) ? (
                // Free reveal - no animation
                <div key='revealed-content' className='w-full'>
                  <span
                    className={`font-semibold ${
                      game.freeReveal === 'meta' && field === 'details'
                        ? 'text-green-500'
                        : ''
                    }`}
                  >
                    {getFieldDisplayName(field)}:{' '}
                  </span>
                  <span ref={detailsRef} className='text-yellow-500'>
                    {getFilteredDetails()}
                  </span>
                </div>
              ) : (
                <motion.div
                  key='revealed-content'
                  className='w-full overflow-hidden'
                  initial={{ height: 0, opacity: 0 }}
                  animate={{
                    height: detailsHeight,
                    opacity: 1,
                  }}
                  transition={{
                    height: { duration: 0.15, ease: 'easeOut' },
                    opacity: { duration: 0.1, ease: 'easeOut' },
                  }}
                >
                  <span
                    className={`font-semibold ${
                      game.freeReveal === 'meta' && field === 'details'
                        ? 'text-green-500'
                        : ''
                    }`}
                  >
                    {getFieldDisplayName(field)}:{' '}
                  </span>
                  <span ref={detailsRef} className='text-yellow-500'>
                    {getFilteredDetails()}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ) : (
          <div
            key={field}
            className='w-full flex gap-2 items-center relative overflow-visible min-h-[26px]'
          >
            {field === 'screenshot' ? (
              <>
                <span
                  className={`font-semibold ${
                    game.freeReveal === 'ss' && field === 'screenshot'
                      ? 'text-green-500'
                      : ''
                  }`}
                >
                  {getFieldDisplayName(field)}:
                </span>
                <AnimatePresence mode='wait' initial={false}>
                  {!revealed['screenshot'] &&
                  !correctGuesses.includes(game.name) ? (
                    <motion.button
                      key='reveal-btn'
                      onClick={() => handleReveal('screenshot')}
                      className='px-2 py-1 rounded font-bold bg-gray-700 hover:bg-gray-600 text-white text-xs transition-colors'
                      initial={{ opacity: 1 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      Reveal (-{fieldDeductions['screenshot'] || 0}pts.)
                    </motion.button>
                  ) : isFreeReveal('screenshot') ? (
                    // Free reveal - no animation
                    <button
                      key='show-btn'
                      className='text-yellow-500 hover:text-yellow-300 focus:outline-none disabled:text-gray-400 bg-transparent border-none p-0 cursor-pointer text-sm flex items-center gap-1'
                      onClick={() => setShowScreenshot(true)}
                      type='button'
                    >
                      <MagnifyingGlassIcon className='w-4 h-4' />
                      <span
                        className='underline'
                        style={{ textDecorationStyle: 'dashed' }}
                      >
                        [Click to view screenshot]
                      </span>
                    </button>
                  ) : (
                    <motion.button
                      key='show-btn'
                      className='text-yellow-500 hover:text-yellow-300 focus:outline-none disabled:text-gray-400 bg-transparent border-none p-0 cursor-pointer text-sm flex items-center gap-1'
                      onClick={() => setShowScreenshot(true)}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      type='button'
                    >
                      <MagnifyingGlassIcon className='w-4 h-4' />
                      <span
                        className='underline'
                        style={{ textDecorationStyle: 'dashed' }}
                      >
                        [Click to view screenshot]
                      </span>
                    </motion.button>
                  )}
                </AnimatePresence>
                {showScreenshot && (
                  <motion.div
                    className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80'
                    onClick={() => setShowScreenshot(false)}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <motion.div
                      className='bg-zinc-900 rounded-lg p-2 max-w-full max-h-full flex flex-col items-center'
                      style={{ maxWidth: '95vw', maxHeight: '95vh' }}
                      onClick={(e) => e.stopPropagation()}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.2 }}
                    >
                      <img
                        src={game.screenshotUrl}
                        alt={game.name + ' screenshot'}
                        className={`object-contain max-h-[80vh] max-w-[90vw] rounded ${
                          game.brightenImage
                            ? 'brightness-[1.5] md:brightness-125'
                            : ''
                        }`}
                        onContextMenu={(e) => e.preventDefault()}
                      />
                      <button
                        className='flex items-center gap-2 mt-4 px-4 py-2 rounded font-bold bg-gray-700 hover:bg-gray-600 text-white text-sm'
                        onClick={() => setShowScreenshot(false)}
                      >
                        <span>Dismiss</span>
                        <XMarkIcon className='w-4 h-4' />
                      </button>
                    </motion.div>
                  </motion.div>
                )}
              </>
            ) : field === 'maskedTitle' ? (
              <>
                <span className='font-semibold'>
                  {getFieldDisplayName(field)}:
                </span>
                <AnimatePresence mode='wait' initial={false}>
                  {!correctGuesses.includes(game.name) &&
                  !gameState?.revealedMaskedTitle ? (
                    <motion.button
                      key='reveal-btn'
                      onClick={() => handleReveal('maskedTitle')}
                      className='px-2 py-1 rounded font-bold bg-gray-700 hover:bg-gray-600 text-white text-xs transition-colors'
                      initial={{ opacity: 1 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      Reveal (-{fieldDeductions[field] || 0}pts.)
                    </motion.button>
                  ) : (
                    <motion.span
                      key='reveal-text'
                      className='text-yellow-500'
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <i>(Revealed above)</i>
                    </motion.span>
                  )}
                </AnimatePresence>
              </>
            ) : (
              <>
                <span
                  className={`font-semibold ${
                    (game.freeReveal === 'pub' && field === 'publishers') ||
                    (game.freeReveal === 'platforms' && field === 'platforms')
                      ? 'text-green-500'
                      : ''
                  }`}
                >
                  {getFieldDisplayName(field)}:
                </span>
                <AnimatePresence mode='wait' initial={false}>
                  {!correctGuesses.includes(game.name) && !revealed[field] ? (
                    <motion.button
                      key='reveal-btn'
                      onClick={() => handleReveal(field)}
                      className='px-2 py-1 rounded font-bold bg-gray-700 hover:bg-gray-600 text-white text-xs transition-colors'
                      initial={{ opacity: 1 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      Reveal (-{fieldDeductions[field] || 0}pts.)
                    </motion.button>
                  ) : isFreeReveal(field) ? (
                    // Free reveal - no animation
                    <span key='reveal-text' className='text-yellow-500'>
                      {Array.isArray(game[field as keyof Game])
                        ? (game[field as keyof Game] as string[]).join(', ')
                        : String(game[field as keyof Game])}
                    </span>
                  ) : (
                    <motion.span
                      key='reveal-text'
                      className='text-yellow-500'
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      {Array.isArray(game[field as keyof Game])
                        ? (game[field as keyof Game] as string[]).join(', ')
                        : String(game[field as keyof Game])}
                    </motion.span>
                  )}
                </AnimatePresence>
              </>
            )}
            {field === 'publishers' &&
              !correctGuesses.includes(game.name) &&
              !allRevealed && (
                <motion.button
                  className='hidden md:block ml-auto px-3 py-1 rounded font-bold bg-gray-700 hover:bg-gray-600 text-white text-xs transition-colors'
                  onClick={handleRevealAllFields}
                  initial={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  Reveal All (-{calculateRevealAllCost()}pts.)
                </motion.button>
              )}
          </div>
        ),
      )}
      {!correctGuesses.includes(game.name) && !allRevealed && (
        <div className='flex justify-end mt-2 md:hidden'>
          <motion.button
            className='px-3 py-1 rounded font-bold bg-gray-700 hover:bg-gray-600 text-white text-xs transition-colors'
            onClick={handleRevealAllFields}
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            Reveal All (-{calculateRevealAllCost()}pts.)
          </motion.button>
        </div>
      )}
      {!correctGuesses.includes(game.name) && allRevealed && !revealedTitle ? (
        <div className='flex items-center gap-2 mt-2'>
          <motion.button
            className='px-2 py-1 rounded bg-red-700 hover:bg-red-800 text-white text-xs transition-colors'
            onClick={handleRevealAll}
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            Give Up (-{calculateGiveUpCost()} pts.)
          </motion.button>
        </div>
      ) : null}
    </div>
  );
};
