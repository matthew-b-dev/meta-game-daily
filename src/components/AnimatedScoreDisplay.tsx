import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getPercentileMessage } from '../utils';

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
  const [showBigScore, setShowBigScore] = useState(true);
  const [showSmallScore, setShowSmallScore] = useState(false);
  const [showRank, setShowRank] = useState(false);
  const [showHistogram, setShowHistogram] = useState(false);

  // Animate score counting and sequence
  useEffect(() => {
    if (scoresLoading) {
      return;
    }

    // Reset animation state (deferred to avoid cascading renders)
    setTimeout(() => {
      setAnimatedScore(0);
      setShowBigScore(true);
      setShowSmallScore(false);
      setShowRank(false);
      setShowHistogram(false);
    }, 0);

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
        // Score counting complete, start sequence
        setTimeout(() => {
          setShowBigScore(false);
          setTimeout(() => {
            setShowSmallScore(true);
            setTimeout(() => {
              setShowRank(true);
              setTimeout(() => {
                setShowHistogram(true);
              }, 300);
            }, 200);
          }, 300);
        }, 500);
      }
    };

    requestAnimationFrame(animate);
  }, [scoresLoading, score]);

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
      className={`mb-6 p-4 bg-zinc-800 rounded-lg ${todayScores.length > 1 ? 'min-h-[220px]' : ''}`}
    >
      {/* Large animated score */}
      <AnimatePresence>
        {showBigScore && (
          <motion.div
            className='flex flex-col items-center justify-center py-8'
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3 }}
          >
            <div className='text-gray-400 text-lg mb-2'>Your Score</div>
            <div className='text-green-400 text-6xl font-bold'>
              {animatedScore}
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
