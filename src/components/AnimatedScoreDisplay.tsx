import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getPercentileMessage, getRankEmoji } from '../utils';

interface AnimatedScoreDisplayProps {
  score: number;
  todayScores: number[];
  userPercentile: number | null;
  scoresLoading: boolean;
}

const AnimatedScoreDisplay: React.FC<AnimatedScoreDisplayProps> = ({
  score,
  todayScores,
  userPercentile,
  scoresLoading,
}) => {
  const [animatedScore, setAnimatedScore] = useState(0);
  const [showBigScore, setShowBigScore] = useState(false);
  const [showBigRank, setShowBigRank] = useState(false);
  const [showSmallScore, setShowSmallScore] = useState(false);
  const [showRank, setShowRank] = useState(false);
  const [showHistogram, setShowHistogram] = useState(false);

  // Calculate user's rank
  // Sort scores in descending order (highest first)
  const sortedScores = [...todayScores].sort((a, b) => b - a);

  // findIndex returns the FIRST matching index, ensuring ties get the best rank
  // Example: scores [500, 500, 200, 100] → user with 500 gets rank #1 (not #2)
  const userRank = sortedScores.findIndex((s) => s === score) + 1;
  const totalPlayers = todayScores.length;

  const rankEmoji = getRankEmoji(userRank, totalPlayers);

  // Animate score counting and sequence
  useEffect(() => {
    if (scoresLoading) return;

    // Only run animation on mount (modal open)
    // Reset all animation states
    setAnimatedScore(0);
    setShowBigScore(true);
    setShowBigRank(false);
    setShowSmallScore(false);
    setShowRank(false);
    setShowHistogram(false);

    // Start counting animation
    const duration = 1500; // 1.5 seconds
    const startTime = Date.now();

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);

      // Ease out cubic for smooth deceleration
      const easeOutCubic = 1 - Math.pow(1 - progress, 3);
      const currentScore = Math.floor(easeOutCubic * score);
      setAnimatedScore(currentScore);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        // Score counting complete, hold for 0.5s then show rank
        setTimeout(() => {
          setShowBigRank(true);
          // Hold both score and rank for 1.5s, then transition to final layout
          setTimeout(() => {
            setShowBigScore(false);
            setShowBigRank(false);
            setTimeout(() => {
              setShowSmallScore(true);
              setTimeout(() => {
                setShowRank(true);
                setTimeout(() => {
                  setShowHistogram(true);
                }, 300);
              }, 200);
            }, 300);
          }, 2000);
        }, 500);
      }
    };

    requestAnimationFrame(animate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scoresLoading]); // Only rerun when loading state changes

  if (scoresLoading) {
    return (
      <div className='mb-6 p-4 bg-zinc-800 rounded-lg min-h-[220px]'>
        <div className='flex flex-col items-center justify-center h-32'>
          <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-green-500'></div>
          <p className='text-sm text-gray-400 mt-2'>Loading scores...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`mb-6 p-4 bg-zinc-800 rounded-lg ${todayScores.length > 1 ? 'h-[220px]' : ''}`}
    >
      {/* Large animated score */}
      <AnimatePresence>
        {showBigScore && (
          <motion.div
            className='flex justify-center pt-2 h-[220px]'
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3 }}
          >
            <div className=''>
              <div className='flex-col items-center flex'>
                <div className='text-gray-400 text-lg mb-2'>Your Score</div>
                <div className='text-green-400 text-6xl font-bold'>
                  {animatedScore}
                </div>
              </div>
              {/* Rank display that appears below the score */}
              <AnimatePresence>
                {showBigRank && todayScores.length > 1 && (
                  <motion.div
                    className='text-white text-2xl font-semibold mt-3'
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    {rankEmoji} Rank #{userRank} out of {totalPlayers}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Small score label */}
      <AnimatePresence>
        {showSmallScore && (
          <motion.div
            className='text-center mb-1'
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <span className='text-sm font-semibold'>Your Score: {score}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {todayScores.length > 1 && (
        <>
          {/* Rank message */}
          <AnimatePresence>
            {showRank && userPercentile !== null && (
              <motion.p
                className='text-center text-sm text-green-400 mb-3'
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{
                  opacity: 1,
                  scale: 1,
                }}
                transition={{
                  duration: 0.3,
                  ease: 'easeOut',
                }}
              >
                {getPercentileMessage(userPercentile, score, todayScores)}
              </motion.p>
            )}
          </AnimatePresence>

          {/* Histogram */}
          <AnimatePresence>
            {showHistogram && (
              <motion.div
                className='flex items-end justify-between h-32 gap-1'
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                {(() => {
                  // Create bins for the histogram (0-200, 201-400, 401-600, 601-800, 801-1000)
                  const bins = [
                    { min: 0, max: 200, count: 0, label: '0-200' },
                    {
                      min: 201,
                      max: 400,
                      count: 0,
                      label: '201-400',
                    },
                    {
                      min: 401,
                      max: 600,
                      count: 0,
                      label: '401-600',
                    },
                    {
                      min: 601,
                      max: 800,
                      count: 0,
                      label: '601-800',
                    },
                    {
                      min: 801,
                      max: 1000,
                      count: 0,
                      label: '801-1000',
                    },
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
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  );
};

export default AnimatedScoreDisplay;
