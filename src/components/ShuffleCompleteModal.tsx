import React from 'react';
import { motion } from 'framer-motion';

interface ShuffleCompleteModalProps {
  missedGuessesByRound: number[];
  onClose: () => void;
}

const ShuffleCompleteModal: React.FC<ShuffleCompleteModalProps> = ({
  missedGuessesByRound,
  onClose,
}) => {
  // SVG dimensions and padding
  const width = 400;
  const height = 250;
  const padding = { top: 40, right: 40, bottom: 60, left: 60 };
  const graphWidth = width - padding.left - padding.right;
  const graphHeight = height - padding.top - padding.bottom;

  // Calculate max value for y-axis scaling
  const maxGuesses = Math.max(...missedGuessesByRound, 1);
  const yMax = Math.ceil(maxGuesses * 1.2); // Add 20% headroom

  // Generate points for the line
  const points = missedGuessesByRound.map((guesses, index) => {
    const x =
      padding.left + (index / (missedGuessesByRound.length - 1)) * graphWidth;
    const y = padding.top + graphHeight - (guesses / yMax) * graphHeight;
    return { x, y, guesses, round: index + 1 };
  });

  // Create path string for the line
  const linePath = points
    .map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x},${point.y}`)
    .join(' ');

  // Generate y-axis ticks
  const yTicks = Array.from({ length: Math.min(yMax + 1, 6) }, (_, i) =>
    Math.round((i / Math.min(yMax, 5)) * yMax),
  );

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
        <h2 className='text-2xl font-bold text-center mb-2 text-white'>
          🎉 Game Complete! 🎉
        </h2>
        <p className='text-center text-gray-400 mb-6'>
          You completed all 3 rounds!
        </p>

        <div className='bg-gray-800 rounded-lg p-4 mb-6'>
          <h3 className='text-sm font-semibold text-gray-300 mb-3 text-center'>
            Incorrect Guesses Per Round
          </h3>
          <svg
            width='100%'
            viewBox={`0 0 ${width} ${height}`}
            className='mx-auto'
            style={{ maxWidth: '400px' }}
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
            {points.map((point) => (
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

            {/* Line connecting points */}
            <path
              d={linePath}
              fill='none'
              stroke='#3b82f6'
              strokeWidth='3'
              strokeLinecap='round'
              strokeLinejoin='round'
            />

            {/* Data points */}
            {points.map((point) => (
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

          <div className='mt-4 text-center'>
            <p className='text-sm text-gray-400'>
              Total Incorrect Guesses:{' '}
              <span className='text-white font-semibold'>
                {missedGuessesByRound.reduce((sum, count) => sum + count, 0)}
              </span>
            </p>
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
