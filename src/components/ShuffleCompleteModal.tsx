import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { sendShuffleScore, fetchShuffleAverages } from '../lib/supabaseClient';
import Chart from 'react-apexcharts';
import type { ApexOptions } from 'apexcharts';
import ShareButton from './ShareButton';
import toast from 'react-hot-toast';
import { generateShuffleShareText } from '../utils';

interface ShuffleCompleteModalProps {
  missedGuessesByRound: number[];
  scoreSent: boolean;
  onScoreSent: () => void;
  onClose: () => void;
  puzzleDate: string;
}

const ShuffleCompleteModal: React.FC<ShuffleCompleteModalProps> = ({
  missedGuessesByRound,
  scoreSent,
  onScoreSent,
  onClose,
  puzzleDate,
}) => {
  const [scoresLoading, setScoresLoading] = useState(!scoreSent); // Only load if score hasn't been sent
  const [averages, setAverages] = useState<{
    round1Avg: number;
    round2Avg: number;
    round3Avg: number;
  } | null>(null);
  const [showShareConfirm, setShowShareConfirm] = useState(false);

  useEffect(() => {
    const sendAndFetchScores = async () => {
      setScoresLoading(true);
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
        const avgs = await fetchShuffleAverages({
          round1: missedGuessesByRound[0],
          round2: missedGuessesByRound[1],
          round3: missedGuessesByRound[2],
        });
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

  // Prepare chart data
  const chartSeries = [
    {
      name: 'You',
      data: missedGuessesByRound,
    },
    ...(averages
      ? [
          {
            name: 'Global Average',
            data: [averages.round1Avg, averages.round2Avg, averages.round3Avg],
          },
        ]
      : []),
  ];

  // Calculate max value for Y-axis
  const avgGuesses = averages
    ? [averages.round1Avg, averages.round2Avg, averages.round3Avg]
    : [];
  const allGuesses = [...missedGuessesByRound, ...avgGuesses];
  const maxValue = Math.max(...allGuesses, 0.5);
  const yAxisMax = Number.isInteger(maxValue) ? maxValue : maxValue + 0.5; // Add 0.5 only if not a whole number
  const minValue = Math.min(...allGuesses, 1);
  const yAxisMin = Math.max(minValue - 0.5, 1); // Lowest value - 0.5, but absolute min is 1

  const chartOptions: ApexOptions = {
    chart: {
      type: 'line',
      toolbar: {
        show: false,
      },
      background: 'transparent',
      animations: {
        enabled: false,
      },
    },
    title: {
      text: 'Guesses per Round',
      align: 'center',
      margin: -20,
      offsetY: 15,
      style: {
        fontSize: '16px',
        fontWeight: 'normal',
        fontFamily: 'inherit',
        color: '#fff',
      },
    },

    theme: {
      mode: 'dark',
    },
    stroke: {
      curve: 'straight',
      width: 3,
      dashArray: [0, 5], // Solid for first series, dashed for second
    },
    colors: ['#22c55e', '#f59e0b'], // Green for user, amber for average
    markers: {
      size: 6,
      strokeWidth: 2,
      strokeColors: ['#16a34a', '#d97706'],
      colors: ['#22c55e', '#f59e0b'],
    },
    grid: {
      borderColor: '#374151',
      strokeDashArray: 3,
      xaxis: {
        lines: {
          show: false,
        },
      },
      yaxis: {
        lines: {
          show: true,
        },
      },
    },
    xaxis: {
      categories: ['Round 1', 'Round 2', 'Round 3'],
      labels: {
        style: {
          colors: '#9ca3af',
          fontSize: '12px',
          fontWeight: 600,
        },
      },
      axisBorder: {
        show: true,
        color: '#6b7280',
      },
      axisTicks: {
        show: false,
      },
      tooltip: {
        enabled: false,
      },
    },
    yaxis: {
      min: yAxisMin,
      max: yAxisMax,
      labels: {
        style: {
          colors: '#9ca3af',
          fontSize: '12px',
        },
      },
      axisBorder: {
        show: true,
        color: '#6b7280',
      },
    },
    legend: {
      show: true,
      position: 'bottom',
      labels: {
        colors: '#d1d5db',
      },
      itemMargin: {
        horizontal: 16,
      },
      markers: {
        offsetX: -4,
      },
    },
    tooltip: {
      enabled: true,
      theme: 'dark',
      x: {
        show: true,
      },
      y: {
        formatter: (value: number) => value.toFixed(1),
      },
    },
    dataLabels: {
      enabled: false,
    },
  };

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
        <div className='bg-zinc-800 rounded-lg px-4 pb-4 pt-1 mb-6 min-h-[265px]'>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Chart
              options={chartOptions}
              series={chartSeries}
              type='line'
              height={220}
            />
          </motion.div>

          <div className='text-center mt-[-15px]'>
            <span className='text-sm text-gray-400'>
              Your Guess Total:{' '}
              <span className='text-white font-semibold'>
                {missedGuessesByRound.reduce((sum, count) => sum + count, 0)}
              </span>
            </span>
            <span className='text-sm text-gray-400 pl-4'>
              Today's Global Average:{' '}
              <span className='text-white font-semibold'>
                {averages
                  ? (
                      averages.round1Avg +
                      averages.round2Avg +
                      averages.round3Avg
                    ).toFixed(1)
                  : '--'}
              </span>
            </span>
          </div>
          {/* If only one score, show a message below the chart */}
          {averages &&
            averages.round1Avg === missedGuessesByRound[0] &&
            averages.round2Avg === missedGuessesByRound[1] &&
            averages.round3Avg === missedGuessesByRound[2] && (
              <div className='text-center text-gray-400 text-sm my-2'>
                Oh, it's just you (so far). 😊
              </div>
            )}
        </div>

        <div className='space-y-3'>
          <ShareButton
            userPercentile={null}
            showConfirm={showShareConfirm}
            setShowConfirm={setShowShareConfirm}
            onCopyToShare={() => {
              const shareText = generateShuffleShareText(
                missedGuessesByRound,
                puzzleDate,
              );
              navigator.clipboard.writeText(shareText);
              toast.success('Copied to clipboard!');
            }}
            isLoading={scoresLoading}
          />
          <button
            onClick={onClose}
            className='w-full px-4 py-2 rounded bg-blue-700 hover:bg-blue-600 text-white text-sm font-semibold'
          >
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default ShuffleCompleteModal;
