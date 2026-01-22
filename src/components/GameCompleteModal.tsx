import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { GameState } from '../utils';
import { getPercentileMessage } from '../utils';
import ShareButton from './ShareButton';
import FeedbackButtons from './FeedbackButtons';

interface Game {
  name: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

interface GameCompleteModalProps {
  isOpen: boolean;
  score: number;
  guessesLeft: number;
  puzzleDate: string;
  games: Game[];
  correctGuesses: string[];
  gameStates: { [gameName: string]: GameState };
  todayScores: number[];
  userPercentile: number | null;
  onClose: () => void;
  onCopyToShare: () => void;
}

const GameCompleteModal: React.FC<GameCompleteModalProps> = ({
  isOpen,
  score,
  puzzleDate,
  games,
  correctGuesses,
  todayScores,
  userPercentile,
  onClose,
  onCopyToShare,
}) => {
  const [showShareConfirm, setShowShareConfirm] = useState(false);

  // Reset confirmation when modal closes
  useEffect(() => {
    if (!isOpen) {
      // Prevent a cascading render loop
      setTimeout(() => {
        setShowShareConfirm(false);
      }, 0);
    }
  }, [isOpen]);
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className='fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto'
          onClick={onClose}
          initial={{
            backdropFilter: 'blur(0px)',
            backgroundColor: 'rgba(0, 0, 0, 0)',
          }}
          animate={{
            backdropFilter: 'blur(8px)',
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
          }}
          exit={{
            backdropFilter: 'blur(0px)',
            backgroundColor: 'rgba(0, 0, 0, 0)',
          }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          <motion.div
            className='bg-zinc-900 rounded-lg p-6 max-w-md w-full my-auto max-h-[100vh] overflow-y-auto'
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            transition={{
              delay: 0.3,
              duration: 0.3,
              ease: 'easeOut',
            }}
          >
            {/* Score Distribution Graph */}
            {todayScores.length > 1 && (
              <div className='mb-6 p-4 bg-zinc-800 rounded-lg'>
                <div className='text-center mb-1'>
                  <span className='text-sm font-semibold'>
                    Your Score: {score}
                  </span>
                </div>
                {userPercentile !== null && (
                  <p className='text-center text-sm text-green-400 mb-3'>
                    {getPercentileMessage(userPercentile)}
                  </p>
                )}
                <div className='flex items-end justify-between h-32 gap-1'>
                  {(() => {
                    // Create bins for the histogram (0-200, 201-400, 401-600, 601-800, 801-1000)
                    const bins = [
                      { min: 0, max: 200, count: 0, label: '0-200' },
                      { min: 201, max: 400, count: 0, label: '201-400' },
                      { min: 401, max: 600, count: 0, label: '401-600' },
                      { min: 601, max: 800, count: 0, label: '601-800' },
                      { min: 801, max: 1000, count: 0, label: '801-1000' },
                    ];

                    // Count scores in each bin
                    todayScores.forEach((s) => {
                      const bin = bins.find((b) => s >= b.min && s <= b.max);
                      if (bin) bin.count++;
                    });

                    // Find max count for scaling
                    const maxCount = Math.max(...bins.map((b) => b.count), 1);

                    // Determine which bin the user's score falls into
                    const userBin = bins.findIndex(
                      (b) => score >= b.min && score <= b.max,
                    );

                    return bins.map((bin, idx) => {
                      const heightPercent = (bin.count / maxCount) * 100;
                      const isUserBin = idx === userBin;

                      return (
                        <div
                          key={idx}
                          className='flex-1 flex flex-col items-center'
                        >
                          <div
                            className='w-full flex items-end justify-center'
                            style={{ height: '96px' }}
                          >
                            <div
                              className={`w-full rounded-t transition-all ${
                                isUserBin ? 'bg-green-500' : 'bg-blue-500'
                              }`}
                              style={{ height: `${heightPercent}%` }}
                              title={`${bin.count} players`}
                            />
                          </div>
                          <div className='text-[10px] text-gray-400 mt-1 text-center'>
                            {bin.label}
                          </div>
                          <div className='text-xs text-gray-300 font-semibold'>
                            {bin.count}
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>
            )}

            <div className='space-y-3'>
              {games.filter((game) => !correctGuesses.includes(game.name))
                .length > 0 && (
                <div className='mb-1 flex flex-wrap gap-2 items-center'>
                  <span className='text-red-400 font-semibold text-sm'>
                    Missed:
                  </span>
                  {games
                    .filter((game) => !correctGuesses.includes(game.name))
                    .map((game, i) => (
                      <span
                        key={game.name + i}
                        className='flex items-center rounded px-2 py-1 text-xs text-red-500 bg-red-900/30'
                      >
                        <span className='mr-1 font-bold'>❌</span> {game.name}
                      </span>
                    ))}
                </div>
              )}
              <ShareButton
                userPercentile={userPercentile}
                showConfirm={showShareConfirm}
                setShowConfirm={setShowShareConfirm}
                onCopyToShare={onCopyToShare}
              />
              <FeedbackButtons
                puzzleDate={puzzleDate}
                userPercentile={userPercentile}
                isOpen={isOpen}
              />
              <button
                className='w-full px-4 py-2 rounded bg-blue-700 hover:bg-blue-600 text-white text-sm font-semibold'
                onClick={onClose}
              >
                Close
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default GameCompleteModal;
