import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { sendShuffleScore, fetchShuffleAverages } from '../lib/supabaseClient';

interface ShuffleCompleteModalProps {
  missedGuessesByRound: number[];
  scoreSent: boolean;
  onScoreSent: () => void;
  onClose: () => void;
}

const ShuffleCompleteModal: React.FC<ShuffleCompleteModalProps> = ({
  missedGuessesByRound,
  scoreSent,
  onScoreSent,
  onClose,
}) => {
  const [scoresLoading, setScoresLoading] = useState(!scoreSent); // Only load if score hasn't been sent
  const [averages, setAverages] = useState<{
    round1Avg: number;
    round2Avg: number;
    round3Avg: number;
  } | null>(null);

  useEffect(() => {
    const sendAndFetchScores = async () => {
      try {
        // Only send the score if it hasn't been sent yet
        if (!scoreSent) {
          await sendShuffleScore(
            missedGuessesByRound[0],
            missedGuessesByRound[1],
            missedGuessesByRound[2],
          );
          onScoreSent(); // Mark score as sent
        }

        // Fetch the averages (always do this to get latest data)
        const avgs = await fetchShuffleAverages();
        setAverages(avgs);
      } catch (error) {
        console.error('Error sending/fetching shuffle scores:', error);
      } finally {
        setScoresLoading(false);
      }
    };

    sendAndFetchScores();
  }, [missedGuessesByRound, scoreSent, onScoreSent]);

  if (scoresLoading) {
    return (
      <div
        className='fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4'
        onClick={onClose}
      >
        <motion.div
          className='bg-gray-900 rounded-lg p-6 max-w-lg w-full border border-gray-700'
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className='flex flex-col items-center justify-center h-32'>
            <div className='animate-spin rounded-full h-8 w-8 border-b-2 border-green-500'></div>
            <p className='text-sm text-gray-400 mt-2'>Loading scores...</p>
          </div>
        </motion.div>
      </div>
    );
  }
  // SVG dimensions and padding
  const width = 500;
  const height = 250;
  const padding = { top: 40, right: 40, bottom: 60, left: 60 };
  const graphWidth = width - padding.left - padding.right;
  const graphHeight = height - padding.top - padding.bottom;

  // Calculate max value for y-axis scaling (consider both user and average)
  const avgGuesses = averages
    ? [averages.round1Avg, averages.round2Avg, averages.round3Avg]
    : [];
  const allGuesses = [...missedGuessesByRound, ...avgGuesses];
  const maxGuesses = Math.max(...allGuesses, 1);
  const yMax = Math.ceil(maxGuesses * 1.2); // Add 20% headroom

  // Generate points for the user's line
  const userPoints = missedGuessesByRound.map((guesses, index) => {
    const x =
      padding.left + (index / (missedGuessesByRound.length - 1)) * graphWidth;
    const y = padding.top + graphHeight - (guesses / yMax) * graphHeight;
    return { x, y, guesses, round: index + 1 };
  });

  // Generate points for the average line
  const avgPoints = averages
    ? [averages.round1Avg, averages.round2Avg, averages.round3Avg].map(
        (guesses, index) => {
          const x = padding.left + (index / 2) * graphWidth;
          const y = padding.top + graphHeight - (guesses / yMax) * graphHeight;
          return { x, y, guesses, round: index + 1 };
        },
      )
    : [];

  // Create path string for the user's line
  const userLinePath = userPoints
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x},${point.y}`)
    .join(' ');

  // Create path string for the average line
  const avgLinePath = avgPoints
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x},${point.y}`)
    .join(' ');

  // Generate y-axis ticks
  const yTicks = Array.from({ length: Math.min(yMax + 1, 6) }, (_, i) =>
    Math.round((i / Math.min(yMax, 5)) * yMax),
  );

  return (
    <div
      className='fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-0 md:p-4'
      onClick={onClose}
    >
      <motion.div
        className='bg-zinc-900 p-3 md:p-6 rounded-lg max-w-lg w-full my-auto max-h-[100vh] overflow-y-auto'
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.2 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className='bg-gray-800 rounded-lg p-4 mb-6'>
          <div className='text-center'>
            <p className='text-sm text-gray-400'>
              Your Guess Total:{' '}
              <span className='text-white font-semibold'>
                {missedGuessesByRound.reduce((sum, count) => sum + count, 0)}
              </span>
            </p>
            <p className='text-sm text-gray-400'>
              Today's Global Average:{' '}
              <span className='text-white font-semibold'>
                {/* show average here */}
                ##
              </span>
            </p>
          </div>
          <h3 className='text-sm font-semibold text-gray-300 text-center'>
            Guesses Per Round
          </h3>
          <svg
            width='100%'
            viewBox={`0 0 ${width} ${height}`}
            className='mx-auto'
            style={{ maxWidth: '500px' }}
          >
            {/* Y-axis */}
            <line
              x1={padding.left}
              y1={padding.top}
              x2={padding.left}
              y2={height - padding.bottom}
              stroke='#6b7280'
              strokeWidth='2'
            />
            {/* X-axis */}
            <line
              x1={padding.left}
              y1={height - padding.bottom}
              x2={width - padding.right}
              y2={height - padding.bottom}
              stroke='#6b7280'
              strokeWidth='2'
            />

            {/* Y-axis labels */}
            {yTicks.map((tick) => {
              const y = padding.top + graphHeight - (tick / yMax) * graphHeight;
              return (
                <g key={tick}>
                  <line
                    x1={padding.left - 5}
                    y1={y}
                    x2={padding.left}
                    y2={y}
                    stroke='#6b7280'
                    strokeWidth='1'
                  />
                  <text
                    x={padding.left - 10}
                    y={y}
                    textAnchor='end'
                    dominantBaseline='middle'
                    fill='#9ca3af'
                    fontSize='12'
                  >
                    {tick}
                  </text>
                </g>
              );
            })}

            {/* X-axis labels */}
            {userPoints.map((point) => (
              <text
                key={point.round}
                x={point.x}
                y={height - padding.bottom + 20}
                textAnchor='middle'
                fill='#9ca3af'
                fontSize='12'
                fontWeight='600'
              >
                Round {point.round}
              </text>
            ))}

            {/* Grid lines */}
            {yTicks.map((tick) => {
              const y = padding.top + graphHeight - (tick / yMax) * graphHeight;
              return (
                <line
                  key={`grid-${tick}`}
                  x1={padding.left}
                  y1={y}
                  x2={width - padding.right}
                  y2={y}
                  stroke='#374151'
                  strokeWidth='1'
                  strokeDasharray='3,3'
                  opacity='0.3'
                />
              );
            })}

            {/* Average line (orange/amber) */}
            {averages && (
              <path
                d={avgLinePath}
                fill='none'
                stroke='#f59e0b'
                strokeWidth='3'
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeDasharray='5,5'
              />
            )}

            {/* User's line (blue) */}
            <path
              d={userLinePath}
              fill='none'
              stroke='#3b82f6'
              strokeWidth='3'
              strokeLinecap='round'
              strokeLinejoin='round'
            />

            {/* Average data points */}
            {averages &&
              avgPoints.map((point) => (
                <g key={`avg-${point.round}`}>
                  <circle
                    cx={point.x}
                    cy={point.y}
                    r='5'
                    fill='#f59e0b'
                    stroke='#d97706'
                    strokeWidth='2'
                  />
                  <text
                    x={point.x}
                    y={point.y + 20}
                    textAnchor='middle'
                    fill='#fbbf24'
                    fontSize='12'
                    fontWeight='bold'
                  >
                    {point.guesses.toFixed(1)}
                  </text>
                </g>
              ))}

            {/* User's data points */}
            {userPoints.map((point) => (
              <g key={point.round}>
                <circle
                  cx={point.x}
                  cy={point.y}
                  r='6'
                  fill='#3b82f6'
                  stroke='#1e40af'
                  strokeWidth='2'
                />
                <text
                  x={point.x}
                  y={point.y - 15}
                  textAnchor='middle'
                  fill='#60a5fa'
                  fontSize='14'
                  fontWeight='bold'
                >
                  {point.guesses}
                </text>
              </g>
            ))}
          </svg>

          {/* Legend */}
          <div className='mt-4 flex justify-center gap-6 text-xs'>
            <div className='flex items-center gap-2'>
              <div className='w-4 h-0.5 bg-blue-500'></div>
              <span className='text-gray-300'>Your Score</span>
            </div>
            {averages && (
              <div className='flex items-center gap-2'>
                <div
                  className='w-4 h-0.5 bg-amber-500'
                  style={{
                    backgroundImage:
                      'repeating-linear-gradient(to right, #f59e0b 0, #f59e0b 5px, transparent 5px, transparent 10px)',
                  }}
                ></div>
                <span className='text-gray-300'>Global Average</span>
              </div>
            )}
          </div>
        </div>

        <button
          onClick={onClose}
          className='w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors'
        >
          Close
        </button>
      </motion.div>
    </div>
  );
};

export default ShuffleCompleteModal;
