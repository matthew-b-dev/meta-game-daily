import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Chart from 'react-apexcharts';
import { ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';
import {
  sendSteamDetectiveScore,
  fetchSteamDetectiveScores,
} from '../../lib/supabaseClient';
import { getPuzzleDate } from '../../utils';
import ShareButton from '../ShareButton';
import SteamDetectiveFeedbackButtons from './SteamDetectiveFeedbackButtons';
import { MAX_CLUES } from './utils';

interface GameCompleteProps {
  show: boolean;
  gameName: string;
  appId: number;
  totalGuesses: number;
  onCopyToShare: () => void;
  scoreSent: boolean;
  onScoreSent: () => void;
  blurTitleAndAsAmpersand?: boolean;
}

const DEBUG_LOADING = false;

export const GameComplete: React.FC<GameCompleteProps> = ({
  show,
  gameName,
  appId,
  totalGuesses,
  onCopyToShare,
  scoreSent,
  onScoreSent,
  blurTitleAndAsAmpersand,
}) => {
  const [scoresLoading, setScoresLoading] = useState(true);
  const [todayScores, setTodayScores] = useState<number[]>([]);
  const [userPercentile, setUserPercentile] = useState<number | null>(null);

  const puzzleDate = getPuzzleDate();

  // Replace 'and' with '&' if requested
  const displayName = blurTitleAndAsAmpersand
    ? gameName.replace(/\band\b/gi, '&')
    : gameName;

  // Submit and fetch scores when component shows
  useEffect(() => {
    if (!show) return;

    const submitAndFetchScores = async () => {
      setScoresLoading(true);

      try {
        // Submit score if not already sent
        if (!scoreSent) {
          await sendSteamDetectiveScore(totalGuesses);
          onScoreSent();
        }

        // Fetch all scores for today
        const scores = await fetchSteamDetectiveScores();
        setTodayScores(scores);

        // Calculate percentile (lower score is better, so count worse scores)
        const worseScores = scores.filter(
          (score) => score > totalGuesses,
        ).length;
        const percentile = Math.round((worseScores / scores.length) * 100);
        setUserPercentile(percentile);
      } catch (error) {
        console.error('Error in score submission/fetching:', error);
      } finally {
        if (!DEBUG_LOADING) {
          setScoresLoading(false);
        }
      }
    };

    submitAndFetchScores();
  }, [show, puzzleDate, totalGuesses, scoreSent, onScoreSent]);

  // Calculate distribution for bar chart
  const getDistribution = () => {
    const dist = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0 };
    todayScores.forEach((score) => {
      if (score >= 1 && score <= 7) {
        dist[score as keyof typeof dist]++;
      }
    });
    return dist;
  };

  const correct = totalGuesses < MAX_CLUES;
  const preDisplayNameContent = correct ? (
    <span className='block md:inline text-green-500'>Correct!</span>
  ) : (
    <span className='block md:inline text-red-500'>The answer was:</span>
  );

  const distribution = getDistribution();
  const maxCount = Math.max(...Object.values(distribution), 1);

  if (!show) return null;

  return (
    <div className='max-w-[600px] mx-auto pb-4'>
      <motion.div
        layout
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className='bg-zinc-800 rounded overflow-hidden p-4 min-h-[475px]'
      >
        {/* Game Name */}
        <h2 className={`text-md font-semibold text-center text-white`}>
          {preDisplayNameContent}
          <a
            href={`https://store.steampowered.com/app/${appId}`}
            target='_blank'
            rel='noopener noreferrer'
            className='pl-2 text-white underline hover:text-gray-300 inline-flex items-center gap-1'
          >
            <span>{displayName}</span>
            <ArrowTopRightOnSquareIcon className='w-4 h-4 no-underline' />
          </a>
        </h2>

        {/* Loading State */}
        {scoresLoading && (
          <motion.div
            className='flex justify-center items-center py-8'
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500'></div>
          </motion.div>
        )}

        {/* Scores Display */}
        {!scoresLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
          >
            {/* Bar Chart */}
            <div className='mb-0 bg-zinc-800 rounded-lg px-2 max-w-[500px] mx-auto'>
              <Chart
                options={{
                  responsive: [
                    {
                      breakpoint: 472, // Breakpoint for smaller screens
                      options: {
                        xaxis: {
                          labels: {
                            rotate: -60, // Increase rotation for smaller screens
                            rotateAlways: true,
                          },
                        },
                      },
                    },
                  ],
                  chart: {
                    type: 'bar',
                    background: 'transparent',
                    toolbar: {
                      show: false,
                    },
                  },
                  plotOptions: {
                    bar: {
                      distributed: true,
                      borderRadius: 4,
                    },
                  },
                  colors: [1, 2, 3, 4, 5, 6, 7].map((guess) =>
                    guess === totalGuesses ? '#22c55e' : '#3b82f6',
                  ),
                  dataLabels: {
                    enabled: false,
                  },
                  legend: {
                    show: false,
                  },
                  xaxis: {
                    categories: [
                      'Clue #1',
                      'Clue #2',
                      'Clue #3',
                      'Clue #4',
                      'Clue #5',
                      'Clue #6',
                      'DNF',
                    ],
                    labels: {
                      rotate: 0,
                      style: {
                        colors: '#9ca3af',
                        fontSize: window.innerWidth < 480 ? '10px' : '11px',
                      },
                    },
                  },
                  yaxis: {
                    max: Math.max(maxCount + 1, 4),
                    tickAmount: Math.max(maxCount + 1, 4),
                    forceNiceScale: maxCount > 10,
                    title: {
                      text: 'Players',
                      rotate: -90,
                      style: {
                        color: '#9ca3af',
                        fontSize: '12px',
                        fontWeight: 'regular',
                      },
                    },
                    labels: {
                      style: {
                        colors: '#9ca3af',
                      },
                      formatter: (val: number) =>
                        val === 0 ? '' : Math.floor(val).toString(),
                    },
                  },
                  grid: {
                    borderColor: '#374151',
                  },
                  tooltip: {
                    theme: 'dark',
                    y: {
                      formatter: (val: number) =>
                        `${val} ${val === 1 ? 'player' : 'players'}`,
                    },
                  },
                }}
                series={[
                  {
                    name: 'Players',
                    data: [
                      distribution[1],
                      distribution[2],
                      distribution[3],
                      distribution[4],
                      distribution[5],
                      distribution[6],
                      distribution[7],
                    ],
                  },
                ]}
                type='bar'
                height={200}
              />
            </div>

            {/* Share Button */}
            <div className='space-y-3 mx-auto max-w-[450px]'>
              <ShareButton
                userPercentile={userPercentile}
                onCopyToShare={onCopyToShare}
                isLoading={scoresLoading}
              />

              {/* Compact Copy Button (experimental)
              <button
                onClick={onCopyCompact}
                className='mx-auto text-xs px-3 py-1.5 focus:outline-none py-2 px-4 rounded text-sm font-medium transition-colors bg-transparent hover:bg-gray-700 text-gray-300 flex items-center justify-center gap-2'
              >
                <DocumentDuplicateIcon className='h-4 w-4' />
                Copy one-liner without Link Preview
              </button>
              */}

              {/* Steam Detective Frequency Feedback */}
              <SteamDetectiveFeedbackButtons isOpen={show} />
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default React.memo(GameComplete);
