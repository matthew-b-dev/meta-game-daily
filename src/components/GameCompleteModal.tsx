import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { GameState } from '../utils';
import ShareButton from './ShareButton';
import FeedbackButtons from './FeedbackButtons';
import AnimatedScoreDisplay from './AnimatedScoreDisplay';

interface Game {
  name: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

interface GameCompleteModalProps {
  isOpen: boolean;
  score: number;
  bonusPoints: number;
  guessesLeft: number;
  puzzleDate: string;
  games: Game[];
  correctGuesses: string[];
  gameStates: { [gameName: string]: GameState };
  todayScores: number[];
  userPercentile: number | null;
  scoresLoading: boolean;
  onClose: () => void;
  onCopyToShare: () => void;
}

const GameCompleteModal: React.FC<GameCompleteModalProps> = ({
  isOpen,
  score,
  bonusPoints,
  puzzleDate,
  games,
  correctGuesses,
  todayScores,
  userPercentile,
  scoresLoading,
  onClose,
  onCopyToShare,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className='fixed inset-0 z-50 flex items-center justify-center p-0 md:p-4 overflow-y-auto'
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
            className='bg-zinc-900 rounded-lg p-3 md:p-6 max-w-md w-full my-auto max-h-[100vh] overflow-y-auto'
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
            {/* Use a unique key to force remount only when modal opens */}
            <AnimatedScoreDisplay
              key={isOpen ? `score-anim-${puzzleDate}` : 'closed'}
              score={score}
              bonusPoints={bonusPoints}
              todayScores={todayScores}
              userPercentile={userPercentile}
              scoresLoading={scoresLoading}
            />

            <div className='space-y-3'>
              {games.filter((game) => !correctGuesses.includes(game.name))
                .length > 0 && (
                <div className='mb-1 flex flex-wrap gap-2 items-center overflow-auto'>
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
                onCopyToShare={onCopyToShare}
                isLoading={scoresLoading}
              />
              <div className='w-full text-center mt-0 flex items-center justify-center gap-2'>
                <span className='inline-flex items-center px-2 py-0.5 rounded bg-yellow-400 text-black text-xs font-bold'>
                  NEW
                </span>
                <span>for PC Game Trivia ...</span>
              </div>
              <button
                className='w-full px-4 py-2 rounded bg-gray-700 hover:bg-gray-600 text-white text-sm font-semibold flex items-center justify-center gap-2 disabled:bg-gray-600 disabled:cursor-not-allowed disabled:opacity-50'
                onClick={() =>
                  window.open('https://steamdetective.wtf/', '_blank')
                }
                disabled={scoresLoading}
              >
                <span className='flex'>
                  Check out 🕵️
                  <span className='text-yellow-500 pl-1'>
                    steamdetective.wtf
                  </span>
                  <span className='pl-1'>!</span>
                </span>
              </button>
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
