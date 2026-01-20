import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  PlusIcon,
  MinusIcon,
  MagnifyingGlassIcon,
} from '@heroicons/react/24/outline';
import type { Game } from '../App';
import type { GameState } from '../utils';

interface ExpandableRowProps {
  game: Game;
  onDeduct: (amount: number) => void;
  correctGuesses?: string[];
  revealedGames?: string[];
  isLast?: boolean;
  onGameRevealed?: (gameName: string) => void;
  gameState?: GameState;
  updateGameState: (gameName: string, state: Partial<GameState>) => void;
}

const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

const maskName = (name: string) =>
  name
    .replace(/[^ :-]/g, '*')
    .replace(/:/g, '\u00A0:\u00A0')
    .replace(/-/g, '\u00A0-\u00A0');

const getFieldDisplayName = (field: string): string => {
  const displayNames: { [key: string]: string } = {
    publishers: 'Publisher(s)',
    score: 'OpenCritic™ Score',
    genres: 'Genre(s)',
    screenshot: 'Screenshot',
    releaseDate: 'Release Date',
    platforms: 'Platform(s)',
  };
  return displayNames[field] || capitalize(field);
};

const ExpandableRow: React.FC<ExpandableRowProps> = ({
  game,
  onDeduct,
  correctGuesses = [],
  revealedGames = [],
  isLast = false,
  onGameRevealed,
  gameState,
  updateGameState,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [showScreenshot, setShowScreenshot] = useState(false);

  // Use lifted state from parent, with defaults
  const revealed = gameState?.revealed ?? {};
  const revealedTitle = gameState?.revealedTitle ?? false;
  const pointsDeducted = gameState?.pointsDeducted ?? 0;

  // Animation state for point deduction
  const [chipAnim, setChipAnim] = useState<{
    field: string;
    amount: number;
    key: number;
  } | null>(null);
  const chipKey = useRef(0);

  // Deduction values for each field
  const fieldDeductions: { [key: string]: number } = {
    score: 5,
    genres: 5,
    releaseDate: 5,
    platforms: 5,
    publishers: 30,
    screenshot: 50,
  };

  // List of revealable fields
  const revealFields = [
    'score',
    'genres',
    'releaseDate',
    'platforms',
    'publishers',
    'screenshot',
  ];

  // Clear animation when row collapses
  useEffect(() => {
    if (!expanded) {
      setChipAnim(null);
    }
  }, [expanded]);

  // Sync external reveals (when parent marks game as revealed)
  useEffect(() => {
    if (revealedGames.includes(game.name) && !revealedTitle) {
      // Mark all fields as revealed
      const newRevealed: { [key: string]: boolean } = {};
      revealFields.forEach((field) => {
        newRevealed[field] = true;
      });
      updateGameState(game.name, {
        revealed: newRevealed,
        revealedTitle: true,
        pointsDeducted: 200,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [revealedGames, game.name, revealedTitle]);

  const handleReveal = (field: string) => {
    if (!revealed[field]) {
      const newRevealed = { ...revealed, [field]: true };
      const deduction = fieldDeductions[field] || 0;
      const newPointsDeducted = pointsDeducted + deduction;

      updateGameState(game.name, {
        revealed: newRevealed,
        pointsDeducted: newPointsDeducted,
      });

      onDeduct(deduction);

      // Clear existing animation first, then start new one
      setChipAnim(null);
      requestAnimationFrame(() => {
        setChipAnim({
          field,
          amount: deduction,
          key: chipKey.current++,
        });
      });
    }
  };

  // Check if all fields are revealed
  const allRevealed = revealFields.every((field) => revealed[field]);

  // Calculate total points to be deducted for Reveal All
  const calculateRevealAllCost = () => {
    let total = 0;
    revealFields.forEach((field) => {
      if (!revealed[field]) {
        total += fieldDeductions[field] || 0;
      }
    });
    return total;
  };

  // Reveal all fields (except game name) at once
  const handleRevealAllFields = () => {
    if (!allRevealed) {
      const newRevealed: { [key: string]: boolean } = {};
      let totalDeduct = 0;
      revealFields.forEach((field) => {
        newRevealed[field] = true;
        if (!revealed[field]) {
          totalDeduct += fieldDeductions[field] || 0;
        }
      });

      const newPointsDeducted = pointsDeducted + totalDeduct;
      updateGameState(game.name, {
        revealed: newRevealed,
        pointsDeducted: newPointsDeducted,
      });

      onDeduct(totalDeduct);

      // Trigger single animation for reveal all
      setChipAnim(null);
      requestAnimationFrame(() => {
        setChipAnim({
          field: 'revealAll',
          amount: totalDeduct,
          key: chipKey.current++,
        });
      });
    }
  };

  // Reveal all fields and deduct all points for the game
  const handleRevealAll = () => {
    // Only reveal if not already all revealed or title
    if (!allRevealed || !revealedTitle) {
      const newRevealed: { [key: string]: boolean } = {};
      let totalDeduct = 0;
      revealFields.forEach((field) => {
        newRevealed[field] = true;
        if (!revealed[field]) {
          totalDeduct += fieldDeductions[field] || 0;
        }
      });

      // Subtract 100pts for revealing the title, in addition to any unrevealed fields
      const totalWithTitle = totalDeduct + 100;
      const newPointsDeducted = pointsDeducted + totalWithTitle;

      updateGameState(game.name, {
        revealed: newRevealed,
        revealedTitle: true,
        pointsDeducted: newPointsDeducted,
      });

      onDeduct(totalWithTitle);

      // Notify parent that this game has been revealed
      if (onGameRevealed) {
        onGameRevealed(game.name);
      }

      // Trigger animation for reveal game
      setChipAnim(null);
      requestAnimationFrame(() => {
        setChipAnim({
          field: 'gameName',
          amount: 100,
          key: chipKey.current++,
        });
      });
    }
  };

  return (
    <>
      <tr
        className={
          `${!isLast && !expanded ? 'border-b border-zinc-700' : ''} ` +
          (correctGuesses.includes(game.name)
            ? 'bg-green-600 text-white transition-colors duration-300'
            : revealedTitle
              ? 'bg-red-700 text-white transition-colors duration-300'
              : 'bg-zinc-800')
        }
      >
        <td className="p-2">
          <button
            onClick={() => setExpanded((e) => !e)}
            className="p-1 rounded bg-gray-700 hover:bg-gray-600 transition-colors"
          >
            {expanded ? (
              <MinusIcon className="w-5 h-5" />
            ) : (
              <PlusIcon className="w-5 h-5" />
            )}
          </button>
        </td>
        <td className="p-2 text-sm sm:text-base">
          {correctGuesses.includes(game.name) || revealedTitle
            ? game.name
            : maskName(game.name)}
        </td>
        <td className="p-2 text-sm sm:text-base">{game.releaseYear}</td>
        <td className="p-2 text-sm sm:text-base">
          {Array.isArray(game.developers)
            ? game.developers.join(', ')
            : game.developers}
        </td>
        <td className="p-2 sm:pr-4 text-sm sm:text-base">
          {(() => {
            const earnedPoints = 200 - pointsDeducted;
            const isGuessed = correctGuesses.includes(game.name);
            let badgeClass = '';

            if (earnedPoints === 0) {
              // Gave up or revealed everything
              badgeClass = 'bg-red-800 text-white';
            } else if (isGuessed && earnedPoints === 200) {
              // Perfect guess
              badgeClass = 'bg-green-700 text-white';
            } else if (isGuessed && earnedPoints < 200) {
              // Guessed with hints used
              badgeClass = 'bg-yellow-500 text-black';
            } else {
              // Not yet guessed or revealed
              badgeClass = 'bg-zinc-700 text-white';
            }
            return (
              <span
                className={`px-2 py-1 rounded font-semibold min-w-[76px] inline-block text-center ${badgeClass}`}
              >
                {earnedPoints}/200
              </span>
            );
          })()}
        </td>
      </tr>
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.tr
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.td
              colSpan={5}
              className="bg-zinc-950 p-4 text-left relative overflow-visible"
              initial={{ height: 0, paddingTop: 0, paddingBottom: 0 }}
              animate={{
                height: 'auto',
                paddingTop: '1rem',
                paddingBottom: '1rem',
              }}
              exit={{ height: 0, paddingTop: 0, paddingBottom: 0 }}
              transition={{ duration: 0.2, ease: 'easeInOut' }}
            >
              {/* Reveal All button - top right on desktop, below screenshot on mobile */}
              {!correctGuesses.includes(game.name) && !allRevealed && (
                <button
                  className="hidden md:block absolute top-4 right-4 px-3 py-1 rounded bg-blue-700 hover:bg-blue-600 text-white text-xs font-semibold transition-colors"
                  onClick={handleRevealAllFields}
                >
                  Reveal All (-{calculateRevealAllCost()}pts.)
                </button>
              )}
              {/* Global animation container - only one animation at a time */}
              <AnimatePresence mode="wait">
                {chipAnim && (
                  <motion.div
                    key={chipAnim.key}
                    initial={{ opacity: 1, x: 0, y: 0, scale: 1 }}
                    animate={{ opacity: [1, 1, 0], x: 40, y: 40, scale: 1.5 }}
                    exit={{ opacity: 0, transition: { duration: 0.1 } }}
                    transition={{
                      duration: 1.6,
                      ease: 'easeOut',
                      times: [0, 0.75, 1],
                    }}
                    className="absolute left-52 z-[9999] bg-red-600 text-white font-extrabold pointer-events-none select-none text-sm px-2 py-1 rounded drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] whitespace-nowrap"
                    style={{
                      top: `${chipAnim.field === 'gameName' ? revealFields.length * 2 + 2 : chipAnim.field === 'revealAll' ? 0 : revealFields.indexOf(chipAnim.field) * 2}rem`,
                    }}
                  >
                    -{chipAnim.amount} points
                  </motion.div>
                )}
              </AnimatePresence>
              <div className="flex flex-col gap-2 items-start">
                {revealFields.map((field) => (
                  <div
                    key={field}
                    className="flex items-center gap-2 relative overflow-visible"
                  >
                    <span className="font-semibold">
                      {getFieldDisplayName(field)}:
                    </span>
                    {field === 'screenshot' ? (
                      correctGuesses.includes(game.name) ||
                      revealed['screenshot'] ? (
                        <>
                          <button
                            className="text-yellow-500 hover:text-yellow-300 focus:outline-none disabled:text-gray-400 bg-transparent border-none p-0 cursor-pointer text-sm flex items-center gap-1"
                            onClick={() => setShowScreenshot(true)}
                            type="button"
                          >
                            <MagnifyingGlassIcon className="w-4 h-4" />
                            <span
                              className="underline"
                              style={{ textDecorationStyle: 'dashed' }}
                            >
                              [Click to view screenshot]
                            </span>
                          </button>
                          {showScreenshot && (
                            <div
                              className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80"
                              onClick={() => setShowScreenshot(false)}
                            >
                              <div
                                className="bg-zinc-900 rounded-lg p-2 max-w-full max-h-full flex flex-col items-center"
                                style={{ maxWidth: '95vw', maxHeight: '95vh' }}
                                onClick={(e) => e.stopPropagation()}
                              >
                                <img
                                  src={game.screenshotUrl}
                                  alt={game.name + ' screenshot'}
                                  className="object-contain max-h-[80vh] max-w-[90vw] rounded brightness-[1.5] md:brightness-125"
                                />
                                <button
                                  className="mt-4 px-4 py-2 rounded bg-blue-700 hover:bg-blue-600 text-white text-sm"
                                  onClick={() => setShowScreenshot(false)}
                                >
                                  Close
                                </button>
                              </div>
                            </div>
                          )}
                        </>
                      ) : !revealed['screenshot'] ? (
                        <button
                          onClick={() => handleReveal('screenshot')}
                          className="px-2 py-1 rounded bg-blue-700 hover:bg-blue-600 text-white text-xs transition-colors"
                        >
                          Reveal (-50pts.)
                        </button>
                      ) : null
                    ) : correctGuesses.includes(game.name) ? (
                      <span className="text-yellow-500">
                        {Array.isArray(game[field as keyof Game])
                          ? (game[field as keyof Game] as string[]).join(', ')
                          : String(game[field as keyof Game])}
                      </span>
                    ) : !revealed[field] ? (
                      <button
                        onClick={() => handleReveal(field)}
                        className="px-2 py-1 rounded bg-blue-700 hover:bg-blue-600 text-white text-xs transition-colors"
                      >
                        Reveal (-{fieldDeductions[field] || 0}pts.)
                      </button>
                    ) : (
                      <span className="text-yellow-500">
                        {Array.isArray(game[field as keyof Game])
                          ? (game[field as keyof Game] as string[]).join(', ')
                          : String(game[field as keyof Game])}
                      </span>
                    )}
                  </div>
                ))}
                {/* Reveal All button - mobile version below screenshot */}
                {!correctGuesses.includes(game.name) && !allRevealed && (
                  <button
                    className="md:hidden px-3 py-1 rounded bg-blue-700 hover:bg-blue-600 text-white text-xs font-semibold transition-colors mt-2"
                    onClick={handleRevealAllFields}
                  >
                    Reveal All (-{calculateRevealAllCost()}pts.)
                  </button>
                )}
                {/* Reveal game button - shown when all fields are revealed */}
                {!correctGuesses.includes(game.name) &&
                allRevealed &&
                !revealedTitle ? (
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      className="px-2 py-1 rounded bg-red-700 hover:bg-red-800 text-white text-xs transition-colors"
                      onClick={handleRevealAll}
                    >
                      Give Up (-100 pts.)
                    </button>
                  </div>
                ) : null}
              </div>
            </motion.td>
          </motion.tr>
        )}
      </AnimatePresence>
    </>
  );
};

export default ExpandableRow;
