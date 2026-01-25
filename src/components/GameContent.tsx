import React, { useState, useEffect } from 'react';
import { MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { XMarkIcon } from '@heroicons/react/24/solid';
import { motion } from 'framer-motion';
import type { Game } from '../App';
import type { GameState } from '../utils';

const capitalize = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

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

  // Sync external reveals (when parent marks game as revealed)
  useEffect(() => {
    if (revealedGames.includes(game.name) && !revealedTitle) {
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
    }
  };

  const allRevealed = revealFields.every((field) => revealed[field]);

  const calculateRevealAllCost = () => {
    let total = 0;
    revealFields.forEach((field) => {
      if (!revealed[field]) {
        total += fieldDeductions[field] || 0;
      }
    });
    return total;
  };

  const handleRevealAllFields = () => {
    const newRevealed = { ...revealed };
    let totalDeduction = 0;

    revealFields.forEach((field) => {
      if (!revealed[field]) {
        newRevealed[field] = true;
        totalDeduction += fieldDeductions[field] || 0;
      }
    });

    if (totalDeduction > 0) {
      const newPointsDeducted = pointsDeducted + totalDeduction;

      updateGameState(game.name, {
        revealed: newRevealed,
        pointsDeducted: newPointsDeducted,
      });

      onDeduct(totalDeduction);
    }
  };

  const handleRevealAll = () => {
    const newRevealed = { ...revealed };
    let totalDeduction = 0;

    revealFields.forEach((field) => {
      if (!revealed[field]) {
        newRevealed[field] = true;
        totalDeduction += fieldDeductions[field] || 0;
      }
    });

    const titleDeduction = 100;
    const totalWithTitle = totalDeduction + titleDeduction;

    updateGameState(game.name, {
      revealed: newRevealed,
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
      {revealFields.map((field) => (
        <div
          key={field}
          className='flex items-center gap-2 relative overflow-visible min-h-[26px]'
        >
          <span className='font-semibold'>{getFieldDisplayName(field)}:</span>
          {field === 'screenshot' ? (
            correctGuesses.includes(game.name) || revealed['screenshot'] ? (
              <>
                <button
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
                {showScreenshot && (
                  <motion.div
                    className='fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80'
                    onClick={() => setShowScreenshot(false)}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
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
            ) : !revealed['screenshot'] ? (
              <button
                onClick={() => handleReveal('screenshot')}
                className='px-2 py-1 rounded font-bold bg-gray-700 hover:bg-gray-600 text-white text-xs transition-colors'
              >
                Reveal (-50pts.)
              </button>
            ) : null
          ) : correctGuesses.includes(game.name) ? (
            <span className='text-yellow-500'>
              {Array.isArray(game[field as keyof Game])
                ? (game[field as keyof Game] as string[]).join(', ')
                : String(game[field as keyof Game])}
            </span>
          ) : !revealed[field] ? (
            <button
              onClick={() => handleReveal(field)}
              className='px-2 py-1 rounded font-bold bg-gray-700 hover:bg-gray-600 text-white text-xs transition-colors'
            >
              Reveal (-{fieldDeductions[field] || 0}pts.)
            </button>
          ) : (
            <span className='text-yellow-500'>
              {Array.isArray(game[field as keyof Game])
                ? (game[field as keyof Game] as string[]).join(', ')
                : String(game[field as keyof Game])}
            </span>
          )}
        </div>
      ))}
      {!correctGuesses.includes(game.name) && !allRevealed && (
        <button
          className='md:hidden px-3 py-1 rounded font-bold bg-gray-700 hover:bg-gray-600 text-white text-xs transition-colors mt-2'
          onClick={handleRevealAllFields}
        >
          Reveal All (-{calculateRevealAllCost()}pts.)
        </button>
      )}
      {!correctGuesses.includes(game.name) && allRevealed && !revealedTitle ? (
        <div className='flex items-center gap-2 mt-2'>
          <button
            className='px-2 py-1 rounded bg-red-700 hover:bg-red-800 text-white text-xs transition-colors'
            onClick={handleRevealAll}
          >
            Give Up (-100 pts.)
          </button>
        </div>
      ) : null}
    </div>
  );
};
