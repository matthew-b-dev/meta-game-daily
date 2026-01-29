import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { getPercentileMessage, getRankEmoji } from '../utils';

interface AnimatedScoreDisplayProps {
  score: number;
  bonusPoints: number;
  todayScores: number[];
  userPercentile: number | null;
  scoresLoading: boolean;
}

const AnimatedScoreDisplay: React.FC<AnimatedScoreDisplayProps> = ({
  score,
  bonusPoints,
  todayScores,
  userPercentile,
  scoresLoading,
}) => {
  const animationInProgress = useRef(false);
  const [animatedScore, setAnimatedScore] = useState(0);
  const [showBigScore, setShowBigScore] = useState(false);
  const [showBigRank, setShowBigRank] = useState(false);
  const [showBonusPoints, setShowBonusPoints] = useState(false);
  const [showTotal, setShowTotal] = useState(false);
  const [showSmallScore, setShowSmallScore] = useState(false);
  const [showRank, setShowRank] = useState(false);
  const [showHistogram, setShowHistogram] = useState(false);

  // Calculate user's rank
  // Sort scores in descending order (highest first)
  const sortedScores = [...todayScores].sort((a, b) => b - a);

  // findIndex returns the FIRST matching index, ensuring ties get the best rank
  // Example: scores [500, 500, 200, 100] → user with 500 gets rank #1 (not #2)
  const userRank = sortedScores.findIndex((s) => s === score + bonusPoints) + 1;
  const totalPlayers = todayScores.length;

  const rankEmoji = getRankEmoji(userRank, totalPlayers);

  // Animate score counting and sequence
  useEffect(() => {
    if (scoresLoading || animationInProgress.current) {
      return;
    }

    // Use microtask to batch state updates before render
    queueMicrotask(() => {
      setAnimatedScore(0);
      setShowBigScore(true);
      setShowBigRank(false);
      setShowBonusPoints(false);
      setShowTotal(false);
      setShowSmallScore(false);
      setShowRank(false);
      setShowHistogram(false);

      animationInProgress.current = true;

      const baseScore = score;
      const totalScore = score + bonusPoints;
      const hasBonusPoints = bonusPoints > 0;

      // Start counting animation to base score
      const duration = 1500; // 1.5 seconds
      const startTime = Date.now();

      const animateToBase = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Ease out cubic for smooth deceleration
        const easeOutCubic = 1 - Math.pow(1 - progress, 3);
        const currentScore = Math.floor(easeOutCubic * baseScore);

        setAnimatedScore(currentScore);

        if (progress < 1) {
          requestAnimationFrame(animateToBase);
        } else {
          // Base score counting complete
          setTimeout(() => {
            if (hasBonusPoints) {
              setShowBigScore(false); // Hide the big score

              // Show bonus points animation
              setTimeout(() => {
                setShowBonusPoints(true);
                setAnimatedScore(0); // Reset to 0 for bonus animation

                const bonusStartTime = Date.now();
                const animateBonus = () => {
                  const bonusElapsed = Date.now() - bonusStartTime;
                  const bonusProgress = Math.min(bonusElapsed / duration, 1);

                  const easeOutCubicBonus = 1 - Math.pow(1 - bonusProgress, 3);
                  const bonusScore = Math.floor(
                    easeOutCubicBonus * bonusPoints,
                  );

                  setAnimatedScore(bonusScore);

                  if (bonusProgress < 1) {
                    requestAnimationFrame(animateBonus);
                  } else {
                    // Bonus animation complete, hide bonus and show total
                    setTimeout(() => {
                      setShowBonusPoints(false);
                      // Wait for bonus exit animation to complete before showing total
                      setTimeout(() => {
                        setShowTotal(true);
                        setAnimatedScore(totalScore); // Set to final score immediately

                        // Hold total for 1s, then show rank
                        setTimeout(() => {
                          setShowBigRank(true);
                          // Hold total and rank for 1.5s, then transition to final layout
                          setTimeout(() => {
                            setShowTotal(false);
                            setShowBigRank(false);
                            setTimeout(() => {
                              setShowSmallScore(true);
                              setTimeout(() => {
                                setShowRank(true);
                                setTimeout(() => {
                                  setShowHistogram(true);
                                  animationInProgress.current = false;
                                }, 300);
                              }, 200);
                            }, 300);
                          }, 2000);
                        }, 1000);
                      }, 300); // Wait for bonus exit animation (0.3s)
                    }, 500);
                  }
                };
                requestAnimationFrame(animateBonus);
              }, 300); // Brief pause before showing bonus
            } else {
              // No bonus points, show rank below the score
              setShowBigRank(true);
              // Hold score and rank for 1.5s, then transition to final layout
              setTimeout(() => {
                setShowBigScore(false);
                setShowBigRank(false);
                setTimeout(() => {
                  setShowSmallScore(true);
                  setTimeout(() => {
                    setShowRank(true);
                    setTimeout(() => {
                      setShowHistogram(true);
                      animationInProgress.current = false;
                    }, 300);
                  }, 200);
                }, 300);
              }, 2000);
            }
          }, 500);
        }
      };

      requestAnimationFrame(animateToBase);
    });
  }, [scoresLoading, score, bonusPoints, totalPlayers, userRank]);

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
                <div className='text-gray-400 text-lg mb-2'>Score</div>
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

      {/* Bonus Points animation */}
      <AnimatePresence>
        {showBonusPoints && (
          <motion.div
            className='flex justify-center pt-2 h-[220px]'
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3 }}
          >
            <div className=''>
              <div className='flex-col items-center flex'>
                <div className='text-yellow-400 text-lg mb-2'>
                  ✨ Bonus Points ✨
                </div>
                <div
                  id='bonus-score'
                  className='text-yellow-400 text-6xl font-bold'
                >
                  {animatedScore}
                </div>
                <div className='text-yellow-300 text-sm mt-1'>
                  ({bonusPoints / 20} unused guesses)
                </div>
              </div>
              {/* Rank display that appears below the bonus */}
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

      {/* Total score display */}
      <AnimatePresence>
        {showTotal && (
          <motion.div
            className='flex justify-center pt-2 h-[220px]'
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3 }}
          >
            <div className=''>
              <div className='flex-col items-center flex'>
                <div className='text-green-400 text-lg mb-2'>Total Score</div>
                <div className='text-green-400 text-6xl font-bold'>
                  {score + bonusPoints}
                </div>
              </div>
              {/* Rank display that appears below the total */}
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
            <span className='text-sm font-semibold'>
              Your Score: {score + bonusPoints}
            </span>
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
                {getPercentileMessage(
                  userPercentile,
                  score + bonusPoints,
                  todayScores,
                )}
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
                  // Create bins for the histogram (0-200, 201-400, 401-600, 601-800, 801-1000, 1001-1100)
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
                    {
                      min: 1001,
                      max: 1100,
                      count: 0,
                      label: '1001-1100',
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
                    (b) =>
                      score + bonusPoints >= b.min &&
                      score + bonusPoints <= b.max,
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
